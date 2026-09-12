/**
 * Aquarium Fish E-Commerce - My Reviews JavaScript Controller
 */

// Configuration & Mode
const API_BASE_URL = "http://localhost:8080/api";
const USE_MOCK_DATA = true; // Toggle for development without backend

// Page State
let state = {
    reviews: [],
    eligibleReviews: [],
    filteredReviews: [],
    cartCount: 0,
    currentPage: 1,
    pageSize: 6,
    isLoading: false,
    hasError: false,
    searchQuery: "",
    ratingFilter: "all",
    sortFilter: "newest",
    currentEditingReviewId: null,
    isDirty: false
};

// Mock Dataset
let mockReviewsDatabase = [
    {
        id: 1,
        rating: 5,
        comment: "Beautiful and healthy fish. It adapted quickly to my aquarium and looks fantastic.",
        reviewDate: "2026-08-12",
        fish: {
            id: 15,
            fishName: "Blue Gourami",
            price: 4500,
            primaryImage: "https://images.unsplash.com/photo-1522069169874-c58ec4b76be5?w=500&auto=format&fit=crop"
        }
    },
    {
        id: 2,
        rating: 4,
        comment: "Very active and swims elegantly around the plants. Packaging and delivery were great.",
        reviewDate: "2026-07-28",
        fish: {
            id: 21,
            fishName: "Angelfish",
            price: 6500,
            primaryImage: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=500&auto=format&fit=crop"
        }
    },
    {
        id: 3,
        rating: 5,
        comment: "Stunning colors! Shipped safely and started eating right away.",
        reviewDate: "2026-06-15",
        fish: {
            id: 8,
            fishName: "Betta Fish",
            price: 2500,
            primaryImage: "https://images.unsplash.com/photo-1534567153574-2b12153a87f0?w=500&auto=format&fit=crop"
        }
    },
    {
        id: 4,
        rating: 3,
        comment: "Decent fish, took a couple of days to settle in with the community tankmates.",
        reviewDate: "2026-05-20",
        fish: {
            id: 12,
            fishName: "Goldfish",
            price: 1800,
            primaryImage: "https://images.unsplash.com/photo-1524704654690-b56c05c78a00?w=500&auto=format&fit=crop"
        }
    },
    {
        id: 5,
        rating: 5,
        comment: "Extremely vibrant schooling fish. They add so much life to the middle column!",
        reviewDate: "2026-04-10",
        fish: {
            id: 19,
            fishName: "Neon Tetra",
            price: 800,
            primaryImage: "https://images.unsplash.com/photo-1520315342628-6ea88a3f6a62?w=500&auto=format&fit=crop"
        }
    }
];

let mockEligibleDatabase = [
    {
        id: 33,
        fishName: "Discus Fish",
        purchaseDate: "Aug 28, 2026",
        primaryImage: "https://images.unsplash.com/photo-1522069169874-c58ec4b76be5?w=500&auto=format&fit=crop"
    },
    {
        id: 41,
        fishName: "Guppy",
        purchaseDate: "Sep 02, 2026",
        primaryImage: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=500&auto=format&fit=crop"
    }
];

