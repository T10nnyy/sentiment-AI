import pandas as pd
import random

# Define sad and happy statements
sad_statements = [
    "Sometimes the people you love the most are the ones who hurt you the deepest.",
    "I smiled in front of everyone, but broke down when I was alone.",
    "It's painful when memories are all that's left of someone who used to mean everything.",
    "I watched everything fall apart, and there was nothing I could do.",
    "Even when I'm surrounded by people, I still feel alone.",
    "Tears are words the heart can't express.",
    "The hardest part is pretending you're okay when you're not.",
    "Loneliness doesn't come from being alone, it comes from being forgotten.",
    "I miss the old me, the one who was happy.",
    "Sometimes silence is the loudest cry."
]

happy_statements = [
    "Some days start with a smile and end with a memory worth keeping forever.",
    "It feels amazing when someone genuinely cares about you.",
    "The little things in life often turn out to be the biggest blessings.",
    "Laughter shared with loved ones is the best kind of therapy.",
    "Even after dark times, happiness always finds its way back.",
    "Today is a good day to be proud of how far you've come.",
    "Joy comes in moments — savor them.",
    "Surround yourself with those who make you laugh a little louder.",
    "Happiness is not a destination, it’s a way of life.",
    "A kind word can change someone’s entire day."
]

# Generate a dataset of 1000 statements
data = []
for _ in range(500):
    data.append((random.choice(sad_statements), "sad"))
    data.append((random.choice(happy_statements), "happy"))

# Create DataFrame
df = pd.DataFrame(data, columns=["text", "label"])

# Shuffle the dataset
df = df.sample(frac=1).reset_index(drop=True)

# Show first few rows
df.head()
