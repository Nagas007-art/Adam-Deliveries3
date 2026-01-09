/* ---------------- CONFIG ---------------- */
const WHATSAPP_NUMBER = "233509104421";

/* Location pricing (base values) */
const LOCATIONS = {
  "Town": 5,
  "Market Circle": 5,
  "Beach Road": 10,
  "Chapel Hill": 10,
  "Takoradi Harbour": 10,
  "New Takoradi": 15,
  "Windy Ridge": 15,
  "Pipe Ano": 15,
  "New Site": 15,
  "Effiakuma": 15,
  "Anaji": 20,
  "I Adu": 20,
  "Ademtem": 25,
  "Mpatado": 25,
  "Fijai": 20,
  "Ntankoful": 25,
  "Kansaworodo": 25,
  "Effia Nkwanta Hospital": 25,
  "Nkotompo": 25,
  "Essaman": 25,
  "Kwekuma": 20,
  "Adiembra": 20,
  "Sekondi": 30,
  "Essikado": 30,
  "Ngyiresia": 35,
  "Mepiasem": 35,
  "Kojokrom": 30,
  "Mpetin": 30,
  "Eshiyem": 40,
  "KofiKrom": 45,
   "Inchaban": 50,
  "Shama": 60,
  "Daboase": 70,
  "Kwesimintsim": 20,
  "Assakae": 25,
  "Whindo": 30,
  "Race Course": 25,
  "Apremdo": 20,
  "Apollo": 20,
  "Apawa": 30,
  "Kejebri": 40,
  "Biaho": 35,
  "Agona": 80,

 
  

};

/* Riders */
const RIDERS = [
  { id: "r1", name: "Muftawu Adam", phone: "233509104421" },
  { id: "r2", name: "Mohammed Muftawu", phone: "233550040470" }
];

/* App state */
let currentRequest = {
  service: "",
  fields: {},
  price: 0
};

/* ---------------- NAVIGATION ---------------- */
function showPage(id) {
  document.querySelectorAll(".page").forEach(p => p.classList.remove("active"));
  const page = document.getElementById(id);
  if (page) page.classList.add("active");
  window.scrollTo(0, 0);
}

/* ---------------- INIT ---------------- */
document.addEventListener("DOMContentLoaded", () => {

  document.getElementById("startBtn")
    .addEventListener("click", () => showPage("page-services"));

  document.querySelectorAll(".back").forEach(btn => {
    btn.addEventListener("click", () => {
      showPage(btn.dataset.to);
    });
  });

  document.querySelectorAll(".service-toggle").forEach(btn => {
    btn.addEventListener("click", () => {
      const sub = document.getElementById(btn.dataset.toggle);
      sub.style.display = sub.style.display === "block" ? "none" : "block";
    });
  });

  document.getElementById("documentPickup")
    .addEventListener("click", () => {
      buildBusinessForm();
      showPage("page-form");
    });

  document.getElementById("parcelBtn")
    .addEventListener("click", () => {
      buildParcelForm();
      showPage("page-form");
    });

  document.querySelectorAll("#personalSub .subitem").forEach(item => {
    item.addEventListener("click", () => {
      buildPersonalForm(item.dataset.personal);
      showPage("page-form");
    });
  });

  document.getElementById("mainForm")
    .addEventListener("submit", handleFormSubmit);
});

/* ---------------- HELPERS ---------------- */
function locationOptions() {
  return Object.keys(LOCATIONS)
    .map(l => `<option value="${l}">${l}</option>`)
    .join("");
}

function calculatePrice(from, to) {
  if (!from || !to) return 0;
  return LOCATIONS[from] + LOCATIONS[to];
}

function updatePrice() {
  const from = document.querySelector("[name='fromLocation']").value;
  const to = document.querySelector("[name='toLocation']").value;

  const price = calculatePrice(from, to);
  currentRequest.price = price;

  document.getElementById("priceBox").innerText =
    price ? `Price: GHS ${price}` : "";
}

/* ---------------- FORM BUILDERS ---------------- */
function clearForm(title) {
  document.getElementById("formTitle").innerText = title;
  document.getElementById("formFields").innerHTML = "";
}

function commonLocationFields() {
  return `
    <div class="form-group">
      <label>From Location</label>
      <select name="fromLocation" required onchange="updatePrice()">
        <option value="">Select</option>
        ${locationOptions()}
      </select>
    </div>

    <div class="form-group">
      <label>To Location</label>
      <select name="toLocation" required onchange="updatePrice()">
        <option value="">Select</option>
        ${locationOptions()}
      </select>
    </div>

    <p id="priceBox" style="font-weight:bold;margin-top:12px;"></p>
  `;
}


/* Business */
function buildBusinessForm() {
  currentRequest.service = "Business Errand - Document Pickup";
  clearForm(currentRequest.service);

  document.getElementById("formFields").innerHTML = `
    <label>Receiver Name</label>
    <input name="receiverName" required>

    <label>Receiver Phone</label>
    <input name="receiverPhone" type="tel" required>

    ${commonLocationFields()}
  `;
}

/* Personal */
function buildPersonalForm(service) {
  currentRequest.service = service;
  clearForm(service);

  document.getElementById("formFields").innerHTML = `
    <label>Your Phone Number</label>
    <input name="phone" type="tel" required>

    ${commonLocationFields()}
  `;
}

/* Parcel */
function buildParcelForm() {
  currentRequest.service = "Parcel Pickup";
  clearForm(currentRequest.service);

  document.getElementById("formFields").innerHTML = `
    <label>Driver Number</label>
    <input name="driverNumber" required>

    <label>Car Number</label>
    <input name="carNumber" required>

    <label>Receiver Name</label>
    <input name="receiverName" required>

    <label>Receiver Phone</label>
    <input name="receiverPhone" type="tel" required>

    <label>Upload STC Receipt (optional)</label>
    <input name="receipt" type="file">

    ${commonLocationFields()}
  `;
}

/* ---------------- SUBMIT FORM ---------------- */
function handleFormSubmit(e) {
  e.preventDefault();

  const data = {};
  document.querySelectorAll("#formFields [name]").forEach(f => {
    if (f.type === "file") {
      data[f.name] = f.files.length ? "Receipt attached" : "";
    } else {
      data[f.name] = f.value.trim();
    }
  });

  currentRequest.fields = data;

  renderRiders();
  showPage("page-riders");
}

/* ---------------- RIDERS ---------------- */
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
    card.querySelector("button")
      .addEventListener("click", () => sendWhatsApp(r));
    list.appendChild(card);
  });
}

/* ---------------- WHATSAPP ---------------- */
function sendWhatsApp(rider) {
  const lines = [
    "Ad-Nag Delivery Service",
    "",
    `Service: ${currentRequest.service}`,
    ...Object.entries(currentRequest.fields)
      .filter(([_, v]) => v)
      .map(([k, v]) => `${k.replace(/([A-Z])/g," $1")}: ${v}`),
    "",
    `Price: GHS ${currentRequest.price}`,
    `Rider: ${rider.name} (${rider.phone})`,
    "",
    "Please confirm this order."
  ];

  window.open(
    `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(lines.join("\n"))}`,
    "_blank"
  );

  showPage("page-done");
}