// DOM Element References
const D = {
    demoBadge: document.getElementById("demoModeBadge"),
    mainNav: document.getElementById("mainNav"),
    hamburgerBtn: document.getElementById("hamburgerBtn"),
    profileDropdownBtn: document.getElementById("profileDropdownBtn"),
    profileDropdown: document.getElementById("profileDropdown"),
    logoutBtn: document.getElementById("logoutBtn"),
    cartCount: document.getElementById("cartCount"),

    authErrorContainer: document.getElementById("authErrorContainer"),
    dashboardContent: document.getElementById("dashboardContent"),

    statTotalReviews: document.getElementById("statTotalReviews"),
    statAvgRating: document.getElementById("statAvgRating"),
    statAvgStars: document.getElementById("statAvgStars"),
    statFiveStarCount: document.getElementById("statFiveStarCount"),
    statLatestReviewDate: document.getElementById("statLatestReviewDate"),

    ratingDistributionList: document.getElementById("ratingDistributionList"),
    searchInput: document.getElementById("searchInput"),
    ratingFilter: document.getElementById("ratingFilter"),
    sortFilter: document.getElementById("sortFilter"),
    clearFiltersBtn: document.getElementById("clearFiltersBtn"),
    clearSearchFiltersBtn: document.getElementById("clearSearchFiltersBtn"),

    eligibleSection: document.getElementById("eligibleSection"),
    eligibleFishGrid: document.getElementById("eligibleFishGrid"),

    filteredCountBadge: document.getElementById("filteredCountBadge"),
    loadingSkeleton: document.getElementById("loadingSkeleton"),
    errorStateContainer: document.getElementById("errorStateContainer"),
    emptyStateContainer: document.getElementById("emptyStateContainer"),
    searchEmptyStateContainer: document.getElementById("searchEmptyStateContainer"),
    retryLoadBtn: document.getElementById("retryLoadBtn"),
    reviewsGrid: document.getElementById("reviewsGrid"),
    paginationContainer: document.getElementById("paginationContainer"),

    // Modals
    reviewModal: document.getElementById("reviewModal"),
    modalTitle: document.getElementById("modalTitle"),
    modalCloseBtn: document.getElementById("modalCloseBtn"),
    reviewForm: document.getElementById("reviewForm"),
    reviewModalId: document.getElementById("reviewModalId"),
    reviewModalFishId: document.getElementById("reviewModalFishId"),
    modalFishNameDisplay: document.getElementById("modalFishNameDisplay"),
    starRatingSelector: document.getElementById("starRatingSelector"),
    selectedRatingInput: document.getElementById("selectedRatingInput"),
    reviewCommentInput: document.getElementById("reviewCommentInput"),
    charCount: document.getElementById("charCount"),
    modalCancelBtn: document.getElementById("modalCancelBtn"),
    modalSubmitBtn: document.getElementById("modalSubmitBtn"),

    deleteModal: document.getElementById("deleteModal"),
    deleteModalCloseBtn: document.getElementById("deleteModalCloseBtn"),
    deleteReviewIdTarget: document.getElementById("deleteReviewIdTarget"),
    deleteCancelBtn: document.getElementById("deleteCancelBtn"),
    confirmDeleteBtn: document.getElementById("confirmDeleteBtn"),

    unsavedModal: document.getElementById("unsavedModal"),
    keepEditingBtn: document.getElementById("keepEditingBtn"),
    discardChangesBtn: document.getElementById("discardChangesBtn"),

    toastContainer: document.getElementById("toastContainer")
};

// Initialization
document.addEventListener("DOMContentLoaded", () => {
    initApp();
});

async function initApp() {
    if (USE_MOCK_DATA) {
        if (D.demoBadge) D.demoBadge.style.display = "block";
    }

    setupEventListeners();
    readUrlParams();
    await loadCartCount();
    await loadPageData();
}

