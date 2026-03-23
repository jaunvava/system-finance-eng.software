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
    const ultimo =
      mesesKeys.length > 0 ? mesesKeys[mesesKeys.length - 1] : null;
    const penultimo =
      mesesKeys.length > 1 ? mesesKeys[mesesKeys.length - 2] : null;

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
                        <span>Atual (${ultimo || "-"}):</span>
                        <span class="fw-bold">${formatarMoeda(valUltimo)}</span>
                    </div>
                    <div class="d-flex justify-content-between">
                        <span>Anterior (${penultimo || "-"}):</span>
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
                                ${mesesKeys
                                  .reverse()
                                  .map(
                                    (m) => `
                                    <tr>
                                        <td>${m}</td>
                                        <td class="text-end fw-bold">${formatarMoeda(porMes[m])}</td>
                                    </tr>`,
                                  )
                                  .join("")}
                                ${mesesKeys.length === 0 ? '<tr><td colspan="2" class="text-center text-muted">Sem dados disponíveis</td></tr>' : ""}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    `;
  }
}
