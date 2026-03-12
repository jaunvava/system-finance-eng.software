const storage_kay = "financas_data";

// --- Data Management ---
function getData() {
  const defaultData = {
    transacoes: [],
    categorias: [
      "Alimentação",
      "Transporte",
      "Lazer",
      "Moradia",
      "Estudo",
      "Outros",
    ],
    orcamentos: {},
  };
  return JSON.parse(localStorage.getItem(storage_kay)) || defaultData;
}

function saveData(data) {
  localStorage.setItem(storage_kay, JSON.stringify(data));
}

function formatarMoeda(valor) {
  return `R$ ${valor.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

// --- Navigation Logic ---
const routes = {
  dashboard: {
    url: "dashboard/dashboard.html",
    init: initDashboard
  },
  transacoes: {
    url: "transacoes/transacoes.html",
    init: initTransacoes
  },
  categorias: {
    url: "categorias/categorias.html",
    init: initCategorias
  },
  relatorios: {
    url: "relatorios/relatorios.html",
    init: initRelatorios
  },
  orcamento: {
    url: "orcamentos/orcamento.html",
    init: initOrcamento
  }
};

async function navigateTo(pageKey) {
  const route = routes[pageKey];
  if (!route) return;

  const contentArea = document.getElementById("content-area");
  contentArea.classList.remove("loaded");

  try {
    const response = await fetch(route.url);
    const html = await response.text();
    
    // Inject HTML
    contentArea.innerHTML = html;
    
    // Update Navbar active state
    document.querySelectorAll(".nav-link").forEach(link => {
      link.classList.remove("active");
      if (link.getAttribute("onclick")?.includes(pageKey)) {
        link.classList.add("active");
      }
    });

    // Close mobile navbar if open
    const navbarCollapse = document.getElementById('navbarNav');
    if (navbarCollapse && navbarCollapse.classList.contains('show')) {
        const bsCollapse = bootstrap.Collapse.getInstance(navbarCollapse) || new bootstrap.Collapse(navbarCollapse);
        bsCollapse.hide();
    }

    // Initialize page-specific logic
    route.init();

    // Show content with fade-in
    setTimeout(() => {
      contentArea.classList.add("loaded");
    }, 50);

  } catch (error) {
    console.error("Erro ao carregar página:", error);
    contentArea.innerHTML = `<div class="alert alert-danger">Erro ao carregar a página: ${error.message}</div>`;
  }
}

// --- Page Initializers ---

function initDashboard() {
  const data = getData();
  let receitas = 0;
  let despesas = 0;

  const gastosPorCategoria = {};
  data.categorias.forEach((c) => (gastosPorCategoria[c] = 0));

  data.transacoes.forEach((t) => {
    if (t.tipo === "receita") {
      receitas += t.valor;
    } else {
      despesas += t.valor;
      if (gastosPorCategoria[t.categoria] !== undefined) {
        gastosPorCategoria[t.categoria] += t.valor;
      } else {
        gastosPorCategoria["Outros"] = (gastosPorCategoria["Outros"] || 0) + t.valor;
      }
    }
  });

  const saldo = receitas - despesas;

  const saldoEl = document.getElementById("saldo-display");
  const receitasEl = document.getElementById("receitas-display");
  const despesasEl = document.getElementById("despesas-display");

  if (saldoEl) saldoEl.textContent = formatarMoeda(saldo);
  if (receitasEl) receitasEl.textContent = formatarMoeda(receitas);
  if (despesasEl) despesasEl.textContent = formatarMoeda(despesas);

  // Charts
  const ctxSaldo = document.getElementById("graficoSaldo");
  if (ctxSaldo) {
    new Chart(ctxSaldo.getContext("2d"), {
      type: "line",
      data: {
        labels: ["Início", "Atual"],
        datasets: [{
          label: "Evolução do Saldo",
          data: [0, saldo],
          borderColor: "#16a34a",
          backgroundColor: "rgba(22, 163, 74, 0.1)",
          fill: true,
          tension: 0.4
        }],
      },
      options: { responsive: true, maintainAspectRatio: false },
    });
  }

  const ctxDespesas = document.getElementById("graficoDespesas");
  if (ctxDespesas) {
    new Chart(ctxDespesas.getContext("2d"), {
      type: "doughnut",
      data: {
        labels: Object.keys(gastosPorCategoria),
        datasets: [{
          data: Object.values(gastosPorCategoria),
          backgroundColor: ["#ef4444", "#3b82f6", "#eab308", "#8b5cf6", "#6b7280", "#10b981", "#f97316", "#6366f1"],
        }],
      },
      options: { 
        responsive: true, 
        maintainAspectRatio: false,
        plugins: {
            legend: { position: 'bottom' }
        }
      },
    });
  }
}

function initTransacoes() {
  const data = getData();
  const lista = document.getElementById("listaTransacoes");
  const selectCategoria = document.getElementById("categorias"); // Matches fragment ID

  function render() {
    if (!lista) return;
    lista.innerHTML = "";
    
    if (data.transacoes.length === 0) {
        lista.innerHTML = '<div class="text-center py-4 text-muted">Nenhuma transação encontrada.</div>';
        return;
    }

    const table = document.createElement("table");
    table.className = "table table-hover align-middle";
    table.innerHTML = `
        <thead class="table-light">
            <tr>
                <th>Data</th>
                <th>Descrição</th>
                <th>Categoria</th>
                <th class="text-end">Valor</th>
                <th class="text-center">Ações</th>
            </tr>
        </thead>
        <tbody></tbody>
    `;
    const tbody = table.querySelector("tbody");

    data.transacoes
      .sort((a, b) => new Date(b.data) - new Date(a.data))
      .forEach((t, i) => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${new Date(t.data).toLocaleDateString("pt-BR")}</td>
            <td>${t.descricao}</td>
            <td><span class="badge ${t.tipo === 'receita' ? 'bg-success' : 'bg-secondary'}">${t.tipo === "receita" ? "Receita" : t.categoria}</span></td>
            <td class="text-end fw-bold ${t.tipo === "receita" ? "text-success" : "text-danger"}">${formatarMoeda(t.valor)}</td>
            <td class="text-center">
                <button class="btn btn-sm btn-outline-primary me-1" onclick="editarTransacao(${i})"><i class="fa-solid fa-pen"></i></button>
                <button class="btn btn-sm btn-outline-danger" onclick="deletarTransacao(${i})"><i class="fa-solid fa-trash"></i></button>
            </td>
        `;
        tbody.appendChild(tr);
      });
    lista.appendChild(table);
  }

  // Populate categories in select
  if (selectCategoria) {
    selectCategoria.innerHTML = '<option value="" disabled selected>Escolha a categoria...</option>';
    data.categorias.forEach((c) => {
      const opt = document.createElement("option");
      opt.value = c;
      opt.textContent = c;
      selectCategoria.appendChild(opt);
    });
  }

  window.deletarTransacao = function (index) {
    if(confirm("Deseja realmente excluir esta transação?")) {
        data.transacoes.splice(index, 1);
        saveData(data);
        render();
    }
  };

  window.editarTransacao = function (index) {
    const t = data.transacoes[index];
    const modal = new bootstrap.Modal(document.getElementById('modalDialog'));
    
    // Fill form
    document.getElementById("tipo").value = t.tipo;
    document.getElementById("valor").value = t.valor;
    document.getElementById("data").value = t.data;
    document.getElementById("descricao").value = t.descricao;
    if (t.categoria) document.getElementById("categorias").value = t.categoria;
    
    // Delete old one on save (simple edit implementation from original)
    data.transacoes.splice(index, 1);
    saveData(data);
    
    modal.show();
  };

  const formTransacao = document.getElementById("formTransacao");
  if (formTransacao) {
    formTransacao.addEventListener("submit", (e) => {
      e.preventDefault();
      const tipo = document.getElementById("tipo").value;
      const val = parseFloat(document.getElementById("valor").value);
      const dt = document.getElementById("data").value;
      const desc = document.getElementById("descricao").value;
      const cat = document.getElementById("categorias").value;

      data.transacoes.push({
        id: Date.now(),
        tipo: tipo,
        descricao: desc,
        valor: val,
        data: dt,
        categoria: tipo === 'despesa' ? cat : 'Receita'
      });
      
      saveData(data);
      formTransacao.reset();
      
      const modalInstance = bootstrap.Modal.getInstance(document.getElementById('modalDialog'));
      if(modalInstance) modalInstance.hide();
      
      render();
    });
  }

  const btnOpen = document.getElementById("botaoAbrirTransacao");
  if (btnOpen) {
      btnOpen.onclick = () => {
          const modal = new bootstrap.Modal(document.getElementById('modalDialog'));
          modal.show();
      };
  }

  render();
}

