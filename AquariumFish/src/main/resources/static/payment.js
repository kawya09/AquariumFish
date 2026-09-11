/**
 * AquaLife Aquarium Store - Payment JavaScript Module
 * Handles payment method choices, secure backend communication, tokenization integration,
 * order verification, status polling, and error recovery flows.
 */

// ==========================================
// CONFIGURATION
// ==========================================
const API_BASE_URL = "http://localhost:8080/api";
// TODO: Update API_BASE_URL for the actual Spring Boot production environment.

// Maximum polling configuration for asynchronous gateways
const MAX_POLL_ATTEMPTS = 10;
const POLL_INTERVAL_MS = 3000;

// ==========================================
// STATE MANAGEMENT
// ==========================================
let currentOrder = null;
let selectedPaymentMethod = "CARD"; // Default selected method
let isProcessing = false;
let pollingTimer = null;

// ==========================================
// MOCK DATA FOR FRONTEND PREVIEW ONLY
// Replace with actual Spring Boot API responses.
// ==========================================
const mockOrderDetails = {
    id: 125,
    orderStatus: "PENDING_PAYMENT",
    orderDate: "2026-03-31T10:30:00",
    deliveryFee: 500.00,
    discountAmount: 0.00,
    totalAmount: 9100.00,
    customer: {
        id: 1,
        firstName: "Hiruni",
        lastName: "Perera",
        email: "hiruni.perera@example.com"
    },
    payment: {
        id: 5001,
        paymentMethod: "CARD",
        paymentStatus: "PENDING",
        amount: 9100.00
    },
    orderItems: [
        {
            id: 1,
            quantity: 2,
            unitPrice: 2500.00,
            subtotal: 5000.00,
            fish: {
                id: 15,
                fishName: "Blue Halfmoon Betta",
                category: "Betta Fish",
                images: [
                    {
                        imageUrl: "https://images.unsplash.com/photo-1522069169874-c58ec4b76be5?w=150&auto=format&fit=crop&q=80",
                        isPrimary: true
                    }
                ]
            }
        },
        {
            id: 2,
            quantity: 3,
            unitPrice: 1200.00,
            subtotal: 3600.00,
            fish: {
                id: 20,
                fishName: "Red Guppy",
                category: "Livebearers",
                images: [
                    {
                        imageUrl: "https://images.unsplash.com/photo-1535591273668-578e31182c4f?w=150&auto=format&fit=crop&q=80",
                        isPrimary: true
                    }
                ]
            }
        }
    ]
};

// ==========================================
// INITIALIZATION
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
    initNavigation();
    checkAuthentication();
    initializePayment();
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

// ==========================================
// URL & AUTHENTICATION
// ==========================================
function getOrderIdFromUrl() {
    const params = new URLSearchParams(window.location.search);
    return params.get("orderId");
}

function checkAuthentication() {
    const token = localStorage.getItem("token");
    const authBtn = document.getElementById("authBtn");

    if (token) {
        if (authBtn) {
            authBtn.textContent = "My Account";
            authBtn.href = "profile.html";
        }
    } else {
        console.warn("User is not authenticated. Previewing in Frontend Demo Mode.");
        // Production redirect logic:
        // const orderId = getOrderIdFromUrl();
        // window.location.href = `login.html?redirect=payment.html?orderId=${orderId}`;
    }
}

async function initializePayment() {
    const orderId = getOrderIdFromUrl();

    if (!orderId && !isDemoMode()) {
        showInvalidOrderState();
        return;
    }

    showLoadingState();

    try {
        currentOrder = await fetchOrderFromAPI(orderId || "125");

        if (!currentOrder) {
            showErrorState();
            return;
        }

        renderOrderDetails();
        renderOrderItems();
        renderPaymentSummary();
        showPaymentLayout();

    } catch (error) {
        console.error("Initialization Error:", error);
        showErrorState();
    }
}

function isDemoMode() {
    return !localStorage.getItem("token");
}

// ==========================================
// API FUNCTIONS
// ==========================================
async function apiRequest(endpoint, options = {}) {
    const token = localStorage.getItem("token");
    const headers = {
        "Content-Type": "application/json",
        ...(token ? { "Authorization": `Bearer ${token}` } : {}),
        ...options.headers
    };

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `API Request failed with status ${response.status}`);
    }

    return response.json();
}

async function fetchOrderFromAPI(orderId) {
    // TODO: GET /api/orders/{orderId}
    // IMPORTANT: Backend must verify that Authenticated Customer == Order Customer
    try {
        if (!isDemoMode()) {
            return await apiRequest(`/orders/${orderId}`);
        }
    } catch (err) {
        console.warn("Could not fetch real order, loading mock order details.");
    }
    return mockOrderDetails;
}

