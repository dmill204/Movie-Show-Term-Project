const API_KEY = 'c85d2944e1e04da39188229cea09e23f';
const BASE_URL = 'https://api.themoviedb.org/3';

$(document).ready(function () {
    // Fetch genres on page load
    fetchGenres();

    // Search button click event
    $('#search-button').click(function () {
        searchMovies();
    });

    // Toggle between Grid and List Views
    $('#grid-view').click(function () {
        if (!$(this).hasClass('btn-primary')) {
            $(this).addClass('btn-primary').removeClass('btn-outline-primary');
            $('#list-view').addClass('btn-outline-secondary').removeClass('btn-secondary');
            displayResults(currentResults); // Re-render the results in Grid View
        }
    });

    $('#list-view').click(function () {
        if (!$(this).hasClass('btn-secondary')) {
            $(this).addClass('btn-secondary').removeClass('btn-outline-secondary');
            $('#grid-view').addClass('btn-outline-primary').removeClass('btn-primary');
            displayResults(currentResults); // Re-render the results in List View
        }
    });

    $('#sort-options').change(function () {
        const sortCriterion = $(this).val(); // Get the selected sorting option
        const sortedResults = sortResults([...currentResults], sortCriterion); // Sort a copy of the current results
        displayResults(sortedResults); // Re-render sorted results
    });

    // Handle "Now Playing" Button
    $('#now-playing-tab').click(function () {
        fetchMoviesForCarousel(`${BASE_URL}/movie/now_playing?api_key=${API_KEY}`, 'Now Playing');
        toggleActiveTab(this); // Highlight the active tab
    });

// Handle "Upcoming Movies" Button
    $('#upcoming-tab').click(function () {
        fetchMoviesForCarousel(`${BASE_URL}/movie/upcoming?api_key=${API_KEY}`, 'Upcoming Movies');
        toggleActiveTab(this); // Highlight the active tab
    });

    // Fetch genres for the dropdown
    function fetchGenres() {
        const url = `${BASE_URL}/genre/movie/list?api_key=${API_KEY}`;

        $.ajax({
            url: url,
            method: 'GET',
            success: function (response) {
                populateGenreDropdown(response.genres);
            },
            error: function () {
                alert('Error fetching genres.');
            }
        });
    }

    // Populate genres in the dropdown
    function populateGenreDropdown(genres) {
        const searchType = $('#search-type');

        genres.forEach(genre => {
            const option = `<option value="genre-${genre.id}">${genre.name}</option>`;
            searchType.append(option);
        });
    }

    // Search for movies based on search type
    function searchMovies() {
        const searchType = $('#search-type').val();
        const query = $('#search-input').val();

        if (searchType === 'keyword') {
            if (query.trim() === '') {
                alert('Please enter a search term.');
                return;
            }
            searchByKeyword(query);
        } else if (searchType.startsWith('genre-')) {
            const genreId = searchType.split('-')[1];
            searchByGenre(genreId);
        } else if (searchType === 'popular') {
            discoverPopularMovies();
        }
    }

    // Search by Keyword
    function searchByKeyword(query) {
        const url = `${BASE_URL}/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(query)}`;

        $.ajax({
            url: url,
            method: 'GET',
            success: function (response) {
                currentResults = response.results; // Store results
                displayResults(currentResults); // Render results
            },
            error: function () {
                alert('Error fetching movie data. Please try again.');
            }
        });
    }

    function searchByGenre(genreId) {
        const url = `${BASE_URL}/discover/movie?api_key=${API_KEY}&with_genres=${genreId}`;

        $.ajax({
            url: url,
            method: 'GET',
            success: function (response) {
                currentResults = response.results; // Store results
                displayResults(currentResults); // Render results
            },
            error: function () {
                alert('Error fetching movies by genre.');
            }
        });
    }

    function discoverPopularMovies() {
        const url = `${BASE_URL}/movie/popular?api_key=${API_KEY}`;

        $.ajax({
            url: url,
            method: 'GET',
            success: function (response) {
                currentResults = response.results; // Store results
                displayResults(currentResults); // Render results
            },
            error: function () {
                alert('Error fetching popular movies.');
            }
        });
    }


    // Display search results in a grid
    function displayResults(movies) {
        const resultsContainer = $('#results');
        resultsContainer.empty();

        if (movies.length === 0) {
            resultsContainer.html('<p class="text-center">No results found.</p>');
            return;
        }

        // Apply sorting based on the selected criterion
        const sortCriterion = $('#sort-options').val();
        const sortedMovies = sortResults([...movies], sortCriterion);

        // Check the current view (Grid or List)
        const isGridView = $('#grid-view').hasClass('btn-primary'); // Active button has primary class

        sortedMovies.forEach(movie => {
            if (isGridView) {
                // Render Grid View
                const gridCard = `
                <div class="col-md-3 mb-4">
                    <div class="card h-100">
                        <img src="https://image.tmdb.org/t/p/w500${movie.poster_path}" class="card-img-top" alt="${movie.title}">
                        <div class="card-body">
                            <h5 class="card-title">${movie.title}</h5>
                            <p class="card-text">${movie.release_date || 'N/A'}</p>
                            <button class="btn btn-primary" onclick="viewDetails(${movie.id})">View Details</button>
                        </div>
                    </div>
                </div>
            `;
                resultsContainer.append(gridCard);
            } else {
                // Render List View
                const listCard = `
                <div class="col-12 mb-4">
                    <div class="card h-100 d-flex flex-row">
                        <img src="https://image.tmdb.org/t/p/w500${movie.poster_path}" class="img-thumbnail" style="max-width: 150px;" alt="${movie.title}">
                        <div class="card-body">
                            <h5 class="card-title">${movie.title}</h5>
                            <p class="card-text">${movie.release_date || 'N/A'}</p>
                            <p class="card-text">${movie.overview.slice(0, 100)}...</p>
                            <button class="btn btn-primary" onclick="viewDetails(${movie.id})">View Details</button>
                        </div>
                    </div>
                </div>
            `;
                resultsContainer.append(listCard);
            }
        });
    }


    // Fetch and display movie details
    window.viewDetails = function (movieId) {
        const url = `${BASE_URL}/movie/${movieId}?api_key=${API_KEY}&append_to_response=credits,reviews`;

        $.ajax({
            url: url,
            method: 'GET',
            success: function (movie) {
                displayDetails(movie);
            },
            error: function () {
                alert('Error fetching movie details.');
            }
        });
    };

    // Show movie details in a modal
    function displayDetails(movie) {
        $('#details-modal-label').text(movie.title);
        const detailsHtml = `
        <div>
            <img src="https://image.tmdb.org/t/p/w500${movie.poster_path}" alt="${movie.title}" class="img-fluid">
            <p>${movie.overview}</p>
            <ul>
                <li><strong>Release Date:</strong> ${movie.release_date || 'N/A'}</li>
                <li><strong>Rating:</strong> ${movie.vote_average || 'N/A'}</li>
            </ul>
            <h5>Cast</h5>
            <ul>
                ${movie.credits.cast
            .slice(0, 5)
            .map(c => `
                        <li>
                            ${c.name} as ${c.character}
                            <button class="btn btn-link" onclick="viewActorDetails(${c.id})">More Info</button>
                        </li>
                    `)
            .join('')}
            </ul>
        </div>
    `;
        $('#details-body').html(detailsHtml);
        $('#details-modal').modal('show');
    }
});