// Event Listeners Setup
function setupEventListeners() {
    // Hamburger menu toggle
    if (D.hamburgerBtn) {
        D.hamburgerBtn.addEventListener("click", () => {
            D.mainNav.classList.toggle("show");
        });
    }

    // Profile dropdown toggle
    if (D.profileDropdownBtn) {
        D.profileDropdownBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            D.profileDropdown.classList.toggle("show");
        });
    }

    document.addEventListener("click", () => {
        if (D.profileDropdown) D.profileDropdown.classList.remove("show");
        if (D.mainNav) D.mainNav.classList.remove("show");
    });

    // Search input with debounce
    let searchDebounce;
    if (D.searchInput) {
        D.searchInput.addEventListener("input", (e) => {
            clearTimeout(searchDebounce);
            searchDebounce = setTimeout(() => {
                state.searchQuery = e.target.value.trim();
                state.currentPage = 1;
                updateUrlParams();
                applyFiltersAndRender();
            }, 300);
        });
    }

    // Rating and Sort filters
    if (D.ratingFilter) {
        D.ratingFilter.addEventListener("change", (e) => {
            state.ratingFilter = e.target.value;
            state.currentPage = 1;
            updateUrlParams();
            applyFiltersAndRender();
        });
    }

    if (D.sortFilter) {
        D.sortFilter.addEventListener("change", (e) => {
            state.sortFilter = e.target.value;
            state.currentPage = 1;
            updateUrlParams();
            applyFiltersAndRender();
        });
    }

    // Clear filters
    if (D.clearFiltersBtn) D.clearFiltersBtn.addEventListener("click", resetFilters);
    if (D.clearSearchFiltersBtn) D.clearSearchFiltersBtn.addEventListener("click", resetFilters);
    if (D.retryLoadBtn) D.retryLoadBtn.addEventListener("click", loadPageData);

    // Modal Events
    if (D.modalCloseBtn) D.modalCloseBtn.addEventListener("click", requestCloseReviewModal);
    if (D.modalCancelBtn) D.modalCancelBtn.addEventListener("click", requestCloseReviewModal);
    if (D.deleteModalCloseBtn) D.deleteModalCloseBtn.addEventListener("click", () => closeModals());
    if (D.deleteCancelBtn) D.deleteCancelBtn.addEventListener("click", () => closeModals());

    // Star rating picker
    if (D.starRatingSelector) {
        const stars = D.starRatingSelector.querySelectorAll("i");
        stars.forEach(star => {
            star.addEventListener("click", () => {
                const val = parseInt(star.getAttribute("data-rating"));
                setStarSelection(val);
                state.isDirty = true;
            });
            star.addEventListener("mouseover", () => {
                const val = parseInt(star.getAttribute("data-rating"));
                highlightStars(val);
            });
        });
        D.starRatingSelector.addEventListener("mouseleave", () => {
            setStarSelection(parseInt(D.selectedRatingInput.value));
        });
    }

    // Character counter for comment
    if (D.reviewCommentInput) {
        D.reviewCommentInput.addEventListener("input", (e) => {
            const len = e.target.value.length;
            D.charCount.textContent = len;
            state.isDirty = true;
        });
    }

    // Review form submit (Create or Update)
    if (D.reviewForm) {
        D.reviewForm.addEventListener("submit", handleReviewSubmit);
    }

    // Confirm delete
    if (D.confirmDeleteBtn) {
        D.confirmDeleteBtn.addEventListener("click", executeDeleteReview);
    }

    // Unsaved modal buttons
    if (D.keepEditingBtn) {
        D.keepEditingBtn.addEventListener("click", () => {
            D.unsavedModal.classList.remove("show");
        });
    }
    if (D.discardChangesBtn) {
        D.discardChangesBtn.addEventListener("click", () => {
            D.unsavedModal.classList.remove("show");
            closeModals();
        });
    }

    // Logout
    if (D.logoutBtn) {
        D.logoutBtn.addEventListener("click", (e) => {
            e.preventDefault();
            localStorage.removeItem("token");
            showToast("Logged out successfully.", "success");
            setTimeout(() => window.location.href = "login.html", 1000);
        });
    }
}

// API Communication Helpers
function getAuthHeaders() {
    const token = localStorage.getItem("token");
    return token ? {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
    } : {
        "Content-Type": "application/json"
    };
}

async function apiCall(endpoint, options = {}) {
    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            ...options,
            headers: {
                ...getAuthHeaders(),
                ...(options.headers || {})
            }
        });

        if (response.status === 401) {
            showAuthError("Please log in to view your reviews.", "login.html", "Login");
            throw new Error("Unauthorized");
        }
        if (response.status === 403) {
            showAuthError("You do not have permission to access this page.", "index.html", "Return to Home");
            throw new Error("Forbidden");
        }
        return response;
    } catch (error) {
        throw error;
    }
}

// Load Page Data
async function loadPageData() {
    showLoadingState(true);
    hideAllStates();

    try {
        if (USE_MOCK_DATA) {
            // Simulate network latency
            await new Promise(r => setTimeout(r, 600));
            state.reviews = [...mockReviewsDatabase].map(normalizeReview);
            state.eligibleReviews = [...mockEligibleDatabase].map(normalizeEligible);
        } else {
            // TODO: Confirm endpoints match Spring Boot ReviewController
            const [reviewsRes, eligibleRes] = await Promise.all([
                apiCall("/reviews/my-reviews"),
                apiCall("/reviews/eligible").catch(() => null)
            ]);

            if (!reviewsRes.ok) throw new Error("Failed to load reviews");
            const rawReviews = await reviewsRes.json();
            state.reviews = rawReviews.map(normalizeReview);

            if (eligibleRes && eligibleRes.ok) {
                const rawEligible = await eligibleRes.json();
                state.eligibleReviews = rawEligible.map(normalizeEligible);
            }
        }

        showLoadingState(false);
        renderPage();
    } catch (err) {
        showLoadingState(false);
        if (err.message !== "Unauthorized" && err.message !== "Forbidden") {
            state.hasError = true;
            if (D.errorStateContainer) D.errorStateContainer.style.display = "block";
        }
    }
}

