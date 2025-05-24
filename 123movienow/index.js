// index.js
// Homepage JavaScript logic (index.html)

const IMG_URL = window.IMG_URL;
let bannerItems = [];
let currentBannerIndex = 0;
let bannerInterval;

/**
 * Display the banner for a media item.
 * @param {Object} item
 */
function displayBanner(item) {
  const bannerElement = document.getElementById('banner');
  const bannerTitle = document.getElementById('banner-title');
  const bannerDescription = document.getElementById('banner-description');

  if (!bannerElement || !bannerTitle || !bannerDescription) return;

  // Fade out
  bannerElement.style.opacity = 0;
  bannerTitle.style.opacity = 0;
  bannerDescription.style.opacity = 0;

  setTimeout(() => {
    bannerElement.style.backgroundImage = `url(${IMG_URL}${item.backdrop_path})`;
    bannerTitle.textContent = item.title || item.name || 'Untitled';
    bannerDescription.textContent = item.overview || 'No overview available.';
    window.currentItem = item;
    bannerElement.style.opacity = 1;
    bannerTitle.style.opacity = 1;
    bannerDescription.style.opacity = 1;
  }, 500);
}

/**
 * Update navigation dots for the banner slideshow.
 */
function updateBannerDots() {
  const dotsContainer = document.getElementById('banner-nav-dots');
  if (!dotsContainer) return;
  dotsContainer.innerHTML = '';

  bannerItems.forEach((_, idx) => {
    const dot = document.createElement('div');
    dot.classList.add('dot');
    if (idx === currentBannerIndex) dot.classList.add('active');
    dot.onclick = () => {
      clearInterval(bannerInterval);
      currentBannerIndex = idx;
      displayBanner(bannerItems[currentBannerIndex]);
      updateBannerDots();
      startBannerSlideshow();
    };
    dotsContainer.appendChild(dot);
  });
}

/**
 * Start automatic banner slideshow.
 */
function startBannerSlideshow() {
  if (!document.getElementById('banner')) return;
  clearInterval(bannerInterval);

  bannerInterval = setInterval(() => {
    currentBannerIndex = (currentBannerIndex + 1) % bannerItems.length;
    displayBanner(bannerItems[currentBannerIndex]);
    updateBannerDots();
  }, 8000); // 8 seconds per slide
}

/**
 * Load homepage content.
 */
async function loadHomePageContent() {
  // Fetch data using global fetchMedia
  const dailyTrendingMovies = await window.fetchMedia('trending/movie/day');
console.log('Trending Movies:', dailyTrendingMovies);
  const dailyTrendingTvShows = await window.fetchMedia('trending/tv/day');
  const weeklyTrendMovie = await window.fetchMedia('trending/movie/week');

  // By production company/network
  const hboMovies = await window.fetchMedia('discover/movie', '&with_companies=3268&sort_by=popularity.desc');
  const netflixMovies = await window.fetchMedia('discover/movie', '&with_networks=213&sort_by=popularity.desc');
  const marvelMovies = await window.fetchMedia('discover/movie', '&with_companies=420&sort_by=popularity.desc');
  const disneyMovies = await window.fetchMedia('discover/movie', '&with_companies=2&sort_by=popularity.desc');

  // Populate banner: 5 trending movies + 5 trending TV shows
  bannerItems = [...dailyTrendingMovies.slice(0, 5), ...dailyTrendingTvShows.slice(0, 5)];
  if (bannerItems.length > 0) {
    displayBanner(bannerItems[currentBannerIndex]);
    updateBannerDots();
    startBannerSlideshow();
  }

  // Display lists
  window.displayList(dailyTrendingTvShows, 'tvshows-list');
  window.displayList(weeklyTrendMovie, 'weekly-trend-movie-list');
  window.displayList(hboMovies, 'hbo-movies-list');
  window.displayList(netflixMovies, 'netflix-movies-list');
  window.displayList(marvelMovies, 'marvel-movies-list');
  window.displayList(disneyMovies, 'disney-movies-list');
}

// Initialization on DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
  // Scroll event: header background change
  window.addEventListener('scroll', () => {
    const header = document.querySelector('.header');
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  });

  // Highlight active navigation link
  document.querySelectorAll('.nav-links a').forEach(link => {
    const currentPath = window.location.pathname.split('/').pop();
    if (link.getAttribute('href') === 'index.html' || (link.getAttribute('href') === '' && currentPath === '')) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });

  loadHomePageContent();
});
