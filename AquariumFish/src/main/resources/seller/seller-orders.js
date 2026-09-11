/* =====================================================
   AQUARIUM FISH SELLER PANEL - SELLER ORDERS JAVASCRIPT
   ===================================================== */

const API_BASE_URL = "http://localhost:8080/api";
const USE_MOCK_DATA = true; // DEMO MODE ONLY. Set USE_MOCK_DATA = false for Spring Boot integration.

const state = {
    orders: [],
    filteredOrders: [],
    stats: {
        totalOrders: 0,
        pendingOrders: 0,
        processingOrders: 0,
        completedOrders: 0,
        cancelledOrders: 0,
        sellerSales: 0
    },
    currentPage: 1,
    pageSize: 10,
    totalPages: 1,
    totalElements: 0,

    search: "",
    orderStatus: "",
    paymentStatus: "",
    deliveryStatus: "",
    period: "all",
    sortBy: "newest",
    viewMode: "table", // 'table' or 'card'

    selectedOrder: null,
    statusToUpdate: null,
    newStatusTarget: null,

    isLoading: false,
    isUpdating: false,
    isAuthenticated: false
};

// DOM Elements
let demoModeBanner, sellerSidebar, sidebarToggleBtn, sidebarCloseBtn, logoutBtn, dropdownLogoutBtn;
let notificationBtn, notificationPanel, markAllReadBtn, notificationBadge;
let refreshBtn, exportCsvBtn, statsGrid;
let statTotalOrders, statPendingOrders, statProcessingOrders, statCompletedOrders, statCancelledOrders, statSellerSales;
let searchInput, periodFilter, orderStatusFilter, paymentStatusFilter, deliveryStatusFilter, sortBySelect, clearFiltersBtn;
let loadingState, tableViewWrapper, ordersTableBody, cardViewWrapper, emptyState, noMatchState, resetSearchFiltersBtn;
let ordersCountHeading, paginationInfo, paginationControls;
let tableViewBtn, cardViewBtn;
let orderDetailsModal, modalCloseBtn, modalCloseActionBtn, orderDetailsModalBody, modalOrderIdBadge;
let modalStatusSelect, modalUpdateStatusBtn;
let statusConfirmModal, statusConfirmCloseBtn, statusConfirmCancelBtn, statusConfirmSubmitBtn, statusConfirmText;
let toastContainer;

// Initialize on DOM Ready
document.addEventListener("DOMContentLoaded", () => {
    initializeElements();
    initializeSellerOrders();
});

function initializeElements() {
    demoModeBanner = document.getElementById("demoModeBanner");
    sellerSidebar = document.getElementById("sellerSidebar");
    sidebarToggleBtn = document.getElementById("sidebarToggleBtn");
    sidebarCloseBtn = document.getElementById("sidebarCloseBtn");
    logoutBtn = document.getElementById("logoutBtn");
    dropdownLogoutBtn = document.getElementById("dropdownLogoutBtn");

    notificationBtn = document.getElementById("notificationBtn");
    notificationPanel = document.getElementById("notificationPanel");
    markAllReadBtn = document.getElementById("markAllReadBtn");
    notificationBadge = document.getElementById("notificationBadge");

    refreshBtn = document.getElementById("refreshBtn");
    exportCsvBtn = document.getElementById("exportCsvBtn");
    statsGrid = document.getElementById("statsGrid");

    statTotalOrders = document.getElementById("statTotalOrders");
    statPendingOrders = document.getElementById("statPendingOrders");
    statProcessingOrders = document.getElementById("statProcessingOrders");
    statCompletedOrders = document.getElementById("statCompletedOrders");
    statCancelledOrders = document.getElementById("statCancelledOrders");
    statSellerSales = document.getElementById("statSellerSales");

    searchInput = document.getElementById("searchInput");
    periodFilter = document.getElementById("periodFilter");
    orderStatusFilter = document.getElementById("orderStatusFilter");
    paymentStatusFilter = document.getElementById("paymentStatusFilter");
    deliveryStatusFilter = document.getElementById("deliveryStatusFilter");
    sortBySelect = document.getElementById("sortBySelect");
    clearFiltersBtn = document.getElementById("clearFiltersBtn");

    loadingState = document.getElementById("loadingState");
    tableViewWrapper = document.getElementById("tableViewWrapper");
    ordersTableBody = document.getElementById("ordersTableBody");
    cardViewWrapper = document.getElementById("cardViewWrapper");
    emptyState = document.getElementById("emptyState");
    noMatchState = document.getElementById("noMatchState");
    resetSearchFiltersBtn = document.getElementById("resetSearchFiltersBtn");

    ordersCountHeading = document.getElementById("ordersCountHeading");
    paginationInfo = document.getElementById("paginationInfo");
    paginationControls = document.getElementById("paginationControls");

    tableViewBtn = document.getElementById("tableViewBtn");
    cardViewBtn = document.getElementById("cardViewBtn");

    orderDetailsModal = document.getElementById("orderDetailsModal");
    modalCloseBtn = document.getElementById("modalCloseBtn");
    modalCloseActionBtn = document.getElementById("modalCloseActionBtn");
    orderDetailsModalBody = document.getElementById("orderDetailsModalBody");
    modalOrderIdBadge = document.getElementById("modalOrderIdBadge");
    modalStatusSelect = document.getElementById("modalStatusSelect");
    modalUpdateStatusBtn = document.getElementById("modalUpdateStatusBtn");

    statusConfirmModal = document.getElementById("statusConfirmModal");
    statusConfirmCloseBtn = document.getElementById("statusConfirmCloseBtn");
    statusConfirmCancelBtn = document.getElementById("statusConfirmCancelBtn");
    statusConfirmSubmitBtn = document.getElementById("statusConfirmSubmitBtn");
    statusConfirmText = document.getElementById("statusConfirmText");

    toastContainer = document.getElementById("toastContainer");
}

