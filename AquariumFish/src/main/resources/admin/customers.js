/**
 * ==========================================================================
 * Aquarium Fish Admin - Customer Management JavaScript
 * Supports Mock Mode and REST API Integration via Fetch API
 * ==========================================================================
 */

const API_BASE_URL = "http://localhost:8080/api";
const USE_MOCK_DATA = true;
const PAGE_SIZE = 10;

// Application State
const state = {
    customers: [],
    filteredCustomers: [],
    currentPage: 1,
    pageSize: PAGE_SIZE,
    searchTerm: "",
    statusFilter: "ALL",
    dateFilter: "ALL",
    activityFilter: "ALL",
    sortBy: "NEWEST",
    selectedCustomer: null
};

// Mock Dataset (20 realistic Sri Lankan customers)
const MOCK_CUSTOMERS = [
    {
        id: 1001,
        userId: 501,
        firstName: "Kasun",
        lastName: "Perera",
        username: "kasun.perera",
        email: "kasun.perera@example.com",
        phone: "+94 77 123 4567",
        address: "123 Marine Drive, Colombo 03, Sri Lanka",
        status: "ACTIVE",
        joinedDate: "2026-08-15",
        orderCount: 8,
        reviewCount: 3,
        totalSpent: 89500.00,
        lastOrderDate: "2026-09-05",
        recentOrders: [
            { id: "ORD-1048", date: "Sep 05, 2026", total: 18500.00, status: "Delivered" },
            { id: "ORD-1022", date: "Aug 22, 2026", total: 12000.00, status: "Delivered" }
        ]
    },
    {
        id: 1002,
        userId: 502,
        firstName: "Chathura",
        lastName: "Silva",
        username: "chathura.s",
        email: "chathura@example.com",
        phone: "+94 71 987 6543",
        address: "45 Kandy Road, Gampaha, Sri Lanka",
        status: "ACTIVE",
        joinedDate: "2026-07-10",
        orderCount: 12,
        reviewCount: 5,
        totalSpent: 145500.00,
        lastOrderDate: "2026-09-10",
        recentOrders: [
            { id: "ORD-1055", date: "Sep 10, 2026", total: 25000.00, status: "Processing" }
        ]
    },
    {
        id: 1003,
        userId: 503,
        firstName: "Nimesh",
        lastName: "Fernando",
        username: "nimesh_f",
        email: "nimesh.fernando@example.com",
        phone: "+94 75 456 7890",
        address: "88 Galle Road, Negombo, Sri Lanka",
        status: "SUSPENDED",
        joinedDate: "2026-06-01",
        orderCount: 2,
        reviewCount: 0,
        totalSpent: 4500.00,
        lastOrderDate: "2026-06-15",
        recentOrders: []
    },
    {
        id: 1004,
        userId: 504,
        firstName: "Anushka",
        lastName: "Jayasinghe",
        username: "anushka.j",
        email: "anushka@example.com",
        phone: "+94 78 321 6549",
        address: "12 Temple Road, Kandy, Sri Lanka",
        status: "ACTIVE",
        joinedDate: "2026-08-20",
        orderCount: 5,
        reviewCount: 2,
        totalSpent: 34200.00,
        lastOrderDate: "2026-09-02",
        recentOrders: []
    },
    {
        id: 1005,
        userId: 505,
        firstName: "Dilshan",
        lastName: "Madushanka",
        username: "dilshan.m",
        email: "dilshan.m@example.com",
        phone: "+94 70 111 2233",
        address: "56 Station Road, Matara, Sri Lanka",
        status: "INACTIVE",
        joinedDate: "2026-05-12",
        orderCount: 0,
        reviewCount: 0,
        totalSpent: 0.00,
        lastOrderDate: null,
        recentOrders: []
    },
    {
        id: 1006,
        userId: 506,
        firstName: "Sachini",
        lastName: "Weerasinghe",
        username: "sachini_w",
        email: "sachini.w@example.com",
        phone: "+94 76 555 8899",
        address: "78 Lake Road, Kurunegala, Sri Lanka",
        status: "ACTIVE",
        joinedDate: "2026-09-01",
        orderCount: 1,
        reviewCount: 1,
        totalSpent: 7800.00,
        lastOrderDate: "2026-09-03",
        recentOrders: []
    },
    {
        id: 1007,
        userId: 507,
        firstName: "Tharindu",
        lastName: "Rathnayake",
        username: "tharindu.r",
        email: "tharindu@example.com",
        phone: "+94 71 333 4455",
        address: "99 Peradeniya Road, Kandy, Sri Lanka",
        status: "ACTIVE",
        joinedDate: "2026-04-18",
        orderCount: 15,
        reviewCount: 7,
        totalSpent: 210000.00,
        lastOrderDate: "2026-09-08",
        recentOrders: []
    },
    {
        id: 1008,
        userId: 508,
        firstName: "Piyumi",
        lastName: "Hansamali",
        username: "piyumi.h",
        email: "piyumi@example.com",
        phone: "+94 77 888 9900",
        address: "14 Flower Road, Colombo 07, Sri Lanka",
        status: "PENDING",
        joinedDate: "2026-09-10",
        orderCount: 0,
        reviewCount: 0,
        totalSpent: 0.00,
        lastOrderDate: null,
        recentOrders: []
    },
    {
        id: 1009,
        userId: 509,
        firstName: "Nuwan",
        lastName: "Kumara",
        username: "nuwan.k",
        email: "nuwan.k@example.com",
        phone: "+94 72 444 5566",
        address: "33 Main Street, Galle, Sri Lanka",
        status: "ACTIVE",
        joinedDate: "2026-07-25",
        orderCount: 4,
        reviewCount: 1,
        totalSpent: 19500.00,
        lastOrderDate: "2026-08-28",
        recentOrders: []
    },
    {
        id: 1010,
        userId: 510,
        firstName: "Malith",
        lastName: "Gunawardena",
        username: "malith_g",
        email: "malith@example.com",
        phone: "+94 75 666 7788",
        address: "67 Baseline Road, Colombo 09, Sri Lanka",
        status: "SUSPENDED",
        joinedDate: "2026-03-10",
        orderCount: 1,
        reviewCount: 0,
        totalSpent: 2500.00,
        lastOrderDate: "2026-03-12",
        recentOrders: []
    },
    {
        id: 1011,
        userId: 511,
        firstName: "Sanduni",
        lastName: "Priyadarshani",
        username: "sanduni.p",
        email: "sanduni.p@example.com",
        phone: "+94 78 999 0011",
        address: "89 Hospital Road, Jaffna, Sri Lanka",
        status: "ACTIVE",
        joinedDate: "2026-08-05",
        orderCount: 6,
        reviewCount: 2,
        totalSpent: 48000.00,
        lastOrderDate: "2026-09-01",
        recentOrders: []
    },
    {
        id: 1012,
        userId: 512,
        firstName: "Lahiru",
        lastName: "Dilshan",
        username: "lahiru.d",
        email: "lahiru.d@example.com",
        phone: "+94 70 222 3344",
        address: "21 Temple Street, Ratnapura, Sri Lanka",
        status: "ACTIVE",
        joinedDate: "2026-06-19",
        orderCount: 3,
        reviewCount: 1,
        totalSpent: 15600.00,
        lastOrderDate: "2026-08-15",
        recentOrders: []
    },
    {
        id: 1013,
        userId: 513,
        firstName: "Madushani",
        lastName: "Perera",
        username: "madushani.p",
        email: "madushani@example.com",
        phone: "+94 71 555 6677",
        address: "45 Hill Street, Dehiwala, Sri Lanka",
        status: "INACTIVE",
        joinedDate: "2026-02-14",
        orderCount: 2,
        reviewCount: 0,
        totalSpent: 9200.00,
        lastOrderDate: "2026-03-01",
        recentOrders: []
    },
    {
        id: 1014,
        userId: 514,
        firstName: "Asanka",
        lastName: "Priyantha",
        username: "asanka.p",
        email: "asanka.p@example.com",
        phone: "+94 77 444 1122",
        address: "10 Beach Road, Negombo, Sri Lanka",
        status: "ACTIVE",
        joinedDate: "2026-08-30",
        orderCount: 1,
        reviewCount: 0,
        totalSpent: 5400.00,
        lastOrderDate: "2026-09-04",
        recentOrders: []
    },
    {
        id: 1015,
        userId: 515,
        firstName: "Gayani",
        lastName: "Senaratne",
        username: "gayani.s",
        email: "gayani.s@example.com",
        phone: "+94 75 123 9876",
        address: "55 Circular Road, Anuradhapura, Sri Lanka",
        status: "ACTIVE",
        joinedDate: "2026-05-20",
        orderCount: 9,
        reviewCount: 4,
        totalSpent: 92000.00,
        lastOrderDate: "2026-09-06",
        recentOrders: []
    },
    {
        id: 1016,
        userId: 516,
        firstName: "Kavinda",
        lastName: "Bandara",
        username: "kavinda.b",
        email: "kavinda.b@example.com",
        phone: "+94 76 789 1234",
        address: "77 Raja Mawatha, Polonnaruwa, Sri Lanka",
        status: "ACTIVE",
        joinedDate: "2026-07-04",
        orderCount: 7,
        reviewCount: 3,
        totalSpent: 67000.00,
        lastOrderDate: "2026-08-30",
        recentOrders: []
    },
    {
        id: 1017,
        userId: 517,
        firstName: "Ishara",
        lastName: "Madumal",
        username: "ishara.m",
        email: "ishara.m@example.com",
        phone: "+94 71 876 5432",
        address: "34 Bazaar Street, Badulla, Sri Lanka",
        status: "PENDING",
        joinedDate: "2026-09-09",
        orderCount: 0,
        reviewCount: 0,
        totalSpent: 0.00,
        lastOrderDate: null,
        recentOrders: []
    },
    {
        id: 1018,
        userId: 518,
        firstName: "Chaminda",
        lastName: "Vithanage",
        username: "chaminda.v",
        email: "chaminda.v@example.com",
        phone: "+94 72 345 6789",
        address: "68 Main Street, Matara, Sri Lanka",
        status: "ACTIVE",
        joinedDate: "2026-04-05",
        orderCount: 11,
        reviewCount: 5,
        totalSpent: 128000.00,
        lastOrderDate: "2026-09-07",
        recentOrders: []
    },
    {
        id: 1019,
        userId: 519,
        firstName: "Udesh",
        lastName: "Sampath",
        username: "udesh.s",
        email: "udesh.s@example.com",
        phone: "+94 78 654 3210",
        address: "90 Station Road, Gampaha, Sri Lanka",
        status: "ACTIVE",
        joinedDate: "2026-08-10",
        orderCount: 3,
        reviewCount: 1,
        totalSpent: 22000.00,
        lastOrderDate: "2026-08-25",
        recentOrders: []
    },
    {
        id: 1020,
        userId: 520,
        firstName: "Nirosha",
        lastName: "Dilrukshi",
        username: "nirosha.d",
        email: "nirosha.d@example.com",
        phone: "+94 77 999 8877",
        address: "15 Temple Road, Panadura, Sri Lanka",
        status: "INACTIVE",
        joinedDate: "2026-01-20",
        orderCount: 1,
        reviewCount: 0,
        totalSpent: 3500.00,
        lastOrderDate: "2026-02-10",
        recentOrders: []
    }
];

