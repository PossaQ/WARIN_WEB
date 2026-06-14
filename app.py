from flask import Flask, render_template, jsonify, request
from flask_cors import CORS
import time

app = Flask(__name__)
CORS(app)

latest_data = {
    "ph": 7.0,
    "tds": 300,
    "turbidity": 2.0,
    "temperature": 25.0,
    "battery": 90,
    "latitude": 13.7563,
    "longitude": 100.5018,
    "prediction": "Safe",
    "confidence": 0.92,
    "timestamp": int(time.time())
}

history = []

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/data")
def data():
    return jsonify(latest_data)

@app.route("/history")
def get_history():
    return jsonify(history)

@app.route("/update", methods=["POST"])
def update():
    global latest_data

    data = request.get_json(force=True)
    print("🔥 RAW ESP:", data)

    latest_data = {
        "ph": float(data.get("ph", 0)),
        "tds": float(data.get("tds", 0)),
        "turbidity": float(data.get("turbidity", 0)),
        "temperature": float(data.get("temperature", 0)),
        "battery": float(data.get("battery", 0)),
        "latitude": float(data.get("latitude", 0)),
        "longitude": float(data.get("longitude", 0)),
        "prediction": data.get("prediction", "Safe"),
        "confidence": float(data.get("confidence", 0)),
        "timestamp": int(time.time())
    }

    print("✅ UPDATED:", latest_data)

    return jsonify(latest_data)
@app.route("/health")
def health():
    return jsonify({"status": "online"})