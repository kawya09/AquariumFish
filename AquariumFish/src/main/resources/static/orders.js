/**
 * Aquarium Fish Store - Customer Orders & Order History JavaScript Module
 * Handles loading, rendering, filtering, searching, status updates, and cancellation flows.
 */

// ==========================================
// CONFIGURATION
// ==========================================
const API_BASE_URL = 'http://localhost:8080/api';
// TODO: Update API_BASE_URL for actual Spring Boot backend environment.

const USE_MOCK_DATA = true;
// Toggle to false when connecting live Spring Boot API.

// ==========================================
// STATE MANAGEMENT
// ==========================================
let allOrders = [];
let filteredOrders = [];
let pendingCancelOrderId = null;

// ==========================================
// MOCK DATA FOR FRONTEND PREVIEW
// ==========================================
const mockOrdersData = [
    {
        id: 1025,
        orderDate: "2026-08-12T10:30:00",
        totalAmount: 9000.00,
        orderStatus: "DELIVERED",
        customer: { id: 5, firstName: "Hiruni", lastName: "Kawya" },
        orderItems: [
            {
                id: 1,
                quantity: 2,
                unitPrice: 2500.00,
                subtotal: 5000.00,
                fish: {
                    id: 15,
                    fishName: "Blue Halfmoon Betta",
                    price: 2500.00,
                    fishImages: [{ id: 1, imageUrl: "https://images.unsplash.com/photo-1522069169874-c58ec4b76be5?w=150&auto=format&fit=crop&q=80", isPrimary: true }]
                }
            },
            {
                id: 2,
                quantity: 5,
                unitPrice: 800.00,
                subtotal: 4000.00,
                fish: {
                    id: 22,
                    fishName: "Neon Tetra",
                    price: 800.00,
                    fishImages: [{ id: 2, imageUrl: "https://images.unsplash.com/photo-1535591273668-578e31182c4f?w=150&auto=format&fit=crop&q=80", isPrimary: true }]
                }
            }
        ],
        payment: { paymentMethod: "CARD", paymentDate: "2026-08-12T10:35:00", amount: 9000.00, paymentStatus: "PAID" },
        delivery: { deliveryAddress: "Main Street, Gampaha, Sri Lanka", deliveryDate: "2026-08-18", deliveryStatus: "DELIVERED", trackingNo: "TRK123456" }
    },
    {
        id: 1024,
        orderDate: "2026-08-10T14:15:00",
        totalAmount: 4500.00,
        orderStatus: "SHIPPED",
        customer: { id: 5, firstName: "Hiruni", lastName: "Kawya" },
        orderItems: [
            {
                id: 3,
                quantity: 3,
                unitPrice: 1500.00,
                subtotal: 4500.00,
                fish: {
                    id: 30,
                    fishName: "Red Fancy Guppy",
                    price: 1500.00,
                    fishImages: [{ id: 3, imageUrl: "https://images.unsplash.com/photo-1535591273668-578e31182c4f?w=150&auto=format&fit=crop&q=80", isPrimary: true }]
                }
            }
        ],
        payment: { paymentMethod: "CASH_ON_DELIVERY", paymentDate: null, amount: 4500.00, paymentStatus: "PENDING" },
        delivery: { deliveryAddress: "Main Street, Gampaha, Sri Lanka", deliveryDate: null, deliveryStatus: "SHIPPED", trackingNo: "TRK987654" }
    },
    {
        id: 1023,
        orderDate: "2026-08-01T09:00:00",
        totalAmount: 12500.00,
        orderStatus: "PENDING",
        customer: { id: 5, firstName: "Hiruni", lastName: "Kawya" },
        orderItems: [
            {
                id: 4,
                quantity: 1,
                unitPrice: 12500.00,
                subtotal: 12500.00,
                fish: {
                    id: 45,
                    fishName: "Super Red Discus",
                    price: 12500.00,
                    fishImages: [{ id: 4, imageUrl: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=150&auto=format&fit=crop&q=80", isPrimary: true }]
                }
            }
        ],
        payment: { paymentMethod: "BANK_TRANSFER", paymentDate: null, amount: 12500.00, paymentStatus: "PENDING" },
        delivery: { deliveryAddress: "Main Street, Gampaha, Sri Lanka", deliveryDate: null, deliveryStatus: "PENDING", trackingNo: null }
    },
    {
        id: 1020,
        orderDate: "2026-07-20T16:45:00",
        totalAmount: 3200.00,
        orderStatus: "CANCELLED",
        customer: { id: 5, firstName: "Hiruni", lastName: "Kawya" },
        orderItems: [
            {
                id: 5,
                quantity: 4,
                unitPrice: 800.00,
                subtotal: 3200.00,
                fish: {
                    id: 12,
                    fishName: "Angel Fish",
                    price: 800.00,
                    fishImages: []
                }
            }
        ],
        payment: { paymentMethod: "CARD", paymentDate: null, amount: 3200.00, paymentStatus: "CANCELLED" },
        delivery: null
    }
];

// ==========================================
// INITIALIZATION
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
    initializeNavbar();
    checkAuthentication();
    setupEventListeners();
    applyQueryParams();
    loadOrders();
    updateCartCount();
});

