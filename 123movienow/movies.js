// movies.js
// This file contains JavaScript logic specific to the movies page (movies.html).

// Access global functions via the window object (defined in global.js)
// window.fetchMedia, window.displayList, window.showDetails, etc.

/**
 * Loads all content specific to the Movies page.
 */
async function loadMoviesPageContent() {
    console.log("Loading Movies Page Content...");

    // Fetch common movie lists
    const popularMovies = await window.fetchMedia('movie/popular');
    const topRatedMovies = await window.fetchMedia('movie/top_rated');
    const upcomingMovies = await window.fetchMedia('movie/upcoming');
    const nowPlayingMovies = await window.fetchMedia('movie/now_playing');

    // Fetch genre-specific movie lists (TMDb Genre IDs)
    const actionMovies = await window.fetchMedia('discover/movie', '&with_genres=28'); // Action
    const comedyMovies = await window.fetchMedia('discover/movie', '&with_genres=35'); // Comedy
    const horrorMovies = await window.fetchMedia('discover/movie', '&with_genres=27'); // Horror
    const scienceFictionMovies = await window.fetchMedia('discover/movie', '&with_genres=878'); // Science Fiction
    const romanceMovies = await window.fetchMedia('discover/movie', '&with_genres=10749'); // Romance
    const familyMovies = await window.fetchMedia('discover/movie', '&with_genres=10751'); // Family
    const documentaryMovies = await window.fetchMedia('discover/movie', '&with_genres=99'); // Documentary
    const animationMovies = await window.fetchMedia('discover/movie', '&with_genres=16'); // Animation

    // Display lists using the globally available displayList function
    window.displayList(popularMovies, 'popular-movies-list');
    window.displayList(topRatedMovies, 'top-rated-movies-list');
    window.displayList(upcomingMovies, 'upcoming-movies-list');
    window.displayList(nowPlayingMovies, 'now-playing-movies-list');
    window.displayList(actionMovies, 'action-movies-list');
    window.displayList(comedyMovies, 'comedy-movies-list');
    window.displayList(horrorMovies, 'horror-movies-list');
    window.displayList(scienceFictionMovies, 'science-fiction-movies-list');
    window.displayList(romanceMovies, 'romance-movies-list');
    window.displayList(familyMovies, 'family-movies-list');
    window.displayList(documentaryMovies, 'documentary-movies-list');
    window.displayList(animationMovies, 'animation-movies-list');
}

// Initialize function when the DOM is fully loaded for the movies page
document.addEventListener('DOMContentLoaded', () => {
    // Add scroll event listener to header for background change (relevant to both pages)
    window.addEventListener('scroll', () => {
        const header = document.querySelector('.header');
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // Highlight the active navigation link for the movies page
    document.querySelectorAll('.nav-links a').forEach(link => {
        if (link.getAttribute('href') === 'movies.html') {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });

    loadMoviesPageContent(); // Load movies page specific content
});
