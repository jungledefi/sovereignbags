// script.js

// Function to update cached asset count display
function updateCachedAssetCount() {
    const assets = getAllCoinGeckoTokens();
    const count = assets ? assets.length : 0;
    
    $('#asset-count').text(count);
    
    // Add visual feedback based on absolute count
    $('#cached-count').removeClass('cached-full cached-partial');
    
    if (count >= 10000) {
        $('#cached-count').addClass('cached-full');
    } else if (count >= 5000) {
        $('#cached-count').addClass('cached-partial');
    }
}

// Function to get the CoinMarketCap API key from localStorage (kept for legacy data decryption only)
function getCoinMarketCapApiKey() {
    return localStorage.getItem('coinMarketCapApiKey');
}

// Function to save the Currency API key to localStorage
function saveCurrencyApiKey(apiKey) {
    localStorage.setItem('currencyApiKey', apiKey);
}

// Function to get the Currency API key from localStorage
function getCurrencyApiKey() {
    return localStorage.getItem('currencyApiKey');
}

// Function to save available assets to localStorage for searching
function saveAvailableAssets(assets) {
    localStorage.setItem('availableAssets', JSON.stringify(assets));
}

// Function to get available assets from localStorage
function getAvailableAssets() {
    const assets = localStorage.getItem('availableAssets');
    return assets ? JSON.parse(assets) : [];
}

// Function to save selected trading symbols/pairs
function saveSelectedSymbols(symbols) {
    localStorage.setItem('selectedSymbols', JSON.stringify(symbols));
}

// Function to get selected trading symbols/pairs
function getSelectedSymbols() {
    const symbols = localStorage.getItem('selectedSymbols');
    return symbols ? JSON.parse(symbols) : [];
}

// Function to save cache limit setting
function saveCacheLimit(limit) {
    localStorage.setItem('cacheLimit', limit.toString());
}

// Function to get cache limit setting (default 1500 - covers most major coins)
function getCacheLimit() {
    const limit = localStorage.getItem('cacheLimit');
    return limit ? parseInt(limit) : 1500;
}

// Function to calculate day delta (placeholder - will need historical data for real calculation)
function calculateDayDelta(currentRate, previousRate) {
    if (!previousRate) return 1;
    return currentRate / previousRate;
}

// Function to format delta day values with percentage
function formatDelta(deltaDay) {
    const formattedDelta = ((deltaDay - 1) * 100).toFixed(2);
    const sign = formattedDelta >= 0 ? '+' : '';
    const color = formattedDelta >= 0 ? 'green' : 'red';
    return `<span style="color: ${color};">${sign} ${formattedDelta}%</span>`;
}

// Function to fetch coin price data 
function fetchCoinData(assetSymbol) {
    const assets = getAvailableAssets();
    const asset = assets.find(a => a.symbol.toUpperCase() === assetSymbol.toUpperCase());
    
    if (asset && asset.price) {
        // Use data from our stored assets
        return Promise.resolve({
            rate: asset.price,
            icon_url: asset.icon_url || '', 
            deltaday: 1 + (asset.percent_change_24h / 100), 
            quote_asset: 'USD',
            market_cap: asset.market_cap,
            volume_24h: asset.volume_24h,
            last_updated: asset.last_updated
        });
    } else {
        // Fallback to CoinGecko for real-time data
        return fetchCoinDataFromCoinGecko(assetSymbol, 'USD');
    }
}

// Function to fetch coin data from CoinGecko (CORS-friendly alternative)
function fetchCoinDataFromCoinGecko(assetSymbol, quoteCurrency = 'USD') {
    const coinId = getCoinGeckoId(assetSymbol);
    const currency = (quoteCurrency || 'USD').toLowerCase();
    
    return $.ajax({
        url: `https://api.coingecko.com/api/v3/simple/price`,
        method: 'GET',
        data: {
            ids: coinId,
            vs_currencies: currency,
            include_24hr_change: true,
            include_market_cap: true,
            include_24hr_vol: true
        },
        dataType: 'json',
        error: function(xhr, status, error) {
            // Handle errors silently
        }
    }).then(response => {
        const coinData = response[coinId];
        if (!coinData) {
            throw new Error(`No data found for ${assetSymbol}`);
        }

        const price = coinData[currency];
        const change24h = coinData[`${currency}_24h_change`] || 0;
        
        // Try to get icon from cached assets
        const cachedAssets = getAvailableAssets();
        const cachedAsset = cachedAssets.find(a => a.symbol.toUpperCase() === assetSymbol.toUpperCase());
        const iconUrl = cachedAsset ? cachedAsset.icon_url : '';
        
        return {
            rate: price,
            icon_url: iconUrl, 
            deltaday: 1 + (change24h / 100), // Convert percentage to ratio
            quote_asset: quoteCurrency.toUpperCase(),
            market_cap: coinData[`${currency}_market_cap`],
            volume_24h: coinData[`${currency}_24h_vol`],
            last_updated: new Date().toISOString()
        };
    });
}

// Helper function to map common symbols to CoinGecko IDs
function getCoinGeckoId(symbol) {
    if (!symbol || typeof symbol !== 'string') {
        return 'bitcoin'; // fallback
    }
    
    const symbolToIdMap = {
        'BTC': 'bitcoin',
        'ETH': 'ethereum',
        'USDT': 'tether',
        'BNB': 'binancecoin',
        'SOL': 'solana',
        'USDC': 'usd-coin',
        'XRP': 'ripple',
        'DOGE': 'dogecoin',
        'TON': 'the-open-network',
        'ADA': 'cardano',
        'AVAX': 'avalanche-2',
        'SHIB': 'shiba-inu',
        'DOT': 'polkadot',
        'TRX': 'tron',
        'BCH': 'bitcoin-cash',
        'NEAR': 'near',
        'MATIC': 'matic-network',
        'LTC': 'litecoin',
        'UNI': 'uniswap',
        'PEPE': 'pepe',
        'ICP': 'internet-computer',
        'DAI': 'dai',
        'LEO': 'leo-token',
        'ETC': 'ethereum-classic',
        'RENDER': 'render-token',
        'KASPA': 'kaspa',
        'HBAR': 'hedera-hashgraph',
        'APT': 'aptos',
        'CRO': 'crypto-com-chain',
        'ATOM': 'cosmos',
        'MNT': 'mantle',
        'OKB': 'okb',
        'FDUSD': 'first-digital-usd',
        'IMX': 'immutable-x',
        'VET': 'vechain',
        'TAO': 'bittensor',
        'POL': 'polygon-ecosystem-token',
        'FIL': 'filecoin',
        'OP': 'optimism',
        'ARB': 'arbitrum',
        'BONK': 'bonk',
        'INJ': 'injective-protocol'
    };
    
    return symbolToIdMap[symbol.toUpperCase()] || symbol.toLowerCase();
}

