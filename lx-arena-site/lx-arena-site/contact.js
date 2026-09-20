document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('contactForm');
  const confirm = document.getElementById('contactConfirm');
  const errorBox = document.getElementById('contactError');
  const submitBtn = document.getElementById('cSubmit');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    errorBox.style.display = 'none';

    const name = document.getElementById('cName').value.trim();
    const email = document.getElementById('cEmail').value.trim();
    const message = document.getElementById('cMessage').value.trim();

    ['cName', 'cEmail', 'cMessage'].forEach((id) => (document.getElementById('err-' + id).textContent = ''));
    let hasError = false;
    const setErr = (id, msg) => { document.getElementById('err-' + id).textContent = msg; hasError = true; };

    if (!name) setErr('cName', 'Enter your name.');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) setErr('cEmail', 'Enter a valid email address.');
    if (!message) setErr('cMessage', 'Enter a message.');

    if (hasError) return;

    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending…';

    supabaseClient
      .from('contact_messages')
      .insert({
        name: name,
        email: email,
        phone: document.getElementById('cPhone').value.trim() || null,
        subject: document.getElementById('cSubject').value.trim() || null,
        message: message,
      })
      .then(({ error }) => {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Send message';

        if (error) {
          console.error(error);
          errorBox.textContent = "We couldn't send your message. Please try again.";
          errorBox.style.display = 'block';
          return;
        }

        form.style.display = 'none';
        confirm.style.display = 'block';
      });
  });
});