function initCategorias() {
  const data = getData();
  const lista = document.getElementById("listaCategorias");

  function renderCat() {
    if (!lista) return;
    lista.innerHTML = "";
    
    const listGroup = document.createElement("div");
    listGroup.className = "list-group shadow-sm";

    data.categorias.forEach((c, i) => {
      const item = document.createElement("div");
      item.className = "list-group-item d-flex justify-content-between align-items-center py-3";
      item.innerHTML = `
        <span class="fw-medium">${c}</span>
        <button class="btn btn-sm btn-danger" onclick="deletarCategoria(${i})"><i class="fa-solid fa-trash"></i></button>
      `;
      listGroup.appendChild(item);
    });
    lista.appendChild(listGroup);
  }

  window.deletarCategoria = function (index) {
    if(confirm(`Excluir categoria "${data.categorias[index]}"?`)) {
        data.categorias.splice(index, 1);
        saveData(data);
        renderCat();
    }
  };

  const formCat = document.getElementById("formCategoria");
  if (formCat) {
    formCat.addEventListener("submit", (e) => {
      e.preventDefault();
      const input = formCat.querySelector('input[type="text"]');
      const val = input.value.trim();
      if (val && !data.categorias.includes(val)) {
        data.categorias.push(val);
        saveData(data);
        formCat.reset();
        renderCat();
      }
    });
  }

  renderCat();
}

