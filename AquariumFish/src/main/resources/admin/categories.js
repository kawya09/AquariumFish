/**
 * Aquarium Fish E-Commerce - Categories Page JavaScript
 * Frontend built with Vanilla JavaScript interacting with Spring Boot REST API.
 */

// ==========================================================================
// 1. CONFIGURATION & CONSTANTS
// ==========================================================================
const API_BASE_URL = "http://localhost:8080/api";
const CATEGORY_ENDPOINT = "/categories";
const USE_MOCK_DATA = true; // Set to false when connecting to real Spring Boot backend

// State Management
let allCategories = [];
let filteredCategories = [];
let currentFilter = "all";
let currentSort = "name-asc";
let currentSearchQuery = "";

// ==========================================================================
// 2. INITIALIZATION & EVENT LISTENERS
// ==========================================================================
document.addEventListener("DOMContentLoaded", () => {
    initPage();
});

function initPage() {
    setupNavigation();
    setupEventListeners();
    readUrlParameters();
    loadCategories();
    updateCartBadge();
}

function setupNavigation() {
    // Mobile menu toggle
    const mobileMenuToggle = document.getElementById("mobileMenuToggle");
    const navLinks = document.getElementById("navLinks");

    if (mobileMenuToggle && navLinks) {
        mobileMenuToggle.addEventListener("click", () => {
            const isExpanded = mobileMenuToggle.getAttribute("aria-expanded") === "true";
            mobileMenuToggle.setAttribute("aria-expanded", !isExpanded);
            navLinks.classList.toggle("show");
        });

        // Close mobile menu when clicking outside
        document.addEventListener("click", (e) => {
            if (!mobileMenuToggle.contains(e.target) && !navLinks.contains(e.target)) {
                navLinks.classList.remove("show");
                mobileMenuToggle.setAttribute("aria-expanded", "false");
            }
        });
    }

    // Account dropdown toggle
    const accountTrigger = document.getElementById("accountTrigger");
    const accountDropdown = document.getElementById("accountDropdown");

    if (accountTrigger && accountDropdown) {
        accountTrigger.addEventListener("click", (e) => {
            e.stopPropagation();
            accountDropdown.classList.toggle("show");
            renderAccountDropdown();
        });

        document.addEventListener("click", () => {
            accountDropdown.classList.remove("show");
        });
    }
}

function setupEventListeners() {
    // Search inputs
    const heroSearchInput = document.getElementById("heroSearchInput");
    const heroSearchBtn = document.getElementById("heroSearchBtn");

    if (heroSearchInput) {
        heroSearchInput.addEventListener("input", debounce((e) => {
            currentSearchQuery = e.target.value.trim();
            applyFiltersAndSort();
            updateUrlState();
        }, 300));

        heroSearchInput.addEventListener("keydown", (e) => {
            if (e.key === "Enter") {
                currentSearchQuery = e.target.value.trim();
                applyFiltersAndSort();
                updateUrlState();
            }
        });
    }

    if (heroSearchBtn && heroSearchInput) {
        heroSearchBtn.addEventListener("click", () => {
            currentSearchQuery = heroSearchInput.value.trim();
            applyFiltersAndSort();
            updateUrlState();
        });
    }

    // Filter tags
    const filterTags = document.querySelectorAll(".filter-tag");
    filterTags.forEach(tag => {
        tag.addEventListener("click", (e) => {
            filterTags.forEach(t => t.classList.remove("active"));
            e.target.classList.add("active");
            currentFilter = e.target.getAttribute("data-filter");
            applyFiltersAndSort();
        });
    });

    // Sort select
    const sortSelect = document.getElementById("sortSelect");
    if (sortSelect) {
        sortSelect.addEventListener("change", (e) => {
            currentSort = e.target.value;
            applyFiltersAndSort();
        });
    }

    // Clear filters button
    const clearFiltersBtn = document.getElementById("clearFiltersBtn");
    const emptyClearBtn = document.getElementById("emptyClearBtn");

    const handleClear = () => {
        currentFilter = "all";
        currentSearchQuery = "";
        currentSort = "name-asc";

        if (heroSearchInput) heroSearchInput.value = "";
        if (sortSelect) sortSelect.value = "name-asc";

        filterTags.forEach(t => {
            if (t.getAttribute("data-filter") === "all") {
                t.classList.add("active");
            } else {
                t.classList.remove("active");
            }
        });

        applyFiltersAndSort();
        updateUrlState();
        showToast("Filters reset successfully", "success");
    };

    if (clearFiltersBtn) clearFiltersBtn.addEventListener("click", handleClear);
    if (emptyClearBtn) emptyClearBtn.addEventListener("click", handleClear);

    // Retry fetch button
    const retryFetchBtn = document.getElementById("retryFetchBtn");
    if (retryFetchBtn) {
        retryFetchBtn.addEventListener("click", () => {
            loadCategories();
        });
    }
}

