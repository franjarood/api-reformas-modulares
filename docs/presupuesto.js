const API_BASE_URL = (window.API_BASE_URL || "http://127.0.0.1:8000").replace(/\/$/, "");

document.addEventListener("DOMContentLoaded", async () => {
  const modeloSelect = document.getElementById("modeloSelect");
  const extrasBox = document.getElementById("extrasBox");
  const extrasContainer = document.getElementById("extrasContainer"); // NUEVO
  const btnCalcular = document.getElementById("btnCalcular");
  const budgetMsg = document.getElementById("budgetMsg");
  const budgetResult = document.getElementById("budgetResult");

  // Si no estamos en la página correcta, salimos sin romper nada
  if (!modeloSelect || !extrasBox || !extrasContainer || !btnCalcular) return;

  const setMsg = (text, color) => {
    budgetMsg.textContent = text || "";
    budgetMsg.style.color = color || "";
  };

  // Agrupar por categoria
  const groupByCategory = (options) => {
    return options.reduce((acc, o) => {
      const cat = o.categoria || "OTROS";
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(o);
      return acc;
    }, {});
  };

  // Pintar extras por categoria en desplegables con radios (1 eleccion)
  const renderExtras = (options) => {
    const grouped = groupByCategory(options);
    extrasContainer.innerHTML = "";

    Object.entries(grouped).forEach(([cat, items]) => {
      const details = document.createElement("details");
      details.style.border = "1px solid #ddd";
      details.style.borderRadius = "12px";
      details.style.padding = "10px";
      details.style.background = "#fff";

      const summary = document.createElement("summary");
      summary.textContent = cat;
      summary.style.cursor = "pointer";
      summary.style.fontWeight = "700";
      summary.style.listStyle = "none";
      details.appendChild(summary);

      const list = document.createElement("div");
      list.style.display = "grid";
      list.style.gap = "10px";
      list.style.marginTop = "12px";

      // Opcion "Ninguna" para esa categoria
      list.insertAdjacentHTML(
        "beforeend",
        `
        <label style="display:flex; gap:10px; align-items:flex-start; padding:10px; border:1px solid #eee; border-radius:10px; background:#fafafa;">
          <input type="radio" name="extra_${cat}" value="" style="margin-top:4px;" checked />
          <span>
            <div style="font-weight:700;">Ninguna</div>
            <div style="opacity:0.85;">No añadir extra en ${cat}</div>
          </span>
        </label>
        `
      );

      // Opciones reales (radios con el mismo name por categoria)
      items.forEach((o) => {
        list.insertAdjacentHTML(
          "beforeend",
          `
          <label style="display:flex; gap:10px; align-items:flex-start; padding:10px; border:1px solid #ddd; border-radius:10px; background:#fff;">
            <input type="radio" name="extra_${cat}" value="${o.id}" style="margin-top:4px;" />
            <span>
              <div style="font-weight:700;">${o.nombre}</div>
              <div style="opacity:0.85;">+ ${Number(o.precio).toLocaleString()}€</div>
            </span>
          </label>
          `
        );
      });

      details.appendChild(list);
      extrasContainer.appendChild(details);
    });
  };

  // Recoger 1 option_id por categoria (segun radios seleccionados)
  const getSelectedOptionIds = () => {
    const radiosChecked = extrasContainer.querySelectorAll('input[type="radio"]:checked');
    const ids = [];

    radiosChecked.forEach((r) => {
      if (r.value) ids.push(Number(r.value)); // ignora "Ninguna" (value="")
    });

    return ids;
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

    // Antes pintabas checkboxes en extrasBox; ahora pintamos en extrasContainer
    renderExtras(options);

    setMsg("", "");

    // 3) Calcular presupuesto
    btnCalcular.addEventListener("click", async () => {
      budgetResult.innerHTML = "";
      setMsg("", "");

      const modelo_id = Number(modeloSelect.value);
      const option_ids = getSelectedOptionIds();

      btnCalcular.disabled = true;
      btnCalcular.value = "Calculando...";

      try {
        // OJO: este es el endpoint real en la API
        const res = await fetch(`${API_BASE_URL}/configurations/calculate`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ modelo_id, option_ids }),
        });

        const data = await res.json().catch(() => ({}));

        if (!res.ok) {
          throw new Error(data.detail || "Error calculando presupuesto");
        }

        const { precio_base, precio_extras, total_estimado } = data.desglose;

        setMsg("Presupuesto calculado", "green");

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
    setMsg("No se pudieron cargar datos desde la API.", "crimson");
    console.error(e);
  }
});

