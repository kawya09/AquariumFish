/**
 * ==========================================================================
 * Aquarium Fish E-Commerce - Orders Page JavaScript
 * Frontend built with Vanilla JS, HTML5, CSS3.
 *
 * IMPORTANT SECURITY NOTE:
 * The backend (Spring Boot + Spring Security) is the ultimate authority for:
 * - Authentication & Authorization
 * - Customer ownership of orders (e.g. /api/orders/my-orders)
 * - Order statuses, totals, pricing, quantities, cancellation & refund eligibility.
 * Never trust customer-provided IDs or frontend-calculated totals.
 * ==========================================================================
 */

// API Configuration & Mode Switch
const API_BASE_URL = "http://localhost:8080/api";
const USE_MOCK_DATA = true; // Set USE_MOCK_DATA = false when the Spring Boot REST API is ready.
const PAGE_SIZE = 10;

// State management
let state = {
    orders: [],
    filteredOrders: [],
    currentPage: 1,
    currentOrderIdToCancel: null,
    searchQuery: "",
    statusFilter: "ALL",
    paymentFilter: "ALL",
    deliveryFilter: "ALL",
    dateFilter: "ALL",
    sortFilter: "newest"
};

// Realistic Aquarium Fish Mock Data (DTO structure mimicking safe backend responses)
const MOCK_ORDERS = [
    {
        id: 125,
        orderDate: "2026-09-05T10:30:00",
        totalAmount: 8500.00,
        orderStatus: "DELIVERED",
        items: [
            {
                id: 1,
                quantity: 2,
                unitPrice: 2500.00,
                subtotal: 5000.00,
                fish: {
                    id: 15,
                    fishName: "Blue Veil Betta",
                    imageUrl: "https://images.unsplash.com/photo-1522069169874-c58ec4b76be5?w=200&auto=format&fit=crop&q=80"
                }
            },
            {
                id: 2,
                quantity: 5,
                unitPrice: 700.00,
                subtotal: 3500.00,
                fish: {
                    id: 22,
                    fishName: "Neon Tetra Schooling Pack",
                    imageUrl: "https://images.unsplash.com/photo-1535591273668-578e3112a84f?w=200&auto=format&fit=crop&q=80"
                }
            }
        ],
        payment: {
            paymentMethod: "CARD",
            paymentDate: "2026-09-05T10:35:00",
            amount: 8500.00,
            paymentStatus: "PAID",
            cardRef: "•••• 4821"
        },
        delivery: {
            deliveryAddress: "No 42, Temple Road, Gampaha, Sri Lanka",
            deliveryDate: "2026-09-08T14:00:00",
            deliveryStatus: "DELIVERED",
            trackingNo: "AQTRK938475"
        }
    },
    {
        id: 124,
        orderDate: "2026-09-01T15:20:00",
        totalAmount: 14200.00,
        orderStatus: "OUT_FOR_DELIVERY",
        items: [
            {
                id: 3,
                quantity: 1,
                unitPrice: 12000.00,
                subtotal: 12000.00,
                fish: {
                    id: 41,
                    fishName: "Platinum Angel Fish",
                    imageUrl: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=200&auto=format&fit=crop&q=80"
                }
            },
            {
                id: 4,
                quantity: 2,
                unitPrice: 1100.00,
                subtotal: 2200.00,
                fish: {
                    id: 18,
                    fishName: "Red Guppy Trio",
                    imageUrl: "https://images.unsplash.com/photo-1524704796757-55f0ba0841d7?w=200&auto=format&fit=crop&q=80"
                }
            }
        ],
        payment: {
            paymentMethod: "CARD",
            paymentDate: "2026-09-01T15:25:00",
            amount: 14200.00,
            paymentStatus: "PAID",
            cardRef: "•••• 4821"
        },
        delivery: {
            deliveryAddress: "No 42, Temple Road, Gampaha, Sri Lanka",
            deliveryDate: "2026-09-12T16:00:00",
            deliveryStatus: "OUT_FOR_DELIVERY",
            trackingNo: "AQTRK882194"
        }
    },
    {
        id: 120,
        orderDate: "2026-08-25T09:10:00",
        totalAmount: 6400.00,
        orderStatus: "DELIVERED",
        items: [
            {
                id: 5,
                quantity: 4,
                unitPrice: 1600.00,
                subtotal: 6400.00,
                fish: {
                    id: 12,
                    fishName: "Gold Zebra Danio",
                    imageUrl: "https://images.unsplash.com/photo-1534567153574-2b12153a87f0?w=200&auto=format&fit=crop&q=80"
                }
            }
        ],
        payment: {
            paymentMethod: "CASH_ON_DELIVERY",
            paymentDate: "2026-08-28T11:30:00",
            amount: 6400.00,
            paymentStatus: "PAID"
        },
        delivery: {
            deliveryAddress: "No 42, Temple Road, Gampaha, Sri Lanka",
            deliveryDate: "2026-08-28T11:30:00",
            deliveryStatus: "DELIVERED",
            trackingNo: "AQTRK773019"
        }
    },
    {
        id: 115,
        orderDate: "2026-08-15T14:00:00",
        totalAmount: 18500.00,
        orderStatus: "DELIVERED",
        items: [
            {
                id: 6,
                quantity: 1,
                unitPrice: 18500.00,
                subtotal: 18500.00,
                fish: {
                    id: 50,
                    fishName: "Blue Diamond Discus",
                    imageUrl: "https://images.unsplash.com/photo-1522069169874-c58ec4b76be5?w=200&auto=format&fit=crop&q=80"
                }
            }
        ],
        payment: {
            paymentMethod: "CARD",
            paymentDate: "2026-08-15T14:05:00",
            amount: 18500.00,
            paymentStatus: "PAID",
            cardRef: "•••• 4821"
        },
        delivery: {
            deliveryAddress: "No 42, Temple Road, Gampaha, Sri Lanka",
            deliveryDate: "2026-08-18T13:15:00",
            deliveryStatus: "DELIVERED",
            trackingNo: "AQTRK662018"
        }
    },
    {
        id: 111,
        orderDate: "2026-08-02T11:00:00",
        totalAmount: 4500.00,
        orderStatus: "CANCELLED",
        items: [
            {
                id: 7,
                quantity: 3,
                unitPrice: 1500.00,
                subtotal: 4500.00,
                fish: {
                    id: 33,
                    fishName: "Tiger Oscar",
                    imageUrl: "https://images.unsplash.com/photo-1535591273668-578e3112a84f?w=200&auto=format&fit=crop&q=80"
                }
            }
        ],
        payment: {
            paymentMethod: "CARD",
            paymentDate: "2026-08-02T11:05:00",
            amount: 4500.00,
            paymentStatus: "REFUNDED",
            cardRef: "•••• 4821"
        },
        delivery: {
            deliveryAddress: "No 42, Temple Road, Gampaha, Sri Lanka",
            deliveryDate: null,
            deliveryStatus: "CANCELLED",
            trackingNo: "AQTRK551012"
        }
    },
    {
        id: 108,
        orderDate: "2026-07-20T16:45:00",
        totalAmount: 9200.00,
        orderStatus: "DELIVERED",
        items: [
            {
                id: 8,
                quantity: 4,
                unitPrice: 2300.00,
                subtotal: 9200.00,
                fish: {
                    id: 25,
                    fishName: "Sunset Platy",
                    imageUrl: "https://images.unsplash.com/photo-1524704796757-55f0ba0841d7?w=200&auto=format&fit=crop&q=80"
                }
            }
        ],
        payment: {
            paymentMethod: "CARD",
            paymentDate: "2026-07-20T16:50:00",
            amount: 9200.00,
            paymentStatus: "PAID",
            cardRef: "•••• 4821"
        },
        delivery: {
            deliveryAddress: "No 42, Temple Road, Gampaha, Sri Lanka",
            deliveryDate: "2026-07-23T10:00:00",
            deliveryStatus: "DELIVERED",
            trackingNo: "AQTRK441908"
        }
    },
    {
        id: 102,
        orderDate: "2026-07-05T13:10:00",
        totalAmount: 11000.00,
        orderStatus: "DELIVERED",
        items: [
            {
                id: 9,
                quantity: 2,
                unitPrice: 5500.00,
                subtotal: 11000.00,
                fish: {
                    id: 19,
                    fishName: "Cherry Barb Colony",
                    imageUrl: "https://images.unsplash.com/photo-1534567153574-2b12153a87f0?w=200&auto=format&fit=crop&q=80"
                }
            }
        ],
        payment: {
            paymentMethod: "CASH_ON_DELIVERY",
            paymentDate: "2026-07-08T15:20:00",
            amount: 11000.00,
            paymentStatus: "PAID"
        },
        delivery: {
            deliveryAddress: "No 42, Temple Road, Gampaha, Sri Lanka",
            deliveryDate: "2026-07-08T15:20:00",
            deliveryStatus: "DELIVERED",
            trackingNo: "AQTRK331802"
        }
    },
    {
        id: 99,
        orderDate: "2026-06-18T10:00:00",
        totalAmount: 7500.00,
        orderStatus: "DELIVERED",
        items: [
            {
                id: 10,
                quantity: 3,
                unitPrice: 2500.00,
                subtotal: 7500.00,
                fish: {
                    id: 11,
                    fishName: "Common Molly",
                    imageUrl: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=200&auto=format&fit=crop&q=80"
                }
            }
        ],
        payment: {
            paymentMethod: "CARD",
            paymentDate: "2026-06-18T10:05:00",
            amount: 7500.00,
            paymentStatus: "PAID",
            cardRef: "•••• 4821"
        },
        delivery: {
            deliveryAddress: "No 42, Temple Road, Gampaha, Sri Lanka",
            deliveryDate: "2026-06-21T12:00:00",
            deliveryStatus: "DELIVERED",
            trackingNo: "AQTRK221701"
        }
    }
];

