/**
 * js/fish.js - Admin Fish Management Page Logic
 * Aquarium Fish Spring Boot E-Commerce Project
 */

// API Configuration & Global Constants
const API_BASE_URL = "http://localhost:8080/api";
const USE_MOCK_DATA = true;
const PAGE_SIZE = 10;
const LOW_STOCK_THRESHOLD = 5;

// Currency Formatter for LKR
const currencyFormatter = new Intl.NumberFormat('en-LK', {
    style: 'currency',
    currency: 'LKR'
});

// Application State
const state = {
    fish: [],
    filteredFish: [],
    categories: [],
    breeds: [],
    sizes: [],
    colors: [],
    sellers: [],
    currentPage: 1,
    pageSize: PAGE_SIZE,
    searchTerm: "",
    categoryFilter: "ALL",
    breedFilter: "ALL",
    sizeFilter: "ALL",
    colorFilter: "ALL",
    sellerFilter: "ALL",
    stockFilter: "ALL",
    statusFilter: "ALL",
    sortBy: "NEWEST",
    selectedFish: null,
    currentLightboxImages: [],
    currentLightboxIndex: 0
};

// Comprehensive Fictional Mock Data (24+ items)
const MOCK_FISH_DATA = [
    {
        id: 3001,
        fishName: "Blue Moscow Guppy",
        description: "Vibrant freshwater guppy with an intense metallic blue body and majestic tail fins.",
        price: 2500,
        stockQty: 14,
        seller: { id: 2001, shopName: "Ocean Life Aquatics", sellerName: "Kasun Perera" },
        category: { id: 1, categoryName: "Freshwater" },
        breed: { id: 4, breedName: "Guppy" },
        size: { id: 2, sizeName: "Small" },
        color: { id: 3, colorName: "Blue" },
        images: [
            { id: 5001, imageUrl: "https://images.unsplash.com/photo-1522069169874-c58ec4b76be5?w=500&auto=format&fit=crop&q=80", isPrimary: true },
            { id: 5002, imageUrl: "https://images.unsplash.com/photo-1535591273668-578e31182c4f?w=500&auto=format&fit=crop&q=80", isPrimary: false }
        ],
        rating: 4.8,
        reviewCount: 18,
        status: "ACTIVE",
        createdDate: "2026-08-20"
    },
    {
        id: 3002,
        fishName: "Super Red Halfmoon Betta",
        description: "Stunning exhibition-grade Betta splendens boasting deep blood-red finnage spreading 180 degrees.",
        price: 3800,
        stockQty: 4,
        seller: { id: 2002, shopName: "Blue Reef Aquarium", sellerName: "Nuwan Silva" },
        category: { id: 1, categoryName: "Freshwater" },
        breed: { id: 1, breedName: "Betta" },
        size: { id: 2, sizeName: "Small" },
        color: { id: 2, colorName: "Red" },
        images: [
            { id: 5003, imageUrl: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=500&auto=format&fit=crop&q=80", isPrimary: true }
        ],
        rating: 4.9,
        reviewCount: 32,
        status: "ACTIVE",
        createdDate: "2026-08-18"
    },
    {
        id: 3003,
        fishName: "Platinum Oranda Goldfish",
        description: "Chubby, premium coldwater goldfish featuring a magnificent prominent head growth (wen) and flawless white scales.",
        price: 6500,
        stockQty: 0,
        seller: { id: 2003, shopName: "Aqua Paradise", sellerName: "Chaminda Mendis" },
        category: { id: 4, categoryName: "Coldwater" },
        breed: { id: 2, breedName: "Goldfish" },
        size: { id: 3, sizeName: "Large" },
        color: { id: 5, colorName: "White" },
        images: [
            { id: 5004, imageUrl: "https://images.unsplash.com/photo-1524704796724-9b6348a5266e?w=500&auto=format&fit=crop&q=80", isPrimary: true }
        ],
        rating: 4.5,
        reviewCount: 12,
        status: "INACTIVE",
        createdDate: "2026-07-10"
    },
    {
        id: 3004,
        fishName: "Amazon Altum Angelfish",
        description: "Graceful wild-caught Rio Orinoco altum angelfish with elongated dorsal fins and striking vertical banding.",
        price: 12500,
        stockQty: 2,
        seller: { id: 2001, shopName: "Ocean Life Aquatics", sellerName: "Kasun Perera" },
        category: { id: 3, categoryName: "Tropical" },
        breed: { id: 3, breedName: "Angelfish" },
        size: { id: 4, sizeName: "Extra Large" },
        color: { id: 6, colorName: "Mixed" },
        images: [
            { id: 5005, imageUrl: "https://images.unsplash.com/photo-1534567153574-2b12153a87f0?w=500&auto=format&fit=crop&q=80", isPrimary: true }
        ],
        rating: 5.0,
        reviewCount: 9,
        status: "ACTIVE",
        createdDate: "2026-08-22"
    },
    {
        id: 3005,
        fishName: "Cardinal Tetra School (10x)",
        description: "A gorgeous shoal of 10 brilliant neon blue and fiery red schooling tetras for planted aquascapes.",
        price: 4500,
        stockQty: 25,
        seller: { id: 2002, shopName: "Blue Reef Aquarium", sellerName: "Nuwan Silva" },
        category: { id: 3, categoryName: "Tropical" },
        breed: { id: 5, breedName: "Tetra" },
        size: { id: 1, sizeName: "Small" },
        color: { id: 6, colorName: "Mixed" },
        images: [
            { id: 5006, imageUrl: "https://images.unsplash.com/photo-1522069169874-c58ec4b76be5?w=500&auto=format&fit=crop&q=80", isPrimary: true }
        ],
        rating: 4.7,
        reviewCount: 45,
        status: "ACTIVE",
        createdDate: "2026-08-25"
    },
    {
        id: 3006,
        fishName: "Black Moor Goldfish",
        description: "Velvety black coloration with prominent telescope eyes, peaceful and hardy coldwater inhabitant.",
        price: 3200,
        stockQty: 8,
        seller: { id: 2003, shopName: "Aqua Paradise", sellerName: "Chaminda Mendis" },
        category: { id: 4, categoryName: "Coldwater" },
        breed: { id: 2, breedName: "Goldfish" },
        size: { id: 3, sizeName: "Large" },
        color: { id: 4, colorName: "Black" },
        images: [
            { id: 5007, imageUrl: "https://images.unsplash.com/photo-1535591273668-578e31182c4f?w=500&auto=format&fit=crop&q=80", isPrimary: true }
        ],
        rating: 4.3,
        reviewCount: 15,
        status: "ACTIVE",
        createdDate: "2026-08-01"
    },
    {
        id: 3007,
        fishName: "Yellow Crowntail Betta",
        description: "Aggressive yet stunning solitary fish featuring distinctive ray extensions on caudal and anal fins.",
        price: 2900,
        stockQty: 3,
        seller: { id: 2001, shopName: "Ocean Life Aquatics", sellerName: "Kasun Perera" },
        category: { id: 1, categoryName: "Freshwater" },
        breed: { id: 1, breedName: "Betta" },
        size: { id: 2, sizeName: "Small" },
        color: { id: 1, colorName: "Yellow" },
        images: [
            { id: 5008, imageUrl: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=500&auto=format&fit=crop&q=80", isPrimary: true }
        ],
        rating: 4.6,
        reviewCount: 20,
        status: "ACTIVE",
        createdDate: "2026-08-12"
    },
    {
        id: 3008,
        fishName: "Electric Blue Ram Cichlid",
        description: "Dwarf cichlid exhibiting a glowing electric blue hue across its body with neat red dorsal accents.",
        price: 3500,
        stockQty: 12,
        seller: { id: 2002, shopName: "Blue Reef Aquarium", sellerName: "Nuwan Silva" },
        category: { id: 3, categoryName: "Tropical" },
        breed: { id: 6, breedName: "Cichlid" },
        size: { id: 2, sizeName: "Small" },
        color: { id: 3, colorName: "Blue" },
        images: [
            { id: 5009, imageUrl: "https://images.unsplash.com/photo-1534567153574-2b12153a87f0?w=500&auto=format&fit=crop&q=80", isPrimary: true }
        ],
        rating: 4.9,
        reviewCount: 28,
        status: "ACTIVE",
        createdDate: "2026-08-14"
    },
    {
        id: 3009,
        fishName: "Saltwater Ocellaris Clownfish",
        description: "Captive-bred energetic clownfish, vibrant orange with classic white bars outlined in bold black.",
        price: 5500,
        stockQty: 19,
        seller: { id: 2004, shopName: "Coral Reef World", sellerName: "Dilshan Jayasinghe" },
        category: { id: 2, categoryName: "Saltwater" },
        breed: { id: 7, breedName: "Clownfish" },
        size: { id: 2, sizeName: "Small" },
        color: { id: 2, colorName: "Red" },
        images: [
            { id: 5010, imageUrl: "https://images.unsplash.com/photo-1524704796724-9b6348a5266e?w=500&auto=format&fit=crop&q=80", isPrimary: true }
        ],
        rating: 4.9,
        reviewCount: 50,
        status: "ACTIVE",
        createdDate: "2026-08-05"
    },
    {
        id: 3010,
        fishName: "Blue Tang (Dory)",
        description: "Iconic marine reef fish with brilliant royal blue body and sunny yellow tail fin.",
        price: 18000,
        stockQty: 1,
        seller: { id: 2004, shopName: "Coral Reef World", sellerName: "Dilshan Jayasinghe" },
        category: { id: 2, categoryName: "Saltwater" },
        breed: { id: 8, breedName: "Tang" },
        size: { id: 3, sizeName: "Large" },
        color: { id: 3, colorName: "Blue" },
        images: [
            { id: 5011, imageUrl: "https://images.unsplash.com/photo-1522069169874-c58ec4b76be5?w=500&auto=format&fit=crop&q=80", isPrimary: true }
        ],
        rating: 4.2,
        reviewCount: 8,
        status: "SUSPENDED",
        createdDate: "2026-07-20"
    },
    {
        id: 3011,
        fishName: "Tiger barb (School of 6)",
        description: "Active, playful schooling freshwater fish with bold black vertical tiger stripes.",
        price: 2100,
        stockQty: 30,
        seller: { id: 2001, shopName: "Ocean Life Aquatics", sellerName: "Kasun Perera" },
        category: { id: 1, categoryName: "Freshwater" },
        breed: { id: 9, breedName: "Barb" },
        size: { id: 2, sizeName: "Small" },
        color: { id: 6, colorName: "Mixed" },
        images: [
            { id: 5012, imageUrl: "https://images.unsplash.com/photo-1535591273668-578e31182c4f?w=500&auto=format&fit=crop&q=80", isPrimary: true }
        ],
        rating: 4.4,
        reviewCount: 16,
        status: "ACTIVE",
        createdDate: "2026-08-08"
    },
    {
        id: 3012,
        fishName: "Neon Tetra Pack",
        description: "Classic beginner tropical freshwater fish known for iridescent neon blue and red stripes.",
        price: 1800,
        stockQty: 50,
        seller: { id: 2002, shopName: "Blue Reef Aquarium", sellerName: "Nuwan Silva" },
        category: { id: 3, categoryName: "Tropical" },
        breed: { id: 5, breedName: "Tetra" },
        size: { id: 1, sizeName: "Small" },
        color: { id: 3, colorName: "Blue" },
        images: [
            { id: 5013, imageUrl: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=500&auto=format&fit=crop&q=80", isPrimary: true }
        ],
        rating: 4.8,
        reviewCount: 64,
        status: "ACTIVE",
        createdDate: "2026-08-26"
    },
    {
        id: 3013,
        fishName: "Albino Bristlenose Pleco",
        description: "Hardy bottom-dwelling algae eater with distinctive fleshy tentacles and pale pinkish-white body.",
        price: 2400,
        stockQty: 6,
        seller: { id: 2003, shopName: "Aqua Paradise", sellerName: "Chaminda Mendis" },
        category: { id: 1, categoryName: "Freshwater" },
        breed: { id: 10, breedName: "Pleco" },
        size: { id: 2, sizeName: "Medium" },
        color: { id: 5, colorName: "White" },
        images: [
            { id: 5014, imageUrl: "https://images.unsplash.com/photo-1534567153574-2b12153a87f0?w=500&auto=format&fit=crop&q=80", isPrimary: true }
        ],
        rating: 4.7,
        reviewCount: 22,
        status: "ACTIVE",
        createdDate: "2026-08-03"
    },
    {
        id: 3014,
        fishName: "Discus Pigeon Blood",
        description: "Exquisite royal cichlid with warm peach-orange base and fine white pattern detailing.",
        price: 14000,
        stockQty: 3,
        seller: { id: 2001, shopName: "Ocean Life Aquatics", sellerName: "Kasun Perera" },
        category: { id: 3, categoryName: "Tropical" },
        breed: { id: 11, breedName: "Discus" },
        size: { id: 3, sizeName: "Large" },
        color: { id: 2, colorName: "Red" },
        images: [
            { id: 5015, imageUrl: "https://images.unsplash.com/photo-1522069169874-c58ec4b76be5?w=500&auto=format&fit=crop&q=80", isPrimary: true }
        ],
        rating: 4.9,
        reviewCount: 14,
        status: "ACTIVE",
        createdDate: "2026-08-15"
    },
    {
        id: 3015,
        fishName: "Guppy Tuxedo Koi",
        description: "Unique hybrid guppy displaying tricolor patches resembling miniature koi carp.",
        price: 2800,
        stockQty: 11,
        seller: { id: 2002, shopName: "Blue Reef Aquarium", sellerName: "Nuwan Silva" },
        category: { id: 1, categoryName: "Freshwater" },
        breed: { id: 4, breedName: "Guppy" },
        size: { id: 2, sizeName: "Small" },
        color: { id: 6, colorName: "Mixed" },
        images: [
            { id: 5016, imageUrl: "https://images.unsplash.com/photo-1535591273668-578e31182c4f?w=500&auto=format&fit=crop&q=80", isPrimary: true }
        ],
        rating: 4.5,
        reviewCount: 19,
        status: "ACTIVE",
        createdDate: "2026-08-19"
    },
    {
        id: 3016,
        fishName: "Cherry Barb Pair",
        description: "Peaceful schooling fish where males turn a rich cherry red during breeding season.",
        price: 1600,
        stockQty: 18,
        seller: { id: 2003, shopName: "Aqua Paradise", sellerName: "Chaminda Mendis" },
        category: { id: 1, categoryName: "Freshwater" },
        breed: { id: 9, breedName: "Barb" },
        size: { id: 1, sizeName: "Small" },
        color: { id: 2, colorName: "Red" },
        images: [
            { id: 5017, imageUrl: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=500&auto=format&fit=crop&q=80", isPrimary: true }
        ],
        rating: 4.3,
        reviewCount: 11,
        status: "ACTIVE",
        createdDate: "2026-08-04"
    },
    {
        id: 3017,
        fishName: "Bicolor Blenny",
        description: "Marine nano tank favourite with striking dark front half and vivid yellow tail section.",
        price: 4800,
        stockQty: 5,
        seller: { id: 2004, shopName: "Coral Reef World", sellerName: "Dilshan Jayasinghe" },
        category: { id: 2, categoryName: "Saltwater" },
        breed: { id: 12, breedName: "Blenny" },
        size: { id: 2, sizeName: "Small" },
        color: { id: 6, colorName: "Mixed" },
        images: [
            { id: 5018, imageUrl: "https://images.unsplash.com/photo-1534567153574-2b12153a87f0?w=500&auto=format&fit=crop&q=80", isPrimary: true }
        ],
        rating: 4.7,
        reviewCount: 13,
        status: "ACTIVE",
        createdDate: "2026-08-11"
    },
    {
        id: 3018,
        fishName: "Pearl Danio",
        description: "Active hardy surface swimmer with iridescent pearl-blue spots and golden sheen.",
        price: 1200,
        stockQty: 35,
        seller: { id: 2001, shopName: "Ocean Life Aquatics", sellerName: "Kasun Perera" },
        category: { id: 1, categoryName: "Freshwater" },
        breed: { id: 13, breedName: "Danio" },
        size: { id: 1, sizeName: "Small" },
        color: { id: 3, colorName: "Blue" },
        images: [
            { id: 5019, imageUrl: "https://images.unsplash.com/photo-1524704796724-9b6348a5266e?w=500&auto=format&fit=crop&q=80", isPrimary: true }
        ],
        rating: 4.2,
        reviewCount: 7,
        status: "ACTIVE",
        createdDate: "2026-08-02"
    },
    {
        id: 3019,
        fishName: "Black Ghost Knifefish",
        description: "Fascinating nocturnal freshwater fish with fluid eel-like swimming motion and electric sensory organs.",
        price: 7500,
        stockQty: 2,
        seller: { id: 2002, shopName: "Blue Reef Aquarium", sellerName: "Nuwan Silva" },
        category: { id: 3, categoryName: "Tropical" },
        breed: { id: 14, breedName: "Knifefish" },
        size: { id: 4, sizeName: "Extra Large" },
        color: { id: 4, colorName: "Black" },
        images: [
            { id: 5020, imageUrl: "https://images.unsplash.com/photo-1522069169874-c58ec4b76be5?w=500&auto=format&fit=crop&q=80", isPrimary: true }
        ],
        rating: 4.8,
        reviewCount: 25,
        status: "ACTIVE",
        createdDate: "2026-07-28"
    },
    {
        id: 3020,
        fishName: "Yellow Tang",
        description: "Bright lemon-yellow marine herbivore prized for keeping saltwater reef aquariums clean.",
        price: 16500,
        stockQty: 0,
        seller: { id: 2004, shopName: "Coral Reef World", sellerName: "Dilshan Jayasinghe" },
        category: { id: 2, categoryName: "Saltwater" },
        breed: { id: 8, breedName: "Tang" },
        size: { id: 3, sizeName: "Large" },
        color: { id: 1, colorName: "Yellow" },
        images: [
            { id: 5021, imageUrl: "https://images.unsplash.com/photo-1535591273668-578e31182c4f?w=500&auto=format&fit=crop&q=80", isPrimary: true }
        ],
        rating: 5.0,
        reviewCount: 19,
        status: "PENDING",
        createdDate: "2026-08-27"
    },
    {
        id: 3021,
        fishName: "Harlequin Rasbora",
        description: "Stunning nano fish featuring triangular black patches on vibrant copper-orange bodies.",
        price: 1500,
        stockQty: 22,
        seller: { id: 2003, shopName: "Aqua Paradise", sellerName: "Chaminda Mendis" },
        category: { id: 1, categoryName: "Freshwater" },
        breed: { id: 15, breedName: "Rasbora" },
        size: { id: 1, sizeName: "Small" },
        color: { id: 2, colorName: "Red" },
        images: [
            { id: 5022, imageUrl: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=500&auto=format&fit=crop&q=80", isPrimary: true }
        ],
        rating: 4.6,
        reviewCount: 31,
        status: "ACTIVE",
        createdDate: "2026-08-16"
    },
    {
        id: 3022,
        fishName: "Bettas Dumbo Ear (Elephant Ear)",
        description: "Unique Betta variant distinguished by oversized, fan-like pectoral fins resembling elephant ears.",
        price: 4200,
        stockQty: 5,
        seller: { id: 2001, shopName: "Ocean Life Aquatics", sellerName: "Kasun Perera" },
        category: { id: 1, categoryName: "Freshwater" },
        breed: { id: 1, breedName: "Betta" },
        size: { id: 2, sizeName: "Small" },
        color: { id: 5, colorName: "White" },
        images: [
            { id: 5023, imageUrl: "https://images.unsplash.com/photo-1534567153574-2b12153a87f0?w=500&auto=format&fit=crop&q=80", isPrimary: true }
        ],
        rating: 4.8,
        reviewCount: 38,
        status: "ACTIVE",
        createdDate: "2026-08-21"
    },
    {
        id: 3023,
        fishName: "Cherry Red Shrimp Colony (10x)",
        description: "Hardy freshwater ornamental invertebrates that provide excellent cleanup crew duties in planted tanks.",
        price: 2500,
        stockQty: 40,
        seller: { id: 2003, shopName: "Aqua Paradise", sellerName: "Chaminda Mendis" },
        category: { id: 1, categoryName: "Freshwater" },
        breed: { id: 16, breedName: "Shrimp" },
        size: { id: 1, sizeName: "Small" },
        color: { id: 2, colorName: "Red" },
        images: [
            { id: 5024, imageUrl: "https://images.unsplash.com/photo-1522069169874-c58ec4b76be5?w=500&auto=format&fit=crop&q=80", isPrimary: true }
        ],
        rating: 4.9,
        reviewCount: 82,
        status: "ACTIVE",
        createdDate: "2026-08-24"
    },
    {
        id: 3024,
        fishName: "Panda Corydoras",
        description: "Charming bottom-feeder catfish bearing characteristic dark eye patches and dorsal markings resembling pandas.",
        price: 1900,
        stockQty: 16,
        seller: { id: 2002, shopName: "Blue Reef Aquarium", sellerName: "Nuwan Silva" },
        category: { id: 1, categoryName: "Freshwater" },
        breed: { id: 17, breedName: "Corydoras" },
        size: { id: 1, sizeName: "Small" },
        color: { id: 6, colorName: "Mixed" },
        images: [
            { id: 5025, imageUrl: "https://images.unsplash.com/photo-1535591273668-578e31182c4f?w=500&auto=format&fit=crop&q=80", isPrimary: true }
        ],
        rating: 4.7,
        reviewCount: 27,
        status: "ACTIVE",
        createdDate: "2026-08-10"
    }
];

// Initialization on DOM Content Loaded
document.addEventListener("DOMContentLoaded", () => {
    initAdminPage();
});

function initAdminPage() {
    setupEventListeners();
    checkAdminAuth();
    loadInitialData();
    parseUrlParameters();
}

// Authentication Check (UX simulation + Backend readiness)
function checkAdminAuth() {
    // Frontend authorization is only for UX. Backend authorization is mandatory.
    const token = localStorage.getItem("authToken");
    // If token exists or in mock mode, proceed. For API mode without token, show notice if needed.
}

// Event Listeners Setup
function setupEventListeners() {
    // Mobile Sidebar Drawer Toggle
    const mobileToggleBtn = document.getElementById("mobileToggleBtn");
    const adminSidebar = document.getElementById("adminSidebar");
    const sidebarOverlay = document.getElementById("sidebarOverlay");

    if (mobileToggleBtn) {
        mobileToggleBtn.addEventListener("click", () => {
            adminSidebar.classList.toggle("mobile-open");
            sidebarOverlay.classList.toggle("active");
        });
    }

    if (sidebarOverlay) {
        sidebarOverlay.addEventListener("click", () => {
            adminSidebar.classList.remove("mobile-open");
            sidebarOverlay.classList.remove("active");
        });
    }

    // Search Input with Debounce (~300ms)
    const searchInput = document.getElementById("searchInput");
    const clearSearchBtn = document.getElementById("clearSearchBtn");
    let searchTimeout;

    if (searchInput) {
        searchInput.addEventListener("input", (e) => {
            state.searchTerm = e.target.value.trim();
            if (state.searchTerm) {
                clearSearchBtn.style.display = "block";
            } else {
                clearSearchBtn.style.display = "none";
            }
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                state.currentPage = 1;
                applyFiltersAndSort();
            }, 300);
        });
    }

    if (clearSearchBtn) {
        clearSearchBtn.addEventListener("click", () => {
            searchInput.value = "";
            state.searchTerm = "";
            clearSearchBtn.style.display = "none";
            state.currentPage = 1;
            applyFiltersAndSort();
        });
    }

    // Filter Dropdowns
    const filterSelectors = {
        categoryFilter: 'categoryFilter',
        breedFilter: 'breedFilter',
        sizeFilter: 'sizeFilter',
        colorFilter: 'colorFilter',
        sellerFilter: 'sellerFilter',
        stockFilter: 'stockFilter',
        statusFilter: 'statusFilter',
        sortBySelect: 'sortBy'
    };

    Object.entries(filterSelectors).forEach(([elementId, stateKey]) => {
        const el = document.getElementById(elementId);
        if (el) {
            el.addEventListener("change", (e) => {
                state[stateKey] = e.target.value;
                state.currentPage = 1;
                applyFiltersAndSort();
            });
        }
    });

    // Clear Filters Buttons
    const clearFiltersBtn = document.getElementById("clearFiltersBtn");
    const clearFiltersEmptyBtn = document.getElementById("clearFiltersEmptyBtn");

    [clearFiltersBtn, clearFiltersEmptyBtn].forEach(btn => {
        if (btn) {
            btn.addEventListener("click", resetAllFilters);
        }
    });

    // Topbar Actions
    const refreshBtn = document.getElementById("refreshBtn");
    if (refreshBtn) {
        refreshBtn.addEventListener("click", () => {
            loadInitialData();
            showToast("Fish inventory refreshed successfully.", "success");
        });
    }

    const exportCsvBtn = document.getElementById("exportCsvBtn");
    if (exportCsvBtn) {
        exportCsvBtn.addEventListener("click", exportFishCsv);
    }

    const retryBtn = document.getElementById("retryBtn");
    if (retryBtn) {
        retryBtn.addEventListener("click", loadInitialData);
    }

    // Modal Close Triggers
    setupModalHandlers();
}

// Modal Handlers Setup
function setupModalHandlers() {
    // Fish Details Modal
    const detailsModal = document.getElementById("fishDetailsModal");
    const closeDetailsModalBtn = document.getElementById("closeDetailsModalBtn");
    const modalCloseActionBtn = document.getElementById("modalCloseActionBtn");

    [closeDetailsModalBtn, modalCloseActionBtn].forEach(btn => {
        if (btn) btn.addEventListener("click", closeFishDetailsModal);
    });

    if (detailsModal) {
        detailsModal.addEventListener("click", (e) => {
            if (e.target === detailsModal) closeFishDetailsModal();
        });
    }

    // Lightbox Modal
    const lightboxModal = document.getElementById("lightboxModal");
    const lightboxCloseBtn = document.getElementById("lightboxCloseBtn");
    const lightboxPrevBtn = document.getElementById("lightboxPrevBtn");
    const lightboxNextBtn = document.getElementById("lightboxNextBtn");

    if (lightboxCloseBtn) lightboxCloseBtn.addEventListener("click", closeLightbox);
    if (lightboxPrevBtn) lightboxPrevBtn.addEventListener("click", showPreviousImage);
    if (lightboxNextBtn) lightboxNextBtn.addEventListener("click", showNextImage);

    if (lightboxModal) {
        lightboxModal.addEventListener("click", (e) => {
            if (e.target === lightboxModal) closeLightbox();
        });
    }

    // Confirm Modal
    const confirmModal = document.getElementById("confirmModal");
    const closeConfirmModalBtn = document.getElementById("closeConfirmModalBtn");
    const confirmCancelBtn = document.getElementById("confirmCancelBtn");

    [closeConfirmModalBtn, confirmCancelBtn].forEach(btn => {
        if (btn) btn.addEventListener("click", closeConfirmModal);
    });

    if (confirmModal) {
        confirmModal.addEventListener("click", (e) => {
            if (e.target === confirmModal) closeConfirmModal();
        });
    }

    // Keyboard ESC Listener
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
            closeFishDetailsModal();
            closeLightbox();
            closeConfirmModal();
        }
    });
}

