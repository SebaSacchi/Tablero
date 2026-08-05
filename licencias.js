const SUPABASE_URL = "https://ldjwkwfkiqqfypftdeqa.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_birytOVhIQ0AoBY6f0yT-g_HpV01OhE";

const client = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: { persistSession: true, autoRefreshToken: true }
});

let licencias = [];

const pantallaLogin = document.getElementById("pantallaLogin");
const appLicencias = document.getElementById("appLicencias");
const formLogin = document.getElementById("formLogin");
const loginEmail = document.getElementById("loginEmail");
const loginPassword = document.getElementById("loginPassword");
const loginError = document.getElementById("loginError");
const btnLogin = document.getElementById("btnLogin");
const btnLogout = document.getElementById("btnLogout");
const btnActualizar = document.getElementById("btnActualizar");
const buscador = document.getElementById("buscador");
const cuerpoTabla = document.getElementById("cuerpoTabla");
const cargando = document.getElementById("cargando");
const vacio = document.getElementById("vacio");
const mensajeTop = document.getElementById("mensajeTop");

function escapeHtml(texto) {
  if (texto === null || texto === undefined) return "";
  return String(texto)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function formatoFecha(iso) {
  if (!iso) return "-";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleString("es-AR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

function mostrarMensaje(texto, esError) {
  mensajeTop.textContent = texto;
  mensajeTop.style.color = esError ? "#ff6b6b" : "#fff";
  mensajeTop.hidden = false;
  setTimeout(() => { mensajeTop.hidden = true; }, 3500);
}

// ==================================================================
// LOGIN / SESIÓN
// ==================================================================
formLogin.addEventListener("submit", async (ev) => {
  ev.preventDefault();
  loginError.hidden = true;

  btnLogin.disabled = true;
  btnLogin.textContent = "INGRESANDO...";

  const { error } = await client.auth.signInWithPassword({
    email: loginEmail.value.trim(),
    password: loginPassword.value
  });

  btnLogin.disabled = false;
  btnLogin.textContent = "ENTRAR";

  if (error) {
    loginError.textContent = "Email o contraseña incorrectos.";
    loginError.hidden = false;
  } else {
    loginPassword.value = "";
  }
});

btnLogout.addEventListener("click", async () => {
  await client.auth.signOut();
});

client.auth.onAuthStateChange((evento, sesion) => {
  if (sesion) {
    mostrarApp();
  } else {
    mostrarLogin();
  }
});

async function iniciar() {
  const { data } = await client.auth.getSession();
  if (data.session) {
    mostrarApp();
  } else {
    mostrarLogin();
  }
}

function mostrarLogin() {
  pantallaLogin.hidden = false;
  appLicencias.hidden = true;
}

function mostrarApp() {
  pantallaLogin.hidden = true;
  appLicencias.hidden = false;
  cargarLicencias();
}

// ==================================================================
// DATOS
// ==================================================================
async function cargarLicencias() {
  cargando.hidden = false;
  vacio.hidden = true;
  cuerpoTabla.innerHTML = "";

  const { data, error } = await client
    .from("licencias")
    .select("*")
    .order("creado_en", { ascending: false });

  cargando.hidden = true;

  if (error) {
    mostrarMensaje("Error al cargar licencias: " + error.message, true);
    return;
  }

  licencias = data || [];
  renderTabla();
}

function renderTabla() {
  const filtro = buscador.value.trim().toLowerCase();
  const lista = licencias.filter((l) => {
    if (!filtro) return true;
    return (
      (l.codigo || "").toLowerCase().includes(filtro) ||
      (l.agencia_nombre || "").toLowerCase().includes(filtro) ||
      (l.agencia_titular || "").toLowerCase().includes(filtro) ||
      (l.agencia_provincia || "").toLowerCase().includes(filtro)
    );
  });

  if (lista.length === 0) {
    cuerpoTabla.innerHTML = "";
    vacio.hidden = false;
    return;
  }
  vacio.hidden = true;

  cuerpoTabla.innerHTML = lista.map((l) => filaHtml(l)).join("");

  cuerpoTabla.querySelectorAll("input[type=checkbox]").forEach((el) => {
    el.addEventListener("change", () => alternarActivo(el.dataset.codigo, el.checked));
  });

  cuerpoTabla.querySelectorAll("input[data-campo]").forEach((el) => {
    el.addEventListener("blur", () => guardarCampo(el.dataset.codigo, el.dataset.campo, el.value));
  });

  cuerpoTabla.querySelectorAll("button[data-eliminar]").forEach((el) => {
    el.addEventListener("click", () => eliminarLicencia(el.dataset.eliminar));
  });
}

function filaHtml(l) {
  return `
    <tr data-fila="${escapeHtml(l.codigo)}">
      <td class="codigo-txt">${escapeHtml(l.codigo)}</td>
      <td>
        <label class="switch">
          <input type="checkbox" data-codigo="${escapeHtml(l.codigo)}" ${l.activo ? "checked" : ""}>
          <span class="slider"></span>
        </label>
        <div class="estado-txt" style="color:${l.activo ? "#27ae60" : "#c0392b"}">${l.activo ? "ACTIVO" : "INACTIVO"}</div>
      </td>
      <td><input type="text" value="${escapeHtml(l.agencia_nombre)}" data-codigo="${escapeHtml(l.codigo)}" data-campo="agencia_nombre" placeholder="Nombre fantasía"></td>
      <td><input type="text" value="${escapeHtml(l.agencia_legajo)}" data-codigo="${escapeHtml(l.codigo)}" data-campo="agencia_legajo" placeholder="Legajo"></td>
      <td><input type="text" value="${escapeHtml(l.agencia_titular)}" data-codigo="${escapeHtml(l.codigo)}" data-campo="agencia_titular" placeholder="Titular"></td>
      <td><input type="text" value="${escapeHtml(l.agencia_provincia)}" data-codigo="${escapeHtml(l.codigo)}" data-campo="agencia_provincia" placeholder="Provincia"></td>
      <td><input type="text" value="${escapeHtml(l.notas)}" data-codigo="${escapeHtml(l.codigo)}" data-campo="notas" placeholder="Notas"></td>
      <td class="fecha-txt">${formatoFecha(l.creado_en)}</td>
      <td class="fecha-txt">${formatoFecha(l.activado_en)}</td>
      <td><button class="btn peligro" type="button" data-eliminar="${escapeHtml(l.codigo)}">Eliminar</button></td>
    </tr>
  `;
}

async function alternarActivo(codigo, nuevoValor) {
  const patch = { activo: nuevoValor };
  if (nuevoValor) patch.activado_en = new Date().toISOString();

  const { error } = await client.from("licencias").update(patch).eq("codigo", codigo);
  if (error) {
    mostrarMensaje("Error al actualizar: " + error.message, true);
    return;
  }
  const item = licencias.find((l) => l.codigo === codigo);
  if (item) {
    item.activo = nuevoValor;
    if (nuevoValor) item.activado_en = patch.activado_en;
  }
  mostrarMensaje(nuevoValor ? `Licencia ${codigo} activada.` : `Licencia ${codigo} desactivada.`, false);
  renderTabla();
}

async function guardarCampo(codigo, campo, valor) {
  const item = licencias.find((l) => l.codigo === codigo);
  if (item && item[campo] === valor) return;

  const { error } = await client.from("licencias").update({ [campo]: valor }).eq("codigo", codigo);
  if (error) {
    mostrarMensaje("Error al guardar: " + error.message, true);
    return;
  }
  if (item) item[campo] = valor;
}

async function eliminarLicencia(codigo) {
  if (!confirm(`¿Eliminar la licencia ${codigo}? Esta acción no se puede deshacer.`)) return;

  const { error } = await client.from("licencias").delete().eq("codigo", codigo);
  if (error) {
    mostrarMensaje("Error al eliminar: " + error.message, true);
    return;
  }
  licencias = licencias.filter((l) => l.codigo !== codigo);
  renderTabla();
  mostrarMensaje(`Licencia ${codigo} eliminada.`, false);
}

buscador.addEventListener("input", renderTabla);
btnActualizar.addEventListener("click", cargarLicencias);

iniciar();
