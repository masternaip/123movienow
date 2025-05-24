const API_KEY = 'a1e72fd93ed59f56e6332813b9f8dcae'; // Your TMDb API Key
const BASE_URL = 'https://api.themoviedb.org/3';
const IMG_URL = 'https://image.tmdb.org/t/p/w500';
let currentItem; // To store the currently selected item for modal details

// New variables for banner slideshow
let bannerItems = [];
let currentBannerIndex = 0;
let bannerInterval;

// Reusable fetch function for various movie lists
async function fetchMovies(endpoint, queryParams = '') {
    const res = await fetch(`${BASE_URL}/${endpoint}?api_key=${API_KEY}${queryParams}`);
    const data = await res.json();
    return data.results || data.items; // Some endpoints like /list/id return 'items'
}

// Function to display the main banner
function displayBanner(item) {
    const bannerElement = document.getElementById('banner');
    const bannerTitle = document.getElementById('banner-title');
    const bannerDescription = document.getElementById('banner-description');

    // Ensure banner elements exist before trying to update them (they won't on movies.html)
    if (!bannerElement || !bannerTitle || !bannerDescription) {
        return;
    }

    // Apply fade-out effect
    bannerElement.style.opacity = 0;
    bannerTitle.style.opacity = 0;
    bannerDescription.style.opacity = 0;

    // After fade-out, change content and fade in
    setTimeout(() => {
        bannerElement.style.backgroundImage = `url(${IMG_URL}${item.backdrop_path})`;
        bannerTitle.textContent = item.title || item.name;
        bannerDescription.textContent = item.overview;
        currentItem = item; // Set the current item for the banner as well

        // Apply fade-in effect
        bannerElement.style.opacity = 1;
        bannerTitle.style.opacity = 1;
        bannerDescription.style.opacity = 1;
    }, 500); // Half of the transition duration in CSS
}

// Function to update active dot for banner slideshow
function updateBannerDots() {
    const dotsContainer = document.getElementById('banner-nav-dots');
    // Ensure dots container exists (it won't on movies.html)
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
    // Only start if banner elements exist
    if (!document.getElementById('banner')) {
        return;
    }

    // Clear any existing interval to prevent multiple slideshows
    clearInterval(bannerInterval);

    bannerInterval = setInterval(() => {
        currentBannerIndex = (currentBannerIndex + 1) % bannerItems.length;
        displayBanner(bannerItems[currentBannerIndex]);
        updateBannerDots();
    }, 8000); // Change banner every 8 seconds (adjust as needed)
}

// Function to display lists of movies/tv shows
function displayList(items, containerId) {
    const container = document.getElementById(containerId);
    // Only proceed if the container element exists on the current page
    if (!container) {
        return;
    }
    container.innerHTML = ''; // Clear previous content
    items.forEach(item => {
        if (!item.poster_path) return; // Skip items without a poster
        const img = document.createElement('img');
        img.src = `${IMG_URL}${item.poster_path}`;
        img.alt = item.title || item.name;
        img.onclick = () => showDetails(item); // Attach click event to show details
        container.appendChild(img);
    });
}

// Function to show details modal
function showDetails(item) {
    currentItem = item; // Store the clicked item
    document.getElementById('modal-title').textContent = item.title || item.name;
    document.getElementById('modal-description').textContent = item.overview;
    document.getElementById('modal-image').src = `${IMG_URL}${item.poster_path}`;
    // Display star rating
    const rating = Math.round(item.vote_average / 2); // Convert 10-point scale to 5-star
    document.getElementById('modal-rating').innerHTML = '\u2605'.repeat(rating) + '\u2606'.repeat(5 - rating);
    changeServer(); // Initialize video player with default server
    document.getElementById('modal').style.display = 'flex'; // Show the modal
}

