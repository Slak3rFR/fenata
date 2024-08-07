let cart = [];
let total = 0;

function addToCart(product, price) {
    cart.push({ product, price });
    updateCart();
}

function updateCart() {
    const cartElement = document.getElementById('cart');
    cartElement.innerHTML = '';

    if (cart.length === 0) {
        cartElement.innerHTML = '<p class="parrafoCarrito">El carrito está vacío.</p>';
    } else {
        cart.forEach((item, index) => {
            const itemElement = document.createElement('div');
            itemElement.innerHTML = `
                <p class="parrafoCarrito">${item.product} - $${item.price.toFixed(2)} 
                <button onclick="removeFromCart(${index})">Eliminar producto</button></p>
            `;
            cartElement.appendChild(itemElement);
        });
    }

    calculateTotal();
}

function removeFromCart(index) {
    cart.splice(index, 1);
    updateCart();
}

function calculateTotal() {
    total = cart.reduce((acc, item) => acc + item.price, 0);
    document.getElementById('total').textContent = total.toFixed(2);
}
