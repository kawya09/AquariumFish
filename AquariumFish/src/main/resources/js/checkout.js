window.AquariumFish = window.AquariumFish || {};

// Global Configuration
const API_BASE_URL = "http://localhost:8080/api";
const USE_MOCK_DATA = true;
const LOW_STOCK_THRESHOLD = 5;

// Configurable Endpoints (TODO: Adjust routes if Spring Boot controller differs)
const API_ENDPOINTS = {
    cart: `${API_BASE_URL}/cart`,
    customer: `${API_BASE_URL}/customers/me`, // TODO: Change if route is /api/customer/profile
    checkout: `${API_BASE_URL}/orders/checkout`
};

const CART_PLACEHOLDER_IMAGE = "assets/images/fish-placeholder.jpg";

// Centralized State
const checkoutState = {
    cart: null,
    customer: null,
    items: [],
    deliveryMethod: "STANDARD",
    paymentMethod: "COD",
    totals: {
        subtotal: 0,
        deliveryFee: 500.00,
        discount: 0.00,
        tax: 0.00,
        total: 0.00
    },
    loading: false,
    submitting: false,
    completed: false,
    dirty: false,
    error: null,
    initialized: false,
    requestController: null
};

// DOM Selectors Configuration
const SELECTORS = {
    form: "#checkoutForm",
    firstName: "#firstName",
    lastName: "#lastName",
    email: "#email",
    phone: "#phone",
    address: "#deliveryAddress",
    deliveryMethod: "#deliveryMethod",
    paymentMethod: "#paymentMethod",
    items: "#checkoutItems",
    subtotal: "#checkoutSubtotal",
    deliveryFee: "#checkoutDeliveryFee",
    discount: "#checkoutDiscount",
    tax: "#checkoutTax",
    total: "#checkoutTotal",
    placeOrder: "#placeOrderButton",
    loading: "#checkoutLoading",
    empty: "#checkoutEmpty",
    error: "#checkoutError",
    errorMessage: "#checkoutErrorMessage"
};

// Demo Data for Mock Mode
// DEMO DATA ONLY — replace with Spring Boot API integration.
const mockCheckoutData = {
    customer: {
        firstName: "Hiruni",
        lastName: "Kawya",
        email: "hiruni.kawya@example.com",
        phone: "0712345678",
        address: "123 Main Street, Gampaha"
    },
    cart: {
        id: 201,
        status: "ACTIVE",
        items: [
            {
                id: 1,
                quantity: 2,
                unitPrice: 4500.00,
                subtotal: 9000.00,
                fish: {
                    id: 101,
                    fishName: "Blue Betta Halfmoon",
                    price: 4500.00,
                    stockQty: 15,
                    images: [{ imageUrl: "assets/images/fish/betta.jpg", isPrimary: true }]
                }
            },
            {
                id: 2,
                quantity: 1,
                unitPrice: 1200.00,
                subtotal: 1200.00,
                fish: {
                    id: 102,
                    fishName: "Cobra Guppy",
                    price: 1200.00,
                    stockQty: 3, // Low stock example
                    images: [{ imageUrl: "assets/images/fish/guppy.jpg", isPrimary: true }]
                }
            }
        ],
        subtotal: 10200.00,
        deliveryFee: 500.00,
        discount: 0.00,
        tax: 0.00,
        total: 10700.00
    }
};

// Shared Helper Integration / Fallbacks
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
    return new Intl.NumberFormat("en-LK", {
        style: "currency",
        currency: "LKR"
    }).format(amount || 0);
}

function showToast(message, type = "info") {
    if (typeof window.AquariumFish.showToast === "function") {
        window.AquariumFish.showToast(message, type);
        return;
    }
    console.log(`[Toast - ${type}] ${message}`);
}

function updateCartBadgeCount(count) {
    if (typeof window.AquariumFish.updateCartBadge === "function") {
        window.AquariumFish.updateCartBadge(count);
        return;
    }
    const badge = document.querySelector(".cart-badge, [data-cart-badge]");
    if (badge) {
        badge.textContent = count;
        badge.style.display = count > 0 ? "inline-block" : "none";
    }
}