// Load Initial Data (Mock vs API)
async function loadInitialData() {
    showLoadingState(true);
    hideErrorState();

    try {
        if (USE_MOCK_DATA) {
            // Simulate network latency
            await new Promise(resolve => setTimeout(resolve, 400));
            state.fish = JSON.parse(JSON.stringify(MOCK_FISH_DATA));
            extractFilterOptions(state.fish);
            applyFiltersAndSort();
            renderStats();
            showLoadingState(false);
        } else {
            // TODO API: GET /api/admin/fish
            const response = await fetch(`${API_BASE_URL}/admin/fish`, {
                method: 'GET',
                headers: getAuthHeaders()
            });

            if (!response.ok) {
                handleHttpError(response.status);
                return;
            }

            const data = await response.json();
            // Support Spring Data Page or raw array response
            state.fish = Array.isArray(data) ? data.map(normalizeFish) : (data.content || []).map(normalizeFish);
            extractFilterOptions(state.fish);
            applyFiltersAndSort();
            renderStats();
            showLoadingState(false);
        }
    } catch (error) {
        console.error("Error loading fish inventory:", error);
        showLoadingState(false);
        showErrorState();
    }
}

// Data Normalization Helper
function normalizeFish(rawFish) {
    return {
        id: rawFish.id || rawFish.fishId,
        fishName: rawFish.fishName || "Unnamed Fish",
        description: rawFish.description || "No description provided.",
        price: Number(rawFish.price) || 0,
        stockQty: Number(rawFish.stockQty) || 0,
        seller: {
            id: rawFish.seller?.id || rawFish.sellerId || 0,
            shopName: rawFish.seller?.shopName || rawFish.shopName || "Unknown Shop",
            sellerName: rawFish.seller?.sellerName || rawFish.sellerName || "Unknown Seller"
        },
        category: {
            id: rawFish.category?.id || rawFish.categoryId || 0,
            categoryName: rawFish.category?.categoryName || rawFish.categoryName || "Not assigned"
        },
        breed: {
            id: rawFish.breed?.id || rawFish.breedId || 0,
            breedName: rawFish.breed?.breedName || rawFish.breedName || "Not assigned"
        },
        size: {
            id: rawFish.size?.id || rawFish.sizeId || 0,
            sizeName: rawFish.size?.sizeName || rawFish.sizeName || "Medium"
        },
        color: {
            id: rawFish.color?.id || rawFish.colorId || 0,
            colorName: rawFish.color?.colorName || rawFish.colorName || "Mixed"
        },
        images: rawFish.images || (rawFish.primaryImageUrl ? [{ id: 1, imageUrl: rawFish.primaryImageUrl, isPrimary: true }] : []),
        rating: Number(rawFish.rating) || 0.0,
        reviewCount: Number(rawFish.reviewCount) || 0,
        status: rawFish.status || "ACTIVE",
        createdDate: rawFish.createdDate || "2026-01-01"
    };
}

