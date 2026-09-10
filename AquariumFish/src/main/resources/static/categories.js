/**
 * Aquarium Fish - Categories Page Script
 * Fully modular and prepared for Spring Boot REST API integration.
 */

// ==========================================
// API CONFIGURATION
// ==========================================
// TODO: Replace with your Spring Boot backend REST API base URL
const API_BASE_URL = "http://localhost:8080/api";

// Enable this flag to test real API vs Demo Mock Data
const USE_API = false;

// ==========================================
// MOCK DATA FOR FRONTEND PREVIEW ONLY
// ==========================================
// TODO: Replace mock data with GET /api/categories API response
const mockCategories = [
    {
        id: 1,
        categoryName: "Betta Fish",
        description: "Colorful and elegant freshwater fish perfect for smaller aquarium setups.",
        imageUrl: "https://images.unsplash.com/photo-1534575180408-b7d785e223af?auto=format&fit=crop&w=600&q=80",
        fishCount: 24,
        tags: ["beginner", "colorful", "freshwater"],
        breeds: ["Halfmoon", "Crowntail", "Plakat"]
    },
    {
        id: 2,
        categoryName: "Goldfish",
        description: "Classic and hardy freshwater aquarium species enjoyed by aquarists worldwide.",
        imageUrl: "https://images.unsplash.com/photo-1522069169874-c58ec4b76be5?auto=format&fit=crop&w=600&q=80",
        fishCount: 18,
        tags: ["beginner", "freshwater"],
        breeds: ["Fantail", "Oranda", "Black Moor"]
    },
    {
        id: 3,
        categoryName: "Guppy",
        description: "Small, peaceful, and extremely vibrant livebearer fish suitable for community tanks.",
        imageUrl: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=600&q=80",
        fishCount: 32,
        tags: ["beginner", "colorful", "community"],
        breeds: ["Fancy Tail", "Cobra", "Neon Red"]
    },
    {
        id: 4,
        categoryName: "Tetra",
        description: "Energetic schooling fish known for stunning neon glow and peaceful behavior.",
        imageUrl: "https://images.unsplash.com/photo-1520315342629-6ea920342047?auto=format&fit=crop&w=600&q=80",
        fishCount: 29,
        tags: ["community", "colorful", "freshwater"],
        breeds: ["Neon Tetra", "Cardinal Tetra", "Rummynose"]
    },
    {
        id: 5,
        categoryName: "Cichlids",
        description: "Intelligent and active species boasting bright colors and unique personality.",
        imageUrl: "https://images.unsplash.com/photo-1571752726703-5e7d1f6a986d?auto=format&fit=crop&w=600&q=80",
        fishCount: 15,
        tags: ["tropical", "colorful"],
        breeds: ["African Peacock", "Electric Blue Demsey", "Yellow Lab"]
    },
    {
        id: 6,
        categoryName: "Angelfish",
        description: "Majestic triangular freshwater fish adding grace and elegance to tall tanks.",
        imageUrl: "https://images.unsplash.com/photo-1516683011827-46882223f3fb?auto=format&fit=crop&w=600&q=80",
        fishCount: 10,
        tags: ["tropical", "community"],
        breeds: ["Marble", "Silver", "Koi Angel"]
    },
    {
        id: 7,
        categoryName: "Discus",
        description: "The crown jewel of freshwater aquariums, famous for intricate patterns.",
        imageUrl: "https://images.unsplash.com/photo-1582234372722-50d7ccc30ebd?auto=format&fit=crop&w=600&q=80",
        fishCount: 8,
        tags: ["tropical", "colorful"],
        breeds: ["Blue Diamond", "Red Turquoise", "Pigeon Blood"]
    },
    {
        id: 8,
        categoryName: "Molly & Platy",
        description: "Hardy, active livebearers available in various vibrant color strains.",
        imageUrl: "https://images.unsplash.com/photo-1524704685729-28f6938e445a?auto=format&fit=crop&w=600&q=80",
        fishCount: 22,
        tags: ["beginner", "community", "freshwater"],
        breeds: ["Black Molly", "Sunburst Platy", "Dalmatian Molly"]
    }
];

