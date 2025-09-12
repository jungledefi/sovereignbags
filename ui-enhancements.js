// UI Enhancement Module - Modern interactions and feedback

// Toast Notification System
class ToastNotification {
    constructor() {
        this.container = null;
        this.init();
    }
    
    init() {
        if (!document.getElementById('toast-container')) {
            this.container = document.createElement('div');
            this.container.id = 'toast-container';
            this.container.style.cssText = `
                position: fixed;
                bottom: 24px;
                right: 24px;
                z-index: 2000;
                display: flex;
                flex-direction: column;
                gap: 12px;
            `;
            document.body.appendChild(this.container);
        }
    }
    
    show(message, type = 'info', duration = 3000) {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        const icon = {
            success: '✓',
            error: '✕',
            warning: '⚠',
            info: 'ℹ'
        }[type] || 'ℹ';
        
        toast.innerHTML = `
            <span class="toast-icon">${icon}</span>
            <span class="toast-message">${message}</span>
        `;
        
        toast.style.cssText = `
            display: flex;
            align-items: center;
            gap: 12px;
            background: white;
            padding: 12px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            animation: slideInRight 0.3s ease;
            min-width: 250px;
            max-width: 400px;
            border-left: 4px solid ${
                type === 'success' ? '#00C781' :
                type === 'error' ? '#FF3B30' :
                type === 'warning' ? '#FF9500' :
                '#0066FF'
            };
        `;
        
        this.container.appendChild(toast);
        
        setTimeout(() => {
            toast.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => toast.remove(), 300);
        }, duration);
    }
}

