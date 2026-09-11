/**
 * Aquarium Fish E-Commerce Seller Panel - Stock Management JavaScript
 * Supports Mock Mode and Spring Boot REST API integration.
 */

// ==========================================================================
// 1. Configuration & Constants
// ==========================================================================
const API_BASE_URL = "http://localhost:8080/api";
const USE_MOCK_DATA = true; // Set to false when connecting real Spring Boot backend
const LOW_STOCK_THRESHOLD = 5;
const STOCK_DISPLAY_MAX = 50; // Visualization scale for stock progress bars
const PAGE_SIZE = 10;

// ==========================================================================
// 2. Application State
// ==========================================================================
let state = {
    inventory: [],
    filteredInventory: [],
    currentPage: 1,
    searchQuery: "",
    statusFilter: "all",
    categoryFilter: "all",
    breedFilter: "all",
    sortBy: "newest",
    selectedFishIds: new Set(),
    activeAdjustmentFish: null
};

// ==========================================================================
// 3. Mock Data (Realistic Aquarium Fish Inventory)
// ==========================================================================
const mockInventoryData = [
    {
        fishId: 101,
        fishName: "Neon Tetra",
        price: 3500.00,
        stockQty: 3,
        categoryName: "Tropical",
        breedName: "Neon Tetra",
        sizeName: "Small",
        primaryImageUrl: "https://images.unsplash.com/photo-1522069169874-c58ec4b76be5?auto=format&fit=crop&w=200&q=80",
        updatedAt: "2026-09-11T08:30:00"
    },
    {
        fishId: 102,
        fishName: "Fancy Guppy",
        price: 2500.00,
        stockQty: 18,
        categoryName: "Freshwater",
        breedName: "Mosaic Guppy",
        sizeName: "Small",
        primaryImageUrl: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=200&q=80",
        updatedAt: "2026-09-10T14:20:00"
    },
    {
        fishId: 103,
        fishName: "Veil-tail Betta",
        price: 4500.00,
        stockQty: 0,
        categoryName: "Tropical",
        breedName: "Halfmoon Betta",
        sizeName: "Medium",
        primaryImageUrl: "https://images.unsplash.com/photo-1535591273668-578e31182c4f?auto=format&fit=crop&w=200&q=80",
        updatedAt: "2026-09-09T11:00:00"
    },
    {
        fishId: 104,
        fishName: "Angelfish Pterophyllum",
        price: 6800.00,
        stockQty: 5,
        categoryName: "Community Fish",
        breedName: "Marble Angelfish",
        sizeName: "Large",
        primaryImageUrl: "https://images.unsplash.com/photo-1524704654690-b56c05c78a00?auto=format&fit=crop&w=200&q=80",
        updatedAt: "2026-09-11T09:15:00"
    },
    {
        fishId: 105,
        fishName: "Blue Diamond Discus",
        price: 18500.00,
        stockQty: 2,
        categoryName: "Tropical",
        breedName: "Discus",
        sizeName: "Large",
        primaryImageUrl: "https://images.unsplash.com/photo-1522069169874-c58ec4b76be5?auto=format&fit=crop&w=200&q=80",
        updatedAt: "2026-09-08T16:40:00"
    },
    {
        fishId: 106,
        fishName: "Tiger Oscar",
        price: 7500.00,
        stockQty: 12,
        categoryName: "Predatory",
        breedName: "Oscar",
        sizeName: "Large",
        primaryImageUrl: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=200&q=80",
        updatedAt: "2026-09-11T07:10:00"
    },
    {
        fishId: 107,
        fishName: "Super Red Flowerhorn",
        price: 24000.00,
        stockQty: 1,
        categoryName: "Cichlids",
        breedName: "Flowerhorn",
        sizeName: "Large",
        primaryImageUrl: "https://images.unsplash.com/photo-1535591273668-578e31182c4f?auto=format&fit=crop&w=200&q=80",
        updatedAt: "2026-09-07T12:00:00"
    },
    {
        fishId: 108,
        fishName: "Cherry Barb",
        price: 1800.00,
        stockQty: 25,
        categoryName: "Freshwater",
        breedName: "Barb",
        sizeName: "Small",
        primaryImageUrl: "https://images.unsplash.com/photo-1524704654690-b56c05c78a00?auto=format&fit=crop&w=200&q=80",
        updatedAt: "2026-09-10T10:05:00"
    },
    {
        fishId: 109,
        fishName: "Black Molly",
        price: 2200.00,
        stockQty: 0,
        categoryName: "Community Fish",
        breedName: "Molly",
        sizeName: "Medium",
        primaryImageUrl: "https://images.unsplash.com/photo-1522069169874-c58ec4b76be5?auto=format&fit=crop&w=200&q=80",
        updatedAt: "2026-09-06T13:45:00"
    },
    {
        fishId: 110,
        fishName: "Red Wag Platy",
        price: 2000.00,
        stockQty: 14,
        categoryName: "Community Fish",
        breedName: "Platy",
        sizeName: "Small",
        primaryImageUrl: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=200&q=80",
        updatedAt: "2026-09-11T06:50:00"
    },
    {
        fishId: 111,
        fishName: "Bronze Corydoras",
        price: 3200.00,
        stockQty: 8,
        categoryName: "Freshwater",
        breedName: "Corydoras",
        sizeName: "Small",
        primaryImageUrl: "https://images.unsplash.com/photo-1535591273668-578e31182c4f?auto=format&fit=crop&w=200&q=80",
        updatedAt: "2026-09-09T18:15:00"
    },
    {
        fishId: 112,
        fishName: "Silver Arowana",
        price: 35000.00,
        stockQty: 2,
        categoryName: "Predatory",
        breedName: "Arowana",
        sizeName: "Large",
        primaryImageUrl: "https://images.unsplash.com/photo-1524704654690-b56c05c78a00?auto=format&fit=crop&w=200&q=80",
        updatedAt: "2026-09-05T09:30:00"
    },
    {
        fishId: 113,
        fishName: "Oranda Goldfish",
        price: 5500.00,
        stockQty: 6,
        categoryName: "Goldfish",
        breedName: "Oranda",
        sizeName: "Medium",
        primaryImageUrl: "https://images.unsplash.com/photo-1522069169874-c58ec4b76be5?auto=format&fit=crop&w=200&q=80",
        updatedAt: "2026-09-10T11:25:00"
    },
    {
        fishId: 114,
        fishName: "Japanese Koi",
        price: 12000.00,
        stockQty: 0,
        categoryName: "Goldfish",
        breedName: "Koi",
        sizeName: "Large",
        primaryImageUrl: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=200&q=80",
        updatedAt: "2026-09-04T15:10:00"
    },
    {
        fishId: 115,
        fishName: "Dwarf Gourami",
        price: 3800.00,
        stockQty: 4,
        categoryName: "Tropical",
        breedName: "Gourami",
        sizeName: "Small",
        primaryImageUrl: "https://images.unsplash.com/photo-1535591273668-578e31182c4f?auto=format&fit=crop&w=200&q=80",
        updatedAt: "2026-09-11T08:00:00"
    }
];

