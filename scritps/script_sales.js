document.addEventListener("DOMContentLoaded", async () => {
  const listaVentas = document.getElementById("lista-ventas");
  const detalleVenta = document.getElementById("detalle-venta");
  const inputBusqueda = document.getElementById("sale-search");
  const botonBusqueda = document.querySelector(".search-button");
  const botonCrearVenta = document.getElementById("crear-venta");

  const endpointSales = "http://localhost:4000/sales";
  const endpointGames = "http://localhost:4000/videogames";

  let ventas = [];
  let ventasFiltradas = [];
  let juegos = [];

  // 🟢 Cargar datos iniciales
  async function cargarVentas() {
    try {
      const res = await fetch(endpointSales);
      ventas = await res.json();
      ventas.sort((a, b) => new Date(b.date) - new Date(a.date));
      ventasFiltradas = [...ventas];
      renderizarVentas();
    } catch (err) {
      console.error("❌ Error al cargar ventas:", err);
    }
  }

  async function cargarJuegos() {
    try {
      const res = await fetch(endpointGames);
      juegos = await res.json();
    } catch (err) {
      console.error("❌ Error al cargar juegos:", err);
    }
  }

  // 🎨 Mostrar lista de ventas
  function renderizarVentas() {
    listaVentas.innerHTML = "";
    if (ventasFiltradas.length === 0) {
      listaVentas.innerHTML = `<p style="text-align:center; opacity:0.7;">No hay ventas registradas</p>`;
      return;
    }

    ventasFiltradas.forEach((venta, index) => {
      const div = document.createElement("div");
      div.classList.add("juego-item");
      const fecha = new Date(venta.date).toLocaleDateString();
      div.innerHTML = `
        <p><strong>${fecha}</strong> - ${venta.client}</p>
        <p style="opacity:0.7;">Total: $${venta.total.toFixed(2)}</p>
      `;
      div.addEventListener("click", () => mostrarDetalle(index));
      listaVentas.appendChild(div);
    });
  }

  // 🔍 Filtrar por cliente o fecha
  function filtrarVentas() {
    const term = inputBusqueda.value.trim().toLowerCase();
    if (term === "") {
      ventasFiltradas = [...ventas];
    } else {
      ventasFiltradas = ventas.filter(v =>
        v.client.toLowerCase().includes(term) || v.date.includes(term)
      );
    }
    renderizarVentas();
  }

  botonBusqueda.addEventListener("click", filtrarVentas);
  inputBusqueda.addEventListener("keyup", e => {
    if (e.key === "Enter") filtrarVentas();
  });

  // 📋 Mostrar detalle de una venta
  function mostrarDetalle(index) {
    const venta = ventasFiltradas[index];
    const fecha = new Date(venta.date).toLocaleString();

    detalleVenta.innerHTML = `
      <div class="info-juego #factura">
        <h2>Venta del ${fecha}</h2>
        <p><strong>Cliente:</strong> ${venta.client}</p>
        <hr>
        <h3>Productos:</h3>
        <ul style="list-style:none; padding-left:0;">
          ${venta.products
            .map(
              p =>
                `<li>${p.nombre} - $${p.precio} x ${p.cantidad} = <strong>$${(
                  p.precio * p.cantidad
                ).toFixed(2)}</strong></li>`
            )
            .join("")}
        </ul>
        <h3>Total: $${venta.total.toFixed(2)}</h3>
        <button class="borrar-juego" id="eliminar-${venta._id}">Eliminar</button>
      </div>
    `;

    document
      .getElementById(`eliminar-${venta._id}`)
      .addEventListener("click", () => eliminarVenta(venta._id));
  }

  // 🗑️ Eliminar venta
  async function eliminarVenta(id) {
    if (!confirm("¿Seguro que deseas eliminar esta venta?")) return;
    try {
      const res = await fetch(`${endpointSales}/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Error al eliminar");
      alert("🗑️ Venta eliminada");
      cargarVentas();
      detalleVenta.innerHTML = "";
    } catch (err) {
      alert("❌ No se pudo eliminar la venta");
      console.error(err);
    }
  }

  // 🆕 Crear nueva venta
  botonCrearVenta.addEventListener("click", async () => {
    await cargarJuegos();

    detalleVenta.innerHTML = `
      <div class="info-juego #factura">
        <label>Cliente:</label>
        <input type="text" id="nuevo-cliente" placeholder="Nombre del cliente">
        <label>Selecciona juegos:</label>
        <div id="productos-container" style="width:100%; max-height:150px; overflow:auto; border:2px solid var(--color-white); padding:10px; border-radius:6px;">
          ${juegos
            .map(
              j => `
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:5px;">
                <span>${j.title} ($${j.price})</span>
                <input type="number" min="0" max="${j.stock}" data-id="${j._id}" placeholder="cant." style="width:60px;">
              </div>`
            )
            .join("")}
        </div>
        <button class="guardar-nuevo-juego" id="guardar-venta">Guardar Venta</button>
      </div>
    `;

    document
      .getElementById("guardar-venta")
      .addEventListener("click", async () => {
        const cliente = document
          .getElementById("nuevo-cliente")
          .value.trim();
        const fecha = new Date().toISOString();
        const inputs = document.querySelectorAll(
          "#productos-container input[type='number']"
        );

        const productos = [];
        let total = 0;
        inputs.forEach(input => {
          const cantidad = parseInt(input.value);
          if (cantidad > 0) {
            const juego = juegos.find(j => j._id === input.dataset.id);
            if (cantidad > juego.stock) {
              alert(`❌ No hay suficiente stock para ${juego.title}`);
              return;
            }
            productos.push({
              nombre: juego.title,
              precio: juego.price,
              cantidad,
            });
            total += juego.price * cantidad;
          }
        });

        if (!cliente || productos.length === 0) {
          alert("Completa los campos correctamente");
          return;
        }

        const nuevaVenta = { date: fecha || new Date(), client: cliente, products: productos, total };

        try {
          const res = await fetch(endpointSales, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(nuevaVenta),
          });
          if (!res.ok) throw new Error("Error al crear la venta");

          // 🧮 Restar stock a los juegos vendidos
          for (const p of productos) {
            const juego = juegos.find(j => j.title === p.nombre);
            const nuevoStock = juego.stock - p.cantidad;
            await fetch(`${endpointGames}/${juego._id}`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ stock: nuevoStock }),
            });
          }

          alert("✅ Venta creada correctamente");
          cargarVentas();
        } catch (err) {
          console.error("❌ Error al crear venta:", err);
          alert("Error al crear la venta");
        }
      });
  });

  // 🚀 Inicialización
  cargarVentas();
});
