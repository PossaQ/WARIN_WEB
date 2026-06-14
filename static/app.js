let mode = "http";
let pollTimer = null;
let demoTimer = null;
let history = [];

let map = null;
let marker = null;

// ================= UI HELPERS =================
function setText(id, v) {
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent = (v ?? "-");
}

function setBar(id, v) {
  const el = document.getElementById(id);
  if (!el) return;
  el.style.width = `${Math.min(100, Math.max(0, v || 0))}%`;
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

// ================= MAIN UPDATE =================
function updateUI(d) {
  if (!d) return;

  const ph = Number(d.ph || 0);
  const tds = Number(d.tds || 0);
  const turb = Number(d.turbidity || 0);
  const temp = Number(d.temperature || 0);
  const bat = Number(d.battery || 0);
  const lat = Number(d.latitude);
  const lon = Number(d.longitude);

  setText("val-ph", ph.toFixed(2));
  setText("val-tds", Math.round(tds));
  setText("val-turb", turb.toFixed(1));
  setText("val-temp", temp.toFixed(1));
  setText("val-bat", bat.toFixed(0));

  setBar("bar-ph", (ph / 14) * 100);
  setBar("bar-tds", (tds / 1000) * 100);
  setBar("bar-turb", (turb / 20) * 100);
  setBar("bar-temp", (temp / 50) * 100);
  setBar("bat-fill", bat);

  setStatus("stat-ph", getPhStatus(ph));

  // confidence optional
  if (d.confidence != null) {
    setText("pred-conf", (d.confidence * 100).toFixed(1) + "%");
  }

  updateMap(lat, lon);

  addHistory({
    time: Date.now(),
    ph, tds, turb, temp, bat,
    prediction: d.prediction || "-"
  });
}

// ================= HISTORY =================
function addHistory(d) {
  history.unshift(d);
  if (history.length > 50) history.pop();

  const tbody = document.getElementById("history-body");
  if (!tbody) return;

  tbody.innerHTML = "";

  history.forEach(h => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${new Date(h.time).toLocaleTimeString()}</td>
      <td>${h.ph.toFixed(2)}</td>
      <td>${Math.round(h.tds)}</td>
      <td>${h.turb.toFixed(1)}</td>
      <td>${h.temp.toFixed(1)}</td>
      <td>${h.bat.toFixed(0)}%</td>
      <td>${h.prediction}</td>
    `;
    tbody.appendChild(row);
  });
}

// ================= DEMO =================
function demoTick() {
  updateUI({
    ph: 7 + Math.random(),
    tds: 300 + Math.random() * 50,
    turbidity: 2 + Math.random() * 2,
    temperature: 25 + Math.random(),
    battery: 80 + Math.random() * 10,
    latitude: 13.7563,
    longitude: 100.5018,
    prediction: "Safe",
    confidence: 0.9
  });
}

// ================= FETCH =================
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

  clearInterval(demoTimer);
  clearInterval(pollTimer);

  if (m === "demo") {
    demoTimer = setInterval(demoTick, 2000);
  }

  if (m === "http") {
    pollTimer = setInterval(fetchData, 2000);
  }
}

// ================= INIT =================
document.addEventListener("DOMContentLoaded", () => {
  setMode("http"); // 🔥 IMPORTANT: use real data
});

// ================= MAP =================
function updateMap(lat, lon) {
  if (lat == null || lon == null) return;

  lat = Number(lat);
  lon = Number(lon);

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

  map.panTo([lat, lon], { animate: true });

  setText("coord-lat", lat.toFixed(5));
  setText("coord-lon", lon.toFixed(5));
}