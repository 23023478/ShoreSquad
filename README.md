# ShoreSquad 🌊

A beach cleanup coordination app targeting young eco-warriors. Join the movement to protect our coastlines with interactive maps, real-time weather tracking, and social features.

## 🌟 Features

- **Interactive Google Maps Integration**: View cleanup locations with satellite imagery
- **Real-time Weather Data**: Live weather conditions from Singapore's NEA API
- **4-Day Weather Forecast**: Plan cleanup events with accurate weather predictions
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- **Progressive Web App**: Install directly to your device for native-like experience
- **Ocean-Inspired UI**: Beautiful blue gradient design with smooth animations
- **Accessibility Compliant**: WCAG guidelines for inclusive user experience

## 🚀 Getting Started

### Prerequisites

- **VS Code** with Live Server extension installed
- **Modern web browser** (Chrome, Firefox, Safari, Edge)
- **Internet connection** for API data and Google Maps

### Installation & Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/23023478/ShoreSquad.git
   cd ShoreSquad
   ```

2. **Open in VS Code**:
   ```bash
   code .
   ```

3. **Install Live Server extension** (if not already installed):
   - Open VS Code Extensions panel (`Ctrl+Shift+X`)
   - Search for "Live Server" by Ritwick Dey
   - Click "Install"

4. **Start the development server**:
   - Right-click on `index.html` in VS Code Explorer
   - Select "Open with Live Server"
   - Your browser will automatically open to `http://localhost:5500`

### Alternative Setup (Python)

If you prefer using Python's built-in server:

```bash
# Python 3
python -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000
```

Then visit `http://localhost:8000` in your browser.

## 🗺️ Cleanup Location

**Next Event**: Pasir Ris Beach, Singapore  
**Coordinates**: 1.381497, 103.955574  
**Date**: Every Saturday, 8:00 AM - 12:00 PM

The embedded Google Maps shows the exact cleanup location with satellite view for easy navigation.

## 🌤️ Weather Integration

ShoreSquad integrates with Singapore's National Environment Agency (NEA) APIs:

- **Real-time Weather Readings**: Live temperature, humidity, and wind data
- **4-Day Forecast**: Detailed weather predictions for event planning
- **Multiple Weather Stations**: Data from stations across Singapore
- **Metric Units**: All measurements in Celsius, kilometers, and km/h
- **Smart Caching**: 5-minute cache system for optimal performance

### Weather API Endpoints

- Real-time: `https://api.data.gov.sg/v1/environment/air-temperature`
- Forecast: `https://api.data.gov.sg/v1/environment/4-day-weather-forecast`

## 🏗️ Project Structure

```
ShoreSquad/
├── index.html              # Main application page
├── weather-test.html       # Weather API testing interface
├── css/
│   └── styles.css          # Ocean-themed responsive styles
├── js/
│   ├── app.js              # Main application logic
│   └── weatherService.js   # NEA weather API integration
├── .vscode/
│   └── settings.json       # Live Server configuration
├── package.json            # Development dependencies
├── .gitignore              # Git exclusion patterns
└── README.md               # This documentation
```

## 🛠️ Development

### Testing Weather Integration

Visit `/weather-test.html` to test the weather API integration separately. This page provides:

- Real-time weather data display
- 4-day forecast preview
- API response debugging
- Error handling testing

### Code Features

- **Progressive Enhancement**: Works without JavaScript (basic functionality)
- **Error Handling**: Comprehensive error catching with user feedback
- **Retry Mechanisms**: Automatic retry with exponential backoff
- **Loading States**: Visual feedback during API calls
- **Accessibility**: ARIA labels, semantic HTML, keyboard navigation
- **Mobile Responsive**: Optimized for all screen sizes

## 🚢 Deployment

### GitHub Pages (Recommended)

1. Push your changes to GitHub:
   ```bash
   git add .
   git commit -m "Complete ShoreSquad application"
   git push origin main
   ```

2. Enable GitHub Pages:
   - Go to repository Settings
   - Scroll to "Pages" section
   - Select "Deploy from a branch"
   - Choose "main" branch and "/ (root)" folder
   - Click "Save"

3. Your app will be live at: `https://23023478.github.io/ShoreSquad/`

### Other Hosting Options

- **Netlify**: Drag and drop the project folder
- **Vercel**: Connect your GitHub repository
- **Firebase Hosting**: Use Firebase CLI for deployment

## 🌊 Environmental Impact

Every beach cleanup event organized through ShoreSquad contributes to:

- **Marine Conservation**: Protecting sea life from plastic pollution
- **Community Building**: Connecting eco-conscious individuals
- **Education**: Raising awareness about ocean conservation
- **Data Collection**: Tracking cleanup impact and debris types

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **National Environment Agency (NEA)** for weather data APIs
- **Google Maps** for location services
- **Data.gov.sg** for open data initiative
- **VS Code Live Server** for development convenience

---

**Made with 💙 for ocean conservation** | Join the ShoreSquad movement today!
