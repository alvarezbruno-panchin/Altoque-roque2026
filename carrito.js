import { resolverImagen } from "./imagenes.js";
import { liberarCarritoAnterior, reponerStock } from "./stock.js";

let carrito = [];

const obtenerProductos = () => {
    return JSON.parse(localStorage.getItem("productos")) || [];
}

const guardarStockLocal = (productoId, stock) => {
    const productos = obtenerProductos();
    const producto = productos.find(item => item.id === productoId);

    if (!producto) return;

    producto.stock = stock;
    localStorage.setItem("productos", JSON.stringify(productos));
}

const actualizarContadorCarrito = () => {
    const contador = document.getElementById("contadorcarrito");
    if (!contador) return;

    const cantidadTotal = carrito.reduce((total, producto) => total + Number(producto.cantidad || 0), 0);
    contador.textContent = cantidadTotal;
    contador.style.display = cantidadTotal > 0 ? "inline-flex" : "none";
}

const cargar = () => {
    const lista = document.getElementById("lista");
    if (!lista) return;

    lista.innerHTML = "";

    if (carrito.length === 0) {
        lista.innerHTML = `<tr><td colspan="5" class="carrito-vacio">Tu carrito está vacío.</td></tr>`;
        const botonFinalizar = document.getElementById("btn-finalizar-compra");
        if (botonFinalizar) {
            botonFinalizar.disabled = true;
            botonFinalizar.textContent = "Finalizar compra";
        }
        actualizarContadorCarrito();
        return;
    }

    let total = 0;

    carrito.forEach((producto, index) => {
        total += Number(producto.precio || 0);

        const fila = document.createElement("tr");
        const imagenProducto = resolverImagen(producto.imagen, producto.nombre);
        fila.innerHTML = `
            <td><img src="${imagenProducto}" alt="${producto.nombre}" class="img-carrito"></td>
            <td>${producto.cantidad}</td>
            <td>${producto.nombre}</td>
            <td>$ ${producto.precio}</td>
            <td><button class="btn-eliminar" data-index="${index}">X</button></td>
        `;
        lista.appendChild(fila);
    });

    const totalFila = document.createElement("tr");
    totalFila.className = "fila-total";
    totalFila.innerHTML = `
        <td colspan="3"><strong>Total</strong></td>
        <td><strong>$ ${total}</strong></td>
        <td></td>
    `;
    lista.appendChild(totalFila);

    const botonFinalizar = document.getElementById("btn-finalizar-compra");
    if (botonFinalizar) {
        botonFinalizar.disabled = false;
        botonFinalizar.textContent = `Finalizar compra - $ ${total}`;
    }

    actualizarContadorCarrito();
}

const finalizarCompra = () => {
    if (carrito.length === 0) {
        alert("Tu carrito está vacío.");
        return;
    }

    const total = carrito.reduce((sum, producto) => sum + Number(producto.precio || 0), 0);
    alert(`Compra finalizada. Total a pagar: $ ${total}. ¡Gracias por tu compra!`);

    carrito.length = 0;
    localStorage.removeItem("carrito");
    cargar();
}

document.addEventListener("click", async (event) => {
    const boton = event.target.closest(".btn-eliminar");
    if (boton) {
        const index = Number(boton.dataset.index);
        const productoEliminado = carrito[index];

        if (productoEliminado) {
            boton.disabled = true;
            try {
                const stockActualizado = await reponerStock(productoEliminado.id, productoEliminado.cantidad);
                guardarStockLocal(productoEliminado.id, stockActualizado);
            } catch (error) {
                console.error("No se pudo reponer el stock:", error);
                alert("No se pudo devolver el producto al stock. Comprueba tu conexión e inténtalo de nuevo.");
                boton.disabled = false;
                return;
            }
        }

        carrito.splice(index, 1);
        localStorage.setItem("carrito", JSON.stringify(carrito));
        cargar();
        return;
    }

    if (event.target.closest("#btn-finalizar-compra")) {
        finalizarCompra();
    }
});

const iniciar = async () => {
    try {
        await liberarCarritoAnterior();
        carrito = JSON.parse(localStorage.getItem("carrito")) || [];
        cargar();
        actualizarContadorCarrito();
    } catch (error) {
        console.error("No se pudo liberar el stock del carrito anterior:", error);
        const lista = document.getElementById("lista");
        lista.innerHTML = `<tr><td colspan="5" class="carrito-vacio">No se pudo restaurar el stock. Comprueba tu conexión e inténtalo de nuevo.</td></tr>`;
    }
};

iniciar();
