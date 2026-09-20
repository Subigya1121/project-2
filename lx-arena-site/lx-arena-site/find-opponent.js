function renderOpponents() {
  const grid = document.getElementById('opponentGrid');
  grid.innerHTML = `<p style="text-align:center;color:var(--muted);">Loading…</p>`;

  // Read from the public VIEW, not the base table — it never contains
  // captain_name or phone, only what's safe to show publicly.
  supabaseClient
    .from('opponent_requests_public')
    .select('*')
    .order('created_at', { ascending: false })
    .then(({ data, error }) => {
      if (error) {
        console.error(error);
        grid.innerHTML = `<div class="empty-state"><div class="empty-icon">🤝</div><p>Couldn't load opponent listings right now.</p></div>`;
        return;
      }

      if (!data || data.length === 0) {
        grid.innerHTML = `<div class="empty-state"><div class="empty-icon">🤝</div><p>No teams are currently looking for an opponent. Be the first to post below.</p></div>`;
        return;
      }

      grid.innerHTML = data.map((r) => `
        <div class="card opponent-card">
          <h3>${r.team_name}</h3>
          <div class="opponent-meta">
            <div><span>Skill level</span>${r.skill_level || '—'}</div>
            <div><span>Players</span>${r.player_count || '—'}</div>
            <div><span>Preferred date</span>${r.preferred_date}</div>
            <div><span>Preferred time</span>${r.preferred_time || '—'}</div>
          </div>
          ${r.message ? `<p style="color:var(--muted);font-size:0.85rem;margin-bottom:1.2rem;">"${r.message}"</p>` : ''}
          <button class="btn btn-primary btn-block request-match-btn" data-id="${r.id}">Request match</button>
        </div>
      `).join('');

      grid.querySelectorAll('.request-match-btn').forEach((btn) => {
        btn.addEventListener('click', () => {
          btn.textContent = 'Request sent ✓';
          btn.disabled = true;
          // A real notification (email/SMS) to the posting team's private
          // contact info would be triggered here via a backend function —
          // their phone/email are never exposed to this page.
        });
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

    supabaseClient
      .from('opponent_requests')
      .insert({
        team_name: teamName,
        captain_name: captainName,
        phone: phone,
        preferred_date: date,
        preferred_time: time || null,
        skill_level: skill,
        player_count: Number(players) || null,
        message: message || null,
      })
      .then(({ error }) => {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Post my team';

        if (error) {
          console.error(error);
          errorBox.textContent = "We couldn't post your team. Please try again.";
          errorBox.style.display = 'block';
          return;
        }

        renderOpponents();
        form.style.display = 'none';
        confirm.style.display = 'block';
      });
  });

  document.getElementById('opAgain').addEventListener('click', () => {
    form.reset();
    form.style.display = 'block';
    confirm.style.display = 'none';
  });
});
