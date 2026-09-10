/**
 * AQUARIUM FISH E-COMMERCE - PRODUCT DETAILS MODULE
 * Handles REST API fetch, dynamic rendering, image gallery lightbox,
 * quantity calculations, cart actions, reviews, and related fish suggestions.
 */

/* ==========================================================================
   CONFIGURABLE REST API ENDPOINTS & CONSTANTS
   ========================================================================== */

const API_BASE_URL = ""; // TODO: Update host domain if needed (e.g., "http://localhost:8080")
const FISH_API = "/api/fish";
const REVIEW_API = "/api/reviews";
const CART_API = "/api/cart/items";

// Fallback Placeholder Image
const PLACEHOLDER_IMAGE = "https://images.unsplash.com/photo-1522069169874-c58ec4b76be5?auto=format&fit=crop&w=800&q=80";

/* ==========================================================================
   STATE MANAGEMENT
   ========================================================================== */

let activeFish = null;
let currentImageIndex = 0;
let cartCount = 0;
let selectedQuantity = 1;

/* ==========================================================================
   MOCK PREVIEW DATA
   ========================================================================== */

// MOCK DATA FOR FRONTEND PREVIEW
// TODO: Replace with GET /api/fish/{id} when backend REST API is available
const MOCK_FISH_DETAILS = {
    id: 15,
    fishName: "Royal Blue Betta Fish",
    description: "A beautiful and healthy Royal Blue Betta fish (Siamese Fighting Fish). Features striking flowing halfmoon fins with vibrant iridescence. Raised in clean water conditions, well-acclimated, active, and feeding properly on premium pellets.",
    price: 2500.00,
    stockQty: 10,
    seller: {
        id: 2,
        shopName: "Ocean Aquatics Sri Lanka",
        phone: "0712345678",
        address: "Colombo, Sri Lanka"
    },
    category: {
        id: 1,
        categoryName: "Betta",
        description: "Anabantoid tropical freshwater fish"
    },
    breed: {
        id: 1,
        breedName: "Halfmoon Siamese Fighting Fish",
        description: "Popular ornamental fish breed"
    },
    size: {
        id: 1,
        sizeName: "Medium (2.5 inches)"
    },
    color: {
        id: 1,
        colorName: "Royal Blue / Metallic"
    },
    images: [
        { id: 101, imageUrl: "https://images.unsplash.com/photo-1534575180408-b7d785e223af?auto=format&fit=crop&w=800&q=80", isPrimary: true },
        { id: 102, imageUrl: "https://images.unsplash.com/photo-1520301255226-bf5f144451c1?auto=format&fit=crop&w=800&q=80", isPrimary: false },
        { id: 103, imageUrl: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=800&q=80", isPrimary: false }
    ],
    reviews: [
        {
            id: 1,
            rating: 5,
            comment: "Arrived in great health! Color is even more vibrant than in photos.",
            reviewDate: "2026-09-02",
            customer: { firstName: "Sarah", lastName: "D." }
        },
        {
            id: 2,
            rating: 5,
            comment: "Super fast delivery to Kandy. The fish is active and acclimated quickly.",
            reviewDate: "2026-08-28",
            customer: { firstName: "Kamal", lastName: "P." }
        },
        {
            id: 3,
            rating: 4,
            comment: "Healthy fish, well packaged with oxygen bag.",
            reviewDate: "2026-08-15",
            customer: { firstName: "Nimal", lastName: "S." }
        }
    ]
};

const MOCK_RELATED = [
    {
        id: 1,
        fishName: "Red Crowntail Betta",
        price: 2800.00,
        stockQty: 5,
        rating: 4.8,
        images: [{ imageUrl: "https://images.unsplash.com/photo-1520301255226-bf5f144451c1?auto=format&fit=crop&w=600&q=80", isPrimary: true }]
    },
    {
        id: 3,
        fishName: "Fancy Cobra Guppy Pair",
        price: 850.00,
        stockQty: 20,
        rating: 4.9,
        images: [{ imageUrl: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=600&q=80", isPrimary: true }]
    },
    {
        id: 4,
        fishName: "Neon Tetra Group (Pack of 5)",
        price: 1500.00,
        stockQty: 15,
        rating: 4.7,
        images: [{ imageUrl: "https://images.unsplash.com/photo-1522069169874-c58ec4b76be5?auto=format&fit=crop&w=600&q=80", isPrimary: true }]
    },
    {
        id: 5,
        fishName: "Oranda Goldfish Gold",
        price: 4500.00,
        stockQty: 8,
        rating: 4.6,
        images: [{ imageUrl: "https://images.unsplash.com/photo-1517363898874-d377584296f7?auto=format&fit=crop&w=600&q=80", isPrimary: true }]
    }
];

/* ==========================================================================
   INITIALIZATION & EVENT BINDINGS
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    initNavbarToggle();
    initActionListeners();
    initLightboxModal();
    initReviewModal();

    const fishId = getFishIdFromUrl();
    if (fishId) {
        loadFishDetails(fishId);
    } else {
        showErrorState();
    }
});

/**
 * Extracts fish ID parameter from window URL
 */
function getFishIdFromUrl() {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");
    return id && !isNaN(id) ? id : null;
}

/* ==========================================================================
   DATA FETCHING & CONTROLLER
   ========================================================================== */

/**
 * Fetches Fish details from REST API with mock preview fallback
 */
async function loadFishDetails(id) {
    showLoadingState();

    try {
        const response = await fetch(`${API_BASE_URL}${FISH_API}/${id}`);
        if (response.ok) {
            activeFish = await response.json();
        } else {
            console.warn("Backend REST API non-200. Utilizing preview mock data.");
            activeFish = MOCK_FISH_DETAILS;
        }
    } catch (error) {
        console.warn("REST API unreachable. Utilizing preview mock data.", error);
        activeFish = MOCK_FISH_DETAILS;
    }

    if (!activeFish || !activeFish.id) {
        showErrorState();
        return;
    }

    renderFishDetails(activeFish);
    loadReviews(activeFish.id);
    loadRelatedFish(activeFish);
    trackRecentlyViewed(activeFish);
}

/* ==========================================================================
   UI RENDERING FUNCTIONS
   ========================================================================== */

function renderFishDetails(fish) {
    document.getElementById('loading-state').classList.add('hidden');
    document.getElementById('error-state').classList.add('hidden');
    document.getElementById('product-details-content').classList.remove('hidden');

    // Page Title & Breadcrumb
    document.title = `${fish.fishName || 'Fish Details'} | Aquarium Fish Marketplace`;
    document.getElementById('breadcrumb-fish-name').textContent = fish.fishName || 'Fish Details';
    document.getElementById('fish-title').textContent = fish.fishName || 'Unnamed Fish';

    // Badges & Meta
    document.getElementById('fish-category-badge').textContent = fish.category?.categoryName || 'General';
    document.getElementById('fish-breed-text').textContent = fish.breed?.breedName || 'Species';

    // Description & Price
    document.getElementById('fish-description').textContent = fish.description || 'No description provided for this fish.';
    document.getElementById('fish-price').textContent = formatCurrency(fish.price);

    // Specifications Grid
    document.getElementById('spec-category').textContent = fish.category?.categoryName || 'Not specified';
    document.getElementById('spec-breed').textContent = fish.breed?.breedName || 'Not specified';
    document.getElementById('spec-size').textContent = fish.size?.sizeName || 'Not specified';
    document.getElementById('spec-color').textContent = fish.color?.colorName || 'Not specified';

    // Seller Information Card
    if (fish.seller) {
        document.getElementById('seller-shop-name').textContent = fish.seller.shopName || 'Verified Breeder';
        document.getElementById('seller-address').textContent = fish.seller.address || 'Colombo';
    } else {
        document.getElementById('seller-shop-name').textContent = 'Aquarium Partner Store';
        document.getElementById('seller-address').textContent = 'Sri Lanka';
    }

    // Stock Status & Controls
    updateStockStatus(fish.stockQty || 0);

    // Image Gallery Initialization
    renderImageGallery(fish);
}

/**
 * Image Gallery Builder
 */
function renderImageGallery(fish) {
    const images = fish.images && fish.images.length > 0 ? fish.images : [{ imageUrl: PLACEHOLDER_IMAGE, isPrimary: true }];
    const mainImg = document.getElementById('main-fish-image');
    const thumbContainer = document.getElementById('thumbnail-gallery');

    // Determine primary display image
    const primaryIndex = images.findIndex(img => img.isPrimary === true);
    currentImageIndex = primaryIndex !== -1 ? primaryIndex : 0;

    mainImg.src = images[currentImageIndex].imageUrl;
    mainImg.alt = fish.fishName || 'Aquarium fish';

    thumbContainer.innerHTML = '';
    images.forEach((img, index) => {
        const thumb = document.createElement('button');
        thumb.type = 'button';
        thumb.className = `thumb-item ${index === currentImageIndex ? 'active' : ''}`;
        thumb.setAttribute('aria-label', `View image thumbnail ${index + 1}`);
        thumb.innerHTML = `<img src="${img.imageUrl}" alt="Thumbnail ${index + 1}" class="thumb-img" onError="this.src='${PLACEHOLDER_IMAGE}'">`;

        thumb.addEventListener('click', () => {
            currentImageIndex = index;
            mainImg.src = img.imageUrl;
            document.querySelectorAll('.thumb-item').forEach(t => t.classList.remove('active'));
            thumb.classList.add('active');
        });

        thumbContainer.appendChild(thumb);
    });
}

/**
 * Handles Primary Image Selection Logic
 */
function getPrimaryImage(fish) {
    if (!fish || !fish.images || fish.images.length === 0) return PLACEHOLDER_IMAGE;
    const primary = fish.images.find(img => img.isPrimary === true);
    return primary ? primary.imageUrl : fish.images[0].imageUrl;
}

/**
 * Stock Status & Quantity Bounds Controller
 */
function updateStockStatus(stockQty) {
    const badge = document.getElementById('stock-badge');
    const icon = document.getElementById('stock-icon');
    const statusText = document.getElementById('stock-status-text');
    const qtyText = document.getElementById('stock-qty-text');
    const specAvail = document.getElementById('spec-availability');

    const addBtn = document.getElementById('add-to-cart-btn');
    const buyBtn = document.getElementById('buy-now-btn');
    const qtyInput = document.getElementById('qty-input');

    selectedQuantity = 1;
    qtyInput.value = 1;

    if (stockQty > 0) {
        badge.className = "stock-badge in-stock";
        icon.className = "fa-solid fa-check-circle";
        statusText.textContent = stockQty <= 5 ? `Only ${stockQty} left!` : "In Stock";
        qtyText.textContent = `${stockQty} available`;
        specAvail.textContent = `${stockQty} available in stock`;

        addBtn.disabled = false;
        buyBtn.disabled = false;
        qtyInput.max = stockQty;
    } else {
        badge.className = "stock-badge out-of-stock";
        icon.className = "fa-solid fa-circle-xmark";
        statusText.textContent = "Out of Stock";
        qtyText.textContent = "Currently unavailable";
        specAvail.textContent = "Out of Stock";

        addBtn.disabled = true;
        buyBtn.disabled = true;
        qtyInput.max = 0;
        qtyInput.value = 0;
    }
}

/* ==========================================================================
   QUANTITY CONTROL HANDLERS
   ========================================================================== */

function handleQuantityChange(delta) {
    if (!activeFish || activeFish.stockQty <= 0) return;

    const maxStock = activeFish.stockQty;
    let newQty = selectedQuantity + delta;

    if (newQty < 1) newQty = 1;
    if (newQty > maxStock) {
        newQty = maxStock;
        showToast(`Maximum available stock is ${maxStock}`, 'info');
    }

    selectedQuantity = newQty;
    document.getElementById('qty-input').value = selectedQuantity;
}

/* ==========================================================================
   REVIEWS & RATING ENGINE
   ========================================================================== */

/**
 * Fetches and renders reviews (GET /api/reviews/fish/{id})
 */
async function loadReviews(fishId) {
    let reviews = activeFish?.reviews || [];

    try {
        const res = await fetch(`${API_BASE_URL}${REVIEW_API}/fish/${fishId}`);
        if (res.ok) {
            reviews = await res.json();
        }
    } catch (e) {
        // Fallback to activeFish attached mock reviews
    }

    renderReviews(reviews);
}

function renderReviews(reviews) {
    const avgRating = calculateAverageRating(reviews);
    const count = reviews.length;

    // Header ratings
    document.getElementById('fish-stars').innerHTML = renderStarRating(avgRating);
    document.getElementById('fish-rating-val').textContent = avgRating.toFixed(1);
    document.getElementById('fish-reviews-count').textContent = `(${count} ${count === 1 ? 'Review' : 'Reviews'})`;

    // Summary Card
    document.getElementById('summary-avg-rating').textContent = avgRating.toFixed(1);
    document.getElementById('summary-stars').innerHTML = renderStarRating(avgRating);
    document.getElementById('summary-total-reviews').textContent = `Based on ${count} ${count === 1 ? 'review' : 'reviews'}`;

    renderRatingSummary(reviews);

    // Review List Cards
    const container = document.getElementById('reviews-list-container');
    if (reviews.length === 0) {
        container.innerHTML = `<p style="grid-column: 1/-1; color: var(--neutral-400);">No reviews yet. Be the first to review this fish!</p>`;
        return;
    }

    container.innerHTML = reviews.map(r => `
    <article class="review-card">
      <div class="review-author-row">
        <span class="review-author-name">${escapeHtml(r.customer?.firstName || 'Verified Customer')} ${escapeHtml(r.customer?.lastName || '')}</span>
        <span class="review-date">${formatDate(r.reviewDate)}</span>
      </div>
      <div class="rating-stars">${renderStarRating(r.rating)}</div>
      <p class="review-comment">${escapeHtml(r.comment)}</p>
    </article>
  `).join('');
}

function calculateAverageRating(reviews) {
    if (!reviews || reviews.length === 0) return 5.0;
    const total = reviews.reduce((sum, r) => sum + r.rating, 0);
    return total / reviews.length;
}

function renderRatingSummary(reviews) {
    const breakdownContainer = document.getElementById('rating-breakdown-bars');
    if (!breakdownContainer) return;

    const total = reviews.length;
    const counts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };

    reviews.forEach(r => {
        if (counts[r.rating] !== undefined) counts[r.rating]++;
    });

    let barsHtml = '';
    for (let star = 5; star >= 1; star--) {
        const starCount = counts[star];
        const percentage = total > 0 ? (starCount / total) * 100 : 0;
        barsHtml += `
      <div class="breakdown-row">
        <span class="breakdown-label">${star} ★</span>
        <div class="breakdown-bar-bg">
          <div class="breakdown-bar-fill" style="width: ${percentage}%"></div>
        </div>
        <span class="breakdown-count">${starCount}</span>
      </div>
    `;
    }

    breakdownContainer.innerHTML = barsHtml;
}

/* ==========================================================================
   CART & ACTION CONTROLLERS
   ========================================================================== */

/**
 * Handles Add To Cart API Request
 */
async function addToCart() {
    /*
      SECURITY CONSIDERATION & BACKEND VALIDATION:
      - Frontend quantity/price checks are for user experience only.
      - Final prices, stock availability, and user order totals MUST ALWAYS
        be validated securely on the Spring Boot backend server.
    */

    if (!activeFish || activeFish.stockQty <= 0) {
        showToast('This item is currently out of stock.', 'error');
        return;
    }

    const token = getAuthToken();
    const payload = {
        fishId: activeFish.id,
        quantity: selectedQuantity
    };

    try {
        const headers = { 'Content-Type': 'application/json' };
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const response = await fetch(`${API_BASE_URL}${CART_API}`, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(payload)
        });

        if (response.ok || response.status === 201) {
            updateCartCount(cartCount + selectedQuantity);
            showToast(`${activeFish.fishName} (${selectedQuantity}) added to cart!`, 'success');
        } else {
            // Mock fallback behavior
            updateCartCount(cartCount + selectedQuantity);
            showToast(`${activeFish.fishName} (${selectedQuantity}) added to cart!`, 'success');
        }
    } catch (error) {
        console.warn("Cart API offline, fallback to frontend state.", error);
        updateCartCount(cartCount + selectedQuantity);
        showToast(`${activeFish.fishName} (${selectedQuantity}) added to cart!`, 'success');
    }
}

/**
 * Handles Buy Now Redirect
 */
async function buyNow() {
    await addToCart();
    window.location.href = "checkout.html";
}

function toggleWishlist() {
    const btn = document.getElementById('wishlist-btn');
    const icon = document.getElementById('wishlist-icon');
    const text = document.getElementById('wishlist-btn-text');

    btn.classList.toggle('active');
    if (btn.classList.contains('active')) {
        icon.className = 'fa-solid fa-heart';
        text.textContent = 'Added to Wishlist';
        showToast('Added to your wishlist!', 'success');
    } else {
        icon.className = 'fa-regular fa-heart';
        text.textContent = 'Add to Wishlist';
    }
}

/**
 * Share API with Clipboard Fallback
 */
async function shareProduct() {
    const shareData = {
        title: activeFish?.fishName || 'Aquarium Fish',
        text: `Check out this ${activeFish?.fishName || 'fish'} on Aquarium Fish Store!`,
        url: window.location.href
    };

    if (navigator.share) {
        try {
            await navigator.share(shareData);
        } catch (e) {
            // User cancelled share
        }
    } else {
        navigator.clipboard.writeText(window.location.href);
        showToast('Link copied to clipboard!', 'info');
    }
}

/* ==========================================================================
   RELATED & RECENTLY VIEWED PRODUCTS
   ========================================================================== */

function loadRelatedFish(currentFish) {
    const container = document.getElementById('related-grid');
    if (!container) return;

    // Render mock or filtered related fish
    container.innerHTML = MOCK_RELATED.map(fish => `
    <article class="fish-card">
      <div class="card-image-wrapper">
        <img src="${getPrimaryImage(fish)}" alt="${escapeHtml(fish.fishName)}" class="card-img" loading="lazy">
      </div>
      <div class="card-content">
        <h3 class="card-title">${escapeHtml(fish.fishName)}</h3>
        <div class="card-price">${formatCurrency(fish.price)}</div>
        <div class="card-actions">
          <a href="fish-details.html?id=${fish.id}" class="btn btn-outline btn-sm">View Details</a>
          <button type="button" class="btn btn-primary btn-sm" onclick="showToast('Added to cart', 'success')">Add</button>
        </div>
      </div>
    </article>
  `).join('');
}

function trackRecentlyViewed(fish) {
    // Store non-sensitive product IDs in localStorage
    try {
        let recent = JSON.parse(localStorage.getItem('recently_viewed_fish') || '[]');
        recent = recent.filter(id => id !== fish.id);
        recent.unshift(fish.id);
        if (recent.length > 4) recent.pop();
        localStorage.setItem('recently_viewed_fish', JSON.stringify(recent));
    } catch (e) {
        // Ignore storage restrictions
    }
}

/* ==========================================================================
   MODAL DIALOGS (LIGHTBOX & WRITE REVIEW)
   ========================================================================== */

function initLightboxModal() {
    const trigger = document.getElementById('zoom-trigger-btn');
    const modal = document.getElementById('image-modal');
    const closeBtn = document.getElementById('lightbox-close-btn');
    const overlay = document.getElementById('lightbox-overlay');
    const prevBtn = document.getElementById('lightbox-prev-btn');
    const nextBtn = document.getElementById('lightbox-next-btn');

    trigger?.addEventListener('click', openLightbox);
    closeBtn?.addEventListener('click', closeLightbox);
    overlay?.addEventListener('click', closeLightbox);

    prevBtn?.addEventListener('click', () => changeLightboxImg(-1));
    nextBtn?.addEventListener('click', () => changeLightboxImg(1));

    document.addEventListener('keydown', (e) => {
        if (!modal.classList.contains('hidden')) {
            if (e.key === 'Escape') closeLightbox();
            if (e.key === 'ArrowLeft') changeLightboxImg(-1);
            if (e.key === 'ArrowRight') changeLightboxImg(1);
        }
    });
}

function openLightbox() {
    const images = activeFish?.images || [{ imageUrl: PLACEHOLDER_IMAGE }];
    const modal = document.getElementById('image-modal');
    const img = document.getElementById('lightbox-img');
    const counter = document.getElementById('lightbox-counter');

    img.src = images[currentImageIndex].imageUrl;
    counter.textContent = `${currentImageIndex + 1} / ${images.length}`;
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

function closeLightbox() {
    document.getElementById('image-modal').classList.add('hidden');
    document.body.style.overflow = '';
}

function changeLightboxImg(step) {
    const images = activeFish?.images || [];
    if (images.length === 0) return;

    currentImageIndex = (currentImageIndex + step + images.length) % images.length;
    document.getElementById('lightbox-img').src = images[currentImageIndex].imageUrl;
    document.getElementById('lightbox-counter').textContent = `${currentImageIndex + 1} / ${images.length}`;
}

function initReviewModal() {
    const openBtn = document.getElementById('open-review-modal-btn');
    const modal = document.getElementById('review-modal');
    const closeBtn = document.getElementById('review-modal-close');
    const cancelBtn = document.getElementById('review-cancel-btn');
    const backdrop = document.getElementById('review-modal-backdrop');
    const form = document.getElementById('review-form');

    openBtn?.addEventListener('click', () => {
        const token = getAuthToken();
        if (!token && false) { // TODO: Toggle auth condition when Spring Security is linked
            showToast('Please sign in to write a review.', 'info');
            return;
        }
        modal.classList.remove('hidden');
    });

    const closeModal = () => modal.classList.add('hidden');
    closeBtn?.addEventListener('click', closeModal);
    cancelBtn?.addEventListener('click', closeModal);
    backdrop?.addEventListener('click', closeModal);

    // Star Picker Logic
    const starBtns = document.querySelectorAll('.star-pick-btn');
    starBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const val = parseInt(btn.dataset.value);
            document.getElementById('review-rating-val').value = val;
            starBtns.forEach((s, idx) => {
                if (idx < val) s.classList.add('active');
                else s.classList.remove('active');
            });
        });
    });

    form?.addEventListener('submit', async (e) => {
        e.preventDefault();
        /*
          TODO: POST /api/reviews
          Body: { fishId, rating, comment }
        */
        showToast('Thank you! Your review has been submitted.', 'success');
        closeModal();
    });
}

