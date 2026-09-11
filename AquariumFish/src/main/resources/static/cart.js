/**
 * Aquarium Fish - Shopping Cart Page Script
 * Fully modular and prepared for Spring Boot REST API integration.
 */

// ==========================================
// 1. CONFIGURATION & STATE MANAGEMENT
// ==========================================
// TODO: Change API_BASE_URL according to your Spring Boot environment
const API_BASE_URL = "http://localhost:8080/api";

// Set to true when Spring Boot backend REST endpoints are operational
const USE_API = false;

// Cart State
let currentCart = null;
let itemToRemoveId = null;
let discountAmount = 0;

// ==========================================
// 2. MOCK DATA FOR FRONTEND PREVIEW
// ==========================================
// MOCK DATA FOR FRONTEND PREVIEW ONLY
// Replace with GET /api/cart
const mockCart = {
    id: 1,
    status: "ACTIVE",
    createdDate: "2026-09-10T10:30:00",
    customer: { id: 5, name: "Aquarium Enthusiast" },
    cartItems: [
        {
            id: 101,
            quantity: 2,
            unitPrice: 2500,
            fish: {
                id: 1,
                fishName: "Blue Halfmoon Betta",
                price: 2500,
                stockQty: 8,
                category: { categoryName: "Betta Fish" },
                breed: { breedName: "Halfmoon" },
                size: { sizeName: "Small" },
                color: { colorName: "Blue" },
                images: [
                    {
                        imageUrl: "https://images.unsplash.com/photo-1534575180408-b7d785e223af?auto=format&fit=crop&w=600&q=80",
                        isPrimary: true
                    }
                ]
            }
        },
        {
            id: 102,
            quantity: 1,
            unitPrice: 1800,
            fish: {
                id: 2,
                fishName: "Oranda Goldfish",
                price: 1800,
                stockQty: 3,
                category: { categoryName: "Goldfish" },
                breed: { breedName: "Oranda" },
                size: { sizeName: "Medium" },
                color: { colorName: "Red & White" },
                images: [
                    {
                        imageUrl: "https://images.unsplash.com/photo-1522069169874-c58ec4b76be5?auto=format&fit=crop&w=600&q=80",
                        isPrimary: true
                    }
                ]
            }
        },
        {
            id: 103,
            quantity: 5,
            unitPrice: 450,
            fish: {
                id: 3,
                fishName: "Neon Tetra",
                price: 450,
                stockQty: 25,
                category: { categoryName: "Tetra" },
                breed: { breedName: "Neon" },
                size: { sizeName: "Small" },
                color: { colorName: "Neon Blue/Red" },
                images: [
                    {
                        imageUrl: "https://images.unsplash.com/photo-1520315342629-6ea920342047?auto=format&fit=crop&w=600&q=80",
                        isPrimary: true
                    }
                ]
            }
        }
    ]
};

// Mock Related Fish Data
const mockRelatedFish = [
    {
        id: 4,
        fishName: "Fancy Guppy",
        price: 350,
        image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=400&q=80"
    },
    {
        id: 5,
        fishName: "Angel Fish",
        price: 1200,
        image: "https://images.unsplash.com/photo-1516683011827-46882223f3fb?auto=format&fit=crop&w=400&q=80"
    },
    {
        id: 6,
        fishName: "Electric Blue Cichlid",
        price: 3200,
        image: "https://images.unsplash.com/photo-1571752726703-5e7d1f6a986d?auto=format&fit=crop&w=400&q=80"
    },
    {
        id: 7,
        fishName: "Black Molly",
        price: 400,
        image: "https://images.unsplash.com/photo-1524704685729-28f6938e445a?auto=format&fit=crop&w=400&q=80"
    }
];

// ==========================================
// 3. INITIALIZATION & LISTENERS
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
    initializeNavbar();
    initializeModalListeners();
    initializeCheckoutListeners();
    checkAuthStatus();
    loadCart();
    renderRelatedFish();
});

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

