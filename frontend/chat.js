document.addEventListener('DOMContentLoaded', () => {
    // UI Elements
    const aiFab = document.getElementById('ai-fab');
    const chatContainer = document.querySelector('.chat-container');
    const closeBtn = document.getElementById('chat-close-btn');
    const chatBox = document.getElementById('chat-box');
    const chatInput = document.getElementById('chat-input');
    const sendBtn = document.getElementById('send-chat-btn');
    const token = localStorage.getItem('authToken');

    // Hide chat icon and container if user is not logged in
    if (!token) {
        if (chatContainer) chatContainer.style.display = 'none';
        if (aiFab) aiFab.style.display = 'none';
        return; 
    }

    // Event listeners for showing and hiding the chat window
    if (aiFab && chatContainer && closeBtn) {
        aiFab.addEventListener('click', () => {
            chatContainer.classList.toggle('is-visible');
        });
        closeBtn.addEventListener('click', () => {
            chatContainer.classList.remove('is-visible');
        });
    }

    // Logic for sending and receiving messages
    const sendMessage = async () => {
        const message = chatInput.value.trim();
        if (!message) return;

        addMessage(message, 'user');
        chatInput.value = '';

        try {
            const res = await fetch('http://localhost:5000/ai/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'x-auth-token': token },
                body: JSON.stringify({ message: message })
            });
            if (!res.ok) throw new Error("AI failed to respond.");

            const data = await res.json();
            addMessage(data.reply, 'ai');
        } catch (error) {
            addMessage('Sorry, I am unable to respond right now.', 'ai');
            console.error(error);
        }
    };

    function addMessage(text, sender) {
        const messageElement = document.createElement('div');
        messageElement.className = `chat-message ${sender}`;
        
        const itemIdRegex = /\[ITEM_ID: "([^"]+)"\]/;
        const match = text.match(itemIdRegex);

        if (match) {
            const itemId = match[1];
            const cleanText = text.replace(itemIdRegex, '').trim();
            messageElement.innerHTML = `<p>${cleanText}</p><button class="btn-chat-add" data-item-id="${itemId}">Add to Cart</button>`;
        } else {
            messageElement.textContent = text;
        }
        chatBox.appendChild(messageElement);
        chatBox.scrollTop = chatBox.scrollHeight;
    }

    chatBox.addEventListener('click', async (e) => {
        if (e.target.classList.contains('btn-chat-add')) {
            const itemId = e.target.getAttribute('data-item-id');
            try {
                const res = await fetch('http://localhost:5000/menu');
                if (!res.ok) throw new Error("Could not fetch menu.");
                
                const menuItems = await res.json();
                const itemToAdd = menuItems.find(item => item._id === itemId);
                if(itemToAdd) {
                    addToCart(itemToAdd, 1); // This function must be in app.js
                }
            } catch (error) {
                console.error(error);
                alert("Could not add item to cart.");
            }
        }
    });

    sendBtn.addEventListener('click', sendMessage);
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendMessage();
    });
});