/**
 * Seller Fish Management System - My Fish Page Controller
 * Handles data fetching, client/server side filtering, stock threshold logic,
 * grid/table switching, pagination, and deletion modal confirmation.
 */

// Toggle mock mode vs Spring Boot REST API integration
const USE_MOCK_DATA = true;
const API_BASE_URL = 'http://localhost:8080/api';
const LOW_STOCK_THRESHOLD = 5;

// Global Page State Management
const state = {
    fish: [],
    filteredFish: [],
    categories: [],
    breeds: [],
    sizes: [],
    colors: [],
    searchTerm: '',
    categoryId: '',
    breedId: '',
    sizeId: '',
    colorId: '',
    stockStatus: 'all',
    minPrice: '',
    maxPrice: '',
    sortBy: 'newest',
    currentPage: 1,
    pageSize: 8,
    viewMode: 'table', // 'table' | 'grid'
    selectedFishIdToDelete: null,
    authenticatedSeller: null
};

// SVG Placeholder Data URI for Missing Images
const FISH_PLACEHOLDER_IMG = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="%235f718d" stroke-width="1.5"><path d="M18 12c.5-2.5 2-4 4-4-1.5 3-1.5 5 0 8-2 0-3.5-1.5-4-4Z"/><path d="M2 12c4-6 10-6 16 0-6 6-12 6-16 0Z"/><circle cx="15" cy="10" r="1"/></svg>`;

// Initialize Page Controls on DOM Content Loaded
document.addEventListener('DOMContentLoaded', () => {
    initializeFishList();
});

function initializeFishList() {
    checkAuthentication();
    setupEventListeners();
    readUrlQueryParams();
    loadFilterMetadata();
    loadFish();
}

/* ================= AUTHENTICATION & SECURITY ================= */
function checkAuthentication() {
    // Note: Backend handles strict security. Frontend verifies token presence.
    const token = localStorage.getItem('token');

    if (!token && !USE_MOCK_DATA) {
        window.location.href = `../login.html?redirect=${encodeURIComponent('seller/fish-list.html')}`;
        return;
    }

    // Set dynamic seller info in header
    const mockSeller = {
        shopName: "Ocean Paradise Aquarium",
        email: "contact@oceanparadise.lk",
        initials: "OP"
    };

    state.authenticatedSeller = mockSeller;
    document.getElementById('headerShopName').textContent = mockSeller.shopName;
    document.getElementById('dropdownShopName').textContent = mockSeller.shopName;
    document.getElementById('dropdownUserEmail').textContent = mockSeller.email;
    document.getElementById('headerAvatar').textContent = mockSeller.initials;
}

function getAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
    };
}

/* ================= EVENT LISTENERS SETUP ================= */
function setupEventListeners() {
    // Sidebar Mobile Toggle
    document.getElementById('mobileHamburgerBtn').addEventListener('click', openSidebar);
    document.getElementById('closeSidebarBtn').addEventListener('click', closeSidebar);
    document.getElementById('sidebarOverlay').addEventListener('click', closeSidebar);

    // Dropdown Toggles
    document.getElementById('profileToggleBtn').addEventListener('click', (e) => {
        e.stopPropagation();
        toggleDropdown('profileDropdown');
    });
    document.getElementById('notifToggleBtn').addEventListener('click', (e) => {
        e.stopPropagation();
        toggleDropdown('notifDropdown');
    });

    document.addEventListener('click', () => {
        closeAllDropdowns();
    });

    // View Toggle
    document.getElementById('tableViewBtn').addEventListener('click', () => setViewMode('table'));
    document.getElementById('gridViewBtn').addEventListener('click', () => setViewMode('grid'));

    // Expandable Filters Panel Toggle
    document.getElementById('toggleFiltersBtn').addEventListener('click', () => {
        const panel = document.getElementById('filterControlsGrid');
        panel.classList.toggle('hidden');
    });

    // Search input with 300ms Debounce
    let searchDebounce;
    document.getElementById('searchInput').addEventListener('input', (e) => {
        clearTimeout(searchDebounce);
        searchDebounce = setTimeout(() => {
            state.searchTerm = e.target.value.trim().toLowerCase();
            state.currentPage = 1;
            applyFiltersAndRender();
        }, 300);
    });

    // Filter Change Listeners
    document.getElementById('categoryFilter').addEventListener('change', (e) => {
        state.categoryId = e.target.value;
        state.currentPage = 1;
        applyFiltersAndRender();
    });
    document.getElementById('breedFilter').addEventListener('change', (e) => {
        state.breedId = e.target.value;
        state.currentPage = 1;
        applyFiltersAndRender();
    });
    document.getElementById('sizeFilter').addEventListener('change', (e) => {
        state.sizeId = e.target.value;
        state.currentPage = 1;
        applyFiltersAndRender();
    });
    document.getElementById('colorFilter').addEventListener('change', (e) => {
        state.colorId = e.target.value;
        state.currentPage = 1;
        applyFiltersAndRender();
    });
    document.getElementById('stockStatusFilter').addEventListener('change', (e) => {
        state.stockStatus = e.target.value;
        state.currentPage = 1;
        applyFiltersAndRender();
    });
    document.getElementById('sortBySelect').addEventListener('change', (e) => {
        state.sortBy = e.target.value;
        applyFiltersAndRender();
    });

    // Price Filter Listeners
    document.getElementById('minPriceInput').addEventListener('input', (e) => {
        state.minPrice = e.target.value;
        state.currentPage = 1;
        applyFiltersAndRender();
    });
    document.getElementById('maxPriceInput').addEventListener('input', (e) => {
        state.maxPrice = e.target.value;
        state.currentPage = 1;
        applyFiltersAndRender();
    });

    // Clear Filters & Refresh Data
    document.getElementById('clearFiltersBtn').addEventListener('click', clearFilters);
    document.getElementById('noResultsClearBtn').addEventListener('click', clearFilters);
    document.getElementById('refreshDataBtn').addEventListener('click', () => {
        showToast('Refreshing fish listings...', 'info');
        loadFish();
    });
    document.getElementById('retryFetchBtn').addEventListener('click', loadFish);

    // Logout Handlers
    document.getElementById('sidebarLogoutBtn').addEventListener('click', handleLogout);
    document.getElementById('headerLogoutBtn').addEventListener('click', handleLogout);

    // Delete Modal Controls
    document.getElementById('closeDeleteModalBtn').addEventListener('click', closeDeleteModal);
    document.getElementById('cancelDeleteBtn').addEventListener('click', closeDeleteModal);
    document.getElementById('confirmDeleteBtn').addEventListener('click', confirmDeleteFish);
}

/* ================= URL PARAMETERS SUPPORT ================= */
function readUrlQueryParams() {
    const params = new URLSearchParams(window.location.search);
    if (params.has('stock')) {
        state.stockStatus = params.get('stock');
        document.getElementById('stockStatusFilter').value = state.stockStatus;
    }
}

/* ================= SIDEBAR & DROPDOWN LOGIC ================= */
function openSidebar() {
    document.getElementById('sidebar').classList.add('open');
    document.getElementById('sidebarOverlay').classList.add('show');
}
function closeSidebar() {
    document.getElementById('sidebar').classList.remove('open');
    document.getElementById('sidebarOverlay').classList.remove('show');
}

function toggleDropdown(id) {
    const panel = document.getElementById(id);
    const isVisible = panel.classList.contains('show');
    closeAllDropdowns();
    if (!isVisible) {
        panel.classList.add('show');
    }
}

function closeAllDropdowns() {
    document.querySelectorAll('.dropdown-panel').forEach(panel => panel.classList.remove('show'));
}

function handleLogout() {
    localStorage.removeItem('token');
    showToast('Logged out successfully', 'info');
    setTimeout(() => {
        window.location.href = '../login.html';
    }, 500);
}

/* ================= METADATA & DATA FETCHING ================= */
async function loadFilterMetadata() {
    if (USE_MOCK_DATA) {
        populateFilterDropdowns(getMockMetadata());
        return;
    }

    try {
        // TODO: Replace with real Spring Boot API endpoints if required
        const [categories, breeds, sizes, colors] = await Promise.all([
            fetch(`${API_BASE_URL}/categories`, { headers: getAuthHeaders() }).then(r => r.json()),
            fetch(`${API_BASE_URL}/breeds`, { headers: getAuthHeaders() }).then(r => r.json()),
            fetch(`${API_BASE_URL}/sizes`, { headers: getAuthHeaders() }).then(r => r.json()),
            fetch(`${API_BASE_URL}/colors`, { headers: getAuthHeaders() }).then(r => r.json())
        ]);

        populateFilterDropdowns({ categories, breeds, sizes, colors });
    } catch (err) {
        console.warn('Metadata load failed. Using fallback dropdown options.', err);
    }
}

function populateFilterDropdowns({ categories, breeds, sizes, colors }) {
    populateSelect('categoryFilter', categories, 'categoryName');
    populateSelect('breedFilter', breeds, 'breedName');
    populateSelect('sizeFilter', sizes, 'sizeName');
    populateSelect('colorFilter', colors, 'colorName');
}

function populateSelect(elementId, items, labelKey) {
    const select = document.getElementById(elementId);
    if (!items || !Array.isArray(items)) return;

    // Retain first default option
    select.innerHTML = select.children[0].outerHTML;

    items.forEach(item => {
        const option = document.createElement('option');
        option.value = item.id;
        option.textContent = item[labelKey] || item.name;
        select.appendChild(option);
    });
}

async function loadFish() {
    showLoadingState();

    if (USE_MOCK_DATA) {
        setTimeout(() => {
            state.fish = getMockFishData();
            updateStatistics();
            applyFiltersAndRender();
        }, 400); // Simulate subtle network delay
        return;
    }

    try {
        // TODO: Endpoint strictly scoping fish to authenticated seller via JWT token
        const response = await fetch(`${API_BASE_URL}/sellers/me/fish`, {
            headers: getAuthHeaders()
        });

        if (response.status === 401) {
            window.location.href = '../login.html';
            return;
        }

        if (!response.ok) {
            throw new Error(`Server returned HTTP ${response.status}`);
        }

        const data = await response.json();

        // Support both direct list response and Spring Data Pageable response
        state.fish = Array.isArray(data) ? data : (data.content || []);

        updateStatistics();
        applyFiltersAndRender();
    } catch (error) {
        console.error('Error fetching fish list:', error);
        showErrorState(error.message);
    }
}

/* ================= FILTER & SORT ENGINE ================= */
function applyFiltersAndRender() {
    let result = [...state.fish];

    // 1. Search Query Filter
    if (state.searchTerm) {
        const term = state.searchTerm;
        result = result.filter(f => {
            const name = (f.fishName || '').toLowerCase();
            const desc = (f.description || '').toLowerCase();
            const cat = (f.category?.categoryName || '').toLowerCase();
            const breed = (f.breed?.breedName || '').toLowerCase();
            return name.includes(term) || desc.includes(term) || cat.includes(term) || breed.includes(term);
        });
    }

    // 2. Category Filter
    if (state.categoryId) {
        result = result.filter(f => String(f.category?.id) === String(state.categoryId));
    }

    // 3. Breed Filter
    if (state.breedId) {
        result = result.filter(f => String(f.breed?.id) === String(state.breedId));
    }

    // 4. Size Filter
    if (state.sizeId) {
        result = result.filter(f => String(f.size?.id) === String(state.sizeId));
    }

    // 5. Color Filter
    if (state.colorId) {
        result = result.filter(f => String(f.color?.id) === String(state.colorId));
    }

    // 6. Stock Status Filter
    if (state.stockStatus !== 'all') {
        result = result.filter(f => {
            const qty = f.stockQty || 0;
            if (state.stockStatus === 'instock') return qty > LOW_STOCK_THRESHOLD;
            if (state.stockStatus === 'lowstock') return qty > 0 && qty <= LOW_STOCK_THRESHOLD;
            if (state.stockStatus === 'outofstock') return qty <= 0;
            return true;
        });
    }

    // 7. Price Range Filter
    if (state.minPrice !== '') {
        result = result.filter(f => (f.price || 0) >= parseFloat(state.minPrice));
    }
    if (state.maxPrice !== '') {
        result = result.filter(f => (f.price || 0) <= parseFloat(state.maxPrice));
    }

    // 8. Sorting Logic
    result.sort((a, b) => {
        switch (state.sortBy) {
            case 'oldest':
                return a.id - b.id;
            case 'name-asc':
                return (a.fishName || '').localeCompare(b.fishName || '');
            case 'name-desc':
                return (b.fishName || '').localeCompare(a.fishName || '');
            case 'price-asc':
                return (a.price || 0) - (b.price || 0);
            case 'price-desc':
                return (b.price || 0) - (a.price || 0);
            case 'stock-asc':
                return (a.stockQty || 0) - (b.stockQty || 0);
            case 'stock-desc':
                return (b.stockQty || 0) - (a.stockQty || 0);
            case 'rating-desc':
                return (b.averageRating || 0) - (a.averageRating || 0);
            case 'newest':
            default:
                return b.id - a.id;
        }
    });

    state.filteredFish = result;

    // Handle Empty States vs Display Data
    if (state.fish.length === 0) {
        showEmptySellerState();
    } else if (state.filteredFish.length === 0) {
        showNoResultsState();
    } else {
        renderListingsView();
    }
}

function clearFilters() {
    state.searchTerm = '';
    state.categoryId = '';
    state.breedId = '';
    state.sizeId = '';
    state.colorId = '';
    state.stockStatus = 'all';
    state.minPrice = '';
    state.maxPrice = '';
    state.sortBy = 'newest';
    state.currentPage = 1;

    document.getElementById('searchInput').value = '';
    document.getElementById('categoryFilter').value = '';
    document.getElementById('breedFilter').value = '';
    document.getElementById('sizeFilter').value = '';
    document.getElementById('colorFilter').value = '';
    document.getElementById('stockStatusFilter').value = 'all';
    document.getElementById('sortBySelect').value = 'newest';
    document.getElementById('minPriceInput').value = '';
    document.getElementById('maxPriceInput').value = '';

    applyFiltersAndRender();
}

/* ================= RENDERING LOGIC ================= */
function renderListingsView() {
    hideAllStateCards();

    // Paginate Results
    const total = state.filteredFish.length;
    const totalPages = Math.ceil(total / state.pageSize) || 1;
    if (state.currentPage > totalPages) state.currentPage = totalPages;

    const startIndex = (state.currentPage - 1) * state.pageSize;
    const endIndex = Math.min(startIndex + state.pageSize, total);
    const pageItems = state.filteredFish.slice(startIndex, endIndex);

    if (state.viewMode === 'table') {
        renderTable(pageItems);
        document.getElementById('tableViewContainer').classList.remove('hidden');
        document.getElementById('gridViewContainer').classList.add('hidden');
    } else {
        renderGrid(pageItems);
        document.getElementById('gridViewContainer').classList.remove('hidden');
        document.getElementById('tableViewContainer').classList.add('hidden');
    }

    renderPaginationControls(startIndex + 1, endIndex, total, totalPages);
}

function renderTable(items) {
    const tbody = document.getElementById('fishTableBody');
    tbody.innerHTML = '';

    items.forEach(fish => {
        const tr = document.createElement('tr');
        const imgUrl = getPrimaryFishImage(fish);
        const stockStatusBadge = getStockStatusBadge(fish.stockQty);
        const ratingDisplay = fish.averageRating ? `${fish.averageRating.toFixed(1)} ★` : 'N/A';

        tr.innerHTML = `
            <td>
                <div class="fish-cell-wrapper">
                    <img src="${escapeHtml(imgUrl)}" alt="${escapeHtml(fish.fishName)}" class="fish-thumbnail" onerror="this.src='${FISH_PLACEHOLDER_IMG}'">
                    <div class="fish-info-meta">
                        <span class="fish-title">${escapeHtml(fish.fishName)}</span>
                        <span class="fish-desc-snippet">${escapeHtml(fish.description || '')}</span>
                    </div>
                </div>
            </td>
            <td>${escapeHtml(fish.category?.categoryName || 'Unassigned')}</td>
            <td>${escapeHtml(fish.breed?.breedName || 'Unassigned')}</td>
            <td><strong>${formatCurrency(fish.price)}</strong></td>
            <td>${fish.stockQty || 0} units</td>
            <td><span class="rating-stars">${ratingDisplay}</span></td>
            <td>${stockStatusBadge}</td>
            <td class="text-right">
                <div class="table-actions-cell">
                    <button class="action-icon-btn" onclick="viewFish(${fish.id})" title="View Details" aria-label="View Details for ${escapeHtml(fish.fishName)}">
                        <i class="fa-solid fa-eye"></i>
                    </button>
                    <button class="action-icon-btn" onclick="navigateToEditFish(${fish.id})" title="Edit Fish" aria-label="Edit ${escapeHtml(fish.fishName)}">
                        <i class="fa-solid fa-pen"></i>
                    </button>
                    <button class="action-icon-btn" onclick="navigateToFishImages(${fish.id})" title="Manage Images" aria-label="Manage Images for ${escapeHtml(fish.fishName)}">
                        <i class="fa-solid fa-image"></i>
                    </button>
                    <button class="action-icon-btn delete-btn" onclick="openDeleteModal(${fish.id}, '${escapeJsString(fish.fishName)}')" title="Delete Fish" aria-label="Delete ${escapeHtml(fish.fishName)}">
                        <i class="fa-solid fa-trash-can"></i>
                    </button>
                </div>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function renderGrid(items) {
    const grid = document.getElementById('gridViewContainer');
    grid.innerHTML = '';

    items.forEach(fish => {
        const card = document.createElement('div');
        card.className = 'fish-card';
        const imgUrl = getPrimaryFishImage(fish);
        const stockStatusBadge = getStockStatusBadge(fish.stockQty);
        const ratingDisplay = fish.averageRating ? `${fish.averageRating.toFixed(1)} ★` : 'N/A';

        card.innerHTML = `
            <div class="card-img-wrapper">
                <img src="${escapeHtml(imgUrl)}" alt="${escapeHtml(fish.fishName)}" class="card-img" onerror="this.src='${FISH_PLACEHOLDER_IMG}'">
                <div class="card-stock-badge">${stockStatusBadge}</div>
            </div>
            <div class="card-body">
                <h3 class="card-title">${escapeHtml(fish.fishName)}</h3>
                <p class="card-taxonomy">${escapeHtml(fish.category?.categoryName || 'General')} • ${escapeHtml(fish.breed?.breedName || 'Standard')}</p>
                <div class="card-price-row">
                    <span class="card-price">${formatCurrency(fish.price)}</span>
                    <span class="rating-stars">${ratingDisplay} (${fish.reviewCount || 0})</span>
                </div>
                <div class="card-actions-grid">
                    <button class="btn btn-outline btn-sm" onclick="navigateToEditFish(${fish.id})">
                        <i class="fa-solid fa-pen"></i> Edit
                    </button>
                    <button class="btn btn-outline btn-sm" onclick="navigateToFishImages(${fish.id})">
                        <i class="fa-solid fa-image"></i> Images
                    </button>
                    <button class="btn btn-secondary btn-sm" onclick="viewFish(${fish.id})">
                        <i class="fa-solid fa-eye"></i> View
                    </button>
                    <button class="btn btn-danger btn-sm" onclick="openDeleteModal(${fish.id}, '${escapeJsString(fish.fishName)}')">
                        <i class="fa-solid fa-trash-can"></i> Delete
                    </button>
                </div>
            </div>
        `;
        grid.appendChild(card);
    });
}

