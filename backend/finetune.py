"""
Fine-tuning script for sentiment analysis model
"""

import os
import json
import logging
import random
from typing import Dict, List, Tuple
import torch
import torch.nn as nn
from torch.utils.data import Dataset, DataLoader
from torch.optim import AdamW
from torch.optim.lr_scheduler import OneCycleLR
from transformers import (
    AutoTokenizer, 
    AutoModelForSequenceClassification,
    get_linear_schedule_with_warmup
)
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, precision_recall_fscore_support
import numpy as np
from tqdm import tqdm

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Set random seeds for reproducibility
def set_random_seeds(seed: int = 42):
    """Set random seeds for reproducibility"""
    random.seed(seed)
    np.random.seed(seed)
    torch.manual_seed(seed)
    torch.cuda.manual_seed_all(seed)
    torch.backends.cudnn.deterministic = True
    torch.backends.cudnn.benchmark = False
    os.environ['PYTHONHASHSEED'] = str(seed)

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

def load_jsonl_data(data_path: str) -> Tuple[List[str], List[int]]:
    """Load training data from JSONL file"""
    try:
        texts = []
        labels = []
        label_set = set()
        
        # Read JSONL file
        with open(data_path, 'r', encoding='utf-8') as f:
            for line in f:
                data = json.loads(line.strip())
                texts.append(data['text'])
                label_set.add(data['label'])
                labels.append(data['label'])
        
        # Create label mapping
        label_map = {label: idx for idx, label in enumerate(sorted(label_set))}
        logger.info(f"Label mapping: {label_map}")
        
        # Convert string labels to integers
        labels = [label_map[label] for label in labels]
        
        logger.info(f"Loaded {len(texts)} samples")
        return texts, labels, label_map
        
    except Exception as e:
        logger.error(f"Failed to load data: {e}")
        raise

def compute_metrics(eval_pred):
    """Compute metrics for evaluation"""
    logits, labels = eval_pred
    # If predictions are already probabilities/logits (2D array), get the predicted class
    if len(logits.shape) > 1:
        predictions = np.argmax(logits, axis=1)
    else:
        predictions = logits  # If predictions are already class indices
    
    precision, recall, f1, _ = precision_recall_fscore_support(labels, predictions, average='weighted')
    accuracy = accuracy_score(labels, predictions)
    
    return {
        'accuracy': accuracy,
        'f1': f1,
        'precision': precision,
        'recall': recall
    }

def train_epoch(
    model: nn.Module,
    dataloader: DataLoader,
    optimizer: AdamW,
    scheduler,
    device: torch.device,
    max_grad_norm: float = 1.0
) -> float:
    """Train for one epoch"""
    model.train()
    total_loss = 0
    progress_bar = tqdm(dataloader, desc="Training")
    
    for batch in progress_bar:
        # Move batch to device
        input_ids = batch['input_ids'].to(device)
        attention_mask = batch['attention_mask'].to(device)
        labels = batch['labels'].to(device)
        
        # Forward pass
        outputs = model(
            input_ids=input_ids,
            attention_mask=attention_mask,
            labels=labels
        )
        
        loss = outputs.loss
        total_loss += loss.item()
        
        # Backward pass
        loss.backward()
        
        # Gradient clipping
        torch.nn.utils.clip_grad_norm_(model.parameters(), max_grad_norm)
        
        # Optimizer and scheduler steps
        optimizer.step()
        scheduler.step()
        optimizer.zero_grad()
        
        # Update progress bar
        progress_bar.set_postfix({'loss': loss.item()})
    
    return total_loss / len(dataloader)

def evaluate(model: nn.Module, dataloader: DataLoader, device: torch.device) -> Dict[str, float]:
    """Evaluate the model"""
    model.eval()
    all_logits = []
    all_labels = []
    total_loss = 0
    
    with torch.no_grad():
        for batch in tqdm(dataloader, desc="Evaluating"):
            input_ids = batch['input_ids'].to(device)
            attention_mask = batch['attention_mask'].to(device)
            labels = batch['labels'].to(device)
            
            outputs = model(
                input_ids=input_ids,
                attention_mask=attention_mask,
                labels=labels
            )
            
            loss = outputs.loss
            total_loss += loss.item()
            
            # Get the logits and convert to numpy
            logits = outputs.logits
            all_logits.append(logits.cpu().numpy())
            all_labels.extend(labels.cpu().numpy())
    
    # Concatenate all logits
    all_logits = np.concatenate(all_logits, axis=0)
    all_labels = np.array(all_labels)
    
    # Compute metrics
    metrics = compute_metrics((all_logits, all_labels))
    metrics['loss'] = total_loss / len(dataloader)
    
    return metrics

