// ==== Configuration ====
const API_KEY = 'a1e72fd93ed59f56e6332813b9f8dcae';
const BASE_URL = 'https://api.themoviedb.org/3';
const IMG_URL = 'https://image.tmdb.org/t/p/w780';
const FALLBACK_IMG = 'https://via.placeholder.com/300x450?text=No+Image';

// ==== Banner Rotation Globals ====
let bannerMovies = [];
let bannerIndex = 0;
let bannerInterval = null;

// ==== Modal State ====
window.currentItem = null;

// ==== Fetch Functions ====
async function fetchFromTmdb(endpoint) {
  try {
    const res = await fetch(endpoint);
    if (!res.ok) throw new Error('Network response was not ok');
    const data = await res.json();
    return data.results || [];
  } catch (error) {
    console.error('TMDb fetch error:', error);
    return [];
  }
}

async function fetchTrending(type = 'movie') {
  return fetchFromTmdb(`${BASE_URL}/trending/${type}/week?api_key=${API_KEY}`);
}
async function fetchMoviesByCompany(companyId) {
  return fetchFromTmdb(`${BASE_URL}/discover/movie?api_key=${API_KEY}&with_companies=${companyId}&sort_by=popularity.desc`);
}
async function fetchMoviesByNetwork(networkId) {
  return fetchFromTmdb(`${BASE_URL}/discover/movie?api_key=${API_KEY}&with_networks=${networkId}&sort_by=popularity.desc`);
}
async function searchTMDb(query) {
  const movieResults = await fetchFromTmdb(`${BASE_URL}/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(query)}`);
  const tvResults = await fetchFromTmdb(`${BASE_URL}/search/tv?api_key=${API_KEY}&query=${encodeURIComponent(query)}`);
  // Add media_type for identification
  movieResults.forEach(r => r.media_type = 'movie');
  tvResults.forEach(r => r.media_type = 'tv');
  return [...movieResults, ...tvResults];
}

// ==== Render Functions ====
function displayList(items, containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = '';
  items.forEach(item => {
    const img = document.createElement('img');
    img.src = item.poster_path 
      ? IMG_URL + item.poster_path 
      : item.backdrop_path 
        ? IMG_URL + item.backdrop_path 
        : FALLBACK_IMG;
    img.alt = item.title || item.name || 'Movie Poster';
    img.loading = 'lazy';
    img.onerror = () => { img.src = FALLBACK_IMG; };
    img.onclick = () => showDetails(item);
    container.appendChild(img);
  });
}

// ==== Banner Functions ====
function updateBanner(movie) {
  const banner = document.getElementById('banner');
  const bannerTitle = document.getElementById('banner-title');
  const bannerDesc = document.getElementById('banner-description');
  if (!banner || !bannerTitle || !bannerDesc) return;

  bannerTitle.textContent = movie.title || movie.name || 'Untitled';
  bannerDesc.textContent = movie.overview || 'No description available.';
  banner.style.backgroundImage = movie.backdrop_path
      ? `url(${IMG_URL + movie.backdrop_path})`
      : movie.poster_path
        ? `url(${IMG_URL + movie.poster_path})`
        : 'none';

  window.currentItem = movie;
  updateBannerDots();
}

function updateBannerDots() {
  const dotsContainer = document.getElementById('banner-nav-dots');
  if (!dotsContainer) return;
  dotsContainer.innerHTML = '';
  bannerMovies.forEach((_, idx) => {
    const dot = document.createElement('span');
    dot.className = 'dot' + (idx === bannerIndex ? ' active' : '');
    dot.onclick = () => showBannerAt(idx);
    dotsContainer.appendChild(dot);
  });
}

function showBannerAt(idx) {
  if (bannerMovies.length === 0) return;
  bannerIndex = idx;
  updateBanner(bannerMovies[bannerIndex]);
  restartBannerRotation();
}

function startBannerRotation() {
  if (bannerInterval) clearInterval(bannerInterval);
  bannerInterval = setInterval(() => {
    if (bannerMovies.length === 0) return;
    bannerIndex = (bannerIndex + 1) % bannerMovies.length;
    updateBanner(bannerMovies[bannerIndex]);
  }, 5000);
}
function restartBannerRotation() {
  startBannerRotation();
}

// ==== Video Server Embed URL ====
function getEmbedURL(server, currentItem) {
  const type = currentItem.media_type
    ? (currentItem.media_type === "movie" ? "movie" : "tv")
    : (currentItem.title ? "movie" : "tv");

  let embedURL = "";
  if (server === "vidsrc.cc") {
    embedURL = `https://vidsrc.cc/v2/embed/${type}/${currentItem.id}`;
  } else if (server === "vidsrc.me" || server === "vidsrc.net") {
    embedURL = `https://vidsrc.net/embed/${type}/?tmdb=${currentItem.id}`;
  } else if (server === "player.videasy.net") {
    embedURL = `https://player.videasy.net/${type}/${currentItem.id}`;
  }
  return embedURL;
}

