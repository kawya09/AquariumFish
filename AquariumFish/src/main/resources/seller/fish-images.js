/* =====================================================
   AQUARIUM FISH SELLER PANEL - FISH IMAGES JAVASCRIPT
   ===================================================== */

// Configuration & State
const API_BASE_URL = "http://localhost:8080/api";
const USE_MOCK_DATA = true; // Set to false when connecting to Spring Boot backend
const MAX_IMAGES = 8;
const MAX_FILE_SIZE_MB = 5;

const state = {
    fishId: null,
    fish: null,
    images: [],
    selectedFiles: [],
    previewUrls: [],
    isLoading: true,
    isUploading: false,
    isDeleting: false,
    activeLightboxIndex: 0,
    imageToDelete: null,
    isAuthenticated: false
};

// DOM Elements
let skeletonLoader, mainInterface, stateContainer;
let fishPrimaryThumb, fishNameDisplay, fishIdBadge, fishCategory, fishBreed, fishSize, fishColor, fishPrice, fishStock, fishSellerShop;
let totalImagesCount, primaryStatusCount, maxImagesCount, slotsRemainingCount, galleryCount;
let dropZone, imageInput, browseFilesBtn, pendingContainer, pendingGrid, pendingCount, clearPendingBtn, confirmUploadBtn;
let imageGalleryGrid, emptyGalleryState, uploadFirstBtn;
let lightboxModal, lightboxImage, lightboxFishName, lightboxCounter, lightboxCloseBtn, lightboxPrevBtn, lightboxNextBtn, lightboxSetPrimaryBtn, lightboxDeleteBtn;
let deleteModal, deleteModalCloseBtn, cancelDeleteBtn, confirmDeleteBtn, primaryDeleteWarning;
let sidebarToggleBtn, sidebarCloseBtn, sellerSidebar, logoutBtn, dropdownLogoutBtn, notificationBtn, notificationPanel, profileDropdownBtn, profileDropdownMenu;

// Initialize on DOM Ready
document.addEventListener("DOMContentLoaded", () => {
    initializeElements();
    initializeFishImages();
});

function initializeElements() {
    skeletonLoader = document.getElementById("skeletonLoader");
    mainInterface = document.getElementById("mainInterface");
    stateContainer = document.getElementById("stateContainer");

    fishPrimaryThumb = document.getElementById("fishPrimaryThumb");
    fishNameDisplay = document.getElementById("fishNameDisplay");
    fishIdBadge = document.getElementById("fishIdBadge");
    fishCategory = document.getElementById("fishCategory");
    fishBreed = document.getElementById("fishBreed");
    fishSize = document.getElementById("fishSize");
    fishColor = document.getElementById("fishColor");
    fishPrice = document.getElementById("fishPrice");
    fishStock = document.getElementById("fishStock");
    fishSellerShop = document.getElementById("fishSellerShop");

    totalImagesCount = document.getElementById("totalImagesCount");
    primaryStatusCount = document.getElementById("primaryStatusCount");
    maxImagesCount = document.getElementById("maxImagesCount");
    slotsRemainingCount = document.getElementById("slotsRemainingCount");
    galleryCount = document.getElementById("galleryCount");

    dropZone = document.getElementById("dropZone");
    imageInput = document.getElementById("imageInput");
    browseFilesBtn = document.getElementById("browseFilesBtn");
    pendingContainer = document.getElementById("pendingContainer");
    pendingGrid = document.getElementById("pendingGrid");
    pendingCount = document.getElementById("pendingCount");
    clearPendingBtn = document.getElementById("clearPendingBtn");
    confirmUploadBtn = document.getElementById("confirmUploadBtn");

    imageGalleryGrid = document.getElementById("imageGalleryGrid");
    emptyGalleryState = document.getElementById("emptyGalleryState");
    uploadFirstBtn = document.getElementById("uploadFirstBtn");

    lightboxModal = document.getElementById("lightboxModal");
    lightboxImage = document.getElementById("lightboxImage");
    lightboxFishName = document.getElementById("lightboxFishName");
    lightboxCounter = document.getElementById("lightboxCounter");
    lightboxCloseBtn = document.getElementById("lightboxCloseBtn");
    lightboxPrevBtn = document.getElementById("lightboxPrevBtn");
    lightboxNextBtn = document.getElementById("lightboxNextBtn");
    lightboxSetPrimaryBtn = document.getElementById("lightboxSetPrimaryBtn");
    lightboxDeleteBtn = document.getElementById("lightboxDeleteBtn");

    deleteModal = document.getElementById("deleteModal");
    deleteModalCloseBtn = document.getElementById("deleteModalCloseBtn");
    cancelDeleteBtn = document.getElementById("cancelDeleteBtn");
    confirmDeleteBtn = document.getElementById("confirmDeleteBtn");
    primaryDeleteWarning = document.getElementById("primaryDeleteWarning");

    sidebarToggleBtn = document.getElementById("sidebarToggleBtn");
    sidebarCloseBtn = document.getElementById("sidebarCloseBtn");
    sellerSidebar = document.getElementById("sellerSidebar");
    logoutBtn = document.getElementById("logoutBtn");
    dropdownLogoutBtn = document.getElementById("dropdownLogoutBtn");
    notificationBtn = document.getElementById("notificationBtn");
    notificationPanel = document.getElementById("notificationPanel");
    profileDropdownBtn = document.getElementById("profileDropdownBtn");
    profileDropdownMenu = document.getElementById("profileDropdownMenu");
}

