from flask import Flask, render_template, jsonify, request
from flask_cors import CORS
import json
import time
import threading

app = Flask(__name__)
CORS(app)

# ------------------ MOCK DATA STORAGE ------------------
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

# ------------------ UPDATE DATA (FROM ESP32 OR MQTT) ------------------
@app.route("/update", methods=["POST"])
def update():
    global latest_data, history
    data = request.json

    latest_data.update(data)
    latest_data["timestamp"] = int(time.time())

    history.append(latest_data.copy())
    if len(history) > 200:
        history.pop(0)

    return jsonify({"status": "ok"})


# ------------------ GET LATEST DATA ------------------
@app.route("/data")
def data():
    return jsonify(latest_data)


# ------------------ HISTORY ------------------
@app.route("/history")
def get_history():
    return jsonify(history)


# ------------------ MAIN PAGE ------------------
@app.route("/")
def index():
    return render_template("index.html")


# ------------------ SIMPLE HEALTH CHECK ------------------
@app.route("/health")
def health():
    return jsonify({"status": "online"})


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)