// DOMContentLoaded Initialization
document.addEventListener("DOMContentLoaded", () => {
    initApp();
});

function initApp() {
    setupEventListeners();
    checkAuthAndRole();
    loadCustomers();
    handleUrlParams();
}

// Authentication & Role Check (UX layer)
function checkAuthAndRole() {
    const token = localStorage.getItem("authToken");
    if (!token && !USE_MOCK_DATA) {
        showToast("Session Expired", "Your session has expired. Please log in again.", "warning");
        setTimeout(() => {
            window.location.href = "../login.html";
        }, 1500);
    }
}

// Helper: Auth Headers for API requests
function getAuthHeaders() {
    const token = localStorage.getItem("authToken");
    return {
        "Content-Type": "application/json",
        ...(token ? { "Authorization": `Bearer ${token}` } : {})
    };
}

// Setup Event Listeners
function setupEventListeners() {
    // Mobile sidebar toggle
    const mobileToggle = document.getElementById("mobileToggle");
    const adminSidebar = document.getElementById("adminSidebar");
    const sidebarOverlay = document.getElementById("sidebarOverlay");

    if (mobileToggle) {
        mobileToggle.addEventListener("click", () => {
            adminSidebar.classList.toggle("mobile-open");
            sidebarOverlay.classList.toggle("active");
        });
    }

    if (sidebarOverlay) {
        sidebarOverlay.addEventListener("click", () => {
            adminSidebar.classList.remove("mobile-open");
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
                filterAndRender();
            }, 300);
        });
    }

    // Filter controls
    document.getElementById("statusFilter")?.addEventListener("change", (e) => {
        state.statusFilter = e.target.value;
    });

    document.getElementById("dateFilter")?.addEventListener("change", (e) => {
        state.dateFilter = e.target.value;
    });

    document.getElementById("activityFilter")?.addEventListener("change", (e) => {
        state.activityFilter = e.target.value;
    });

    document.getElementById("sortBy")?.addEventListener("change", (e) => {
        state.sortBy = e.target.value;
    });

    document.getElementById("applyFiltersBtn")?.addEventListener("click", () => {
        state.currentPage = 1;
        filterAndRender();
        showToast("Filters Applied", "Customer list has been updated.", "info");
    });

    document.getElementById("clearFiltersBtn")?.addEventListener("click", clearAllFilters);
    document.getElementById("emptyClearFiltersBtn")?.addEventListener("click", clearAllFilters);

    // Refresh & Export
    document.getElementById("refreshBtn")?.addEventListener("click", () => {
        loadCustomers();
        showToast("Refreshed", "Customer data successfully reloaded.", "info");
    });

    document.getElementById("exportCsvBtn")?.addEventListener("click", exportCustomersCsv);
    document.getElementById("retryBtn")?.addEventListener("click", loadCustomers);

    // Modals Close handlers
    document.getElementById("closeDetailsModal")?.addEventListener("click", closeCustomerModal);
    document.getElementById("closeDetailsModalBtn")?.addEventListener("click", closeCustomerModal);
    document.getElementById("customerDetailsModal")?.addEventListener("click", (e) => {
        if (e.target.id === "customerDetailsModal") closeCustomerModal();
    });

    document.getElementById("closeStatusModal")?.addEventListener("click", closeStatusModal);
    document.getElementById("cancelStatusBtn")?.addEventListener("click", closeStatusModal);
    document.getElementById("statusModal")?.addEventListener("click", (e) => {
        if (e.target.id === "statusModal") closeStatusModal();
    });

    document.getElementById("confirmStatusBtn")?.addEventListener("click", updateCustomerStatus);

    // Details Modal Action Buttons
    document.getElementById("modalViewOrdersBtn")?.addEventListener("click", () => {
        if (state.selectedCustomer) {
            window.location.href = `orders.html?customerId=${state.selectedCustomer.id}`;
        }
    });

    document.getElementById("modalViewReviewsBtn")?.addEventListener("click", () => {
        if (state.selectedCustomer) {
            window.location.href = `reviews.html?customerId=${state.selectedCustomer.id}`;
        }
    });

    document.getElementById("modalChangeStatusBtn")?.addEventListener("click", () => {
        if (state.selectedCustomer) {
            closeCustomerModal();
            openStatusModal(state.selectedCustomer);
        }
    });

    // ESC key closes modals
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
            closeCustomerModal();
            closeStatusModal();
            adminSidebar.classList.remove("mobile-open");
            sidebarOverlay.classList.remove("active");
        }
    });
}

