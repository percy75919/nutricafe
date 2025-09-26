document.addEventListener('DOMContentLoaded', () => {
    const cartItemsContainer = document.getElementById('cart-items');
    const totalPriceEl = document.getElementById('total-price');
    const placeOrderBtn = document.getElementById('place-order-btn');
    const cartMsg = document.getElementById('cart-msg');
    let cart = JSON.parse(localStorage.getItem('cart')) || [];

    function renderCart() {
        cartItemsContainer.innerHTML = '';
        let total = 0;

        if (cart.length === 0) {
            cartItemsContainer.innerHTML = '<p>Your cart is empty.</p>';
            placeOrderBtn.disabled = true;
        } else {
             placeOrderBtn.disabled = false;
        }

        cart.forEach(item => {
            const itemTotal = item.price * item.quantity;
            total += itemTotal;

            const itemEl = document.createElement('div');
            itemEl.className = 'cart-item';
            
            // --- UPDATED HTML with Quantity Controls ---
            itemEl.innerHTML = `
                <img src="${item.imageUrl}" alt="${item.name}">
                <div class="item-details">
                    <h4>${item.name}</h4>
                    <p>Price: ₹${item.price.toFixed(2)}</p>
                    <div class="quantity-controls">
                        <button class="btn-quantity" data-id="${item._id}" data-change="-1">-</button>
                        <span>${item.quantity}</span>
                        <button class="btn-quantity" data-id="${item._id}" data-change="1">+</button>
                    </div>
                </div>
                <div class="item-actions">
                    <p class="item-total">₹${itemTotal.toFixed(2)}</p>
                    <button class="btn-remove" data-id="${item._id}">Remove</button>
                </div>
            `;
            cartItemsContainer.appendChild(itemEl);
        });

        totalPriceEl.textContent = `₹${total.toFixed(2)}`;
    }

    // --- NEW FUNCTION to update quantity ---
    function updateQuantity(itemId, change) {
        const itemIndex = cart.findIndex(item => item._id === itemId);
        if (itemIndex > -1) {
            cart[itemIndex].quantity += change;
            // If quantity drops to 0 or less, remove the item
            if (cart[itemIndex].quantity <= 0) {
                cart.splice(itemIndex, 1);
            }
        }
        localStorage.setItem('cart', JSON.stringify(cart));
        renderCart();
        updateCartCount();
    }

    function removeFromCart(itemId) {
        cart = cart.filter(item => item._id !== itemId);
        localStorage.setItem('cart', JSON.stringify(cart));
        renderCart();
        updateCartCount();
    }
    
    // Updated Event listener to handle quantity and remove buttons
    cartItemsContainer.addEventListener('click', (e) => {
        const target = e.target;
        const itemId = target.getAttribute('data-id');

        if (target.classList.contains('btn-remove')) {
            removeFromCart(itemId);
        }

        if (target.classList.contains('btn-quantity')) {
            const change = parseInt(target.getAttribute('data-change'), 10);
            updateQuantity(itemId, change);
        }
    });

// Replace the old placeOrder function in cart.js

async function placeOrder() {
    const token = localStorage.getItem('authToken');
    const cartMsg = document.getElementById('cart-msg');

    if (!token) {
        cartMsg.textContent = 'You must be logged in to place an order.';
        setTimeout(() => window.location.href = 'login.html', 2000);
        return;
    }

    const orderItems = cart.map(item => ({
        menuItemId: item._id,
        name: item.name,
        price: item.price,
        quantity: item.quantity
    }));
    
    const totalAmount = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    try {
        const res = await fetch('http://localhost:5000/orders/add', { // Make sure this URL is correct for your setup (live or local)
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-auth-token': token
            },
            body: JSON.stringify({ items: orderItems, totalAmount: totalAmount })
        });

        if (!res.ok) {
            if (res.status === 401) {
                throw new Error('Your session has expired. Please log in again.');
            }
            const errorData = await res.json();
            throw new Error(errorData.msg || 'Failed to place order.');
        }
        
        // --- THIS IS THE CHANGE ---
        // Instead of showing a message, redirect to the payment page
        window.location.href = 'payment.html';
        // --- END OF CHANGE ---

    } catch (error) {
        cartMsg.style.color = 'red';
        cartMsg.textContent = error.message;

        if (error.message.includes("session has expired")) {
            localStorage.removeItem('authToken');
            localStorage.removeItem('user');
            setTimeout(() => window.location.href = 'login.html', 2500);
        }
    }
}
// You also need a simple updateCartCount function in this file for the logic above
function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    // In a real app you might have a shared header, but for now this is fine.
    console.log(`Cart now has ${totalItems} items.`);
}

    placeOrderBtn.addEventListener('click', placeOrder);
    renderCart();
});