// State Variables
let categoriesData = [];
let filteredCategories = [];
let activeTagFilter = "all";
let currentSearchQuery = "";
let currentSortOption = "featured";

// ==========================================
// DOM INITIALIZATION
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
    initializeNavbar();
    initializeCategoryFilters();
    initializeSearchAndSort();
    initializeModal();
    updateCartCount();
    checkAuthStatus();
    loadCategories();
});

// Mobile Navbar Toggle
function initializeNavbar() {
    const hamburgerBtn = document.getElementById("hamburgerBtn");
    const navMenu = document.getElementById("navMenu");

    if (hamburgerBtn && navMenu) {
        hamburgerBtn.addEventListener("click", () => {
            navMenu.classList.toggle("active");
            const icon = hamburgerBtn.querySelector("i");
            if (icon) {
                icon.classList.toggle("fa-bars");
                icon.classList.toggle("fa-xmark");
            }
        });
    }
}

// Filter Tag Buttons
function initializeCategoryFilters() {
    const tagButtons = document.querySelectorAll("#filterTagsContainer .tag-btn");
    tagButtons.forEach(btn => {
        btn.addEventListener("click", (e) => {
            tagButtons.forEach(b => b.classList.remove("active"));
            e.target.classList.add("active");
            activeTagFilter = e.target.getAttribute("data-filter");
            filterAndRenderCategories();
        });
    });
}

// Search and Sort Listeners
function initializeSearchAndSort() {
    const searchInput = document.getElementById("categorySearchInput");
    const clearBtn = document.getElementById("clearSearchBtn");
    const sortSelect = document.getElementById("categorySortSelect");

    if (searchInput) {
        searchInput.addEventListener("input", (e) => {
            currentSearchQuery = e.target.value.trim().toLowerCase();
            if (clearBtn) {
                clearBtn.style.display = currentSearchQuery.length > 0 ? "block" : "none";
            }
            handleCategorySearch();
        });
    }

    if (clearBtn) {
        clearBtn.addEventListener("click", () => {
            if (searchInput) {
                searchInput.value = "";
                currentSearchQuery = "";
                clearBtn.style.display = "none";
                handleCategorySearch();
            }
        });
    }

    if (sortSelect) {
        sortSelect.addEventListener("change", (e) => {
            currentSortOption = e.target.value;
            sortCategories();
            renderCategories();
        });
    }

    const retryBtn = document.getElementById("retryBtn");
    if (retryBtn) {
        retryBtn.addEventListener("click", () => retryLoadingCategories());
    }
}

// Modal Quick View Listeners
function initializeModal() {
    const modal = document.getElementById("previewModal");
    const closeBtn = document.getElementById("modalCloseBtn");

    if (closeBtn && modal) {
        closeBtn.addEventListener("click", closeCategoryPreview);
        modal.addEventListener("click", (e) => {
            if (e.target === modal) closeCategoryPreview();
        });
    }
}

// ==========================================
// CATEGORY DATA LOADING & API FETCH
// ==========================================
async function loadCategories() {
    showLoadingState();

    if (USE_API) {
        try {
            categoriesData = await fetchCategoriesFromAPI();
            processLoadedCategories();
        } catch (error) {
            console.error("API Error:", error);
            showErrorState();
        }
    } else {
        // Simulate Network Latency for Preview
        setTimeout(() => {
            categoriesData = [...mockCategories];
            processLoadedCategories();
        }, 600);
    }
}

// TODO: Connect this fetch call to your Spring Boot REST API Controller (@GetMapping("/api/categories"))
async function fetchCategoriesFromAPI() {
    const response = await fetch(`${API_BASE_URL}/categories`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json"
        }
    });

    if (!response.ok) {
        throw new Error(`Server returned status: ${response.status}`);
    }

    const data = await response.json();

    // Map Spring Boot Fish_Category entity structure to frontend model if necessary
    return data.map(item => ({
        id: item.id,
        categoryName: item.categoryName,
        description: item.description,
        imageUrl: item.imageUrl || "https://images.unsplash.com/photo-1522069169874-c58ec4b76be5?auto=format&fit=crop&w=600&q=80",
        fishCount: item.fishCount || (item.fish ? item.fish.length : 0),
        tags: item.tags || ["freshwater"],
        breeds: item.breeds || []
    }));
}

