function renderPlans() {
  const grid = document.getElementById('plansGrid');
  grid.innerHTML = MEMBERSHIP_PLANS.map((p) => `
    <div class="price-card ${p.featured ? 'featured' : ''}">
      ${p.featured ? '<span class="price-badge">Most popular</span>' : ''}
      <h3>${p.name}</h3>
      <p class="duration">${p.duration}</p>
      <p class="price">Rs ${p.price.toLocaleString()}</p>
      <ul>${p.features.map((f) => `<li>${f}</li>`).join('')}</ul>
      <a href="#signupSection" class="btn ${p.featured ? 'btn-primary' : 'btn-outline'} btn-block choose-plan" data-plan="${p.id}">Choose plan</a>
    </div>
  `).join('');

  grid.querySelectorAll('.choose-plan').forEach((btn) => {
    btn.addEventListener('click', () => {
      document.getElementById('msPlan').value = btn.dataset.plan;
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  renderPlans();

  const planSelect = document.getElementById('msPlan');
  MEMBERSHIP_PLANS.forEach((p) => {
    const opt = document.createElement('option');
    opt.value = p.id;
    opt.textContent = `${p.name} — Rs ${p.price.toLocaleString()}`;
    planSelect.appendChild(opt);
  });

  document.getElementById('msStart').min = new Date().toISOString().split('T')[0];

  const form = document.getElementById('membershipForm');
  const confirm = document.getElementById('membershipConfirm');
  const errorBox = document.getElementById('membershipError');
  const submitBtn = document.getElementById('msSubmit');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    errorBox.style.display = 'none';

    const plan = MEMBERSHIP_PLANS.find((p) => p.id === planSelect.value);
    const name = document.getElementById('msName').value.trim();
    const phone = document.getElementById('msPhone').value.trim();
    const email = document.getElementById('msEmail').value.trim();
    const start = document.getElementById('msStart').value;

    ['msName', 'msPhone', 'msEmail', 'msStart'].forEach((id) => (document.getElementById('err-' + id).textContent = ''));
    let hasError = false;
    const setErr = (id, msg) => { document.getElementById('err-' + id).textContent = msg; hasError = true; };

    if (!name) setErr('msName', 'Enter your name.');
    if (!/^[0-9+\-()\s]{7,}$/.test(phone)) setErr('msPhone', 'Enter a valid phone number.');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) setErr('msEmail', 'Enter a valid email address.');
    if (!start) setErr('msStart', 'Choose a start date.');

    if (hasError) return;

    submitBtn.disabled = true;
    submitBtn.textContent = 'Submitting…';

    supabaseClient
      .from('gym_membership_requests')
      .insert({
        plan_name: plan.name,
        plan_price: plan.price,
        full_name: name,
        phone: phone,
        email: email,
        start_date: start,
      })
      .then(({ error }) => {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Request this plan';

        if (error) {
          console.error(error);
          errorBox.textContent = 'Something went wrong while submitting your request. Please try again.';
          errorBox.style.display = 'block';
          return;
        }

        document.getElementById('membershipConfirmDetails').innerHTML = `
          <div><span>Plan</span><span>${plan.name}</span></div>
          <div><span>Price</span><span>Rs ${plan.price.toLocaleString()}</span></div>
          <div><span>Start date</span><span>${start}</span></div>
        `;
        form.style.display = 'none';
        confirm.style.display = 'block';
      });
  });

  document.getElementById('msAgain').addEventListener('click', () => {
    form.reset();
    form.style.display = 'block';
    confirm.style.display = 'none';
  });
});
