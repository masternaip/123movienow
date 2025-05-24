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

async function fetchTVByGenre(genreId) {
  return fetchFromTmdb(`${BASE_URL}/discover/tv?api_key=${API_KEY}&with_genres=${genreId}&sort_by=popularity.desc`);
}

async function fetchPopularMovies() {
  return fetchFromTmdb(`${BASE_URL}/movie/popular?api_key=${API_KEY}`);
}

async function fetchUpcomingMovies() {
  return fetchFromTmdb(`${BASE_URL}/movie/upcoming?api_key=${API_KEY}`);
}

async function fetchNowPlayingMovies() {
  return fetchFromTmdb(`${BASE_URL}/movie/now_playing?api_key=${API_KEY}`);
}

async function fetchMoviesByYear(year) {
  return fetchFromTmdb(`${BASE_URL}/discover/movie?api_key=${API_KEY}&primary_release_year=${year}&sort_by=popularity.desc`);
}

async function fetchPopularTVShows() {
  return fetchFromTmdb(`${BASE_URL}/tv/popular?api_key=${API_KEY}`);
}

async function fetchTrendingTVShows() {
  return fetchFromTmdb(`${BASE_URL}/trending/tv/week?api_key=${API_KEY}`);
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

// (Optional) Close modal on clicking background (if modal uses a backdrop)
document.getElementById('modal')?.addEventListener('click', function (e) {
  if (e.target === this) closeModal();
});

// ==== Example Usage ====
// Example: Display popular movies on page load
// fetchPopularMovies().then(movies => displayList(movies, 'movies-container'));
