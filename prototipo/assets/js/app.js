document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.role-option').forEach(el => {
    el.addEventListener('click', () => {
      document.querySelectorAll('.role-option').forEach(o => o.classList.remove('active'));
      el.classList.add('active');
      const input = el.querySelector('input[type=radio]');
      if (input) input.checked = true;
    });
  });
});