// ==========================================================================
// 4. Initialization & Event Listeners
// ==========================================================================
document.addEventListener("DOMContentLoaded", () => {
    initializePage();
});

function initializePage() {
    setupSidebarToggle();
    setupProfileDropdown();
    setupEventListeners();
    loadInventory();
}

// ==========================================================================
// 5. Authentication & API Simulation
// ==========================================================================
function checkAuthentication() {
    // TODO: Connect real JWT token validation from localStorage / sessionStorage
    const token = localStorage.getItem("accessToken");
    if (!token && !USE_MOCK_DATA) {
        showToast("Session expired. Please log in again.", "error");
        setTimeout(() => {
            window.location.href = "../login.html";
        }, 1500);
        return false;
    }
    return true;
}

function loadInventory() {
    showLoadingState(true);
    hideErrorState();
    hideEmptyState();
    hideNoResultsState();

    if (USE_MOCK_DATA) {
        // Simulate network latency for realistic demo
        setTimeout(() => {
            state.inventory = [...mockInventoryData];
            populateBreedDropdown();
            applyFiltersAndSorting();
            showLoadingState(false);
            showToast("Inventory loaded successfully.", "success");
        }, 400);
    } else {
        loadInventoryFromApi();
    }
}

async function loadInventoryFromApi() {
    try {
        // TODO: Replace with real Spring Boot REST API endpoint
        // GET /api/sellers/me/stock
        const token = localStorage.getItem("accessToken");
        const response = await fetch(`${API_BASE_URL}/sellers/me/stock`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });

        if (response.status === 401) {
            window.location.href = "../login.html";
            return;
        }
        if (response.status === 403) {
            showErrorState("You do not have permission to manage this inventory.");
            return;
        }
        if (!response.ok) {
            throw new Error("Failed to fetch inventory from server");
        }

        const data = await response.json();
        state.inventory = data;
        populateBreedDropdown();
        applyFiltersAndSorting();
        showLoadingState(false);
    } catch (error) {
        console.error("API Load Error:", error);
        showLoadingState(false);
        showErrorState("Unable to connect to inventory server. Please try again.");
    }
}

// ==========================================================================
// 6. Filtering, Searching & Sorting Logic
// ==========================================================================
let searchDebounceTimer = null;