function initializeNavbar() {
    const hamburgerBtn = document.getElementById("hamburgerBtn");
    const navMenu = document.getElementById("navMenu");
    if (hamburgerBtn && navMenu) {
        hamburgerBtn.addEventListener("click", () => navMenu.classList.toggle("active"));
    }

    const btnLogout = document.getElementById("btnLogout");
    if (btnLogout) {
        btnLogout.addEventListener("click", handleLogout);
    }
}

function checkAuthentication() {
    const token = localStorage.getItem("token");
    if (!token && !USE_MOCK_DATA) {
        window.location.href = "login.html?redirect=orders.html";
    }
}

function handleLogout() {
    localStorage.removeItem("token");
    showToast("Logged out successfully", "info");
    setTimeout(() => window.location.href = "login.html", 1000);
}

// ==========================================
// API & DATA LOADING
// ==========================================
async function loadOrders() {
    showLoadingState();

    try {
        if (USE_MOCK_DATA) {
            // Simulate network delay
            await new Promise(res => setTimeout(res, 600));
            allOrders = [...mockOrdersData];
        } else {
            allOrders = await fetchOrdersFromAPI();
        }

        updateOrderStatistics();

        if (allOrders.length === 0) {
            showEmptyState();
        } else {
            filterAndRenderOrders();
        }

    } catch (error) {
        console.error("Error loading orders:", error);
        showErrorState();
    }
}

async function fetchOrdersFromAPI() {
    // TODO: GET /api/orders/my-orders or GET /api/orders/customer/me
    const token = localStorage.getItem("token");
    const response = await fetch(`${API_BASE_URL}/orders/my-orders`, {
        method: "GET",
        headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
        }
    });

    if (response.status === 401) {
        window.location.href = "login.html?redirect=orders.html";
        return [];
    }

    if (!response.ok) {
        throw new Error("Failed to fetch orders");
    }

    return await response.json();
}

async function updateCartCount() {
    // TODO: GET /api/cart
    const badge = document.getElementById("cartBadge");
    if (!badge) return;

    if (USE_MOCK_DATA) {
        badge.textContent = "5";
        return;
    }

    try {
        const token = localStorage.getItem("token");
        if (!token) return;
        const res = await fetch(`${API_BASE_URL}/cart`, {
            headers: { "Authorization": `Bearer ${token}` }
        });
        if (res.ok) {
            const cart = await res.json();
            const totalQty = cart.items ? cart.items.reduce((sum, item) => sum + item.quantity, 0) : 0;
            badge.textContent = totalQty;
        }
    } catch (err) {
        console.warn("Could not update cart count.");
    }
}

// ==========================================
// STATISTICS
// ==========================================
function updateOrderStatistics() {
    const total = allOrders.length;
    const pending = allOrders.filter(o => o.orderStatus === "PENDING" || o.orderStatus === "PROCESSING" || o.orderStatus === "CONFIRMED").length;
    const completed = allOrders.filter(o => o.orderStatus === "DELIVERED" || o.orderStatus === "COMPLETED").length;
    const cancelled = allOrders.filter(o => o.orderStatus === "CANCELLED").length;

    document.getElementById("statTotalOrders").textContent = total;
    document.getElementById("statPendingOrders").textContent = pending;
    document.getElementById("statCompletedOrders").textContent = completed;
    document.getElementById("statCancelledOrders").textContent = cancelled;
}

