/**
 * Aquarium Fish E-Commerce - Secure Payment Page JavaScript
 * Built with vanilla JavaScript, strictly adhering to architectural, security, and UI guidelines.
 */

// API Configuration & Mock Settings
const API_BASE_URL = "http://localhost:8080/api";
const USE_MOCK_DATA = true; // Set USE_MOCK_DATA = false when Spring Boot REST API is ready.

// Currency & Date Formatters
const currencyFormatter = new Intl.NumberFormat('en-LK', {
    style: 'currency',
    currency: 'LKR'
});

// Application State Machine & Variables
let currentOrder = null;
let selectedPaymentMethod = null;
let paymentInProgress = false;

// DOMContentLoaded Initialization
document.addEventListener("DOMContentLoaded", () => {
    initPaymentPage();
});

/**
 * Main Initialization Controller
 */
async function initPaymentPage() {
    setupMobileNav();
    updateCartBadge();
    setupEventListeners();

    if (USE_MOCK_DATA) {
        const banner = document.getElementById("demoModeBanner");
        if (banner) banner.style.display = "block";
    }

    const orderId = getOrderIdFromUrl();
    if (!orderId) {
        showErrorState(
            "Payment Information Unavailable",
            "We couldn't identify the order you want to pay for. Please select a valid order from your history.",
            "Back to Orders",
            "orders.html"
        );
        return;
    }

    await loadOrder(orderId);
}

/**
 * Extracts order ID from URL query parameters securely.
 */
function getOrderIdFromUrl() {
    const params = new URLSearchParams(window.location.search);
    const orderId = params.get("orderId");
    return orderId ? escapeHtml(orderId.trim()) : null;
}

/**
 * Event Listeners Setup
 */
function setupEventListeners() {
    const mobileToggle = document.getElementById("mobileToggle");
    const navMenu = document.getElementById("navMenu");
    if (mobileToggle && navMenu) {
        mobileToggle.addEventListener("click", () => {
            navMenu.style.display = navMenu.style.display === "flex" ? "none" : "flex";
        });
    }

    const logoutBtn = document.getElementById("logoutBtn");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", (e) => {
            e.preventDefault();
            localStorage.removeItem("authToken");
            redirectToLogin();
        });
    }

    const proceedBtn = document.getElementById("proceedPaymentBtn");
    if (proceedBtn) {
        proceedBtn.addEventListener("click", handlePaymentSubmission);
    }
}

/**
 * Loads order details from API or mock source.
 */
async function loadOrder(orderId) {
    showLoadingState(true);

    try {
        let orderData;
        if (USE_MOCK_DATA) {
            orderData = getMockOrderData(orderId);
            // Simulate network latency
            await new Promise(resolve => setTimeout(resolve, 600));
        } else {
            // TODO: Adjust endpoint to match Spring Boot controller (GET /api/orders/{orderId})
            const response = await apiRequest(`/orders/${orderId}`, { method: "GET" });
            orderData = response;
        }

        if (!orderData) {
            showErrorState("Order Not Found", "The requested order could not be found.", "Back to Orders", "orders.html");
            return;
        }

        currentOrder = normalizeOrder(orderData);
        renderPaymentPageData(currentOrder);
        showLoadingState(false);

    } catch (error) {
        console.error("Failed to load order:", error);
        handleApiError(error);
    }
}

/**
 * Normalizes backend order DTO variations into a unified structure.
 */
function normalizeOrder(rawOrder) {
    return {
        id: rawOrder.id || rawOrder.orderId,
        orderDate: rawOrder.orderDate || new Date().toISOString(),
        totalAmount: rawOrder.totalAmount || rawOrder.amount || 0,
        orderStatus: rawOrder.orderStatus || "PENDING",
        items: rawOrder.items || rawOrder.orderItems || [],
        payment: normalizePayment(rawOrder.payment || rawOrder.paymentDetails),
        delivery: normalizeDelivery(rawOrder.delivery || rawOrder.deliveryDetails),
        customer: rawOrder.customer || {}
    };
}

function normalizePayment(rawPayment) {
    if (!rawPayment) return { paymentMethod: "CARD", paymentStatus: "PENDING", amount: 0 };
    return {
        id: rawPayment.id,
        paymentMethod: normalizePaymentMethod(rawPayment.paymentMethod),
        paymentStatus: normalizePaymentStatus(rawPayment.paymentStatus),
        amount: rawPayment.amount || 0,
        paymentDate: rawPayment.paymentDate || null
    };
}

function normalizeDelivery(rawDelivery) {
    if (!rawDelivery) return { deliveryAddress: "Colombo, Sri Lanka", deliveryStatus: "PENDING" };
    return {
        deliveryAddress: rawDelivery.deliveryAddress || rawDelivery.address || "Colombo, Sri Lanka",
        deliveryStatus: rawDelivery.deliveryStatus || "PENDING",
        recipientName: rawDelivery.recipientName || "Customer",
        phone: rawDelivery.phone || "+94 77 123 4567"
    };
}