async function loadCartCount() {
    try {
        if (USE_MOCK_DATA) {
            state.cartCount = 2;
        } else {
            // TODO: Confirm cart endpoint
            const res = await apiCall("/cart");
            if (res.ok) {
                const cart = await res.json();
                // Normalize cart items count safely
                const items = cart.cartItems || cart.items || [];
                state.cartCount = items.reduce((acc, item) => acc + (item.quantity || 1), 0);
            }
        }
        if (D.cartCount) D.cartCount.textContent = state.cartCount;
    } catch (e) {
        if (D.cartCount) D.cartCount.textContent = "0";
    }
}

// Normalizers
function normalizeReview(item) {
    const fishObj = item.fish || {};
    let imageUrl = fishObj.primaryImage || fishObj.imageUrl || "";
    if (fishObj.fishImages && Array.isArray(fishObj.fishImages)) {
        const primary = fishObj.fishImages.find(img => img.isPrimary);
        if (primary) imageUrl = primary.imageUrl;
        else if (fishObj.fishImages.length > 0) imageUrl = fishObj.fishImages[0].imageUrl;
    }

    return {
        id: item.id,
        rating: Math.min(5, Math.max(1, parseInt(item.rating) || 5)),
        comment: item.comment || "",
        reviewDate: item.reviewDate || new Date().toISOString().split('T')[0],
        fishId: fishObj.id || item.fishId || 0,
        fishName: fishObj.fishName || fishObj.name || item.fishName || "Unknown Fish",
        fishImage: imageUrl
    };
}

function normalizeEligible(item) {
    return {
        id: item.id || item.fishId,
        fishName: item.fishName || item.name || "Aquarium Fish",
        purchaseDate: item.purchaseDate || "Purchased recently",
        primaryImage: item.primaryImage || item.imageUrl || ""
    };
}

// Rendering Logic
function renderPage() {
    renderSummaryStats();
    renderRatingDistribution();
    renderEligibleSection();
    applyFiltersAndRender();
}

function renderSummaryStats() {
    const total = state.reviews.length;
    if (D.statTotalReviews) D.statTotalReviews.textContent = total;

    if (total === 0) {
        if (D.statAvgRating) D.statAvgRating.textContent = "0.0";
        if (D.statAvgStars) D.statAvgStars.innerHTML = generateStars(0);
        if (D.statFiveStarCount) D.statFiveStarCount.textContent = "0";
        if (D.statLatestReviewDate) D.statLatestReviewDate.textContent = "-";
        return;
    }

    const sum = state.reviews.reduce((acc, r) => acc + r.rating, 0);
    const avg = (sum / total).toFixed(1);
    if (D.statAvgRating) D.statAvgRating.textContent = avg;
    if (D.statAvgStars) D.statAvgStars.innerHTML = generateStars(Math.round(avg));

    const fiveStars = state.reviews.filter(r => r.rating === 5).length;
    if (D.statFiveStarCount) D.statFiveStarCount.textContent = fiveStars;

    // Sort by date to find latest
    const sortedByDate = [...state.reviews].sort((a, b) => new Date(b.reviewDate) - new Date(a.reviewDate));
    if (D.statLatestReviewDate) {
        D.statLatestReviewDate.textContent = formatDate(sortedByDate[0].reviewDate);
    }
}

function renderRatingDistribution() {
    if (!D.ratingDistributionList) return;
    const total = state.reviews.length;
    let html = "";

    for (let star = 5; star >= 1; star--) {
        const count = state.reviews.filter(r => r.rating === star).length;
        const pct = total > 0 ? (count / total) * 100 : 0;

        let starStr = "";
        for(let s=0; s<star; s++) starStr += "★";

        html += `
            <div class="dist-row">
                <span class="dist-stars">${starStr}</span>
                <div class="dist-bar-wrapper">
                    <div class="dist-bar-fill" style="width: ${pct}%"></div>
                </div>
                <span class="dist-count">${count}</span>
            </div>
        `;
    }
    D.ratingDistributionList.innerHTML = html;
}

