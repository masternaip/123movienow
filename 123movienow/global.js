// global.js
// This file contains constants and functions used across multiple pages (index.html and movies.html).

const API_KEY = 'a1e72fd93ed59f56e6332813b9f8dcae'; // Your TMDb API Key
const BASE_URL = 'https://api.themoviedb.org/3';
const IMG_URL = 'https://image.tmdb.org/t/p/w500';

// currentItem needs to be global because it's set by showDetails and used by changeServer.
// Using window.currentItem ensures it's truly globally accessible.
window.currentItem = null; 

/**
 * Fetches media (movies/TV shows) from TMDb.
 * @param {string} endpoint - The TMDb API endpoint (e.g., 'trending/movie/day', 'movie/popular').
 * @param {string} [queryParams=''] - Additional query parameters (e.g., '&with_genres=28').
 * @returns {Promise<Array>} A promise that resolves to an array of media results.
 */
async function fetchMedia(endpoint, queryParams = '') {
    try {
        const res = await fetch(`${BASE_URL}/${endpoint}?api_key=${API_KEY}${queryParams}`);
        if (!res.ok) {
            // Log full error response for better debugging
            const errorBody = await res.text();
            throw new Error(`HTTP error! Status: ${res.status}, Body: ${errorBody}`);
        }
        const data = await res.json();
        // TMDb results can be in 'results' or 'items' depending on the endpoint
        return data.results || data.items || [];
    } catch (error) {
        console.error(`Error fetching data from ${endpoint}:`, error);
        return []; // Return empty array on error to prevent breaking the app
    }
}

/**
 * Displays a list of media items in a specified HTML container.
 * @param {Array} items - An array of media objects (movies or TV shows).
 * @param {string} containerId - The ID of the HTML element where the list should be displayed.
 */
function displayList(items, containerId) {
    const container = document.getElementById(containerId);
    if (!container) {
        // console.warn(`Container with ID '${containerId}' not found on this page. Skipping display.`);
        return;
    }
    container.innerHTML = ''; // Clear previous content

    items.forEach(item => {
        // Only display items that have a poster path
        if (!item.poster_path) {
            // console.warn(`Skipping item without poster_path: ${item.title || item.name}`);
            return;
        }

        const img = document.createElement('img');
        img.src = `${IMG_URL}${item.poster_path}`;
        img.alt = item.title || item.name || 'Poster';
        // Add an error handler for broken image links
        img.onerror = function() {
            this.src = 'https://placehold.co/500x750/000000/FFFFFF?text=No+Image'; // Generic placeholder
            this.alt = 'Image not available';
        };
        // Attach click event to show details for the clicked item
        img.onclick = () => showDetails(item);
        container.appendChild(img);
    });
}

/**
 * Opens and populates the detail modal with information about the selected media item.
 * @param {Object} item - The media object (movie or TV show) to display details for.
 */
function showDetails(item) {
    window.currentItem = item; // Store the clicked item in the global scope

    document.getElementById('modal-title').textContent = item.title || item.name || 'Title Not Available';
    document.getElementById('modal-description').textContent = item.overview || 'No overview available.';
    document.getElementById('modal-image').src = `${IMG_URL}${item.poster_path}`;
    document.getElementById('modal-image').onerror = function() {
        this.src = 'https://placehold.co/500x750/000000/FFFFFF?text=No+Image';
    };

    // Display star rating based on vote_average (TMDb is 0-10, convert to 0-5 stars)
    const rating = Math.round((item.vote_average || 0) / 2);
    document.getElementById('modal-rating').innerHTML = '★'.repeat(rating) + '☆'.repeat(5 - rating);

    // Initialize the video player with the default server
    changeServer();
    document.getElementById('modal').style.display = 'flex'; // Show the modal
}

/**
 * Changes the video source in the detail modal based on the selected streaming server.
 */
function changeServer() {
    const serverSelect = document.getElementById('server');
    if (!serverSelect) {
        console.error("Server selection element not found.");
        return;
    }
    const server = serverSelect.value;
    const modalVideo = document.getElementById('modal-video');
    if (!modalVideo) {
        console.error("Modal video iframe element not found.");
        return;
    }

    if (!window.currentItem || !window.currentItem.id) {
        console.warn("No current item or item ID available to generate embed URL.");
        modalVideo.src = ''; // Clear iframe if no item is selected
        return;
    }

    const type = window.currentItem.media_type === "movie" ? "movie" : "tv";
    let embedURL = "";

    // Construct embed URL based on the selected server
    if (server === "vidsrc.cc") {
        embedURL = `https://vidsrc.cc/v2/embed/${type}/${window.currentItem.id}`;
    } else if (server === "vidsrc.me") {
        embedURL = `https://vidsrc.net/embed/${type}/?tmdb=${window.currentItem.id}`; // vidsrc.me often uses 'net' domain
    } else if (server === "player.videasy.net") {
        embedURL = `https://player.videasy.net/${type}/${window.currentItem.id}`;
    }

    modalVideo.src = embedURL; // Update iframe source
}

/**
 * Closes the detail modal and stops video playback.
 */
function closeModal() {
    document.getElementById('modal').style.display = 'none';
    document.getElementById('modal-video').src = ''; // Clear src to stop playback
}

/**
 * Opens the search modal.
 */
function openSearchModal() {
    document.getElementById('search-modal').style.display = 'flex';
    document.getElementById('search-input').focus(); // Focus on the search input field
}

/**
 * Closes the search modal and clears its content.
 */
function closeSearchModal() {
    document.getElementById('search-modal').style.display = 'none';
    document.getElementById('search-results').innerHTML = ''; // Clear previous search results
    document.getElementById('search-input').value = ''; // Clear search input
}

/**
 * Performs a search on TMDb based on user input and displays results.
 */
async function searchTMDB() {
    const query = document.getElementById('search-input').value;
    const searchResultsContainer = document.getElementById('search-results');

    if (!query.trim()) {
        searchResultsContainer.innerHTML = ''; // Clear results if query is empty
        return;
    }

    // Use the global fetchMedia function for searching
    const data = await fetchMedia('search/multi', `&query=${encodeURIComponent(query)}`);

    searchResultsContainer.innerHTML = '';
    if (data.length === 0) {
        searchResultsContainer.innerHTML = '<p style="text-align: center; color: var(--light-gray);">No results found.</p>';
        return;
    }

    data.forEach(item => {
        // Filter out items without a poster and non-movie/tv types
        if (item.poster_path && (item.media_type === 'movie' || item.media_type === 'tv')) {
            const img = document.createElement('img');
            img.src = `${IMG_URL}${item.poster_path}`;
            img.alt = item.title || item.name || 'Search Result';
            img.onerror = function() {
                this.src = 'https://placehold.co/500x750/000000/FFFFFF?text=No+Image';
            };
            img.onclick = () => {
                closeSearchModal(); // Close search modal on item click
                showDetails(item); // Show details for the selected item
            };
            searchResultsContainer.appendChild(img);
        }
    });
}

// Attach common functions to the window object so they are accessible from other scripts and inline HTML.
window.fetchMedia = fetchMedia;
window.displayList = displayList;
window.showDetails = showDetails;
window.changeServer = changeServer;
window.closeModal = closeModal;
window.openSearchModal = openSearchModal;
window.closeSearchModal = closeSearchModal;
window.searchTMDB = searchTMDB;
window.IMG_URL = IMG_URL; // Expose IMG_URL for direct use if needed (e.g., banner)