// Extract Dynamic Filter Options from Dataset
function extractFilterOptions(fishList) {
    const categoriesMap = new Map();
    const breedsMap = new Map();
    const colorsMap = new Map();
    const sellersMap = new Map();

    fishList.forEach(f => {
        if (f.category && f.category.categoryName && f.category.categoryName !== "Not assigned") {
            categoriesMap.set(f.category.categoryName, f.category.categoryName);
        }
        if (f.breed && f.breed.breedName && f.breed.breedName !== "Not assigned") {
            breedsMap.set(f.breed.breedName, f.breed.breedName);
        }
        if (f.color && f.color.colorName) {
            colorsMap.set(f.color.colorName, f.color.colorName);
        }
        if (f.seller && f.seller.shopName) {
            sellersMap.set(f.seller.id, f.seller.shopName);
        }
    });

    state.categories = Array.from(categoriesMap.values());
    state.breeds = Array.from(breedsMap.values());
    state.colors = Array.from(colorsMap.values());
    state.sellers = Array.from(sellersMap.entries()).map(([id, shopName]) => ({ id, shopName }));

    populateDropdown("categoryFilter", state.categories, "All Categories");
    populateDropdown("breedFilter", state.breeds, "All Breeds");
    populateDropdown("colorFilter", state.colors, "All Colors");

    const sellerSelect = document.getElementById("sellerFilter");
    if (sellerSelect) {
        let optionsHtml = '<option value="ALL">All Sellers</option>';
        state.sellers.forEach(s => {
            optionsHtml += `<option value="${escapeHtml(s.shopName)}">${escapeHtml(s.shopName)}</option>`;
        });
        sellerSelect.innerHTML = optionsHtml;
    }
}

