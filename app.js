const app = document.getElementById("app");

const SUPABASE_URL = "https://ldjwkwfkiqqfypftdeqa.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_birytOVhIQ0AoBY6f0yT-g_HpV01OhE";

const loterias = ["PROVINCIA", "CIUDAD", "CORDOBA", "SANTA FE", "ENTRE RIOS", "MONTEVIDEO"];

const loteriasBase = ["PROVINCIA", "CIUDAD", "CORDOBA", "SANTA FE", "ENTRE RIOS"];

// Más adelante estos feriados los cargamos desde Supabase.
// Formato: "YYYY-MM-DD"
const feriadosUruguay = [
  // "2026-06-19"
];

function fechaISO(fecha) {
  const y = fecha.getFullYear();
  const m = String(fecha.getMonth() + 1).padStart(2, "0");
  const d = String(fecha.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function esFeriadoUruguay(fecha) {
  return feriadosUruguay.includes(fechaISO(fecha));
}

function getLoteriasTurno(turno, fecha = new Date()) {
  const dia = fecha.getDay();
  // 0 domingo, 1 lunes, 2 martes, 3 miércoles, 4 jueves, 5 viernes, 6 sábado

  const esLunesAViernes = dia >= 1 && dia <= 5;
  const esSabado = dia === 6;

  let lista = [...loteriasBase];

  const montevideoHabilitado =
    !esFeriadoUruguay(fecha) &&
    (
      (esLunesAViernes && (turno === "MATUTINA" || turno === "NOCTURNA")) ||
      (esSabado && turno === "NOCTURNA")
    );

  if (montevideoHabilitado) {
    lista.push("MONTEVIDEO");
  }

  return lista;
}


const ordenTurnos = ["PREVIA", "PRIMERA", "MATUTINA", "VESPERTINA", "NOCTURNA"];

const horariosTurnos = {
  PREVIA: { inicio: "10:15", fin: "10:45" },
  PRIMERA: { inicio: "12:00", fin: "12:30" },
  MATUTINA: { inicio: "15:00", fin: "15:30" },
  VESPERTINA: { inicio: "18:00", fin: "18:30" },
  NOCTURNA: { inicio: "21:00", fin: "21:30" }
};

const resultados = {
  PREVIA: {
    PROVINCIA: ["2170","3790","8687","9382","2432","4576","6224","8999","2896","7729","6833","2685","0028","8996","4266","9387","0263","1383","9975","0550"],
    CIUDAD: ["1715","6542","7028","5383","1409","3882","0699","3436","8194","0388","1557","2245","4655","5368","8404","3672","1240","8298","8923","8620"],
    CORDOBA: ["1898","7598","5118","5806","8995","3666","7438","1415","5458","1704","0255","4934","2238","1823","6216","8458","7575","4435","5862","5521"],
    "SANTA FE": ["0255","7489","8000","9171","2017","4061","8433","6019","0589","8197","0395","9931","4027","7983","2015","0539","6589","5454","5066","0764"],
    "ENTRE RIOS": ["5648","8444","9692","3305","8948","0133","2315","2341","0129","5048","7255","7985","1702","0116","5834","1921","3909","9153","2629","1885"],
    MONTEVIDEO: ["----","----","----","----","----","----","----","----","----","----","----","----","----","----","----","----","----","----","----","----"]
  },
  PRIMERA: {
    PROVINCIA: ["6932","2170","5801","6447","0142","5208","7010","9420","6568","3910","3367","5127","6403","6666","2383","1949","1733","9952","2359","8142"],
    CIUDAD: ["4620","9047","9205","0952","8674","0827","5584","3802","0705","6143","4232","1232","1075","7402","1661","5522","6217","5637","7269","3742"],
    CORDOBA: ["5961","6136","2943","1491","7155","5878","6894","1752","1705","9857","7241","9681","1610","2270","1964","8626","6880","0949","9527","1865"],
    "SANTA FE": ["4936","4097","4853","4584","5715","6885","4344","5562","3761","6373","5905","4172","7235","6393","7741","7911","3924","6447","7223","7232"],
    "ENTRE RIOS": ["7052","1686","0200","1479","0420","9169","1596","5882","0175","4444","6318","8888","6675","6911","1376","3528","5277","7391","7252","0784"],
    MONTEVIDEO: ["----","----","----","----","----","----","----","----","----","----","----","----","----","----","----","----","----","----","----","----"]
  },
  MATUTINA: {
    PROVINCIA: ["5608","8291","7767","3542","2897","7205","3845","4370","3630","8033","3742","7281","7359","8600","9879","2832","6712","2260","5172","3011"],
    CIUDAD: ["5898","7392","3082","3039","8419","5933","0382","2448","5197","2516","4644","6376","4099","6012","2242","3771","5175","7372","1111","0419"],
    CORDOBA: ["4507","5042","1155","2385","1699","8400","6569","3917","6542","8606","9632","9965","7849","6545","3225","2666","6676","2362","3620","6267"],
    "SANTA FE": ["2732","6479","0228","5653","2905","0496","2414","4720","7737","0855","0886","9393","8254","2976","0626","0828","7867","6083","0311","9614"],
    "ENTRE RIOS": ["1549","4232","7165","0558","9299","3305","5691","2933","9399","9761","3830","3002","7221","1915","3209","5520","5018","2804","7575","8773"],
    MONTEVIDEO: ["5892","7317","3559","3864","8552","5700","0571","2416","5210","2110","4764","6668","4756","6839","2337","3937","5201","7658","1290","0315"]
  },
  VESPERTINA: {
    PROVINCIA: ["8144","4061","8792","9775","6512","6948","7041","3813","2329","3067","8277","4296","7746","5622","3988","5818","0211","7101","1545","4834"],
    CIUDAD: ["6068","0443","5382","0367","4068","7973","7022","7866","7217","3447","9054","1837","2832","7817","9773","5475","8608","9632","2530","7196"],
    CORDOBA: ["4806","1538","1850","6579","0316","9068","4479","5426","2522","8982","0351","9870","4768","3088","0028","2573","3727","1727","1668","9001"],
    "SANTA FE": ["1741","3638","7563","8770","3195","0561","6112","0335","0104","0523","1378","6139","6806","3445","3394","6578","7371","1931","2049","7772"],
    "ENTRE RIOS": ["7313","3275","0585","1628","4805","9183","0759","3651","4145","4361","3884","1246","3834","0652","3891","6682","6584","9972","5162","2222"],
    MONTEVIDEO: ["----","----","----","----","----","----","----","----","----","----","----","----","----","----","----","----","----","----","----","----"]
  },
  NOCTURNA: {
    PROVINCIA: ["2771","4769","7558","3820","6921","2841","5353","5174","4830","1680","7533","5066","0306","3985","8773","7056","2881","4767","1950","1741"],
    CIUDAD: ["1488","1661","0016","9100","6422","1675","7730","4021","8876","0943","2991","7938","2256","6127","4737","8269","2173","3330","1923","5473"],
    CORDOBA: ["7750","3630","9677","1923","5365","8313","0310","8054","1095","5385","8920","3038","0634","4411","5571","3100","9840","5261","2087","1138"],
    "SANTA FE": ["8603","1183","7504","2799","6895","4944","3343","0688","0591","9337","6594","0095","7329","8084","2681","6338","4446","3772","7338","7525"],
    "ENTRE RIOS": ["8684","6424","4492","9605","4264","6641","3502","5025","2294","9570","3811","6305","1194","1572","8869","0605","4513","7451","6416","5487"],
    MONTEVIDEO: ["1626","1220","0882","9036","6781","1681","7864","4951","8689","0744","2698","7315","2340","6015","4374","8782","2071","3865","1912","5441"]
  }
};

let pantallaActual = "PREVIA";
let renderTurnoId = 0;
const resultadosSupabaseCache = {};
const resultadosCacheTiempo = {};
let ultimasCabezasCache = [];
let ultimasCabezasCacheTiempo = 0;
let resultadosPlusCache = null;
let resultadosPlusCacheTiempo = 0;

const PUB_FILES = ["img1.jpg", "img2.jpg", "pub3.jpg", "pub4.jpg", "pub5.jpg", "pub6.jpg", "pub7.jpg", "pub8.jpg"];
const LAT_FILES = ["img3.jpg", "lat2.jpg", "lat3.jpg", "lat4.jpg", "lat5.jpg", "lat6.jpg", "lat7.jpg", "lat8.jpg"];

let pubImagesCargadas = [];
let pubIndex = 0;
let pubInterval = null;

let latImagesCargadas = [];
let latIndex = 0;
let latInterval = null;
let latCacheTiempo = 0;

function getMediaBase() {
  return supabaseConfigurado()
    ? `${SUPABASE_URL.replace(/\/$/, "")}/storage/v1/object/public/media`
    : "media";
}

function preloadImages(files) {
  const base = getMediaBase();
  const cache = Date.now();
  return Promise.all(
    files.map(file => new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        if (img.naturalWidth <= 1 && img.naturalHeight <= 1) resolve(null);
        else resolve(`${base}/${file}`);
      };
      img.onerror = () => resolve(null);
      img.src = `${base}/${file}?v=${cache}`;
    }))
  ).then(urls => urls.filter(Boolean));
}