function initializeSellerOrders() {
    if (!checkAuthentication() || !checkSellerRole()) return;

    if (USE_MOCK_DATA) {
        demoModeBanner.classList.remove("hidden");
    } else {
        demoModeBanner.classList.add("hidden");
    }

    initializeSidebar();
    initializeNotifications();
    initializeFilters();
    initializeViewToggles();
    initializeModals();

    loadOrdersData();
}

// Security & Authentication Checks
function checkAuthentication() {
    const token = localStorage.getItem("token");
    if (!token && !USE_MOCK_DATA) {
        const currentUrl = encodeURIComponent(window.location.href);
        window.location.href = `../login.html?redirect=${currentUrl}`;
        return false;
    }
    state.isAuthenticated = true;
    return true;
}

function checkSellerRole() {
    const role = localStorage.getItem("role") || "SELLER";
    if (role !== "SELLER" && !USE_MOCK_DATA) {
        window.location.href = "../index.html";
        return false;
    }
    return true;
}

// Data Loading
async function loadOrdersData() {
    showLoadingState();
    try {
        if (USE_MOCK_DATA) {
            await new Promise(resolve => setTimeout(resolve, 600));
            loadMockData();
        } else {
            await fetchOrdersFromAPI();
            await fetchOrderStatsFromAPI();
        }
        applyFiltersAndSort();
        renderStatistics();
        renderOrders();
    } catch (error) {
        console.error("Failed to load orders:", error);
        showErrorState(error.message || "Unable to load customer orders.");
    }
}