function populateDropdown(elementId, items, defaultLabel) {
    const el = document.getElementById(elementId);
    if (!el) return;
    let html = `<option value="ALL">${defaultLabel}</option>`;
    items.sort().forEach(item => {
        html += `<option value="${escapeHtml(item)}">${escapeHtml(item)}</option>`;
    });
    el.innerHTML = html;
}

// Filtering and Sorting Logic
function applyFiltersAndSort() {
    let result = [...state.fish];

    // Search filter
    if (state.searchTerm) {
        const query = state.searchTerm.toLowerCase();
        result = result.filter(f =>
            f.fishName.toLowerCase().includes(query) ||
            f.description.toLowerCase().includes(query) ||
            f.seller.shopName.toLowerCase().includes(query) ||
            f.category.categoryName.toLowerCase().includes(query) ||
            f.breed.breedName.toLowerCase().includes(query)
        );
    }

    // Category filter
    if (state.categoryFilter !== "ALL") {
        result = result.filter(f => f.category.categoryName === state.categoryFilter);
    }

    // Breed filter
    if (state.breedFilter !== "ALL") {
        result = result.filter(f => f.breed.breedName === state.breedFilter);
    }

    // Size filter
    if (state.sizeFilter !== "ALL") {
        result = result.filter(f => f.size.sizeName === state.sizeFilter);
    }

    // Color filter
    if (state.colorFilter !== "ALL") {
        result = result.filter(f => f.color.colorName === state.colorFilter);
    }

    // Seller filter
    if (state.sellerFilter !== "ALL") {
        result = result.filter(f => f.seller.shopName === state.sellerFilter);
    }

    // Stock status filter
    if (state.stockFilter !== "ALL") {
        result = result.filter(f => {
            if (state.stockFilter === "IN_STOCK") return f.stockQty > LOW_STOCK_THRESHOLD;
            if (state.stockFilter === "LOW_STOCK") return f.stockQty > 0 && f.stockQty <= LOW_STOCK_THRESHOLD;
            if (state.stockFilter === "OUT_OF_STOCK") return f.stockQty === 0;
            return true;
        });
    }

    // Listing status filter
    if (state.statusFilter !== "ALL") {
        result = result.filter(f => f.status === state.statusFilter);
    }

    // Sorting without mutating original dataset
    result.sort((a, b) => {
        switch (state.sortBy) {
            case "OLDEST":
                return new Date(a.createdDate) - new Date(b.createdDate);
            case "NAME_ASC":
                return a.fishName.localeCompare(b.fishName);
            case "NAME_DESC":
                return b.fishName.localeCompare(a.fishName);
            case "PRICE_ASC":
                return a.price - b.price;
            case "PRICE_DESC":
                return b.price - a.price;
            case "STOCK_ASC":
                return a.stockQty - b.stockQty;
            case "STOCK_DESC":
                return b.stockQty - a.stockQty;
            case "MOST_REVIEWED":
                return b.reviewCount - a.reviewCount;
            case "HIGHEST_RATED":
                return b.rating - a.rating;
            case "NEWEST":
            default:
                return new Date(b.createdDate) - new Date(a.createdDate);
        }
    });

    state.filteredFish = result;
    renderResults();
}

