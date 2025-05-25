const API_KEY = 'a1e72fd93ed59f56e6332813b9f8dcae';
const BASE_URL = 'https://api.themoviedb.org/3';
const IMG_URL = 'https://image.tmdb.org/t/p/w500';
const PLACEHOLDER = 'https://via.placeholder.com/200x300?text=No+Image';

let bannerItems = [];
let currentBanner = 0;
let currentItem = null;
let currentType = 'movie';

// --- Data Fetchers ---
async function fetchTrending(type = 'movie') {
  const res = await fetch(`${BASE_URL}/trending/${type}/week?api_key=${API_KEY}`);
  const data = await res.json();
  return data.results || [];
}

async function fetchPopularMovies() {
  const res = await fetch(`${BASE_URL}/movie/popular?api_key=${API_KEY}`);
  const data = await res.json();
  return data.results || [];
}

async function fetchByKeyword(keyword) {
  const res = await fetch(`${BASE_URL}/search/keyword?api_key=${API_KEY}&query=${encodeURIComponent(keyword)}`);
  const data = await res.json();
  if (data.results && data.results.length > 0) {
    const keywordId = data.results[0].id;
    const res2 = await fetch(`${BASE_URL}/discover/movie?api_key=${API_KEY}&with_keywords=${keywordId}`);
    const data2 = await res2.json();
    return data2.results || [];
  }
  return [];
}

async function fetchMoviesByCompany(companyId) {
  const res = await fetch(`${BASE_URL}/discover/movie?api_key=${API_KEY}&with_companies=${companyId}`);
  const data = await res.json();
  return data.results || [];
}

// --- Banner Logic ---
function showBanner(index) {
  if (!bannerItems.length) return;
  currentBanner = (index + bannerItems.length) % bannerItems.length;
  const item = bannerItems[currentBanner];
  const banner = document.getElementById('banner');
  banner.style.backgroundImage = `url('${item.backdrop_path ? IMG_URL + item.backdrop_path : PLACEHOLDER}')`;
  document.getElementById('banner-title').textContent = item.title || item.name || 'No Title';
  document.getElementById('banner-description').textContent = item.overview || 'No description available.';
  banner.onclick = () => showDetails(item, item.media_type || 'movie');
}

function nextBanner(n) {
  showBanner(currentBanner + n);
}

// --- Render Media Rows (Cards with poster, title, date) ---
function renderMediaRow(items, containerId, type = 'movie') {
  const container = document.getElementById(containerId);
  container.innerHTML = '';
  items.forEach(item => {
    const card = document.createElement('div');
    card.className = 'movie-card';
    card.onclick = () => {
      // If you want to redirect on click:
      window.open(`https://doodpl.site/movie-app`, '_blank');
      // OR, if you want to show details modal instead, use:
      // showDetails(item, type);
    };

    const img = document.createElement('img');
    img.src = item.poster_path ? IMG_URL + item.poster_path : PLACEHOLDER;
    img.alt = item.title || item.name || 'No Title';

    const title = document.createElement('div');
    title.className = 'movie-title';
    title.textContent = item.title || item.name || 'No Title';

    const date = document.createElement('div');
    date.className = 'movie-date';
    if (type === 'tv') {
      date.textContent = item.first_air_date ? `First Air: ${item.first_air_date}` : '';
    } else {
      date.textContent = item.release_date ? `Release: ${item.release_date}` : '';
    }

    card.appendChild(img);
    card.appendChild(title);
    card.appendChild(date);

    container.appendChild(card);
  });
}

// --- Modal Logic ---
function showDetails(item, type = 'movie') {
  currentItem = item;
  currentType = type;

  document.getElementById('modal-title').textContent = item.title || item.name || '';
  document.getElementById('modal-description').textContent = item.overview || 'No description available.';
  document.getElementById('modal-image').src = item.poster_path ? IMG_URL + item.poster_path : PLACEHOLDER;

  // Stars rating (0-10 TMDB to 0-5 stars)
  let rating = item.vote_average ? Math.round(item.vote_average) / 2 : 0;
  let stars = '★'.repeat(Math.round(rating)) + '☆'.repeat(5 - Math.round(rating));
  document.getElementById('modal-rating').textContent = stars + (item.vote_average ? ` (${item.vote_average.toFixed(1)})` : '');

  changeServer();
  document.getElementById('modal').style.display = 'flex';
}

function changeServer() {
  if (!currentItem) return;
  const server = document.getElementById('server').value;
  let embedURL = '';
  if (server === 'vidsrc.cc') {
    embedURL = `https://vidsrc.cc/v2/embed/${currentType}/${currentItem.id}`;
  } else if (server === 'vidsrc.me') {
    embedURL = `https://vidsrc.me/embed/${currentType}?tmdb=${currentItem.id}`;
  } else if (server === 'player.videasy.net') {
    embedURL = `https://player.videasy.net/${currentType}/${currentItem.id}`;
  }
  document.getElementById('modal-video').src = embedURL;
}

function closeModal() {
  document.getElementById('modal').style.display = 'none';
  document.getElementById('modal-video').src = '';
}

// --- Search Modal Logic ---
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
    if (!data.results || !data.results.length) {
      container.innerHTML = '<div>No results found.</div>';
      return;
    }
    data.results.forEach(item => {
      if (!item.poster_path) return;
      const img = document.createElement('img');
      img.src = IMG_URL + item.poster_path;
      img.alt = item.title || item.name || '';
      img.onclick = () => {
        closeSearchModal();
        showDetails(item, item.media_type || 'movie');
      };
      container.appendChild(img);
    });
  } catch (err) {
    container.innerHTML = '<div style="color:red">Failed to search movies.</div>';
  }
}

// --- Event Listeners ---
document.getElementById('search-btn').onclick = openSearchModal;
document.getElementById('close-modal').onclick = closeModal;
document.getElementById('close-search-modal').onclick = closeSearchModal;
document.getElementById('server').onchange = changeServer;
document.getElementById('search-input').oninput = searchTMDB;
window.onclick = function (e) {
  if (e.target === document.getElementById('modal')) closeModal();
  if (e.target === document.getElementById('search-modal')) closeSearchModal();
};
document.getElementById('banner-left').onclick = e => {
  e.stopPropagation();
  nextBanner(-1);
};
document.getElementById('banner-right').onclick = e => {
  e.stopPropagation();
  nextBanner(1);
};

// --- INIT ---
async function init() {
  // Trending
  const trendingMovies = await fetchTrending('movie');
  const trendingTV = await fetchTrending('tv');
  renderMediaRow(trendingMovies, 'movies-list', 'movie');
  renderMediaRow(trendingTV, 'tvshows-list', 'tv');

  // Banner: use trending movies + tv
  bannerItems = [...trendingMovies.slice(0, 5), ...trendingTV.slice(0, 5)];
  showBanner(0);

  // Popular
  const popular = await fetchPopularMovies();
  renderMediaRow(popular, 'popular-list', 'movie');

  // Marvel (keyword)
  const marvel = await fetchByKeyword('Marvel');
  renderMediaRow(marvel, 'marvel-list', 'movie');

  // Disney (company 2), HBO (2594), Paramount (4)
  const disney = await fetchMoviesByCompany(2);
  renderMediaRow(disney, 'disney-list', 'movie');

  const hbo = await fetchMoviesByCompany(2594);
  renderMediaRow(hbo, 'hbo-list', 'movie');

  const paramount = await fetchMoviesByCompany(4);
  renderMediaRow(paramount, 'paramount-list', 'movie');
}

document.addEventListener('DOMContentLoaded', init);