function normalizePaymentMethod(method) {
    if (!method) return "CARD";
    const upper = method.toUpperCase();
    if (upper.includes("CASH") || upper.includes("COD")) return "CASH_ON_DELIVERY";
    return "CARD";
}

function normalizePaymentStatus(status) {
    if (!status) return "PENDING";
    return status.toUpperCase();
}

/**
 * Renders the full payment page UI based on normalized order data.
 */
function renderPaymentPageData(order) {
    const workspace = document.getElementById("paymentWorkspace");
    workspace.style.display = "grid";

    // Update Order Summary ID & Back to Checkout Link
    document.getElementById("summaryOrderId").textContent = `Order #${escapeHtml(order.id)}`;

    const backCheckoutBtn = document.getElementById("backToCheckoutBtn");
    if (backCheckoutBtn) {
        backCheckoutBtn.href = `checkout.html?orderId=${encodeURIComponent(order.id)}`;
    }

    // Render Items
    renderOrderItems(order.items);

    // Render Totals (IMPORTANT: Backend Order.totalAmount is authoritative)
    const subtotal = order.items.reduce((acc, item) => acc + (item.subtotal || (item.quantity * item.unitPrice)), 0);
    const deliveryFee = order.totalAmount > subtotal ? order.totalAmount - subtotal : 0;

    document.getElementById("summarySubtotal").textContent = currencyFormatter.format(subtotal);
    document.getElementById("summaryDeliveryFee").textContent = currencyFormatter.format(deliveryFee);
    document.getElementById("summaryTotalAmount").textContent = currencyFormatter.format(order.totalAmount);

    // Render Delivery Summary
    renderDeliverySummary(order.delivery, order.customer);

    // Check if Already Paid or Completed
    if (order.payment.paymentStatus === "PAID") {
        showAlreadyPaidState(order);
        return;
    }

    // Render Payment Methods & Interactive States
    renderPaymentMethods(order);
}

/**
 * Renders order items safely with XSS protection and image fallback.
 */
function renderOrderItems(items) {
    const container = document.getElementById("orderItemsList");
    container.innerHTML = "";

    if (!items || items.length === 0) {
        container.innerHTML = `<p class="item-meta">No items found in this order.</p>`;
        return;
    }

    items.forEach(item => {
        const fishName = item.fish?.fishName || item.fishName || "Aquarium Fish";
        const quantity = item.quantity || 1;
        const unitPrice = item.unitPrice || 0;
        const subtotal = item.subtotal || (quantity * unitPrice);
        const imageUrl = item.fish?.imageUrl || item.imageUrl || "images/placeholder-fish.jpg";

        const row = document.createElement("div");
        row.className = "order-item-row";
        row.innerHTML = `
            <img src="${escapeHtml(imageUrl)}" alt="${escapeHtml(fishName)}" class="item-thumbnail" onerror="this.src='images/placeholder-fish.jpg'">
            <div class="item-info">
                <div class="item-name">${escapeHtml(fishName)}</div>
                <div class="item-meta">${escapeHtml(quantity)} × ${currencyFormatter.format(unitPrice)}</div>
            </div>
            <div class="item-subtotal">${currencyFormatter.format(subtotal)}</div>
        `;
        container.appendChild(row);
    });
}

/**
 * Renders delivery summary info.
 */
function renderDeliverySummary(delivery, customer) {
    const container = document.getElementById("deliveryDetailsContent");
    const name = escapeHtml(customer.firstName ? `${customer.firstName} ${customer.lastName || ''}` : (delivery.recipientName || 'Customer'));
    const phone = escapeHtml(customer.phone || delivery.phone || '+94 XX XXX XXXX');
    const address = escapeHtml(delivery.deliveryAddress || 'Colombo, Sri Lanka');

    container.innerHTML = `
        <strong>${name}</strong><br>
        <i class="fa-solid fa-phone"></i> ${phone}<br>
        <i class="fa-solid fa-house"></i> ${address}
    `;
}

/**
 * Renders available payment methods securely.
 */
