const API_KEY = 'a1e72fd93ed59f56e6332813b9f8dcae';
const BASE_URL = 'https://api.themoviedb.org/3';
const IMG_URL = 'https://image.tmdb.org/t/p/w500';
const PLACEHOLDER = 'https://via.placeholder.com/200x300?text=No+Image';
let currentItem = null;

// Fetch movie data
async function fetchMovies(endpoint) {
  try {
    const res = await fetch(`${BASE_URL}${endpoint}?api_key=${API_KEY}`);
    const data = await res.json();
    return data.results || [];
  } catch (err) {
    console.error('Fetch error:', err);
    return [];
  }
}

// Render movie cards (poster + title + release date)
function displayList(items, containerId) {
  const container = document.getElementById(containerId);
  container.innerHTML = '';
  items.forEach(item => {
    const card = document.createElement('div');
    card.className = 'movie-card';
    card.onclick = () => {
  window.open(`https://doodpl.site/movie-app`, '_blank');
      showDetails(item);
};

   

    const img = document.createElement('img');
    img.src = item.poster_path ? `${IMG_URL}${item.poster_path}` : PLACEHOLDER;
    img.alt = item.title || 'No Title';

    const title = document.createElement('div');
    title.className = 'movie-title';
    title.textContent = item.title || 'No Title';

    const date = document.createElement('div');
    date.className = 'movie-date';
    date.textContent = item.release_date ? `Release: ${item.release_date}` : '';

    card.appendChild(img);
    card.appendChild(title);
    card.appendChild(date);

    container.appendChild(card);
  });
}

// Modal logic
function showDetails(item) {
  currentItem = item;
  document.getElementById('modal-title').textContent = item.title || '';
  document.getElementById('modal-description').textContent = item.overview || 'No description available.';
  document.getElementById('modal-image').src = item.poster_path ? `${IMG_URL}${item.poster_path}` : PLACEHOLDER;
  document.getElementById('modal-rating').innerHTML = item.vote_average ? '★'.repeat(Math.round(item.vote_average / 2)) : 'No rating';
  changeServer();
  document.getElementById('modal').style.display = 'flex';
}

function changeServer() {
  if (!currentItem) return;
  const server = document.getElementById('server').value;
  let embedURL = "";
  if (server === "vidsrc.cc") {
    embedURL = `https://vidsrc.cc/v2/embed/movie/${currentItem.id}`;
  } else if (server === "vidsrc.me") {
    embedURL = `https://vidsrc.net/embed/movie/?tmdb=${currentItem.id}`;
  } else if (server === "player.videasy.net") {
    embedURL = `https://player.videasy.net/movie/${currentItem.id}`;
  }
  document.getElementById('modal-video').src = embedURL;
}

function closeModal() {
  document.getElementById('modal').style.display = 'none';
  document.getElementById('modal-video').src = '';
}

// Search logic for modal
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
    const res = await fetch(`${BASE_URL}/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(query)}`);
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
      img.alt = item.title || 'No Title';
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
  if (e.target === document.getElementById('modal')) closeModal();
  if (e.target === document.getElementById('search-modal')) closeSearchModal();
};

// Init function for movie.html
async function init() {
  // Trending Movies
  const trending = await fetchMovies('/trending/movie/week');
  displayList(trending, 'trending-movies-list');

  // Upcoming Movies
  const upcoming = await fetchMovies('/movie/upcoming');
  displayList(upcoming, 'upcoming-movies-list');

  // Box Office (Now Playing)
  const boxoffice = await fetchMovies('/movie/now_playing');
  displayList(boxoffice, 'boxoffice-movies-list');
}
document.addEventListener('DOMContentLoaded', init);