function initializeFishImages() {
    if (!checkAuthentication() || !checkSellerRole()) return;

    state.fishId = getFishIdFromUrl();
    if (!state.fishId) {
        showNotFoundState("Fish ID is missing in the URL query parameters (?id=FISH_ID).");
        return;
    }

    initializeSidebar();
    initializeNotifications();
    initializeUpload();
    initializeModals();
    setupNavigationButtons();

    loadFishData();
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
        if (role === "ADMIN") {
            window.location.href = "../admin/admin-dashboard.html";
        } else {
            window.location.href = "../index.html";
        }
        return false;
    }
    return true;
}

function getFishIdFromUrl() {
    const params = new URLSearchParams(window.location.search);
    return params.get("id");
}

// Data Loading
async function loadFishData() {
    showLoadingState();
    try {
        if (USE_MOCK_DATA) {
            // Simulate network latency
            await new Promise(resolve => setTimeout(resolve, 600));
            loadMockData();
        } else {
            await fetchFishFromAPI();
            await fetchFishImagesFromAPI();
        }
        renderFishInformation();
        renderImageSummary();
        renderImageGallery();
        showMainInterface();
    } catch (error) {
        console.error("Failed to load fish data:", error);
        showErrorState(error.message || "Unable to load fish details and images.");
    }
}

function loadMockData() {
    state.fish = {
        id: state.fishId,
        fishName: "Blue Betta Halfmoon",
        category: "Betta",
        breed: "Halfmoon",
        size: "Small (5cm)",
        color: "Royal Blue & Indigo",
        price: 2500.00,
        stockQty: 12,
        sellerShopName: "Ocean Paradise Aquariums"
    };

    state.images = [
        {
            id: 101,
            imageUrl: "https://images.unsplash.com/photo-1522069169874-c58ec4b76be5?auto=format&fit=crop&w=600&q=80",
            isPrimary: true,
            fileName: "blue-betta-display-1.jpg",
            fileSize: "1.4 MB",
            dimensions: "1200 × 900",
            uploadDate: "2026-05-12"
        },
        {
            id: 102,
            imageUrl: "https://images.unsplash.com/photo-1535591273668-578e3112a443?auto=format&fit=crop&w=600&q=80",
            isPrimary: false,
            fileName: "blue-betta-fins-2.jpg",
            fileSize: "1.8 MB",
            dimensions: "1200 × 900",
            uploadDate: "2026-05-12"
        },
        {
            id: 103,
            imageUrl: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=600&q=80",
            isPrimary: false,
            fileName: "blue-betta-side-3.jpg",
            fileSize: "2.1 MB",
            dimensions: "1200 × 900",
            uploadDate: "2026-05-14"
        }
    ];
}