/* ==========================================================================
   UTILITY HELPERS & TOASTS
   ========================================================================== */

function initActionListeners() {
    document.getElementById('qty-decrement-btn')?.addEventListener('click', () => handleQuantityChange(-1));
    document.getElementById('qty-increment-btn')?.addEventListener('click', () => handleQuantityChange(1));
    document.getElementById('add-to-cart-btn')?.addEventListener('click', addToCart);
    document.getElementById('buy-now-btn')?.addEventListener('click', buyNow);
    document.getElementById('wishlist-btn')?.addEventListener('click', toggleWishlist);
    document.getElementById('share-btn')?.addEventListener('click', shareProduct);
}

function updateCartCount(newCount) {
    cartCount = newCount;
    const badge = document.getElementById('cart-badge');
    if (badge) {
        badge.textContent = cartCount;
    }
}

function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    let iconClass = 'fa-circle-info';
    if (type === 'success') iconClass = 'fa-circle-check';
    if (type === 'error') iconClass = 'fa-circle-exclamation';

    toast.innerHTML = `<i class="fa-solid ${iconClass}"></i><span>${escapeHtml(message)}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
        toast.classList.add('toast-out');
        toast.addEventListener('animationend', () => toast.remove());
    }, 3200);
}

function showLoadingState() {
    document.getElementById('loading-state').classList.remove('hidden');
    document.getElementById('error-state').classList.add('hidden');
    document.getElementById('product-details-content').classList.add('hidden');
}

function showErrorState() {
    document.getElementById('loading-state').classList.add('hidden');
    document.getElementById('error-state').classList.remove('hidden');
    document.getElementById('product-details-content').classList.add('hidden');
}

function renderStarRating(rating = 5) {
    const fullStars = Math.floor(rating);
    const hasHalf = rating % 1 >= 0.5;
    let stars = '';
    for (let i = 0; i < fullStars; i++) stars += '<i class="fa-solid fa-star"></i>';
    if (hasHalf) stars += '<i class="fa-solid fa-star-half-stroke"></i>';
    return stars;
}

function initNavbarToggle() {
    const toggle = document.getElementById('mobile-menu-toggle');
    const nav = document.getElementById('main-nav');
    toggle?.addEventListener('click', () => nav?.classList.toggle('open'));
}

function getAuthToken() {
    // Non-sensitive token lookup
    return localStorage.getItem('auth_token') || null;
}

function formatCurrency(amount) {
    return 'Rs. ' + parseFloat(amount || 0).toLocaleString('en-LK', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatDate(dateStr) {
    if (!dateStr) return 'Recently';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

function escapeHtml(str) {
    return String(str || '').replace(/[&<>"']/g, m => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    })[m]);
}