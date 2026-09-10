/**
 * AQUARIUM FISH E-COMMERCE - FRONTEND SCRIPT
 * Compatible with Spring Boot + JPA Backend REST API
 */

document.addEventListener('DOMContentLoaded', () => {
    // Initialize UI features
    initMobileMenu();
    initSearchToggle();
    initScrollHeader();
    setCurrentYear();

    // Render Mock Data / Prepare API Call Hooks
    fetchCategories();
    fetchFeaturedFish();
    fetchCustomerReviews();
});

/* ==========================================================================
   STATE MANAGEMENT & MOCK DATA
   ========================================================================== */
let cartItemCount = 0;

// Mock Categories (Matching Backend Entity: Fish_Category)
const MOCK_CATEGORIES = [
    {
        id: 1,
        name: 'Betta Fish',
        description: 'Vibrant, stunning labyrinth fish with majestic flowing fins and bold personalities.',
        imageUrl: 'https://images.unsplash.com/photo-1534567153574-2b12153a87f0?auto=format&fit=crop&w=600&q=80'
    },
    {
        id: 2,
        name: 'Goldfish',
        description: 'Classic coldwater companions in beautiful variations including Fancy, Oranda & Ryukin.',
        imageUrl: 'https://images.unsplash.com/photo-1524704796725-9fc80448e2b2?auto=format&fit=crop&w=600&q=80'
    },
    {
        id: 3,
        name: 'Guppy & Livebearers',
        description: 'Hardy, colorful community fish ideal for beginners and aquascaping tanks.',
        imageUrl: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=600&q=80'
    },
    {
        id: 4,
        name: 'Tetra & Characins',
        description: 'Peaceful schooling fish like Neon, Cardinal, and Ember Tetras that light up tanks.',
        imageUrl: 'https://images.unsplash.com/photo-1522069169874-c58ec4b76be5?auto=format&fit=crop&w=600&q=80'
    },
    {
        id: 5,
        name: 'Cichlids',
        description: 'Intelligent species with unique social behaviors from Lake Malawi & South America.',
        imageUrl: 'https://images.unsplash.com/photo-1535591273668-578e31182c4f?auto=format&fit=crop&w=600&q=80'
    },
    {
        id: 6,
        name: 'Tropical & Angelfish',
        description: 'Graceful centerpieces including Discus, Gouramis, and Freshwater Angelfish.',
        imageUrl: 'https://images.unsplash.com/photo-1516683011827-46882223f3fb?auto=format&fit=crop&w=600&q=80'
    }
];

// Mock Fish Data (Matching Backend Entities: Fish, Fish_Breed, Fish_Size, Fish_Color, Fish_Image)
const MOCK_FISH = [
    {
        id: 101,
        name: 'Royal Blue Halfmoon Betta',
        category: 'Betta',
        breed: 'Halfmoon',
        price: 24.99,
        rating: 4.9,
        stock: 8,
        description: 'Striking cobalt blue male Betta with full 180-degree tail spread.',
        imageUrl: 'https://images.unsplash.com/photo-1534567153574-2b12153a87f0?auto=format&fit=crop&w=600&q=80'
    },
    {
        id: 102,
        name: 'Neon Tetra School (Pack of 6)',
        category: 'Tetra',
        breed: 'Neon',
        price: 14.50,
        rating: 4.8,
        stock: 25,
        description: 'Electric blue and red schooling fish. Perfect for planted freshwater setups.',
        imageUrl: 'https://images.unsplash.com/photo-1522069169874-c58ec4b76be5?auto=format&fit=crop&w=600&q=80'
    },
    {
        id: 103,
        name: 'Red Cap Oranda Goldfish',
        category: 'Goldfish',
        breed: 'Oranda',
        price: 32.00,
        rating: 4.7,
        stock: 4,
        description: 'Distinguished silver body with vibrant cherry red head crown.',
        imageUrl: 'https://images.unsplash.com/photo-1524704796725-9fc80448e2b2?auto=format&fit=crop&w=600&q=80'
    },
    {
        id: 104,
        name: 'Electric Blue Peacock Cichlid',
        category: 'Cichlid',
        breed: 'Peacock',
        price: 28.75,
        rating: 5.0,
        stock: 12,
        description: 'Vibrant iridescent blue Lake Malawi specimen known for active behavior.',
        imageUrl: 'https://images.unsplash.com/photo-1535591273668-578e31182c4f?auto=format&fit=crop&w=600&q=80'
    },
    {
        id: 105,
        name: 'Silver Zebra Angelfish',
        category: 'Tropical',
        breed: 'Angelfish',
        price: 18.99,
        rating: 4.6,
        stock: 15,
        description: 'Tall, elegant fins with dark zebra stripes. Majestic community centerpiece.',
        imageUrl: 'https://images.unsplash.com/photo-1516683011827-46882223f3fb?auto=format&fit=crop&w=600&q=80'
    },
    {
        id: 106,
        name: 'Fire Red Dragon King Cobra Guppy',
        category: 'Guppy',
        breed: 'Cobra Guppy',
        price: 12.99,
        rating: 4.9,
        stock: 18,
        description: 'Exquisite metallic cobra pattern with a sweeping fiery red caudal fin.',
        imageUrl: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=600&q=80'
    }
];

