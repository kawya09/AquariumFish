/**
 * Aquarium Fish E-Commerce - Fish Colors Page Script
 * Built with Vanilla JavaScript
 */

const API_BASE_URL = "http://localhost:8080/api";
const USE_MOCK_DATA = true;
const COLOR_ENDPOINT = "/colors";

// State
let allColors = [];
let filteredColors = [];
let currentSearch = "";
let currentFilter = "all";
let currentSort = "name-asc";
let activeModalColor = null;

// Mock Dataset (Demo values only)
function getMockColors() {
    return [
        {
            id: 1,
            colorName: "Blue",
            description: "Beautiful blue tones that create a calm and vibrant aquarium appearance.",
            fishCount: 24,
            colorHex: "#2196F3"
        },
        {
            id: 2,
            colorName: "Red",
            description: "Striking red tones that create strong visual contrast.",
            fishCount: 19,
            colorHex: "#E53935"
        },
        {
            id: 3,
            colorName: "Yellow",
            description: "Bright yellow coloration that adds energy to an aquarium.",
            fishCount: 16,
            colorHex: "#FDD835"
        },
        {
            id: 4,
            colorName: "Orange",
            description: "Warm orange tones for a vibrant aquarium display.",
            fishCount: 14,
            colorHex: "#FB8C00"
        },
        {
            id: 5,
            colorName: "Gold",
            description: "Warm golden coloration that creates an elegant focal point.",
            fishCount: 18,
            colorHex: "#D4AF37"
        },
        {
            id: 6,
            colorName: "White",
            description: "Clean white coloration that contrasts beautifully with plants and rocks.",
            fishCount: 12,
            colorHex: "#F5F5F5"
        },
        {
            id: 7,
            colorName: "Black",
            description: "Deep dark coloration that creates dramatic aquarium contrast.",
            fishCount: 10,
            colorHex: "#212121"
        },
        {
            id: 8,
            colorName: "Green",
            description: "Natural green tones for a fresh aquatic appearance.",
            fishCount: 8,
            colorHex: "#43A047"
        },
        {
            id: 9,
            colorName: "Silver",
            description: "Reflective silver tones with a clean and elegant appearance.",
            fishCount: 21,
            colorHex: "#B0BEC5"
        },
        {
            id: 10,
            colorName: "Purple",
            description: "Distinctive purple tones for a unique aquarium display.",
            fishCount: 7,
            colorHex: "#8E44AD"
        },
        {
            id: 11,
            colorName: "Pink",
            description: "Soft pink coloration that adds a delicate visual accent.",
            fishCount: 6,
            colorHex: "#EC407A"
        },
        {
            id: 12,
            colorName: "Brown",
            description: "Natural brown tones that complement earthy aquarium environments.",
            fishCount: 9,
            colorHex: "#795548"
        },
        {
            id: 13,
            colorName: "Cream",
            description: "Soft cream coloration with a subtle natural appearance.",
            fishCount: 5,
            colorHex: "#FFF3E0"
        },
        {
            id: 14,
            colorName: "Turquoise",
            description: "Bright blue-green tones that create a vibrant aquatic appearance.",
            fishCount: 11,
            colorHex: "#26A69A"
        },
        {
            id: 15,
            colorName: "Mixed",
            description: "Fish featuring multiple colors, patterns, or combinations.",
            fishCount: 27,
            colorHex: "linear-gradient(135deg, #2196F3, #E53935, #FDD835)"
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
    await loadColors();
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
        retryBtn.addEventListener("click", () => loadColors());
    }

    // Modal Close
    const modal = document.getElementById("color-modal");
    const modalClose = document.getElementById("modal-close");
    modalClose.addEventListener("click", closeColorPreview);
    modal.addEventListener("click", (e) => {
        if (e.target === modal) closeColorPreview();
    });
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
            closeColorPreview();
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
    const colorIdParam = params.get("colorId");
    if (colorIdParam) {
        window.pendingColorIdModal = parseInt(colorIdParam);
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

// Load Colors (API or Mock)
async function loadColors() {
    showLoadingState();
    try {
        let rawData;
        if (USE_MOCK_DATA) {
            await new Promise(resolve => setTimeout(resolve, 600));
            rawData = getMockColors();
            document.getElementById("demo-indicator").style.display = "inline-flex";
        } else {
            rawData = await fetchColors();
        }

        allColors = rawData.map(normalizeColor);
        applyPipeline();

        if (window.pendingColorIdModal) {
            const targetColor = allColors.find(c => c.id === window.pendingColorIdModal);
            if (targetColor) openColorPreview(targetColor);
            window.pendingColorIdModal = null;
        }
    } catch (err) {
        console.error(err);
        showErrorState();
        showToast("Unable to load fish colors", "error");
    }
}

async function fetchColors() {
    const response = await fetch(`${API_BASE_URL}${COLOR_ENDPOINT}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            ...getAuthHeaders()
        }
    });

    if (!response.ok) {
        throw new Error("Failed to load fish colors");
    }

    return await response.json();
}

// Normalize Color DTO
function normalizeColor(color) {
    return {
        id: color.id,
        colorName: color.colorName ?? "Unknown Color",
        description: color.description ?? "Aquarium fish color classification.",
        fishCount: color.fishCount ?? null,
        colorHex: color.colorHex ?? "#cccccc"
    };
}

// Pipeline: Search -> Filter -> Sort -> Render
function applyPipeline() {
    // 1. Search
    let results = allColors.filter(color => {
        const query = currentSearch.toLowerCase();
        const matchesName = color.colorName.toLowerCase().includes(query);
        const matchesDesc = color.description.toLowerCase().includes(query);
        return matchesName || matchesDesc;
    });

    // 2. Filter
    if (currentFilter !== "all") {
        results = results.filter(color => color.colorName.toLowerCase() === currentFilter.toLowerCase());
    }

    // 3. Sort
    results.sort((a, b) => {
        if (currentSort === "name-asc") {
            return a.colorName.localeCompare(b.colorName);
        } else if (currentSort === "name-desc") {
            return b.colorName.localeCompare(a.colorName);
        } else if (currentSort === "count-desc") {
            return (b.fishCount || 0) - (a.fishCount || 0);
        } else if (currentSort === "count-asc") {
            return (a.fishCount || 0) - (b.fishCount || 0);
        }
        return 0;
    });

    filteredColors = results;
    renderColors();
    renderPopularColors();
    updateResultsCounter();
}

// Render Colors Grid
function renderColors() {
    const grid = document.getElementById("color-grid");
    const emptyState = document.getElementById("empty-state");
    const loadingState = document.getElementById("loading-state");
    const errorState = document.getElementById("error-state");

    loadingState.style.display = "none";
    errorState.style.display = "none";

    if (filteredColors.length === 0) {
        grid.style.display = "none";
        emptyState.style.display = "block";
        document.getElementById("clear-filters-btn").style.display = "inline-flex";
        return;
    }

    emptyState.style.display = "none";
    grid.style.display = "grid";
    document.getElementById("clear-filters-btn").style.display = (currentSearch || currentFilter !== "all") ? "inline-flex" : "none";

    grid.innerHTML = filteredColors.map(color => {
        const safeBg = getSafeColor(color.colorHex);
        return `
            <article class="color-card" data-id="${color.id}">
                <div class="color-card-visual" onclick="handleCardClick(${color.id})" style="cursor: pointer;">
                    <div class="color-swatch" style="background: ${safeBg};" aria-label="${escapeHtml(color.colorName)} fish color"></div>
                </div>
                <div class="color-card-body">
                    <h3 onclick="handleCardClick(${color.id})" style="cursor: pointer;">${escapeHtml(color.colorName)}</h3>
                    <p>${escapeHtml(color.description)}</p>
                    <div class="color-card-footer">
                        <span class="fish-count">
                            <i class="fa-solid fa-fish"></i> ${color.fishCount !== null ? `${color.fishCount} Fish Available` : 'View Fish'}
                        </span>
                        <a href="fish.html?colorId=${color.id}" class="browse-link" onclick="event.stopPropagation();">
                            Browse Fish <i class="fa-solid fa-arrow-right"></i>
                        </a>
                    </div>
                </div>
            </article>
        `;
    }).join("");
}

// Render Popular Colors Section
function renderPopularColors() {
    const popularGrid = document.getElementById("popular-grid");
    if (!popularGrid) return;

    const popular = [...allColors].sort((a, b) => (b.fishCount || 0) - (a.fishCount || 0)).slice(0, 3);

    popularGrid.innerHTML = popular.map(color => {
        const safeBg = getSafeColor(color.colorHex);
        return `
            <div class="color-card" onclick="openColorPreviewById(${color.id})" style="cursor: pointer;">
                <div class="color-card-visual">
                    <div class="color-swatch" style="background: ${safeBg};" aria-label="${escapeHtml(color.colorName)} fish color"></div>
                </div>
                <div class="color-card-body">
                    <h3>${escapeHtml(color.colorName)}</h3>
                    <p>${escapeHtml(color.description)}</p>
                    <div class="color-card-footer">
                        <span class="fish-count"><i class="fa-solid fa-fish"></i> ${color.fishCount ?? 0} Fish Available</span>
                        <span class="browse-link">Explore <i class="fa-solid fa-arrow-right"></i></span>
                    </div>
                </div>
            </div>
        `;
    }).join("");
}

// Update Results Counter
function updateResultsCounter() {
    const counter = document.getElementById("results-counter");
    if (filteredColors.length === allColors.length) {
        counter.textContent = `Showing all ${allColors.length} colors`;
    } else {
        counter.textContent = `Showing ${filteredColors.length} of ${allColors.length} colors`;
    }
}

// Card Click / Preview Handler
function handleCardClick(id) {
    const color = allColors.find(c => c.id === id);
    if (color) openColorPreview(color);
}

function openColorPreviewById(id) {
    const color = allColors.find(c => c.id === id);
    if (color) openColorPreview(color);
}

function openColorPreview(color) {
    activeModalColor = color;
    const modal = document.getElementById("color-modal");
    document.getElementById("modal-title").textContent = color.colorName;
    document.getElementById("modal-desc").textContent = color.description;
    document.getElementById("modal-count").textContent = color.fishCount ?? 0;
    document.getElementById("modal-swatch").style.background = getSafeColor(color.colorHex);

    const browseBtn = document.getElementById("modal-browse-btn");
    browseBtn.onclick = () => {
        // TODO BACKEND:
        // The fish catalog should read colorId from the URL and request/filter
        // fish using the backend-supported Fish_Color relationship.
        window.location.href = `fish.html?colorId=${color.id}`;
    };

    modal.classList.add("show");
    modal.setAttribute("aria-hidden", "false");
}

function closeColorPreview() {
    const modal = document.getElementById("color-modal");
    modal.classList.remove("show");
    modal.setAttribute("aria-hidden", "true");
    activeModalColor = null;
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
    document.getElementById("color-grid").style.display = "none";
    document.getElementById("empty-state").style.display = "none";
    document.getElementById("error-state").style.display = "none";
}

function showErrorState() {
    document.getElementById("loading-state").style.display = "none";
    document.getElementById("color-grid").style.display = "none";
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

// Utility: Safe Color Validation
function getSafeColor(value) {
    if (!value || typeof value !== "string") return "#cccccc";
    const trimmed = value.trim();
    // Allow valid HEX, rgb, rgba, hsl, hsla, or standard CSS gradients for mixed demo
    if (
        /^#([0-9A-Fa-f]{3}){1,2}$/.test(trimmed) ||
        /^rgb\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\)$/i.test(trimmed) ||
        /^rgba\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*,\s*[\d.]+\s*\)$/i.test(trimmed) ||
        /^hsl\(\s*\d+\s*,\s*[\d.]+\%?\s*,\s*[\d.]+\%?\s*\)$/i.test(trimmed) ||
        /^hsla\(\s*\d+\s*,\s*[\d.]+\%?\s*,\s*[\d.]+\%?\s*,\s*[\d.]+\s*\)$/i.test(trimmed) ||
        trimmed.startsWith("linear-gradient") ||
        trimmed.startsWith("radial-gradient")
    ) {
        return trimmed;
    }
    return "#cccccc";
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