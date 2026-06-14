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

    data = request.json
    print("🔥 RECEIVED FROM ESP:", data)  # << ต้องเห็น

    latest_data.update(data)
    latest_data["timestamp"] = int(time.time())

    return jsonify({"status": "ok"})
@app.route("/health")
def health():
    return jsonify({"status": "online"})