// ** Variables del DOM **
const elementoCarrito = document.getElementById('cart');
const contadorElementosCarrito = document.getElementById('cart-count');
const botonProcederAlPago = document.getElementById('proceed-to-payment');
const vaciarCarritoButton = document.getElementById('vaciar-carrito');
const totalElementos = document.getElementById('total');

// ** Clase Carrito para Manejar las Operaciones **
class Carrito {
    constructor() {
        this.elementos = [];
        this.init();
    }
    // Iniciar el carrito desde localStorage
    init() {
        const storedCart = localStorage.getItem('cart');
        if (storedCart) this.elementos = JSON.parse(storedCart);
        this.render();
        this.actualizarTotal();
        this.actualizarContadorCarrito();
        this.actualizarEstadoDelBoton();
    }
    // Agregar un producto al carrito
    añadirElemento(producto, precio) {
        const elementoExistente = this.elementos.find(elemento => elemento.product === producto);
        elementoExistente ? elementoExistente.quantity++ : this.elementos.push({ product: producto, price: precio, quantity: 1 });
        this.guardar();
        this.render();
        this.actualizarTotal();
        this.actualizarContadorCarrito();
        this.actualizarEstadoDelBoton();
    }
    // Eliminar un producto del carrito
    eliminarElemento(index) {
        if (index > -1 && index < this.elementos.length) {
            const elemento = this.elementos[index];
            elemento.quantity > 1 ? elemento.quantity-- : this.elementos.splice(index, 1);
            this.guardar();
            this.render();
            this.actualizarTotal();
            this.actualizarContadorCarrito();
        }
    }
    // Vaciar el carrito
    vaciarCarrito() {
        this.elementos = [];
        this.guardar();
        this.render();
        this.actualizarTotal();
        this.actualizarContadorCarrito();
        this.actualizarEstadoDelBoton();
    }
    // Calcular el total del carrito
    calcularTotal() {
        return this.elementos.reduce((acc, elemento) => acc + elemento.price * elemento.quantity, 0);
    }
    // Guardar el carrito en localStorage
    guardar() {
        localStorage.setItem('cart', JSON.stringify(this.elementos));
    }
    // Actualizar el contador del carrito
    actualizarContadorCarrito() {
        if (contadorElementosCarrito) {
            const totalElementos = this.elementos.reduce((sum, item) => sum + item.quantity, 0);
            contadorElementosCarrito.textContent = totalElementos;
        }
    }
    // Actualizar el estado del botón de proceder al pago
    actualizarEstadoDelBoton() {
        if (botonProcederAlPago) {
            botonProcederAlPago.disabled = this.elementos.length === 0;
        }
    }
    // Actualizar el total del carrito en el DOM
    actualizarTotal() {
        if (totalElementos) { 
            const total = this.calcularTotal();
            totalElementos.textContent = `${total.toLocaleString('es-ES', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
        }
    }
    // Renderizar el carrito en el DOM
    render() {
        if (!elementoCarrito) return;
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
        elementoCarrito.querySelectorAll('button[data-index]').forEach(button => {
            button.addEventListener('click', () => this.eliminarElemento(button.getAttribute('data-index')));
        });
    }
}

// ** Manejo de Promesas y Fetch para Cargar Productos **
async function cargarProductos() {
    try {
        const response = await fetch('./productos.json');
        const productos = await response.json();
        console.log(productos); 
        mostrarProductos(productos);
    } catch (error) {
        console.error("Error al cargar los productos:", error);
    }
}

// ** Mostrar Productos en el DOM **
function mostrarProductos(productos) {
    const productosContainer = document.getElementById('productos-container');
    if (!productosContainer) {
        console.error("No se encontró el elemento productos-container");
        return;
    }
    productos.forEach(producto => {
        const productoDiv = document.createElement('div');
        productoDiv.classList.add('card');
        productoDiv.innerHTML = `
        <img src="${producto.imagen}" class="card-img-top text-center imgTLP" alt="${producto.nombre}">
        <div class="card-body text-center divTLP">
            <h3 class="card-title">${producto.nombre}</h3>
            <p class="card-text">$${producto.precio.toLocaleString()}</p>
            <p>${producto.descripcion}</p>
            <button type="button" class="btn btn-primary btnAgregarAlCarrito" data-id="${producto.id}">
                Agregar al carrito
            </button>
        </div>
    `;
        productosContainer.appendChild(productoDiv);
        productoDiv.querySelector('.btnAgregarAlCarrito').addEventListener('click', function (event) {
            event.preventDefault(); 
            console.log("Botón presionado"); 
            carrito.añadirElemento(producto.nombre, producto.precio);
            Swal.fire({
                icon: 'success',
                title: 'Producto agregado al carrito',
                text: `${producto.nombre} ha sido añadido al carrito.`,
                timer: 1000,
                showConfirmButton: false,
                position: 'center',
                toast: true
            });
        });
    });
}

if (botonProcederAlPago) {
    botonProcederAlPago.addEventListener('click', function () {
        window.location.href = 'pago.html';  // Redirige al usuario a la página de pago
    });
}

// ** Manejo de Eventos para Vaciar el Carrito **
if (vaciarCarritoButton) { 
    vaciarCarritoButton.addEventListener('click', function () {
        if (carrito.elementos.length === 0) {
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
                    carrito.vaciarCarrito();
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

// ** Inicializar Carrito y Cargar Productos al Cargar la Página **
let carrito;
document.addEventListener('DOMContentLoaded', () => {
    carrito = new Carrito();
    if (window.location.pathname.includes('productos.html')) {
        cargarProductos();
    }
});