function limpiarPubInterval() {
  if (pubInterval) { clearInterval(pubInterval); pubInterval = null; }
}

function limpiarLatInterval() {
  if (latInterval) { clearInterval(latInterval); latInterval = null; }
}

async function cargarLatImages() {
  if (latImagesCargadas.length > 0 && (Date.now() - latCacheTiempo) < 300000) {
    return latImagesCargadas;
  }
  latImagesCargadas = await preloadImages(LAT_FILES);
  latCacheTiempo = Date.now();
  if (latImagesCargadas.length === 0) latIndex = 0;
  else latIndex = latIndex % latImagesCargadas.length;
  return latImagesCargadas;
}

function iniciarLatRotacion() {
  if (latInterval) return;
  if (latImagesCargadas.length <= 1) return;
  latInterval = setInterval(() => {
    latIndex = (latIndex + 1) % latImagesCargadas.length;
    const img = document.querySelector(".promo-lateral img");
    if (img) {
      img.style.opacity = "0";
      setTimeout(() => {
        img.src = latImagesCargadas[latIndex];
        img.style.opacity = "1";
      }, 300);
    }
  }, 60000);
}

function latImagenActual() {
  if (latImagesCargadas.length === 0) return "";
  return latImagesCargadas[latIndex % latImagesCargadas.length];
}

function cambiarLatImagen(dir) {
  if (latImagesCargadas.length <= 1) return;
  latIndex = (latIndex + dir + latImagesCargadas.length) % latImagesCargadas.length;
  const img = document.querySelector(".promo-lateral img");
  if (img) {
    img.style.opacity = "0";
    setTimeout(() => {
      img.src = latImagesCargadas[latIndex];
      img.style.opacity = "1";
    }, 300);
  }
  limpiarLatInterval();
  iniciarLatRotacion();
}

function fechaTexto() {
  const ahora = new Date();
  const fecha = ahora.toLocaleDateString("es-AR", {
    weekday: "long",
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  }).toUpperCase();
  const hora = ahora.toLocaleTimeString("es-AR", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  });

  return `${fecha} · ${hora}`;
}

function soloFechaTexto() {
  return new Date().toLocaleDateString("es-AR", {
    weekday: "long",
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  }).toUpperCase();
}

function soloHoraTexto() {
  return new Date().toLocaleTimeString("es-AR", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false
  });
}