function renderEligibleSection() {
    if (!D.eligibleSection || !D.eligibleFishGrid) return;
    if (state.eligibleReviews.length === 0) {
        D.eligibleSection.style.display = "none";
        return;
    }

    D.eligibleSection.style.display = "block";
    let html = "";
    state.eligibleReviews.forEach(fish => {
        const safeImg = fish.primaryImage || "assets/images/fish-placeholder.jpg";
        html += `
            <div class="eligible-card">
                <img src="${escapeHtml(safeImg)}" alt="${escapeHtml(fish.fishName)}" class="eligible-img" loading="lazy" onerror="this.src='assets/images/fish-placeholder.jpg'">
                <div class="eligible-info">
                    <h4>${escapeHtml(fish.fishName)}</h4>
                    <span>${escapeHtml(fish.purchaseDate)}</span>
                    <button class="btn btn-primary btn-sm" onclick="openCreateReviewModal(${fish.id}, '${escapeHtml(fish.fishName).replace(/'/g, "\\'")}')">
                        <i class="fa-solid fa-pen"></i> Write a Review
                    </button>
                </div>
            </div>
        `;
    });
    D.eligibleFishGrid.innerHTML = html;
}

// Filtering & Sorting Execution
function applyFiltersAndRender() {
    let result = [...state.reviews];

    // Search query
    if (state.searchQuery) {
        const q = state.searchQuery.toLowerCase();
        result = result.filter(r => r.fishName.toLowerCase().includes(q) || r.comment.toLowerCase().includes(q));
    }

    // Rating filter
    if (state.ratingFilter !== "all") {
        const targetRating = parseInt(state.ratingFilter);
        result = result.filter(r => r.rating === targetRating);
    }

    // Sorting
    result.sort((a, b) => {
        if (state.sortFilter === "newest") return new Date(b.reviewDate) - new Date(a.reviewDate);
        if (state.sortFilter === "oldest") return new Date(a.reviewDate) - new Date(b.reviewDate);
        if (state.sortFilter === "highest") return b.rating - a.rating;
        if (state.sortFilter === "lowest") return a.rating - b.rating;
        if (state.sortFilter === "name-asc") return a.fishName.localeCompare(b.fishName);
        if (state.sortFilter === "name-desc") return b.fishName.localeCompare(a.fishName);
        return 0;
    });

    state.filteredReviews = result;
    renderReviewsList();
}

function renderReviewsList() {
    if (!D.reviewsGrid || !D.filteredCountBadge) return;

    D.filteredCountBadge.textContent = `${state.filteredReviews.length} reviews`;

    // Handle empty states
    if (state.reviews.length === 0) {
        if (D.emptyStateContainer) D.emptyStateContainer.style.display = "block";
        if (D.searchEmptyStateContainer) D.searchEmptyStateContainer.style.display = "none";
        D.reviewsGrid.innerHTML = "";
        if (D.paginationContainer) D.paginationContainer.style.display = "none";
        return;
    } else {
        if (D.emptyStateContainer) D.emptyStateContainer.style.display = "none";
    }

    if (state.filteredReviews.length === 0) {
        if (D.searchEmptyStateContainer) D.searchEmptyStateContainer.style.display = "block";
        D.reviewsGrid.innerHTML = "";
        if (D.paginationContainer) D.paginationContainer.style.display = "none";
        return;
    } else {
        if (D.searchEmptyStateContainer) D.searchEmptyStateContainer.style.display = "none";
    }

    // Pagination calculations
    const totalPages = Math.ceil(state.filteredReviews.length / state.pageSize);
    if (state.currentPage > totalPages) state.currentPage = totalPages || 1;

    const start = (state.currentPage - 1) * state.pageSize;
    const paginatedItems = state.filteredReviews.slice(start, start + state.pageSize);

    let html = "";
    paginatedItems.forEach(rev => {
        const safeImg = rev.fishImage || "assets/images/fish-placeholder.jpg";
        html += `
            <article class="review-card">
                <div>
                    <div class="review-card-top">
                        <img src="${escapeHtml(safeImg)}" alt="${escapeHtml(rev.fishName)}" class="review-fish-img" loading="lazy" onerror="this.src='assets/images/fish-placeholder.jpg'">
                        <div class="review-meta-info">
                            <h3 class="review-fish-name">${escapeHtml(rev.fishName)}</h3>
                            <div class="star-rating-display">${generateStars(rev.rating)}</div>
                            <div class="review-date-text">Reviewed on ${formatDate(rev.reviewDate)}</div>
                        </div>
                    </div>
                    <p class="review-comment-body">${escapeHtml(rev.comment)}</p>
                </div>
                <div class="review-actions-row">
                    <a href="fish-details.html?id=${rev.fishId}" class="btn btn-secondary btn-sm">
                        <i class="fa-solid fa-eye"></i> View Fish
                    </a>
                    <button class="btn btn-secondary btn-sm" onclick="openEditReviewModal(${rev.id})">
                        <i class="fa-solid fa-pen-to-square"></i> Edit
                    </button>
                    <button class="btn btn-danger btn-sm" onclick="promptDeleteReview(${rev.id})">
                        <i class="fa-solid fa-trash"></i> Delete
                    </button>
                </div>
            </article>
        `;
    });

    D.reviewsGrid.innerHTML = html;
    renderPaginationControls(totalPages);
}

