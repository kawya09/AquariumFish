/**
 * Aquarium Fish E-Commerce - Fish Sizes Page Script
 * Built with Vanilla JavaScript
 */

const API_BASE_URL = "http://localhost:8080/api";
const USE_MOCK_DATA = true;
const SIZE_ENDPOINT = "/sizes";

// State
let allSizes = [];
let filteredSizes = [];
let currentSearch = "";
let currentFilter = "all";
let currentSort = "name-asc";
let activeModalSize = null;

// Mock Dataset (Demo values only)
function getMockSizes() {
    return [
        {
            id: 1,
            sizeName: "Tiny",
            description: "Very small aquarium fish suitable for nano-style setups.",
            fishCount: 12,
            imageUrl: ""
        },
        {
            id: 2,
            sizeName: "Small",
            description: "Small fish suitable for compact and community aquariums.",
            fishCount: 28,
            imageUrl: ""
        },
        {
            id: 3,
            sizeName: "Medium",
            description: "Medium-sized fish suitable for a wide range of aquariums.",
            fishCount: 34,
            imageUrl: ""
        },
        {
            id: 4,
            sizeName: "Large",
            description: "Larger fish requiring more swimming space and aquarium volume.",
            fishCount: 17,
            imageUrl: ""
        },
        {
            id: 5,
            sizeName: "Extra Large",
            description: "Large species requiring spacious aquarium environments.",
            fishCount: 8,
            imageUrl: ""
        },
        {
            id: 6,
            sizeName: "Juvenile",
            description: "Young fish available at an early growth stage.",
            fishCount: 15,
            imageUrl: ""
        },
        {
            id: 7,
            sizeName: "Adult",
            description: "Mature aquarium fish available in adult size.",
            fishCount: 21,
            imageUrl: ""
        }
    ];
}

// Initialization
document.addEventListener("DOMContentLoaded", () => {
    initPage();
});

async function initPage() {
    setupEventListeners();
    updateCartBadge();
    checkAuthStatus();
    parseUrlParams();
    await loadSizes();
}

// Authentication Headers
function getAuthHeaders() {
    const token = localStorage.getItem("accessToken");
    return token ? { Authorization: `Bearer ${token}` } : {};
}

// Check Authentication Status for Navbar Account Dropdown
function checkAuthStatus() {
    const dropdown = document.getElementById("account-dropdown");
    const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";

    if (isLoggedIn) {
        dropdown.innerHTML = `
            <a href="profile.html"><i class="fa-solid fa-user-gear"></i> My Profile</a>
            <a href="orders.html"><i class="fa-solid fa-box-archive"></i> My Orders</a>
            <button id="logout-btn"><i class="fa-solid fa-right-from-bracket"></i> Logout</button>
        `;
        document.getElementById("logout-btn")?.addEventListener("click", () => {
            localStorage.removeItem("accessToken");
            localStorage.removeItem("isLoggedIn");
            showToast("Logged out successfully", "success");
            setTimeout(() => window.location.reload(), 1000);
        });
    } else {
        dropdown.innerHTML = `
            <a href="login.html"><i class="fa-solid fa-right-to-bracket"></i> Login</a>
            <a href="register.html"><i class="fa-solid fa-user-plus"></i> Register</a>
        `;
    }
}