// Authentication Checks
function isAuthenticatedUser() {
    if (typeof window.AquariumFish.isAuthenticated === "function") {
        return window.AquariumFish.isAuthenticated();
    }
    if (typeof window.isAuthenticated === "function") {
        return window.isAuthenticated();
    }
    return !!localStorage.getItem("authToken") || !!sessionStorage.getItem("authToken");
}

function redirectToLogin() {
    const currentUrl = encodeURIComponent(window.location.pathname + window.location.search);
    window.location.href = `login.html?redirect=${currentUrl}`;
}

// Normalization Layer
function normalizeImage(fish) {
    if (!fish) return CART_PLACEHOLDER_IMAGE;
    const imgs = fish.images || fish.fishImages || [];
    if (Array.isArray(imgs) && imgs.length > 0) {
        const primary = imgs.find(img => img.isPrimary === true);
        const targetUrl = primary ? primary.imageUrl : imgs[0].imageUrl;
        if (targetUrl && !targetUrl.startsWith("javascript:") && !targetUrl.startsWith("data:")) {
            return targetUrl;
        }
    }
    if (fish.imageUrl) return fish.imageUrl;
    return CART_PLACEHOLDER_IMAGE;
}

function normalizeCartItem(rawItem) {
    const fish = rawItem.fish || {};
    const quantity = Number(rawItem.quantity) || 1;
    const unitPrice = Number(rawItem.unitPrice || fish.price) || 0;
    const subtotal = Number(rawItem.subtotal) || (quantity * unitPrice);

    return {
        id: rawItem.id || rawItem.cartItemId,
        quantity,
        unitPrice,
        subtotal,
        fish: {
            id: fish.id || fish.fishId,
            fishName: fish.fishName || fish.name || "Aquarium Fish",
            price: Number(fish.price) || unitPrice,
            stockQty: Number(fish.stockQty) !== undefined ? Number(fish.stockQty) : 10,
            primaryImage: normalizeImage(fish)
        }
    };
}

function normalizeCart(response) {
    if (!response) return { items: [], subtotal: 0, deliveryFee: 500, discount: 0, tax: 0, total: 0 };
    const cartObj = response.cart || response.data || response;
    const rawItems = cartObj.items || cartObj.cartItems || (Array.isArray(cartObj) ? cartObj : []);

    const items = Array.isArray(rawItems) ? rawItems.map(normalizeCartItem) : [];
    const subtotal = items.reduce((sum, item) => sum + item.subtotal, 0);

    const deliveryFee = Number(cartObj.deliveryFee) || (checkoutState.deliveryMethod === "EXPRESS" ? 1000.00 : 500.00);
    const discount = Number(cartObj.discount) || 0;
    const tax = Number(cartObj.tax) || 0;
    const total = Number(cartObj.total) || (subtotal + deliveryFee - discount + tax);

    return {
        id: cartObj.id || null,
        status: cartObj.status || "ACTIVE",
        items,
        subtotal,
        deliveryFee,
        discount,
        tax,
        total
    };
}