// Mock Reviews (Matching Backend Entity: Review)
const MOCK_REVIEWS = [
    {
        id: 1,
        name: 'Marcus Vance',
        role: 'Aquascaping Enthusiast',
        rating: 5,
        comment: 'The Blue Betta arrived in pristine condition! Water temperature was maintained perfectly during transit. Will definitely buy again.',
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'
    },
    {
        id: 2,
        name: 'Sarah Jenkins',
        role: 'Verified Customer',
        rating: 5,
        comment: 'Ordered a school of 12 Neon Tetras. All arrived healthy and acclimated within hours. Excellent health guarantee policy.',
        avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80'
    },
    {
        id: 3,
        name: 'David Chen',
        role: 'Cichlid Breeder',
        rating: 5,
        comment: 'Expert packaging and superb customer support! They gave detailed advice regarding water pH parameters for my new Peacock Cichlids.',
        avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80'
    }
];

/* ==========================================================================
   SPRING BOOT REST API INTEGRATION LAYER
   ========================================================================== */

/**
 * Fetch & Render Categories
 */
async function fetchCategories() {
    /*
      TODO: Spring Boot REST API Endpoint Integration
      --------------------------------------------------
      try {
        const response = await fetch('/api/categories');
        const categories = await response.json();
        renderCategories(categories);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    */

    // Using Mock Data
    renderCategories(MOCK_CATEGORIES);
}

function renderCategories(categories) {
    const container = document.getElementById('category-grid');
    if (!container) return;

    container.innerHTML = categories.map(cat => `
    <article class="category-card">
      <div class="category-img-box">
        <img src="${cat.imageUrl}" alt="${cat.name}" class="category-img" loading="lazy">
      </div>
      <div class="category-body">
        <h3 class="category-title">${cat.name}</h3>
        <p class="category-text">${cat.description}</p>
        <a href="#fish" onclick="filterFishByCategory('${cat.name}')" class="category-link">
          Explore Species <i class="fa-solid fa-arrow-right"></i>
        </a>
      </div>
    </article>
  `).join('');
}

/**
 * Fetch & Render Featured Fish Products
 */
async function fetchFeaturedFish() {
    /*
      TODO: Spring Boot REST API Endpoint Integration
      --------------------------------------------------
      try {
        const response = await fetch('/api/fish');
        const fishList = await response.json();
        renderFishProducts(fishList);
      } catch (error) {
        console.error('Error fetching fish catalog:', error);
      }
    */

    // Using Mock Data
    renderFishProducts(MOCK_FISH);
    initFilterButtons();
}

function renderFishProducts(fishList) {
    const container = document.getElementById('fish-grid');
    if (!container) return;

    if (fishList.length === 0) {
        container.innerHTML = `<p class="no-products">No aquatic species match your selection.</p>`;
        return;
    }

    container.innerHTML = fishList.map(fish => `
    <article class="fish-card" data-id="${fish.id}">
      <div class="fish-image-wrapper">
        <button class="wishlist-btn" onclick="toggleWishlist(this)" aria-label="Add ${fish.name} to wishlist">
          <i class="fa-regular fa-heart"></i>
        </button>
        <img src="${fish.imageUrl}" alt="${fish.name}" class="fish-img" loading="lazy">
        <span class="stock-tag ${fish.stock < 5 ? 'low-stock' : 'in-stock'}">
          ${fish.stock < 5 ? `Low Stock (${fish.stock})` : 'In Stock'}
        </span>
      </div>

      <div class="fish-card-body">
        <div class="fish-meta">
          <span class="fish-category">${fish.category}</span>
          <div class="fish-rating">
            <i class="fa-solid fa-star"></i>
            <span>${fish.rating.toFixed(1)}</span>
          </div>
        </div>

        <h3 class="fish-title">${fish.name}</h3>
        <p class="fish-description">${fish.description}</p>

        <div class="fish-card-footer">
          <span class="fish-price">$${fish.price.toFixed(2)}</span>
          <div class="fish-actions">
            <button class="btn btn-primary btn-sm" onclick="addToCart(${fish.id}, '${fish.name}')">
              <i class="fa-solid fa-cart-plus"></i> Add
            </button>
          </div>
        </div>
      </div>
    </article>
  `).join('');
}

/**
 * Fetch & Render Reviews
 */
async function fetchCustomerReviews() {
    /*
      TODO: Spring Boot REST API Endpoint Integration
      --------------------------------------------------
      try {
        const response = await fetch('/api/reviews');
        const reviews = await response.json();
        renderReviews(reviews);
      } catch (error) {
        console.error('Error fetching reviews:', error);
      }
    */

    renderReviews(MOCK_REVIEWS);
}