// Load Customers (Mock or Real REST API)
function loadCustomers() {
    showLoadingState(true);

    if (USE_MOCK_DATA) {
        setTimeout(() => {
            // Simulate network delay
            state.customers = [...MOCK_CUSTOMERS];
            filterAndRender();
            renderStats();
            showLoadingState(false);
        }, 400);
    } else {
        // TODO API: GET /api/admin/customers
        fetch(`${API_BASE_URL}/admin/customers`, {
            method: "GET",
            headers: getAuthHeaders()
        })
            .then(response => {
                if (response.status === 401) {
                    handleApiError(401);
                    throw new Error("Unauthorized");
                }
                if (response.status === 403) {
                    handleApiError(403);
                    throw new Error("Forbidden");
                }
                if (!response.ok) throw new Error("Server error");
                return response.json();
            })
            .then(data => {
                state.customers = data.map(normalizeCustomer);
                filterAndRender();
                renderStats();
                showLoadingState(false);
            })
            .catch(error => {
                console.error("Failed to load customers:", error);
                showErrorState("Something went wrong while retrieving customer information.");
                showLoadingState(false);
            });
    }
}

// Data Normalization helper for backend DTO tolerance
function normalizeCustomer(raw) {
    return {
        id: raw.id || raw.customerId,
        userId: raw.userId || (raw.user ? raw.user.id : null),
        firstName: raw.firstName || "",
        lastName: raw.lastName || "",
        username: raw.username || (raw.user ? raw.user.username : ""),
        email: raw.email || (raw.user ? raw.user.email : ""),
        phone: raw.phone || "",
        address: raw.address || "No address provided",
        status: (raw.status || (raw.user ? raw.user.status : "ACTIVE")).toUpperCase(),
        joinedDate: raw.joinedDate || new Date().toISOString().split('T')[0],
        orderCount: raw.orderCount || 0,
        reviewCount: raw.reviewCount || 0,
        totalSpent: raw.totalSpent || 0.0,
        lastOrderDate: raw.lastOrderDate || null,
        recentOrders: raw.recentOrders || []
    };
}