// ============================================
// NEW PRIVACY-PRESERVING COIN SYSTEM  
// ============================================

// Function to fetch complete CoinGecko token list (all supported tokens)
async function fetchAllCoinGeckoTokens() {
    // Check if we already have tokens in localStorage
    const cachedTokens = localStorage.getItem('allCoinGeckoTokens');
    if (cachedTokens) {
        try {
            const tokens = JSON.parse(cachedTokens);
            if (Array.isArray(tokens) && tokens.length > 0) {
                return tokens; // Return cached data without API call
            }
        } catch (error) {
            // If parsing fails, proceed with API call
        }
    }
    
    const apiUrl = 'https://api.coingecko.com/api/v3/coins/list';
    
    try {
        // Try direct fetch first (works when served from web server)
        const response = await fetch(apiUrl, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
            }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const allTokens = await response.json();
        
        // Validate that we got an array of tokens
        if (!Array.isArray(allTokens)) {
            throw new Error('Invalid response format: expected array of tokens');
        }
        
        // Store in localStorage with timestamp
        localStorage.setItem('allCoinGeckoTokens', JSON.stringify(allTokens));
        localStorage.setItem('allTokensLastFetched', Date.now().toString());
        
        return allTokens;
    } catch (directError) {
        // If direct fetch fails (CORS), try proxy as fallback
        const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(apiUrl)}`;
        
        try {
            const response = await $.ajax({
                url: proxyUrl,
                method: 'GET',
                dataType: 'json',
                timeout: 20000
            });
            
            const responseData = JSON.parse(response.contents);
            
            // Check if the response is an error from CoinGecko API
            if (responseData.status && responseData.status.error_code) {
                throw new Error(`CoinGecko API Error: ${responseData.status.error_message}`);
            }
            
            // Validate that we got an array of tokens
            if (!Array.isArray(responseData)) {
                throw new Error('Invalid response format: expected array of tokens');
            }
            
            const allTokens = responseData;
            
            // Store in localStorage with timestamp
            localStorage.setItem('allCoinGeckoTokens', JSON.stringify(allTokens));
            localStorage.setItem('allTokensLastFetched', Date.now().toString());
            
            return allTokens;
        } catch (proxyError) {
            // Clear the bad data from localStorage if it exists
            const badData = localStorage.getItem('allCoinGeckoTokens');
            if (badData) {
                try {
                    const parsed = JSON.parse(badData);
                    if (parsed.status && parsed.status.error_code) {
                        localStorage.removeItem('allCoinGeckoTokens');
                        localStorage.removeItem('allTokensLastFetched');
                    }
                } catch (e) {
                    // Ignore parsing errors here
                }
            }
            
            // Return empty array if no valid cache available
            return [];
        }
    }
}

// Function to get all tokens from localStorage
function getAllCoinGeckoTokens() {
    const tokens = localStorage.getItem('allCoinGeckoTokens');
    return tokens ? JSON.parse(tokens) : [];
}

// Function to get user's desired assets (their actual portfolio)
function getUserDesiredAssets() {
    const assets = localStorage.getItem('userDesiredAssets');
    return assets ? JSON.parse(assets) : [];
}

// Function to save user's desired assets  
function saveUserDesiredAssets(assets) {
    localStorage.setItem('userDesiredAssets', JSON.stringify(assets));
}

// Function to generate random spoof assets for privacy
function generateSpoofAssetsList(userAssetIds, spoofCount = 150) {
    const allTokens = getAllCoinGeckoTokens();
    if (allTokens.length === 0) return userAssetIds;
    
    // Get random assets excluding user's actual assets
    const availableForSpoof = allTokens.filter(token => !userAssetIds.includes(token.id));
    const randomSpoofs = [];
    
    for (let i = 0; i < spoofCount && i < availableForSpoof.length; i++) {
        const randomIndex = Math.floor(Math.random() * availableForSpoof.length);
        const randomToken = availableForSpoof.splice(randomIndex, 1)[0];
        randomSpoofs.push(randomToken.id);
    }
    
    // Combine user assets with spoof assets and shuffle
    const combinedIds = [...userAssetIds, ...randomSpoofs];
    return combinedIds.sort(() => Math.random() - 0.5); // Shuffle array
}

// Function to fetch market data for user assets + spoofs
async function fetchMarketDataWithSpoofing() {
    const userAssets = getUserDesiredAssets();
    const userAssetIds = userAssets.map(asset => asset.id);
    
    if (userAssetIds.length === 0) {
        return [];
    }
    
    // Generate spoofed request with user assets + random assets  
    const spoofedIds = generateSpoofAssetsList(userAssetIds, 150);
    const idsParam = spoofedIds.join(',');
    
    
    const apiUrl = 'https://api.coingecko.com/api/v3/coins/markets';
    const params = new URLSearchParams({
        vs_currency: 'usd',
        ids: idsParam
    });
    const fullUrl = `${apiUrl}?${params}`;
    const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(fullUrl)}`;
    
    try {
        const response = await $.ajax({
            url: proxyUrl,
            method: 'GET',
            dataType: 'json', 
            timeout: 20000
        });
        
        const marketData = JSON.parse(response.contents);
        
        // Filter to only return data for user's actual assets
        const userMarketData = marketData.filter(coin => userAssetIds.includes(coin.id));
        
        return userMarketData;
    } catch (error) {
        return [];
    }
}