// ==========================================================================
// Initialization & Event Listeners
// ==========================================================================
document.addEventListener("DOMContentLoaded", () => {
    initAuthCheck();
    initNavbar();
    initEventListeners();
    readUrlParamsAndApply();
    loadOrders();
    updateCartBadge();
});

function initAuthCheck() {
    // Frontend session check (UX convenience only; Spring Boot handles real auth)
    const token = localStorage.getItem("auth_token") || sessionStorage.getItem("auth_token");
    if (!token && USE_MOCK_DATA === false) {
        showToast("Your session has expired. Please log in again.", "error");
        setTimeout(() => {
            window.location.href = "login.html?redirect=orders.html";
        }, 1500);
    }
}

function initNavbar() {
    const hamburger = document.getElementById("hamburger");
    const navMenu = document.getElementById("navMenu");
    const userMenuBtn = document.getElementById("userMenuBtn");
    const userMenuWrapper = document.getElementById("userMenuWrapper");
    const logoutBtn = document.getElementById("logoutBtn");

    if (hamburger && navMenu) {
        hamburger.addEventListener("click", () => {
            hamburger.classList.toggle("active");
            navMenu.classList.toggle("active");
            hamburger.setAttribute("aria-expanded", hamburger.classList.contains("active"));
        });
    }

    if (userMenuBtn && userMenuWrapper) {
        userMenuBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            userMenuWrapper.classList.toggle("active");
            userMenuBtn.setAttribute("aria-expanded", userMenuWrapper.classList.contains("active"));
        });

        document.addEventListener("click", () => {
            userMenuWrapper.classList.remove("active");
            userMenuBtn.setAttribute("aria-expanded", "false");
        });
    }

    if (logoutBtn) {
        logoutBtn.addEventListener("click", (e) => {
            e.preventDefault();
            localStorage.removeItem("auth_token");
            sessionStorage.removeItem("auth_token");
            showToast("Logged out successfully.", "success");
            setTimeout(() => {
                window.location.href = "login.html";
            }, 1000);
        });
    }
}

