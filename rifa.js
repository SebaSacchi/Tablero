// =====================================================================
// RIFA - Lógica independiente (no toca app.js ni el tablero principal)
// =====================================================================

const SUPABASE_URL = "https://ldjwkwfkiqqfypftdeqa.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_birytOVhIQ0AoBY6f0yT-g_HpV01OhE";

const client = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: { persistSession: true, autoRefreshToken: true }
});

const DOMINIO_USUARIOS = "rifa.app";
const ESTADOS_VALIDOS = ["disponible", "reservado", "vendido", "pagado"];
const FORMAS_PAGO_VALIDAS = ["Transferencia", "Efectivo", "Mercado Pago", "Otro"];
const NUMERO_MIN = 1;
const NUMERO_MAX = 140;

let numeros = [];
let numeroSeleccionado = null;
let estadoSeleccionadoModal = null;
let canalRealtime = null;
let vistaActual = "grilla";

// ==================================================================
// ELEMENTOS
// ==================================================================
const pantallaLogin = document.getElementById("pantallaLogin");
const appRifa = document.getElementById("appRifa");
const formLogin = document.getElementById("formLogin");
const loginUsuario = document.getElementById("loginUsuario");
const loginPassword = document.getElementById("loginPassword");
const loginError = document.getElementById("loginError");
const btnLogin = document.getElementById("btnLogin");
const btnLogout = document.getElementById("btnLogout");
const usuarioActivoEl = document.getElementById("usuarioActivo");
const estadoConexion = document.getElementById("estadoConexion");
const cargando = document.getElementById("cargando");

const buscador = document.getElementById("buscador");
const filtroEstado = document.getElementById("filtroEstado");
const btnVistaGrilla = document.getElementById("btnVistaGrilla");
const btnVistaLista = document.getElementById("btnVistaLista");
const vistaGrilla = document.getElementById("vistaGrilla");
const vistaLista = document.getElementById("vistaLista");
const cuerpoTablaLista = document.getElementById("cuerpoTablaLista");
const sinResultados = document.getElementById("sinResultados");

const cDisponibles = document.getElementById("cDisponibles");
const cReservados = document.getElementById("cReservados");
const cVendidos = document.getElementById("cVendidos");
const cPagados = document.getElementById("cPagados");
const cRecaudado = document.getElementById("cRecaudado");
const cPendiente = document.getElementById("cPendiente");

const btnCopiarResumen = document.getElementById("btnCopiarResumen");
const btnExportarCSV = document.getElementById("btnExportarCSV");
const btnImprimir = document.getElementById("btnImprimir");
const btnBackupJSON = document.getElementById("btnBackupJSON");

const modalOverlay = document.getElementById("modalOverlay");
const modalNumero = document.getElementById("modalNumero");
const modalEstadoBadge = document.getElementById("modalEstadoBadge");
const modalNombre = document.getElementById("modalNombre");
const modalTelefono = document.getElementById("modalTelefono");
const modalImporte = document.getElementById("modalImporte");
const modalFormaPago = document.getElementById("modalFormaPago");
const modalVendidoPor = document.getElementById("modalVendidoPor");
const modalNotas = document.getElementById("modalNotas");
const modalFecha = document.getElementById("modalFecha");
const modalMensaje = document.getElementById("modalMensaje");
const btnCerrarModal = document.getElementById("btnCerrarModal");
const btnCancelarModal = document.getElementById("btnCancelarModal");
const btnGuardarModal = document.getElementById("btnGuardarModal");
const btnLiberarNumero = document.getElementById("btnLiberarNumero");
const botonesEstado = document.querySelectorAll(".btn-estado");

// ==================================================================
// UTILIDADES
// ==================================================================
function escapeHtml(texto) {
  if (texto === null || texto === undefined) return "";
  return String(texto)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function formatoDinero(n) {
  return new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 }).format(n || 0);
}

