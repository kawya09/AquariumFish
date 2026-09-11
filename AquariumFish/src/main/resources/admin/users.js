/**
 * ==========================================================================
 * Aquarium Fish E-Commerce Admin - User Management JavaScript Controller
 * Spring Boot REST API integration & robust Mock Mode support
 * ==========================================================================
 */

const API_BASE_URL = "http://localhost:8080/api";
const USE_MOCK_DATA = true;
const PAGE_SIZE = 10;

// Application State
let usersState = [];
let filteredUsersState = [];
let currentPage = 1;
let currentSearch = "";
let currentRole = "";
let currentStatus = "";
let currentDateFilter = "";
let currentSort = "newest";
let currentQuickFilter = "all";
let activeUserIdForStatus = null;
let isRefreshing = false;

// Mock Data Pool (20 realistic users)
let mockUsers = [
    { id: 101, username: "kasun01", email: "kasun@example.com", displayName: "Kasun Perera", role: "CUSTOMER", status: "ACTIVE", customerId: 52, sellerId: null, adminId: null, createdAt: "2026-09-11T08:30:00" },
    { id: 102, username: "aquaworld", email: "aquaworld@example.com", displayName: "Aqua World", role: "SELLER", status: "ACTIVE", customerId: null, sellerId: 17, adminId: null, createdAt: "2026-08-20T09:15:00" },
    { id: 103, username: "admin_nimal", email: "nimal@aquarium.lk", displayName: "Nimal Admin", role: "ADMIN", status: "ACTIVE", customerId: null, sellerId: null, adminId: 1, createdAt: "2026-01-10T10:00:00" },
    { id: 104, username: "sanduni89", email: "sanduni@example.com", displayName: "Sanduni Gunasekara", role: "CUSTOMER", status: "ACTIVE", customerId: 53, sellerId: null, adminId: null, createdAt: "2026-09-08T14:20:00" },
    { id: 105, username: "blueocean", email: "sales@blueocean.com", displayName: "Blue Ocean Aquatics", role: "SELLER", status: "ACTIVE", customerId: null, sellerId: 18, adminId: null, createdAt: "2026-08-15T11:45:00" },
    { id: 106, username: "tropical_life", email: "tropicals@example.com", displayName: "Tropical Fish Hub", role: "SELLER", status: "INACTIVE", customerId: null, sellerId: 19, adminId: null, createdAt: "2026-07-19T16:10:00" },
    { id: 107, username: "fishlover92", email: "chathura@example.com", displayName: "Chathura Madushanka", role: "CUSTOMER", status: "ACTIVE", customerId: 54, sellerId: null, adminId: null, createdAt: "2026-09-02T12:00:00" },
    { id: 108, username: "aquatic_hub", email: "hub@aquatic.lk", displayName: "Aquatic Hub LK", role: "SELLER", status: "ACTIVE", customerId: null, sellerId: 20, adminId: null, createdAt: "2026-06-11T09:30:00" },
    { id: 109, username: "tharindu88", email: "tharindu@example.com", displayName: "Tharindu Silva", role: "CUSTOMER", status: "SUSPENDED", customerId: 55, sellerId: null, adminId: null, createdAt: "2026-05-22T15:20:00" },
    { id: 110, username: "dilshan_f", email: "dilshan@example.com", displayName: "Dilshan Fernando", role: "CUSTOMER", status: "ACTIVE", customerId: 56, sellerId: null, adminId: null, createdAt: "2026-09-10T11:15:00" },
    { id: 111, username: "marine_world", email: "marine@world.com", displayName: "Marine World", role: "SELLER", status: "ACTIVE", customerId: null, sellerId: 21, adminId: null, createdAt: "2026-04-12T08:50:00" },
    { id: 112, username: "neonlover", email: "neon@example.com", displayName: "Priyankara Perera", role: "CUSTOMER", status: "ACTIVE", customerId: 57, sellerId: null, adminId: null, createdAt: "2026-09-05T19:40:00" },
    { id: 113, username: "admin_sandya", email: "sandya@aquarium.lk", displayName: "Sandya Wickramasinghe", role: "ADMIN", status: "ACTIVE", customerId: null, sellerId: null, adminId: 2, createdAt: "2026-02-14T10:00:00" },
    { id: 114, username: "rohan_fish", email: "rohan@example.com", displayName: "Rohan Jayasuriya", role: "CUSTOMER", status: "PENDING", customerId: 58, sellerId: null, adminId: null, createdAt: "2026-09-11T12:05:00" },
    { id: 115, username: "cichlid_king", email: "king@cichlid.com", displayName: "Cichlid Empire", role: "SELLER", status: "ACTIVE", customerId: null, sellerId: 22, adminId: null, createdAt: "2026-03-30T14:15:00" },
    { id: 116, username: "nayana_k", email: "nayana@example.com", displayName: "Nayana Kumari", role: "CUSTOMER", status: "INACTIVE", customerId: 59, sellerId: null, adminId: null, createdAt: "2026-01-25T09:20:00" },
    { id: 117, username: "guppy_master", email: "guppy@example.com", displayName: "Nuwan Gunawardena", role: "SELLER", status: "SUSPENDED", customerId: null, sellerId: 23, adminId: null, createdAt: "2026-02-18T16:00:00" },
    { id: 118, username: "shanthi_s", email: "shanthi@example.com", displayName: "Shanthi Senaratne", role: "CUSTOMER", status: "ACTIVE", customerId: 60, sellerId: null, adminId: null, createdAt: "2026-08-30T13:10:00" },
    { id: 119, username: "apex_aquatics", email: "apex@aquatics.lk", displayName: "Apex Aquatics", role: "SELLER", status: "ACTIVE", customerId: null, sellerId: 24, adminId: null, createdAt: "2026-07-04T10:25:00" },
    { id: 120, username: "admin_kasun", email: "masteradmin@aquarium.lk", displayName: "Super Administrator", role: "ADMIN", status: "ACTIVE", customerId: null, sellerId: null, adminId: 3, createdAt: "2026-01-01T00:00:00" }
];