function setupEventListeners() {
    // Search input with debounce
    const searchInput = document.getElementById("searchInput");
    const searchClearBtn = document.getElementById("searchClearBtn");

    searchInput.addEventListener("input", (e) => {
        state.searchQuery = e.target.value.trim().toLowerCase();
        searchClearBtn.style.display = state.searchQuery ? "block" : "none";

        clearTimeout(searchDebounceTimer);
        searchDebounceTimer = setTimeout(() => {
            state.currentPage = 1;
            applyFiltersAndSorting();
        }, 300);
    });

    searchClearBtn.addEventListener("click", () => {
        searchInput.value = "";
        state.searchQuery = "";
        searchClearBtn.style.display = "none";
        state.currentPage = 1;
        applyFiltersAndSorting();
    });

    // Quick filter pills
    document.querySelectorAll(".filter-pill").forEach(pill => {
        pill.addEventListener("click", (e) => {
            document.querySelectorAll(".filter-pill").forEach(p => p.classList.remove("active"));
            e.currentTarget.classList.add("active");

            const filterVal = e.currentTarget.getAttribute("data-filter-status");
            state.statusFilter = filterVal;
            document.getElementById("stockStatusFilter").value = filterVal;
            state.currentPage = 1;
            applyFiltersAndSorting();
        });
    });

    // Stock status dropdown
    document.getElementById("stockStatusFilter").addEventListener("change", (e) => {
        state.statusFilter = e.target.value;
        syncQuickFilterPills(state.statusFilter);
        state.currentPage = 1;
        applyFiltersAndSorting();
    });

    // Category dropdown
    document.getElementById("categoryFilter").addEventListener("change", (e) => {
        state.categoryFilter = e.target.value;
        state.currentPage = 1;
        applyFiltersAndSorting();
    });

    // Breed dropdown
    document.getElementById("breedFilter").addEventListener("change", (e) => {
        state.breedFilter = e.target.value;
        state.currentPage = 1;
        applyFiltersAndSorting();
    });

    // Sort dropdown
    document.getElementById("sortDropdown").addEventListener("change", (e) => {
        state.sortBy = e.target.value;
        state.currentPage = 1;
        applyFiltersAndSorting();
    });

    // Clear filters button
    document.getElementById("clearFiltersBtn").addEventListener("click", clearAllFilters);
    document.getElementById("resetSearchFiltersBtn").addEventListener("click", clearAllFilters);

    // Attention banner review button
    document.getElementById("attentionFilterBtn").addEventListener("click", () => {
        state.statusFilter = "low";
        document.getElementById("stockStatusFilter").value = "low";
        syncQuickFilterPills("low");
        state.currentPage = 1;
        applyFiltersAndSorting();
    });

    // Refresh button
    document.getElementById("refreshInventoryBtn").addEventListener("click", () => {
        loadInventory();
        showToast("Refreshing inventory...", "info");
    });

    // Retry load button on error
    document.getElementById("retryLoadBtn").addEventListener("click", () => {
        loadInventory();
    });

    // Select all master checkbox
    document.getElementById("selectAllCheckbox").addEventListener("change", (e) => {
        const isChecked = e.target.checked;
        state.selectedFishIds.clear();
        if (isChecked) {
            state.filteredInventory.forEach(item => state.selectedFishIds.add(item.fishId));
        }
        renderTableRows();
        updateBulkActionsToolbar();
    });

    // Bulk out of stock action
    document.getElementById("bulkOutStockBtn").addEventListener("click", () => {
        handleBulkSetOutOfStock();
    });

    // Logout button
    document.getElementById("logoutBtn").addEventListener("click", () => {
        logout();
    });

    // Modal event listeners
    setupModalListeners();
}

function syncQuickFilterPills(status) {
    document.querySelectorAll(".filter-pill").forEach(pill => {
        const pillStatus = pill.getAttribute("data-filter-status");
        if (pillStatus === status) {
            pill.classList.add("active");
        } else {
            pill.classList.remove("active");
        }
    });
}

function populateBreedDropdown() {
    const breedSelect = document.getElementById("breedFilter");
    const breeds = [...new Set(state.inventory.map(item => item.breedName).filter(Boolean))].sort();

    // Keep default "All Breeds" option
    breedSelect.innerHTML = `<option value="all">All Breeds</option>`;
    breeds.forEach(breed => {
        const option = document.createElement("option");
        option.value = breed;
        option.textContent = breed;
        breedSelect.appendChild(option);
    });
}

function clearAllFilters() {
    document.getElementById("searchInput").value = "";
    document.getElementById("searchClearBtn").style.display = "none";
    document.getElementById("stockStatusFilter").value = "all";
    document.getElementById("categoryFilter").value = "all";
    document.getElementById("breedFilter").value = "all";
    document.getElementById("sortDropdown").value = "newest";

    state.searchQuery = "";
    state.statusFilter = "all";
    state.categoryFilter = "all";
    state.breedFilter = "all";
    state.sortBy = "newest";
    state.currentPage = 1;

    syncQuickFilterPills("all");
    applyFiltersAndSorting();
    showToast("Filters cleared.", "info");
}