function resetAllFilters() {
    state.searchTerm = "";
    state.categoryFilter = "ALL";
    state.breedFilter = "ALL";
    state.sizeFilter = "ALL";
    state.colorFilter = "ALL";
    state.sellerFilter = "ALL";
    state.stockFilter = "ALL";
    state.statusFilter = "ALL";
    state.sortBy = "NEWEST";
    state.currentPage = 1;

    // Reset UI elements
    const searchInput = document.getElementById("searchInput");
    if (searchInput) searchInput.value = "";
    const clearSearchBtn = document.getElementById("clearSearchBtn");
    if (clearSearchBtn) clearSearchBtn.style.display = "none";

    ['categoryFilter', 'breedFilter', 'sizeFilter', 'colorFilter', 'sellerFilter', 'stockFilter', 'statusFilter', 'sortBySelect'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.selectedIndex = 0;
    });

    applyFiltersAndSort();
    showToast("Filters cleared.", "info");
}

// Render Statistics Cards
function renderStats() {
    const totalFish = state.fish.length;
    const activeFish = state.fish.filter(f => f.status === "ACTIVE").length;
    const outOfStock = state.fish.filter(f => f.stockQty === 0).length;
    const lowStock = state.fish.filter(f => f.stockQty > 0 && f.stockQty <= LOW_STOCK_THRESHOLD).length;
    const totalStock = state.fish.reduce((sum, f) => sum + f.stockQty, 0);
    const categoriesCount = state.categories.length;

    document.getElementById("statTotalFish").textContent = totalFish;
    document.getElementById("statActiveFish").textContent = activeFish;
    document.getElementById("statOutOfStock").textContent = outOfStock;
    document.getElementById("statLowStock").textContent = lowStock;
    document.getElementById("statTotalStock").textContent = totalStock;
    document.getElementById("statCategoriesCount").textContent = categoriesCount;
}

