// global.js
// Shared constants and functions for index.html and movies.html

const API_KEY = 'a1e72fd93ed59f56e6332813b9f8dcae';
const BASE_URL = 'https://api.themoviedb.org/3';
const IMG_URL = 'https://image.tmdb.org/t/p/w500';

window.currentItem = null; // Used by showDetails and changeServer

/**
 * Fetch media (movies/TV shows) from TMDb.
 * @param {string} endpoint - TMDb API endpoint (e.g. 'trending/movie/day')
 * @param {string} [queryParams=''] - Additional query params (e.g. '&with_genres=28')
 * @returns {Promise<Array>} - Array of results
 */
async function fetchMedia(endpoint, queryParams = '') {
  try {
    const res = await fetch(`${BASE_URL}/${endpoint}?api_key=${API_KEY}${queryParams}`);
    if (!res.ok) {
      const errorBody = await res.text();
      throw new Error(`HTTP error! Status: ${res.status}, Body: ${errorBody}`);
    }
    const data = await res.json();
    return data.results || data.items || [];
  } catch (error) {
    console.error(`Error fetching data from ${endpoint}:`, error);
    return [];
  }
}

/**
 * Display a list of media items as images inside a container.
 * @param {Array} items - Array of media objects
 * @param {string} containerId - Container element ID
 */
function displayList(items, containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = '';

  items.forEach(item => {
    if (!item.poster_path) return;

    const img = document.createElement('img');
    img.src = `${IMG_URL}${item.poster_path}`;
    img.alt = item.title || item.name || 'Poster';
    img.onerror = function() {
      this.src = 'https://placehold.co/500x750/000000/FFFFFF?text=No+Image';
      this.alt = 'Image not available';
    };
    img.onclick = () => showDetails(item);
    container.appendChild(img);
  });
}

/**
 * Show detail modal for a media item.
 * @param {Object} item - Movie or TV show object
 */
function showDetails(item) {
  window.currentItem = item;

  document.getElementById('modal-title').textContent = item.title || item.name || 'Title Not Available';
  document.getElementById('modal-description').textContent = item.overview || 'No overview available.';
  document.getElementById('modal-image').src = `${IMG_URL}${item.poster_path}`;
  document.getElementById('modal-image').onerror = function() {
    this.src = 'https://placehold.co/500x750/000000/FFFFFF?text=No+Image';
  };

  // Display star rating (TMDb 0-10, convert to 0-5 stars)
  const rating = Math.round((item.vote_average || 0) / 2);
  document.getElementById('modal-rating').innerHTML =
    '★'.repeat(rating) + '☆'.repeat(5 - rating);

  changeServer();
  document.getElementById('modal').style.display = 'flex';
}

/**
 * Update video iframe based on selected server.
 */
function changeServer() {
  const serverSelect = document.getElementById('server');
  const modalVideo = document.getElementById('modal-video');
  if (!serverSelect || !modalVideo) return;

  if (!window.currentItem || !window.currentItem.id) {
    modalVideo.src = '';
    return;
  }

  const type = window.currentItem.media_type === "movie" ? "movie" : "tv";
  let embedURL = "";
  switch (serverSelect.value) {
    case "vidsrc.cc":
      embedURL = `https://vidsrc.cc/v2/embed/${type}/${window.currentItem.id}`;
      break;
    case "vidsrc.me":
      embedURL = `https://vidsrc.net/embed/${type}/?tmdb=${window.currentItem.id}`;
      break;
    case "player.videasy.net":
      embedURL = `https://player.videasy.net/${type}/${window.currentItem.id}`;
      break;
    default:
      embedURL = "";
  }
  modalVideo.src = embedURL;
}

/**
 * Close the detail modal and stop video playback.
 */
function closeModal() {
  document.getElementById('modal').style.display = 'none';
  document.getElementById('modal-video').src = '';
}

/**
 * Open the search modal.
 */
function openSearchModal() {
  const modal = document.getElementById('search-modal');
  modal.style.display = 'flex';
  document.getElementById('search-input').focus();
}

/**
 * Close the search modal and clear contents.
 */
function closeSearchModal() {
  document.getElementById('search-modal').style.display = 'none';
  document.getElementById('search-results').innerHTML = '';
  document.getElementById('search-input').value = '';
}

/**
 * Search TMDb and display results in the search modal.
 */
async function searchTMDB() {
  const query = document.getElementById('search-input').value;
  const results = document.getElementById('search-results');
  if (!query.trim()) {
    results.innerHTML = '';
    return;
  }

  const data = await fetchMedia('search/multi', `&query=${encodeURIComponent(query)}`);
  results.innerHTML = '';

  if (data.length === 0) {
    results.innerHTML = '<p style="text-align: center; color: var(--light-gray);">No results found.</p>';
    return;
  }

  data.forEach(item => {
    if (item.poster_path && (item.media_type === 'movie' || item.media_type === 'tv')) {
      const img = document.createElement('img');
      img.src = `${IMG_URL}${item.poster_path}`;
      img.alt = item.title || item.name || 'Search Result';
      img.onerror = function() {
        this.src = 'https://placehold.co/500x750/000000/FFFFFF?text=No+Image';
      };
      img.onclick = () => {
        closeSearchModal();
        showDetails(item);
      };
      results.appendChild(img);
    }
  });
}

// Expose functions globally for use in inline HTML and other scripts
window.fetchMedia = fetchMedia;
window.displayList = displayList;
window.showDetails = showDetails;
window.changeServer = changeServer;
window.closeModal = closeModal;
window.openSearchModal = openSearchModal;
window.closeSearchModal = closeSearchModal;
window.searchTMDB = searchTMDB;
window.IMG_URL = IMG_URL;
