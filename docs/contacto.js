const API_BASE_URL = (window.API_BASE_URL || "http://127.0.0.1:8000").replace(/\/$/, "");

document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector(".form-contacto");
  if (!form) return;

  const msgEl = document.getElementById("formMsg");

  const setMsg = (text, ok = false) => {
    if (!msgEl) return;
    msgEl.textContent = text || "";
    msgEl.style.color = ok ? "white" : "white";
    msgEl.style.background = ok ? "#27ae60" : "#c0392b";
    msgEl.style.padding = text ? "10px" : "0";
    msgEl.style.borderRadius = text ? "6px" : "0";
    msgEl.style.textAlign = text ? "center" : "";
  };

  // Teléfono válido España: 9 dígitos empezando por 6-9, o +34 delante
  const isValidPhoneES = (value) => {
    const digits = (value || "").trim().replace(/[^\d]/g, "");
    return /^[6-9]\d{8}$/.test(digits) || /^34[6-9]\d{8}$/.test(digits);
  };

  // Presupuesto: permite coma o punto y separadores de miles (opcional)
  const parseBudget = (value) => {
    const raw = (value || "").trim();
    if (!raw) return null;

    const normalized = raw
      .replace(/\s/g, "")
      .replace(/\./g, "")  // quita miles tipo 120.000,50
      .replace(",", ".");  // coma decimal -> punto

    const n = Number(normalized);
    return Number.isFinite(n) ? n : NaN;
  };

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    // Campos (incluimos telefono y presupuesto si existen en el HTML)
    const nombreEl = document.getElementById("nombre");
    const emailEl = document.getElementById("email");
    const telefonoEl = document.getElementById("telefono");
    const presupuestoEl = document.getElementById("presupuesto");
    const mensajeEl = document.getElementById("mensaje");

    const nombre = (nombreEl?.value || "").trim();
    const email = (emailEl?.value || "").trim();
    const telefono = (telefonoEl?.value || "").trim();
    const presupuestoRaw = (presupuestoEl?.value || "").trim();
    const mensaje = (mensajeEl?.value || "").trim();

    // Limpia mensaje
    if (msgEl) {
      msgEl.textContent = "";
      msgEl.style.background = "";
      msgEl.style.padding = "";
    }

    // 1) Validación básica
    if (!nombre || !email || !mensaje) {
      setMsg("Completa nombre, email y descripción del proyecto.");
      return;
    }

    // 2) Email real (formato HTML5)
    if (emailEl && !emailEl.checkValidity()) {
      setMsg("Email no válido.");
      emailEl.reportValidity();
      return;
    }

    // 3) Teléfono real (España)
    if (telefonoEl && !isValidPhoneES(telefono)) {
      setMsg("Teléfono no válido (Ej: 600123123 o +34 600 123 123).");
      telefonoEl.focus();
      return;
    }

    // 4) Presupuesto (opcional, pero si se escribe, debe ser número)
    const presupuesto = parseBudget(presupuestoRaw);
    if (Number.isNaN(presupuesto)) {
      setMsg("Presupuesto no válido (Ej: 60000,50 o 120.000,50).");
      presupuestoEl?.focus();
      return;
    }

    // Botón loading
    const submitBtn = form.querySelector('input[type="submit"], button[type="submit"]');
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.value ? (submitBtn.value = "Enviando...") : (submitBtn.textContent = "Enviando...");
    }

    try {
      // Enviamos SOLO lo que la API acepta (nombre, email, mensaje)
      const res = await fetch(`${API_BASE_URL}/leads`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre, email, mensaje }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || "Error enviando el mensaje");
      }

      setMsg("Mensaje enviado. Te contactaremos pronto.", true);
      form.reset();

    } catch (err) {
      console.error(err);
      setMsg("No se pudo enviar. Inténtalo de nuevo.");
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.value
          ? (submitBtn.value = "Enviar solicitud")
          : (submitBtn.textContent = "Enviar");
      }
    }
  });
});

