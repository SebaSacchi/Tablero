(function () {
  const SUPABASE_URL = "https://ldjwkwfkiqqfypftdeqa.supabase.co";
  const SUPABASE_ANON_KEY = "sb_publishable_birytOVhIQ0AoBY6f0yT-g_HpV01OhE";
  const SESSION_KEY = "tablero_admin_autenticado";

  function baseUrl() {
    return SUPABASE_URL.replace(/\/$/, "");
  }

  async function rpc(nombre, params) {
    const res = await fetch(`${baseUrl()}/rest/v1/rpc/${nombre}`, {
      method: "POST",
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(params || {})
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  }

  function existeAdminPassword() {
    return rpc("existe_admin_password");
  }

  function crearAdminPassword(nuevo) {
    return rpc("crear_admin_password", { nuevo });
  }

  function verificarAdminPassword(intento) {
    return rpc("verificar_admin_password", { intento });
  }

  window.cambiarPasswordAdmin = function (actual, nuevo) {
    return rpc("set_admin_password", { actual, nuevo });
  };

  function crearOverlay() {
    const overlay = document.createElement("div");
    overlay.id = "admin-auth-overlay";
    overlay.innerHTML = `
      <style>
        #admin-auth-overlay {
          position: fixed;
          inset: 0;
          z-index: 999999;
          background: #0a0a2e;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        }
        #admin-auth-overlay .admin-auth-caja {
          width: min(360px, 90vw);
          background: rgba(255, 255, 255, 0.06);
          border-radius: 16px;
          padding: 24px;
          text-align: center;
        }
        #admin-auth-overlay h2 {
          color: #ffe600;
          font-size: 1.1rem;
          margin: 0 0 14px;
        }
        #admin-auth-overlay p {
          color: #ccc;
          font-size: 0.85rem;
          margin: 0 0 14px;
        }
        #admin-auth-overlay input {
          width: 100%;
          padding: 12px;
          border-radius: 10px;
          border: none;
          margin-bottom: 10px;
          font-size: 1rem;
          box-sizing: border-box;
        }
        #admin-auth-overlay button {
          width: 100%;
          padding: 14px;
          border-radius: 10px;
          border: none;
          background: #ffe600;
          color: #000;
          font-weight: 800;
          font-size: 1rem;
          cursor: pointer;
        }
        #admin-auth-overlay button:disabled {
          opacity: 0.5;
        }
        #admin-auth-overlay .admin-auth-error {
          color: #ff6b6b;
          font-size: 0.85rem;
          min-height: 1.2em;
          margin-top: 10px;
        }
      </style>
      <div class="admin-auth-caja">
        <h2 id="admin-auth-titulo">Acceso restringido</h2>
        <p id="admin-auth-texto">Ingresá la contraseña del panel.</p>
        <input type="password" id="admin-auth-pass1" placeholder="Contraseña" autocomplete="off">
        <input type="password" id="admin-auth-pass2" placeholder="Repetir contraseña" autocomplete="off" style="display:none;">
        <button id="admin-auth-btn" type="button">ENTRAR</button>
        <div class="admin-auth-error" id="admin-auth-error"></div>
      </div>
    `;
    document.body.appendChild(overlay);
    return overlay;
  }

  window.verificarAccesoAdmin = function () {
    return new Promise((resolve) => {
      if (sessionStorage.getItem(SESSION_KEY) === "1") {
        resolve();
        return;
      }

      const overlay = crearOverlay();
      const titulo = overlay.querySelector("#admin-auth-titulo");
      const texto = overlay.querySelector("#admin-auth-texto");
      const pass1 = overlay.querySelector("#admin-auth-pass1");
      const pass2 = overlay.querySelector("#admin-auth-pass2");
      const btn = overlay.querySelector("#admin-auth-btn");
      const error = overlay.querySelector("#admin-auth-error");

      function ok() {
        sessionStorage.setItem(SESSION_KEY, "1");
        overlay.remove();
        resolve();
      }

      existeAdminPassword().then((existe) => {
        const modoCrear = !existe;
        if (modoCrear) {
          titulo.textContent = "Creá una contraseña";
          texto.textContent = "Todavía no hay contraseña configurada para los paneles de admin. Elegí una para vos.";
          pass2.style.display = "block";
        }

        btn.addEventListener("click", intentar);
        pass1.addEventListener("keydown", (e) => { if (e.key === "Enter") intentar(); });
        pass2.addEventListener("keydown", (e) => { if (e.key === "Enter") intentar(); });

        async function intentar() {
          error.textContent = "";
          btn.disabled = true;
          try {
            if (modoCrear) {
              const val = pass1.value.trim();
              if (val.length < 4) { error.textContent = "Mínimo 4 caracteres."; return; }
              if (val !== pass2.value.trim()) { error.textContent = "Las contraseñas no coinciden."; return; }
              const creada = await crearAdminPassword(val);
              if (creada) ok();
              else error.textContent = "Ya hay una contraseña creada, recargá la página.";
            } else {
              const val = pass1.value;
              const correcta = await verificarAdminPassword(val);
              if (correcta) ok();
              else {
                error.textContent = "Contraseña incorrecta.";
                pass1.value = "";
                pass1.focus();
              }
            }
          } catch (err) {
            error.textContent = "Error de conexión: " + err.message;
          } finally {
            btn.disabled = false;
          }
        }

        pass1.focus();
      }).catch((err) => {
        error.textContent = "No se pudo verificar el acceso: " + err.message;
      });
    });
  };
})();
