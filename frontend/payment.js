document.addEventListener('DOMContentLoaded', () => {
    const paymentForm = document.getElementById('payment-form');
    const formContainer = document.getElementById('payment-form-container');
    const successMessage = document.getElementById('success-message');

    paymentForm.addEventListener('submit', (e) => {
        e.preventDefault(); // Prevents the form from actually submitting

        // Hide the form and show the success message
        formContainer.style.display = 'none';
        successMessage.style.display = 'block';

        // Clear the cart since the payment is "successful"
        localStorage.removeItem('cart');
    });
});