// Spring Boot API Integration Placeholders
async function fetchFishFromAPI() {
    const token = localStorage.getItem("token");
    const response = await fetch(`${API_BASE_URL}/sellers/me/fish/${state.fishId}`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    if (!response.ok) throw new Error(handleApiError(response.status));
    state.fish = await response.json();
}

async function fetchFishImagesFromAPI() {
    const token = localStorage.getItem("token");
    const response = await fetch(`${API_BASE_URL}/sellers/me/fish/${state.fishId}/images`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    if (!response.ok) throw new Error(handleApiError(response.status));
    const data = await response.json();
    state.images = Array.isArray(data) ? data : (data.content || []);
}

// UI Rendering
function renderFishInformation() {
    if (!state.fish) return;

    const primaryImg = getPrimaryImage();
    const primaryUrl = primaryImg ? resolveImageUrl(primaryImg.imageUrl) : "https://via.placeholder.com/150?text=No+Image";

    fishPrimaryThumb.src = primaryUrl;
    fishNameDisplay.textContent = escapeHtml(state.fish.fishName);
    fishIdBadge.textContent = `#${state.fish.id}`;
    fishCategory.textContent = escapeHtml(state.fish.category || "Aquarium Fish");
    fishBreed.textContent = escapeHtml(state.fish.breed || "Standard");
    fishSize.textContent = escapeHtml(state.fish.size || "Standard");
    fishColor.textContent = escapeHtml(state.fish.color || "Multi");
    fishPrice.textContent = formatCurrency(state.fish.price || 0);
    fishStock.textContent = state.fish.stockQty || 0;
    fishSellerShop.textContent = escapeHtml(state.fish.sellerShopName || "Ocean Paradise");
}

function renderImageSummary() {
    const total = state.images.length;
    const hasPrimary = state.images.some(img => img.isPrimary);
    const slotsRemaining = Math.max(0, MAX_IMAGES - total);

    totalImagesCount.textContent = total;
    primaryStatusCount.textContent = hasPrimary ? "1 selected" : "None";
    slotsRemainingCount.textContent = `${slotsRemaining} remaining`;
    galleryCount.textContent = total;

    if (total >= MAX_IMAGES) {
        dropZone.classList.add("hidden");
        showToast("Maximum image limit (8) reached for this fish listing.", "warning");
    } else {
        dropZone.classList.remove("hidden");
    }
}

function renderImageGallery() {
    imageGalleryGrid.innerHTML = "";

    if (state.images.length === 0) {
        emptyGalleryState.classList.remove("hidden");
        imageGalleryGrid.classList.add("hidden");
        return;
    }

    emptyGalleryState.classList.add("hidden");
    imageGalleryGrid.classList.remove("hidden");

    state.images.forEach((img, index) => {
        const card = document.createElement("div");
        card.className = `image-card ${img.isPrimary ? "is-primary" : ""}`;
        card.innerHTML = `
            <div class="image-card-thumb-wrap" onclick="openLightbox(${index})">
                <img src="${escapeHtml(resolveImageUrl(img.imageUrl))}" alt="Fish Image #${img.id}" class="image-card-thumb">
                ${img.isPrimary ? '<span class="primary-badge-tag">PRIMARY</span>' : ''}
                <div class="image-card-overlay">
                    <button class="btn btn-sm btn-secondary" onclick="event.stopPropagation(); openLightbox(${index})" title="View Larger"><i class="fa-solid fa-expand"></i></button>
                </div>
            </div>
            <div class="image-card-body">
                <div class="image-card-meta">
                    <span>ID: #${img.id}</span>
                    <span>${escapeHtml(img.fileSize || "Standard")}</span>
                </div>
                <div class="image-card-actions">
                    ${!img.isPrimary ? `<button class="btn btn-sm btn-outline" onclick="setPrimaryImage(${img.id})"><i class="fa-solid fa-star"></i> Primary</button>` : `<button class="btn btn-sm btn-primary" disabled><i class="fa-solid fa-check"></i> Primary</button>`}
                    <button class="btn btn-sm btn-danger" onclick="openDeleteModal(${img.id})" title="Delete Image"><i class="fa-solid fa-trash"></i></button>
                </div>
            </div>
        `;
        imageGalleryGrid.appendChild(card);
    });
}

function getPrimaryImage() {
    return state.images.find(img => img.isPrimary) || state.images[0] || null;
}

function resolveImageUrl(url) {
    if (!url) return "";
    if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("blob:")) {
        return url;
    }
    return `${API_BASE_URL.replace("/api", "")}${url}`;
}

// Upload & Drag-and-Drop Workflow
function initializeUpload() {
    browseFilesBtn.addEventListener("click", () => imageInput.click());
    dropZone.addEventListener("click", () => imageInput.click());

    imageInput.addEventListener("change", (e) => {
        handleFileSelection(e.target.files);
    });

    ["dragenter", "dragover"].forEach(eventName => {
        dropZone.addEventListener(eventName, (e) => {
            e.preventDefault();
            dropZone.classList.add("dragover");
        }, false);
    });

    ["dragleave", "drop"].forEach(eventName => {
        dropZone.addEventListener(eventName, (e) => {
            e.preventDefault();
            dropZone.classList.remove("dragover");
            if (eventName === "drop") {
                handleFileSelection(e.dataTransfer.files);
            }
        }, false);
    });

    clearPendingBtn.addEventListener("click", clearPendingFiles);
    confirmUploadBtn.addEventListener("click", uploadImages);
    uploadFirstBtn.addEventListener("click", () => imageInput.click());
}

function handleFileSelection(files) {
    const validFiles = [];
    const currentTotalCount = state.images.length + state.selectedFiles.size;

    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const validationError = validateImageFile(file);

        if (validationError) {
            showToast(validationError, "error");
            continue;
        }

        if (state.images.length + validFiles.length + state.selectedFiles.length >= MAX_IMAGES) {
            showToast(`You can upload a maximum of ${MAX_IMAGES} images per fish.`, "warning");
            break;
        }

        validFiles.push(file);
    }

    validFiles.forEach(file => {
        state.selectedFiles.push(file);
        const previewUrl = URL.createObjectURL(file);
        state.previewUrls.push(previewUrl);
    });

    renderPendingPreviews();
}

