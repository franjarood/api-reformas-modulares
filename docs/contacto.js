const API_BASE_URL = window.API_BASE_URL || "http://127.0.0.1:8000";


document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector(".form-contacto");

  form.addEventListener("submit", async (e) => {
    e.preventDefault(); // evita recargar la página

    const nombre = document.getElementById("nombre").value.trim();
    const email = document.getElementById("email").value.trim();
    const mensaje = document.getElementById("mensaje").value.trim();

    // Mensaje simple si falta algo (por si acaso)
    if (!nombre || !email || !mensaje) {
      alert("Completa nombre, email y mensaje.");
      return;
    }

    const msgEl = document.getElementById("formMsg");
    msgEl.textContent = "";
    msgEl.style.color = "";

    const submitBtn = form.querySelector('input[type="submit"], button[type="submit"]');
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.value ? (submitBtn.value = "Enviando...") : (submitBtn.textContent = "Enviando...");
    }

    try {
      const res = await fetch(`${API_BASE_URL}/leads`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre, email, mensaje }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || "Error enviando el mensaje");
      }

      msgEl.textContent = " Mensaje enviado. Te contactaremos pronto.";
      msgEl.style.color = "green";
      form.reset();

    } catch (err) {
      msgEl.textContent = " No se pudo enviar. Inténtalo de nuevo.";
      msgEl.style.color = "crimson";

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
