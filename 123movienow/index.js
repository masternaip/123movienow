// index.js
// This file contains JavaScript specific to the homepage (index.html).

// Global variables from global.js are available via window object
// const API_KEY = window.API_KEY; // Not needed if fetchMedia is used
// const BASE_URL = window.BASE_URL; // Not needed if fetchMedia is used
const IMG_URL = window.IMG_URL; // Used for banner image
let currentItem = window.currentItem; // Re-declare or ensure it's accessible

let bannerItems = [];
let currentBannerIndex = 0;
let bannerInterval;

// Function to display the main banner
function displayBanner(item) {
    const bannerElement = document.getElementById('banner');
    const bannerTitle = document.getElementById('banner-title');
    const bannerDescription = document.getElementById('banner-description');

    if (!bannerElement || !bannerTitle || !bannerDescription) {
        return; // Ensure elements exist on this page
    }

    // Apply fade-out effect
    bannerElement.style.opacity = 0;
    bannerTitle.style.opacity = 0;
    bannerDescription.style.opacity = 0;

    // After fade-out, change content and fade in
    setTimeout(() => {
        bannerElement.style.backgroundImage = `url(${IMG_URL}${item.backdrop_path})`;
        bannerTitle.textContent = item.title || item.name || 'N/A';
        bannerDescription.textContent = item.overview || 'No overview available.';
        window.currentItem = item; // Update global currentItem
        currentItem = item; // Also update local currentItem if needed

        // Apply fade-in effect
        bannerElement.style.opacity = 1;
        bannerTitle.style.opacity = 1;
        bannerDescription.style.opacity = 1;
    }, 500); // Half of the transition duration in CSS
}

// Function to update active dot for banner slideshow
function updateBannerDots() {
    const dotsContainer = document.getElementById('banner-nav-dots');
    if (!dotsContainer) {
        return; // Ensure dots container exists on this page
    }

    dotsContainer.innerHTML = ''; // Clear existing dots

    bannerItems.forEach((_, index) => {
        const dot = document.createElement('div');
        dot.classList.add('dot');
        if (index === currentBannerIndex) {
            dot.classList.add('active');
        }
        dot.onclick = () => {
            clearInterval(bannerInterval); // Stop current interval
            currentBannerIndex = index;
            displayBanner(bannerItems[currentBannerIndex]);
            updateBannerDots();
            startBannerSlideshow(); // Restart interval
        };
        dotsContainer.appendChild(dot);
    });
}

// Function to start the banner slideshow
function startBannerSlideshow() {
    if (!document.getElementById('banner')) {
        return; // Only start if banner elements exist
    }

    clearInterval(bannerInterval); // Clear any existing interval

    bannerInterval = setInterval(() => {
        currentBannerIndex = (currentBannerIndex + 1) % bannerItems.length;
        displayBanner(bannerItems[currentBannerIndex]);
        updateBannerDots();
    }, 8000); // Change banner every 8 seconds
}

// Function to load content specific to the Home page
async function loadHomePageContent() {
    console.log("Loading Home Page Content...");

    // Fetching data using the global fetchMedia function
    const movies = await window.fetchMedia('trending/movie/day');
    const tvShows = await window.fetchMedia('trending/tv/day');
    const weeklyTrendMovie = await window.fetchMedia('trending/movie/week');

    // Production Company/Network based lists (using IDs from previous searches)
    const hboMovies = await window.fetchMedia('discover/movie', '&with_companies=3268&sort_by=popularity.desc'); // HBO
    const netflixMovies = await window.fetchMedia('discover/movie', '&with_networks=213&sort_by=popularity.desc'); // Netflix
    const marvelMovies = await window.fetchMedia('discover/movie', '&with_companies=420&sort_by=popularity.desc'); // Marvel Studios
    const disneyMovies = await window.fetchMedia('discover/movie', '&with_companies=2&sort_by=popularity.desc'); // Walt Disney Pictures

    // Populate bannerItems with a mix of daily trending movies and TV shows
    bannerItems = [...movies.slice(0, 5), ...tvShows.slice(0, 5)];
    if (bannerItems.length > 0) {
        displayBanner(bannerItems[currentBannerIndex]);
        updateBannerDots();
        startBannerSlideshow();
    }

    // Display lists using the global displayList function
    window.displayList(tvShows, 'tvshows-list');
    window.displayList(weeklyTrendMovie, 'weekly-trend-movie-list');
    window.displayList(hboMovies, 'hbo-movies-list');
    window.displayList(netflixMovies, 'netflix-movies-list');
    window.displayList(marvelMovies, 'marvel-movies-list');
    window.displayList(disneyMovies, 'disney-movies-list');
}

// Initialize function for homepage
document.addEventListener('DOMContentLoaded', () => {
    // Add scroll event listener to header for background change
    window.addEventListener('scroll', () => {
        const header = document.querySelector('.header');
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // Highlight active nav link (specific to index.html)
    document.querySelectorAll('.nav-links a').forEach(link => {
        if (link.getAttribute('href') === 'index.html' || link.getAttribute('href') === '') {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });

    loadHomePageContent();
});
