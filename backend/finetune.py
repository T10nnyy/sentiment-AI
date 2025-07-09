"""
Fine-tuning CLI Script
Exact syntax: python finetune.py --data data.jsonl --epochs 3 --lr 3e-5
"""

import argparse
import json
import logging
import os
import random
import sys
from pathlib import Path
from typing import List, Dict, Any
import numpy as np
import torch
import tensorflow as tf
from datasets import Dataset
from transformers import (
    AutoTokenizer,
    AutoModelForSequenceClassification,
    TFAutoModelForSequenceClassification,
    TrainingArguments,
    Trainer,
    DataCollatorWithPadding,
    get_linear_schedule_with_warmup
)
from sklearn.metrics import accuracy_score, precision_recall_fscore_support
import warnings

warnings.filterwarnings("ignore")

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

def set_seed(seed: int = 42):
    """Set seeds for reproducible training"""
    random.seed(seed)
    np.random.seed(seed)
    torch.manual_seed(seed)
    torch.cuda.manual_seed_all(seed)
    tf.random.set_seed(seed)
    os.environ['PYTHONHASHSEED'] = str(seed)

def load_data(data_path: str) -> List[Dict[str, Any]]:
    """Load training data from JSONL file"""
    data = []
    try:
        with open(data_path, 'r', encoding='utf-8') as f:
            for line in f:
                line = line.strip()
                if line:
                    item = json.loads(line)
                    if 'text' in item and 'label' in item:
                        data.append(item)
        
        logger.info(f"Loaded {len(data)} training examples")
        return data
    
    except Exception as e:
        logger.error(f"Failed to load data from {data_path}: {str(e)}")
        sys.exit(1)

def prepare_dataset(data: List[Dict], tokenizer, max_length: int = 512):
    """Prepare dataset for training"""
    texts = [item['text'] for item in data]
    labels = [1 if item['label'].lower() == 'positive' else 0 for item in data]
    
    # Tokenize
    encodings = tokenizer(
        texts,
        truncation=True,
        padding=True,
        max_length=max_length,
        return_tensors="pt"
    )
    
    # Create dataset
    dataset = Dataset.from_dict({
        'input_ids': encodings['input_ids'],
        'attention_mask': encodings['attention_mask'],
        'labels': labels
    })
    
    return dataset

def compute_metrics(eval_pred):
    """Compute evaluation metrics"""
    predictions, labels = eval_pred
    predictions = np.argmax(predictions, axis=1)
    
    accuracy = accuracy_score(labels, predictions)
    precision, recall, f1, _ = precision_recall_fscore_support(labels, predictions, average='weighted')
    
    return {
        'accuracy': accuracy,
        'f1': f1,
        'precision': precision,
        'recall': recall
    }

def finetune_pytorch(data_path: str, epochs: int, learning_rate: float, model_name: str):
    """Fine-tune using PyTorch"""
    logger.info("Starting PyTorch fine-tuning...")
    
    # Load data
    data = load_data(data_path)
    
    # Split data (80/20 train/val)
    split_idx = int(0.8 * len(data))
    train_data = data[:split_idx]
    val_data = data[split_idx:]
    
    # Load tokenizer and model directly
    tokenizer = AutoTokenizer.from_pretrained(model_name)
    model = AutoModelForSequenceClassification.from_pretrained(
        model_name,
        num_labels=2
    )
    
    # Prepare datasets
    train_dataset = prepare_dataset(train_data, tokenizer)
    val_dataset = prepare_dataset(val_data, tokenizer)
    
    # Training arguments
    training_args = TrainingArguments(
        output_dir='./model',
        num_train_epochs=epochs,
        per_device_train_batch_size=8,  # Reduced for large model
        per_device_eval_batch_size=8,
        warmup_steps=100,
        weight_decay=0.01,
        logging_dir='./logs',
        logging_steps=10,
        evaluation_strategy="epoch",
        save_strategy="epoch",
        load_best_model_at_end=True,
        metric_for_best_model="f1",
        learning_rate=learning_rate,
        save_total_limit=2,
        seed=42,
        data_seed=42,
        remove_unused_columns=False,
        fp16=True,  # Enable mixed precision for large model
    )
    
    # Data collator
    data_collator = DataCollatorWithPadding(tokenizer=tokenizer)
    
    # Trainer
    trainer = Trainer(
        model=model,
        args=training_args,
        train_dataset=train_dataset,
        eval_dataset=val_dataset,
        tokenizer=tokenizer,
        data_collator=data_collator,
        compute_metrics=compute_metrics,
    )
    
    # Train
    logger.info("Starting training...")
    trainer.train()
    
    # Save model
    trainer.save_model('./model')
    tokenizer.save_pretrained('./model')
    
    # Evaluate
    eval_results = trainer.evaluate()
    logger.info(f"Final evaluation results: {eval_results}")
    
    logger.info("PyTorch fine-tuning completed!")

