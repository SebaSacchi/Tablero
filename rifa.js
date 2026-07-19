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

const btnConfiguracion = document.getElementById("btnConfiguracion");
const modalConfigOverlay = document.getElementById("modalConfigOverlay");
const btnCerrarConfig = document.getElementById("btnCerrarConfig");
const btnCancelarConfig = document.getElementById("btnCancelarConfig");
const btnGuardarConfig = document.getElementById("btnGuardarConfig");
const configMensaje = document.getElementById("configMensaje");
const configDestino = document.getElementById("configDestino");
const configMotivo = document.getElementById("configMotivo");
const configPremio1 = document.getElementById("configPremio1");
const configPremio2 = document.getElementById("configPremio2");
const configValor = document.getElementById("configValor");
const configAlias = document.getElementById("configAlias");
const configCvu = document.getElementById("configCvu");
const configNombre = document.getElementById("configNombre");

const btnGenerarImagen = document.getElementById("btnGenerarImagen");
const modalCompartirOverlay = document.getElementById("modalCompartirOverlay");
const btnCerrarCompartir = document.getElementById("btnCerrarCompartir");
const posterCanvas = document.getElementById("posterCanvas");
const btnDescargarImagen = document.getElementById("btnDescargarImagen");
const compartirAlias = document.getElementById("compartirAlias");
const compartirCvu = document.getElementById("compartirCvu");
const compartirNombre = document.getElementById("compartirNombre");
const btnCopiarMensaje = document.getElementById("btnCopiarMensaje");
const botonesCopiarChico = document.querySelectorAll(".btn-copiar-chico");

let config = {
  destino: "Santa Fe",
  motivo: "Para representarnos en un torneo de vóley",
  premio_1: "Fernet con Coca",
  premio_2: "Camiseta de la Selección Argentina",
  valor: 2500,
  alias: "",
  cvu: "",
  nombre: ""
};

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
  await Promise.all([cargarNumeros(), cargarConfig()]);
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

