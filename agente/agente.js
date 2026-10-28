(() => {
  const root = document.querySelector("[data-agente]");
  if (!root) return;

  const lang = root.dataset.lang === "es" ? "es" : "en";
  const apiUrl = (root.dataset.api || "").trim();
  const logEl = document.getElementById("agenteLog");
  const form = document.getElementById("agenteForm");
  const input = document.getElementById("agenteInput");
  const statusDot = document.getElementById("agenteStatusDot");
  const statusLabel = document.getElementById("agenteStatusLabel");

  const EMAIL = "hello@gurusoftware.studio";
  const WA = "522225772475";
  const WA_BASE = `https://wa.me/${WA}`;

  const copy = {
    en: {
      prompt: "you@studio:~$",
      boot: "session init — guilebaldo.agent v0.1",
      greeting:
        "Hi — I'm Guilebaldo, your next software developer.\nWhat would you like to know about GURU, custom software, or working together?",
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
      ],
      contactIntro: "Fastest way to reach me:",
      emailLabel: "Email",
      waLabel: "WhatsApp",
      waPrefill: "Hi Guilebaldo — I came from the agent terminal on gurusoftware.studio.",
      unknown:
        "I'm not sure on that one in local mode. For a real conversation, connect the AI API — or write me on WhatsApp / email and we'll figure it out.",
      error: "Something went wrong. You can still reach me on WhatsApp or email.",
    },
    es: {
      prompt: "tu@studio:~$",
      boot: "inicio de sesión — guilebaldo.agent v0.1",
      greeting:
        "Hola, soy Guilebaldo, tu próximo desarrollador de software.\n¿Qué te gustaría saber sobre GURU, software a la medida o cómo trabajamos?",
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
      ],
      contactIntro: "La forma más rápida de hablar conmigo:",
      emailLabel: "Correo",
      waLabel: "WhatsApp",
      waPrefill: "Hola Guilebaldo — vengo del terminal agente en gurusoftware.studio.",
      unknown:
        "En modo local no tengo una respuesta clara para eso. Cuando conectemos la API de IA podremos profundizar — o escríbeme por WhatsApp / correo y lo vemos.",
      error: "Algo falló. Igual puedes escribirme por WhatsApp o correo.",
    },
  };

  const t = copy[lang];
  const history = [];
  let knowledge = "";
  let busy = false;

  function waLink(text) {
    return `${WA_BASE}?text=${encodeURIComponent(text)}`;
  }

  function appendLine(kind, label, text, actions) {
    const line = document.createElement("div");
    line.className = `agente-line agente-line--${kind}`;
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

    if (actions && actions.length) {
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

    logEl.appendChild(line);
    logEl.scrollTop = logEl.scrollHeight;
  }

  function contactActions() {
    return [
      {
        label: t.emailLabel,
        href: `mailto:${EMAIL}?subject=${encodeURIComponent("GURU — from agent terminal")}`,
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
    if (!q) return { text: t.helpTitle + "\n• " + t.helpItems.join("\n• ") };

    if (/^(help|ayuda|\?)$/.test(q)) {
      return { text: `${t.helpTitle}\n• ${t.helpItems.join("\n• ")}` };
    }

    if (/contact|correo|email|whatsapp|wa|hablar|llamar|mensaje/.test(q)) {
      return {
        text: t.contactIntro,
        actions: contactActions(),
      };
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
          {
            label: lang === "es" ? "Ver sitio" : "See site",
            href: lang === "es" ? "/es/" : "/",
          },
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
              ? `Sobre “${raw}”: en el sitio destacamos software a la medida, diagnóstico, portafolio y contacto directo (correo / WhatsApp). ¿Quieres que te pase enlaces o prefieres escribirme?`
              : `On “${raw}”: on the site we focus on custom software, the diagnostic, portfolio, and direct contact (email / WhatsApp). Want links, or should we talk live?`,
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

  async function handleUser(text) {
    if (busy) return;
    busy = true;
    input.disabled = true;
    appendLine("user", t.prompt, text);

    appendLine("bot", "guilebaldo:", t.thinking);

    try {
      let result;
      if (apiUrl) {
        const reply = await askApi(text);
        result = { text: reply };
      } else {
        result = localReply(text);
      }
      logEl.lastElementChild?.remove();
      appendLine("bot", "guilebaldo:", result.text, result.actions);
    } catch {
      logEl.lastElementChild?.remove();
      appendLine("bot", "guilebaldo:", t.error, contactActions());
    } finally {
      busy = false;
      input.disabled = false;
      input.focus();
    }
  }

  function boot() {
    if (statusDot && statusLabel) {
      if (apiUrl) {
        statusDot.classList.remove("is-offline");
        statusLabel.textContent = t.online;
      } else {
        statusDot.classList.add("is-offline");
        statusLabel.textContent = t.offline;
      }
    }

    appendLine("system", "", t.boot);
    appendLine("bot", "guilebaldo:", t.greeting, contactActions());
  }

  form?.addEventListener("submit", (e) => {
    e.preventDefault();
    const text = input.value.trim();
    if (!text) return;
    input.value = "";
    handleUser(text);
  });

  fetchKnowledge().then(boot);
})();