// Display Mappings
const STATUS_LABELS = {
    ACTIVE: "Active",
    INACTIVE: "Inactive",
    SUSPENDED: "Suspended",
    PENDING: "Pending"
};

const ROLE_LABELS = {
    CUSTOMER: "Customer",
    SELLER: "Seller",
    ADMIN: "Administrator"
};

// Initialization on DOMContentLoaded
document.addEventListener("DOMContentLoaded", () => {
    initializePage();
});

function initializePage() {
    if (USE_MOCK_DATA) {
        const demoBadge = document.getElementById("demoBadge");
        if (demoBadge) demoBadge.style.display = "inline-block";
    }

    setupEventListeners();
    parseUrlFilters();
    loadUsers();
}

// Event Listeners Setup
function setupEventListeners() {
    // Mobile Sidebar Toggle
    const mobileMenuBtn = document.getElementById("mobileMenuBtn");
    const adminSidebar = document.getElementById("adminSidebar");
    const sidebarOverlay = document.getElementById("sidebarOverlay");

    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener("click", () => {
            adminSidebar.classList.add("open");
            sidebarOverlay.classList.add("open");
        });
    }

    if (sidebarOverlay) {
        sidebarOverlay.addEventListener("click", () => {
            adminSidebar.classList.remove("open");
            sidebarOverlay.classList.remove("open");
        });
    }

    // ESC key closes mobile sidebar and modals
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
            if (adminSidebar) adminSidebar.classList.remove("open");
            if (sidebarOverlay) sidebarOverlay.classList.remove("open");
            closeUserDetailsModal();
            closeEditUserModal();
            closeStatusModal();
        }
    });

    // Admin Profile Dropdown
    const profileToggleBtn = document.getElementById("profileToggleBtn");
    const adminProfileDropdown = document.getElementById("adminProfileDropdown");

    if (profileToggleBtn) {
        profileToggleBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            adminProfileDropdown.classList.toggle("show");
            profileToggleBtn.setAttribute("aria-expanded", adminProfileDropdown.classList.contains("show"));
        });
    }

    document.addEventListener("click", () => {
        if (adminProfileDropdown) {
            adminProfileDropdown.classList.remove("show");
            if (profileToggleBtn) profileToggleBtn.setAttribute("aria-expanded", "false");
        }
    });

    // Logout action
    const logoutBtn = document.getElementById("logoutBtn");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", logout);
    }

    // Search input with debounce (~300ms)
    const searchInput = document.getElementById("searchInput");
    const clearSearchBtn = document.getElementById("clearSearchBtn");
    let searchTimeout;

    if (searchInput) {
        searchInput.addEventListener("input", (e) => {
            currentSearch = e.target.value.trim();
            if (clearSearchBtn) {
                clearSearchBtn.style.display = currentSearch ? "block" : "none";
            }
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                currentPage = 1;
                applyFilters();
            }, 300);
        });
    }

    if (clearSearchBtn) {
        clearSearchBtn.addEventListener("click", () => {
            if (searchInput) searchInput.value = "";
            currentSearch = "";
            clearSearchBtn.style.display = "none";
            currentPage = 1;
            applyFilters();
        });
    }

    // Filter selects
    const roleFilter = document.getElementById("roleFilter");
    const statusFilter = document.getElementById("statusFilter");
    const dateFilter = document.getElementById("dateFilter");
    const sortFilter = document.getElementById("sortFilter");

    if (roleFilter) {
        roleFilter.addEventListener("change", (e) => {
            currentRole = e.target.value;
            currentPage = 1;
            syncQuickFilterChips();
            applyFilters();
        });
    }

    if (statusFilter) {
        statusFilter.addEventListener("change", (e) => {
            currentStatus = e.target.value;
            currentPage = 1;
            syncQuickFilterChips();
            applyFilters();
        });
    }

    if (dateFilter) {
        dateFilter.addEventListener("change", (e) => {
            currentDateFilter = e.target.value;
            currentPage = 1;
            applyFilters();
        });
    }

    if (sortFilter) {
        sortFilter.addEventListener("change", (e) => {
            currentSort = e.target.value;
            applyFilters();
        });
    }

    // Clear filters button
    const clearFiltersBtn = document.getElementById("clearFiltersBtn");
    const emptyClearFiltersBtn = document.getElementById("emptyClearFiltersBtn");

    const clearAllFiltersAction = () => {
        currentSearch = "";
        currentRole = "";
        currentStatus = "";
        currentDateFilter = "";
        currentSort = "newest";
        currentQuickFilter = "all";

        if (searchInput) searchInput.value = "";
        if (clearSearchBtn) clearSearchBtn.style.display = "none";
        if (roleFilter) roleFilter.value = "";
        if (statusFilter) statusFilter.value = "";
        if (dateFilter) dateFilter.value = "";
        if (sortFilter) sortFilter.value = "newest";

        syncQuickFilterChips();
        currentPage = 1;
        applyFilters();
        showToast("Filters cleared.", "info");
    };

    if (clearFiltersBtn) clearFiltersBtn.addEventListener("click", clearAllFiltersAction);
    if (emptyClearFiltersBtn) emptyClearFiltersBtn.addEventListener("click", clearAllFiltersAction);

    // Quick filter chips
    const chips = document.querySelectorAll(".quick-filters .chip");
    chips.forEach(chip => {
        chip.addEventListener("click", (e) => {
            chips.forEach(c => c.classList.remove("active"));
            const target = e.currentTarget;
            target.classList.add("active");

            const q = target.getAttribute("data-quick");
            currentQuickFilter = q;
            currentPage = 1;

            if (q === "all") {
                currentRole = "";
                currentStatus = "";
            } else if (q === "CUSTOMER" || q === "SELLER" || q === "ADMIN") {
                currentRole = q;
                currentStatus = "";
            } else if (q === "ACTIVE") {
                currentRole = "";
                currentStatus = "ACTIVE";
            } else if (q === "INACTIVE") {
                currentRole = "";
                currentStatus = "INACTIVE"; // or suspended handled in filtering
            }

            if (roleFilter) roleFilter.value = currentRole;
            if (statusFilter) statusFilter.value = currentStatus;

            applyFilters();
        });
    });

    // Refresh & Export buttons
    const refreshBtn = document.getElementById("refreshBtn");
    if (refreshBtn) refreshBtn.addEventListener("click", refreshUsers);

    const exportCsvBtn = document.getElementById("exportCsvBtn");
    if (exportCsvBtn) exportCsvBtn.addEventListener("click", exportUsersToCsv);

    const retryBtn = document.getElementById("retryBtn");
    if (retryBtn) retryBtn.addEventListener("click", loadUsers);

    // Modal Close handlers
    document.getElementById("closeViewModal")?.addEventListener("click", closeUserDetailsModal);
    document.getElementById("closeViewBtn")?.addEventListener("click", closeUserDetailsModal);
    document.getElementById("viewUserModal")?.addEventListener("click", (e) => {
        if (e.target === e.currentTarget) closeUserDetailsModal();
    });

    document.getElementById("closeEditModal")?.addEventListener("click", closeEditUserModal);
    document.getElementById("cancelEditBtn")?.addEventListener("click", closeEditUserModal);
    document.getElementById("editUserModal")?.addEventListener("click", (e) => {
        if (e.target === e.currentTarget) closeEditUserModal();
    });

    document.getElementById("closeStatusModal")?.addEventListener("click", closeStatusModal);
    document.getElementById("cancelStatusBtn")?.addEventListener("click", closeStatusModal);
    document.getElementById("statusConfirmModal")?.addEventListener("click", (e) => {
        if (e.target === e.currentTarget) closeStatusModal();
    });

    // Edit User Form Submission
    const editUserForm = document.getElementById("editUserForm");
    if (editUserForm) {
        editUserForm.addEventListener("submit", submitUserUpdate);
    }
}

