/**
 * Infinite Scroll for Collection Pages
 * Implements lazy loading with scroll detection
 */

class InfiniteScroll {
  constructor() {
    console.log('InfiniteScroll constructor called');
    this.currentPage = 1;
    this.totalPages = 1;
    this.isLoading = false;
    this.container = document.querySelector('#product-grid');
    this.loadingSpinner = document.querySelector('.loading-spinner');
    this.loadMoreTrigger = document.querySelector('.load-more-trigger');
    this.paginationArea = document.querySelector('.pagination-area, .paginatoin-area');
    
    console.log('Elements found:', {
      container: !!this.container,
      loadingSpinner: !!this.loadingSpinner,
      loadMoreTrigger: !!this.loadMoreTrigger,
      paginationArea: !!this.paginationArea
    });
    
    this.init();
  }

  init() {
    console.log('InfiniteScroll init() called');
    
    if (!this.container || !this.loadMoreTrigger) {
      console.log('Missing required elements, aborting init');
      return;
    }

    // Get pagination info from existing pagination
    this.extractPaginationInfo();
    
    console.log('Pagination info:', {
      currentPage: this.currentPage,
      totalPages: this.totalPages,
      hasMorePages: this.hasMorePages()
    });
    
    // Set up intersection observer for scroll detection
    this.setupIntersectionObserver();
    
    // Hide traditional pagination
    if (this.paginationArea) {
      this.paginationArea.style.display = 'none';
      console.log('Traditional pagination hidden');
    }
    
    console.log('InfiniteScroll initialization complete');
  }

  extractPaginationInfo() {
    console.log('Extracting pagination info...');
    
    const paginationLinks = document.querySelectorAll('.pagination-box li.number a');
    const currentPageElement = document.querySelector('.pagination-box li.active a');
    
    console.log('Found pagination links:', paginationLinks.length);
    console.log('Current page element:', currentPageElement);
    
    if (currentPageElement) {
      this.currentPage = parseInt(currentPageElement.textContent) || 1;
      console.log('Current page from element:', this.currentPage);
    }
    
    // Find the highest page number from all pagination links
    paginationLinks.forEach(link => {
      const pageNum = parseInt(link.textContent);
      if (pageNum && pageNum > this.totalPages) {
        this.totalPages = pageNum;
      }
    });
    
    console.log('Total pages found from pagination:', this.totalPages);
    
    // If no pagination found, check for next link
    const nextLink = document.querySelector('.pagination-box li.next a');
    if (nextLink && this.totalPages <= this.currentPage) {
      this.totalPages = this.currentPage + 1;
      console.log('Next link found, adjusted total pages to:', this.totalPages);
    }
    
    // Additional check: if we still don't have enough pages, try to detect from Shopify's paginate object
    if (this.totalPages <= this.currentPage && window.paginateInfo) {
      this.totalPages = window.paginateInfo.pages || this.totalPages;
      console.log('Using window.paginateInfo, total pages:', this.totalPages);
    }
    
    // Fallback: try to get pagination info from URL parameters
      if (this.totalPages <= 1) {
        const urlParams = new URLSearchParams(window.location.search);
        const currentPageFromUrl = parseInt(urlParams.get('page')) || 1;
        this.currentPage = currentPageFromUrl;
        
        // If we have a next link, assume there are more pages
        if (nextLink) {
          this.totalPages = this.currentPage + 1;
          console.log('Using URL fallback - current page:', this.currentPage, 'total pages:', this.totalPages);
        } else {
          // If no pagination at all, assume there might be more pages and let the fetch determine the actual limit
          this.totalPages = this.currentPage + 10; // Assume there might be up to 10 more pages
          console.log('No pagination found, assuming potential pages exist up to:', this.totalPages);
        }
      }
  }

  setupIntersectionObserver() {
    console.log('Setting up intersection observer...');
    
    const options = {
      root: null,
      rootMargin: '100px',
      threshold: 0.1
    };

    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        console.log('Intersection observed:', {
          isIntersecting: entry.isIntersecting,
          isLoading: this.isLoading,
          hasMorePages: this.hasMorePages()
        });
        
        if (entry.isIntersecting && !this.isLoading && this.hasMorePages()) {
          console.log('Triggering loadMoreProducts from intersection');
          this.loadMoreProducts();
        }
      });
    }, options);

    this.observer.observe(this.loadMoreTrigger);
    console.log('Intersection observer set up and observing trigger element');
  }

  hasMorePages() {
    return this.currentPage < this.totalPages;
  }

  async loadMoreProducts() {
    console.log('loadMoreProducts called - isLoading:', this.isLoading, 'hasMorePages:', this.hasMorePages());
    
    if (this.isLoading || !this.hasMorePages()) {
      console.log('Aborting load - already loading or no more pages');
      return;
    }

    console.log('Starting to load more products...');
    this.isLoading = true;
    this.showLoadingSpinner();

    try {
      const nextPage = this.currentPage + 1;
      const url = this.buildNextPageUrl(nextPage);
      
      const response = await fetch(url);
      if (!response.ok) {
        if (response.status === 404) {
          console.log('Page not found (404), reached end of collection');
          this.totalPages = this.currentPage;
          this.hideLoadMoreTrigger();
          return;
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
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
        
        console.log(`Successfully loaded page ${nextPage} with ${newProducts.length} products`);
      } else {
        // No products found, we've reached the end
        console.log('No more products found, reached end of collection');
        this.totalPages = this.currentPage; // Update total pages to current page
        this.hideLoadMoreTrigger();
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

  hideLoadMoreTrigger() {
    if (this.loadMoreTrigger) {
      this.loadMoreTrigger.style.display = 'none';
      console.log('Load more trigger hidden - no more pages available');
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
  console.log('Infinite scroll script loaded');
  
  // Check if we're on a collection page
  const productGrid = document.querySelector('#product-grid');
  const loadMoreTrigger = document.querySelector('.load-more-trigger');
  
  console.log('Product grid found:', !!productGrid);
  console.log('Load more trigger found:', !!loadMoreTrigger);
  
  // Only initialize on collection pages
  if (productGrid && loadMoreTrigger) {
    console.log('Initializing infinite scroll');
    window.infiniteScroll = new InfiniteScroll();
  } else {
    console.log('Infinite scroll not initialized - missing elements');
  }
  
  // Add a manual test button for debugging
  if (window.location.search.includes('debug=true')) {
    const debugButton = document.createElement('button');
    debugButton.textContent = 'Test Load More';
    debugButton.style.cssText = 'position: fixed; top: 10px; right: 10px; z-index: 9999; padding: 10px; background: red; color: white;';
    debugButton.onclick = function() {
      if (window.infiniteScroll) {
        window.infiniteScroll.loadMoreProducts();
      }
    };
    document.body.appendChild(debugButton);
  }
});

// Add a simple scroll-based fallback
let scrollTimeout;
window.addEventListener('scroll', function() {
  clearTimeout(scrollTimeout);
  scrollTimeout = setTimeout(function() {
    const scrollPosition = window.innerHeight + window.scrollY;
    const documentHeight = document.documentElement.offsetHeight;
    
    // If we're within 200px of the bottom
    if (scrollPosition >= documentHeight - 200) {
      console.log('Near bottom of page, checking for infinite scroll');
      if (window.infiniteScroll && window.infiniteScroll.hasMorePages() && !window.infiniteScroll.isLoading) {
        console.log('Triggering load more from scroll fallback');
        window.infiniteScroll.loadMoreProducts();
      }
    }
  }, 100);
});

// Handle browser back/forward buttons
window.addEventListener('popstate', function() {
  location.reload();
});