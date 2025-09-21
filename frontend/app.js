document.addEventListener('DOMContentLoaded', () => {
    
    // Add this inside the DOMContentLoaded event listener
const searchBar = document.getElementById('search-bar');
if (searchBar) {
    searchBar.addEventListener('keyup', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        const menuCards = document.querySelectorAll('.menu-card');
        
        menuCards.forEach(card => {
            const title = card.querySelector('h3').textContent.toLowerCase();
            const description = card.querySelector('p').textContent.toLowerCase();

            if (title.includes(searchTerm) || description.includes(searchTerm)) {
                card.style.display = 'flex'; // Use flex to match our new CSS
            } else {
                card.style.display = 'none';
            }
        });
    });
}
    const token = localStorage.getItem('authToken');
    const loginLogoutLink = document.getElementById('login-logout-link');

    if (token) {
        loginLogoutLink.textContent = 'Logout';
        loginLogoutLink.href = '#';
        loginLogoutLink.onclick = () => {
            localStorage.removeItem('authToken');
            localStorage.removeItem('user');
            localStorage.removeItem('cart'); // Clear cart on logout
            window.location.href = 'login.html';
        };
        fetchRecommendedItems(token);
    } else {
        loginLogoutLink.textContent = 'Login';
        loginLogoutLink.href = 'login.html';
        fetchAllItems();
    }
    updateCartCount();
});

// --- CART FUNCTIONALITY ---
function addToCart(item) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    
    // Check if item already exists in cart
    const existingItem = cart.find(cartItem => cartItem._id === item._id);

    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ ...item, quantity: 1 });
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    alert(`${item.name} added to cart!`);
}

function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const cartLink = document.getElementById('cart-link');
    if (cartLink) {
        cartLink.textContent = `Cart (${totalItems})`;
    }
}

// --- DISPLAY FUNCTION (MODIFIED) ---
function displayMenuItems(items, containerId, title) {
    const container = document.getElementById(containerId);
    container.innerHTML = `<h2>${title}</h2>`;
    const grid = document.createElement('div');
    grid.className = 'menu-grid';

    if (items.length === 0) {
        grid.innerHTML = '<p>No items match this criteria.</p>';
        container.appendChild(grid);
        return;
    }

    items.forEach(item => {
        const card = document.createElement('div');
        card.className = 'menu-card';
        
        // --- THIS SECTION IS UPDATED ---
        card.innerHTML = `
            <img src="${item.imageUrl}" alt="${item.name}">
            <div class="card-content">
                <h3>${item.name}</h3>
                <p class="card-category">${item.category}</p>
                <p>${item.description}</p>
                
                <div class="tags-container">
                    ${item.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                </div>

                <div class="nutrition-info">
                    <span>Calories: ${(item.nutrition && item.nutrition.calories) || 'N/A'}</span> |
                    <span>Protein: ${(item.nutrition && item.nutrition.protein) || 'N/A'}</span> |
                    <span>Carbs: ${(item.nutrition && item.nutrition.carbs) || 'N/A'}</span> |
                    <span>Fat: ${(item.nutrition && item.nutrition.fat) || 'N/A'}</span>
                </div>
                <p class="price">₹${item.price.toFixed(2)}</p>
                <button class="btn-add-to-cart">Add to Cart</button>
            </div>
        `;
        // --- END OF UPDATED SECTION ---

        card.querySelector('.btn-add-to-cart').addEventListener('click', () => addToCart(item));
        grid.appendChild(card);
    });
    container.appendChild(grid);
}

async function fetchRecommendedItems(token) {
    try {
        const res = await fetch('https://nutricafe-1.onrender.com/menu/recommended', {
            method: 'GET',
            headers: { 'x-auth-token': token }
        });
        if (!res.ok) throw new Error('Could not fetch recommendations');
        const recommendedItems = await res.json();
        displayMenuItems(recommendedItems, 'menu-container', 'Recommended For You');

        // You could also fetch and display all items below the recommended ones
    } catch (error) {
        console.error(error);
        // If token is invalid or expired, log out user and fetch all items
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        fetchAllItems();
    }
}

async function fetchAllItems() {
    try {
        const response = await fetch('http://localhost:5000/menu');
        const menuItems = await response.json();
        displayMenuItems(menuItems, 'menu-container', "Today's Menu");
    } catch (error) {
        console.error('Failed to fetch menu items:', error);
        document.getElementById('menu-container').innerHTML = '<p>Sorry, we couldn\'t load the menu.</p>';
    }
}