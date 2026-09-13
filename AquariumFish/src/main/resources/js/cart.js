/**
 * js/cart.js
 * Customer-facing shopping cart module for the Aquarium Fish Spring Boot e-commerce frontend.
 */

(function () {
    if (window.__aquariumFishCartInitialized) {
        return;
    }
    window.__aquariumFishCartInitialized = true;

    // Namespace setup
    window.AquariumFish = window.AquariumFish || {};

    // Global Configuration
    const API_BASE_URL = "http://localhost:8080/api";
    const USE_MOCK_DATA = true;
    const LOW_STOCK_THRESHOLD = 5;

    const CART_ENDPOINT = `${API_BASE_URL}/cart`;
    const CART_ITEMS_ENDPOINT = `${API_BASE_URL}/cart/items`;
    const CART_PLACEHOLDER = "assets/images/fish-placeholder.jpg";

    // Centralized State Object
    const cartState = {
        cart: null,
        cartItems: [],
        loading: false,
        updatingItemId: null,
        removingItemId: null,
        error: null,
        lastUpdated: null,
        isInitialized: false,
        requestController: null
    };

    // DOM Selectors Configuration
    const SELECTORS = {
        cartItems: "#cartItems",
        cartSubtotal: "#cartSubtotal",
        cartDeliveryFee: "#cartDeliveryFee",
        cartDiscount: "#cartDiscount",
        cartTax: "#cartTax",
        cartTotal: "#cartTotal",
        checkoutButton: "#checkoutButton",
        continueShoppingButton: "#continueShoppingButton",
        clearCartButton: "#clearCartButton",
        cartEmpty: "#cartEmpty",
        cartLoading: "#cartLoading",
        cartError: "#cartError",
        cartErrorMessage: "#cartErrorMessage"
    };

    // Demo / Mock Data
    const mockCartData = {
        id: 101,
        createdDate: "2026-06-01T10:30:00Z",
        status: "ACTIVE",
        items: [
            {
                id: 1,
                quantity: 2,
                unitPrice: 4500.00,
                subtotal: 9000.00,
                fish: {
                    id: 1,
                    fishName: "Blue Betta Halfmoon",
                    description: "Vibrant blue halfmoon betta fish.",
                    price: 4500.00,
                    stockQty: 12,
                    category: { id: 1, categoryName: "Betta" },
                    breed: { id: 1, breedName: "Halfmoon" },
                    size: { id: 2, sizeName: "Medium" },
                    color: { id: 1, colorName: "Blue" },
                    seller: { shopName: "Demo Aqua Shop" },
                    images: [{ id: 1, imageUrl: "assets/images/fish/demo-betta.jpg", isPrimary: true }]
                }
            },
            {
                id: 2,
                quantity: 3,
                unitPrice: 1200.00,
                subtotal: 3600.00,
                fish: {
                    id: 3,
                    fishName: "Cobra Guppy",
                    description: "Active cobra pattern guppy fish.",
                    price: 1200.00,
                    stockQty: 3, // Low stock demo item
                    category: { id: 3, categoryName: "Guppy" },
                    breed: { id: 5, breedName: "Cobra Guppy" },
                    size: { id: 1, sizeName: "Small" },
                    color: { id: 6, colorName: "Orange" },
                    seller: { shopName: "Demo Aqua Shop" },
                    images: [{ id: 3, imageUrl: "assets/images/fish/demo-guppy.jpg", isPrimary: true }]
                }
            }
        ],
        deliveryFee: 500.00,
        discount: 0.00,
        tax: 0.00
    };

    // Shared Helper Fallbacks
    function escapeHtml(str) {
        if (typeof window.AquariumFish.escapeHtml === "function") {
            return window.AquariumFish.escapeHtml(str);
        }
        return String(str || "").replace(/[&<>'"]/g,
            tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
        );
    }

    function formatCurrency(amount) {
        if (typeof window.AquariumFish.formatCurrency === "function") {
            return window.AquariumFish.formatCurrency(amount);
        }
        return new Intl.NumberFormat('en-LK', {
            style: 'currency',
            currency: 'LKR'
        }).format(amount || 0);
    }

    function showToast(message, type = "info") {
        if (typeof window.AquariumFish.showToast === "function") {
            window.AquariumFish.showToast(message, type);
            return;
        }
        console.log(`[Toast - ${type}] ${message}`);
    }

    function updateGlobalCartBadge(count) {
        if (typeof window.AquariumFish.updateCartBadge === "function") {
            window.AquariumFish.updateCartBadge(count);
            return;
        }
        // Fallback badge update if element exists
        const badgeEl = document.querySelector(".cart-badge, [data-cart-badge]");
        if (badgeEl) {
            badgeEl.textContent = count;
            badgeEl.style.display = count > 0 ? "inline-block" : "none";
        }
    }

    // Authentication Checks
    function checkAuthentication() {
        if (typeof window.AquariumFish.isAuthenticated === "function") {
            return window.AquariumFish.isAuthenticated();
        }
        if (typeof window.isAuthenticated === "function") {
            return window.isAuthenticated();
        }
        // Fallback inspection of local storage / cookies if no helper exists
        return !!localStorage.getItem("authToken") || !!sessionStorage.getItem("authToken");
    }

    function redirectToLogin() {
        const currentUrl = encodeURIComponent(window.location.pathname + window.location.search);
        window.location.href = `login.html?redirect=${currentUrl}`;
    }

    // Normalization Helpers
    function normalizeImage(fish) {
        if (!fish) return CART_PLACEHOLDER;
        const images = fish.images || fish.fishImages || [];
        if (Array.isArray(images) && images.length > 0) {
            const primary = images.find(img => img.isPrimary === true);
            const target = primary ? primary.imageUrl : images[0].imageUrl;
            if (target && !target.startsWith("javascript:") && !target.startsWith("data:text/html")) {
                return target;
            }
        }
        if (fish.imageUrl) return fish.imageUrl;
        return CART_PLACEHOLDER;
    }

    function normalizeCartItem(rawItem) {
        const fish = rawItem.fish || {};
        return {
            id: rawItem.id || rawItem.cartItemId,
            quantity: Number(rawItem.quantity) || 1,
            unitPrice: Number(rawItem.unitPrice || fish.price) || 0,
            subtotal: Number(rawItem.subtotal) || ((Number(rawItem.quantity) || 1) * (Number(rawItem.unitPrice || fish.price) || 0)),
            fish: {
                id: fish.id || fish.fishId,
                fishName: fish.fishName || fish.name || "Aquarium Fish",
                description: fish.description || "",
                price: Number(fish.price) || 0,
                stockQty: Number(fish.stockQty) !== undefined ? Number(fish.stockQty) : 10,
                category: fish.category || { categoryName: "" },
                breed: fish.breed || { breedName: "" },
                size: fish.size || { sizeName: "" },
                color: fish.color || { colorName: "" },
                seller: fish.seller || { shopName: "" },
                primaryImage: normalizeImage(fish)
            }
        };
    }

    function normalizeCartResponse(response) {
        if (!response) return { items: [], subtotal: 0, deliveryFee: 0, discount: 0, tax: 0, total: 0 };
        const rawCart = response.cart || response.data || response;
        const rawItems = rawCart.items || rawCart.cartItems || (Array.isArray(rawCart) ? rawCart : []);

        const items = Array.isArray(rawItems) ? rawItems.map(normalizeCartItem) : [];
        const subtotal = items.reduce((sum, item) => sum + item.subtotal, 0);
        const deliveryFee = Number(rawCart.deliveryFee) || (subtotal > 0 ? 500.00 : 0);
        const discount = Number(rawCart.discount) || 0;
        const tax = Number(rawCart.tax) || 0;
        const total = Number(rawCart.total) || (subtotal + deliveryFee - discount + tax);

        return {
            id: rawCart.id || null,
            createdDate: rawCart.createdDate || null,
            status: rawCart.status || "ACTIVE",
            customer: rawCart.customer || null,
            items,
            subtotal,
            deliveryFee,
            discount,
            tax,
            total
        };
    }

    // API Request Wrapper
    async function apiRequest(url, options = {}) {
        const headers = {
            "Content-Type": "application/json",
            ...(options.headers || {})
        };

        const token = localStorage.getItem("authToken") || sessionStorage.getItem("authToken");
        if (token) {
            headers["Authorization"] = `Bearer ${token}`;
        }

        const response = await fetch(url, {
            ...options,
            headers,
            credentials: "omit"
        });

        if (response.status === 401) {
            redirectToLogin();
            throw new Error("Unauthorized");
        }

        let data = null;
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
            data = await response.json();
        } else {
            data = await response.text();
        }

        if (!response.ok) {
            const err = new Error(typeof data === "string" ? data : (data.message || data.error || "API request failed"));
            err.status = response.status;
            err.data = data;
            throw err;
        }

        return data;
    }

    // Load Cart Data
    async function loadCart() {
        if (!checkAuthentication()) {
            redirectToLogin();
            return;
        }

        cartState.loading = true;
        cartState.error = null;
        renderCartState();

        if (cartState.requestController) {
            cartState.requestController.abort();
        }
        cartState.requestController = new AbortController();

        try {
            let rawResponse;
            if (USE_MOCK_DATA) {
                await new Promise(r => setTimeout(r, 350)); // simulate network lag
                rawResponse = mockCartData;
            } else {
                // TODO: Confirm the exact Spring Boot cart endpoint if different from GET /api/cart
                rawResponse = await apiRequest(CART_ENDPOINT, {
                    signal: cartState.requestController.signal
                });
            }

            cartState.cart = normalizeCartResponse(rawResponse);
            cartState.cartItems = cartState.cart.items;
            cartState.lastUpdated = new Date();
            dispatchCartUpdatedEvent();
        } catch (err) {
            if (err.name === "AbortError") return;
            cartState.error = err.message || "We couldn't load your cart.";
        } finally {
            cartState.loading = false;
            renderCartState();
        }
    }

    // Dispatch Event for Cross-Module Sync
    function dispatchCartUpdatedEvent() {
        const totalQty = cartState.cartItems.reduce((acc, item) => acc + item.quantity, 0);
        updateGlobalCartBadge(totalQty);
        window.dispatchEvent(new CustomEvent('cart:updated', {
            detail: { count: totalQty, cart: cartState.cart }
        }));
    }

    // Quantity Updates
    async function updateItemQuantity(cartItemId, newQuantity) {
        const item = cartState.cartItems.find(i => String(i.id) === String(cartItemId));
        if (!item) return;

        if (newQuantity < 1) {
            removeItem(cartItemId);
            return;
        }

        if (newQuantity > item.fish.stockQty) {
            showToast(`Only ${item.fish.stockQty} items available in stock.`, "error");
            renderCartState();
            return;
        }

        cartState.updatingItemId = cartItemId;
        renderCartState();

        try {
            if (USE_MOCK_DATA) {
                await new Promise(r => setTimeout(r, 250));
                item.quantity = newQuantity;
                item.subtotal = item.quantity * item.unitPrice;
                // Recalculate mock totals
                cartState.cart.subtotal = cartState.cartItems.reduce((sum, i) => sum + i.subtotal, 0);
                cartState.cart.total = cartState.cart.subtotal + cartState.cart.deliveryFee - cartState.cart.discount + cartState.cart.tax;
            } else {
                // TODO: Confirm Spring Boot PUT /api/cart/items/{cartItemId} endpoint contract
                const response = await apiRequest(`${CART_ITEMS_ENDPOINT}/${cartItemId}`, {
                    method: "PUT",
                    body: JSON.stringify({ quantity: newQuantity })
                });
                cartState.cart = normalizeCartResponse(response);
                cartState.cartItems = cartState.cart.items;
            }
            showToast("Cart updated successfully.", "success");
            dispatchCartUpdatedEvent();
        } catch (err) {
            if (err.status === 409) {
                showToast("The stock for this fish has changed. Your cart has been refreshed.", "error");
                await loadCart();
                return;
            }
            showToast(err.message || "Failed to update quantity.", "error");
        } finally {
            cartState.updatingItemId = null;
            renderCartState();
        }
    }

    // Remove Item
    async function removeItem(cartItemId) {
        cartState.removingItemId = cartItemId;
        renderCartState();

        try {
            if (USE_MOCK_DATA) {
                await new Promise(r => setTimeout(r, 300));
                cartState.cartItems = cartState.cartItems.filter(i => String(i.id) !== String(cartItemId));
                cartState.cart.items = cartState.cartItems;
                cartState.cart.subtotal = cartState.cartItems.reduce((sum, i) => sum + i.subtotal, 0);
                cartState.cart.total = cartState.cartItems.length > 0 ? cartState.cart.subtotal + cartState.cart.deliveryFee : 0;
            } else {
                // TODO: Confirm Spring Boot DELETE /api/cart/items/{cartItemId} endpoint contract
                const response = await apiRequest(`${CART_ITEMS_ENDPOINT}/${cartItemId}`, {
                    method: "DELETE"
                });
                cartState.cart = normalizeCartResponse(response);
                cartState.cartItems = cartState.cart.items;
            }
            showToast("Item removed from cart.", "info");
            dispatchCartUpdatedEvent();
        } catch (err) {
            showToast(err.message || "Failed to remove item.", "error");
        } finally {
            cartState.removingItemId = null;
            renderCartState();
        }
    }

    // Clear Cart
    async function clearCart() {
        if (!confirm("Are you sure you want to clear your entire cart?")) return;

        cartState.loading = true;
        renderCartState();

        try {
            if (USE_MOCK_DATA) {
                await new Promise(r => setTimeout(r, 300));
                cartState.cartItems = [];
                cartState.cart.items = [];
                cartState.cart.subtotal = 0;
                cartState.cart.deliveryFee = 0;
                cartState.cart.total = 0;
            } else {
                // TODO: Confirm Spring Boot DELETE /api/cart/items endpoint contract
                const response = await apiRequest(CART_ITEMS_ENDPOINT, {
                    method: "DELETE"
                });
                cartState.cart = normalizeCartResponse(response);
                cartState.cartItems = cartState.cart.items;
            }
            showToast("Cart cleared.", "info");
            dispatchCartUpdatedEvent();
        } catch (err) {
            showToast(err.message || "Failed to clear cart.", "error");
        } finally {
            cartState.loading = false;
            renderCartState();
        }
    }

    // UI Rendering Architecture
    function renderCartState() {
        const loadingEl = document.querySelector(SELECTORS.cartLoading);
        const errorEl = document.querySelector(SELECTORS.cartError);
        const emptyEl = document.querySelector(SELECTORS.cartEmpty);
        const itemsContainer = document.querySelector(SELECTORS.cartItems);

        // Visibility Toggles
        if (loadingEl) loadingEl.style.display = cartState.loading ? "block" : "none";
        if (errorEl) {
            errorEl.style.display = cartState.error ? "block" : "none";
            const msgEl = errorEl.querySelector(SELECTORS.cartErrorMessage) || errorEl;
            if (cartState.error) msgEl.textContent = cartState.error;
        }

        if (cartState.loading || cartState.error) {
            if (itemsContainer) itemsContainer.style.display = "none";
            if (emptyEl) emptyEl.style.display = "none";
            return;
        }

        const isEmpty = !cartState.cartItems || cartState.cartItems.length === 0;

        if (emptyEl) emptyEl.style.display = isEmpty ? "block" : "none";
        if (itemsContainer) itemsContainer.style.display = isEmpty ? "none" : "block";

        if (!isEmpty) {
            renderCartItems(itemsContainer);
            renderCartSummary();
        }
    }

    function renderCartItems(container) {
        if (!container) return;

        const fragment = document.createDocumentFragment();
        cartState.cartItems.forEach(item => {
            const row = document.createElement("div");
            row.className = "cart-item-row";
            row.setAttribute("data-cart-item-id", item.id);

            const isUpdating = cartState.updatingItemId === item.id;
            const isRemoving = cartState.removingItemId === item.id;
            const stock = item.fish.stockQty;

            let stockBadge = `<span class="badge badge-success">In Stock</span>`;
            if (stock <= 0) {
                stockBadge = `<span class="badge badge-danger">Out of Stock</span>`;
            } else if (stock <= LOW_STOCK_THRESHOLD) {
                stockBadge = `<span class="badge badge-warning">Only ${stock} left</span>`;
            }

            row.innerHTML = `
                <div class="cart-item-image">
                    <img src="${escapeHtml(item.fish.primaryImage)}" alt="${escapeHtml(item.fish.fishName)}" loading="lazy" />
                </div>
                <div class="cart-item-details">
                    <h3 class="cart-item-title">
                        <a href="fish-details.html?id=${item.fish.id}">${escapeHtml(item.fish.fishName)}</a>
                    </h3>
                    <div class="cart-item-meta">
                        <span>Category: ${escapeHtml(item.fish.category.categoryName || "General")}</span> | 
                        <span>Size: ${escapeHtml(item.fish.size.sizeName || "Standard")}</span>
                    </div>
                    <div class="cart-item-stock">
                        ${stockBadge}
                    </div>
                </div>
                <div class="cart-item-price">
                    ${formatCurrency(item.unitPrice)}
                </div>
                <div class="cart-item-quantity">
                    <div class="quantity-controls">
                        <button class="btn-qty" data-action="decrease" data-cart-item-id="${item.id}" ${isUpdating || stock <= 0 ? "disabled" : ""} aria-label="Decrease quantity">−</button>
                        <input type="number" class="qty-input" value="${item.quantity}" min="1" max="${stock}" data-action="quantity" data-cart-item-id="${item.id}" ${isUpdating || stock <= 0 ? "disabled" : ""} aria-label="Quantity" />
                        <button class="btn-qty" data-action="increase" data-cart-item-id="${item.id}" ${isUpdating || stock <= 0 || item.quantity >= stock ? "disabled" : ""} aria-label="Increase quantity">+</button>
                    </div>
                </div>
                <div class="cart-item-subtotal">
                    ${formatCurrency(item.subtotal)}
                </div>
                <div class="cart-item-actions">
                    <button class="btn-remove" data-action="remove" data-cart-item-id="${item.id}" ${isRemoving ? "disabled" : ""} aria-label="Remove item">
                        ${isRemoving ? "Removing..." : "Remove"}
                    </button>
                </div>
            `;
            fragment.appendChild(row);
        });

        container.innerHTML = "";
        container.appendChild(fragment);
    }

    function renderCartSummary() {
        const subtotalEl = document.querySelector(SELECTORS.cartSubtotal);
        const deliveryEl = document.querySelector(SELECTORS.cartDeliveryFee);
        const discountEl = document.querySelector(SELECTORS.cartDiscount);
        const taxEl = document.querySelector(SELECTORS.cartTax);
        const totalEl = document.querySelector(SELECTORS.cartTotal);
        const checkoutBtn = document.querySelector(SELECTORS.checkoutButton);

        const cart = cartState.cart;
        if (!cart) return;

        if (subtotalEl) subtotalEl.textContent = formatCurrency(cart.subtotal);
        if (deliveryEl) deliveryEl.textContent = formatCurrency(cart.deliveryFee);
        if (discountEl) discountEl.textContent = `-${formatCurrency(cart.discount)}`;
        if (taxEl) taxEl.textContent = formatCurrency(cart.tax);
        if (totalEl) totalEl.textContent = formatCurrency(cart.total);

        if (checkoutBtn) {
            const hasOutOfStock = cartState.cartItems.some(i => i.fish.stockQty <= 0 || i.quantity > i.fish.stockQty);
            checkoutBtn.disabled = cartState.cartItems.length === 0 || hasOutOfStock;
        }
    }

    // Event Listeners Setup
    function initEventListeners() {
        const itemsContainer = document.querySelector(SELECTORS.cartItems);
        if (itemsContainer) {
            itemsContainer.addEventListener("click", (e) => {
                const btn = e.target.closest("button[data-action]");
                if (!btn || btn.disabled) return;

                const action = btn.getAttribute("data-action");
                const cartItemId = btn.getAttribute("data-cart-item-id");
                const item = cartState.cartItems.find(i => String(i.id) === String(cartItemId));
                if (!item) return;

                if (action === "increase") {
                    updateItemQuantity(cartItemId, item.quantity + 1);
                } else if (action === "decrease") {
                    updateItemQuantity(cartItemId, item.quantity - 1);
                } else if (action === "remove") {
                    removeItem(cartItemId);
                }
            });

            // Debounced direct input handling for quantity fields
            let debounceTimer = null;
            itemsContainer.addEventListener("input", (e) => {
                const input = e.target.closest("input[data-action='quantity']");
                if (!input) return;

                const cartItemId = input.getAttribute("data-cart-item-id");
                const item = cartState.cartItems.find(i => String(i.id) === String(cartItemId));
                if (!item) return;

                clearTimeout(debounceTimer);
                debounceTimer = setTimeout(() => {
                    const val = parseInt(input.value, 10);
                    if (isNaN(val) || val < 1) {
                        input.value = item.quantity;
                        return;
                    }
                    if (val > item.fish.stockQty) {
                        showToast(`Maximum available stock is ${item.fish.stockQty}.`, "error");
                        input.value = item.fish.stockQty;
                        updateItemQuantity(cartItemId, item.fish.stockQty);
                        return;
                    }
                    if (val !== item.quantity) {
                        updateItemQuantity(cartItemId, val);
                    }
                }, 400);
            });
        }

        const clearBtn = document.querySelector(SELECTORS.clearCartButton);
        if (clearBtn) {
            clearBtn.addEventListener("click", clearCart);
        }

        const checkoutBtn = document.querySelector(SELECTORS.checkoutButton);
        if (checkoutBtn) {
            checkoutBtn.addEventListener("click", (e) => {
                e.preventDefault();
                if (cartState.cartItems.length === 0) return;
                window.location.href = "checkout.html";
            });
        }

        const continueBtn = document.querySelector(SELECTORS.continueShoppingButton);
        if (continueBtn) {
            continueBtn.addEventListener("click", (e) => {
                e.preventDefault();
                window.location.href = "fish.html";
            });
        }

        const errorEl = document.querySelector(SELECTORS.cartError);
        if (errorEl) {
            const retryBtn = errorEl.querySelector("button") || errorEl;
            retryBtn.addEventListener("click", () => loadCart());
        }

        // Tab visibility sync to catch inventory updates
        document.addEventListener("visibilitychange", () => {
            if (document.visibilityState === "visible") {
                const now = new Date();
                if (!cartState.lastUpdated || (now - cartState.lastUpdated > 60000)) {
                    loadCart();
                }
            }
        });
    }

    // Page Initialization Guard
    function initCartPage() {
        const path = window.location.pathname.toLowerCase();
        if (!path.includes("cart.html")) {
            return;
        }

        if (!checkAuthentication()) {
            redirectToLogin();
            return;
        }

        initEventListeners();
        loadCart();
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", initCartPage);
    } else {
        initCartPage();
    }

    // Public Module API Exposure
    window.AquariumFish.cart = {
        load: loadCart,
        refresh: loadCart,
        getState: () => ({ ...cartState })
    };

})();