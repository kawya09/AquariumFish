/**
 * AQUARIUM FISH SELLER PORTAL - EDIT FISH LISTING JS CONTROLLER
 * Comprehensive, production-ready frontend script.
 */

// =====================================================
// SPRING BOOT API INTEGRATION CONFIGURATION
// =====================================================
//
// GET fish by ID (Verify ownership in backend):
// GET /api/sellers/me/fish/{id}
//
// Update fish listing:
// PUT /api/sellers/me/fish/{id}
//
// Metadata Endpoints:
// GET /api/categories
// GET /api/breeds
// GET /api/sizes
// GET /api/colors
//
// SECURITY NOTICE:
// Frontend NEVER sends sellerId in payloads.
// Backend MUST extract authentication context from JWT Bearer Token.
// =====================================================

const API_BASE_URL = "http://localhost:8080/api";

// DEMO MODE CONTROL:
// Set USE_MOCK_DATA = false when connecting to live Spring Boot backend.
const USE_MOCK_DATA = true;

const MAX_DESCRIPTION_LENGTH = 500;
const LOW_STOCK_THRESHOLD = 5;

// Global Application State Object
const state = {
    fishId: null,
    fish: null,
    originalFish: null,
    categories: [],
    breeds: [],
    sizes: [],
    colors: [],
    isLoading: false,
    isSaving: false,
    hasUnsavedChanges: false,
    pendingNavigationUrl: null
};

// =====================================================
// INITIALIZATION
// =====================================================

document.addEventListener("DOMContentLoaded", () => {
    initializeEditFish();
});

function initializeEditFish() {
    checkAuthentication();
    checkSellerRole();

    state.fishId = getFishIdFromUrl();

    initializeSidebar();
    initializeNotifications();
    initializeUnsavedChangesProtection();
    setupEventListeners();

    if (!state.fishId) {
        showNotFoundState("No fish listing was selected for editing.");
        return;
    }

    // Set Fish ID in UI
    document.getElementById("fishIdBadge").textContent = `Fish ID: #${state.fishId}`;

    // Load metadata first, then load fish listing
    loadMetadata().then(() => {
        loadFish();
    });
}

// Extract Fish ID parameter from URL search params
function getFishIdFromUrl() {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");
    return (id && !isNaN(id)) ? parseInt(id, 10) : null;
}

// Simple Client Authentication Check
function checkAuthentication() {
    const token = localStorage.getItem("token");
    if (!token && !USE_MOCK_DATA) {
        window.location.href = `../login.html?redirect=seller/edit-fish.html?id=${state.fishId || ''}`;
    }
}

// Verify Seller Role Privilege
function checkSellerRole() {
    const role = localStorage.getItem("role");
    if (!USE_MOCK_DATA && role !== "SELLER") {
        if (role === "ADMIN") {
            window.location.href = "../admin/admin-dashboard.html";
        } else {
            window.location.href = "../index.html";
        }
    }
}

// Setup Event Listeners for Controls
function setupEventListeners() {
    const editForm = document.getElementById("editFishForm");

    // Inputs Change Monitoring
    editForm.addEventListener("input", handleFormChange);
    editForm.addEventListener("change", handleFormChange);

    // Form Submission
    editForm.addEventListener("submit", (e) => {
        e.preventDefault();
        saveFish();
    });

    // Form Action Buttons
    document.getElementById("cancelBtn").addEventListener("click", goBackToFishList);
    document.getElementById("backToListBtn").addEventListener("click", goBackToFishList);
    document.getElementById("resetBtn").addEventListener("click", resetForm);
    document.getElementById("manageImagesBtn").addEventListener("click", manageFishImages);
    document.getElementById("viewProductBtn").addEventListener("click", viewFish);
    document.getElementById("retryLoadBtn").addEventListener("click", loadFish);

    // Logout Action
    document.getElementById("sidebarLogoutBtn").addEventListener("click", logout);
    document.getElementById("headerLogoutBtn").addEventListener("click", logout);

    // Dynamic Price Formatting Listener
    document.getElementById("price").addEventListener("input", (e) => {
        const val = parseFloat(e.target.value);
        const hintEl = document.getElementById("formattedPriceHint");
        if (!isNaN(val) && val >= 0) {
            hintEl.textContent = `Formatted: ${formatCurrency(val)}`;
        } else {
            hintEl.textContent = "Formatted: LKR 0.00";
        }
    });
}

