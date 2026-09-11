/**
 * AQUARIUM FISH - ADD NEW FISH CONTROLLER
 * Vanilla JavaScript (ES6+) controller for handling fish creation,
 * image management, dynamic metadata loading, live preview, and validation.
 */

// Global Configuration
const USE_MOCK_DATA = true; // TOGGLE THIS: true for offline preview, false for Spring Boot REST API
const API_BASE_URL = 'http://localhost:8080/api';
const LOW_STOCK_THRESHOLD = 5;
const MAX_IMAGE_SIZE_MB = 5;
const MAX_IMAGES = 8;
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

// State Management
const state = {
    categories: [],
    breeds: [],
    sizes: [],
    colors: [],
    selectedImages: [], // Array of { file, previewUrl, isPrimary, name, size }
    isSubmitting: false,
    isDirty: false,
    sellerProfile: {
        shopName: 'Aqua World Shop',
        email: 'seller@aquaworld.com',
        initials: 'AW'
    }
};

// Mock Reference Data (Fallback for DEMO Mode)
const mockCategories = [
    { id: 1, categoryName: 'Betta Fish' },
    { id: 2, categoryName: 'Goldfish' },
    { id: 3, categoryName: 'Guppy' },
    { id: 4, categoryName: 'Tetra' },
    { id: 5, categoryName: 'Cichlids' },
    { id: 6, categoryName: 'Tropical Fish' },
    { id: 7, categoryName: 'Angelfish' },
    { id: 8, categoryName: 'Discus' },
    { id: 9, categoryName: 'Molly' },
    { id: 10, categoryName: 'Platy' }
];

const mockBreeds = [
    { id: 1, breedName: 'Halfmoon' },
    { id: 2, breedName: 'Crowntail' },
    { id: 3, breedName: 'Veiltail' },
    { id: 4, breedName: 'Fancy Guppy' },
    { id: 5, breedName: 'Neon Tetra' },
    { id: 6, breedName: 'Oranda' },
    { id: 7, breedName: 'Red Turquoise Discus' },
    { id: 8, breedName: 'Electric Blue Ram' }
];

const mockSizes = [
    { id: 1, sizeName: 'Small (1 - 2 inches)' },
    { id: 2, sizeName: 'Medium (2 - 4 inches)' },
    { id: 3, sizeName: 'Large (4+ inches)' }
];

const mockColors = [
    { id: 1, colorName: 'Blue' },
    { id: 2, colorName: 'Red' },
    { id: 3, colorName: 'Yellow' },
    { id: 4, colorName: 'Orange' },
    { id: 5, colorName: 'Black' },
    { id: 6, colorName: 'White' },
    { id: 7, colorName: 'Multicolor / Galaxy' }
];

// Initialize Page Controller
document.addEventListener('DOMContentLoaded', () => {
    initializeAddFish();
});

function initializeAddFish() {
    checkAuthentication();
    setupEventListeners();
    setupNavigationHandlers();
    loadFormOptions();
    setupUnsavedChangesGuard();
}

// Security & Authentication Check
function checkAuthentication() {
    const token = localStorage.getItem('token');
    if (!token && !USE_MOCK_DATA) {
        window.location.href = '../login.html?redirect=seller/add-fish.html';
        return;
    }
    // Update Seller Profile Header Details
    const shopName = localStorage.getItem('sellerShopName') || state.sellerProfile.shopName;
    const initials = getSellerInitials(shopName);

    document.getElementById('sidebarShopName').textContent = shopName;
    document.getElementById('headerShopName').textContent = shopName;
    document.getElementById('sidebarAvatar').textContent = initials;
    document.getElementById('headerAvatar').textContent = initials;
}