function sortResults(results, criterion) {
    return results.sort((a, b) => {
        if (criterion === 'title-asc') {
            return a.title.localeCompare(b.title);
        } else if (criterion === 'title-desc') {
            return b.title.localeCompare(a.title);
        } else if (criterion === 'release_date-asc') {
            return new Date(a.release_date) - new Date(b.release_date);
        } else if (criterion === 'release_date-desc') {
            return new Date(b.release_date) - new Date(a.release_date);
        } else if (criterion === 'rating-asc') {
            return a.vote_average - b.vote_average;
        } else if (criterion === 'rating-desc') {
            return b.vote_average - a.vote_average;
        }
    });
}

function viewActorDetails(personId) {
    const url = `${BASE_URL}/person/${personId}?api_key=${API_KEY}&append_to_response=movie_credits`;

    $.ajax({
        url: url,
        method: 'GET',
        success: function (person) {
            displayActorDetails(person);
        },
        error: function () {
            alert('Error fetching actor details. Please try again.');
        }
    });
}

function displayActorDetails(person) {
    const actorDetailsHtml = `
            <div>
                <img src="https://image.tmdb.org/t/p/w500${person.profile_path}" alt="${person.name}" class="img-fluid mb-3">
                <h4>${person.name}</h4>
                <p><strong>Birthday:</strong> ${person.birthday || 'N/A'}</p>
                <p><strong>Biography:</strong> ${person.biography || 'No biography available.'}</p>
                <h5>Known For</h5>
                <ul>
                    ${person.movie_credits.cast
        .slice(0, 5)
        .map(movie => `
                            <li>${movie.title || movie.name} (${movie.release_date || 'N/A'})</li>
                        `)
        .join('')}
                </ul>
            </div>
        `;

    // Display in modal
    $('#details-modal-label').text(person.name);
    $('#details-body').html(actorDetailsHtml);
}