// ==========================================
// FILTERING & SEARCHING
// ==========================================
function setupEventListeners() {
    document.getElementById("orderSearchInput").addEventListener("input", filterAndRenderOrders);
    document.getElementById("statusFilter").addEventListener("change", filterAndRenderOrders);
    document.getElementById("dateFilter").addEventListener("change", filterAndRenderOrders);
    document.getElementById("sortOrder").addEventListener("change", filterAndRenderOrders);
    document.getElementById("btnClearFilters").addEventListener("click", clearFilters);

    // Modal Events
    document.getElementById("btnCloseCancelModal").addEventListener("click", closeCancelModal);
    document.getElementById("btnKeepOrder").addEventListener("click", closeCancelModal);
    document.getElementById("btnConfirmCancel").addEventListener("click", confirmCancelOrder);
}

function applyQueryParams() {
    const params = new URLSearchParams(window.location.search);
    const statusParam = params.get("status");
    const searchParam = params.get("search");

    if (statusParam) {
        const statusSelect = document.getElementById("statusFilter");
        if (statusSelect) statusSelect.value = statusParam.toUpperCase();
    }

    if (searchParam) {
        const searchInput = document.getElementById("orderSearchInput");
        if (searchInput) searchInput.value = searchParam;
    }
}

function filterAndRenderOrders() {
    const searchQuery = document.getElementById("orderSearchInput").value.trim().toLowerCase();
    const selectedStatus = document.getElementById("statusFilter").value;
    const selectedDate = document.getElementById("dateFilter").value;
    const selectedSort = document.getElementById("sortOrder").value;

    filteredOrders = allOrders.filter(order => {
        // Status Filter
        if (selectedStatus !== "ALL" && order.orderStatus !== selectedStatus) {
            return false;
        }

        // Search Query Filter (Order ID or Fish Name)
        if (searchQuery) {
            const matchesId = `#${order.id}`.toLowerCase().includes(searchQuery) || `AQF-${order.id}`.toLowerCase().includes(searchQuery);
            const matchesFish = order.orderItems && order.orderItems.some(item =>
                item.fish && item.fish.fishName && item.fish.fishName.toLowerCase().includes(searchQuery)
            );
            if (!matchesId && !matchesFish) return false;
        }

        // Date Range Filter
        if (selectedDate !== "ALL" && order.orderDate) {
            const orderTime = new Date(order.orderDate).getTime();
            const now = new Date().getTime();
            const dayDiff = (now - orderTime) / (1000 * 3600 * 24);

            if (selectedDate === "LAST_7_DAYS" && dayDiff > 7) return false;
            if (selectedDate === "LAST_30_DAYS" && dayDiff > 30) return false;
            if (selectedDate === "LAST_3_MONTHS" && dayDiff > 90) return false;
            if (selectedDate === "LAST_6_MONTHS" && dayDiff > 180) return false;
            if (selectedDate === "THIS_YEAR" && new Date(order.orderDate).getFullYear() !== new Date().getFullYear()) return false;
        }

        return true;
    });

    // Sorting
    filteredOrders.sort((a, b) => {
        if (selectedSort === "NEWEST") return new Date(b.orderDate) - new Date(a.orderDate);
        if (selectedSort === "OLDEST") return new Date(a.orderDate) - new Date(b.orderDate);
        if (selectedSort === "AMOUNT_HIGH") return b.totalAmount - a.totalAmount;
        if (selectedSort === "AMOUNT_LOW") return a.totalAmount - b.totalAmount;
        return 0;
    });

    if (filteredOrders.length === 0) {
        showNoResultsState();
    } else {
        renderOrdersList(filteredOrders);
    }
}

function clearFilters() {
    document.getElementById("orderSearchInput").value = "";
    document.getElementById("statusFilter").value = "ALL";
    document.getElementById("dateFilter").value = "ALL";
    document.getElementById("sortOrder").value = "NEWEST";
    filterAndRenderOrders();
}

// ==========================================
// RENDERING ORDER CARDS
// ==========================================
function renderOrdersList(orders) {
    const container = document.getElementById("ordersContainer");
    container.innerHTML = "";

    hideAllStates();
    container.style.display = "flex";

    orders.forEach(order => {
        const card = createOrderCard(order);
        container.appendChild(card);
    });
}