function validateImageFile(file) {
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
        return `Invalid image type (${file.name}). Use JPEG, PNG, or WEBP.`;
    }
    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
        return `Image exceeds the ${MAX_FILE_SIZE_MB} MB limit (${file.name}).`;
    }
    return null;
}

function renderPendingPreviews() {
    if (state.selectedFiles.length === 0) {
        pendingContainer.classList.add("hidden");
        return;
    }

    pendingContainer.classList.remove("hidden");
    pendingCount.textContent = state.selectedFiles.length;
    pendingGrid.innerHTML = "";

    state.selectedFiles.forEach((file, index) => {
        const previewUrl = state.previewUrls[index];
        const card = document.createElement("div");
        card.className = "pending-item-card";
        card.innerHTML = `
            <img src="${previewUrl}" alt="Preview" class="pending-thumb">
            <div class="pending-info">
                <div class="pending-name" title="${escapeHtml(file.name)}">${escapeHtml(file.name)}</div>
                <div class="pending-meta">
                    <span>${formatFileSize(file.size)}</span>
                    <span class="text-uppercase">${file.type.split('/')[1]}</span>
                </div>
                <div class="pending-actions">
                    <button type="button" class="btn btn-sm btn-danger" onclick="removePendingImage(${index})"><i class="fa-solid fa-xmark"></i> Remove</button>
                </div>
            </div>
        `;
        pendingGrid.appendChild(card);
    });
}

