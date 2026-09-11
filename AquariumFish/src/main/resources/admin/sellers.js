/**
 * Aquarium Fish Admin Panel - Seller Management JavaScript
 */

const API_BASE_URL = "http://localhost:8080/api";
const USE_MOCK_DATA = true;
const PAGE_SIZE = 10;
const LOW_STOCK_THRESHOLD = 5;

// Global State Management
const state = {
    sellers: [],
    filteredSellers: [],
    currentPage: 1,
    pageSize: PAGE_SIZE,
    searchTerm: "",
    statusFilter: "ALL",
    activityFilter: "ALL",
    sizeFilter: "ALL",
    dateFilter: "ALL",
    sortBy: "NEWEST",
    selectedSeller: null,
    statusTargetSeller: null
};

// Mock Datasets
const MOCK_SELLERS = [
    {
        id: 2001,
        userId: 601,
        shopName: "Ocean Life Aquatics",
        sellerName: "Kasun Perera",
        username: "kasun.aquatics",
        email: "kasun@example.com",
        phone: "+94 77 123 4567",
        address: "Colombo 05, Sri Lanka",
        status: "ACTIVE",
        joinedDate: "2026-07-18",
        listingCount: 18,
        totalStock: 142,
        lowStockCount: 3,
        orderCount: 36,
        totalSales: 485000,
        fish: [
            { id: 3010, fishName: "Blue Guppy", price: 2500, stockQty: 14, category: "Freshwater", status: "ACTIVE" },
            { id: 3011, fishName: "Red Velvet Swordtail", price: 1800, stockQty: 3, category: "Freshwater", status: "ACTIVE" },
            { id: 3012, fishName: "Neon Tetra School", price: 3500, stockQty: 25, category: "Freshwater", status: "ACTIVE" }
        ]
    },
    {
        id: 2002,
        userId: 602,
        shopName: "AquaParadise Kandy",
        sellerName: "Nuwan Jayasinghe",
        username: "nuwan.aqua",
        email: "nuwan@example.com",
        phone: "+94 81 223 4455",
        address: "Peradeniya Rd, Kandy",
        status: "ACTIVE",
        joinedDate: "2026-06-12",
        listingCount: 24,
        totalStock: 210,
        lowStockCount: 1,
        orderCount: 52,
        totalSales: 720000,
        fish: [
            { id: 3020, fishName: "Golden Angelfish", price: 4500, stockQty: 8, category: "Cichlids", status: "ACTIVE" },
            { id: 3021, fishName: "Blue Discus", price: 12500, stockQty: 2, category: "Cichlids", status: "ACTIVE" }
        ]
    },
    {
        id: 2003,
        userId: 603,
        shopName: "Gampaha Marine Hub",
        sellerName: "Sanduni Fernando",
        username: "sanduni.marine",
        email: "sanduni@example.com",
        phone: "+94 33 222 7890",
        address: "Colombo Rd, Gampaha",
        status: "ACTIVE",
        joinedDate: "2026-08-01",
        listingCount: 12,
        totalStock: 95,
        lowStockCount: 4,
        orderCount: 19,
        totalSales: 310000,
        fish: [
            { id: 3030, fishName: "Clownfish Ocellaris", price: 6500, stockQty: 4, category: "Marine", status: "ACTIVE" }
        ]
    },
    {
        id: 2004,
        userId: 604,
        shopName: "Negombo Reefs",
        sellerName: "Dilshan Silva",
        username: "dilshan.reefs",
        email: "dilshan@example.com",
        phone: "+94 31 223 1122",
        address: "Poruthota Rd, Negombo",
        status: "SUSPENDED",
        joinedDate: "2026-03-15",
        listingCount: 5,
        totalStock: 12,
        lowStockCount: 5,
        orderCount: 8,
        totalSales: 95000,
        fish: [
            { id: 3040, fishName: "Damselfish Blue", price: 2200, stockQty: 2, category: "Marine", status: "INACTIVE" }
        ]
    },
    {
        id: 2005,
        userId: 605,
        shopName: "Southern Aquatic World",
        sellerName: "Chaminda Rathnayake",
        username: "chaminda.south",
        email: "chaminda@example.com",
        phone: "+94 91 224 5566",
        address: "Galle Rd, Galle",
        status: "ACTIVE",
        joinedDate: "2026-05-20",
        listingCount: 30,
        totalStock: 340,
        lowStockCount: 0,
        orderCount: 88,
        totalSales: 1250000,
        fish: [
            { id: 3050, fishName: "Flowerhorn Cichlid", price: 15000, stockQty: 10, category: "Cichlids", status: "ACTIVE" }
        ]
    },
    {
        id: 2006,
        userId: 606,
        shopName: "Exotic Bettas SL",
        sellerName: "Imalka Wickramasinghe",
        username: "imalka.betta",
        email: "imalka@example.com",
        phone: "+94 11 288 9900",
        address: "Nawala Rd, Rajagiriya",
        status: "ACTIVE",
        joinedDate: "2026-08-22",
        listingCount: 8,
        totalStock: 45,
        lowStockCount: 2,
        orderCount: 31,
        totalSales: 210000,
        fish: [
            { id: 3060, fishName: "Halfmoon Betta Male", price: 3800, stockQty: 5, category: "Bettas", status: "ACTIVE" }
        ]
    },
    {
        id: 2007,
        userId: 607,
        shopName: "Mountain Streams",
        sellerName: "Roshan Bandara",
        username: "roshan.streams",
        email: "roshan@example.com",
        phone: "+94 52 222 3344",
        address: "Bazaar St, Nuwara Eliya",
        status: "INACTIVE",
        joinedDate: "2026-02-10",
        listingCount: 0,
        totalStock: 0,
        lowStockCount: 0,
        orderCount: 3,
        totalSales: 25000,
        fish: []
    },
    {
        id: 2008,
        userId: 608,
        shopName: "Colombo Goldfish Co.",
        sellerName: "Anushka Gunawardena",
        username: "anushka.gold",
        email: "anushka@example.com",
        phone: "+94 11 255 6677",
        address: "Bambalapitiya, Colombo 04",
        status: "PENDING",
        joinedDate: "2026-09-08",
        listingCount: 3,
        totalStock: 30,
        lowStockCount: 0,
        orderCount: 0,
        totalSales: 0,
        fish: [
            { id: 3080, fishName: "Oranda Goldfish", price: 4000, stockQty: 15, category: "Goldfish", status: "PENDING" }
        ]
    },
    {
        id: 2009,
        userId: 609,
        shopName: "Aqua Flora & Fauna",
        sellerName: "Kasuni Herath",
        username: "kasuni.flora",
        email: "kasuni@example.com",
        phone: "+94 87 222 1199",
        address: "Main St, Ratnapura",
        status: "ACTIVE",
        joinedDate: "2026-07-05",
        listingCount: 15,
        totalStock: 115,
        lowStockCount: 2,
        orderCount: 27,
        totalSales: 390000,
        fish: [
            { id: 3090, fishName: "Amazon Sword Plant Bundle", price: 1200, stockQty: 20, category: "Plants", status: "ACTIVE" }
        ]
    },
    {
        id: 2010,
        userId: 610,
        shopName: "Jaffna Peninsula Aquatics",
        sellerName: "Sivakumar Nathan",
        username: "siva.jaffna",
        email: "siva@example.com",
        phone: "+94 21 222 4433",
        address: "Kankesanthurai Rd, Jaffna",
        status: "ACTIVE",
        joinedDate: "2026-04-18",
        listingCount: 10,
        totalStock: 80,
        lowStockCount: 1,
        orderCount: 15,
        totalSales: 180000,
        fish: [
            { id: 3100, fishName: "Tiger Barb", price: 1500, stockQty: 18, category: "Freshwater", status: "ACTIVE" }
        ]
    }
];