function applyFiltersAndSorting() {
    let result = [...state.inventory];

    // 1. Search Query
    if (state.searchQuery) {
        result = result.filter(item =>
            item.fishName.toLowerCase().includes(state.searchQuery) ||
            item.breedName.toLowerCase().includes(state.searchQuery) ||
            item.fishId.toString().includes(state.searchQuery)
        );
    }

    // 2. Stock Status Filter
    if (state.statusFilter !== "all") {
        result = result.filter(item => {
            const status = calculateStockStatus(item.stockQty);
            return status === state.statusFilter;
        });
    }

    // 3. Category Filter
    if (state.categoryFilter !== "all") {
        result = result.filter(item => item.categoryName === state.categoryFilter);
    }

    // 4. Breed Filter
    if (state.breedFilter !== "all") {
        result = result.filter(item => item.breedName === state.breedFilter);
    }

    // 5. Sorting
    result.sort((a, b) => {
        switch (state.sortBy) {
            case "oldest":
                return new Date(a.updatedAt || 0) - new Date(b.updatedAt || 0);
            case "name-asc":
                return a.fishName.localeCompare(b.fishName);
            case "name-desc":
                return b.fishName.localeCompare(a.fishName);
            case "stock-asc":
                return a.stockQty - b.stockQty;
            case "stock-desc":
                return b.stockQty - a.stockQty;
            case "price-asc":
                return a.price - b.price;
            case "price-desc":
                return b.price - a.price;
            case "newest":
            default:
                return new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0);
        }
    });

    state.filteredInventory = result;

    renderStatistics();
    renderAttentionBanner();
    renderTable();
}

function calculateStockStatus(qty) {
    if (qty === 0) return "out";
    if (qty >= 1 && qty <= LOW_STOCK_THRESHOLD) return "low";
    return "in";
}

// ==========================================================================
// 7. Rendering Statistics & UI Components
// ==========================================================================
function renderStatistics() {
    const totalProducts = state.inventory.length;
    let inStockCount = 0;
    let lowStockCount = 0;
    let outOfStockCount = 0;
    let totalUnits = 0;
    let inventoryValue = 0;

    state.inventory.forEach(item => {
        totalUnits += item.stockQty;
        inventoryValue += (item.price * item.stockQty);

        const status = calculateStockStatus(item.stockQty);
        if (status === "in") inStockCount++;
        else if (status === "low") lowStockCount++;
        else if (status === "out") outOfStockCount++;
    });

    document.getElementById("statTotalProducts").textContent = totalProducts;
    document.getElementById("statInStock").textContent = inStockCount;
    document.getElementById("statLowStock").textContent = lowStockCount;
    document.getElementById("statOutOfStock").textContent = outOfStockCount;
    document.getElementById("statTotalUnits").textContent = totalUnits;
    document.getElementById("statInventoryValue").textContent = formatCurrency(inventoryValue);
}

function renderAttentionBanner() {
    const banner = document.getElementById("attentionBanner");
    let lowStockCount = 0;
    let outOfStockCount = 0;

    state.inventory.forEach(item => {
        const status = calculateStockStatus(item.stockQty);
        if (status === "low") lowStockCount++;
        if (status === "out") outOfStockCount++;
    });

    if (lowStockCount > 0 || outOfStockCount > 0) {
        banner.style.display = "flex";
        document.getElementById("attentionText").textContent =
            `${lowStockCount} fish are running low on stock & ${outOfStockCount} fish are currently out of stock.`;
    } else {
        banner.style.display = "none";
    }
}