function removePendingImage(index) {
    URL.revokeObjectURL(state.previewUrls[index]);
    state.selectedFiles.splice(index, 1);
    state.previewUrls.splice(index, 1);
    renderPendingPreviews();
}

function clearPendingFiles() {
    state.previewUrls.forEach(url => URL.revokeObjectURL(url));
    state.selectedFiles = [];
    state.previewUrls = [];
    renderPendingPreviews();
    imageInput.value = "";
}

async function uploadImages() {
    if (state.selectedFiles.length === 0) return;

    confirmUploadBtn.disabled = true;
    confirmUploadBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Uploading...`;

    try {
        if (USE_MOCK_DATA) {
            await new Promise(resolve => setTimeout(resolve, 1000));
            state.selectedFiles.forEach((file, idx) => {
                state.images.push({
                    id: Date.now() + idx,
                    imageUrl: state.previewUrls[idx],
                    isPrimary: state.images.length === 0 && idx === 0,
                    fileName: file.name,
                    fileSize: formatFileSize(file.size),
                    uploadDate: new Date().toISOString().split('T')[0]
                });
            });
            clearPendingFiles();
            renderImageSummary();
            renderImageGallery();
            showToast("Demo mode: Images uploaded successfully.", "success");
        } else {
            const formData = new FormData();
            state.selectedFiles.forEach(file => {
                formData.append("images", file);
            });

            const token = localStorage.getItem("token");
            const response = await fetch(`${API_BASE_URL}/sellers/me/fish/${state.fishId}/images`, {
                method: "POST",
                headers: { Authorization: `Bearer ${token}` },
                body: formData
            });

            if (!response.ok) throw new Error(handleApiError(response.status));

            clearPendingFiles();
            await fetchFishImagesFromAPI();
            renderImageSummary();
            renderImageGallery();
            showToast("Images uploaded successfully.", "success");
        }
    } catch (error) {
        showToast(error.message || "Failed to upload images.", "error");
    } finally {
        confirmUploadBtn.disabled = false;
        confirmUploadBtn.innerHTML = `<i class="fa-solid fa-upload"></i> Upload Images`;
    }
}

// Primary Image Management
async function setPrimaryImage(imageId) {
    try {
        if (USE_MOCK_DATA) {
            state.images.forEach(img => {
                img.isPrimary = (img.id === imageId);
            });
            renderFishInformation();
            renderImageSummary();
            renderImageGallery();
            showToast("Demo mode: Primary image updated.", "success");
        } else {
            const token = localStorage.getItem("token");
            const response = await fetch(`${API_BASE_URL}/sellers/me/fish/${state.fishId}/images/${imageId}/primary`, {
                method: "PUT",
                headers: { Authorization: `Bearer ${token}` }
            });
            if (!response.ok) throw new Error(handleApiError(response.status));

            await fetchFishImagesFromAPI();
            renderFishInformation();
            renderImageSummary();
            renderImageGallery();
            showToast("Primary image updated successfully.", "success");
        }
    } catch (error) {
        showToast(error.message || "Failed to set primary image.", "error");
    }
}

// Delete Image Workflow
function openDeleteModal(imageId) {
    state.imageToDelete = imageId;
    const imgObj = state.images.find(img => img.id === imageId);

    if (imgObj && imgObj.isPrimary) {
        primaryDeleteWarning.classList.remove("hidden");
    } else {
        primaryDeleteWarning.classList.add("hidden");
    }

    deleteModal.classList.add("show");
    deleteModal.setAttribute("aria-hidden", "false");
}

function closeDeleteModal() {
    state.imageToDelete = null;
    deleteModal.classList.remove("show");
    deleteModal.setAttribute("aria-hidden", "true");
}

async function confirmDeleteImageAction() {
    if (!state.imageToDelete) return;
    const imageId = state.imageToDelete;

    confirmDeleteBtn.disabled = true;
    confirmDeleteBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Deleting...`;

    try {
        if (USE_MOCK_DATA) {
            await new Promise(resolve => setTimeout(resolve, 600));
            state.images = state.images.filter(img => img.id !== imageId);
            // If primary was deleted and images remain, assign first as primary
            if (state.images.length > 0 && !state.images.some(img => img.isPrimary)) {
                state.images[0].isPrimary = true;
            }
            closeDeleteModal();
            renderFishInformation();
            renderImageSummary();
            renderImageGallery();
            showToast("Demo mode: Image deleted successfully.", "success");
        } else {
            const token = localStorage.getItem("token");
            const response = await fetch(`${API_BASE_URL}/sellers/me/fish/${state.fishId}/images/${imageId}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` }
            });
            if (!response.ok) throw new Error(handleApiError(response.status));

            closeDeleteModal();
            await fetchFishImagesFromAPI();
            renderFishInformation();
            renderImageSummary();
            renderImageGallery();
            showToast("Image deleted successfully.", "success");
        }
    } catch (error) {
        showToast(error.message || "Failed to delete image.", "error");
    } finally {
        confirmDeleteBtn.disabled = false;
        confirmDeleteBtn.textContent = "Delete Image";
    }
}