function initOrcamento() {
  const data = getData();
  const lista = document.getElementById("listaOrcamentos");
  const select = document.getElementById("catOrcamento");

  function renderOrc() {
    if (!lista || !select) return;
    
    // Fill select
    select.innerHTML = '<option value="" disabled selected>Selecione a categoria...</option>';
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
        lista.innerHTML = '<div class="text-center py-4 text-muted">Nenhum orçamento definido.</div>';
        return;
    }

    categoriesInBudget.forEach((cat) => {
      const limite = data.orcamentos[cat];
      const gasto = gastos[cat] || 0;
      const progresso = Math.min((gasto / limite) * 100, 100);
      const isOver = gasto > limite;

      const card = document.createElement("div");
      card.className = `card mb-3 p-3 border-start border-4 ${isOver ? 'border-danger bg-danger bg-opacity-10' : 'border-primary'}`;
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
            <div class="progress-bar ${isOver ? 'bg-danger' : 'bg-primary'}" role="progressbar" style="width: ${progresso}%"></div>
        </div>
        ${isOver ? '<div class="text-danger small mt-1 fw-bold"><i class="fa-solid fa-triangle-exclamation me-1"></i> Orçamento estourado!</div>' : ''}
      `;
      lista.appendChild(card);
    });
  }

  window.removerOrcamento = function (cat) {
    if(confirm(`Remover orçamento de ${cat}?`)) {
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
      const limit = parseFloat(form.querySelector('input[type="number"]').value);
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

function initRelatorios() {
  const data = getData();
  const painel = document.getElementById("painelRelatorios");

  if (painel) {
    const porMes = {};
    let maiorDespesa = { valor: 0, descricao: "" };

    data.transacoes
      .filter((t) => t.tipo === "despesa")
      .forEach((t) => {
        if (!t.data) return;
        const d = new Date(t.data);
        const mesA = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
        porMes[mesA] = (porMes[mesA] || 0) + t.valor;
        if (t.valor > maiorDespesa.valor) {
          maiorDespesa = t;
        }
      });

    const mesesKeys = Object.keys(porMes).sort();
    const ultimo = mesesKeys.length > 0 ? mesesKeys[mesesKeys.length - 1] : null;
    const penultimo = mesesKeys.length > 1 ? mesesKeys[mesesKeys.length - 2] : null;

    const valUltimo = ultimo ? porMes[ultimo] : 0;
    const valPenultimo = penultimo ? porMes[penultimo] : 0;

    painel.innerHTML = `
        <div class="row g-4">
            <div class="col-md-6">
                <div class="card h-100 p-4">
                    <h5 class="text-secondary small fw-bold text-uppercase mb-3">Maior Despesa</h5>
                    <h3 class="text-danger fw-bold mb-1">${formatarMoeda(maiorDespesa.valor)}</h3>
                    <p class="mb-0 text-muted">${maiorDespesa.descricao || "Nenhuma registrada"}</p>
                </div>
            </div>
            <div class="col-md-6">
                <div class="card h-100 p-4">
                    <h5 class="text-secondary small fw-bold text-uppercase mb-3">Comparativo Mensal</h5>
                    <div class="d-flex justify-content-between mb-2">
                        <span>Atual (${ultimo || '-'}):</span>
                        <span class="fw-bold">${formatarMoeda(valUltimo)}</span>
                    </div>
                    <div class="d-flex justify-content-between">
                        <span>Anterior (${penultimo || '-'}):</span>
                        <span class="fw-bold text-muted">${formatarMoeda(valPenultimo)}</span>
                    </div>
                </div>
            </div>
            <div class="col-12">
                <div class="card p-4">
                    <h5 class="fw-bold mb-4">Histórico de Gastos Mensais</h5>
                    <div class="table-responsive">
                        <table class="table table-sm">
                            <thead>
                                <tr>
                                    <th>Mês</th>
                                    <th class="text-end">Total Gasto</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${mesesKeys.reverse().map((m) => `
                                    <tr>
                                        <td>${m}</td>
                                        <td class="text-end fw-bold">${formatarMoeda(porMes[m])}</td>
                                    </tr>`).join("")}
                                ${mesesKeys.length === 0 ? '<tr><td colspan="2" class="text-center text-muted">Sem dados disponíveis</td></tr>' : ''}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    `;
  }
}

// Initial Load
document.addEventListener("DOMContentLoaded", () => {
    navigateTo('dashboard');
});