// Parse URL Query Parameters on Load
function parseUrlFilters() {
    const params = new URLSearchParams(window.location.search);
    const roleParam = params.get("role");
    const statusParam = params.get("status");
    const searchParam = params.get("search");

    if (roleParam) {
        currentRole = roleParam.toUpperCase();
        const roleFilterEl = document.getElementById("roleFilter");
        if (roleFilterEl) roleFilterEl.value = currentRole;
    }

    if (statusParam) {
        currentStatus = statusParam.toUpperCase();
        const statusFilterEl = document.getElementById("statusFilter");
        if (statusFilterEl) statusFilterEl.value = currentStatus;
    }

    if (searchParam) {
        currentSearch = searchParam;
        const searchInputEl = document.getElementById("searchInput");
        if (searchInputEl) searchInputEl.value = currentSearch;
        const clearSearchBtn = document.getElementById("clearSearchBtn");
        if (clearSearchBtn) clearSearchBtn.style.display = "block";
    }
}

function syncQuickFilterChips() {
    const chips = document.querySelectorAll(".quick-filters .chip");
    chips.forEach(c => c.classList.remove("active"));

    if (!currentRole && !currentStatus) {
        document.querySelector('.quick-filters .chip[data-quick="all"]')?.classList.add("active");
    } else if (currentRole) {
        document.querySelector(`.quick-filters .chip[data-quick="${currentRole}"]`)?.classList.add("active");
    } else if (currentStatus === "ACTIVE") {
        document.querySelector('.quick-filters .chip[data-quick="ACTIVE"]')?.classList.add("active");
    }
}

