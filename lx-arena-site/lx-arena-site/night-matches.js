function statusFor(match) {
  const remaining = match.maxPlayers - match.playersJoined;
  if (remaining <= 0) return { label: 'FULL', cls: 'status-full' };
  if (remaining <= 2) return { label: 'ALMOST FULL', cls: 'status-almost' };
  return { label: 'OPEN', cls: 'status-open' };
}

function renderMatches() {
  const grid = document.getElementById('matchGrid');

  if (!NIGHT_MATCHES || NIGHT_MATCHES.length === 0) {
    grid.innerHTML = `<div class="empty-state"><div class="empty-icon">🌙</div><p>No upcoming night matches are available.</p></div>`;
    return;
  }

  grid.innerHTML = NIGHT_MATCHES.map((m) => {
    const status = statusFor(m);
    const pct = Math.min(100, Math.round((m.playersJoined / m.maxPlayers) * 100));
    return `
      <div class="card match-card">
        <span class="match-status ${status.cls}">${status.label}</span>
        <h3>${m.title}</h3>
        <div class="match-meta">
          <span>📅 ${m.day}</span>
          <span>🕐 ${m.time}</span>
          <span>📍 ${m.court}</span>
          <span>🎯 ${m.skillLevel}</span>
        </div>
        <div class="match-progress-wrap"><div class="match-progress-bar" style="width:${pct}%"></div></div>
        <div style="display:flex;justify-content:space-between;font-size:0.85rem;color:var(--muted);">
          <span>${m.playersJoined}/${m.maxPlayers} players</span>
          <span>Rs ${m.pricePerPlayer}/player</span>
        </div>
        <a href="#joinSection" class="btn btn-primary btn-block">Join match</a>
      </div>
    `;
  }).join('');
}

document.addEventListener('DOMContentLoaded', () => {
  renderMatches();

  const matchSelect = document.getElementById('jmMatch');
  if (NIGHT_MATCHES && NIGHT_MATCHES.length > 0) {
    NIGHT_MATCHES.forEach((m) => {
      const full = m.playersJoined >= m.maxPlayers;
      const opt = document.createElement('option');
      opt.value = m.id;
      opt.textContent = `${m.title} — ${m.day}, ${m.time}${full ? ' (FULL)' : ''}`;
      opt.disabled = full;
      matchSelect.appendChild(opt);
    });
  } else {
    document.getElementById('joinSection').style.display = 'none';
  }

  const joinForm = document.getElementById('joinForm');
  const joinConfirm = document.getElementById('joinConfirm');
  const joinError = document.getElementById('joinError');
  const jmSubmit = document.getElementById('jmSubmit');

  joinForm.addEventListener('submit', (e) => {
    e.preventDefault();
    joinError.style.display = 'none';

    const name = document.getElementById('jmName').value.trim();
    const phone = document.getElementById('jmPhone').value.trim();
    const mode = document.getElementById('jmMode').value;
    const match = NIGHT_MATCHES.find((m) => m.id === matchSelect.value);

    ['jmName', 'jmPhone'].forEach((id) => (document.getElementById('err-' + id).textContent = ''));
    let hasError = false;
    const setErr = (id, msg) => { document.getElementById('err-' + id).textContent = msg; hasError = true; };
    if (!name) setErr('jmName', 'Enter your name.');
    if (!/^[0-9+\-()\s]{7,}$/.test(phone)) setErr('jmPhone', 'Enter a valid phone number.');
    if (hasError) return;

    jmSubmit.disabled = true;
    jmSubmit.textContent = 'Reserving…';

    supabaseClient
      .from('night_match_joins')
      .insert({
        match_title: match.title,
        player_name: name,
        phone: phone,
        joining_mode: mode,
      })
      .then(({ error }) => {
        jmSubmit.disabled = false;
        jmSubmit.textContent = 'Reserve my spot';

        if (error) {
          console.error(error);
          joinError.textContent = 'Something went wrong while reserving your spot. Please try again.';
          joinError.style.display = 'block';
          return;
        }

        document.getElementById('joinConfirmDetails').innerHTML = `
          <div><span>Match</span><span>${match.title}</span></div>
          <div><span>When</span><span>${match.day}, ${match.time}</span></div>
          <div><span>Joining as</span><span>${mode === 'solo' ? 'Solo player' : 'With my team'}</span></div>
          <div><span>Price</span><span>Rs ${match.pricePerPlayer}</span></div>
        `;
        joinForm.style.display = 'none';
        joinConfirm.style.display = 'block';
      });
  });

  document.getElementById('jmAgain').addEventListener('click', () => {
    joinForm.reset();
    joinForm.style.display = 'block';
    joinConfirm.style.display = 'none';
  });
});
