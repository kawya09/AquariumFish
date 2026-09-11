/**
 * AquaLife Aquarium Store - Checkout JavaScript Module
 * Handles customer authentication checks, mock/API cart integration,
 * delivery/payment selections, form validation, and Spring Boot API submit logic.
 */

// API Configuration
const API_BASE_URL = "http://localhost:8080/api";
// TODO: Update API_BASE_URL for the actual Spring Boot production server.

// Local state variables
let currentCart = null;
let currentCustomer = null;
let currentDeliveryFee = 500.00; // Standard Sri Lanka live fish delivery default
let appliedDiscount = 0.00;

// ==========================================
// MOCK DATA FOR FRONTEND PREVIEW ONLY
// Replace with actual Spring Boot API calls.
// ==========================================
const mockCustomer = {
    id: 1,
    firstName: "Hiruni",
    lastName: "Perera",
    email: "hiruni.perera@example.com",
    phone: "0712345678",
    address: "No 123, Galle Road, Bambalapitiya",
    city: "Colombo",
    postalCode: "00400"
};

const mockCheckoutCart = {
    id: 10,
    status: "ACTIVE",
    cartItems: [
        {
            id: 101,
            quantity: 2,
            unitPrice: 2500.00,
            fish: {
                id: 15,
                fishName: "Blue Halfmoon Betta",
                category: { categoryName: "Betta Fish" },
                images: [{ imageUrl: "https://images.unsplash.com/photo-1522069169874-c58ec4b76be5?w=150&auto=format&fit=crop&q=80", isPrimary: true }]
            }
        },
        {
            id: 102,
            quantity: 1,
            unitPrice: 7500.00,
            fish: {
                id: 22,
                fishName: "Red Turquoise Discus",
                category: { categoryName: "Cichlids" },
                images: [{ imageUrl: "https://images.unsplash.com/photo-1535591273668-578e31182c4f?w=150&auto=format&fit=crop&q=80", isPrimary: true }]
            }
        }
    ]
};

// ==========================================
// INITIALIZATION & AUTHENTICATION
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
    initNavigation();
    checkAuthentication();
    initializeCheckout();
    setupEventListeners();
});

function initNavigation() {
    const hamburgerBtn = document.getElementById("hamburgerBtn");
    const navMenu = document.getElementById("navMenu");
    if (hamburgerBtn && navMenu) {
        hamburgerBtn.addEventListener("click", () => {
            navMenu.classList.toggle("active");
        });
    }
}

function checkAuthentication() {
    const token = localStorage.getItem("token");
    const authBtn = document.getElementById("authBtn");
    const savedAddressWrapper = document.getElementById("savedAddressWrapper");

    if (token) {
        if (authBtn) {
            authBtn.textContent = "My Account";
            authBtn.href = "profile.html";
        }
        if (savedAddressWrapper) {
            savedAddressWrapper.style.display = "block";
        }
    } else {
        // Unauthenticated demo mode notice / redirection logic
        console.warn("User is not authenticated. Previewing in Frontend Demo Mode.");
        // Uncomment line below for production redirect:
        // window.location.href = "login.html?redirect=checkout.html";
    }
}

async function initializeCheckout() {
    showLoadingState();
    try {
        await Promise.all([loadCustomer(), loadCart()]);

        if (!currentCart || !currentCart.cartItems || currentCart.cartItems.length === 0) {
            showEmptyCartState();
            return;
        }

        renderCustomerInformation();
        renderCartItems();
        renderOrderSummary();
        updateCartCount();
        showCheckoutLayout();
        showToast("Order summary updated.", "info");

    } catch (error) {
        console.error("Initialization Error:", error);
        showErrorState();
    }
}

