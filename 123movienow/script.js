const API_KEY = 'a1e72fd93ed59f56e6332813b9f8dcae';
const BASE_URL = 'https://api.themoviedb.org/3';
const IMG_URL = 'https://image.tmdb.org/t/p/w500';
const PLACEHOLDER = 'https://via.placeholder.com/200x300?text=No+Image';
let currentItem;

// Fetch trending movies or tv shows
async function fetchTrending(type) {
  try {
    const res = await fetch(`${BASE_URL}/trending/${type}/week?api_key=${API_KEY}`);
    const data = await res.json();
    // Defensive: If API returns error (status_message), return empty array
    if (!data.results) return [];
    // Add media_type to all items (movies = 'movie', tv = 'tv')
    return data.results.map(item => ({ ...item, media_type: type }));
  } catch (err) {
    console.error('Error fetching trending:', err);
    return [];
  }
}

// Fetch trending anime (Japanese language, genre 16)
async function fetchTrendingAnime() {
  let allResults = [];
  for (let page = 1; page <= 3; page++) {
    try {
      const res = await fetch(`${BASE_URL}/trending/tv/week?api_key=${API_KEY}&page=${page}`);
      const data = await res.json();
      if (!data.results) continue;
      const filtered = data.results.filter(item =>
        item.original_language === 'ja' && item.genre_ids && item.genre_ids.includes(16)
      );
      // Defensive: Ensure media_type is set
      allResults = allResults.concat(filtered.map(item => ({ ...item, media_type: 'tv' })));
    } catch (err) {
      console.error('Error fetching anime page', page, err);
    }
  }
  return allResults;
}

function displayBanner(item) {
  const banner = document.getElementById('banner');
  if (!item || !item.backdrop_path) {
    banner.style.background = '#333';
    document.getElementById('banner-title').textContent = item ? (item.title || item.name) : 'No Movie';
    return;
  }
  banner.style.backgroundImage = `url(${IMG_URL}${item.backdrop_path})`;
  document.getElementById('banner-title').textContent = item.title || item.name;
}

function displayList(items, containerId) {
  const container = document.getElementById(containerId);
  container.innerHTML = '';
  items.forEach(item => {
    const img = document.createElement('img');
    img.src = item.poster_path ? `${IMG_URL}${item.poster_path}` : PLACEHOLDER;
    img.alt = item.title || item.name || 'No Title';
    img.onclick = () => showDetails(item);
    container.appendChild(img);
  });
}

function showDetails(item) {
  currentItem = item;
  document.getElementById('modal-title').textContent = item.title || item.name || '';
  document.getElementById('modal-description').textContent = item.overview || 'No description available.';
  document.getElementById('modal-image').src = item.poster_path ? `${IMG_URL}${item.poster_path}` : PLACEHOLDER;
  document.getElementById('modal-rating').innerHTML = item.vote_average ? '★'.repeat(Math.round(item.vote_average / 2)) : 'No rating';
  changeServer();
  document.getElementById('modal').style.display = 'flex';
}

function changeServer() {
  if (!currentItem) return;
  const server = document.getElementById('server').value;
  let type = currentItem.media_type;
  // Fallback: guess type if missing
  if (!type) {
    type = currentItem.title ? 'movie' : 'tv';
  }
  let embedURL = "";
  if (server === "vidsrc.cc") {
    embedURL = `https://vidsrc.cc/v2/embed/${type}/${currentItem.id}`;
  } else if (server === "vidsrc.me") {
    embedURL = `https://vidsrc.net/embed/${type}/?tmdb=${currentItem.id}`;
  } else if (server === "player.videasy.net") {
    embedURL = `https://player.videasy.net/${type}/${currentItem.id}`;
  }
  document.getElementById('modal-video').src = embedURL;
}

function closeModal() {
  document.getElementById('modal').style.display = 'none';
  document.getElementById('modal-video').src = '';
}

function openSearchModal() {
  document.getElementById('search-modal').style.display = 'flex';
  document.getElementById('search-input').focus();
}

function closeSearchModal() {
  document.getElementById('search-modal').style.display = 'none';
  document.getElementById('search-results').innerHTML = '';
  document.getElementById('search-input').value = '';
}

async function searchTMDB() {
  const query = document.getElementById('search-input').value;
  const container = document.getElementById('search-results');
  if (!query.trim()) {
    container.innerHTML = '';
    return;
  }
  try {
    const res = await fetch(`${BASE_URL}/search/multi?api_key=${API_KEY}&query=${encodeURIComponent(query)}`);
    const data = await res.json();
    container.innerHTML = '';
    if (!data.results) {
      const msg = document.createElement('div');
      msg.textContent = 'No results found.';
      container.appendChild(msg);
      return;
    }
    data.results.forEach(item => {
      if (!item.poster_path) return;
      const img = document.createElement('img');
      img.src = item.poster_path ? `${IMG_URL}${item.poster_path}` : PLACEHOLDER;
      img.alt = item.title || item.name || 'No Title';
      img.onclick = () => {
        closeSearchModal();
        showDetails(item);
      };
      container.appendChild(img);
    });
  } catch (err) {
    console.error('Error searching TMDB:', err);
    container.innerHTML = '<div style="color:red">Failed to search movies.</div>';
  }
}

// Event Listeners
document.getElementById('search-btn').onclick = openSearchModal;
document.getElementById('close-modal').onclick = closeModal;
document.getElementById('close-search-modal').onclick = closeSearchModal;
document.getElementById('server').onchange = changeServer;
document.getElementById('search-input').oninput = searchTMDB;
window.onclick = function (e) {
  // Close modals if clicking outside content
  if (e.target === document.getElementById('modal')) closeModal();
  if (e.target === document.getElementById('search-modal')) closeSearchModal();
};

// Init
async function init() {
  // Defensive: show loading or placeholders if desired
  const movies = await fetchTrending('movie');
  const tvShows = await fetchTrending('tv');
  const anime = await fetchTrendingAnime();

  if (movies.length > 0) {
    displayBanner(movies[Math.floor(Math.random() * movies.length)]);
  } else {
    displayBanner({ title: 'No movies found' });
  }
  displayList(movies, 'movies-list');
  displayList(tvShows, 'tvshows-list');
  displayList(anime, 'anime-list');
}
init();