// Fetch and Display Movies
function fetchMovies(url, sectionTitle) {
    $.ajax({
        url: url,
        method: 'GET',
        success: function (response) {
            displaySpecialSection(response.results, sectionTitle);
        },
        error: function () {
            alert('Error fetching movies. Please try again.');
        }
    });
}

// Highlight the Active Tab
function toggleActiveTab(activeButton) {
    $('#now-playing-tab, #upcoming-tab').removeClass('btn-primary').addClass('btn-outline-primary');
    $(activeButton).removeClass('btn-outline-primary').addClass('btn-primary');
}

function displaySpecialSection(movies, sectionTitle) {
    const sectionContainer = $('#special-section');
    sectionContainer.empty(); // Clear previous content

    // Add Section Title
    sectionContainer.append(`<h3 class="col-12 mb-4">${sectionTitle}</h3>`);

    // Display Movies
    movies.forEach(movie => {
        const movieCard = `
                <div class="col-md-3 mb-4">
                    <div class="card h-100">
                        <img src="https://image.tmdb.org/t/p/w500${movie.poster_path}" class="card-img-top" alt="${movie.title}">
                        <div class="card-body">
                            <h5 class="card-title">${movie.title}</h5>
                            <p class="card-text">${movie.release_date || 'N/A'}</p>
                            <button class="btn btn-primary" onclick="viewDetails(${movie.id})">View Details</button>
                        </div>
                    </div>
                </div>
            `;
        sectionContainer.append(movieCard);
    });
}

// Fetch and Populate Carousel Data
function fetchMoviesForCarousel(url, sectionTitle) {
    $.ajax({
        url: url,
        method: 'GET',
        success: function (response) {
            displayCarousel(response.results, sectionTitle);
        },
        error: function () {
            alert('Error fetching movies. Please try again.');
        }
    });
}

// Display Movies in the Carousel
function displayCarousel(movies, sectionTitle) {
    const carouselContent = $('#carousel-content');
    carouselContent.empty(); // Clear existing content

    // Add Section Title Above Carousel
    $('#movie-carousel').prev('h3').remove(); // Remove previous title
    $('#movie-carousel').before(`<h3 class="mb-4 text-center">${sectionTitle}</h3>`);

    // Generate Carousel Items
    movies.forEach((movie, index) => {
        const isActive = index === 0 ? 'active' : ''; // First slide should be active
        const carouselItem = `
                <div class="carousel-item ${isActive}">
                    <div class="d-flex justify-content-center">
                        <div class="card" style="width: 18rem;">
                            <img src="https://image.tmdb.org/t/p/w500${movie.poster_path}" class="card-img-top" alt="${movie.title}">
                            <div class="card-body">
                                <h5 class="card-title">${movie.title}</h5>
                                <p class="card-text">${movie.release_date || 'N/A'}</p>
                                <button class="btn btn-primary" onclick="viewDetails(${movie.id})">View Details</button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        carouselContent.append(carouselItem);
    });
}

// Highlight the Active Tab
function toggleActiveTab(activeButton) {
    $('#now-playing-tab, #upcoming-tab').removeClass('btn-primary').addClass('btn-outline-primary');
    $(activeButton).removeClass('btn-outline-primary').addClass('btn-primary');
}