// Filter and Sort Pipeline
function filterAndRender() {
    let list = [...state.customers];

    // Search term filtering
    if (state.searchTerm) {
        const term = state.searchTerm.toLowerCase();
        list = list.filter(c =>
            c.firstName.toLowerCase().includes(term) ||
            c.lastName.toLowerCase().includes(term) ||
            `${c.firstName} ${c.lastName}`.toLowerCase().includes(term) ||
            c.username.toLowerCase().includes(term) ||
            c.email.toLowerCase().includes(term) ||
            c.phone.toLowerCase().includes(term)
        );
    }

    // Status filtering
    if (state.statusFilter !== "ALL") {
        list = list.filter(c => c.status === state.statusFilter);
    }

    // Date filtering
    if (state.dateFilter !== "ALL") {
        const now = new Date();
        list = list.filter(c => {
            const joined = new Date(c.joinedDate);
            const diffTime = Math.abs(now - joined);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            if (state.dateFilter === "TODAY") return diffDays <= 1;
            if (state.dateFilter === "LAST_7_DAYS") return diffDays <= 7;
            if (state.dateFilter === "LAST_30_DAYS") return diffDays <= 30;
            if (state.dateFilter === "LAST_90_DAYS") return diffDays <= 90;
            if (state.dateFilter === "THIS_YEAR") return joined.getFullYear() === now.getFullYear();
            return true;
        });
    }

    // Customer Activity filtering
    if (state.activityFilter !== "ALL") {
        if (state.activityFilter === "WITH_ORDERS") list = list.filter(c => c.orderCount > 0);
        if (state.activityFilter === "WITHOUT_ORDERS") list = list.filter(c => c.orderCount === 0);
        if (state.activityFilter === "WITH_REVIEWS") list = list.filter(c => c.reviewCount > 0);
        if (state.activityFilter === "WITHOUT_REVIEWS") list = list.filter(c => c.reviewCount === 0);
    }

    // Sorting
    list.sort((a, b) => {
        if (state.sortBy === "NEWEST") return new Date(b.joinedDate) - new Date(a.joinedDate);
        if (state.sortBy === "OLDEST") return new Date(a.joinedDate) - new Date(b.joinedDate);
        if (state.sortBy === "NAME_ASC") return `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`);
        if (state.sortBy === "NAME_DESC") return `${b.firstName} ${b.lastName}`.localeCompare(`${a.firstName} ${a.lastName}`);
        if (state.sortBy === "ORDERS_DESC") return b.orderCount - a.orderCount;
        if (state.sortBy === "ORDERS_ASC") return a.orderCount - b.orderCount;
        if (state.sortBy === "SPENT_DESC") return b.totalSpent - a.totalSpent;
        if (state.sortBy === "SPENT_ASC") return a.totalSpent - b.totalSpent;
        return 0;
    });

    state.filteredCustomers = list;
    paginateAndRender();
}