// ==========================================
// ORDER RENDERING
// ==========================================
function renderOrderDetails() {
    document.getElementById("orderIdDisplay").textContent = `Order #${currentOrder.id}`;

    const badge = document.getElementById("paymentStatusBadge");
    if (badge && currentOrder.payment) {
        const status = currentOrder.payment.paymentStatus;
        if (status === "PAID" || status === "SUCCESS") {
            badge.className = "status-badge status-paid";
            badge.innerHTML = `<i class="fa-solid fa-circle-check"></i> Payment Completed`;
        } else if (status === "FAILED") {
            badge.className = "status-badge status-failed";
            badge.innerHTML = `<i class="fa-solid fa-circle-xmark"></i> Payment Failed`;
        } else {
            badge.className = "status-badge status-pending";
            badge.innerHTML = `<i class="fa-solid fa-clock"></i> Pending Payment`;
        }
    }
}

function renderOrderItems() {
    const container = document.getElementById("orderItemsList");
    container.innerHTML = "";

    if (!currentOrder.orderItems || currentOrder.orderItems.length === 0) {
        container.innerHTML = "<p class='text-muted'>No items found in this order.</p>";
        return;
    }

    currentOrder.orderItems.forEach(item => {
        const itemSubtotal = item.subtotal || (item.quantity * item.unitPrice);
        const imgUrl = (item.fish.images && item.fish.images.length > 0)
            ? item.fish.images[0].imageUrl
            : "https://via.placeholder.com/80?text=Fish";

        const itemEl = document.createElement("div");
        itemEl.className = "order-item";
        itemEl.innerHTML = `
            <img src="${imgUrl}" alt="${escapeHTML(item.fish.fishName)}" class="order-item-img">
            <div class="order-item-details">
                <div class="order-item-title">
                    <a href="fish-details.html?id=${item.fish.id}" target="_blank">${escapeHTML(item.fish.fishName)}</a>
                </div>
                <div class="order-item-meta">Qty: ${item.quantity} × ${formatCurrency(item.unitPrice)}</div>
            </div>
            <div class="order-item-price">${formatCurrency(itemSubtotal)}</div>
        `;
        container.appendChild(itemEl);
    });
}

function renderPaymentSummary() {
    /*
      IMPORTANT:
      Never trust the payment amount calculated on the client side!
      All totals displayed here are sourced directly from currentOrder (Backend entity data).
    */
    const subtotal = currentOrder.orderItems ? currentOrder.orderItems.reduce((acc, i) => acc + (i.quantity * i.unitPrice), 0) : 0;
    const delivery = currentOrder.deliveryFee || 500.00;
    const discount = currentOrder.discountAmount || 0.00;
    const total = currentOrder.totalAmount || (subtotal + delivery - discount);

    document.getElementById("summarySubtotal").textContent = formatCurrency(subtotal);
    document.getElementById("summaryDelivery").textContent = formatCurrency(delivery);

    const discountRow = document.getElementById("discountRow");
    if (discount > 0) {
        discountRow.style.display = "flex";
        document.getElementById("summaryDiscount").textContent = `- ${formatCurrency(discount)}`;
    } else {
        discountRow.style.display = "none";
    }

    document.getElementById("summaryTotal").textContent = formatCurrency(total);
}

function formatCurrency(amount) {
    return new Intl.NumberFormat("en-LK", {
        style: "currency",
        currency: "LKR",
        minimumFractionDigits: 2
    }).format(amount);
}

// ==========================================
// PAYMENT METHOD SELECTION
// ==========================================
function setupEventListeners() {
    const radioInputs = document.querySelectorAll('input[name="paymentMethod"]');
    radioInputs.forEach(input => {
        input.addEventListener("change", handlePaymentMethodChange);
    });

    const processBtn = document.getElementById("btnProcessPayment");
    if (processBtn) {
        processBtn.addEventListener("click", handlePaymentSubmit);
    }

    // Modal Action Listeners
    const closeModalBtn = document.getElementById("closeModalBtn");
    const cancelModalBtn = document.getElementById("btnCancelModal");
    const confirmModalBtn = document.getElementById("btnConfirmModal");

    if (closeModalBtn) closeModalBtn.addEventListener("click", hideModal);
    if (cancelModalBtn) cancelModalBtn.addEventListener("click", hideModal);
    if (confirmModalBtn) confirmModalBtn.addEventListener("click", executePaymentRequest);
}