function renderTable() {
    const tableBody = document.getElementById("inventoryTableBody");
    const recordCountBadge = document.getElementById("recordCountBadge");

    recordCountBadge.textContent = `${state.filteredInventory.length} products`;

    if (state.inventory.length === 0) {
        showEmptyState();
        return;
    }

    if (state.filteredInventory.length === 0) {
        showNoResultsState();
        return;
    }

    hideEmptyState();
    hideNoResultsState();

    // Pagination calculations
    const totalRecords = state.filteredInventory.length;
    const totalPages = Math.ceil(totalRecords / PAGE_SIZE) || 1;
    if (state.currentPage > totalPages) state.currentPage = totalPages;

    const startIndex = (state.currentPage - 1) * PAGE_SIZE;
    const endIndex = Math.min(startIndex + PAGE_SIZE, totalRecords);
    const paginatedItems = state.filteredInventory.slice(startIndex, endIndex);

    // Render Rows
    tableBody.innerHTML = "";
    paginatedItems.forEach(item => {
        const status = calculateStockStatus(item.stockQty);
        const isSelected = state.selectedFishIds.has(item.fishId);
        const estValue = item.price * item.stockQty;
        const progressPercent = Math.min(Math.round((item.stockQty / STOCK_DISPLAY_MAX) * 100), 100);

        let progressFillClass = "fill-green";
        if (status === "low") progressFillClass = "fill-amber";
        if (status === "out") progressFillClass = "fill-red";

        let badgeHtml = `<span class="badge badge-in-stock"><i class="fa-solid fa-circle-check"></i> In Stock</span>`;
        if (status === "low") {
            badgeHtml = `<span class="badge badge-low-stock"><i class="fa-solid fa-triangle-exclamation"></i> Low Stock</span>`;
        } else if (status === "out") {
            badgeHtml = `<span class="badge badge-out-of-stock"><i class="fa-solid fa-circle-xmark"></i> Out of Stock</span>`;
        }

        const row = document.createElement("tr");
        row.innerHTML = `
            <td class="checkbox-col">
                <input type="checkbox" class="row-checkbox" data-id="${item.fishId}" ${isSelected ? "checked" : ""} aria-label="Select ${escapeHtml(item.fishName)}">
            </td>
            <td>
                <div class="fish-cell-info">
                    <img src="${escapeHtml(getFishImage(item))}" alt="${escapeHtml(item.fishName)}" class="fish-thumb" onerror="this.src='https://images.unsplash.com/photo-1522069169874-c58ec4b76be5?auto=format&fit=crop&w=200&q=80'">
                    <div class="fish-details-text">
                        <a href="../fish-details.html?id=${item.fishId}" class="fish-name-link" target="_blank">${escapeHtml(item.fishName)}</a>
                        <span class="fish-id-tag">ID: #${item.fishId}</span>
                        <span class="fish-sub-meta">Breed: ${escapeHtml(item.breedName || 'N/A')} &bull; ${escapeHtml(item.sizeName || 'Standard')}</span>
                    </div>
                </div>
            </td>
            <td>${escapeHtml(item.categoryName || 'General')}</td>
            <td><strong>${formatCurrency(item.price)}</strong></td>
            <td>
                <div class="stock-cell-wrap">
                    <span class="stock-qty-text">${item.stockQty} units</span>
                    <div class="stock-progress-bar" title="Visualization scale (${STOCK_DISPLAY_MAX} max)">
                        <div class="stock-progress-fill ${progressFillClass}" style="width: ${progressPercent}%;"></div>
                    </div>
                </div>
            </td>
            <td>${badgeHtml}</td>
            <td><strong>${formatCurrency(estValue)}</strong></td>
            <td>${formatRelativeTime(item.updatedAt)}</td>
            <td class="actions-col">
                <div class="action-buttons-group">
                    ${status === 'low' || status === 'out' ? `
                        <button type="button" class="action-btn restock-action-btn" title="Quick Restock" onclick="openStockAdjustmentModal(${item.fishId})">
                            <i class="fa-solid fa-cart-plus"></i>
                        </button>
                    ` : ''}
                    <button type="button" class="action-btn" title="Adjust Stock" onclick="openStockAdjustmentModal(${item.fishId})">
                        <i class="fa-solid fa-boxes-stacked"></i>
                    </button>
                    <a href="fish-images.html?id=${item.fishId}" class="action-btn" title="Manage Images">
                        <i class="fa-solid fa-image"></i>
                    </a>
                    <a href="edit-fish.html?id=${item.fishId}" class="action-btn" title="Edit Fish">
                        <i class="fa-solid fa-pen"></i>
                    </a>
                    <a href="../fish-details.html?id=${item.fishId}" class="action-btn" title="View Public Details" target="_blank">
                        <i class="fa-solid fa-eye"></i>
                    </a>
                </div>
            </td>
        `;
        tableBody.appendChild(row);
    });

    // Attach row checkbox listeners
    document.querySelectorAll(".row-checkbox").forEach(chk => {
        chk.addEventListener("change", (e) => {
            const fishId = parseInt(e.target.getAttribute("data-id"));
            if (e.target.checked) {
                state.selectedFishIds.add(fishId);
            } else {
                state.selectedFishIds.delete(fishId);
            }
            updateBulkActionsToolbar();
        });
    });

    renderPagination(totalRecords, totalPages, startIndex, endIndex);
}

function renderPagination(totalRecords, totalPages, startIndex, endIndex) {
    const paginationInfo = document.getElementById("paginationInfo");
    const paginationControls = document.getElementById("paginationControls");

    if (totalRecords === 0) {
        paginationInfo.textContent = "Showing 0–0 of 0 products";
        paginationControls.innerHTML = "";
        return;
    }

    paginationInfo.textContent = `Showing ${startIndex + 1}–${endIndex} of ${totalRecords} products`;

    let html = `
        <button class="page-btn" ${state.currentPage === 1 ? "disabled" : ""} onclick="changePage(${state.currentPage - 1})">
            <i class="fa-solid fa-chevron-left"></i> Previous
        </button>
    `;

    for (let i = 1; i <= totalPages; i++) {
        if (i === 1 || i === totalPages || (i >= state.currentPage - 1 && i <= state.currentPage + 1)) {
            html += `<button class="page-btn ${i === state.currentPage ? "active" : ""}" onclick="changePage(${i})">${i}</button>`;
        } else if (i === state.currentPage - 2 || i === state.currentPage + 2) {
            html += `<span class="page-ellipsis">...</span>`;
        }
    }

    html += `
        <button class="page-btn" ${state.currentPage === totalPages ? "disabled" : ""} onclick="changePage(${state.currentPage + 1})">
            Next <i class="fa-solid fa-chevron-right"></i>
        </button>
    `;

    paginationControls.innerHTML = html;
}