// Event Listeners Registration
function setupEventListeners() {
    // Form Inputs & Validation / Live Preview
    const fishNameInput = document.getElementById('fishName');
    const descInput = document.getElementById('description');
    const priceInput = document.getElementById('price');
    const stockInput = document.getElementById('stockQty');
    const categorySelect = document.getElementById('categoryId');
    const breedSelect = document.getElementById('breedId');
    const sizeSelect = document.getElementById('sizeId');
    const colorSelect = document.getElementById('colorId');
    const form = document.getElementById('addFishForm');

    fishNameInput.addEventListener('input', () => { markDirty(); handleFishNameInput(); updateProductPreview(); });
    descInput.addEventListener('input', () => { markDirty(); handleDescriptionInput(); updateProductPreview(); });
    priceInput.addEventListener('input', () => { markDirty(); handlePriceInput(); updateProductPreview(); });
    stockInput.addEventListener('input', () => { markDirty(); handleStockInput(); updateProductPreview(); });

    categorySelect.addEventListener('change', () => { markDirty(); validateCategory(); updateProductPreview(); });
    breedSelect.addEventListener('change', () => { markDirty(); validateBreed(); updateProductPreview(); });
    sizeSelect.addEventListener('change', () => { markDirty(); validateSize(); updateProductPreview(); });
    colorSelect.addEventListener('change', () => { markDirty(); validateColor(); updateProductPreview(); });

    // File Dropzone Listeners
    const dropzone = document.getElementById('dropzoneArea');
    const fileInput = document.getElementById('imageFileInput');

    dropzone.addEventListener('click', () => fileInput.click());
    dropzone.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            fileInput.click();
        }
    });

    fileInput.addEventListener('change', (e) => handleImageSelection(e.target.files));

    ['dragenter', 'dragover'].forEach(eventName => {
        dropzone.addEventListener(eventName, (e) => {
            e.preventDefault();
            e.stopPropagation();
            dropzone.classList.add('dragover');
        }, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        dropzone.addEventListener(eventName, (e) => {
            e.preventDefault();
            e.stopPropagation();
            dropzone.classList.remove('dragover');
        }, false);
    });

    dropzone.addEventListener('drop', (e) => {
        const dt = e.dataTransfer;
        const files = dt.files;
        handleImageSelection(files);
    });

    // Form Submission
    form.addEventListener('submit', handleFormSubmit);

    // Form Cancel
    document.getElementById('cancelBtn').addEventListener('click', handleCancel);

    // Modal Actions
    document.getElementById('modalAddAnotherBtn').addEventListener('click', () => {
        closeSuccessModal();
        resetForm();
    });
}

function setupNavigationHandlers() {
    // Sidebar Mobile Toggle
    const hamburgerBtn = document.getElementById('hamburgerBtn');
    const closeSidebarBtn = document.getElementById('closeSidebarBtn');
    const sidebarOverlay = document.getElementById('sidebarOverlay');
    const sidebar = document.getElementById('sellerSidebar');

    hamburgerBtn.addEventListener('click', () => {
        sidebar.classList.add('show');
        sidebarOverlay.classList.add('show');
    });

    const closeMenu = () => {
        sidebar.classList.remove('show');
        sidebarOverlay.classList.remove('show');
    };

    closeSidebarBtn.addEventListener('click', closeMenu);
    sidebarOverlay.addEventListener('click', closeMenu);

    // Dropdown Toggles
    setupDropdown('notificationBtn', 'notificationMenu');
    setupDropdown('profileDropdownBtn', 'profileMenu');

    // Logout Action
    const logoutHandler = () => {
        if (confirm('Are you sure you want to log out?')) {
            localStorage.removeItem('token');
            window.location.href = '../login.html';
        }
    };

    document.getElementById('sidebarLogoutBtn').addEventListener('click', logoutHandler);
    document.getElementById('headerLogoutBtn').addEventListener('click', logoutHandler);
}

function setupDropdown(buttonId, menuId) {
    const btn = document.getElementById(buttonId);
    const menu = document.getElementById(menuId);

    btn.addEventListener('click', (e) => {
        e.stopPropagation();
        menu.classList.toggle('show');
    });

    document.addEventListener('click', (e) => {
        if (!menu.contains(e.target) && !btn.contains(e.target)) {
            menu.classList.remove('show');
        }
    });
}

function markDirty() {
    state.isDirty = true;
}