// Formatter setup
const currencyFormatter = new Intl.NumberFormat('en-LK', {
    style: 'currency',
    currency: 'LKR'
});

// Initialization
document.addEventListener("DOMContentLoaded", () => {
    initDemoBadge();
    setupEventListeners();
    loadSellersData();
    checkUrlParameters();
});

// Demo Badge Indicator
function initDemoBadge() {
    const container = document.getElementById("demoBadgeContainer");
    if (USE_MOCK_DATA && container) {
        container.innerHTML = `<div class="demo-badge"><i class="fa-solid fa-flask"></i> Demo Data Mode</div>`;
    }
}

// Event Listeners Setup
function setupEventListeners() {
    // Sidebar toggle for mobile
    const mobileToggleBtn = document.getElementById("mobileToggleBtn");
    const sidebar = document.getElementById("sidebar");
    const sidebarOverlay = document.getElementById("sidebarOverlay");

    if (mobileToggleBtn) {
        mobileToggleBtn.addEventListener("click", () => {
            sidebar.classList.toggle("active");
            sidebarOverlay.classList.toggle("active");
        });
    }

    if (sidebarOverlay) {
        sidebarOverlay.addEventListener("click", () => {
            sidebar.classList.remove("active");
            sidebarOverlay.classList.remove("active");
        });
    }

    // Search input debounce
    const searchInput = document.getElementById("searchInput");
    let searchTimeout;
    if (searchInput) {
        searchInput.addEventListener("input", (e) => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                state.searchTerm = e.target.value.trim();
                state.currentPage = 1;
                applyFiltersAndSort();
            }, 300);
        });
    }

    // Filters and Sorting
    const sortSelect = document.getElementById("sortSelect");
    const statusFilter = document.getElementById("statusFilter");
    const activityFilter = document.getElementById("activityFilter");
    const sizeFilter = document.getElementById("sizeFilter");
    const dateFilter = document.getElementById("dateFilter");
    const applyFiltersBtn = document.getElementById("applyFiltersBtn");
    const clearFiltersBtn = document.getElementById("clearFiltersBtn");
    const emptyClearBtn = document.getElementById("emptyClearBtn");
    const refreshBtn = document.getElementById("refreshBtn");

    if (sortSelect) {
        sortSelect.addEventListener("change", (e) => {
            state.sortBy = e.target.value;
            applyFiltersAndSort();
        });
    }

    if (applyFiltersBtn) {
        applyFiltersBtn.addEventListener("click", () => {
            state.statusFilter = statusFilter.value;
            state.activityFilter = activityFilter.value;
            state.sizeFilter = sizeFilter.value;
            state.dateFilter = dateFilter.value;
            state.currentPage = 1;
            applyFiltersAndSort();
            showToast("Filters applied successfully.", "success");
        });
    }

    const resetFilters = () => {
        if (searchInput) searchInput.value = "";
        if (statusFilter) statusFilter.value = "ALL";
        if (activityFilter) activityFilter.value = "ALL";
        if (sizeFilter) sizeFilter.value = "ALL";
        if (dateFilter) dateFilter.value = "ALL";
        if (sortSelect) sortSelect.value = "NEWEST";

        state.searchTerm = "";
        state.statusFilter = "ALL";
        state.activityFilter = "ALL";
        state.sizeFilter = "ALL";
        state.dateFilter = "ALL";
        state.sortBy = "NEWEST";
        state.currentPage = 1;

        applyFiltersAndSort();
        showToast("Filters cleared.", "info");
    };

    if (clearFiltersBtn) clearFiltersBtn.addEventListener("click", resetFilters);
    if (emptyClearBtn) emptyClearBtn.addEventListener("click", resetFilters);

    if (refreshBtn) {
        refreshBtn.addEventListener("click", () => {
            loadSellersData();
            showToast("Seller data refreshed.", "success");
        });
    }

    // CSV Export
    const exportCsvBtn = document.getElementById("exportCsvBtn");
    const exportCsvTopBtn = document.getElementById("exportCsvTopBtn");
    if (exportCsvBtn) exportCsvBtn.addEventListener("click", exportSellersCsv);
    if (exportCsvTopBtn) exportCsvTopBtn.addEventListener("click", exportSellersCsv);

    // Modal close controls
    setupModalHandlers();
}

