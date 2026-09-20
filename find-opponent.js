const OPPONENT_STORAGE_KEY = 'lxarena_opponent_requests';

function getOpponentRequests() {
  try {
    return JSON.parse(localStorage.getItem(OPPONENT_STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

function saveOpponentRequest(entry) {
  const all = getOpponentRequests();
  all.unshift(entry); // newest first
  localStorage.setItem(OPPONENT_STORAGE_KEY, JSON.stringify(all));
}

function renderOpponents() {
  const grid = document.getElementById('opponentGrid');
  const requests = getOpponentRequests();

  if (requests.length === 0) {
    grid.innerHTML = `<div class="empty-state"><div class="empty-icon">🤝</div><p>No teams are currently looking for an opponent. Be the first to post below.</p></div>`;
    return;
  }

  // Note: phone/email are intentionally never rendered here — kept private,
  // only used behind the scenes when a real backend routes a match request.
  grid.innerHTML = requests.map((r) => `
    <div class="card opponent-card">
      <h3>${r.teamName}</h3>
      <div class="opponent-meta">
        <div><span>Skill level</span>${r.skill}</div>
        <div><span>Players</span>${r.players}</div>
        <div><span>Preferred date</span>${r.date}</div>
        <div><span>Preferred time</span>${r.time}</div>
      </div>
      ${r.message ? `<p style="color:var(--muted);font-size:0.85rem;margin-bottom:1.2rem;">"${r.message}"</p>` : ''}
      <button class="btn btn-primary btn-block request-match-btn" data-team="${r.teamName}">Request match</button>
    </div>
  `).join('');

  grid.querySelectorAll('.request-match-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      btn.textContent = 'Request sent ✓';
      btn.disabled = true;
      // In a real deployment, this triggers a backend notification to the
      // posting team's private contact info — never exposed on this page.
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  renderOpponents();

  const timeSelect = document.getElementById('opTime');
  TIME_SLOTS.forEach((t) => {
    const opt = document.createElement('option');
    opt.value = t;
    opt.textContent = t;
    timeSelect.appendChild(opt);
  });
  document.getElementById('opDate').min = new Date().toISOString().split('T')[0];

  const form = document.getElementById('opponentForm');
  const confirm = document.getElementById('opponentConfirm');
  const errorBox = document.getElementById('opponentError');
  const submitBtn = document.getElementById('opSubmit');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    errorBox.style.display = 'none';

    const teamName = document.getElementById('opTeamName').value.trim();
    const captainName = document.getElementById('opCaptainName').value.trim();
    const phone = document.getElementById('opPhone').value.trim();
    const date = document.getElementById('opDate').value;
    const time = document.getElementById('opTime').value;
    const skill = document.getElementById('opSkill').value;
    const players = document.getElementById('opPlayers').value;
    const message = document.getElementById('opMessage').value.trim();

    ['opTeamName', 'opCaptainName', 'opPhone', 'opDate'].forEach((id) => (document.getElementById('err-' + id).textContent = ''));
    let hasError = false;
    const setErr = (id, msg) => { document.getElementById('err-' + id).textContent = msg; hasError = true; };

    if (!teamName) setErr('opTeamName', 'Enter your team name.');
    if (!captainName) setErr('opCaptainName', "Enter the captain's name.");
    if (!/^[0-9+\-()\s]{7,}$/.test(phone)) setErr('opPhone', 'Enter a valid phone number.');
    if (!date) setErr('opDate', 'Choose a preferred date.');

    if (hasError) return;

    submitBtn.disabled = true;
    submitBtn.textContent = 'Posting…';

    setTimeout(() => {
      saveOpponentRequest({ teamName, captainName, phone, date, time, skill, players, message });
      renderOpponents();
      form.style.display = 'none';
      confirm.style.display = 'block';
      submitBtn.disabled = false;
      submitBtn.textContent = 'Post my team';
    }, 800);
  });

  document.getElementById('opAgain').addEventListener('click', () => {
    form.reset();
    form.style.display = 'block';
    confirm.style.display = 'none';
  });
});