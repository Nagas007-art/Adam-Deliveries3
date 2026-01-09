/* ================= CONFIG ================= */
const WHATSAPP_NUMBER = "233509104421";

/* Location pricing (base prices) */
const LOCATIONS = {
  "Takoradi": 10,
  "Market Circle": 10,
  "Effiakuma": 15,
  "Anaji": 20,
  "Apremdo": 20,
  "Kojokrom": 30,
  "Kwesimintsim": 20,
  "Sekondi": 30,
  "Shama": 60
};

/* Riders */
const RIDERS = [
  { id: "r1", name: "Muftawu Adam", phone: "233509104421" },
  { id: "r2", name: "Mohammed Muftawu", phone: "233550040470" }
];

/* App state */
let currentRequest = null;

/* ================= NAVIGATION ================= */
function showPage(id) {
  document.querySelectorAll(".page").forEach(p => p.classList.remove("active"));
  document.getElementById(id).classList.add("active");
  window.scrollTo(0, 0);
}

/* ================= INIT ================= */
document.addEventListener("DOMContentLoaded", () => {

  document.getElementById("startBtn").onclick =
    () => showPage("page-services");

  document.querySelectorAll(".back").forEach(btn => {
    btn.onclick = () => showPage(btn.dataset.to);
  });

  document.querySelectorAll(".service-toggle").forEach(btn => {
    btn.onclick = () => {
      const sub = document.getElementById(btn.dataset.toggle);
      sub.style.display = sub.style.display === "block" ? "none" : "block";
    };
  });

  document.getElementById("documentPickup").onclick = () => {
    buildBusinessForm();
    showPage("page-form");
  };

  document.getElementById("parcelBtn").onclick = () => {
    buildParcelForm();
    showPage("page-form");
  };

  document.querySelectorAll("#personalSub .subitem").forEach(item => {
    item.onclick = () => {
      buildPersonalForm(item.dataset.personal);
      showPage("page-form");
    };
  });

  document.getElementById("mainForm").onsubmit = submitForm;
});

/* ================= FORM BUILDERS ================= */
function locationOptions() {
  return Object.keys(LOCATIONS)
    .map(l => `<option value="${l}">${l}</option>`)
    .join("");
}

function buildBusinessForm() {
  document.getElementById("formTitle").innerText = "Business Errand – Document Pickup";
  document.getElementById("formFields").innerHTML = `
    <label>Receiver Name</label>
    <input name="receiverName" required>

    <label>Receiver Phone</label>
    <input name="receiverPhone" type="tel" required>

    <label>Pickup Location</label>
    <select name="from" required>
      <option value="">Select</option>${locationOptions()}
    </select>

    <label>Delivery Location</label>
    <select name="to" required>
      <option value="">Select</option>${locationOptions()}
    </select>
  `;
}

function buildPersonalForm(service) {
  document.getElementById("formTitle").innerText = service;
  document.getElementById("formFields").innerHTML = `
    <label>Your Phone</label>
    <input name="customerPhone" type="tel" required>

    <label>Pickup Location</label>
    <select name="from" required>
      <option value="">Select</option>${locationOptions()}
    </select>

    <label>Delivery Location</label>
    <select name="to" required>
      <option value="">Select</option>${locationOptions()}
    </select>
  `;
}

function buildParcelForm() {
  document.getElementById("formTitle").innerText = "Parcel Pickup";
  document.getElementById("formFields").innerHTML = `
    <label>Driver Number</label>
    <input name="driverNumber" required>

    <label>Car Number</label>
    <input name="carNumber" required>

    <label>Receiver Name</label>
    <input name="receiverName" required>

    <label>Receiver Phone</label>
    <input name="receiverPhone" type="tel" required>

    <label>Pickup Location</label>
    <select name="from" required>
      <option value="">Select</option>${locationOptions()}
    </select>

    <label>Delivery Location</label>
    <select name="to" required>
      <option value="">Select</option>${locationOptions()}
    </select>
  `;
}

/* ================= FORM SUBMIT ================= */
function submitForm(e) {
  e.preventDefault();

  const fields = {};
  document.querySelectorAll("#formFields [name]").forEach(f => {
    fields[f.name] = f.value;
  });

  const price = LOCATIONS[fields.from] + LOCATIONS[fields.to];

  currentRequest = {
    service: document.getElementById("formTitle").innerText,
    from: fields.from,
    to: fields.to,
    fields,
    price
  };

  renderRiders();
  showPage("page-riders");
}

/* ================= RIDERS ================= */
function renderRiders() {
  const list = document.getElementById("ridersList");
  list.innerHTML = "";

  RIDERS.forEach(r => {
    const card = document.createElement("div");
    card.className = "rider-card";
    card.innerHTML = `
      <div class="rider-avatar">${r.name.split(" ").map(x=>x[0]).join("")}</div>
      <div class="rider-meta">
        <h4>${r.name}</h4>
        <p>${r.phone}</p>
      </div>
      <button class="btn primary">Pick Rider</button>
    `;
    card.querySelector("button").onclick = () => sendWhatsApp(r);
    list.appendChild(card);
  });
}

/* ================= WHATSAPP ================= */
function sendWhatsApp(rider) {
  const msg = `
AD-NAG DELIVERY SERVICE

Service: ${currentRequest.service}
Pickup: ${currentRequest.from}
Delivery: ${currentRequest.to}
Price: GHS ${currentRequest.price}

Rider: ${rider.name}
Phone: ${rider.phone}

Please confirm this order.
`;

  window.open(
    `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`,
    "_blank"
  );

  showPage("page-done");
}
