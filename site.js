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
  });
})();