function initializeModalListeners() {
    const closeBtn = document.getElementById("closeRemoveModalBtn");
    const cancelBtn = document.getElementById("cancelRemoveBtn");
    const confirmBtn = document.getElementById("confirmRemoveBtn");
    const modal = document.getElementById("removeModal");

    if (closeBtn) closeBtn.addEventListener("click", closeRemoveModal);
    if (cancelBtn) cancelBtn.addEventListener("click", closeRemoveModal);
    if (confirmBtn) confirmBtn.addEventListener("click", confirmRemoveItem);

    if (modal) {
        modal.addEventListener("click", (e) => {
            if (e.target === modal) closeRemoveModal();
        });
    }

    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && modal && modal.classList.contains("active")) {
            closeRemoveModal();
        }
    });
}

function initializeCheckoutListeners() {
    const checkoutBtn = document.getElementById("checkoutBtn");
    const applyCouponBtn = document.getElementById("applyCouponBtn");
    const retryBtn = document.getElementById("retryBtn");

    if (checkoutBtn) checkoutBtn.addEventListener("click", proceedToCheckout);
    if (applyCouponBtn) applyCouponBtn.addEventListener("click", applyCoupon);
    if (retryBtn) retryBtn.addEventListener("click", loadCart);
}

// ==========================================
// 4. API & DATA LOADING FUNCTIONS
// ==========================================
async function loadCart() {
    showLoadingState();

    if (USE_API) {
        try {
            currentCart = await fetchCartFromAPI();
            if (!currentCart || !currentCart.cartItems || currentCart.cartItems.length === 0) {
                showEmptyState();
            } else {
                renderCart();
            }
        } catch (error) {
            console.error("Cart Loading API Error:", error);
            showErrorState();
        }
    } else {
        // Frontend Preview Simulation
        setTimeout(() => {
            currentCart = JSON.parse(JSON.stringify(mockCart));
            if (!currentCart.cartItems || currentCart.cartItems.length === 0) {
                showEmptyState();
            } else {
                renderCart();
            }
        }, 500);
    }
}

// TODO: Replace with GET /api/cart
async function fetchCartFromAPI() {
    const token = localStorage.getItem("token");
    const response = await fetch(`${API_BASE_URL}/cart`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "Authorization": token ? `Bearer ${token}` : ""
        }
    });

    if (!response.ok) {
        throw new Error(`Failed to load cart. Status: ${response.status}`);
    }

    return await response.json();
}