// =====================================================
// DATA LOADING (METADATA & FISH)
// =====================================================

async function loadMetadata() {
    try {
        if (USE_MOCK_DATA) {
            state.categories = getMockCategories();
            state.breeds = getMockBreeds();
            state.sizes = getMockSizes();
            state.colors = getMockColors();
        } else {
            const [catRes, breedRes, sizeRes, colorRes] = await Promise.all([
                fetchCategories(),
                fetchBreeds(),
                fetchSizes(),
                fetchColors()
            ]);
            state.categories = catRes;
            state.breeds = breedRes;
            state.sizes = sizeRes;
            state.colors = colorRes;
        }

        populateSelect("category", state.categories, "categoryName");
        populateSelect("breed", state.breeds, "breedName");
        populateSelect("size", state.sizes, "sizeName");
        populateSelect("color", state.colors, "colorName");

    } catch (error) {
        showToast("Failed to load select dropdown metadata options.", "error");
    }
}

async function loadFish() {
    showLoadingState();

    try {
        let fishData = null;

        if (USE_MOCK_DATA) {
            // Simulate API delay
            await new Promise(resolve => setTimeout(resolve, 600));
            fishData = getMockFishById(state.fishId);
        } else {
            fishData = await fetchFishFromAPI(state.fishId);
        }

        if (!fishData) {
            showNotFoundState("The requested fish listing could not be found.");
            return;
        }

        state.fish = fishData;
        state.originalFish = JSON.parse(JSON.stringify(fishData));

        populateForm(fishData);
        renderCurrentImages(fishData.fishImages);
        renderFishInformation(fishData);
        updateProductPreview();

        hideLoadingState();
        document.getElementById("viewProductBtn").disabled = false;

    } catch (error) {
        handleApiError(error);
    }
}

