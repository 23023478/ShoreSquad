/**
 * ShoreSquad App - Interactive Features
 * Modern JavaScript for beach cleanup coordination
 */

class ShoreSquadApp {
  constructor() {
    this.map = null;
    this.userLocation = null;
    this.cleanupMarkers = [];
    this.weatherData = null;
    
    // Initialize the app when DOM is loaded
    this.init();
  }
  /**
   * Initialize the application
   */  init() {
    this.setupEventListeners();
    this.initializeMap();
    this.initializeGoogleMapsIframe();
    this.getLocation();
    this.initWeather(); // Initialize weather with NEA APIs
    this.animateStats();
    this.setupMobileNavigation();
  }

  /**
   * Set up event listeners for interactive elements
   */
  setupEventListeners() {
    // Button event listeners
    const getStartedBtn = document.getElementById('get-started-btn');
    const findCleanupBtn = document.getElementById('find-cleanup-btn');
    const locationSearch = document.getElementById('location-search');
    const searchBtn = document.querySelector('.search-btn');
    
    if (getStartedBtn) {
      getStartedBtn.addEventListener('click', this.handleGetStarted.bind(this));
    }
    
    if (findCleanupBtn) {
      findCleanupBtn.addEventListener('click', this.handleFindCleanup.bind(this));
    }
    
    if (locationSearch) {
      locationSearch.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          this.handleLocationSearch();
        }
      });
    }
    
    if (searchBtn) {
      searchBtn.addEventListener('click', this.handleLocationSearch.bind(this));
    }

    // Filter event listeners
    const dateFilter = document.getElementById('date-filter');
    const distanceFilter = document.getElementById('distance-filter');
    
    if (dateFilter) {
      dateFilter.addEventListener('change', this.handleFilterChange.bind(this));
    }
    
    if (distanceFilter) {
      distanceFilter.addEventListener('change', this.handleFilterChange.bind(this));
    }

    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', (e) => {
        e.preventDefault();
        const target = document.querySelector(anchor.getAttribute('href'));
        if (target) {
          target.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }
      });
    });

    // Intersection Observer for animations
    this.setupScrollAnimations();
  }

  /**
   * Set up mobile navigation toggle
   */
  setupMobileNavigation() {
    const navToggle = document.querySelector('.nav__toggle');
    const navMenu = document.querySelector('.nav__menu');
    
    if (navToggle && navMenu) {
      navToggle.addEventListener('click', () => {
        const isExpanded = navToggle.getAttribute('aria-expanded') === 'true';
        navToggle.setAttribute('aria-expanded', !isExpanded);
        navMenu.classList.toggle('active');
      });

      // Close menu when clicking on links
      navMenu.querySelectorAll('.nav__link').forEach(link => {
        link.addEventListener('click', () => {
          navMenu.classList.remove('active');
          navToggle.setAttribute('aria-expanded', 'false');
        });
      });
    }
  }

  /**
   * Initialize the interactive map
   */
  initializeMap() {
    try {
      // Initialize Leaflet map
      this.map = L.map('cleanup-map').setView([37.7749, -122.4194], 10); // Default to San Francisco

      // Add tile layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 18
      }).addTo(this.map);

      // Add sample cleanup locations
      this.addSampleCleanupLocations();

      // Hide loading indicator
      const mapLoading = document.getElementById('map-loading');
      if (mapLoading) {
        setTimeout(() => {
          mapLoading.style.display = 'none';
        }, 1500);
      }

    } catch (error) {
      console.error('Map initialization failed:', error);
      this.showMapError();
    }
  }

  /**
   * Add sample cleanup locations to the map
   */
  addSampleCleanupLocations() {
    const sampleLocations = [
      {
        lat: 37.7849,
        lng: -122.4094,
        title: 'Ocean Beach Cleanup',
        date: '2025-06-08',
        participants: 24,
        description: 'Join us for a morning cleanup at Ocean Beach!'
      },
      {
        lat: 37.8099,
        lng: -122.4192,
        title: 'Crissy Field Earth Day',
        date: '2025-06-15',
        participants: 45,
        description: 'Earth Day special cleanup event with prizes!'
      },
      {
        lat: 37.7449,
        lng: -122.5194,
        title: 'Pacifica Pier Cleanup',
        date: '2025-06-10',
        participants: 18,
        description: 'Coastal cleanup focusing on pier area.'
      }
    ];

    sampleLocations.forEach(location => {
      const marker = L.marker([location.lat, location.lng])
        .addTo(this.map)
        .bindPopup(`
          <div class="cleanup-popup">
            <h4>${location.title}</h4>
            <p><strong>Date:</strong> ${new Date(location.date).toLocaleDateString()}</p>
            <p><strong>Participants:</strong> ${location.participants}</p>
            <p>${location.description}</p>
            <button class="btn btn--primary btn--small" onclick="shoreSquadApp.joinCleanup('${location.title}')">
              Join Cleanup
            </button>
          </div>
        `);
      
      this.cleanupMarkers.push(marker);
    });
  }

  /**
   * Get user's current location
   */
  getLocation() {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          this.userLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          
          if (this.map) {
            this.map.setView([this.userLocation.lat, this.userLocation.lng], 12);
            
            // Add user location marker
            L.marker([this.userLocation.lat, this.userLocation.lng], {
              icon: L.divIcon({
                className: 'user-location-marker',
                html: '📍',
                iconSize: [30, 30]
              })
            }).addTo(this.map).bindPopup('Your Location');          }
          
          // Weather will be handled separately by initWeather()
        },
        (error) => {
          console.warn('Geolocation error:', error);
          // Weather will be handled separately by initWeather()
        },
        {
          timeout: 10000,
          maximumAge: 300000 // 5 minutes
        }
      );    } else {
      console.warn('Geolocation not supported');
      // Weather will be handled separately by initWeather()
    }
  }
  /**
   * Initialize weather service and load data
   */
  async initWeather() {
    this.weatherService = new NEAWeatherService();
    
    // Get user location first if available
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          this.userLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          
          // Determine region based on location
          const region = this.determineRegion(this.userLocation);
          await this.getWeatherData(region);
        },
        (error) => {
          console.warn('Geolocation error:', error);
          // Default to East Coast region (closest to Pasir Ris)
          this.getWeatherData('East Coast');
        },
        {
          timeout: 10000,
          maximumAge: 300000 // 5 minutes
        }
      );
    } else {
      console.warn('Geolocation not supported');
      this.getWeatherData('East Coast');
    }
  }

  /**
   * Determine Singapore region based on coordinates
   */
  determineRegion(location) {
    // Simple region detection for Singapore
    if (location.lat > 1.35 && location.lng > 103.85) {
      return 'East Coast'; // Eastern Singapore (Pasir Ris area)
    } else if (location.lat > 1.42) {
      return 'Woodlands'; // Northern Singapore
    }
    return 'Central'; // Default to central
  }

  /**
   * Get weather data using NEA APIs
   */
  async getWeatherData(region = 'East Coast') {
    try {
      // Show loading state
      this.showWeatherLoading();
      
      // Get comprehensive weather data from NEA
      this.weatherData = await this.weatherService.getWeatherData(region);
      
      // Update display
      this.updateWeatherDisplay();
      
      // Show success notification if using live data
      if (!this.weatherData.fallback) {
        this.showNotification('Weather data updated from NEA Singapore', 'success');
      }
      
    } catch (error) {
      console.error('Weather data fetch failed:', error);
      this.showNotification('Using cached weather data', 'warning');
    }
  }

  /**
   * Show loading state for weather
   */
  showWeatherLoading() {
    const currentTemp = document.getElementById('current-temp');
    const currentLocation = document.getElementById('current-location');
    const forecastContainer = document.getElementById('weather-forecast');
    
    if (currentTemp) currentTemp.textContent = 'Loading...';
    if (currentLocation) currentLocation.textContent = 'Getting weather...';    if (forecastContainer) forecastContainer.innerHTML = '<div class="loading-spinner">🌀 Loading forecast...</div>';
  }

  /**
   * Update weather display with current data
   */
  updateWeatherDisplay() {
    if (!this.weatherData) return;

    const { current, location, forecast } = this.weatherData;

    // Update current weather
    const currentIcon = document.getElementById('current-weather-icon');
    const currentTemp = document.getElementById('current-temp');
    const currentLocation = document.getElementById('current-location');
    const feelsLike = document.getElementById('feels-like');
    const windSpeed = document.getElementById('wind-speed');
    const humidity = document.getElementById('humidity');
    const uvIndex = document.getElementById('uv-index');

    if (currentIcon) currentIcon.textContent = current.icon;
    if (currentTemp) currentTemp.textContent = `${current.temp}°C`;
    if (currentLocation) currentLocation.textContent = location;
    if (feelsLike) feelsLike.textContent = `${current.feelsLike}°C`;
    if (windSpeed) windSpeed.textContent = `${current.windSpeed} km/h`;
    if (humidity) humidity.textContent = `${current.humidity}%`;
    if (uvIndex) uvIndex.textContent = current.uvIndex;    // Update forecast
    const forecastContainer = document.getElementById('weather-forecast');
    if (forecastContainer && forecast) {
      forecastContainer.innerHTML = forecast.map(day => `
        <div class="forecast-item">
          <div class="forecast-day">${day.day}</div>
          <div class="forecast-icon" title="${day.forecast || day.description || ''}">${day.icon}</div>
          <div class="forecast-temps">
            <span class="forecast-high">${day.high}°C</span>
            <span class="forecast-low">${day.low}°C</span>
          </div>
          <div class="forecast-details">
            <small>${day.forecast || day.description || 'No details'}</small>
          </div>
        </div>
      `).join('');
    }
  }

  /**
   * Animate statistics counters
   */
  animateStats() {
    const stats = document.querySelectorAll('.stat__number');
    
    const animateCounter = (element) => {
      const target = parseInt(element.getAttribute('data-count'));
      const duration = 2000; // 2 seconds
      const steps = 60;
      const increment = target / steps;
      let current = 0;
      
      const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
          current = target;
          clearInterval(timer);
        }
        element.textContent = Math.floor(current).toLocaleString();
      }, duration / steps);
    };

    // Use Intersection Observer to trigger animation when stats come into view
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const statElement = entry.target.querySelector('.stat__number');
          if (statElement && !statElement.classList.contains('animated')) {
            statElement.classList.add('animated');
            animateCounter(statElement);
          }
        }
      });
    }, { threshold: 0.5 });

    stats.forEach(stat => {
      observer.observe(stat.closest('.stat'));
    });
  }

  /**
   * Set up scroll-triggered animations
   */
  setupScrollAnimations() {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-in');
        }
      });
    }, observerOptions);

    // Observe elements for animation
    document.querySelectorAll('.feature-card, .section-header').forEach(element => {
      observer.observe(element);
    });
  }

  /**
   * Handle Get Started button click
   */
  handleGetStarted() {
    // Simulate user onboarding
    this.showNotification('Welcome to ShoreSquad! 🌊', 'success');
    
    // Scroll to map section
    const mapSection = document.getElementById('cleanups');
    if (mapSection) {
      mapSection.scrollIntoView({ behavior: 'smooth' });
    }
  }

  /**
   * Handle Find Cleanup button click
   */
  handleFindCleanup() {
    const mapSection = document.getElementById('cleanups');
    if (mapSection) {
      mapSection.scrollIntoView({ behavior: 'smooth' });
    }
    
    // Highlight the search box
    const searchBox = document.querySelector('.search-box');
    if (searchBox) {
      searchBox.style.boxShadow = '0 0 0 3px rgba(0, 119, 190, 0.3)';
      setTimeout(() => {
        searchBox.style.boxShadow = '';
      }, 2000);
    }
  }

  /**
   * Handle location search
   */
  handleLocationSearch() {
    const searchInput = document.getElementById('location-search');
    if (!searchInput) return;

    const location = searchInput.value.trim();
    if (!location) {
      this.showNotification('Please enter a location', 'warning');
      return;
    }

    // Simulate location search (in real app, use geocoding API)
    this.showNotification(`Searching for cleanups near "${location}"...`, 'info');
    
    // Simulate search results
    setTimeout(() => {
      this.showNotification(`Found 3 cleanups near ${location}!`, 'success');
      // In real app, update map markers based on search results
    }, 1500);
  }

  /**
   * Handle filter changes
   */
  handleFilterChange() {
    const dateFilter = document.getElementById('date-filter')?.value;
    const distanceFilter = document.getElementById('distance-filter')?.value;
    
    // Simulate filtering (in real app, filter actual data)
    this.showNotification('Filters updated! 🔍', 'info');
    
    // Log filters for debugging
    console.log('Filters changed:', { dateFilter, distanceFilter });
  }

  /**
   * Handle joining a cleanup
   */
  joinCleanup(cleanupTitle) {
    this.showNotification(`Awesome! You've joined "${cleanupTitle}" 🎉`, 'success');
  }

  /**
   * Show map error
   */
  showMapError() {
    const mapLoading = document.getElementById('map-loading');
    if (mapLoading) {
      mapLoading.innerHTML = `
        <div style="text-align: center; color: var(--gray-600);">
          <p>📍 Map temporarily unavailable</p>
          <p>Please try refreshing the page</p>
        </div>
      `;
    }
  }

  /**
   * Enhanced error handling and user feedback system
   */
  handleError(error, context = 'Unknown', showNotification = true) {
    console.error(`ShoreSquad Error [${context}]:`, error);
    
    // Log error details for debugging
    const errorDetails = {
      message: error.message || 'Unknown error',
      stack: error.stack,
      context: context,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href
    };
    
    console.group('🚨 ShoreSquad Error Details');
    console.table(errorDetails);
    console.groupEnd();
    
    if (showNotification) {
      this.showNotification(
        `Oops! Something went wrong with ${context}. Please try again.`,
        'error'
      );
    }
    
    // Send error to analytics (in production)
    if (typeof gtag !== 'undefined') {
      gtag('event', 'exception', {
        description: `${context}: ${error.message}`,
        fatal: false
      });
    }
    
    return errorDetails;
  }

  /**
   * Show loading state for specific elements
   */
  showLoadingState(element, originalContent = null) {
    if (!element) return null;
    
    const loadingSpinner = document.createElement('div');
    loadingSpinner.className = 'loading-spinner';
    loadingSpinner.innerHTML = '<span>Loading...</span>';
    
    // Store original content if not provided
    if (!originalContent) {
      originalContent = element.innerHTML;
    }
    
    element.innerHTML = '';
    element.appendChild(loadingSpinner);
    element.classList.add('loading');
    
    return {
      element,
      originalContent,
      hide: () => {
        element.innerHTML = originalContent;
        element.classList.remove('loading');
      }
    };
  }

  /**
   * Enhanced notification system with better UX
   */
  showNotification(message, type = 'info', duration = 5000, actions = []) {
    try {
      // Create notification container if it doesn't exist
      let container = document.querySelector('.notification-container');
      if (!container) {
        container = document.createElement('div');
        container.className = 'notification-container';
        document.body.appendChild(container);
      }

      // Create notification element
      const notification = document.createElement('div');
      notification.className = `notification ${type}`;
      
      // Create notification content
      const content = document.createElement('div');
      content.className = 'notification-content';
      
      // Message content
      const messageEl = document.createElement('div');
      messageEl.className = 'notification-message';
      messageEl.textContent = message;
      
      // Close button
      const closeBtn = document.createElement('button');
      closeBtn.className = 'notification-close';
      closeBtn.innerHTML = '✕';
      closeBtn.setAttribute('aria-label', 'Close notification');
      closeBtn.addEventListener('click', () => this.removeNotification(notification));
      
      content.appendChild(messageEl);
      
      // Add action buttons if provided
      if (actions.length > 0) {
        const actionsContainer = document.createElement('div');
        actionsContainer.className = 'notification-actions';
        
        actions.forEach(action => {
          const actionBtn = document.createElement('button');
          actionBtn.className = 'btn btn--sm';
          actionBtn.textContent = action.label;
          actionBtn.addEventListener('click', () => {
            action.handler();
            this.removeNotification(notification);
          });
          actionsContainer.appendChild(actionBtn);
        });
        
        content.appendChild(actionsContainer);
      }
      
      content.appendChild(closeBtn);
      notification.appendChild(content);

      // Add to container with animation
      container.appendChild(notification);
      
      // Trigger entrance animation
      requestAnimationFrame(() => {
        notification.style.animation = 'slideInRight 0.3s ease-out forwards';
      });

      // Auto-remove after duration
      if (duration > 0) {
        setTimeout(() => {
          this.removeNotification(notification);
        }, duration);
      }

      // Return notification for manual control
      return notification;
      
    } catch (error) {
      console.error('Failed to show notification:', error);
      // Fallback to alert
      alert(`${type.toUpperCase()}: ${message}`);
    }
  }

  /**
   * Remove notification with animation
   */
  removeNotification(notification) {
    if (!notification || !notification.parentNode) return;
    
    notification.style.animation = 'slideOutRight 0.3s ease-in forwards';
    
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 300);
  }

  /**
   * Enhanced retry mechanism for failed operations
   */
  async retryOperation(operation, maxRetries = 3, delay = 1000, context = 'operation') {
    let lastError;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`Attempting ${context} (${attempt}/${maxRetries})`);
        const result = await operation();
        
        if (attempt > 1) {
          this.showNotification(
            `${context} succeeded after ${attempt} attempts`,
            'success'
          );
        }
        
        return result;
        
      } catch (error) {
        lastError = error;
        console.warn(`${context} failed (attempt ${attempt}/${maxRetries}):`, error);
        
        if (attempt < maxRetries) {
          console.log(`Retrying ${context} in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
          delay *= 1.5; // Exponential backoff
        }
      }
    }
    
    // All attempts failed
    this.handleError(lastError, context);
    throw lastError;
  }

  /**
   * Network connectivity check
   */
  async checkConnectivity() {
    if (!navigator.onLine) {
      return false;
    }
    
    try {
      // Try to fetch a small resource to verify connectivity
      const response = await fetch('https://api.data.gov.sg/v1/environment/24-hour-weather-forecast', {
        method: 'HEAD',
        cache: 'no-cache',
        signal: AbortSignal.timeout(5000) // 5 second timeout
      });
      return response.ok;
    } catch (error) {
      console.warn('Connectivity check failed:', error);
      return false;
    }
  }

  /**
   * Enhanced geolocation with better error handling
   */
  async getLocationWithRetry() {
    return new Promise((resolve, reject) => {
      if (!('geolocation' in navigator)) {
        reject(new Error('Geolocation not supported'));
        return;
      }

      const options = {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minutes
      };

      navigator.geolocation.getCurrentPosition(
        (position) => {
          this.userLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: position.coords.accuracy
          };
          
          console.log('Location acquired:', this.userLocation);
          resolve(this.userLocation);
        },
        (error) => {
          let errorMessage = 'Location access failed';
          
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = 'Location access denied by user';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'Location information unavailable';
              break;
            case error.TIMEOUT:
              errorMessage = 'Location request timed out';
              break;
          }
          
          console.warn('Geolocation error:', errorMessage, error);
          reject(new Error(errorMessage));
        },
        options
      );
    });
  }

  /**
   * Initialize Google Maps iframe with error handling
   */
  initializeGoogleMapsIframe() {
    const iframe = document.querySelector('.google-map-wrapper iframe');
    const fallback = document.querySelector('.map-fallback');
    
    if (iframe && fallback) {
      // Handle iframe load errors
      iframe.addEventListener('error', () => {
        console.log('Google Maps iframe failed to load, showing fallback');
        iframe.style.display = 'none';
        fallback.style.display = 'block';
      });
      
      // Timeout fallback in case iframe takes too long
      setTimeout(() => {
        if (!iframe.complete || iframe.naturalHeight === 0) {
          console.log('Google Maps iframe loading timeout, showing fallback');
          iframe.style.display = 'none';
          fallback.style.display = 'block';
        }
      }, 10000); // 10 second timeout
    }
  }
}

// Performance optimization: Load app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  // Global app instance
  window.shoreSquadApp = new ShoreSquadApp();
});

// Add CSS for notifications and animations
const additionalStyles = `
  /* Notification styles */
  .notification {
    animation: slideInRight 0.3s ease-out;
  }

  .notification-content {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-3);
  }

  .notification-close {
    background: none;
    border: none;
    color: white;
    font-size: var(--text-xl);
    cursor: pointer;
    padding: 0;
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  /* Animation keyframes */
  @keyframes slideInRight {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }

  @keyframes slideOutRight {
    from {
      transform: translateX(0);
      opacity: 1;
    }
    to {
      transform: translateX(100%);
      opacity: 0;
    }  }

  /* Weather loading and enhanced styles */
  .loading-spinner {
    text-align: center;
    padding: var(--space-4);
    color: var(--text-muted);
    animation: pulse 2s infinite;
  }

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }

  .forecast-item {
    padding: var(--space-3);
    background: var(--surface-color);
    border-radius: var(--radius-md);
    transition: transform 0.2s ease;
  }

  .forecast-item:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 119, 190, 0.1);
  }

  .forecast-details {
    margin-top: var(--space-1);
    color: var(--text-muted);
  }

  .forecast-details small {
    font-size: var(--text-xs);
    line-height: 1.3;
  }

  /* Weather notification styles */
  .notification.success {
    background: linear-gradient(135deg, #10b981, #059669);
  }

  .notification.warning {
    background: linear-gradient(135deg, #f59e0b, #d97706);
  }

  /* Scroll animations */
  .animate-in {
    animation: fadeInUp 0.6s ease-out;
  }

  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  /* Cleanup popup styles */
  .cleanup-popup h4 {
    color: var(--primary-color);
    margin-bottom: var(--space-2);
  }

  .cleanup-popup p {
    margin-bottom: var(--space-2);
    font-size: var(--text-sm);
  }

  .btn--small {
    padding: var(--space-2) var(--space-4);
    font-size: var(--text-sm);
  }

  /* Forecast item styles */
  .forecast-item {
    text-align: center;
    padding: var(--space-4);
    background: var(--gray-50);
    border-radius: var(--radius-lg);
  }

  .forecast-day {
    font-size: var(--text-sm);
    color: var(--gray-600);
    margin-bottom: var(--space-2);
  }

  .forecast-icon {
    font-size: var(--text-2xl);
    margin-bottom: var(--space-2);
  }

  .forecast-temps {
    display: flex;
    justify-content: space-between;
    font-size: var(--text-sm);
  }

  .forecast-high {
    font-weight: 600;
    color: var(--gray-900);
  }

  .forecast-low {
    color: var(--gray-600);
  }

  /* User location marker */
  .user-location-marker {
    text-align: center;
    font-size: var(--text-xl);
  }

  /* Loading state improvements */
  .map-loading {
    transition: opacity 0.3s ease-out;
  }

  /* Responsive improvements */
  @media (max-width: 768px) {
    .notification {
      right: 10px;
      left: 10px;
      max-width: none;
    }

    .weather-dashboard {
      grid-template-columns: 1fr;
    }

    .weather-details {
      grid-template-columns: 1fr 1fr;
    }

    .map-controls {
      flex-direction: column;
    }

    .search-box {
      max-width: none;
    }
  }
`;

// Inject additional styles
const styleSheet = document.createElement('style');
styleSheet.textContent = additionalStyles;
document.head.appendChild(styleSheet);