function formatoFecha(iso) {
  if (!iso) return "-";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleString("es-AR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

function etiquetaEstado(estado) {
  const mapa = { disponible: "Disponible", reservado: "Reservado", vendido: "Vendido", pagado: "Pagado" };
  return mapa[estado] || estado;
}

function mostrarCargando(mostrar) {
  cargando.hidden = !mostrar;
}

function usuarioAEmail(usuario) {
  return `${usuario.trim().toLowerCase().replace(/\s+/g, "")}@${DOMINIO_USUARIOS}`;
}

function nombreVisibleDesdeEmail(email) {
  return (email.split("@")[0] || "").toUpperCase();
}

// ==================================================================
// LOGIN / SESIÓN
// ==================================================================
formLogin.addEventListener("submit", async (ev) => {
  ev.preventDefault();
  ocultarErrorLogin();

  const usuario = loginUsuario.value.trim();
  const password = loginPassword.value;

  if (!usuario || !password) {
    mostrarErrorLogin("Ingresá usuario y contraseña.");
    return;
  }

  btnLogin.disabled = true;
  btnLogin.textContent = "INGRESANDO...";

  const { error } = await client.auth.signInWithPassword({
    email: usuarioAEmail(usuario),
    password
  });

  btnLogin.disabled = false;
  btnLogin.textContent = "INGRESAR";

  if (error) {
    mostrarErrorLogin("Usuario o contraseña incorrectos.");
  } else {
    loginPassword.value = "";
  }
});

function mostrarErrorLogin(msg) {
  loginError.textContent = msg;
  loginError.hidden = false;
}

function ocultarErrorLogin() {
  loginError.hidden = true;
}

btnLogout.addEventListener("click", async () => {
  await client.auth.signOut();
});

client.auth.onAuthStateChange((evento, sesion) => {
  if (sesion) {
    mostrarApp(sesion);
  } else {
    mostrarLogin();
  }
});

async function iniciar() {
  const { data } = await client.auth.getSession();
  if (data.session) {
    mostrarApp(data.session);
  } else {
    mostrarLogin();
  }
}

function mostrarLogin() {
  desuscribirRealtime();
  numeros = [];
  appRifa.hidden = true;
  pantallaLogin.hidden = false;
  loginPassword.value = "";
}

async function mostrarApp(sesion) {
  pantallaLogin.hidden = true;
  appRifa.hidden = false;
  usuarioActivoEl.textContent = nombreVisibleDesdeEmail(sesion.user.email || "");
  await cargarNumeros();
  suscribirRealtime();
}

// ==================================================================
// CARGA DE DATOS + REALTIME
// ==================================================================
async function cargarNumeros() {
  mostrarCargando(true);
  const { data, error } = await client
    .from("rifa_numeros")
    .select("*")
    .order("numero", { ascending: true });
  mostrarCargando(false);

  if (error) {
    mostrarEstadoConexion("No se pudieron cargar los números. Revisá tu conexión e intentá de nuevo.");
    return;
  }

  numeros = data || [];
  renderizarTodo();
}

function suscribirRealtime() {
  desuscribirRealtime();

  canalRealtime = client
    .channel("rifa_numeros_cambios")
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "rifa_numeros" },
      (payload) => aplicarCambioRealtime(payload)
    )
    .subscribe((status) => {
      if (status === "SUBSCRIBED") {
        ocultarEstadoConexion();
      } else if (status === "CHANNEL_ERROR" || status === "TIMED_OUT" || status === "CLOSED") {
        mostrarEstadoConexion("Sin conexión en tiempo real. Los cambios de otros dispositivos podrían tardar en verse.");
      }
    });
}

function desuscribirRealtime() {
  if (canalRealtime) {
    client.removeChannel(canalRealtime);
    canalRealtime = null;
  }
}

function aplicarCambioRealtime(payload) {
  if (payload.eventType === "INSERT") {
    if (!numeros.some((n) => n.id === payload.new.id)) {
      numeros.push(payload.new);
      numeros.sort((a, b) => a.numero - b.numero);
    }
  } else if (payload.eventType === "UPDATE") {
    const idx = numeros.findIndex((n) => n.id === payload.new.id);
    if (idx !== -1) numeros[idx] = payload.new;
  } else if (payload.eventType === "DELETE") {
    numeros = numeros.filter((n) => n.id !== payload.old.id);
  }
  renderizarTodo();

  if (numeroSeleccionado !== null && !modalOverlay.hidden) {
    const actual = numeros.find((n) => n.numero === numeroSeleccionado);
    if (actual) precargarModal(actual);
  }
}

function mostrarEstadoConexion(msg) {
  estadoConexion.textContent = msg;
  estadoConexion.hidden = false;
}