// Function to change the video streaming server
function changeServer() {
    const server = document.getElementById('server').value;
    const type = currentItem.media_type === "movie" ? "movie" : "tv"; // Determine if movie or TV show
    let embedURL = "";

    if (server === "vidsrc.cc") {
        embedURL = `https://vidsrc.cc/v2/embed/${type}/${currentItem.id}`;
    } else if (server === "vidsrc.me") {
        embedURL = `https://vidsrc.net/embed/${type}/?tmdb=${currentItem.id}`; // vidsrc.me often uses 'net'
    } else if (server === "player.videasy.net") {
        embedURL = `https://player.videasy.net/${type}/${currentItem.id}`;
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
            img.alt = item.title || item.name;
            img.onclick = () => {
                closeSearchModal(); // Close search modal
                showDetails(item); // Show details of the clicked item
            };
            container.appendChild(img);
        }
    });
}

// Function to load content specific to the Movies page
async function loadMoviesPageContent() {
    // Common movie lists for the Movies page
    const popularMovies = await fetchMovies('movie/popular');
    const topRatedMovies = await fetchMovies('movie/top_rated');
    const upcomingMovies = await fetchMovies('movie/upcoming');
    const nowPlayingMovies = await fetchMovies('movie/now_playing');

    // Genre-specific movie lists (example genre IDs)
    const actionMovies = await fetchMovies('discover/movie', '&with_genres=28'); // Action
    const comedyMovies = await fetchMovies('discover/movie', '&with_genres=35'); // Comedy
    const horrorMovies = await fetchMovies('discover/movie', '&with_genres=27'); // Horror
    const documentaryMovies = await fetchMovies('discover/movie', '&with_genres=99'); // Documentary

    displayList(popularMovies, 'popular-movies-list');
    displayList(topRatedMovies, 'top-rated-movies-list');
    displayList(upcomingMovies, 'upcoming-movies-list');
    displayList(nowPlayingMovies, 'now-playing-movies-list');
    displayList(actionMovies, 'action-movies-list');
    displayList(comedyMovies, 'comedy-movies-list');
    displayList(horrorMovies, 'horror-movies-list');
    displayList(documentaryMovies, 'documentary-movies-list');
}

// Function to load content specific to the Home page
async function loadHomePageContent() {
    const movies = await fetchMovies('trending/movie/day'); // Daily trending movies
    const tvShows = await fetchMovies('trending/tv/day'); // Daily trending TV shows
    const weeklyTrendMovie = await fetchMovies('trending/movie/week');

    // Production Company/Network based lists
    const hboMovies = await fetchMovies('discover/movie', '&with_companies=3268&sort_by=popularity.desc');
    const netflixMovies = await fetchMovies('discover/movie', '&with_networks=213&sort_by=popularity.desc');
    const marvelMovies = await fetchMovies('discover/movie', '&with_companies=420&sort_by=popularity.desc');
    const disneyMovies = await fetchMovies('discover/movie', '&with_companies=2&sort_by=popularity.desc');

    // Populate bannerItems with a mix of daily trending movies and TV shows
    bannerItems = [...movies.slice(0, 5), ...tvShows.slice(0, 5)];
    if (bannerItems.length > 0) {
        displayBanner(bannerItems[currentBannerIndex]);
        updateBannerDots();
        startBannerSlideshow();
    }

    displayList(tvShows, 'tvshows-list'); // Only TV shows on home now
    displayList(weeklyTrendMovie, 'weekly-trend-movie-list');
    displayList(hboMovies, 'hbo-movies-list');
    displayList(netflixMovies, 'netflix-movies-list');
    displayList(marvelMovies, 'marvel-movies-list');
    displayList(disneyMovies, 'disney-movies-list');
}

// Initialize function to load content based on the current page
async function init() {
    // Add scroll event listener to header for background change (always relevant)
    window.addEventListener('scroll', () => {
        const header = document.querySelector('.header');
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    const currentPage = window.location.pathname.split('/').pop();

    // Highlight active nav link
    document.querySelectorAll('.nav-links a').forEach(link => {
        if (link.getAttribute('href') === currentPage) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });

    if (currentPage === '' || currentPage === 'index.html') {
        loadHomePageContent();
    } else if (currentPage === 'movies.html') {
        loadMoviesPageContent();
    }
    // You can add more else if for other pages like 'tvshows.html', 'newpopular.html' etc.
}

// Call init when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', init);