function initEventListeners() {
    // Search input with debounce
    const searchInput = document.getElementById("searchInput");
    const searchClearBtn = document.getElementById("searchClearBtn");

    if (searchInput) {
        let debounceTimer;
        searchInput.addEventListener("input", (e) => {
            clearTimeout(debounceTimer);
            state.searchQuery = e.target.value.trim();
            searchClearBtn.style.display = state.searchQuery ? "block" : "none";
            debounceTimer = setTimeout(() => {
                state.currentPage = 1;
                applyFiltersAndSort();
                updateUrlParams();
            }, 300);
        });
    }

    if (searchClearBtn) {
        searchClearBtn.addEventListener("click", () => {
            searchInput.value = "";
            state.searchQuery = "";
            searchClearBtn.style.display = "none";
            state.currentPage = 1;
            applyFiltersAndSort();
            updateUrlParams();
        });
    }

    // Filters
    const statusFilter = document.getElementById("statusFilter");
    const paymentFilter = document.getElementById("paymentFilter");
    const deliveryFilter = document.getElementById("deliveryFilter");
    const dateFilter = document.getElementById("dateFilter");
    const sortFilter = document.getElementById("sortFilter");
    const clearFiltersBtn = document.getElementById("clearFiltersBtn");
    const resetSearchFiltersBtn = document.getElementById("resetSearchFiltersBtn");

    if (statusFilter) {
        statusFilter.addEventListener("change", (e) => {
            state.statusFilter = e.target.value;
            state.currentPage = 1;
            applyFiltersAndSort();
            updateUrlParams();
        });
    }

    if (paymentFilter) {
        paymentFilter.addEventListener("change", (e) => {
            state.paymentFilter = e.target.value;
            state.currentPage = 1;
            applyFiltersAndSort();
            updateUrlParams();
        });
    }

    if (deliveryFilter) {
        deliveryFilter.addEventListener("change", (e) => {
            state.deliveryFilter = e.target.value;
            state.currentPage = 1;
            applyFiltersAndSort();
            updateUrlParams();
        });
    }

    if (dateFilter) {
        dateFilter.addEventListener("change", (e) => {
            state.dateFilter = e.target.value;
            state.currentPage = 1;
            applyFiltersAndSort();
            updateUrlParams();
        });
    }

    if (sortFilter) {
        sortFilter.addEventListener("change", (e) => {
            state.sortFilter = e.target.value;
            applyFiltersAndSort();
            updateUrlParams();
        });
    }

    if (clearFiltersBtn) {
        clearFiltersBtn.addEventListener("click", resetAllFilters);
    }

    if (resetSearchFiltersBtn) {
        resetSearchFiltersBtn.addEventListener("click", resetAllFilters);
    }

    // Retry fetch button
    const retryFetchBtn = document.getElementById("retryFetchBtn");
    if (retryFetchBtn) {
        retryFetchBtn.addEventListener("click", () => {
            loadOrders();
        });
    }

    // Pagination buttons
    const prevPageBtn = document.getElementById("prevPageBtn");
    const nextPageBtn = document.getElementById("nextPageBtn");

    if (prevPageBtn) {
        prevPageBtn.addEventListener("click", () => {
            if (state.currentPage > 1) {
                state.currentPage--;
                renderOrdersPage();
                window.scrollTo({ top: 400, behavior: "smooth" });
            }
        });
    }

    if (nextPageBtn) {
        nextPageBtn.addEventListener("click", () => {
            const totalPages = Math.ceil(state.filteredOrders.length / PAGE_SIZE);
            if (state.currentPage < totalPages) {
                state.currentPage++;
                renderOrdersPage();
                window.scrollTo({ top: 400, behavior: "smooth" });
            }
        });
    }

    // Modal close handlers
    setupModalHandlers();
}

function resetAllFilters() {
    state.searchQuery = "";
    state.statusFilter = "ALL";
    state.paymentFilter = "ALL";
    state.deliveryFilter = "ALL";
    state.dateFilter = "ALL";
    state.sortFilter = "newest";
    state.currentPage = 1;

    document.getElementById("searchInput").value = "";
    document.getElementById("searchClearBtn").style.display = "none";
    document.getElementById("statusFilter").value = "ALL";
    document.getElementById("paymentFilter").value = "ALL";
    document.getElementById("deliveryFilter").value = "ALL";
    document.getElementById("dateFilter").value = "ALL";
    document.getElementById("sortFilter").value = "newest";

    window.history.replaceState({}, "", window.location.pathname);
    applyFiltersAndSort();
    showToast("Filters cleared.", "success");
}