// Rate-limit compliant fetching with fallback strategy for CoinGecko free tier limits
async function fetchAvailableAssetsEfficient(cacheLimit, pagesNeeded) {
    const allCryptos = [];
    const delayBetweenPages = 2500; // 2.5 seconds = well under 30 calls/minute limit
    let consecutiveFailures = 0;
    
    
    // Check if we've hit the 500-coin barrier before
    const savedAssets = getAvailableAssets();
    if (savedAssets.length >= 500 && cacheLimit > 500) {
    }
    
    for (let page = 1; page <= pagesNeeded; page++) {
        try {
            
            // Use CORS proxy for GitHub Pages deployment
            const apiUrl = 'https://api.coingecko.com/api/v3/coins/markets';
            const params = new URLSearchParams({
                vs_currency: 'usd',
                order: 'market_cap_desc',
                per_page: 250,
                page: page,
                sparkline: false,
                price_change_percentage: '24h'
            });
            const fullUrl = `${apiUrl}?${params}`;
            const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(fullUrl)}`;
            
            const response = await $.ajax({
                url: proxyUrl,
                method: 'GET',
                dataType: 'json',
                timeout: 15000, // Increased timeout for proxy
                error: function(xhr, status, error) {
                    // Handle errors silently
                }
            });
            
            // Parse the response from the CORS proxy
            const coinData = JSON.parse(response.contents);
            
            // Process this page's coins
            let coinsAddedFromPage = 0;
            coinData.forEach((coin, coinIndex) => {
                const rank = ((page - 1) * 250) + coinIndex + 1;
                
                // Stop when we reach the cache limit
                if (allCryptos.length >= cacheLimit) {
                    return;
                }
                
                allCryptos.push({
                    asset_id: coin.symbol.toUpperCase(),
                    name: coin.name,
                    symbol: coin.symbol.toUpperCase(),
                    type_is_crypto: 1,
                    cmc_id: coin.market_cap_rank || rank,
                    rank: coin.market_cap_rank || rank,
                    is_active: true,
                    price: coin.current_price,
                    percent_change_24h: coin.price_change_percentage_24h || 0,
                    market_cap: coin.market_cap,
                    volume_24h: coin.total_volume,
                    last_updated: new Date().toISOString(),
                    icon_url: coin.image
                });
                coinsAddedFromPage++;
            });
            
            
            // Reset consecutive failures on success
            consecutiveFailures = 0;
            
            // Stop early if we've reached our target
            if (allCryptos.length >= cacheLimit) {
                break;
            }
            
            // Delay before next page (except for the last page)
            if (page < pagesNeeded && allCryptos.length < cacheLimit) {
                await new Promise(resolve => setTimeout(resolve, delayBetweenPages));
            }
            
        } catch (error) {
            consecutiveFailures++;
            
            // Check if it's a CORS error (status 0)
            if (error.status === 0) {
                // If we have some cached data, use it
                const existingCache = getAvailableAssets();
                if (existingCache.length > 0) {
                    updateCachedAssetCount();
                }
                
                // Stop trying if CORS error
                break;
            }
            
            // Don't need to increase delays - we're already respecting rate limits
            
            // For API rate limiting (429), wait longer with exponential backoff and multiple retries
            if (error.status === 429) {
                // Progressive backoff: 30s, 60s, 90s for retries
                const baseWaitTime = 30000; // Start with 30 seconds
                const waitTime = baseWaitTime + ((consecutiveFailures - 1) * 30000);
                await new Promise(resolve => setTimeout(resolve, waitTime));
                
                try {
                    const retryProxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(fullUrl)}`;
                    const retryResponse = await $.ajax({
                        url: retryProxyUrl,
                        method: 'GET',
                        dataType: 'json',
                        timeout: 15000,
                        error: function(xhr, status, error) {
                            // Handle errors silently
                        }
                    });
                    
                    // Process retry response same as above
                    const retryCoinData = JSON.parse(retryResponse.contents);
                    let coinsAddedFromPage = 0;
                    retryCoinData.forEach((coin, coinIndex) => {
                        if (allCryptos.length >= cacheLimit) return;
                        const rank = ((page - 1) * 250) + coinIndex + 1;
                        allCryptos.push({
                            asset_id: coin.symbol.toUpperCase(),
                            name: coin.name,
                            symbol: coin.symbol.toUpperCase(),
                            type_is_crypto: 1,
                            cmc_id: coin.market_cap_rank || rank,
                            rank: coin.market_cap_rank || rank,
                            is_active: true,
                            price: coin.current_price,
                            percent_change_24h: coin.price_change_percentage_24h || 0,
                            market_cap: coin.market_cap,
                            volume_24h: coin.total_volume,
                            last_updated: new Date().toISOString(),
                            icon_url: coin.image
                        });
                        coinsAddedFromPage++;
                    });
                    
                    
                } catch (retryError) {
                    
                    // Allow more retries specifically for pages beyond 500 coins
                    const maxRetries = page <= 5 ? 2 : 5; // More retries for higher pages
                    if (consecutiveFailures >= maxRetries) {
                        break;
                    }
                    
                    // If we have some coins, continue. If none, fail completely
                    if (allCryptos.length === 0) {
                        throw new Error(`Failed to fetch any data. Could not fetch page ${page}.`);
                    }
                    // Continue to next page instead of breaking
                }
            } else {
                // For non-rate-limit errors, just skip this page and continue
                
                // Don't break - just continue to the next page
                // Only stop if we have no data at all
                if (allCryptos.length === 0 && page === 1) {
                    throw new Error(`Failed to fetch any data. Error on page ${page}: ${error.message}`);
                }
            }
        }
    }
    
    // Ensure we have the requested amount (trim if over)
    const finalCryptos = allCryptos.slice(0, cacheLimit);
    
    // Sort by market cap rank to ensure proper order
    finalCryptos.sort((a, b) => a.rank - b.rank);
    
    // Log final results with helpful information
    if (finalCryptos.length < cacheLimit) {
    } else {
    }
    
    saveAvailableAssets(finalCryptos);
    localStorage.setItem('assetsLastFetched', Date.now().toString());
    updateCachedAssetCount();
    return finalCryptos;
}

// Function to fetch top cryptocurrencies from CoinGecko based on cache limit setting
function fetchAvailableAssets() {
    const lastFetched = localStorage.getItem('allTokensLastFetched');
    const oneDayAgo = Date.now() - (24 * 60 * 60 * 1000); // 24 hours
    
    // Check if we need to refresh the complete token list (once per day)
    if (!lastFetched || parseInt(lastFetched) < oneDayAgo) {
        return fetchAllCoinGeckoTokens();
    } else {
        return Promise.resolve(getAllCoinGeckoTokens());
    }
}