function renderPaginationControls(start, end, total, totalPages) {
    document.getElementById('paginationInfoText').textContent = `Showing ${start}–${end} of ${total} fish`;
    const container = document.getElementById('paginationControls');
    container.innerHTML = '';

    if (totalPages <= 1) return;

    // Previous Button
    const prevBtn = document.createElement('button');
    prevBtn.className = 'page-num-btn';
    prevBtn.innerHTML = '<i class="fa-solid fa-chevron-left"></i>';
    prevBtn.disabled = state.currentPage === 1;
    prevBtn.addEventListener('click', () => changePage(state.currentPage - 1));
    container.appendChild(prevBtn);

    // Dynamic Page Number Buttons
    for (let i = 1; i <= totalPages; i++) {
        const btn = document.createElement('button');
        btn.className = `page-num-btn ${i === state.currentPage ? 'active' : ''}`;
        btn.textContent = i;
        btn.addEventListener('click', () => changePage(i));
        container.appendChild(btn);
    }

    // Next Button
    const nextBtn = document.createElement('button');
    nextBtn.className = 'page-num-btn';
    nextBtn.innerHTML = '<i class="fa-solid fa-chevron-right"></i>';
    nextBtn.disabled = state.currentPage === totalPages;
    nextBtn.addEventListener('click', () => changePage(state.currentPage + 1));
    container.appendChild(nextBtn);
}