function ocultarEstadoConexion() {
  estadoConexion.hidden = true;
}

// ==================================================================
// RENDER
// ==================================================================
function renderizarTodo() {
  actualizarContadores();
  renderizarGrilla();
  renderizarLista();
}

function coincideFiltro(n, textoBusqueda, estadoFiltro) {
  if (estadoFiltro !== "todos" && n.estado !== estadoFiltro) return false;
  if (!textoBusqueda) return true;
  const t = textoBusqueda.toLowerCase();
  return (
    String(n.numero).includes(t) ||
    (n.nombre || "").toLowerCase().includes(t) ||
    (n.telefono || "").toLowerCase().includes(t)
  );
}

function renderizarGrilla() {
  const textoBusqueda = buscador.value.trim().toLowerCase();
  const estadoFiltro = filtroEstado.value;
  let visibles = 0;

  vistaGrilla.innerHTML = "";
  const frag = document.createDocumentFragment();

  numeros.forEach((n) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = `num-btn estado-${n.estado}`;
    btn.textContent = n.numero;
    btn.setAttribute("aria-label", `Número ${n.numero}, ${etiquetaEstado(n.estado)}`);

    if (!coincideFiltro(n, textoBusqueda, estadoFiltro)) {
      btn.classList.add("oculto");
    } else {
      visibles++;
    }

    btn.addEventListener("click", () => abrirModal(n.numero));
    frag.appendChild(btn);
  });

  vistaGrilla.appendChild(frag);
  sinResultados.hidden = visibles !== 0;
}

function renderizarLista() {
  const textoBusqueda = buscador.value.trim().toLowerCase();
  const estadoFiltro = filtroEstado.value;
  const filtrados = numeros.filter((n) => coincideFiltro(n, textoBusqueda, estadoFiltro));

  cuerpoTablaLista.innerHTML = filtrados
    .map(
      (n) => `
      <tr data-numero="${n.numero}">
        <td>${n.numero}</td>
        <td><span class="chip-estado estado-${n.estado}">${escapeHtml(etiquetaEstado(n.estado))}</span></td>
        <td>${escapeHtml(n.nombre || "-")}</td>
        <td>${escapeHtml(n.telefono || "-")}</td>
        <td>${formatoDinero(n.importe)}</td>
        <td>${escapeHtml(n.forma_pago || "-")}</td>
        <td>${escapeHtml(n.vendido_por || "-")}</td>
        <td>${escapeHtml(formatoFecha(n.actualizado_en))}</td>
      </tr>`
    )
    .join("");

  cuerpoTablaLista.querySelectorAll("tr").forEach((tr) => {
    tr.addEventListener("click", () => abrirModal(Number(tr.dataset.numero)));
  });

  if (vistaActual === "lista") {
    sinResultados.hidden = filtrados.length !== 0;
  }
}

function actualizarContadores() {
  const disponibles = numeros.filter((n) => n.estado === "disponible").length;
  const reservados = numeros.filter((n) => n.estado === "reservado").length;
  const vendidos = numeros.filter((n) => n.estado === "vendido").length;
  const pagados = numeros.filter((n) => n.estado === "pagado").length;

  const recaudado = numeros
    .filter((n) => n.estado === "pagado")
    .reduce((acc, n) => acc + Number(n.importe || 0), 0);

  const pendiente = numeros
    .filter((n) => n.estado === "reservado" || n.estado === "vendido")
    .reduce((acc, n) => acc + Number(n.importe || 0), 0);

  cDisponibles.textContent = disponibles;
  cReservados.textContent = reservados;
  cVendidos.textContent = vendidos;
  cPagados.textContent = pagados;
  cRecaudado.textContent = formatoDinero(recaudado);
  cPendiente.textContent = formatoDinero(pendiente);
}

// ==================================================================
// FILTROS / VISTA
// ==================================================================
buscador.addEventListener("input", () => {
  renderizarGrilla();
  renderizarLista();
});

filtroEstado.addEventListener("change", () => {
  renderizarGrilla();
  renderizarLista();
});

btnVistaGrilla.addEventListener("click", () => cambiarVista("grilla"));
btnVistaLista.addEventListener("click", () => cambiarVista("lista"));

