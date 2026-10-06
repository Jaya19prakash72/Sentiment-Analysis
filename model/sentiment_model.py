import csv
import math
import re
from collections import Counter, defaultdict

TOKEN_RE = re.compile(r"[a-zA-Z']+")

class SentimentModel:
    """
    Lightweight Multinomial Naive Bayes sentiment classifier.
    Implemented from scratch so the project does not require numpy,
    scikit-learn, scipy, or other compiled packages.
    """

    def __init__(self):
        self.classes = ["Positive", "Negative", "Neutral"]
        self.word_counts = {c: Counter() for c in self.classes}
        self.total_words = {c: 0 for c in self.classes}
        self.doc_counts = Counter()
        self.vocabulary = set()
        self.total_docs = 0

    def tokenize(self, text):
        return TOKEN_RE.findall(text.lower())

    def train(self, rows):
        for text, label in rows:
            if label not in self.classes:
                continue
            tokens = self.tokenize(text)
            self.doc_counts[label] += 1
            self.total_docs += 1
            for token in tokens:
                self.word_counts[label][token] += 1
                self.total_words[label] += 1
                self.vocabulary.add(token)

    def train_from_csv(self, path):
        rows = []
        with open(path, "r", encoding="utf-8", newline="") as f:
            for row in csv.DictReader(f):
                rows.append((row["text"], row["sentiment"]))
        self.train(rows)

    def predict(self, text):
        tokens = self.tokenize(text)
        if not tokens:
            return {"sentiment": "Neutral", "confidence": 0.0,
                    "scores": {"Positive": 0, "Negative": 0, "Neutral": 0}}

        vocab_size = max(len(self.vocabulary), 1)
        log_scores = {}
        for label in self.classes:
            prior = (self.doc_counts[label] + 1) / (self.total_docs + len(self.classes))
            score = math.log(prior)
            denominator = self.total_words[label] + vocab_size
            for token in tokens:
                count = self.word_counts[label].get(token, 0)
                score += math.log((count + 1) / denominator)
            log_scores[label] = score

        # Softmax converts model scores into interpretable probabilities.
        max_score = max(log_scores.values())
        exp_scores = {k: math.exp(v - max_score) for k, v in log_scores.items()}
        total = sum(exp_scores.values())
        probabilities = {k: v / total for k, v in exp_scores.items()}

        sentiment = max(probabilities, key=probabilities.get)
        confidence = round(probabilities[sentiment] * 100, 2)
        return {
            "sentiment": sentiment,
            "confidence": confidence,
            "scores": {k: round(probabilities[k] * 100, 2) for k in self.classes}
        }