// Data Loading Function
async function loadUsers() {
    showLoadingState();

    if (USE_MOCK_DATA) {
        // Simulate minor network delay for realism
        setTimeout(() => {
            usersState = [...mockUsers];
            renderStatistics(usersState);
            applyFilters();
            showToast("Users loaded successfully.", "success");
        }, 350);
        return;
    }

    try {
        const queryParams = new URLSearchParams();
        queryParams.append("page", currentPage - 1);
        queryParams.append("size", PAGE_SIZE);
        if (currentSearch) queryParams.append("search", currentSearch);
        if (currentRole) queryParams.append("role", currentRole);
        if (currentStatus) queryParams.append("status", currentStatus);
        if (currentSort) queryParams.append("sort", currentSort);

        const response = await apiRequest(`/admin/users?${queryParams.toString()}`);
        // Assuming Spring Page or List format
        usersState = response.content || response;
        renderStatistics(usersState);
        applyFilters();
    } catch (err) {
        showErrorState(err.message || "Unable to load user accounts from backend.");
    }
}

// Refresh Users
async function refreshUsers() {
    if (isRefreshing) return;
    isRefreshing = true;
    const refreshBtn = document.getElementById("refreshBtn");
    if (refreshBtn) refreshBtn.classList.add("fa-spin");

    await loadUsers();

    if (refreshBtn) refreshBtn.classList.remove("fa-spin");
    isRefreshing = false;
    showToast("User list refreshed.", "success");
}

// Filtering & Sorting Logic (Client-side for mock, adaptable for server-side)
function applyFilters() {
    let result = [...usersState];

    // Search filter
    if (currentSearch) {
        const q = currentSearch.toLowerCase();
        result = result.filter(u =>
            (u.username && u.username.toLowerCase().includes(q)) ||
            (u.email && u.email.toLowerCase().includes(q)) ||
            (u.displayName && u.displayName.toLowerCase().includes(q))
        );
    }

    // Role filter
    if (currentRole) {
        result = result.filter(u => u.role === currentRole);
    }

    // Status filter
    if (currentStatus) {
        if (currentStatus === "INACTIVE") {
            result = result.filter(u => u.status === "INACTIVE" || u.status === "SUSPENDED");
        } else {
            result = result.filter(u => u.status === currentStatus);
        }
    }

    // Date filter
    if (currentDateFilter) {
        const now = new Date();
        result = result.filter(u => {
            const d = new Date(u.createdAt);
            if (isNaN(d)) return true;
            const diffTime = Math.abs(now - d);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            if (currentDateFilter === "today") return diffDays <= 1;
            if (currentDateFilter === "7days") return diffDays <= 7;
            if (currentDateFilter === "30days") return diffDays <= 30;
            if (currentDateFilter === "thisyear") return d.getFullYear() === now.getFullYear();
            return true;
        });
    }

    // Sorting
    result.sort((a, b) => {
        if (currentSort === "newest") {
            return new Date(b.createdAt) - new Date(a.createdAt);
        } else if (currentSort === "oldest") {
            return new Date(a.createdAt) - new Date(b.createdAt);
        } else if (currentSort === "username-asc") {
            return (a.username || "").localeCompare(b.username || "");
        } else if (currentSort === "username-desc") {
            return (b.username || "").localeCompare(a.username || "");
        } else if (currentSort === "email-asc") {
            return (a.email || "").localeCompare(b.email || "");
        }
        return 0;
    });

    filteredUsersState = result;
    renderTablePage();
}