function handlePaymentMethodChange(e) {
    selectedPaymentMethod = e.target.value;

    // Update Card Container Active Classes
    document.querySelectorAll('#paymentMethodsGroup .radio-card').forEach(card => {
        card.classList.remove('active');
        if (card.getAttribute('data-method') === selectedPaymentMethod) {
            card.classList.add('active');
        }
    });

    // Hide all detail panels
    document.getElementById("cardPaymentPanel").style.display = "none";
    document.getElementById("codPaymentPanel").style.display = "none";
    document.getElementById("bankPaymentPanel").style.display = "none";

    const btnText = document.getElementById("btnText");

    // Show selected panel
    if (selectedPaymentMethod === "CARD") {
        document.getElementById("cardPaymentPanel").style.display = "block";
        btnText.textContent = "Continue Securely";
    } else if (selectedPaymentMethod === "CASH_ON_DELIVERY") {
        document.getElementById("codPaymentPanel").style.display = "block";
        btnText.textContent = "Confirm Cash Order";
    } else if (selectedPaymentMethod === "BANK_TRANSFER") {
        document.getElementById("bankPaymentPanel").style.display = "block";
        btnText.textContent = "Confirm Bank Transfer";
    }

    showToast(`Payment method changed to ${selectedPaymentMethod.replace(/_/g, ' ')}`, "info");
}

// ==========================================
// PAYMENT PROCESSING FLOW
// ==========================================
function handlePaymentSubmit() {
    if (isProcessing) return;

    if (selectedPaymentMethod === "CASH_ON_DELIVERY") {
        showModal(
            "Confirm Cash on Delivery",
            `Are you sure you want to complete Order #${currentOrder.id} with Cash on Delivery? Our courier will collect cash upon arrival.`
        );
    } else if (selectedPaymentMethod === "BANK_TRANSFER") {
        showModal(
            "Confirm Bank Transfer",
            `Please confirm you will transfer the amount to the provided bank account using Order #${currentOrder.id} as reference.`
        );
    } else {
        // Direct Card Processing
        executePaymentRequest();
    }
}

async function executePaymentRequest() {
    hideModal();
    disablePaymentButton();
    showProcessingOverlay();

    // IMPORTANT:
    // Never trust the payment amount from the browser.
    // Backend must retrieve the order and calculate/verify
    // the authoritative amount before processing payment.
    const paymentPayload = {
        orderId: currentOrder.id,
        paymentMethod: selectedPaymentMethod
    };

    try {
        if (selectedPaymentMethod === "CARD") {
            await processCardPayment(paymentPayload);
        } else if (selectedPaymentMethod === "CASH_ON_DELIVERY") {
            await confirmCashOnDelivery(paymentPayload);
        } else if (selectedPaymentMethod === "BANK_TRANSFER") {
            await confirmBankTransfer(paymentPayload);
        }
    } catch (error) {
        console.error("Payment Execution Error:", error);
        hideProcessingOverlay();
        enablePaymentButton();
        handlePaymentFailure(error.message || "An unexpected error occurred during processing.");
    }
}

async function processCardPayment(payload) {
    // TODO: POST /api/payments/create or POST /api/orders/{orderId}/payment
    // TODO: Integrate selected PCI-compliant payment provider SDK.
    // Use provider-hosted fields or tokenization.
    // Never send raw card details to this frontend/backend.

    if (!isDemoMode()) {
        const response = await apiRequest(`/orders/${payload.orderId}/payment`, {
            method: "POST",
            body: JSON.stringify(payload)
        });

        // Backend returns secure redirect URL for payment gateway host
        if (response.redirectUrl) {
            window.location.href = response.redirectUrl;
            return;
        }

        if (response.paymentSessionId) {
            // Initiate polling if gateway processes asynchronously
            pollPaymentStatus(response.paymentId);
            return;
        }
    }

    // DEMO MODE SIMULATION
    setTimeout(() => {
        hideProcessingOverlay();
        showToast("Demo Card Payment Approved!", "success");
        redirectToOrderSuccess(currentOrder.id);
    }, 2000);
}

async function confirmCashOnDelivery(payload) {
    // TODO: POST /api/orders/{orderId}/payment
    if (!isDemoMode()) {
        await apiRequest(`/orders/${payload.orderId}/payment`, {
            method: "POST",
            body: JSON.stringify(payload)
        });
    }

    setTimeout(() => {
        hideProcessingOverlay();
        showToast("Cash on Delivery Order Confirmed!", "success");
        redirectToOrderSuccess(currentOrder.id);
    }, 1500);
}

async function confirmBankTransfer(payload) {
    // TODO: POST /api/orders/{orderId}/payment
    if (!isDemoMode()) {
        await apiRequest(`/orders/${payload.orderId}/payment`, {
            method: "POST",
            body: JSON.stringify(payload)
        });
    }

    setTimeout(() => {
        hideProcessingOverlay();
        showToast("Bank Transfer Order Pending Verification!", "success");
        redirectToOrderSuccess(currentOrder.id);
    }, 1500);
}

