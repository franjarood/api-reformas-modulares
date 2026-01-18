const API_BASE_URL = (window.API_BASE_URL || "http://127.0.0.1:8000").replace(/\/$/, "");

document.addEventListener("DOMContentLoaded", async () => {
  const modeloSelect = document.getElementById("modeloSelect");
  const extrasContainer = document.getElementById("extrasContainer");
  const btnCalcular = document.getElementById("btnCalcular");
  const budgetMsg = document.getElementById("budgetMsg");
  const budgetResult = document.getElementById("budgetResult");

  if (!modeloSelect || !extrasContainer || !btnCalcular || !budgetMsg || !budgetResult) return;

  const setMsg = (text, type = "") => {
    budgetMsg.textContent = text || "";
    budgetMsg.className = "";
    if (type) budgetMsg.classList.add(type);
  };

  const groupByCategory = (options) => {
    return options.reduce((acc, o) => {
      const cat = o.categoria || "OTROS";
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(o);
      return acc;
    }, {});
  };

  const renderExtras = (options) => {
    const grouped = groupByCategory(options);
    extrasContainer.innerHTML = "";

    Object.entries(grouped).forEach(([cat, items]) => {
      const details = document.createElement("details");
      details.className = "extra-group";
      details.open = true;

      const summary = document.createElement("summary");
      summary.textContent = cat;
      details.appendChild(summary);

      const list = document.createElement("div");
      list.className = "extra-list";

      // Ninguna
      const none = document.createElement("label");
      none.className = "extra-option extra-option--none";
      none.innerHTML = `
        <input type="radio" name="extra_${cat}" value="" checked>
        <span class="extra-option-name">Ninguna</span>
        <span class="extra-option-price"></span>
      `;
      list.appendChild(none);

      // Opciones
      items.forEach((o) => {
        const label = document.createElement("label");
        label.className = "extra-option";
        label.innerHTML = `
          <input type="radio" name="extra_${cat}" value="${o.id}">
          <span class="extra-option-name">${o.nombre}</span>
          <span class="extra-option-price">+ ${Number(o.precio).toLocaleString()}€</span>
        `;
        list.appendChild(label);
      });

      details.appendChild(list);
      extrasContainer.appendChild(details);
    });
  };

  const getSelectedOptionIds = () => {
    const radios = extrasContainer.querySelectorAll('input[type="radio"]:checked');
    const ids = [];
    radios.forEach((r) => {
      if (r.value) ids.push(Number(r.value));
    });
    return ids;
  };

  const renderBudget = (data) => {
    const { precio_base, precio_extras, total_estimado } = data.desglose;

    budgetResult.innerHTML = `
      <div class="budget-card">
        <div><strong>Modelo:</strong> ${data.modelo.nombre}</div>
        <div><strong>Base:</strong> ${Number(precio_base).toLocaleString()}€</div>
        <div><strong>Extras:</strong> ${Number(precio_extras).toLocaleString()}€</div>
        <hr>
        <div class="budget-total"><strong>Total estimado:</strong> ${Number(total_estimado).toLocaleString()}€</div>
      </div>
    `;
  };

  try {
    setMsg("Cargando modelos y extras...", "msg-info");

    // Modelos
    const modelsRes = await fetch(`${API_BASE_URL}/models`);
    if (!modelsRes.ok) throw new Error("No se pudieron cargar los modelos");
    const models = await modelsRes.json();

    modeloSelect.innerHTML = models
      .map(
        (m) =>
          `<option value="${m.id}">${m.nombre} (${m.m2} m²) - ${Number(m.precio_base).toLocaleString()}€</option>`
      )
      .join("");

    // Extras
    const optRes = await fetch(`${API_BASE_URL}/options`);
    if (!optRes.ok) throw new Error("No se pudieron cargar los extras");
    const options = await optRes.json();

    renderExtras(options);
    setMsg("", "");

    // Calcular
    btnCalcular.addEventListener("click", async () => {
      budgetResult.innerHTML = "";
      setMsg("", "");

      const modelo_id = Number(modeloSelect.value);
      const option_ids = getSelectedOptionIds();

      btnCalcular.disabled = true;
      btnCalcular.value = "Calculando...";

      try {
        const res = await fetch(`${API_BASE_URL}/configurations/calculate`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ modelo_id, option_ids }),
        });

        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.detail || "Error calculando presupuesto");

        setMsg("Presupuesto calculado", "msg-success");
        renderBudget(data);
        budgetMsg.scrollIntoView({ behavior: "smooth", block: "center" });
      } catch (e) {
        setMsg("❌ " + e.message, "msg-error");
      } finally {
        btnCalcular.disabled = false;
        btnCalcular.value = "Calcular presupuesto";
      }
    });
  } catch (e) {
    setMsg("No se pudieron cargar datos desde la API.", "msg-error");
    console.error(e);
  }
});