function formatoPesos(monto) {
  const n = Number(monto);
  if (!Number.isFinite(n)) return "$ --";
  return "$ " + n.toLocaleString("es-AR", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

function quitarDecimales(importe) {
  return String(importe ?? "").replace(/,\d+$/, "");
}

const cierreTurnos = {
  PREVIA: "10:05",
  PRIMERA: "11:50",
  MATUTINA: "14:50",
  VESPERTINA: "17:50",
  NOCTURNA: "20:50"
};

let cierreInterval = null;

function limpiarCierreInterval() {
  if (cierreInterval) { clearInterval(cierreInterval); cierreInterval = null; }
}

function calcularCuentaRegresiva(turno) {
  const cierre = cierreTurnos[turno];
  if (!cierre) return null;

  const ahora = new Date();
  const [ch, cm] = cierre.split(":").map(Number);
  const cierreMin = ch * 60 + cm;
  const ahoraMin = ahora.getHours() * 60 + ahora.getMinutes();
  const ahoraSeg = ahoraMin * 60 + ahora.getSeconds();
  const cierreSeg = cierreMin * 60;
  const diff = cierreSeg - ahoraSeg;

  if (diff <= 0) return null;

  const h = Math.floor(diff / 3600);
  const m = Math.floor((diff % 3600) / 60);
  const s = diff % 60;

  const sPad = String(s).padStart(2, "0");
  const mPad = String(m).padStart(2, "0");

  if (h > 0) return `${h}:${mPad}:${sPad}`;
  return `${mPad}:${sPad}`;
}

function actualizarTopbar(turno) {
  const horaEl = document.getElementById("topbar-hora");
  const cierreEl = document.getElementById("topbar-cierre");
  if (horaEl) horaEl.textContent = soloHoraTexto();
  if (cierreEl) {
    const cuenta = calcularCuentaRegresiva(turno);
    cierreEl.innerHTML = cuenta ? `<small>CIERRA EN</small> ${cuenta}` : "";
  }
}

function iniciarCierreInterval(turno) {
  limpiarCierreInterval();
  actualizarTopbar(turno);
  cierreInterval = setInterval(() => actualizarTopbar(turno), 1000);
}

function fechaCortaTexto(fecha = new Date()) {
  const d = String(fecha.getDate()).padStart(2, "0");
  const m = String(fecha.getMonth() + 1).padStart(2, "0");
  const y = fecha.getFullYear();
  return `${d}-${m}-${y}`;
}

function fechaCabezasTexto(fecha = new Date()) {
  const dia = fecha.toLocaleDateString("es-AR", { weekday: "long" }).toUpperCase();
  return `${dia} ${fechaCortaTexto(fecha)}`;
}

function fechaDesdeISO(fechaTxt) {
  const [y, m, d] = fechaTxt.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function etiquetaDiaHistorial(fecha, esHoy = false) {
  if (esHoy) {
    return "HOY";
  }

  return fecha.toLocaleDateString("es-AR", { weekday: "long" }).toUpperCase();
}

function horaAMinutos(hora) {
  const [h, m] = hora.split(":").map(Number);
  return h * 60 + m;
}

function fechaAyer(fecha = new Date()) {
  const ayer = new Date(fecha);
  ayer.setDate(ayer.getDate() - 1);
  return ayer;
}

function ultimoDiaSorteo(fecha = new Date()) {
  const d = new Date(fecha);
  d.setDate(d.getDate() - 1);
  while (d.getDay() === 0) {
    d.setDate(d.getDate() - 1);
  }
  return d;
}

function supabaseConfigurado() {
  return (
    SUPABASE_URL &&
    SUPABASE_ANON_KEY &&
    SUPABASE_URL !== "PEGAR_SUPABASE_URL" &&
    SUPABASE_ANON_KEY !== "PEGAR_SUPABASE_ANON_KEY"
  );
}

function cacheKeyResultados(turno, fecha) {
  return `${fechaISO(fecha)}|${turno}`;
}

function getResultadosTurno(turno, fecha) {
  return resultadosSupabaseCache[cacheKeyResultados(turno, fecha)] || resultados[turno];
}

function getResultadosRealesTurno(turno, fecha) {
  return resultadosSupabaseCache[cacheKeyResultados(turno, fecha)] || null;
}

function tieneResultadosReales(resultadoTurno) {
  return Boolean(resultadoTurno && Object.keys(resultadoTurno).length > 0);
}

async function cargarResultadosSupabase(turno, fecha) {
  if (!supabaseConfigurado()) {
    return null;
  }

  const key = cacheKeyResultados(turno, fecha);
  if (resultadosSupabaseCache[key] && (Date.now() - (resultadosCacheTiempo[key] || 0)) < 15000) {
    return resultadosSupabaseCache[key];
  }

  const fechaTxt = fechaISO(fecha);
  const baseUrl = SUPABASE_URL.replace(/\/$/, "");
  const params = new URLSearchParams({
    select: "loteria,posicion,numero",
    fecha: `eq.${fechaTxt}`,
    turno: `eq.${turno}`,
    order: "loteria.asc,posicion.asc"
  });

  try {
    const respuesta = await fetch(`${baseUrl}/rest/v1/resultados_quiniela?${params.toString()}`, {
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`
      }
    });

    if (!respuesta.ok) {
      console.warn("No se pudieron cargar resultados desde Supabase", respuesta.status);
      return null;
    }

    const filas = await respuesta.json();

    if (!Array.isArray(filas) || filas.length === 0) {
      delete resultadosSupabaseCache[cacheKeyResultados(turno, fecha)];
      return null;
    }

    const agrupado = {};

    filas.forEach((fila) => {
      const loteria = fila.loteria;
      const posicion = Number(fila.posicion);

      if (!loteria || !Number.isFinite(posicion) || posicion < 1) {
        return;
      }

      if (!agrupado[loteria]) {
        agrupado[loteria] = [];
      }

      agrupado[loteria][posicion - 1] = String(fila.numero).padStart(4, "0");
    });

    resultadosSupabaseCache[key] = agrupado;
    resultadosCacheTiempo[key] = Date.now();
    return agrupado;
  } catch (error) {
    console.warn("Error cargando resultados desde Supabase", error);
    return null;
  }
}

function nombreJuegoPlus(juego) {
  return juego === "PLUS" ? "QUINIELA PLUS" :
         juego === "SUPER" ? "SUPER PLUS" :
         juego === "CHANCE" ? "CHANCE PLUS" : juego;
}

const POZO_MINIMO_PLUS = { PLUS: 60000000, SUPER: 10000000, CHANCE: 40000000 };

function calcularPozoEstimado(juego, pozoActual, premios) {
  const primerPremio = Array.isArray(premios) ? premios[0] : null;
  const vacante = !!primerPremio && /vacante/i.test(primerPremio.ganadores || "");
  if (vacante) {
    return Math.ceil((pozoActual || 0) / 1000000) * 1000000;
  }
  return POZO_MINIMO_PLUS[juego] || 0;
}

async function cargarResultadosPlus() {
  if (!supabaseConfigurado()) {
    return null;
  }

  if (resultadosPlusCache && (Date.now() - resultadosPlusCacheTiempo) < 60000) {
    return resultadosPlusCache;
  }

  const baseUrl = SUPABASE_URL.replace(/\/$/, "");
  const params = new URLSearchParams({
    select: "juego,fecha,sorteo,numeros,pozo,premios_detalle",
    order: "fecha.desc"
  });

  try {
    const respuesta = await fetch(`${baseUrl}/rest/v1/resultados_plus?${params.toString()}`, {
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`
      }
    });

    if (!respuesta.ok) {
      console.warn("No se pudieron cargar resultados de Quiniela Plus", respuesta.status);
      return null;
    }

    const filas = await respuesta.json();

    if (!Array.isArray(filas) || filas.length === 0) {
      resultadosPlusCache = null;
      resultadosPlusCacheTiempo = Date.now();
      return null;
    }

    const fechaMax = filas[0].fecha;
    const filasDia = filas.filter(f => f.fecha === fechaMax);

    const juegos = {};
    filasDia.forEach(f => {
      const numeros = (f.numeros || "")
        .split(/[\s-]+/)
        .filter(Boolean)
        .sort((a, b) => Number(a) - Number(b));

      juegos[f.juego] = {
        numeros,
        pozo: Number(f.pozo) || 0,
        premios: Array.isArray(f.premios_detalle) ? f.premios_detalle : []
      };
    });

    resultadosPlusCache = { fecha: fechaMax, sorteo: filasDia[0].sorteo || "", juegos };
    resultadosPlusCacheTiempo = Date.now();
    return resultadosPlusCache;
  } catch (error) {
    console.warn("Error cargando resultados de Quiniela Plus", error);
    return null;
  }
}

function estadoTurno(turno, fecha = new Date()) {
  if (fecha.getDay() === 0) {
    return {
      clase: "estado-finalizado",
      etiqueta: "SÁBADO",
      detalle: "SIN SORTEO · PRÓXIMO LUNES",
      fechaResultados: ultimoDiaSorteo(fecha)
    };
  }

  const horario = horariosTurnos[turno];
  const minutos = fecha.getHours() * 60 + fecha.getMinutes();
  const inicio = horaAMinutos(horario.inicio);
  const fin = horaAMinutos(horario.fin);

  if (minutos < inicio) {
    const fechaRes = ultimoDiaSorteo(fecha);
    const diffDias = Math.round((fecha - fechaRes) / (1000 * 60 * 60 * 24));
    const etiqueta = diffDias > 1 ? "SÁBADO" : "AYER";
    return {
      clase: "estado-pendiente",
      etiqueta,
      detalle: `PRÓXIMO HOY · INICIA ${horario.inicio}`,
      fechaResultados: fechaRes
    };
  }

  if (minutos >= inicio && minutos <= fin) {
    return {
      clase: "estado-vivo",
      etiqueta: "SORTEANDO",
      detalle: `EN SORTEO · INICIÓ ${horario.inicio}`,
      fechaResultados: fecha
    };
  }

  if (minutos > fin) {
    return {
      clase: "estado-finalizado",
      etiqueta: "HOY",
      detalle: `FINALIZADO · INICIÓ ${horario.inicio}`,
      fechaResultados: fecha
    };
  }
}

function cabezasDesdeResultados(turno, fecha, resultadoTurno) {
  const loteriasCandidatas = [...loteriasBase];

  if ((turno === "MATUTINA" || turno === "NOCTURNA") && resultadoTurno.MONTEVIDEO?.[0]) {
    loteriasCandidatas.push("MONTEVIDEO");
  }

  const loteriasDisponibles = loteriasCandidatas.filter((loteria) => {
    const numero = resultadoTurno[loteria]?.[0];
    return numero && numero !== "----";
  });

  const loteriasBloque = loteriasDisponibles.length > 0
    ? loteriasDisponibles
    : getLoteriasTurno(turno, fecha);

  return loteriasBloque.map((loteria) => ({
    loteria,
    numero: resultadoTurno[loteria]?.[0] || "----"
  }));
}

async function cargarUltimasCabezasSupabase() {
  if (ultimasCabezasCache.length > 0 && (Date.now() - ultimasCabezasCacheTiempo) < 30000) {
    return ultimasCabezasCache;
  }

  const hoy = new Date();
  const ayer = ultimoDiaSorteo(hoy);

  const bloques = await Promise.all(ordenTurnos.map(async (turno) => {
    const resultadoHoy = await cargarResultadosSupabase(turno, hoy);

    if (tieneResultadosReales(resultadoHoy)) {
      return {
        turno,
        etiqueta: "HOY",
        fecha: hoy,
        cabezas: cabezasDesdeResultados(turno, hoy, resultadoHoy)
      };
    }

    const resultadoAyer = await cargarResultadosSupabase(turno, ayer);

    if (tieneResultadosReales(resultadoAyer)) {
      return {
        turno,
        etiqueta: "AYER",
        fecha: ayer,
        cabezas: cabezasDesdeResultados(turno, ayer, resultadoAyer)
      };
    }

    const fallback = resultados[turno];

    return {
      turno,
      etiqueta: "AYER",
      fecha: ayer,
      cabezas: cabezasDesdeResultados(turno, ayer, fallback)
    };
  }));

  ultimasCabezasCache = bloques;
  ultimasCabezasCacheTiempo = Date.now();
  return bloques;
}

async function cargarCabezasDelDiaSupabase(fecha = new Date()) {
  const entradas = await Promise.all(ordenTurnos.map(async (turno) => {
    const resultadoTurno = await cargarResultadosSupabase(turno, fecha);
    return [turno, resultadoTurno];
  }));

  return Object.fromEntries(entradas);
}

async function cargarFechasHistorialSupabase() {
  const hoy = new Date();
  const hoyTxt = fechaISO(hoy);

  if (!supabaseConfigurado()) {
    return fechasHistorialFallback(hoy);
  }

  const baseUrl = SUPABASE_URL.replace(/\/$/, "");
  const params = new URLSearchParams({
    select: "fecha",
    fecha: `lte.${hoyTxt}`,
    order: "fecha.desc",
    limit: "1000"
  });

  try {
    const respuesta = await fetch(`${baseUrl}/rest/v1/resultados_quiniela?${params.toString()}`, {
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`
      }
    });

    if (!respuesta.ok) {
      return fechasHistorialFallback(hoy);
    }

    const filas = await respuesta.json();
    const unicas = [...new Set((Array.isArray(filas) ? filas : []).map(f => f.fecha).filter(Boolean))];
    const anteriores = unicas.filter(f => f < hoyTxt).slice(0, 5).reverse();
    const fechas = anteriores.map(fechaDesdeISO);

    while (fechas.length < 5) {
      const fecha = fechaAyer(fechas[0] || hoy);
      if (!fechas.some(f => fechaISO(f) === fechaISO(fecha))) {
        fechas.unshift(fecha);
      }
    }

    fechas.push(hoy);
    return fechas;
  } catch (error) {
    console.warn("Error cargando fechas de historial", error);
    return fechasHistorialFallback(hoy);
  }
}

function fechasHistorialFallback(hoy = new Date()) {
  const fechas = [];

  for (let i = 5; i >= 1; i -= 1) {
    const fecha = new Date(hoy);
    fecha.setDate(fecha.getDate() - i);
    fechas.push(fecha);
  }

  fechas.push(hoy);
  return fechas;
}

async function cargarHistorialCabezasSupabase() {
  const fechas = await cargarFechasHistorialSupabase();
  const datos = {};

  await Promise.all(fechas.flatMap((fecha) => (
    ordenTurnos.map(async (turno) => {
      const resultadoTurno = await cargarResultadosSupabase(turno, fecha);
      const fechaTxt = fechaISO(fecha);

      if (!datos[fechaTxt]) {
        datos[fechaTxt] = {};
      }

      datos[fechaTxt][turno] = resultadoTurno;
    })
  )));

  return { fechas, datos };
}

function cabezaPlanillaDia(resultadosDia, turno, loteria) {
  const resultadoTurno = resultadosDia[turno];

  if (tieneResultadosReales(resultadoTurno)) {
    return resultadoTurno[loteria]?.[0] || "—";
  }

  if (!supabaseConfigurado()) {
    return resultados[turno][loteria]?.[0] || "—";
  }

  return "—";
}

function claseLogoLoteria(loteria) {
  return loteria
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "-");
}

const logosLoterias = {
  PROVINCIA: "assets/logos/PROVINCIA.png",
  CIUDAD: "assets/logos/CIUDAD.png",
  CORDOBA: "assets/logos/CÓRDOBA.png",
  "SANTA FE": "assets/logos/SANTA FE.png",
  "ENTRE RIOS": "assets/logos/ENTRE RIOS.png",
  MONTEVIDEO: "assets/logos/MONTEVIDEO.png"
};

function logoLoteria(loteria) {
  const clase = claseLogoLoteria(loteria);
  const src = logosLoterias[loteria];

  return `
    <div class="loteria-logo ${clase}">
      ${src ? `<img class="logo-img" src="${src}" alt="" onerror="this.hidden=true; this.nextElementSibling.hidden=false;">` : ""}
      <span class="logo-icon" aria-hidden="true" ${src ? "hidden" : ""}></span>
      <span class="logo-text">${loteria}</span>
    </div>
  `;
}

function cabezaHistorial(datos, fecha, turno, loteria) {
  const fechaTxt = fechaISO(fecha);
  const resultadoTurno = datos[fechaTxt]?.[turno];

  if (tieneResultadosReales(resultadoTurno)) {
    return resultadoTurno[loteria]?.[0] || "-";
  }

  if (!supabaseConfigurado() && fechaISO(fecha) === fechaISO(new Date())) {
    return resultados[turno][loteria]?.[0] || "-";
  }

  return "-";
}

function loteriasHistorialTurno(turno, fechas, datos) {
  const incluirMontevideo =
    (turno === "MATUTINA" || turno === "NOCTURNA") &&
    fechas.some(fecha => datos[fechaISO(fecha)]?.[turno]?.MONTEVIDEO?.[0]);

  return incluirMontevideo ? [...loteriasBase, "MONTEVIDEO"] : [...loteriasBase];
}

function getBloquesCabezasFallback() {
  return ordenTurnos.map((turno) => {
    const fecha = ultimoDiaSorteo();
    return {
      turno,
      etiqueta: "AYER",
      fecha,
      cabezas: cabezasDesdeResultados(turno, fecha, resultados[turno])
    };
  });
}

function bloqueIzquierdo(turnoActual) {
 const bloques = (ultimasCabezasCache.length ? ultimasCabezasCache : getBloquesCabezasFallback())
   .filter(b => b.turno !== turnoActual);
 return bloques.map(b => {
const lineas = b.cabezas.map(cabeza => `
      <div class="cabeza-linea">
        <div class="cabeza-loteria">${cabeza.loteria}</div>
        <div class="cabeza-numero">${cabeza.numero}</div>
      </div>
    `).join("");

    return `
      <div class="bloque-cabezas ${b.etiqueta.toLowerCase()}">
        <h3>${b.turno} ${b.etiqueta}</h3>
        ${lineas}
      </div>
    `;
  }).join("");
}

async function cargarDatosPantalla(turno, estado) {
  const pedidos = [
    cargarResultadosSupabase(turno, estado.fechaResultados),
    cargarUltimasCabezasSupabase()
  ];

  await Promise.all(pedidos);
}

function dibujarTurno(turno) {
  const estado = estadoTurno(turno);
  const loteriasDelTurno = getLoteriasTurno(turno, estado.fechaResultados);
  const resultadosRealesTurno = getResultadosRealesTurno(turno, estado.fechaResultados);
  const resultadosTurno = resultadosRealesTurno || (supabaseConfigurado() ? {} : resultados[turno]);

  const columnas = loteriasDelTurno.map(loteria => {
    const numeros = resultadosTurno[loteria] || [];
    const filas = Array.from({ length: 20 }, (_, i) => {
      const num = numeros[i] || "";
      return `
      <div class="fila-premio">
        <div class="posicion">${String(i + 1).padStart(2, "0")}.</div>
        <div class="numero">${num}</div>
      </div>
    `;
    }).join("");

    return `
      <div class="columna-loteria">
        <h2>${loteria}</h2>
        ${filas}
      </div>
    `;
  }).join("");

  app.innerHTML = `
    <main class="pantalla ${estado.clase}">
      <header class="topbar">
        <div class="marca"><img src="assets/logo-izq.png" alt="Agencia El Grillo" onerror="this.replaceWith(document.createTextNode('TABLERO AGENCIA'))"></div>
        <div class="topbar-hora" id="topbar-hora">${soloHoraTexto()}</div>
        <div class="titulo-turno">
          <div class="linea-titulo">
            <span>${turno}</span>
            <strong>${estado.etiqueta}</strong>
          </div>
          <small>${estado.detalle}</small>
        </div>
        <div class="topbar-cierre" id="topbar-cierre"></div>
        <div class="fecha">${soloFechaTexto()}</div>
      </header>

      <section class="zona-vivo">
        <aside class="panel-izquierdo">
          ${bloqueIzquierdo(turno)}
        </aside>

        <section class="tabla-sorteos" style="grid-template-columns: repeat(${loteriasDelTurno.length}, minmax(0, 1fr));">
          ${columnas}
        </section>

        <aside class="promo-lateral">
          ${latImagesCargadas.length > 0 ? `<img src="${latImagenActual()}" alt="">` : ""}
        </aside>
      </section>
    </main>
  `;
}

async function renderTurno(turno) {
  pantallaActual = turno;
  limpiarPubInterval();
  limpiarPubCabezasInterval();
  const idRender = ++renderTurnoId;

  dibujarTurno(turno);
  iniciarCierreInterval(turno);

  const estado = estadoTurno(turno);
  await Promise.all([
    cargarDatosPantalla(turno, estado),
    cargarLatImages()
  ]);

  if (pantallaActual === turno && idRender === renderTurnoId) {
    dibujarTurno(turno);
    iniciarCierreInterval(turno);
    iniciarLatRotacion();
  }
}

function dibujarQuinielaPlus() {
  const datos = resultadosPlusCache;
  const juegosOrden = ["PLUS", "SUPER", "CHANCE"];

  let subtitulo = "SIN SORTEOS CARGADOS";
  let columnas = `<div class="qplus-sin-datos">SIN DATOS DE QUINIELA PLUS</div>`;
  let bannerHTML = "";

  if (datos && datos.juegos) {
    const fechaFmt = fechaDesdeISO(datos.fecha).toLocaleDateString("es-AR", {
      day: "2-digit", month: "2-digit", year: "numeric"
    });
    subtitulo = `SORTEO ${datos.sorteo || "--"} · ${fechaFmt}`;

    const proximoSorteo = new Date(fechaDesdeISO(datos.fecha));
    proximoSorteo.setDate(proximoSorteo.getDate() + 1);
    const proximoSorteoTexto = proximoSorteo.toLocaleDateString("es-AR", {
      weekday: "long", day: "2-digit", month: "2-digit"
    }).toUpperCase();

    let pozoEstimadoTotal = 0;

    columnas = juegosOrden.map(juego => {
      const d = datos.juegos[juego];
      if (!d) {
        return `
          <div class="columna-qplus">
            <div class="qplus-titulo">${nombreJuegoPlus(juego)}</div>
            <div class="qplus-sin-datos">SIN DATOS</div>
          </div>
        `;
      }

      const numerosHTML = d.numeros.map(n => `<div class="qplus-num">${n}</div>`).join("");

      const primerPremio = d.premios[0];
      const esVacanteJuego = !!primerPremio && /vacante/i.test(primerPremio.ganadores || "");

      const pozoEstimado = calcularPozoEstimado(juego, d.pozo, d.premios);
      pozoEstimadoTotal += pozoEstimado;

      const premiosHTML = d.premios.map((p, i) => {
        const importe = (i === 0 && esVacanteJuego) ? formatoPesos(pozoEstimado) : quitarDecimales(p.importe);
        return `
          <div class="qplus-premio-fila">
            <span class="qplus-premio-nivel">${p.nivel}</span>
            <span class="qplus-premio-ganadores">${p.ganadores}</span>
            <span class="qplus-premio-importe">${importe}</span>
          </div>
        `;
      }).join("");

      return `
        <div class="columna-qplus">
          <div class="qplus-titulo-fila">
            <div class="qplus-titulo">${nombreJuegoPlus(juego)}</div>
            <div class="qplus-vacante">
              <span class="qplus-vacante-etiqueta">${esVacanteJuego ? "POZO VACANTE" : "POZO"}</span>
              <span class="qplus-vacante-monto">${formatoPesos(pozoEstimado)}</span>
            </div>
          </div>
          <div class="qplus-fila-contenido">
            <div class="qplus-numeros-bloque">
              <div class="qplus-numeros-label">NÚMEROS SORTEADOS</div>
              <div class="qplus-numeros">${numerosHTML}</div>
            </div>
            <div class="qplus-premios">
              <div class="qplus-premio-fila qplus-premio-header">
                <span class="qplus-premio-nivel">ACIERTOS</span><span class="qplus-premio-ganadores">GANADORES</span><span class="qplus-premio-importe">IMPORTE</span>
              </div>
              ${premiosHTML}
            </div>
          </div>
        </div>
      `;
    }).join("");

    bannerHTML = `
      <div class="qplus-banner">
        <div class="qplus-banner-top">
          <div class="qplus-banner-logo">
            <img src="assets/logo-plus.png" alt="Quiniela Plus">
          </div>
          <div class="qplus-banner-sorteo">
            <span class="qplus-banner-sorteo-etiqueta">PRÓXIMO SORTEO</span>
            <span class="qplus-banner-sorteo-valor">${proximoSorteoTexto}</span>
          </div>
          <div class="qplus-banner-promo">
            <span class="qplus-banner-promo-etiqueta">SOLO POR</span>
            <span class="qplus-banner-promo-monto">$ 1.000.-</span>
          </div>
        </div>
        <div class="qplus-banner-pozo">
          <span class="qplus-banner-etiqueta">POZO ESTIMADO</span>
          <span class="qplus-banner-monto">${formatoPesos(pozoEstimadoTotal)}</span>
        </div>
      </div>
    `;
  }

  app.innerHTML = `
    <main class="pantalla estado-finalizado">
      <header class="topbar">
        <div class="marca"><img src="assets/logo-izq.png" alt="Agencia El Grillo" onerror="this.replaceWith(document.createTextNode('TABLERO AGENCIA'))"></div>
        <div class="topbar-hora" id="topbar-hora">${soloHoraTexto()}</div>
        <div class="titulo-turno">
          <div class="linea-titulo">
            <span>QUINIELA</span>
            <strong>PLUS</strong>
          </div>
          <small>${subtitulo}</small>
        </div>
        <div class="topbar-cierre"></div>
        <div class="fecha">${soloFechaTexto()}</div>
      </header>

      <section class="zona-vivo">
        <aside class="panel-izquierdo">
          ${bloqueIzquierdo("QUINIELA_PLUS")}
        </aside>

        <section class="tabla-qplus">
          ${bannerHTML}
          ${columnas}
        </section>

        <aside class="promo-lateral">
          ${latImagesCargadas.length > 0 ? `<img src="${latImagenActual()}" alt="">` : ""}
        </aside>
      </section>
    </main>
  `;
}

async function renderQuinielaPlus() {
  pantallaActual = "QUINIELA_PLUS";
  limpiarPubInterval();
  limpiarPubCabezasInterval();
  limpiarCierreInterval();
  const idRender = ++renderTurnoId;

  dibujarQuinielaPlus();

  await Promise.all([
    cargarResultadosPlus(),
    cargarUltimasCabezasSupabase(),
    cargarLatImages()
  ]);

  if (pantallaActual === "QUINIELA_PLUS" && idRender === renderTurnoId) {
    dibujarQuinielaPlus();
    iniciarLatRotacion();
  }
}

function fechaCabezasPantalla() {
  const ahora = new Date();
  if (ahora.getDay() === 0) return ultimoDiaSorteo(ahora);
  const minutos = ahora.getHours() * 60 + ahora.getMinutes();
  if (minutos < horaAMinutos(horariosTurnos.PREVIA.inicio)) {
    return ultimoDiaSorteo(ahora);
  }
  return ahora;
}

async function renderCabezas({ mostrarCarga = true } = {}) {
  pantallaActual = "CABEZAS";
  limpiarPubInterval();
  limpiarPubCabezasInterval();
  limpiarLatInterval();
  limpiarCierreInterval();
  const idRender = ++renderTurnoId;
  const fecha = fechaCabezasPantalla();

  if (mostrarCarga) {
    app.innerHTML = `
      <main class="pantalla-simple pantalla-cabezas">
        <header class="simple-header cabezas-header">
          <h1>CABEZAS DEL DÍA: <span>${fechaCabezasTexto(fecha)}</span></h1>
        </header>
        <section class="simple-body">
          <div class="cabezas-cargando">CARGANDO CABEZAS</div>
        </section>
        <footer class="footer">Teclas: 1 a 5 sorteos · 7 últimos días · 8 aleatorio · 9 Quini/Loto · 0 publicidades</footer>
      </main>
    `;
  }

  const resultadosDia = await cargarCabezasDelDiaSupabase(fecha);

  if (pantallaActual !== "CABEZAS" || idRender !== renderTurnoId) {
    return;
  }

  const encabezado = `
    <div class="planilla-celda planilla-titulo"></div>
    ${ordenTurnos.map(t => `<div class="planilla-celda planilla-titulo">${t}</div>`).join("")}
  `;

  const filas = loterias.map(loteria => `
    <div class="planilla-celda planilla-loteria">${logoLoteria(loteria)}</div>
    ${ordenTurnos.map(turno => `<div class="planilla-celda planilla-numero">${cabezaPlanillaDia(resultadosDia, turno, loteria)}</div>`).join("")}
  `).join("");

  app.innerHTML = `
    <main class="pantalla-simple pantalla-cabezas">
      <header class="simple-header cabezas-header">
        <h1>CABEZAS DEL DÍA: <span>${fechaCabezasTexto(fecha)}</span></h1>
      </header>
      <section class="simple-body">
        <div class="planilla-cabezas">${encabezado}${filas}</div>
      </section>
      <footer class="footer">Teclas: 1 a 5 sorteos · 7 últimos días · 8 aleatorio · 9 Quini/Loto · 0 publicidades</footer>
    </main>
  `;
}

async function renderHistorial({ mostrarCarga = true } = {}) {
  pantallaActual = "HISTORIAL";
  limpiarPubInterval();
  limpiarPubCabezasInterval();
  limpiarLatInterval();
  limpiarCierreInterval();
  const idRender = ++renderTurnoId;

  if (mostrarCarga) {
    app.innerHTML = `
      <main class="pantalla-simple pantalla-historial">
        <header class="simple-header historial-header">
          <h1>ÚLTIMAS CABEZAS</h1>
          <h1>${fechaTexto()}</h1>
        </header>
        <section class="simple-body">
          <div class="historial-cargando">CARGANDO HISTORIAL</div>
        </section>
      </main>
    `;
  }

  const { fechas, datos } = await cargarHistorialCabezasSupabase();

  if (pantallaActual !== "HISTORIAL" || idRender !== renderTurnoId) {
    return;
  }

  const hoyTxt = fechaISO(new Date());
  const encabezado = `
    <div class="historial-celda historial-esquina">ÚLTIMAS CABEZAS</div>
    ${fechas.map(fecha => `
      <div class="historial-celda historial-dia ${fechaISO(fecha) === hoyTxt ? "hoy" : ""}">
        ${etiquetaDiaHistorial(fecha, fechaISO(fecha) === hoyTxt)}
      </div>
    `).join("")}
  `;

  const filas = ordenTurnos.map((turno) => {
    const loteriasTurno = loteriasHistorialTurno(turno, fechas, datos);
    const turnoClass = turno.toLowerCase();
    const filasTurno = loteriasTurno.map((loteria, index) => `
      ${index === 0 ? `<div class="historial-celda historial-turno ${turnoClass}" style="grid-row: span ${loteriasTurno.length};">${turno}</div>` : ""}
      <div class="historial-celda historial-loteria turno-${turnoClass}${index === 0 ? " historial-turno-inicio" : ""}">${loteria}</div>
      ${fechas.map(fecha => `
        <div class="historial-celda historial-numero turno-${turnoClass} ${fechaISO(fecha) === hoyTxt ? "hoy" : ""}${index === 0 ? " historial-turno-inicio" : ""}">
          ${cabezaHistorial(datos, fecha, turno, loteria)}
        </div>
      `).join("")}
    `).join("");

    return filasTurno;
  }).join("");

  app.innerHTML = `
    <main class="pantalla-simple pantalla-historial">
      <header class="simple-header historial-header">
        <h1>ÚLTIMAS CABEZAS</h1>
        <h1>${fechaTexto()}</h1>
      </header>
      <section class="simple-body">
        <div class="historial-cabezas">${encabezado}${filas}</div>
      </section>
    </main>
  `;
}

function numero4() {
  return String(Math.floor(Math.random() * 10000)).padStart(4, "0");
}

function renderAleatorio() {
  pantallaActual = "ALEATORIO";
  limpiarPubInterval();
  limpiarPubCabezasInterval();
  limpiarCierreInterval();
  limpiarLatInterval();

  app.innerHTML = `
    <main class="pantalla-simple">
      <header class="simple-header">
        <h1>NÚMERO ALEATORIO</h1>
        <h1>${fechaTexto()}</h1>
      </header>
      <section class="simple-body">
        <div class="numero-gigante">${numero4()}</div>
        <h1 style="font-size:56px;text-shadow:4px 4px 0 #000;">LLAMADOR PARA JUGAR</h1>
      </section>
      <footer class="footer">Presioná 8 para generar otro número</footer>
    </main>
  `;
}

function randomQuini() {
  const nums = [];
  while (nums.length < 6) {
    const n = Math.floor(Math.random() * 46);
    const txt = String(n).padStart(2, "0");
    if (!nums.includes(txt)) nums.push(txt);
  }
  nums.sort((a, b) => Number(a) - Number(b));
  return {
    numeros: nums,
    plus: String(Math.floor(Math.random() * 10)).padStart(2, "0")
  };
}

function renderQuini() {
  pantallaActual = "QUINI";
  limpiarPubInterval();
  limpiarPubCabezasInterval();
  limpiarCierreInterval();
  limpiarLatInterval();

  const jugada = randomQuini();

  app.innerHTML = `
    <main class="pantalla-simple">
      <header class="simple-header">
        <h1>QUINI / LOTO ALEATORIO</h1>
        <h1>${fechaTexto()}</h1>
      </header>
      <section class="simple-body">
        <div class="quini-bolas">
          ${jugada.numeros.map(n => `<div class="bola">${n}</div>`).join("")}
          <div class="bola plus">${jugada.plus}</div>
        </div>
        <h1 style="font-size:52px;text-shadow:4px 4px 0 #000;">6 NÚMEROS + PLUS</h1>
      </section>
      <footer class="footer">Presioná 9 para generar otra jugada</footer>
    </main>
  `;
}

let pubCabezasIndex = 0;
let pubCabezasInterval = null;

function limpiarPubCabezasInterval() {
  if (pubCabezasInterval) { clearInterval(pubCabezasInterval); pubCabezasInterval = null; }
}

function getBloquesCabezasConResultados() {
  const bloques = ultimasCabezasCache.length ? ultimasCabezasCache : getBloquesCabezasFallback();
  return bloques.filter(b => b.cabezas.some(c => c.numero !== "----"));
}

const ABREV_LOTERIAS = {
  PROVINCIA: "PROV",
  CIUDAD: "CIUDAD",
  CORDOBA: "CORD",
  "SANTA FE": "SFE",
  "ENTRE RIOS": "E.R.",
  MONTEVIDEO: "ORO"
};

function renderCabezasBar() {
  const bar = document.getElementById("laminas-cabezas-bar");
  if (!bar) return;

  const bloques = getBloquesCabezasConResultados();
  if (bloques.length === 0) return;

  const b = bloques[pubCabezasIndex % bloques.length];
  const items = b.cabezas.map(c =>
    `<span class="laminas-cabezas-item">${ABREV_LOTERIAS[c.loteria] || c.loteria} <span class="laminas-cabezas-num">${c.numero}</span></span>`
  ).join('<span class="laminas-cabezas-sep">|</span>');

  bar.innerHTML = `
    <span class="laminas-cabezas-turno">${b.turno} ${b.etiqueta}</span>
    <span class="laminas-cabezas-sep">|</span>
    ${items}
  `;
}

function cambiarPublicidad(dir) {
  if (pubImagesCargadas.length <= 2) return;
  pubIndex = pubIndex + dir * 2;
  if (pubIndex < 0) pubIndex = pubImagesCargadas.length - 2 + (pubImagesCargadas.length % 2);
  if (pubIndex >= pubImagesCargadas.length) pubIndex = 0;
  const cuadros = document.querySelectorAll(".lamina-cuadro");
  cuadros.forEach(c => c.style.opacity = "0");
  setTimeout(() => dibujarPublicidad(), 300);
  limpiarPubInterval();
  pubInterval = setInterval(() => {
    if (pantallaActual !== "PUBLICIDAD") { limpiarPubInterval(); return; }
    pubIndex = pubIndex + 2;
    if (pubIndex >= pubImagesCargadas.length) pubIndex = 0;
    const cuadros = document.querySelectorAll(".lamina-cuadro");
    cuadros.forEach(c => c.style.opacity = "0");
    setTimeout(() => dibujarPublicidad(), 300);
  }, 30000);
}

function dibujarPublicidad() {
  const img1src = pubImagesCargadas[pubIndex] || "";
  const img2src = pubImagesCargadas[pubIndex + 1] || "";

  app.innerHTML = `
    <main class="pantalla-simple pantalla-laminas">
      <div class="laminas-cuerpo">
        <div class="lamina-logo"><img src="assets/logo-izq.png" onerror="this.parentElement.style.display='none'"></div>
        ${img1src ? `<div class="lamina-cuadro"><img class="lamina-img" src="${img1src}"></div>` : ""}
        ${img2src ? `<div class="lamina-cuadro"><img class="lamina-img" src="${img2src}"></div>` : ""}
        <div class="lamina-logo"><img src="assets/logo-der.png" onerror="this.parentElement.style.display='none'"></div>
      </div>
      <div class="laminas-cabezas" id="laminas-cabezas-bar"></div>
    </main>
  `;

  renderCabezasBar();
}

async function renderPublicidad() {
  pantallaActual = "PUBLICIDAD";
  limpiarPubInterval();
  limpiarLatInterval();
  limpiarPubCabezasInterval();
  limpiarCierreInterval();

  app.innerHTML = `
    <main class="pantalla-simple pantalla-laminas">
      <div class="laminas-cuerpo">
        <div class="lamina-cargando">CARGANDO</div>
      </div>
    </main>
  `;

  await Promise.all([
    preloadImages(PUB_FILES).then(urls => { pubImagesCargadas = urls; }),
    cargarUltimasCabezasSupabase()
  ]);

  if (pantallaActual !== "PUBLICIDAD") return;

  if (pubImagesCargadas.length === 0) {
    app.innerHTML = `
      <main class="pantalla-simple pantalla-laminas">
        <div class="laminas-cuerpo">
          <div class="lamina-cargando">SIN PUBLICIDADES</div>
        </div>
      </main>
    `;
    return;
  }

  pubIndex = 0;
  pubCabezasIndex = 0;
  dibujarPublicidad();

  if (pubImagesCargadas.length > 2) {
    pubInterval = setInterval(() => {
      if (pantallaActual !== "PUBLICIDAD") { limpiarPubInterval(); return; }
      pubIndex = pubIndex + 2;
      if (pubIndex >= pubImagesCargadas.length) pubIndex = 0;

      const cuadros = document.querySelectorAll(".lamina-cuadro");
      cuadros.forEach(c => c.style.opacity = "0");
      setTimeout(() => dibujarPublicidad(), 300);
    }, 30000);
  }

  const bloquesConResultados = getBloquesCabezasConResultados();
  if (bloquesConResultados.length > 1) {
    pubCabezasInterval = setInterval(() => {
      if (pantallaActual !== "PUBLICIDAD") { limpiarPubCabezasInterval(); return; }
      pubCabezasIndex = (pubCabezasIndex + 1) % bloquesConResultados.length;
      renderCabezasBar();
    }, 30000);
  }
}

function pantallaPorHora() {
  const h = new Date().getHours();
  const m = new Date().getMinutes();
  const minutos = h * 60 + m;

  if (minutos >= horaAMinutos(horariosTurnos.NOCTURNA.inicio)) return "NOCTURNA";
  if (minutos >= horaAMinutos(horariosTurnos.VESPERTINA.inicio)) return "VESPERTINA";
  if (minutos >= horaAMinutos(horariosTurnos.MATUTINA.inicio)) return "MATUTINA";
  if (minutos >= horaAMinutos(horariosTurnos.PRIMERA.inicio)) return "PRIMERA";
  if (minutos >= horaAMinutos(horariosTurnos.PREVIA.inicio)) return "PREVIA";
  return "NOCTURNA";
}

const pantallasOrden = [
  { key: "1", fn: () => renderTurno("PREVIA") },
  { key: "2", fn: () => renderTurno("PRIMERA") },
  { key: "3", fn: () => renderTurno("MATUTINA") },
  { key: "4", fn: () => renderTurno("VESPERTINA") },
  { key: "5", fn: () => renderTurno("NOCTURNA") },
  { key: "6", fn: () => renderCabezas() },
  { key: "7", fn: () => pantallaActual === "HISTORIAL" ? renderQuinielaPlus() : renderHistorial() },
  { key: "8", fn: () => renderAleatorio() },
  { key: "9", fn: () => renderQuini() },
  { key: "0", fn: () => renderPublicidad() }
];

function indicePantallaActual() {
  const mapa = { PREVIA: 0, PRIMERA: 1, MATUTINA: 2, VESPERTINA: 3, NOCTURNA: 4, CABEZAS: 5, HISTORIAL: 6, QUINIELA_PLUS: 6, ALEATORIO: 7, QUINI: 8, PUBLICIDAD: 9 };
  return mapa[pantallaActual] ?? 0;
}

function navegarPantalla(dir) {
  const total = pantallasOrden.length;
  const nuevo = (indicePantallaActual() + dir + total) % total;
  pantallasOrden[nuevo].fn();
}

document.addEventListener("keydown", (e) => {
  const tecla = e.key || String.fromCharCode(e.keyCode);

  for (const p of pantallasOrden) {
    if (tecla === p.key) { p.fn(); return; }
  }

  if (tecla === "ArrowRight" || e.keyCode === 22 || e.keyCode === 166) navegarPantalla(1);
  if (tecla === "ArrowLeft" || e.keyCode === 21 || e.keyCode === 167) navegarPantalla(-1);

  if (ordenTurnos.includes(pantallaActual)) {
    if (tecla === "ArrowUp" || e.keyCode === 19) cambiarLatImagen(-1);
    if (tecla === "ArrowDown" || e.keyCode === 20) cambiarLatImagen(1);
  }

  if (pantallaActual === "PUBLICIDAD") {
    if (tecla === "ArrowUp" || e.keyCode === 19) cambiarPublicidad(-1);
    if (tecla === "ArrowDown" || e.keyCode === 20) cambiarPublicidad(1);
  }

  if (tecla === "c" || tecla === "C") capturarTurno();
});

renderTurno(pantallaPorHora());

let turnoVivoAnterior = null;

function detectarInicioTurno() {
  const ahora = new Date();
  if (ahora.getDay() === 0) return;
  const minutos = ahora.getHours() * 60 + ahora.getMinutes();

  let turnoVivo = null;
  for (const turno of ordenTurnos) {
    const horario = horariosTurnos[turno];
    const inicio = horaAMinutos(horario.inicio);
    const fin = horaAMinutos(horario.fin);
    if (minutos >= inicio && minutos <= fin) {
      turnoVivo = turno;
      break;
    }
  }

  if (turnoVivo && turnoVivo !== turnoVivoAnterior) {
    const key = cacheKeyResultados(turnoVivo, ahora);
    delete resultadosSupabaseCache[key];
    delete resultadosCacheTiempo[key];
    ultimasCabezasCache = [];
    ultimasCabezasCacheTiempo = 0;
    renderTurno(turnoVivo);
  }

  turnoVivoAnterior = turnoVivo;
}

setInterval(() => {
  detectarInicioTurno();

  if (ordenTurnos.includes(pantallaActual)) {
    renderTurno(pantallaActual);
  }
  if (pantallaActual === "CABEZAS") {
    renderCabezas({ mostrarCarga: false });
  }
  if (pantallaActual === "HISTORIAL") {
    renderHistorial({ mostrarCarga: false });
  }
  if (pantallaActual === "QUINIELA_PLUS") {
    renderQuinielaPlus();
  }
}, 10000);

async function capturarTurno(turno) {
  if (!turno) {
    turno = ordenTurnos.includes(pantallaActual) ? pantallaActual : pantallaPorHora();
  }

  const estado = estadoTurno(turno);
  const fecha = estado.fechaResultados;

  await cargarResultadosSupabase(turno, fecha);
  const resultadosRealesTurno = getResultadosRealesTurno(turno, fecha);
  const resultadosTurno = resultadosRealesTurno || (supabaseConfigurado() ? {} : resultados[turno]);

  const loteriasDelTurno = getLoteriasTurno(turno, fecha);
  const fechaTxt = fechaCortaTexto(fecha);
  const diaSemana = fecha.toLocaleDateString("es-AR", { weekday: "long" }).toUpperCase();
  const fechaCompleta = `${diaSemana}, ${fechaTxt.replace(/-/g, "/")}`;
  const etiqueta = estado.etiqueta;

  const columnas = loteriasDelTurno.map(loteria => {
    const numeros = resultadosTurno[loteria] || [];
    const filas = Array.from({ length: 20 }, (_, i) => {
      const num = numeros[i] || "----";
      const sep = (i === 5 || i === 10 || i === 15) ? " captura-sep" : "";
      return `<div class="captura-fila${sep}"><span class="captura-pos">${String(i + 1).padStart(2, "0")}.</span><span class="captura-num">${num}</span></div>`;
    }).join("");
    return `<div class="captura-columna"><h2>${loteria}</h2>${filas}</div>`;
  }).join("");

  const contenedor = document.createElement("div");
  contenedor.className = "captura-contenedor";
  contenedor.innerHTML = `
    <div class="captura-header">
      <div class="captura-titulo">${turno}</div>
      <div class="captura-fecha">${fechaCompleta}</div>
    </div>
    <div class="captura-grilla captura-cols-${loteriasDelTurno.length}">${columnas}</div>
  `;
  document.body.appendChild(contenedor);

  try {
    const canvas = await html2canvas(contenedor, { scale: 2, useCORS: true, backgroundColor: null });
    const link = document.createElement("a");
    link.download = `${turno}_${fechaTxt.replace(/\//g, "-")}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  } catch (err) {
    console.error("Error al capturar:", err);
    alert("Error al generar la captura");
  } finally {
    document.body.removeChild(contenedor);
  }
}
