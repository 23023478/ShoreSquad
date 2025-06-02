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
   */
  init() {
    this.setupEventListeners();
    this.initializeMap();
    this.getLocation();
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
            }).addTo(this.map).bindPopup('Your Location');
          }
          
          this.getWeatherData();
        },
        (error) => {
          console.warn('Geolocation error:', error);
          this.getWeatherData(); // Still try to get weather for default location
        },
        {
          timeout: 10000,
          maximumAge: 300000 // 5 minutes
        }
      );
    } else {
      console.warn('Geolocation not supported');
      this.getWeatherData();
    }
  }

  /**
   * Get weather data (mock implementation)
   */
  async getWeatherData() {
    try {      // In a real app, you'd use a weather API like OpenWeatherMap
      // For now, we'll simulate weather data
      this.weatherData = {
        current: {
          temp: 22,
          feelsLike: 24,
          humidity: 65,
          windSpeed: 13,
          uvIndex: 6,
          icon: '🌤️',
          description: 'Partly Cloudy'
        },
        location: this.userLocation ? 'Your Location' : 'San Francisco, CA',
        forecast: [
          { day: 'Today', icon: '🌤️', high: 22, low: 14 },
          { day: 'Tomorrow', icon: '☀️', high: 24, low: 16 },
          { day: 'Wednesday', icon: '🌦️', high: 20, low: 13 },
          { day: 'Thursday', icon: '☀️', high: 26, low: 17 },
          { day: 'Friday', icon: '🌤️', high: 23, low: 15 }
        ]
      };

      this.updateWeatherDisplay();
    } catch (error) {
      console.error('Weather data fetch failed:', error);
    }
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

    if (currentIcon) currentIcon.textContent = current.icon;    if (currentTemp) currentTemp.textContent = `${current.temp}°C`;
    if (currentLocation) currentLocation.textContent = location;
    if (feelsLike) feelsLike.textContent = `${current.feelsLike}°C`;
    if (windSpeed) windSpeed.textContent = `${current.windSpeed} km/h`;
    if (humidity) humidity.textContent = `${current.humidity}%`;
    if (uvIndex) uvIndex.textContent = current.uvIndex;

    // Update forecast
    const forecastContainer = document.getElementById('weather-forecast');
    if (forecastContainer) {
      forecastContainer.innerHTML = forecast.map(day => `
        <div class="forecast-item">
          <div class="forecast-day">${day.day}</div>
          <div class="forecast-icon">${day.icon}</div>
          <div class="forecast-temps">
            <span class="forecast-high">${day.high}°</span>
            <span class="forecast-low">${day.low}°</span>
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
   * Show notification to user
   */
  showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification--${type}`;
    notification.innerHTML = `
      <div class="notification-content">
        <span class="notification-message">${message}</span>
        <button class="notification-close" aria-label="Close notification">&times;</button>
      </div>
    `;

    // Add styles for notification
    const styles = {
      position: 'fixed',
      top: '20px',
      right: '20px',
      background: type === 'success' ? 'var(--success-color)' : 
                 type === 'warning' ? 'var(--secondary-color)' : 
                 'var(--primary-color)',
      color: 'white',
      padding: 'var(--space-4)',
      borderRadius: 'var(--radius-lg)',
      boxShadow: 'var(--shadow-lg)',
      zIndex: 'var(--z-tooltip)',
      maxWidth: '300px',
      animation: 'slideInRight 0.3s ease-out'
    };

    Object.assign(notification.style, styles);

    // Add to page
    document.body.appendChild(notification);

    // Close button functionality
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.addEventListener('click', () => {
      notification.remove();
    });

    // Auto-remove after 5 seconds
    setTimeout(() => {
      if (notification.parentNode) {
        notification.style.animation = 'slideOutRight 0.3s ease-in';
        setTimeout(() => notification.remove(), 300);
      }
    }, 5000);
  }

  /**
   * Utility method to format dates
   */
  formatDate(date) {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  /**
   * Utility method to calculate distance between two points
   */
  calculateDistance(lat1, lng1, lat2, lng2) {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRadians(lat2 - lat1);
    const dLng = this.toRadians(lng2 - lng1);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
              Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  /**
   * Convert degrees to radians
   */
  toRadians(degrees) {
    return degrees * (Math.PI / 180);
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
    }
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
