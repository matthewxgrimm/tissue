document.querySelectorAll('[data-version]').forEach(button => {
  button.addEventListener('click', () => {
    const version = button.dataset.version;
    document.getElementById('edit-before').hidden = version !== 'before';
    document.getElementById('edit-after').hidden = version !== 'after';
    document.querySelectorAll('[data-version]').forEach(item => {
      const active = item === button;
      item.setAttribute('aria-pressed', String(active));
      item.classList.toggle('bg-paper', active);
      item.classList.toggle('text-ink', active);
    });
  });
});