// ==========================================================================
// URL Parameter Syncing
// ==========================================================================
function readUrlParamsAndApply() {
    const params = new URLSearchParams(window.location.search);

    if (params.has("status")) {
        state.statusFilter = params.get("status").toUpperCase();
        const el = document.getElementById("statusFilter");
        if (el) el.value = state.statusFilter;
    }
    if (params.has("search")) {
        state.searchQuery = params.get("search");
        const el = document.getElementById("searchInput");
        if (el) {
            el.value = state.searchQuery;
            document.getElementById("searchClearBtn").style.display = "block";
        }
    }
    if (params.has("sort")) {
        state.sortFilter = params.get("sort");
        const el = document.getElementById("sortFilter");
        if (el) el.value = state.sortFilter;
    }
}

function updateUrlParams() {
    const params = new URLSearchParams();
    if (state.statusFilter !== "ALL") params.set("status", state.statusFilter);
    if (state.searchQuery) params.set("search", state.searchQuery);
    if (state.sortFilter !== "newest") params.set("sort", state.sortFilter);

    const newQuery = params.toString();
    const newUrl = newQuery ? `${window.location.pathname}?${newQuery}` : window.location.pathname;
    window.history.replaceState({}, "", newUrl);
}

// ==========================================================================
// Data Fetching & API Integration Helper
// ==========================================================================
async function apiRequest(endpoint, options = {}) {
    /**
     * TODO: Connect to Spring Boot REST API
     * The backend must derive the authenticated customer from the security principal (e.g. JWT token).
     * Never pass customer ID from frontend parameters for security reasons.
     */
    const token = localStorage.getItem("auth_token") || sessionStorage.getItem("auth_token");
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
        showToast("Your session has expired. Please log in again.", "error");
        setTimeout(() => window.location.href = "login.html?redirect=orders.html", 1500);
        throw new Error("Unauthorized");
    }
    if (response.status === 403) {
        showToast("You are not authorized to access this resource.", "error");
        throw new Error("Forbidden");
    }
    if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.message || `Server error: ${response.status}`);
    }

    return response.json();
}

async function loadOrders() {
    showLoadingState(true);
    hideAllStates();

    try {
        let ordersData = [];

        if (USE_MOCK_DATA) {
            // Simulate network latency for demo
            await new Promise(resolve => setTimeout(resolve, 600));
            ordersData = MOCK_ORDERS;
            document.getElementById("demoBadge").style.display = "inline-flex";
        } else {
            // Suggested endpoint: GET /api/orders/my-orders (Spring Boot authoritative ownership)
            document.getElementById("demoBadge").style.display = "none";
            ordersData = await apiRequest("/orders/my-orders");
        }

        // Normalize backend data shape safely
        state.orders = ordersData.map(normalizeOrder);

        if (state.orders.length === 0) {
            showEmptyState(true);
        } else {
            updateStatistics(state.orders);
            applyFiltersAndSort();
        }
    } catch (error) {
        console.error("Failed to load orders:", error);
        showErrorState(true, error.message || "We couldn't retrieve your orders right now. Please try again.");
    } finally {
        showLoadingState(false);
    }
}

// Data Normalization Function
function normalizeOrder(order) {
    return {
        id: order.id || order.orderId || 0,
        orderDate: order.orderDate || new Date().toISOString(),
        totalAmount: order.totalAmount || order.total || 0.00,
        orderStatus: (order.orderStatus || "PENDING").toUpperCase(),
        items: (order.items || order.orderItems || []).map(item => ({
            id: item.id || 0,
            quantity: item.quantity || 1,
            unitPrice: item.unitPrice || item.price || 0.00,
            subtotal: item.subtotal || (item.quantity * item.unitPrice) || 0.00,
            fish: {
                id: item.fish?.id || item.fishId || 0,
                fishName: item.fish?.fishName || item.fishName || "Aquarium Fish",
                imageUrl: item.fish?.imageUrl || item.imageUrl || "https://images.unsplash.com/photo-1522069169874-c58ec4b76be5?w=200&auto=format&fit=crop&q=80"
            }
        })),
        payment: {
            paymentMethod: order.payment?.paymentMethod || "CARD",
            paymentDate: order.payment?.paymentDate || null,
            amount: order.payment?.amount || order.totalAmount || 0.00,
            paymentStatus: (order.payment?.paymentStatus || "PENDING").toUpperCase(),
            cardRef: order.payment?.cardRef || null
        },
        delivery: {
            deliveryAddress: order.delivery?.deliveryAddress || order.address || "Sri Lanka",
            deliveryDate: order.delivery?.deliveryDate || null,
            deliveryStatus: (order.delivery?.deliveryStatus || "PENDING").toUpperCase(),
            trackingNo: order.delivery?.trackingNo || null
        }
    };
}