// Load Dropdown Form Options
async function loadFormOptions() {
    if (USE_MOCK_DATA) {
        setTimeout(() => {
            state.categories = mockCategories;
            state.breeds = mockBreeds;
            state.sizes = mockSizes;
            state.colors = mockColors;

            renderDropdown('categoryId', state.categories, 'categoryName', 'Select Category');
            renderDropdown('breedId', state.breeds, 'breedName', 'Select Breed');
            renderDropdown('sizeId', state.sizes, 'sizeName', 'Select Size');
            renderDropdown('colorId', state.colors, 'colorName', 'Select Color');
        }, 300);
        return;
    }

    // Real API Endpoints Execution
    const token = localStorage.getItem('token');
    const headers = { 'Authorization': `Bearer ${token}` };

    try {
        const [catRes, breedRes, sizeRes, colorRes] = await Promise.all([
            fetch(`${API_BASE_URL}/categories`, { headers }),
            fetch(`${API_BASE_URL}/breeds`, { headers }),
            fetch(`${API_BASE_URL}/sizes`, { headers }),
            fetch(`${API_BASE_URL}/colors`, { headers })
        ]);

        if (!catRes.ok || !breedRes.ok || !sizeRes.ok || !colorRes.ok) {
            throw new Error('Failed to load required classification options');
        }

        state.categories = await catRes.json();
        state.breeds = await breedRes.json();
        state.sizes = await sizeRes.json();
        state.colors = await colorRes.json();

        renderDropdown('categoryId', state.categories, 'categoryName', 'Select Category');
        renderDropdown('breedId', state.breeds, 'breedName', 'Select Breed');
        renderDropdown('sizeId', state.sizes, 'sizeName', 'Select Size');
        renderDropdown('colorId', state.colors, 'colorName', 'Select Color');

    } catch (err) {
        showToast(err.message || 'Error loading form dropdowns', 'danger');
    }
}

function renderDropdown(elementId, items, displayKey, placeholder) {
    const select = document.getElementById(elementId);
    select.innerHTML = `<option value="" disabled selected>${placeholder}</option>`;

    items.forEach(item => {
        const opt = document.createElement('option');
        opt.value = item.id;
        opt.textContent = item[displayKey];
        select.appendChild(opt);
    });
}

// Inputs Real-Time Validation & Character Handling
function handleFishNameInput() {
    validateFishName();
}

function handleDescriptionInput() {
    const textarea = document.getElementById('description');
    const counter = document.getElementById('charCounter');
    counter.textContent = `${textarea.value.length} / 2000`;
    validateDescription();
}

function handlePriceInput() {
    validatePrice();
}

function handleStockInput() {
    validateStock();
    updateStockPreview();
}

function updateStockPreview() {
    const stockVal = document.getElementById('stockQty').value;
    const badge = document.getElementById('stockStatusIndicator');

    if (stockVal === '' || isNaN(stockVal) || parseInt(stockVal) <= 0) {
        badge.textContent = 'Out of Stock';
        badge.className = 'stock-status-badge badge-out';
    } else if (parseInt(stockVal) <= LOW_STOCK_THRESHOLD) {
        badge.textContent = 'Low Stock';
        badge.className = 'stock-status-badge badge-low';
    } else {
        badge.textContent = 'In Stock';
        badge.className = 'stock-status-badge badge-in';
    }
}

// Image Handling System
function handleImageSelection(files) {
    if (!files || files.length === 0) return;

    if (state.selectedImages.length + files.length > MAX_IMAGES) {
        showToast(`You can only upload a maximum of ${MAX_IMAGES} images.`, 'warning');
        return;
    }

    Array.from(files).forEach(file => {
        if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
            showToast(`Invalid file type: ${file.name}. Only JPEG, PNG & WEBP are accepted.`, 'danger');
            return;
        }

        if (file.size > MAX_IMAGE_SIZE_MB * 1024 * 1024) {
            showToast(`File too large: ${file.name}. Maximum size is ${MAX_IMAGE_SIZE_MB}MB.`, 'danger');
            return;
        }

        const previewUrl = URL.createObjectURL(file);
        const isFirst = state.selectedImages.length === 0;

        state.selectedImages.push({
            file,
            previewUrl,
            isPrimary: isFirst,
            name: file.name,
            size: (file.size / (1024 * 1024)).toFixed(2) + ' MB'
        });
    });

    markDirty();
    renderImagePreviews();
    validateImages();
    updateProductPreview();
}