// Pagination logic
function paginateAndRender() {
    const totalItems = state.filteredCustomers.length;
    const totalPages = Math.ceil(totalItems / state.pageSize) || 1;

    if (state.currentPage > totalPages) {
        state.currentPage = totalPages;
    }
    if (state.currentPage < 1) {
        state.currentPage = 1;
    }

    const startIndex = (state.currentPage - 1) * state.pageSize;
    const endIndex = Math.min(startIndex + state.pageSize, totalItems);
    const paginatedItems = state.filteredCustomers.slice(startIndex, startIndex + state.pageSize);

    renderTable(paginatedItems);
    renderPaginationControls(totalPages, startIndex, endIndex, totalItems);
}

// Render Table Rows
function renderTable(customers) {
    const tbody = document.getElementById("customerTableBody");
    const emptyState = document.getElementById("emptyState");
    const errorState = document.getElementById("errorState");

    tbody.innerHTML = "";

    if (customers.length === 0) {
        emptyState.classList.remove("hidden");
        document.getElementById("resultCounter").textContent = "Showing 0 customers";
        return;
    }

    emptyState.classList.add("hidden");
    errorState.classList.add("hidden");
    document.getElementById("resultCounter").textContent = `Showing ${state.filteredCustomers.length} matching customers`;

    customers.forEach(c => {
        const tr = document.createElement("tr");
        const initials = getInitials(c.firstName, c.lastName);
        const formattedSpent = formatCurrency(c.totalSpent);
        const formattedDate = formatDate(c.joinedDate);
        const badgeClass = getStatusBadgeClass(c.status);

        tr.innerHTML = `
            <td>
                <div class="customer-cell-wrapper">
                    <div class="customer-avatar-initials">${escapeHtml(initials)}</div>
                    <div class="customer-name-meta">
                        <span class="customer-full-name">${escapeHtml(c.firstName)} ${escapeHtml(c.lastName)}</span>
                        <span class="customer-id-sub">Customer #${escapeHtml(String(c.id))}</span>
                    </div>
                </div>
            </td>
            <td>${escapeHtml(c.username)}</td>
            <td>${escapeHtml(c.email)}</td>
            <td>${escapeHtml(c.phone || "N/A")}</td>
            <td><strong>${c.orderCount}</strong></td>
            <td>${c.reviewCount}</td>
            <td><strong>${formattedSpent}</strong></td>
            <td><span class="badge ${badgeClass}">${escapeHtml(c.status)}</span></td>
            <td>${escapeHtml(formattedDate)}</td>
            <td class="text-right">
                <div class="action-icon-btns">
                    <button class="action-btn-sm" title="View Details" onclick="openCustomerModal(${c.id})">
                        <i class="fa-solid fa-eye"></i>
                    </button>
                    <button class="action-btn-sm" title="View Orders" onclick="window.location.href='orders.html?customerId=${c.id}'">
                        <i class="fa-solid fa-box"></i>
                    </button>
                    <button class="action-btn-sm" title="Change Status" onclick="openStatusModalById(${c.id})">
                        <i class="fa-solid fa-shield-halved"></i>
                    </button>
                </div>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// Render Pagination Controls
function renderPaginationControls(totalPages, startIndex, endIndex, totalItems) {
    const paginationInfo = document.getElementById("paginationInfo");
    const controls = document.getElementById("paginationControls");

    if (totalItems === 0) {
        paginationInfo.textContent = "Showing 0–0 of 0 customers";
        controls.innerHTML = "";
        return;
    }

    paginationInfo.textContent = `Showing ${startIndex + 1}–${endIndex} of ${totalItems} customers`;
    controls.innerHTML = "";

    // Previous Button
    const prevBtn = document.createElement("button");
    prevBtn.className = "page-btn";
    prevBtn.innerHTML = `<i class="fa-solid fa-chevron-left"></i> Previous`;
    prevBtn.disabled = state.currentPage === 1;
    prevBtn.addEventListener("click", () => {
        if (state.currentPage > 1) {
            state.currentPage--;
            paginateAndRender();
        }
    });
    controls.appendChild(prevBtn);

    // Page Number Buttons
    for (let i = 1; i <= totalPages; i++) {
        if (i === 1 || i === totalPages || (i >= state.currentPage - 1 && i <= state.currentPage + 1)) {
            const pageBtn = document.createElement("button");
            pageBtn.className = `page-btn ${i === state.currentPage ? "active" : ""}`;
            pageBtn.textContent = i;
            pageBtn.addEventListener("click", () => {
                state.currentPage = i;
                paginateAndRender();
            });
            controls.appendChild(pageBtn);
        } else if (i === state.currentPage - 2 || i === state.currentPage + 2) {
            const span = document.createElement("span");
            span.className = "page-btn";
            span.textContent = "...";
            span.style.cursor = "default";
            controls.appendChild(span);
        }
    }

    // Next Button
    const nextBtn = document.createElement("button");
    nextBtn.className = "page-btn";
    nextBtn.innerHTML = `Next <i class="fa-solid fa-chevron-right"></i>`;
    nextBtn.disabled = state.currentPage === totalPages;
    nextBtn.addEventListener("click", () => {
        if (state.currentPage < totalPages) {
            state.currentPage++;
            paginateAndRender();
        }
    });
    controls.appendChild(nextBtn);
}

// Render Summary Statistics Cards
function renderStats() {
    const total = state.customers.length;
    const active = state.customers.filter(c => c.status === "ACTIVE").length;
    const inactiveOrSuspended = state.customers.filter(c => c.status === "INACTIVE" || c.status === "SUSPENDED" || c.status === "PENDING").length;

    // New customers in last 30 days
    const now = new Date();
    const newCustomers = state.customers.filter(c => {
        const joined = new Date(c.joinedDate);
        const diffTime = Math.abs(now - joined);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays <= 30;
    }).length;

    const withOrders = state.customers.filter(c => c.orderCount > 0).length;

    document.getElementById("statTotal").textContent = total.toLocaleString();
    document.getElementById("statActive").textContent = active.toLocaleString();
    document.getElementById("statInactive").textContent = inactiveOrSuspended.toLocaleString();
    document.getElementById("statNew").textContent = newCustomers.toLocaleString();
    document.getElementById("statWithOrders").textContent = withOrders.toLocaleString();
}

// Clear all filters
function clearAllFilters() {
    state.searchTerm = "";
    state.statusFilter = "ALL";
    state.dateFilter = "ALL";
    state.activityFilter = "ALL";
    state.sortBy = "NEWEST";
    state.currentPage = 1;

    document.getElementById("searchInput").value = "";
    document.getElementById("statusFilter").value = "ALL";
    document.getElementById("dateFilter").value = "ALL";
    document.getElementById("activityFilter").value = "ALL";
    document.getElementById("sortBy").value = "NEWEST";

    filterAndRender();
    showToast("Filters Cleared", "Customer list reset to default.", "info");
}

// Open Customer Details Modal
function openCustomerModal(customerId) {
    const customer = state.customers.find(c => c.id === customerId);
    if (!customer) return;

    state.selectedCustomer = customer;
    const modalBody = document.getElementById("customerDetailsModalBody");

    const formattedSpent = formatCurrency(customer.totalSpent);
    const joinedFormatted = formatDate(customer.joinedDate);
    const lastOrderFormatted = customer.lastOrderDate ? formatDate(customer.lastOrderDate) : "No orders yet";
    const badgeClass = getStatusBadgeClass(customer.status);

    let recentOrdersHtml = `<p class="detail-value text-muted">No recent orders found.</p>`;
    if (customer.recentOrders && customer.recentOrders.length > 0) {
        recentOrdersHtml = `
            <div class="table-responsive">
                <table class="data-table" style="font-size: 13px;">
                    <thead>
                        <tr>
                            <th>Order ID</th>
                            <th>Date</th>
                            <th>Total</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${customer.recentOrders.map(ord => `
                            <tr>
                                <td><strong>${escapeHtml(ord.id)}</strong></td>
                                <td>${escapeHtml(ord.date)}</td>
                                <td>${formatCurrency(ord.total)}</td>
                                <td><span class="badge badge-active">${escapeHtml(ord.status)}</span></td>
                            </tr>
                        `).join("")}
                    </tbody>
                </table>
            </div>
        `;
    }

    modalBody.innerHTML = `
        <div class="customer-details-grid">
            <div class="detail-group">
                <span class="detail-label">Full Name</span>
                <span class="detail-value">${escapeHtml(customer.firstName)} ${escapeHtml(customer.lastName)}</span>
            </div>
            <div class="detail-group">
                <span class="detail-label">Customer ID</span>
                <span class="detail-value">#${escapeHtml(String(customer.id))}</span>
            </div>
            <div class="detail-group">
                <span class="detail-label">Username</span>
                <span class="detail-value">${escapeHtml(customer.username)}</span>
            </div>
            <div class="detail-group">
                <span class="detail-label">Email Address</span>
                <span class="detail-value">${escapeHtml(customer.email)}</span>
            </div>
            <div class="detail-group">
                <span class="detail-label">Phone Number</span>
                <span class="detail-value">${escapeHtml(customer.phone || "Not provided")}</span>
            </div>
            <div class="detail-group">
                <span class="detail-label">Account Status</span>
                <span class="detail-value"><span class="badge ${badgeClass}">${escapeHtml(customer.status)}</span></span>
            </div>
            <div class="detail-group full-width">
                <span class="detail-label">Delivery Address</span>
                <span class="detail-value">${escapeHtml(customer.address)}</span>
            </div>
            <div class="detail-group">
                <span class="detail-label">Registration Date</span>
                <span class="detail-value">${escapeHtml(joinedFormatted)}</span>
            </div>
            <div class="detail-group">
                <span class="detail-label">Last Order Date</span>
                <span class="detail-value">${escapeHtml(lastOrderFormatted)}</span>
            </div>
        </div>

        <div class="section-divider">Activity & Financial Summary</div>
        <div class="customer-details-grid">
            <div class="detail-group">
                <span class="detail-label">Total Orders Placed</span>
                <span class="detail-value"><strong>${customer.orderCount}</strong></span>
            </div>
            <div class="detail-group">
                <span class="detail-label">Reviews Written</span>
                <span class="detail-value"><strong>${customer.reviewCount}</strong></span>
            </div>
            <div class="detail-group full-width">
                <span class="detail-label">Lifetime Total Spent</span>
                <span class="detail-value" style="font-size: 18px; color: var(--accent-cyan); font-weight: 700;">${formattedSpent}</span>
            </div>
        </div>

        <div class="section-divider">Recent Orders</div>
        ${recentOrdersHtml}
    `;

    document.getElementById("customerDetailsModal").classList.add("active");
}

function closeCustomerModal() {
    document.getElementById("customerDetailsModal").classList.remove("active");
    state.selectedCustomer = null;
}

// Open Status Change Modal
function openStatusModalById(customerId) {
    const customer = state.customers.find(c => c.id === customerId);
    if (customer) {
        openStatusModal(customer);
    }
}

function openStatusModal(customer) {
    state.selectedCustomer = customer;
    document.getElementById("statusModalCustomerName").textContent = `${customer.firstName} ${customer.lastName}`;
    document.getElementById("statusModalCustomerEmail").textContent = customer.email;

    const currentStatusEl = document.getElementById("statusModalCurrentStatus");
    currentStatusEl.textContent = customer.status;
    currentStatusEl.className = `badge ${getStatusBadgeClass(customer.status)}`;

    document.getElementById("newStatusSelect").value = customer.status;
    document.getElementById("statusModal").classList.add("active");
}

function closeStatusModal() {
    document.getElementById("statusModal").classList.remove("active");
}

// Update Customer Status
function updateCustomerStatus() {
    if (!state.selectedCustomer) return;

    const newStatus = document.getElementById("newStatusSelect").value;
    const userId = state.selectedCustomer.userId || state.selectedCustomer.id;

    const confirmBtn = document.getElementById("confirmStatusBtn");
    confirmBtn.disabled = true;
    confirmBtn.textContent = "Updating...";

    if (USE_MOCK_DATA) {
        setTimeout(() => {
            state.selectedCustomer.status = newStatus;
            const target = state.customers.find(c => c.id === state.selectedCustomer.id);
            if (target) target.status = newStatus;

            filterAndRender();
            renderStats();
            closeStatusModal();
            confirmBtn.disabled = false;
            confirmBtn.textContent = "Update Status";
            showToast("Success", "Customer status updated successfully.", "success");
        }, 500);
    } else {
        // TODO API: PATCH /api/admin/users/{userId}/status
        fetch(`${API_BASE_URL}/admin/users/${userId}/status`, {
            method: "PATCH",
            headers: getAuthHeaders(),
            body: JSON.stringify({ status: newStatus })
        })
            .then(response => {
                if (response.status === 401) { handleApiError(401); throw new Error("Unauthorized"); }
                if (response.status === 403) { handleApiError(403); throw new Error("Forbidden"); }
                if (response.status === 409) { handleApiError(409); throw new Error("Conflict"); }
                if (!response.ok) throw new Error("Update failed");
                return response.json();
            })
            .then(() => {
                state.selectedCustomer.status = newStatus;
                const target = state.customers.find(c => c.id === state.selectedCustomer.id);
                if (target) target.status = newStatus;

                filterAndRender();
                renderStats();
                closeStatusModal();
                confirmBtn.disabled = false;
                confirmBtn.textContent = "Update Status";
                showToast("Success", "Customer status updated successfully.", "success");
            })
            .catch(error => {
                console.error("Status update error:", error);
                confirmBtn.disabled = false;
                confirmBtn.textContent = "Update Status";
                showToast("Error", "Failed to update customer status.", "error");
            });
    }
}

// CSV Export Generator
function exportCustomersCsv() {
    if (state.filteredCustomers.length === 0) {
        showToast("Export Failed", "No customer records available to export.", "warning");
        return;
    }

    const headers = [
        "Customer ID",
        "First Name",
        "Last Name",
        "Username",
        "Email",
        "Phone",
        "Status",
        "Joined Date",
        "Order Count",
        "Review Count",
        "Total Spent (LKR)"
    ];

    const rows = state.filteredCustomers.map(c => [
        c.id,
        `"${(c.firstName || "").replace(/"/g, '""')}"`,
        `"${(c.lastName || "").replace(/"/g, '""')}"`,
        `"${(c.username || "").replace(/"/g, '""')}"`,
        `"${(c.email || "").replace(/"/g, '""')}"`,
        `"${(c.phone || "").replace(/"/g, '""')}"`,
        c.status,
        c.joinedDate,
        c.orderCount,
        c.reviewCount,
        c.totalSpent.toFixed(2)
    ]);

    const csvContent = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "aquarium-fish-customers.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast("Export Complete", "customer CSV exported successfully.", "success");
}