function changePage(page) {
    state.currentPage = page;
    renderListingsView();
}

function setViewMode(mode) {
    state.viewMode = mode;
    document.getElementById('tableViewBtn').classList.toggle('active', mode === 'table');
    document.getElementById('gridViewBtn').classList.toggle('active', mode === 'grid');
    renderListingsView();
}

/* ================= HELPER CALCULATIONS & FORMATTING ================= */
function getPrimaryFishImage(fish) {
    if (fish.fishImages && Array.isArray(fish.fishImages) && fish.fishImages.length > 0) {
        const primary = fish.fishImages.find(img => img.isPrimary);
        return primary ? primary.imageUrl : fish.fishImages[0].imageUrl;
    }
    return FISH_PLACEHOLDER_IMG;
}

function getStockStatusBadge(stockQty) {
    const qty = stockQty || 0;
    if (qty <= 0) {
        return `<span class="badge-pill badge-out-of-stock"><i class="fa-solid fa-circle-xmark"></i> Out of Stock</span>`;
    }
    if (qty <= LOW_STOCK_THRESHOLD) {
        return `<span class="badge-pill badge-low-stock"><i class="fa-solid fa-triangle-exclamation"></i> Low Stock (${qty})</span>`;
    }
    return `<span class="badge-pill badge-in-stock"><i class="fa-solid fa-circle-check"></i> In Stock (${qty})</span>`;
}

