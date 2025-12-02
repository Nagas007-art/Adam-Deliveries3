/* script.js for Ad-Nag Delivery Service
   - Handles slide navigation
   - toggles dropdowns
   - builds forms dynamically
   - shows riders list and sends WhatsApp message
*/

/* ------------- Config ------------- */
// Replace with your WhatsApp number in international format (no +, no leading 0).
// Example Ghana mobile: 23355xxxxxxx
const WHATSAPP_NUMBER = "233509104421";
const WHATSAPP_NUMBER2 = "233550040470";

/* ------------- App state ------------- */
let currentRequest = null; // will hold form data before pick rider

/* ------------- Helper: navigation (slide) ------------- */
function showPage(targetId) {
  // remove active from current
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  // add active to target
  const el = document.getElementById(targetId);
  if (el) el.classList.add('active');
  window.scrollTo(0,0);
}

/* initial button wiring */
document.addEventListener('DOMContentLoaded', () => {
  // Start button
  document.getElementById('startBtn').addEventListener('click', () => showPage('page-services'));

  // Back buttons (data-to)
  document.querySelectorAll('.back').forEach(b => {
    b.addEventListener('click', (e) => {
      const to = e.currentTarget.getAttribute('data-to');
      if (to) showPage(to);
    });
  });

  // Service toggles (open/close sublist)
  document.querySelectorAll('.service-toggle').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-toggle');
      const sub = document.getElementById(id);
      sub.style.display = sub.style.display === 'block' ? 'none' : 'block';
    });
  });

  // connect subitems & buttons to form builds
  document.getElementById('documentPickup').addEventListener('click', () => {
    buildBusinessForm();
    showPage('page-form');
  });

  document.getElementById('parcelBtn').addEventListener('click', () => {
    buildParcelForm();
    showPage('page-form');
  });

  // personal subitems (they are many but share same personal form)
  document.querySelectorAll('#personalSub .subitem').forEach(node => {
    node.addEventListener('click', () => {
      const serviceName = node.getAttribute('data-personal') || 'Personal Errand';
      buildPersonalForm(serviceName);
      showPage('page-form');
    });
  });

  // Form submit
  document.getElementById('mainForm').addEventListener('submit', (e) => {
    e.preventDefault();
    // read inputs from formFields area
    const fields = Array.from(document.querySelectorAll('#formFields [name]'));
    const data = {};
    fields.forEach(f => {
      if(f.type === 'file') {
        // we cannot send files over wa.me; just note if file selected
        data[f.name] = f.files && f.files.length ? 'receipt_attached' : '';
      } else {
        data[f.name] = f.value.trim();
      }
    });

    // store request state
    currentRequest = { timestamp: Date.now(), fields: data };
    // go pick rider
    renderRiders();
    showPage('page-riders');
  });

  // riders selection will be wired by renderRiders()
});

/* ------------- Form builders ------------- */

function clearFormArea() {
  document.getElementById('formTitle').innerText = 'Form';
  const area = document.getElementById('formFields');
  area.innerHTML = '';
}

// Business form
function buildBusinessForm() {
  clearFormArea();
  document.getElementById('formTitle').innerText = 'Business Errand - Document Pickup';
  const area = document.getElementById('formFields');

  area.innerHTML = `
    <label>Receiver Name</label>
    <input name="receiverName" type="text" required>

    <label>Receiver Location</label>
    <input name="receiverLocation" type="text" required>

    <label>Receiver Number</label>
    <input name="receiverPhone" type="tel" required>

    <label>Notes (optional)</label>
    <textarea name="notes" placeholder="Extra info..."></textarea>
  `;
}

// Personal form (parameterized)
function buildPersonalForm(serviceName = 'Personal Errand') {
  clearFormArea();
  document.getElementById('formTitle').innerText = serviceName;
  const area = document.getElementById('formFields');

  area.innerHTML = `
    <label>Pickup / Delivery Location</label>
    <input name="location" type="text" required>

    <label>Your Phone Number</label>
    <input name="phone" type="tel" required>

    <label>Notes (optional)</label>
    <textarea name="notes" placeholder="Item description, food details or address notes..."></textarea>
  `;
}

// Parcel form
function buildParcelForm() {
  clearFormArea();
  document.getElementById('formTitle').innerText = 'Parcel Pickup';
  const area = document.getElementById('formFields');

  area.innerHTML = `
    <label>Driver Number</label>
    <input name="driverNumber" type="text" required>

    <label>Car Number</label>
    <input name="carNumber" type="text" required>

    <label>Receiver Name</label>
    <input name="receiverName" type="text" required>

    <label>Receiver Phone</label>
    <input name="receiverPhone" type="tel" required>

    <label>Upload Receipt (STC) (optional)</label>
    <input name="receipt" type="file" accept="image/*">

    <label>Notes (optional)</label>
    <textarea name="notes" placeholder="Extra info..."></textarea>
  `;
}

/* ------------- Riders & WhatsApp flow ------------- */

/* Sample riders data (you can replace with real riders) */
const RIDERS = [
  { id: 'r1', name: 'Muftawu Adam', phone: '233509104421',},
  { id: 'r2', name: 'Mohammed Muftawu', phone: '233550040470',},
  ];

function renderRiders() {
  const container = document.getElementById('ridersList');
  container.innerHTML = '';
  RIDERS.forEach(r => {
    const card = document.createElement('div');
    card.className = 'rider-card';
    card.innerHTML = `
      <div class="rider-avatar">${r.name.split(' ').map(x=>x[0]).slice(0,2).join('')}</div>
      <div class="rider-meta">
        <h4>${r.name}</h4>
        <p>Phone: ${r.phone}</p>
        <p>Rating: ${r.rating}</p>
      </div>
      <div>
        <button class="btn primary pick" data-id="${r.id}">Pick Rider</button>
      </div>
    `;
    container.appendChild(card);
  });

  // wire pick buttons
  container.querySelectorAll('.pick').forEach(b => {
    b.addEventListener('click', (e) => {
      const id = e.currentTarget.getAttribute('data-id');
      const rider = RIDERS.find(r=>r.id===id);
      if(!rider){ alert('Rider not found'); return; }
      sendOrderToWhatsApp(rider);
    });
  });
}

/* Build and open WhatsApp message */
function sendOrderToWhatsApp(rider) {
  if(!currentRequest){ alert('No request found'); return; }

  // Build readable message
  const lines = [];
  lines.push('Hello, I would like to place an order:');
  lines.push('');
  lines.push('Service details:');
  Object.entries(currentRequest.fields).forEach(([k,v]) => {
    if(!v) return;
    // friendly label
    const label = k.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase());
    lines.push(`- ${label}: ${v}`);
  });
  lines.push('');
  lines.push(`Selected Rider: ${rider.name} (phone: ${rider.phone})`);
  lines.push('');
  lines.push('Please confirm and send how much I should pay.');

  const message = encodeURIComponent(lines.join('\n'));
  const waUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${message}`;

  // open whatsapp
  window.open(waUrl, '_blank');

  // go to done page
  showPage('page-done');
}