// URL Parameter Handling (e.g., customers.html?search=kasun or customerId=1001)
function handleUrlParams() {
    const params = new URLSearchParams(window.location.search);
    const searchParam = params.get("search");
    const statusParam = params.get("status");
    const customerIdParam = params.get("customerId");

    if (searchParam) {
        state.searchTerm = searchParam;
        const searchInput = document.getElementById("searchInput");
        if (searchInput) searchInput.value = searchParam;
    }

    if (statusParam) {
        state.statusFilter = statusParam.toUpperCase();
        const statusSelect = document.getElementById("statusFilter");
        if (statusSelect) statusSelect.value = state.statusFilter;
    }

    // If customerId is provided, open details modal once loaded
    if (customerIdParam) {
        const checkExist = setInterval(() => {
            if (state.customers.length > 0) {
                clearInterval(checkExist);
                const targetId = parseInt(customerIdParam, 10);
                const found = state.customers.find(c => c.id === targetId);
                if (found) {
                    openCustomerModal(found.id);
                }
            }
        }, 100);
    }
}

// Helper Utilities
function getInitials(firstName, lastName) {
    const first = firstName ? firstName.charAt(0) : "";
    const last = lastName ? lastName.charAt(0) : "";
    return (first + last).toUpperCase() || "CF";
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('en-LK', {
        style: 'currency',
        currency: 'LKR',
        minimumFractionDigits: 2
    }).format(amount || 0);
}