async function cargarConfig() {
  const { data, error } = await client
    .from("rifa_config")
    .select("*")
    .eq("id", 1)
    .maybeSingle();

  if (!error && data) {
    config = {
      destino: data.destino || "",
      motivo: data.motivo || "",
      premio_1: data.premio_1 || "",
      premio_2: data.premio_2 || "",
      valor: Number(data.valor) || 0,
      alias: data.alias || "",
      cvu: data.cvu || "",
      nombre: data.nombre || ""
    };
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
// PORTAPAPELES (utilidad compartida)
// ==================================================================
async function copiarAlPortapapeles(texto) {
  try {
    await navigator.clipboard.writeText(texto);
  } catch (e) {
    const area = document.createElement("textarea");
    area.value = texto;
    area.style.position = "fixed";
    area.style.opacity = "0";
    document.body.appendChild(area);
    area.select();
    document.execCommand("copy");
    document.body.removeChild(area);
  }
}

// ==================================================================
// RESUMEN WHATSAPP
// ==================================================================
btnCopiarResumen.addEventListener("click", async () => {
  const disponibles = numeros
    .filter((n) => n.estado === "disponible")
    .sort((a, b) => a.numero - b.numero);

  if (disponibles.length === 0) {
    alert("No quedan números disponibles para vender.");
    return;
  }

  const listaNumeros = disponibles.map((n) => n.numero).join(" - ");

  const lineas = [
    `🎟️✨ ¡Quedan números disponibles para la rifa! ✨🎟️`,
    "",
    `${config.motivo || ""}`,
    "",
    `🔢 Disponibles (${disponibles.length}): ${listaNumeros}`,
    "",
    `💵 Valor del número: ${formatoDinero(config.valor)}`,
    "",
    "💳 Datos para transferir:",
    `Alias: ${config.alias || "-"}`,
    `CVU: ${config.cvu || "-"}`,
    `Nombre: ${config.nombre || "-"}`,
    "",
    "📲 ¡Avisame cuál número querés y te lo reservo! 🙏"
  ];

  await copiarAlPortapapeles(lineas.join("\n"));
  alert("Resumen copiado. Ya lo podés pegar en WhatsApp.");
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
// CONFIGURACIÓN DE LA RIFA
// ==================================================================
function abrirModalConfig() {
  configDestino.value = config.destino || "";
  configMotivo.value = config.motivo || "";
  configPremio1.value = config.premio_1 || "";
  configPremio2.value = config.premio_2 || "";
  configValor.value = config.valor || 0;
  configAlias.value = config.alias || "";
  configCvu.value = config.cvu || "";
  configNombre.value = config.nombre || "";
  configMensaje.hidden = true;
  modalConfigOverlay.hidden = false;
}

function cerrarModalConfig() {
  modalConfigOverlay.hidden = true;
}

btnConfiguracion.addEventListener("click", abrirModalConfig);
btnCerrarConfig.addEventListener("click", cerrarModalConfig);
btnCancelarConfig.addEventListener("click", cerrarModalConfig);
modalConfigOverlay.addEventListener("click", (ev) => {
  if (ev.target === modalConfigOverlay) cerrarModalConfig();
});

btnGuardarConfig.addEventListener("click", async () => {
  const valor = Number(configValor.value);
  if (!Number.isFinite(valor) || valor < 0) {
    configMensaje.textContent = "El valor debe ser un número mayor o igual a 0.";
    configMensaje.className = "mensaje-modal error";
    configMensaje.hidden = false;
    return;
  }

  const cambios = {
    destino: configDestino.value.trim(),
    motivo: configMotivo.value.trim(),
    premio_1: configPremio1.value.trim(),
    premio_2: configPremio2.value.trim() || null,
    valor,
    alias: configAlias.value.trim(),
    cvu: configCvu.value.trim(),
    nombre: configNombre.value.trim()
  };

  btnGuardarConfig.disabled = true;
  btnGuardarConfig.textContent = "GUARDANDO...";
  mostrarCargando(true);

  const { error } = await client.from("rifa_config").update(cambios).eq("id", 1);

  mostrarCargando(false);
  btnGuardarConfig.disabled = false;
  btnGuardarConfig.textContent = "GUARDAR";

  if (error) {
    configMensaje.textContent = "No se pudo guardar. Verificá tu conexión e intentá de nuevo.";
    configMensaje.className = "mensaje-modal error";
    configMensaje.hidden = false;
    return;
  }

  config = { ...config, ...cambios, premio_2: cambios.premio_2 || "" };
  configMensaje.textContent = "Guardado correctamente.";
  configMensaje.className = "mensaje-modal ok";
  configMensaje.hidden = false;
  setTimeout(cerrarModalConfig, 600);
});

// ==================================================================
// IMAGEN PARA COMPARTIR (póster con la grilla de números)
// ==================================================================
function dibujarPoster() {
  const ctx = posterCanvas.getContext("2d");
  const ancho = posterCanvas.width;
  const alto = posterCanvas.height;
  const disponibles = numeros.filter((n) => n.estado === "disponible").length;

  ctx.clearRect(0, 0, ancho, alto);

  // Fondo
  ctx.fillStyle = "#fdf6e9";
  ctx.fillRect(0, 0, ancho, alto);

  // Título
  ctx.textAlign = "center";
  ctx.fillStyle = "#c62828";
  ctx.font = "900 108px 'Segoe UI', sans-serif";
  ctx.fillText("🏐 RIFA", ancho / 2, 130);

  ctx.fillStyle = "#2b2118";
  ctx.font = "700 34px 'Segoe UI', sans-serif";
  ctx.fillText("AYUDANOS A VIAJAR A", ancho / 2, 185);

  // Banner destino
  const bannerY = 205;
  const bannerAlto = 90;
  dibujarRectRedondeado(ctx, 60, bannerY, ancho - 120, bannerAlto, 18);
  ctx.fillStyle = "#c62828";
  ctx.fill();
  ctx.fillStyle = "#ffffff";
  ctx.font = "900 56px 'Segoe UI', sans-serif";
  ctx.fillText((config.destino || "").toUpperCase(), ancho / 2, bannerY + 62);

  ctx.fillStyle = "#8e1f1f";
  ctx.font = "600 26px 'Segoe UI', sans-serif";
  ctx.fillText(config.motivo || "", ancho / 2, bannerY + bannerAlto + 36);

  // Grilla de números 1-140 (10 columnas x 14 filas)
  const columnas = 10;
  const filas = 14;
  const gridX = 60;
  const gridY = bannerY + bannerAlto + 70;
  const gridAncho = ancho - 120;
  const celda = gridAncho / columnas;
  const gridAlto = celda * filas;

  ctx.strokeStyle = "#c62828";
  ctx.lineWidth = 2;
  ctx.strokeRect(gridX, gridY, gridAncho, gridAlto);

  const porNumero = new Map(numeros.map((n) => [n.numero, n]));

  for (let i = 0; i < 140; i++) {
    const numero = i + 1;
    const col = i % columnas;
    const fila = Math.floor(i / columnas);
    const x = gridX + col * celda;
    const y = gridY + fila * celda;

    ctx.strokeStyle = "#e3d5b8";
    ctx.lineWidth = 1;
    ctx.strokeRect(x, y, celda, celda);

    const n = porNumero.get(numero);
    const vendido = n && n.estado !== "disponible";

    ctx.textBaseline = "middle";
    if (vendido) {
      ctx.font = `${Math.floor(celda * 0.55)}px 'Segoe UI Emoji', 'Segoe UI', sans-serif`;
      ctx.fillStyle = "#000";
      ctx.fillText("🏐", x + celda / 2, y + celda / 2 + 2);
    } else {
      ctx.font = `700 ${Math.floor(celda * 0.4)}px 'Segoe UI', sans-serif`;
      ctx.fillStyle = "#2b2118";
      ctx.fillText(String(numero), x + celda / 2, y + celda / 2 + 2);
    }
    ctx.textBaseline = "alphabetic";
  }

  let y = gridY + gridAlto + 44;
  ctx.font = "600 24px 'Segoe UI', sans-serif";
  ctx.fillStyle = "#6b5f4f";
  ctx.fillText(`🏐 NÚMEROS VENDIDOS  ·  QUEDAN ${disponibles} DISPONIBLES`, ancho / 2, y);

  // Premios / Valor
  y += 56;
  const mitad = ancho / 2;

  dibujarRectRedondeado(ctx, 60, y, mitad - 90, 44, 10);
  ctx.fillStyle = "#c62828";
  ctx.fill();
  ctx.fillStyle = "#fff";
  ctx.font = "800 24px 'Segoe UI', sans-serif";
  ctx.textAlign = "left";
  ctx.fillText("PREMIOS", 80, y + 30);

  dibujarRectRedondeado(ctx, mitad + 30, y, mitad - 90, 44, 10);
  ctx.fillStyle = "#c62828";
  ctx.fill();
  ctx.fillStyle = "#fff";
  ctx.textAlign = "center";
  ctx.fillText("VALOR", mitad + 30 + (mitad - 90) / 2, y + 30);

  y += 70;
  ctx.textAlign = "left";
  ctx.fillStyle = "#2b2118";
  ctx.font = "700 28px 'Segoe UI', sans-serif";
  ctx.fillText(`🥇 ${config.premio_1 || ""}`, 80, y);
  if (config.premio_2) {
    y += 42;
    ctx.fillText(`🥈 ${config.premio_2}`, 80, y);
  }

  ctx.textAlign = "center";
  ctx.fillStyle = "#c62828";
  ctx.font = "900 52px 'Segoe UI', sans-serif";
  ctx.fillText(formatoDinero(config.valor), mitad + 30 + (mitad - 90) / 2, y - 6);

  // Mensaje
  y += 70;
  ctx.font = "600 24px 'Segoe UI', sans-serif";
  ctx.fillStyle = "#6b5f4f";
  ctx.fillText("❤️ Cada número nos acerca al sueño. ¡Gracias por tu apoyo!", ancho / 2, y);

  // Datos para transferir
  y += 40;
  const cajaAlto = 190;
  dibujarRectRedondeado(ctx, 60, y, ancho - 120, cajaAlto, 16);
  ctx.strokeStyle = "#c62828";
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.textAlign = "center";
  ctx.fillStyle = "#c62828";
  ctx.font = "800 28px 'Segoe UI', sans-serif";
  ctx.fillText("DATOS PARA TRANSFERIR", ancho / 2, y + 42);

  ctx.fillStyle = "#2b2118";
  ctx.font = "600 26px 'Segoe UI', sans-serif";
  ctx.fillText(`Alias: ${config.alias || "-"}`, ancho / 2, y + 90);
  ctx.fillText(`CVU: ${config.cvu || "-"}`, ancho / 2, y + 128);
  ctx.fillText(`Nombre: ${config.nombre || "-"}`, ancho / 2, y + 166);

  // Banner final
  const footerY = alto - 70;
  ctx.fillStyle = "#c62828";
  ctx.fillRect(0, footerY, ancho, 70);
  ctx.fillStyle = "#fff";
  ctx.font = "800 30px 'Segoe UI', sans-serif";
  ctx.fillText(`★ ★  ¡VAMOS POR ${(config.destino || "").toUpperCase()}!  ★ ★`, ancho / 2, footerY + 46);
}

function dibujarRectRedondeado(ctx, x, y, ancho, alto, radio) {
  ctx.beginPath();
  ctx.moveTo(x + radio, y);
  ctx.arcTo(x + ancho, y, x + ancho, y + alto, radio);
  ctx.arcTo(x + ancho, y + alto, x, y + alto, radio);
  ctx.arcTo(x, y + alto, x, y, radio);
  ctx.arcTo(x, y, x + ancho, y, radio);
  ctx.closePath();
}

function generarMensajeCompartir() {
  const disponibles = numeros.filter((n) => n.estado === "disponible").length;
  const lineas = [
    `🏐✨ ¡Ayudanos a llegar a ${config.destino || "nuestro destino"}! ✨🏐`,
    "",
    `${config.motivo || ""}`,
    "",
    "🎁 Premios:",
    `🥇 ${config.premio_1 || ""}`
  ];
  if (config.premio_2) lineas.push(`🥈 ${config.premio_2}`);
  lineas.push(
    "",
    `💵 Valor del número: ${formatoDinero(config.valor)}`,
    "",
    "💳 Datos para transferir:",
    `Alias: ${config.alias || "-"}`,
    `CVU: ${config.cvu || "-"}`,
    `Nombre: ${config.nombre || "-"}`,
    "",
    `🔢 Quedan ${disponibles} números disponibles`,
    "",
    "❤️ Cada número nos acerca al sueño. ¡Gracias por tu apoyo! 🙏"
  );
  return lineas.join("\n");
}

function abrirModalCompartir() {
  compartirAlias.textContent = config.alias || "-";
  compartirCvu.textContent = config.cvu || "-";
  compartirNombre.textContent = config.nombre || "-";
  modalCompartirOverlay.hidden = false;
  dibujarPoster();
}

function cerrarModalCompartir() {
  modalCompartirOverlay.hidden = true;
}

btnGenerarImagen.addEventListener("click", abrirModalCompartir);
btnCerrarCompartir.addEventListener("click", cerrarModalCompartir);
modalCompartirOverlay.addEventListener("click", (ev) => {
  if (ev.target === modalCompartirOverlay) cerrarModalCompartir();
});

btnDescargarImagen.addEventListener("click", () => {
  posterCanvas.toBlob((blob) => {
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `rifa-${fechaArchivo()}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, "image/png");
});

botonesCopiarChico.forEach((btn) => {
  btn.addEventListener("click", async () => {
    const campo = btn.dataset.copiar;
    const valor = config[campo] || "";
    await copiarAlPortapapeles(valor);
    const textoOriginal = btn.textContent;
    btn.textContent = "✅ COPIADO";
    setTimeout(() => { btn.textContent = textoOriginal; }, 1200);
  });
});

btnCopiarMensaje.addEventListener("click", async () => {
  await copiarAlPortapapeles(generarMensajeCompartir());
  const textoOriginal = btnCopiarMensaje.textContent;
  btnCopiarMensaje.textContent = "✅ MENSAJE COPIADO";
  setTimeout(() => { btnCopiarMensaje.textContent = textoOriginal; }, 1500);
});

// ==================================================================
// INICIO
// ==================================================================
iniciar();