// ==========================================
// DATA FETCHING (API / MOCK)
// ==========================================
async function loadCustomer() {
    const token = localStorage.getItem("token");
    if (token) {
        try {
            // TODO: Replace mock customer data with actual endpoint: GET /api/customers/me
            const response = await fetch(`${API_BASE_URL}/customers/me`, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            if (response.ok) {
                currentCustomer = await response.json();
                return;
            }
        } catch (err) {
            console.warn("Failed to load customer from API, falling back to mock.");
        }
    }
    // Fallback to mock customer for preview
    currentCustomer = mockCustomer;
}

async function loadCart() {
    const token = localStorage.getItem("token");
    if (token) {
        try {
            // TODO: GET /api/cart
            const response = await fetch(`${API_BASE_URL}/cart`, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            if (response.ok) {
                currentCart = await response.json();
                return;
            }
        } catch (err) {
            console.warn("Failed to load cart from API, falling back to mock.");
        }
    }
    // Fallback to mock cart for preview
    currentCart = mockCheckoutCart;
}

// ==========================================
// DOM RENDERING FUNCTIONS
// ==========================================
function renderCustomerInformation() {
    if (!currentCustomer) return;
    document.getElementById("firstName").value = currentCustomer.firstName || "";
    document.getElementById("lastName").value = currentCustomer.lastName || "";
    document.getElementById("email").value = currentCustomer.email || "";
    document.getElementById("phone").value = currentCustomer.phone || "";
    document.getElementById("deliveryAddress").value = currentCustomer.address || "";
    document.getElementById("city").value = currentCustomer.city || "";
    document.getElementById("postalCode").value = currentCustomer.postalCode || "";
}

function renderCartItems() {
    const container = document.getElementById("orderItemsList");
    container.innerHTML = "";

    currentCart.cartItems.forEach(item => {
        const itemSubtotal = item.quantity * item.unitPrice;
        const imgUrl = (item.fish.images && item.fish.images.length > 0)
            ? item.fish.images[0].imageUrl
            : "https://via.placeholder.com/80?text=Fish";

        const itemEl = document.createElement("div");
        itemEl.className = "order-item";
        itemEl.innerHTML = `
            <img src="${imgUrl}" alt="${item.fish.fishName}" class="order-item-img">
            <div class="order-item-details">
                <div class="order-item-title">${escapeHTML(item.fish.fishName)}</div>
                <div class="order-item-category">${escapeHTML(item.fish.category ? item.fish.category.categoryName : 'Aquatic')}</div>
                <div class="order-item-meta">Qty: ${item.quantity} × ${formatCurrency(item.unitPrice)}</div>
            </div>
            <div class="order-item-price">${formatCurrency(itemSubtotal)}</div>
        `;
        container.appendChild(itemEl);
    });
}

function renderOrderSummary() {
    const subtotal = calculateSubtotal();
    const total = calculateEstimatedTotal(subtotal);

    document.getElementById("summarySubtotal").textContent = formatCurrency(subtotal);
    document.getElementById("summaryDelivery").textContent = formatCurrency(currentDeliveryFee);

    const discountRow = document.getElementById("discountRow");
    if (appliedDiscount > 0) {
        discountRow.style.display = "flex";
        document.getElementById("summaryDiscount").textContent = `- ${formatCurrency(appliedDiscount)}`;
    } else {
        discountRow.style.display = "none";
    }

    document.getElementById("summaryTotal").textContent = formatCurrency(total);
}

// ==========================================
// CALCULATIONS & FORMATTING
// ==========================================
function calculateSubtotal() {
    if (!currentCart || !currentCart.cartItems) return 0;
    return currentCart.cartItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
}

function calculateEstimatedTotal(subtotal) {
    return Math.max(0, subtotal + currentDeliveryFee - appliedDiscount);
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('en-LK', {
        style: 'currency',
        currency: 'LKR',
        minimumFractionDigits: 2
    }).format(amount);
}

function updateCartCount() {
    const badge = document.getElementById("cartBadge");
    if (badge && currentCart && currentCart.cartItems) {
        const count = currentCart.cartItems.reduce((acc, item) => acc + item.quantity, 0);
        badge.textContent = count;
    }
}

// ==========================================
// EVENT LISTENERS & FORM HANDLERS
// ==========================================
function setupEventListeners() {
    // Saved Address Checkbox Toggle
    const useSavedAddressCheckbox = document.getElementById("useSavedAddress");
    if (useSavedAddressCheckbox) {
        useSavedAddressCheckbox.addEventListener("change", (e) => {
            if (e.target.checked && currentCustomer) {
                renderCustomerInformation();
                showToast("Saved customer details populated", "info");
            }
        });
    }

    // Delivery Option Selector Cards
    const deliveryOptions = document.querySelectorAll('input[name="deliveryOption"]');
    deliveryOptions.forEach(opt => {
        opt.addEventListener("change", handleDeliveryOptionChange);
    });

    // Payment Option Selector Cards
    const paymentOptions = document.querySelectorAll('input[name="paymentMethod"]');
    paymentOptions.forEach(opt => {
        opt.addEventListener("change", handlePaymentMethodChange);
    });

    // Apply Coupon Code
    const applyCouponBtn = document.getElementById("applyCouponBtn");
    if (applyCouponBtn) {
        applyCouponBtn.addEventListener("click", applyCoupon);
    }

    // Continue / Place Order Button
    const btnContinue = document.getElementById("btnContinueCheckout");
    if (btnContinue) {
        btnContinue.addEventListener("click", handleCheckoutSubmit);
    }
}

function handleDeliveryOptionChange(e) {
    document.querySelectorAll('#deliveryOptionsGroup .radio-card').forEach(card => card.classList.remove('active'));
    e.target.closest('.radio-card').classList.add('active');

    // TODO: Load actual delivery options and pricing from backend
    if (e.target.value === "EXPRESS") {
        currentDeliveryFee = 1200.00;
    } else {
        currentDeliveryFee = 500.00;
    }
    renderOrderSummary();
    showToast("Delivery option updated", "info");
}

function handlePaymentMethodChange(e) {
    document.querySelectorAll('#paymentOptionsGroup .radio-card').forEach(card => card.classList.remove('active'));
    e.target.closest('.radio-card').classList.add('active');
}

function applyCoupon() {
    const codeInput = document.getElementById("couponCode");
    const msgEl = document.getElementById("promoMsg");
    const code = codeInput.value.trim().toUpperCase();

    // TODO: Validate coupon with Spring Boot backend API: POST /api/coupons/validate
    if (code === "AQUA10") {
        const subtotal = calculateSubtotal();
        appliedDiscount = subtotal * 0.10; // 10% discount
        msgEl.className = "promo-msg success";
        msgEl.textContent = "✓ Promo code 'AQUA10' applied (10% OFF)";
        renderOrderSummary();
    } else if (code === "") {
        msgEl.className = "promo-msg error";
        msgEl.textContent = "Please enter a coupon code.";
    } else {
        msgEl.className = "promo-msg error";
        msgEl.textContent = "Invalid or expired promo code.";
    }
}

// ==========================================
// VALIDATION & SUBMISSION FLOW
// ==========================================
function validateCheckout() {
    let isValid = true;
    clearErrors();

    const firstName = document.getElementById("firstName").value.trim();
    const lastName = document.getElementById("lastName").value.trim();
    const email = document.getElementById("email").value.trim();
    const phone = document.getElementById("phone").value.trim();
    const address = document.getElementById("deliveryAddress").value.trim();
    const city = document.getElementById("city").value.trim();
    const termsChecked = document.getElementById("termsCheck").checked;

    if (!firstName) {
        showFieldError("firstNameError", "firstName", "Please enter your first name.");
        isValid = false;
    }

    if (!lastName) {
        showFieldError("lastNameError", "lastName", "Please enter your last name.");
        isValid = false;
    }

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        showFieldError("emailError", "email", "Please enter a valid email address.");
        isValid = false;
    }

    // Sri Lankan Phone Number Format Validation
    // Accepts 0712345678 or +94712345678
    const slPhoneRegex = /^(\+94|0)?7\d{8}$/;
    if (!phone || !slPhoneRegex.test(phone)) {
        showFieldError("phoneError", "phone", "Please enter a valid Sri Lankan phone number (e.g., 0712345678).");
        isValid = false;
    }

    if (!address) {
        showFieldError("addressError", "deliveryAddress", "Please enter your delivery address.");
        isValid = false;
    }

    if (!city) {
        showFieldError("cityError", "city", "Please enter your city.");
        isValid = false;
    }

    if (!termsChecked) {
        showFieldError("termsError", "termsCheck", "You must accept the Terms and Conditions to proceed.");
        isValid = false;
    }

    return isValid;
}

function showFieldError(errorId, inputId, message) {
    const errorEl = document.getElementById(errorId);
    const inputEl = document.getElementById(inputId);
    if (errorEl) errorEl.textContent = message;
    if (inputEl) inputEl.classList.add("is-invalid");
}

function clearErrors() {
    document.querySelectorAll(".error-msg").forEach(el => el.textContent = "");
    document.querySelectorAll(".form-control").forEach(el => el.classList.remove("is-invalid"));
}

async function handleCheckoutSubmit() {
    if (!validateCheckout()) {
        showToast("Please complete all required fields correctly.", "warning");
        return;
    }

    disableCheckoutButton();

    try {
        // Step 1: Validate cart state with backend
        await validateCartWithBackend();

        // Step 2: Submit order payload
        await submitCheckout();

    } catch (error) {
        console.error("Checkout submission failed:", error);
        showToast(error.message || "Unable to process order. Please try again.", "error");
        enableCheckoutButton();
    }
}

async function validateCartWithBackend() {
    // TODO: POST /api/cart/validate
    /*
    const token = localStorage.getItem("token");
    const response = await fetch(`${API_BASE_URL}/cart/validate`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ cartId: currentCart.id })
    });
    if (!response.ok) {
        throw new Error("Cart contains items that are out of stock or updated. Please review your cart.");
    }
    */
    return true; // Mock success
}

async function submitCheckout() {
    const selectedDeliveryOption = document.querySelector('input[name="deliveryOption"]:checked').value;
    const selectedPaymentMethod = document.querySelector('input[name="paymentMethod"]:checked').value;

    /*
      IMPORTANT:
      Final prices, stock, discounts, delivery charges, and total amount
      must ALWAYS be recalculated securely by the Spring Boot backend service.
      Do NOT trust frontend totals!
    */
    const checkoutPayload = {
        deliveryAddress: `${document.getElementById("deliveryAddress").value.trim()}, ${document.getElementById("city").value.trim()}`,
        phone: document.getElementById("phone").value.trim(),
        deliveryOption: selectedDeliveryOption,
        paymentMethod: selectedPaymentMethod,
        couponCode: document.getElementById("couponCode").value.trim() || null
    };

    const token = localStorage.getItem("token");

    // TODO: Send checkout payload to Spring Boot REST API
    /*
    const response = await fetch(`${API_BASE_URL}/orders/checkout`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(checkoutPayload)
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Order checkout failed.");
    }

    const orderResponse = await response.json();
    */

    // Simulated successful backend response structure
    const mockOrderResponse = {
        orderId: 125,
        orderStatus: "PENDING",
        totalAmount: calculateEstimatedTotal(calculateSubtotal()),
        paymentMethod: selectedPaymentMethod
    };

    setTimeout(() => {
        showToast("Order placed successfully! Redirecting...", "success");

        if (selectedPaymentMethod === "CARD") {
            window.location.href = `payment.html?orderId=${mockOrderResponse.orderId}`;
        } else {
            window.location.href = `order-success.html?id=${mockOrderResponse.orderId}`;
        }
    }, 1200);
}

// ==========================================
// UI STATE HELPERS
// ==========================================
function disableCheckoutButton() {
    const btn = document.getElementById("btnContinueCheckout");
    const text = document.getElementById("btnText");
    const icon = document.getElementById("btnIcon");

    if (btn) {
        btn.disabled = true;
        if (text) text.textContent = "Processing Order...";
        if (icon) icon.className = "fa-solid fa-spinner fa-spin";
    }
}

function enableCheckoutButton() {
    const btn = document.getElementById("btnContinueCheckout");
    const text = document.getElementById("btnText");
    const icon = document.getElementById("btnIcon");

    if (btn) {
        btn.disabled = false;
        if (text) text.textContent = "Continue to Payment";
        if (icon) icon.className = "fa-solid fa-arrow-right";
    }
}

function showLoadingState() {
    document.getElementById("checkoutLayout").style.display = "grid";
    document.getElementById("emptyCartState").style.display = "none";
    document.getElementById("errorState").style.display = "none";
}

function showCheckoutLayout() {
    document.getElementById("checkoutLayout").style.display = "grid";
    document.getElementById("emptyCartState").style.display = "none";
    document.getElementById("errorState").style.display = "none";
}

function showEmptyCartState() {
    document.getElementById("checkoutLayout").style.display = "none";
    document.getElementById("emptyCartState").style.display = "block";
    document.getElementById("errorState").style.display = "none";
}

function showErrorState() {
    document.getElementById("checkoutLayout").style.display = "none";
    document.getElementById("emptyCartState").style.display = "none";
    document.getElementById("errorState").style.display = "block";
}

function showToast(message, type = "info") {
    const container = document.getElementById("toastContainer");
    if (!container) return;

    const toast = document.createElement("div");
    toast.className = `toast ${type}`;

    let iconClass = "fa-circle-info";
    if (type === "success") iconClass = "fa-circle-check";
    if (type === "error") iconClass = "fa-circle-xmark";
    if (type === "warning") iconClass = "fa-triangle-exclamation";

    toast.innerHTML = `<i class="fa-solid ${iconClass}"></i> <span>${escapeHTML(message)}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = "0";
        setTimeout(() => toast.remove(), 300);
    }, 3500);
}

function escapeHTML(str) {
    if (!str) return '';
    return str.replace(/[&<>'"]/g,
        tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
    );
}