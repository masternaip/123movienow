const API_KEY = 'a1e72fd93ed59f56e6332813b9f8dcae'; // Your TMDb API Key
const BASE_URL = 'https://api.themoviedb.org/3';
const IMG_URL = 'https://image.tmdb.org/t/p/w500';
let currentItem; // To store the currently selected item for modal details

// === FETCH FUNCTIONS ===

async function fetchTrending(mediaType = 'tv') {
  const url = `${BASE_URL}/trending/${mediaType}/week?api_key=${API_KEY}`;
  const res = await fetch(url);
  const data = await res.json();
  return data.results;
}

async function fetchTVShowsByNetwork(networkId) {
  const url = `${BASE_URL}/discover/tv?api_key=${API_KEY}&with_networks=${networkId}&sort_by=popularity.desc`;
  const res = await fetch(url);
  const data = await res.json();
  return data.results;
}

async function fetchTVShowsByCompany(companyId) {
  const url = `${BASE_URL}/discover/tv?api_key=${API_KEY}&with_companies=${companyId}&sort_by=popularity.desc`;
  const res = await fetch(url);
  const data = await res.json();
  return data.results;
}

// === RENDER FUNCTIONS ===

function displayList(items, targetDivId) {
  const container = document.getElementById(targetDivId);
  if (!container) return;
  container.innerHTML = '';
  if (!items || items.length === 0) {
    container.innerHTML = '<p style="color:#fff;">No results found.</p>';
    return;
  }
  items.forEach(show => {
    const div = document.createElement('div');
    div.classList.add('movie-item'); // Add style in your CSS if needed
    div.innerHTML = `
      <img 
        src="${show.poster_path ? IMG_BASE + show.poster_path : 'https://via.placeholder.com/150x220?text=No+Image'}"
        alt="${show.name || show.title || 'TV Show'}"
        title="${show.name || show.title || 'TV Show'}"
        onclick="openModal(${encodeURIComponent(JSON.stringify(show))})"
      />
    `;
    container.appendChild(div);
  });
}

// === MODAL FUNCTIONS ===

window.openModal = function(showString) {
  const show = JSON.parse(decodeURIComponent(showString));
  document.getElementById('modal-image').src = show.poster_path ? IMG_BASE + show.poster_path : 'https://via.placeholder.com/180x270?text=No+Image';
  document.getElementById('modal-title').textContent = show.name || show.title || '';
  document.getElementById('modal-description').textContent = show.overview || 'No description available.';
  document.getElementById('modal-rating').textContent = show.vote_average ? `⭐ ${show.vote_average}` : '';
  
  // Set default video server URL (for demonstration; replace logic as needed)
  const server = document.getElementById('server').value;
  setModalVideo(server, show);

  document.getElementById('modal').style.display = 'flex';
};

window.closeModal = function() {
  document.getElementById('modal').style.display = 'none';
  document.getElementById('modal-video').src = '';
};

// If you want to allow changing server, add logic here
window.changeServer = function() {
  // Get show title from modal
  const showTitle = document.getElementById('modal-title').textContent;
  const server = document.getElementById('server').value;
  setModalVideo(server, { name: showTitle });
};

function setModalVideo(server, show) {
  // This is a placeholder: Replace with your actual embed logic or API
  // For demonstration, just use search query links
  const q = encodeURIComponent(show.name || show.title || '');
  let src = '';
  if (server === 'vidsrc.cc') {
    src = `https://vidsrc.to/embed/tv?title=${q}`;
  } else if (server === 'vidsrc.me') {
    src = `https://vidsrc.me/embed/tv?title=${q}`;
  } else if (server === 'player.videasy.net') {
    src = `https://player.videasy.net/search?title=${q}`;
  }
  document.getElementById('modal-video').src = src;
}

// === INIT SCRIPT ===

async function initTVShowsPage() {
  const tvshows = await fetchTrending('tv'); // Trending TV shows
  const hboTVShows = await fetchTVShowsByNetwork(49);      // HBO (Network ID: 49)
  const marvelTVShows = await fetchTVShowsByCompany(420);   // Marvel Studios (Company ID: 420)
  const disneyTVShows = await fetchTVShowsByCompany(2);     // Walt Disney (Company ID: 2)
  const netflixTVShows = await fetchTVShowsByNetwork(213);  // Netflix (Network ID: 213)

  displayList(tvshows, 'tvshows-list');
  displayList(hboTVShows, 'hbo-tvshows-list');
  displayList(marvelTVShows, 'marvel-tvshows-list');
  displayList(disneyTVShows, 'disney-tvshows-list');
  displayList(netflixTVShows, 'netflix-tvshows-list');
}

document.addEventListener('DOMContentLoaded', initTVShowsPage);
