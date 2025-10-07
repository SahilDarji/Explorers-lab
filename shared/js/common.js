console.log('🚀 Common.js loading...');

// Navigation data - All hrefs are root-relative paths
const navigationData = [
    { id: 'navHome', text: 'Home Page', href: '/index.html', isHeader: false },
    { id: 'accountsHeader', text: 'Accounts', isHeader: true },
    { id: 'navAccountsOverview', text: 'Accounts Overview', href: '/accounts/index.html', isHeader: false, parent: 'accountsHeader' },
    { id: 'navJournal', text: 'Journal', href: '/accounts/journal/index.html', isHeader: false, parent: 'accountsHeader' },
    { id: 'statisticsHeader', text: 'Statistics', isHeader: true },
    { id: 'navCorrelation', text: 'Correlation + Regression', href: '/statistics/correl-regression/index.html', isHeader: false, parent: 'statisticsHeader' },
    { id: 'navProbability', text: 'Probability', href: '/statistics/probability/index.html', isHeader: false, parent: 'statisticsHeader' },
    { id: 'navCentralTendency', text: 'Measure of Central Tendency', href: '/statistics/central-tendency/index.html', isHeader: false, parent: 'statisticsHeader' },
    { id: 'navFormulaSuggester', text: 'Formula Suggester', href: '/statistics/formula-suggester/index.html', isHeader: false, parent: 'statisticsHeader' },
    { id: 'navTimeSeries', text: 'Time Series', href: '/statistics/time-series/index.html', isHeader: false, parent: 'statisticsHeader' },
];

console.log('📊 Navigation data loaded:', navigationData.length, 'items');

// Get current page path for highlighting (simplified)
function getCurrentPagePath() {
    const path = window.location.pathname;
    console.log('📍 Current page path:', path);
    return path;
}

// Render sidebar navigation (simplified)
function renderSidebar() {
    console.log('🎨 Starting to render sidebar...');
    
    const sidebar = document.getElementById('sidebar');
    if (!sidebar) {
        console.error('❌ Sidebar element not found!');
        return;
    }
    
    const navElement = sidebar.querySelector('nav');
    if (!navElement) {
        console.error('❌ Nav element not found in sidebar!');
        return;
    }
    
    console.log('✅ Found sidebar and nav elements');
    
    // Clear existing content
    navElement.innerHTML = '';
    
    const currentPath = getCurrentPagePath();
    let currentUl = null;
    let itemCount = 0;
    
    navigationData.forEach(item => {
        console.log('🔧 Processing item:', item.text);
        
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
            
            console.log('📂 Created header:', item.text);
        } else {
            // Create navigation link
            const listItem = document.createElement('li');
            const link = document.createElement('a');
            
            // Use root-relative href directly - no complex path calculation needed!
            link.href = item.href;
            link.id = item.id;
            link.textContent = item.text;
            
            // Check if this is the active page
            const isActive = (currentPath === item.href || currentPath.endsWith(item.href));
            if (isActive) {
                link.className = 'block text-lg font-bold text-blue-600 hover:text-blue-600 transition-colors duration-200';
                console.log('🎯 Active link:', item.text);
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
            
            itemCount++;
            console.log('🔗 Added link:', item.text, '->', link.href);
        }
    });
    
    console.log('✅ Sidebar rendered successfully! Added', itemCount, 'navigation links');
}

// Setup sidebar toggle functionality
function setupSidebar() {
    console.log('⚙️ Setting up sidebar functionality...');
    
    const openSidebarBtn = document.getElementById('openSidebarBtn');
    const closeSidebarBtn = document.getElementById('closeSidebarBtn');
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('overlay');

    console.log('🔍 Elements found:', {
        openBtn: !!openSidebarBtn,
        closeBtn: !!closeSidebarBtn,
        sidebar: !!sidebar,
        overlay: !!overlay
    });
    
    if (openSidebarBtn && sidebar && overlay) {
        openSidebarBtn.addEventListener('click', function() {
            console.log('👆 Opening sidebar');
            sidebar.classList.add('open');
            overlay.classList.add('open');
        });
        console.log('✅ Open sidebar event listener added');
    }

    if (closeSidebarBtn && sidebar && overlay) {
        closeSidebarBtn.addEventListener('click', function() {
            console.log('👆 Closing sidebar');
            sidebar.classList.remove('open');
            overlay.classList.remove('open');
        });
        console.log('✅ Close sidebar event listener added');
    }

    if (overlay && sidebar) {
        overlay.addEventListener('click', function() {
            console.log('👆 Closing sidebar via overlay click');
            sidebar.classList.remove('open');
            overlay.classList.remove('open');
        });
        console.log('✅ Overlay click event listener added');
    }
    
    // Render the navigation
    renderSidebar();
    
    console.log('🎉 Sidebar setup complete!');
}

// Initialize when DOM is loaded
if (document.readyState === 'loading') {
document.addEventListener('DOMContentLoaded', setupSidebar);
    console.log('📅 DOMContentLoaded listener added');
} else {
    // DOM is already loaded
    setupSidebar();
    console.log('📅 DOM already loaded, running setup immediately');
}

console.log('🎯 Common.js loaded successfully!');