// Fallback function to fetch coins from CoinGecko if pagination fails
function fetchTop100FromCoinGecko() {
    const cacheLimit = getCacheLimit();
    const perPage = Math.min(cacheLimit, 100); // Max 100 per page for fallback
    
    // Use CORS proxy for fallback as well
    const apiUrl = 'https://api.coingecko.com/api/v3/coins/markets';
    const params = new URLSearchParams({
        vs_currency: 'usd',
        order: 'market_cap_desc',
        per_page: perPage,
        page: 1,
        sparkline: false,
        price_change_percentage: '24h'
    });
    const fullUrl = `${apiUrl}?${params}`;
    const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(fullUrl)}`;
    
    return $.ajax({
        url: proxyUrl,
        method: 'GET',
        dataType: 'json'
    }).then(response => {
        const coinData = JSON.parse(response.contents);
        const cryptoAssets = coinData.map((coin, index) => ({
            asset_id: coin.symbol.toUpperCase(),
            name: coin.name,
            symbol: coin.symbol.toUpperCase(),
            type_is_crypto: 1,
            cmc_id: coin.market_cap_rank || index + 1,
            rank: coin.market_cap_rank || index + 1,
            is_active: true,
            price: coin.current_price,
            percent_change_24h: coin.price_change_percentage_24h || 0,
            market_cap: coin.market_cap,
            volume_24h: coin.total_volume,
            last_updated: new Date().toISOString(),
            icon_url: coin.image // CoinGecko provides excellent icons
        }));
        
        saveAvailableAssets(cryptoAssets);
        localStorage.setItem('assetsLastFetched', Date.now().toString());
        updateCachedAssetCount();
        return cryptoAssets;
    });
}

// Function to search assets by name or symbol (optimized for 500+ assets)
function searchAssets(query) {
    const assets = getAllCoinGeckoTokens(); // Use complete token list
    if (!query) return assets.slice(0, 30); // Return top 30 if no query
    
    const normalizedQuery = query.toLowerCase();
    
    // Enhanced search with intelligent ranking
    const results = assets
        .map(asset => {
            const name = (asset.name || '').toLowerCase();
            const symbol = (asset.symbol || '').toLowerCase();
            let score = 0;
            
            // Exact symbol match gets highest priority
            if (symbol === normalizedQuery) score += 1000;
            // Symbol starts with query
            else if (symbol.startsWith(normalizedQuery)) score += 500;
            // Name starts with query
            else if (name.startsWith(normalizedQuery)) score += 300;
            // Symbol contains query
            else if (symbol.includes(normalizedQuery)) score += 200;
            // Name contains query
            else if (name.includes(normalizedQuery)) score += 100;
            
            // Boost score for matches (no rank available in token list)
            // Results will be naturally ordered by search relevance
            
            return { asset, score };
        })
        .filter(item => item.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, 40) // Show top 40 results for better UX
        .map(item => item.asset);
    
    return results;
}

// Function to fetch currency exchange rates
function fetchCurrencyRates() {
    const apiKey = getCurrencyApiKey();
    
    // If no API key is set, return a rejected promise
    if (!apiKey || apiKey === 'null' || apiKey.trim() === '') {
        return $.Deferred().reject({ 
            status: 401, 
            message: 'Currency API key not configured' 
        }).promise();
    }
    
    return $.ajax({
        url: `https://api.currencyapi.com/v3/latest?apikey=${apiKey}&currencies=`,
        method: 'GET',
        dataType: 'json'
    });
}

// Function to format numbers as currency
function formatCurrency(value, currency = 'USD') {
    // Ensure currency is valid and defined
    if (!currency || typeof currency !== 'string') {
        currency = 'USD';
    }
    
    try {
        return new Intl.NumberFormat('en-US', { 
            style: 'currency', 
            currency: currency.toUpperCase() 
        }).format(value);
    } catch (error) {
        // Fallback to USD if currency is invalid
        return new Intl.NumberFormat('en-US', { 
            style: 'currency', 
            currency: 'USD' 
        }).format(value);
    }
}

// Function to format Quantity with commas and no decimal places
function formatQty(value) {
    return `${value.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,')}`;
}

// Function to format USD rate with commas and four decimal places
function formatRate(value, currency) {
    return `${currency} ${value.toFixed(4).replace(/\d(?=(\d{3})+\.)/g, '$&,')}`;
}

// Function to format percentage allocation
function formatPercentage(value) {
    return `${value.toFixed(2)}%`;
}

// Encrypt data with AES
function encryptData(data, password) {
    return CryptoJS.AES.encrypt(JSON.stringify(data), password).toString();
}

// Decrypt data with AES
function decryptData(encryptedData, password) {
    // Ensure password is valid
    if (!password || password === 'undefined' || password === '') {
        password = 'fallback';
    }
    
    try {
        const bytes = CryptoJS.AES.decrypt(encryptedData, password);
        const decryptedText = bytes.toString(CryptoJS.enc.Utf8);
        
        // Check if decryption was successful
        if (!decryptedText) {
            throw new Error('Failed to decrypt - invalid password or corrupted data');
        }
        
        return JSON.parse(decryptedText);
    } catch (error) {
        throw error;
    }
}

// Save holdings data to localStorage
function saveHoldings(holdings, password) {
    const encryptedData = encryptData(holdings, password);
    localStorage.setItem('holdings', encryptedData);
}

// Get holdings data from localStorage
function getHoldings(password) {
    // Use default password if none provided
    const defaultPassword = 'fallback';
    const actualPassword = password || defaultPassword;
    
    const encryptedData = localStorage.getItem('holdings');
    if (encryptedData) {
        try {
            return decryptData(encryptedData, actualPassword);
        } catch (e) {
            // Try with different password if first attempt fails
            if (!password) {
                try {
                    return decryptData(encryptedData, 'fallback');
                } catch (e2) {
                    return [];
                }
            }
            return [];
        }
    }
    return [];
}

// Save preferred currency to localStorage
function savePreferredCurrency(currency) {
    localStorage.setItem('preferredCurrency', currency);
}

// Get preferred currency from localStorage
function getPreferredCurrency() {
    return localStorage.getItem('preferredCurrency') || 'USD';
}

// Save currency rates to localStorage
function saveCurrencyRates(rates) {
    localStorage.setItem('currencyRates', JSON.stringify(rates));
}

// Save currency day delta to localStorage
function saveCurrencyDayDelta(delta) {
    localStorage.setItem('deltaDay', JSON.stringify(delta.day));
}

// Get currency rates from localStorage
function getCurrencyRates() {
    const rates = localStorage.getItem('currencyRates');
    return rates ? JSON.parse(rates) : {};
}

// Save timestamp of last currency rate fetch to localStorage
function saveLastFetchTimestamp(timestamp) {
    localStorage.setItem('lastFetchTimestamp', timestamp);
}

// Get timestamp of last currency rate fetch from localStorage
function getLastFetchTimestamp() {
    return localStorage.getItem('lastFetchTimestamp');
}

