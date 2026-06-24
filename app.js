function actualizarFecha() {
  const ahora = new Date();

  const opciones = {
    weekday: "long",
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  };

  document.getElementById("fecha").textContent =
    ahora.toLocaleDateString("es-AR", opciones).toUpperCase();
}

actualizarFecha();
setInterval(actualizarFecha, 1000);