function renderReviews(reviews) {
    const container = document.getElementById('reviews-grid');
    if (!container) return;

    container.innerHTML = reviews.map(rev => `
    <div class="review-card">
      <div>
        <div class="review-stars">
          ${Array(rev.rating).fill('<i class="fa-solid fa-star"></i>').join('')}
        </div>
        <p class="review-comment">"${rev.comment}"</p>
      </div>
      <div class="review-user">
        <img src="${rev.avatarUrl}" alt="${rev.name}" class="user-avatar" loading="lazy">
        <div>
          <h4 class="user-name">${rev.name}</h4>
          <span class="user-role">${rev.role}</span>
        </div>
      </div>
    </div>
  `).join('');
}

/* ==========================================================================
   INTERACTIVE USER CONTROLS & EVENT HANDLERS
   ========================================================================== */

/**
 * Add Fish To Cart
 * Ready for Spring Boot Endpoint: POST /api/cart/items
 */
async function addToCart(fishId, fishName) {
    cartItemCount++;
    const cartBadge = document.getElementById('cart-badge');
    if (cartBadge) {
        cartBadge.textContent = cartItemCount;
    }

    showToast(`Added "${fishName}" to your shopping cart!`);

    /*
      TODO: Spring Boot Backend Sync
      --------------------------------------------------
      const payload = { fishId: fishId, quantity: 1 };
      try {
        await fetch('/api/cart/items', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      } catch (err) {
        console.error('Cart sync error:', err);
      }
    */
}

/**
 * Wishlist Heart Toggle
 */
function toggleWishlist(btn) {
    btn.classList.toggle('active');
    const icon = btn.querySelector('i');

    if (btn.classList.contains('active')) {
        icon.classList.remove('fa-regular');
        icon.classList.add('fa-solid');
        showToast('Saved to your wishlist!');
    } else {
        icon.classList.remove('fa-solid');
        icon.classList.add('fa-regular');
        showToast('Removed from wishlist.');
    }
}

/**
 * Filter Fish UI
 */
function initFilterButtons() {
    const filterBtns = document.querySelectorAll('.pill-btn');
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const filterValue = btn.getAttribute('data-filter');
            if (filterValue === 'all') {
                renderFishProducts(MOCK_FISH);
            } else {
                const filtered = MOCK_FISH.filter(f => f.category.toLowerCase().includes(filterValue.toLowerCase()));
                renderFishProducts(filtered);
            }
        });
    });
}

function filterFishByCategory(categoryName) {
    const keyword = categoryName.split(' ')[0];
    const filterBtns = document.querySelectorAll('.pill-btn');

    filterBtns.forEach(b => {
        if (b.getAttribute('data-filter').toLowerCase() === keyword.toLowerCase()) {
            b.click();
        }
    });
}

/* ==========================================================================
   UI UTILITY FUNCTIONS
   ========================================================================== */

function initMobileMenu() {
    const hamburgerBtn = document.getElementById('hamburger-btn');
    const navMenu = document.getElementById('nav-menu');

    if (hamburgerBtn && navMenu) {
        hamburgerBtn.addEventListener('click', () => {
            const expanded = hamburgerBtn.getAttribute('aria-expanded') === 'true' || false;
            hamburgerBtn.setAttribute('aria-expanded', !expanded);
            navMenu.classList.toggle('active');
        });

        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!navMenu.contains(e.target) && !hamburgerBtn.contains(e.target) && navMenu.classList.contains('active')) {
                navMenu.classList.remove('active');
                hamburgerBtn.setAttribute('aria-expanded', 'false');
            }
        });
    }
}

function initSearchToggle() {
    const searchWrapper = document.getElementById('search-wrapper');
    const searchBtn = document.getElementById('search-btn');
    const searchInput = document.getElementById('search-input');

    if (searchBtn && searchWrapper) {
        searchBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (!searchWrapper.classList.contains('active')) {
                searchWrapper.classList.add('active');
                searchInput.focus();
            } else if (searchInput.value.trim() !== '') {
                const query = searchInput.value.trim().toLowerCase();
                const filtered = MOCK_FISH.filter(f =>
                    f.name.toLowerCase().includes(query) ||
                    f.category.toLowerCase().includes(query) ||
                    f.description.toLowerCase().includes(query)
                );
                renderFishProducts(filtered);
                showToast(`Found ${filtered.length} matching result(s).`);
            } else {
                searchWrapper.classList.remove('active');
            }
        });
    }
}

function initScrollHeader() {
    const navbar = document.getElementById('navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 40) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });
}

function showToast(message) {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `<i class="fa-solid fa-circle-check"></i> <span>${message}</span>`;

    container.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100%)';
        toast.style.transition = 'all 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

function setCurrentYear() {
    const yearElement = document.getElementById('current-year');
    if (yearElement) {
        yearElement.textContent = new Date().getFullYear();
    }
}