// index.js
// This file contains JavaScript logic specific to the homepage (index.html).

// Access global variables and functions via the window object (defined in global.js)
const IMG_URL = window.IMG_URL;
let currentItem = window.currentItem; // This will be updated by showDetails in global.js

let bannerItems = [];
let currentBannerIndex = 0;
let bannerInterval;

/**
 * Displays the main banner with details of a media item.
 * @param {Object} item - The media object (movie or TV show) for the banner.
 */
function displayBanner(item) {
    const bannerElement = document.getElementById('banner');
    const bannerTitle = document.getElementById('banner-title');
    const bannerDescription = document.getElementById('banner-description');

    // Only proceed if banner elements exist (specific to index.html)
    if (!bannerElement || !bannerTitle || !bannerDescription) {
        return;
    }

    // Smooth fade effect for banner content
    bannerElement.style.opacity = 0;
    bannerTitle.style.opacity = 0;
    bannerDescription.style.opacity = 0;

    setTimeout(() => {
        bannerElement.style.backgroundImage = `url(${IMG_URL}${item.backdrop_path})`;
        bannerTitle.textContent = item.title || item.name || 'Untitled';
        bannerDescription.textContent = item.overview || 'No overview available.';
        window.currentItem = item; // Update the global currentItem when banner changes
        currentItem = item; // Update local currentItem for direct access in this script if needed

        bannerElement.style.opacity = 1;
        bannerTitle.style.opacity = 1;
        bannerDescription.style.opacity = 1;
    }, 500); // Matches CSS transition duration
}

/**
 * Updates the navigation dots for the banner slideshow.
 */
function updateBannerDots() {
    const dotsContainer = document.getElementById('banner-nav-dots');
    if (!dotsContainer) {
        return;
    }

    dotsContainer.innerHTML = ''; // Clear existing dots

    bannerItems.forEach((_, index) => {
        const dot = document.createElement('div');
        dot.classList.add('dot');
        if (index === currentBannerIndex) {
            dot.classList.add('active');
        }
        dot.onclick = () => {
            clearInterval(bannerInterval); // Stop current interval on manual click
            currentBannerIndex = index;
            displayBanner(bannerItems[currentBannerIndex]);
            updateBannerDots();
            startBannerSlideshow(); // Restart interval
        };
        dotsContainer.appendChild(dot);
    });
}

/**
 * Starts the automatic banner slideshow.
 */
function startBannerSlideshow() {
    if (!document.getElementById('banner')) { // Ensure banner exists
        return;
    }

    clearInterval(bannerInterval); // Clear any existing interval to prevent duplicates

    bannerInterval = setInterval(() => {
        currentBannerIndex = (currentBannerIndex + 1) % bannerItems.length;
        displayBanner(bannerItems[currentBannerIndex]);
        updateBannerDots();
    }, 8000); // Change banner every 8 seconds
}

/**
 * Loads all content specific to the Home page.
 */
async function loadHomePageContent() {
    console.log("Loading Home Page Content...");

    // Fetch data using the globally available fetchMedia function
    const dailyTrendingMovies = await window.fetchMedia('trending/movie/day');
    const dailyTrendingTvShows = await window.fetchMedia('trending/tv/day');
    const weeklyTrendMovie = await window.fetchMedia('trending/movie/week');

    // Fetch movies by production company/network
    const hboMovies = await window.fetchMedia('discover/movie', '&with_companies=3268&sort_by=popularity.desc'); // HBO
    const netflixMovies = await window.fetchMedia('discover/movie', '&with_networks=213&sort_by=popularity.desc'); // Netflix
    const marvelMovies = await window.fetchMedia('discover/movie', '&with_companies=420&sort_by=popularity.desc'); // Marvel Studios
    const disneyMovies = await window.fetchMedia('discover/movie', '&with_companies=2&sort_by=popularity.desc'); // Walt Disney Pictures

    // Populate bannerItems with a mix of daily trending movies and TV shows for variety
    // Ensure we have enough items before slicing
    bannerItems = [...dailyTrendingMovies.slice(0, 5), ...dailyTrendingTvShows.slice(0, 5)];
    if (bannerItems.length > 0) {
        displayBanner(bannerItems[currentBannerIndex]);
        updateBannerDots();
        startBannerSlideshow();
    } else {
        console.warn("No items available for banner slideshow.");
    }

    // Display lists using the globally available displayList function
    window.displayList(dailyTrendingTvShows, 'tvshows-list');
    window.displayList(weeklyTrendMovie, 'weekly-trend-movie-list');
    window.displayList(hboMovies, 'hbo-movies-list');
    window.displayList(netflixMovies, 'netflix-movies-list');
    window.displayList(marvelMovies, 'marvel-movies-list');
    window.displayList(disneyMovies, 'disney-movies-list');
}

// Initialize function when the DOM is fully loaded for the homepage
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

    // Highlight the active navigation link for the homepage
    document.querySelectorAll('.nav-links a').forEach(link => {
        // Check if the href is 'index.html' or an empty string (for root path)
        const currentPath = window.location.pathname.split('/').pop();
        if (link.getAttribute('href') === 'index.html' || (link.getAttribute('href') === '' && currentPath === '')) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });

    loadHomePageContent(); // Load homepage specific content
});
