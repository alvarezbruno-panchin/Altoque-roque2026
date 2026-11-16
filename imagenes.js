const imagenesPorProducto = [
    ["cococola", "coca.jpg"],
    ["coca", "coca.jpg"],
    ["bon o bon", "bon o bon.jpg"],
    ["papas", "papas.jpg"],
    ["alfajor", "alfajoro.jpg"],
    ["agua", "agua.jpg"],
    ["chocolate", "chocolate.jpg"],
    ["sugus", "sugus.jpg"],
    ["speed", "speed.jpg"],
    ["oreo", "oreos.jpg"],
    ["beldent", "beldent.jpg"]
];

const imagenLocalPorNombre = (nombre) => {
    const nombreNormalizado = String(nombre || "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase();
    const coincidencia = imagenesPorProducto.find(([clave]) => nombreNormalizado.includes(clave));

    return coincidencia ? `imagenes/${coincidencia[1]}` : "";
};

export const resolverImagen = (ruta, nombre) => {
    const imagenLocal = imagenLocalPorNombre(nombre);
    if (!ruta) return imagenLocal;

    const valor = String(ruta).trim();
    if (/^data:image\//i.test(valor)) return valor;

    if (/^https?:/i.test(valor)) {
        try {
            const archivo = decodeURIComponent(new URL(valor).pathname.split("/").pop()).toLowerCase();
            return archivo === "tele.jpg" ? imagenLocal || valor : valor;
        } catch {
            return valor;
        }
    }

    const rutaLocal = valor.replaceAll("\\", "/").replace(/^\.\//, "");
    if (rutaLocal.split("/").pop().toLowerCase() === "tele.jpg") {
        return imagenLocal || `imagenes/${rutaLocal.split("/").pop()}`;
    }

    return rutaLocal.startsWith("imagenes/") ? rutaLocal : `imagenes/${rutaLocal.split("/").pop()}`;
};