// Render Results, Table, Cards, and Pagination
function renderResults() {
    const tableBody = document.getElementById("fishTableBody");
    const mobileCardGrid = document.getElementById("mobileCardGrid");
    const emptyState = document.getElementById("emptyState");
    const tableWrapper = document.getElementById("tableResponsiveWrapper");
    const resultCountText = document.getElementById("resultCountText");
    const activeChipsContainer = document.getElementById("activeChipsContainer");

    // Count and Chips
    resultCountText.textContent = `${state.filteredFish.length} fish listings found`;
    renderActiveFilterChips(activeChipsContainer);

    if (state.filteredFish.length === 0) {
        tableWrapper.style.display = "none";
        mobileCardGrid.style.display = "none";
        emptyState.style.display = "flex";
        renderPagination(0, 0);
        return;
    }

    emptyState.style.display = "none";
    tableWrapper.style.display = "block";
    mobileCardGrid.style.display = "grid";

    // Pagination slice
    const startIndex = (state.currentPage - 1) * state.pageSize;
    const endIndex = startIndex + state.pageSize;
    const paginatedItems = state.filteredFish.slice(startIndex, endIndex);

    // Render Table Rows
    let tableHtml = "";
    let mobileHtml = "";

    paginatedItems.forEach(fish => {
        const primaryImg = getPrimaryImage(fish.images);
        const stockStatusHtml = getStockStatusBadge(fish.stockQty);
        const statusBadgeHtml = getStatusBadge(fish.status);
        const ratingHtml = fish.reviewCount > 0
            ? `<div class="rating-display"><i class="fa-solid fa-star"></i> ${fish.rating.toFixed(1)} <span>(${fish.reviewCount})</span></div>`
            : `<span class="text-muted" style="font-size:11px;">No reviews</span>`;

        // Table Row
        tableHtml += `
            <tr>
                <td>
                    <div class="fish-cell-wrapper">
                        <img src="${escapeHtml(primaryImg)}" alt="${escapeHtml(fish.fishName)}" class="fish-thumbnail" onerror="this.onerror=null;this.src='data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'40\' height=\'40\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%2364748b\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'><path d=\'M6 12h.01M18 12h.01M10 7l4 5-4 5\'/></svg>';">
                        <div class="fish-info-meta">
                            <h4>${escapeHtml(fish.fishName)}</h4>
                            <span>Fish #${fish.id}</span>
                        </div>
                    </div>
                </td>
                <td>
                    <a href="sellers.html?sellerId=${fish.seller.id}" class="seller-link">${escapeHtml(fish.seller.shopName)}</a>
                    <div class="seller-sub">${escapeHtml(fish.seller.sellerName)}</div>
                </td>
                <td>${escapeHtml(fish.category.categoryName)}</td>
                <td>${escapeHtml(fish.breed.breedName)}</td>
                <td>${escapeHtml(fish.size.sizeName)}</td>
                <td>
                    <div style="display:inline-flex; align-items:center; gap:6px;">
                        <span>${escapeHtml(fish.color.colorName)}</span>
                    </div>
                </td>
                <td><strong>${currencyFormatter.format(fish.price)}</strong></td>
                <td>${stockStatusHtml}</td>
                <td>${ratingHtml}</td>
                <td>${statusBadgeHtml}</td>
                <td class="text-right">
                    <div class="action-buttons-group">
                        <button class="action-btn" title="View Details" onclick="openFishDetailsModal(${fish.id})" aria-label="View ${escapeHtml(fish.fishName)}">
                            <i class="fa-solid fa-eye"></i>
                        </button>
                        <button class="action-btn" title="Manage Images" onclick="navigateToImages(${fish.id})" aria-label="Manage images for ${escapeHtml(fish.fishName)}">
                            <i class="fa-solid fa-images"></i>
                        </button>
                        <button class="action-btn delete" title="Deactivate / Delete" onclick="promptDeleteFish(${fish.id})" aria-label="Delete ${escapeHtml(fish.fishName)}">
                            <i class="fa-solid fa-trash-can"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;

        // Mobile Card
        mobileHtml += `
            <div class="mobile-fish-card">
                <div class="mobile-card-header">
                    <img src="${escapeHtml(primaryImg)}" alt="${escapeHtml(fish.fishName)}" class="mobile-card-thumb" onerror="this.onerror=null;this.src='data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'40\' height=\'40\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%2364748b\' stroke-width=\'2\'><path d=\'M6 12h.01M18 12h.01M10 7l4 5-4 5\'/></svg>';">
                    <div class="mobile-card-title-area">
                        <h4>${escapeHtml(fish.fishName)}</h4>
                        <span>Fish #${fish.id} • <a href="sellers.html?sellerId=${fish.seller.id}" class="seller-link">${escapeHtml(fish.seller.shopName)}</a></span>
                    </div>
                </div>
                <div class="mobile-card-body">
                    <div class="mobile-card-field">
                        <span>Classification</span>
                        <strong>${escapeHtml(fish.category.categoryName)} • ${escapeHtml(fish.breed.breedName)}</strong>
                    </div>
                    <div class="mobile-card-field">
                        <span>Price</span>
                        <strong>${currencyFormatter.format(fish.price)}</strong>
                    </div>
                    <div class="mobile-card-field">
                        <span>Stock</span>
                        <strong>${fish.stockQty} units</strong>
                    </div>
                    <div class="mobile-card-field">
                        <span>Rating</span>
                        <strong>${fish.reviewCount > 0 ? '★ ' + fish.rating.toFixed(1) + ' (' + fish.reviewCount + ')' : 'No reviews'}</strong>
                    </div>
                </div>
                <div class="mobile-card-footer">
                    <div>${statusBadgeHtml}</div>
                    <div class="mobile-card-actions">
                        <button class="btn btn-outline btn-sm" onclick="openFishDetailsModal(${fish.id})">View</button>
                        <button class="btn btn-outline btn-sm" onclick="navigateToImages(${fish.id})">Images</button>
                        <button class="btn btn-danger btn-sm" onclick="promptDeleteFish(${fish.id})">Delete</button>
                    </div>
                </div>
            </div>
        `;
    });

    tableBody.innerHTML = tableHtml;
    mobileCardGrid.innerHTML = mobileHtml;

    renderPagination(state.filteredFish.length, state.currentPage);
}

// Active Filter Chips Builder
function renderActiveFilterChips(container) {
    let chipsHtml = "";

    if (state.categoryFilter !== "ALL") {
        chipsHtml += `<span class="filter-chip">Category: ${escapeHtml(state.categoryFilter)} <button onclick="clearFilter('categoryFilter')">&times;</button></span>`;
    }
    if (state.breedFilter !== "ALL") {
        chipsHtml += `<span class="filter-chip">Breed: ${escapeHtml(state.breedFilter)} <button onclick="clearFilter('breedFilter')">&times;</button></span>`;
    }
    if (state.sizeFilter !== "ALL") {
        chipsHtml += `<span class="filter-chip">Size: ${escapeHtml(state.sizeFilter)} <button onclick="clearFilter('sizeFilter')">&times;</button></span>`;
    }
    if (state.colorFilter !== "ALL") {
        chipsHtml += `<span class="filter-chip">Color: ${escapeHtml(state.colorFilter)} <button onclick="clearFilter('colorFilter')">&times;</button></span>`;
    }
    if (state.sellerFilter !== "ALL") {
        chipsHtml += `<span class="filter-chip">Seller: ${escapeHtml(state.sellerFilter)} <button onclick="clearFilter('sellerFilter')">&times;</button></span>`;
    }
    if (state.stockFilter !== "ALL") {
        chipsHtml += `<span class="filter-chip">Stock: ${escapeHtml(state.stockFilter)} <button onclick="clearFilter('stockFilter')">&times;</button></span>`;
    }
    if (state.statusFilter !== "ALL") {
        chipsHtml += `<span class="filter-chip">Status: ${escapeHtml(state.statusFilter)} <button onclick="clearFilter('statusFilter')">&times;</button></span>`;
    }
    if (state.searchTerm) {
        chipsHtml += `<span class="filter-chip">Search: "${escapeHtml(state.searchTerm)}" <button onclick="clearFilter('searchTerm')">&times;</button></span>`;
    }

    container.innerHTML = chipsHtml;
}

function clearFilter(filterKey) {
    if (filterKey === 'searchTerm') {
        state.searchTerm = "";
        const searchInput = document.getElementById("searchInput");
        if (searchInput) searchInput.value = "";
        const clearSearchBtn = document.getElementById("clearSearchBtn");
        if (clearSearchBtn) clearSearchBtn.style.display = "none";
    } else {
        state[filterKey] = "ALL";
        const elementIdMap = {
            categoryFilter: 'categoryFilter',
            breedFilter: 'breedFilter',
            sizeFilter: 'sizeFilter',
            colorFilter: 'colorFilter',
            sellerFilter: 'sellerFilter',
            stockFilter: 'stockFilter',
            statusFilter: 'statusFilter'
        };
        const elId = elementIdMap[filterKey];
        if (elId) {
            const el = document.getElementById(elId);
            if (el) el.selectedIndex = 0;
        }
    }
    state.currentPage = 1;
    applyFiltersAndSort();
}

// Pagination Render
function renderPagination(totalItems, currentPage) {
    const paginationInfo = document.getElementById("paginationInfo");
    const paginationControls = document.getElementById("paginationControls");

    if (totalItems === 0) {
        paginationInfo.textContent = "Showing 0–0 of 0 fish";
        paginationControls.innerHTML = "";
        return;
    }

    const totalPages = Math.ceil(totalItems / state.pageSize);
    const startItem = (currentPage - 1) * state.pageSize + 1;
    const endItem = Math.min(currentPage * state.pageSize, totalItems);

    paginationInfo.textContent = `Showing ${startItem}–${endItem} of ${totalItems} fish`;

    let controlsHtml = `
        <button class="page-btn" ${currentPage === 1 ? 'disabled' : ''} onclick="changePage(${currentPage - 1})">Previous</button>
    `;

    for (let i = 1; i <= totalPages; i++) {
        if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
            controlsHtml += `<button class="page-btn ${i === currentPage ? 'active' : ''}" onclick="changePage(${i})">${i}</button>`;
        } else if (i === currentPage - 2 || i === currentPage + 2) {
            controlsHtml += `<span style="padding: 0 4px; color: var(--text-muted);">...</span>`;
        }
    }

    controlsHtml += `
        <button class="page-btn" ${currentPage === totalPages ? 'disabled' : ''} onclick="changePage(${currentPage + 1})">Next</button>
    `;

    paginationControls.innerHTML = controlsHtml;
}

function changePage(targetPage) {
    const totalPages = Math.ceil(state.filteredFish.length / state.pageSize);
    if (targetPage < 1 || targetPage > totalPages) return;
    state.currentPage = targetPage;
    renderResults();
    window.scrollTo({ top: 300, behavior: 'smooth' });
}

// Badge Helpers
function getPrimaryImage(images) {
    if (!images || images.length === 0) return "";
    const primary = images.find(img => img.isPrimary);
    return primary ? primary.imageUrl : images[0].imageUrl;
}

function getStockStatusBadge(stockQty) {
    if (stockQty === 0) {
        return `<span class="stock-pill stock-out">Out of stock</span>`;
    } else if (stockQty <= LOW_STOCK_THRESHOLD) {
        return `<span class="stock-pill stock-low">${stockQty} left (Low)</span>`;
    } else {
        return `<span class="stock-pill stock-in">${stockQty} available</span>`;
    }
}

function getStatusBadge(status) {
    switch (status) {
        case "ACTIVE":
            return `<span class="status-badge status-active">Active</span>`;
        case "INACTIVE":
            return `<span class="status-badge status-inactive">Inactive</span>`;
        case "SUSPENDED":
            return `<span class="status-badge status-suspended">Suspended</span>`;
        case "PENDING":
            return `<span class="status-badge status-pending">Pending</span>`;
        default:
            return `<span class="status-badge status-inactive">${escapeHtml(status)}</span>`;
    }
}

// Fish Details Modal Management
async function openFishDetailsModal(fishId) {
    const fish = state.fish.find(f => f.id === fishId);
    if (!fish) return;
    state.selectedFish = fish;

    const modalBody = document.getElementById("fishDetailsModalBody");
    const primaryImg = getPrimaryImage(fish.images);

    let thumbnailsHtml = "";
    if (fish.images && fish.images.length > 0) {
        fish.images.forEach((img, idx) => {
            thumbnailsHtml += `<img src="${escapeHtml(img.imageUrl)}" alt="Thumbnail ${idx+1}" class="thumb-item ${img.imageUrl === primaryImg ? 'active' : ''}" onclick="switchModalMainImage('${escapeHtml(img.imageUrl)}', this)">`;
        });
    } else {
        thumbnailsHtml = `<span class="text-muted" style="font-size:12px;">No product images</span>`;
    }

    modalBody.innerHTML = `
        <div class="details-grid">
            <div class="details-gallery">
                <img src="${escapeHtml(primaryImg)}" alt="${escapeHtml(fish.fishName)}" class="main-preview-img" id="modalMainPreviewImg" onclick="openLightboxFromModal()" onerror="this.onerror=null;this.src='data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'100\' height=\'100\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%2364748b\' stroke-width=\'2\'><path d=\'M6 12h.01M18 12h.01M10 7l4 5-4 5\'/></svg>';">
                <div class="thumbnail-strip">
                    ${thumbnailsHtml}
                </div>
                <div style="font-size:11px; color:var(--text-muted); text-align:center;">${fish.images ? fish.images.length : 0} image(s) available</div>
            </div>
            
            <div class="details-info-area">
                <div class="details-title-row">
                    <div>
                        <h3>${escapeHtml(fish.fishName)}</h3>
                        <span style="font-size:12px; color:var(--text-muted);">Fish ID #${fish.id} • Created: ${escapeHtml(fish.createdDate)}</span>
                    </div>
                    <div>${getStatusBadge(fish.status)}</div>
                </div>

                <p class="details-description">${escapeHtml(fish.description)}</p>

                <div style="display:flex; align-items:center; justify-content:space-between; margin-top:4px;">
                    <div>
                        <span style="font-size:11px; color:var(--text-muted); text-transform:uppercase; display:block;">Price</span>
                        <strong style="font-size:18px; color:var(--dark-navy);">${currencyFormatter.format(fish.price)}</strong>
                    </div>
                    <div>
                        <span style="font-size:11px; color:var(--text-muted); text-transform:uppercase; display:block;">Stock Status</span>
                        ${getStockStatusBadge(fish.stockQty)}
                    </div>
                </div>

                <div class="details-meta-grid">
                    <div class="meta-item">
                        <span>Category</span>
                        <strong>${escapeHtml(fish.category.categoryName)}</strong>
                    </div>
                    <div class="meta-item">
                        <span>Breed</span>
                        <strong>${escapeHtml(fish.breed.breedName)}</strong>
                    </div>
                    <div class="meta-item">
                        <span>Size</span>
                        <strong>${escapeHtml(fish.size.sizeName)}</strong>
                    </div>
                    <div class="meta-item">
                        <span>Color</span>
                        <strong>${escapeHtml(fish.color.colorName)}</strong>
                    </div>
                </div>

                <div class="seller-summary-card">
                    <div class="seller-summary-info">
                        <h4>${escapeHtml(fish.seller.shopName)}</h4>
                        <p>Seller: ${escapeHtml(fish.seller.sellerName)} (ID #${fish.seller.id})</p>
                    </div>
                    <a href="sellers.html?sellerId=${fish.seller.id}" class="btn btn-outline btn-sm">View Seller</a>
                </div>

                <div style="font-size:12px; color:var(--text-muted); display:flex; align-items:center; gap:8px;">
                    <i class="fa-solid fa-star" style="color:var(--warning-color);"></i>
                    <span><strong>${fish.rating.toFixed(1)}</strong> rating across ${fish.reviewCount} customer review(s)</span>
                </div>
            </div>
        </div>
    `;

    const detailsModal = document.getElementById("fishDetailsModal");
    detailsModal.classList.add("active");
}

function closeFishDetailsModal() {
    const detailsModal = document.getElementById("fishDetailsModal");
    if (detailsModal) detailsModal.classList.remove("active");
    state.selectedFish = null;
}

function switchModalMainImage(imageUrl, thumbEl) {
    const mainImg = document.getElementById("modalMainPreviewImg");
    if (mainImg) mainImg.src = imageUrl;
    document.querySelectorAll(".thumb-item").forEach(el => el.classList.remove("active"));
    if (thumbEl) thumbEl.classList.add("active");
}

// Lightbox Implementation
function openLightboxFromModal() {
    if (!state.selectedFish || !state.selectedFish.images || state.selectedFish.images.length === 0) return;
    state.currentLightboxImages = state.selectedFish.images.map(img => img.imageUrl);
    const mainPreview = document.getElementById("modalMainPreviewImg");
    const currentSrc = mainPreview ? mainPreview.src : state.currentLightboxImages[0];
    state.currentLightboxIndex = state.currentLightboxImages.indexOf(currentSrc);
    if (state.currentLightboxIndex === -1) state.currentLightboxIndex = 0;

    showLightboxImage();
    document.getElementById("lightboxModal").classList.add("active");
}

function showLightboxImage() {
    const lightboxImg = document.getElementById("lightboxImage");
    const counter = document.getElementById("lightboxCounter");
    if (lightboxImg) lightboxImg.src = state.currentLightboxImages[state.currentLightboxIndex];
    if (counter) counter.textContent = `${state.currentLightboxIndex + 1} / ${state.currentLightboxImages.length}`;
}

function closeLightbox() {
    const lightboxModal = document.getElementById("lightboxModal");
    if (lightboxModal) lightboxModal.classList.remove("active");
}

function showNextImage() {
    if (state.currentLightboxImages.length <= 1) return;
    state.currentLightboxIndex = (state.currentLightboxIndex + 1) % state.currentLightboxImages.length;
    showLightboxImage();
}

function showPreviousImage() {
    if (state.currentLightboxImages.length <= 1) return;
    state.currentLightboxIndex = (state.currentLightboxIndex - 1 + state.currentLightboxImages.length) % state.currentLightboxImages.length;
    showLightboxImage();
}

// Delete / Deactivate Workflow
let fishToDeleteId = null;

function promptDeleteFish(fishId) {
    const fish = state.fish.find(f => f.id === fishId);
    if (!fish) return;
    fishToDeleteId = fishId;

    const confirmModal = document.getElementById("confirmModal");
    const confirmModalTitle = document.getElementById("confirmModalTitle");
    const confirmModalBody = document.getElementById("confirmModalBody");

    confirmModalTitle.textContent = "Deactivate / Delete Fish";
    confirmModalBody.innerHTML = `
        <p style="margin-bottom:12px;">Are you sure you want to deactivate or remove this fish listing?</p>
        <div style="background-color:#f8fafc; padding:12px; border-radius:8px; border:1px solid var(--border-color); font-size:13px;">
            <strong>${escapeHtml(fish.fishName)}</strong><br>
            <span style="color:var(--text-muted);">Seller: ${escapeHtml(fish.seller.shopName)}</span><br>
            <span style="color:var(--text-muted);">Status: ${escapeHtml(fish.status)} | Stock: ${fish.stockQty}</span>
        </div>
        <p style="margin-top:12px; font-size:11px; color:var(--danger-color);">
            <i class="fa-solid fa-triangle-exclamation"></i> Warning: This action may affect active customer orders and cart associations. Prefer deactivation.
        </p>
    `;

    const confirmActionBtn = document.getElementById("confirmActionBtn");
    // Replace listener cleanly
    const newBtn = confirmActionBtn.cloneNode(true);
    confirmActionBtn.parentNode.replaceChild(newBtn, confirmActionBtn);
    newBtn.addEventListener("click", executeDeleteFish);

    confirmModal.classList.add("active");
}

async function executeDeleteFish() {
    if (!fishToDeleteId) return;

    try {
        if (USE_MOCK_DATA) {
            await new Promise(resolve => setTimeout(resolve, 300));
            state.fish = state.fish.filter(f => f.id !== fishToDeleteId);
            applyFiltersAndSort();
            renderStats();
            closeConfirmModal();
            showToast("Fish listing successfully removed / deactivated.", "success");
        } else {
            // TODO API: DELETE /api/admin/fish/{fishId}
            const response = await fetch(`${API_BASE_URL}/admin/fish/${fishToDeleteId}`, {
                method: 'DELETE',
                headers: getAuthHeaders()
            });

            if (response.status === 409) {
                showToast("Conflict: Fish listing cannot be updated due to active orders.", "error");
                return;
            }

            if (!response.ok) {
                handleHttpError(response.status);
                return;
            }

            closeConfirmModal();
            showToast("Fish listing deleted successfully.", "success");
            loadInitialData();
        }
    } catch (error) {
        console.error("Error deleting fish:", error);
        showToast("Failed to delete fish listing.", "error");
    }
}

function closeConfirmModal() {
    const confirmModal = document.getElementById("confirmModal");
    if (confirmModal) confirmModal.classList.remove("active");
    fishToDeleteId = null;
}

// Navigation helpers
function navigateToImages(fishId) {
    window.location.href = `fish-images.html?fishId=${fishId}`;
}

// URL Parameter Support (e.g., fish.html?categoryId=2, fish.html?sellerId=2001, fish.html?search=betta, fish.html?fishId=3001)
function parseUrlParameters() {
    const params = new URLSearchParams(window.location.search);
    const searchParam = params.get("search");
    const categoryParam = params.get("categoryId");
    const sellerParam = params.get("sellerId");
    const stockParam = params.get("stockStatus");
    const fishIdParam = params.get("fishId");

    setTimeout(() => {
        if (searchParam) {
            const searchInput = document.getElementById("searchInput");
            if (searchInput) {
                searchInput.value = searchParam;
                state.searchTerm = searchParam.trim();
                document.getElementById("clearSearchBtn").style.display = "block";
            }
        }
        if (sellerParam) {
            // Match seller name or ID
            const foundSeller = state.sellers.find(s => s.id == sellerParam);
            if (foundSeller) {
                state.sellerFilter = foundSeller.shopName;
                const el = document.getElementById("sellerFilter");
                if (el) el.value = foundSeller.shopName;
            }
        }
        if (stockParam) {
            state.stockFilter = stockParam;
            const el = document.getElementById("stockFilter");
            if (el) el.value = stockParam;
        }
        if (fishIdParam) {
            openFishDetailsModal(Number(fishIdParam));
        }

        applyFiltersAndSort();
    }, 200);
}

// CSV Export Implementation
function exportFishCsv() {
    const headers = [
        "Fish ID", "Fish Name", "Seller Shop", "Category", "Breed",
        "Size", "Color", "Price (LKR)", "Stock Qty", "Rating", "Review Count", "Status", "Created Date"
    ];

    const rows = state.filteredFish.map(f => [
        f.id,
        `"${f.fishName.replace(/"/g, '""')}"`,
        `"${f.seller.shopName.replace(/"/g, '""')}"`,
        `"${f.category.categoryName}"`,
        `"${f.breed.breedName}"`,
        `"${f.size.sizeName}"`,
        `"${f.color.colorName}"`,
        f.price,
        f.stockQty,
        f.rating,
        f.reviewCount,
        f.status,
        f.createdDate
    ]);

    let csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "aquarium-fish-products.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast("CSV export completed successfully.", "success");
}

