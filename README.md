# Sovereign Bags - Privacy-Preserving Crypto Portfolio Tracker

Sovereign Bags is a privacy-first cryptocurrency portfolio tracker that runs entirely in your browser. Unlike traditional portfolio trackers, it stores your data locally and never sends your holdings information to external servers.

## 🔒 Privacy Features

- **Local Storage Only**: All portfolio data is stored in your browser's local storage
- **No Server Communication**: Your holdings never leave your device
- **No Tracking**: No cookies, analytics, or user tracking
- **Your Keys**: Use your own API keys for price data
- **CORS Protection**: Prevents APIs from knowing your exact holdings

## 🚀 Getting Started

### Simple Setup
1. Download or clone this repository
2. Open `index.html` in your web browser
3. That's it! No server required.

**Note**: For best results, serve from a web server (like `python3 -m http.server 8000`) to avoid CORS restrictions when fetching live price data.

### Browser Compatibility
- Chrome/Chromium (recommended)
- Firefox
- Safari
- Edge

## 📊 Features

- **Real-time cryptocurrency prices** from CoinGecko
- **Multiple currency support** with exchange rates
- **Portfolio allocation visualization**
- **Dark theme** with terminal aesthetic
- **Responsive mobile design**
- **Offline capability** with cached data
- **Privacy-preserving** asset caching
- **Monospace font** for data consistency

## 🔧 Configuration

1. **Currency API Key** (Optional): For multi-currency support
   - Get a free key from [CurrencyAPI.com](https://app.currencyapi.com/register)
   - Add it in Settings

2. **Cache Settings**: Configure how many coins to cache locally (default: 1500)

## 📱 Mobile Support

Fully responsive design with:
- Touch-optimized interface
- Card-based mobile layout
- Swipe-friendly navigation
- Haptic feedback support

## 🛡️ Privacy & Security

- **Encrypted local storage** for all portfolio data
- **No external dependencies** for core functionality
- **Rate-limited API calls** to prevent tracking
- **Open source** - audit the code yourself
- **CORS-aware** error handling

## 🔄 Data Sources

- **Price Data**: CoinGecko API (free tier, rate-limited)
- **Currency Rates**: CurrencyAPI.com (optional, requires free API key)
- **Icons**: CoinGecko CDN

## 💻 Technical Details

- **Pure HTML/CSS/JavaScript** - no build process required
- **Dark mode by default** with Courier monospace font
- **CSS Variables** for consistent theming
- **LocalStorage encryption** using CryptoJS
- **Progressive Web App** features

## 🎨 UI/UX Features

- **Terminal-inspired design** with Courier font
- **Glassmorphism effects** on controls
- **Smooth animations** and transitions
- **Compact table layouts** for data density
- **Intelligent caching** with visual indicators

## 📄 License

MIT License - See LICENSE file for details.

## 🤝 Contributing

This is a pure client-side application. To contribute:
1. Fork the repository
2. Make your changes
3. Test in multiple browsers
4. Submit a pull request

---

**Your keys, your coins, your privacy.**