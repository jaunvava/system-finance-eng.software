const STORAGE_KEY = "financas_data";

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
  return JSON.parse(localStorage.getItem(STORAGE_KEY)) || defaultData;
}

function saveData(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function formatarMoeda(valor) {
  return `R$ ${valor.toFixed(2).replace(".", ",")}`;
}

const path = window.location.pathname;

if (path.endsWith("index.html") || path === "/" || path.endsWith("/src/")) {
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
        gastosPorCategoria["Outros"] =
          (gastosPorCategoria["Outros"] || 0) + t.valor;
      }
    }
  });

  const saldo = receitas - despesas;

  try {
    document.querySelector(".saldo-principal h1").textContent =
      formatarMoeda(saldo);
    document.querySelector(".mini-card.receita strong").textContent =
      formatarMoeda(receitas);
    document.querySelector(".mini-card.despesa strong").textContent =
      formatarMoeda(despesas);
  } catch (e) {}

  setTimeout(() => {
    const ctxSaldo = document.getElementById("graficoSaldo");
    if (ctxSaldo) {
      new Chart(ctxSaldo.getContext("2d"), {
        type: "line",
        data: {
          labels: ["Últimos dias", "Atual"],
          datasets: [
            {
              label: "Evolução do Saldo",
              data: [0, saldo],
              borderColor: "#15803d",
              backgroundColor: "rgba(21, 128, 61, 0.1)",
              fill: true,
            },
          ],
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
          datasets: [
            {
              data: Object.values(gastosPorCategoria),
              backgroundColor: [
                "#ef4444",
                "#3b82f6",
                "#eab308",
                "#8b5cf6",
                "#6b7280",
                "#10b981",
                "#f97316",
                "#6366f1",
              ],
            },
          ],
        },
        options: { responsive: true, maintainAspectRatio: false },
      });
    }
  }, 100);
}

if (path.endsWith("transacoes.html")) {
  const data = getData();
  const lista = document.getElementById("listaTransacoes");
  const selectCategoria = document.getElementById("catDespesa");

  function render() {
    if (!lista) return;
    lista.innerHTML = "";
    data.transacoes
      .sort((a, b) => new Date(b.data) - new Date(a.data))
      .forEach((t, i) => {
        const div = document.createElement("div");
        div.className = "infoTransacoes";
        div.innerHTML = `
                <p>${new Date(t.data).toLocaleDateString("pt-BR")}</p>
                <p>${t.descricao}</p>
                <p>${t.tipo === "receita" ? "Receita" : t.categoria}</p>
                <p style="color: ${t.tipo === "receita" ? "green" : "red"}">${formatarMoeda(t.valor)}</p>
                <div>
                    <button onclick="editarTransacao(${i})" style="background:#3b82f6;color:white;border:none;border-radius:4px;cursor:pointer;padding:2px 5px;">E</button>
                    <button onclick="deletarTransacao(${i})" style="background:red;color:white;border:none;border-radius:4px;cursor:pointer;padding:2px 5px;">X</button>
                </div>
            `;
        lista.appendChild(div);
        lista.appendChild(document.createElement("hr"));
      });
  }

  if (selectCategoria) {
    selectCategoria.innerHTML =
      '<option value="" disabled selected>Selecione...</option>';
    data.categorias.forEach((c) => {
      selectCategoria.innerHTML += `<option value="${c}">${c}</option>`;
    });
  }

  window.deletarTransacao = function (index) {
    data.transacoes.splice(index, 1);
    saveData(data);
    render();
  };

  window.editarTransacao = function (index) {
    const t = data.transacoes[index];
    if (t.tipo === "receita") {
      formReceita.querySelector('input[type="text"]').value = t.descricao;
      formReceita.querySelector('input[type="number"]').value = t.valor;
      formReceita.querySelector('input[type="date"]').value = t.data;
    } else {
      formDespesa.querySelector('input[type="text"]').value = t.descricao;
      formDespesa.querySelector('input[type="number"]').value = t.valor;
      formDespesa.querySelector('input[type="date"]').value = t.data;
      selectCategoria.value = t.categoria;
    }
    deletarTransacao(index);
  };

  const formReceita = document.getElementById("formReceita");
  if (formReceita) {
    formReceita.addEventListener("submit", (e) => {
      e.preventDefault();
      const desc = formReceita.querySelector('input[type="text"]').value;
      const val = parseFloat(
        formReceita.querySelector('input[type="number"]').value,
      );
      const dt = formReceita.querySelector('input[type="date"]').value;
      data.transacoes.push({
        id: Date.now(),
        tipo: "receita",
        descricao: desc,
        valor: val,
        data: dt,
      });
      saveData(data);
      formReceita.reset();
      render();
    });
  }

  const formDespesa = document.getElementById("formDespesa");
  if (formDespesa) {
    formDespesa.addEventListener("submit", (e) => {
      e.preventDefault();
      const desc = formDespesa.querySelector('input[type="text"]').value;
      const val = parseFloat(
        formDespesa.querySelector('input[type="number"]').value,
      );
      const dt = formDespesa.querySelector('input[type="date"]').value;
      const cat = selectCategoria.value;
      data.transacoes.push({
        id: Date.now(),
        tipo: "despesa",
        descricao: desc,
        valor: val,
        data: dt,
        categoria: cat,
      });
      saveData(data);
      formDespesa.reset();
      render();
    });
  }

  render();
}

