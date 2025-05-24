const API_KEY = 'a1e72fd93ed59f56e6332813b9f8dcae'; // Your TMDb API Key
const BASE_URL = 'https://api.themoviedb.org/3';
const IMG_URL = 'https://image.tmdb.org/t/p/w500';
let currentItem; // To store the currently selected item for modal details

// New variables for banner slideshow
let bannerItems = [];
let currentBannerIndex = 0;
let bannerInterval; // To hold the interval ID

// Function to fetch trending movies/tv shows (now specifically daily trending)
async function fetchTrending(type) {
    const res = await fetch(`${BASE_URL}/trending/${type}/day?api_key=${API_KEY}`);
    const data = await res.json();
    return data.results;
}

// Function to fetch weekly trending movies
async function fetchWeeklyTrendingMovies() {
    const res = await fetch(`${BASE_URL}/trending/movie/week?api_key=${API_KEY}`);
    const data = await res.json();
    return data.results;
}

// NEW: Function to fetch movies by production company
async function fetchMoviesByCompany(companyId) {
    // You can adjust sort_by as needed, e.g., 'vote_average.desc' for "top"
    const res = await fetch(`${BASE_URL}/discover/movie?api_key=${API_KEY}&with_companies=${companyId}&sort_by=popularity.desc`);
    const data = await res.json();
    return data.results;
}

// NEW: Function to fetch movies by network (useful for Netflix originals)
async function fetchMoviesByNetwork(networkId) {
    const res = await fetch(`${BASE_URL}/discover/movie?api_key=${API_KEY}&with_networks=${networkId}&sort_by=popularity.desc`);
    const data = await res.json();
    return data.results;
}

// Function to display the main banner
function displayBanner(item) {
    const bannerElement = document.getElementById('banner');
    const bannerTitle = document.getElementById('banner-title');
    const bannerDescription = document.getElementById('banner-description');

    // Apply fade-out effect
    bannerElement.style.opacity = 0;
    bannerTitle.style.opacity = 0;
    bannerDescription.style.opacity = 0;

    // After fade-out, change content and fade in
    setTimeout(() => {
        bannerElement.style.backgroundImage = `url(${IMG_URL}${item.backdrop_path}`;
        bannerTitle.textContent = item.title || item.name;
        bannerDescription.textContent = item.overview;
        currentItem = item; // Set the current item for the banner as well

        // Apply fade-in effect
        bannerElement.style.opacity = 1;
        bannerTitle.style.opacity = 1;
        bannerDescription.style.opacity = 1;
    }, 500); // Half of the transition duration in CSS


