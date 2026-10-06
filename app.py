from flask import Flask, render_template, request, jsonify
from model.sentiment_model import SentimentModel
import csv
from pathlib import Path
from datetime import datetime

BASE_DIR = Path(__file__).resolve().parent
DATA_FILE = BASE_DIR / "data" / "sentiment_data.csv"
LOG_FILE = BASE_DIR / "data" / "analysis_history.csv"

app = Flask(__name__)
model = SentimentModel()
model.train_from_csv(DATA_FILE)

def save_history(text, result):
    exists = LOG_FILE.exists()
    with LOG_FILE.open("a", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        if not exists:
            writer.writerow(["timestamp", "text", "sentiment", "confidence"])
        writer.writerow([datetime.now().isoformat(timespec="seconds"),
                         text, result["sentiment"], result["confidence"]])

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/api/analyze", methods=["POST"])
def analyze():
    data = request.get_json(silent=True) or {}
    text = str(data.get("text", "")).strip()
    if not text:
        return jsonify({"error": "Please enter some text."}), 400
    result = model.predict(text)
    save_history(text, result)
    return jsonify(result)

@app.route("/api/batch", methods=["POST"])
def batch():
    data = request.get_json(silent=True) or {}
    texts = data.get("texts", [])
    if not isinstance(texts, list):
        return jsonify({"error": "texts must be a list"}), 400
    results = []
    for text in texts[:100]:
        text = str(text).strip()
        if text:
            result = model.predict(text)
            save_history(text, result)
            results.append({"text": text, **result})
    return jsonify({"results": results})

@app.route("/api/stats")
def stats():
    counts = {"Positive": 0, "Negative": 0, "Neutral": 0}
    history = []
    if LOG_FILE.exists():
        with LOG_FILE.open("r", newline="", encoding="utf-8") as f:
            for row in csv.DictReader(f):
                sentiment = row.get("sentiment", "Neutral")
                counts[sentiment] = counts.get(sentiment, 0) + 1
                history.append(row)
    return jsonify({
        "counts": counts,
        "total": sum(counts.values()),
        "history": history[-50:][::-1]
    })

if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5000, debug=True)