if (path.endsWith("categorias.html")) {
  const data = getData();
  const lista = document.getElementById("listaCategorias");

  function renderCat() {
    if (!lista) return;
    lista.innerHTML = "";
    data.categorias.forEach((c, i) => {
      const div = document.createElement("div");
      div.className = "infoCategoria";
      div.innerHTML = `
                <p>${c}</p>
                <button onclick="deletarCategoria(${i})" style="background:red;color:white;border:none;border-radius:4px;cursor:pointer;padding:4px 8px;max-width:40px;margin:auto;">X</button>
            `;
      lista.appendChild(div);
      lista.appendChild(document.createElement("hr"));
    });
  }

  window.deletarCategoria = function (index) {
    data.categorias.splice(index, 1);
    saveData(data);
    renderCat();
  };

  const formCat = document.getElementById("formCategoria");
  if (formCat) {
    formCat.addEventListener("submit", (e) => {
      e.preventDefault();
      const val = formCat.querySelector('input[type="text"]').value;
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

if (path.endsWith("orcamento.html")) {
  const data = getData();
  const lista = document.getElementById("listaOrcamentos");
  const select = document.getElementById("catOrcamento");

  function renderOrc() {
    if (!lista || !select) return;
    select.innerHTML =
      '<option value="" disabled selected>Selecione...</option>';
    data.categorias.forEach((c) => {
      select.innerHTML += `<option value="${c}">${c}</option>`;
    });

    lista.innerHTML = "";
    const gastos = {};
    data.transacoes
      .filter((t) => t.tipo === "despesa")
      .forEach((t) => {
        gastos[t.categoria] = (gastos[t.categoria] || 0) + t.valor;
      });

    Object.keys(data.orcamentos).forEach((cat) => {
      const limite = data.orcamentos[cat];
      const gasto = gastos[cat] || 0;
      const alerta =
        gasto > limite ? "background-color: #fee2e2; color: #dc2626;" : "";

      const div = document.createElement("div");
      div.className = "infoCategoria";
      div.style =
        alerta + " padding: 10px; border-radius: 8px; margin-bottom: 5px;";
      div.innerHTML = `
                <p><strong>${cat}</strong></p>
                <p>Limite: ${formatarMoeda(limite)} | Gasto: ${formatarMoeda(gasto)} ${gasto > limite ? "⚠️ Estourou" : ""}</p>
                <button onclick="removerOrcamento('${cat}')" style="background:red;color:white;border:none;border-radius:4px;cursor:pointer;padding:4px 8px;max-width:40px;margin:auto;">X</button>
            `;
      lista.appendChild(div);
    });
  }

  window.removerOrcamento = function (cat) {
    delete data.orcamentos[cat];
    saveData(data);
    renderOrc();
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

if (path.endsWith("relatorios.html")) {
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
    const ultimo =
      mesesKeys.length > 0 ? mesesKeys[mesesKeys.length - 1] : null;
    const penultimo =
      mesesKeys.length > 1 ? mesesKeys[mesesKeys.length - 2] : null;

    const valUltimo = ultimo ? porMes[ultimo] : 0;
    const valPenultimo = penultimo ? porMes[penultimo] : 0;

    painel.innerHTML = `
            <div class="card" style="margin-bottom:20px;">
                <h3>Maior Despesa Registrada</h3>
                <p style="font-size:1.2rem;color:#dc2626;margin-top:10px;">
                    ${maiorDespesa.descricao || "Nenhuma"} - ${formatarMoeda(maiorDespesa.valor)}
                </p>
            </div>
            
            <div class="card" style="margin-bottom:20px;">
                <h3>Comparativo (Gastos Mês Atual vs Anterior)</h3>
                <p style="margin-top:10px;">Mês Atual (${ultimo || "-"}): <strong>${formatarMoeda(valUltimo)}</strong></p>
                <p style="margin-top:5px;">Mês Anterior (${penultimo || "-"}): <strong>${formatarMoeda(valPenultimo)}</strong></p>
            </div>

            <div class="card">
                <h3>Gastos por Mês</h3>
                <ul style="margin-top:10px; list-style:none; padding:0;">
                    ${mesesKeys.map((m) => `<li style="margin-bottom:5px; border-bottom:1px solid #ccc; padding-bottom:5px;">${m}: <strong>${formatarMoeda(porMes[m])}</strong></li>`).join("")}
                </ul>
            </div>
        `;
  }
}