function renderPaginationControls(totalPages) {
    if (!D.paginationContainer) return;
    if (totalPages <= 1) {
        D.paginationContainer.style.display = "none";
        return;
    }

    D.paginationContainer.style.display = "flex";
    let html = `
        <button class="page-btn" ${state.currentPage === 1 ? 'disabled' : ''} onclick="changePage(${state.currentPage - 1})">
            <i class="fa-solid fa-chevron-left"></i>
        </button>
    `;

    for (let i = 1; i <= totalPages; i++) {
        html += `<button class="page-btn ${state.currentPage === i ? 'active' : ''}" onclick="changePage(${i})">${i}</button>`;
    }

    html += `
        <button class="page-btn" ${state.currentPage === totalPages ? 'disabled' : ''} onclick="changePage(${state.currentPage + 1})">
            <i class="fa-solid fa-chevron-right"></i>
        </button>
    `;
    D.paginationContainer.innerHTML = html;
}

function changePage(page) {
    state.currentPage = page;
    renderReviewsList();
    window.scrollTo({ top: 300, behavior: 'smooth' });
}

function resetFilters() {
    state.searchQuery = "";
    state.ratingFilter = "all";
    state.sortFilter = "newest";
    state.currentPage = 1;

    if (D.searchInput) D.searchInput.value = "";
    if (D.ratingFilter) D.ratingFilter.value = "all";
    if (D.sortFilter) D.sortFilter.value = "newest";

    updateUrlParams();
    applyFiltersAndRender();
}

// Modal Handling (Create & Edit)
function openCreateReviewModal(fishId, fishName) {
    state.currentEditingReviewId = null;
    state.isDirty = false;
    if (D.modalTitle) D.modalTitle.textContent = "Write a Review";
    if (D.reviewModalId) D.reviewModalId.value = "";
    if (D.reviewModalFishId) D.reviewModalFishId.value = fishId;
    if (D.modalFishNameDisplay) D.modalFishNameDisplay.textContent = fishName;
    setStarSelection(5);
    if (D.reviewCommentInput) D.reviewCommentInput.value = "";
    if (D.charCount) D.charCount.textContent = "0";
    if (D.modalSubmitBtn) D.modalSubmitBtn.textContent = "Submit Review";

    if (D.reviewModal) D.reviewModal.classList.add("show");
    document.body.style.overflow = "hidden";
}

function openEditReviewModal(reviewId) {
    const review = state.reviews.find(r => r.id === reviewId);
    if (!review) return;

    state.currentEditingReviewId = reviewId;
    state.isDirty = false;
    if (D.modalTitle) D.modalTitle.textContent = "Edit Your Review";
    if (D.reviewModalId) D.reviewModalId.value = review.id;
    if (D.reviewModalFishId) D.reviewModalFishId.value = review.fishId;
    if (D.modalFishNameDisplay) D.modalFishNameDisplay.textContent = review.fishName;
    setStarSelection(review.rating);
    if (D.reviewCommentInput) D.reviewCommentInput.value = review.comment;
    if (D.charCount) D.charCount.textContent = review.comment.length;
    if (D.modalSubmitBtn) D.modalSubmitBtn.textContent = "Save Changes";

    if (D.reviewModal) D.reviewModal.classList.add("show");
    document.body.style.overflow = "hidden";
}

function requestCloseReviewModal() {
    if (state.isDirty) {
        if (D.unsavedModal) D.unsavedModal.classList.add("show");
    } else {
        closeModals();
    }
}

function closeModals() {
    if (D.reviewModal) D.reviewModal.classList.remove("show");
    if (D.deleteModal) D.deleteModal.classList.remove("show");
    if (D.unsavedModal) D.unsavedModal.classList.remove("show");
    document.body.style.overflow = "auto";
    state.currentEditingReviewId = null;
    state.isDirty = false;
}

// Star Selector Helpers
function setStarSelection(rating) {
    if (D.selectedRatingInput) D.selectedRatingInput.value = rating;
    highlightStars(rating);
}

