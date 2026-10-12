(() => {
  const form = document.getElementById("diagForm");
  if (!form) return;

  const summary = document.getElementById("diagSummary");
  const list = document.getElementById("diagSummaryList");
  const noteOut = document.getElementById("diagSummaryNote");
  const waLink = document.getElementById("diagWhatsApp");
  const hint = document.getElementById("diagHint");
  const noteInput = document.getElementById("diagNote");
  const editBtn = document.getElementById("diagEdit");
  const lang = form.dataset.lang === "es" ? "es" : "en";
  const waNumber = form.dataset.wa || "522225772475";

  const copy = {
    en: {
      empty: "Pick at least one idea to continue.",
      noteLabel: "Note",
      waIntro: "Hi GURU — I completed the diagnostic. Here’s what I need:",
      waClose: "I’d like a short call for scope and quote.",
    },
    es: {
      empty: "Elige al menos una idea para continuar.",
      noteLabel: "Nota",
      waIntro: "Hola GURU — hice el diagnóstico. Esto es lo que necesito:",
      waClose: "Quiero una llamada corta para alcance y cotización.",
    },
  }[lang];

  function selectedChips() {
    return [...form.querySelectorAll(".diag-chip[aria-pressed='true']")];
  }

  function syncHint() {
    const n = selectedChips().length;
    hint.hidden = n > 0;
    hint.textContent = copy.empty;
  }

  form.querySelectorAll(".diag-chip").forEach((chip) => {
    chip.addEventListener("click", () => {
      const on = chip.getAttribute("aria-pressed") === "true";
      chip.setAttribute("aria-pressed", on ? "false" : "true");
      syncHint();
    });
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const chips = selectedChips();
    if (!chips.length) {
      hint.hidden = false;
      hint.textContent = copy.empty;
      hint.focus?.();
      return;
    }

    list.innerHTML = "";
    const labels = chips.map((chip) => chip.textContent.trim());
    labels.forEach((label) => {
      const li = document.createElement("li");
      li.textContent = label;
      list.appendChild(li);
    });

    const note = (noteInput.value || "").trim();
    if (note) {
      noteOut.hidden = false;
      noteOut.textContent = `${copy.noteLabel}: ${note}`;
    } else {
      noteOut.hidden = true;
      noteOut.textContent = "";
    }

    const lines = [
      copy.waIntro,
      "",
      ...labels.map((label) => `• ${label}`),
    ];
    if (note) {
      lines.push("", `${copy.noteLabel}: ${note}`);
    }
    lines.push("", copy.waClose);
    waLink.href = `https://wa.me/${waNumber}?text=${encodeURIComponent(lines.join("\n"))}`;

    form.hidden = true;
    summary.hidden = false;
    summary.scrollIntoView({ behavior: "smooth", block: "start" });
  });

  editBtn?.addEventListener("click", () => {
    summary.hidden = true;
    form.hidden = false;
    form.scrollIntoView({ behavior: "smooth", block: "start" });
  });

  syncHint();
})();