// Event Listeners Setup
function setupEventListeners() {
    // Mobile Navigation Toggle
    const mobileToggle = document.getElementById("mobile-menu-toggle");
    const mainNav = document.getElementById("main-nav");
    mobileToggle.addEventListener("click", () => {
        const isExpanded = mobileToggle.getAttribute("aria-expanded") === "true";
        mobileToggle.setAttribute("aria-expanded", !isExpanded);
        mainNav.classList.toggle("show");
    });

    // Account Dropdown Toggle
    const accountBtn = document.getElementById("account-menu-btn");
    const accountDropdown = document.getElementById("account-dropdown");
    accountBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        const isExpanded = accountBtn.getAttribute("aria-expanded") === "true";
        accountBtn.setAttribute("aria-expanded", !isExpanded);
        accountDropdown.classList.toggle("show");
    });
    document.addEventListener("click", () => {
        accountDropdown.classList.remove("show");
        accountBtn.setAttribute("aria-expanded", "false");
    });

    // Search Inputs
    const heroSearchInput = document.getElementById("hero-search-input");
    const heroSearchBtn = document.getElementById("hero-search-btn");

    heroSearchInput.addEventListener("input", debounce((e) => {
        currentSearch = e.target.value.trim();
        updateUrlState();
        applyPipeline();
    }, 300));

    heroSearchBtn.addEventListener("click", () => {
        currentSearch = heroSearchInput.value.trim();
        updateUrlState();
        applyPipeline();
    });

    // Filter Pills
    const filterPills = document.querySelectorAll(".filter-pill");
    filterPills.forEach(pill => {
        pill.addEventListener("click", (e) => {
            filterPills.forEach(p => p.classList.remove("active"));
            e.target.classList.add("active");
            currentFilter = e.target.getAttribute("data-filter");
            applyPipeline();
        });
    });

    // Sort Select
    const sortSelect = document.getElementById("sort-select");
    sortSelect.addEventListener("change", (e) => {
        currentSort = e.target.value;
        applyPipeline();
    });

    // Clear Filters
    const clearFiltersBtn = document.getElementById("clear-filters-btn");
    const emptyClearBtn = document.getElementById("empty-clear-btn");
    [clearFiltersBtn, emptyClearBtn].forEach(btn => {
        if (btn) {
            btn.addEventListener("click", clearAllFilters);
        }
    });

    // Retry Button
    const retryBtn = document.getElementById("retry-btn");
    if (retryBtn) {
        retryBtn.addEventListener("click", () => loadSizes());
    }

    // Modal Close
    const modal = document.getElementById("size-modal");
    const modalClose = document.getElementById("modal-close");
    modalClose.addEventListener("click", closeSizePreview);
    modal.addEventListener("click", (e) => {
        if (e.target === modal) closeSizePreview();
    });
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
            closeSizePreview();
            mainNav.classList.remove("show");
        }
    });
}

// Parse URL Parameters
function parseUrlParams() {
    const params = new URLSearchParams(window.location.search);
    const searchParam = params.get("search");
    if (searchParam) {
        currentSearch = searchParam;
        const heroSearchInput = document.getElementById("hero-search-input");
        if (heroSearchInput) heroSearchInput.value = searchParam;
    }
    const sizeIdParam = params.get("sizeId");
    if (sizeIdParam) {
        window.pendingSizeIdModal = parseInt(sizeIdParam);
    }
}

// Update URL State without reload
function updateUrlState() {
    const url = new URL(window.location);
    if (currentSearch) {
        url.searchParams.set("search", currentSearch);
    } else {
        url.searchParams.delete("search");
    }
    history.replaceState({}, "", url);
}