// API Fetch Helpers
async function fetchFishFromAPI(id) {
    const token = localStorage.getItem("token");
    // TODO: Connect to backend Spring Boot endpoint
    const response = await fetch(`${API_BASE_URL}/sellers/me/fish/${id}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        }
    });

    if (!response.ok) {
        throw new Error(`HTTP_${response.status}`);
    }

    const data = await response.json();
    return data.content || data;
}

async function fetchCategories() {
    const res = await fetch(`${API_BASE_URL}/categories`);
    const data = await res.json();
    return data.content || data;
}

async function fetchBreeds() {
    const res = await fetch(`${API_BASE_URL}/breeds`);
    const data = await res.json();
    return data.content || data;
}

async function fetchSizes() {
    const res = await fetch(`${API_BASE_URL}/sizes`);
    const data = await res.json();
    return data.content || data;
}

async function fetchColors() {
    const res = await fetch(`${API_BASE_URL}/colors`);
    const data = await res.json();
    return data.content || data;
}

// Helper to populate select elements dynamically
function populateSelect(elementId, items, nameProperty) {
    const select = document.getElementById(elementId);
    select.innerHTML = `<option value="">Select ${elementId.charAt(0).toUpperCase() + elementId.slice(1)}</option>`;

    items.forEach(item => {
        const option = document.createElement("option");
        option.value = item.id;
        option.textContent = item[nameProperty] || item.name;
        select.appendChild(option);
    });
}

// Populate form fields with fish object
function populateForm(fish) {
    document.getElementById("fishName").value = fish.fishName || "";
    document.getElementById("description").value = fish.description || "";

    if (fish.category) document.getElementById("category").value = fish.category.id;
    if (fish.breed) document.getElementById("breed").value = fish.breed.id;
    if (fish.size) document.getElementById("size").value = fish.size.id;
    if (fish.color) document.getElementById("color").value = fish.color.id;

    document.getElementById("price").value = fish.price || "";
    document.getElementById("stockQty").value = fish.stockQty !== undefined ? fish.stockQty : "";

    updateDescriptionCounter();
    updateStockStatus();

    const hintEl = document.getElementById("formattedPriceHint");
    hintEl.textContent = `Formatted: ${formatCurrency(fish.price || 0)}`;

    state.hasUnsavedChanges = false;
}

// Render Thumbnails
function renderCurrentImages(images) {
    const container = document.getElementById("imageGalleryPreview");
    const countBadge = document.getElementById("imageCountBadge");

    if (!images || images.length === 0) {
        countBadge.textContent = "0";
        container.innerHTML = `
            <div class="no-images-placeholder" style="grid-column: 1 / -1;">
                <i class="fa-solid fa-image"></i>
                <p>No product images uploaded yet.</p>
            </div>
        `;
        return;
    }

    countBadge.textContent = images.length.toString();
    container.innerHTML = images.map(img => `
        <div class="thumb-box">
            <img src="${escapeHtml(img.imageUrl)}" alt="Fish Image">
            ${img.isPrimary ? `<span class="primary-badge">Primary</span>` : ''}
        </div>
    `).join("");
}

// Render Metadata Card
function renderFishInformation(fish) {
    document.getElementById("metaFishId").textContent = `#${fish.id}`;
    document.getElementById("metaSellerShop").textContent = escapeHtml(fish.seller ? fish.seller.shopName : "Unknown");
    document.getElementById("metaCreatedDate").textContent = formatDate(fish.createdAt || "2026-01-15");
    document.getElementById("metaUpdatedDate").textContent = formatDate(fish.updatedAt || "2026-02-20");

    const count = fish.reviewCount || 0;
    const avg = fish.averageRating || 0;
    document.getElementById("metaReviewStats").textContent = `${count} Reviews (${avg} avg)`;
}

// =====================================================
// LIVE PRODUCT PREVIEW LOGIC
// =====================================================

function updateProductPreview() {
    const name = document.getElementById("fishName").value.trim() || "Untitled Fish";
    const desc = document.getElementById("description").value.trim() || "No description provided.";
    const priceVal = parseFloat(document.getElementById("price").value) || 0;
    const stockVal = parseInt(document.getElementById("stockQty").value, 10) || 0;

    const catSelect = document.getElementById("category");
    const catText = catSelect.options[catSelect.selectedIndex]?.text || "Category";

    const breedSelect = document.getElementById("breed");
    const breedText = breedSelect.options[breedSelect.selectedIndex]?.text || "Breed";

    const sizeSelect = document.getElementById("size");
    const sizeText = sizeSelect.options[sizeSelect.selectedIndex]?.text || "Size";

    const colorSelect = document.getElementById("color");
    const colorText = colorSelect.options[colorSelect.selectedIndex]?.text || "Color";

    // Update Card Elements
    document.getElementById("previewTitle").textContent = name;
    document.getElementById("previewCategory").textContent = `${catText} / ${breedText}`;
    document.getElementById("previewSize").innerHTML = `<i class="fa-solid fa-ruler-horizontal"></i> ${sizeText}`;
    document.getElementById("previewColor").innerHTML = `<i class="fa-solid fa-palette"></i> ${colorText}`;
    document.getElementById("previewDesc").textContent = desc;
    document.getElementById("previewPrice").textContent = formatCurrency(priceVal);

    // Image Fallback logic
    const primaryImg = getPrimaryFishImage(state.fish ? state.fish.fishImages : []);
    document.getElementById("previewImage").src = primaryImg;

    // Stock Badge on Card
    const badge = document.getElementById("previewStockBadge");
    if (stockVal > LOW_STOCK_THRESHOLD) {
        badge.textContent = "In Stock";
        badge.className = "preview-stock-badge in-stock";
    } else if (stockVal > 0) {
        badge.textContent = "Low Stock";
        badge.className = "preview-stock-badge low-stock";
    } else {
        badge.textContent = "Out of Stock";
        badge.className = "preview-stock-badge out-of-stock";
    }

    if (state.fish) {
        document.getElementById("previewRatingValue").textContent = state.fish.averageRating || "5.0";
        document.getElementById("previewReviewCount").textContent = `(${state.fish.reviewCount || 0})`;
        if (state.fish.seller) {
            document.getElementById("previewShopName").textContent = state.fish.seller.shopName;
        }
    }
}

function getPrimaryFishImage(images) {
    if (!images || images.length === 0) {
        return "https://images.unsplash.com/photo-1522069169874-c58ec4b76be5?auto=format&fit=crop&w=600&q=80";
    }
    const primary = images.find(img => img.isPrimary);
    return primary ? primary.imageUrl : images[0].imageUrl;
}

// =====================================================
// FORM HANDLERS & DYNAMIC CALCULATIONS
// =====================================================

function handleFormChange() {
    state.hasUnsavedChanges = true;
    updateDescriptionCounter();
    updateStockStatus();
    updateProductPreview();
}

function updateDescriptionCounter() {
    const descText = document.getElementById("description").value;
    const counterEl = document.getElementById("descCharCounter");
    const length = descText.length;

    counterEl.textContent = `${length} / ${MAX_DESCRIPTION_LENGTH} characters`;

    if (length > MAX_DESCRIPTION_LENGTH) {
        counterEl.style.color = "var(--danger-color)";
    } else {
        counterEl.style.color = "var(--text-muted)";
    }
}

function updateStockStatus() {
    const stockVal = parseInt(document.getElementById("stockQty").value, 10);
    const indicator = document.getElementById("stockStatusIndicator");
    const warningBanner = document.getElementById("stockWarningBanner");
    const warningText = document.getElementById("stockWarningText");

    if (isNaN(stockVal) || stockVal < 0) {
        indicator.className = "stock-status-inline";
        indicator.querySelector(".status-text").textContent = "Invalid Quantity";
        warningBanner.classList.add("hidden");
        return;
    }

    const textEl = indicator.querySelector(".status-text");

    if (stockVal > LOW_STOCK_THRESHOLD) {
        indicator.className = "stock-status-inline in-stock";
        textEl.textContent = `In Stock (${stockVal} units available)`;
    } else if (stockVal > 0) {
        indicator.className = "stock-status-inline low-stock";
        textEl.textContent = `Low Stock (${stockVal} remaining)`;
    } else {
        indicator.className = "stock-status-inline out-of-stock";
        textEl.textContent = "Out of Stock";
    }

    // Dynamic stock reduction warning logic
    if (state.originalFish && state.originalFish.stockQty !== undefined) {
        const origStock = state.originalFish.stockQty;
        if (stockVal < origStock && stockVal <= LOW_STOCK_THRESHOLD) {
            warningBanner.classList.remove("hidden");
            if (stockVal === 0) {
                warningText.textContent = `Stock changed from ${origStock} to 0. This listing will show as Out of Stock to customers.`;
            } else {
                warningText.textContent = `Stock reduced from ${origStock} to ${stockVal}. Make sure this reflects your physical inventory.`;
            }
        } else {
            warningBanner.classList.add("hidden");
        }
    }
}

// Reset form to loaded values
function resetForm() {
    if (!state.originalFish) return;
    populateForm(state.originalFish);
    updateProductPreview();
    state.hasUnsavedChanges = false;
    showToast("Form changes have been reset to original values.", "info");
}

// =====================================================
// VALIDATION & SUBMISSION
// =====================================================

function validateForm() {
    let isValid = true;

    // Fish Name Validation
    const nameInput = document.getElementById("fishName");
    const nameVal = nameInput.value.trim();
    if (!nameVal || nameVal.length < 3 || nameVal.length > 100) {
        setError("fishName", true);
        isValid = false;
    } else {
        setError("fishName", false);
    }

    // Description Validation
    const descInput = document.getElementById("description");
    const descVal = descInput.value.trim();
    if (!descVal || descVal.length < 10 || descVal.length > MAX_DESCRIPTION_LENGTH) {
        setError("description", true);
        isValid = false;
    } else {
        setError("description", false);
    }

    // Classifications Validation
    ["category", "breed", "size", "color"].forEach(field => {
        const val = document.getElementById(field).value;
        if (!val) {
            setError(field, true);
            isValid = false;
        } else {
            setError(field, false);
        }
    });

    // Price Validation
    const priceVal = parseFloat(document.getElementById("price").value);
    if (isNaN(priceVal) || priceVal <= 0) {
        setError("price", true);
        isValid = false;
    } else {
        setError("price", false);
    }

    // Stock Quantity Validation
    const stockVal = parseInt(document.getElementById("stockQty").value, 10);
    if (isNaN(stockVal) || stockVal < 0) {
        setError("stockQty", true);
        isValid = false;
    } else {
        setError("stockQty", false);
    }

    return isValid;
}

function setError(fieldId, isError) {
    const el = document.getElementById(fieldId);
    const parent = el.closest(".form-group");
    if (isError) {
        parent.classList.add("has-error");
        el.classList.add("invalid");
        el.setAttribute("aria-invalid", "true");
    } else {
        parent.classList.remove("has-error");
        el.classList.remove("invalid");
        el.removeAttribute("aria-invalid");
    }
}

async function saveFish() {
    if (state.isSaving) return;

    if (!validateForm()) {
        showToast("Please fix the validation errors before saving.", "error");
        return;
    }

    state.isSaving = true;
    setSaveButtonLoading(true);

    const payload = collectFormData();

    try {
        if (USE_MOCK_DATA) {
            // Simulate network update delay
            await new Promise(resolve => setTimeout(resolve, 1000));
            showToast("Demo mode: Fish listing updated successfully!", "success");
        } else {
            await updateFishAPI(state.fishId, payload);
            showToast("Fish listing updated successfully!", "success");
        }

        state.hasUnsavedChanges = false;
        // Update original state to reflect saved state
        state.originalFish = { ...state.originalFish, ...payload };

        // Redirect back to seller's fish list after short delay
        setTimeout(() => {
            window.location.href = "fish-list.html";
        }, 1200);

    } catch (error) {
        handleApiError(error);
    } finally {
        state.isSaving = false;
        setSaveButtonLoading(false);
    }
}

// Assemble JSON Payload according to requirements
function collectFormData() {
    return {
        fishName: document.getElementById("fishName").value.trim(),
        description: document.getElementById("description").value.trim(),
        price: parseFloat(document.getElementById("price").value),
        stockQty: parseInt(document.getElementById("stockQty").value, 10),
        categoryId: parseInt(document.getElementById("category").value, 10),
        breedId: parseInt(document.getElementById("breed").value, 10),
        sizeId: parseInt(document.getElementById("size").value, 10),
        colorId: parseInt(document.getElementById("color").value, 10)
    };
}

async function updateFishAPI(id, payload) {
    const token = localStorage.getItem("token");
    // TODO: Connect to backend Spring Boot endpoint
    const response = await fetch(`${API_BASE_URL}/sellers/me/fish/${id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(payload)
    });

    if (!response.ok) {
        throw new Error(`HTTP_${response.status}`);
    }

    return await response.json();
}

function setSaveButtonLoading(isLoading) {
    const saveBtn = document.getElementById("saveChangesBtn");
    if (isLoading) {
        saveBtn.disabled = true;
        saveBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> <span>Saving Changes...</span>`;
    } else {
        saveBtn.disabled = false;
        saveBtn.innerHTML = `<i class="fa-solid fa-floppy-disk"></i> <span>Save Changes</span>`;
    }
}

// =====================================================
// STATE & ERROR UI RENDERING
// =====================================================

function showLoadingState() {
    document.getElementById("loadingState").classList.remove("hidden");
    document.getElementById("editLayout").classList.add("hidden");
    document.getElementById("errorState").classList.add("hidden");
}

function hideLoadingState() {
    document.getElementById("loadingState").classList.add("hidden");
    document.getElementById("editLayout").classList.remove("hidden");
}

function showNotFoundState(msg) {
    document.getElementById("loadingState").classList.add("hidden");
    document.getElementById("editLayout").classList.add("hidden");
    const errBox = document.getElementById("errorState");
    errBox.classList.remove("hidden");
    document.getElementById("errorStateTitle").textContent = "Fish Listing Not Found";
    document.getElementById("errorStateMessage").textContent = msg;
}

function handleApiError(error) {
    hideLoadingState();
    const errMsg = error.message || "";

    if (errMsg.includes("HTTP_401")) {
        showToast("Authentication session expired. Please log in again.", "error");
        setTimeout(() => logout(), 1500);
    } else if (errMsg.includes("HTTP_403")) {
        showNotFoundState("You do not have permission to edit this fish listing.");
    } else if (errMsg.includes("HTTP_404")) {
        showNotFoundState("The fish listing with ID #" + state.fishId + " does not exist.");
    } else {
        showToast("Server connection failure. Please check your backend connection.", "error");
    }
}

// =====================================================
// UNSAVED CHANGES & NAVIGATION PROTECTION
// =====================================================

function initializeUnsavedChangesProtection() {
    window.addEventListener("beforeunload", (e) => {
        if (state.hasUnsavedChanges) {
            e.preventDefault();
            e.returnValue = "You have unsaved changes. Are you sure you want to leave?";
            return e.returnValue;
        }
    });

    // Intercept internal link navigation
    document.querySelectorAll("a").forEach(link => {
        link.addEventListener("click", (e) => {
            const href = link.getAttribute("href");
            if (href && !href.startsWith("#") && !href.startsWith("javascript") && state.hasUnsavedChanges) {
                e.preventDefault();
                state.pendingNavigationUrl = href;
                openUnsavedModal();
            }
        });
    });

    document.getElementById("closeUnsavedModalBtn").addEventListener("click", closeUnsavedModal);
    document.getElementById("keepEditingBtn").addEventListener("click", closeUnsavedModal);
    document.getElementById("discardAndLeaveBtn").addEventListener("click", () => {
        state.hasUnsavedChanges = false;
        if (state.pendingNavigationUrl) {
            window.location.href = state.pendingNavigationUrl;
        } else {
            window.location.href = "fish-list.html";
        }
    });
}

function openUnsavedModal() {
    document.getElementById("unsavedModal").classList.remove("hidden");
}

function closeUnsavedModal() {
    document.getElementById("unsavedModal").classList.add("hidden");
    state.pendingNavigationUrl = null;
}

function goBackToFishList() {
    if (state.hasUnsavedChanges) {
        state.pendingNavigationUrl = "fish-list.html";
        openUnsavedModal();
    } else {
        window.location.href = "fish-list.html";
    }
}

function viewFish() {
    if (state.fishId) {
        window.open(`../fish-details.html?id=${state.fishId}`, "_blank");
    }
}

function manageFishImages() {
    if (state.fishId) {
        window.location.href = `fish-images.html?id=${state.fishId}`;
    }
}

// =====================================================
// SIDEBAR & HEADER CONTROLS
// =====================================================

function initializeSidebar() {
    const sidebar = document.getElementById("sidebar");
    const hamburgerBtn = document.getElementById("hamburgerBtn");
    const closeBtn = document.getElementById("sidebarCloseBtn");
    const overlay = document.getElementById("sidebarOverlay");

    function toggleSidebar() {
        sidebar.classList.toggle("open");
        overlay.classList.toggle("show");
    }

    function closeSidebar() {
        sidebar.classList.remove("open");
        overlay.classList.remove("show");
    }

    if (hamburgerBtn) hamburgerBtn.addEventListener("click", toggleSidebar);
    if (closeBtn) closeBtn.addEventListener("click", closeSidebar);
    if (overlay) overlay.addEventListener("click", closeSidebar);
}

function initializeNotifications() {
    const notifBtn = document.getElementById("notifBellBtn");
    const notifMenu = document.getElementById("notifMenu");
    const profileBtn = document.getElementById("profileDropdownBtn");
    const profileMenu = document.getElementById("profileMenu");

    if (notifBtn && notifMenu) {
        notifBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            notifMenu.classList.toggle("show");
            if (profileMenu) profileMenu.classList.remove("show");
        });
    }

    if (profileBtn && profileMenu) {
        profileBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            profileMenu.classList.toggle("show");
            if (notifMenu) notifMenu.classList.remove("show");
        });
    }

    document.addEventListener("click", () => {
        if (notifMenu) notifMenu.classList.remove("show");
        if (profileMenu) profileMenu.classList.remove("show");
    });
}