// ==========================================================================
// 3. API & MOCK DATA HANDLING
// ==========================================================================
async function loadCategories() {
    showLoadingState();

    try {
        let categories = [];

        if (USE_MOCK_DATA) {
            // Display demo badge when mock mode is active
            const demoBadge = document.getElementById("demoBadge");
            if (demoBadge) demoBadge.style.display = "inline-flex";

            // Simulate network latency for realism
            await new Promise(resolve => setTimeout(resolve, 600));
            categories = getMockCategories();
        } else {
            // TODO BACKEND:
            // Connect this function to GET /api/categories
            // Backend should return a lightweight category DTO.
            // Do not expose recursive JPA relationships.
            const response = await fetch(`${API_BASE_URL}${CATEGORY_ENDPOINT}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    ...getAuthHeaders()
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            categories = await response.json();
        }

        allCategories = categories;
        applyFiltersAndSort();
        renderPopularCategories();

    } catch (error) {
        console.error("Failed to load categories:", error);
        showErrorState(error.message || "Unable to load categories from server.");
    }
}

function getMockCategories() {
    return [
        {
            id: 1,
            categoryName: "Freshwater Fish",
            description: "Beautiful and adaptable species suitable for community freshwater aquariums and planted tanks.",
            fishCount: 38,
            imageUrl: "images/categories/freshwater.jpg"
        },
        {
            id: 2,
            categoryName: "Tropical Fish",
            description: "Colorful tropical species perfect for vibrant aquarium setups with stable water parameters.",
            fishCount: 26,
            imageUrl: "images/categories/tropical.jpg"
        },
        {
            id: 3,
            categoryName: "Saltwater Fish",
            description: "Exotic marine species featuring stunning neon patterns for advanced saltwater reef tanks.",
            fishCount: 19,
            imageUrl: "images/categories/saltwater.jpg"
        },
        {
            id: 4,
            categoryName: "Community Fish",
            description: "Peaceful fish varieties that thrive in shared habitats and peaceful multi-species environments.",
            fishCount: 22,
            imageUrl: "images/categories/community.jpg"
        },
        {
            id: 5,
            categoryName: "Beginner-Friendly Fish",
            description: "Hardy, resilient species that are exceptionally forgiving and ideal for beginning aquarists.",
            fishCount: 31,
            imageUrl: "images/categories/beginner.jpg"
        },
        {
            id: 6,
            categoryName: "Nano Aquarium Fish",
            description: "Compact, peaceful nano species specially curated for small desktop cubes and planted nano setups.",
            fishCount: 15,
            imageUrl: "images/categories/nano.jpg"
        },
        {
            id: 7,
            categoryName: "Coldwater Fish",
            description: "Resilient species that prefer cooler water temperatures without the need for aquarium heaters.",
            fishCount: 8,
            imageUrl: "images/categories/coldwater.jpg"
        },
        {
            id: 8,
            categoryName: "Bottom-Dwelling Fish",
            description: "Essential bottom scavengers and catfish that keep substrate clean and algae under control.",
            fishCount: 14,
            imageUrl: "images/categories/bottom.jpg"
        },
        {
            id: 9,
            categoryName: "Colorful Fish",
            description: "Vibrant and eye-catching species selected specifically to add striking color highlights to your display.",
            fishCount: 20,
            imageUrl: "images/categories/colorful.jpg"
        },
        {
            id: 10,
            categoryName: "Predatory Fish",
            description: "Magnificent carnivorous species for specialized single-species tanks and experienced keepers.",
            fishCount: 9,
            imageUrl: "images/categories/predatory.jpg"
        }
    ];
}

// ==========================================================================
// 4. FILTERING, SORTING & SEARCH LOGIC
// ==========================================================================
function applyFiltersAndSort() {
    let result = [...allCategories];

    // Apply Tag/Category Type filter (matches name or description keywords in mock mode)
    if (currentFilter !== "all") {
        const filterLower = currentFilter.toLowerCase();
        result = result.filter(cat =>
            cat.categoryName.toLowerCase().includes(filterLower) ||
            cat.description.toLowerCase().includes(filterLower)
        );
    }

    // Apply Search Query filter
    if (currentSearchQuery) {
        const query = currentSearchQuery.toLowerCase();
        result = result.filter(cat =>
            cat.categoryName.toLowerCase().includes(query) ||
            cat.description.toLowerCase().includes(query)
        );
    }

    // Apply Sorting
    result.sort((a, b) => {
        if (currentSort === "name-asc") {
            return a.categoryName.localeCompare(b.categoryName);
        } else if (currentSort === "name-desc") {
            return b.categoryName.localeCompare(a.categoryName);
        } else if (currentSort === "count-desc") {
            return (b.fishCount || 0) - (a.fishCount || 0);
        } else if (currentSort === "count-asc") {
            return (a.fishCount || 0) - (b.fishCount || 0);
        }
        return 0;
    });

    filteredCategories = result;
    renderCategories();
    updateResultsCounter();
}

// ==========================================================================
// 5. RENDERING & UI STATES
// ==========================================================================
function renderCategories() {
    const grid = document.getElementById("categoryGrid");
    const emptyState = document.getElementById("emptyState");
    const loadingState = document.getElementById("loadingState");
    const clearFiltersBtn = document.getElementById("clearFiltersBtn");

    if (!grid) return;

    // Hide loading
    if (loadingState) loadingState.style.display = "none";

    // Show/hide clear filters button
    if (clearFiltersBtn) {
        clearFiltersBtn.style.display = (currentFilter !== "all" || currentSearchQuery !== "") ? "inline-flex" : "none";
    }

    if (filteredCategories.length === 0) {
        grid.style.display = "none";
        if (emptyState) emptyState.style.display = "block";
        return;
    }

    if (emptyState) emptyState.style.display = "none";
    grid.style.display = "grid";

    grid.innerHTML = filteredCategories.map(cat => renderCategoryCard(cat)).join("");

    // Attach click listeners to cards/buttons for navigation
    grid.querySelectorAll(".category-card").forEach(card => {
        card.addEventListener("click", (e) => {
            const categoryId = card.getAttribute("data-category-id");
            navigateToCategory(categoryId);
        });
    });
}

function renderCategoryCard(category) {
    const safeId = escapeHtml(category.id);
    const safeName = escapeHtml(category.categoryName);
    const safeDesc = escapeHtml(category.description);
    const fishCount = category.fishCount !== undefined ? `${category.fishCount} Fish Available` : "Explore Species";
    const safeImgUrl = getSafeImageUrl(category.imageUrl);

    return `
        <article class="category-card" data-category-id="${safeId}" role="button" tabindex="0" aria-label="Browse ${safeName}">
            <div class="category-image-wrapper">
                <img src="${safeImgUrl}" alt="${safeName}" loading="lazy" onerror="this.onerror=null; this.src='data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'200\' height=\'150\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%230ea5e9\' stroke-width=\'1\' stroke-linecap=\'round\' stroke-linejoin=\'round\'><path d=\'M6 12h.01\'/><path d=\'M18 12h.01\'/><path d=\'M12 8c-3.31 0-6 2.69-6 6 0 2.5 1.5 4.5 3.5 5.5l1.5-2 1.5 2c2-1 3.5-3 3.5-5.5 0-3.31-2.69-6-6-6z\'/></svg>';">
                <span class="fish-count-badge">${fishCount}</span>
            </div>
            <div class="category-content">
                <h3>${safeName}</h3>
                <p>${safeDesc}</p>
                <div class="category-action-link">
                    Browse Fish <i class="fa-solid fa-arrow-right"></i>
                </div>
            </div>
        </article>
    `;
}

function renderPopularCategories() {
    const popularGrid = document.getElementById("popularGrid");
    if (!popularGrid || allCategories.length === 0) return;

    // Pick top 3 categories by fishCount or first 3
    const popular = [...allCategories].sort((a, b) => (b.fishCount || 0) - (a.fishCount || 0)).slice(0, 3);

    popularGrid.innerHTML = popular.map(cat => `
        <div class="popular-card" data-category-id="${escapeHtml(cat.id)}" style="cursor: pointer;" onclick="navigateToCategory('${escapeHtml(cat.id)}')">
            <div class="popular-card-content">
                <span>Featured Category</span>
                <h3>${escapeHtml(cat.categoryName)}</h3>
                <p>${escapeHtml(cat.description)}</p>
                <div class="category-action-link" style="color: var(--accent);">
                    Explore ${escapeHtml(cat.categoryName)} <i class="fa-solid fa-arrow-right"></i>
                </div>
            </div>
        </div>
    `).join("");
}

function showLoadingState() {
    const loadingState = document.getElementById("loadingState");
    const grid = document.getElementById("categoryGrid");
    const emptyState = document.getElementById("emptyState");
    const errorState = document.getElementById("errorState");

    if (loadingState) loadingState.style.display = "grid";
    if (grid) grid.style.display = "none";
    if (emptyState) emptyState.style.display = "none";
    if (errorState) errorState.style.display = "none";
}

function showErrorState(message) {
    const loadingState = document.getElementById("loadingState");
    const grid = document.getElementById("categoryGrid");
    const errorState = document.getElementById("errorState");
    const errorMessageText = document.getElementById("errorMessageText");

    if (loadingState) loadingState.style.display = "none";
    if (grid) grid.style.display = "none";
    if (errorState) errorState.style.display = "block";
    if (errorMessageText) errorMessageText.textContent = message;

    showToast("Error loading categories", "error");
}

function updateResultsCounter() {
    const counter = document.getElementById("resultsCounter");
    if (counter) {
        counter.textContent = `Showing ${filteredCategories.length} of ${allCategories.length} categories`;
    }
}

// ==========================================================================
// 6. NAVIGATION & URL STATE
// ==========================================================================
function navigateToCategory(categoryId) {
    // TODO:
    // Connect category navigation to fish.html?categoryId={id}
    window.location.href = `fish.html?categoryId=${encodeURIComponent(categoryId)}`;
}

function readUrlParameters() {
    const params = new URLSearchParams(window.location.search);
    const searchParam = params.get("search");

    if (searchParam) {
        currentSearchQuery = searchParam.trim();
        const heroSearchInput = document.getElementById("heroSearchInput");
        if (heroSearchInput) {
            heroSearchInput.value = currentSearchQuery;
        }
    }
}

function updateUrlState() {
    const params = new URLSearchParams(window.location.search);
    if (currentSearchQuery) {
        params.set("search", currentSearchQuery);
    } else {
        params.delete("search");
    }

    const newRelativePathQuery = window.location.pathname + (params.toString() ? '?' + params.toString() : '');
    history.replaceState(null, '', newRelativePathQuery);
}

// ==========================================================================
// 7. AUTHENTICATION & SECURITY UTILS
// ==========================================================================
function getAuthHeaders() {
    const token = localStorage.getItem("accessToken");
    return token ? { Authorization: `Bearer ${token}` } : {};
}

function escapeHtml(str) {
    if (typeof str !== 'string') return str;
    return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function getSafeImageUrl(url) {
    if (!url || typeof url !== 'string') return '';
    // Basic validation to prevent dangerous script schemes
    if (url.startsWith('javascript:') || url.startsWith('data:text/html')) {
        return '';
    }
    return escapeHtml(url);
}

// ==========================================================================
// 8. CART & ACCOUNT STATE HELPERS
// ==========================================================================
function updateCartBadge() {
    // TODO:
    // Replace this with GET /api/cart or /api/cart/count
    const cartCountEl = document.getElementById("cartCount");
    const wishlistCountEl = document.getElementById("wishlistCount");

    if (USE_MOCK_DATA) {
        if (cartCountEl) cartCountEl.textContent = "2";
        if (wishlistCountEl) wishlistCountEl.textContent = "5";
    } else {
        // Fetch real cart count from backend API when integrated
        if (cartCountEl) cartCountEl.textContent = "0";
        if (wishlistCountEl) wishlistCountEl.textContent = "0";
    }
}

function renderAccountDropdown() {
    const dropdown = document.getElementById("accountDropdown");
    if (!dropdown) return;

    // Check login state (mock check or from localStorage token)
    const token = localStorage.getItem("accessToken");
    const isLoggedIn = USE_MOCK_DATA ? true : !!token; // Default true in mock mode for preview

    if (isLoggedIn) {
        dropdown.innerHTML = `
            <a href="profile.html"><i class="fa-regular fa-user"></i> My Profile</a>
            <a href="orders.html"><i class="fa-solid fa-box"></i> My Orders</a>
            <button type="button" id="logoutBtn"><i class="fa-solid fa-right-from-bracket"></i> Logout</button>
        `;

        const logoutBtn = document.getElementById("logoutBtn");
        if (logoutBtn) {
            logoutBtn.addEventListener("click", () => {
                localStorage.removeItem("accessToken");
                showToast("Logged out successfully", "success");
                setTimeout(() => window.location.reload(), 1000);
            });
        }
    } else {
        dropdown.innerHTML = `
            <a href="login.html"><i class="fa-solid fa-right-to-bracket"></i> Login</a>
            <a href="register.html"><i class="fa-solid fa-user-plus"></i> Register</a>
        `;
    }
}

// ==========================================================================
// 9. TOAST NOTIFICATIONS
// ==========================================================================
function showToast(message, type = "success") {
    const container = document.getElementById("toastContainer");
    if (!container) return;

    const toast = document.createElement("div");
    toast.className = `toast ${type}`;
    toast.setAttribute("role", "status");

    const icon = type === "success" ? '<i class="fa-solid fa-circle-check" style="color: #10b981;"></i>' : '<i class="fa-solid fa-triangle-exclamation" style="color: #ef4444;"></i>';

    toast.innerHTML = `
        <div style="display: flex; align-items: center; gap: 0.75rem;">
            ${icon}
            <span class="toast-content">${escapeHtml(message)}</span>
        </div>
        <button class="toast-close" aria-label="Close notification">&times;</button>
    `;

    const closeBtn = toast.querySelector(".toast-close");
    closeBtn.addEventListener("click", () => {
        removeToast(toast);
    });

    container.appendChild(toast);

    // Auto remove after 4 seconds
    setTimeout(() => {
        if (toast.parentElement) {
            removeToast(toast);
        }
    }, 4000);
}

function removeToast(toast) {
    toast.style.animation = "toastSlideOut 0.3s ease forwards";
    setTimeout(() => {
        if (toast.parentElement) {
            toast.remove();
        }
    }, 300);
}

// ==========================================================================
// 10. UTILITY HELPERS (DEBOUNCE)
// ==========================================================================
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