// TODO: Replace mock update with PUT /api/cart/items/{cartItemId}
async function updateCartItemQuantityAPI(cartItemId, newQuantity) {
    const token = localStorage.getItem("token");
    const response = await fetch(`${API_BASE_URL}/cart/items/${cartItemId}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            "Authorization": token ? `Bearer ${token}` : ""
        },
        body: JSON.stringify({ quantity: newQuantity })
    });

    if (!response.ok) {
        throw new Error("Failed to update item quantity");
    }
    return await response.json();
}

// TODO: Connect to DELETE /api/cart/items/{cartItemId}
async function removeCartItemAPI(cartItemId) {
    const token = localStorage.getItem("token");
    const response = await fetch(`${API_BASE_URL}/cart/items/${cartItemId}`, {
        method: "DELETE",
        headers: {
            "Authorization": token ? `Bearer ${token}` : ""
        }
    });

    if (!response.ok) {
        throw new Error("Failed to remove cart item");
    }
}

// ==========================================
// 5. RENDERING FUNCTIONS
// ==========================================
function renderCart() {
    document.getElementById("skeletonContainer").style.display = "none";
    document.getElementById("emptyState").style.display = "none";
    document.getElementById("errorState").style.display = "none";
    document.getElementById("cartContainer").style.display = "grid";

    const cartItemsList = document.getElementById("cartItemsList");
    cartItemsList.innerHTML = "";

    currentCart.cartItems.forEach(item => {
        const itemCard = renderCartItem(item);
        cartItemsList.appendChild(itemCard);
    });

    updateCartHeaderBadge();
    renderOrderSummary();
    updateCartCount();
}

function renderCartItem(item) {
    const fish = item.fish || {};
    const primaryImg = getPrimaryFishImage(fish);
    const itemSubtotal = calculateItemSubtotal(item);
    const stockQty = fish.stockQty || 0;

    const card = document.createElement("div");
    card.className = "cart-item-card";

    // Stock Status Badge Computation
    let stockBadgeHtml = "";
    if (stockQty <= 0) {
        stockBadgeHtml = `<span class="stock-status-badge out-stock">Out of Stock</span>`;
    } else if (stockQty <= 3) {
        stockBadgeHtml = `<span class="stock-status-badge low-stock">Only ${stockQty} left</span>`;
    } else {
        stockBadgeHtml = `<span class="stock-status-badge in-stock">In Stock</span>`;
    }

    card.innerHTML = `
        <div class="cart-item-img-wrapper">
            <img src="${primaryImg}" alt="${fish.fishName || 'Aquarium Fish'}">
        </div>
        <div class="cart-item-details">
            <div class="cart-item-header">
                <h3 class="fish-title">${fish.fishName || 'Aquarium Fish'}</h3>
                <span class="fish-unit-price">${formatCurrency(item.unitPrice)}</span>
            </div>

            <div class="fish-attributes">
                <div class="attr-item">Category: <span>${fish.category?.categoryName || 'N/A'}</span></div>
                <div class="attr-item">Breed: <span>${fish.breed?.breedName || 'N/A'}</span></div>
                <div class="attr-item">Size: <span>${fish.size?.sizeName || 'N/A'}</span></div>
                <div class="attr-item">Color: <span>${fish.color?.colorName || 'N/A'}</span></div>
            </div>

            ${stockBadgeHtml}

            <div class="cart-item-bottom">
                <div class="qty-selector">
                    <button class="qty-btn" aria-label="Decrease quantity" onclick="decreaseQuantity(${item.id})" ${item.quantity <= 1 ? 'disabled' : ''}>
                        <i class="fa-solid fa-minus"></i>
                    </button>
                    <span class="qty-display">${item.quantity}</span>
                    <button class="qty-btn" aria-label="Increase quantity" onclick="increaseQuantity(${item.id})" ${item.quantity >= stockQty ? 'disabled' : ''}>
                        <i class="fa-solid fa-plus"></i>
                    </button>
                </div>

                <div class="item-subtotal-box">
                    <span class="subtotal-label">Subtotal</span>
                    <span class="subtotal-amount">${formatCurrency(itemSubtotal)}</span>
                </div>
            </div>

            <div class="item-actions-list">
                <button class="action-link remove-link" onclick="openRemoveModal(${item.id})">
                    <i class="fa-solid fa-trash-can"></i> Remove
                </button>
                <button class="action-link" onclick="moveToWishlist(${item.id})">
                    <i class="fa-regular fa-heart"></i> Move to Wishlist
                </button>
            </div>
        </div>
    `;

    return card;
}

function renderOrderSummary() {
    const subtotal = calculateSubtotal();
    const grandTotal = Math.max(0, subtotal - discountAmount);

    document.getElementById("summarySubtotal").textContent = formatCurrency(subtotal);
    document.getElementById("summaryTotal").textContent = formatCurrency(grandTotal);

    const discountRow = document.getElementById("discountRow");
    if (discountAmount > 0) {
        discountRow.style.display = "flex";
        document.getElementById("summaryDiscount").textContent = `-${formatCurrency(discountAmount)}`;
    } else {
        discountRow.style.display = "none";
    }
}

// Related Products Section Renderer
function renderRelatedFish() {
    const container = document.getElementById("relatedFishGrid");
    if (!container) return;

    // TODO: Load related fish from GET /api/fish
    container.innerHTML = "";
    mockRelatedFish.forEach(fish => {
        const card = document.createElement("div");
        card.className = "related-card";
        card.innerHTML = `
            <div class="related-img-wrapper">
                <img src="${fish.image}" alt="${fish.fishName}">
            </div>
            <div class="related-body">
                <h4 class="related-title">${fish.fishName}</h4>
                <div class="related-price">${formatCurrency(fish.price)}</div>
                <a href="fish-details.html?id=${fish.id}" class="btn btn-outline-sm full-width">View Details</a>
            </div>
        `;
        container.appendChild(card);
    });
}

// ==========================================
// 6. CART CALCULATIONS & QUANTITY CONTROLS
// ==========================================
function calculateItemSubtotal(item) {
    return (item.unitPrice || 0) * (item.quantity || 0);
}

function calculateSubtotal() {
    if (!currentCart || !currentCart.cartItems) return 0;
    return currentCart.cartItems.reduce((sum, item) => sum + calculateItemSubtotal(item), 0);
}

async function updateQuantity(cartItemId, newQty) {
    const item = currentCart.cartItems.find(i => i.id === cartItemId);
    if (!item) return;

    const maxStock = item.fish?.stockQty || 1;

    if (newQty < 1) return;
    if (newQty > maxStock) {
        showToast(`Only ${maxStock} units available in stock`, "warning");
        return;
    }

    if (USE_API) {
        try {
            await updateCartItemQuantityAPI(cartItemId, newQty);
            item.quantity = newQty;
            renderCart();
            showToast("Cart updated successfully", "success");
        } catch (error) {
            showToast("Unable to update cart quantity", "error");
        }
    } else {
        item.quantity = newQty;
        renderCart();
        showToast("Cart updated successfully", "success");
    }
}

function increaseQuantity(cartItemId) {
    const item = currentCart.cartItems.find(i => i.id === cartItemId);
    if (item) updateQuantity(cartItemId, item.quantity + 1);
}

function decreaseQuantity(cartItemId) {
    const item = currentCart.cartItems.find(i => i.id === cartItemId);
    if (item) updateQuantity(cartItemId, item.quantity - 1);
}

// ==========================================
// 7. REMOVE ITEM LOGIC & MODAL
// ==========================================
function openRemoveModal(cartItemId) {
    itemToRemoveId = cartItemId;
    const modal = document.getElementById("removeModal");
    if (modal) {
        modal.classList.add("active");
        modal.setAttribute("aria-hidden", "false");
    }
}

function closeRemoveModal() {
    itemToRemoveId = null;
    const modal = document.getElementById("removeModal");
    if (modal) {
        modal.classList.remove("active");
        modal.setAttribute("aria-hidden", "true");
    }
}

async function confirmRemoveItem() {
    if (!itemToRemoveId) return;

    if (USE_API) {
        try {
            await removeCartItemAPI(itemToRemoveId);
            currentCart.cartItems = currentCart.cartItems.filter(i => i.id !== itemToRemoveId);
            finishRemoval();
        } catch (error) {
            showToast("Unable to remove item. Try again.", "error");
        }
    } else {
        currentCart.cartItems = currentCart.cartItems.filter(i => i.id !== itemToRemoveId);
        finishRemoval();
    }
}

function finishRemoval() {
    closeRemoveModal();
    showToast("Fish removed from your cart", "success");

    if (currentCart.cartItems.length === 0) {
        showEmptyState();
        updateCartCount();
    } else {
        renderCart();
    }
}

// TODO: Connect to wishlist API when wishlist feature is implemented
function moveToWishlist(cartItemId) {
    showToast("Wishlist functionality coming soon!", "info");
}

// ==========================================
// 8. COUPON & PROMO CODE
// ==========================================
function applyCoupon() {
    const input = document.getElementById("couponInput");
    const message = document.getElementById("couponMessage");
    if (!input || !message) return;

    const code = input.value.trim().toUpperCase();

    // TODO: Connect coupon validation to backend API
    if (code === "AQUARIUM10") {
        discountAmount = 500; // Demo flat discount of LKR 500
        message.className = "coupon-message success";
        message.textContent = "Coupon AQUARIUM10 applied successfully!";
        renderOrderSummary();
    } else if (code === "") {
        message.className = "coupon-message error";
        message.textContent = "Please enter a coupon code.";
    } else {
        message.className = "coupon-message error";
        message.textContent = "Invalid or expired coupon code.";
    }
}

// ==========================================
// 9. CHECKOUT FLOW & AUTHENTICATION
// ==========================================
function proceedToCheckout() {
    if (!currentCart || !currentCart.cartItems || currentCart.cartItems.length === 0) {
        showToast("Your cart is empty!", "warning");
        return;
    }

    const token = localStorage.getItem("token");

    if (!token && USE_API) {
        window.location.href = "login.html?redirect=checkout.html";
    } else {
        window.location.href = "checkout.html";
    }
}

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

// ==========================================
// 10. UI STATE & UTILITY FUNCTIONS
// ==========================================
function updateCartCount() {
    const cartBadge = document.getElementById("cartBadge");
    if (!cartBadge) return;

    let totalQuantity = 0;
    if (currentCart && currentCart.cartItems) {
        totalQuantity = currentCart.cartItems.reduce((sum, item) => sum + item.quantity, 0);
    }
    cartBadge.textContent = totalQuantity;
}

function updateCartHeaderBadge() {
    const badgeText = document.getElementById("cartHeaderItemCount");
    if (!badgeText) return;

    let totalQuantity = 0;
    if (currentCart && currentCart.cartItems) {
        totalQuantity = currentCart.cartItems.reduce((sum, item) => sum + item.quantity, 0);
    }
    badgeText.textContent = `${totalQuantity} ${totalQuantity === 1 ? 'item' : 'items'}`;
}

function getPrimaryFishImage(fish) {
    if (fish && fish.images && fish.images.length > 0) {
        const primary = fish.images.find(img => img.isPrimary === true);
        if (primary) return primary.imageUrl;
        return fish.images[0].imageUrl;
    }
    return "https://images.unsplash.com/photo-1522069169874-c58ec4b76be5?auto=format&fit=crop&w=600&q=80";
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('en-LK', {
        style: 'currency',
        currency: 'LKR',
        maximumFractionDigits: 0
    }).format(amount || 0);
}

function showLoadingState() {
    document.getElementById("skeletonContainer").style.display = "grid";
    document.getElementById("cartContainer").style.display = "none";
    document.getElementById("emptyState").style.display = "none";
    document.getElementById("errorState").style.display = "none";
}

function showEmptyState() {
    document.getElementById("skeletonContainer").style.display = "none";
    document.getElementById("cartContainer").style.display = "none";
    document.getElementById("errorState").style.display = "none";
    document.getElementById("emptyState").style.display = "block";

    document.getElementById("cartHeaderItemCount").textContent = "0 items";
    const cartBadge = document.getElementById("cartBadge");
    if (cartBadge) cartBadge.textContent = "0";
}

function showErrorState() {
    document.getElementById("skeletonContainer").style.display = "none";
    document.getElementById("cartContainer").style.display = "none";
    document.getElementById("emptyState").style.display = "none";
    document.getElementById("errorState").style.display = "block";
}

function showToast(message, type = "info") {
    const container = document.getElementById("toastContainer");
    if (!container) return;

    const toast = document.createElement("div");
    toast.className = `toast ${type}`;

    let icon = "fa-info-circle";
    if (type === "success") icon = "fa-circle-check";
    if (type === "error") icon = "fa-circle-exclamation";
    if (type === "warning") icon = "fa-triangle-exclamation";

    toast.innerHTML = `<i class="fa-solid ${icon}"></i> <span>${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
        toast.style.animation = "toast-in 0.3s reverse forwards";
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}