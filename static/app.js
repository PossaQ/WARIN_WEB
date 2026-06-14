// =========================
// AquaSense Frontend Logic
// =========================

let mode = "demo";
let ws = null;
let pollTimer = null;
let demoTimer = null;

let history = [];

const API_BASE = ""; // Flask same domain

// ================= UI HELPERS =================
function setText(id, v) {
  const el = document.getElementById(id);
  if (el) el.textContent = v;
}

function setBar(id, v) {
  const el = document.getElementById(id);
  if (el) el.style.width = Math.min(100, Math.max(0, v)) + "%";
}

function setStatus(id, [cls, label]) {
  const el = document.getElementById(id);
  if (!el) return;
  el.className = "sensor-status " + cls;
  el.textContent = label;
}

// ================= STATUS =================
function getPhStatus(v) {
  if (v >= 6.5 && v <= 8.5) return ["status-ok", "Normal"];
  if (v >= 6.0 && v <= 9.0) return ["status-warn", "Marginal"];
  return ["status-bad", "Critical"];
}

// ================= UPDATE UI =================
function updateUI(d) {
  setText("val-ph", d.ph.toFixed(2));
  setText("val-tds", Math.round(d.tds));
  setText("val-turb", d.turbidity.toFixed(1));
  setText("val-temp", d.temperature.toFixed(1));

  setBar("bar-ph", (d.ph / 14) * 100);
  setBar("bar-tds", (d.tds / 1000) * 100);
  setBar("bar-turb", (d.turbidity / 20) * 100);
  setBar("bar-temp", (d.temperature / 50) * 100);

  setStatus("stat-ph", getPhStatus(d.ph));

  // battery
  setText("val-bat", d.battery);
  setBar("bat-fill", d.battery);

  // prediction
  setText("pred-conf", (d.confidence * 100).toFixed(1) + "%");

  addHistory(d);
}

// ================= HISTORY =================
function addHistory(d) {
  history.unshift(d);
  if (history.length > 50) history.pop();

  const tbody = document.getElementById("history-body");
  tbody.innerHTML = "";

  history.forEach(h => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${new Date().toLocaleTimeString()}</td>
      <td>${h.ph.toFixed(2)}</td>
      <td>${Math.round(h.tds)}</td>
      <td>${h.turbidity.toFixed(1)}</td>
      <td>${h.temperature.toFixed(1)}</td>
      <td>${h.battery}%</td>
      <td>${h.prediction}</td>
    `;
    tbody.appendChild(row);
  });
}

// ================= DEMO MODE =================
function demoTick() {
  const data = {
    ph: 7 + Math.random(),
    tds: 300 + Math.random() * 50,
    turbidity: 2 + Math.random() * 2,
    temperature: 25 + Math.random(),
    battery: 80 + Math.random() * 10,
    prediction: "Safe",
    confidence: 0.9
  };

  updateUI(data);
}

// ================= HTTP =================
async function fetchData() {
  try {
    const res = await fetch("/data");
    const data = await res.json();
    updateUI(data);
  } catch (e) {
    console.log("offline");
  }
}

// ================= MODE =================
function setMode(m) {
  mode = m;

  if (demoTimer) clearInterval(demoTimer);
  if (pollTimer) clearInterval(pollTimer);

  if (m === "demo") {
    demoTimer = setInterval(demoTick, 2000);
  }

  if (m === "http") {
    pollTimer = setInterval(fetchData, 3000);
  }
}

// ================= INIT =================
document.addEventListener("DOMContentLoaded", () => {
  setMode("demo");
});

let map = null;
let marker = null;

function updateMap(lat, lon) {
  if (!lat || !lon) return;

  lat = parseFloat(lat);
  lon = parseFloat(lon);

  if (isNaN(lat) || isNaN(lon)) return;

  if (!map) {
    map = L.map('map').setView([lat, lon], 15);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap'
    }).addTo(map);
  }

  if (!marker) {
    marker = L.marker([lat, lon]).addTo(map);
  } else {
    marker.setLatLng([lat, lon]);
  }

  map.setView([lat, lon], map.getZoom(), {
    animate: true
  });

  setText("coord-lat", lat.toFixed(5));
  setText("coord-lon", lon.toFixed(5));
}