// ==========================================================================
// Filtering & Sorting Logic
// ==========================================================================
function applyFiltersAndSort() {
    let result = [...state.orders];

    // 1. Search filter
    if (state.searchQuery) {
        const query = state.searchQuery.toLowerCase();
        result = result.filter(order => {
            const matchesOrderId = String(order.id).toLowerCase().includes(query) || `aq-${order.id}`.toLowerCase().includes(query);
            const matchesFishName = order.items.some(item => item.fish.fishName.toLowerCase().includes(query));
            return matchesOrderId || matchesFishName;
        });
    }

    // 2. Status filter
    if (state.statusFilter !== "ALL") {
        result = result.filter(order => order.orderStatus === state.statusFilter);
    }

    // 3. Payment filter
    if (state.paymentFilter !== "ALL") {
        result = result.filter(order => order.payment.paymentStatus === state.paymentFilter);
    }

    // 4. Delivery filter
    if (state.deliveryFilter !== "ALL") {
        result = result.filter(order => order.delivery.deliveryStatus === state.deliveryFilter);
    }

    // 5. Date filter
    if (state.dateFilter !== "ALL") {
        const days = parseInt(state.dateFilter, 10);
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - days);
        result = result.filter(order => new Date(order.orderDate) >= cutoffDate);
    }

    // 6. Sorting
    result.sort((a, b) => {
        if (state.sortFilter === "newest") {
            return new Date(b.orderDate) - new Date(a.orderDate);
        } else if (state.sortFilter === "oldest") {
            return new Date(a.orderDate) - new Date(b.orderDate);
        } else if (state.sortFilter === "highest") {
            return b.totalAmount - a.totalAmount;
        } else if (state.sortFilter === "lowest") {
            return a.totalAmount - b.totalAmount;
        }
        return 0;
    });

    state.filteredOrders = result;
    state.currentPage = 1;

    const noResultsState = document.getElementById("noResultsState");
    const ordersGrid = document.getElementById("ordersGrid");
    const paginationContainer = document.getElementById("paginationContainer");

    if (state.orders.length > 0 && state.filteredOrders.length === 0) {
        noResultsState.style.display = "block";
        ordersGrid.style.display = "none";
        paginationContainer.style.display = "none";
        document.getElementById("resultsCount").textContent = "Showing 0 orders";
    } else if (state.orders.length === 0) {
        noResultsState.style.display = "none";
        ordersGrid.style.display = "none";
        paginationContainer.style.display = "none";
    } else {
        noResultsState.style.display = "none";
        ordersGrid.style.display = "flex";
        renderOrdersPage();
    }
}

// ==========================================================================
// Rendering Statistics & Orders
// ==========================================================================
function updateStatistics(orders) {
    const total = orders.length;
    const pending = orders.filter(o => o.orderStatus === "PENDING" || o.orderStatus === "CONFIRMED").length;
    const inProgress = orders.filter(o => ["PROCESSING", "SHIPPED", "OUT_FOR_DELIVERY"].includes(o.orderStatus)).length;
    const delivered = orders.filter(o => o.orderStatus === "DELIVERED").length;

    document.getElementById("statTotalOrders").textContent = total;
    document.getElementById("statPendingOrders").textContent = pending;
    document.getElementById("statInProgressOrders").textContent = inProgress;
    document.getElementById("statDeliveredOrders").textContent = delivered;
}

function renderOrdersPage() {
    const ordersGrid = document.getElementById("ordersGrid");
    const paginationContainer = document.getElementById("paginationContainer");

    const startIndex = (state.currentPage - 1) * PAGE_SIZE;
    const endIndex = startIndex + PAGE_SIZE;
    const pageItems = state.filteredOrders.slice(startIndex, endIndex);

    document.getElementById("resultsCount").textContent = `Showing ${state.filteredOrders.length} order${state.filteredOrders.length === 1 ? '' : 's'}`;

    ordersGrid.innerHTML = pageItems.map(renderOrderCard).nuts ? "" : pageItems.map(renderOrderCard).join("");

    // Render pagination controls
    const totalPages = Math.ceil(state.filteredOrders.length / PAGE_SIZE);
    if (totalPages > 1) {
        paginationContainer.style.display = "flex";
        renderPaginationNumbers(totalPages);
    } else {
        paginationContainer.style.display = "none";
    }
}

