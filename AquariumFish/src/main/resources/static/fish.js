/**
 * AQUARIUM FISH E-COMMERCE - PRODUCT CATALOG MODULE
 * Handles REST API fetch, dynamic rendering, filtering, searching, sorting,
 * quick view modal, pagination, and shopping cart integration.
 */

/* ==========================================================================
   CONFIGURABLE REST API ENDPOINTS
   ========================================================================== */

const API_BASE_URL = ""; // TODO: Update host domain if needed (e.g. "http://localhost:8080")
const FISH_API = "/api/fish";
const CATEGORY_API = "/api/categories";
const BREED_API = "/api/breeds";
const SIZE_API = "/api/sizes";
const COLOR_API = "/api/colors";
const CART_API = "/api/cart/items";
const REVIEWS_API = "/api/reviews/fish"; // TODO: Backend review endpoint e.g., GET /api/reviews/fish/{fishId}

// Fallback Placeholder Image
const PLACEHOLDER_IMAGE = "https://images.unsplash.com/photo-1522069169874-c58ec4b76be5?auto=format&fit=crop&w=600&q=80";

/* ==========================================================================
   STATE MANAGEMENT
   ========================================================================== */

let allFishData = [];          // Master list retrieved from backend/mock
let filteredFishData = [];     // Currently filtered & sorted active working list
let cartCount = 0;             // Active dynamic cart item counter
let currentPage = 1;           // Frontend active page
const itemsPerPage = 9;        // Grid cards count limit per page

/* ==========================================================================
   MOCK SAMPLE DATA (Used fallback prior to Spring Boot REST connection)
   ========================================================================== */

