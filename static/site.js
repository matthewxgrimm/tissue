const menu = document.querySelector('#site-menu');
if (menu) {
  document.addEventListener('click', event => {
    if (!menu.contains(event.target)) menu.open = false;
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && menu.open) {
      menu.open = false;
      menu.querySelector('summary').focus();
    }
  });
}

const searchForm = document.querySelector('#search-form');
if (searchForm) {
  const input = document.querySelector('#search-query');
  const status = document.querySelector('#search-status');
  const results = document.querySelector('#search-results');
  let indexPromise;
  let requestId = 0;

  function loadIndex() {
    if (!indexPromise) {
      indexPromise = fetch('/search_index.json').then(response => {
        if (!response.ok) throw new Error('Search index unavailable');
        return response.json();
      }).then(pages => pages.map(page => {
        const document = new DOMParser().parseFromString(page.content, 'text/html');
        return { ...page, plainText: document.body.textContent || '' };
      })).catch(error => {
        indexPromise = undefined;
        throw error;
      });
    }
    return indexPromise;
  }

  async function search() {
    const currentRequest = ++requestId;
    const query = input.value.trim();
    const url = new URL(window.location.href);
    if (query) url.searchParams.set('q', query);
    else url.searchParams.delete('q');
    window.history.replaceState(null, '', url);
    results.replaceChildren();
    if (!query) {
      status.textContent = 'Enter a word to search the site.';
      return;
    }
    status.textContent = 'Searching…';
    try {
      const pages = await loadIndex();
      if (currentRequest !== requestId) return;
      const terms = query.toLocaleLowerCase().split(/\s+/);
      const matches = pages.filter(page => {
        const text = `${page.title} ${page.desc} ${page.plainText}`.toLocaleLowerCase();
        return terms.every(term => text.includes(term));
      });
      status.textContent = matches.length
        ? `${matches.length} ${matches.length === 1 ? 'page' : 'pages'} found for “${query}”.`
        : `No pages found for “${query}”. Try another word.`;
      for (const page of matches) {
        const target = new URL(page.permalink, window.location.origin);
        if (target.origin !== window.location.origin || !['https:', 'http:'].includes(target.protocol)) continue;
        const item = document.createElement('li');
        item.className = 'rounded-xl border border-stone-200 bg-white p-6';
        const heading = document.createElement('h2');
        const link = document.createElement('a');
        link.href = target.pathname + target.search + target.hash;
        link.className = 'text-xl font-semibold text-teal-800 hover:underline';
        link.textContent = page.title;
        heading.append(link);
        const description = document.createElement('p');
        description.className = 'mt-2 leading-7 text-stone-600';
        description.textContent = page.desc || page.plainText.slice(0, 180);
        item.append(heading, description);
        results.append(item);
      }
    } catch {
      if (currentRequest === requestId) status.textContent = 'Search could not load. Please try again.';
    }
  }

  searchForm.addEventListener('submit', event => {
    event.preventDefault();
    search();
  });
  let debounce;
  input.addEventListener('input', () => {
    ++requestId;
    clearTimeout(debounce);
    debounce = setTimeout(search, 180);
  });
  input.value = new URLSearchParams(window.location.search).get('q') || '';
  if (input.value) search();
}