function renderOrderCard(order) {
    const formattedDate = formatDate(order.orderDate);
    const formattedTotal = formatCurrency(order.totalAmount); // IMPORTANT: Backend Order.totalAmount is authoritative.
    const statusBadge = getOrderStatusBadge(order.orderStatus);
    const paymentBadge = getPaymentStatusBadge(order.payment.paymentStatus);
    const deliveryBadge = getDeliveryStatusBadge(order.delivery.deliveryStatus);

    // Limit preview items to 2
    const previewItems = order.items.slice(0, 2);
    const extraCount = order.items.length - previewItems.length;

    const itemsHtml = previewItems.map(item => `
        <div class="order-item-row">
            <div class="order-item-info-wrapper">
                <img src="${escapeHtml(item.fish.imageUrl)}" alt="${escapeHtml(item.fish.fishName)}" class="order-item-img" onerror="this.src='https://images.unsplash.com/photo-1522069169874-c58ec4b76be5?w=200&auto=format&fit=crop&q=80'">
                <div class="order-item-details">
                    <h4>${escapeHtml(item.fish.fishName)}</h4>
                    <p>Qty: ${item.quantity} × ${formatCurrency(item.unitPrice)}</p>
                </div>
            </div>
            <div class="order-item-pricing">
                <span class="order-item-subtotal">${formatCurrency(item.subtotal)}</span>
            </div>
        </div>
    `).join("");

    const extraNoticeHtml = extraCount > 0 ? `<span class="more-items-notice">+ ${extraCount} more item${extraCount === 1 ? '' : 's'}</span>` : "";

    // Action buttons determination
    const canCancel = ["PENDING", "CONFIRMED"].includes(order.orderStatus);
    const canTrack = order.delivery.trackingNo && order.orderStatus !== "CANCELLED";
    const isDelivered = order.orderStatus === "DELIVERED";

    return `
        <div class="order-card" data-order-id="${order.id}">
            <div class="order-card-header">
                <div class="order-meta-left">
                    <span class="order-number">Order #${escapeHtml(formatOrderNumber(order.id))}</span>
                    <span class="order-date"><i class="fa-regular fa-calendar"></i> Placed on ${escapeHtml(formattedDate)}</span>
                </div>
                <div class="order-meta-right">
                    ${statusBadge}
                </div>
            </div>
            <div class="order-card-body">
                <div class="order-items-preview-list">
                    ${itemsHtml}
                    ${extraNoticeHtml}
                </div>
                <div class="order-summary-grid">
                    <div class="summary-block">
                        <label>Payment</label>
                        <p>${paymentBadge} ${order.payment.cardRef ? `<small>(${escapeHtml(order.payment.cardRef)})</small>` : ''}</p>
                    </div>
                    <div class="summary-block">
                        <label>Delivery</label>
                        <p>${deliveryBadge}</p>
                    </div>
                    ${order.delivery.trackingNo ? `
                    <div class="summary-block">
                        <label>Tracking No</label>
                        <p><code>${escapeHtml(order.delivery.trackingNo)}</code></p>
                    </div>` : ''}
                </div>
            </div>
            <div class="order-card-footer">
                <div class="order-total-display">
                    <span>Order Total</span>
                    <h3>${escapeHtml(formattedTotal)}</h3>
                </div>
                <div class="order-actions">
                    <button class="btn btn-outline-primary btn-sm" onclick="openOrderDetailsModal(${order.id})">
                        <i class="fa-regular fa-eye"></i> View Details
                    </button>
                    ${canTrack ? `
                    <a href="delivery.html?orderId=${encodeURIComponent(order.id)}" class="btn btn-outline-secondary btn-sm">
                        <i class="fa-solid fa-truck-fast"></i> Track Delivery
                    </a>` : ''}
                    ${isDelivered ? `
                    <button class="btn btn-outline-secondary btn-sm" onclick="handleReorder(${order.id})">
                        <i class="fa-solid fa-rotate-right"></i> Reorder
                    </button>
                    <a href="reviews.html?orderId=${encodeURIComponent(order.id)}" class="btn btn-outline-secondary btn-sm">
                        <i class="fa-regular fa-star"></i> Review
                    </a>` : ''}
                    ${canCancel ? `
                    <button class="btn btn-danger btn-sm" onclick="promptCancelOrder(${order.id})">
                        <i class="fa-solid fa-ban"></i> Cancel
                    </button>` : ''}
                </div>
            </div>
        </div>
    `;
}

function renderPaginationNumbers(totalPages) {
    const container = document.getElementById("paginationNumbers");
    const prevBtn = document.getElementById("prevPageBtn");
    const nextBtn = document.getElementById("nextPageBtn");

    prevBtn.disabled = state.currentPage === 1;
    nextBtn.disabled = state.currentPage === totalPages;

    let html = "";
    for (let i = 1; i <= totalPages; i++) {
        if (i === 1 || i === totalPages || (i >= state.currentPage - 1 && i <= state.currentPage + 1)) {
            html += `<button class="page-num ${i === state.currentPage ? 'active' : ''}" onclick="goToPage(${i})">${i}</button>`;
        } else if (i === state.currentPage - 2 || i === state.currentPage + 2) {
            html += `<span class="page-ellipsis">...</span>`;
        }
    }
    container.innerHTML = html;
}

function goToPage(page) {
    state.currentPage = page;
    renderOrdersPage();
    window.scrollTo({ top: 400, behavior: "smooth" });
}

// ==========================================================================
// Status Badge Helpers
// ==========================================================================
function getOrderStatusBadge(status) {
    const normalized = status.toLowerCase().replace(/_/g, '-');
    let icon = "fa-clock";
    if (status === "DELIVERED") icon = "fa-circle-check";
    else if (status === "CANCELLED") icon = "fa-ban";
    else if (status.includes("SHIPPED") || status.includes("DELIVERY")) icon = "fa-truck-fast";
    else if (status === "PROCESSING") icon = "fa-gear fa-spin";
    else if (status === "CONFIRMED") icon = "fa-circle-check";

    return `<span class="status-badge ${escapeHtml(normalized)}"><i class="fa-solid ${icon}"></i> ${escapeHtml(formatStatusLabel(status))}</span>`;
}

function getPaymentStatusBadge(status) {
    const normalized = status.toLowerCase();
    return `<span class="status-badge ${escapeHtml(normalized)}">${escapeHtml(status)}</span>`;
}

function getDeliveryStatusBadge(status) {
    const normalized = status.toLowerCase().replace(/_/g, '-');
    return `<span class="status-badge ${escapeHtml(normalized)}">${escapeHtml(formatStatusLabel(status))}</span>`;
}

function formatStatusLabel(statusStr) {
    if (!statusStr) return "";
    return statusStr.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
}

function formatOrderNumber(id) {
    return `AQ-2026-${String(id).padStart(5, '0')}`;
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('en-LK', {
        style: 'currency',
        currency: 'LKR',
        minimumFractionDigits: 2
    }).format(amount);
}

function formatDate(dateString) {
    try {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('en-LK', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        }).format(date);
    } catch (e) {
        return dateString;
    }
}