def fine_tune_model(
    data_path: str,
    output_dir: str = "./model",
    num_epochs: int = 3,
    batch_size: int = 16,
    learning_rate: float = 3e-5,
    warmup_ratio: float = 0.1,
    weight_decay: float = 0.01,
    test_size: float = 0.2,
    seed: int = 42
):
    """Fine-tune the sentiment analysis model with custom training loop"""
    
    # Set random seeds
    set_random_seeds(seed)
    
    # Setup device
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    logger.info(f"Using device: {device}")
    
    # Create output directory if it doesn't exist
    os.makedirs(output_dir, exist_ok=True)
    
    # Load data
    logger.info("Loading training data...")
    texts, labels, label_map = load_jsonl_data(data_path)
    
    # Save label mapping
    with open(os.path.join(output_dir, "label_map.json"), "w") as f:
        json.dump(label_map, f)
    logger.info(f"Saved label mapping to {output_dir}/label_map.json")
    
    # Split data
    train_texts, val_texts, train_labels, val_labels = train_test_split(
        texts, labels, test_size=test_size, random_state=seed, stratify=labels
    )
    
    logger.info(f"Training samples: {len(train_texts)}")
    logger.info(f"Validation samples: {len(val_texts)}")
    
    # Load tokenizer and model
    logger.info(f"Loading model: {MODEL_NAME}")
    tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)
    model = AutoModelForSequenceClassification.from_pretrained(
        MODEL_NAME,
        num_labels=len(label_map)
    ).to(device)
    
    # Create datasets and dataloaders
    train_dataset = SentimentDataset(train_texts, train_labels, tokenizer)
    val_dataset = SentimentDataset(val_texts, val_labels, tokenizer)
    
    train_dataloader = DataLoader(
        train_dataset,
        batch_size=batch_size,
        shuffle=True,
        num_workers=4
    )
    val_dataloader = DataLoader(
        val_dataset,
        batch_size=batch_size,
        num_workers=4
    )
    
    # Setup optimizer
    optimizer = AdamW(
        model.parameters(),
        lr=learning_rate,
        weight_decay=weight_decay,
        betas=(0.9, 0.999),
        eps=1e-8
    )
    
    # Setup schedulers
    num_training_steps = len(train_dataloader) * num_epochs
    num_warmup_steps = int(num_training_steps * warmup_ratio)
    
    scheduler = get_linear_schedule_with_warmup(
        optimizer,
        num_warmup_steps=num_warmup_steps,
        num_training_steps=num_training_steps
    )
    
    # Training loop
    logger.info("Starting training...")
    best_f1 = 0
    for epoch in range(num_epochs):
        logger.info(f"\nEpoch {epoch + 1}/{num_epochs}")
        
        # Train
        train_loss = train_epoch(
            model,
            train_dataloader,
            optimizer,
            scheduler,
            device
        )
        logger.info(f"Training loss: {train_loss:.4f}")
        
        # Evaluate
        metrics = evaluate(model, val_dataloader, device)
        logger.info(f"Validation metrics: {metrics}")
        
        # Save best model
        if metrics['f1'] > best_f1:
            best_f1 = metrics['f1']
            logger.info(f"New best F1: {best_f1:.4f} - Saving model...")
            
            # Save model and tokenizer
            os.makedirs(output_dir, exist_ok=True)
            model.save_pretrained(output_dir)
            tokenizer.save_pretrained(output_dir)
    
    logger.info("\nTraining completed!")
    logger.info(f"Best F1: {best_f1:.4f}")
    
    return model, tokenizer, metrics

if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description="Fine-tune sentiment analysis model")
    parser.add_argument("-data", "--data_path", type=str, required=True, help="Path to training data JSONL file")
    parser.add_argument("-epochs", type=int, default=3, help="Number of training epochs")
    parser.add_argument("-lr", "--learning_rate", type=float, default=3e-5, help="Learning rate")
    parser.add_argument("--output_dir", type=str, default="./model", help="Output directory")
    parser.add_argument("--batch_size", type=int, default=16, help="Batch size")
    parser.add_argument("--seed", type=int, default=42, help="Random seed for reproducibility")
    
    args = parser.parse_args()
    
    fine_tune_model(
        data_path=args.data_path,
        output_dir=args.output_dir,
        num_epochs=args.epochs,
        batch_size=args.batch_size,
        learning_rate=args.learning_rate,
        seed=args.seed
    )
