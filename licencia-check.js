(function () {
  const SUPABASE_URL = "https://ldjwkwfkiqqfypftdeqa.supabase.co";
  const SUPABASE_ANON_KEY = "sb_publishable_birytOVhIQ0AoBY6f0yT-g_HpV01OhE";
  const CODIGO_KEY = "tablero_licencia_codigo";
  const WHATSAPP_NUMERO = "5491133187363";
  const WHATSAPP_VISIBLE = "11 3318-7363";
  const REINTENTO_MS = 20000;
  const RECHEQUEO_MS = 5 * 60 * 1000;

  function baseUrl() {
    return SUPABASE_URL.replace(/\/$/, "");
  }

  function generarCodigo() {
    const alfabeto = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let codigo = "";
    for (let i = 0; i < 12; i++) {
      codigo += alfabeto[Math.floor(Math.random() * alfabeto.length)];
    }
    return codigo;
  }

  function obtenerCodigo() {
    let codigo = localStorage.getItem(CODIGO_KEY);
    if (!codigo) {
      codigo = generarCodigo();
      localStorage.setItem(CODIGO_KEY, codigo);
    }
    return codigo;
  }

  function detectarNavegador() {
    const ua = navigator.userAgent;
    if (ua.includes("Edg/")) return "Edge";
    if (ua.includes("Firefox/")) return "Firefox";
    if (ua.includes("Chrome/")) return "Chrome";
    if (ua.includes("Safari/")) return "Safari";
    return "Navegador";
  }

  async function consultarEstado(codigo) {
    const res = await fetch(`${baseUrl()}/rest/v1/rpc/licencia_estado`, {
      method: "POST",
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ p_codigo: codigo })
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  }

  function mensajeWhatsapp(codigo) {
    const texto = `Hola, quiero activar mi tablero. Código: ${codigo}`;
    return `https://wa.me/${WHATSAPP_NUMERO}?text=${encodeURIComponent(texto)}`;
  }

  function crearOverlay(codigo) {
    const link = mensajeWhatsapp(codigo);
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(link)}`;

    const overlay = document.createElement("div");
    overlay.id = "licencia-overlay";
    overlay.innerHTML = `
      <style>
        #licencia-overlay {
          position: fixed;
          inset: 0;
          z-index: 999999;
          background: #f4f5f7;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          padding: 20px;
          box-sizing: border-box;
        }
        #licencia-overlay .licencia-caja {
          width: min(1000px, 100%);
          background: #fff;
          border-radius: 20px;
          box-shadow: 0 10px 40px rgba(0,0,0,0.15);
          display: flex;
          overflow: hidden;
        }
        #licencia-overlay .licencia-col {
          padding: 40px;
          flex: 1;
        }
        #licencia-overlay .licencia-col-izq {
          text-align: center;
        }
        #licencia-overlay .licencia-col-der {
          text-align: center;
          border-left: 1px solid #e5e5e5;
        }
        #licencia-overlay h2 {
          margin: 0 0 4px;
          font-size: 1.4rem;
          color: #1a1a2e;
        }
        #licencia-overlay .licencia-dispositivo {
          margin: 0 0 18px;
          font-weight: 700;
          color: #333;
        }
        #licencia-overlay .licencia-codigo {
          font-size: 2rem;
          font-weight: 800;
          letter-spacing: 2px;
          color: #1a1a2e;
          margin-bottom: 10px;
        }
        #licencia-overlay .licencia-estado {
          font-weight: 700;
          color: #c0392b;
          margin-bottom: 20px;
        }
        #licencia-overlay .licencia-estado.activo {
          color: #27ae60;
        }
        #licencia-overlay p {
          color: #444;
          font-size: 0.95rem;
          line-height: 1.4;
        }
        #licencia-overlay ul {
          text-align: left;
          color: #444;
          font-size: 0.9rem;
          padding-left: 20px;
          margin: 10px 0;
        }
        #licencia-overlay ul li {
          margin-bottom: 6px;
        }
        #licencia-overlay img.licencia-qr {
          display: block;
          margin: 10px auto;
          border-radius: 8px;
        }
        #licencia-overlay .licencia-whatsapp {
          font-weight: 700;
        }
        #licencia-overlay .licencia-check {
          font-size: 0.75rem;
          color: #999;
          margin-top: 16px;
        }
        @media (max-width: 640px) {
          #licencia-overlay .licencia-caja { flex-direction: column; }
          #licencia-overlay .licencia-col-der { border-left: none; border-top: 1px solid #e5e5e5; }
        }
      </style>
      <div class="licencia-caja">
        <div class="licencia-col licencia-col-izq">
          <h2>Código de Acceso URL</h2>
          <p class="licencia-dispositivo">Dispositivo: PC (${detectarNavegador()})</p>
          <div class="licencia-codigo">${codigo}</div>
          <p class="licencia-estado" id="licencia-estado-texto">Código pendiente de activación</p>
          <p>Para activar el acceso, contáctenos por WhatsApp e incluya los datos de su agencia:</p>
          <ul>
            <li><strong>Número de Agencia o Legajo</strong> (según corresponda)</li>
            <li><strong>Nombre y Apellido</strong> del titular</li>
            <li><strong>Nombre de Fantasía</strong> de la agencia</li>
            <li><strong>Provincia</strong> donde está la agencia</li>
          </ul>
          <p class="licencia-check" id="licencia-check-texto">Verificando automáticamente...</p>
        </div>
        <div class="licencia-col licencia-col-der">
          <p>Contáctese con soporte técnico para la activación:</p>
          <img class="licencia-qr" src="${qrUrl}" alt="Código QR de WhatsApp" width="180" height="180">
          <p>Mensajes al WhatsApp: <span class="licencia-whatsapp">${WHATSAPP_VISIBLE}</span></p>
          <p>¡Muchas gracias!</p>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);
    return overlay;
  }

  function quitarOverlay() {
    const overlay = document.getElementById("licencia-overlay");
    if (overlay) overlay.remove();
  }

  function programarRechequeo(codigo) {
    setInterval(async () => {
      try {
        const activo = await consultarEstado(codigo);
        if (!activo) location.reload();
      } catch (err) {
        // sin conexión: no cortamos el tablero por un error de red puntual
      }
    }, RECHEQUEO_MS);
  }

  window.verificarLicenciaTablero = function () {
    return new Promise((resolve) => {
      const codigo = obtenerCodigo();

      async function intentar() {
        try {
          const activo = await consultarEstado(codigo);
          if (activo) {
            quitarOverlay();
            resolve();
            programarRechequeo(codigo);
            return;
          }
          if (!document.getElementById("licencia-overlay")) {
            crearOverlay(codigo);
          }
        } catch (err) {
          if (!document.getElementById("licencia-overlay")) {
            crearOverlay(codigo);
          }
          const check = document.getElementById("licencia-check-texto");
          if (check) check.textContent = "Sin conexión, reintentando...";
        }
        setTimeout(intentar, REINTENTO_MS);
      }

      intentar();
    });
  };
})();