function renderPaymentMethods(order) {
    const listContainer = document.getElementById("paymentMethodsList");
    listContainer.innerHTML = "";

    // Simulated available methods from backend or fallback
    const availableMethods = ["CARD", "CASH_ON_DELIVERY"];

    availableMethods.forEach((method, index) => {
        const isCard = method === "CARD";
        const title = isCard ? "Card / Online Payment" : "Cash on Delivery";
        const desc = isCard ? "Pay securely through our supported payment gateway." : "Pay with cash when your aquarium fish order is delivered.";
        const icon = isCard ? "fa-solid fa-credit-card" : "fa-solid fa-money-bill-wave";

        const optionDiv = document.createElement("label");
        optionDiv.className = `payment-method-option ${index === 0 ? 'selected' : ''}`;
        optionDiv.dataset.method = method;

        optionDiv.innerHTML = `
            <input type="radio" name="paymentMethodRadio" value="${method}" ${index === 0 ? 'checked' : ''}>
            <div class="method-icon"><i class="${icon}"></i></div>
            <div class="method-details">
                <h4>${title}</h4>
                <p>${desc}</p>
            </div>
        `;

        optionDiv.addEventListener("click", () => {
            document.querySelectorAll(".payment-method-option").forEach(opt => opt.classList.remove("selected"));
            optionDiv.classList.add("selected");
            const radio = optionDiv.querySelector("input");
            radio.checked = true;
            selectPaymentMethod(method);
        });

        listContainer.appendChild(optionDiv);
    });

    // Default selection to first item
    if (availableMethods.length > 0) {
        selectPaymentMethod(availableMethods[0]);
    }
}

/**
 * Handles payment method selection state changes.
 */
function selectPaymentMethod(method) {
    selectedPaymentMethod = method;
    const gatewayPlaceholder = document.getElementById("gatewayPlaceholder");
    const codNotice = document.getElementById("codNotice");
    const proceedBtn = document.getElementById("proceedPaymentBtn");

    proceedBtn.removeAttribute("disabled");

    if (method === "CARD" || method === "ONLINE") {
        gatewayPlaceholder.style.display = "block";
        codNotice.style.display = "none";
        proceedBtn.querySelector(".btn-text").textContent = "Continue to Secure Payment";
    } else if (method === "CASH_ON_DELIVERY") {
        gatewayPlaceholder.style.display = "none";
        codNotice.style.display = "block";
        proceedBtn.querySelector(".btn-text").textContent = "Confirm Cash on Delivery Order";
    }
}

/**
 * Handles main payment submission / initialization.
 */
async function handlePaymentSubmission() {
    if (paymentInProgress || !currentOrder || !selectedPaymentMethod) return;

    paymentInProgress = true;
    const proceedBtn = document.getElementById("proceedPaymentBtn");
    const btnText = proceedBtn.querySelector(".btn-text");
    const spinner = proceedBtn.querySelector(".spinner-small");

    proceedBtn.setAttribute("disabled", "true");
    btnText.textContent = selectedPaymentMethod === "CARD" ? "Connecting to Secure Payment..." : "Placing Order...";
    spinner.style.display = "inline-block";

    try {
        if (USE_MOCK_DATA) {
            // Simulate mock backend payment initialization & latency
            await new Promise(resolve => setTimeout(resolve, 1500));

            if (selectedPaymentMethod === "CASH_ON_DELIVERY") {
                showToast("Order placed successfully with Cash on Delivery!", "success");
                window.location.href = `order-success.html?orderId=${encodeURIComponent(currentOrder.id)}&method=cod`;
            } else {
                // Simulate secure gateway redirect for card payment
                showToast("Redirecting to Secure Payment Gateway...", "success");
                setTimeout(() => {
                    window.location.href = `order-success.html?orderId=${encodeURIComponent(currentOrder.id)}&status=success`;
                }, 1000);
            }
        } else {
            // Spring Boot REST API integration (Authoritative backend call)
            const endpoint = selectedPaymentMethod === "CASH_ON_DELIVERY" ? "/payments/cash-on-delivery" : "/payments/initialize";

            // NOTE: Never send raw card credentials or frontend-calculated totals. Backend Order.totalAmount is authoritative.
            const payload = {
                orderId: currentOrder.id,
                paymentMethod: selectedPaymentMethod
            };

            const response = await apiRequest(endpoint, {
                method: "POST",
                body: JSON.stringify(payload)
            });

            if (selectedPaymentMethod === "CASH_ON_DELIVERY") {
                window.location.href = `order-success.html?orderId=${encodeURIComponent(currentOrder.id)}`;
            } else if (response && response.redirectUrl) {
                // Redirect to official hosted/tokenized gateway URL provided by Spring Boot backend
                window.location.href = response.redirectUrl;
            } else {
                throw new Error("Invalid payment gateway response initialization.");
            }
        }
    } catch (error) {
        console.error("Payment initialization failed:", error);
        handleApiError(error);
        paymentInProgress = false;
        proceedBtn.removeAttribute("disabled");
        spinner.style.display = "none";
        selectPaymentMethod(selectedPaymentMethod);
    }
}

/**
 * State handlers for UI feedback
 */