// Lightbox Modal
function openLightbox(index) {
    state.activeLightboxIndex = index;
    updateLightboxContent();
    lightboxModal.classList.add("show");
    lightboxModal.setAttribute("aria-hidden", "false");
    document.addEventListener("keydown", handleLightboxKeyboard);
}

function closeLightbox() {
    lightboxModal.classList.remove("show");
    lightboxModal.setAttribute("aria-hidden", "true");
    document.removeEventListener("keydown", handleLightboxKeyboard);
}

function updateLightboxContent() {
    if (state.images.length === 0) return;
    const img = state.images[state.activeLightboxIndex];

    lightboxImage.src = resolveImageUrl(img.imageUrl);
    lightboxFishName.textContent = state.fish ? state.fish.fishName : "Fish Image";
    lightboxCounter.textContent = `Image ${state.activeLightboxIndex + 1} of ${state.images.length}`;

    if (img.isPrimary) {
        lightboxSetPrimaryBtn.innerHTML = `<i class="fa-solid fa-check"></i> Primary Image`;
        lightboxSetPrimaryBtn.disabled = true;
    } else {
        lightboxSetPrimaryBtn.innerHTML = `<i class="fa-solid fa-star"></i> Set as Primary`;
        lightboxSetPrimaryBtn.disabled = false;
        lightboxSetPrimaryBtn.onclick = () => {
            setPrimaryImage(img.id);
            closeLightbox();
        };
    }

    lightboxDeleteBtn.onclick = () => {
        closeLightbox();
        openDeleteModal(img.id);
    };
}

function showPreviousImage() {
    state.activeLightboxIndex = (state.activeLightboxIndex - 1 + state.images.length) % state.images.length;
    updateLightboxContent();
}

function showNextImage() {
    state.activeLightboxIndex = (state.activeLightboxIndex + 1) % state.images.length;
    updateLightboxContent();
}

function handleLightboxKeyboard(e) {
    if (e.key === "Escape") closeLightbox();
    if (e.key === "ArrowLeft") showPreviousImage();
    if (e.key === "ArrowRight") showNextImage();
}

// Modals Setup
function initializeModals() {
    deleteModalCloseBtn.addEventListener("click", closeDeleteModal);
    cancelDeleteBtn.addEventListener("click", closeDeleteModal);
    confirmDeleteBtn.addEventListener("click", confirmDeleteImageAction);

    lightboxCloseBtn.addEventListener("click", closeLightbox);
    lightboxPrevBtn.addEventListener("click", showPreviousImage);
    lightboxNextBtn.addEventListener("click", showNextImage);

    lightboxModal.addEventListener("click", (e) => {
        if (e.target === lightboxModal) closeLightbox();
    });
    deleteModal.addEventListener("click", (e) => {
        if (e.target === deleteModal) closeDeleteModal();
    });
}