// Helper States & Error Handling
function showLoadingState(isLoading) {
    const loadingState = document.getElementById("loadingState");
    const tableWrapper = document.getElementById("tableResponsiveWrapper");
    const mobileCardGrid = document.getElementById("mobileCardGrid");
    const paginationFooter = document.getElementById("paginationFooter");

    if (isLoading) {
        loadingState.style.display = "flex";
        tableWrapper.style.display = "none";
        mobileCardGrid.style.display = "none";
        paginationFooter.style.display = "none";
    } else {
        loadingState.style.display = "none";
        paginationFooter.style.display = "flex";
    }
}

function showErrorState() {
    document.getElementById("errorState").style.display = "flex";
    document.getElementById("tableResponsiveWrapper").style.display = "none";
    document.getElementById("mobileCardGrid").style.display = "none";
}

function hideErrorState() {
    document.getElementById("errorState").style.display = "none";
}

function handleHttpError(status) {
    switch (status) {
        case 401:
            showToast("Your session has expired. Please log in again.", "error");
            setTimeout(() => window.location.href = "../login.html", 1500);
            break;
        case 403:
            showToast("You do not have permission to manage fish listings.", "error");
            break;
        case 404:
            showToast("Fish listing not found.", "error");
            break;
        case 409:
            showToast("Conflict occurred while processing request.", "error");
            break;
        case 500:
        default:
            showToast("Server error. Please try again later.", "error");
            showErrorState();
            break;
    }
}

// Auth Headers Builder
function getAuthHeaders() {
    const token = localStorage.getItem("authToken");
    return {
        "Content-Type": "application/json",
        ...(token ? { "Authorization": `Bearer ${token}` } : {})
    };
}

// XSS Protection Helper
function escapeHtml(str) {
    if (str === null || str === undefined) return "";
    return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// Toast Notifications System
function showToast(message, type = "success") {
    const container = document.getElementById("toastContainer");
    if (!container) return;

    const toast = document.createElement("div");
    toast.className = `toast ${type}`;

    let iconClass = "fa-circle-check";
    if (type === "error") iconClass = "fa-circle-exclamation";
    if (type === "warning") iconClass = "fa-triangle-exclamation";
    if (type === "info") iconClass = "fa-circle-info";

    toast.innerHTML = `
        <i class="fa-solid ${iconClass}" style="font-size:16px;"></i>
        <span>${escapeHtml(message)}</span>
    `;

    container.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = "0";
        toast.style.transform = "translateX(100%)";
        toast.style.transition = "all 0.3s ease";
        setTimeout(() => toast.remove(), 300);
    }, 3500);
}