// Loading State Manager
class LoadingStateManager {
    static showTableLoading() {
        const tbody = document.querySelector('#holdings-table tbody');
        if (!tbody) return;
        
        tbody.innerHTML = '';
        for (let i = 0; i < 5; i++) {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td><div class="skeleton" style="height: 40px; width: 150px;"></div></td>
                <td><div class="skeleton" style="height: 20px; width: 80px;"></div></td>
                <td><div class="skeleton" style="height: 20px; width: 100px;"></div></td>
                <td><div class="skeleton" style="height: 20px; width: 100px;"></div></td>
                <td><div class="skeleton" style="height: 20px; width: 60px;"></div></td>
                <td><div class="skeleton" style="height: 32px; width: 80px;"></div></td>
            `;
            tbody.appendChild(row);
        }
    }
    
    static showButtonLoading(button) {
        const originalContent = button.innerHTML;
        button.disabled = true;
        button.innerHTML = '<span class="loading"></span> Loading...';
        return () => {
            button.disabled = false;
            button.innerHTML = originalContent;
        };
    }
    
    static showInputLoading(input) {
        const wrapper = input.parentElement;
        const loader = document.createElement('div');
        loader.className = 'input-loader';
        loader.innerHTML = '<span class="loading"></span>';
        loader.style.cssText = `
            position: absolute;
            right: 12px;
            top: 50%;
            transform: translateY(-50%);
        `;
        wrapper.style.position = 'relative';
        wrapper.appendChild(loader);
        
        return () => loader.remove();
    }
}

// Smooth Scroll Enhancement
function smoothScrollTo(element) {
    element.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
    });
}

// Number Animation
function animateNumber(element, start, end, duration = 1000) {
    const startTime = performance.now();
    const difference = end - start;
    
    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing function for smooth animation
        const easeOutQuart = 1 - Math.pow(1 - progress, 4);
        const current = start + (difference * easeOutQuart);
        
        element.textContent = formatCurrency(current);
        
        if (progress < 1) {
            requestAnimationFrame(update);
        }
    }
    
    requestAnimationFrame(update);
}

// Format currency with proper locale
function formatCurrency(value) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(value);
}

// Enhanced Table Sorting with Visual Feedback
function enhancedTableSort(column) {
    const table = document.getElementById('holdings-table');
    const tbody = table.querySelector('tbody');
    const rows = Array.from(tbody.querySelectorAll('tr'));
    const headerCell = table.querySelector(`th[data-sort="${column}"]`);
    
    // Remove previous sort indicators
    table.querySelectorAll('th').forEach(th => {
        th.classList.remove('sort-asc', 'sort-desc');
    });
    
    // Determine sort direction
    const isAscending = headerCell.dataset.sortDirection !== 'asc';
    headerCell.dataset.sortDirection = isAscending ? 'asc' : 'desc';
    headerCell.classList.add(isAscending ? 'sort-asc' : 'sort-desc');
    
    // Add loading state
    tbody.style.opacity = '0.5';
    
    // Sort rows
    rows.sort((a, b) => {
        const aValue = a.dataset[column];
        const bValue = b.dataset[column];
        
        if (!isNaN(aValue) && !isNaN(bValue)) {
            return isAscending ? 
                parseFloat(aValue) - parseFloat(bValue) : 
                parseFloat(bValue) - parseFloat(aValue);
        }
        
        return isAscending ?
            aValue.localeCompare(bValue) :
            bValue.localeCompare(aValue);
    });
    
    // Animate reorder
    setTimeout(() => {
        tbody.innerHTML = '';
        rows.forEach((row, index) => {
            row.style.animation = `fadeIn 0.3s ease ${index * 0.05}s`;
            tbody.appendChild(row);
        });
        tbody.style.opacity = '1';
    }, 100);
}

// Search Input Enhancement with Debouncing
function enhanceSearchInput(inputId, callback, delay = 300) {
    const input = document.getElementById(inputId);
    if (!input) return;
    
    let timeoutId;
    
    input.addEventListener('input', (e) => {
        clearTimeout(timeoutId);
        
        // Show loading indicator
        const removeLoader = LoadingStateManager.showInputLoading(input);
        
        timeoutId = setTimeout(() => {
            callback(e.target.value);
            removeLoader();
        }, delay);
    });
    
    // Add clear button
    const clearBtn = document.createElement('button');
    clearBtn.className = 'input-clear';
    clearBtn.innerHTML = '✕';
    clearBtn.style.cssText = `
        position: absolute;
        right: 40px;
        top: 50%;
        transform: translateY(-50%);
        background: transparent;
        border: none;
        color: #6C757D;
        cursor: pointer;
        display: none;
    `;
    
    input.parentElement.style.position = 'relative';
    input.parentElement.appendChild(clearBtn);
    
    input.addEventListener('input', () => {
        clearBtn.style.display = input.value ? 'block' : 'none';
    });
    
    clearBtn.addEventListener('click', () => {
        input.value = '';
        input.dispatchEvent(new Event('input'));
        clearBtn.style.display = 'none';
    });
}

// Keyboard Navigation
function initKeyboardNavigation() {
    document.addEventListener('keydown', (e) => {
        // Escape key closes modals
        if (e.key === 'Escape') {
            document.querySelectorAll('.modal').forEach(modal => {
                modal.style.display = 'none';
            });
        }
        
        // Ctrl/Cmd + K opens search
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            document.getElementById('add-coin-btn')?.click();
        }
        
        // Ctrl/Cmd + , opens settings
        if ((e.ctrlKey || e.metaKey) && e.key === ',') {
            e.preventDefault();
            document.getElementById('settings-icon')?.click();
        }
    });
}

// Haptic Feedback for Mobile (if supported)
function triggerHaptic(style = 'light') {
    if ('vibrate' in navigator) {
        const patterns = {
            light: [10],
            medium: [20],
            heavy: [30],
            success: [10, 20, 10],
            warning: [30, 10, 30],
            error: [50]
        };
        
        navigator.vibrate(patterns[style] || patterns.light);
    }
}

// Initialize all UI enhancements
document.addEventListener('DOMContentLoaded', () => {
    // Initialize toast system
    window.toast = new ToastNotification();
    
    // Initialize keyboard navigation
    initKeyboardNavigation();
    
    // Enhance search inputs
    enhanceSearchInput('asset-search', (value) => {
        console.log('Searching for:', value);
        // Search logic here
    });
    
    // Add hover effects with haptic feedback on mobile
    document.querySelectorAll('button, .action-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            triggerHaptic('light');
        });
    });
    
    // Animate numbers on load
    const totalValue = document.getElementById('total-computed-value');
    if (totalValue) {
        const value = parseFloat(totalValue.textContent.replace(/[^0-9.-]+/g, ''));
        totalValue.textContent = '$0.00';
        setTimeout(() => animateNumber(totalValue, 0, value, 1500), 500);
    }
    
    // Add intersection observer for animations
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
            }
        });
    }, { threshold: 0.1 });
    
    document.querySelectorAll('.table-container, .sumbox').forEach(el => {
        observer.observe(el);
    });
    
    // Style for animations
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideInRight {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        
        @keyframes slideOutRight {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
        
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }
        
        .animate-in {
            animation: fadeIn 0.6s ease forwards;
        }
        
        .loading {
            display: inline-block;
            width: 16px;
            height: 16px;
            border: 2px solid #E9ECEF;
            border-top-color: #0066FF;
            border-radius: 50%;
            animation: spin 0.8s linear infinite;
        }
        
        @keyframes spin {
            to { transform: rotate(360deg); }
        }
        
        th.sort-asc::after {
            content: ' ↑';
            color: #0066FF;
        }
        
        th.sort-desc::after {
            content: ' ↓';
            color: #0066FF;
        }
    `;
    document.head.appendChild(style);
});

// Export functions for use in main script
window.UIEnhancements = {
    toast: () => window.toast,
    showTableLoading: LoadingStateManager.showTableLoading,
    showButtonLoading: LoadingStateManager.showButtonLoading,
    animateNumber,
    formatCurrency,
    smoothScrollTo,
    triggerHaptic
};