function updateStatistics() {
    const total = state.fish.length;
    let lowStock = 0;
    let outOfStock = 0;
    let activeListings = 0;
    let ratingSum = 0;
    let ratedCount = 0;

    state.fish.forEach(f => {
        const qty = f.stockQty || 0;
        if (qty <= 0) outOfStock++;
        else if (qty <= LOW_STOCK_THRESHOLD) lowStock++;

        if (qty > 0) activeListings++;

        if (f.averageRating) {
            ratingSum += f.averageRating;
            ratedCount++;
        }
    });

    const avgRating = ratedCount > 0 ? (ratingSum / ratedCount).toFixed(1) : 'N/A';

    document.getElementById('statTotalFish').textContent = total;
    document.getElementById('statActiveListings').textContent = activeListings;
    document.getElementById('statLowStock').textContent = lowStock;
    document.getElementById('statOutOfStock').textContent = outOfStock;
    document.getElementById('statAvgRating').textContent = avgRating !== 'N/A' ? `${avgRating} ★` : 'N/A';
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('en-LK', {
        style: 'currency',
        currency: 'LKR',
        maximumFractionDigits: 2
    }).format(amount || 0);
}

/* ================= ACTION HANDLERS ================= */
function viewFish(fishId) {
    // Navigates to shared customer/seller product details view
    window.location.href = `../fish-details.html?id=${fishId}`;
}