function formatDate(dateString) {
    if (!dateString) return "N/A";
    const options = { year: 'numeric', month: 'short', day: '2-digit' };
    const date = new Date(dateString);
    return isNaN(date) ? dateString : date.toLocaleDateString('en-US', options);
}

function getStatusBadgeClass(status) {
    switch ((status || "").toUpperCase()) {
        case "ACTIVE": return "badge-active";
        case "INACTIVE": return "badge-inactive";
        case "SUSPENDED": return "badge-suspended";
        case "PENDING": return "badge-pending";
        default: return "badge-inactive";
    }
}

function escapeHtml(str) {
    if (str === null || str === undefined) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

// UI State Loaders & Error Handlers
function showLoadingState(isLoading) {
    const loadingState = document.getElementById("loadingState");
    const tableBody = document.getElementById("customerTableBody");
    if (isLoading) {
        loadingState.classList.remove("hidden");
        tableBody.innerHTML = "";
    } else {
        loadingState.classList.add("hidden");
    }
}

function showErrorState(message) {
    const errorState = document.getElementById("errorState");
    const errorText = document.getElementById("errorMessageText");
    errorText.textContent = message;
    errorState.classList.remove("hidden");
}

function handleApiError(status) {
    switch (status) {
        case 401:
            showToast("Session Expired", "Your session has expired. Please log in again.", "error");
            setTimeout(() => window.location.href = "../login.html", 2000);
            break;
        case 403:
            showToast("Access Denied", "You do not have permission to access customer management.", "error");
            break;
        case 404:
            showToast("Not Found", "Customer resource not found.", "warning");
            break;
        case 409:
            showToast("Conflict", "This customer account cannot be updated because of a conflict.", "warning");
            break;
        case 500:
        default:
            showToast("Server Error", "Server error. Please try again later.", "error");
            break;
    }
}

// Reusable Toast Notification System
function showToast(title, message, type = "info") {
    const container = document.getElementById("toastContainer");
    if (!container) return;

    const toast = document.createElement("div");
    toast.className = `toast ${type}`;

    let iconClass = "fa-solid fa-circle-info";
    if (type === "success") iconClass = "fa-solid fa-circle-check";
    if (type === "error") iconClass = "fa-solid fa-triangle-exclamation";
    if (type === "warning") iconClass = "fa-solid fa-triangle-exclamation";

    toast.innerHTML = `
        <i class="${iconClass}"></i>
        <div class="toast-content">
            <span class="toast-title">${escapeHtml(title)}</span>
            <span class="toast-message">${escapeHtml(message)}</span>
        </div>
    `;

    container.appendChild(toast);

    setTimeout(() => {
        toast.classList.add("hiding");
        setTimeout(() => {
            toast.remove();
        }, 300);
    }, 3500);
}