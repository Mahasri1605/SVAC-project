let fullInventoryData = [];

document.addEventListener('DOMContentLoaded', () => {
    fetchInsights();
    fetchInventory();
    fetchChartData();
    setupEventListeners();
});

// Animate numbers for the wow factor
function animateValue(obj, start, end, duration, isCurrency = false) {
    let startTimestamp = null;
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        
        let currentVal = Math.floor(progress * (end - start) + start);
        
        if (isCurrency) {
            obj.innerHTML = `$${currentVal.toLocaleString()}`;
        } else {
            obj.innerHTML = currentVal.toLocaleString();
        }
        
        if (progress < 1) {
            window.requestAnimationFrame(step);
        } else {
            // Ensure exact final value
            if (isCurrency) {
                // Ensure two decimal places format if needed, but original end is fine.
                obj.innerHTML = `$${end.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
            } else {
                obj.innerHTML = end.toLocaleString();
            }
        }
    };
    window.requestAnimationFrame(step);
}

function fetchInsights() {
    fetch('/api/insights')
        .then(response => response.json())
        .then(data => {
            const totalValueEl = document.getElementById('total-value');
            const totalSalesEl = document.getElementById('total-sales');
            const totalSalesStockEl = document.getElementById('total-sales-stock');
            const totalItemsEl = document.getElementById('total-items');
            const lowStockEl = document.getElementById('low-stock-count');
            const outOfStockEl = document.getElementById('out-of-stock-count');

            animateValue(totalValueEl, 0, data.total_value, 1500, true);
            if (totalSalesEl) animateValue(totalSalesEl, 0, data.total_sales, 1500, true);
            if (totalSalesStockEl) animateValue(totalSalesStockEl, 0, data.total_sales_stock, 1500, false);
            animateValue(totalItemsEl, 0, data.total_items, 1500, false);
            animateValue(lowStockEl, 0, data.low_stock_count, 1500, false);
            animateValue(outOfStockEl, 0, data.out_of_stock_count, 1500, false);
        })
        .catch(error => console.error('Error fetching insights:', error));
}

function fetchInventory() {
    fetch('/api/inventory')
        .then(response => response.json())
        .then(data => {
            fullInventoryData = data;
            renderTable(fullInventoryData);
        })
        .catch(error => console.error('Error fetching inventory:', error));
}

function renderTable(dataToRender) {
    const tbody = document.getElementById('inventory-table-body');
    tbody.innerHTML = '';
    
    if (dataToRender.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align: center;">No items found</td></tr>';
        return;
    }

    dataToRender.forEach((item, index) => {
        // Determine CSS class based on status
        let badgeClass = '';
        if (item.status === 'In Stock') badgeClass = 'status-in-stock';
        else if (item.status === 'Low Stock') badgeClass = 'status-low-stock';
        else if (item.status === 'Critical') badgeClass = 'status-critical';
        else if (item.status === 'Out of Stock') badgeClass = 'status-out-of-stock';

        const tr = document.createElement('tr');
        
        // Add staggered animation delay
        tr.style.animation = `fadeIn 0.5s ease forwards ${index * 0.05}s`;
        tr.style.opacity = '0';
        
        tr.innerHTML = `
            <td>${item.name}</td>
            <td>${item.category}</td>
            <td>${item.stock}</td>
            <td>$${item.price.toFixed(2)}</td>
            <td><span class="status-badge ${badgeClass}">${item.status}</span></td>
        `;
        tbody.appendChild(tr);
    });
}

function fetchChartData() {
    fetch('/api/chart-data')
        .then(response => response.json())
        .then(data => {
            renderCharts(data);
        })
        .catch(error => console.error('Error fetching chart data:', error));
}

function renderCharts(data) {
    const ctxCat = document.getElementById('categoryChart').getContext('2d');
    
    // Set default Chart.js font and color for dark theme
    Chart.defaults.color = '#94a3b8';
    Chart.defaults.font.family = "'Inter', sans-serif";

    new Chart(ctxCat, {
        type: 'doughnut',
        data: {
            labels: data.labels,
            datasets: [{
                data: data.values,
                backgroundColor: [
                    '#6366f1', // Indigo
                    '#ec4899', // Pink
                    '#10b981', // Emerald
                    '#f59e0b', // Amber
                    '#8b5cf6'  // Purple
                ],
                borderWidth: 0,
                hoverOffset: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'right' }
            }
        }
    });

    const ctxIns = document.getElementById('insightsChart').getContext('2d');
    new Chart(ctxIns, {
        type: 'bar',
        data: {
            labels: data.labels,
            datasets: [{
                label: 'Stock Levels',
                data: data.values,
                backgroundColor: '#6366f1',
                borderRadius: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: { beginAtZero: true, grid: { color: 'rgba(255, 255, 255, 0.05)' } },
                x: { grid: { display: false } }
            }
        }
    });
}

function setupEventListeners() {
    // Context for Search and Filtering
    const searchInput = document.getElementById('search-input');
    const categoryFilter = document.getElementById('category-filter');

    function applyFilters() {
        const searchTerm = searchInput.value.toLowerCase();
        const selectedCategory = categoryFilter.value;

        const filteredData = fullInventoryData.filter(item => {
            const matchesSearch = item.name.toLowerCase().includes(searchTerm) || item.category.toLowerCase().includes(searchTerm);
            const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
            return matchesSearch && matchesCategory;
        });

        renderTable(filteredData);
    }

    searchInput.addEventListener('input', applyFilters);
    categoryFilter.addEventListener('change', applyFilters);

    // Context for Modal
    const modal = document.getElementById('add-item-modal');
    const openBtn = document.getElementById('open-modal-btn');
    const closeBtn = document.querySelector('.close-modal');
    const form = document.getElementById('add-item-form');

    openBtn.onclick = function() {
        modal.style.display = 'flex';
    }

    closeBtn.onclick = function() {
        modal.style.display = 'none';
        form.reset();
    }

    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = 'none';
            form.reset();
        }
    }

    form.onsubmit = function(event) {
        event.preventDefault();
        // In a real app, you would send a POST request here
        alert("Item added successfully (Preview Only)");
        modal.style.display = 'none';
        form.reset();
    }
}

// Add simple fade-in animation to CSS dynamically for rows
const style = document.createElement('style');
style.innerHTML = `
    @keyframes fadeIn {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
    }
`;
document.head.appendChild(style);
