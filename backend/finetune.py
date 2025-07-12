"""
Fine-tuning script for sentiment analysis model
"""

import os
import logging
from typing import Dict, List, Tuple
import pandas as pd
import torch
from torch.utils.data import Dataset, DataLoader
from transformers import (
    AutoTokenizer, 
    AutoModelForSequenceClassification,
    TrainingArguments, 
    Trainer,
    EarlyStoppingCallback
)
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, precision_recall_fscore_support
import numpy as np

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Model configuration
MODEL_NAME = "cardiffnlp/twitter-roberta-base-sentiment-latest"
OUTPUT_DIR = "./fine_tuned_model"
MAX_LENGTH = 512

class SentimentDataset(Dataset):
    """Custom dataset for sentiment analysis"""
    
    def __init__(self, texts: List[str], labels: List[int], tokenizer, max_length: int = MAX_LENGTH):
        self.texts = texts
        self.labels = labels
        self.tokenizer = tokenizer
        self.max_length = max_length
    
    def __len__(self):
        return len(self.texts)
    
    def __getitem__(self, idx):
        text = str(self.texts[idx])
        label = self.labels[idx]
        
        encoding = self.tokenizer(
            text,
            truncation=True,
            padding='max_length',
            max_length=self.max_length,
            return_tensors='pt'
        )
        
        return {
            'input_ids': encoding['input_ids'].flatten(),
            'attention_mask': encoding['attention_mask'].flatten(),
            'labels': torch.tensor(label, dtype=torch.long)
        }

def load_data(data_path: str) -> Tuple[List[str], List[int]]:
    """Load training data from CSV file"""
    try:
        df = pd.read_csv(data_path)
        
        # Assume columns are 'text' and 'label'
        if 'text' not in df.columns or 'label' not in df.columns:
            raise ValueError("CSV must contain 'text' and 'label' columns")
        
        texts = df['text'].astype(str).tolist()
        
        # Convert labels to integers if they're strings
        if df['label'].dtype == 'object':
            unique_labels = df['label'].unique()
            label_map = {label: idx for idx, label in enumerate(unique_labels)}
            labels = [label_map[label] for label in df['label']]
            logger.info(f"Label mapping: {label_map}")
        else:
            labels = df['label'].tolist()
        
        logger.info(f"Loaded {len(texts)} samples")
        return texts, labels
        
    except Exception as e:
        logger.error(f"Failed to load data: {e}")
        raise

def compute_metrics(eval_pred):
    """Compute metrics for evaluation"""
    predictions, labels = eval_pred
    predictions = np.argmax(predictions, axis=1)
    
    precision, recall, f1, _ = precision_recall_fscore_support(labels, predictions, average='weighted')
    accuracy = accuracy_score(labels, predictions)
    
    return {
        'accuracy': accuracy,
        'f1': f1,
        'precision': precision,
        'recall': recall
    }

def fine_tune_model(
    data_path: str,
    output_dir: str = OUTPUT_DIR,
    num_epochs: int = 3,
    batch_size: int = 16,
    learning_rate: float = 2e-5,
    warmup_steps: int = 500,
    weight_decay: float = 0.01,
    test_size: float = 0.2
):
    """Fine-tune the sentiment analysis model"""
    
    # Load data
    logger.info("Loading training data...")
    texts, labels = load_data(data_path)
    
    # Split data
    train_texts, val_texts, train_labels, val_labels = train_test_split(
        texts, labels, test_size=test_size, random_state=42, stratify=labels
    )
    
    logger.info(f"Training samples: {len(train_texts)}")
    logger.info(f"Validation samples: {len(val_texts)}")
    
    # Load tokenizer and model
    logger.info(f"Loading model: {MODEL_NAME}")
    tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)
    model = AutoModelForSequenceClassification.from_pretrained(
        MODEL_NAME,
        num_labels=len(set(labels))
    )
    
    # Create datasets
    train_dataset = SentimentDataset(train_texts, train_labels, tokenizer)
    val_dataset = SentimentDataset(val_texts, val_labels, tokenizer)
    
    # Training arguments
    training_args = TrainingArguments(
        output_dir=output_dir,
        num_train_epochs=num_epochs,
        per_device_train_batch_size=batch_size,
        per_device_eval_batch_size=batch_size,
        warmup_steps=warmup_steps,
        weight_decay=weight_decay,
        learning_rate=learning_rate,
        logging_dir=f'{output_dir}/logs',
        logging_steps=100,
        evaluation_strategy="steps",
        eval_steps=500,
        save_strategy="steps",
        save_steps=500,
        load_best_model_at_end=True,
        metric_for_best_model="f1",
        greater_is_better=True,
        save_total_limit=2,
        report_to=None  # Disable wandb/tensorboard
    )
    
    # Create trainer
    trainer = Trainer(
        model=model,
        args=training_args,
        train_dataset=train_dataset,
        eval_dataset=val_dataset,
        compute_metrics=compute_metrics,
        callbacks=[EarlyStoppingCallback(early_stopping_patience=3)]
    )
    
    # Train model
    logger.info("Starting training...")
    trainer.train()
    
    # Save model
    logger.info(f"Saving model to {output_dir}")
    trainer.save_model()
    tokenizer.save_pretrained(output_dir)
    
    # Evaluate model
    logger.info("Evaluating model...")
    eval_results = trainer.evaluate()
    
    logger.info("Training completed!")
    logger.info(f"Final evaluation results: {eval_results}")
    
    return trainer, eval_results

if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description="Fine-tune sentiment analysis model")
    parser.add_argument("--data_path", type=str, required=True, help="Path to training data CSV")
    parser.add_argument("--output_dir", type=str, default=OUTPUT_DIR, help="Output directory")
    parser.add_argument("--epochs", type=int, default=3, help="Number of training epochs")
    parser.add_argument("--batch_size", type=int, default=16, help="Batch size")
    parser.add_argument("--learning_rate", type=float, default=2e-5, help="Learning rate")
    
    args = parser.parse_args()
    
    fine_tune_model(
        data_path=args.data_path,
        output_dir=args.output_dir,
        num_epochs=args.epochs,
        batch_size=args.batch_size,
        learning_rate=args.learning_rate
    )
