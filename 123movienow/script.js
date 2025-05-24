const exampleMovies = [
  {
    title: "The Matrix",
    description: "A computer hacker learns about the true nature of reality.",
    img: "https://image.tmdb.org/t/p/w200/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg",
    video: "https://www.youtube.com/embed/vKQi3bBA1y8",
    rating: "8.7"
  }
];

function renderMovies(sectionId, movies) {
  const container = document.getElementById(sectionId);
  if (!container) return;
  container.innerHTML = "";
  movies.forEach(movie => {
    const movieDiv = document.createElement("div");
    movieDiv.className = "movie-item";
    movieDiv.innerHTML = `
      <img src="${movie.img}" alt="${movie.title}">
      <span>${movie.title}</span>
    `;
    container.appendChild(movieDiv);
  });
}

document.addEventListener("DOMContentLoaded", function() {
  renderMovies("popular-movies-list", exampleMovies);
  // (repeat for other sections)
});