function cambiarVista(vista) {
  vistaActual = vista;
  btnVistaGrilla.classList.toggle("activo", vista === "grilla");
  btnVistaLista.classList.toggle("activo", vista === "lista");
  vistaGrilla.hidden = vista !== "grilla";
  vistaLista.hidden = vista !== "lista";
  renderizarTodo();
}

// ==================================================================
// MODAL
// ==================================================================
function abrirModal(numero) {
  const n = numeros.find((x) => x.numero === numero);
  if (!n) return;

  numeroSeleccionado = numero;
  precargarModal(n);
  modalMensaje.hidden = true;
  modalOverlay.hidden = false;
}

function precargarModal(n) {
  estadoSeleccionadoModal = n.estado;
  modalNumero.textContent = n.numero;
  modalEstadoBadge.textContent = etiquetaEstado(n.estado);
  modalEstadoBadge.className = `badge-estado estado-${n.estado}`;
  modalNombre.value = n.nombre || "";
  modalTelefono.value = n.telefono || "";
  modalImporte.value = n.importe != null ? n.importe : 2500;
  modalFormaPago.value = n.forma_pago || "";
  modalVendidoPor.value = n.vendido_por || "";
  modalNotas.value = n.notas || "";
  modalFecha.textContent = formatoFecha(n.actualizado_en);

  botonesEstado.forEach((b) => b.classList.toggle("activo", b.dataset.estado === n.estado));
}

botonesEstado.forEach((btn) => {
  btn.addEventListener("click", () => {
    estadoSeleccionadoModal = btn.dataset.estado;
    modalEstadoBadge.textContent = etiquetaEstado(estadoSeleccionadoModal);
    modalEstadoBadge.className = `badge-estado estado-${estadoSeleccionadoModal}`;
    botonesEstado.forEach((b) => b.classList.toggle("activo", b === btn));

    if (!modalVendidoPor.value.trim()) {
      modalVendidoPor.value = usuarioActivoEl.textContent;
    }
  });
});

function cerrarModal() {
  modalOverlay.hidden = true;
  numeroSeleccionado = null;
  estadoSeleccionadoModal = null;
}

btnCerrarModal.addEventListener("click", cerrarModal);
btnCancelarModal.addEventListener("click", cerrarModal);
modalOverlay.addEventListener("click", (ev) => {
  if (ev.target === modalOverlay) cerrarModal();
});
document.addEventListener("keydown", (ev) => {
  if (ev.key === "Escape" && !modalOverlay.hidden) cerrarModal();
});

function mostrarMensajeModal(msg, tipo) {
  modalMensaje.textContent = msg;
  modalMensaje.className = `mensaje-modal ${tipo}`;
  modalMensaje.hidden = false;
}

btnGuardarModal.addEventListener("click", async () => {
  if (numeroSeleccionado === null) return;

  const numero = numeroSeleccionado;
  if (!Number.isInteger(numero) || numero < NUMERO_MIN || numero > NUMERO_MAX) {
    mostrarMensajeModal("Número inválido.", "error");
    return;
  }

  const estado = estadoSeleccionadoModal;
  if (!ESTADOS_VALIDOS.includes(estado)) {
    mostrarMensajeModal("Estado inválido.", "error");
    return;
  }

  const importe = Number(modalImporte.value);
  if (!Number.isFinite(importe) || importe < 0) {
    mostrarMensajeModal("El importe debe ser un número mayor o igual a 0.", "error");
    return;
  }

  const formaPago = modalFormaPago.value;
  if (formaPago && !FORMAS_PAGO_VALIDAS.includes(formaPago)) {
    mostrarMensajeModal("Forma de pago inválida.", "error");
    return;
  }

  const cambios = {
    estado,
    nombre: modalNombre.value.trim() || null,
    telefono: modalTelefono.value.trim() || null,
    importe,
    forma_pago: formaPago || null,
    vendido_por: modalVendidoPor.value.trim() || null,
    notas: modalNotas.value.trim() || null
  };

  btnGuardarModal.disabled = true;
  btnGuardarModal.textContent = "GUARDANDO...";
  mostrarCargando(true);

  const { error } = await client.from("rifa_numeros").update(cambios).eq("numero", numero);

  mostrarCargando(false);
  btnGuardarModal.disabled = false;
  btnGuardarModal.textContent = "GUARDAR";

  if (error) {
    mostrarMensajeModal("No se pudo guardar. Verificá tu conexión e intentá de nuevo.", "error");
    return;
  }

  mostrarMensajeModal("Guardado correctamente.", "ok");
  setTimeout(cerrarModal, 600);
});

