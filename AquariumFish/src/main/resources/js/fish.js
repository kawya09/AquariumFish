/**
 * js/fish.js
 * Customer-facing fish catalog and product listing module for the Aquarium Fish application.
 */

(function () {
    if (window.__aquariumFishCatalogInitialized) {
        return;
    }
    window.__aquariumFishCatalogInitialized = true;

    // Ensure AquariumFish namespace exists
    window.AquariumFish = window.AquariumFish || {};

    // Constants
    const PAGE_SIZE = 12;
    const LOW_STOCK_THRESHOLD = 5;
    const FISH_PLACEHOLDER = "assets/images/fish-placeholder.jpg";

    // Configuration Fallbacks
    function getConfig() {
        return window.AquariumFish.config || window.APP_CONFIG || {
            API_BASE_URL: "http://localhost:8080/api",
            USE_MOCK_DATA: true
        };
    }

    // State Management
    const fishState = {
        fish: [],
        filteredFish: [],
        categories: [],
        breeds: [],
        sizes: [],
        colors: [],
        search: "",
        categoryId: "",
        breedId: "",
        sizeId: "",
        colorId: "",
        sort: "featured",
        page: 1,
        pageSize: PAGE_SIZE,
        totalPages: 1,
        loading: false,
        error: null
    };

    let searchAbortController = null;

    // Mock Metadata Collections
    const mockCategories = [
        { id: 1, categoryName: "Betta" },
        { id: 2, categoryName: "Goldfish" },
        { id: 3, categoryName: "Guppy" },
        { id: 4, categoryName: "Tetra" },
        { id: 5, categoryName: "Cichlid" },
        { id: 6, categoryName: "Marine Fish" }
    ];

    const mockBreeds = [
        { id: 1, breedName: "Halfmoon" },
        { id: 2, breedName: "Crowntail" },
        { id: 3, breedName: "Fantail" },
        { id: 4, breedName: "Oranda" },
        { id: 5, breedName: "Cobra Guppy" },
        { id: 6, breedName: "Neon Tetra" }
    ];

    const mockSizes = [
        { id: 1, sizeName: "Small" },
        { id: 2, sizeName: "Medium" },
        { id: 3, sizeName: "Large" }
    ];

    const mockColors = [
        { id: 1, colorName: "Blue" },
        { id: 2, colorName: "Red" },
        { id: 3, colorName: "Yellow" },
        { id: 4, colorName: "White" },
        { id: 5, colorName: "Black" },
        { id: 6, colorName: "Orange" }
    ];

    // Mock Fish Catalog Data
    const mockFishCatalog = [
        {
            id: 1,
            fishName: "Blue Betta Halfmoon",
            description: "Vibrant blue halfmoon betta fish with gorgeous flowing fins.",
            price: 4500.00,
            stockQty: 12,
            category: { id: 1, categoryName: "Betta" },
            breed: { id: 1, breedName: "Halfmoon" },
            size: { id: 2, sizeName: "Medium" },
            color: { id: 1, colorName: "Blue" },
            seller: { id: 1, shopName: "Demo Aqua Shop" },
            images: [{ id: 1, imageUrl: "assets/images/fish/demo-betta.jpg", isPrimary: true }],
            rating: 4.8,
            reviewCount: 18
        },
        {
            id: 2,
            fishName: "Red Oranda Goldfish",
            description: "Healthy red oranda goldfish with a distinct head growth.",
            price: 3200.00,
            stockQty: 4,
            category: { id: 2, categoryName: "Goldfish" },
            breed: { id: 4, breedName: "Oranda" },
            size: { id: 3, sizeName: "Large" },
            color: { id: 2, colorName: "Red" },
            seller: { id: 2, shopName: "Goldfish World" },
            images: [{ id: 2, imageUrl: "assets/images/fish/demo-oranda.jpg", isPrimary: true }],
            rating: 4.5,
            reviewCount: 9
        },
        {
            id: 3,
            fishName: "Cobra Guppy",
            description: "Active cobra pattern guppy fish suitable for community tanks.",
            price: 1200.00,
            stockQty: 25,
            category: { id: 3, categoryName: "Guppy" },
            breed: { id: 5, breedName: "Cobra Guppy" },
            size: { id: 1, sizeName: "Small" },
            color: { id: 6, colorName: "Orange" },
            seller: { id: 1, shopName: "Demo Aqua Shop" },
            images: [{ id: 3, imageUrl: "assets/images/fish/demo-guppy.jpg", isPrimary: true }],
            rating: 4.2,
            reviewCount: 14
        },
        {
            id: 4,
            fishName: "Neon Tetra Schooling Pack",
            description: "Bright neon blue and red schooling fish, peaceful nature.",
            price: 2500.00,
            stockQty: 0,
            category: { id: 4, categoryName: "Tetra" },
            breed: { id: 6, breedName: "Neon Tetra" },
            size: { id: 1, sizeName: "Small" },
            color: { id: 1, colorName: "Blue" },
            seller: { id: 3, shopName: "Amazonia Aqua" },
            images: [{ id: 4, imageUrl: "assets/images/fish/demo-tetra.jpg", isPrimary: true }],
            rating: 4.9,
            reviewCount: 31
        }
    ];

    // Normalization Utilities
    function normalizeFish(rawFish) {
        if (!rawFish) return null;
        return {
            id: rawFish.id || rawFish.fishId,
            fishName: rawFish.fishName || rawFish.name || "Unnamed Fish",
            description: rawFish.description || "",
            price: Number(rawFish.price) || 0,
            stockQty: Number(rawFish.stockQty) !== undefined ? Number(rawFish.stockQty) : 10,
            category: rawFish.category || { id: null, categoryName: "Uncategorized" },
            breed: rawFish.breed || { id: null, breedName: "General" },
            size: rawFish.size || { id: null, sizeName: "Standard" },
            color: rawFish.color || { id: null, colorName: "Assorted" },
            seller: rawFish.seller || { shopName: "Verified Seller" },
            images: Array.isArray(rawFish.images) ? rawFish.images : [],
            rating: Number(rawFish.rating) || 0,
            reviewCount: Number(rawFish.reviewCount) || 0
        };
    }

    function getPrimaryFishImage(fish) {
        if (!fish || !fish.images || fish.images.length === 0) {
            return FISH_PLACEHOLDER;
        }
        const primary = fish.images.find(img => img.isPrimary);
        const target = primary ? primary.imageUrl : fish.images[0].imageUrl;
        if (!target || target.startsWith("javascript:") || target.startsWith("data:text/html")) {
            return FISH_PLACEHOLDER;
        }
        return target;
    }

    function formatCurrency(amount) {
        if (typeof window.AquariumFish.formatCurrency === "function") {
            return window.AquariumFish.formatCurrency(amount);
        }
        return `LKR ${Number(amount || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }

    function escapeHtml(str) {
        if (typeof window.AquariumFish.escapeHtml === "function") {
            return window.AquariumFish.escapeHtml(str);
        }
        return String(str || "").replace(/[&<>'"]/g,
            tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
        );
    }

    function showToast(message, type = "info") {
        if (typeof window.AquariumFish.showToast === "function") {
            window.AquariumFish.showToast(message, type);
            return;
        }
        console.log(`[Toast - ${type}] ${message}`);
    }

    // API Helpers
    async function executeApiRequest(endpoint, options = {}) {
        const config = getConfig();
        const url = `${config.API_BASE_URL}${endpoint}`;

        if (typeof window.AquariumFish.apiRequest === "function") {
            return window.AquariumFish.apiRequest(endpoint, options);
        }

        const response = await fetch(url, {
            ...options,
            headers: {
                "Content-Type": "application/json",
                ...(options.headers || {})
            }
        });

        const contentType = response.headers.get("content-type");
        let data = null;
        if (contentType && contentType.includes("application/json")) {
            data = await response.json();
        } else {
            data = await response.text();
        }

        if (!response.ok) {
            const err = new Error(typeof data === "string" ? data : (data.message || data.error || "API request failed"));
            err.status = response.status;
            throw err;
        }

        return data;
    }

    // URL State Synchronization
    function readUrlState() {
        const params = new URLSearchParams(window.location.search);
        fishState.search = params.get("search") || "";
        fishState.categoryId = params.get("categoryId") || "";
        fishState.breedId = params.get("breedId") || "";
        fishState.sizeId = params.get("sizeId") || "";
        fishState.colorId = params.get("colorId") || "";
        fishState.sort = params.get("sort") || "featured";
        fishState.page = parseInt(params.get("page"), 10) || 1;
    }

    function updateUrl() {
        const params = new URLSearchParams();
        if (fishState.search) params.set("search", fishState.search);
        if (fishState.categoryId) params.set("categoryId", fishState.categoryId);
        if (fishState.breedId) params.set("breedId", fishState.breedId);
        if (fishState.sizeId) params.set("sizeId", fishState.sizeId);
        if (fishState.colorId) params.set("colorId", fishState.colorId);
        if (fishState.sort && fishState.sort !== "featured") params.set("sort", fishState.sort);
        if (fishState.page > 1) params.set("page", fishState.page);

        const newQuery = params.toString();
        const newUrl = `${window.location.pathname}${newQuery ? "?" + newQuery : ""}`;
        window.history.replaceState({}, "", newUrl);
    }

    // Metadata Loading
    async function loadMetadata() {
        const config = getConfig();
        if (config.USE_MOCK_DATA) {
            fishState.categories = mockCategories;
            fishState.breeds = mockBreeds;
            fishState.sizes = mockSizes;
            fishState.colors = mockColors;
            populateFilterDropdowns();
            return;
        }

        try {
            const [catRes, breedRes, sizeRes, colorRes] = await Promise.allSettled([
                executeApiRequest("/categories"),
                executeApiRequest("/breeds"),
                executeApiRequest("/sizes"),
                executeApiRequest("/colors")
            ]);

            // TODO: Confirm the final Spring Boot metadata endpoint contracts.
            fishState.categories = catRes.status === "fulfilled" ? (catRes.value.content || catRes.value) : [];
            fishState.breeds = breedRes.status === "fulfilled" ? (breedRes.value.content || breedRes.value) : [];
            fishState.sizes = sizeRes.status === "fulfilled" ? (sizeRes.value.content || sizeRes.value) : [];
            fishState.colors = colorRes.status === "fulfilled" ? (colorRes.value.content || colorRes.value) : [];

            populateFilterDropdowns();
        } catch (e) {
            console.error("Failed to load catalog metadata", e);
        }
    }

    function populateFilterDropdowns() {
        const catSelect = document.getElementById("categoryFilter");
        const breedSelect = document.getElementById("breedFilter");
        const sizeSelect = document.getElementById("sizeFilter");
        const colorSelect = document.getElementById("colorFilter");

        if (catSelect) {
            catSelect.innerHTML = `<option value="">All Categories</option>` +
                fishState.categories.map(c => `<option value="${c.id}" ${String(fishState.categoryId) === String(c.id) ? "selected" : ""}>${escapeHtml(c.categoryName)}</option>`).join("");
        }
        if (breedSelect) {
            breedSelect.innerHTML = `<option value="">All Breeds</option>` +
                fishState.breeds.map(b => `<option value="${b.id}" ${String(fishState.breedId) === String(b.id) ? "selected" : ""}>${escapeHtml(b.breedName)}</option>`).join("");
        }
        if (sizeSelect) {
            sizeSelect.innerHTML = `<option value="">All Sizes</option>` +
                fishState.sizes.map(s => `<option value="${s.id}" ${String(fishState.sizeId) === String(s.id) ? "selected" : ""}>${escapeHtml(s.sizeName)}</option>`).join("");
        }
        if (colorSelect) {
            colorSelect.innerHTML = `<option value="">All Colors</option>` +
                fishState.colors.map(col => `<option value="${col.id}" ${String(fishState.colorId) === String(col.id) ? "selected" : ""}>${escapeHtml(col.colorName)}</option>`).join("");
        }

        const searchInput = document.getElementById("fishSearch") || document.querySelector("[data-fish-search]");
        if (searchInput && searchInput.value !== fishState.search) {
            searchInput.value = fishState.search;
        }

        const sortSelect = document.getElementById("sortFilter");
        if (sortSelect) {
            sortSelect.value = fishState.sort;
        }
    }

    // Fish Loading
    async function loadFish() {
        const config = getConfig();
        fishState.loading = true;
        fishState.error = null;
        renderCatalogState();

        if (searchAbortController) {
            searchAbortController.abort();
        }
        searchAbortController = new AbortController();

        try {
            let rawData = [];
            if (config.USE_MOCK_DATA) {
                await new Promise(r => setTimeout(r, 300));
                rawData = mockFishCatalog;
            } else {
                // TODO: Confirm the final Spring Boot fish catalog endpoint and DTO structure.
                const response = await executeApiRequest("/fish", { signal: searchAbortController.signal });
                rawData = response.content || response.items || response.data || response;
            }

            fishState.fish = Array.isArray(rawData) ? rawData.map(normalizeFish) : [];
            applyProcessingPipeline();
        } catch (err) {
            if (err.name === "AbortError") return;
            fishState.error = err.message || "Unable to load fish catalog.";
            renderCatalogState();
        } finally {
            fishState.loading = false;
        }
    }

    // Processing Pipeline (Search -> Filters -> Sort -> Paginate)
    function applyProcessingPipeline() {
        let result = [...fishState.fish];

        // Search Filter
        if (fishState.search) {
            const query = fishState.search.toLowerCase().trim();
            result = result.filter(f =>
                f.fishName.toLowerCase().includes(query) ||
                f.description.toLowerCase().includes(query) ||
                f.category.categoryName?.toLowerCase().includes(query) ||
                f.breed.breedName?.toLowerCase().includes(query) ||
                f.size.sizeName?.toLowerCase().includes(query) ||
                f.color.colorName?.toLowerCase().includes(query) ||
                f.seller.shopName?.toLowerCase().includes(query)
            );
        }

        // Category Filter
        if (fishState.categoryId) {
            result = result.filter(f => String(f.category?.id) === String(fishState.categoryId));
        }

        // Breed Filter
        if (fishState.breedId) {
            result = result.filter(f => String(f.breed?.id) === String(fishState.breedId));
        }

        // Size Filter
        if (fishState.sizeId) {
            result = result.filter(f => String(f.size?.id) === String(fishState.sizeId));
        }

        // Color Filter
        if (fishState.colorId) {
            result = result.filter(f => String(f.color?.id) === String(fishState.colorId));
        }

        // Sorting
        result.sort((a, b) => {
            switch (fishState.sort) {
                case "price-asc": return a.price - b.price;
                case "price-desc": return b.price - a.price;
                case "name-asc": return a.fishName.localeCompare(b.fishName);
                case "name-desc": return b.fishName.localeCompare(a.fishName);
                case "rating-desc": return b.rating - a.rating;
                case "stock-desc": return b.stockQty - a.stockQty;
                default: return 0; // featured
            }
        });

        fishState.filteredFish = result;
        fishState.totalPages = Math.max(1, Math.ceil(result.length / fishState.pageSize));
        if (fishState.page > fishState.totalPages) {
            fishState.page = fishState.totalPages;
        }

        renderCatalogState();
    }

    // Rendering Catalog UI
    function renderCatalogState() {
        const grid = document.getElementById("fishGrid") || document.querySelector("[data-fish-grid]");
        const resultsCount = document.getElementById("resultsCount");
        const paginationContainer = document.getElementById("pagination");

        if (!grid) return;

        if (fishState.loading) {
            grid.innerHTML = `
                <div class="fish-loading-state" style="grid-column: 1 / -1; text-align: center; padding: 40px;">
                    <div class="spinner"></div>
                    <p>Loading aquarium fish...</p>
                </div>
            `;
            return;
        }

        if (fishState.error) {
            grid.innerHTML = `
                <div class="fish-error-state" style="grid-column: 1 / -1; text-align: center; padding: 40px;">
                    <p class="error-message">${escapeHtml(fishState.error)}</p>
                    <button id="retryFishBtn" class="btn btn-primary" style="margin-top: 15px;">Retry</button>
                </div>
            `;
            const retryBtn = document.getElementById("retryFishBtn");
            if (retryBtn) retryBtn.addEventListener("click", () => loadFish());
            return;
        }

        if (fishState.filteredFish.length === 0) {
            grid.innerHTML = `
                <div class="fish-empty-state" style="grid-column: 1 / -1; text-align: center; padding: 40px;">
                    <h3>No fish found</h3>
                    <p>Try changing your search or filter criteria.</p>
                    <button id="clearFiltersBtn" class="btn btn-outline" style="margin-top: 15px;">Clear Filters</button>
                </div>
            `;
            const clearBtn = document.getElementById("clearFiltersBtn");
            if (clearBtn) clearBtn.addEventListener("click", clearAllFilters);
            if (resultsCount) resultsCount.textContent = "Showing 0 fish";
            if (paginationContainer) paginationContainer.innerHTML = "";
            return;
        }

        // Pagination slicing
        const startIndex = (fishState.page - 1) * fishState.pageSize;
        const endIndex = startIndex + fishState.pageSize;
        const pageItems = fishState.filteredFish.slice(startIndex, endIndex);

        if (resultsCount) {
            resultsCount.textContent = `Showing ${startIndex + 1}–${Math.min(endIndex, fishState.filteredFish.length)} of ${fishState.filteredFish.length} fish`;
        }

        // Render Cards
        const fragment = document.createDocumentFragment();
        pageItems.forEach(fish => {
            const card = document.createElement("div");
            card.className = "fish-card";
            card.setAttribute("data-fish-card", "");

            const imgSrc = getPrimaryFishImage(fish);
            const stockStatus = fish.stockQty <= 0
                ? `<span class="badge badge-danger">Out of Stock</span>`
                : fish.stockQty <= LOW_STOCK_THRESHOLD
                    ? `<span class="badge badge-warning">Low Stock (${fish.stockQty})</span>`
                    : `<span class="badge badge-success">In Stock</span>`;

            card.innerHTML = `
                <div class="fish-card-image-wrapper">
                    <img src="${escapeHtml(imgSrc)}" alt="${escapeHtml(fish.fishName)}" loading="lazy" class="fish-card-img" />
                    <button class="wishlist-btn" data-wishlist data-fish-id="${fish.id}" aria-label="Add to Wishlist">♥</button>
                    ${stockStatus}
                </div>
                <div class="fish-card-body">
                    <div class="fish-meta-category">${escapeHtml(fish.category.categoryName || "")}</div>
                    <h3 class="fish-card-title">
                        <a href="fish-details.html?id=${fish.id}">${escapeHtml(fish.fishName)}</a>
                    </h3>
                    <div class="fish-card-tags">
                        <span>${escapeHtml(fish.breed.breedName || "")}</span> • 
                        <span>${escapeHtml(fish.size.sizeName || "")}</span> • 
                        <span>${escapeHtml(fish.color.colorName || "")}</span>
                    </div>
                    <div class="fish-card-rating">
                        ★ ${fish.rating.toFixed(1)} (${fish.reviewCount})
                    </div>
                    <div class="fish-card-footer">
                        <span class="fish-price">${formatCurrency(fish.price)}</span>
                        <div class="fish-card-actions">
                            <button class="btn btn-sm btn-outline" data-quick-view data-fish-id="${fish.id}">Quick View</button>
                            <button class="btn btn-sm btn-primary" data-add-to-cart data-fish-id="${fish.id}" ${fish.stockQty <= 0 ? "disabled" : ""}>Add to Cart</button>
                        </div>
                    </div>
                </div>
            `;
            fragment.appendChild(card);
        });

        grid.innerHTML = "";
        grid.appendChild(fragment);

        renderPagination(paginationContainer);
    }

    function renderPagination(container) {
        if (!container) return;
        if (fishState.totalPages <= 1) {
            container.innerHTML = "";
            return;
        }

        let html = `<button class="pagination-btn" data-page="${fishState.page - 1}" ${fishState.page === 1 ? "disabled" : ""}>Previous</button>`;

        for (let i = 1; i <= fishState.totalPages; i++) {
            if (i === 1 || i === fishState.totalPages || (i >= fishState.page - 1 && i <= fishState.page + 1)) {
                html += `<button class="pagination-btn ${i === fishState.page ? "active" : ""}" data-page="${i}">${i}</button>`;
            } else if (i === fishState.page - 2 || i === fishState.page + 2) {
                html += `<span class="pagination-ellipsis">...</span>`;
            }
        }

        html += `<button class="pagination-btn" data-page="${fishState.page + 1}" ${fishState.page === fishState.totalPages ? "disabled" : ""}>Next</button>`;
        container.innerHTML = html;
    }

    // Add to Cart Action
    async function handleAddToCart(fishId) {
        const fish = fishState.fish.find(f => String(f.id) === String(fishId));
        if (!fish) return;

        if (fish.stockQty <= 0) {
            showToast("This fish is out of stock.", "error");
            return;
        }

        const config = getConfig();

        try {
            if (config.USE_MOCK_DATA) {
                await new Promise(r => setTimeout(r, 400));
                showToast(`Added ${fish.fishName} to cart successfully!`, "success");
                window.dispatchEvent(new CustomEvent("cart:updated"));
                return;
            }

            // TODO: Confirm the final Spring Boot cart-item endpoint and request DTO.
            await executeApiRequest("/cart/items", {
                method: "POST",
                body: JSON.stringify({ fishId: Number(fishId), quantity: 1 })
            });

            showToast(`Added ${fish.fishName} to cart successfully!`, "success");
            window.dispatchEvent(new CustomEvent("cart:updated"));
        } catch (err) {
            if (err.status === 401) {
                const currentUrl = encodeURIComponent(window.location.pathname + window.location.search);
                window.location.href = `login.html?redirect=${currentUrl}`;
                return;
            }
            showToast(err.message || "Unable to add fish to cart.", "error");
        }
    }

    // Quick View Modal
    function openQuickView(fishId) {
        const fish = fishState.fish.find(f => String(f.id) === String(fishId));
        if (!fish) return;

        let modal = document.getElementById("quickViewModal");
        if (!modal) {
            modal = document.createElement("div");
            modal.id = "quickViewModal";
            modal.className = "modal";
            modal.setAttribute("role", "dialog");
            modal.setAttribute("aria-hidden", "true");
            document.body.appendChild(modal);
        }

        const imgSrc = getPrimaryFishImage(fish);
        modal.innerHTML = `
            <div class="modal-backdrop" data-modal-close></div>
            <div class="modal-content">
                <button class="modal-close-btn" data-modal-close aria-label="Close modal">&times;</button>
                <div class="quick-view-grid">
                    <div class="quick-view-image">
                        <img src="${escapeHtml(imgSrc)}" alt="${escapeHtml(fish.fishName)}" />
                    </div>
                    <div class="quick-view-details">
                        <span class="badge">${escapeHtml(fish.category.categoryName || "")}</span>
                        <h2>${escapeHtml(fish.fishName)}</h2>
                        <div class="fish-card-tags" style="margin: 10px 0;">
                            <span>Breed: ${escapeHtml(fish.breed.breedName || "")}</span> | 
                            <span>Size: ${escapeHtml(fish.size.sizeName || "")}</span> | 
                            <span>Color: ${escapeHtml(fish.color.colorName || "")}</span>
                        </div>
                        <div class="quick-view-price" style="font-size: 1.5rem; font-weight: bold; margin: 10px 0;">
                            ${formatCurrency(fish.price)}
                        </div>
                        <p class="quick-view-desc">${escapeHtml(fish.description || "No description provided.")}</p>
                        <div class="quick-view-actions" style="margin-top: 20px; display: flex; gap: 10px;">
                            <a href="fish-details.html?id=${fish.id}" class="btn btn-outline">Full Details</a>
                            <button class="btn btn-primary" data-add-to-cart data-fish-id="${fish.id}" ${fish.stockQty <= 0 ? "disabled" : ""}>Add to Cart</button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        modal.style.display = "flex";
        modal.setAttribute("aria-hidden", "false");

        const closeTriggers = modal.querySelectorAll("[data-modal-close]");
        closeTriggers.forEach(el => {
            el.addEventListener("click", () => {
                modal.style.display = "none";
                modal.setAttribute("aria-hidden", "true");
            });
        });
    }

    // Wishlist Demo Support
    function toggleWishlist(fishId, btnElement) {
        let wishlist = [];
        try {
            wishlist = JSON.parse(localStorage.getItem("aquarium_fish_wishlist") || "[]");
        } catch (e) {
            wishlist = [];
        }

        const index = wishlist.indexOf(fishId);
        if (index > -1) {
            wishlist.splice(index, 1);
            btnElement.classList.remove("active");
            showToast("Removed from wishlist", "info");
        } else {
            wishlist.push(fishId);
            btnElement.classList.add("active");
            showToast("Added to wishlist", "success");
        }

        try {
            localStorage.setItem("aquarium_fish_wishlist", JSON.stringify(wishlist));
        } catch (e) {
            // Storage quota handled safely
        }
    }

    // Clear All Filters
    function clearAllFilters() {
        fishState.search = "";
        fishState.categoryId = "";
        fishState.breedId = "";
        fishState.sizeId = "";
        fishState.colorId = "";
        fishState.sort = "featured";
        fishState.page = 1;

        populateFilterDropdowns();
        updateUrl();
        applyProcessingPipeline();
    }

    // Event Listeners Setup
    function initEventListeners() {
        const searchInput = document.getElementById("fishSearch") || document.querySelector("[data-fish-search]");
        if (searchInput) {
            let debounceTimer;
            searchInput.addEventListener("input", (e) => {
                clearTimeout(debounceTimer);
                debounceTimer = setTimeout(() => {
                    fishState.search = e.target.value.trim();
                    fishState.page = 1;
                    updateUrl();
                    applyProcessingPipeline();
                }, 300);
            });
        }

        const filterIds = ["categoryFilter", "breedFilter", "sizeFilter", "colorFilter", "sortFilter"];
        filterIds.forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                el.addEventListener("change", (e) => {
                    const val = e.target.value;
                    if (id === "categoryFilter") fishState.categoryId = val;
                    if (id === "breedFilter") fishState.breedId = val;
                    if (id === "sizeFilter") fishState.sizeId = val;
                    if (id === "colorFilter") fishState.colorId = val;
                    if (id === "sortFilter") fishState.sort = val;
                    fishState.page = 1;
                    updateUrl();
                    applyProcessingPipeline();
                });
            }
        });

        const grid = document.getElementById("fishGrid") || document.querySelector("[data-fish-grid]");
        if (grid) {
            grid.addEventListener("click", (e) => {
                const addCartBtn = e.target.closest("[data-add-to-cart]");
                if (addCartBtn) {
                    const fishId = addCartBtn.getAttribute("data-fish-id");
                    handleAddToCart(fishId);
                    return;
                }

                const quickViewBtn = e.target.closest("[data-quick-view]");
                if (quickViewBtn) {
                    const fishId = quickViewBtn.getAttribute("data-fish-id");
                    openQuickView(fishId);
                    return;
                }

                const wishlistBtn = e.target.closest("[data-wishlist]");
                if (wishlistBtn) {
                    const fishId = wishlistBtn.getAttribute("data-fish-id");
                    toggleWishlist(fishId, wishlistBtn);
                    return;
                }
            });
        }

        const paginationContainer = document.getElementById("pagination");
        if (paginationContainer) {
            paginationContainer.addEventListener("click", (e) => {
                const btn = e.target.closest("button[data-page]");
                if (!btn || btn.disabled) return;
                const newPage = parseInt(btn.getAttribute("data-page"), 10);
                if (newPage && newPage !== fishState.page) {
                    fishState.page = newPage;
                    updateUrl();
                    renderCatalogState();
                    window.scrollTo({ top: 0, behavior: "smooth" });
                }
            });
        }

        window.addEventListener("popstate", () => {
            readUrlState();
            populateFilterDropdowns();
            applyProcessingPipeline();
        });
    }

    // Page Initializer Guard and Execution
    function initFishPage() {
        const path = window.location.pathname.toLowerCase();
        const hasCatalogRoot = document.getElementById("fishGrid") || document.querySelector("[data-fish-grid]");

        if (!path.includes("fish.html") && !hasCatalogRoot) {
            return;
        }

        readUrlState();
        initEventListeners();
        loadMetadata().then(() => {
            loadFish();
        });
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", initFishPage);
    } else {
        initFishPage();
    }

    // Expose Public API
    window.AquariumFish.fish = {
        init: initFishPage,
        load: loadFish,
        refresh: applyProcessingPipeline,
        clearFilters: clearAllFilters
    };

})();