def finetune_tensorflow(data_path: str, epochs: int, learning_rate: float, model_name: str):
    """Fine-tune using TensorFlow"""
    logger.info("Starting TensorFlow fine-tuning...")
    
    # Load data
    data = load_data(data_path)
    
    # Split data
    split_idx = int(0.8 * len(data))
    train_data = data[:split_idx]
    val_data = data[split_idx:]
    
    # Load tokenizer and model directly
    tokenizer = AutoTokenizer.from_pretrained(model_name)
    model = TFAutoModelForSequenceClassification.from_pretrained(
        model_name,
        num_labels=2
    )
    
    # Prepare data
    train_texts = [item['text'] for item in train_data]
    train_labels = [1 if item['label'].lower() == 'positive' else 0 for item in train_data]
    val_texts = [item['text'] for item in val_data]
    val_labels = [1 if item['label'].lower() == 'positive' else 0 for item in val_data]
    
    # Tokenize
    train_encodings = tokenizer(train_texts, truncation=True, padding=True, max_length=512, return_tensors="tf")
    val_encodings = tokenizer(val_texts, truncation=True, padding=True, max_length=512, return_tensors="tf")
    
    # Create TF datasets
    train_dataset = tf.data.Dataset.from_tensor_slices((
        dict(train_encodings),
        train_labels
    )).batch(8)  # Reduced batch size for large model
    
    val_dataset = tf.data.Dataset.from_tensor_slices((
        dict(val_encodings),
        val_labels
    )).batch(8)
    
    # Compile model
    optimizer = tf.keras.optimizers.Adam(learning_rate=learning_rate)
    loss = tf.keras.losses.SparseCategoricalCrossentropy(from_logits=True)
    metrics = [tf.keras.metrics.SparseCategoricalAccuracy('accuracy')]
    
    model.compile(optimizer=optimizer, loss=loss, metrics=metrics)
    
    # Train
    logger.info("Starting training...")
    history = model.fit(
        train_dataset,
        epochs=epochs,
        validation_data=val_dataset,
        verbose=1
    )
    
    # Save model
    model.save_pretrained('./model')
    tokenizer.save_pretrained('./model')
    
    logger.info("TensorFlow fine-tuning completed!")

def main():
    """Main CLI function"""
    parser = argparse.ArgumentParser(description="Fine-tune sentiment analysis model")
    parser.add_argument("--data", required=True, help="Path to JSONL training data")
    parser.add_argument("--epochs", type=int, default=3, help="Number of training epochs")
    parser.add_argument("--lr", type=float, default=3e-5, help="Learning rate")
    parser.add_argument("--framework", choices=["pytorch", "tensorflow"], default="pytorch", help="ML framework")
    parser.add_argument("--model", default="siebert/sentiment-roberta-large-english", help="Base model name")
    
    args = parser.parse_args()
    
    # Set seed for reproducibility
    set_seed(42)
    
    # Validate data file
    if not os.path.exists(args.data):
        logger.error(f"Data file not found: {args.data}")
        sys.exit(1)
    
    # Create model directory
    os.makedirs('./model', exist_ok=True)
    
    # Fine-tune based on framework
    if args.framework == "pytorch":
        finetune_pytorch(args.data, args.epochs, args.lr, args.model)
    else:
        finetune_tensorflow(args.data, args.epochs, args.lr, args.model)
    
    logger.info("Fine-tuning completed successfully!")

if __name__ == "__main__":
    main()
