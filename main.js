/* ==========================================================
   SHARED ACROSS ALL PAGES
   Requires config.js to be loaded first.
========================================================== */

// Mobile drawer toggle
document.addEventListener('DOMContentLoaded', () => {
  const hamburger = document.getElementById('hamburger');
  const mobileDrawer = document.getElementById('mobileDrawer');
  if (hamburger && mobileDrawer) {
    hamburger.addEventListener('click', () => mobileDrawer.classList.toggle('open'));
    mobileDrawer.querySelectorAll('a').forEach((a) =>
      a.addEventListener('click', () => mobileDrawer.classList.remove('open'))
    );
  }

  // Auto-fill any element tagged with data-cfg="phone" / "email" / "address" / "hours" / "name"
  // from the FACILITY config object, so contact info only ever needs editing in config.js.
  document.querySelectorAll('[data-cfg]').forEach((el) => {
    const key = el.getAttribute('data-cfg');
    if (FACILITY[key] !== undefined) el.textContent = FACILITY[key];
  });

  document.querySelectorAll('[data-cfg-tel]').forEach((el) => {
    el.href = `tel:${FACILITY.phone.replace(/\s/g, '')}`;
  });

  document.querySelectorAll('[data-cfg-mailto]').forEach((el) => {
    el.href = `mailto:${FACILITY.email}`;
  });

  document.querySelectorAll('[data-cfg-directions]').forEach((el) => {
    el.href = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(FACILITY.mapsQuery)}`;
    el.target = '_blank';
    el.rel = 'noreferrer';
  });

  document.querySelectorAll('[data-cfg-map]').forEach((el) => {
    el.src = `https://maps.google.com/maps?q=${encodeURIComponent(FACILITY.mapsQuery)}&z=14&output=embed`;
  });
});