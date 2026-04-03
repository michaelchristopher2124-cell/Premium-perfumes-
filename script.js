// SheetDB API Configuration
const SHEETDB_API = 'https://sheetdb.io/api/v1/eizek3qs2z56o';

// Global products array
let allProducts = [];

// Load featured products for homepage
async function loadFeaturedProducts() {
  const container = document.getElementById('featured-products');
  if (!container) return;
  
  try {
    const response = await fetch(SHEETDB_API);
    const products = await response.json();
    allProducts = products;
    
    const featured = products.slice(0, 6);
    
    if (featured.length === 0) {
      container.innerHTML = '<div class="empty-state">No products yet. Add products to your SheetDB to see them here!</div>';
      return;
    }
    
    container.innerHTML = featured.map(product => createProductCard(product)).join('');
    attachImageZoomListeners();
  } catch (error) {
    console.error('Error loading products:', error);
    container.innerHTML = '<div class="empty-state">Unable to load products. Please check your SheetDB connection.</div>';
  }
}

// Load all products for shop page
async function loadAllProducts() {
  const container = document.getElementById('productsGrid');
  if (!container) return;
  
  try {
    const response = await fetch(SHEETDB_API);
    const products = await response.json();
    allProducts = products;
    
    if (products.length === 0) {
      container.innerHTML = '<div class="empty-state">No products yet. Add products to your SheetDB to see them here!</div>';
      return;
    }
    
    renderProductsByCategory(products);
    attachImageZoomListeners();
  } catch (error) {
    console.error('Error loading products:', error);
    container.innerHTML = '<div class="empty-state">Unable to load products. Please check your SheetDB connection.</div>';
  }
}

// Create product card HTML
function createProductCard(product) {
  const imageUrl = product.image_url || 'https://images.pexels.com/photos/965989/pexels-photo-965989.jpeg?auto=compress&cs=tinysrgb&w=400&h=260&fit=crop';
  const badge = product.bestseller ? '<span class="product-badge">Bestseller</span>' : '';
  const price = parseInt(product.price) || 0;
  
  return `
    <div class="product-card" data-category="${product.category || ''}">
      <div class="product-img" data-image="${imageUrl}">
        <img src="${imageUrl}" alt="${product.name}" class="zoomable-img">
        ${badge}
      </div>
      <div class="product-info">
        <div class="product-brand">${product.brand || 'Nee Scent'}</div>
        <div class="product-name">${product.name || 'Product Name'}</div>
        <div class="product-desc">${product.description || 'Premium quality fragrance'}</div>
        <div class="product-meta">
          <div class="product-price">₦${price.toLocaleString()}</div>
          <div class="product-size">${product.size || '100ml'}</div>
        </div>
        <a href="https://wa.me/2349077712126?text=Hi Nee Scent! I want to order: ${encodeURIComponent(product.name)} for ₦${price}. Please confirm availability." class="product-btn">Order on WhatsApp</a>
      </div>
    </div>
  `;
}

// Render products with category filtering
function renderProductsByCategory(products) {
  const container = document.getElementById('productsGrid');
  if (!container) return;
  
  // Group products by category
  const categorized = {};
  products.forEach(product => {
    const cat = product.category || 'uncategorized';
    if (!categorized[cat]) categorized[cat] = [];
    categorized[cat].push(product);
  });
  
  let html = '';
  for (const [category, categoryProducts] of Object.entries(categorized)) {
    html += `<div class="category-section" data-category="${category}">`;
    html += `<h3 class="category-title">${category.replace(/-/g, ' ').toUpperCase()}</h3>`;
    html += `<div class="products-subgrid">`;
    categoryProducts.forEach(product => {
      html += createProductCard(product);
    });
    html += `</div></div>`;
  }
  
  container.innerHTML = html;
}

// Filter products by category
function filterProducts(category) {
  const allProducts = document.querySelectorAll('.product-card');
  const categorySections = document.querySelectorAll('.category-section');
  
  if (category === 'all') {
    categorySections.forEach(section => section.style.display = 'block');
    allProducts.forEach(product => product.style.display = 'block');
  } else {
    categorySections.forEach(section => {
      if (section.dataset.category === category) {
        section.style.display = 'block';
      } else {
        section.style.display = 'none';
      }
    });
  }
}

// Setup filter buttons
function setupFilters() {
  const filterButtons = document.querySelectorAll('.filter-btn');
  if (!filterButtons.length) return;
  
  filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      filterButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const category = btn.dataset.cat;
      filterProducts(category);
    });
  });
}

// Image zoom functionality
function attachImageZoomListeners() {
  const zoomableImages = document.querySelectorAll('.zoomable-img');
  
  zoomableImages.forEach(img => {
    img.addEventListener('click', (e) => {
      e.stopPropagation();
      const modal = document.createElement('div');
      modal.className = 'modal';
      modal.innerHTML = `<img src="${img.src}" alt="Zoomed Product Image">`;
      document.body.appendChild(modal);
      modal.classList.add('active');
      
      modal.addEventListener('click', () => {
        modal.classList.remove('active');
        setTimeout(() => modal.remove(), 300);
      });
    });
  });
}

// Parse URL parameters for category filter on shop page
function getUrlParam(param) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(param);
}

// Apply category filter from URL
function applyUrlFilter() {
  const catParam = getUrlParam('cat');
  if (catParam) {
    const filterBtn = document.querySelector(`.filter-btn[data-cat="${catParam}"]`);
    if (filterBtn) {
      filterBtn.click();
    }
  }
}

// Initialize based on page
document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('featured-products')) {
    loadFeaturedProducts();
  }
  if (document.getElementById('productsGrid')) {
    loadAllProducts();
    applyUrlFilter();
  }
});

// Contact form handler (if on contact page)
const contactForm = document.getElementById('contactForm');
if (contactForm) {
  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = contactForm.querySelector('input[placeholder="Your Name"]').value;
    const phone = contactForm.querySelector('input[placeholder="Phone Number"]').value;
    const message = contactForm.querySelector('textarea').value;
    const whatsappMsg = `*Nee Scent Inquiry*%0A%0A*Name:* ${name}%0A*Phone:* ${phone}%0A%0A*Message:* ${message}`;
    window.open(`https://wa.me/2349077712126?text=${encodeURIComponent(whatsappMsg)}`, '_blank');
  });
}
