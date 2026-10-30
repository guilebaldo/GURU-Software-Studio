(() => {
  const root = document.querySelector("[data-agente]");
  if (!root) return;

  const lang = root.dataset.lang === "es" ? "es" : "en";
  const apiUrl = (root.dataset.api || "").trim();
  const leadsApi = (root.dataset.leadsApi || "").trim();
  const logEl = document.getElementById("agenteLog");
  const form = document.getElementById("agenteForm");
  const input = document.getElementById("agenteInput");
  const statusDot = document.getElementById("agenteStatusDot");
  const statusLabel = document.getElementById("agenteStatusLabel");
  const promptEl = document.getElementById("agentePromptLabel");

  const HANDLE_KEY = "guru-handle";
  const SESSION_KEY = "guru-session-id";
  const BOT = "guru";
  const EMAIL = "hello@gurusoftware.studio";
  const WA = "522225772475";
  const WA_BASE = `https://wa.me/${WA}`;

  const ASCII_LOGO = `  ██████╗ ██╗   ██╗██████╗ ██╗   ██╗
 ██╔════╝ ██║   ██║██╔══██╗██║   ██║
 ██║  ███╗██║   ██║██████╔╝██║   ██║
 ██║   ██║██║   ██║██╔══██╗██║   ██║
 ╚██████╔╝╚██████╔╝██║  ██║╚██████╔╝
  ╚═════╝  ╚═════╝ ╚═╝  ╚═╝ ╚═════╝`;

  const ASCII_MARK = `    ┌───┐
    │ G │
    └───┘`;

  const copy = {
    en: {
      boot: "guru.agent v0.2 — Personal Software for Business",
      greeting: (name) => {
        const hi = name ? `Hi ${name} —` : "Hi —";
        return `${hi} I'm Guilebaldo, your next software developer.\nWhat would you like to know about GURU, custom software, or working together?`;
      },
      placeholder: "Ask anything, or type help…",
      thinking: "…",
      offline: "local guide",
      online: "AI connected",
      helpTitle: "Try:",
      helpItems: [
        "what is Personal Software for Business?",
        "how do projects work?",
        "show portfolio",
        "contact / whatsapp / email",
        "diagnostic",
        "logo (ASCII art)",
        "lead you@email.com",
      ],
      contactIntro: "Fastest way to reach me:",
      emailLabel: "Email",
      waLabel: "WhatsApp",
      waPrefill: "Hi GURU — I came from the studio terminal on gurusoftware.studio.",
      unknown:
        "I'm not sure on that one in local mode. For a deeper answer, connect the AI API — or write me on WhatsApp / email.",
      error: "Something went wrong. You can still reach me on WhatsApp or email.",
      leadSaved: "Got it — I saved your details as a lead. I'll follow up soon.",
      leadSkipped: "Share your email with: lead you@company.com (or use WhatsApp below).",
      leadFailed: "Couldn't save right now — please use Email or WhatsApp.",
      leadNeedContact: "Include an email or phone, e.g. lead alex@ops.com",
    },
    es: {
      boot: "guru.agent v0.2 — Personal Software for Business",
      greeting: (name) => {
        const hi = name ? `Hola ${name} —` : "Hola,";
        return `${hi} soy Guilebaldo, tu próximo desarrollador de software.\n¿Qué te gustaría saber sobre GURU, software a la medida o cómo trabajamos?`;
      },
      placeholder: "Pregunta lo que quieras, o escribe ayuda…",
      thinking: "…",
      offline: "guía local",
      online: "IA conectada",
      helpTitle: "Prueba:",
      helpItems: [
        "¿qué es Personal Software for Business?",
        "¿cómo funcionan los proyectos?",
        "portafolio",
        "contacto / whatsapp / correo",
        "diagnóstico",
        "logo (arte ASCII)",
        "lead tu@correo.com",
      ],
      contactIntro: "La forma más rápida de hablar conmigo:",
      emailLabel: "Correo",
      waLabel: "WhatsApp",
      waPrefill: "Hola GURU — vengo del terminal en gurusoftware.studio.",
      unknown:
        "En modo local no tengo una respuesta clara. Cuando conectemos la API de IA podremos profundizar — o escríbeme por WhatsApp / correo.",
      error: "Algo falló. Igual puedes escribirme por WhatsApp o correo.",
      leadSaved: "Listo — guardé tus datos como lead. Te contacto pronto.",
      leadSkipped: "Deja tu correo con: lead tu@empresa.com (o usa WhatsApp abajo).",
      leadFailed: "No pude guardarlo ahorita — usa correo o WhatsApp.",
      leadNeedContact: "Incluye correo o teléfono, ej. lead alex@ops.com",
    },
  };

  const t = copy[lang];
  const history = [];
  let knowledge = "";
  let busy = false;
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function sleep(ms) {
    return new Promise((resolve) => {
      window.setTimeout(resolve, ms);
    });
  }

  function randBetween(min, max) {
    return min + Math.random() * (max - min);
  }

  async function dramaticPause() {
    if (reducedMotion) return;
    await sleep(randBetween(420, 760));
  }

  function readHandle() {
    try {
      const raw = localStorage.getItem(HANDLE_KEY) || "";
      const cleaned = raw.replace(/[<>]/g, "").replace(/\s+/g, " ").trim().slice(0, 24);
      if (!cleaned || !/^[\p{L}\p{M}\d .'-]+$/u.test(cleaned)) return "";
      return cleaned;
    } catch {
      return "";
    }
  }

  function promptUser() {
    const name = readHandle();
    if (name) return `${name.split(" ")[0].toLowerCase()}@guru`;
    return lang === "es" ? "tu@guru" : "you@guru";
  }

  function syncPrompt() {
    const label = `${promptUser()}:~$`;
    if (promptEl) promptEl.textContent = label;
    if (input) input.setAttribute("aria-describedby", "agentePromptLabel");
  }

  function waLink(text) {
    return `${WA_BASE}?text=${encodeURIComponent(text)}`;
  }

  function chatApiUrl() {
    if (!leadsApi) return "";
    return leadsApi.replace(/\/api\/leads\/?$/i, "/api/chat");
  }

  function logChat(role, content) {
    const url = chatApiUrl();
    if (!url || !content) return;
    try {
      fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionKey: getSessionKey(),
          lang,
          role,
          content: String(content).slice(0, 4000),
        }),
        keepalive: true,
      }).catch(() => {});
    } catch {
      /* ignore */
    }
  }

  function getSessionKey() {
    try {
      let id = localStorage.getItem(SESSION_KEY);
      if (!id && typeof crypto !== "undefined" && crypto.randomUUID) {
        id = crypto.randomUUID();
        localStorage.setItem(SESSION_KEY, id);
      }
      return id || "anon";
    } catch {
      return "anon";
    }
  }

  async function submitLead(payload) {
    if (!leadsApi) return { ok: false, skipped: true };
    try {
      const res = await fetch(leadsApi, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lang,
          source: "terminal",
          sessionKey: getSessionKey(),
          ...payload,
        }),
      });
      return { ok: res.ok };
    } catch {
      return { ok: false };
    }
  }

  function parseLeadInput(raw) {
    const email = raw.match(/[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}/)?.[0];
    const phone = raw.match(/\+?\d[\d\s-]{8,}\d/)?.[0]?.replace(/\s+/g, " ");
    const cleaned = raw.replace(/^lead\s+|^registro\s+/i, "").trim();
    const name = cleaned && !cleaned.includes("@") && !/^\+?\d/.test(cleaned) ? cleaned.slice(0, 120) : undefined;
    return {
      email,
      phone,
      name: name && name.length > 1 ? name : readHandle() || undefined,
      summary: cleaned.slice(0, 500) || undefined,
      intent: "lead",
    };
  }

  function scrollLog() {
    logEl.scrollTop = logEl.scrollHeight;
  }

  function appendToLog(node) {
    const form = document.getElementById("agenteForm");
    if (form && logEl.contains(form)) {
      logEl.insertBefore(node, form);
    } else {
      logEl.appendChild(node);
    }
    scrollLog();
  }

  function appendActions(line, actions) {
    if (!actions || !actions.length) return;
    const row = document.createElement("div");
    row.className = "agente-actions";
    actions.forEach((a) => {
      if (a.href) {
        const link = document.createElement("a");
        link.href = a.href;
        link.textContent = a.label;
        if (a.external) {
          link.target = "_blank";
          link.rel = "noopener";
        }
        row.appendChild(link);
      } else if (typeof a.onClick === "function") {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.textContent = a.label;
        btn.addEventListener("click", a.onClick);
        row.appendChild(btn);
      }
    });
    line.appendChild(row);
  }

  function appendLine(kind, label, text, actions, animate) {
    const line = document.createElement("div");
    line.className = `agente-line agente-line--${kind}${animate ? " is-new" : ""}`;
    if (kind === "ascii") {
      const pre = document.createElement("pre");
      pre.className = "agente-ascii";
      pre.textContent = text;
      line.appendChild(pre);
    } else {
      const head = document.createElement("div");
      if (label) {
        const span = document.createElement("span");
        span.className = "agente-label";
        span.textContent = `${label} `;
        head.appendChild(span);
      }
      const body = document.createElement("span");
      body.textContent = text;
      head.appendChild(body);
      line.appendChild(head);
    }

    appendActions(line, actions);
    appendToLog(line);
    if (animate) {
      window.setTimeout(() => line.classList.remove("is-new"), 180);
    }
  }

  async function typeBotMessage(label, text, actions) {
    const full = text || "";
    if (reducedMotion || !full) {
      appendLine("bot", label, full, actions, !reducedMotion);
      return;
    }

    const line = document.createElement("div");
    line.className = "agente-line agente-line--bot is-new";
    const head = document.createElement("div");
    const labelSpan = document.createElement("span");
    labelSpan.className = "agente-label";
    labelSpan.textContent = `${label} `;
    head.appendChild(labelSpan);

    const sr = document.createElement("span");
    sr.className = "agente-sr";
    sr.textContent = full;

    const visible = document.createElement("span");
    visible.className = "agente-typed";
    visible.setAttribute("aria-hidden", "true");

    const cursor = document.createElement("span");
    cursor.className = "agente-type-cursor";
    cursor.textContent = "▌";
    cursor.setAttribute("aria-hidden", "true");

    head.appendChild(sr);
    head.appendChild(visible);
    head.appendChild(cursor);
    line.appendChild(head);
    appendToLog(line);

    let skip = false;
    const onSkip = (event) => {
      if (event.key === "Enter" || event.key === "Escape") skip = true;
    };
    document.addEventListener("keydown", onSkip);

    try {
      let i = 0;
      while (i < full.length && !skip) {
        const ch = full[i];
        visible.textContent += ch;
        i += 1;
        logEl.scrollTop = logEl.scrollHeight;

        let delay = randBetween(12, 28);
        if (/[.,?!—]/.test(ch)) delay += randBetween(90, 220);
        if (ch === "\n") delay += randBetween(120, 280);
        if (full.length > 280) delay *= 0.62;
        await sleep(delay);
      }
      if (skip) visible.textContent = full;
    } finally {
      document.removeEventListener("keydown", onSkip);
      cursor.classList.add("is-idle");
      appendActions(line, actions);
      window.setTimeout(() => line.classList.remove("is-new"), 180);
      scrollLog();
    }
  }

  function contactActions() {
    return [
      {
        label: t.emailLabel,
        href: `mailto:${EMAIL}?subject=${encodeURIComponent("GURU — from studio terminal")}`,
      },
      {
        label: t.waLabel,
        href: waLink(t.waPrefill),
        external: true,
      },
    ];
  }

  function normalize(s) {
    return s
      .toLowerCase()
      .normalize("NFD")
      .replace(/\p{M}/gu, "")
      .trim();
  }

  function localReply(raw) {
    const q = normalize(raw);
    if (!q) return { text: `${t.helpTitle}\n• ${t.helpItems.join("\n• ")}` };

    if (/^(help|ayuda|\?)$/.test(q)) {
      return { text: `${t.helpTitle}\n• ${t.helpItems.join("\n• ")}` };
    }

    if (/^(logo|ascii|banner)$/.test(q)) {
      return { text: ASCII_LOGO };
    }

    if (/contact|correo|email|whatsapp|wa|hablar|llamar|mensaje/.test(q)) {
      const hint =
        lang === "es"
          ? "\n\nO guarda lead: lead tu@correo.com"
          : "\n\nOr save a lead: lead you@email.com";
      return { text: t.contactIntro + hint, actions: contactActions() };
    }

    if (/diagnostic|diagnostico|diagnóstico/.test(q)) {
      const path = lang === "es" ? "/es/diagnostico/" : "/diagnostico/";
      return {
        text:
          lang === "es"
            ? "El diagnóstico de 2 minutos te ayuda a ordenar necesidades antes de una cotización personal."
            : "The 2-minute diagnostic helps map needs before a personal quote.",
        actions: [
          { label: lang === "es" ? "Abrir diagnóstico" : "Open diagnostic", href: path },
          ...contactActions(),
        ],
      };
    }

    if (/portfolio|portafolio|trabajo|work|proyectos|projects|pixelapeso|barriando|soil/.test(q)) {
      const path = lang === "es" ? "/es/portafolio/" : "/portafolio/";
      const blurb =
        lang === "es"
          ? "Algunos proyectos: Pixelapeso, Barriando, Soil Force — y software a la medida para operaciones."
          : "Selected work: Pixelapeso, Barriando, Soil Force — plus custom ops software.";
      return {
        text: blurb,
        actions: [{ label: lang === "es" ? "Ver portafolio" : "View portfolio", href: path }],
      };
    }

    if (/precio|price|cost|cotiz|quote|cuanto|cuesta/.test(q)) {
      return {
        text:
          lang === "es"
            ? "No hay lista de precios pública: el alcance es personal. Empieza con el diagnóstico o una llamada corta y te doy cotización clara."
            : "There's no public price list — scope is personal. Start with the diagnostic or a short call for a clear quote.",
        actions: contactActions(),
      };
    }

    if (/personal software|software a la medida|que es guru|qué es guru|what is guru|guru studio/.test(q)) {
      return {
        text:
          lang === "es"
            ? "GURU Software Studio hace Personal Software for Business: software hecho para cómo opera tu negocio (cotizaciones, ops, clientes, inventario, reservas…). Primera versión usable suele salir en 4–8 semanas; tú te quedas con código y datos."
            : "GURU Software Studio builds Personal Software for Business — software shaped around how your operation runs (quoting, ops, clients, inventory, bookings…). A usable first version often ships in 4–8 weeks; you own the code and data.",
        actions: [
          { label: lang === "es" ? "Diagnóstico" : "Diagnostic", href: lang === "es" ? "/es/diagnostico/" : "/diagnostico/" },
        ],
      };
    }

    if (/proceso|process|como trabaj|how do you work|engagement|semanas|weeks/.test(q)) {
      return {
        text:
          lang === "es"
            ? "1) Diagnóstico rápido → 2) Llamada corta y cotización personal → 3) Alcance fijo, demos semanales, salida a producción."
            : "1) Quick diagnostic → 2) Short call and personal quote → 3) Fixed scope, weekly demos, go live.",
        actions: contactActions(),
      };
    }

    if (/guilebaldo|founder|resume|curriculum|curricul|quien eres|who are you/.test(q)) {
      const path = lang === "es" ? "/es/resume/" : "/resume/";
      return {
        text:
          lang === "es"
            ? "Soy Guilebaldo Ruiz Reyes, fundador de GURU en Puebla, México. Trabajo remoto con clientes en México y fuera."
            : "I'm Guilebaldo Ruiz Reyes, founder of GURU in Puebla, Mexico — working remotely with clients in Mexico and worldwide.",
        actions: [{ label: lang === "es" ? "Currículum" : "Resume", href: path }],
      };
    }

    if (knowledge) {
      const terms = q.split(/\s+/).filter((w) => w.length > 3);
      const hits = terms.filter((term) => knowledge.toLowerCase().includes(term));
      if (hits.length >= 2) {
        return {
          text:
            lang === "es"
              ? `Sobre “${raw}”: en el sitio destacamos software a la medida, diagnóstico, portafolio y contacto directo (correo / WhatsApp). ¿Quieres enlaces o hablamos en vivo?`
              : `On “${raw}”: we focus on custom software, the diagnostic, portfolio, and direct contact (email / WhatsApp). Want links, or should we talk live?`,
          actions: contactActions(),
        };
      }
    }

    return { text: t.unknown, actions: contactActions() };
  }

  async function fetchKnowledge() {
    try {
      const res = await fetch("/llms.txt", { cache: "force-cache" });
      if (res.ok) knowledge = await res.text();
    } catch {
      /* offline dev */
    }
  }

  async function askApi(text) {
    history.push({ role: "user", content: text });
    const res = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: history, lang }),
    });
    if (!res.ok) throw new Error("api");
    const data = await res.json();
    const reply = (data.reply || "").trim();
    if (reply) history.push({ role: "assistant", content: reply });
    return reply || t.unknown;
  }

  async function handleLeadCommand(raw) {
    const payload = parseLeadInput(raw);
    if (!payload.email && !payload.phone) {
      return { text: t.leadNeedContact, actions: contactActions() };
    }
    const saved = await submitLead(payload);
    if (saved.skipped) return { text: t.leadSkipped, actions: contactActions() };
    if (saved.ok) return { text: t.leadSaved, actions: contactActions() };
    return { text: t.leadFailed, actions: contactActions() };
  }

  async function handleUser(text) {
    if (busy) return;
    busy = true;
    input.disabled = true;
    appendLine("user", `${promptUser()}:~$`, text, undefined, true);
    logChat("user", text);

    appendLine("bot", `${BOT}:`, t.thinking, undefined, true);

    try {
      let result;
      const q = normalize(text);
      const work =
        /^(lead|registro)\b/.test(q)
          ? handleLeadCommand(text)
          : apiUrl
            ? askApi(text).then((reply) => ({ text: reply }))
            : Promise.resolve(localReply(text));

      const [, reply] = await Promise.all([dramaticPause(), work]);
      result = reply;

      logEl.lastElementChild?.remove();
      if (result.text === ASCII_LOGO) {
        appendLine("ascii", "", ASCII_LOGO);
        logChat("assistant", ASCII_LOGO);
      } else {
        await typeBotMessage(`${BOT}:`, result.text, result.actions);
        logChat("assistant", result.text);
      }
    } catch {
      logEl.lastElementChild?.remove();
      await typeBotMessage(`${BOT}:`, t.error, contactActions());
      logChat("assistant", t.error);
    } finally {
      busy = false;
      input.disabled = false;
      input.focus();
    }
  }

  async function boot() {
    syncPrompt();
    if (input) {
      input.placeholder = "";
    }

    if (statusDot && statusLabel) {
      if (apiUrl) {
        statusDot.classList.remove("is-offline");
        statusLabel.textContent = t.online;
      } else {
        statusDot.classList.add("is-offline");
        statusLabel.textContent = t.offline;
      }
    }

    appendLine("ascii", "", ASCII_LOGO);
    appendLine("system", "", `${ASCII_MARK}\nSoftware Studio · Puebla, MX`);
    appendLine("system", "", t.boot);
    const firstName = readHandle();
    await typeBotMessage(`${BOT}:`, t.greeting(firstName), contactActions());
    logChat("assistant", t.greeting(firstName));
  }

  form?.addEventListener("submit", (e) => {
    e.preventDefault();
    const text = input.value.trim();
    if (!text) return;
    input.value = "";
    handleUser(text);
  });

  if (input) {
    input.addEventListener("focus", scrollLog);
  }

  if (logEl && input) {
    logEl.addEventListener("click", (event) => {
      if (event.target.closest("a, button")) return;
      input.focus({ preventScroll: true });
    });
  }

  fetchKnowledge().then(boot).then(() => {
    input?.focus({ preventScroll: true });
  });
})();