function renderImagePreviews() {
    const container = document.getElementById('imagePreviewContainer');
    container.innerHTML = '';

    state.selectedImages.forEach((imgObj, index) => {
        const card = document.createElement('div');
        card.className = `image-preview-card ${imgObj.isPrimary ? 'is-primary' : ''}`;

        card.innerHTML = `
            <div class="preview-thumb-wrap">
                <img src="${imgObj.previewUrl}" alt="${escapeHtml(imgObj.name)}">
                ${imgObj.isPrimary ? '<span class="primary-tag-badge">Primary</span>' : ''}
            </div>
            <div class="preview-card-info">
                <p class="preview-filename">${escapeHtml(imgObj.name)}</p>
                <p class="preview-filesize">${imgObj.size}</p>
            </div>
            <div class="preview-card-actions">
                <button type="button" class="btn-icon-action set-primary-btn ${imgObj.isPrimary ? 'active' : ''}" title="Set as primary image" onclick="setPrimaryImage(${index})">
                    <i class="fa-${imgObj.isPrimary ? 'solid' : 'regular'} fa-star"></i> Primary
                </button>
                <button type="button" class="btn-icon-action remove-btn" title="Remove image" onclick="removeImage(${index})">
                    <i class="fa-solid fa-trash-can"></i>
                </button>
            </div>
        `;

        container.appendChild(card);
    });
}

function setPrimaryImage(index) {
    state.selectedImages.forEach((img, i) => {
        img.isPrimary = i === index;
    });
    renderImagePreviews();
    updateProductPreview();
}

function removeImage(index) {
    const removed = state.selectedImages.splice(index, 1)[0];
    if (removed && removed.previewUrl) {
        URL.revokeObjectURL(removed.previewUrl);
    }

    if (removed.isPrimary && state.selectedImages.length > 0) {
        state.selectedImages[0].isPrimary = true;
    }

    renderImagePreviews();
    validateImages();
    updateProductPreview();
}

// Product Preview Realtime Synchronization
function updateProductPreview() {
    const nameVal = document.getElementById('fishName').value.trim();
    const priceVal = parseFloat(document.getElementById('price').value);
    const stockVal = parseInt(document.getElementById('stockQty').value);
    const descVal = document.getElementById('description').value.trim();

    const catSelect = document.getElementById('categoryId');
    const breedSelect = document.getElementById('breedId');
    const sizeSelect = document.getElementById('sizeId');
    const colorSelect = document.getElementById('colorId');

    // Text Updates
    document.getElementById('previewTitleText').textContent = nameVal || 'Your Fish Name Here';
    document.getElementById('previewPriceText').textContent = !isNaN(priceVal) && priceVal > 0
        ? formatCurrency(priceVal)
        : 'LKR 0.00';

    document.getElementById('previewDescText').textContent = descVal || 'Enter a description to see how your listing will appear to buyers in the store search and detail view.';

    // Category Badge
    const categoryText = catSelect.options[catSelect.selectedIndex]?.text || 'Category';
    document.getElementById('previewCategoryBadge').textContent = catSelect.value ? categoryText : 'Category';

    // Breed/Size/Color subtitle
    const breedText = breedSelect.value ? breedSelect.options[breedSelect.selectedIndex].text : 'Breed';
    const sizeText = sizeSelect.value ? sizeSelect.options[sizeSelect.selectedIndex].text : 'Size';
    const colorText = colorSelect.value ? colorSelect.options[colorSelect.selectedIndex].text : 'Color';
    document.getElementById('previewBreedText').textContent = `${breedText} • ${sizeText} • ${colorText}`;

    // Stock Badge Preview
    const previewStockBadge = document.getElementById('previewStockBadge');
    if (!isNaN(stockVal) && stockVal > 0) {
        if (stockVal <= LOW_STOCK_THRESHOLD) {
            previewStockBadge.textContent = `Low Stock (${stockVal})`;
            previewStockBadge.className = 'preview-stock-badge badge-low';
        } else {
            previewStockBadge.textContent = `In Stock (${stockVal})`;
            previewStockBadge.className = 'preview-stock-badge badge-in';
        }
    } else {
        previewStockBadge.textContent = 'Out of Stock';
        previewStockBadge.className = 'preview-stock-badge badge-out';
    }

    // Image Preview Update
    const holder = document.getElementById('previewImageHolder');
    const primaryImg = state.selectedImages.find(img => img.isPrimary) || state.selectedImages[0];

    if (primaryImg) {
        holder.innerHTML = `
            <img src="${primaryImg.previewUrl}" alt="Preview">
            <span class="preview-category-tag" id="previewCategoryBadge">${escapeHtml(document.getElementById('previewCategoryBadge').textContent)}</span>
        `;
    } else {
        holder.innerHTML = `
            <i class="fa-solid fa-fish preview-fallback-icon"></i>
            <span class="preview-category-tag" id="previewCategoryBadge">${escapeHtml(document.getElementById('previewCategoryBadge').textContent)}</span>
        `;
    }
}

