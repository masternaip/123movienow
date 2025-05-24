// ==== Configuration ====
const API_KEY = 'YOUR_TMDB_API_KEY'; // <-- Replace with your TMDb API key
const BASE_URL = 'https://api.themoviedb.org/3';
const IMG_URL = 'https://image.tmdb.org/t/p/w500';

// ==== GLOBALS ====
window.currentItem = null; // Used for server switching in modal

// ==== Fetch Functions ====

// Trending: type = 'movie' or 'tv'
async function fetchTrending(type = 'movie') {
  const res = await fetch(`${BASE_URL}/trending/${type}/week?api_key=${API_KEY}`);
  return (await res.json()).results;
}

// Company: e.g. HBO = 3268, MARVEL = 420, Disney = 2
async function fetchMoviesByCompany(companyId) {
  const res = await fetch(`${BASE_URL}/discover/movie?api_key=${API_KEY}&with_companies=${companyId}&sort_by=popularity.desc`);
  return (await res.json()).results;
}

// Network: e.g. Netflix = 213
async function fetchMoviesByNetwork(networkId) {
  const res = await fetch(`${BASE_URL}/discover/movie?api_key=${API_KEY}&with_networks=${networkId}&sort_by=popularity.desc`);
  return (await res.json()).results;
}

// Helper for TV shows by genre
async function fetchTVByGenre(genreId) {
  const res = await fetch(`${BASE_URL}/discover/tv?api_key=${API_KEY}&with_genres=${genreId}&sort_by=popularity.desc`);
  return (await res.json()).results;
}

// Popular Movies
async function fetchPopularMovies() {
  const res = await fetch(`${BASE_URL}/movie/popular?api_key=${API_KEY}`);
  return (await res.json()).results;
}

// Upcoming Movies
async function fetchUpcomingMovies() {
  const res = await fetch(`${BASE_URL}/movie/upcoming?api_key=${API_KEY}`);
  return (await res.json()).results;
}

// Now Playing Movies
async function fetchNowPlayingMovies() {
  const res = await fetch(`${BASE_URL}/movie/now_playing?api_key=${API_KEY}`);
  return (await res.json()).results;
}

// Movies for a specific year (e.g., 2025)
async function fetchMoviesByYear(year) {
  const res = await fetch(`${BASE_URL}/discover/movie?api_key=${API_KEY}&primary_release_year=${year}&sort_by=popularity.desc`);
  return (await res.json()).results;
}

// TV Shows: Popular
async function fetchPopularTVShows() {
  const res = await fetch(`${BASE_URL}/tv/popular?api_key=${API_KEY}`);
  return (await res.json()).results;
}

// TV Shows: Trending
async function fetchTrendingTVShows() {
  const res = await fetch(`${BASE_URL}/trending/tv/week?api_key=${API_KEY}`);
  return (await res.json()).results;
}

// ==== Render Functions ====

// Universal display function for movies and TV shows
function displayList(items, containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = "";
  items.forEach(item => {
    const img = document.createElement("img");
    img.src = IMG_URL + (item.poster_path || item.backdrop_path);
    img.alt = item.title || item.name;
    img.onclick = () => showDetails(item);
    container.appendChild(img);
  });
}

// ==== Modal Functions ====

// Show modal with details and video
function showDetails(item) {
  window.currentItem = item; // For server switching
  document.getElementById("modal-title").textContent = item.title || item.name;
  document.getElementById("modal-description").textContent = item.overview || "";
  document.getElementById("modal-rating").textContent = "⭐ " + (item.vote_average || "N/A");
  document.getElementById("modal-image").src = IMG_URL + (item.poster_path || item.backdrop_path);

  // Choose server and URL
  const server = document.getElementById("server").value;
  const isMovie = !!item.title;
  const id = item.id;
  let embedUrl = "";

  if (isMovie) {
    embedUrl = `https://${server}/embed/movie?tmdb=${id}`;
  } else {
    embedUrl = `https://${server}/embed/tv?tmdb=${id}`;
  }
  document.getElementById("modal-video").src = embedUrl;

  document.getElementById("modal").style.display = "flex";
}

// Server select handler
function changeServer() {
  const server = document.getElementById("server").value;
  const item = window.currentItem;
  if (!item) return;
  const isMovie = !!item.title;
  const id = item.id;
  let embedUrl = "";
  if (isMovie) {
    embedUrl = `https://${server}/embed/movie?tmdb=${id}`;
  } else {
    embedUrl = `https://${server}/embed/tv?tmdb=${id}`;
  }
  document.getElementById("modal-video").src = embedUrl;
}

// Close modal
function closeModal() {
  document.getElementById("modal").style.display = "none";
  document.getElementById("modal-video").src = "";
}

// Optional: Close modal on background click or Escape key
document.addEventListener("keydown", function(e) {
  if (e.key === "Escape") closeModal();
});
document.addEventListener("click", function(e) {
  const modal = document.getElementById("modal");
  if (e.target === modal) closeModal();
});

// ==== Page Initializers ====
// (Call these in your HTML as needed, e.g. on DOMContentLoaded)

// -- movies.html --
async function initMoviesPage() {
  const movies = await fetchTrending('movie');
  const hboMovies = await fetchMoviesByCompany(3268);
  const marvelMovies = await fetchMoviesByCompany(420);
  const disneyMovies = await fetchMoviesByCompany(2);
  const netflixMovies = await fetchMoviesByNetwork(213);

  displayList(movies, 'movies-list');
  displayList(hboMovies, 'hbo-movies-list');
  displayList(marvelMovies, 'marvel-movies-list');
  displayList(disneyMovies, 'disney-movies-list');
  displayList(netflixMovies, 'netflix-movies-list');
}

// -- new-movies.html --
async function initNewMoviesPage() {
  const [popular, upcoming, nowplaying, movies2025] = await Promise.all([
    fetchPopularMovies(),
    fetchUpcomingMovies(),
    fetchNowPlayingMovies(),
    fetchMoviesByYear(2025)
  ]);
  displayList(popular, 'popular-movies-list');
  displayList(upcoming, 'upcoming-movies-list');
  displayList(nowplaying, 'nowplaying-movies-list');
  displayList(movies2025, 'movies-2025-list');
}

// -- tvshows.html --
async function initTVShowsPage() {
  const [trending, popular, drama, action, romance] = await Promise.all([
    fetchTrendingTVShows(),
    fetchPopularTVShows(),
    fetchTVByGenre(18),      // Drama
    fetchTVByGenre(10759),   // Action & Adventure
    fetchTVByGenre(10749)    // Romance
  ]);
  displayList(trending, 'trending-tvshows-list');
  displayList(popular, 'popular-tvshows-list');
  displayList(drama, 'drama-tvshows-list');
  displayList(action, 'action-tvshows-list');
  displayList(romance, 'romance-tvshows-list');
}
