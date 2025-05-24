// movies.js
// JavaScript logic for movies.html

/**
 * Load and display all movie sections for the Movies page.
 */
async function loadMoviesPageContent() {
  // Fetch main movie lists
  const popularMovies     = await window.fetchMedia('movie/popular');
  const topRatedMovies    = await window.fetchMedia('movie/top_rated');
  const upcomingMovies    = await window.fetchMedia('movie/upcoming');
  const nowPlayingMovies  = await window.fetchMedia('movie/now_playing');

  // Fetch genre-specific movie lists
  const actionMovies      = await window.fetchMedia('discover/movie', '&with_genres=28');
  const comedyMovies      = await window.fetchMedia('discover/movie', '&with_genres=35');
  const horrorMovies      = await window.fetchMedia('discover/movie', '&with_genres=27');
  const documentaryMovies = await window.fetchMedia('discover/movie', '&with_genres=99');

  // Display lists using the shared displayList function
  window.displayList(popularMovies, 'popular-movies-list');
  window.displayList(topRatedMovies, 'top-rated-movies-list');
  window.displayList(upcomingMovies, 'upcoming-movies-list');
  window.displayList(nowPlayingMovies, 'now-playing-movies-list');
  window.displayList(actionMovies, 'action-movies-list');
  window.displayList(comedyMovies, 'comedy-movies-list');
  window.displayList(horrorMovies, 'horror-movies-list');
  window.displayList(documentaryMovies, 'documentary-movies-list');
}

// Initialize when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  // Header background scroll effect
  window.addEventListener('scroll', () => {
    const header = document.querySelector('.header');
    header.classList.toggle('scrolled', window.scrollY > 50);
  });

  // Navigation active link highlight
  document.querySelectorAll('.nav-links a').forEach(link => {
    link.classList.toggle('active', link.getAttribute('href') === 'movies.html');
  });

  loadMoviesPageContent();
});