function showAlreadyPaidState(order) {
    const workspace = document.getElementById("paymentWorkspace");
    workspace.innerHTML = `
        <div class="card" style="grid-column: 1 / -1; text-align: center; padding: 40px;">
            <div style="font-size: 3rem; color: var(--success-color); margin-bottom: 16px;">
                <i class="fa-solid fa-circle-check"></i>
            </div>
            <h2>Payment Already Completed</h2>
            <p style="color: var(--text-muted); margin-bottom: 24px;">This order (#${escapeHtml(order.id)}) has already been paid successfully.</p>
            <div style="display: flex; justify-content: center; gap: 16px;">
                <a href="order-details.html?id=${encodeURIComponent(order.id)}" class="btn btn-primary">View Order</a>
                <a href="delivery.html?orderId=${encodeURIComponent(order.id)}" class="btn btn-outline">Track Delivery</a>
            </div>
        </div>
    `;
}

function showLoadingState(isLoading) {
    document.getElementById("loadingContainer").style.display = isLoading ? "block" : "none";
    if (isLoading) {
        document.getElementById("paymentWorkspace").style.display = "none";
        document.getElementById("errorContainer").style.display = "none";
    }
}

function showErrorState(title, message, btnText, btnLink) {
    showLoadingState(false);
    document.getElementById("paymentWorkspace").style.display = "none";
    const errContainer = document.getElementById("errorContainer");
    errContainer.style.display = "block";
    document.getElementById("errorTitle").textContent = title;
    document.getElementById("errorMessage").textContent = message;
    const btn = document.getElementById("errorActionBtn");
    btn.textContent = btnText;
    btn.href = btnLink;
}

function showToast(message, type = "success") {
    const container = document.getElementById("toastContainer");
    const toast = document.createElement("div");
    toast.className = `toast ${type}`;
    toast.innerHTML = `<i class="fa-solid ${type === 'success' ? 'fa-circle-check' : 'fa-triangle-exclamation'}"></i> ${escapeHtml(message)}`;
    container.appendChild(toast);
    setTimeout(() => {
        toast.remove();
    }, 4000);
}

function updateCartBadge() {
    const badge = document.getElementById("cartBadge");
    if (badge) {
        const cart = JSON.parse(localStorage.getItem("cart") || "[]");
        badge.textContent = cart.length;
    }
}

function setupMobileNav() {
    // Handled in event listeners
}

function redirectToLogin() {
    const currentUrl = encodeURIComponent(window.location.href);
    window.location.href = `login.html?redirect=${currentUrl}`;
}

/**
 * XSS Protection Utility
 */
function escapeHtml(str) {
    if (typeof str !== 'string') return str;
    return str.replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

/**
 * Robust API Request Wrapper with Status Code Handling
 */
async function apiRequest(endpoint, options = {}) {
    const token = localStorage.getItem("authToken");
    const headers = {
        "Content-Type": "application/json",
        ...(token ? { "Authorization": `Bearer ${token}` } : {}),
        ...(options.headers || {})
    };

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers
    });

    if (response.status === 401) {
        redirectToLogin();
        throw new Error("Session expired. Please log in again.");
    }
    if (response.status === 403) {
        showErrorState("Access Denied", "You don't have permission to access this order.", "Back to Orders", "orders.html");
        throw new Error("Forbidden access.");
    }
    if (response.status === 404) {
        showErrorState("Order Not Found", "The requested order could not be found.", "Back to Orders", "orders.html");
        throw new Error("Order not found.");
    }
    if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
    }

    return response.json();
}

function handleApiError(error) {
    showToast(error.message || "Connection problem. Please check your network.", "error");
}

/**
 * Mock Data Generator for Demo Mode
 */
function getMockOrderData(orderId) {
    return {
        id: orderId || 125,
        orderDate: "2026-09-05T10:30:00",
        totalAmount: 8500,
        orderStatus: "CONFIRMED",
        items: [
            {
                id: 1,
                quantity: 2,
                unitPrice: 2500,
                subtotal: 5000,
                fish: {
                    id: 15,
                    fishName: "Blue Betta",
                    imageUrl: "https://images.unsplash.com/photo-1522069169874-c58ec4b76be5?auto=format&fit=crop&w=300&q=80"
                }
            },
            {
                id: 2,
                quantity: 5,
                unitPrice: 700,
                subtotal: 3500,
                fish: {
                    id: 22,
                    fishName: "Neon Tetra",
                    imageUrl: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=300&q=80"
                }
            }
        ],
        payment: {
            id: 501,
            paymentMethod: "CARD",
            paymentDate: null,
            amount: 8500,
            paymentStatus: "PENDING"
        },
        delivery: {
            deliveryAddress: "No. 42, Temple Road, Colombo 03, Sri Lanka",
            deliveryStatus: "PENDING",
            recipientName: "Hiruni Kawya",
            phone: "+94 71 234 5678"
        },
        customer: {
            firstName: "Hiruni",
            lastName: "Kawya",
            phone: "+94 71 234 5678"
        }
    };
}