// Field-level Validation Rules
function validateFishName() {
    const input = document.getElementById('fishName');
    const err = document.getElementById('fishNameError');
    const val = input.value.trim();

    if (val.length < 2 || val.length > 100) {
        showFieldError(input, err);
        return false;
    }
    clearFieldError(input, err);
    return true;
}

function validateDescription() {
    const input = document.getElementById('description');
    const err = document.getElementById('descriptionError');
    const val = input.value.trim();

    if (val.length < 10 || val.length > 2000) {
        showFieldError(input, err);
        return false;
    }
    clearFieldError(input, err);
    return true;
}

function validateCategory() {
    const select = document.getElementById('categoryId');
    const err = document.getElementById('categoryIdError');
    if (!select.value) { showFieldError(select, err); return false; }
    clearFieldError(select, err); return true;
}

function validateBreed() {
    const select = document.getElementById('breedId');
    const err = document.getElementById('breedIdError');
    if (!select.value) { showFieldError(select, err); return false; }
    clearFieldError(select, err); return true;
}

function validateSize() {
    const select = document.getElementById('sizeId');
    const err = document.getElementById('sizeIdError');
    if (!select.value) { showFieldError(select, err); return false; }
    clearFieldError(select, err); return true;
}

function validateColor() {
    const select = document.getElementById('colorId');
    const err = document.getElementById('colorIdError');
    if (!select.value) { showFieldError(select, err); return false; }
    clearFieldError(select, err); return true;
}

function validatePrice() {
    const input = document.getElementById('price');
    const err = document.getElementById('priceError');
    const val = parseFloat(input.value);

    if (isNaN(val) || val <= 0) {
        showFieldError(input, err);
        return false;
    }
    clearFieldError(input, err);
    return true;
}

function validateStock() {
    const input = document.getElementById('stockQty');
    const err = document.getElementById('stockQtyError');
    const val = parseInt(input.value);

    if (isNaN(val) || val < 0) {
        showFieldError(input, err);
        return false;
    }
    clearFieldError(input, err);
    return true;
}

function validateImages() {
    const err = document.getElementById('imagesError');
    if (state.selectedImages.length === 0) {
        err.style.display = 'block';
        return false;
    }
    err.style.display = 'none';
    return true;
}

function showFieldError(element, errorElement) {
    element.classList.add('is-invalid');
    if (errorElement) errorElement.style.display = 'block';
}

function clearFieldError(element, errorElement) {
    element.classList.remove('is-invalid');
    if (errorElement) errorElement.style.display = 'none';
}

function validateForm() {
    const isValidName = validateFishName();
    const isValidCategory = validateCategory();
    const isValidBreed = validateBreed();
    const isValidSize = validateSize();
    const isValidColor = validateColor();
    const isValidPrice = validatePrice();
    const isValidStock = validateStock();
    const isValidDesc = validateDescription();
    const isValidImg = validateImages();

    return isValidName && isValidCategory && isValidBreed && isValidSize &&
        isValidColor && isValidPrice && isValidStock && isValidDesc && isValidImg;
}

// Form Submission Execution
async function handleFormSubmit(e) {
    e.preventDefault();

    if (!validateForm()) {
        showToast('Please correct the highlighted errors before submitting.', 'warning');
        return;
    }

    if (state.isSubmitting) return;

    setSubmittingState(true);

    const payload = {
        fishName: document.getElementById('fishName').value.trim(),
        description: document.getElementById('description').value.trim(),
        price: parseFloat(document.getElementById('price').value),
        stockQty: parseInt(document.getElementById('stockQty').value),
        categoryId: parseInt(document.getElementById('categoryId').value),
        breedId: parseInt(document.getElementById('breedId').value),
        sizeId: parseInt(document.getElementById('sizeId').value),
        colorId: parseInt(document.getElementById('colorId').value)
    };

    if (USE_MOCK_DATA) {
        // Mock API Response Simulation
        setTimeout(() => {
            const fakeFishId = Math.floor(100 + Math.random() * 900);
            handleCreateSuccess({ id: fakeFishId, ...payload });
        }, 1200);
        return;
    }

    // TODO: Switch to actual Spring Boot API calls
    try {
        const token = localStorage.getItem('token');

        // Step 1: Create Fish Entity
        // NOTE: Uses seller context from JWT token (POST /api/sellers/me/fish)
        const createResponse = await fetch(`${API_BASE_URL}/sellers/me/fish`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(payload)
        });

        if (!createResponse.ok) {
            const errorData = await createResponse.json().catch(() => ({}));
            throw new Error(errorData.message || `Server error (${createResponse.status})`);
        }

        const createdFish = await createResponse.json();

        // Step 2: Upload Fish Images if present
        if (state.selectedImages.length > 0 && createdFish.id) {
            const formData = new FormData();
            const primaryIndex = state.selectedImages.findIndex(img => img.isPrimary);

            state.selectedImages.forEach(imgObj => {
                formData.append('images', imgObj.file);
            });
            formData.append('primaryImageIndex', primaryIndex >= 0 ? primaryIndex : 0);

            const uploadResponse = await fetch(`${API_BASE_URL}/fish/${createdFish.id}/images`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            if (!uploadResponse.ok) {
                showToast('Fish created, but failed to upload images.', 'warning');
            }
        }

        handleCreateSuccess(createdFish);

    } catch (err) {
        handleCreateError(err);
    } finally {
        setSubmittingState(false);
    }
}