function highlightStars(rating) {
    if (!D.starRatingSelector) return;
    const stars = D.starRatingSelector.querySelectorAll("i");
    stars.forEach(star => {
        const val = parseInt(star.getAttribute("data-rating"));
        if (val <= rating) {
            star.classList.add("active");
            star.classList.remove("fa-regular");
            star.classList.add("fa-solid");
        } else {
            star.classList.remove("active");
        }
    });
}

function generateStars(rating) {
    let html = "";
    for (let i = 1; i <= 5; i++) {
        if (i <= rating) {
            html += '<i class="fa-solid fa-star"></i>';
        } else {
            html += '<i class="fa-regular fa-star"></i>';
        }
    }
    return html;
}

// Review CRUD Operations
async function handleReviewSubmit(e) {
    e.preventDefault();
    const reviewId = D.reviewModalId.value;
    const fishId = D.reviewModalFishId.value;
    const rating = parseInt(D.selectedRatingInput.value);
    const comment = D.reviewCommentInput.value.trim();

    if (!comment) {
        showToast("Please provide a review comment.", "error");
        return;
    }

    if (D.modalSubmitBtn) {
        D.modalSubmitBtn.disabled = true;
        D.modalSubmitBtn.textContent = reviewId ? "Saving..." : "Submitting...";
    }

    try {
        if (USE_MOCK_DATA) {
            await new Promise(r => setTimeout(r, 600));
            if (reviewId) {
                // Update
                const idx = mockReviewsDatabase.findIndex(r => r.id == reviewId);
                if (idx !== -1) {
                    mockReviewsDatabase[idx].rating = rating;
                    mockReviewsDatabase[idx].comment = comment;
                }
                showToast("Your review was updated successfully.", "success");
            } else {
                // Create
                const newId = Date.now();
                const targetEligible = mockEligibleDatabase.find(e => e.id == fishId) || { fishName: D.modalFishNameDisplay.textContent, primaryImage: "" };
                const newRev = {
                    id: newId,
                    rating: rating,
                    comment: comment,
                    reviewDate: new Date().toISOString().split('T')[0],
                    fish: {
                        id: fishId,
                        fishName: targetEligible.fishName,
                        price: 3500,
                        primaryImage: targetEligible.primaryImage
                    }
                };
                mockReviewsDatabase.unshift(newRev);
                // Remove from eligible
                mockEligibleDatabase = mockEligibleDatabase.filter(e => e.id != fishId);
                showToast("Review submitted successfully.", "success");
            }
            state.reviews = [...mockReviewsDatabase].map(normalizeReview);
            state.eligibleReviews = [...mockEligibleDatabase].map(normalizeEligible);
            renderPage();
            closeModals();
        } else {
            // Real API integration
            let res;
            if (reviewId) {
                // TODO: Confirm PUT endpoint
                res = await apiCall(`/reviews/${reviewId}`, {
                    method: "PUT",
                    body: JSON.stringify({ rating, comment })
                });
            } else {
                // TODO: Confirm POST endpoint
                res = await apiCall("/reviews", {
                    method: "POST",
                    body: JSON.stringify({ fishId: parseInt(fishId), rating, comment })
                });
            }

            if (!res.ok) {
                if (res.status === 409) throw new Error("You have already reviewed this fish.");
                throw new Error("Failed to save review");
            }

            showToast(reviewId ? "Review updated successfully." : "Review submitted successfully.", "success");
            closeModals();
            await loadPageData();
        }
    } catch (err) {
        showToast(err.message || "Unable to save your review.", "error");
    } finally {
        if (D.modalSubmitBtn) {
            D.modalSubmitBtn.disabled = false;
            D.modalSubmitBtn.textContent = reviewId ? "Save Changes" : "Submit Review";
        }
    }
}

function promptDeleteReview(reviewId) {
    if (D.deleteReviewIdTarget) D.deleteReviewIdTarget.value = reviewId;
    if (D.deleteModal) D.deleteModal.classList.add("show");
    document.body.style.overflow = "hidden";
}