// MOCK DATA
// TODO: Replace with real GET /api/fish endpoint data when backend is live
const MOCK_FISH = [
    {
        id: 1,
        fishName: "Royal Blue Betta",
        description: "Vibrant royal blue halfmoon betta fish with magnificent flowing fins. Ideal for desktop aquariums.",
        price: 2500.00,
        stockQty: 12,
        category: { id: 1, categoryName: "Betta" },
        breed: { id: 1, breedName: "Siamese Fighting Fish" },
        size: { id: 1, sizeName: "Small" },
        color: { id: 1, colorName: "Blue" },
        seller: { id: 1, storeName: "Aqua Paradise" },
        images: [{ imageUrl: "https://images.unsplash.com/photo-1534575180408-b7d785e223af?auto=format&fit=crop&w=600&q=80", isPrimary: true }],
        rating: 4.9,
        reviewCount: 28
    },
    {
        id: 2,
        fishName: "Red Crowntail Betta",
        description: "Striking red crowntail betta with distinctive webbed fin rays. Energetic and healthy specimen.",
        price: 2800.00,
        stockQty: 5,
        category: { id: 1, categoryName: "Betta" },
        breed: { id: 1, breedName: "Siamese Fighting Fish" },
        size: { id: 1, sizeName: "Small" },
        color: { id: 2, colorName: "Red" },
        seller: { id: 1, storeName: "Aqua Paradise" },
        images: [{ imageUrl: "https://images.unsplash.com/photo-1520301255226-bf5f144451c1?auto=format&fit=crop&w=600&q=80", isPrimary: true }],
        rating: 4.7,
        reviewCount: 19
    },
    {
        id: 3,
        fishName: "Fancy Cobra Guppy",
        description: "Colorful cobra patterned fancy guppy pair. Active surface dwellers, easy to care for.",
        price: 850.00,
        stockQty: 25,
        category: { id: 2, categoryName: "Guppy" },
        breed: { id: 2, breedName: "Fancy Guppy" },
        size: { id: 1, sizeName: "Small" },
        color: { id: 3, colorName: "Multicolor" },
        seller: { id: 2, storeName: "Lanka Breeders" },
        images: [{ imageUrl: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=600&q=80", isPrimary: true }],
        rating: 4.8,
        reviewCount: 42
    },
    {
        id: 4,
        fishName: "Neon Tetra Group (Pack of 5)",
        description: "School of 5 bright blue and red neon tetras. Perfect community aquarium fish.",
        price: 1500.00,
        stockQty: 30,
        category: { id: 3, categoryName: "Tetra" },
        breed: { id: 3, breedName: "Neon Tetra" },
        size: { id: 1, sizeName: "Small" },
        color: { id: 1, colorName: "Blue" },
        seller: { id: 2, storeName: "Lanka Breeders" },
        images: [{ imageUrl: "https://images.unsplash.com/photo-1522069169874-c58ec4b76be5?auto=format&fit=crop&w=600&q=80", isPrimary: true }],
        rating: 4.9,
        reviewCount: 56
    },
    {
        id: 5,
        fishName: "Oranda Goldfish Gold",
        description: "Premium Oranda Goldfish with a prominent cap (wen). Peaceful and majestic swimmer.",
        price: 4500.00,
        stockQty: 8,
        category: { id: 4, categoryName: "Goldfish" },
        breed: { id: 4, breedName: "Oranda Goldfish" },
        size: { id: 2, sizeName: "Medium" },
        color: { id: 4, colorName: "Orange" },
        seller: { id: 3, storeName: "Ocean World" },
        images: [{ imageUrl: "https://images.unsplash.com/photo-1517363898874-d377584296f7?auto=format&fit=crop&w=600&q=80", isPrimary: true }],
        rating: 4.6,
        reviewCount: 15
    },
    {
        id: 6,
        fishName: "Marbled Freshwater Angelfish",
        description: "Elegant marbled angelfish with long graceful fins. Adds height and beauty to planted aquariums.",
        price: 3200.00,
        stockQty: 0, // Out of stock test
        category: { id: 5, categoryName: "Tropical Fish" },
        breed: { id: 5, breedName: "Angelfish" },
        size: { id: 2, sizeName: "Medium" },
        color: { id: 5, colorName: "Black" },
        seller: { id: 3, storeName: "Ocean World" },
        images: [{ imageUrl: "https://images.unsplash.com/photo-1518837695005-2083093ee35b?auto=format&fit=crop&w=600&q=80", isPrimary: true }],
        rating: 4.5,
        reviewCount: 22
    },
    {
        id: 7,
        fishName: "Red Turquoise Discus",
        description: "The King of Aquariums! High-grade Red Turquoise Discus with vibrant coloration.",
        price: 12500.00,
        stockQty: 4,
        category: { id: 6, categoryName: "Cichlid" },
        breed: { id: 6, breedName: "Discus" },
        size: { id: 3, sizeName: "Large" },
        color: { id: 2, colorName: "Red" },
        seller: { id: 1, storeName: "Aqua Paradise" },
        images: [{ imageUrl: "https://images.unsplash.com/photo-1548425720-a92c3449307e?auto=format&fit=crop&w=600&q=80", isPrimary: true }],
        rating: 5.0,
        reviewCount: 31
    },
    {
        id: 8,
        fishName: "Tiger Oscar Cichlid",
        description: "Intelligent and bold Tiger Oscar with deep orange flame patterns. Requires large aquarium.",
        price: 6800.00,
        stockQty: 6,
        category: { id: 6, categoryName: "Cichlid" },
        breed: { id: 7, breedName: "Oscar" },
        size: { id: 3, sizeName: "Large" },
        color: { id: 4, colorName: "Orange" },
        seller: { id: 3, storeName: "Ocean World" },
        images: [{ imageUrl: "https://images.unsplash.com/photo-1535591273668-578e31182c4f?auto=format&fit=crop&w=600&q=80", isPrimary: true }],
        rating: 4.7,
        reviewCount: 18
    },
    {
        id: 9,
        fishName: "Black Moor Goldfish",
        description: "Classic Black Moor Goldfish featuring distinctive telescopic eyes and velvety black scales.",
        price: 2200.00,
        stockQty: 10,
        category: { id: 4, categoryName: "Goldfish" },
        breed: { id: 8, breedName: "Black Moor" },
        size: { id: 2, sizeName: "Medium" },
        color: { id: 5, colorName: "Black" },
        seller: { id: 2, storeName: "Lanka Breeders" },
        images: [{ imageUrl: "https://images.unsplash.com/photo-1508873696983-2df515122519?auto=format&fit=crop&w=600&q=80", isPrimary: true }],
        rating: 4.8,
        reviewCount: 14
    }
];

/* ==========================================================================
   INITIALIZATION & EVENT BINDINGS
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    initNavbarMobileToggle();
    initSearchAndFilterListeners();
    initQuickViewModalListeners();

    // Load initial dataset & category option controls
    loadFishData();
    loadFilterCategories();

    // Handle incoming Query Strings (e.g. fish.html?category=Betta)
    handleUrlQueryParams();
});

/* ==========================================================================
   REST API LOADERS WITH MOCK FALLBACKS
   ========================================================================== */

/**
 * Loads Fish items list from Spring Boot REST endpoint
 */
async function loadFishData() {
    showLoadingState();

    try {
        const response = await fetch(`${API_BASE_URL}${FISH_API}`);
        if (response.ok) {
            allFishData = await response.json();
        } else {
            console.warn("Spring Boot backend returned non-200. Utilizing fallback mock data.");
            allFishData = MOCK_FISH;
        }
    } catch (error) {
        console.warn("Backend REST API offline. Using fallback mock data.", error);
        allFishData = MOCK_FISH;
    }

    // Set active dataset and apply initial filters/sorting
    filteredFishData = [...allFishData];
    applyFiltersAndSort();
}

/**
 * Loads Filter Categories (GET /api/categories)
 */
async function loadFilterCategories() {
    const container = document.getElementById('category-filter-list');
    if (!container) return;

    let categories = ["Betta", "Guppy", "Tetra", "Goldfish", "Tropical Fish", "Cichlid"];

    try {
        const res = await fetch(`${API_BASE_URL}${CATEGORY_API}`);
        if (res.ok) {
            const data = await res.json();
            categories = data.map(c => c.categoryName);
        }
    } catch (e) {
        // Fallback to defaults
    }

    container.innerHTML = categories.map(cat => `
    <label class="checkbox-label">
      <input type="checkbox" class="category-checkbox" value="${cat}">
      <span class="checkbox-custom"></span>
      <span>${cat}</span>
    </label>
  `).join('');

    // Bind change events
    container.querySelectorAll('input').forEach(input => {
        input.addEventListener('change', applyFiltersAndSort);
    });
}

/* ==========================================================================
   DYNAMIC FILTERING, SEARCHING & SORTING LOGIC
   ========================================================================== */

function applyFiltersAndSort() {
    const searchVal = document.getElementById('search-input')?.value.trim().toLowerCase() || '';

    // 1. Filter by Search Query
    let result = allFishData.filter(fish => {
        const nameMatch = fish.fishName?.toLowerCase().includes(searchVal);
        const catMatch = fish.category?.categoryName?.toLowerCase().includes(searchVal);
        const breedMatch = fish.breed?.breedName?.toLowerCase().includes(searchVal);
        return nameMatch || catMatch || breedMatch;
    });

    // 2. Filter by Checked Categories
    const selectedCategories = Array.from(document.querySelectorAll('.category-checkbox:checked')).map(cb => cb.value);
    if (selectedCategories.length > 0) {
        result = result.filter(fish => fish.category && selectedCategories.includes(fish.category.categoryName));
    }

    // 3. Filter by Price Range
    const maxPrice = parseFloat(document.getElementById('price-range-slider')?.value || 15000);
    const minPrice = parseFloat(document.getElementById('min-price-input')?.value || 0);
    result = result.filter(fish => (fish.price >= minPrice && fish.price <= maxPrice));

    // 4. Filter by Stock Availability
    const showInStock = document.getElementById('stock-instock-cb')?.checked;
    const showOutStock = document.getElementById('stock-outstock-cb')?.checked;

    result = result.filter(fish => {
        const inStock = (fish.stockQty && fish.stockQty > 0);
        if (inStock && showInStock) return true;
        if (!inStock && showOutStock) return true;
        return false;
    });

    // 5. Apply Sorting
    const sortType = document.getElementById('sort-select')?.value || 'featured';
    result = sortFishArray(result, sortType);

    filteredFishData = result;
    currentPage = 1; // Reset to first page

    renderProductGrid();
    updateResultsCounters(filteredFishData.length);
}

function sortFishArray(arr, sortType) {
    const list = [...arr];
    switch (sortType) {
        case 'price-low':
            return list.sort((a, b) => a.price - b.price);
        case 'price-high':
            return list.sort((a, b) => b.price - a.price);
        case 'name-asc':
            return list.sort((a, b) => a.fishName.localeCompare(b.fishName));
        case 'name-desc':
            return list.sort((a, b) => b.fishName.localeCompare(a.fishName));
        case 'newest':
            return list.sort((a, b) => b.id - a.id);
        case 'featured':
        default:
            return list;
    }
}

/* ==========================================================================
   PRODUCT GRID & CARD RENDERING
   ========================================================================== */

function renderProductGrid() {
    const grid = document.getElementById('product-grid');
    const emptyState = document.getElementById('empty-state');
    if (!grid || !emptyState) return;

    grid.innerHTML = '';

    if (filteredFishData.length === 0) {
        grid.classList.add('hidden');
        emptyState.classList.remove('hidden');
        renderPagination(0);
        return;
    }

    grid.classList.remove('hidden');
    emptyState.classList.add('hidden');

    // Calculate frontend pagination slice
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedSlice = filteredFishData.slice(startIndex, endIndex);

    paginatedSlice.forEach(fish => {
        const cardHtml = createFishCardHTML(fish);
        grid.insertAdjacentHTML('beforeend', cardHtml);
    });

    renderPagination(filteredFishData.length);
}

/**
 * Creates individual Product Card HTML
 */
function createFishCardHTML(fish) {
    const primaryImg = getPrimaryImageUrl(fish.images);
    const categoryName = fish.category?.categoryName || 'Aquarium';
    const breedName = fish.breed?.breedName || 'Fish';
    const formattedPrice = formatCurrency(fish.price);
    const isInStock = fish.stockQty && fish.stockQty > 0;

    const rating = fish.rating || 4.8;
    const reviewCount = fish.reviewCount || 12;

    return `
    <article class="fish-card" data-id="${fish.id}">
      <div class="card-image-wrapper">
        <img src="${primaryImg}" alt="${escapeHtml(fish.fishName)}" class="card-img" loading="lazy" onError="this.src='${PLACEHOLDER_IMAGE}'">
        
        <button type="button" class="wishlist-btn" onclick="toggleWishlist(this)" aria-label="Add to Wishlist">
          <i class="fa-regular fa-heart" aria-hidden="true"></i>
        </button>

        <button type="button" class="quick-view-overlay-btn" onclick="openQuickView(${fish.id})">
          <i class="fa-solid fa-eye" aria-hidden="true"></i> Quick View
        </button>
      </div>

      <div class="card-content">
        <div class="card-meta">
          <span>${escapeHtml(categoryName)} • ${escapeHtml(breedName)}</span>
        </div>

        <h3 class="card-title">
          <a href="fish-details.html?id=${fish.id}">${escapeHtml(fish.fishName)}</a>
        </h3>

        <p class="card-desc">${escapeHtml(fish.description || 'Healthy aquarium fish specimen.')}</p>

        <div class="card-rating">
          <div class="card-stars">${renderStarRating(rating)}</div>
          <span class="rating-num">${rating}</span>
          <span class="reviews-count">(${reviewCount})</span>
        </div>

        <div class="card-footer-price">
          <div class="price-box">
            <span class="price-amount">${formattedPrice}</span>
          </div>

          <div class="stock-indicator ${isInStock ? 'in-stock' : 'out-of-stock'}">
            <i class="fa-solid ${isInStock ? 'fa-circle-check' : 'fa-circle-xmark'}" aria-hidden="true"></i>
            <span>${isInStock ? 'In Stock' : 'Out of Stock'}</span>
          </div>
        </div>

        <div class="card-actions">
          <a href="fish-details.html?id=${fish.id}" class="btn btn-outline btn-sm">
            Details
          </a>
          <button 
            type="button" 
            class="btn btn-primary btn-sm" 
            ${!isInStock ? 'disabled' : ''} 
            onclick="addToCart(${fish.id})"
          >
            <i class="fa-solid fa-cart-plus" aria-hidden="true"></i> Add
          </button>
        </div>
      </div>
    </article>
  `;
}

/* ==========================================================================
   PRIMARY IMAGE SELECTION LOGIC
   ========================================================================== */

function getPrimaryImageUrl(images) {
    if (!images || images.length === 0) return PLACEHOLDER_IMAGE;
    const primary = images.find(img => img.isPrimary === true);
    return primary ? primary.imageUrl : images[0].imageUrl;
}

/* ==========================================================================
   QUICK VIEW MODAL CONTROLLER
   ========================================================================== */

function openQuickView(fishId) {
    const fish = allFishData.find(f => f.id === fishId);
    if (!fish) return;

    const modal = document.getElementById('quick-view-modal');
    if (!modal) return;

    document.getElementById('modal-fish-img').src = getPrimaryImageUrl(fish.images);
    document.getElementById('modal-fish-title').textContent = fish.fishName;
    document.getElementById('modal-fish-meta').textContent = `${fish.category?.categoryName || 'Fish'} • ${fish.breed?.breedName || 'Species'}`;
    document.getElementById('modal-fish-price').textContent = formatCurrency(fish.price);
    document.getElementById('modal-fish-desc').textContent = fish.description || 'No description available.';

    document.getElementById('modal-spec-size').textContent = fish.size?.sizeName || 'Standard';
    document.getElementById('modal-spec-color').textContent = fish.color?.colorName || 'Natural';
    document.getElementById('modal-spec-qty').textContent = fish.stockQty > 0 ? `${fish.stockQty} In Stock` : 'Out of Stock';
    document.getElementById('modal-spec-seller').textContent = fish.seller?.storeName || 'Verified Breeder';

    document.getElementById('modal-fish-stars').innerHTML = renderStarRating(fish.rating || 4.8);
    document.getElementById('modal-fish-rating-num').textContent = fish.rating || 4.8;
    document.getElementById('modal-fish-reviews-count').textContent = `(${fish.reviewCount || 0} reviews)`;

    const stockBadge = document.getElementById('modal-stock-badge');
    if (fish.stockQty > 0) {
        stockBadge.textContent = "In Stock";
        stockBadge.className = "stock-badge in-stock";
    } else {
        stockBadge.textContent = "Out of Stock";
        stockBadge.className = "stock-badge out-of-stock";
    }

    // Add to Cart Button Setup
    const cartBtn = document.getElementById('modal-add-cart-btn');
    cartBtn.disabled = fish.stockQty <= 0;
    cartBtn.onclick = () => {
        addToCart(fish.id);
        closeQuickView();
    };

    // View Details Link
    document.getElementById('modal-view-details-link').href = `fish-details.html?id=${fish.id}`;

    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden'; // Lock scrolling
}

function closeQuickView() {
    const modal = document.getElementById('quick-view-modal');
    if (modal) {
        modal.classList.add('hidden');
        document.body.style.overflow = '';
    }
}

function initQuickViewModalListeners() {
    document.getElementById('modal-close-btn')?.addEventListener('click', closeQuickView);
    document.getElementById('modal-backdrop')?.addEventListener('click', closeQuickView);

    // Auth Modal Listeners
    document.getElementById('auth-modal-close')?.addEventListener('click', () => {
        document.getElementById('auth-prompt-modal').classList.add('hidden');
    });
    document.getElementById('auth-prompt-cancel')?.addEventListener('click', () => {
        document.getElementById('auth-prompt-modal').classList.add('hidden');
    });

    // Escape key handler
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeQuickView();
            document.getElementById('auth-prompt-modal')?.classList.add('hidden');
        }
    });
}

