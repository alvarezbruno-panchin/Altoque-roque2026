<<<<<<< HEAD
import { db } from "./firebase-config.js";
import { doc, runTransaction } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";

const cambiarStock = async (productoId, cantidad, factor) => {
    const unidades = Number(cantidad);
    if (!Number.isInteger(unidades) || unidades <= 0) {
        throw new Error("La cantidad debe ser un número entero positivo.");
    }

    return runTransaction(db, async (transaccion) => {
        const referencia = doc(db, "productos", productoId);
        const documento = await transaccion.get(referencia);

        if (!documento.exists()) throw new Error("El producto ya no existe.");

        const stockActual = Number(documento.data().stock || 0);
        const nuevoStock = stockActual + factor * unidades;

        if (nuevoStock < 0) {
            const error = new Error("STOCK_INSUFICIENTE");
            error.stockDisponible = stockActual;
            throw error;
        }

        transaccion.update(referencia, { stock: nuevoStock });
        return nuevoStock;
    });
};

export const descontarStock = (productoId, cantidad) => cambiarStock(productoId, cantidad, -1);
export const reponerStock = (productoId, cantidad) => cambiarStock(productoId, cantidad, 1);

export const liberarCarritoAnterior = async () => {
    const claveSesion = "carritoSesionActiva";
    const tipoNavegacion = performance.getEntriesByType("navigation")[0]?.type;
    const esNuevaVisita = !sessionStorage.getItem(claveSesion) || tipoNavegacion === "reload";

    if (!esNuevaVisita) return;

    let carrito = [];
    try {
        const guardado = JSON.parse(localStorage.getItem("carrito") || "[]");
        if (Array.isArray(guardado)) carrito = guardado;
    } catch (error) {
        console.warn("No se pudo leer el carrito anterior:", error);
    }

    const cantidades = new Map();
    for (const producto of carrito) {
        const cantidad = Number(producto.cantidad);
        if (producto.id && Number.isInteger(cantidad) && cantidad > 0) {
            cantidades.set(producto.id, (cantidades.get(producto.id) || 0) + cantidad);
        }
    }

    if (cantidades.size > 0) {
        const stockPorProducto = await runTransaction(db, async (transaccion) => {
            const referencias = [...cantidades.keys()].map(id => doc(db, "productos", id));
            const documentos = await Promise.all(referencias.map(referencia => transaccion.get(referencia)));
            const actualizados = new Map();

            documentos.forEach((documento, indice) => {
                if (!documento.exists()) return;

                const id = referencias[indice].id;
                const stock = Number(documento.data().stock || 0) + cantidades.get(id);
                transaccion.update(referencias[indice], { stock });
                actualizados.set(id, stock);
            });

            return Object.fromEntries(actualizados);
        });

        try {
            const productos = JSON.parse(localStorage.getItem("productos") || "[]");
            if (Array.isArray(productos)) {
                productos.forEach(producto => {
                    if (stockPorProducto[producto.id] !== undefined) {
                        producto.stock = stockPorProducto[producto.id];
                    }
                });
                localStorage.setItem("productos", JSON.stringify(productos));
            }

            const productoSeleccionado = JSON.parse(localStorage.getItem("producto") || "null");
            if (productoSeleccionado && stockPorProducto[productoSeleccionado.id] !== undefined) {
                productoSeleccionado.stock = stockPorProducto[productoSeleccionado.id];
                localStorage.setItem("producto", JSON.stringify(productoSeleccionado));
            }
        } catch (error) {
            console.warn("No se pudo actualizar la copia local del stock:", error);
        }
    }

    localStorage.removeItem("carrito");
    sessionStorage.setItem(claveSesion, "1");
=======
import { db } from "./firebase-config.js";
import { doc, runTransaction } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";

const cambiarStock = async (productoId, cantidad, factor) => {
    const unidades = Number(cantidad);
    if (!Number.isInteger(unidades) || unidades <= 0) {
        throw new Error("La cantidad debe ser un número entero positivo.");
    }

    return runTransaction(db, async (transaccion) => {
        const referencia = doc(db, "productos", productoId);
        const documento = await transaccion.get(referencia);

        if (!documento.exists()) throw new Error("El producto ya no existe.");

        const stockActual = Number(documento.data().stock || 0);
        const nuevoStock = stockActual + factor * unidades;

        if (nuevoStock < 0) {
            const error = new Error("STOCK_INSUFICIENTE");
            error.stockDisponible = stockActual;
            throw error;
        }

        transaccion.update(referencia, { stock: nuevoStock });
        return nuevoStock;
    });
};

export const descontarStock = (productoId, cantidad) => cambiarStock(productoId, cantidad, -1);
export const reponerStock = (productoId, cantidad) => cambiarStock(productoId, cantidad, 1);

export const liberarCarritoAnterior = async () => {
    const claveSesion = "carritoSesionActiva";
    const tipoNavegacion = performance.getEntriesByType("navigation")[0]?.type;
    const esNuevaVisita = !sessionStorage.getItem(claveSesion) || tipoNavegacion === "reload";

    if (!esNuevaVisita) return;

    let carrito = [];
    try {
        const guardado = JSON.parse(localStorage.getItem("carrito") || "[]");
        if (Array.isArray(guardado)) carrito = guardado;
    } catch (error) {
        console.warn("No se pudo leer el carrito anterior:", error);
    }

    const cantidades = new Map();
    for (const producto of carrito) {
        const cantidad = Number(producto.cantidad);
        if (producto.id && Number.isInteger(cantidad) && cantidad > 0) {
            cantidades.set(producto.id, (cantidades.get(producto.id) || 0) + cantidad);
        }
    }

    if (cantidades.size > 0) {
        const stockPorProducto = await runTransaction(db, async (transaccion) => {
            const referencias = [...cantidades.keys()].map(id => doc(db, "productos", id));
            const documentos = await Promise.all(referencias.map(referencia => transaccion.get(referencia)));
            const actualizados = new Map();

            documentos.forEach((documento, indice) => {
                if (!documento.exists()) return;

                const id = referencias[indice].id;
                const stock = Number(documento.data().stock || 0) + cantidades.get(id);
                transaccion.update(referencias[indice], { stock });
                actualizados.set(id, stock);
            });

            return Object.fromEntries(actualizados);
        });

        try {
            const productos = JSON.parse(localStorage.getItem("productos") || "[]");
            if (Array.isArray(productos)) {
                productos.forEach(producto => {
                    if (stockPorProducto[producto.id] !== undefined) {
                        producto.stock = stockPorProducto[producto.id];
                    }
                });
                localStorage.setItem("productos", JSON.stringify(productos));
            }

            const productoSeleccionado = JSON.parse(localStorage.getItem("producto") || "null");
            if (productoSeleccionado && stockPorProducto[productoSeleccionado.id] !== undefined) {
                productoSeleccionado.stock = stockPorProducto[productoSeleccionado.id];
                localStorage.setItem("producto", JSON.stringify(productoSeleccionado));
            }
        } catch (error) {
            console.warn("No se pudo actualizar la copia local del stock:", error);
        }
    }

    localStorage.removeItem("carrito");
    sessionStorage.setItem(claveSesion, "1");
>>>>>>> aa3701591d18c928a9eaca6ac800b5079eb7362d
};