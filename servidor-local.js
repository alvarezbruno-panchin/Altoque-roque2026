<<<<<<< HEAD
const http = require("http");
const fs = require("fs");
const path = require("path");

const root = __dirname;
const port = 8000;
const contentTypes = {
    ".css": "text/css; charset=utf-8",
    ".html": "text/html; charset=utf-8",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".js": "text/javascript; charset=utf-8",
    ".png": "image/png",
    ".svg": "image/svg+xml"
};

http.createServer((request, response) => {
    let requestPath;
    try {
        requestPath = decodeURIComponent(new URL(request.url, "http://localhost").pathname);
    } catch {
        response.writeHead(400).end("Invalid URL");
        return;
    }

    if (requestPath === "/") requestPath = "/index.html";

    const filePath = path.resolve(root, `.${requestPath}`);
    if (!filePath.startsWith(`${root}${path.sep}`)) {
        response.writeHead(403).end("Forbidden");
        return;
    }

    fs.readFile(filePath, (error, content) => {
        if (error) {
            response.writeHead(404).end("Not found");
            return;
        }

        response.writeHead(200, {
            "Content-Type": contentTypes[path.extname(filePath).toLowerCase()] || "application/octet-stream"
        });
        response.end(content);
    });
}).listen(port, "127.0.0.1", () => {
    console.log(`Tienda disponible en http://localhost:${port}`);
=======
const http = require("http");
const fs = require("fs");
const path = require("path");

const root = __dirname;
const port = 8000;
const contentTypes = {
    ".css": "text/css; charset=utf-8",
    ".html": "text/html; charset=utf-8",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".js": "text/javascript; charset=utf-8",
    ".png": "image/png",
    ".svg": "image/svg+xml"
};

http.createServer((request, response) => {
    let requestPath;
    try {
        requestPath = decodeURIComponent(new URL(request.url, "http://localhost").pathname);
    } catch {
        response.writeHead(400).end("Invalid URL");
        return;
    }

    if (requestPath === "/") requestPath = "/index.html";

    const filePath = path.resolve(root, `.${requestPath}`);
    if (!filePath.startsWith(`${root}${path.sep}`)) {
        response.writeHead(403).end("Forbidden");
        return;
    }

    fs.readFile(filePath, (error, content) => {
        if (error) {
            response.writeHead(404).end("Not found");
            return;
        }

        response.writeHead(200, {
            "Content-Type": contentTypes[path.extname(filePath).toLowerCase()] || "application/octet-stream"
        });
        response.end(content);
    });
}).listen(port, "127.0.0.1", () => {
    console.log(`Tienda disponible en http://localhost:${port}`);
>>>>>>> aa3701591d18c928a9eaca6ac800b5079eb7362d
});