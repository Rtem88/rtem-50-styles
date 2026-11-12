(() => {
  'use strict';
  const styles = window.STYLES;
  const grid = document.querySelector('#grid');
  const dialog = document.querySelector('#detail');
  const search = document.querySelector('#search');
  const filters = document.querySelector('.filters');
  const comparison = document.querySelector('#comparison');
  let category = 'Усі', current = null, opener = null, toastTimer;
  const categories = ['Усі', ...new Set(styles.map(s => s.category))];
  categories.forEach(name => {
    const button = document.createElement('button');
    button.textContent = name;
    button.setAttribute('aria-pressed', String(name === category));
    button.addEventListener('click', () => { category = name; filters.querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', String(b === button))); render(); });
    filters.append(button);
  });
  function render() {
    const query = search.value.trim().toLocaleLowerCase('uk');
    const results = styles.filter(s => (category === 'Усі' || s.category === category) && [s.name,s.description,s.tag,s.category].join(' ').toLocaleLowerCase('uk').includes(query));
    grid.replaceChildren();
    for (const s of results) {
      const card = document.createElement('button');
      card.className = 'card';
      card.setAttribute('aria-label', `${s.name}: приклад і промпт`);
      const visual = document.createElement('div'); visual.className = 'card-visual';
      const img = document.createElement('img'); img.src = s.image; img.alt = s.description; img.loading = s.id <= 6 ? 'eager' : 'lazy'; img.decoding = 'async';
      const number = document.createElement('span'); number.className = 'card-number'; number.textContent = String(s.id).padStart(2,'0') + ' / 50';
      const arrow = document.createElement('span'); arrow.className = 'card-open'; arrow.textContent = '↗'; arrow.setAttribute('aria-hidden','true');
      visual.append(img,number,arrow);
      const copy = document.createElement('div'); copy.className = 'card-copy';
      const title = document.createElement('h2'); title.textContent = s.name;
      const tag = document.createElement('span'); tag.className = 'card-tag'; tag.textContent = s.tag;
      copy.append(title,tag); card.append(visual,copy);
      card.addEventListener('click', () => { opener = card; show(s.id); }); grid.append(card);
    }
    document.querySelector('#empty').hidden = results.length > 0;
    document.querySelector('#result-count').textContent = `${results.length} / 50 СТИЛІВ`;
  }
  function show(id) {
    const s = styles.find(s => s.id === id); if (!s) return;
    current = s;
    document.querySelector('#detail-title').textContent = s.name;
    document.querySelector('#detail-number').textContent = String(s.id).padStart(2,'0') + ' / 50';
    document.querySelector('#detail-tag').textContent = s.tag;
    document.querySelector('#detail-description').textContent = s.description;
    document.querySelector('#prompt').textContent = s.prompt;
    document.querySelector('#before-image').src = s.image;
    document.querySelector('#before-image').alt = `${s.name}: вихідне зображення`;
    document.querySelector('#after-image').src = s.image;
    document.querySelector('#after-image').alt = `${s.name}: зображення після застосування стилю`;
    comparison.value = '50'; updateComparison();
    if (!dialog.open) dialog.showModal();
    document.body.style.overflow = 'hidden';
    history.replaceState(null,'','#' + s.slug);
    dialog.scrollTop = 0;
  }
  function close() { dialog.close(); }
  function updateComparison() { document.querySelector('#compare').style.setProperty('--position', comparison.value + '%'); }
  function notify(text) { const toast = document.querySelector('#toast'); toast.textContent = text; toast.classList.add('visible'); clearTimeout(toastTimer); toastTimer = setTimeout(() => toast.classList.remove('visible'), 2400); }
  search.addEventListener('input', render);
  comparison.addEventListener('input', updateComparison);
  document.querySelector('#reset').addEventListener('click', () => { search.value=''; filters.querySelector('button').click(); });
  document.querySelector('#close').addEventListener('click',close);
  dialog.addEventListener('click', e => { if(e.target === dialog){ const r = dialog.getBoundingClientRect(); if(e.clientX<r.left || e.clientX>r.right || e.clientY<r.top || e.clientY>r.bottom) close(); } });
  dialog.addEventListener('close', () => { document.body.style.overflow = ''; history.replaceState(null,'',location.pathname + location.search + '#collection'); if(opener?.isConnected) opener.focus({preventScroll:true}); });
  document.querySelector('#previous').addEventListener('click',() => show(current.id === 1 ? 50 : current.id-1));
  document.querySelector('#next').addEventListener('click',() => show(current.id === 50 ? 1 : current.id+1));
  document.querySelector('#copy').addEventListener('click', async () => {
    if (!current) return;
    try { await navigator.clipboard.writeText(current.prompt); notify('Промпт скопійовано'); }
    catch { const area=document.createElement('textarea'); area.value=current.prompt; area.style.cssText='position:fixed;opacity:0'; dialog.append(area); area.select(); const success=document.execCommand('copy'); area.remove(); notify(success?'Промпт скопійовано':'Виділи та скопіюй текст промпту'); }
  });
  function openHash(){ const s=styles.find(s=>s.slug===location.hash.slice(1)); if(s) show(s.id); }
  window.addEventListener('hashchange',openHash);
  render(); openHash();
})();
