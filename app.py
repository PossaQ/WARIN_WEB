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
    global latest_data, history

    data = request.json

    latest_data.update({
        "ph": data.get("ph", 0),
        "tds": data.get("tds", 0),
        "turbidity": data.get("turbidity", 0),
        "temperature": data.get("temperature", 0),
        "battery": data.get("battery", 0),
        "latitude": data.get("latitude", 0),
        "longitude": data.get("longitude", 0),
        "prediction": data.get("prediction", "Safe"),
        "confidence": data.get("confidence", 0),
        "timestamp": int(time.time())
    })

    history.append(latest_data.copy())
    if len(history) > 200:
        history.pop(0)

    return jsonify(latest_data)
@app.route("/health")
def health():
    return jsonify({"status": "online"})