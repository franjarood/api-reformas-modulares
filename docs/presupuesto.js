const API_BASE_URL = window.API_BASE_URL || "http://127.0.0.1:8000";

document.addEventListener("DOMContentLoaded", async () => {
  const modeloSelect = document.getElementById("modeloSelect");
  const extrasBox = document.getElementById("extrasBox");
  const btnCalcular = document.getElementById("btnCalcular");
  const budgetMsg = document.getElementById("budgetMsg");
  const budgetResult = document.getElementById("budgetResult");

  // Si no estamos en la página correcta, salimos sin romper nada
  if (!modeloSelect || !extrasBox || !btnCalcular) return;

  const setMsg = (text, color) => {
    budgetMsg.textContent = text || "";
    budgetMsg.style.color = color || "";
  };

  try {
    setMsg("Cargando modelos y extras...", "#555");

    // 1) Cargar modelos
    const modelsRes = await fetch(`${API_BASE_URL}/models`);
    if (!modelsRes.ok) throw new Error("No se pudieron cargar los modelos");
    const models = await modelsRes.json();

    modeloSelect.innerHTML = models
      .map(
        (m) =>
          `<option value="${m.id}">${m.nombre} (${m.m2} m²) - ${Number(m.precio_base).toLocaleString()}€</option>`
      )
      .join("");

    // 2) Cargar opciones/extras
    const optRes = await fetch(`${API_BASE_URL}/options`);
    if (!optRes.ok) throw new Error("No se pudieron cargar los extras");
    const options = await optRes.json();

    extrasBox.innerHTML = options
      .map(
        (o) => `
        <label style="display:flex; gap:10px; align-items:flex-start; padding:10px; border:1px solid #ddd; border-radius:10px; background:#fff;">
          <input type="checkbox" value="${o.id}" style="margin-top:4px;" />
          <span>
            <div style="font-weight:700;">${o.categoria} · ${o.nombre}</div>
            <div style="opacity:0.85;">+ ${Number(o.precio).toLocaleString()}€</div>
          </span>
        </label>
      `
      )
      .join("");

    setMsg("", "");

    // 3) Calcular presupuesto
    btnCalcular.addEventListener("click", async () => {
      budgetResult.innerHTML = "";
      setMsg("", "");

      const modelo_id = Number(modeloSelect.value);
      const option_ids = Array.from(
        extrasBox.querySelectorAll('input[type="checkbox"]:checked')
      ).map((cb) => Number(cb.value));

      btnCalcular.disabled = true;
      btnCalcular.value = "Calculando...";

      try {
        const res = await fetch(`${API_BASE_URL}/budget`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ modelo_id, option_ids }),
        });

        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.detail || "Error calculando presupuesto");
        }

        const data = await res.json();
        const { precio_base, precio_extras, total_estimado } = data.desglose;

        setMsg(" Presupuesto calculado", "green");

        budgetResult.innerHTML = `
          <div style="background:#fff; border:1px solid #e6e6e6; border-radius:12px; padding:16px;">
            <div><strong>Modelo:</strong> ${data.modelo.nombre}</div>
            <div><strong>Base:</strong> ${Number(precio_base).toLocaleString()}€</div>
            <div><strong>Extras:</strong> ${Number(precio_extras).toLocaleString()}€</div>
            <hr style="margin:12px 0;">
            <div style="font-size:1.15rem;"><strong>Total estimado:</strong> ${Number(total_estimado).toLocaleString()}€</div>
          </div>
        `;

        budgetMsg.scrollIntoView({ behavior: "smooth", block: "center" });
      } catch (e) {
        setMsg("❌ " + e.message, "crimson");
      } finally {
        btnCalcular.disabled = false;
        btnCalcular.value = "Calcular presupuesto";
      }
    });
  } catch (e) {
    setMsg(" No se pudieron cargar datos desde la API.", "crimson");
    console.error(e);
  }
});
