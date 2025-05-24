const API_KEY = 'a1e72fd93ed59f56e6332813b9f8dcae';
const BASE_URL = 'https://api.themoviedb.org/3';
const IMG_URL = 'https://image.tmdb.org/t/p/w500';

let currentItem = null;
let bannerItems = [];
let currentBannerIndex = 0;
let bannerInterval = null;

// --- API Fetch Utilities ---

async function fetchJSON(url) {
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    return await res.json();
  } catch (error) {
    console.error('Fetch error:', error);
    return { results: [] };
  }
}

function trendingUrl(type, period = 'day') {
  return `${BASE_URL}/trending/${type}/${period}?api_key=${API_KEY}`;
}
function companyUrl(companyId) {
  return `${BASE_URL}/discover/movie?api_key=${API_KEY}&with_companies=${companyId}&sort_by=popularity.desc`;
}
function networkUrl(networkId) {
  return `${BASE_URL}/discover/movie?api_key=${API_KEY}&with_networks=${networkId}&sort_by=popularity.desc`;
}
function tvByNetworkUrl(networkId) {
  return `${BASE_URL}/discover/tv?api_key=${API_KEY}&with_networks=${networkId}&sort_by=popularity.desc`;
}
function tvByCompanyUrl(companyId) {
  return `${BASE_URL}/discover/tv?api_key=${API_KEY}&with_companies=${companyId}&sort_by=popularity.desc`;
}

// --- Fetch Data ---

async function fetchTrending(type, period = 'day') {
  const data = await fetchJSON(trendingUrl(type, period));
  return data.results;
}
async function fetchMoviesByCompany(companyId) {
  const data = await fetchJSON(companyUrl(companyId));
  return data.results;
}
async function fetchMoviesByNetwork(networkId) {
  const data = await fetchJSON(networkUrl(networkId));
  return data.results;
}
async function fetchtvshowsByNetwork(networkId) {
  const data = await fetchJSON(tvByNetworkUrl(networkId));
  return data.results;
}
async function fetchtvshowsByCompany(companyId) {
  const data = await fetchJSON(tvByCompanyUrl(companyId));
  return data.results;
}

// --- UI Display Functions ---

function displayBanner(item) {
  const bannerElement = document.getElementById('banner');
  const bannerTitle = document.getElementById('banner-title');
  const bannerDescription = document.getElementById('banner-description');
  bannerElement.style.opacity = 0;
  bannerTitle.style.opacity = 0;
  bannerDescription.style.opacity = 0;

  setTimeout(() => {
    bannerElement.style.backgroundImage = item.backdrop_path
      ? `url(${IMG_URL}${item.backdrop_path})`
      : '';
    bannerTitle.textContent = item.title || item.name || '';
    bannerDescription.textContent = item.overview || '';
    currentItem = item;
    bannerElement.style.opacity = 1;
    bannerTitle.style.opacity = 1;
    bannerDescription.style.opacity = 1;
  }, 500);
}

function updateBannerDots() {
  const dotsContainer = document.getElementById('banner-nav-dots');
  if (!dotsContainer) return;
  dotsContainer.innerHTML = '';
  bannerItems.forEach((_, idx) => {
    const dot = document.createElement('div');
    dot.className = 'dot' + (idx === currentBannerIndex ? ' active' : '');
    dot.tabIndex = 0;
    dot.setAttribute('aria-label', `Go to banner ${idx + 1}`);
    dot.onclick = () => {
      clearInterval(bannerInterval);
      currentBannerIndex = idx;
      displayBanner(bannerItems[currentBannerIndex]);
      updateBannerDots();
      startBannerSlideshow();
    };
    dotsContainer.appendChild(dot);
  });
}

function startBannerSlideshow() {
  clearInterval(bannerInterval);
  bannerInterval = setInterval(() => {
    currentBannerIndex = (currentBannerIndex + 1) % bannerItems.length;
    displayBanner(bannerItems[currentBannerIndex]);
    updateBannerDots();
  }, 8000);
}

function displayList(items, containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = '';
  items.forEach(item => {
    if (!item.poster_path) return;
    const img = document.createElement('img');
    img.src = `${IMG_URL}${item.poster_path}`;
    img.alt = item.title || item.name || 'Poster';
    img.tabIndex = 0;
    img.onclick = () => showDetails(item);
    img.onkeypress = e => { if (e.key === 'Enter') showDetails(item); };
    container.appendChild(img);
  });
}