// ==========================================================================
// Order Details Modal & Quick View
// ==========================================================================
function openOrderDetailsModal(orderId) {
    const order = state.orders.find(o => o.id === orderId);
    if (!order) return;

    document.getElementById("modalOrderDate").textContent = `Ordered on ${formatDate(order.orderDate)}`;
    document.getElementById("modalTitle").textContent = `Order #${formatOrderNumber(order.id)}`;

    const modalBody = document.getElementById("modalBodyContent");
    const modalFooter = document.getElementById("modalFooterActions");

    // Timeline steps calculation
    const statuses = ["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "OUT_FOR_DELIVERY", "DELIVERED"];
    let currentStatusIndex = statuses.indexOf(order.orderStatus);
    if (order.orderStatus === "CANCELLED") currentStatusIndex = -1;

    const timelineHtml = order.orderStatus === "CANCELLED" ? `
        <div class="alert-cancelled" style="color: var(--danger); font-weight: 700; margin-bottom: 1rem;">
            <i class="fa-solid fa-ban"></i> This order was cancelled.
        </div>
    ` : `
        <div class="timeline-container">
            ${statuses.map((st, idx) => {
        const isCompleted = idx <= currentStatusIndex;
        const isCurrent = idx === currentStatusIndex;
        const stepClass = isCurrent ? "current" : (isCompleted ? "completed" : "");
        return `
                    <div class="timeline-step ${stepClass}">
                        <div class="timeline-icon"><i class="fa-solid ${isCompleted ? 'fa-check' : 'fa-circle'}"></i></div>
                        <span>${formatStatusLabel(st)}</span>
                    </div>
                `;
    }).join("")}
        </div>
    `;

    const fullItemsHtml = order.items.map(item => `
        <div class="order-item-row">
            <div class="order-item-info-wrapper">
                <img src="${escapeHtml(item.fish.imageUrl)}" alt="${escapeHtml(item.fish.fishName)}" class="order-item-img" onerror="this.src='https://images.unsplash.com/photo-1522069169874-c58ec4b76be5?w=200&auto=format&fit=crop&q=80'">
                <div class="order-item-details">
                    <h4>${escapeHtml(item.fish.fishName)}</h4>
                    <p>Quantity: ${item.quantity} × ${formatCurrency(item.unitPrice)}</p>
                </div>
            </div>
            <div class="order-item-pricing">
                <span class="order-item-subtotal">${formatCurrency(item.subtotal)}</span>
            </div>
        </div>
    `).join("");

    modalBody.innerHTML = `
        <div class="modal-section-title">Order Timeline & Status</div>
        ${timelineHtml}

        <div class="modal-section-title">Purchased Items (${order.items.length})</div>
        <div class="order-items-preview-list">
            ${fullItemsHtml}
        </div>

        <div class="modal-section-title">Delivery & Customer Information</div>
        <div class="order-summary-grid">
            <div class="summary-block">
                <label>Delivery Address</label>
                <p>${escapeHtml(order.delivery.deliveryAddress)}</p>
            </div>
            <div class="summary-block">
                <label>Tracking Number</label>
                <p>${escapeHtml(order.delivery.trackingNo || 'N/A')}</p>
            </div>
            <div class="summary-block">
                <label>Payment Method</label>
                <p>${escapeHtml(formatStatusLabel(order.payment.paymentMethod))}</p>
            </div>
        </div>

        <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 1.5rem; padding-top: 1rem; border-top: 1px solid var(--border-color);">
            <span style="font-weight: 700; color: var(--text-muted);">Total Amount</span>
            <h3 style="color: var(--primary-dark);">${formatCurrency(order.totalAmount)}</h3>
        </div>
    `;

    modalFooter.innerHTML = `
        <a href="order-details.html?id=${encodeURIComponent(order.id)}" class="btn btn-primary btn-sm">
            <i class="fa-solid fa-file-invoice"></i> View Full Details Page
        </a>
        ${order.delivery.trackingNo && order.orderStatus !== "CANCELLED" ? `
        <a href="delivery.html?orderId=${encodeURIComponent(order.id)}" class="btn btn-outline-secondary btn-sm">
            <i class="fa-solid fa-truck-fast"></i> Track Delivery
        </a>` : ''}
        <button class="btn btn-outline-secondary btn-sm" onclick="closeOrderModal()">Close</button>
    `;

    document.getElementById("orderModalBackdrop").classList.add("active");
    document.getElementById("orderModalBackdrop").setAttribute("aria-hidden", "false");
}

function closeOrderModal() {
    document.getElementById("orderModalBackdrop").classList.remove("active");
    document.getElementById("orderModalBackdrop").setAttribute("aria-hidden", "true");
}

function setupModalHandlers() {
    const backdrop = document.getElementById("orderModalBackdrop");
    const closeBtn = document.getElementById("modalCloseBtn");

    if (closeBtn) closeBtn.addEventListener("click", closeOrderModal);
    if (backdrop) {
        backdrop.addEventListener("click", (e) => {
            if (e.target === backdrop) closeOrderModal();
        });
    }

    // Confirm cancel modal setup
    const confirmBackdrop = document.getElementById("confirmModalBackdrop");
    const confirmCloseBtn = document.getElementById("confirmModalCloseBtn");
    const confirmCancelBtn = document.getElementById("confirmModalCancelBtn");
    const confirmConfirmBtn = document.getElementById("confirmModalConfirmBtn");

    if (confirmCloseBtn) confirmCloseBtn.addEventListener("click", closeConfirmModal);
    if (confirmCancelBtn) confirmCancelBtn.addEventListener("click", closeConfirmModal);
    if (confirmBackdrop) {
        confirmBackdrop.addEventListener("click", (e) => {
            if (e.target === confirmBackdrop) closeConfirmModal();
        });
    }

    if (confirmConfirmBtn) {
        confirmConfirmBtn.addEventListener("click", executeCancelOrder);
    }

    // ESC key closes modals
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
            closeOrderModal();
            closeConfirmModal();
        }
    });
}

