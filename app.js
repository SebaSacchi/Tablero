const app = document.getElementById("app");

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

function fechaTexto() {
  const ahora = new Date();
  return ahora.toLocaleDateString("es-AR", {
    weekday: "long",
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  }).toUpperCase();
}

function bloqueIzquierdo(turnoActual) {
  const bloques = [];

  if (turnoActual === "PREVIA") {
    bloques.push({ titulo: "PRIMERO AYER", turno: "PRIMERA", tipo: "ayer" });
    bloques.push({ titulo: "MATUTINA AYER", turno: "MATUTINA", tipo: "ayer" });
    bloques.push({ titulo: "VESPERTINA AYER", turno: "VESPERTINA", tipo: "ayer" });
    bloques.push({ titulo: "NOCTURNA AYER", turno: "NOCTURNA", tipo: "ayer" });
  }

  if (turnoActual === "PRIMERA") {
    bloques.push({ titulo: "LA PREVIA HOY", turno: "PREVIA", tipo: "hoy" });
    bloques.push({ titulo: "MATUTINA AYER", turno: "MATUTINA", tipo: "ayer" });
    bloques.push({ titulo: "VESPERTINA AYER", turno: "VESPERTINA", tipo: "ayer" });
    bloques.push({ titulo: "NOCTURNA AYER", turno: "NOCTURNA", tipo: "ayer" });
  }

  if (turnoActual === "MATUTINA") {
    bloques.push({ titulo: "LA PREVIA HOY", turno: "PREVIA", tipo: "hoy" });
    bloques.push({ titulo: "PRIMERA HOY", turno: "PRIMERA", tipo: "hoy" });
    bloques.push({ titulo: "VESPERTINA AYER", turno: "VESPERTINA", tipo: "ayer" });
    bloques.push({ titulo: "NOCTURNA AYER", turno: "NOCTURNA", tipo: "ayer" });
  }

  if (turnoActual === "VESPERTINA") {
    bloques.push({ titulo: "NOCTURNA AYER", turno: "NOCTURNA", tipo: "ayer" });
    bloques.push({ titulo: "LA PREVIA HOY", turno: "PREVIA", tipo: "hoy" });
    bloques.push({ titulo: "PRIMERA HOY", turno: "PRIMERA", tipo: "hoy" });
    bloques.push({ titulo: "MATUTINA HOY", turno: "MATUTINA", tipo: "hoy" });
  }

  if (turnoActual === "NOCTURNA") {
    bloques.push({ titulo: "LA PREVIA HOY", turno: "PREVIA", tipo: "hoy" });
    bloques.push({ titulo: "PRIMERA HOY", turno: "PRIMERA", tipo: "hoy" });
    bloques.push({ titulo: "MATUTINA HOY", turno: "MATUTINA", tipo: "hoy" });
    bloques.push({ titulo: "VESPERTINA HOY", turno: "VESPERTINA", tipo: "hoy" });
  }

 return bloques.map(b => {
  const fechaBloque = new Date();

  if (b.tipo === "ayer") {
    fechaBloque.setDate(fechaBloque.getDate() - 1);
  }

  const loteriasBloque = getLoteriasTurno(b.turno, fechaBloque);

const lineas = loteriasBloque.map(lot => `
      <div class="cabeza-linea">
        <div class="cabeza-loteria">${lot}</div>
        <div class="cabeza-numero">${resultados[b.turno][lot][0]}</div>
      </div>
    `).join("");

    return `
      <div class="bloque-cabezas ${b.tipo}">
        <h3>${b.titulo}</h3>
        ${lineas}
      </div>
    `;
  }).join("");
}

function renderTurno(turno) {
  pantallaActual = turno;

  const loteriasDelTurno = getLoteriasTurno(turno);

  const columnas = loteriasDelTurno.map(loteria => {
    const filas = resultados[turno][loteria].map((num, i) => `
      <div class="fila-premio">
        <div class="posicion">${String(i + 1).padStart(2, "0")}.</div>
        <div class="numero">${num}</div>
      </div>
    `).join("");

    return `
      <div class="columna-loteria">
        <h2>${loteria}</h2>
        ${filas}
      </div>
    `;
  }).join("");

  app.innerHTML = `
    <main class="pantalla">
      <header class="topbar">
        <div class="marca">TABLERO AGENCIA</div>
        <div class="titulo-turno">${turno} EN VIVO</div>
        <div class="fecha">${fechaTexto()}</div>
      </header>

      <section class="zona-vivo">
        <aside class="panel-izquierdo">
          ${bloqueIzquierdo(turno)}
        </aside>

        <section class="tabla-sorteos" style="grid-template-columns: repeat(${loteriasDelTurno.length}, minmax(0, 1fr));">
          ${columnas}
        </section>

        <aside class="promo-lateral">
          <div class="mini">PROMO DEL DÍA</div>
          <div class="grande">39</div>
          <div class="texto">HOY ES DÍA PARA JUGARLE</div>
          <div class="grande">039</div>
        </aside>
      </section>

      <footer class="footer">
        <div>Los resultados son de carácter informativo · TABLERO AGENCIA</div>
        <div class="atajos">1 Previa · 2 Primera · 3 Matutina · 4 Vespertina · 5 Nocturna · 6 Cabezas · 7 Historial · 8 Aleatorio · 9 Quini · 0 Publicidad</div>
      </footer>
    </main>
  `;
}

