// movies.js
// This file contains JavaScript specific to the movies page (movies.html).

// Global functions from global.js are available via window object
// window.fetchMedia, window.displayList, window.showDetails, etc.

// Function to load content specific to the Movies page
async function loadMoviesPageContent() {
    console.log("Loading Movies Page Content...");

    // Fetching data using the global fetchMedia function
    const popularMovies = await window.fetchMedia('movie/popular');
    const topRatedMovies = await window.fetchMedia('movie/top_rated');
    const upcomingMovies = await window.fetchMedia('movie/upcoming');
    const nowPlayingMovies = await window.fetchMedia('movie/now_playing');

    // Genre-specific movie lists (example genre IDs)
    const actionMovies = await window.fetchMedia('discover/movie', '&with_genres=28'); // Action
    const comedyMovies = await window.fetchMedia('discover/movie', '&with_genres=35'); // Comedy
    const horrorMovies = await window.fetchMedia('discover/movie', '&with_genres=27'); // Horror
    const documentaryMovies = await window.fetchMedia('discover/movie', '&with_genres=99'); // Documentary

    // Display lists using the global displayList function
    window.displayList(popularMovies, 'popular-movies-list');
    window.displayList(topRatedMovies, 'top-rated-movies-list');
    window.displayList(upcomingMovies, 'upcoming-movies-list');
    window.displayList(nowPlayingMovies, 'now-playing-movies-list');
    window.displayList(actionMovies, 'action-movies-list');
    window.displayList(comedyMovies, 'comedy-movies-list');
    window.displayList(horrorMovies, 'horror-movies-list');
    window.displayList(documentaryMovies, 'documentary-movies-list');
}

// Initialize function for movies page
document.addEventListener('DOMContentLoaded', () => {
    // Add scroll event listener to header for background change (always relevant)
    window.addEventListener('scroll', () => {
        const header = document.querySelector('.header');
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // Highlight active nav link (specific to movies.html)
    document.querySelectorAll('.nav-links a').forEach(link => {
        if (link.getAttribute('href') === 'movies.html') {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });

    loadMoviesPageContent();
});
