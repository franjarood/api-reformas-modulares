const API_BASE_URL = "http://127.0.0.1:8000";

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

      // OK
      alert("✅ Mensaje enviado. Te responderemos lo antes posible.");
      form.reset();
    } catch (err) {
      alert("❌ No se pudo enviar el mensaje: " + err.message);
      console.error(err);
    }
  });
});