function processLoadedCategories() {
    updateCategoryStats();
    filterAndRenderCategories();
}

function retryLoadingCategories() {
    loadCategories();
}

// ==========================================
// RENDERING & CARD GENERATION
// ==========================================
function renderCategories() {
    const container = document.getElementById("categoriesContainer");
    const skeletonContainer = document.getElementById("skeletonContainer");
    const emptyState = document.getElementById("emptyState");
    const errorState = document.getElementById("errorState");

    skeletonContainer.style.display = "none";
    errorState.style.display = "none";

    if (filteredCategories.length === 0) {
        container.style.display = "none";
        emptyState.style.display = "block";
        return;
    }

    emptyState.style.display = "none";
    container.style.display = "grid";
    container.innerHTML = "";

    filteredCategories.forEach(category => {
        const cardElement = createCategoryCard(category);
        container.appendChild(cardElement);
    });
}

function createCategoryCard(category) {
    const card = document.createElement("div");
    card.className = "category-card";

    // Dynamic Image Alt Text for Accessibility
    const altText = `${category.categoryName} category image`;
    const fishCountText = `${category.fishCount || 0} Fish Available`;

    card.innerHTML = `
        <div class="card-img-wrapper">
            <img src="${category.imageUrl}" alt="${altText}" loading="lazy">
            <span class="fish-count-badge">${fishCountText}</span>
        </div>
        <div class="card-body">
            <h3 class="category-card-title">${category.categoryName}</h3>
            <p class="category-card-desc">${category.description}</p>
            <div class="card-actions">
                <button class="btn-explore" onclick="navigateToCategory(${category.id}, '${category.categoryName}')">
                    Explore Category <i class="fa-solid fa-arrow-right"></i>
                </button>
                <button class="btn-quick-view" title="Quick Preview" onclick="openCategoryPreview(${category.id})">
                    <i class="fa-solid fa-eye"></i>
                </button>
            </div>
        </div>
    `;

    return card;
}

function showLoadingState() {
    const container = document.getElementById("categoriesContainer");
    const skeletonContainer = document.getElementById("skeletonContainer");
    const emptyState = document.getElementById("emptyState");
    const errorState = document.getElementById("errorState");

    container.style.display = "none";
    emptyState.style.display = "none";
    errorState.style.display = "none";
    skeletonContainer.style.display = "grid";

    // Generate Skeleton Cards
    skeletonContainer.innerHTML = "";
    for (let i = 0; i < 8; i++) {
        const skeleton = document.createElement("div");
        skeleton.className = "skeleton-card";
        skeleton.innerHTML = `
            <div class="skeleton-img"></div>
            <div class="skeleton-body">
                <div class="skeleton-line title"></div>
                <div class="skeleton-line text-1"></div>
                <div class="skeleton-line text-2"></div>
                <div class="skeleton-line btn-sk"></div>
            </div>
        `;
        skeletonContainer.appendChild(skeleton);
    }
}

function showErrorState() {
    document.getElementById("skeletonContainer").style.display = "none";
    document.getElementById("categoriesContainer").style.display = "none";
    document.getElementById("emptyState").style.display = "none";
    document.getElementById("errorState").style.display = "block";
}

// ==========================================
// FILTER, SEARCH, & SORT LOGIC
// ==========================================
function handleCategorySearch() {
    filterAndRenderCategories();
}

function filterAndRenderCategories() {
    filteredCategories = categoriesData.filter(category => {
        // Tag/Preference Filter
        const matchesTag = activeTagFilter === "all" ||
            (category.tags && category.tags.includes(activeTagFilter));

        // Search Query Filter (Matches Name or Description)
        const matchesSearch = currentSearchQuery === "" ||
            category.categoryName.toLowerCase().includes(currentSearchQuery) ||
            category.description.toLowerCase().includes(currentSearchQuery);

        return matchesTag && matchesSearch;
    });

    sortCategories();
    renderCategories();
}