// ==========================================================================
// Cancellation & Reorder Logic
// ==========================================================================
function promptCancelOrder(orderId) {
    state.currentOrderIdToCancel = orderId;
    document.getElementById("confirmModalMessage").textContent = `Are you sure you want to cancel order #${formatOrderNumber(orderId)}? This action cannot be undone if processed by the seller.`;
    document.getElementById("confirmModalBackdrop").classList.add("active");
    document.getElementById("confirmModalBackdrop").setAttribute("aria-hidden", "false");
}

function closeConfirmModal() {
    state.currentOrderIdToCancel = null;
    document.getElementById("confirmModalBackdrop").classList.remove("active");
    document.getElementById("confirmModalBackdrop").setAttribute("aria-hidden", "true");
}

async function executeCancelOrder() {
    const orderId = state.currentOrderIdToCancel;
    if (!orderId) return;

    closeConfirmModal();

    try {
        if (USE_MOCK_DATA) {
            // Simulate API request delay and success
            await new Promise(resolve => setTimeout(resolve, 500));
            const order = state.orders.find(o => o.id === orderId);
            if (order) {
                order.orderStatus = "CANCELLED";
                order.delivery.deliveryStatus = "CANCELLED";
                order.payment.paymentStatus = "REFUNDED";
            }
            updateStatistics(state.orders);
            applyFiltersAndSort();
            showToast(`Order #${formatOrderNumber(orderId)} cancelled successfully.`, "success");
        } else {
            // Suggested endpoint: PATCH /api/orders/{orderId}/cancel
            await apiRequest(`/orders/${orderId}/cancel`, { method: "PATCH" });
            showToast(`Order #${formatOrderNumber(orderId)} cancelled successfully.`, "success");
            loadOrders(); // Refresh from backend
        }
    } catch (error) {
        console.error("Cancellation failed:", error);
        showToast(error.message || "Unable to cancel this order. It may already be processed.", "error");
    }
}

async function handleReorder(orderId) {
    try {
        if (USE_MOCK_DATA) {
            await new Promise(resolve => setTimeout(resolve, 500));
            showToast("Available items were added to your cart successfully.", "success");
            setTimeout(() => {
                window.location.href = "cart.html";
            }, 1000);
        } else {
            // Suggested endpoint: POST /api/orders/{orderId}/reorder
            await apiRequest(`/orders/${orderId}/reorder`, { method: "POST" });
            showToast("Available items were added to your cart successfully.", "success");
            setTimeout(() => {
                window.location.href = "cart.html";
            }, 1000);
        }
    } catch (error) {
        console.error("Reorder failed:", error);
        showToast(error.message || "Unable to reorder items. Some fish may be out of stock.", "error");
    }
}

// ==========================================================================
// Utility Helpers (XSS Protection & Toast Notifications)
// ==========================================================================
function escapeHtml(str) {
    if (str === null || str === undefined) return "";
    return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(0/0, "&#039;");
}

function showToast(message, type = "success") {
    const container = document.getElementById("toastContainer");
    const toast = document.createElement("div");
    toast.className = `toast ${type}`;

    let iconClass = "fa-circle-check";
    let title = "Success";
    if (type === "error") {
        iconClass = "fa-circle-exclamation";
        title = "Error";
    } else if (type === "warning") {
        iconClass = "fa-triangle-exclamation";
        title = "Notice";
    }

    toast.innerHTML = `
        <div class="toast-icon"><i class="fa-solid ${iconClass}"></i></div>
        <div class="toast-content">
            <h5>${title}</h5>
            <p>${escapeHtml(message)}</p>
        </div>
    `;

    container.appendChild(toast);

    setTimeout(() => {
        toast.style.animation = "fadeOutToast 0.3s forwards";
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}

function updateCartBadge() {
    /**
     * Retrieves cart item count from GET /api/cart or mock storage
     */
    const badge = document.getElementById("cartBadge");
    if (badge) {
        const cartCount = USE_MOCK_DATA ? 3 : 0; // Demo cart count
        badge.textContent = cartCount;
        badge.style.display = cartCount > 0 ? "flex" : "none";
    }
}

function showLoadingState(isLoading) {
    document.getElementById("loadingState").style.display = isLoading ? "flex" : "none";
    if (isLoading) {
        document.getElementById("ordersGrid").style.display = "none";
        document.getElementById("emptyState").style.display = "none";
        document.getElementById("noResultsState").style.display = "none";
        document.getElementById("errorState").style.display = "none";
        document.getElementById("paginationContainer").style.display = "none";
    }
}

function showEmptyState(isEmpty) {
    document.getElementById("emptyState").style.display = isEmpty ? "block" : "none";
    if (isEmpty) {
        document.getElementById("ordersGrid").style.display = "none";
        document.getElementById("paginationContainer").style.display = "none";
    }
}

function showErrorState(hasError, message) {
    document.getElementById("errorState").style.display = hasError ? "block" : "none";
    if (message) {
        document.getElementById("errorMessageText").textContent = message;
    }
    if (hasError) {
        document.getElementById("ordersGrid").style.display = "none";
        document.getElementById("loadingState").style.display = "none";
        document.getElementById("emptyState").style.display = "none";
        document.getElementById("paginationContainer").style.display = "none";
    }
}

function hideAllStates() {
    document.getElementById("loadingState").style.display = "none";
    document.getElementById("emptyState").style.display = "none";
    document.getElementById("noResultsState").style.display = "none";
    document.getElementById("errorState").style.display = "none";
}