// Check if 12 hours have passed since the last fetch
function shouldFetchRates() {
    const lastFetch = getLastFetchTimestamp();
    if (!lastFetch) return true;
    const now = Date.now();
    const hoursDifference = (now - lastFetch) / (1000 * 60 * 60); // Convert milliseconds to hours
    return hoursDifference >= 12;
}

function loadCurrencyOptions() {
    const select = $('#preferred-currency');

    currencies.forEach(currency => {
        select.append(`<option value="${currency.Code}">${currency.Name} (${currency.Code})</option>`);
    });

    // Set the selected value to the preferred currency
    $('#preferred-currency').val(getPreferredCurrency());
}

// Enhanced error logging for debugging
window.addEventListener('error', (event) => {
    // Handle errors silently
});

window.addEventListener('unhandledrejection', (event) => {
    // Handle errors silently
});


$(document).ready(() => {
    
    // Check if running in Electron
    const isElectron = (typeof window !== 'undefined' && window.process && window.process.type === 'renderer') || 
                       (navigator.userAgent.toLowerCase().indexOf(' electron/') > -1) ||
                       (window.location.search.includes('electron=true'));
    
    
    // Only show warning if NOT in Electron and using file:// protocol
    if (window.location.protocol === 'file:' && !isElectron) {
        
        // Show alert to user
        // alert('⚠️ Important: You\'re running this app directly from a file.\n\n' +
        //       'This will prevent cryptocurrency data from loading due to browser security restrictions.\n\n' +
        //       'To fix this:\n' +
        //       '1. Open Terminal in the app folder\n' +
        //       '2. Run: python3 server.py\n' +
        //       '3. Open: http://localhost:8000\n\n' +
        //       'See README.md for more details.');
    } else if (isElectron) {
    }
    
    // Load the currency options
    loadCurrencyOptions();
    
    // Update cached asset count display
    updateCachedAssetCount();
    
    // Load and display current cache limit
    const currentCacheLimit = getCacheLimit();
    $('#cache-limit').val(currentCacheLimit);
    $('#current-cache-limit').text(currentCacheLimit);
    
    
    // Check if the Currency API key is set and display it in the input field if available
    const currencyApiKey = getCurrencyApiKey();
    if (currencyApiKey) {
        $('#currency-api-key').val(currencyApiKey);
    }

    // On page load: fetch coin list, then fetch market data with spoofing
    fetchAllCoinGeckoTokens().then(() => {
        updateCachedAssetCount();
        // Now refresh portfolio prices with the new privacy-preserving approach
        return refreshPrices();
    }).catch(error => {
        // Handle initialization errors silently
    });

    // Fetch and update currency rates if more than 12 hours have passed since the last fetch
    if (shouldFetchRates()) {
        fetchCurrencyRates().done(response => {
            saveCurrencyRates(response.data);
            saveLastFetchTimestamp(Date.now());
            updateTable();
        }).fail(() => {
            updateTable(); // Use cached rates if the fetch fails
        });
    } else {
        const sortBy = localStorage.getItem('sortBy') || 'totalValue';
        const sortOrder = localStorage.getItem('sortOrder') || 'desc';
        updateTable(sortBy, sortOrder); // Use cached rates, sorted by default or previously saved sort order
    }

    // Auto-refresh handles price updates automatically
});

// Save Currency API key
$('#save-currency-api-key').click(() => {
    const apiKey = $('#currency-api-key').val();
    if (apiKey) {
        saveCurrencyApiKey(apiKey);
        $('#currency-api-key').val(apiKey); // Show the API key in the input field
        alert('Currency API Key saved!');
        fetchCurrencyRates().done(response => {
            saveCurrencyRates(response.data);
            saveLastFetchTimestamp(Date.now());
            updateTable();
        }).fail(() => {
            // Handle currency rate fetch errors silently
        });
    }
});

// Save cache limit setting
$('#save-cache-limit').click(() => {
    const limit = parseInt($('#cache-limit').val());
    if (limit && limit >= 100 && limit <= 5000) {
        const $button = $('#save-cache-limit');
        const originalText = $button.text();
        
        saveCacheLimit(limit);
        $('#current-cache-limit').text(limit);
        $('#cache-limit-display').text(limit); // Update header display immediately
        
        // Show loading state
        $button.text('Loading...').prop('disabled', true);
        
        // Clear current cache to force re-fetch with new limit
        localStorage.removeItem('assetsLastFetched');
        
        // Close the settings modal immediately
        $('#settings-modal').hide();
        
        // Log cache update info
        const pages = Math.ceil(limit / 100);
        const estimatedTime = Math.ceil(pages * 2.5); // Rate-limit compliant: 2.5 seconds per page
        
        
        // Trigger a new fetch with the updated limit
        fetchAvailableAssets().then(() => {
            $button.text(originalText).prop('disabled', false);
        }).catch(error => {
            $button.text(originalText).prop('disabled', false);
        });
    } else {
        alert('Please enter a valid number between 100 and 5000');
    }
});

$('#preferred-currency').change(() => {
    const currency = $('#preferred-currency').val();
    savePreferredCurrency(currency);
    const sortBy = localStorage.getItem('sortBy') || 'totalValue';
    const sortOrder = localStorage.getItem('sortOrder') || 'asc';
    updateTable(sortBy, sortOrder);
});

// Show modal to add coin
$('#add-coin-btn').click(() => {
    $('#coin-search-modal').show();
});

// Cache refresh button (refresh coin list and portfolio with privacy spoofing)
$('#refresh-cache-btn').click(async () => {
    if (refreshInProgress) {
        return;
    }
    
    refreshInProgress = true;
    
    // Add visual feedback
    $('#refresh-cache-btn').addClass('fa-spin');
    
    try {
        // Force refresh the complete coin list
        await fetchAllCoinGeckoTokens();
        updateCachedAssetCount();
        
        // Refresh portfolio prices with spoofing
        await refreshPrices();
    } catch (error) {
        alert('Failed to refresh data. Please check your internet connection.');
    } finally {
        refreshInProgress = false;
        $('#refresh-cache-btn').removeClass('fa-spin');
    }
});

// Hide modal
$('.exit-coin-search').click(() => {
    $('#coin-search-modal').hide();
});

// Hide modal
$('.exit-coin-edit').click(() => {
    $('#coin-modal').hide();
});

// Hide modal
$('.exit-settings').click(() => {
    $('#settings-modal').hide();
});

// Show modal for settings
$('#settings-icon').click(() => {
    $('#settings-modal').show();
});

// Asset search functionality
$('#asset-search').on('input', function() {
    const query = $(this).val();
    const results = searchAssets(query);
    displaySearchResults(results);
});

