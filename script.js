// ** Selección de Elementos del DOM **
const elementoCarrito = document.getElementById('cart');
const totalElementos = document.getElementById('total');
const vaciarCarritoButton = document.getElementById('vaciar-carrito');
const contadorElementosCarrito = document.getElementById('cart-count'); // Contador en el icono del carrito
const botonProcederAlPago = document.getElementById('proceed-to-payment'); // Botón para proceder al pago

// ** Objeto Carrito para Manejar las Operaciones **
const Carrito = {
    elementos: [],
    // Inicializar el carrito desde localStorage
    init: function() {
        const storedCart = localStorage.getItem('cart');
        if (storedCart) {
            this.elementos = JSON.parse(storedCart);
        }
        this.render();
        this.actualizarTotal();
        this.actualizarContadorCarrito();
        this.actualizarEstadoDelBoton();  // Actualizar el estado del botón de proceder al pago
    },
    // Agregar un producto al carrito
    añadirElemento: function(producto, precio) {
        const elementoExistente = this.elementos.find(elemento => elemento.product === producto);
        elementoExistente ? elementoExistente.quantity++ : this.elementos.push({ product: producto, price: precio, quantity: 1 });
        this.guardar();
        this.render();
        this.actualizarTotal();
        this.actualizarContadorCarrito();
        this.actualizarEstadoDelBoton();  // Actualizar el estado del botón de proceder al pago
    },
    // Eliminar un producto del carrito por índice
    eliminarElemento: function(index) {
        if (index > -1 && index < this.elementos.length) {
            const elemento = this.elementos[index];
            if (elemento.quantity > 1) {
                elemento.quantity--; // Reducir cantidad si es mayor que 1
            } else {
                this.elementos.splice(index, 1); // Eliminar producto si la cantidad es 1
            }
            this.guardar();
            this.render();
            this.actualizarTotal();
            this.actualizarContadorCarrito();
        }
    },
    // Vaciar el carrito completamente
    vaciarCarrito: function() {
        this.elementos = [];
        this.guardar();
        this.render();
        this.actualizarTotal();
        this.actualizarContadorCarrito();
        this.actualizarEstadoDelBoton();  // Actualizar el estado del botón de proceder al pago
    },
    // Calcular el total del carrito
    calcularTotal: function() {
        return this.elementos.reduce((acc, elemento) => acc + elemento.price * elemento.quantity, 0);
    },
    // Actualizar el total en el DOM (solo si totalElement existe)
    actualizarTotal: function() {
        if (totalElementos) { // Verificar si totalElement existe
            const total = this.calcularTotal();
            totalElementos.textContent = `${total.toLocaleString('es-ES', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
        }
    },
    // Guardar el carrito en localStorage
    guardar: function() {
        try {
            localStorage.setItem('cart', JSON.stringify(this.elementos));
        } catch (e) {
            console.error('Error al guardar el carrito en localStorage', e);
        }
    },
    // Actualizar el contador del carrito en el icono (solo si cartCountElement existe)
    actualizarContadorCarrito: function() {
        if (contadorElementosCarrito) { // Verificar si cartCountElement existe
            const totalElementos = this.elementos.reduce((sum, item) => sum + item.quantity, 0);
            contadorElementosCarrito.textContent = totalElementos;
        }
    },
    // Actualizar el estado del botón de proceder al pago
    actualizarEstadoDelBoton: function() {
        if (botonProcederAlPago) {
            if (this.elementos.length > 0) {
                botonProcederAlPago.disabled = false;  // Habilitar el botón si el carrito tiene productos
            } else {
                botonProcederAlPago.disabled = true;   // Deshabilitar el botón si el carrito está vacío
            }
        }
    },
    // Renderizar el carrito en el DOM (solo si cartElement existe)
    render: function() {
        if (!elementoCarrito) return; // Salir si cartElement no existe
        elementoCarrito.innerHTML = '';
        if (this.elementos.length === 0) {
            elementoCarrito.innerHTML = '<p class="parrafoCarrito text-white">El carrito está vacío.</p>';
            return;
        }
        this.elementos.forEach((elemento, index) => {
            const elementoDiv = document.createElement('div');
            elementoDiv.classList.add('cart-item', 'mb-3');
            const formatoPrecio = elemento.price.toLocaleString('es-ES', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
            elementoDiv.innerHTML = `
                <div class="d-flex justify-content-center align-items-center text-white">
                    <div>
                        <strong>${elemento.product}</strong><br>
                        Precio: $${formatoPrecio}<br>
                        Cantidad: ${elemento.quantity}
                    </div>
                    <button class="btn btn-danger btn-sm" data-index="${index}" aria-label="Eliminar ${elemento.product} del carrito">Eliminar</button>
                </div>
            `;
            elementoCarrito.appendChild(elementoDiv);
        });
        // Asignar eventos a los botones de eliminar
        const removerButtons = elementoCarrito.querySelectorAll('button[data-index]');
        removerButtons.forEach(button => {
            button.addEventListener('click', function() {
                const index = parseInt(this.getAttribute('data-index'));
                Carrito.eliminarElemento(index);
            });
        });
    }
};

// ** Función para Agregar al Carrito desde Productos **
function agregarAlCarrito(producto, precio) {
    Carrito.añadirElemento(producto, precio);
    Swal.fire({
        icon: 'success',
        title: 'Producto agregado al carrito',
        text: producto + ' ha sido añadido al carrito.',
        timer: 1000, // Duración en milisegundos (1 segundo)
        showConfirmButton: false, // No mostrar el botón de confirmación
        position: 'center', // Posición en la pantalla
        toast: true, // Hace que sea un tipo "toast", que desaparece solo
        customClass: {
            popup: 'custom-popup-size'
        }
    });
}

// ** Manejo de Eventos para Vaciar el Carrito **
if (vaciarCarritoButton) { // Verificar si vaciarCarritoButton existe
    vaciarCarritoButton.addEventListener('click', function() {
        if (Carrito.elementos.length === 0) {
            Swal.fire({
                icon: 'info',
                title: 'El carrito está vacío',
                text: 'No puedes vaciar un carrito vacío.',
                confirmButtonText: 'Cerrar',
                showConfirmButton: true,
                position: 'center'
            });
        } else {
            Swal.fire({
                title: '¿Estás seguro?',
                text: "Este proceso vaciará todos los productos del carrito.",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Sí, vaciarlo',
                cancelButtonText: 'Cancelar'
            }).then((result) => {
                if (result.isConfirmed) {
                    Carrito.vaciarCarrito();
                    Swal.fire(
                        'Vaciado',
                        'Tu carrito ha sido vaciado correctamente.',
                        'success'
                    );
                }
            });
        }
    });
}

// ** Redirección al Pago **
if (botonProcederAlPago) {
    botonProcederAlPago.addEventListener('click', function() {
        // Puedes pasar información adicional al URL, si lo deseas (por ejemplo, el total de la compra)
        window.location.href = 'pago.html';  // Redirige al usuario a la página de pago
    });
}

// ** Inicializar el Carrito al Cargar la Página **
document.addEventListener('DOMContentLoaded', function() {
    Carrito.init();
    const agregarCarritoButtons = document.querySelectorAll('.btnAgregarAlCarrito');
    agregarCarritoButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault(); // Evitar comportamiento por defecto del enlace
            const cartaProducto = this.closest('.card');
            const tituloProducto = cartaProducto.querySelector('.card-title').textContent;
            const precioProducto = cartaProducto.querySelector('.card-text').textContent;
            const igualacionPrecio = precioProducto.match(/\$([\d,.]+)/);
            let precio = 0;
            if (igualacionPrecio) {
                precio = parseFloat(igualacionPrecio[1].replace(/\./g, '').replace(',', '.'));
            }
            agregarAlCarrito(tituloProducto, precio);
        });
    });
});