btnLiberarNumero.addEventListener("click", async () => {
  if (numeroSeleccionado === null) return;
  const numero = numeroSeleccionado;

  const confirmado = confirm(`¿Liberar el número ${numero}? Se van a borrar los datos del comprador.`);
  if (!confirmado) return;

  btnLiberarNumero.disabled = true;
  mostrarCargando(true);

  const { error } = await client
    .from("rifa_numeros")
    .update({
      estado: "disponible",
      nombre: null,
      telefono: null,
      importe: 2500,
      forma_pago: null,
      vendido_por: null,
      notas: null
    })
    .eq("numero", numero);

  mostrarCargando(false);
  btnLiberarNumero.disabled = false;

  if (error) {
    mostrarMensajeModal("No se pudo liberar el número. Verificá tu conexión e intentá de nuevo.", "error");
    return;
  }

  mostrarMensajeModal("Número liberado.", "ok");
  setTimeout(cerrarModal, 600);
});

// ==================================================================
// RESUMEN WHATSAPP
// ==================================================================
btnCopiarResumen.addEventListener("click", async () => {
  const textoBusqueda = buscador.value.trim().toLowerCase();
  const estadoFiltro = filtroEstado.value;

  const conDatos = numeros
    .filter((n) => n.estado !== "disponible")
    .filter((n) => coincideFiltro(n, textoBusqueda, estadoFiltro))
    .sort((a, b) => a.numero - b.numero);

  if (conDatos.length === 0) {
    alert("No hay números vendidos, reservados o pagados para copiar con el filtro actual.");
    return;
  }

  const resumen = conDatos
    .map((n) => `${n.numero} - ${n.nombre || "Sin nombre"} - ${etiquetaEstado(n.estado)}`)
    .join("\n");

  try {
    await navigator.clipboard.writeText(resumen);
    alert("Resumen copiado. Ya lo podés pegar en WhatsApp.");
  } catch (e) {
    const area = document.createElement("textarea");
    area.value = resumen;
    area.style.position = "fixed";
    area.style.opacity = "0";
    document.body.appendChild(area);
    area.select();
    document.execCommand("copy");
    document.body.removeChild(area);
    alert("Resumen copiado. Ya lo podés pegar en WhatsApp.");
  }
});

// ==================================================================
// EXPORTAR CSV
// ==================================================================
function csvEscape(valor) {
  const s = valor === null || valor === undefined ? "" : String(valor);
  if (/[",\n;]/.test(s)) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

btnExportarCSV.addEventListener("click", () => {
  const encabezado = ["Numero", "Estado", "Nombre", "Telefono", "Importe", "Forma de pago", "Vendido por", "Notas", "Actualizado"];
  const filas = numeros
    .slice()
    .sort((a, b) => a.numero - b.numero)
    .map((n) =>
      [
        n.numero,
        etiquetaEstado(n.estado),
        n.nombre || "",
        n.telefono || "",
        n.importe || 0,
        n.forma_pago || "",
        n.vendido_por || "",
        n.notas || "",
        formatoFecha(n.actualizado_en)
      ]
        .map(csvEscape)
        .join(",")
    );

  const csv = "﻿" + [encabezado.join(","), ...filas].join("\n");
  descargarArchivo(csv, `rifa-${fechaArchivo()}.csv`, "text/csv;charset=utf-8;");
});

// ==================================================================
// IMPRIMIR
// ==================================================================
btnImprimir.addEventListener("click", () => {
  cambiarVista("lista");
  setTimeout(() => window.print(), 100);
});

// ==================================================================
// COPIA DE SEGURIDAD JSON
// ==================================================================
btnBackupJSON.addEventListener("click", () => {
  const json = JSON.stringify(numeros, null, 2);
  descargarArchivo(json, `rifa-backup-${fechaArchivo()}.json`, "application/json;charset=utf-8;");
});

function fechaArchivo() {
  return new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-");
}

function descargarArchivo(contenido, nombre, tipo) {
  const blob = new Blob([contenido], { type: tipo });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = nombre;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ==================================================================
// INICIO
// ==================================================================
iniciar();