function createOrderCard(order) {
    const card = document.createElement("article");
    card.className = "card order-card";

    const formattedDate = formatOrderDate(order.orderDate);
    const statusClass = getStatusClass(order.orderStatus);
    const formattedTotal = formatCurrency(order.totalAmount);
    const itemCount = order.orderItems ? order.orderItems.reduce((acc, i) => acc + i.quantity, 0) : 0;

    // Items preview limit
    const MAX_PREVIEW = 2;
    const itemsToDisplay = order.orderItems ? order.orderItems.slice(0, MAX_PREVIEW) : [];
    const remainingCount = order.orderItems ? order.orderItems.length - MAX_PREVIEW : 0;

    let itemsHTML = itemsToDisplay.map(item => renderOrderItemRow(item)).join("");
    if (remainingCount > 0) {
        itemsHTML += `<div class="more-items-indicator">+ ${remainingCount} more item(s)...</div>`;
    }

    card.innerHTML = `
        <div class="order-card-header">
            <div>
                <div class="order-title">Order #AQF-${order.id}</div>
                <div class="order-date">Placed on ${formattedDate}</div>
            </div>
            <span class="status-badge ${statusClass}">
                ${formatStatusIcon(order.orderStatus)} ${formatOrderStatus(order.orderStatus)}
            </span>
        </div>
        <div class="order-card-body">
            <div class="order-items-preview">
                ${itemsHTML}
            </div>
        </div>
        <div class="order-card-footer">
            <div class="order-meta-info">
                <div class="meta-group">
                    <span>Items</span>
                    <strong>${itemCount} Fish Item(s)</strong>
                </div>
                <div class="meta-group">
                    <span>Payment</span>
                    <strong>${order.payment ? order.payment.paymentMethod.replace(/_/g, ' ') : 'N/A'}</strong>
                </div>
                <div class="meta-group order-total-group">
                    <span>Total Amount</span>
                    <strong>${formattedTotal}</strong>
                </div>
            </div>
            <div class="order-actions">
                ${renderActionButtons(order)}
            </div>
        </div>
    `;

    return card;
}

function renderOrderItemRow(item) {
    const imgUrl = getPrimaryFishImage(item.fish);
    const name = item.fish ? item.fish.fishName : "Aquarium Fish";

    return `
        <div class="order-item-row">
            <img src="${imgUrl}" alt="${escapeHTML(name)}" class="item-img" loading="lazy">
            <div class="item-info">
                <div class="item-name">${escapeHTML(name)}</div>
                <div class="item-meta">Qty: ${item.quantity} × ${formatCurrency(item.unitPrice)}</div>
            </div>
            <div class="item-price-subtotal">${formatCurrency(item.subtotal)}</div>
        </div>
    `;
}

function renderActionButtons(order) {
    let buttonsHTML = `
        <a href="order-details.html?id=${order.id}" class="btn btn-outline btn-sm">
            <i class="fa-solid fa-eye"></i> View Details
        </a>
    `;

    if (order.orderStatus === "PENDING") {
        buttonsHTML += `
            <button type="button" class="btn btn-danger btn-sm" onclick="openCancelModal(${order.id})">
                <i class="fa-solid fa-xmark"></i> Cancel
            </button>
        `;
    }

    if (order.orderStatus === "SHIPPED" || order.orderStatus === "DELIVERED") {
        buttonsHTML += `
            <a href="delivery.html?orderId=${order.id}" class="btn btn-secondary btn-sm">
                <i class="fa-solid fa-truck-ramp-box"></i> Track
            </a>
        `;
    }

    if (order.orderStatus === "DELIVERED" || order.orderStatus === "COMPLETED") {
        buttonsHTML += `
            <button type="button" class="btn btn-primary btn-sm" onclick="reorder(${order.id})">
                <i class="fa-solid fa-rotate-right"></i> Reorder
            </button>
        `;
    }

    return buttonsHTML;
}

// ==========================================
// ORDER ACTIONS (CANCEL & REORDER)
// ==========================================
function openCancelModal(orderId) {
    pendingCancelOrderId = orderId;
    document.getElementById("cancelModalBodyText").textContent = `Are you sure you want to cancel order #AQF-${orderId}? This action cannot be reversed.`;
    document.getElementById("cancelModal").style.display = "flex";
}

function closeCancelModal() {
    pendingCancelOrderId = null;
    document.getElementById("cancelModal").style.display = "none";
}

