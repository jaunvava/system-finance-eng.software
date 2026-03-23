function initOrcamento() {
  const data = getData();
  const lista = document.getElementById("listaOrcamentos");
  const select = document.getElementById("catOrcamento");

  function renderOrc() {
    if (!lista || !select) return;

    select.innerHTML =
      '<option value="" disabled selected>Selecione a categoria...</option>';
    data.categorias.forEach((c) => {
      const opt = document.createElement("option");
      opt.value = c;
      opt.textContent = c;
      select.appendChild(opt);
    });

    lista.innerHTML = "";
    const gastos = {};
    data.transacoes
      .filter((t) => t.tipo === "despesa")
      .forEach((t) => {
        gastos[t.categoria] = (gastos[t.categoria] || 0) + t.valor;
      });

    const categoriesInBudget = Object.keys(data.orcamentos);
    if (categoriesInBudget.length === 0) {
      lista.innerHTML =
        '<div class="text-center py-4 text-muted">Nenhum orçamento definido.</div>';
      return;
    }

    categoriesInBudget.forEach((cat) => {
      const limite = data.orcamentos[cat];
      const gasto = gastos[cat] || 0;
      const progresso = Math.min((gasto / limite) * 100, 100);
      const isOver = gasto > limite;

      const card = document.createElement("div");
      card.className = `card mb-3 p-3 border-start border-4 ${isOver ? "border-danger bg-danger bg-opacity-10" : "border-primary"}`;
      card.innerHTML = `
        <div class="d-flex justify-content-between align-items-center mb-2">
            <h6 class="mb-0 fw-bold">${cat}</h6>
            <button class="btn btn-sm btn-link text-danger p-0" onclick="removerOrcamento('${cat}')"><i class="fa-solid fa-circle-xmark fs-5"></i></button>
        </div>
        <div class="d-flex justify-content-between small mb-1">
            <span>Gasto: ${formatarMoeda(gasto)}</span>
            <span>Limite: ${formatarMoeda(limite)}</span>
        </div>
        <div class="progress" style="height: 10px;">
            <div class="progress-bar ${isOver ? "bg-danger" : "bg-primary"}" role="progressbar" style="width: ${progresso}%"></div>
        </div>
        ${isOver ? '<div class="text-danger small mt-1 fw-bold"><i class="fa-solid fa-triangle-exclamation me-1"></i> Orçamento estourado!</div>' : ""}
      `;
      lista.appendChild(card);
    });
  }

  window.removerOrcamento = function (cat) {
    if (confirm(`Remover orçamento de ${cat}?`)) {
      delete data.orcamentos[cat];
      saveData(data);
      renderOrc();
    }
  };

  const form = document.getElementById("formOrcamento");
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const cat = select.value;
      const limit = parseFloat(
        form.querySelector('input[type="number"]').value,
      );
      if (cat && limit > 0) {
        data.orcamentos[cat] = limit;
        saveData(data);
        form.reset();
        renderOrc();
      }
    });
  }

  renderOrc();
}