function renderCabezas() {
  const header = `
    <div class="celda titulo">TURNO</div>
    ${loterias.map(l => `<div class="celda titulo">${l}</div>`).join("")}
  `;

  const filas = ordenTurnos.map(t => `
    <div class="celda turno">${t}</div>
    ${loterias.map(l => `<div class="celda">${resultados[t][l][0]}</div>`).join("")}
  `).join("");

  app.innerHTML = `
    <main class="pantalla-simple">
      <header class="simple-header">
        <h1>CABEZAS DEL DÍA</h1>
        <h1>${fechaTexto()}</h1>
      </header>
      <section class="simple-body">
        <div class="grilla-cabezas">${header}${filas}</div>
      </section>
      <footer class="footer">Teclas: 1 a 5 sorteos · 7 últimos días · 8 aleatorio · 9 Quini/Loto · 0 publicidades</footer>
    </main>
  `;
}

function renderHistorial() {
  const dias = ["JUEVES", "VIERNES", "SÁBADO", "LUNES", "MARTES", "HOY"];
  const turnos = ["PREVIA", "PRIMERA", "MATUTINA", "VESPERTINA", "NOCTURNA"];

  let html = `<div class="grilla-cabezas" style="grid-template-columns: 180px repeat(6, 1fr);">`;
  html += `<div class="celda titulo">ÚLTIMAS</div>${dias.map(d => `<div class="celda titulo">${d}</div>`).join("")}`;

  turnos.forEach((t, idx) => {
    html += `<div class="celda turno">${t}</div>`;
    dias.forEach((d, i) => {
      const base = resultados[t]["PROVINCIA"][0];
      const valor = i === dias.length - 1 ? base : String((Number(base) + i * 137 + idx * 41) % 10000).padStart(4, "0");
      html += `<div class="celda">${valor}</div>`;
    });
  });

  html += `</div>`;

  app.innerHTML = `
    <main class="pantalla-simple">
      <header class="simple-header">
        <h1>ÚLTIMOS 7 / 10 DÍAS</h1>
        <h1>HOY RESALTADO</h1>
      </header>
      <section class="simple-body">${html}</section>
      <footer class="footer">Esta pantalla después se alimenta sola con Supabase</footer>
    </main>
  `;
}

function numero4() {
  return String(Math.floor(Math.random() * 10000)).padStart(4, "0");
}

function renderAleatorio() {
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

function renderPublicidad() {
  app.innerHTML = `
    <main class="pantalla-simple">
      <header class="simple-header">
        <h1>PUBLICIDADES</h1>
        <h1>TABLERO AGENCIA</h1>
      </header>
      <section class="simple-body">
        <div class="publicidad-demo">
          <h2>ACÁ VAN TUS LÁMINAS</h2>
          <p>Quini · Loto · Datelli · Numerazo · Avisos</p>
          <p>Después las leemos desde Supabase Storage</p>
        </div>
      </section>
      <footer class="footer">Presioná 0 para volver a esta pantalla</footer>
    </main>
  `;
}

function pantallaPorHora() {
  const h = new Date().getHours();
  const m = new Date().getMinutes();
  const minutos = h * 60 + m;

  if (minutos >= 21 * 60) return "NOCTURNA";
  if (minutos >= 18 * 60) return "VESPERTINA";
  if (minutos >= 15 * 60) return "MATUTINA";
  if (minutos >= 12 * 60) return "PRIMERA";
  if (minutos >= 10 * 60 + 15) return "PREVIA";
  return "NOCTURNA";
}

document.addEventListener("keydown", (e) => {
  if (e.key === "1") renderTurno("PREVIA");
  if (e.key === "2") renderTurno("PRIMERA");
  if (e.key === "3") renderTurno("MATUTINA");
  if (e.key === "4") renderTurno("VESPERTINA");
  if (e.key === "5") renderTurno("NOCTURNA");
  if (e.key === "6") renderCabezas();
  if (e.key === "7") renderHistorial();
  if (e.key === "8") renderAleatorio();
  if (e.key === "9") renderQuini();
  if (e.key === "0") renderPublicidad();
});

renderTurno(pantallaPorHora());