// Modal Handlers
function setupModalHandlers() {
    const detailsModal = document.getElementById("sellerDetailsModal");
    const closeDetailsModalBtn = document.getElementById("closeDetailsModalBtn");
    const detailsModalCloseBtn = document.getElementById("detailsModalCloseBtn");

    const statusModal = document.getElementById("statusModal");
    const closeStatusModalBtn = document.getElementById("closeStatusModalBtn");
    const statusModalCancelBtn = document.getElementById("statusModalCancelBtn");
    const confirmStatusUpdateBtn = document.getElementById("confirmStatusUpdateBtn");

    const closeModal = (modal) => {
        modal.classList.remove("active");
        modal.setAttribute("aria-hidden", "true");
    };

    if (closeDetailsModalBtn) closeDetailsModalBtn.addEventListener("click", () => closeModal(detailsModal));
    if (detailsModalCloseBtn) detailsModalCloseBtn.addEventListener("click", () => closeModal(detailsModal));

    if (closeStatusModalBtn) closeStatusModalBtn.addEventListener("click", () => closeModal(statusModal));
    if (statusModalCancelBtn) statusModalCancelBtn.addEventListener("click", () => closeModal(statusModal));

    // Close on backdrop click or ESC
    window.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
            closeModal(detailsModal);
            closeModal(statusModal);
        }
    });

    detailsModal.addEventListener("click", (e) => {
        if (e.target === detailsModal) closeModal(detailsModal);
    });

    statusModal.addEventListener("click", (e) => {
        if (e.target === statusModal) closeModal(statusModal);
    });

    if (confirmStatusUpdateBtn) {
        confirmStatusUpdateBtn.addEventListener("click", executeStatusUpdate);
    }
}

// Load Sellers Data (Mock / API)
async function loadSellersData() {
    showLoadingState(true);
    hideErrorState();
    hideEmptyState();

    try {
        if (USE_MOCK_DATA) {
            // Simulate network latency
            await new Promise(resolve => setTimeout(resolve, 350));
            state.sellers = MOCK_SELLERS.map(normalizeSeller);
            applyFiltersAndSort();
            showLoadingState(false);
        } else {
            // TODO API: GET /api/admin/sellers
            const response = await fetch(`${API_BASE_URL}/admin/sellers`, {
                method: "GET",
                headers: getAuthHeaders()
            });

            if (!response.ok) {
                handleApiError(response.status);
                return;
            }

            const rawData = await response.json();
            state.sellers = rawData.map(normalizeSeller);
            applyFiltersAndSort();
            showLoadingState(false);
        }
    } catch (error) {
        console.error("Failed to fetch sellers:", error);
        showLoadingState(false);
        showErrorState();
    }
}