// Function to display search results
function displaySearchResults(assets) {
    const container = $('#search-results');
    container.empty();
    
    if (assets.length === 0) {
        container.append('<div class="search-result-item">No assets found</div>');
        return;
    }
    
    // Create table structure
    const tableHtml = `
        <table class="search-results-table">
            <thead>
                <tr>
                    <th>Name</th>
                    <th>Symbol</th>
                    <th>ID</th>
                </tr>
            </thead>
            <tbody>
                ${assets.map(asset => `
                    <tr class="search-result-item" data-asset-id="${asset.id}" data-asset-symbol="${asset.symbol}" data-asset-name="${asset.name}">
                        <td>${asset.name}</td>
                        <td>${asset.symbol.toUpperCase()}</td>
                        <td>${asset.id}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
    
    container.append(tableHtml);
}

// Handle asset selection from search results
$(document).on('click', '.search-result-item', function() {
    const assetId = $(this).data('asset-id');
    const assetSymbol = $(this).data('asset-symbol');
    const assetName = $(this).data('asset-name');
    
    // Store the selected asset globally for the save function to access
    window.selectedAsset = { id: assetId, symbol: assetSymbol, name: assetName };
    
    // Pre-fill the add coin modal with selected asset
    $('#coin-code').val(assetSymbol.toUpperCase());
    $('#coin-symbol').val(assetName);
    
    // Hide search modal and show add modal
    $('#coin-search-modal').hide();
    $('#coin-modal').show();
});

// Add/Edit coin
$('#save-coin-btn').click(async () => {
    const code = $('#coin-code').val().toUpperCase();
    const name = $('#coin-symbol').val();
    const qty = parseFloat($('#coin-quantity').val());
    const apiKey = 'fallback';
    const currentHoldings = getHoldings();

    if (code && name && qty && qty > 0) {
        let token = null;
        
        // Use selected asset if available (from search results)
        if (window.selectedAsset && window.selectedAsset.id) {
            token = { id: window.selectedAsset.id, symbol: window.selectedAsset.symbol, name: window.selectedAsset.name };
        } else {
            // Fallback: Find the token in our complete list
            const allTokens = getAllCoinGeckoTokens();
            token = allTokens.find(t => 
                t.symbol.toUpperCase() === code || 
                t.id === code.toLowerCase()
            );
        }
        
        if (!token || !token.id) {
            alert('Asset not found. Please select from the search results.');
            return;
        }
        
        // Check if already exists in holdings (use CoinGecko ID as primary identifier)
        const existing = currentHoldings.find(c => c.coinGeckoId === token.id);
        
        if (existing) {
            // Update existing holding
            existing.quantity = qty;
            existing.name = name;
            existing.code = code; // Keep symbol for display
            existing.symbol = code;
        } else {
            // Add new holding with CoinGecko ID as primary identifier
            currentHoldings.push({ 
                coinGeckoId: token.id, // Primary identifier
                code: code, // Symbol for display
                symbol: code, // Symbol for display
                quantity: qty,
                name: name,
                rate: 0,
                quote_asset: 'USD',
                icon_url: '',
                deltaday: 1
            });
        }
        
        // Save holdings
        saveHoldings(currentHoldings, apiKey);
        
        
        // Clear form and selected asset
        $('#coin-code').val('');
        $('#coin-symbol').val('');
        $('#coin-quantity').val('');
        $('#coin-modal').hide();
        window.selectedAsset = null; // Clear the selected asset
        
        // Refresh prices to get latest data for new/updated holding
        await refreshPrices();
        
    } else {
        alert('Please enter valid coin symbol, name, and quantity.');
    }
});

// Function to update holdings table
function updateTable(sortBy = null, sortOrder = null) {
    const holdings = getHoldings();
    const tbody = $('#holdings-table tbody');
    tbody.empty();

    let totalValue = 0;
    let weightedPercentageChange = 0;
    const preferredCurrency = getPreferredCurrency();
    const exchangeRates = getCurrencyRates();

    holdings.forEach(holding => {
        const total = holding.quantity * holding.rate * (exchangeRates[preferredCurrency]?.value || 1);
        totalValue += total;
    });

    holdings.forEach(holding => {
        const total = holding.quantity * holding.rate * (exchangeRates[preferredCurrency]?.value || 1);
        const allocation = (total / totalValue) * 100;
        weightedPercentageChange += (allocation / 100) * ((holding.deltaday - 1) * 100);
    });

    if (sortBy) {
        holdings.sort((a, b) => {
            if (sortBy === 'totalValue') {
                const valueA = a.quantity * a.rate;
                const valueB = b.quantity * b.rate;
                return sortOrder === 'asc' ? valueA - valueB : valueB - valueA;
            } else if (sortBy === 'allocation') {
                const allocationA = (a.quantity * a.rate) / totalValue;
                const allocationB = (b.quantity * b.rate) / totalValue;
                return sortOrder === 'asc' ? allocationA - allocationB : allocationB - allocationA;
            }
        });
    }

    holdings.forEach(holding => {
        const total = holding.quantity * holding.rate * (exchangeRates[preferredCurrency]?.value || 1);
        const allocation = (total / totalValue) * 100;
        const row = `<tr>
            <td><div class="right"><div class="assetimgbox"><img src="${holding.icon_url || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMTYiIGN5PSIxNiIgcj0iMTYiIGZpbGw9IiNGM0Y0RjYiLz4KPHBhdGggZD0iTTEyIDJDNi40OCAyIDIgNi40OCAyIDEyUzYuNDggMjIgMTIgMjJTMjIgMTcuNTIgMjIgMTJTMTcuNTIgMiAxMiAyWiIgZmlsbD0iIzY2NjY2NiIvPgo8L3N2Zz4='}" alt="${holding.name}" width="32" height="32" onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMTYiIGN5PSIxNiIgcj0iMTYiIGZpbGw9IiNGM0Y0RjYiLz4KPHBhdGggZD0iTTEyIDJDNi40OCAyIDIgNi40OCAyIDEyUzYuNDggMjIgMTIgMjJTMjIgMTcuNTIgMjIgMTJTMTcuNTIgMiAxMiAyWiIgZmlsbD0iIzY2NjY2NiIvPgo8L3N2Zz4='"><div class="asset-text">${holding.name}</div></div></div></td>
            <td><div class="right">${formatRate(holding.rate * (exchangeRates[preferredCurrency]?.value || 1), preferredCurrency)} ${holding.quote_asset ? `(${holding.quote_asset})` : ''} ${formatDelta(holding.deltaday)}</div></td>
            <td><div class="right">${formatQty(holding.quantity)}</div></td>
            <td><div class="right">${formatCurrency(total, preferredCurrency)}</div></td>
            <td><div class="right">${formatPercentage(allocation)}</div></td>
            <td><div class="right"><div class="rowoptions">
                <i class="edit-btn fa-regular fa-pen-to-square" data-coingecko-id="${holding.coinGeckoId}"></i>
                <i class="delete-btn fa-solid fa-trash" data-coingecko-id="${holding.coinGeckoId}"></i>
            </div></div></td>
        </tr>`;
        tbody.append(row);
    });

    const totalValueChange = (totalValue * weightedPercentageChange) / 100;

    $('#total-computed-value').text(formatCurrency(totalValue, preferredCurrency));
    $('#total-change-percentage').html(`${formatDelta(weightedPercentageChange / 100 + 1)}`);
    $('#total-change-value').text(`${weightedPercentageChange >= 0 ? '+' : '-'} ${formatCurrency(Math.abs(totalValueChange), preferredCurrency)} Today`);

    // Event listener handling for buttons
    $('.edit-btn').click(function() {
        const coinGeckoId = $(this).data('coingecko-id');
        const holding = holdings.find(c => c.coinGeckoId === coinGeckoId);
        if (holding) {
            // Store the selected asset for editing
            window.selectedAsset = { id: holding.coinGeckoId, symbol: holding.symbol, name: holding.name };
            $('#coin-code').val(holding.code);
            $('#coin-symbol').val(holding.name);
            $('#coin-quantity').val(holding.quantity);
            $('#coin-modal').show();
        }
    });

    $('.delete-btn').click(function() {
        const coinGeckoId = $(this).data('coingecko-id');
        const updatedHoldings = holdings.filter(c => c.coinGeckoId !== coinGeckoId);
        saveHoldings(updatedHoldings, 'fallback'); // Assuming 'fallback' is the default password
        updateTable(sortBy, sortOrder);
    });
}