// Mock Data Source (10 realistic seller-attributable orders)
function loadMockData() {
    state.orders = [
        {
            id: 1001,
            orderDate: "2026-09-10T14:30:00",
            orderStatus: "PROCESSING",
            customer: {
                firstName: "Kasun",
                lastName: "Perera",
                phone: "0712345678",
                deliveryAddress: "No 42, Galle Road, Colombo 03"
            },
            sellerItems: [
                {
                    orderItemId: 501,
                    fish: {
                        id: 15,
                        fishName: "Blue Betta Halfmoon",
                        category: "Betta",
                        breed: "Halfmoon",
                        fishImages: [{ imageUrl: "https://images.unsplash.com/photo-1522069169874-c58ec4b76be5?auto=format&fit=crop&w=200&q=80", isPrimary: true }]
                    },
                    quantity: 2,
                    unitPrice: 2500.00,
                    subtotal: 5000.00
                }
            ],
            sellerAmount: 5000.00,
            payment: {
                paymentMethod: "CASH_ON_DELIVERY",
                paymentStatus: "PENDING",
                paymentDate: null
            },
            delivery: {
                deliveryStatus: "PROCESSING",
                deliveryDate: null,
                trackingNo: "TRK1001"
            }
        },
        {
            id: 1002,
            orderDate: "2026-09-09T11:15:00",
            orderStatus: "COMPLETED",
            customer: {
                firstName: "Nimal",
                lastName: "Silva",
                phone: "0779876543",
                deliveryAddress: "12/5, Temple Road, Kandy"
            },
            sellerItems: [
                {
                    orderItemId: 502,
                    fish: {
                        id: 18,
                        fishName: "Red Guppy Trio",
                        category: "Guppy",
                        breed: "Tuxedo",
                        fishImages: [{ imageUrl: "https://images.unsplash.com/photo-1535591273668-578e3112a443?auto=format&fit=crop&w=200&q=80", isPrimary: true }]
                    },
                    quantity: 3,
                    unitPrice: 1200.00,
                    subtotal: 3600.00
                }
            ],
            sellerAmount: 3600.00,
            payment: {
                paymentMethod: "BANK_TRANSFER",
                paymentStatus: "PAID",
                paymentDate: "2026-09-09T11:20:00"
            },
            delivery: {
                deliveryStatus: "DELIVERED",
                deliveryDate: "2026-09-11T10:00:00",
                trackingNo: "TRK1002"
            }
        },
        {
            id: 1003,
            orderDate: "2026-09-08T09:45:00",
            orderStatus: "PENDING",
            customer: {
                firstName: "Ayesha",
                lastName: "Fernando",
                phone: "0751122334",
                deliveryAddress: "88, Station Road, Gampaha"
            },
            sellerItems: [
                {
                    orderItemId: 503,
                    fish: {
                        id: 22,
                        fishName: "Platinum Angel Fish",
                        category: "Cichlid",
                        breed: "Platinum",
                        fishImages: [{ imageUrl: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=200&q=80", isPrimary: true }]
                    },
                    quantity: 1,
                    unitPrice: 4500.00,
                    subtotal: 4500.00
                }
            ],
            sellerAmount: 4500.00,
            payment: {
                paymentMethod: "ONLINE_CHECKOUT",
                paymentStatus: "PROCESSING",
                paymentDate: null
            },
            delivery: {
                deliveryStatus: "PENDING",
                deliveryDate: null,
                trackingNo: "TRK1003"
            }
        },
        {
            id: 1004,
            orderDate: "2026-09-06T16:20:00",
            orderStatus: "SHIPPED",
            customer: {
                firstName: "Chamara",
                lastName: "Bandara",
                phone: "0785544332",
                deliveryAddress: "15, Lake View, Negombo"
            },
            sellerItems: [
                {
                    orderItemId: 504,
                    fish: {
                        id: 25,
                        fishName: "Neon Tetra School (10x)",
                        category: "Tetra",
                        breed: "Neon",
                        fishImages: [{ imageUrl: "https://images.unsplash.com/photo-1522069169874-c58ec4b76be5?auto=format&fit=crop&w=200&q=80", isPrimary: true }]
                    },
                    quantity: 2,
                    unitPrice: 3000.00,
                    subtotal: 6000.00
                }
            ],
            sellerAmount: 6000.00,
            payment: {
                paymentMethod: "CASH_ON_DELIVERY",
                paymentStatus: "PENDING",
                paymentDate: null
            },
            delivery: {
                deliveryStatus: "SHIPPED",
                deliveryDate: "2026-09-07T08:00:00",
                trackingNo: "TRK1004"
            }
        },
        {
            id: 1005,
            orderDate: "2026-09-05T13:10:00",
            orderStatus: "CANCELLED",
            customer: {
                firstName: "Dilshan",
                lastName: "Madushanka",
                phone: "0701239874",
                deliveryAddress: "77, Main Street, Kurunegala"
            },
            sellerItems: [
                {
                    orderItemId: 505,
                    fish: {
                        id: 15,
                        fishName: "Blue Betta Halfmoon",
                        category: "Betta",
                        breed: "Halfmoon",
                        fishImages: [{ imageUrl: "https://images.unsplash.com/photo-1522069169874-c58ec4b76be5?auto=format&fit=crop&w=200&q=80", isPrimary: true }]
                    },
                    quantity: 1,
                    unitPrice: 2500.00,
                    subtotal: 2500.00
                }
            ],
            sellerAmount: 2500.00,
            payment: {
                paymentMethod: "ONLINE_CHECKOUT",
                paymentStatus: "CANCELLED",
                paymentDate: null
            },
            delivery: {
                deliveryStatus: "CANCELLED",
                deliveryDate: null,
                trackingNo: "TRK1005"
            }
        },
        {
            id: 1006,
            orderDate: "2026-09-03T10:00:00",
            orderStatus: "COMPLETED",
            customer: {
                firstName: "Priyanka",
                lastName: "Jayasinghe",
                phone: "0718877665",
                deliveryAddress: "33, Flower Road, Colombo 07"
            },
            sellerItems: [
                {
                    orderItemId: 506,
                    fish: {
                        id: 30,
                        fishName: "Discus Red Turquoise",
                        category: "Discus",
                        breed: "Turquoise",
                        fishImages: [{ imageUrl: "https://images.unsplash.com/photo-1535591273668-578e3112a443?auto=format&fit=crop&w=200&q=80", isPrimary: true }]
                    },
                    quantity: 1,
                    unitPrice: 8500.00,
                    subtotal: 8500.00
                }
            ],
            sellerAmount: 8500.00,
            payment: {
                paymentMethod: "BANK_TRANSFER",
                paymentStatus: "PAID",
                paymentDate: "2026-09-03T10:30:00"
            },
            delivery: {
                deliveryStatus: "DELIVERED",
                deliveryDate: "2026-09-05T14:00:00",
                trackingNo: "TRK1006"
            }
        },
        {
            id: 1007,
            orderDate: "2026-08-28T15:45:00",
            orderStatus: "COMPLETED",
            customer: {
                firstName: "Ruwan",
                lastName: "Kumara",
                phone: "0723344556",
                deliveryAddress: "90, Station Road, Matara"
            },
            sellerItems: [
                {
                    orderItemId: 507,
                    fish: {
                        id: 18,
                        fishName: "Red Guppy Trio",
                        category: "Guppy",
                        breed: "Tuxedo",
                        fishImages: [{ imageUrl: "https://images.unsplash.com/photo-1535591273668-578e3112a443?auto=format&fit=crop&w=200&q=80", isPrimary: true }]
                    },
                    quantity: 4,
                    unitPrice: 1200.00,
                    subtotal: 4800.00
                }
            ],
            sellerAmount: 4800.00,
            payment: {
                paymentMethod: "CASH_ON_DELIVERY",
                paymentStatus: "PAID",
                paymentDate: "2026-08-30T12:00:00"
            },
            delivery: {
                deliveryStatus: "DELIVERED",
                deliveryDate: "2026-08-30T12:00:00",
                trackingNo: "TRK1007"
            }
        },
        {
            id: 1008,
            orderDate: "2026-08-20T11:30:00",
            orderStatus: "COMPLETED",
            customer: {
                firstName: "Sanduni",
                lastName: "Perera",
                phone: "0771122334",
                deliveryAddress: "5, Hill Street, Nuwara Eliya"
            },
            sellerItems: [
                {
                    orderItemId: 508,
                    fish: {
                        id: 22,
                        fishName: "Platinum Angel Fish",
                        category: "Cichlid",
                        breed: "Platinum",
                        fishImages: [{ imageUrl: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=200&q=80", isPrimary: true }]
                    },
                    quantity: 2,
                    unitPrice: 4500.00,
                    subtotal: 9000.00
                }
            ],
            sellerAmount: 9000.00,
            payment: {
                paymentMethod: "ONLINE_CHECKOUT",
                paymentStatus: "PAID",
                paymentDate: "2026-08-20T11:35:00"
            },
            delivery: {
                deliveryStatus: "DELIVERED",
                deliveryDate: "2026-08-23T15:00:00",
                trackingNo: "TRK1008"
            }
        }
    ];

    calculateMockStats();
}

function calculateMockStats() {
    let total = state.orders.length;
    let pending = 0, processing = 0, completed = 0, cancelled = 0, sales = 0;

    state.orders.forEach(ord => {
        if (ord.orderStatus === "PENDING" || ord.orderStatus === "CONFIRMED") pending++;
        else if (ord.orderStatus === "PROCESSING" || ord.orderStatus === "SHIPPED") processing++;
        else if (ord.orderStatus === "COMPLETED" || ord.orderStatus === "DELIVERED") completed++;
        else if (ord.orderStatus === "CANCELLED") cancelled++;

        sales += (ord.sellerAmount || 0);
    });

    state.stats = {
        totalOrders: total,
        pendingOrders: pending,
        processingOrders: processing,
        completedOrders: completed,
        cancelledOrders: cancelled,
        sellerSales: sales
    };
}

// Spring Boot API Integration Placeholders
async function fetchOrdersFromAPI() {
    const token = localStorage.getItem("token");
    const queryParams = new URLSearchParams({
        page: state.currentPage - 1,
        size: state.pageSize,
        search: state.search,
        status: state.orderStatus,
        paymentStatus: state.paymentStatus,
        deliveryStatus: state.deliveryStatus,
        period: state.period,
        sort: state.sortBy
    });

    const response = await fetch(`${API_BASE_URL}/sellers/me/orders?${queryParams.toString()}`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    if (!response.ok) throw new Error(handleApiError(response.status));
    const data = await response.json();

    // Support both Spring Page response and plain array
    if (Array.isArray(data)) {
        state.orders = data;
        state.totalElements = data.length;
        state.totalPages = Math.ceil(data.length / state.pageSize);
    } else {
        state.orders = data.content || [];
        state.totalElements = data.totalElements || 0;
        state.totalPages = data.totalPages || 1;
    }
}

async function fetchOrderStatsFromAPI() {
    const token = localStorage.getItem("token");
    const response = await fetch(`${API_BASE_URL}/sellers/me/orders/stats`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    if (!response.ok) throw new Error(handleApiError(response.status));
    state.stats = await response.json();
}

// Filtering, Searching & Sorting Logic
function initializeFilters() {
    let searchTimeout;
    searchInput.addEventListener("input", (e) => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            state.search = e.target.value.trim();
            state.currentPage = 1;
            applyFiltersAndSort();
            renderOrders();
        }, 350);
    });

    periodFilter.addEventListener("change", (e) => {
        state.period = e.target.value;
        state.currentPage = 1;
        applyFiltersAndSort();
        renderOrders();
    });

    orderStatusFilter.addEventListener("change", (e) => {
        state.orderStatus = e.target.value;
        state.currentPage = 1;
        applyFiltersAndSort();
        renderOrders();
    });

    paymentStatusFilter.addEventListener("change", (e) => {
        state.paymentStatus = e.target.value;
        state.currentPage = 1;
        applyFiltersAndSort();
        renderOrders();
    });

    deliveryStatusFilter.addEventListener("change", (e) => {
        state.deliveryStatus = e.target.value;
        state.currentPage = 1;
        applyFiltersAndSort();
        renderOrders();
    });

    sortBySelect.addEventListener("change", (e) => {
        state.sortBy = e.target.value;
        applyFiltersAndSort();
        renderOrders();
    });

    clearFiltersBtn.addEventListener("click", resetAllFilters);
    resetSearchFiltersBtn.addEventListener("click", resetAllFilters);
    refreshBtn.addEventListener("click", () => loadOrdersData());
}

function resetAllFilters() {
    searchInput.value = "";
    periodFilter.value = "all";
    orderStatusFilter.value = "";
    paymentStatusFilter.value = "";
    deliveryStatusFilter.value = "";
    sortBySelect.value = "newest";

    state.search = "";
    state.period = "all";
    state.orderStatus = "";
    state.paymentStatus = "";
    state.deliveryStatus = "";
    state.sortBy = "newest";
    state.currentPage = 1;

    applyFiltersAndSort();
    renderOrders();
    showToast("Filters cleared.", "info");
}

function applyFiltersAndSort() {
    if (!USE_MOCK_DATA) return; // If API mode, backend handles pagination/filtering

    let list = [...state.orders];

    // Search filter
    if (state.search) {
        const query = state.search.toLowerCase();
        list = list.filter(ord => {
            const matchId = ord.id.toString().includes(query) || `ord-${ord.id}`.toLowerCase().includes(query);
            const matchCustomer = `${ord.customer?.firstName || ''} ${ord.customer?.lastName || ''}`.toLowerCase().includes(query);
            const matchTracking = (ord.delivery?.trackingNo || '').toLowerCase().includes(query);
            const matchFish = ord.sellerItems?.some(item => (item.fish?.fishName || '').toLowerCase().includes(query));
            return matchId || matchCustomer || matchTracking || matchFish;
        });
    }

    // Order status filter
    if (state.orderStatus) {
        list = list.filter(ord => ord.orderStatus === state.orderStatus);
    }

    // Payment status filter
    if (state.paymentStatus) {
        list = list.filter(ord => ord.payment?.paymentStatus === state.paymentStatus);
    }

    // Delivery status filter
    if (state.deliveryStatus) {
        list = list.filter(ord => ord.delivery?.deliveryStatus === state.deliveryStatus);
    }

    // Period filter
    if (state.period !== "all") {
        const now = new Date();
        list = list.filter(ord => {
            const orderDate = new Date(ord.orderDate);
            const diffTime = Math.abs(now - orderDate);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            if (state.period === "today") return diffDays <= 1;
            if (state.period === "7days") return diffDays <= 7;
            if (state.period === "30days") return diffDays <= 30;
            if (state.period === "3months") return diffDays <= 90;
            if (state.period === "year") return orderDate.getFullYear() === now.getFullYear();
            return true;
        });
    }

    // Sorting
    list.sort((a, b) => {
        if (state.sortBy === "newest") return new Date(b.orderDate) - new Date(a.orderDate);
        if (state.sortBy === "oldest") return new Date(a.orderDate) - new Date(b.orderDate);
        if (state.sortBy === "highestAmount") return (b.sellerAmount || 0) - (a.sellerAmount || 0);
        if (state.sortBy === "lowestAmount") return (a.sellerAmount || 0) - (b.sellerAmount || 0);
        if (state.sortBy === "status") return (a.orderStatus || "").localeCompare(b.orderStatus || "");
        return 0;
    });

    state.totalElements = list.length;
    state.totalPages = Math.max(1, Math.ceil(state.totalElements / state.pageSize));

    // Pagination slice
    const startIndex = (state.currentPage - 1) * state.pageSize;
    state.filteredOrders = list.slice(startIndex, startIndex + state.pageSize);
}

// Rendering Statistics & Orders
function renderStatistics() {
    statTotalOrders.textContent = state.stats.totalOrders || 0;
    statPendingOrders.textContent = state.stats.pendingOrders || 0;
    statProcessingOrders.textContent = state.stats.processingOrders || 0;
    statCompletedOrders.textContent = state.stats.completedOrders || 0;
    statCancelledOrders.textContent = state.stats.cancelledOrders || 0;
    statSellerSales.textContent = formatCurrency(state.stats.sellerSales || 0);
}

function renderOrders() {
    ordersCountHeading.textContent = state.totalElements;

    if (state.orders.length === 0) {
        loadingState.classList.add("hidden");
        tableViewWrapper.classList.add("hidden");
        cardViewWrapper.classList.add("hidden");
        emptyState.classList.remove("hidden");
        noMatchState.classList.add("hidden");
        paginationFooter.classList.add("hidden");
        return;
    }

    if (state.filteredOrders.length === 0) {
        loadingState.classList.add("hidden");
        tableViewWrapper.classList.add("hidden");
        cardViewWrapper.classList.add("hidden");
        emptyState.classList.add("hidden");
        noMatchState.classList.remove("hidden");
        paginationFooter.classList.add("hidden");
        return;
    }

    emptyState.classList.add("hidden");
    noMatchState.classList.add("hidden");
    loadingState.classList.add("hidden");
    paginationFooter.classList.remove("hidden");

    if (state.viewMode === "table") {
        tableViewWrapper.classList.remove("hidden");
        cardViewWrapper.classList.add("hidden");
        renderOrderTable();
    } else {
        tableViewWrapper.classList.add("hidden");
        cardViewWrapper.classList.remove("hidden");
        renderOrderCards();
    }

    renderPagination();
}

function renderOrderTable() {
    ordersTableBody.innerHTML = "";

    state.filteredOrders.forEach(ord => {
        const tr = document.createElement("tr");
        const firstItem = ord.sellerItems?.[0];
        const fish = firstItem?.fish;
        const fishImage = getPrimaryFishImage(fish);
        const fishName = fish ? fish.fishName : "Seller Fish Item";
        const totalFishCount = ord.sellerItems?.reduce((sum, item) => sum + item.quantity, 0) || 1;

        tr.innerHTML = `
            <td><strong>#ORD-${ord.id}</strong></td>
            <td>${formatDate(ord.orderDate)}</td>
            <td>${escapeHtml(ord.customer?.firstName || 'Customer')} ${escapeHtml(ord.customer?.lastName?.[0] || '')}.</td>
            <td>
                <div class="fish-cell-group">
                    <img src="${escapeHtml(resolveImageUrl(fishImage))}" alt="Fish" class="fish-cell-thumb">
                    <div class="fish-cell-info">
                        <span class="fish-cell-name">${escapeHtml(fishName)}</span>
                        <span class="fish-cell-meta">${ord.sellerItems?.length > 1 ? `+ ${ord.sellerItems.length - 1} more item(s)` : escapeHtml(fish?.category || '')}</span>
                    </div>
                </div>
            </td>
            <td>${totalFishCount}</td>
            <td><strong class="text-accent">${formatCurrency(ord.sellerAmount || 0)}</strong></td>
            <td><span class="badge ${getPaymentStatusClass(ord.payment?.paymentStatus)}">${escapeHtml(ord.payment?.paymentStatus || 'PENDING')}</span></td>
            <td><span class="badge ${getDeliveryStatusClass(ord.delivery?.deliveryStatus)}">${escapeHtml(ord.delivery?.deliveryStatus || 'PENDING')}</span></td>
            <td><span class="badge ${getOrderStatusClass(ord.orderStatus)}">${escapeHtml(ord.orderStatus || 'PENDING')}</span></td>
            <td class="text-right">
                <button class="btn btn-sm btn-outline" onclick="openOrderDetailsModal(${ord.id})" title="View Details"><i class="fa-solid fa-eye"></i></button>
            </td>
        `;
        ordersTableBody.appendChild(tr);
    });
}

function renderOrderCards() {
    cardViewWrapper.innerHTML = "";

    state.filteredOrders.forEach(ord => {
        const card = document.createElement("div");
        card.className = "order-card-item";
        const firstItem = ord.sellerItems?.[0];
        const fish = firstItem?.fish;
        const fishImage = getPrimaryFishImage(fish);
        const fishName = fish ? fish.fishName : "Seller Fish Item";

        card.innerHTML = `
            <div class="order-card-header">
                <span class="order-card-id">#ORD-${ord.id}</span>
                <span class="order-card-date">${formatDate(ord.orderDate)}</span>
            </div>
            <div class="order-card-body">
                <div class="fish-cell-group">
                    <img src="${escapeHtml(resolveImageUrl(fishImage))}" alt="Fish" class="fish-cell-thumb">
                    <div class="fish-cell-info">
                        <span class="fish-cell-name">${escapeHtml(fishName)}</span>
                        <span class="fish-cell-meta">Customer: ${escapeHtml(ord.customer?.firstName || 'Customer')}</span>
                    </div>
                </div>
                <div class="order-card-row">
                    <span class="text-muted">Seller Revenue:</span>
                    <strong class="text-accent">${formatCurrency(ord.sellerAmount || 0)}</strong>
                </div>
                <div class="order-card-row">
                    <span class="text-muted">Payment:</span>
                    <span class="badge ${getPaymentStatusClass(ord.payment?.paymentStatus)}">${escapeHtml(ord.payment?.paymentStatus || 'PENDING')}</span>
                </div>
                <div class="order-card-row">
                    <span class="text-muted">Delivery:</span>
                    <span class="badge ${getDeliveryStatusClass(ord.delivery?.deliveryStatus)}">${escapeHtml(ord.delivery?.deliveryStatus || 'PENDING')}</span>
                </div>
                <div class="order-card-row">
                    <span class="text-muted">Order Status:</span>
                    <span class="badge ${getOrderStatusClass(ord.orderStatus)}">${escapeHtml(ord.orderStatus || 'PENDING')}</span>
                </div>
            </div>
            <div class="order-card-footer">
                <button class="btn btn-sm btn-outline" onclick="openOrderDetailsModal(${ord.id})"><i class="fa-solid fa-eye"></i> View Details</button>
            </div>
        `;
        cardViewWrapper.appendChild(card);
    });
}

// Pagination Rendering
function renderPagination() {
    const startItem = state.totalElements === 0 ? 0 : (state.currentPage - 1) * state.pageSize + 1;
    const endItem = Math.min(state.currentPage * state.pageSize, state.totalElements);
    paginationInfo.textContent = `Showing ${startItem}-${endItem} of ${state.totalElements} orders`;

    paginationControls.innerHTML = "";

    // Prev Button
    const prevBtn = document.createElement("button");
    prevBtn.className = "page-btn";
    prevBtn.innerHTML = `<i class="fa-solid fa-chevron-left"></i>`;
    prevBtn.disabled = state.currentPage === 1;
    prevBtn.onclick = () => {
        if (state.currentPage > 1) {
            state.currentPage--;
            applyFiltersAndSort();
            renderOrders();
        }
    };
    paginationControls.appendChild(prevBtn);

    // Page Numbers
    for (let i = 1; i <= state.totalPages; i++) {
        if (i === 1 || i === state.totalPages || (i >= state.currentPage - 1 && i <= state.currentPage + 1)) {
            const pageBtn = document.createElement("button");
            pageBtn.className = `page-btn ${i === state.currentPage ? 'active' : ''}`;
            pageBtn.textContent = i;
            pageBtn.onclick = () => {
                state.currentPage = i;
                applyFiltersAndSort();
                renderOrders();
            };
            paginationControls.appendChild(pageBtn);
        } else if (i === state.currentPage - 2 || i === state.currentPage + 2) {
            const dots = document.createElement("span");
            dots.className = "page-btn";
            dots.textContent = "...";
            dots.disabled = true;
            paginationControls.appendChild(dots);
        }
    }

    // Next Button
    const nextBtn = document.createElement("button");
    nextBtn.className = "page-btn";
    nextBtn.innerHTML = `<i class="fa-solid fa-chevron-right"></i>`;
    nextBtn.disabled = state.currentPage === state.totalPages || state.totalPages === 0;
    nextBtn.onclick = () => {
        if (state.currentPage < state.totalPages) {
            state.currentPage++;
            applyFiltersAndSort();
            renderOrders();
        }
    };
    paginationControls.appendChild(nextBtn);
}

// View Mode Toggles
function initializeViewToggles() {
    tableViewBtn.addEventListener("click", () => {
        state.viewMode = "table";
        tableViewBtn.classList.add("active");
        cardViewBtn.classList.remove("active");
        renderOrders();
    });

    cardViewBtn.addEventListener("click", () => {
        state.viewMode = "card";
        cardViewBtn.classList.add("active");
        tableViewBtn.classList.remove("active");
        renderOrders();
    });
}

// Order Details Modal & Status Workflow
function openOrderDetailsModal(orderId) {
    const ord = state.orders.find(o => o.id === orderId);
    if (!ord) return;

    state.selectedOrder = ord;
    modalOrderIdBadge.textContent = `#ORD-${ord.id}`;
    modalStatusSelect.value = ord.orderStatus;

    let itemsHtml = "";
    ord.sellerItems?.forEach(item => {
        const fish = item.fish;
        const fishImage = getPrimaryFishImage(fish);
        itemsHtml += `
            <tr>
                <td>
                    <div class="fish-cell-group">
                        <img src="${escapeHtml(resolveImageUrl(fishImage))}" alt="Fish" class="fish-cell-thumb">
                        <div class="fish-cell-info">
                            <span class="fish-cell-name">${escapeHtml(fish?.fishName || 'Fish Item')}</span>
                            <span class="fish-cell-meta">ID: #${fish?.id || '--'} • ${escapeHtml(fish?.category || '')}</span>
                        </div>
                    </div>
                </td>
                <td>${formatCurrency(item.unitPrice || 0)}</td>
                <td>${item.quantity || 1}</td>
                <td><strong>${formatCurrency(item.subtotal || 0)}</strong></td>
            </tr>
        `;
    });

    orderDetailsModalBody.innerHTML = `
        <div class="modal-section-title"><i class="fa-solid fa-circle-info"></i> Order Summary</div>
        <div class="modal-info-grid">
            <div class="modal-info-item">
                <span class="lbl">Order Date</span>
                <span class="val">${formatDateTime(ord.orderDate)}</span>
            </div>
            <div class="modal-info-item">
                <span class="lbl">Order Status</span>
                <span class="val"><span class="badge ${getOrderStatusClass(ord.orderStatus)}">${escapeHtml(ord.orderStatus)}</span></span>
            </div>
            <div class="modal-info-item">
                <span class="lbl">Seller-Attributable Amount</span>
                <span class="val text-accent">${formatCurrency(ord.sellerAmount || 0)}</span>
            </div>
            <div class="modal-info-item">
                <span class="lbl">Tracking Number</span>
                <span class="val">${escapeHtml(ord.delivery?.trackingNo || 'N/A')}</span>
            </div>
        </div>

        <div class="modal-section-title mt-3"><i class="fa-solid fa-user"></i> Customer & Fulfillment Information</div>
        <div class="modal-info-grid">
            <div class="modal-info-item">
                <span class="lbl">Customer Name</span>
                <span class="val">${escapeHtml(ord.customer?.firstName || '')} ${escapeHtml(ord.customer?.lastName || '')}</span>
            </div>
            <div class="modal-info-item">
                <span class="lbl">Contact Phone</span>
                <span class="val">${escapeHtml(ord.customer?.phone || 'Authorized Only')}</span>
            </div>
            <div class="modal-info-item" style="grid-column: span 2;">
                <span class="lbl">Delivery Address</span>
                <span class="val">${escapeHtml(ord.customer?.deliveryAddress || ord.delivery?.deliveryAddress || 'Authorized Delivery Address')}</span>
            </div>
        </div>

        <div class="modal-section-title mt-3"><i class="fa-solid fa-fish"></i> Seller-Specific Order Items (${ord.sellerItems?.length || 0})</div>
        <div class="table-responsive">
            <table class="modal-items-table">
                <thead>
                    <tr>
                        <th>Fish Item</th>
                        <th>Unit Price</th>
                        <th>Qty</th>
                        <th>Subtotal</th>
                    </tr>
                </thead>
                <tbody>
                    ${itemsHtml}
                </tbody>
            </table>
        </div>

        <div class="modal-section-title mt-3"><i class="fa-solid fa-credit-card"></i> Payment Information</div>
        <div class="modal-info-grid">
            <div class="modal-info-item">
                <span class="lbl">Payment Method</span>
                <span class="val">${escapeHtml(ord.payment?.paymentMethod || 'CASH_ON_DELIVERY')}</span>
            </div>
            <div class="modal-info-item">
                <span class="lbl">Payment Status</span>
                <span class="val"><span class="badge ${getPaymentStatusClass(ord.payment?.paymentStatus)}">${escapeHtml(ord.payment?.paymentStatus || 'PENDING')}</span></span>
            </div>
        </div>
    `;

    orderDetailsModal.classList.add("show");
    orderDetailsModal.setAttribute("aria-hidden", "false");
}

function closeOrderDetailsModal() {
    orderDetailsModal.classList.remove("show");
    orderDetailsModal.setAttribute("aria-hidden", "true");
}

function initializeModals() {
    modalCloseBtn.addEventListener("click", closeOrderDetailsModal);
    modalCloseActionBtn.addEventListener("click", closeOrderDetailsModal);
    orderDetailsModal.addEventListener("click", (e) => {
        if (e.target === orderDetailsModal) closeOrderDetailsModal();
    });

    modalUpdateStatusBtn.addEventListener("click", () => {
        if (!state.selectedOrder) return;
        const newStatus = modalStatusSelect.value;
        if (newStatus === state.selectedOrder.orderStatus) {
            showToast("Order is already in this status.", "info");
            return;
        }
        state.statusToUpdate = state.selectedOrder.id;
        state.newStatusTarget = newStatus;
        statusConfirmText.textContent = `Are you sure you want to change Order #ORD-${state.selectedOrder.id} status to ${newStatus}?`;
        statusConfirmModal.classList.add("show");
        statusConfirmModal.setAttribute("aria-hidden", "false");
    });

    statusConfirmCloseBtn.addEventListener("click", closeStatusConfirmModal);
    statusConfirmCancelBtn.addEventListener("click", closeStatusConfirmModal);
    statusConfirmModal.addEventListener("click", (e) => {
        if (e.target === statusConfirmModal) closeStatusConfirmModal();
    });

    statusConfirmSubmitBtn.addEventListener("click", confirmOrderStatusUpdate);
}

function closeStatusConfirmModal() {
    statusConfirmModal.classList.remove("show");
    statusConfirmModal.setAttribute("aria-hidden", "true");
}

async function confirmOrderStatusUpdate() {
    if (!state.statusToUpdate || !state.newStatusTarget) return;
    const orderId = state.statusToUpdate;
    const newStatus = state.newStatusTarget;

    statusConfirmSubmitBtn.disabled = true;
    statusConfirmSubmitBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Updating...`;

    try {
        if (USE_MOCK_DATA) {
            await new Promise(resolve => setTimeout(resolve, 800));
            const ord = state.orders.find(o => o.id === orderId);
            if (ord) {
                ord.orderStatus = newStatus;
            }
            calculateMockStats();
            applyFiltersAndSort();
            renderStatistics();
            renderOrders();
            closeStatusConfirmModal();
            closeOrderDetailsModal();
            showToast(`Demo mode: Order #ORD-${orderId} status updated to ${newStatus}.`, "success");
        } else {
            const token = localStorage.getItem("token");
            const response = await fetch(`${API_BASE_URL}/sellers/me/orders/${orderId}/status`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ orderStatus: newStatus })
            });

            if (!response.ok) throw new Error(handleApiError(response.status));

            await loadOrdersData();
            closeStatusConfirmModal();
            closeOrderDetailsModal();
            showToast(`Order #ORD-${orderId} status updated successfully.`, "success");
        }
    } catch (error) {
        showToast(error.message || "Failed to update order status.", "error");
    } finally {
        statusConfirmSubmitBtn.disabled = false;
        statusConfirmSubmitBtn.textContent = "Confirm Update";
    }
}

