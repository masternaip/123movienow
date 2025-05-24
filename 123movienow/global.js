// global.js
// This file contains constants and functions used across multiple pages.

const API_KEY = 'a1e72fd93ed59f56e6332813b9f8dcae'; // Your TMDb API Key
const BASE_URL = 'https://api.themoviedb.org/3';
const IMG_URL = 'https://image.tmdb.org/t/p/w500';

let currentItem; // To store the currently selected item for modal details

// Reusable fetch function for various movie/TV show lists
async function fetchMedia(endpoint, queryParams = '') {
    try {
        const res = await fetch(`${BASE_URL}/${endpoint}?api_key=${API_KEY}${queryParams}`);
        if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
        }
        const data = await res.json();
        return data.results || data.items || []; // Some endpoints like /list/id return 'items'
    } catch (error) {
        console.error(`Error fetching data from ${endpoint}:`, error);
        return []; // Return empty array on error
    }
}

// Function to display lists of movies/tv shows
function displayList(items, containerId) {
    const container = document.getElementById(containerId);
    // Only proceed if the container element exists on the current page
    if (!container) {
        // console.warn(`Container with ID '${containerId}' not found on this page.`);
        return;
    }
    container.innerHTML = ''; // Clear previous content
    items.forEach(item => {
        if (!item.poster_path) {
            // console.warn(`Skipping item without poster_path: ${item.title || item.name}`);
            return; // Skip items without a poster
        }
        const img = document.createElement('img');
        img.src = `${IMG_URL}${item.poster_path}`;
        img.alt = item.title || item.name || 'Poster';
        img.onerror = function() {
            this.src = 'https://placehold.co/500x750/000000/FFFFFF?text=No+Image'; // Placeholder for broken images
        };
        img.onclick = () => showDetails(item); // Attach click event to show details
        container.appendChild(img);
    });
}

// Function to show details modal
function showDetails(item) {
    currentItem = item; // Store the clicked item
    document.getElementById('modal-title').textContent = item.title || item.name || 'N/A';
    document.getElementById('modal-description').textContent = item.overview || 'No overview available.';
    document.getElementById('modal-image').src = `${IMG_URL}${item.poster_path}`;
    document.getElementById('modal-image').onerror = function() {
        this.src = 'https://placehold.co/500x750/000000/FFFFFF?text=No+Image'; // Placeholder for broken images
    };

    // Display star rating
    const rating = Math.round((item.vote_average || 0) / 2); // Convert 10-point scale to 5-star
    document.getElementById('modal-rating').innerHTML = '★'.repeat(rating) + '☆'.repeat(5 - rating);
    changeServer(); // Initialize video player with default server
    document.getElementById('modal').style.display = 'flex'; // Show the modal
}

// Function to change the video streaming server
function changeServer() {
    const server = document.getElementById('server').value;
    // Ensure currentItem is set and has a media_type
    const type = currentItem && currentItem.media_type === "movie" ? "movie" : "tv";
    let embedURL = "";

    if (currentItem && currentItem.id) { // Ensure item has an ID
        if (server === "vidsrc.cc") {
            embedURL = `https://vidsrc.cc/v2/embed/${type}/${currentItem.id}`;
        } else if (server === "vidsrc.me") {
            embedURL = `https://vidsrc.net/embed/${type}/?tmdb=${currentItem.id}`;
        } else if (server === "player.videasy.net") {
            embedURL = `https://player.videasy.net/${type}/${currentItem.id}`;
        }
    } else {
        console.warn("No current item or item ID to generate embed URL.");
    }

    document.getElementById('modal-video').src = embedURL; // Update iframe source
}

// Function to close the detail modal
function closeModal() {
    document.getElementById('modal').style.display = 'none';
    document.getElementById('modal-video').src = ''; // Stop video playback
}

// Function to open the search modal
function openSearchModal() {
    document.getElementById('search-modal').style.display = 'flex';
    document.getElementById('search-input').focus(); // Focus on search input
}

// Function to close the search modal
function closeSearchModal() {
    document.getElementById('search-modal').style.display = 'none';
    document.getElementById('search-results').innerHTML = ''; // Clear search results
    document.getElementById('search-input').value = ''; // Clear search input
}

// Function to search TMDB
async function searchTMDB() {
    const query = document.getElementById('search-input').value;
    if (!query.trim()) {
        document.getElementById('search-results').innerHTML = ''; // Clear if query is empty
        return;
    }

    const res = await fetch(`${BASE_URL}/search/multi?api_key=${API_KEY}&query=${query}`);
    const data = await res.json();

    const container = document.getElementById('search-results');
    container.innerHTML = '';
    data.results.forEach(item => {
        // Only display items with a poster and a known media type (movie or tv)
        if (item.poster_path && (item.media_type === 'movie' || item.media_type === 'tv')) {
            const img = document.createElement('img');
            img.src = `${IMG_URL}${item.poster_path}`;
            img.alt = item.title || item.name || 'Poster';
            img.onerror = function() {
                this.src = 'https://placehold.co/500x750/000000/FFFFFF?text=No+Image'; // Placeholder for broken images
            };
            img.onclick = () => {
                closeSearchModal(); // Close search modal
                showDetails(item); // Show details of the clicked item
            };
            container.appendChild(img);
        }
    });
}

// Export common functions for other scripts to use
window.displayList = displayList;
window.showDetails = showDetails;
window.changeServer = changeServer;
window.closeModal = closeModal;
window.openSearchModal = openSearchModal;
window.closeSearchModal = closeSearchModal;
window.searchTMDB = searchTMDB;
window.fetchMedia = fetchMedia; // Make fetchMedia available globally
window.IMG_URL = IMG_URL; // Make IMG_URL available globally
window.currentItem = currentItem; // Make currentItem available globally (though it's better to pass it)