async function confirmCancelOrder() {
    if (!pendingCancelOrderId) return;
    const orderId = pendingCancelOrderId;
    closeCancelModal();

    try {
        if (USE_MOCK_DATA) {
            const target = allOrders.find(o => o.id === orderId);
            if (target) {
                target.orderStatus = "CANCELLED";
                showToast(`Order #AQF-${orderId} has been cancelled successfully`, "success");
                updateOrderStatistics();
                filterAndRenderOrders();
            }
        } else {
            // TODO: PUT /api/orders/{orderId}/cancel
            const token = localStorage.getItem("token");
            const res = await fetch(`${API_BASE_URL}/orders/${orderId}/cancel`, {
                method: "PUT",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            });

            if (!res.ok) throw new Error("Could not cancel order");
            showToast(`Order #AQF-${orderId} cancelled`, "success");
            loadOrders();
        }
    } catch (err) {
        console.error(err);
        showToast("Unable to cancel this order. Please contact support.", "error");
    }
}

async function reorder(orderId) {
    showToast("Checking fish stock & adding to cart...", "info");

    // TODO: POST /api/orders/{orderId}/reorder
    setTimeout(() => {
        showToast("Order items added to your shopping cart!", "success");
        setTimeout(() => {
            window.location.href = "cart.html";
        }, 1200);
    }, 800);
}

// ==========================================
// HELPERS
// ==========================================
function getPrimaryFishImage(fish) {
    if (fish && fish.fishImages && fish.fishImages.length > 0) {
        const primary = fish.fishImages.find(img => img.isPrimary);
        if (primary && primary.imageUrl) return primary.imageUrl;
        if (fish.fishImages[0].imageUrl) return fish.fishImages[0].imageUrl;
    }
    return "https://images.unsplash.com/photo-1522069169874-c58ec4b76be5?w=150&auto=format&fit=crop&q=80"; // Aqua Fallback
}

function formatCurrency(amount) {
    if (amount === null || amount === undefined) return "LKR 0.00";
    return new Intl.NumberFormat("en-LK", {
        style: "currency",
        currency: "LKR",
        minimumFractionDigits: 2
    }).format(amount);
}

function formatOrderDate(dateString) {
    if (!dateString) return "N/A";
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return d.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric"
    });
}

function getStatusClass(status) {
    if (!status) return "status-pending";
    const lower = status.toLowerCase();
    return `status-${lower}`;
}

function formatOrderStatus(status) {
    if (!status) return "Unknown";
    return status.charAt(0) + status.slice(1).toLowerCase();
}

function formatStatusIcon(status) {
    switch(status) {
        case "PENDING": return '<i class="fa-solid fa-clock"></i>';
        case "CONFIRMED": return '<i class="fa-solid fa-thumbs-up"></i>';
        case "PROCESSING": return '<i class="fa-solid fa-gear"></i>';
        case "SHIPPED": return '<i class="fa-solid fa-truck"></i>';
        case "DELIVERED": case "COMPLETED": return '<i class="fa-solid fa-circle-check"></i>';
        case "CANCELLED": return '<i class="fa-solid fa-circle-xmark"></i>';
        default: return '<i class="fa-solid fa-circle-info"></i>';
    }
}

function escapeHTML(str) {
    if (!str) return '';
    return str.replace(/[&<>'"]/g,
        tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
    );
}

// ==========================================
// UI STATES & TOASTS
// ==========================================
function hideAllStates() {
    document.getElementById("loadingState").style.display = "none";
    document.getElementById("ordersContainer").style.display = "none";
    document.getElementById("emptyState").style.display = "none";
    document.getElementById("noResultsState").style.display = "none";
    document.getElementById("errorState").style.display = "none";
}

function showLoadingState() {
    hideAllStates();
    document.getElementById("loadingState").style.display = "flex";
}

function showEmptyState() {
    hideAllStates();
    document.getElementById("emptyState").style.display = "block";
}

function showNoResultsState() {
    hideAllStates();
    document.getElementById("noResultsState").style.display = "block";
}

function showErrorState() {
    hideAllStates();
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

    toast.innerHTML = `<i class="fa-solid ${iconClass}"></i> <span>${escapeHTML(message)}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = "0";
        setTimeout(() => toast.remove(), 300);
    }, 3500);
}