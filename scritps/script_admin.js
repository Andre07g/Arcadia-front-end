document.addEventListener("DOMContentLoaded", async () => {
    const listaCuerpo = document.querySelector(".lista-cuerpo");
    const adminJuego = document.querySelector(".admin-cuerpo-juego");
    const botonCrearJuego = document.querySelector(".crear-juego");
    const inputBusqueda = document.getElementById("game-search");
    const botonBusqueda = document.querySelector(".search-button");

    // 🔹 Endpoint base del backend
    const endpoint = "http://localhost:4000/videogames";

    // 🔹 Lista de juegos
    let juegos = [];
    let juegosFiltrados = [];

    // ─────────────────────────────
    // 🟢 Cargar juegos al iniciar
    // ─────────────────────────────
    async function cargarJuegos() {
        try {
            const response = await fetch(endpoint);
            if (!response.ok) throw new Error("Error al obtener los juegos");

            juegos = await response.json();
            juegosFiltrados = [...juegos];
            renderizarLista();

        } catch (error) {
            console.error("❌ Error:", error);
        }
    }

    // ─────────────────────────────
    // 🎨 Renderizar lista de juegos
    // ─────────────────────────────
    function renderizarLista() {
        listaCuerpo.innerHTML = "";

        if (juegosFiltrados.length === 0) {
            listaCuerpo.innerHTML = `<p style="text-align:center; opacity:0.7;">No se encontraron juegos</p>`;
            return;
        }

        juegosFiltrados.forEach((juego, index) => {
            const divJuego = document.createElement("div");
            divJuego.classList.add("juego-listado");
            divJuego.innerHTML = `
                <img src="${juego.image}" alt="${juego.title}">
                <p>${juego.title}</p>
            `;
            divJuego.addEventListener("click", () => mostrarDetalles(index));
            listaCuerpo.appendChild(divJuego);
        });
    }

    // ─────────────────────────────
    // 🔍 Buscar juegos por título
    // ─────────────────────────────
    function buscarJuegos() {
        const termino = inputBusqueda.value.trim().toLowerCase();

        if (termino === "") {
            juegosFiltrados = [...juegos];
        } else {
            juegosFiltrados = juegos.filter(juego =>
                juego.title.toLowerCase().includes(termino)
            );
        }

        renderizarLista();
    }

    botonBusqueda.addEventListener("click", buscarJuegos);
    inputBusqueda.addEventListener("keyup", e => {
        if (e.key === "Enter") buscarJuegos();
    });

    // ─────────────────────────────
    // 🧾 Mostrar detalles del juego
    // ─────────────────────────────
    function mostrarDetalles(index) {
        const juego = juegosFiltrados[index];

        adminJuego.innerHTML = `
            <div id="imagen-juego">
                <img src="${juego.image}" alt="${juego.title}">
            </div>
            <div class="info-juego">
                <label>Título:</label>
                <input type="text" value="${juego.title}" id="title-${index}">
                <label>Género:</label>
                <input type="text" value="${juego.genre}" id="genre-${index}">
                <label>Plataforma:</label>
                <input type="text" value="${juego.platform}" id="platform-${index}">
                <label>Imagen:</label>
                <input type="text" value="${juego.image}" id="image-${index}">
                <label>Precio:</label>
                <input type="number" value="${juego.price}" id="price-${index}">
                <label>Stock:</label>
                <input type="number" value="${juego.stock}" id="stock-${index}">
                <label>Descripción:</label>
                <textarea id="description-${index}" rows="3">${juego.description}</textarea>
                <div class="botones-juego">
                    <button id="delete-${index}" class="borrar-juego">Eliminar</button>
                    <button id="save-${index}">Guardar</button>
                </div>
            </div>
        `;

        document.getElementById(`save-${index}`).addEventListener("click", () => guardarCambios(index));
        document.getElementById(`delete-${index}`).addEventListener("click", () => eliminarJuego(index));
    }

    // ─────────────────────────────
    // 💾 Actualizar (PATCH)
    // ─────────────────────────────
    async function guardarCambios(index) {
        const juego = juegosFiltrados[index];

        const title = document.getElementById(`title-${index}`).value;
        const genre = document.getElementById(`genre-${index}`).value;
        const platform = document.getElementById(`platform-${index}`).value;
        const image = document.getElementById(`image-${index}`).value;
        const description = document.getElementById(`description-${index}`).value;
        const price = parseFloat(document.getElementById(`price-${index}`).value);
        const stock = parseFloat(document.getElementById(`stock-${index}`).value);

        const datosActualizados = { title, genre, platform, image, description, price, stock };

        try {
            const response = await fetch(`${endpoint}/${juego._id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(datosActualizados)
            });

            if (!response.ok) throw new Error("Error al actualizar el juego");

            const indexOriginal = juegos.findIndex(j => j._id === juego._id);
            juegos[indexOriginal] = { ...juegos[indexOriginal], ...datosActualizados };
            juegosFiltrados[index] = { ...juego, ...datosActualizados };

            alert("✅ Juego actualizado correctamente");
            renderizarLista();

        } catch (error) {
            console.error("❌ Error al guardar cambios:", error);
            alert("❌ No se pudo actualizar el juego");
        }
    }

    // ─────────────────────────────
    // 🗑️ Eliminar juego (DELETE)
    // ─────────────────────────────
    async function eliminarJuego(index) {
        const juego = juegosFiltrados[index];
        const confirmar = confirm(`¿Seguro que deseas eliminar "${juego.title}"?`);
        if (!confirmar) return;

        try {
            const response = await fetch(`${endpoint}/${juego._id}`, { method: "DELETE" });
            if (!response.ok) throw new Error("Error al eliminar el juego");

            alert("🗑️ Juego eliminado correctamente");

            // Elimina de ambas listas
            juegos = juegos.filter(j => j._id !== juego._id);
            juegosFiltrados = juegosFiltrados.filter(j => j._id !== juego._id);

            renderizarLista();
            adminJuego.innerHTML = "<p>Selecciona un juego para ver sus detalles</p>";

        } catch (error) {
            console.error("❌ Error al eliminar:", error);
            alert("❌ No se pudo eliminar el juego");
        }
    }

    // ─────────────────────────────
    // 🆕 Crear nuevo juego (POST)
    // ─────────────────────────────
    botonCrearJuego.addEventListener("click", () => {
        if (document.querySelector(".formulario-nuevo-juego")) return;

        adminJuego.innerHTML = "";
        const formulario = document.createElement("div");
        formulario.classList.add("info-juego", "info-juego-form");
        formulario.innerHTML = `
            <label>Título:</label>
            <input type="text" id="nuevo-title">
            <label>Género:</label>
            <input type="text" id="nuevo-genre">
            <label>Plataforma:</label>
            <input type="text" id="nuevo-platform">
            <label>Imagen (URL):</label>
            <input type="text" id="nuevo-image">
            <label>Precio:</label>
            <input type="number" id="nuevo-price">
            <label>Stock:</label>
            <input type="number" id="nuevo-stock">
            <label>Descripción:</label>
            <textarea id="nuevo-description" rows="3"></textarea>
            <button class="guardar-nuevo-juego">Guardar</button>
        `;

        adminJuego.appendChild(formulario);

        const botonGuardar = formulario.querySelector(".guardar-nuevo-juego");
        botonGuardar.addEventListener("click", async () => {
            const nuevoJuego = {
                title: document.getElementById("nuevo-title").value.trim(),
                genre: document.getElementById("nuevo-genre").value.trim(),
                platform: document.getElementById("nuevo-platform").value.trim(),
                image: document.getElementById("nuevo-image").value.trim(),
                price: parseFloat(document.getElementById("nuevo-price").value),
                stock: parseInt(document.getElementById("nuevo-stock").value),
                description: document.getElementById("nuevo-description").value.trim(),
            };

            if (!nuevoJuego.title || !nuevoJuego.genre || !nuevoJuego.platform) {
                alert("Por favor completa todos los campos obligatorios");
                return;
            }

            try {
                const response = await fetch(endpoint, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(nuevoJuego),
                });

                if (!response.ok) throw new Error("Error al crear el juego");

                alert("✅ Juego creado con éxito");
                formulario.remove();
                cargarJuegos(); // Refresca desde el backend

            } catch (error) {
                console.error("❌ Error al crear el juego:", error);
                alert("No se pudo crear el juego");
            }
        });
    });

    // ─────────────────────────────
    // 🚀 Ejecutar al cargar la página
    // ─────────────────────────────
    cargarJuegos();
});