// Load Sizes (API or Mock)
async function loadSizes() {
    showLoadingState();
    try {
        let rawData;
        if (USE_MOCK_DATA) {
            await new Promise(resolve => setTimeout(resolve, 600));
            rawData = getMockSizes();
            document.getElementById("demo-indicator").style.display = "inline-flex";
        } else {
            const response = await fetch(`${API_BASE_URL}${SIZE_ENDPOINT}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    ...getAuthHeaders()
                }
            });
            if (!response.ok) throw new Error("Failed to load fish sizes");
            rawData = await response.json();
        }

        allSizes = rawData.map(normalizeSize);
        applyPipeline();

        if (window.pendingSizeIdModal) {
            const targetSize = allSizes.find(s => s.id === window.pendingSizeIdModal);
            if (targetSize) openSizePreview(targetSize);
            window.pendingSizeIdModal = null;
        }
    } catch (err) {
        console.error(err);
        showErrorState();
        showToast("Unable to load fish sizes", "error");
    }
}

// Normalize Size DTO
function normalizeSize(size) {
    return {
        id: size.id,
        sizeName: size.sizeName ?? "Unknown Size",
        description: size.description ?? "Aquarium fish size classification.",
        fishCount: size.fishCount ?? null,
        imageUrl: size.imageUrl ?? ""
    };
}

// Pipeline: Search -> Filter -> Sort -> Render
function applyPipeline() {
    // 1. Search
    let results = allSizes.filter(size => {
        const query = currentSearch.toLowerCase();
        const matchesName = size.sizeName.toLowerCase().includes(query);
        const matchesDesc = size.description.toLowerCase().includes(query);
        return matchesName || matchesDesc;
    });

    // 2. Filter
    if (currentFilter !== "all") {
        results = results.filter(size => size.sizeName.toLowerCase() === currentFilter.toLowerCase());
    }

    // 3. Sort
    results.sort((a, b) => {
        if (currentSort === "name-asc") {
            return a.sizeName.localeCompare(b.sizeName);
        } else if (currentSort === "name-desc") {
            return b.sizeName.localeCompare(a.sizeName);
        } else if (currentSort === "count-desc") {
            return (b.fishCount || 0) - (a.fishCount || 0);
        } else if (currentSort === "count-asc") {
            return (a.fishCount || 0) - (b.fishCount || 0);
        }
        return 0;
    });

    filteredSizes = results;
    renderSizes();
    renderPopularSizes();
    updateResultsCounter();
}

// Render Sizes Grid
function renderSizes() {
    const grid = document.getElementById("size-grid");
    const emptyState = document.getElementById("empty-state");
    const loadingState = document.getElementById("loading-state");
    const errorState = document.getElementById("error-state");

    loadingState.style.display = "none";
    errorState.style.display = "none";

    if (filteredSizes.length === 0) {
        grid.style.display = "none";
        emptyState.style.display = "block";
        document.getElementById("clear-filters-btn").style.display = "inline-flex";
        return;
    }

    emptyState.style.display = "none";
    grid.style.display = "grid";
    document.getElementById("clear-filters-btn").style.display = (currentSearch || currentFilter !== "all") ? "inline-flex" : "none";

    grid.innerHTML = filteredSizes.map(size => `
        <article class="size-card" data-id="${size.id}">
            <div class="size-card-visual" onclick="handleCardClick(${size.id})" style="cursor: pointer;">
                <i class="fa-solid fa-fish-fins"></i>
            </div>
            <div class="size-card-body">
                <h3 onclick="handleCardClick(${size.id})" style="cursor: pointer;">${escapeHtml(size.sizeName)}</h3>
                <p>${escapeHtml(size.description)}</p>
                <div class="size-card-footer">
                    <span class="fish-count">
                        <i class="fa-solid fa-fish"></i> ${size.fishCount !== null ? `${size.fishCount} Fish Available` : 'View Fish'}
                    </span>
                    <a href="fish.html?sizeId=${size.id}" class="browse-link" onclick="event.stopPropagation();">
                        Browse Fish <i class="fa-solid fa-arrow-right"></i>
                    </a>
                </div>
            </div>
        </article>
    `).join("");
}

// Render Popular Sizes Section
function renderPopularSizes() {
    const popularGrid = document.getElementById("popular-grid");
    if (!popularGrid) return;

    const popular = [...allSizes].sort((a, b) => (b.fishCount || 0) - (a.fishCount || 0)).slice(0, 3);

    popularGrid.innerHTML = popular.map(size => `
        <div class="size-card" onclick="openSizePreviewById(${size.id})" style="cursor: pointer;">
            <div class="size-card-visual">
                <i class="fa-solid fa-fish"></i>
            </div>
            <div class="size-card-body">
                <h3>${escapeHtml(size.sizeName)}</h3>
                <p>${escapeHtml(size.description)}</p>
                <div class="size-card-footer">
                    <span class="fish-count"><i class="fa-solid fa-fish"></i> ${size.fishCount ?? 0} Fish Available</span>
                    <span class="browse-link">Explore <i class="fa-solid fa-arrow-right"></i></span>
                </div>
            </div>
        </div>
    `).join("");
}

// Update Results Counter
function updateResultsCounter() {
    const counter = document.getElementById("results-counter");
    if (filteredSizes.length === allSizes.length) {
        counter.textContent = `Showing all ${allSizes.length} sizes`;
    } else {
        counter.textContent = `Showing ${filteredSizes.length} of ${allSizes.length} sizes`;
    }
}

// Card Click / Preview Handler
function handleCardClick(id) {
    const size = allSizes.find(s => s.id === id);
    if (size) openSizePreview(size);
}

function openSizePreviewById(id) {
    const size = allSizes.find(s => s.id === id);
    if (size) openSizePreview(size);
}

function openSizePreview(size) {
    activeModalSize = size;
    const modal = document.getElementById("size-modal");
    document.getElementById("modal-title").textContent = size.sizeName;
    document.getElementById("modal-desc").textContent = size.description;
    document.getElementById("modal-count").textContent = size.fishCount ?? 0;

    const browseBtn = document.getElementById("modal-browse-btn");
    browseBtn.onclick = () => {
        // TODO BACKEND:
        // Fish catalog should read sizeId from the URL and request/filter
        // fish using the backend-supported size relationship.
        window.location.href = `fish.html?sizeId=${size.id}`;
    };

    modal.classList.add("show");
    modal.setAttribute("aria-hidden", "false");
}

function closeSizePreview() {
    const modal = document.getElementById("size-modal");
    modal.classList.remove("show");
    modal.setAttribute("aria-hidden", "true");
    activeModalSize = null;
}

// Clear All Filters
function clearAllFilters() {
    currentSearch = "";
    currentFilter = "all";
    currentSort = "name-asc";

    const heroSearchInput = document.getElementById("hero-search-input");
    if (heroSearchInput) heroSearchInput.value = "";

    const sortSelect = document.getElementById("sort-select");
    if (sortSelect) sortSelect.value = "name-asc";

    const filterPills = document.querySelectorAll(".filter-pill");
    filterPills.forEach(p => {
        if (p.getAttribute("data-filter") === "all") p.classList.add("active");
        else p.classList.remove("active");
    });

    updateUrlState();
    applyPipeline();
    showToast("Filters cleared", "success");
}

// States UI
function showLoadingState() {
    document.getElementById("loading-state").style.display = "grid";
    document.getElementById("size-grid").style.display = "none";
    document.getElementById("empty-state").style.display = "none";
    document.getElementById("error-state").style.display = "none";
}

function showErrorState() {
    document.getElementById("loading-state").style.display = "none";
    document.getElementById("size-grid").style.display = "none";
    document.getElementById("empty-state").style.display = "none";
    document.getElementById("error-state").style.display = "block";
}

// Cart Badge Update
async function updateCartBadge() {
    // TODO BACKEND:
    // Replace demo value with the project's actual cart count endpoint.
    try {
        let count = 0;
        if (USE_MOCK_DATA) {
            count = 2;
        } else {
            const response = await fetch(`${API_BASE_URL}/cart/count`, {
                headers: { ...getAuthHeaders() }
            });
            if (response.ok) {
                const data = await response.json();
                count = data.count ?? 0;
            }
        }
        const badge = document.getElementById("cart-badge");
        if (badge) badge.textContent = count;
    } catch (e) {
        console.error("Failed to fetch cart count", e);
    }
}

// Toast Notifications System
function showToast(message, type = "success") {
    const container = document.getElementById("toast-container");
    if (!container) return;

    const toast = document.createElement("div");
    toast.className = `toast ${type}`;
    let iconClass = "fa-circle-check";
    if (type === "error") iconClass = "fa-circle-exclamation";

    toast.innerHTML = `
        <i class="fa-solid ${iconClass}"></i>
        <span>${escapeHtml(message)}</span>
    `;

    container.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = "0";
        toast.style.transform = "translateX(50px)";
        setTimeout(() => toast.remove(), 300);
    }, 3500);
}

// Utility: Debounce
function debounce(func, wait) {
    let timeout;
    return function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}

// Utility: XSS Protection
function escapeHtml(value) {
    if (!value) return "";
    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// Utility: Safe Image URL
function getSafeImageUrl(imageUrl) {
    if (!imageUrl || typeof imageUrl !== "string") return "";
    if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://") || imageUrl.startsWith("/")) {
        return imageUrl;
    }
    return "";
}