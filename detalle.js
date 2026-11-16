import { db } from "./firebase-config.js";
import { resolverImagen } from "./imagenes.js";
import { descontarStock, liberarCarritoAnterior } from "./stock.js";

let producto = localStorage.getItem("producto");
let productojson = producto ? JSON.parse(producto) : null;

const volverInicio = () => {
    window.location.href = "index.html";
}

const actualizarContadorCarrito = () => {
    const carrito = JSON.parse(localStorage.getItem("carrito")) || [];
    const contador = document.getElementById("contadorcarrito");
    if (!contador) return;

    const cantidadTotal = carrito.reduce((total, producto) => total + Number(producto.cantidad || 0), 0);
    contador.textContent = cantidadTotal;
    contador.style.display = cantidadTotal > 0 ? "inline-flex" : "none";
}

const cargar = () => {
    const contenedor = document.getElementById("boxproductos");
    contenedor.replaceChildren();

    if (!productojson) {
        const mensaje = document.createElement("p");
        mensaje.textContent = "No hay producto seleccionado.";
        const botonVolver = document.createElement("button");
        botonVolver.textContent = "🏠 Volver al inicio";
        botonVolver.addEventListener("click", volverInicio);
        contenedor.append(mensaje, botonVolver);
        return;
    }

    let parrafo = document.createElement("div");
    parrafo.id = "boxproducto";
    const imagenProducto = resolverImagen(productojson.imagen, productojson.nombre);
    parrafo.innerHTML = `<h2 id="nombre">${productojson.nombre}</h2>
                    <img src="${imagenProducto}" alt="${productojson.nombre}" width="200">
                    <p id="detalle">${productojson.descripcion}</p>
                    <h3 id="precio">$ ${productojson.precio}</h3>
                    <p id="stock">Stock: ${productojson.stock}</p>
                    <div id="boxcontador">
                        <button id="btnrestar" type="button">-</button>
                        <p id="contador">0</p>
                        <button id="btnsumar" type="button">+</button>
                    </div>
                    <button id="btnagregar" type="button">Agregar al carrito</button>
                    `;
    contenedor.appendChild(parrafo);

    document.getElementById("btnrestar").addEventListener("click", restar);
    document.getElementById("btnsumar").addEventListener("click", sumar);
    document.getElementById("btnagregar").addEventListener("click", agregar);
}

let contar = 0;

const restar = () => {
    if (contar > 0) {
        contar = contar - 1;
        document.getElementById("contador").innerHTML = contar;
    }
}

const sumar = () => {
    const stockDisponible = Number(productojson.stock || 0);

    if (contar < stockDisponible) {
        contar = contar + 1;
        document.getElementById("contador").innerHTML = contar;
    } else {
        alert("Stock máximo");
    }
}

const agregar = async () => {
    if (contar === 0) {
        alert("Ingrese la cantidad de productos");
        return;
    }

    const productosGuardados = JSON.parse(localStorage.getItem("productos")) || [];
    const productoEnStock = productosGuardados.find(item => item.id === productojson.id);

    if (!productoEnStock) {
        alert("No hay stock disponible para este producto.");
        return;
    }

    const botonAgregar = document.getElementById("btnagregar");
    botonAgregar.disabled = true;

    try {
        const stockRestante = await descontarStock(productojson.id, contar);
        let carrito = JSON.parse(localStorage.getItem("carrito")) || [];
        const productoExistente = carrito.find(item => item.id === productojson.id);

        if (productoExistente) {
            productoExistente.cantidad += contar;
            productoExistente.precio = productojson.precio * productoExistente.cantidad;
        } else {
            carrito.push({
                id: productojson.id,
                imagen: productojson.imagen,
                nombre: productojson.nombre,
                cantidad: contar,
                precio: productojson.precio * contar
            });
        }

        productoEnStock.stock = stockRestante;
        productojson.stock = stockRestante;
        localStorage.setItem("productos", JSON.stringify(productosGuardados));
        localStorage.setItem("producto", JSON.stringify(productojson));
        localStorage.setItem("carrito", JSON.stringify(carrito));
        actualizarContadorCarrito();
        window.location.href = "carrito.html";
    } catch (error) {
        console.error("No se pudo actualizar el stock:", error);
        if (error.message === "STOCK_INSUFICIENTE") {
            alert(`Solo quedan ${error.stockDisponible} unidades disponibles.`);
        } else {
            alert("No se pudo reservar el stock. Comprueba tu conexión e inténtalo de nuevo.");
        }
        botonAgregar.disabled = false;
    }
};

const vercarrito = () => {
    actualizarContadorCarrito();
}

const iniciar = async () => {
    try {
        await liberarCarritoAnterior();
        const productos = JSON.parse(localStorage.getItem("productos") || "[]");
        const productoActualizado = productos.find(item => item.id === productojson?.id);
        if (productoActualizado) {
            productojson.stock = productoActualizado.stock;
            localStorage.setItem("producto", JSON.stringify(productojson));
        }
        vercarrito();
        cargar();
    } catch (error) {
        console.error("No se pudo liberar el stock del carrito anterior:", error);
        document.getElementById("boxproductos").textContent = "No se pudo restaurar el stock del carrito anterior. Comprueba tu conexión e inténtalo de nuevo.";
    }
};

iniciar();