// Function to refresh all prices and update portfolio
async function refreshPrices() {
    // First, ensure we have the latest coin list
    await fetchAllCoinGeckoTokens();
    const allTokens = getAllCoinGeckoTokens();
    
    // Get current holdings
    const holdings = getHoldings();
    if (holdings.length === 0) {
        updateTable();
        return Promise.resolve();
    }
    
    // Map holdings to CoinGecko IDs
    const userAssetIds = [];
    const holdingToTokenMap = {};
    
    holdings.forEach(holding => {
        // Use stored coinGeckoId if available, otherwise try to find by symbol
        if (holding.coinGeckoId) {
            userAssetIds.push(holding.coinGeckoId);
            holdingToTokenMap[holding.coinGeckoId] = holding.coinGeckoId; // Map ID to ID
        } else {
            // For legacy holdings without coinGeckoId, try to find by symbol and update the holding
            const token = allTokens.find(t => 
                t.symbol.toLowerCase() === holding.code.toLowerCase() ||
                t.symbol.toLowerCase() === holding.symbol?.toLowerCase()
            );
            if (token) {
                userAssetIds.push(token.id);
                holdingToTokenMap[token.id] = token.id; // Map ID to ID
                // Update the holding with the found coinGeckoId for future use
                holding.coinGeckoId = token.id;
            }
        }
    });
    
    if (userAssetIds.length === 0) {
        updateTable();
        return Promise.resolve();
    }
    
    // Generate spoofed list with 150 random assets for privacy
    const spoofedIds = generateSpoofAssetsList(userAssetIds, 150);
    const idsParam = spoofedIds.join(',');
    
    // Fetch market data with spoofed list
    const apiUrl = 'https://api.coingecko.com/api/v3/coins/markets';
    const params = new URLSearchParams({
        vs_currency: 'usd',
        ids: idsParam
    });
    const fullUrl = `${apiUrl}?${params}`;
    
    let marketData = [];
    
    try {
        // Try direct fetch first (works when served from web server)
        const response = await fetch(fullUrl, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
            }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        marketData = await response.json();
        
        // Validate that we got an array
        if (!Array.isArray(marketData)) {
            throw new Error('Invalid response format: expected array of market data');
        }
        
    } catch (directError) {
        // If direct fetch fails (CORS), try proxy as fallback
        const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(fullUrl)}`;
        
        try {
            const response = await $.ajax({
                url: proxyUrl,
                method: 'GET',
                dataType: 'json',
                timeout: 20000
            });
            
            const responseData = JSON.parse(response.contents);
            
            // Check if the response is an error from CoinGecko API
            if (responseData.status && responseData.status.error_code) {
                throw new Error(`CoinGecko API Error: ${responseData.status.error_message}`);
            }
            
            // Validate that we got an array
            if (!Array.isArray(responseData)) {
                throw new Error('Invalid response format: expected array of market data');
            }
            
            marketData = responseData;
            
        } catch (proxyError) {
            throw proxyError;
        }
    }
    
    try {
        
        // Update holdings with fresh market data
        const updatedHoldings = holdings.map(holding => {
            // Use coinGeckoId directly to find market data
            const tokenId = holding.coinGeckoId;
            if (tokenId) {
                const coinData = marketData.find(m => m.id === tokenId);
                if (coinData) {
                    return {
                        ...holding,
                        rate: coinData.current_price,
                        deltaday: 1 + ((coinData.price_change_percentage_24h || 0) / 100),
                        quote_asset: 'USD',
                        icon_url: coinData.image,
                        last_updated: coinData.last_updated
                    };
                }
            }
            return holding; // Keep original if no update available
        });
        
        // Save updated holdings
        const apiKey = 'fallback';
        saveHoldings(updatedHoldings, apiKey);
        
        // Update display
        const sortBy = localStorage.getItem('sortBy') || 'totalValue';
        const sortOrder = localStorage.getItem('sortOrder') || 'asc';
        updateTable(sortBy, sortOrder);
        
    } catch (error) {
        alert('Failed to refresh prices. Please check your internet connection.');
    }
    
    return Promise.resolve();
}

// Wrap the sort function to save state to localStorage
function sortTable(sortBy) {
    let sortOrder = localStorage.getItem('sortOrder') || 'desc';
    if (localStorage.getItem('sortBy') === sortBy) {
        sortOrder = sortOrder === 'asc' ? 'desc' : 'asc';
    } else {
        sortOrder = 'asc';
    }

    localStorage.setItem('sortBy', sortBy);
    localStorage.setItem('sortOrder', sortOrder);

    updateTable(sortBy, sortOrder);
}

document.getElementById('settings-icon').addEventListener('click', function() {
    var settingsDiv = document.getElementById('settings');
    if (settingsDiv.style.display === 'block' || settingsDiv.style.display === '') {
        settingsDiv.style.display = 'block';
    } else {
        settingsDiv.style.display = 'none';
    }
});

document.getElementById('dark-mode-toggle').addEventListener('click', function() {
    document.body.classList.toggle('dark-mode');
    
    // Store dark mode preference
    const isDarkMode = document.body.classList.contains('dark-mode');
    localStorage.setItem('darkMode', isDarkMode);
    
    // Update icon
    const icon = document.querySelector('#dark-mode-toggle i') || document.getElementById('dark-mode-toggle');
    if (isDarkMode) {
        icon.className = 'fas fa-sun';
    } else {
        icon.className = 'fas fa-moon';
    }
});



// YIELDS SCRIPT

$(document).ready(function() {
    const apiUrl = 'https://yields.llama.fi/pools';
    let allData = [];
    const pageSize = 10;
    const sortCycle = ['asc', 'desc', null];
    let sortDirection = {
        tvlUsd: null,
        apy: null,
        apyMean30d: null
    };

    // Tab handling code
    $('.tab').click(function() {
        const target = $(this).data('target');
        $('.tab').removeClass('active');
        $(this).addClass('active');
        $('.tab-content').removeClass('active');
        $(`#${target}`).addClass('active');
        
        if (target === 'apy-tab') {
            $('#min-apymean30d').val('0.50');
            $('#max-apymean30d').val('');
        } else if (target === 'apymean30d-tab') {
            $('#min-apy').val('0.50');
            $('#max-apy').val('');
        }

        filterAndDisplayData();
    });

    function fetchData() {
        $.ajax({
            url: apiUrl,
            method: 'GET',
            headers: {
                'accept': '*/*'
            },
            success: function(response) {
                if (response.status === 'success') {
                    allData = response.data.sort((a, b) => b.tvlUsd - a.tvlUsd);
                    filterAndDisplayData();
                }
            },
            error: function(err) {
                // Handle errors silently
            }
        });
    }

    function displayTable(data) {
        $('#pagination-container').pagination({
            dataSource: data,
            pageSize: pageSize,
            callback: function(data, pagination) {
                const $tbody = $('#crypto-table tbody');
                $tbody.empty();
                $.each(data, function(index, item) {
                    $tbody.append(`
                        <tr>
                            <td>${item.chain}</td>
                            <td>$${item.tvlUsd.toLocaleString()}</td>
                            <td>${item.project}</td>
                            <td>${item.symbol}</td>
                            <td>${parseFloat(item.apy).toFixed(2)}%</td>
                            <td>${parseFloat(item.apyMean30d).toFixed(2)}%</td>
                        </tr>
                    `);
                });
            }
        });
    }

    function filterData() {
        let selectedFilter = $('#filter-symbol').val();
        let symbolSearch = ($('#symbol-search').val() || '').toLowerCase().trim();
        let minTvl = $('#min-tvl').val();
        let maxTvl = $('#max-tvl').val();
        let minApy = $('#min-apy').val();
        let maxApy = $('#max-apy').val();
        let minApyMean30d = $('#min-apymean30d').val();
        let maxApyMean30d = $('#max-apymean30d').val();
        
        let filteredData = allData;
        
        // Apply keyword search filter for symbol column (matches within words)
        if (symbolSearch) {
            filteredData = filteredData.filter(item => 
                item.symbol && typeof item.symbol === 'string' && 
                item.symbol.toLowerCase().includes(symbolSearch)
            );
        }
        
        if (selectedFilter === 'ETH') {
            filteredData = filteredData.filter(item => 
                item.symbol && typeof item.symbol === 'string' && 
                item.symbol.includes('ETH')
            );
        } else if (selectedFilter === 'USD') {
            filteredData = filteredData.filter(item => 
                item.symbol && typeof item.symbol === 'string' && 
                item.symbol.includes('USD')
            );
        }

        minTvl = minTvl ? parseFloat(minTvl) : 0;
        maxTvl = maxTvl ? parseFloat(maxTvl) : Infinity;
        minApy = minApy ? parseFloat(minApy) : -Infinity;
        maxApy = maxApy ? parseFloat(maxApy) : Infinity;
        minApyMean30d = minApyMean30d ? parseFloat(minApyMean30d) : -Infinity;
        maxApyMean30d = maxApyMean30d ? parseFloat(maxApyMean30d) : Infinity;

        if ($('#apy-tab').hasClass('active')) {
            filteredData = filteredData.filter(item => 
                item.tvlUsd >= minTvl && item.tvlUsd <= maxTvl &&
                item.apy >= minApy && item.apy <= maxApy
            );
        } else if ($('#apymean30d-tab').hasClass('active')) {
            filteredData = filteredData.filter(item => 
                item.tvlUsd >= minTvl && item.tvlUsd <= maxTvl &&
                item.apyMean30d >= minApyMean30d && item.apyMean30d <= maxApyMean30d
            );
        }
        
        return filteredData;
    }

    function sortData(data, column) {
        const direction = sortDirection[column];
        if (direction === null) return data;

        return data.sort((a, b) => {
            if (direction === 'asc') {
                return a[column] - b[column];
            } else {
                return b[column] - a[column];
            }
        });
    }

    function filterAndDisplayData() {
        let filteredData = filterData();
        Object.keys(sortDirection).forEach(column => {
            if (sortDirection[column] !== null) {
                filteredData = sortData(filteredData, column);
            }
        });
        displayTable(filteredData);
    }

    fetchData();

    $('#symbol-search, #filter-symbol, #min-tvl, #max-tvl, #min-apy, #max-apy, #min-apymean30d, #max-apymean30d').on('input', filterAndDisplayData);

    $('#crypto-table').on('click', '.sortable', function() {
        const sortColumn = $(this).data('sort');
        const currentDirection = sortDirection[sortColumn];
        const nextDirectionIndex = (sortCycle.indexOf(currentDirection) + 1) % sortCycle.length;
        sortDirection = {
            tvlUsd: null,
            apy: null,
            apyMean30d: null,
        };
        sortDirection[sortColumn] = sortCycle[nextDirectionIndex];
        filterAndDisplayData();
    });
});

// Manual refresh only - no auto-refresh to preserve API calls
let refreshInProgress = false;


