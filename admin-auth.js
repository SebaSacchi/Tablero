(function () {
  const SUPABASE_URL = "https://ldjwkwfkiqqfypftdeqa.supabase.co";
  const SUPABASE_ANON_KEY = "sb_publishable_birytOVhIQ0AoBY6f0yT-g_HpV01OhE";

  // Login real de Supabase Auth (no un password propio en una tabla).
  // El usuario para entrar se crea UNA sola vez desde el dashboard de
  // Supabase: Authentication -> Users -> Add user. Con eso alcanza,
  // no hace falta correr nada mas.
  const client = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { persistSession: true, autoRefreshToken: true }
  });

  // Headers para las escrituras (insert/update) del panel: en vez de
  // mandar la anon key en el Authorization (que cualquiera puede leer
  // en el código fuente), mandan el token de la sesión del admin
  // logueado. Las tablas config_tablero/resultados_plus/
  // resultados_loterias solo aceptan insert/update de "authenticated",
  // asi que sin este token las escrituras las rechaza Supabase.
  async function obtenerHeadersEscrituraAdmin() {
    const { data, error } = await client.auth.getSession();
    if (error || !data.session) {
      throw new Error("Tu sesión expiró. Recargá la página y volvé a iniciar sesión.");
    }
    return {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${data.session.access_token}`,
      "Content-Type": "application/json",
      "Prefer": "resolution=merge-duplicates,return=minimal"
    };
  }
  window.obtenerHeadersEscrituraAdmin = obtenerHeadersEscrituraAdmin;

  window.cambiarPasswordAdmin = async function (actual, nueva) {
    const { data: userData, error: userError } = await client.auth.getUser();
    if (userError || !userData.user?.email) {
      throw new Error("No hay sesión activa.");
    }
    // Reverifica la contraseña actual antes de cambiarla.
    const { error: reAuthError } = await client.auth.signInWithPassword({
      email: userData.user.email,
      password: actual
    });
    if (reAuthError) return false;

    const { error } = await client.auth.updateUser({ password: nueva });
    if (error) throw error;
    return true;
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
        <h2>Acceso restringido</h2>
        <p>Ingresá con tu cuenta de administrador.</p>
        <input type="email" id="admin-auth-email" placeholder="Email" autocomplete="username">
        <input type="password" id="admin-auth-pass" placeholder="Contraseña" autocomplete="current-password">
        <button id="admin-auth-btn" type="button">ENTRAR</button>
        <div class="admin-auth-error" id="admin-auth-error"></div>
      </div>
    `;
    document.body.appendChild(overlay);
    return overlay;
  }

  function mostrarLogin(resolve) {
    const overlay = crearOverlay();
    const email = overlay.querySelector("#admin-auth-email");
    const pass = overlay.querySelector("#admin-auth-pass");
    const btn = overlay.querySelector("#admin-auth-btn");
    const error = overlay.querySelector("#admin-auth-error");

    async function intentar() {
      error.textContent = "";
      btn.disabled = true;
      btn.textContent = "INGRESANDO...";

      const { error: loginError } = await client.auth.signInWithPassword({
        email: email.value.trim(),
        password: pass.value
      });

      btn.disabled = false;
      btn.textContent = "ENTRAR";

      if (loginError) {
        error.textContent = "Email o contraseña incorrectos.";
        pass.value = "";
        pass.focus();
        return;
      }

      overlay.remove();
      resolve();
    }

    btn.addEventListener("click", intentar);
    email.addEventListener("keydown", (e) => { if (e.key === "Enter") pass.focus(); });
    pass.addEventListener("keydown", (e) => { if (e.key === "Enter") intentar(); });

    email.focus();
  }

  window.verificarAccesoAdmin = function () {
    return new Promise((resolve) => {
      client.auth.getSession().then(({ data }) => {
        if (data.session) {
          resolve();
        } else {
          mostrarLogin(resolve);
        }
      });
    });
  };
})();
