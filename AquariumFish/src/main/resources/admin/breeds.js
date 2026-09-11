/**
 * ==========================================================================
 * Aquarium Fish - Breeds Page JavaScript
 * Frontend logic for browsing, searching, filtering, and sorting fish breeds.
 * ==========================================================================
 */

// API Configuration Constants
const API_BASE_URL = "http://localhost:8080/api";
const USE_MOCK_DATA = true;
const BREED_ENDPOINT = "/breeds";

// State Management
let allBreeds = [];
let filteredBreeds = [];
let currentSearchQuery = "";
let currentCategoryFilter = "all";
let currentSortOption = "name-asc";

// DOMContentLoaded Initialization
document.addEventListener("DOMContentLoaded", () => {
    initPage();
});

/**
 * Main initialization orchestrator.
 */
async function initPage() {
    setupEventListeners();
    updateCartBadge();
    checkUrlParameters();
    await loadBreeds();
}

/**
 * Register all user interaction event listeners.
 */
function setupEventListeners() {
    // Mobile Navigation Toggle
    const mobileMenuToggle = document.getElementById("mobileMenuToggle");
    const mainNav = document.getElementById("mainNav");

    if (mobileMenuToggle && mainNav) {
        mobileMenuToggle.addEventListener("click", () => {
            const isExpanded = mobileMenuToggle.getAttribute("aria-expanded") === "true";
            mobileMenuToggle.setAttribute("aria-expanded", !isExpanded);
            mainNav.classList.toggle("active");
            const icon = mobileMenuToggle.querySelector("i");
            if (icon) {
                icon.className = isExpanded ? "fa-solid fa-bars" : "fa-solid fa-xmark";
            }
        });

        // Close mobile menu when clicking outside
        document.addEventListener("click", (e) => {
            if (!mainNav.contains(e.target) && !mobileMenuToggle.contains(e.target) && mainNav.classList.contains("active")) {
                mainNav.classList.remove("active");
                mobileMenuToggle.setAttribute("aria-expanded", "false");
                const icon = mobileMenuToggle.querySelector("i");
                if (icon) icon.className = "fa-solid fa-bars";
            }
        });
    }

    // Hero Search Input & Button
    const heroSearchInput = document.getElementById("heroSearchInput");
    const heroSearchBtn = document.getElementById("heroSearchBtn");

    if (heroSearchInput) {
        heroSearchInput.addEventListener("input", debounce((e) => {
            handleSearch(e.target.value);
        }, 300));

        heroSearchInput.addEventListener("keydown", (e) => {
            if (e.key === "Enter") {
                handleSearch(e.target.value);
            }
        });
    }

    if (heroSearchBtn && heroSearchInput) {
        heroSearchBtn.addEventListener("click", () => {
            handleSearch(heroSearchInput.value);
        });
    }

    // Filter Chips
    const filterChips = document.querySelectorAll(".filter-chip");
    filterChips.forEach(chip => {
        chip.addEventListener("click", (e) => {
            filterChips.forEach(c => c.classList.remove("active"));
            e.target.classList.add("active");
            currentCategoryFilter = e.target.getAttribute("data-filter");
            applyFiltersAndSort();
        });
    });

    // Sort Select
    const sortSelect = document.getElementById("sortSelect");
    if (sortSelect) {
        sortSelect.addEventListener("change", (e) => {
            currentSortOption = e.target.value;
            applyFiltersAndSort();
        });
    }

    // Clear Filters Buttons
    const clearFiltersBtn = document.getElementById("clearFiltersBtn");
    const emptyClearBtn = document.getElementById("emptyClearBtn");

    [clearFiltersBtn, emptyClearBtn].forEach(btn => {
        if (btn) {
            btn.addEventListener("click", () => {
                resetFilters();
                showToast("Filters cleared successfully", "info");
            });
        }
    });

    // Retry Button for Errors
    const retryFetchBtn = document.getElementById("retryFetchBtn");
    if (retryFetchBtn) {
        retryFetchBtn.addEventListener("click", () => {
            loadBreeds();
        });
    }

    // Modal Events
    const modalBackdrop = document.getElementById("breedModalBackdrop");
    const modalCloseBtn = document.getElementById("modalCloseBtn");

    if (modalCloseBtn && modalBackdrop) {
        modalCloseBtn.addEventListener("click", closeBreedPreview);
        modalBackdrop.addEventListener("click", (e) => {
            if (e.target === modalBackdrop) closeBreedPreview();
        });
        document.addEventListener("keydown", (e) => {
            if (e.key === "Escape" && modalBackdrop.classList.contains("active")) {
                closeBreedPreview();
            }
        });
    }
}