// Pagination & Rendering
function renderTablePage() {
    const totalItems = filteredUsersState.length;
    const totalPages = Math.ceil(totalItems / PAGE_SIZE) || 1;

    if (currentPage > totalPages) {
        currentPage = totalPages;
    }

    const startIndex = (currentPage - 1) * PAGE_SIZE;
    const endIndex = Math.min(startIndex + PAGE_SIZE, totalItems);
    const paginatedItems = filteredUsersState.slice(startIndex, endIndex);

    const tableBody = document.getElementById("usersTableBody");
    const mobileContainer = document.getElementById("mobileCardsContainer");
    const resultCountBadge = document.getElementById("resultCountBadge");
    const paginationInfo = document.getElementById("paginationInfo");

    if (resultCountBadge) resultCountBadge.textContent = `Showing ${totalItems.toLocaleString("en-LK")} users`;
    if (paginationInfo) {
        paginationInfo.textContent = totalItems === 0
            ? "Showing 0 of 0 users"
            : `Showing ${startIndex + 1}–${endIndex} of ${totalItems.toLocaleString("en-LK")} users`;
    }

    if (totalItems === 0) {
        showEmptyState();
        return;
    }

    hideStates();

    // Render Desktop Table
    if (tableBody) {
        tableBody.innerHTML = paginatedItems.map(user => {
            const initials = generateInitials(user.displayName || user.username);
            const roleBadgeClass = user.role === "CUSTOMER" ? "badge-customer" : user.role === "SELLER" ? "badge-seller" : "badge-admin";
            const roleIcon = user.role === "CUSTOMER" ? "fa-user" : user.role === "SELLER" ? "fa-store" : "fa-shield-halved";
            const statusBadgeClass = user.status === "ACTIVE" ? "badge-active" : user.status === "SUSPENDED" ? "badge-suspended" : "badge-inactive";
            const formattedDate = formatDate(user.createdAt);
            const accountTypeLabel = user.role === "CUSTOMER" ? "Customer Account" : user.role === "SELLER" ? "Seller Account" : "Administrator";

            return `
                <tr>
                    <td>
                        <div class="user-cell">
                            <div class="user-avatar">${escapeHtml(initials)}</div>
                            <div class="user-info-text">
                                <span class="user-display-name">${escapeHtml(user.displayName || user.username)}</span>
                                <span class="user-username-id">@${escapeHtml(user.username)} • ID: #${user.id}</span>
                            </div>
                        </div>
                    </td>
                    <td>${escapeHtml(user.email)}</td>
                    <td>
                        <span class="badge ${roleBadgeClass}">
                            <i class="fa-solid ${roleIcon}"></i> ${escapeHtml(ROLE_LABELS[user.role] || user.role)}
                        </span>
                    </td>
                    <td>
                        <span class="badge ${statusBadgeClass}">
                            ${escapeHtml(STATUS_LABELS[user.status] || user.status)}
                        </span>
                    </td>
                    <td>${escapeHtml(formattedDate)}</td>
                    <td>${escapeHtml(accountTypeLabel)}</td>
                    <td class="text-right">
                        <div class="action-buttons">
                            <button type="button" class="action-btn" title="View Details" onclick="openUserDetailsModal(${user.id})">
                                <i class="fa-solid fa-eye"></i>
                            </button>
                            <button type="button" class="action-btn" title="Edit User" onclick="openEditUserModal(${user.id})">
                                <i class="fa-solid fa-pen"></i>
                            </button>
                            <button type="button" class="action-btn" title="Change Status" onclick="openStatusModal(${user.id})">
                                <i class="fa-solid fa-power-off"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }).join("");
    }

    // Render Mobile Cards
    if (mobileContainer) {
        mobileContainer.innerHTML = paginatedItems.map(user => {
            const initials = generateInitials(user.displayName || user.username);
            const roleBadgeClass = user.role === "CUSTOMER" ? "badge-customer" : user.role === "SELLER" ? "badge-seller" : "badge-admin";
            const statusBadgeClass = user.status === "ACTIVE" ? "badge-active" : user.status === "SUSPENDED" ? "badge-suspended" : "badge-inactive";

            return `
                <div class="mobile-user-card">
                    <div class="mobile-card-header">
                        <div class="user-cell">
                            <div class="user-avatar" style="width:36px;height:36px;font-size:12px;">${escapeHtml(initials)}</div>
                            <div class="user-info-text">
                                <span class="user-display-name" style="font-size:14px;">${escapeHtml(user.displayName || user.username)}</span>
                                <span class="user-username-id">@${escapeHtml(user.username)}</span>
                            </div>
                        </div>
                        <span class="badge ${statusBadgeClass}">${escapeHtml(STATUS_LABELS[user.status] || user.status)}</span>
                    </div>
                    <div class="mobile-card-body">
                        <div class="mobile-card-field">
                            <span>Email</span>
                            <strong>${escapeHtml(user.email)}</strong>
                        </div>
                        <div class="mobile-card-field">
                            <span>Role</span>
                            <span class="badge ${roleBadgeClass}">${escapeHtml(ROLE_LABELS[user.role] || user.role)}</span>
                        </div>
                        <div class="mobile-card-field">
                            <span>Joined</span>
                            <strong>${escapeHtml(formatDate(user.createdAt))}</strong>
                        </div>
                        <div class="mobile-card-field">
                            <span>ID</span>
                            <strong>#${user.id}</strong>
                        </div>
                    </div>
                    <div class="mobile-card-footer">
                        <button type="button" class="btn btn-subtle" style="padding:6px 12px;font-size:12px;" onclick="openUserDetailsModal(${user.id})">View</button>
                        <button type="button" class="btn btn-outline" style="padding:6px 12px;font-size:12px;" onclick="openEditUserModal(${user.id})">Edit</button>
                        <button type="button" class="btn btn-outline" style="padding:6px 12px;font-size:12px;" onclick="openStatusModal(${user.id})">Status</button>
                    </div>
                </div>
            `;
        }).join("");
    }

    renderPaginationControls(totalPages);
}

function renderPaginationControls(totalPages) {
    const container = document.getElementById("paginationControls");
    if (!container) return;

    let html = ``;
    html += `<button type="button" class="page-btn" ${currentPage === 1 ? "disabled" : ""} onclick="changePage(${currentPage - 1})"><i class="fa-solid fa-chevron-left"></i></button>`;

    for (let i = 1; i <= totalPages; i++) {
        if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
            html += `<button type="button" class="page-btn ${i === currentPage ? "active" : ""}" onclick="changePage(${i})">${i}</button>`;
        } else if (i === currentPage - 2 || i === currentPage + 2) {
            html += `<span style="padding:6px 8px;color:var(--text-muted);">...</span>`;
        }
    }

    html += `<button type="button" class="page-btn" ${currentPage === totalPages || totalPages === 0 ? "disabled" : ""} onclick="changePage(${currentPage + 1})"><i class="fa-solid fa-chevron-right"></i></button>`;
    container.innerHTML = html;
}

function changePage(page) {
    currentPage = page;
    renderTablePage();
    window.scrollTo({ top: 300, behavior: 'smooth' });
}

// Statistics Calculation & Rendering
function renderStatistics(list) {
    const totalUsers = list.length;
    const customers = list.filter(u => u.role === "CUSTOMER").length;
    const sellers = list.filter(u => u.role === "SELLER").length;
    const admins = list.filter(u => u.role === "ADMIN").length;
    const active = list.filter(u => u.status === "ACTIVE").length;
    const inactive = list.filter(u => u.status === "INACTIVE" || u.status === "SUSPENDED").length;

    document.getElementById("statTotalUsers").textContent = totalUsers.toLocaleString("en-LK");
    document.getElementById("statCustomers").textContent = customers.toLocaleString("en-LK");
    document.getElementById("statSellers").textContent = sellers.toLocaleString("en-LK");
    document.getElementById("statAdmins").textContent = admins.toLocaleString("en-LK");
    document.getElementById("statActive").textContent = active.toLocaleString("en-LK");
    document.getElementById("statInactive").textContent = inactive.toLocaleString("en-LK");
}

// View User Modal
window.openUserDetailsModal = function(userId) {
    const user = usersState.find(u => u.id === userId);
    if (!user) return;

    const initials = generateInitials(user.displayName || user.username);
    const body = document.getElementById("viewModalBody");

    let profileExtraHtml = "";
    if (user.role === "CUSTOMER") {
        profileExtraHtml = `
            <div class="details-section-title">Customer Profile Info</div>
            <div class="details-grid">
                <span class="label">Customer ID</span>
                <span class="value">#${user.customerId || 'N/A'}</span>
                <span class="label">Linked Navigation</span>
                <span class="value"><a href="customers.html?id=${user.customerId}" style="color:var(--primary);text-decoration:none;"><i class="fa-solid fa-external-link-alt"></i> Open Customer Profile</a></span>
            </div>
        `;
    } else if (user.role === "SELLER") {
        profileExtraHtml = `
            <div class="details-section-title">Seller Profile Info</div>
            <div class="details-grid">
                <span class="label">Seller ID</span>
                <span class="value">#${user.sellerId || 'N/A'}</span>
                <span class="label">Shop Name</span>
                <span class="value">${escapeHtml(user.displayName)}</span>
                <span class="label">Linked Navigation</span>
                <span class="value"><a href="sellers.html?id=${user.sellerId}" style="color:var(--primary);text-decoration:none;"><i class="fa-solid fa-external-link-alt"></i> Open Seller Profile</a></span>
            </div>
        `;
    } else if (user.role === "ADMIN") {
        profileExtraHtml = `
            <div class="details-section-title">Administrator Info</div>
            <div class="details-grid">
                <span class="label">Admin ID</span>
                <span class="value">#${user.adminId || '1'}</span>
                <span class="label">Privilege Level</span>
                <span class="value">Full System Control</span>
            </div>
        `;
    }

    body.innerHTML = `
        <div class="modal-user-profile-header">
            <div class="modal-user-avatar">${escapeHtml(initials)}</div>
            <div class="modal-user-meta">
                <h4>${escapeHtml(user.displayName || user.username)}</h4>
                <p>@${escapeHtml(user.username)} • System ID #${user.id}</p>
            </div>
        </div>

        <div class="details-section-title">Account Information</div>
        <div class="details-grid">
            <span class="label">Email Address</span>
            <span class="value">${escapeHtml(user.email)}</span>
            <span class="label">Role</span>
            <span class="value">${escapeHtml(ROLE_LABELS[user.role] || user.role)}</span>
            <span class="label">Status</span>
            <span class="value">${escapeHtml(STATUS_LABELS[user.status] || user.status)}</span>
            <span class="label">Joined Date</span>
            <span class="value">${escapeHtml(formatDate(user.createdAt))}</span>
        </div>

        ${profileExtraHtml}
    `;

    document.getElementById("viewUserModal").classList.add("show");
};

function closeUserDetailsModal() {
    document.getElementById("viewUserModal")?.classList.remove("show");
}

// Edit User Modal
window.openEditUserModal = function(userId) {
    const user = usersState.find(u => u.id === userId);
    if (!user) return;

    document.getElementById("editUserId").value = user.id;
    document.getElementById("editUsername").value = user.username;
    document.getElementById("editEmail").value = user.email;
    document.getElementById("editRole").value = user.role;
    document.getElementById("editStatus").value = user.status;

    document.getElementById("editUserModal").classList.add("show");
};

function closeEditUserModal() {
    document.getElementById("editUserModal")?.classList.remove("show");
}

async function submitUserUpdate(e) {
    e.preventDefault();
    const userId = parseInt(document.getElementById("editUserId").value, 10);
    const username = document.getElementById("editUsername").value.trim();
    const email = document.getElementById("editEmail").value.trim();
    const role = document.getElementById("editRole").value;
    const status = document.getElementById("editStatus").value;

    const userObj = usersState.find(u => u.id === userId);
    if (!userObj) return;

    if (USE_MOCK_DATA) {
        userObj.username = username;
        userObj.email = email;
        userObj.role = role;
        userObj.status = status;

        closeEditUserModal();
        renderStatistics(usersState);
        applyFilters();
        showToast("User information updated successfully (Demo Mode).", "success");
        return;
    }

    try {
        await apiRequest(`/admin/users/${userId}`, {
            method: "PUT",
            body: JSON.stringify({ username, email, role, status })
        });
        closeEditUserModal();
        await loadUsers();
        showToast("User updated successfully.", "success");
    } catch (err) {
        showToast(err.message || "Unable to update user account.", "error");
    }
}

// Status Management Modal
window.openStatusModal = function(userId) {
    const user = usersState.find(u => u.id === userId);
    if (!user) return;

    activeUserIdForStatus = userId;
    const nextStatus = user.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";

    document.getElementById("statusModalTitle").textContent = nextStatus === "ACTIVE" ? "Activate User?" : "Deactivate User?";
    document.getElementById("statusTargetName").textContent = user.displayName || user.username;
    document.getElementById("statusTargetUsername").textContent = `@${user.username} (Current: ${user.status})`;
    document.getElementById("statusModalMessage").textContent = nextStatus === "ACTIVE"
        ? "This will restore the user's access to the aquarium e-commerce platform."
        : "This will prevent the user from accessing the platform and signing into their account.";

    const confirmBtn = document.getElementById("confirmStatusBtn");
    confirmBtn.textContent = nextStatus === "ACTIVE" ? "Activate User" : "Deactivate User";
    confirmBtn.className = nextStatus === "ACTIVE" ? "btn btn-primary" : "btn btn-danger";

    document.getElementById("statusConfirmModal").classList.add("show");

    // Re-bind confirm button action securely
    confirmBtn.onclick = async () => {
        if (USE_MOCK_DATA) {
            user.status = nextStatus;
            closeStatusModal();
            renderStatistics(usersState);
            applyFilters();
            showToast(`User status updated to ${nextStatus} successfully (Demo).`, "success");
            return;
        }

        try {
            await apiRequest(`/admin/users/${userId}/status`, {
                method: "PATCH",
                body: JSON.stringify({ status: nextStatus })
            });
            closeStatusModal();
            await loadUsers();
            showToast("User status updated successfully.", "success");
        } catch (err) {
            showToast(err.message || "Unable to update user status.", "error");
        }
    };
};

function closeStatusModal() {
    document.getElementById("statusConfirmModal")?.classList.remove("show");
    activeUserIdForStatus = null;
}

// CSV Export
function exportUsersToCsv() {
    if (!filteredUsersState.length) {
        showToast("No data available to export.", "warning");
        return;
    }

    const headers = ["User ID", "Username", "Email", "Display Name", "Role", "Status", "Joined Date"];
    const rows = filteredUsersState.map(u => [
        u.id,
        `"${(u.username || "").replace(/"/g, '""')}"`,
        `"${(u.email || "").replace(/"/g, '""')}"`,
        `"${(u.displayName || "").replace(/"/g, '""')}"`,
        u.role,
        u.status,
        `"${u.createdAt}"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `aquarium_users_export_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast("Visible user records exported to CSV successfully.", "success");
}

// Helper States & Utility Functions
function showLoadingState() {
    document.getElementById("loadingState").style.display = "flex";
    document.getElementById("errorState").style.display = "none";
    document.getElementById("emptyState").style.display = "none";
    document.getElementById("tableContainer").style.display = "none";
    document.getElementById("mobileCardsContainer").style.display = "none";
}

function showEmptyState() {
    document.getElementById("loadingState").style.display = "none";
    document.getElementById("errorState").style.display = "none";
    document.getElementById("emptyState").style.display = "flex";
    document.getElementById("tableContainer").style.display = "none";
    document.getElementById("mobileCardsContainer").style.display = "none";
}

function showErrorState(msg) {
    document.getElementById("loadingState").style.display = "none";
    document.getElementById("errorState").style.display = "flex";
    document.getElementById("emptyState").style.display = "none";
    document.getElementById("tableContainer").style.display = "none";
    document.getElementById("mobileCardsContainer").style.display = "none";
    const errText = document.getElementById("errorMessageText");
    if (errText) errText.textContent = msg;
}

function hideStates() {
    document.getElementById("loadingState").style.display = "none";
    document.getElementById("errorState").style.display = "none";
    document.getElementById("emptyState").style.display = "none";
    document.getElementById("tableContainer").style.display = "block";
    const mobileContainer = document.getElementById("mobileCardsContainer");
    if (mobileContainer && window.innerWidth <= 768) {
        mobileContainer.style.display = "flex";
        document.getElementById("tableContainer").style.display = "none";
    }
}

function generateInitials(name) {
    if (!name) return "US";
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
        return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
}

function formatDate(dateString) {
    if (!dateString) return "N/A";
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    const date = new Date(dateString);
    if (isNaN(date)) return dateString;
    return date.toLocaleDateString("en-US", options);
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
    const container = document.getElementById("toastContainer");
    if (!container) return;

    const toast = document.createElement("div");
    toast.className = `toast ${type}`;

    let icon = "fa-circle-check";
    if (type === "error") icon = "fa-triangle-exclamation";
    if (type === "warning") icon = "fa-circle-exclamation";
    if (type === "info") icon = "fa-circle-info";

    toast.innerHTML = `<i class="fa-solid ${icon}"></i> <span>${escapeHtml(message)}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = "0";
        setTimeout(() => toast.remove(), 300);
    }, 3500);
}

// Reusable REST API Request Wrapper
async function apiRequest(endpoint, options = {}) {
    const token = localStorage.getItem("accessToken");
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
        setTimeout(() => window.location.href = "../login.html", 1500);
        throw new Error("Unauthorized");
    }

    if (response.status === 403) {
        throw new Error("You do not have permission to perform this administrative action.");
    }

    if (response.status === 409) {
        throw new Error("This user could not be updated because the account changed concurrently. Refresh and try again.");
    }

    if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.message || `Server error: ${response.status}`);
    }

    if (response.status === 204) return null;
    return response.json();
}

function logout() {
    localStorage.removeItem("accessToken");
    showToast("Logged out successfully.", "info");
    setTimeout(() => window.location.href = "../login.html", 1000);
}