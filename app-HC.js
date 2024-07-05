let terneros = [];
let sumaKilajes = 0;
let nextId = 1;

// Cargar datos del localStorage al iniciar la página
document.addEventListener("DOMContentLoaded", function () {
  cargarDatosDesdeLocalStorage();
  actualizarUI();

  document
    .getElementById("btnAgregarTernero")
    .addEventListener("click", agregarTernero);
  document
    .getElementById("btnMultiplicar")
    .addEventListener("click", multiplicarKilajes);
  document
    .getElementById("btnGenerarExcel")
    .addEventListener("click", generarExcel);
});

function cargarDatosDesdeLocalStorage() {
  const ternerosGuardados = JSON.parse(localStorage.getItem("terneros"));
  if (ternerosGuardados) {
    terneros = ternerosGuardados;
    nextId = obtenerUltimoId() + 1;
    calcularSumaKilajes();
  }
}

function guardarDatosEnLocalStorage() {
  localStorage.setItem("terneros", JSON.stringify(terneros));
}

function obtenerUltimoId() {
  if (terneros.length === 0) {
    return 0;
  }
  return terneros[terneros.length - 1].id;
}

function agregarTernero() {
  const nombre = document.getElementById("nombre").value;
  const kilaje = parseFloat(document.getElementById("kilaje").value);

  if (nombre && !isNaN(kilaje) && kilaje > 0) {
    const ternero = {
      id: nextId++,
      nombre: nombre,
      kilaje: kilaje,
    };
    terneros.push(ternero);
    guardarDatosEnLocalStorage();
    calcularSumaKilajes();
    actualizarUI();
    document.getElementById("nombre").value = "";
    document.getElementById("kilaje").value = "";
  } else {
    alert("Por favor, ingrese un nombre y un kilaje válido.");
  }
}

function calcularSumaKilajes() {
  sumaKilajes = terneros.reduce((suma, ternero) => suma + ternero.kilaje, 0);
}

function actualizarUI() {
  const listaTerneros = document.getElementById("listaTerneros");
  listaTerneros.innerHTML = "";
  terneros.forEach((ternero, index) => {
    const div = document.createElement("div");
    div.className = "ternero";
    div.innerHTML = `<strong>ID:</strong> ${ternero.id} <br> <strong>Nombre:</strong> ${ternero.nombre} <br> <strong>Kilaje:</strong> ${ternero.kilaje} kg`;

    // Botones de Editar y Eliminar
    const btnEditar = document.createElement("button");
    btnEditar.textContent = "Editar";
    btnEditar.className = "btn-editar";
    btnEditar.addEventListener("click", () => abrirModalEditar(ternero.id));

    const btnEliminar = document.createElement("button");
    btnEliminar.textContent = "Eliminar";
    btnEliminar.className = "btn-eliminar";
    btnEliminar.addEventListener("click", () => eliminarTernero(ternero.id));

    div.appendChild(btnEditar);
    div.appendChild(btnEliminar);

    listaTerneros.appendChild(div);
  });

  document.getElementById(
    "sumaKilajes"
  ).textContent = `Suma total de kilajes: ${sumaKilajes} kg`;

  const pesaPromedio = terneros.length > 0 ? sumaKilajes / terneros.length : 0;
  document.getElementById(
    "pesaPromedio"
  ).textContent = `Pesa promedio: ${pesaPromedio.toFixed(2)} kg por ternero`;
}

function abrirModalEditar(id) {
  const ternero = terneros.find((t) => t.id === id);
  if (ternero) {
    const nuevoNombre = prompt(
      "Ingrese el nuevo nombre del ternero:",
      ternero.nombre
    );
    const nuevoKilaje = parseFloat(
      prompt("Ingrese el nuevo kilaje del ternero:", ternero.kilaje)
    );

    if (nuevoNombre && !isNaN(nuevoKilaje) && nuevoKilaje > 0) {
      ternero.nombre = nuevoNombre;
      ternero.kilaje = nuevoKilaje;
      guardarDatosEnLocalStorage();
      calcularSumaKilajes();
      actualizarUI();
    } else {
      alert("Por favor, ingrese un nombre y un kilaje válido.");
    }
  } else {
    alert("No se encontró el ternero para editar.");
  }
}

function eliminarTernero(id) {
  const indice = terneros.findIndex((t) => t.id === id);
  if (indice !== -1) {
    terneros.splice(indice, 1);
    guardarDatosEnLocalStorage();
    calcularSumaKilajes();
    actualizarUI();
  } else {
    alert("No se encontró el ternero para eliminar.");
  }
}

function multiplicarKilajes() {
  const multiplicador = parseFloat(
    document.getElementById("multiplicador").value
  );
  if (!isNaN(multiplicador) && multiplicador > 0) {
    const costoTotal = sumaKilajes * multiplicador;
    document.getElementById(
      "resultadoMultiplicado"
    ).textContent = `Costo total: $${new Intl.NumberFormat("es-CO").format(
      costoTotal.toFixed(2)
    )} COP`;

    // Actualizar datos en el Excel
    generarExcel();
  } else {
    alert("Por favor, ingrese un multiplicador válido.");
  }
}

function generarExcel() {
  const wb = XLSX.utils.book_new();
  const ws_data = [["ID", "Nombre", "Kilaje"]];

  terneros.forEach((ternero) => {
    ws_data.push([ternero.id, ternero.nombre, ternero.kilaje]);
  });

  // Agregar fila con suma total de kilajes y pesa promedio
  ws_data.push(["", "Suma total de kilajes:", sumaKilajes.toFixed(2)]);
  ws_data.push([
    "",
    "Pesa promedio:",
    (sumaKilajes / terneros.length).toFixed(2),
  ]);

  // Calcular y agregar fila con costo total en pesos colombianos
  const multiplicador = parseFloat(
    document.getElementById("multiplicador").value
  );
  if (!isNaN(multiplicador) && multiplicador > 0) {
    const costoTotal = sumaKilajes * multiplicador;
    ws_data.push([
      "",
      "Costo total:",
      `$${new Intl.NumberFormat("es-CO").format(costoTotal.toFixed(2))} COP`,
    ]);
  }

  const ws = XLSX.utils.aoa_to_sheet(ws_data);
  XLSX.utils.book_append_sheet(wb, ws, "Terneros");

  XLSX.writeFile(wb, "terneros.xlsx");
}
