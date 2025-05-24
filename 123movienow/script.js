// ==== Configuration ====
const API_KEY = 'a1e72fd93ed59f56e6332813b9f8dcae'; // Your TMDb API Key
const BASE_URL = 'https://api.themoviedb.org/3';
const IMG_URL = 'https://image.tmdb.org/t/p/w500';
const FALLBACK_IMG = 'https://via.placeholder.com/300x450?text=No+Image';

// ==== GLOBALS ====
window.currentItem = null; // Used for server switching in modal

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

  window.currentItem = movie; // So Play/Info buttons work
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
  const isMovie = !!item.title;
  const id = item.id;
  let embedUrl = '';
  if (isMovie) {
    embedUrl = `https://${server}/embed/movie?tmdb=${id}`;
  } else {
    embedUrl = `https://${server}/embed/tv?tmdb=${id}`;
  }
  modalVideo.src = embedUrl;
  modal.style.display = "flex";
}
function changeServer() {
  const server = document.getElementById('server')?.value;
  const item = window.currentItem;
  const modalVideo = document.getElementById('modal-video');
  if (!server || !item || !modalVideo) return;
  const isMovie = !!item.title;
  const id = item.id;
  let embedUrl = '';
  if (isMovie) {
    embedUrl = `https://${server}/embed/movie?tmdb=${id}`;
  } else {
    embedUrl = `https://${server}/embed/tv?tmdb=${id}`;
  }
  modalVideo.src = embedUrl;
}
function closeModal() {
  const modal = document.getElementById('modal');
  const modalVideo = document.getElementById('modal-video');
  if (modal) modal.style.display = 'none';
  if (modalVideo) modalVideo.src = '';
}

// Close modal on Escape key
document.addEventListener('keydown', function (e) {
  if (e.key === 'Escape') closeModal();
});

// Close modal on clicking background
document.getElementById('modal')?.addEventListener('click', function (e) {
  if (e.target === this) closeModal();
});

// ==== Page Initialization ====
window.addEventListener('DOMContentLoaded', async () => {
  // Trending Movies
  const movies = await fetchTrending('movie');
  displayList(movies, 'movies-list');
  if (movies && movies.length > 0) {
    updateBanner(movies[0]);
  }

  // Trending TV Shows
  const tvshows = await fetchTrending('tv');
  displayList(tvshows, 'tvshows-list');

  // Weekly Trend Movie (using trending movies again)
  const weeklyTrendMovies = await fetchTrending('movie');
  displayList(weeklyTrendMovies, 'weekly-trend-movie-list');

  // Top HBO Movies (companyId: 3268)
  const hboMovies = await fetchMoviesByCompany(3268);
  displayList(hboMovies, 'hbo-movies-list');

  // Top Netflix Movies (networkId: 213)
  const netflixMovies = await fetchMoviesByNetwork(213);
  displayList(netflixMovies, 'netflix-movies-list');

  // Top Marvel Movies (companyId: 420)
  const marvelMovies = await fetchMoviesByCompany(420);
  displayList(marvelMovies, 'marvel-movies-list');

  // Top Disney Movies (companyId: 2)
  const disneyMovies = await fetchMoviesByCompany(2);
  displayList(disneyMovies, 'disney-movies-list');
});

// ==== Search Modal Placeholders ====
function openSearchModal() {
  document.getElementById('search-modal').style.display = 'flex';
}
function closeSearchModal() {
  document.getElementById('search-modal').style.display = 'none';
}
function searchTMDB() {
  // Placeholder for search logic
  alert('Search functionality not implemented yet.');
}
