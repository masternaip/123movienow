const API_KEY = 'a1e72fd93ed59f56e6332813b9f8dcae'; // Your TMDb API Key
const BASE_URL = 'https://api.themoviedb.org/3';
const IMG_URL = 'https://image.tmdb.org/t/p/w500';

// TMDb genre IDs for TV
const GENRE_IDS = {
  action: 10759,      // Action & Adventure
  horror: 9648,       // Mystery (closest match for 'Horror' TV)
  adventure: 10759,   // Action & Adventure (no separate Adventure)
  drama: 18           // Drama
};

// Fetch TV shows by category
async function fetchTVShows(category) {
  let url = '';
  if (category === 'trending') {
    url = `${BASE_URL}/trending/tv/week?api_key=${API_KEY}`;
  } else {
    url = `${BASE_URL}/discover/tv?api_key=${API_KEY}&with_genres=${GENRE_IDS[category]}&sort_by=popularity.desc`;
  }
  const res = await fetch(url);
  if (!res.ok) return []; // Return empty array if API fails
  const data = await res.json();
  return data.results || [];
}

// Create a card for a TV show
function createShowCard(show) {
  const poster = show.poster_path ? `${IMG_URL}${show.poster_path}` : 'https://via.placeholder.com/120x180?text=No+Image';
  const title = show.name || show.title || 'Untitled';
  return `
    <div class="tvshow-card" onclick="showDetails(${show.id}, 'tv')">
      <img src="${poster}" alt="${title}" />
      <div class="tvshow-title" style="text-align:center;margin-top:7px;font-size:1em;">${title}</div>
    </div>
  `;
}

// Load all TV show sections
async function loadTVShows() {
  // Trending
  const trending = await fetchTVShows('trending');
  document.getElementById('tvshows-trending').innerHTML = trending.map(createShowCard).join('');

  // Action
  const action = await fetchTVShows('action');
  document.getElementById('tvshows-action').innerHTML = action.map(createShowCard).join('');

  // Horror
  const horror = await fetchTVShows('horror');
  document.getElementById('tvshows-horror').innerHTML = horror.map(createShowCard).join('');

  // Adventure
  const adventure = await fetchTVShows('adventure');
  document.getElementById('tvshows-adventure').innerHTML = adventure.map(createShowCard).join('');

  // Drama
  const drama = await fetchTVShows('drama');
  document.getElementById('tvshows-drama').innerHTML = drama.map(createShowCard).join('');
}

// Show details in modal
window.showDetails = async function(tvId, type) {
  const url = `${BASE_URL}/tv/${tvId}?api_key=${API_KEY}`;
  const res = await fetch(url);
  if (!res.ok) return;
  const show = await res.json();

  document.getElementById('modal-title').textContent = show.name || show.original_name || 'Untitled';
  document.getElementById('modal-description').textContent = show.overview || 'No description.';
  document.getElementById('modal-rating').textContent = `⭐ ${show.vote_average || 'N/A'}`;
  document.getElementById('modal-image').src = show.poster_path
    ? `${IMG_URL}${show.poster_path}`
    : 'https://via.placeholder.com/160x240?text=No+Image';

  // Hide video by default for TV (you can add trailer logic if you want)
  document.getElementById('modal-video').style.display = 'none';

  // Show modal
  document.getElementById('modal').style.display = 'flex';
};

window.closeModal = function() {
  document.getElementById('modal').style.display = 'none';
};

// ==== SEARCH MODAL LOGIC ====
window.openSearchModal = function() {
  document.getElementById('search-modal').style.display = 'flex';
  document.getElementById('search-input').focus();
};
window.closeSearchModal = function() {
  document.getElementById('search-modal').style.display = 'none';
  document.getElementById('search-results').innerHTML = '';
  document.getElementById('search-input').value = '';
};

window.searchTMDB = async function() {
  const q = document.getElementById('search-input').value.trim();
  if (!q) return;
  const url = `${BASE_URL}/search/tv?api_key=${API_KEY}&query=${encodeURIComponent(q)}`;
  const res = await fetch(url);
  const data = await res.json();
  const results = (data.results || []).slice(0, 12);
  document.getElementById('search-results').innerHTML = results.length
    ? results.map(createShowCard).join('')
    : '<div style="color:#ccc;text-align:center;">No results found.</div>';
};

// ==== INIT ====
document.addEventListener('DOMContentLoaded', loadTVShows);

// Optional: Close modals on ESC
window.addEventListener('keydown', function(e){
  if (e.key==='Escape') {
    closeModal();
    closeSearchModal();
  }
});