function setSubmittingState(isSubmitting) {
    state.isSubmitting = isSubmitting;
    const submitBtn = document.getElementById('submitBtn');
    const submitBtnText = document.getElementById('submitBtnText');

    if (isSubmitting) {
        submitBtn.disabled = true;
        submitBtnText.textContent = 'Creating Fish...';
    } else {
        submitBtn.disabled = false;
        submitBtnText.textContent = 'Create Fish Listing';
    }
}

function handleCreateSuccess(fish) {
    state.isDirty = false;
    setSubmittingState(false);

    // Dynamic Modal Actions Configuration
    const manageImagesBtn = document.getElementById('modalManageImagesBtn');
    if (fish && fish.id) {
        manageImagesBtn.href = `fish-images.html?id=${fish.id}`;
        manageImagesBtn.style.display = 'inline-flex';
    } else {
        manageImagesBtn.style.display = 'none';
    }

    openSuccessModal();
}

function handleCreateError(error) {
    setSubmittingState(false);
    showToast(error.message || 'Unable to create fish listing. Please check input values.', 'danger');
}

// Reset Form State
function resetForm() {
    document.getElementById('addFishForm').reset();

    // Clear Image Previews
    state.selectedImages.forEach(img => {
        if (img.previewUrl) URL.revokeObjectURL(img.previewUrl);
    });
    state.selectedImages = [];
    renderImagePreviews();

    // Reset UI Counters & Previews
    document.getElementById('charCounter').textContent = '0 / 2000';
    document.querySelectorAll('.is-invalid').forEach(el => el.classList.remove('is-invalid'));
    document.querySelectorAll('.field-error').forEach(el => el.style.display = 'none');

    state.isDirty = false;
    updateStockPreview();
    updateProductPreview();
}

function handleCancel() {
    if (state.isDirty) {
        if (confirm('You have unsaved changes. Are you sure you want to cancel and leave?')) {
            window.location.href = 'fish-list.html';
        }
    } else {
        window.location.href = 'fish-list.html';
    }
}

// Unsaved Changes Protection
function setupUnsavedChangesGuard() {
    window.addEventListener('beforeunload', (e) => {
        if (state.isDirty && !state.isSubmitting) {
            e.preventDefault();
            e.returnValue = '';
        }
    });
}

// Modal Control
function openSuccessModal() {
    document.getElementById('successModal').classList.add('show');
}

function closeSuccessModal() {
    document.getElementById('successModal').classList.remove('show');
}

// Toast System
function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    let iconClass = 'fa-circle-info';
    if (type === 'success') iconClass = 'fa-circle-check';
    if (type === 'danger') iconClass = 'fa-circle-xmark';
    if (type === 'warning') iconClass = 'fa-triangle-exclamation';

    toast.innerHTML = `
        <i class="fa-solid ${iconClass}"></i>
        <span>${escapeHtml(message)}</span>
    `;

    container.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(10px)';
        toast.style.transition = 'all 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}

// Utility Functions
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-LK', {
        style: 'currency',
        currency: 'LKR',
        minimumFractionDigits: 2
    }).format(amount);
}

function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>"']/g, (m) => {
        return {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        }[m];
    });
}

function getSellerInitials(name) {
    if (!name) return 'AF';
    const words = name.trim().split(' ');
    if (words.length >= 2) {
        return (words[0][0] + words[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
}