function sortCategories() {
    switch (currentSortOption) {
        case "name-asc":
            filteredCategories.sort((a, b) => a.categoryName.localeCompare(b.categoryName));
            break;
        case "name-desc":
            filteredCategories.sort((a, b) => b.categoryName.localeCompare(a.categoryName));
            break;
        case "count-desc":
            filteredCategories.sort((a, b) => (b.fishCount || 0) - (a.fishCount || 0));
            break;
        case "featured":
        default:
            filteredCategories.sort((a, b) => a.id - b.id);
            break;
    }
}

// Navigation Helper - Redirects to Catalog Page with URL Parameters
function navigateToCategory(id, name) {
    // Navigates using Category ID (Spring Boot API friendly) or Name as fallback
    window.location.href = `fish.html?categoryId=${id}&category=${encodeURIComponent(name)}`;
}

// ==========================================
// QUICK PREVIEW MODAL
// ==========================================
function openCategoryPreview(categoryId) {
    const category = categoriesData.find(c => c.id === categoryId);
    if (!category) return;

    document.getElementById("modalCategoryImg").src = category.imageUrl;
    document.getElementById("modalCategoryImg").alt = category.categoryName;
    document.getElementById("modalCategoryName").textContent = category.categoryName;
    document.getElementById("modalCategoryDesc").textContent = category.description;
    document.getElementById("modalFishCount").textContent = `${category.fishCount || 0} Fish Available`;

    const tagsContainer = document.getElementById("modalTags");
    tagsContainer.innerHTML = "";

    const displayTags = category.breeds && category.breeds.length > 0 ? category.breeds : category.tags;
    if (displayTags && displayTags.length > 0) {
        displayTags.forEach(tag => {
            const span = document.createElement("span");
            span.className = "modal-tag";
            span.textContent = tag;
            tagsContainer.appendChild(span);
        });
    }

    const viewBtn = document.getElementById("modalViewFishBtn");
    viewBtn.onclick = (e) => {
        e.preventDefault();
        navigateToCategory(category.id, category.categoryName);
    };

    const modal = document.getElementById("previewModal");
    modal.classList.add("active");
    modal.setAttribute("aria-hidden", "false");
}

function closeCategoryPreview() {
    const modal = document.getElementById("previewModal");
    modal.classList.remove("active");
    modal.setAttribute("aria-hidden", "true");
}

// ==========================================
// STATS & INTEGRATION HELPERS
// ==========================================
function updateCategoryStats() {
    const totalCategories = categoriesData.length;
    const totalFish = categoriesData.reduce((acc, curr) => acc + (curr.fishCount || 0), 0);

    const categoryElem = document.getElementById("statCategoryCount");
    const fishElem = document.getElementById("statFishCount");

    if (categoryElem) categoryElem.textContent = totalCategories;
    if (fishElem) fishElem.textContent = `${totalFish}+`;
}

// TODO: Connect cart count display to GET /api/cart
async function updateCartCount() {
    const cartBadge = document.getElementById("cartBadge");
    if (!cartBadge) return;

    const token = localStorage.getItem("token");

    if (USE_API && token) {
        try {
            const response = await fetch(`${API_BASE_URL}/cart`, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            if (response.ok) {
                const cart = await response.json();
                cartBadge.textContent = cart.items ? cart.items.length : 0;
                return;
            }
        } catch (e) {
            console.warn("Could not fetch cart count:", e);
        }
    }

    // Default or unauthenticated display
    cartBadge.textContent = "0";
}

// Authorization check (Frontend state management only - Backend remains authoritative)
// TODO: Connect authentication state to backend session/token
function checkAuthStatus() {
    const token = localStorage.getItem("token");
    const authContainer = document.getElementById("authContainer");

    if (token && authContainer) {
        authContainer.innerHTML = `
            <a href="account.html" class="nav-icon-btn" title="My Account">
                <i class="fa-solid fa-user"></i>
            </a>
            <button onclick="handleLogout()" class="btn btn-outline-sm">Logout</button>
        `;
    }
}

function handleLogout() {
    localStorage.removeItem("token");
    window.location.reload();
}