/**
 * Check URL search parameters on page load.
 */
function checkUrlParameters() {
    const params = new URLSearchParams(window.location.search);
    const searchParam = params.get("search");
    const breedIdParam = params.get("breedId");

    if (searchParam) {
        currentSearchQuery = searchParam.toLowerCase();
        const heroSearchInput = document.getElementById("heroSearchInput");
        if (heroSearchInput) heroSearchInput.value = searchParam;
    }

    if (breedIdParam) {
        // TODO BACKEND:
        // If specific breedId is requested, we can pre-open its preview modal or highlight it.
    }
}

/**
 * Load breed data from backend REST API or fallback to mock mode.
 */
async function loadBreeds() {
    showLoadingState();

    try {
        let rawData;
        if (USE_MOCK_DATA) {
            // Simulate slight network latency for realistic UX
            await new Promise(resolve => setTimeout(resolve, 400));
            rawData = getMockBreeds();
            const demoBar = document.getElementById("demoIndicatorBar");
            if (demoBar) demoBar.style.display = "flex";
        } else {
            // TODO BACKEND: Connect real GET endpoint
            // GET /api/breeds
            const response = await fetch(`${API_BASE_URL}${BREED_ENDPOINT}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    ...getAuthHeaders()
                }
            });

            if (!response.ok) {
                throw new Error(`Server returned status ${response.status}`);
            }
            rawData = await response.json();
        }

        allBreeds = rawData.map(normalizeBreed);
        applyFiltersAndSort();
        renderPopularBreeds();

    } catch (error) {
        console.error("Failed to load breeds:", error);
        showErrorState(error.message || "Unable to connect to the server.");
    }
}

/**
 * Normalize backend JPA Entity / DTO responses.
 */
function normalizeBreed(breed) {
    // Note for Backend: To prevent recursive JSON serialization loops or oversized payloads
    // when serializing JPA Entity relationships (Fish_Breed -> List<Fish>), always return
    // lightweight DTO responses containing fishCount instead of full nested fish collections.
    return {
        id: breed.id,
        breedName: breed.breedName ?? "Unknown Breed",
        description: breed.description ?? "No description available for this aquarium breed.",
        fishCount: breed.fishCount ?? Math.floor(Math.random() * 15) + 3,
        imageUrl: breed.imageUrl ?? "",
        categoryGroup: breed.categoryGroup ?? getMockCategoryGroup(breed.breedName),
        isPopular: breed.isPopular ?? (breed.id <= 4)
    };
}

/**
 * Generate 15+ realistic mock breeds.
 */
function getMockBreeds() {
    return [
        { id: 1, breedName: "Betta", description: "Colorful freshwater fish known for their flowing fins and striking colors.", fishCount: 12, imageUrl: "images/breeds/betta.jpg", categoryGroup: "freshwater", isPopular: true },
        { id: 2, breedName: "Guppy", description: "Hardy, active livebearer fish featuring radiant tails and easy breeding habits.", fishCount: 18, imageUrl: "images/breeds/guppy.jpg", categoryGroup: "beginner", isPopular: true },
        { id: 3, breedName: "Neon Tetra", description: "Small peaceful schooling fish with vibrant iridescent blue and red coloration.", fishCount: 15, imageUrl: "images/breeds/neon-tetra.jpg", categoryGroup: "community", isPopular: true },
        { id: 4, breedName: "Angelfish", description: "Elegant freshwater cichlids with distinctive triangular body shapes and long flowing fins.", fishCount: 9, imageUrl: "images/breeds/angelfish.jpg", categoryGroup: "freshwater", isPopular: true },
        { id: 5, breedName: "Discus", description: "The king of aquarium fish, prized for their majestic disc shape and vibrant patterns.", fishCount: 7, imageUrl: "images/breeds/discus.jpg", categoryGroup: "tropical", isPopular: false },
        { id: 6, breedName: "Molly", description: "Adaptable livebearers that thrive in freshwater and brackish aquatic setups.", fishCount: 14, imageUrl: "images/breeds/molly.jpg", categoryGroup: "beginner", isPopular: false },
        { id: 7, breedName: "Platy", description: "Peaceful, energetic community fish available in a rainbow of bright color morphs.", fishCount: 11, imageUrl: "images/breeds/platy.jpg", categoryGroup: "beginner", isPopular: false },
        { id: 8, breedName: "Swordtail", description: "Active swimmers recognized by the distinctive sword-like extension on the male's tail fin.", fishCount: 10, imageUrl: "images/breeds/swordtail.jpg", categoryGroup: "freshwater", isPopular: false },
        { id: 9, breedName: "Oscar", description: "Intelligent, large South American cichlid with immense personality and presence.", fishCount: 5, imageUrl: "images/breeds/oscar.jpg", categoryGroup: "tropical", isPopular: false },
        { id: 10, breedName: "Goldfish", description: "Classic coldwater pond and aquarium favorites with graceful swimming motions.", fishCount: 16, imageUrl: "images/breeds/goldfish.jpg", categoryGroup: "beginner", isPopular: false },
        { id: 11, breedName: "Koi", description: "Majestic pond fish celebrated for their striking ornamental patterns and longevity.", fishCount: 6, imageUrl: "images/breeds/koi.jpg", categoryGroup: "saltwater", isPopular: false },
        { id: 12, breedName: "Cherry Barb", description: "Peaceful schooling barb featuring rich ruby-red coloration in mature males.", fishCount: 13, imageUrl: "images/breeds/cherry-barb.jpg", categoryGroup: "community", isPopular: false },
        { id: 13, breedName: "Tiger Barb", description: "Active, playful schooling fish adorned with bold vertical black stripes.", fishCount: 14, imageUrl: "images/breeds/tiger-barb.jpg", categoryGroup: "community", isPopular: false },
        { id: 14, breedName: "Corydoras", description: "Charming bottom-dwelling armored catfish that keep the aquarium substrate clean.", fishCount: 20, imageUrl: "images/breeds/corydoras.jpg", categoryGroup: "community", isPopular: false },
        { id: 15, breedName: "Gourami", description: "Labyrinth fish possessing specialized breathing organs and gentle temperaments.", fishCount: 8, imageUrl: "images/breeds/gourami.jpg", categoryGroup: "tropical", isPopular: false }
    ];
}

/**
 * Assign fallback category grouping for mock breeds.
 */
function getMockCategoryGroup(name) {
    const lower = name.toLowerCase();
    if (["betta", "angelfish", "swordtail"].includes(lower)) return "freshwater";
    if (["guppy", "molly", "platy", "goldfish"].includes(lower)) return "beginner";
    if (["neon tetra", "cherry barb", "tiger barb", "corydoras"].includes(lower)) return "community";
    if (["discus", "oscar", "gourami"].includes(lower)) return "tropical";
    return "freshwater";
}

/**
 * Client-side Search, Filter & Sort Pipeline.
 */
function applyFiltersAndSort() {
    // 1. Search
    filteredBreeds = allBreeds.filter(breed => {
        const query = currentSearchQuery.trim();
        if (!query) return true;
        return breed.breedName.toLowerCase().includes(query) ||
            breed.description.toLowerCase().includes(query);
    });

    // 2. Filter by Category/Group
    if (currentCategoryFilter !== "all") {
        if (currentCategoryFilter === "popular") {
            filteredBreeds = filteredBreeds.filter(b => b.isPopular);
        } else {
            filteredBreeds = filteredBreeds.filter(b => b.categoryGroup === currentCategoryFilter);
        }
    }

    // 3. Sort
    filteredBreeds.sort((a, b) => {
        switch (currentSortOption) {
            case "name-desc":
                return b.breedName.localeCompare(a.breedName);
            case "count-desc":
                return (b.fishCount || 0) - (a.fishCount || 0);
            case "count-asc":
                return (a.fishCount || 0) - (b.fishCount || 0);
            case "name-asc":
            default:
                return a.breedName.localeCompare(b.breedName);
        }
    });

    renderBreeds();
}

/**
 * Handle debounced search input.
 */
function handleSearch(query) {
    currentSearchQuery = query.toLowerCase();
    applyFiltersAndSort();

    // Optionally update URL state without full page reload
    const url = new URL(window.location);
    if (query.trim()) {
        url.searchParams.set("search", query.trim());
    } else {
        url.searchParams.delete("search");
    }
    history.replaceState({}, "", url);
}

/**
 * Reset all active filters and search queries.
 */
function resetFilters() {
    currentSearchQuery = "";
    currentCategoryFilter = "all";
    currentSortOption = "name-asc";

    const heroSearchInput = document.getElementById("heroSearchInput");
    if (heroSearchInput) heroSearchInput.value = "";

    const sortSelect = document.getElementById("sortSelect");
    if (sortSelect) sortSelect.value = "name-asc";

    const filterChips = document.querySelectorAll(".filter-chip");
    filterChips.forEach(c => {
        if (c.getAttribute("data-filter") === "all") c.classList.add("active");
        else c.classList.remove("active");
    });

    const url = new URL(window.location);
    url.searchParams.delete("search");
    history.replaceState({}, "", url);

    applyFiltersAndSort();
}

/**
 * Render the main breed grid.
 */
function renderBreeds() {
    const grid = document.getElementById("breedGrid");
    const emptyState = document.getElementById("emptyState");
    const errorState = document.getElementById("errorState");
    const loadingState = document.getElementById("loadingState");
    const resultsCounter = document.getElementById("resultsCounter");
    const clearFiltersBtn = document.getElementById("clearFiltersBtn");

    if (loadingState) loadingState.style.display = "none";
    if (errorState) errorState.style.display = "none";

    // Update results counter
    if (resultsCounter) {
        resultsCounter.textContent = `Showing ${filteredBreeds.length} of ${allBreeds.length} breeds`;
    }

    // Show/hide Clear Filters button
    if (clearFiltersBtn) {
        const isFiltered = currentSearchQuery !== "" || currentCategoryFilter !== "all";
        clearFiltersBtn.style.display = isFiltered ? "inline-block" : "none";
    }

    if (filteredBreeds.length === 0) {
        if (grid) grid.innerHTML = "";
        if (emptyState) emptyState.style.display = "block";
        return;
    }

    if (emptyState) emptyState.style.display = "none";
    if (grid) {
        grid.innerHTML = filteredBreeds.map(renderBreedCard).join("");

        // Attach click handlers to cards for preview or direct navigation
        grid.querySelectorAll(".breed-card").forEach(card => {
            const breedId = card.getAttribute("data-breed-id");
            const browseBtn = card.querySelector(".breed-action-btn");

            browseBtn.addEventListener("click", (e) => {
                e.stopPropagation();
                navigateToBreed(breedId);
            });

            card.addEventListener("click", () => {
                openBreedPreview(breedId);
            });
        });
    }
}

/**
 * Generate HTML string for a single breed card.
 */
function renderBreedCard(breed) {
    const safeName = escapeHtml(breed.breedName);
    const safeDesc = escapeHtml(breed.description);
    const safeImg = getSafeImageUrl(breed.imageUrl, breed.breedName);

    return `
        <article class="breed-card" data-breed-id="${breed.id}" tabindex="0" aria-label="${safeName} breed card">
            <div class="breed-img-container">
                ${breed.isPopular ? '<span class="popular-badge"><i class="fa-solid fa-star"></i> Popular</span>' : ''}
                ${safeImg.includes("fallback") ? `
                    <div class="breed-img-fallback">
                        <i class="fa-solid fa-fish"></i>
                        <span>${safeName}</span>
                    </div>
                ` : `
                    <img src="${safeImg}" alt="${safeName}" class="breed-img" loading="lazy" onerror="this.replaceWith(createImageFallback('${safeName}'))">
                `}
            </div>
            <div class="breed-card-content">
                <h3 class="breed-name">${safeName}</h3>
                <p class="breed-desc">${safeDesc}</p>
                <div class="breed-meta">
                    <i class="fa-solid fa-fish-fins"></i>
                    <span>${breed.fishCount !== null ? `${breed.fishCount} Fish Available` : 'View Species'}</span>
                </div>
                <button type="button" class="breed-action-btn">
                    <span>Browse Fish</span>
                    <i class="fa-solid fa-arrow-right"></i>
                </button>
            </div>
        </article>
    `;
}

/**
 * Render Popular Breeds section.
 */
function renderPopularBreeds() {
    const popularGrid = document.getElementById("popularBreedsGrid");
    if (!popularGrid) return;

    const popularList = allBreeds.filter(b => b.isPopular).slice(0, 4);
    if (popularList.length === 0) return;

    popularGrid.innerHTML = popularList.map(renderBreedCard).join("");

    popularGrid.querySelectorAll(".breed-card").forEach(card => {
        const breedId = card.getAttribute("data-breed-id");
        const browseBtn = card.querySelector(".breed-action-btn");

        browseBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            navigateToBreed(breedId);
        });

        card.addEventListener("click", () => {
            openBreedPreview(breedId);
        });
    });
}

/**
 * Helper to generate image fallback element when an image fails to load.
 */
function createImageFallback(breedName) {
    const div = document.createElement("div");
    div.className = "breed-img-fallback";
    div.innerHTML = `
        <i class="fa-solid fa-fish"></i>
        <span>${escapeHtml(breedName)}</span>
    `;
    return div;
}

/**
 * Open Breed Quick Preview Modal.
 */
function openBreedPreview(breedId) {
    const breed = allBreeds.find(b => b.id == breedId);
    if (!breed) return;

    const modalBackdrop = document.getElementById("breedModalBackdrop");
    const modalBodyContent = document.getElementById("modalBodyContent");

    if (modalBodyContent) {
        const safeName = escapeHtml(breed.breedName);
        const safeDesc = escapeHtml(breed.description);
        const safeImg = getSafeImageUrl(breed.imageUrl, breed.breedName);

        modalBodyContent.innerHTML = `
            <div class="modal-breed-preview">
                <div class="modal-img-container">
                    <img src="${safeImg}" alt="${safeName}" class="modal-img" onerror="this.style.display='none'">
                </div>
                <div class="modal-details">
                    <h2 id="modalBreedName">${safeName}</h2>
                    <span class="modal-count"><i class="fa-solid fa-fish-fins"></i> ${breed.fishCount} Fish Available in Catalog</span>
                    <p>${safeDesc}</p>
                    <div style="display: flex; gap: 1rem; flex-wrap: wrap;">
                        <button type="button" class="btn btn-primary" onclick="navigateToBreed(${breed.id})">
                            Browse ${safeName} Fish <i class="fa-solid fa-arrow-right"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    if (modalBackdrop) {
        modalBackdrop.classList.add("active");
        modalBackdrop.setAttribute("aria-hidden", "false");
        document.body.style.overflow = "hidden";
    }
}

/**
 * Close Breed Quick Preview Modal.
 */
function closeBreedPreview() {
    const modalBackdrop = document.getElementById("breedModalBackdrop");
    if (modalBackdrop) {
        modalBackdrop.classList.remove("active");
        modalBackdrop.setAttribute("aria-hidden", "true");
        document.body.style.overflow = "";
    }
}

/**
 * Navigate to fish catalog filtered by breed ID.
 */
function navigateToBreed(breedId) {
    // TODO BACKEND:
    // Fish page should read breedId from URL parameter and request/filter the fish catalog accordingly.
    showToast("Opening fish collection...", "info");
    setTimeout(() => {
        window.location.href = `fish.html?breedId=${breedId}`;
    }, 300);
}

/**
 * Show loading skeleton state.
 */
function showLoadingState() {
    const loadingState = document.getElementById("loadingState");
    const breedGrid = document.getElementById("breedGrid");
    const emptyState = document.getElementById("emptyState");
    const errorState = document.getElementById("errorState");

    if (loadingState) loadingState.style.display = "grid";
    if (breedGrid) breedGrid.innerHTML = "";
    if (emptyState) emptyState.style.display = "none";
    if (errorState) errorState.style.display = "none";
}

/**
 * Show error state.
 */
function showErrorState(message) {
    const loadingState = document.getElementById("loadingState");
    const errorState = document.getElementById("errorState");
    const errorMessageText = document.getElementById("errorMessageText");

    if (loadingState) loadingState.style.display = "none";
    if (errorState) errorState.style.display = "block";
    if (errorMessageText) errorMessageText.textContent = message;
}

/**
 * Update cart quantity badge in navbar.
 */
function updateCartBadge() {
    // TODO BACKEND:
    // Replace mock value with GET /api/cart/count or project's actual cart endpoint.
    const cartBadge = document.getElementById("cartBadge");
    if (cartBadge) {
        const savedCart = localStorage.getItem("aquarium_cart");
        let count = 0;
        if (savedCart) {
            try {
                const cartItems = JSON.parse(savedCart);
                count = cartItems.reduce((acc, item) => acc + (item.qty || 1), 0);
            } catch (e) {
                count = 0;
            }
        }
        cartBadge.textContent = count;
    }
}

/**
 * Reusable Toast Notification System.
 */
function showToast(message, type = "info") {
    const container = document.getElementById("toast-container");
    if (!container) return;

    const toast = document.createElement("div");
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <i class="fa-solid ${type === 'error' ? 'fa-circle-exclamation' : 'fa-circle-check'}"></i>
        <span>${escapeHtml(message)}</span>
    `;

    container.appendChild(toast);
    setTimeout(() => {
        toast.remove();
    }, 4000);
}

/**
 * XSS Security Protection Helper.
 */
function escapeHtml(value) {
    if (typeof value !== "string") return value;
    return value
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

/**
 * Image URL Safety Helper.
 */
function getSafeImageUrl(imageUrl, breedName) {
    if (!imageUrl || typeof imageUrl !== "string") {
        return "fallback";
    }
    // Prevent dangerous schemes such as javascript:
    if (imageUrl.toLowerCase().startsWith("javascript:") || imageUrl.toLowerCase().startsWith("data:")) {
        return "fallback";
    }
    return imageUrl;
}

/**
 * Debounce Utility.
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Authentication Header Helper.
 */
function getAuthHeaders() {
    const token = localStorage.getItem("accessToken");
    return token ? { Authorization: `Bearer ${token}` } : {};
}