// Data Normalization
function normalizeSeller(raw) {
    return {
        id: raw.id || 0,
        userId: raw.userId || 0,
        shopName: raw.shopName || "Unknown Shop",
        sellerName: raw.sellerName || raw.seller?.fullName || "Not Available",
        username: raw.username || raw.user?.username || "unknown",
        email: raw.email || raw.user?.email || "not-available@example.com",
        phone: raw.phone || "+94 00 000 0000",
        address: raw.address || "No address provided",
        status: raw.status || "ACTIVE",
        joinedDate: raw.joinedDate ? raw.joinedDate.split("T")[0] : "2026-01-01",
        listingCount: raw.listingCount !== undefined ? raw.listingCount : (raw.fish ? raw.fish.length : 0),
        totalStock: raw.totalStock !== undefined ? raw.totalStock : 0,
        lowStockCount: raw.lowStockCount !== undefined ? raw.lowStockCount : 0,
        orderCount: raw.orderCount || 0,
        totalSales: raw.totalSales || 0,
        fish: raw.fish || []
    };
}

// Filtering and Sorting Engine
function applyFiltersAndSort() {
    let result = [...state.sellers];

    // Search Term Filter
    if (state.searchTerm) {
        const term = state.searchTerm.toLowerCase();
        result = result.filter(s =>
            s.shopName.toLowerCase().includes(term) ||
            s.sellerName.toLowerCase().includes(term) ||
            s.username.toLowerCase().includes(term) ||
            s.email.toLowerCase().includes(term) ||
            s.phone.toLowerCase().includes(term)
        );
    }

    // Status Filter
    if (state.statusFilter !== "ALL") {
        result = result.filter(s => s.status === state.statusFilter);
    }

    // Activity Filter
    if (state.activityFilter === "ACTIVE_LISTINGS") {
        result = result.filter(s => s.listingCount > 0);
    } else if (state.activityFilter === "NO_LISTINGS") {
        result = result.filter(s => s.listingCount === 0);
    } else if (state.activityFilter === "LOW_STOCK") {
        result = result.filter(s => s.lowStockCount > 0);
    }

    // Shop Size Filter
    if (state.sizeFilter === "RANGE_1_5") {
        result = result.filter(s => s.listingCount >= 1 && s.listingCount <= 5);
    } else if (state.sizeFilter === "RANGE_6_20") {
        result = result.filter(s => s.listingCount >= 6 && s.listingCount <= 20);
    } else if (state.sizeFilter === "RANGE_21_PLUS") {
        result = result.filter(s => s.listingCount >= 21);
    }

    // Date Filter
    if (state.dateFilter !== "ALL") {
        const now = new Date();
        result = result.filter(s => {
            const joined = new Date(s.joinedDate);
            const diffDays = (now - joined) / (1000 * 60 * 60 * 24);
            if (state.dateFilter === "TODAY") return diffDays < 1;
            if (state.dateFilter === "LAST_7") return diffDays <= 7;
            if (state.dateFilter === "LAST_30") return diffDays <= 30;
            if (state.dateFilter === "LAST_90") return diffDays <= 90;
            if (state.dateFilter === "THIS_YEAR") return joined.getFullYear() === now.getFullYear();
            return true;
        });
    }

    // Sorting Engine
    result.sort((a, b) => {
        if (state.sortBy === "NEWEST") return new Date(b.joinedDate) - new Date(a.joinedDate);
        if (state.sortBy === "OLDEST") return new Date(a.joinedDate) - new Date(b.joinedDate);
        if (state.sortBy === "SHOP_AZ") return a.shopName.localeCompare(b.shopName);
        if (state.sortBy === "SHOP_ZA") return b.shopName.localeCompare(a.shopName);
        if (state.sortBy === "MOST_LISTINGS") return b.listingCount - a.listingCount;
        if (state.sortBy === "LEAST_LISTINGS") return a.listingCount - b.listingCount;
        if (state.sortBy === "HIGHEST_STOCK") return b.totalStock - a.totalStock;
        if (state.sortBy === "LOWEST_STOCK") return a.totalStock - b.totalStock;
        if (state.sortBy === "HIGHEST_SALES") return b.totalSales - a.totalSales;
        return 0;
    });

    state.filteredSellers = result;
    renderStats();
    renderTableView();
}

// Render Statistics
function renderStats() {
    const totalSellers = state.sellers.length;
    const activeSellers = state.sellers.filter(s => s.status === "ACTIVE").length;
    const inactiveSellers = state.sellers.filter(s => s.status !== "ACTIVE").length;
    const totalListings = state.sellers.reduce((sum, s) => sum + s.listingCount, 0);

    document.getElementById("statTotalSellers").textContent = totalSellers;
    document.getElementById("statActiveSellers").textContent = activeSellers;
    document.getElementById("statInactiveSellers").textContent = inactiveSellers;
    document.getElementById("statTotalListings").textContent = totalListings;
}