async function executeDeleteReview() {
    const reviewId = D.deleteReviewIdTarget.value;
    if (!reviewId) return;

    if (D.confirmDeleteBtn) {
        D.confirmDeleteBtn.disabled = true;
        D.confirmDeleteBtn.textContent = "Deleting...";
    }

    try {
        if (USE_MOCK_DATA) {
            await new Promise(r => setTimeout(r, 500));
            mockReviewsDatabase = mockReviewsDatabase.filter(r => r.id != reviewId);
            state.reviews = [...mockReviewsDatabase].map(normalizeReview);
            renderPage();
            showToast("Your review has been deleted.", "success");
            closeModals();
        } else {
            // TODO: Confirm DELETE endpoint
            const res = await apiCall(`/reviews/${reviewId}`, { method: "DELETE" });
            if (!res.ok) throw new Error("Failed to delete review");

            showToast("Your review has been deleted.", "success");
            closeModals();
            await loadPageData();
        }
    } catch (err) {
        showToast("Unable to delete your review.", "error");
    } finally {
        if (D.confirmDeleteBtn) {
            D.confirmDeleteBtn.disabled = false;
            D.confirmDeleteBtn.textContent = "Delete Review";
        }
    }
}

// URL State Syncing
function readUrlParams() {
    const params = new URLSearchParams(window.location.search);
    const search = params.get("search");
    const rating = params.get("rating");
    const sort = params.get("sort");

    if (search) {
        state.searchQuery = search;
        if (D.searchInput) D.searchInput.value = search;
    }
    if (rating) {
        state.ratingFilter = rating;
        if (D.ratingFilter) D.ratingFilter.value = rating;
    }
    if (sort) {
        state.sortFilter = sort;
        if (D.sortFilter) D.sortFilter.value = sort;
    }
}

function updateUrlParams() {
    const params = new URLSearchParams();
    if (state.searchQuery) params.set("search", state.searchQuery);
    if (state.ratingFilter !== "all") params.set("rating", state.ratingFilter);
    if (state.sortFilter !== "newest") params.set("sort", state.sortFilter);

    const newQuery = params.toString();
    const newUrl = window.location.pathname + (newQuery ? `?${newQuery}` : "");
    history.replaceState(null, "", newUrl);
}

// Utilities & Helpers
function showLoadingState(isLoading) {
    state.isLoading = isLoading;
    if (D.loadingSkeleton && D.reviewsGrid) {
        if (isLoading) {
            D.loadingSkeleton.style.display = "grid";
            D.reviewsGrid.style.display = "none";
            let skeletonHtml = "";
            for(let i=0; i<4; i++) {
                skeletonHtml += `<div class="skeleton-card"></div>`;
            }
            D.loadingSkeleton.innerHTML = skeletonHtml;
        } else {
            D.loadingSkeleton.style.display = "none";
            D.reviewsGrid.style.display = "grid";
        }
    }
}

function hideAllStates() {
    if (D.errorStateContainer) D.errorStateContainer.style.display = "none";
    if (D.emptyStateContainer) D.emptyStateContainer.style.display = "none";
    if (D.searchEmptyStateContainer) D.searchEmptyStateContainer.style.display = "none";
}

function showAuthError(message, redirectUrl, btnText) {
    if (D.dashboardContent) D.dashboardContent.style.display = "none";
    if (D.authErrorContainer) {
        D.authErrorContainer.style.display = "block";
        D.authErrorContainer.innerHTML = `
            <div class="state-container error-state">
                <div class="state-icon"><i class="fa-solid fa-lock"></i></div>
                <h3>Authentication Required</h3>
                <p>${escapeHtml(message)}</p>
                <a href="${escapeHtml(redirectUrl)}" class="btn btn-primary">${escapeHtml(btnText)}</a>
            </div>
        `;
    }
}

function showToast(message, type = "success") {
    if (!D.toastContainer) return;
    const toast = document.createElement("div");
    toast.className = `toast ${type}`;
    const iconClass = type === "success" ? "fa-circle-check" : "fa-triangle-exclamation";
    toast.innerHTML = `
        <i class="fa-solid ${iconClass}"></i>
        <span>${escapeHtml(message)}</span>
    `;
    D.toastContainer.appendChild(toast);

    setTimeout(() => {
        toast.style.animation = "toastOut 0.3s forwards";
        setTimeout(() => toast.remove(), 300);
    }, 3500);
}

function escapeHtml(str) {
    if (!str) return "";
    return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function formatDate(dateString) {
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return "Date unavailable";
        return new Intl.DateTimeFormat("en-LK", {
            year: "numeric",
            month: "short",
            day: "numeric"
        }).format(date);
    } catch (e) {
        return "Date unavailable";
    }
}