function extractOrderId(response) {
    if (!response) return null;
    if (typeof response === "number" || typeof response === "string") return response;
    return response.id || response.orderId || (response.data && response.data.id) || (response.order && response.order.id) || null;
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

// Load Checkout Data Sequence
async function loadCheckoutData() {
    if (!isAuthenticatedUser()) {
        redirectToLogin();
        return;
    }

    checkoutState.loading = true;
    checkoutState.error = null;
    renderCheckoutState();

    if (checkoutState.requestController) {
        checkoutState.requestController.abort();
    }
    checkoutState.requestController = new AbortController();

    try {
        let cartResponse, customerResponse;

        if (USE_MOCK_DATA) {
            await new Promise(r => setTimeout(r, 300));
            cartResponse = mockCheckoutData.cart;
            customerResponse = mockCheckoutData.customer;
        } else {
            const [cartRes, custRes] = await Promise.all([
                apiRequest(API_ENDPOINTS.cart, { signal: checkoutState.requestController.signal }),
                apiRequest(API_ENDPOINTS.customer, { signal: checkoutState.requestController.signal }).catch(() => null)
            ]);
            cartResponse = cartRes;
            customerResponse = custRes;
        }

        checkoutState.cart = normalizeCart(cartResponse);
        checkoutState.items = checkoutState.cart.items;
        checkoutState.totals = {
            subtotal: checkoutState.cart.subtotal,
            deliveryFee: checkoutState.cart.deliveryFee,
            discount: checkoutState.cart.discount,
            tax: checkoutState.cart.tax,
            total: checkoutState.cart.total
        };

        if (customerResponse) {
            const cust = customerResponse.customer || customerResponse.data || customerResponse;
            checkoutState.customer = {
                firstName: cust.firstName || "",
                lastName: cust.lastName || "",
                email: cust.email || "",
                phone: cust.phone || "",
                address: cust.address || ""
            };
        }

        populateFormFields();
        syncCartBadge();
    } catch (err) {
        if (err.name === "AbortError") return;
        checkoutState.error = err.message || "Failed to load checkout details.";
    } finally {
        checkoutState.loading = false;
        renderCheckoutState();
    }
}

function syncCartBadge() {
    const totalQty = checkoutState.items.reduce((sum, item) => sum + item.quantity, 0);
    updateCartBadgeCount(totalQty);
    window.dispatchEvent(new CustomEvent("cart:updated", { detail: { count: totalQty } }));
}

function populateFormFields() {
    const cust = checkoutState.customer;
    if (!cust) return;

    const setValueIfEmpty = (selector, value) => {
        const el = document.querySelector(selector);
        if (el && !el.value) {
            el.value = value;
        }
    };

    setValueIfEmpty(SELECTORS.firstName, cust.firstName);
    setValueIfEmpty(SELECTORS.lastName, cust.lastName);
    setValueIfEmpty(SELECTORS.email, cust.email);
    setValueIfEmpty(SELECTORS.phone, cust.phone);
    setValueIfEmpty(SELECTORS.address, cust.address);
}

// Validation
function validateForm() {
    const getVal = (sel) => {
        const el = document.querySelector(sel);
        return el ? el.value.trim() : "";
    };

    const firstName = getVal(SELECTORS.firstName);
    const lastName = getVal(SELECTORS.lastName);
    const phone = getVal(SELECTORS.phone);
    const address = getVal(SELECTORS.address);

    if (!firstName) {
        showToast("First name is required.", "error");
        document.querySelector(SELECTORS.firstName)?.focus();
        return false;
    }
    if (!lastName) {
        showToast("Last name is required.", "error");
        document.querySelector(SELECTORS.lastName)?.focus();
        return false;
    }
    if (!phone || !/^(\+94|0)?[0-9]{9,10}$/.test(phone)) {
        showToast("Please enter a valid phone number.", "error");
        document.querySelector(SELECTORS.phone)?.focus();
        return false;
    }
    if (!address) {
        showToast("Delivery address is required.", "error");
        document.querySelector(SELECTORS.address)?.focus();
        return false;
    }
    return true;
}

// Place Order Execution Flow
async function handlePlaceOrder(e) {
    e.preventDefault();
    if (checkoutState.submitting || checkoutState.loading || checkoutState.completed) return;

    if (checkoutState.items.length === 0) {
        showToast("Your cart is empty.", "error");
        return;
    }

    // Out of stock guard
    const hasOutdatedStock = checkoutState.items.some(item => item.fish.stockQty <= 0);
    if (hasOutdatedStock) {
        showToast("Some items in your cart are out of stock. Please review your cart.", "error");
        return;
    }

    if (!validateForm()) return;

    checkoutState.submitting = true;
    renderCheckoutState();

    const deliveryAddress = document.querySelector(SELECTORS.address)?.value.trim() || "";

    try {
        let orderResponse;

        if (USE_MOCK_DATA) {
            await new Promise(r => setTimeout(r, 600));
            orderResponse = { id: Math.floor(Math.random() * 89999) + 10000 };
        } else {
            // Revalidate cart prior to final order submission
            const latestCartRes = await apiRequest(API_ENDPOINTS.cart);
            const latestCart = normalizeCart(latestCartRes);
            if (latestCart.items.length === 0) {
                throw new Error("Your cart has changed or is empty. Please review your cart.");
            }

            orderResponse = await apiRequest(API_ENDPOINTS.checkout, {
                method: "POST",
                body: JSON.stringify({
                    deliveryAddress,
                    paymentMethod: checkoutState.paymentMethod,
                    deliveryMethod: checkoutState.deliveryMethod
                })
            });
        }

        const orderId = extractOrderId(orderResponse);
        if (!orderId) {
            throw new Error("Order was placed, but order ID could not be verified.");
        }

        checkoutState.completed = true;
        checkoutState.dirty = false;
        updateCartBadgeCount(0);
        window.dispatchEvent(new CustomEvent("cart:updated", { detail: { count: 0 } }));

        if (checkoutState.paymentMethod === "ONLINE") {
            window.location.href = `payment.html?orderId=${encodeURIComponent(orderId)}`;
        } else {
            window.location.href = `order-success.html?orderId=${encodeURIComponent(orderId)}`;
        }
    } catch (err) {
        if (err.status === 409) {
            showToast("Something in your cart has changed. Please review your items.", "error");
            await loadCheckoutData();
        } else {
            showToast(err.message || "We couldn't complete your order right now. Please try again.", "error");
        }
        checkoutState.submitting = false;
        renderCheckoutState();
    }
}

// UI Rendering Logic
function renderCheckoutState() {
    const loadingEl = document.querySelector(SELECTORS.loading);
    const errorEl = document.querySelector(SELECTORS.error);
    const emptyEl = document.querySelector(SELECTORS.empty);
    const formEl = document.querySelector(SELECTORS.form);
    const itemsContainer = document.querySelector(SELECTORS.items);

    if (loadingEl) loadingEl.style.display = checkoutState.loading ? "block" : "none";
    if (errorEl) {
        errorEl.style.display = checkoutState.error ? "block" : "none";
        const msgEl = errorEl.querySelector(SELECTORS.errorMessage) || errorEl;
        if (checkoutState.error) msgEl.textContent = checkoutState.error;
    }

    if (checkoutState.loading || checkoutState.error) {
        if (formEl) formEl.style.display = "none";
        if (emptyEl) emptyEl.style.display = "none";
        return;
    }

    const isEmpty = !checkoutState.items || checkoutState.items.length === 0;

    if (emptyEl) emptyEl.style.display = isEmpty ? "block" : "none";
    if (formEl) formEl.style.display = isEmpty ? "none" : "block";

    if (!isEmpty) {
        renderCartItems(itemsContainer);
        renderTotals();
    }

    const placeOrderBtn = document.querySelector(SELECTORS.placeOrder);
    if (placeOrderBtn) {
        placeOrderBtn.disabled = checkoutState.submitting || isEmpty;
        placeOrderBtn.textContent = checkoutState.submitting ? "Processing Order..." : "Place Order";
    }
}

function renderCartItems(container) {
    if (!container) return;

    const fragment = document.createDocumentFragment();
    checkoutState.items.forEach(item => {
        const row = document.createElement("div");
        row.className = "checkout-item-row";

        const isLowStock = item.fish.stockQty > 0 && item.fish.stockQty <= LOW_STOCK_THRESHOLD;
        const stockBadge = isLowStock ? `<span class="stock-warning">Only ${item.fish.stockQty} left</span>` : "";

        row.innerHTML = `
            <div class="checkout-item-image">
                <img src="${escapeHtml(item.fish.primaryImage)}" alt="${escapeHtml(item.fish.fishName)}" loading="lazy" />
            </div>
            <div class="checkout-item-details">
                <h4>${escapeHtml(item.fish.fishName)}</h4>
                <p>Qty: ${item.quantity} × ${formatCurrency(item.unitPrice)}</p>
                ${stockBadge}
            </div>
            <div class="checkout-item-subtotal">
                ${formatCurrency(item.subtotal)}
            </div>
        `;
        fragment.appendChild(row);
    });

    container.innerHTML = "";
    container.appendChild(fragment);
}

function renderTotals() {
    const subtotalEl = document.querySelector(SELECTORS.subtotal);
    const deliveryEl = document.querySelector(SELECTORS.deliveryFee);
    const discountEl = document.querySelector(SELECTORS.discount);
    const taxEl = document.querySelector(SELECTORS.tax);
    const totalEl = document.querySelector(SELECTORS.total);

    const totals = checkoutState.totals;
    if (subtotalEl) subtotalEl.textContent = formatCurrency(totals.subtotal);
    if (deliveryEl) deliveryEl.textContent = formatCurrency(totals.deliveryFee);
    if (discountEl) discountEl.textContent = `-${formatCurrency(totals.discount)}`;
    if (taxEl) taxEl.textContent = formatCurrency(totals.tax);
    if (totalEl) totalEl.textContent = formatCurrency(totals.total);
}

// Event Delegation & Listeners Setup
function initEventListeners() {
    const formEl = document.querySelector(SELECTORS.form);
    if (formEl) {
        formEl.addEventListener("submit", handlePlaceOrder);
        formEl.addEventListener("input", () => {
            checkoutState.dirty = true;
        });
    }

    const deliveryMethodEl = document.querySelector(SELECTORS.deliveryMethod);
    if (deliveryMethodEl) {
        deliveryMethodEl.addEventListener("change", (e) => {
            const method = e.target.value;
            checkoutState.deliveryMethod = method;
            checkoutState.totals.deliveryFee = method === "EXPRESS" ? 1000.00 : 500.00;
            checkoutState.totals.total = checkoutState.totals.subtotal + checkoutState.totals.deliveryFee - checkoutState.totals.discount + checkoutState.totals.tax;
            renderTotals();
        });
    }

    const paymentMethodEl = document.querySelector(SELECTORS.paymentMethod);
    if (paymentMethodEl) {
        paymentMethodEl.addEventListener("change", (e) => {
            checkoutState.paymentMethod = e.target.value;
        });
    }

    const emptyEl = document.querySelector(SELECTORS.empty);
    if (emptyEl) {
        const continueShoppingBtn = emptyEl.querySelector("button, a") || emptyEl;
        continueShoppingBtn.addEventListener("click", (e) => {
            e.preventDefault();
            window.location.href = "fish.html";
        });
    }

    const errorEl = document.querySelector(SELECTORS.error);
    if (errorEl) {
        const retryBtn = errorEl.querySelector("button") || errorEl;
        retryBtn.addEventListener("click", () => loadCheckoutData());
    }

    // Visibility Change Refresh
    document.addEventListener("visibilitychange", () => {
        if (document.visibilityState === "visible" && !checkoutState.completed) {
            loadCheckoutData();
        }
    });

    // Unsaved Changes Guard
    window.addEventListener("beforeunload", (e) => {
        if (checkoutState.dirty && !checkoutState.completed) {
            e.preventDefault();
            e.returnValue = "";
        }
    });
}

// Page Initialization Guard
function initCheckoutPage() {
    const path = window.location.pathname.toLowerCase();
    if (!path.includes("checkout.html")) {
        return;
    }

    if (!isAuthenticatedUser()) {
        redirectToLogin();
        return;
    }

    if (checkoutState.initialized) return;
    checkoutState.initialized = true;

    initEventListeners();
    loadCheckoutData();
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initCheckoutPage);
} else {
    initCheckoutPage();
}

// Public API Exposure
window.AquariumFish.checkout = {
    refresh: loadCheckoutData,
    getState: () => ({ ...checkoutState })
};