// Render Table & Mobile Cards
function renderTableView() {
    const tbody = document.getElementById("sellersTableBody");
    const mobileContainer = document.getElementById("mobileCardsContainer");
    const resultCountBadge = document.getElementById("resultCountBadge");

    tbody.innerHTML = "";
    mobileContainer.innerHTML = "";

    const totalFiltered = state.filteredSellers.length;
    resultCountBadge.textContent = `${totalFiltered} Seller${totalFiltered === 1 ? '' : 's'} Found`;

    if (totalFiltered === 0) {
        showEmptyState();
        renderPagination(0);
        return;
    }

    hideEmptyState();

    // Pagination slice
    const startIndex = (state.currentPage - 1) * state.pageSize;
    const endIndex = Math.min(startIndex + state.pageSize, totalFiltered);
    const paginatedItems = state.filteredSellers.slice(startIndex, endIndex);

    paginatedItems.forEach(seller => {
        const initials = getInitials(seller.shopName);
        const statusBadgeClass = getStatusBadgeClass(seller.status);
        const formattedDate = formatDate(seller.joinedDate);

        // Table Row
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>
                <div class="seller-cell-info">
                    <div class="shop-avatar-thumb">${escapeHtml(initials)}</div>
                    <div class="shop-details-text">
                        <span class="shop-name">${escapeHtml(seller.shopName)}</span>
                        <span class="seller-name">${escapeHtml(seller.sellerName)}</span>
                        <span class="seller-id-sub">Seller #${escapeHtml(String(seller.id))}</span>
                    </div>
                </div>
            </td>
            <td>${escapeHtml(seller.username)}</td>
            <td>${escapeHtml(seller.email)}</td>
            <td>${escapeHtml(seller.phone)}</td>
            <td><strong>${seller.listingCount}</strong></td>
            <td>${seller.totalStock}</td>
            <td>${seller.orderCount}</td>
            <td><span class="badge ${statusBadgeClass}">${escapeHtml(seller.status)}</span></td>
            <td>${escapeHtml(formattedDate)}</td>
            <td class="text-right">
                <div class="action-buttons-group">
                    <button class="action-icon-btn" title="View Details" onclick="openDetailsModal(${seller.id})">
                        <i class="fa-solid fa-eye"></i>
                    </button>
                    <button class="action-icon-btn" title="View Fish" onclick="navigateToFish(${seller.id})">
                        <i class="fa-solid fa-fish"></i>
                    </button>
                    <button class="action-icon-btn btn-status" title="Change Status" onclick="openStatusModal(${seller.id})">
                        <i class="fa-solid fa-toggle-on"></i>
                    </button>
                </div>
            </td>
        `;
        tbody.appendChild(tr);

        // Mobile Card
        const card = document.createElement("div");
        card.className = "mobile-seller-card";
        card.innerHTML = `
            <div class="mobile-card-header">
                <div class="seller-cell-info">
                    <div class="shop-avatar-thumb">${escapeHtml(initials)}</div>
                    <div class="shop-details-text">
                        <span class="shop-name">${escapeHtml(seller.shopName)}</span>
                        <span class="seller-name">${escapeHtml(seller.sellerName)} (#${seller.id})</span>
                    </div>
                </div>
                <span class="badge ${statusBadgeClass}">${escapeHtml(seller.status)}</span>
            </div>
            <div class="mobile-card-body-grid">
                <div class="mobile-data-item">
                    <span class="mobile-data-label">Listings</span>
                    <span class="mobile-data-value">${seller.listingCount}</span>
                </div>
                <div class="mobile-data-item">
                    <span class="mobile-data-label">Total Stock</span>
                    <span class="mobile-data-value">${seller.totalStock}</span>
                </div>
                <div class="mobile-data-item">
                    <span class="mobile-data-label">Orders</span>
                    <span class="mobile-data-value">${seller.orderCount}</span>
                </div>
                <div class="mobile-data-item">
                    <span class="mobile-data-label">Joined</span>
                    <span class="mobile-data-value">${escapeHtml(formattedDate)}</span>
                </div>
            </div>
            <div class="mobile-card-footer">
                <button class="btn btn-secondary" onclick="openDetailsModal(${seller.id})">Details</button>
                <button class="btn btn-primary" onclick="navigateToFish(${seller.id})">Fish</button>
                <button class="btn btn-secondary" onclick="openStatusModal(${seller.id})">Status</button>
            </div>
        `;
        mobileContainer.appendChild(card);
    });

    renderPagination(totalFiltered);
}

// Render Pagination Controls
function renderPagination(totalFiltered) {
    const paginationInfo = document.getElementById("paginationInfo");
    const paginationControls = document.getElementById("paginationControls");

    paginationControls.innerHTML = "";

    if (totalFiltered === 0) {
        paginationInfo.textContent = "Showing 0–0 of 0 sellers";
        return;
    }

    const startIndex = (state.currentPage - 1) * state.pageSize + 1;
    const endIndex = Math.min(state.currentPage * state.pageSize, totalFiltered);
    paginationInfo.textContent = `Showing ${startIndex}–${endIndex} of ${totalFiltered} sellers`;

    const totalPages = Math.ceil(totalFiltered / state.pageSize);

    // Previous Button
    const prevBtn = document.createElement("button");
    prevBtn.className = "page-btn";
    prevBtn.innerHTML = '<i class="fa-solid fa-chevron-left"></i>';
    prevBtn.disabled = state.currentPage === 1;
    prevBtn.addEventListener("click", () => {
        if (state.currentPage > 1) {
            state.currentPage--;
            renderTableView();
        }
    });
    paginationControls.appendChild(prevBtn);

    // Page Number Buttons
    for (let i = 1; i <= totalPages; i++) {
        if (i === 1 || i === totalPages || (i >= state.currentPage - 1 && i <= state.currentPage + 1)) {
            const pageBtn = document.createElement("button");
            pageBtn.className = `page-btn ${i === state.currentPage ? 'active' : ''}`;
            pageBtn.textContent = i;
            pageBtn.addEventListener("click", () => {
                state.currentPage = i;
                renderTableView();
            });
            paginationControls.appendChild(pageBtn);
        } else if (i === state.currentPage - 2 || i === state.currentPage + 2) {
            const span = document.createElement("span");
            span.textContent = "...";
            span.style.padding = "0.4rem";
            paginationControls.appendChild(span);
        }
    }

    // Next Button
    const nextBtn = document.createElement("button");
    nextBtn.className = "page-btn";
    nextBtn.innerHTML = '<i class="fa-solid fa-chevron-right"></i>';
    nextBtn.disabled = state.currentPage === totalPages;
    nextBtn.addEventListener("click", () => {
        if (state.currentPage < totalPages) {
            state.currentPage++;
            renderTableView();
        }
    });
    paginationControls.appendChild(nextBtn);
}

// Seller Details Modal Action
window.openDetailsModal = async function(sellerId) {
    const modal = document.getElementById("sellerDetailsModal");
    const modalBody = document.getElementById("sellerDetailsModalBody");

    modalBody.innerHTML = `<div class="state-container"><div class="spinner"></div><p>Loading details...</p></div>`;
    modal.classList.add("active");
    modal.setAttribute("aria-hidden", "false");

    try {
        let seller = state.sellers.find(s => s.id === sellerId);

        if (!USE_MOCK_DATA) {
            // TODO API: GET /api/admin/sellers/{sellerId}/details
            const response = await fetch(`${API_BASE_URL}/admin/sellers/${sellerId}/details`, {
                method: "GET",
                headers: getAuthHeaders()
            });
            if (response.ok) {
                const rawDetails = await response.json();
                seller = normalizeSeller(rawDetails);
            }
        }

        if (!seller) {
            modalBody.innerHTML = `<p>Seller details not found.</p>`;
            return;
        }

        state.selectedSeller = seller;
        const initials = getInitials(seller.shopName);
        const statusBadgeClass = getStatusBadgeClass(seller.status);

        let fishListHtml = "";
        if (seller.fish && seller.fish.length > 0) {
            fishListHtml = seller.fish.map(f => `
                <div class="recent-listing-item">
                    <div>
                        <strong>${escapeHtml(f.fishName)}</strong>
                        <div style="font-size: 0.75rem; color: var(--text-muted);">${escapeHtml(f.category)}</div>
                    </div>
                    <div style="text-align: right;">
                        <div>${currencyFormatter.format(f.price)}</div>
                        <div style="font-size: 0.75rem; color: var(--text-muted);">Stock: ${f.stockQty}</div>
                    </div>
                </div>
            `).join("");
        } else {
            fishListHtml = `<p style="font-size: 0.85rem; color: var(--text-muted);">No fish listings recorded.</p>`;
        }

        modalBody.innerHTML = `
            <div class="seller-profile-banner">
                <div class="seller-banner-avatar">${escapeHtml(initials)}</div>
                <div class="seller-banner-info">
                    <h2>${escapeHtml(seller.shopName)}</h2>
                    <p>${escapeHtml(seller.sellerName)}</p>
                    <div class="seller-banner-meta">
                        <span>Seller #${seller.id}</span>
                        <span>•</span>
                        <span>Joined ${escapeHtml(seller.joinedDate)}</span>
                    </div>
                </div>
                <span class="badge ${statusBadgeClass}" style="margin-left: auto;">${escapeHtml(seller.status)}</span>
            </div>

            <div class="detail-sections-grid">
                <div class="detail-box">
                    <h4><i class="fa-solid fa-user-gear"></i> Account Information</h4>
                    <div class="detail-row"><span class="detail-label">Username</span><span class="detail-value">${escapeHtml(seller.username)}</span></div>
                    <div class="detail-row"><span class="detail-label">Email</span><span class="detail-value">${escapeHtml(seller.email)}</span></div>
                    <div class="detail-row"><span class="detail-label">User ID</span><span class="detail-value">${seller.userId}</span></div>
                    <div class="detail-row"><span class="detail-label">Account Status</span><span class="detail-value">${escapeHtml(seller.status)}</span></div>
                </div>

                <div class="detail-box">
                    <h4><i class="fa-solid fa-store"></i> Shop Information</h4>
                    <div class="detail-row"><span class="detail-label">Phone</span><span class="detail-value">${escapeHtml(seller.phone)}</span></div>
                    <div class="detail-row"><span class="detail-label">Address</span><span class="detail-value">${escapeHtml(seller.address)}</span></div>
                    <div class="detail-row"><span class="detail-label">Listings Count</span><span class="detail-value">${seller.listingCount}</span></div>
                    <div class="detail-row"><span class="detail-label">Total Stock</span><span class="detail-value">${seller.totalStock}</span></div>
                </div>

                <div class="detail-box">
                    <h4><i class="fa-solid fa-chart-line"></i> Performance Metrics</h4>
                    <div class="detail-row"><span class="detail-label">Total Orders</span><span class="detail-value">${seller.orderCount}</span></div>
                    <div class="detail-row"><span class="detail-label">Low Stock Items</span><span class="detail-value" style="color: var(--warning);">${seller.lowStockCount}</span></div>
                    <div class="detail-row"><span class="detail-label">Attributable Sales</span><span class="detail-value">${currencyFormatter.format(seller.totalSales)}</span></div>
                </div>
            </div>

            <div class="detail-box">
                <h4><i class="fa-solid fa-fish"></i> Recent Fish Listings</h4>
                <div class="recent-listings-wrapper">
                    ${fishListHtml}
                </div>
            </div>
        `;
    } catch (error) {
        console.error("Error loading seller details:", error);
        modalBody.innerHTML = `<p>Failed to retrieve seller details.</p>`;
    }
};

// Status Modal Action
window.openStatusModal = function(sellerId) {
    const seller = state.sellers.find(s => s.id === sellerId);
    if (!seller) return;

    state.statusTargetSeller = seller;
    const modal = document.getElementById("statusModal");
    const targetInfo = document.getElementById("statusTargetInfo");
    const newStatusSelect = document.getElementById("newStatusSelect");

    targetInfo.innerHTML = `
        <strong>${escapeHtml(seller.shopName)}</strong> (${escapeHtml(seller.sellerName)})<br>
        <span style="font-size: 0.85rem; color: var(--text-muted);">${escapeHtml(seller.email)}</span><br>
        <span style="font-size: 0.85rem; margin-top: 0.25rem; display: inline-block;">Current status: <strong>${escapeHtml(seller.status)}</strong></span>
    `;

    newStatusSelect.value = seller.status;
    modal.classList.add("active");
    modal.setAttribute("aria-hidden", "false");
};

async function executeStatusUpdate() {
    if (!state.statusTargetSeller) return;

    const newStatus = document.getElementById("newStatusSelect").value;
    const confirmBtn = document.getElementById("confirmStatusUpdateBtn");
    confirmBtn.disabled = true;
    confirmBtn.textContent = "Updating...";

    try {
        if (USE_MOCK_DATA) {
            await new Promise(resolve => setTimeout(resolve, 400));
            state.statusTargetSeller.status = newStatus;
            applyFiltersAndSort();
            document.getElementById("statusModal").classList.remove("active");
            showToast(`Seller status updated to ${newStatus}.`, "success");
        } else {
            // TODO API: PATCH /api/admin/users/{userId}/status or /api/admin/sellers/{sellerId}/status
            const response = await fetch(`${API_BASE_URL}/admin/users/${state.statusTargetSeller.userId}/status`, {
                method: "PATCH",
                headers: getAuthHeaders(),
                body: JSON.stringify({ status: newStatus })
            });

            if (!response.ok) {
                handleApiError(response.status);
                confirmBtn.disabled = false;
                confirmBtn.textContent = "Update Status";
                return;
            }

            state.statusTargetSeller.status = newStatus;
            applyFiltersAndSort();
            document.getElementById("statusModal").classList.remove("active");
            showToast(`Seller status updated to ${newStatus}.`, "success");
        }
    } catch (error) {
        console.error("Failed to update status:", error);
        showToast("Failed to update seller status.", "error");
    } finally {
        confirmBtn.disabled = false;
        confirmBtn.textContent = "Update Status";
    }
}

// Navigation helpers
window.navigateToFish = function(sellerId) {
    window.location.href = `fish.html?sellerId=${sellerId}`;
};

// CSV Export
function exportSellersCsv() {
    if (!state.filteredSellers.length) {
        showToast("No seller records to export.", "warning");
        return;
    }

    const headers = ["Seller ID", "Shop Name", "Seller Name", "Username", "Email", "Phone", "Status", "Joined Date", "Listing Count", "Total Stock", "Order Count", "Total Sales (LKR)"];
    const rows = state.filteredSellers.map(s => [
        s.id,
        `"${s.shopName.replace(/"/g, '""')}"`,
        `"${s.sellerName.replace(/"/g, '""')}"`,
        s.username,
        s.email,
        s.phone,
        s.status,
        s.joinedDate,
        s.listingCount,
        s.totalStock,
        s.orderCount,
        s.totalSales
    ]);

    let csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "aquarium-fish-sellers.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast("Seller information exported successfully.", "success");
}

