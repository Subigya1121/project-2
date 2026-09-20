document.addEventListener('DOMContentLoaded', () => {
  const courtSelect = document.getElementById('qbCourt');
  COURTS.forEach((c) => {
    const opt = document.createElement('option');
    opt.value = c.id;
    opt.textContent = `${c.name} — Rs ${c.pricePerHour}/hr`;
    courtSelect.appendChild(opt);
  });

  const timeSelect = document.getElementById('qbTime');
  TIME_SLOTS.forEach((t) => {
    const opt = document.createElement('option');
    opt.value = t;
    opt.textContent = t;
    timeSelect.appendChild(opt);
  });

  document.getElementById('qbDate').min = new Date().toISOString().split('T')[0];

  document.getElementById('quickBookingForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const date = document.getElementById('qbDate').value;
    const court = document.getElementById('qbCourt').value;
    const time = document.getElementById('qbTime').value;
    const players = document.getElementById('qbPlayers').value;
    // Carry the selection through to the full booking page via the URL.
    const params = new URLSearchParams({ date, court, time, players });
    window.location.href = `booking.html?${params.toString()}`;
  });

  // Reviews — empty state until real reviews are connected.
  const wrap = document.getElementById('reviewsWrap');
  if (!REVIEWS || REVIEWS.length === 0) {
    wrap.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">⭐</div>
        <p>Customer reviews will appear here once connected.</p>
      </div>
    `;
  }
});