function showDetails(item) {
  currentItem = item;
  document.getElementById('modal-title').textContent = item.title || item.name || '';
  document.getElementById('modal-description').textContent = item.overview || '';
  document.getElementById('modal-image').src = item.poster_path ? `${IMG_URL}${item.poster_path}` : '';
  const rating = Math.round((item.vote_average || 0) / 2);
  document.getElementById('modal-rating').innerHTML =
    '★'.repeat(rating) + '☆'.repeat(5 - rating);
  changeServer();
  document.getElementById('modal').style.display = 'flex';
}

function changeServer() {
  const server = document.getElementById('server').value;
  if (!currentItem) return;
  const type = currentItem.media_type === "movie" ? "movie" : "tv";
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

// --- Search Modal Functions ---

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
  const query = document.getElementById('search-input').value.trim();
  if (!query) {
    document.getElementById('search-results').innerHTML = '';
    return;
  }
  const data = await fetchJSON(`${BASE_URL}/search/multi?api_key=${API_KEY}&query=${encodeURIComponent(query)}`);
  const container = document.getElementById('search-results');
  container.innerHTML = '';
  data.results.forEach(item => {
    if (item.poster_path && (item.media_type === 'movie' || item.media_type === 'tv')) {
      const img = document.createElement('img');
      img.src = `${IMG_URL}${item.poster_path}`;
      img.alt = item.title || item.name || 'Poster';
      img.tabIndex = 0;
      img.onclick = () => {
        closeSearchModal();
        showDetails(item);
      };
      img.onkeypress = e => { if (e.key === 'Enter') { closeSearchModal(); showDetails(item); } };
      container.appendChild(img);
    }
  });
}

// --- Page Initialization ---

async function init() {
  // For index.html
  const [movies, tvShows, weeklyTrendMovie, hboMovies, netflixMovies, marvelMovies, disneyMovies] = await Promise.all([
    fetchTrending('movie'),
    fetchTrending('tv'),
    fetchTrending('movie', 'week'),
    fetchMoviesByCompany(3268), // HBO
    fetchMoviesByNetwork(213),  // Netflix
    fetchMoviesByCompany(420),  // Marvel Studios
    fetchMoviesByCompany(2),    // Disney
  ]);

  // Banner: mix top 5 movies + 5 TV shows
  bannerItems = [...(movies || []).slice(0, 5), ...(tvShows || []).slice(0, 5)];
  if (bannerItems.length > 0) {
    displayBanner(bannerItems[currentBannerIndex]);
    updateBannerDots();
    startBannerSlideshow();
  }

  displayList(movies, 'movies-list');
  displayList(tvShows, 'tvshows-list');
  displayList(weeklyTrendMovie, 'weekly-trend-movie-list');
  displayList(hboMovies, 'hbo-movies-list');
  displayList(netflixMovies, 'netflix-movies-list');
  displayList(marvelMovies, 'marvel-movies-list');
  displayList(disneyMovies, 'disney-movies-list');

  // Header scroll effect
  window.addEventListener('scroll', () => {
    const header = document.querySelector('.header');
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  });
}

// --- Other page initializations ---

async function initMoviesPage() {
  const [movies, hboMovies, marvelMovies, disneyMovies, netflixMovies] = await Promise.all([
    fetchTrending('movie'),
    fetchMoviesByCompany(3268),
    fetchMoviesByCompany(420),
    fetchMoviesByCompany(2),
    fetchMoviesByNetwork(213),
  ]);
  displayList(movies, 'movies-list');
  displayList(hboMovies, 'hbo-movies-list');
  displayList(marvelMovies, 'marvel-movies-list');
  displayList(disneyMovies, 'disney-movies-list');
  displayList(netflixMovies, 'netflix-movies-list');
}

async function initTvShowsPage() {
  const [tvshows, hboTvShows, netflixTvShows, disneyTvShows] = await Promise.all([
    fetchTrending('tv'),
    fetchTvShowsByNetwork(49),     // HBO
    fetchTvShowsByNetwork(213),    // Netflix
    fetchTvShowsByCompany(2),      // Disney
  ]);
  displayList(tvshows, 'tvshows-list');
  displayList(hboTvShows, 'hbo-tvshows-list');
  displayList(netflixTvShows, 'netflix-tvshows-list');
  displayList(disneyTvShows, 'disney-tvshows-list');
}

// --- DOMContentLoaded entrypoint ---

document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('banner')) {
    init();
  } else if (document.getElementById('movies-list') && document.title.includes('Movies')) {
    initMoviesPage();
  } else if (document.getElementById('tvshows-list')) {
    initTvShowsPage();
  }
});