/* ==========================================================================
   SHOPPING CART INTEGRATION
   ========================================================================== */

/**
 * Adds selected fish to user cart
 */
async function addToCart(fishId) {
    const fish = allFishData.find(f => f.id === fishId);
    if (!fish || fish.stockQty <= 0) return;

    // Check login authentication state
    // TODO: Verify JWT token or authenticated user session
    const isAuthenticated = true; // Set to true for frontend testing

    if (!isAuthenticated) {
        document.getElementById('auth-prompt-modal')?.classList.remove('hidden');
        return;
    }

    const payload = {
        fishId: fishId,
        quantity: 1
    };

    try {
        /*
          TODO: Adjust request format to match Spring Boot CartController.
          Expected Endpoint: POST /api/cart/items
        */
        const response = await fetch(`${API_BASE_URL}${CART_API}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (response.ok || response.status === 201) {
            updateCartCount(cartCount + 1);
            showToast(`${fish.fishName} added to your cart!`, 'success');
        } else {
            // Mock fallback behavior for static test environment
            updateCartCount(cartCount + 1);
            showToast(`${fish.fishName} added to your cart!`, 'success');
        }
    } catch (error) {
        console.warn("Cart endpoint unavailable, updating UI locally.", error);
        updateCartCount(cartCount + 1);
        showToast(`${fish.fishName} added to your cart!`, 'success');
    }
}

function updateCartCount(newCount) {
    cartCount = newCount;
    const badge = document.getElementById('cart-badge');
    if (badge) {
        badge.textContent = cartCount;
        badge.classList.add('bump');
        setTimeout(() => badge.classList.remove('bump'), 300);
    }
}

/* ==========================================================================
   TOAST NOTIFICATION SYSTEM
   ========================================================================== */

function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    let iconClass = 'fa-circle-info';
    if (type === 'success') iconClass = 'fa-circle-check';
    if (type === 'error') iconClass = 'fa-circle-exclamation';

    toast.innerHTML = `
    <i class="fa-solid ${iconClass}"></i>
    <span>${escapeHtml(message)}</span>
  `;

    container.appendChild(toast);

    setTimeout(() => {
        toast.classList.add('toast-out');
        toast.addEventListener('animationend', () => toast.remove());
    }, 3200);
}

/* ==========================================================================
   PAGINATION & AUXILIARY CONTROLS
   ========================================================================== */

function renderPagination(totalItems) {
    const container = document.getElementById('pagination-wrapper');
    if (!container) return;

    const totalPages = Math.ceil(totalItems / itemsPerPage);
    if (totalPages <= 1) {
        container.innerHTML = '';
        return;
    }

    let html = `
    <button class="page-btn" ${currentPage === 1 ? 'disabled' : ''} onclick="changePage(${currentPage - 1})">
      <i class="fa-solid fa-chevron-left"></i>
    </button>
  `;

    for (let i = 1; i <= totalPages; i++) {
        html += `
      <button class="page-btn ${i === currentPage ? 'active' : ''}" onclick="changePage(${i})">
        ${i}
      </button>
    `;
    }

    html += `
    <button class="page-btn" ${currentPage === totalPages ? 'disabled' : ''} onclick="changePage(${currentPage + 1})">
      <i class="fa-solid fa-chevron-right"></i>
    </button>
  `;

    container.innerHTML = html;
}

function changePage(page) {
    currentPage = page;
    renderProductGrid();
    document.getElementById('product-grid')?.scrollIntoView({ behavior: 'smooth' });
}

/* ==========================================================================
   SEARCH & FILTER EVENT LISTENERS
   ========================================================================== */

function initSearchAndFilterListeners() {
    const searchInput = document.getElementById('search-input');
    const clearSearchBtn = document.getElementById('clear-search-btn');

    searchInput?.addEventListener('input', (e) => {
        if (e.target.value.length > 0) {
            clearSearchBtn?.classList.remove('hidden');
        } else {
            clearSearchBtn?.classList.add('hidden');
        }
        applyFiltersAndSort();
    });

    clearSearchBtn?.addEventListener('click', () => {
        if (searchInput) searchInput.value = '';
        clearSearchBtn.classList.add('hidden');
        applyFiltersAndSort();
    });

    document.getElementById('sort-select')?.addEventListener('change', applyFiltersAndSort);
    document.getElementById('price-range-slider')?.addEventListener('input', (e) => {
        document.getElementById('price-range-val').textContent = formatCurrency(e.target.value);
        applyFiltersAndSort();
    });

    document.getElementById('min-price-input')?.addEventListener('change', applyFiltersAndSort);
    document.getElementById('max-price-input')?.addEventListener('change', applyFiltersAndSort);
    document.getElementById('stock-instock-cb')?.addEventListener('change', applyFiltersAndSort);
    document.getElementById('stock-outstock-cb')?.addEventListener('change', applyFiltersAndSort);

    // Reset Filters Actions
    const resetAll = () => {
        if (searchInput) searchInput.value = '';
        document.querySelectorAll('.category-checkbox').forEach(cb => cb.checked = false);
        const slider = document.getElementById('price-range-slider');
        if (slider) slider.value = 15000;
        document.getElementById('price-range-val').textContent = formatCurrency(15000);
        document.getElementById('min-price-input').value = '';
        document.getElementById('max-price-input').value = '';
        document.getElementById('stock-instock-cb').checked = true;
        document.getElementById('stock-outstock-cb').checked = true;
        applyFiltersAndSort();
    };

    document.getElementById('reset-filters-btn')?.addEventListener('click', resetAll);
    document.getElementById('empty-reset-btn')?.addEventListener('click', resetAll);

    // Mobile Filter Drawer Handlers
    const mobileBtn = document.getElementById('mobile-filter-btn');
    const closeBtn = document.getElementById('close-filter-btn');
    const sidebar = document.getElementById('filter-sidebar');
    const overlay = document.getElementById('filter-overlay');

    mobileBtn?.addEventListener('click', () => {
        sidebar?.classList.add('open');
        overlay?.classList.add('active');
    });

    const closeMobileSidebar = () => {
        sidebar?.classList.remove('open');
        overlay?.classList.remove('active');
    };

    closeBtn?.addEventListener('click', closeMobileSidebar);
    overlay?.addEventListener('click', closeMobileSidebar);
}

/* ==========================================================================
   UTILITY HELPERS
   ========================================================================== */

function handleUrlQueryParams() {
    const urlParams = new URLSearchParams(window.location.search);
    const categoryParam = urlParams.get('category');
    const searchParam = urlParams.get('search');

    if (searchParam) {
        const searchInput = document.getElementById('search-input');
        if (searchInput) searchInput.value = searchParam;
    }

    if (categoryParam) {
        setTimeout(() => {
            const targetCheckbox = document.querySelector(`.category-checkbox[value="${categoryParam}"]`);
            if (targetCheckbox) targetCheckbox.checked = true;
            applyFiltersAndSort();
        }, 200);
    }
}

function updateResultsCounters(count) {
    const desktopNum = document.getElementById('results-count-num');
    const mobileNum = document.getElementById('results-count-num-mobile');
    if (desktopNum) desktopNum.textContent = count;
    if (mobileNum) mobileNum.textContent = count;
}

function showLoadingState() {
    const grid = document.getElementById('product-grid');
    if (!grid) return;
    grid.innerHTML = Array(6).fill(0).map(() => `
    <div class="skeleton-card">
      <div class="skeleton-box" style="height: 180px;"></div>
      <div style="padding: 1rem; display: flex; flex-direction: column; gap: 0.5rem;">
        <div class="skeleton-box" style="height: 15px; width: 40%;"></div>
        <div class="skeleton-box" style="height: 20px; width: 80%;"></div>
        <div class="skeleton-box" style="height: 15px; width: 60%;"></div>
      </div>
    </div>
  `).join('');
}

function renderStarRating(rating = 5) {
    const fullStars = Math.floor(rating);
    const hasHalf = rating % 1 >= 0.5;
    let stars = '';
    for (let i = 0; i < fullStars; i++) stars += '<i class="fa-solid fa-star"></i>';
    if (hasHalf) stars += '<i class="fa-solid fa-star-half-stroke"></i>';
    return stars;
}

function toggleWishlist(btn) {
    btn.classList.toggle('active');
    const icon = btn.querySelector('i');
    if (btn.classList.contains('active')) {
        icon.className = 'fa-solid fa-heart';
        showToast('Added to your wishlist!', 'success');
    } else {
        icon.className = 'fa-regular fa-heart';
    }
}

function initNavbarMobileToggle() {
    const toggle = document.getElementById('mobile-menu-toggle');
    const nav = document.getElementById('main-nav');
    toggle?.addEventListener('click', () => {
        nav?.classList.toggle('open');
    });
}

function formatCurrency(amount) {
    return 'Rs. ' + parseFloat(amount || 0).toLocaleString('en-LK', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function escapeHtml(str) {
    return String(str || '').replace(/[&<>"']/g, m => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    })[m]);
}