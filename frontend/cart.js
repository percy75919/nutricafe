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
            itemEl.innerHTML = `
                <img src="${item.imageUrl}" alt="${item.name}">
                <div class="item-details">
                    <h4>${item.name}</h4>
                    <p>Price: ₹${item.price.toFixed(2)}</p>
                    <p>Quantity: ${item.quantity}</p>
                </div>
                <p class="item-total">₹${itemTotal.toFixed(2)}</p>
            `;
            cartItemsContainer.appendChild(itemEl);
        });

        totalPriceEl.textContent = `₹${total.toFixed(2)}`;
    }

// Replace the entire placeOrder function with this improved version

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
        const res = await fetch('https://nutricafe-1.onrender.com/orders/add', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-auth-token': token
            },
            body: JSON.stringify({ items: orderItems, totalAmount: totalAmount })
        });

        // The important change is here!
        if (!res.ok) {
            if (res.status === 401) { // 401 means "Unauthorized"
                throw new Error('Your session has expired. Please log in again.');
            }
            const errorData = await res.json();
            throw new Error(errorData.msg || 'Failed to place order.');
        }
        
        const data = await res.json();

        cartMsg.style.color = 'green';
        cartMsg.textContent = 'Order placed successfully! Redirecting...';
        
        localStorage.removeItem('cart');
        updateCartCount(); // Make sure cart display is updated elsewhere
        setTimeout(() => window.location.href = 'index.html', 2000);

    } catch (error) {
        cartMsg.style.color = 'red';
        cartMsg.textContent = error.message;

        // If it was an auth error, clear the bad token and redirect
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