function changePage(targetPage) {
    state.currentPage = targetPage;
    renderTable();
    window.scrollTo({ top: 300, behavior: 'smooth' });
}

function updateBulkActionsToolbar() {
    const toolbar = document.getElementById("bulkActionsToolbar");
    const selectedCountText = document.getElementById("selectedCountText");
    const count = state.selectedFishIds.size;

    if (count > 0) {
        toolbar.style.display = "flex";
        selectedCountText.textContent = `${count} selected`;
    } else {
        toolbar.style.display = "none";
    }
}

// ==========================================================================
// 8. Stock Adjustment Modal Handling
// ==========================================================================
function setupModalListeners() {
    const backdrop = document.getElementById("stockModalBackdrop");
    const closeBtn = document.getElementById("modalCloseBtn");
    const cancelBtn = document.getElementById("modalCancelBtn");
    const submitBtn = document.getElementById("modalSubmitBtn");

    closeBtn.addEventListener("click", closeStockAdjustmentModal);
    cancelBtn.addEventListener("click", closeStockAdjustmentModal);
    backdrop.addEventListener("click", (e) => {
        if (e.target === backdrop) closeStockAdjustmentModal();
    });

    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && backdrop.classList.contains("active")) {
            closeStockAdjustmentModal();
        }
    });

    // Adjustment type pills
    document.querySelectorAll(".adj-pill").forEach(pill => {
        pill.addEventListener("click", (e) => {
            document.querySelectorAll(".adj-pill").forEach(p => p.classList.remove("active"));
            e.currentTarget.classList.add("active");
            const type = e.currentTarget.getAttribute("data-type");
            document.getElementById("adjustmentTypeInput").value = type;
            updateAdjustmentFormMode(type);
        });
    });

    // Stepper buttons
    const qtyInput = document.getElementById("adjustmentQtyInput");
    document.getElementById("stepperMinusBtn").addEventListener("click", () => {
        let val = parseInt(qtyInput.value) || 0;
        if (val > 0) {
            qtyInput.value = val - 1;
            updateStockPreviewCalculation();
        }
    });

    document.getElementById("stepperPlusBtn").addEventListener("click", () => {
        let val = parseInt(qtyInput.value) || 0;
        qtyInput.value = val + 1;
        updateStockPreviewCalculation();
    });

    qtyInput.addEventListener("input", () => {
        updateStockPreviewCalculation();
    });

    // Submit stock update
    submitBtn.addEventListener("click", () => {
        submitStockUpdate();
    });
}

function openStockAdjustmentModal(fishId) {
    const fish = state.inventory.find(item => item.fishId === fishId);
    if (!fish) return;

    state.activeAdjustmentFish = fish;
    document.getElementById("modalFishId").value = fish.fishId;
    document.getElementById("modalTitle").textContent = "Adjust Stock";
    document.getElementById("modalFishNameSub").textContent = fish.fishName;
    document.getElementById("modalCurrentStockVal").textContent = `${fish.stockQty} units`;
    document.getElementById("previewCurrentStock").textContent = fish.stockQty;

    // Reset form fields
    document.getElementById("adjustmentQtyInput").value = 1;
    document.getElementById("adjustmentNote").value = "";
    document.getElementById("modalConfirmationBox.style.display").display = "none";

    // Default to ADD mode
    document.querySelectorAll(".adj-pill").forEach(p => p.classList.remove("active"));
    document.querySelector('.adj-pill[data-type="ADD"]').classList.add("active");
    document.getElementById("adjustmentTypeInput").value = "ADD";
    updateAdjustmentFormMode("ADD");

    document.getElementById("stockModalBackdrop").classList.add("active");
    document.getElementById("adjustmentQtyInput").focus();
}

function closeStockAdjustmentModal() {
    document.getElementById("stockModalBackdrop").classList.remove("active");
    state.activeAdjustmentFish = null;
}

function updateAdjustmentFormMode(type) {
    const label = document.getElementById("adjustmentQtyLabel");
    if (type === "ADD") {
        label.textContent = "Quantity to Add";
    } else if (type === "REMOVE") {
        label.textContent = "Quantity to Remove";
    } else if (type === "SET") {
        label.textContent = "New Stock Quantity";
    }
    updateStockPreviewCalculation();
}