function navigateToAddFish() {
    window.location.href = 'add-fish.html';
}

function navigateToEditFish(fishId) {
    window.location.href = `edit-fish.html?id=${fishId}`;
}

function navigateToFishImages(fishId) {
    window.location.href = `fish-images.html?id=${fishId}`;
}

/* ================= DELETION MODAL LOGIC ================= */
function openDeleteModal(fishId, fishName) {
    state.selectedFishIdToDelete = fishId;
    document.getElementById('deleteTargetFishName').textContent = `"${fishName}"`;
    const modal = document.getElementById('deleteModal');
    modal.classList.remove('hidden');
}

function closeDeleteModal() {
    state.selectedFishIdToDelete = null;
    document.getElementById('deleteModal').classList.add('hidden');
}

async function confirmDeleteFish() {
    const fishId = state.selectedFishIdToDelete;
    if (!fishId) return;

    closeDeleteModal();

    if (USE_MOCK_DATA) {
        state.fish = state.fish.filter(f => f.id !== fishId);
        showToast('Fish listing removed successfully (Mock)', 'success');
        updateStatistics();
        applyFiltersAndRender();
        return;
    }

    try {
        // TODO: Backend route enforcing seller authorization
        // DELETE /api/sellers/me/fish/{fishId} OR DELETE /api/fish/{fishId}
        const response = await fetch(`${API_BASE_URL}/sellers/me/fish/${fishId}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });

        if (response.ok) {
            showToast('Fish listing deleted successfully', 'success');
            loadFish();
        } else if (response.status === 409) {
            showToast('Cannot delete: Fish is referenced by active orders or reviews.', 'error');
        } else if (response.status === 403) {
            showToast('Permission denied: You do not own this fish listing.', 'error');
        } else {
            showToast('Failed to delete fish listing. Please try again.', 'error');
        }
    } catch (err) {
        console.error('Delete request failed:', err);
        showToast('Network error while requesting deletion', 'error');
    }
}

/* ================= STATE VISIBILITY UI HELPERS ================= */
function hideAllStateCards() {
    document.getElementById('skeletonState').classList.add('hidden');
    document.getElementById('errorState').classList.add('hidden');
    document.getElementById('emptySellerState').classList.add('hidden');
    document.getElementById('noResultsState').classList.add('hidden');
    document.getElementById('tableViewContainer').classList.add('hidden');
    document.getElementById('gridViewContainer').classList.add('hidden');
    document.getElementById('paginationBar').classList.remove('hidden');
}

function showLoadingState() {
    hideAllStateCards();
    document.getElementById('skeletonState').classList.remove('hidden');
    document.getElementById('paginationBar').classList.add('hidden');
}

function showErrorState(msg) {
    hideAllStateCards();
    if (msg) document.getElementById('errorMessageText').textContent = msg;
    document.getElementById('errorState').classList.remove('hidden');
    document.getElementById('paginationBar').classList.add('hidden');
}

function showEmptySellerState() {
    hideAllStateCards();
    document.getElementById('emptySellerState').classList.remove('hidden');
    document.getElementById('paginationBar').classList.add('hidden');
}

function showNoResultsState() {
    hideAllStateCards();
    document.getElementById('noResultsState').classList.remove('hidden');
    document.getElementById('paginationBar').classList.add('hidden');
}

/* ================= TOAST NOTIFICATION SYSTEM ================= */
function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;

    let icon = 'fa-circle-info';
    if (type === 'success') icon = 'fa-circle-check';
    if (type === 'error') icon = 'fa-triangle-exclamation';

    toast.innerHTML = `<i class="fa-solid ${icon}"></i> <span>${escapeHtml(message)}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100%)';
        toast.style.transition = 'all 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 3500);
}

/* ================= SECURITY & ESCAPING SANITIZERS ================= */
function escapeHtml(str) {
    if (str === null || str === undefined) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function escapeJsString(str) {
    if (!str) return '';
    return String(str).replace(/'/g, "\\'").replace(/"/g, '\\"');
}

/* ================= MOCK DATA PROVIDERS (DEMO MODE ONLY) ================= */
function getMockMetadata() {
    return {
        categories: [
            { id: 1, categoryName: 'Betta Fish' },
            { id: 2, categoryName: 'Guppy' },
            { id: 3, categoryName: 'Cichlid' },
            { id: 4, categoryName: 'Tetra' },
            { id: 5, categoryName: 'Goldfish' }
        ],
        breeds: [
            { id: 1, breedName: 'Halfmoon' },
            { id: 2, breedName: 'Dragon Scale' },
            { id: 3, breedName: 'Peacock Cichlid' },
            { id: 4, breedName: 'Neon Tetra' },
            { id: 5, breedName: 'Oranda Goldfish' }
        ],
        sizes: [
            { id: 1, sizeName: 'Small (1-2 inches)' },
            { id: 2, sizeName: 'Medium (2-4 inches)' },
            { id: 3, sizeName: 'Large (4+ inches)' }
        ],
        colors: [
            { id: 1, colorName: 'Blue' },
            { id: 2, colorName: 'Red' },
            { id: 3, colorName: 'Yellow / Gold' },
            { id: 4, colorName: 'Multicolor' }
        ]
    };
}

function getMockFishData() {
    // DEMO ONLY: Replace with real Spring Boot API data.
    return [
        {
            id: 101,
            fishName: "Blue Galaxy Halfmoon Betta",
            description: "High quality show-grade male Betta with striking blue metallic color patterns.",
            price: 2800,
            stockQty: 12,
            category: { id: 1, categoryName: "Betta Fish" },
            breed: { id: 1, breedName: "Halfmoon" },
            size: { id: 1, sizeName: "Small (1-2 inches)" },
            color: { id: 1, colorName: "Blue" },
            fishImages: [{ id: 1, imageUrl: "https://images.unsplash.com/photo-1534043464124-3be32fe000c9?auto=format&fit=crop&w=400&q=80", isPrimary: true }],
            averageRating: 4.9,
            reviewCount: 18
        },
        {
            id: 102,
            fishName: "Red Dragon Crown Tail Betta",
            description: "Vibrant red coloration with clear fin rays and aggressive flare capability.",
            price: 3200,
            stockQty: 3, // Low stock demo
            category: { id: 1, categoryName: "Betta Fish" },
            breed: { id: 2, breedName: "Dragon Scale" },
            size: { id: 1, sizeName: "Small (1-2 inches)" },
            color: { id: 2, colorName: "Red" },
            fishImages: [{ id: 2, imageUrl: "https://images.unsplash.com/photo-1522069169874-c58ec4b76be5?auto=format&fit=crop&w=400&q=80", isPrimary: true }],
            averageRating: 4.7,
            reviewCount: 12
        },
        {
            id: 103,
            fishName: "Albino Full Red Guppy Trio",
            description: "1 male and 2 females breeding set of pure lineage albino full red guppies.",
            price: 1800,
            stockQty: 0, // Out of stock demo
            category: { id: 2, categoryName: "Guppy" },
            breed: { id: 2, breedName: "Dragon Scale" },
            size: { id: 1, sizeName: "Small (1-2 inches)" },
            color: { id: 2, colorName: "Red" },
            fishImages: [{ id: 3, imageUrl: "https://images.unsplash.com/photo-1524704654690-b56c05c78a00?auto=format&fit=crop&w=400&q=80", isPrimary: true }],
            averageRating: 4.5,
            reviewCount: 8
        },
        {
            id: 104,
            fishName: "Electric Blue Peacock Cichlid",
            description: "Active African Lake Malawi cichlid boasting iridescent bright ocean blue body scales.",
            price: 4500,
            stockQty: 8,
            category: { id: 3, categoryName: "Cichlid" },
            breed: { id: 3, breedName: "Peacock Cichlid" },
            size: { id: 2, sizeName: "Medium (2-4 inches)" },
            color: { id: 1, colorName: "Blue" },
            fishImages: [{ id: 4, imageUrl: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=400&q=80", isPrimary: true }],
            averageRating: 4.8,
            reviewCount: 22
        },
        {
            id: 105,
            fishName: "Cardinal Neon Tetra Schooling Pack (10x)",
            description: "Healthy tank-raised schooling tetras with brilliant red and neon green stripe.",
            price: 2500,
            stockQty: 25,
            category: { id: 4, categoryName: "Tetra" },
            breed: { id: 4, breedName: "Neon Tetra" },
            size: { id: 1, sizeName: "Small (1-2 inches)" },
            color: { id: 4, colorName: "Multicolor" },
            fishImages: [{ id: 5, imageUrl: "https://images.unsplash.com/photo-1535591273668-578e31182c4f?auto=format&fit=crop&w=400&q=80", isPrimary: true }],
            averageRating: 4.6,
            reviewCount: 35
        },
        {
            id: 106,
            fishName: "Red & White Oranda Goldfish",
            description: "Hand-selected Oranda goldfish featuring a well-developed wen head crest.",
            price: 6500,
            stockQty: 2, // Low stock demo
            category: { id: 5, categoryName: "Goldfish" },
            breed: { id: 5, breedName: "Oranda Goldfish" },
            size: { id: 3, sizeName: "Large (4+ inches)" },
            color: { id: 4, colorName: "Multicolor" },
            fishImages: [{ id: 6, imageUrl: "", isPrimary: false }], // Fallback image demo
            averageRating: 5.0,
            reviewCount: 6
        }
    ];
}