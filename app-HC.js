let animales = [];
let sumaKilajesVacas = 0;
let sumaKilajesTerneros = 0;
let nextId = 1;

document.addEventListener("DOMContentLoaded", function () {
  cargarDatosDesdeLocalStorage();
  actualizarUI();

  document
    .getElementById("btnAgregarAnimal")
    .addEventListener("click", agregarAnimal);
  document
    .getElementById("btnGenerarExcel")
    .addEventListener("click", generarExcel);
  document
    .getElementById("precioVaca")
    .addEventListener("input", actualizarCostos);
  document
    .getElementById("precioTernero")
    .addEventListener("input", actualizarCostos);
});

function cargarDatosDesdeLocalStorage() {
  const animalesGuardados = JSON.parse(localStorage.getItem("animales"));
  if (animalesGuardados) {
    animales = animalesGuardados;
    nextId = obtenerUltimoId() + 1;
    calcularSumaKilajes();
  }
}

function guardarDatosEnLocalStorage() {
  localStorage.setItem("animales", JSON.stringify(animales));
}

function obtenerUltimoId() {
  if (animales.length === 0) {
    return 0;
  }
  return animales[animales.length - 1].id;
}

function agregarAnimal() {
  const nombre = document.getElementById("nombre").value;
  const kilaje = parseFloat(document.getElementById("kilaje").value);
  const categoria = document.getElementById("categoria").value;

  if (nombre && !isNaN(kilaje) && kilaje > 0) {
    const animal = {
      id: nextId++,
      nombre: nombre,
      kilaje: kilaje,
      categoria: categoria,
    };
    animales.push(animal);
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
  sumaKilajesVacas = 0;
  sumaKilajesTerneros = 0;
  animales.forEach((animal) => {
    if (animal.categoria === "vaca") {
      sumaKilajesVacas += animal.kilaje;
    } else if (animal.categoria === "ternero") {
      sumaKilajesTerneros += animal.kilaje;
    }
  });
}

function actualizarUI() {
  const listaVacas = document.getElementById("listaVacas");
  const listaTerneros = document.getElementById("listaTerneros");
  listaVacas.innerHTML = "";
  listaTerneros.innerHTML = "";

  animales.forEach((animal) => {
    const div = document.createElement("div");
    div.className = "animal";
    div.innerHTML = `<strong>ID:</strong> ${animal.id} <br> <strong>Nombre:</strong> ${animal.nombre} <br> <strong>Kilaje:</strong> ${animal.kilaje} kg <br>`;
    const btnEditar = document.createElement("button");
    btnEditar.className = "btn-editar";
    btnEditar.innerText = "Editar";
    btnEditar.addEventListener("click", () => abrirModalEditar(animal.id));
    div.appendChild(btnEditar);
    const btnEliminar = document.createElement("button");
    btnEliminar.className = "btn-eliminar";
    btnEliminar.innerText = "Eliminar";
    btnEliminar.addEventListener("click", () => eliminarAnimal(animal.id));
    div.appendChild(btnEliminar);

    if (animal.categoria === "vaca") {
      listaVacas.appendChild(div);
    } else if (animal.categoria === "ternero") {
      listaTerneros.appendChild(div);
    }
  });

  document.getElementById(
    "sumaKilajesVacas"
  ).textContent = `Suma total de kilajes: ${sumaKilajesVacas} kg`;
  document.getElementById("pesaPromedioVacas").textContent = `Pesa promedio: ${(
    sumaKilajesVacas / animales.filter((a) => a.categoria === "vaca").length ||
    0
  ).toFixed(2)} kg por vaca`;
  document.getElementById(
    "sumaKilajesTerneros"
  ).textContent = `Suma total de kilajes: ${sumaKilajesTerneros} kg`;
  document.getElementById(
    "pesaPromedioTerneros"
  ).textContent = `Pesa promedio: ${(
    sumaKilajesTerneros /
      animales.filter((a) => a.categoria === "ternero").length || 0
  ).toFixed(2)} kg por ternero`;

  actualizarCostos();
}

function actualizarCostos() {
  const precioVaca =
    parseFloat(document.getElementById("precioVaca").value) || 0;
  const precioTernero =
    parseFloat(document.getElementById("precioTernero").value) || 0;

  const costoTotalVacas = precioVaca * sumaKilajesVacas;
  const costoTotalTerneros = precioTernero * sumaKilajesTerneros;

  document.getElementById(
    "costoTotalVacas"
  ).textContent = `Costo total: $${costoTotalVacas.toFixed(2)} COP`;
  document.getElementById(
    "costoTotalTerneros"
  ).textContent = `Costo total: $${costoTotalTerneros.toFixed(2)} COP`;
}

function abrirModalEditar(id) {
  const animal = animales.find((a) => a.id === id);
  if (!animal) return;

  const nombre = prompt("Editar nombre:", animal.nombre);
  const kilaje = parseFloat(prompt("Editar kilaje (kg):", animal.kilaje));

  if (nombre && !isNaN(kilaje) && kilaje > 0) {
    animal.nombre = nombre;
    animal.kilaje = kilaje;
    guardarDatosEnLocalStorage();
    calcularSumaKilajes();
    actualizarUI();
  } else {
    alert("Por favor, ingrese un nombre y un kilaje válido.");
  }
}

function eliminarAnimal(id) {
  animales = animales.filter((a) => a.id !== id);
  guardarDatosEnLocalStorage();
  calcularSumaKilajes();
  actualizarUI();
}

function generarExcel() {
  const wb = XLSX.utils.book_new();
  const vacas = animales.filter((a) => a.categoria === "vaca");
  const terneros = animales.filter((a) => a.categoria === "ternero");

  const vacasSheet = XLSX.utils.json_to_sheet(vacas);
  const ternerosSheet = XLSX.utils.json_to_sheet(terneros);

  XLSX.utils.book_append_sheet(wb, vacasSheet, "Vacas");
  XLSX.utils.book_append_sheet(wb, ternerosSheet, "Terneros");

  try {
    XLSX.writeFile(wb, "Ganado.xlsx");
  } catch (e) {
    console.error("Error al generar el archivo Excel:", e);
  }
}