function updateStockPreviewCalculation() {
    if (!state.activeAdjustmentFish) return;

    const currentStock = state.activeAdjustmentFish.stockQty;
    const type = document.getElementById("adjustmentTypeInput").value;
    const qtyInput = document.getElementById("adjustmentQtyInput");
    const errorMsg = document.getElementById("qtyErrorMsg");
    const previewActionVal = document.getElementById("previewActionVal");
    const previewResultStock = document.getElementById("previewResultStock");

    let inputVal = parseInt(qtyInput.value);
    if (isNaN(inputVal) || inputVal < 0) {
        inputVal = 0;
    }

    let resultingStock = currentStock;
    if (type === "ADD") {
        resultingStock = currentStock + inputVal;
        previewActionVal.textContent = `+${inputVal}`;
        previewActionVal.className = "text-success";
    } else if (type === "REMOVE") {
        resultingStock = currentStock - inputVal;
        previewActionVal.textContent = `-${inputVal}`;
        previewActionVal.className = "text-danger";

        if (resultingStock < 0) {
            errorMsg.textContent = "You cannot remove more units than the current stock.";
            errorMsg.style.display = "block";
            resultingStock = 0;
        } else {
            errorMsg.style.display = "none";
        }
    } else if (type === "SET") {
        resultingStock = inputVal;
        previewActionVal.textContent = `Set to ${inputVal}`;
        previewActionVal.className = "text-primary";
        errorMsg.style.display = "none";
    }

    previewResultStock.textContent = `${resultingStock} units`;
}

async function submitStockUpdate() {
    if (!state.activeAdjustmentFish) return;

    const fishId = state.activeAdjustmentFish.fishId;
    const type = document.getElementById("adjustmentTypeInput").value;
    const inputVal = parseInt(document.getElementById("adjustmentQtyInput").value) || 0;
    const reason = document.getElementById("adjustmentReason").value;
    const note = document.getElementById("adjustmentNote").value;

    let newStockQty = state.activeAdjustmentFish.stockQty;
    if (type === "ADD") newStockQty += inputVal;
    else if (type === "REMOVE") {
        newStockQty -= inputVal;
        if (newStockQty < 0) {
            showToast("Invalid stock quantity resulting in negative stock.", "error");
            return;
        }
    } else if (type === "SET") {
        newStockQty = inputVal;
        if (newStockQty < 0) {
            showToast("Stock quantity cannot be negative.", "error");
            return;
        }
    }

    const submitBtn = document.getElementById("modalSubmitBtn");
    const btnText = submitBtn.querySelector(".btn-text-label");
    const btnSpinner = submitBtn.querySelector(".btn-spinner");

    submitBtn.disabled = true;
    btnText.style.display = "none";
    btnSpinner.style.display = "inline-flex";

    if (USE_MOCK_DATA) {
        setTimeout(() => {
            // Update local mock state
            const fishIndex = state.inventory.findIndex(item => item.fishId === fishId);
            if (fishIndex !== -1) {
                state.inventory[fishIndex].stockQty = newStockQty;
                state.inventory[fishIndex].updatedAt = new Date().toISOString();
            }

            applyFiltersAndSorting();
            closeStockAdjustmentModal();
            showToast("Stock updated successfully.", "success");

            submitBtn.disabled = false;
            btnText.style.display = "inline";
            btnSpinner.style.display = "none";
        }, 500);
    } else {
        try {
            // TODO: Replace with real Spring Boot REST API
            // PATCH /api/sellers/me/fish/{fishId}/stock
            // CRITICAL SECURITY RULE: NEVER send sellerId from frontend!
            const token = localStorage.getItem("accessToken");
            const response = await fetch(`${API_BASE_URL}/sellers/me/fish/${fishId}/stock`, {
                method: "PATCH",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    stockQty: newStockQty,
                    adjustmentType: type,
                    adjustmentQty: inputVal,
                    reason: reason,
                    note: note
                })
            });

            if (!response.ok) {
                if (response.status === 409) {
                    throw new Error("This stock quantity has changed. Please refresh and try again.");
                }
                throw new Error("Failed to update stock quantity on server.");
            }

            const updatedFish = await response.json();
            const fishIndex = state.inventory.findIndex(item => item.fishId === fishId);
            if (fishIndex !== -1) {
                state.inventory[fishIndex] = updatedFish;
            }

            applyFiltersAndSorting();
            closeStockAdjustmentModal();
            showToast("Stock updated successfully.", "success");
        } catch (error) {
            console.error("Stock Update Error:", error);
            showToast(error.message || "Unable to update stock.", "error");
        } finally {
            submitBtn.disabled = false;
            btnText.style.display = "inline";
            btnSpinner.style.display = "none";
        }
    }
}

async function handleBulkSetOutOfStock() {
    if (state.selectedFishIds.size === 0) return;

    if (!confirm(`Are you sure you want to set ${state.selectedFishIds.size} selected fish listings to Out of Stock?`)) {
        return;
    }

    if (USE_MOCK_DATA) {
        state.selectedFishIds.forEach(id => {
            const item = state.inventory.find(f => f.fishId === id);
            if (item) {
                item.stockQty = 0;
                item.updatedAt = new Date().toISOString();
            }
        });
        state.selectedFishIds.clear();
        document.getElementById("selectAllCheckbox").checked = false;
        applyFiltersAndSorting();
        showToast("Selected products marked as out of stock.", "success");
    } else {
        // TODO: Implement bulk REST API endpoint if supported by backend
        showToast("Bulk operations require backend implementation.", "warning");
    }
}

