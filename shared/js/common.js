console.log('🚀 Common.js loading...');

// Navigation data - All hrefs are root-relative paths
const navigationData = [
    { id: 'navHome', text: 'Home Page', href: 'index.html', isHeader: false },
    { id: 'accountsHeader', text: 'Accounts', isHeader: true },
    { id: 'navAccountsOverview', text: 'Accounts Overview', href: 'accounts/index.html', isHeader: false, parent: 'accountsHeader' },
    { id: 'navJournal', text: 'Journal', href: 'accounts/journal/index.html', isHeader: false, parent: 'accountsHeader' },
    { id: 'statisticsHeader', text: 'Statistics', isHeader: true },
    { id: 'navCorrelation', text: 'Correlation + Regression', href: 'statistics/correl-regression/index.html', isHeader: false, parent: 'statisticsHeader' },
    { id: 'navProbability', text: 'Probability', href: 'statistics/probability/index.html', isHeader: false, parent: 'statisticsHeader' },
    { id: 'navCentralTendency', text: 'Measure of Central Tendency', href: 'statistics/central-tendency/index.html', isHeader: false, parent: 'statisticsHeader' },
    { id: 'navFormulaSuggester', text: 'Formula Suggester', href: 'statistics/formula-suggester/index.html', isHeader: false, parent: 'statisticsHeader' },
    { id: 'navTimeSeries', text: 'Time Series', href: 'statistics/time-series/index.html', isHeader: false, parent: 'statisticsHeader' },
];

console.log('📊 Navigation data loaded:', navigationData.length, 'items');

function getBasePath() {
    const isGitHub = window.location.hostname.includes('github.io');
    if (isGitHub) {
        // Pathname on GitHub Pages is /<repo-name>/path/to/page.html
        const pathParts = window.location.pathname.split('/').filter(p => p);
        if (pathParts.length > 0) {
            return `/${pathParts[0]}`;
        }
    }
    // For local development, assume serving from the root
    return '';
}

// Get current page path for highlighting (simplified)
function getCurrentPagePath() {
    const path = window.location.pathname;
    return path;
}

// Render sidebar navigation (simplified)
function renderSidebar() {
    const sidebar = document.getElementById('sidebar');
    if (!sidebar) {
        return;
    }
    
    const navElement = sidebar.querySelector('nav');
    if (!navElement) {
        return;
    }
    
    // Clear existing content
    navElement.innerHTML = '';
    
    const currentPath = getCurrentPagePath();
    const basePath = getBasePath();
    let currentUl = null;
    
    navigationData.forEach(item => {
        if (item.isHeader) {
            // Create header
            const headerDiv = document.createElement('div');
            headerDiv.className = 'py-2';
            headerDiv.innerHTML = `<h4 class="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">${item.text}</h4>`;
            navElement.appendChild(headerDiv);
            
            // Create ul for sub-items
            currentUl = document.createElement('ul');
            currentUl.className = 'space-y-2 pl-4';
            headerDiv.appendChild(currentUl);
        } else {
            // Create navigation link
            const listItem = document.createElement('li');
            const link = document.createElement('a');
            
            // Construct the correct absolute path
            const targetPath = `${basePath}/${item.href}`;
            link.href = targetPath;
            link.id = item.id;
            link.textContent = item.text;
            
            // Check if this is the active page
            // Handle index.html being served as the root path '/'
            const isActive = (currentPath === targetPath) || (currentPath === `${basePath}/` && item.href === 'index.html');
            if (isActive) {
                link.className = 'block text-lg font-bold text-blue-600 hover:text-blue-600 transition-colors duration-200';
            } else {
                link.className = 'block text-lg font-medium text-gray-700 hover:text-blue-600 transition-colors duration-200';
            }
            
            listItem.appendChild(link);
            
            // Add to appropriate container
            if (item.parent && currentUl) {
                currentUl.appendChild(listItem);
            } else {
                navElement.appendChild(listItem);
            }
        }
    });
}

// Setup sidebar toggle functionality
function setupSidebar() {
    const openSidebarBtn = document.getElementById('openSidebarBtn');
    const closeSidebarBtn = document.getElementById('closeSidebarBtn');
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('overlay');

    if (openSidebarBtn && sidebar && overlay) {
        openSidebarBtn.addEventListener('click', function() {
            sidebar.classList.add('open');
            overlay.classList.add('open');
        });
    }

    if (closeSidebarBtn && sidebar && overlay) {
        closeSidebarBtn.addEventListener('click', function() {
            sidebar.classList.remove('open');
            overlay.classList.remove('open');
        });
    }

    if (overlay && sidebar) {
        overlay.addEventListener('click', function() {
            sidebar.classList.remove('open');
            overlay.classList.remove('open');
        });
    }
    
    // Render the navigation
    renderSidebar();
}

// Initialize when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupSidebar);
} else {
    // DOM is already loaded
    setupSidebar();
}

console.log('🎯 Common.js loaded successfully!');