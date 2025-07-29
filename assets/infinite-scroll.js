/**
 * Infinite Scroll for Collection Pages
 * Implements lazy loading with scroll detection
 */

class InfiniteScroll {
  constructor() {
    this.currentPage = 1;
    this.totalPages = 1;
    this.isLoading = false;
    this.container = document.querySelector('#product-grid');
    this.loadingSpinner = document.querySelector('.loading-spinner');
    this.loadMoreTrigger = document.querySelector('.load-more-trigger');
    this.paginationArea = document.querySelector('.paginatoin-area');
    
    this.init();
  }

  init() {
    if (!this.container || !this.loadMoreTrigger) {
      return;
    }

    // Get pagination info from existing pagination
    this.extractPaginationInfo();
    
    // Set up intersection observer for scroll detection
    this.setupIntersectionObserver();
    
    // Hide traditional pagination
    if (this.paginationArea) {
      this.paginationArea.style.display = 'none';
    }
  }

  extractPaginationInfo() {
    const paginationLinks = document.querySelectorAll('.pagination-box a');
    const currentPageElement = document.querySelector('.pagination-box .active a');
    
    if (currentPageElement) {
      this.currentPage = parseInt(currentPageElement.textContent) || 1;
    }
    
    // Find the highest page number
    paginationLinks.forEach(link => {
      const pageNum = parseInt(link.textContent);
      if (pageNum && pageNum > this.totalPages) {
        this.totalPages = pageNum;
      }
    });
    
    // If no pagination found, check for next link
    const nextLink = document.querySelector('.pagination-box .next a');
    if (nextLink && this.totalPages <= this.currentPage) {
      this.totalPages = this.currentPage + 1;
    }
  }

  setupIntersectionObserver() {
    const options = {
      root: null,
      rootMargin: '100px',
      threshold: 0.1
    };

    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !this.isLoading && this.hasMorePages()) {
          this.loadMoreProducts();
        }
      });
    }, options);

    this.observer.observe(this.loadMoreTrigger);
  }

  hasMorePages() {
    return this.currentPage < this.totalPages;
  }

  async loadMoreProducts() {
    if (this.isLoading || !this.hasMorePages()) {
      return;
    }

    this.isLoading = true;
    this.showLoadingSpinner();

    try {
      const nextPage = this.currentPage + 1;
      const url = this.buildNextPageUrl(nextPage);
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      
      const html = await response.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      
      const newProducts = doc.querySelectorAll('#product-grid .st-col-item');
      
      if (newProducts.length > 0) {
        this.appendProducts(newProducts);
        this.currentPage = nextPage;
        
        // Update URL without page reload
        this.updateUrl(url);
        
        // Trigger any product-related scripts
        this.triggerProductScripts();
      }
      
    } catch (error) {
      console.error('Error loading more products:', error);
      this.showErrorMessage();
    } finally {
      this.isLoading = false;
      this.hideLoadingSpinner();
    }
  }

  buildNextPageUrl(page) {
    const url = new URL(window.location);
    url.searchParams.set('page', page);
    return url.toString();
  }

  appendProducts(products) {
    const fragment = document.createDocumentFragment();
    
    products.forEach(product => {
      const clonedProduct = product.cloneNode(true);
      fragment.appendChild(clonedProduct);
    });
    
    this.container.appendChild(fragment);
  }

  updateUrl(url) {
    if (history.pushState) {
      history.pushState(null, null, url);
    }
  }

  triggerProductScripts() {
    // Trigger wishlist functionality for new products
    if (typeof initWishlist === 'function') {
      initWishlist();
    }
    
    // Trigger tooltip initialization
    if (typeof $ !== 'undefined' && $.fn.tooltip) {
      $('[data-bs-toggle="tooltip"]').tooltip();
    }
    
    // Trigger any other product-related scripts
    document.dispatchEvent(new CustomEvent('productsLoaded'));
  }

  showLoadingSpinner() {
    if (this.loadingSpinner) {
      this.loadingSpinner.style.display = 'block';
    }
  }

  hideLoadingSpinner() {
    if (this.loadingSpinner) {
      this.loadingSpinner.style.display = 'none';
    }
  }

  showErrorMessage() {
    if (this.loadingSpinner) {
      this.loadingSpinner.innerHTML = `
        <div style="text-align: center; padding: 20px; color: #dc3545;">
          <p>Error al cargar más productos. <a href="javascript:void(0)" onclick="location.reload()">Intentar de nuevo</a></p>
        </div>
      `;
      this.loadingSpinner.style.display = 'block';
    }
  }

  destroy() {
    if (this.observer) {
      this.observer.disconnect();
    }
  }
}

// Initialize infinite scroll when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  // Only initialize on collection pages
  if (document.querySelector('#product-grid') && document.querySelector('.load-more-trigger')) {
    window.infiniteScroll = new InfiniteScroll();
  }
});

// Handle browser back/forward buttons
window.addEventListener('popstate', function() {
  location.reload();
});