// Navigation & Actions Setup
function setupNavigationButtons() {
    document.getElementById("backToFishBtn").addEventListener("click", () => {
        window.location.href = "fish-list.html";
    });
    document.getElementById("editFishBtn").addEventListener("click", () => {
        window.location.href = `edit-fish.html?id=${state.fishId}`;
    });
    document.getElementById("viewProductBtn").addEventListener("click", () => {
        window.location.href = `../fish-details.html?id=${state.fishId}`;
    });
}

// Sidebar & Header UI
function initializeSidebar() {
    sidebarToggleBtn.addEventListener("click", () => sellerSidebar.classList.toggle("open"));
    sidebarCloseBtn.addEventListener("click", () => sellerSidebar.classList.remove("open"));

    const handleLogout = (e) => {
        e.preventDefault();
        localStorage.removeItem("token");
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

    document.addEventListener("click", () => {
        notificationPanel.classList.remove("show");
        profileDropdownMenu.classList.remove("show");
    });
}

// State Views
function showLoadingState() {
    state.isLoading = true;
    skeletonLoader.classList.remove("hidden");
    mainInterface.classList.add("hidden");
}

function showMainInterface() {
    state.isLoading = false;
    skeletonLoader.classList.add("hidden");
    mainInterface.classList.remove("hidden");
}

function showErrorState(message) {
    skeletonLoader.classList.add("hidden");
    mainInterface.classList.add("hidden");
    stateContainer.innerHTML = `
        <div class="card text-center" style="padding: 4rem 2rem;">
            <div class="empty-icon text-danger"><i class="fa-solid fa-triangle-exclamation"></i></div>
            <h3 class="mt-3">Unable to Load Images</h3>
            <p class="text-muted mt-2">${escapeHtml(message)}</p>
            <div class="mt-3" style="display: flex; gap: 1rem; justify-content: center;">
                <button class="btn btn-primary" onclick="loadFishData()"><i class="fa-solid fa-rotate-right"></i> Try Again</button>
                <button class="btn btn-outline" onclick="window.location.href='fish-list.html'"><i class="fa-solid fa-arrow-left"></i> Back to My Fish</button>
            </div>
        </div>
    `;
}

function showNotFoundState(message) {
    skeletonLoader.classList.add("hidden");
    mainInterface.classList.add("hidden");
    stateContainer.innerHTML = `
        <div class="card text-center" style="padding: 4rem 2rem;">
            <div class="empty-icon text-warning"><i class="fa-solid fa-circle-exclamation"></i></div>
            <h3 class="mt-3">Fish Listing Not Found</h3>
            <p class="text-muted mt-2">${escapeHtml(message)}</p>
            <div class="mt-3">
                <button class="btn btn-primary" onclick="window.location.href='fish-list.html'"><i class="fa-solid fa-fish"></i> Return to My Fish</button>
            </div>
        </div>
    `;
}

// Utility Helpers
function handleApiError(status) {
    switch (status) {
        case 401: return "Your session has expired. Please sign in again.";
        case 403: return "You do not have permission to manage these images.";
        case 404: return "Fish listing not found.";
        case 413: return "One or more files are too large.";
        case 415: return "This image format is not supported.";
        case 409: return "This image cannot be changed because of a business rule.";
        case 500: return "Something went wrong on the server. Please try again.";
        default: return "Unable to connect to the server. Check your connection.";
    }
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('en-LK', {
        style: 'currency',
        currency: 'LKR'
    }).format(amount);
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
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
    const toastContainer = document.getElementById("toastContainer");
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
// GET FISH:
// GET /api/sellers/me/fish/{fishId}
//
// GET IMAGES:
// GET /api/sellers/me/fish/{fishId}/images
//
// UPLOAD:
// POST /api/sellers/me/fish/{fishId}/images
//
// SET PRIMARY:
// PUT /api/sellers/me/fish/{fishId}/images/{imageId}/primary
//
// DELETE:
// DELETE /api/sellers/me/fish/{fishId}/images/{imageId}
//
// IMPORTANT:
// Backend must verify authenticated seller ownership.
// Frontend must never send sellerId.
// Backend must validate uploaded files.
// Backend must enforce primary-image rules.
// =====================================================