// ==========================================================================
// 9. UI State Helpers & Utility Functions
// ==========================================================================
function showLoadingState(isLoading) {
    document.getElementById("loadingState").style.display = isLoading ? "flex" : "none";
    document.getElementById("tableResponsiveWrapper").style.display = isLoading ? "none" : "block";
    document.getElementById("tableFooter").style.display = isLoading ? "none" : "flex";
}

function showErrorState(message) {
    document.getElementById("errorState").style.display = "flex";
    document.getElementById("errorMessageText").textContent = message;
    document.getElementById("tableResponsiveWrapper").style.display = "none";
    document.getElementById("tableFooter").style.display = "none";
}

function hideErrorState() {
    document.getElementById("errorState").style.display = "none";
}

function showEmptyState() {
    document.getElementById("emptyState").style.display = "flex";
    document.getElementById("tableResponsiveWrapper").style.display = "none";
    document.getElementById("tableFooter").style.display = "none";
}

function hideEmptyState() {
    document.getElementById("emptyState").style.display = "none";
}

function showNoResultsState() {
    document.getElementById("noResultsState").style.display = "flex";
    document.getElementById("tableResponsiveWrapper").style.display = "none";
    document.getElementById("tableFooter").style.display = "none";
}

function hideNoResultsState() {
    document.getElementById("noResultsState").style.display = "none";
    document.getElementById("tableResponsiveWrapper").style.display = "block";
    document.getElementById("tableFooter").style.display = "flex";
}

function getFishImage(fish) {
    if (fish.primaryImageUrl) return fish.primaryImageUrl;
    if (fish.images && fish.images.length > 0) {
        const primary = fish.images.find(img => img.isPrimary);
        return primary ? primary.imageUrl : fish.images[0].imageUrl;
    }
    return "https://images.unsplash.com/photo-1522069169874-c58ec4b76be5?auto=format&fit=crop&w=200&q=80";
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('en-LK', {
        style: 'currency',
        currency: 'LKR',
        minimumFractionDigits: 2
    }).format(amount);
}

function formatRelativeTime(dateString) {
    if (!dateString) return "Recently";
    const date = new Date(dateString);
    const now = new Date();
    const diffSeconds = Math.floor((now - date) / 1000);

    if (diffSeconds < 60) return "Just now";
    const diffMinutes = Math.floor(diffSeconds / 60);
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function escapeHtml(str) {
    if (!str) return "";
    return str.toString()
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// Toast Notifications System
function showToast(message, type = "success") {
    const container = document.getElementById("toastContainer");
    const toast = document.createElement("div");
    toast.className = `toast ${type}`;

    let iconClass = "fa-solid fa-circle-check";
    let titleText = "Success";
    if (type === "error") {
        iconClass = "fa-solid fa-circle-xmark";
        titleText = "Error";
    } else if (type === "warning") {
        iconClass = "fa-solid fa-triangle-exclamation";
        titleText = "Warning";
    } else if (type === "info") {
        iconClass = "fa-solid fa-circle-info";
        titleText = "Information";
    }

    toast.innerHTML = `
        <i class="${iconClass}"></i>
        <div class="toast-content">
            <span class="toast-title">${titleText}</span>
            <span class="toast-message">${escapeHtml(message)}</span>
        </div>
    `;

    container.appendChild(toast);

    setTimeout(() => {
        toast.style.animation = "toastOut 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards";
        setTimeout(() => toast.remove(), 300);
    }, 3500);
}

// Sidebar & Profile Dropdown UI Handling
function setupSidebarToggle() {
    const mobileBtn = document.getElementById("mobileMenuBtn");
    const sidebar = document.getElementById("sidebar");
    const overlay = document.getElementById("sidebarOverlay");

    if (!mobileBtn) return;

    mobileBtn.addEventListener("click", () => {
        sidebar.classList.toggle("active");
        overlay.classList.toggle("active");
    });

    overlay.addEventListener("click", () => {
        sidebar.classList.remove("active");
        overlay.classList.remove("active");
    });

    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
            sidebar.classList.remove("active");
            overlay.classList.remove("active");
        }
    });
}

function setupProfileDropdown() {
    const container = document.getElementById("profileDropdownContainer");
    const toggle = document.getElementById("profileDropdownToggle");

    if (!container || !toggle) return;

    toggle.addEventListener("click", (e) => {
        e.stopPropagation();
        container.classList.toggle("active");
        toggle.setAttribute("aria-expanded", container.classList.contains("active"));
    });

    document.addEventListener("click", () => {
        container.classList.remove("active");
        toggle.setAttribute("aria-expanded", "false");
    });
}

function logout() {
    // TODO: Clear authentication tokens from localStorage / sessionStorage
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    showToast("Logged out successfully.", "success");
    setTimeout(() => {
        window.location.href = "../login.html";
    }, 1000);
}