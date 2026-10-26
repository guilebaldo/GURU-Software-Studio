(() => {
  const STORAGE_KEY = "guru-theme";
  const PREFS = ["system", "light", "dark"];

  const labels = {
    en: {
      system: "Switch to system theme (follows day/night)",
      light: "Switch to light theme",
      dark: "Switch to dark theme",
    },
    es: {
      system: "Cambiar a tema automático (sigue día/noche)",
      light: "Cambiar a tema claro",
      dark: "Cambiar a tema oscuro",
    },
  };

  function lang() {
    const htmlLang = (document.documentElement.lang || "en").toLowerCase();
    return htmlLang.startsWith("es") ? "es" : "en";
  }

  function systemDark() {
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  }

  function readPref() {
    try {
      const value = localStorage.getItem(STORAGE_KEY);
      return PREFS.includes(value) ? value : "system";
    } catch {
      return "system";
    }
  }

  function writePref(pref) {
    try {
      localStorage.setItem(STORAGE_KEY, pref);
    } catch {
      /* ignore quota / private mode */
    }
  }

  function resolveTheme(pref) {
    if (pref === "light") return "light";
    if (pref === "dark") return "dark";
    return systemDark() ? "dark" : "light";
  }

  function nextPref(pref) {
    return PREFS[(PREFS.indexOf(pref) + 1) % PREFS.length];
  }

  function applyTheme(pref) {
    const theme = resolveTheme(pref);
    const upcoming = nextPref(pref);
    document.documentElement.setAttribute("data-theme", theme);
    document.documentElement.setAttribute("data-theme-pref", pref);
    document.documentElement.setAttribute("data-theme-next", upcoming);
    const themeMeta = document.querySelector('meta[name="theme-color"]');
    if (themeMeta) themeMeta.setAttribute("content", theme === "dark" ? "#020805" : "#e7f6ec");

    document.querySelectorAll(".theme-toggle").forEach((btn) => {
      btn.dataset.pref = pref;
      btn.dataset.next = upcoming;
      btn.setAttribute("aria-label", labels[lang()][upcoming]);
      btn.setAttribute("title", labels[lang()][upcoming]);
    });
  }

  function initThemeControls() {
    let pref = readPref();
    applyTheme(pref);

    document.querySelectorAll(".theme-toggle").forEach((btn) => {
      btn.addEventListener("click", () => {
        pref = nextPref(readPref());
        writePref(pref);
        applyTheme(pref);
      });
    });

    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => {
      if (readPref() === "system") applyTheme("system");
    };
    if (typeof media.addEventListener === "function") {
      media.addEventListener("change", onChange);
    } else if (typeof media.addListener === "function") {
      media.addListener(onChange);
    }
  }

  function initNavMenu() {
    const toggle = document.getElementById("navToggle");
    const links = document.getElementById("navLinks");
    if (!toggle || !links) return;

    const labelOpen = toggle.dataset.labelOpen || "Open menu";
    const labelClose = toggle.dataset.labelClose || "Close menu";

    function setOpen(open) {
      links.classList.toggle("open", open);
      toggle.classList.toggle("is-open", open);
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      toggle.setAttribute("aria-label", open ? labelClose : labelOpen);
    }

    toggle.addEventListener("click", () => {
      setOpen(!links.classList.contains("open"));
    });

    links.querySelectorAll("a").forEach((a) => {
      a.addEventListener("click", () => setOpen(false));
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") setOpen(false);
    });
  }

  const HANDLE_KEY = "guru-handle";
  const SKIP_KEY = "guru-boot-skip";
  const BOOTED_KEY = "guru-booted";

  const copy = {
    en: {
      bootTitle: "Wake up",
      ask: "what should I call you?",
      wake: (name) => (name ? `Wake up, ${name}.` : "Wake up."),
      ready: "session ready — GURU Software Studio",
      prompt: "terminal command",
      help: "help   commands\nwork   selected work\ndiag   2-minute diagnostic\nresume founder\ncontact WhatsApp\nlang   EN / ES\ntheme  light / dark / system\nclear  clear this log",
      missing: (cmd) => `command not found: ${cmd}`,
      themeSet: (pref) => `theme → ${pref}`,
    },
    es: {
      bootTitle: "Despierta",
      ask: "¿cómo te llamo?",
      wake: (name) => (name ? `Despierta, ${name}.` : "Despierta."),
      ready: "sesión lista — GURU Software Studio",
      prompt: "comando de la terminal",
      help: "help    comandos\nwork    trabajo\ndiag    diagnóstico de 2 minutos\nresume  fundador\ncontact WhatsApp\nlang    EN / ES\ntheme   claro / oscuro / sistema\nclear   limpia este registro",
      missing: (cmd) => `no existe el comando: ${cmd}`,
      themeSet: (pref) => `tema → ${pref}`,
    },
  };

  function text() {
    return copy[lang()];
  }

  function cleanHandle(value) {
    const cleaned = value.replace(/[<>]/g, "").replace(/\s+/g, " ").trim().slice(0, 24);
    if (!cleaned || !/^[\p{L}\p{M}\d .'-]+$/u.test(cleaned)) return "";
    return cleaned;
  }

  function readHandle() {
    try {
      return cleanHandle(localStorage.getItem(HANDLE_KEY) || "");
    } catch {
      return "";
    }
  }

  function writeHandle(name) {
    try {
      if (name) localStorage.setItem(HANDLE_KEY, name);
      else localStorage.removeItem(HANDLE_KEY);
    } catch {
      /* ignore */
    }
  }

  function promptUser() {
    const name = readHandle();
    return name ? name.split(" ")[0].toLowerCase() : "guest";
  }

  function personalize() {
    const name = readHandle();
    const kicker = document.querySelector(".studio-kicker");
    if (kicker && name) kicker.textContent = text().wake(name);
    const who = document.getElementById("termWho");
    if (who) who.textContent = promptUser();
  }

  function siblingPath() {
    const path = window.location.pathname;
    if (lang() === "es") {
      const stripped = path.replace(/^\/es(?=\/|$)/, "") || "/";
      return stripped.endsWith("/") ? stripped : `${stripped}/`;
    }
    if (path === "/") return "/es/";
    return `/es${path.endsWith("/") ? path : `${path}/`}`;
  }

  function whatsApp() {
    const message = lang() === "es"
      ? "Hola GURU — quiero Personal Software for Business"
      : "Hi GURU — I want Personal Software for Business";
    return `https://wa.me/522225772475?text=${encodeURIComponent(message)}`;
  }

  function pagePath(kind) {
    const es = lang() === "es";
    if (kind === "home") return es ? "/es/" : "/";
    if (kind === "work") return es ? "/es/portafolio/" : "/portafolio/";
    if (kind === "diag") return es ? "/es/diagnostico/" : "/diagnostico/";
    return es ? "/es/resume/" : "/resume/";
  }

  function initRain(canvas) {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;
    const glyphs = "ｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉ01ABCDEF";
    let width = 0;
    let height = 0;
    let drops = [];
    const fontSize = 16;

    function resize() {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      const cols = Math.ceil(width / fontSize);
      drops = Array.from({ length: cols }, () => Math.random() * -30);
    }

    resize();
    window.addEventListener("resize", resize, { passive: true });

    let last = 0;
    function frame(now) {
      if (!document.hidden && now - last > 70) {
        last = now;
        const styles = getComputedStyle(document.documentElement);
        ctx.fillStyle = styles.getPropertyValue("--rain-fade").trim() || "rgba(0,0,0,0.16)";
        ctx.fillRect(0, 0, width, height);
        ctx.fillStyle = styles.getPropertyValue("--rain").trim() || "#3dff7a";
        ctx.font = `${fontSize}px "IBM Plex Mono", monospace`;
        for (let i = 0; i < drops.length; i += 1) {
          const ch = glyphs[Math.floor(Math.random() * glyphs.length)];
          ctx.fillText(ch, i * fontSize, drops[i] * fontSize);
          if (drops[i] * fontSize > height && Math.random() > 0.975) drops[i] = 0;
          drops[i] += 1;
        }
      }
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  function initTerminal() {
    const rain = document.createElement("canvas");
    rain.className = "matrix-rain";
    rain.setAttribute("aria-hidden", "true");
    document.body.prepend(rain);
    initRain(rain);

    const t = text();
    const boot = document.createElement("div");
    boot.className = "boot";
    boot.setAttribute("role", "dialog");
    boot.setAttribute("aria-modal", "true");
    boot.setAttribute("aria-label", t.bootTitle);
    const known = readHandle();
    boot.innerHTML = `
      <div class="boot-panel">
        <p class="boot-kicker">GURU // ${lang() === "es" ? "terminal" : "terminal"}</p>
        <p class="boot-line" id="bootLine"></p>
        <form class="boot-form" id="bootForm">
          <label for="bootName">&gt;</label>
          <input id="bootName" name="name" maxlength="24" autocomplete="given-name" enterkeyhint="done">
        </form>
      </div>`;
    document.body.appendChild(boot);
    const line = boot.querySelector("#bootLine");
    const form = boot.querySelector("#bootForm");
    const input = boot.querySelector("#bootName");
    input.setAttribute("aria-label", t.ask);
    input.placeholder = t.ask;

    function closeBoot() {
      boot.hidden = true;
      const dockInput = document.getElementById("termInput");
      if (dockInput) dockInput.focus({ preventScroll: true });
    }

    function showWake(name) {
      line.textContent = `${t.wake(name)}  ${t.ready}`;
      form.hidden = true;
      window.setTimeout(closeBoot, 1100);
    }

    let skipped = false;
    let alreadyBooted = false;
    try {
      skipped = sessionStorage.getItem(SKIP_KEY) === "1";
      alreadyBooted = sessionStorage.getItem(BOOTED_KEY) === "1";
    } catch { /* ignore */ }

    function markBooted() {
      try { sessionStorage.setItem(BOOTED_KEY, "1"); } catch { /* ignore */ }
    }

    if (alreadyBooted) {
      boot.hidden = true;
    } else if (known) {
      markBooted();
      showWake(known);
    } else if (skipped) {
      boot.hidden = true;
    } else {
      line.textContent = t.ask;
      input.focus();
      form.addEventListener("submit", (event) => {
        event.preventDefault();
        const name = cleanHandle(input.value);
        if (name) writeHandle(name);
        else {
          try { sessionStorage.setItem(SKIP_KEY, "1"); } catch { /* ignore */ }
        }
        markBooted();
        showWake(name);
        personalize();
      });
    }

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && !boot.hidden) {
        try { sessionStorage.setItem(SKIP_KEY, "1"); } catch { /* ignore */ }
        markBooted();
        form.hidden = true;
        closeBoot();
      }
    });

    const dock = document.createElement("form");
    dock.className = "term-dock";
    dock.innerHTML = `
      <p class="term-log" id="termLog" aria-live="polite"></p>
      <label class="term-prompt" for="termInput"><span id="termWho">${promptUser()}</span>@guru:~$</label>
      <input id="termInput" autocomplete="off" spellcheck="false" enterkeyhint="go">`;
    document.body.appendChild(dock);
    const log = dock.querySelector("#termLog");
    const termInput = dock.querySelector("#termInput");
    termInput.setAttribute("aria-label", t.prompt);
    termInput.placeholder = "help";

    dock.addEventListener("submit", (event) => {
      event.preventDefault();
      const raw = termInput.value.trim().toLowerCase();
      termInput.value = "";
      if (!raw) return;
      const [cmd] = raw.split(/\s+/);
      const routes = { work: "work", portafolio: "work", portfolio: "work", diag: "diag", diagnostic: "diag", diagnostico: "diag", resume: "resume", currículum: "resume", curriculum: "resume", home: "home", inicio: "home" };
      if (cmd === "help" || cmd === "ayuda") {
        log.textContent = text().help;
        return;
      }
      if (cmd === "clear" || cmd === "cls") {
        log.textContent = "";
        return;
      }
      if (cmd === "contact" || cmd === "whatsapp" || cmd === "call") {
        window.open(whatsApp(), "_blank", "noopener");
        log.textContent = "contact → WhatsApp";
        return;
      }
      if (cmd === "lang" || cmd === "idioma") {
        window.location.href = siblingPath();
        return;
      }
      if (cmd === "theme" || cmd === "tema") {
        const pref = nextPref(readPref());
        writePref(pref);
        applyTheme(pref);
        log.textContent = text().themeSet(pref);
        return;
      }
      if (routes[cmd]) {
        window.location.href = pagePath(routes[cmd]);
        return;
      }
      log.textContent = text().missing(cmd);
    });

    personalize();
  }

  document.addEventListener("DOMContentLoaded", () => {
    const year = document.getElementById("y");
    if (year) year.textContent = new Date().getFullYear();

    initNavMenu();

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) e.target.classList.add("visible");
        });
      },
      { threshold: 0.12 }
    );
    document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));

    initThemeControls();
    initTerminal();

    const themeMeta = document.querySelector('meta[name="theme-color"]');
    if (themeMeta) {
      themeMeta.setAttribute("content", document.documentElement.getAttribute("data-theme") === "dark" ? "#020805" : "#e7f6ec");
    }
  });
})();