// CSV Export
function exportOrdersCSV() {
    if (state.orders.length === 0) {
        showToast("No orders available to export.", "warning");
        return;
    }

    const headers = ["Order ID", "Date", "Customer Name", "Fish Name", "Quantity", "Seller Amount (LKR)", "Payment Status", "Delivery Status", "Order Status"];
    let csvContent = "data:text/csv;charset=utf-8," + headers.join(",") + "\n";

    state.filteredOrders.forEach(ord => {
        ord.sellerItems?.forEach(item => {
            const row = [
                `ORD-${ord.id}`,
                formatDate(ord.orderDate),
                `"${ord.customer?.firstName || ''} ${ord.customer?.lastName || ''}"`,
                `"${item.fish?.fishName || 'Fish'}"`,
                item.quantity,
                item.subtotal,
                ord.payment?.paymentStatus || 'PENDING',
                ord.delivery?.deliveryStatus || 'PENDING',
                ord.orderStatus
            ];
            csvContent += row.join(",") + "\n";
        });
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    const dateStr = new Date().toISOString().split('T')[0];
    link.setAttribute("download", `seller-orders-${dateStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast("Seller orders CSV exported successfully.", "success");
}

// Sidebar & Header UI
function initializeSidebar() {
    sidebarToggleBtn.addEventListener("click", () => sellerSidebar.classList.toggle("open"));
    sidebarCloseBtn.addEventListener("click", () => sellerSidebar.classList.remove("open"));

    const handleLogout = (e) => {
        e.preventDefault();
        localStorage.removeItem("token");
        localStorage.removeItem("userId");
        localStorage.removeItem("username");
        localStorage.removeItem("role");
        window.location.href = "../login.html";
    };
    logoutBtn.addEventListener("click", handleLogout);
    dropdownLogoutBtn.addEventListener("click", handleLogout);
}

function initializeNotifications() {
    notificationBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        notificationPanel.classList.toggle("show");
        profileDropdownMenu.classList.remove("show");
    });

    profileDropdownBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        profileDropdownMenu.classList.toggle("show");
        notificationPanel.classList.remove("show");
    });

    markAllReadBtn.addEventListener("click", () => {
        document.querySelectorAll(".notification-item").forEach(item => item.classList.remove("unread"));
        notificationBadge.classList.add("hidden");
        showToast("All notifications marked as read.", "success");
    });

    document.addEventListener("click", () => {
        notificationPanel.classList.remove("show");
        profileDropdownMenu.classList.remove("show");
    });

    exportCsvBtn.addEventListener("click", exportOrdersCSV);
}

// State Views
function showLoadingState() {
    state.isLoading = true;
    loadingState.classList.remove("hidden");
    tableViewWrapper.classList.add("hidden");
    cardViewWrapper.classList.add("hidden");
    emptyState.classList.add("hidden");
    noMatchState.classList.add("hidden");
    paginationFooter.classList.add("hidden");
}

function showErrorState(message) {
    loadingState.classList.add("hidden");
    tableViewWrapper.classList.add("hidden");
    cardViewWrapper.classList.add("hidden");
    emptyState.classList.add("hidden");
    noMatchState.classList.add("hidden");
    paginationFooter.classList.add("hidden");

    const container = document.querySelector(".orders-container-card");
    const existingError = document.getElementById("errorStateDiv");
    if (existingError) existingError.remove();

    const errDiv = document.createElement("div");
    errDiv.id = "errorStateDiv";
    errDiv.className = "empty-state";
    errDiv.innerHTML = `
        <div class="empty-icon text-danger"><i class="fa-solid fa-triangle-exclamation"></i></div>
        <h3 class="mt-3">Unable to Load Orders</h3>
        <p class="text-muted mt-2">${escapeHtml(message)}</p>
        <div class="mt-3" style="display: flex; gap: 1rem; justify-content: center;">
            <button class="btn btn-primary" onclick="loadOrdersData()"><i class="fa-solid fa-rotate-right"></i> Retry</button>
            <button class="btn btn-outline" onclick="window.location.href='seller-dashboard.html'"><i class="fa-solid fa-chart-pie"></i> Dashboard</button>
        </div>
    `;
    container.appendChild(errDiv);
}

// Helpers & Formatters
function getPrimaryFishImage(fish) {
    if (!fish || !fish.fishImages || fish.fishImages.length === 0) {
        return "https://via.placeholder.com/150?text=Fish";
    }
    const primary = fish.fishImages.find(img => img.isPrimary);
    return primary ? primary.imageUrl : fish.fishImages[0].imageUrl;
}

function resolveImageUrl(url) {
    if (!url) return "https://via.placeholder.com/150?text=Fish";
    if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("blob:")) {
        return url;
    }
    return `${API_BASE_URL.replace("/api", "")}${url}`;
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('en-LK', {
        style: 'currency',
        currency: 'LKR'
    }).format(amount);
}

function formatDate(dateString) {
    if (!dateString) return "--";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

function formatDateTime(dateString) {
    if (!dateString) return "--";
    const date = new Date(dateString);
    return date.toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function getOrderStatusClass(status) {
    switch ((status || "").toUpperCase()) {
        case "PENDING": return "status-pending";
        case "CONFIRMED": return "status-confirmed";
        case "PROCESSING": return "status-processing";
        case "SHIPPED": return "status-shipped";
        case "DELIVERED": return "status-delivered";
        case "COMPLETED": return "status-completed";
        case "CANCELLED": return "status-cancelled";
        default: return "status-pending";
    }
}

function getPaymentStatusClass(status) {
    switch ((status || "").toUpperCase()) {
        case "PAID": return "status-completed";
        case "PENDING": return "status-pending";
        case "PROCESSING": return "status-processing";
        case "FAILED": case "CANCELLED": return "status-cancelled";
        default: return "status-pending";
    }
}

function getDeliveryStatusClass(status) {
    switch ((status || "").toUpperCase()) {
        case "DELIVERED": return "status-completed";
        case "SHIPPED": case "OUT_FOR_DELIVERY": return "status-shipped";
        case "PROCESSING": return "status-processing";
        case "PENDING": return "status-pending";
        case "CANCELLED": return "status-cancelled";
        default: return "status-pending";
    }
}

function handleApiError(status) {
    switch (status) {
        case 401: return "Your session has expired. Please sign in again.";
        case 403: return "You do not have permission to view these orders.";
        case 404: return "Order records were not found.";
        case 500: return "Server error occurred while fetching orders.";
        default: return "Unable to connect to the server. Check your connection.";
    }
}

function escapeHtml(str) {
    if (!str) return "";
    return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function showToast(message, type = "success") {
    const toast = document.createElement("div");
    toast.className = `toast ${type}`;

    let icon = "fa-circle-check";
    if (type === "error") icon = "fa-circle-xmark";
    if (type === "warning") icon = "fa-triangle-exclamation";
    if (type === "info") icon = "fa-circle-info";

    toast.innerHTML = `
        <i class="fa-solid ${icon}"></i>
        <span>${escapeHtml(message)}</span>
    `;

    toastContainer.appendChild(toast);
    setTimeout(() => {
        toast.remove();
    }, 3000);
}

// =====================================================
// SPRING BOOT API INTEGRATION
// =====================================================
//
// Seller Orders:
// GET /api/sellers/me/orders
//
// Order Details:
// GET /api/sellers/me/orders/{orderId}
//
// Statistics:
// GET /api/sellers/me/orders/stats
//
// Update Status:
// PATCH /api/sellers/me/orders/{orderId}/status
//
// IMPORTANT:
// Backend must derive seller identity from authentication.
// Never send sellerId from the frontend.
// Backend must filter Order_Items by seller ownership.
// Backend must enforce order-status transition rules.
// =====================================================