function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    window.location.href = "../login.html";
}

// =====================================================
// UTILITIES & HELPER FUNCTIONS
// =====================================================

function showToast(message, type = "info") {
    const container = document.getElementById("toastContainer");
    const toast = document.createElement("div");
    toast.className = `toast ${type}`;

    let icon = "fa-circle-info";
    if (type === "success") icon = "fa-circle-check";
    if (type === "error") icon = "fa-circle-exclamation";
    if (type === "warning") icon = "fa-triangle-exclamation";

    toast.innerHTML = `
        <i class="fa-solid ${icon}"></i>
        <span>${escapeHtml(message)}</span>
    `;

    container.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = "0";
        toast.style.transform = "translateX(50px)";
        toast.style.transition = "all 0.3s ease";
        setTimeout(() => toast.remove(), 300);
    }, 3500);
}

function formatCurrency(amount) {
    return new Intl.NumberFormat("en-LK", {
        style: "currency",
        currency: "LKR",
        minimumFractionDigits: 2
    }).format(amount || 0);
}

function formatDate(dateString) {
    if (!dateString) return "--";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { year: 'numeric', month: 'short', day: 'numeric' });
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

// =====================================================
// MOCK DATA IMPLEMENTATIONS (DEMO MODE)
// =====================================================

function getMockFishById(id) {
    return {
        id: id || 15,
        fishName: "Royal Blue Halfmoon Betta",
        description: "Exquisite show-grade Royal Blue Halfmoon Betta fish. Peaceful temperament, high vitality, and thoroughly quarantined for healthy aquarium introduction.",
        price: 2500.00,
        stockQty: 12,
        seller: {
            id: 3,
            shopName: "Ocean Paradise",
            phone: "+94771234567"
        },
        category: { id: 1, categoryName: "Betta" },
        breed: { id: 4, breedName: "Halfmoon" },
        size: { id: 2, sizeName: "Small (1.5 - 2 inches)" },
        color: { id: 5, colorName: "Royal Blue" },
        fishImages: [
            { id: 101, imageUrl: "https://images.unsplash.com/photo-1522069169874-c58ec4b76be5?auto=format&fit=crop&w=600&q=80", isPrimary: true },
            { id: 102, imageUrl: "https://images.unsplash.com/photo-1535591273668-578e31182c4f?auto=format&fit=crop&w=600&q=80", isPrimary: false }
        ],
        createdAt: "2026-01-10",
        updatedAt: "2026-02-18",
        averageRating: 4.7,
        reviewCount: 24
    };
}

function getMockCategories() {
    return [
        { id: 1, categoryName: "Betta" },
        { id: 2, categoryName: "Cichlids" },
        { id: 3, categoryName: "Tetras" },
        { id: 4, categoryName: "Goldfish" }
    ];
}

function getMockBreeds() {
    return [
        { id: 1, breedName: "Crown Tail" },
        { id: 2, breedName: "Veil Tail" },
        { id: 3, breedName: "Plakat" },
        { id: 4, breedName: "Halfmoon" }
    ];
}

function getMockSizes() {
    return [
        { id: 1, sizeName: "Fry / Micro" },
        { id: 2, sizeName: "Small (1.5 - 2 inches)" },
        { id: 3, sizeName: "Medium (2 - 3 inches)" },
        { id: 4, sizeName: "Large (3+ inches)" }
    ];
}

function getMockColors() {
    return [
        { id: 1, colorName: "Red" },
        { id: 2, colorName: "Cyan Glow" },
        { id: 3, colorName: "Black Orchid" },
        { id: 4, colorName: "Yellow Mustard" },
        { id: 5, colorName: "Royal Blue" }
    ];
}