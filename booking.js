let selectedSlot = null;

// Deterministic "demo" availability so it looks believable without a real backend.
// Replace this with a real database query when a backend is connected.
function isSlotBooked(dateStr, courtId, slot) {
  const seed = `${dateStr}-${courtId}-${slot}`;
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  return hash % 4 === 0; // ~25% of slots show as booked, for demo purposes
}

function renderSlots() {
  const date = document.getElementById('bkDate').value;
  const courtId = document.getElementById('bkCourtSelect').value;
  const grid = document.getElementById('slotGrid');
  grid.innerHTML = '';
  selectedSlot = null;
  updateSummary();

  if (!date || !courtId) return;

  TIME_SLOTS.forEach((slot) => {
    const booked = isSlotBooked(date, courtId, slot);
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.textContent = slot;
    btn.disabled = booked;
    btn.style.padding = '0.7rem 0.5rem';
    btn.style.fontSize = '0.82rem';
    btn.style.borderRadius = '4px';
    btn.style.cursor = booked ? 'not-allowed' : 'pointer';
    btn.style.border = '1px solid var(--border)';
    btn.style.background = booked ? 'var(--surface)' : 'var(--card)';
    btn.style.color = booked ? 'var(--muted)' : 'var(--text)';
    if (booked) btn.title = 'Already booked';

    btn.addEventListener('click', () => {
      selectedSlot = slot;
      Array.from(grid.children).forEach((c) => {
        c.style.borderColor = 'var(--border)';
        c.style.background = c.disabled ? 'var(--surface)' : 'var(--card)';
      });
      btn.style.borderColor = 'var(--accent)';
      btn.style.background = 'var(--primary-dark)';
      updateSummary();
    });

    grid.appendChild(btn);
  });
}

function updateSummary() {
  const summary = document.getElementById('bookingSummary');
  const date = document.getElementById('bkDate').value;
  const courtId = document.getElementById('bkCourtSelect').value;
  const court = COURTS.find((c) => c.id === courtId);
  const duration = Number(document.getElementById('bkDuration').value);

  if (!date || !court || !selectedSlot) {
    summary.textContent = 'Select a date, court, and time slot above to see your total.';
    return;
  }

  const total = court.pricePerHour * duration;
  summary.innerHTML = `
    <strong style="color:var(--text);">${court.name}</strong> · ${date} · ${selectedSlot} · ${duration}hr(s)<br>
    Total: <strong style="color:var(--accent);">Rs ${total}</strong>
  `;
}

document.addEventListener('DOMContentLoaded', () => {
  const courtSelect = document.getElementById('bkCourtSelect');
  COURTS.forEach((c) => {
    const opt = document.createElement('option');
    opt.value = c.id;
    opt.textContent = `${c.name} — Rs ${c.pricePerHour}/hr`;
    courtSelect.appendChild(opt);
  });

  const dateInput = document.getElementById('bkDate');
  dateInput.min = new Date().toISOString().split('T')[0];

  // Pre-fill from the homepage quick-booking widget, if it sent us here.
  const params = new URLSearchParams(window.location.search);
  if (params.get('date')) dateInput.value = params.get('date');
  if (params.get('court')) courtSelect.value = params.get('court');
  if (params.get('players')) document.getElementById('bkPlayers').value = params.get('players');

  dateInput.addEventListener('change', renderSlots);
  courtSelect.addEventListener('change', renderSlots);
  document.getElementById('bkDuration').addEventListener('change', updateSummary);

  renderSlots();
  if (params.get('time')) {
    // Try to auto-select the slot passed from the homepage widget.
    setTimeout(() => {
      const target = Array.from(document.getElementById('slotGrid').children)
        .find((btn) => btn.textContent === params.get('time') && !btn.disabled);
      if (target) target.click();
    }, 0);
  }

  const bookingForm = document.getElementById('bookingForm');
  const bookingConfirm = document.getElementById('bookingConfirm');
  const bookingError = document.getElementById('bookingError');
  const bkSubmit = document.getElementById('bkSubmit');

  bookingForm.addEventListener('submit', (e) => {
    e.preventDefault();
    bookingError.style.display = 'none';

    const name = document.getElementById('bkName').value.trim();
    const phone = document.getElementById('bkPhone').value.trim();
    const email = document.getElementById('bkEmail').value.trim();
    const court = COURTS.find((c) => c.id === courtSelect.value);
    const date = dateInput.value;
    const duration = Number(document.getElementById('bkDuration').value);
    const players = document.getElementById('bkPlayers').value;

    ['bkName', 'bkPhone', 'bkEmail'].forEach((id) => (document.getElementById('err-' + id).textContent = ''));
    let hasError = false;
    const setErr = (id, msg) => { document.getElementById('err-' + id).textContent = msg; hasError = true; };

    if (!name) setErr('bkName', 'Enter your name.');
    if (!/^[0-9+\-()\s]{7,}$/.test(phone)) setErr('bkPhone', 'Enter a valid phone number.');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) setErr('bkEmail', 'Enter a valid email address.');
    if (!date) { bookingError.textContent = 'Choose a date.'; bookingError.style.display = 'block'; hasError = true; }
    if (!selectedSlot) { bookingError.textContent = 'Choose a time slot.'; bookingError.style.display = 'block'; hasError = true; }

    if (hasError) return;

    bkSubmit.disabled = true;
    bkSubmit.textContent = 'Processing…';

    const code = 'LXB-' + Math.random().toString(36).slice(2, 7).toUpperCase();
    const total = court.pricePerHour * duration;

    supabaseClient
      .from('court_bookings')
      .insert({
        customer_name: name,
        customer_phone: phone,
        customer_email: email,
        court_name: court.name,
        booking_date: date,
        time_slot: selectedSlot,
        duration_hours: duration,
        number_of_players: Number(players) || null,
        special_request: document.getElementById('bkNote').value.trim() || null,
        total_price: total,
        confirmation_code: code,
      })
      .then(({ error }) => {
        bkSubmit.disabled = false;
        bkSubmit.textContent = 'Confirm booking';

        if (error) {
          console.error(error);
          bookingError.textContent = 'Something went wrong while confirming your booking. Please try again.';
          bookingError.style.display = 'block';
          return;
        }

        document.getElementById('confirmDetails').innerHTML = `
          <div><span>Booking ID</span><span>${code}</span></div>
          <div><span>Court</span><span>${court.name}</span></div>
          <div><span>Date</span><span>${date}</span></div>
          <div><span>Time</span><span>${selectedSlot}</span></div>
          <div><span>Duration</span><span>${duration}hr</span></div>
          <div><span>Players</span><span>${players}</span></div>
          <div><span>Total</span><span>Rs ${total}</span></div>
        `;

        bookingForm.style.display = 'none';
        bookingConfirm.style.display = 'block';
      });
  });

  document.getElementById('bkAgain').addEventListener('click', () => {
    bookingForm.reset();
    bookingForm.style.display = 'block';
    bookingConfirm.style.display = 'none';
    renderSlots();
  });
});