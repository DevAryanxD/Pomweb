const ITEMS_PER_PAGE = 20;
let currentPage = 1;
let cachedResponses = {};
let allVideos = [];

async function loadVideos(page = 1, query = '') {
  const container = document.getElementById('videos-container');
  const pagination = document.getElementById('pagination');
  container.innerHTML = '';
  pagination.innerHTML = '';

  try {
    if (!allVideos.length) {
      const res = await fetch('data.json');
      allVideos = await res.json();
    }

    const filteredVideos = query
      ? allVideos.filter(item => item.title?.toLowerCase().includes(query.toLowerCase()))
      : allVideos;

    const totalPages = Math.ceil(filteredVideos.length / ITEMS_PER_PAGE);
    const start = (page - 1) * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;
    const currentItems = filteredVideos.slice(start, end);

    for (const item of currentItems) {
      if (!cachedResponses[item.url]) {
        const apiRes = await fetch(`https://silent-noor-stream-api.woodmirror.workers.dev/api?url=${encodeURIComponent(item.url)}`);
        cachedResponses[item.url] = await apiRes.json();
      }
      const data = cachedResponses[item.url];
      const title = item.title || data.file_name;

      const card = document.createElement('div');
      card.className = 'card';
      card.innerHTML = `
        <a href="video.html?url=${encodeURIComponent(item.url)}&title=${encodeURIComponent(title)}">
          <img src="${data.thumbnail}" alt="${title}" loading="lazy">
          <p>${title}</p>
        </a>
      `;
      container.appendChild(card);
    }

    for (let i = 1; i <= totalPages; i++) {
      const btn = document.createElement('button');
      btn.textContent = i;
      btn.className = i === page ? 'active' : '';
      btn.onclick = () => loadVideos(i, query);
      pagination.appendChild(btn);
    }
  } catch (err) {
    container.innerHTML = '<p>Error loading videos. Please try again.</p>';
    console.error(err);
  }
}

// Debounced Search
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

document.getElementById('search').addEventListener('input', debounce((e) => {
  currentPage = 1;
  loadVideos(1, e.target.value);
}, 300));

// Theme Toggle
document.getElementById('theme-toggle').addEventListener('click', () => {
  document.body.classList.toggle('light');
  localStorage.setItem('theme', document.body.classList.contains('light') ? 'light' : 'dark');
});

// Load Theme Preference
if (localStorage.getItem('theme') === 'light') {
  document.body.classList.add('light');
}

loadVideos(currentPage);