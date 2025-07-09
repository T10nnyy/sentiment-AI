"""
Quick test script to verify the siebert model works correctly
"""

from transformers import AutoTokenizer, AutoModelForSequenceClassification, pipeline

def test_siebert_model():
    """Test the siebert sentiment model"""
    print("Loading siebert/sentiment-roberta-large-english model...")
    
    # Load tokenizer and model directly
    tokenizer = AutoTokenizer.from_pretrained("siebert/sentiment-roberta-large-english")
    model = AutoModelForSequenceClassification.from_pretrained("siebert/sentiment-roberta-large-english")
    
    # Create pipeline
    sentiment_pipeline = pipeline(
        "text-classification",
        model=model,
        tokenizer=tokenizer,
        return_all_scores=True
    )
    
    # Test texts
    test_texts = [
        "I love this product! It's amazing!",
        "This is terrible, I hate it.",
        "It's okay, nothing special.",
        "Absolutely fantastic experience!",
        "Worst purchase ever made."
    ]
    
    print("\nTesting sentiment predictions:")
    print("-" * 50)
    
    for text in test_texts:
        result = sentiment_pipeline(text)
        print(f"Text: {text}")
        print(f"Results: {result}")
        
        # Process results like our API does
        if isinstance(result, list) and len(result) > 0:
            scores = result[0] if isinstance(result[0], list) else result
            
            for score_dict in scores:
                label = score_dict['label'].upper()
                score = score_dict['score']
                print(f"  {label}: {score:.4f}")
        
        print("-" * 50)

if __name__ == "__main__":
    test_siebert_model()