// ==== Modal Functions ====
function showDetails(item) {
  window.currentItem = item;
  const modalTitle = document.getElementById('modal-title');
  const modalDesc = document.getElementById('modal-description');
  const modalRating = document.getElementById('modal-rating');
  const modalImage = document.getElementById('modal-image');
  const modalVideo = document.getElementById('modal-video');
  const modal = document.getElementById('modal');
  const serverSelect = document.getElementById('server');
  if (!modalTitle || !modalDesc || !modalRating || !modalImage || !modalVideo || !modal || !serverSelect) return;
  modalTitle.textContent = item.title || item.name || 'Untitled';
  modalDesc.textContent = item.overview || 'No description available.';
  modalRating.textContent = "⭐ " + (item.vote_average || "N/A");
  modalImage.src = item.poster_path 
    ? IMG_URL + item.poster_path 
    : item.backdrop_path 
      ? IMG_URL + item.backdrop_path 
      : FALLBACK_IMG;

  const server = serverSelect.value;
  modalVideo.src = getEmbedURL(server, item);
  document.getElementById('video-error-message')?.style.setProperty('display', 'none');
  modal.style.display = "flex";
}

function changeServer() {
  const server = document.getElementById('server').value;
  const modalVideo = document.getElementById('modal-video');
  if (!window.currentItem || !modalVideo) return;
  modalVideo.src = getEmbedURL(server, window.currentItem);
  document.getElementById('video-error-message')?.style.setProperty('display', 'none');
}
function closeModal() {
  const modal = document.getElementById('modal');
  const modalVideo = document.getElementById('modal-video');
  if (modal) modal.style.display = 'none';
  if (modalVideo) modalVideo.src = '';
}
document.getElementById('modal-video')?.addEventListener('error', function () {
  const errMsg = document.getElementById('video-error-message');
  if (errMsg) errMsg.style.display = 'block';
});
document.addEventListener('keydown', function (e) {
  if (e.key === 'Escape') closeModal();
});
document.getElementById('modal')?.addEventListener('click', function (e) {
  if (e.target === this) closeModal();
});

// ==== Page Initialization ====
window.addEventListener('DOMContentLoaded', async () => {
  // Banner movies (Trending)
  bannerMovies = await fetchTrending('movie');
  if (bannerMovies && bannerMovies.length > 0) {
    bannerIndex = 0;
    updateBanner(bannerMovies[bannerIndex]);
    startBannerRotation();
  }
  const movies = bannerMovies;
  displayList(movies, 'movies-list');
  const tvshows = await fetchTrending('tv');
  displayList(tvshows, 'tvshows-list');
  displayList(movies, 'weekly-trend-movie-list');
  const hboMovies = await fetchMoviesByCompany(3268);
  displayList(hboMovies, 'hbo-movies-list');
  const netflixMovies = await fetchMoviesByNetwork(213);
  displayList(netflixMovies, 'netflix-movies-list');
  const marvelMovies = await fetchMoviesByCompany(420);
  displayList(marvelMovies, 'marvel-movies-list');
  const disneyMovies = await fetchMoviesByCompany(2);
  displayList(disneyMovies, 'disney-movies-list');
});

// ==== Search Modal ====
function openSearchModal() {
  document.getElementById('search-modal').style.display = 'flex';
  document.getElementById('search-input').focus();
}
function closeSearchModal() {
  document.getElementById('search-modal').style.display = 'none';
  document.getElementById('search-results').innerHTML = '';
}
async function searchTMDB() {
  const query = document.getElementById('search-input').value.trim();
  const resultsDiv = document.getElementById('search-results');
  if (!query) {
    resultsDiv.innerHTML = '<p>Please enter a search term.</p>';
    return;
  }
  resultsDiv.innerHTML = '<p>Searching...</p>';
  const results = await searchTMDb(query);
  if (!results.length) {
    resultsDiv.innerHTML = '<p>No results found.</p>';
    return;
  }
  resultsDiv.innerHTML = '';
  results.forEach(item => {
    const div = document.createElement('div');
    div.className = 'search-result-item';
    div.innerHTML = `
      <img src="${item.poster_path ? IMG_URL + item.poster_path : FALLBACK_IMG}" alt="${item.title || item.name || 'Poster'}" />
      <div>
        <strong>${item.title || item.name || 'Untitled'}</strong> <span style="font-size:0.9em;color:#888;">(${item.media_type === 'movie' ? 'Movie' : 'TV'})</span>
        <p style="font-size:0.95em;">${item.overview ? item.overview.substring(0, 120) + '...' : 'No description.'}</p>
      </div>
    `;
    div.onclick = () => {
      closeSearchModal();
      showDetails(item);
    };
    resultsDiv.appendChild(div);
  });
}
document.getElementById('search-input')?.addEventListener('keydown', function(e){
  if(e.key === 'Enter') searchTMDB();
});