// ==========================================
// PAYMENT VERIFICATION & POLLING
// ==========================================
async function pollPaymentStatus(paymentId) {
    let attempts = 0;

    pollingTimer = setInterval(async () => {
        attempts++;
        try {
            // TODO: GET /api/payments/{paymentId}/status
            const result = await apiRequest(`/payments/${paymentId}/status`);

            if (result.paymentStatus === "PAID" || result.paymentStatus === "SUCCESS") {
                clearInterval(pollingTimer);
                hideProcessingOverlay();
                redirectToOrderSuccess(currentOrder.id);
            } else if (result.paymentStatus === "FAILED") {
                clearInterval(pollingTimer);
                hideProcessingOverlay();
                handlePaymentFailure("Payment gateway declined transaction.");
            } else if (result.paymentStatus === "CANCELLED") {
                clearInterval(pollingTimer);
                hideProcessingOverlay();
                handlePaymentCancellation();
            }

            if (attempts >= MAX_POLL_ATTEMPTS) {
                clearInterval(pollingTimer);
                hideProcessingOverlay();
                handlePaymentFailure("Payment verification timed out. Please check your order status.");
            }
        } catch (err) {
            clearInterval(pollingTimer);
            hideProcessingOverlay();
            handlePaymentFailure("Failed to verify status with server.");
        }
    }, POLL_INTERVAL_MS);
}

// ==========================================
// NAVIGATION & STATE TRANSITIONS
// ==========================================
function redirectToOrderSuccess(orderId) {
    window.location.href = `order-success.html?id=${orderId}`;
}

function handlePaymentFailure(msg) {
    document.getElementById("paymentLayout").style.display = "none";
    document.getElementById("failureState").style.display = "block";
    if (msg) {
        document.getElementById("failureMessage").textContent = msg;
    }
    showToast("Payment Failed", "error");
}

function handlePaymentCancellation() {
    document.getElementById("paymentLayout").style.display = "none";
    document.getElementById("cancelledState").style.display = "block";
    showToast("Payment Cancelled", "warning");
}

function resetToPaymentSelection() {
    document.getElementById("failureState").style.display = "none";
    document.getElementById("cancelledState").style.display = "none";
    document.getElementById("paymentLayout").style.display = "grid";
    enablePaymentButton();
}

// ==========================================
// UI HELPERS & STATES
// ==========================================
function disablePaymentButton() {
    isProcessing = true;
    const btn = document.getElementById("btnProcessPayment");
    const text = document.getElementById("btnText");
    const icon = document.getElementById("btnIcon");

    if (btn) {
        btn.disabled = true;
        if (text) text.textContent = "Processing Payment...";
        if (icon) icon.className = "fa-solid fa-spinner fa-spin";
    }
}

function enablePaymentButton() {
    isProcessing = false;
    const btn = document.getElementById("btnProcessPayment");
    const text = document.getElementById("btnText");
    const icon = document.getElementById("btnIcon");

    if (btn) {
        btn.disabled = false;
        if (text) {
            if (selectedPaymentMethod === "CARD") text.textContent = "Continue Securely";
            else if (selectedPaymentMethod === "CASH_ON_DELIVERY") text.textContent = "Confirm Cash Order";
            else if (selectedPaymentMethod === "BANK_TRANSFER") text.textContent = "Confirm Bank Transfer";
        }
        if (icon) icon.className = "fa-solid fa-arrow-right";
    }
}

function showProcessingOverlay() {
    const overlay = document.getElementById("processingState");
    if (overlay) overlay.style.display = "flex";
}

function hideProcessingOverlay() {
    const overlay = document.getElementById("processingState");
    if (overlay) overlay.style.display = "none";
}

function showLoadingState() {
    document.getElementById("loadingState").style.display = "block";
    document.getElementById("paymentLayout").style.display = "none";
    document.getElementById("invalidOrderState").style.display = "none";
    document.getElementById("errorState").style.display = "none";
}

function showPaymentLayout() {
    document.getElementById("loadingState").style.display = "none";
    document.getElementById("paymentLayout").style.display = "grid";
    document.getElementById("invalidOrderState").style.display = "none";
    document.getElementById("errorState").style.display = "none";
}

function showInvalidOrderState() {
    document.getElementById("loadingState").style.display = "none";
    document.getElementById("paymentLayout").style.display = "none";
    document.getElementById("invalidOrderState").style.display = "block";
    document.getElementById("errorState").style.display = "none";
}

function showErrorState() {
    document.getElementById("loadingState").style.display = "none";
    document.getElementById("paymentLayout").style.display = "none";
    document.getElementById("invalidOrderState").style.display = "none";
    document.getElementById("errorState").style.display = "block";
}

// ==========================================
// MODALS & TOASTS
// ==========================================
function showModal(title, text) {
    document.getElementById("modalTitle").textContent = title;
    document.getElementById("modalBodyText").textContent = text;
    document.getElementById("confirmationModal").style.display = "flex";
}

function hideModal() {
    document.getElementById("confirmationModal").style.display = "none";
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