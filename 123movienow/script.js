// ==== Configuration ====
const API_KEY = 'a1e72fd93ed59f56e6332813b9f8dcae';
// ==== CONFIG ====

// Genre IDs for TV
const GENRE_IDS = {
  action: 10759,      // Action & Adventure
  horror: 9648,       // Mystery (closest for TV)
  adventure: 10759,   // Action & Adventure (same as action)
  drama: 18           // Drama
};

// ==== Fetch Functions ====
async function fetchTVShows(category) {
  let url;
  if (category === 'trending') {
    url = `https://api.themoviedb.org/3/trending/tv/week?api_key=${TMDB_API_KEY}`;
  } else {
    url = `https://api.themoviedb.org/3/discover/tv?api_key=${TMDB_API_KEY}&with_genres=${GENRE_IDS[category]}&sort_by=popularity.desc`;
  }
  const res = await fetch(url);
  const data = await res.json();
  return data.results || [];
}

// ==== Card Creator ====
function createShowCard(show) {
  const poster = show.poster_path
    ? `https://image.tmdb.org/t/p/w300${show.poster_path}`
    : 'https://via.placeholder.com/120x180?text=No+Image';
  const title = show.name || show.title || 'Untitled';
  return `
    <div class="tvshow-card" onclick="showDetails(${show.id}, 'tv')">
      <img src="${poster}" alt="${title}" />
      <div class="tvshow-title" style="text-align:center;margin-top:7px;font-size:1em;">${title}</div>
    </div>
  `;
}

// ==== Populate Sections ====
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

// ==== Modal Logic (simplified for demo) ====
window.showDetails = async function(tvId, type) {
  // Fetch details (or use your existing modal code)
  // Here is a basic version as an example:
  const url = `https://api.themoviedb.org/3/tv/${tvId}?api_key=${TMDB_API_KEY}`;
  const res = await fetch(url);
  const show = await res.json();

  document.getElementById('modal-title').textContent = show.name || show.original_name || 'Untitled';
  document.getElementById('modal-description').textContent = show.overview || 'No description.';
  document.getElementById('modal-rating').textContent = `⭐ ${show.vote_average || 'N/A'}`;
  document.getElementById('modal-image').src = show.poster_path
    ? `https://image.tmdb.org/t/p/w300${show.poster_path}`
    : 'https://via.placeholder.com/160x240?text=No+Image';

  // Hide video by default for TV (or implement your own logic)
  document.getElementById('modal-video').style.display = 'none';

  // Show modal
  document.getElementById('modal').style.display = 'flex';
};

window.closeModal = function() {
  document.getElementById('modal').style.display = 'none';
};

// ==== Search Modal Logic ====
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
  const url = `https://api.themoviedb.org/3/search/tv?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(q)}`;
  const res = await fetch(url);
  const data = await res.json();
  const results = (data.results || []).slice(0, 12);
  document.getElementById('search-results').innerHTML = results.length
    ? results.map(createShowCard).join('')
    : '<div style="color:#ccc;text-align:center;">No results found.</div>';
};

// ==== DOMContentLoaded ====
document.addEventListener('DOMContentLoaded', loadTVShows);

// Optional: Close modals on ESC
window.addEventListener('keydown', function(e){
  if (e.key==='Escape') {
    closeModal();
    closeSearchModal();
  }
});