// URL Parameter Handling
function checkUrlParameters() {
    const params = new URLSearchParams(window.location.search);
    const searchParam = params.get("search");
    const statusParam = params.get("status");
    const sellerIdParam = params.get("sellerId");

    if (searchParam) {
        state.searchTerm = searchParam;
        document.getElementById("searchInput").value = searchParam;
    }

    if (statusParam) {
        state.statusFilter = statusParam.toUpperCase();
        document.getElementById("statusFilter").value = state.statusFilter;
    }

    if (sellerIdParam) {
        setTimeout(() => {
            openDetailsModal(parseInt(sellerIdParam, 10));
        }, 500);
    }
}

// Helpers & UI State Control
function getInitials(name) {
    if (!name) return "AQ";
    const parts = name.split(" ");
    if (parts.length >= 2) {
        return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
}

function getStatusBadgeClass(status) {
    switch (status) {
        case "ACTIVE": return "badge-active";
        case "INACTIVE": return "badge-inactive";
        case "SUSPENDED": return "badge-suspended";
        case "PENDING": return "badge-pending";
        default: return "badge-inactive";
    }
}

function formatDate(dateStr) {
    if (!dateStr) return "";
    const options = { year: 'numeric', month: 'short', day: '2-digit' };
    return new Date(dateStr).toLocaleDateString('en-US', options);
}

function escapeHtml(str) {
    if (typeof str !== 'string') return str;
    return str.replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function getAuthHeaders() {
    const token = localStorage.getItem("authToken");
    return {
        "Content-Type": "application/json",
        ...(token ? { "Authorization": `Bearer ${token}` } : {})
    };
}

function showLoadingState(show) {
    const loading = document.getElementById("loadingState");
    const table = document.getElementById("sellersTable");
    const mobileContainer = document.getElementById("mobileCardsContainer");
    if (show) {
        loading.classList.remove("hidden");
        table.classList.add("hidden");
        mobileContainer.classList.add("hidden");
    } else {
        loading.classList.add("hidden");
        table.classList.remove("hidden");
        mobileContainer.classList.remove("hidden");
    }
}

function showEmptyState() {
    document.getElementById("emptyState").classList.remove("hidden");
    document.getElementById("sellersTable").classList.add("hidden");
    document.getElementById("mobileCardsContainer").classList.add("hidden");
}

function hideEmptyState() {
    document.getElementById("emptyState").classList.add("hidden");
}

function showErrorState() {
    document.getElementById("errorState").classList.remove("hidden");
}

function hideErrorState() {
    document.getElementById("errorState").classList.add("hidden");
}

function handleApiError(status) {
    if (status === 401) {
        showToast("Your session has expired. Please log in again.", "error");
        setTimeout(() => window.location.href = "../login.html", 1500);
    } else if (status === 403) {
        showToast("You do not have permission to access seller management.", "error");
    } else if (status === 404) {
        showToast("Seller not found.", "error");
    } else if (status === 409) {
        showToast("This seller account cannot be updated because of a conflict.", "error");
    } else {
        showToast("Server error. Please try again later.", "error");
        showErrorState();
    }
}

// Toast System
function showToast(message, type = "info") {
    const container = document.getElementById("toastContainer");
    const toast = document.createElement("div");
    toast.className = `toast ${type}`;

    let icon = "fa-circle-info";
    if (type === "success") icon = "fa-circle-check";
    if (type === "error") icon = "fa-triangle-exclamation";
    if (type === "warning") icon = "fa-triangle-exclamation";

    toast.innerHTML = `
        <i class="fa-solid ${icon}"></i>
        <div class="toast-content">
            <span class="toast-title">${type.charAt(0).toUpperCase() + type.slice(1)}</span>
            <span class="toast-msg">${escapeHtml(message)}</span>
        </div>
    `;

    container.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = "0";
        toast.style.transform = "translateY(1rem)";
        toast.style.transition = "all 0.3s ease-in";
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}