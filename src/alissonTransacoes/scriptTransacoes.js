// Elementos globais que serão definidos na inicialização
let dialog = null;
let dialogEditar = null;
let form = null;
let formEditar = null;
let transacoes = [];
let saldo = 0;

const MENSAGENS_ERRO = {
  VALOR_INVALIDO: "O valor deve ser maior que zero!",
  DATA_INVALIDA: "Digite uma data válida!",
  TIPO_INVALIDO: "Tipo inválido!",
  CATEGORIA_INVALIDA: "Categoria não encontrada",
  DESCRICAO_LONGA: "A descrição deve conter no máximo 100 caracteres",
};

class Transacao {
  constructor({ id = null, tipo, valor, data, categoriaId, descricao = "" }) {
    this.id = id || this.gerarId();
    this.tipo = tipo;
    this.valor = Number(valor);
    this.data = data;
    this.categoriaId = categoriaId;
    this.descricao = descricao || "";
  }

  gerarId() {
    return Math.floor(Math.random() * 100000);
  }
}

function initTransacoes() {
  console.log("Inicializando Transações...");
  
  // Seleção de elementos (agora que o HTML foi carregado no DOM)
  const modalEl = document.getElementById("modalDialog");
  const modalEditarEl = document.getElementById("modalDialogEditar");
  
  if (!modalEl || !modalEditarEl) {
    console.error("Modais não encontrados no DOM");
    return;
  }

  // Inicializa instâncias do Bootstrap
  dialog = new bootstrap.Modal(modalEl);
  dialogEditar = new bootstrap.Modal(modalEditarEl);
  
  form = document.getElementById("formTransacao");
  formEditar = document.getElementById("formEditarTransacao");
  
  const tipo = document.getElementById("tipo");
  const categoriasSelect = document.getElementById("categorias");
  const botaoAbrir = document.getElementById("botaoAbrirTransacao");
  const botaoExcluir = document.getElementById("excluirTransacao");

  // Popula categorias
  popularCategorias();

  // Event Listeners
  tipo.addEventListener("change", () => {
    const container = document.getElementById("categorias-container");
    if (tipo.value === "despesa") {
      container.style.display = "block";
    } else {
      container.style.display = "none";
    }
  });

  const editTipo = formEditar.querySelector("#edit-tipo");
  if (editTipo) {
    editTipo.addEventListener("change", () => {
      const container = formEditar.querySelector("#edit-categorias-container");
      if (editTipo.value === "despesa") {
        container.style.display = "block";
      } else {
        container.style.display = "none";
      }
    });
  }

  botaoAbrir.addEventListener("click", () => {
    form.reset();
    // Default para hoje
    document.getElementById("data").valueAsDate = new Date();
    dialog.show();
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const efetuada = novaTransacao({
      tipoTransacao: document.getElementById("tipo").value,
      valor: document.getElementById("valor").value,
      data: document.getElementById("data").value,
      categoriaId: document.getElementById("categorias").value,
      descricao: document.getElementById("descricao").value,
    });

    if (efetuada) {
      dialog.hide();
    }
  });

  formEditar.addEventListener("submit", (event) => {
    event.preventDefault();
    salvarEdicao();
  });

  botaoExcluir.addEventListener("click", (event) => {
    event.preventDefault();
    excluirTransacaoAtual();
  });

  // Carregar dados
  carregarDados();
}

function popularCategorias() {
  const selects = document.querySelectorAll("#categorias, #edit-categorias");
  const { categorias } = getData(); // Função global do script.js
  
  selects.forEach(select => {
    select.innerHTML = '<option value="" disabled selected>Selecione uma categoria</option>';
    categorias.forEach(cat => {
      const option = document.createElement("option");
      option.value = cat;
      option.textContent = cat;
      select.appendChild(option);
    });
  });
}

function validarTransacao(dados) {
  const erros = [];
  if (!dados.tipoTransacao) erros.push(MENSAGENS_ERRO.TIPO_INVALIDO);
  if (!dados.valor || Number(dados.valor) <= 0) erros.push(MENSAGENS_ERRO.VALOR_INVALIDO);
  
  const dataHoje = new Date();
  const dataDigitada = new Date(dados.data);
  if (!dados.data || dataDigitada > dataHoje) erros.push(MENSAGENS_ERRO.DATA_INVALIDA);
  
  if (!dados.categoriaId && dados.tipoTransacao === "despesa") {
    erros.push(MENSAGENS_ERRO.CATEGORIA_INVALIDA);
  }
  
  if (dados.descricao.length > 100) erros.push(MENSAGENS_ERRO.DESCRICAO_LONGA);

  return { valido: erros.length === 0, erros };
}

function novaTransacao({ tipoTransacao, valor, data, categoriaId, descricao }) {
  const validacao = validarTransacao({ tipoTransacao, valor, data, categoriaId, descricao });

  if (!validacao.valido) {
    alert(validacao.erros.join("\n"));
    return null;
  }

  const valorFormatado = Number(valor);
  const transacao = new Transacao({
    tipo: tipoTransacao,
    valor: valorFormatado,
    data,
    categoriaId: tipoTransacao === "receita" ? "" : categoriaId,
    descricao,
  });

  transacoes.push(transacao);
  salvarDados();
  atualizarLista();
  recalcularSaldo();

  alert("Transação efetuada com sucesso!");
  return transacao;
}

function adicionarTransacaoNaLista(transacao) {
  const divListaTransacoes = document.getElementById("listaTransacoes");
  if (!divListaTransacoes) return;

  const divTransacao = document.createElement("div");
  divTransacao.className = "infoTransacoes";

  const pId = document.createElement("p");
  pId.textContent = "#" + transacao.id;

  const pData = document.createElement("p");
  pData.textContent = transacao.data;

  const pDescricao = document.createElement("p");
  pDescricao.textContent = transacao.descricao;
  pDescricao.className = "fw-bold";

  const pCategoria = document.createElement("p");
  pCategoria.textContent = transacao.tipo === "despesa" ? transacao.categoriaId : "-";

  const pValor = document.createElement("p");
  const corValor = transacao.tipo === "receita" ? "text-success" : "text-danger";
  const sinal = transacao.tipo === "receita" ? "+" : "-";
  pValor.textContent = `${sinal} R$ ${transacao.valor.toFixed(2)}`;
  pValor.className = `${corValor} fw-bold`;

  const btnEditar = document.createElement("button");
  btnEditar.className = "buttonDepositar Editar";
  btnEditar.innerHTML = '<i class="fa-solid fa-pen me-1"></i>Editar';
  btnEditar.onclick = () => abrirModalEditar(transacao.id);

  divTransacao.appendChild(pId);
  divTransacao.appendChild(pData);
  divTransacao.appendChild(pDescricao);
  divTransacao.appendChild(pCategoria);
  divTransacao.appendChild(pValor);
  divTransacao.appendChild(btnEditar);

  divListaTransacoes.prepend(divTransacao);
}

let idTransacaoEditando = null;

function abrirModalEditar(id) {
  const transacao = transacoes.find(t => t.id == id);
  if (!transacao) return;

  idTransacaoEditando = id;
  
  formEditar.querySelector("#edit-tipo").value = transacao.tipo;
  formEditar.querySelector("#edit-valor").value = transacao.valor;
  formEditar.querySelector("#edit-data").value = transacao.data;
  formEditar.querySelector("#edit-descricao").value = transacao.descricao;
  formEditar.querySelector("#edit-categorias").value = transacao.categoriaId;

  // Atualiza visibilidade da categoria no edit
  const container = formEditar.querySelector("#edit-categorias-container");
  if (container) {
    container.style.display = transacao.tipo === "despesa" ? "block" : "none";
  }

  dialogEditar.show();
}

function salvarEdicao() {
  const transacao = transacoes.find(t => t.id == idTransacaoEditando);
  if (!transacao) return;

  const tipo = formEditar.querySelector("#edit-tipo").value;
  const valor = formEditar.querySelector("#edit-valor").value;
  const data = formEditar.querySelector("#edit-data").value;
  const descricao = formEditar.querySelector("#edit-descricao").value;
  const categoriaId = formEditar.querySelector("#edit-categorias").value;

  const validacao = validarTransacao({ tipoTransacao: tipo, valor, data, categoriaId, descricao });
  if (!validacao.valido) {
    alert(validacao.erros.join("\n"));
    return;
  }

  transacao.tipo = tipo;
  transacao.valor = Number(valor);
  transacao.data = data;
  transacao.descricao = descricao;
  transacao.categoriaId = tipo === "receita" ? "" : categoriaId;

  salvarDados();
  atualizarLista();
  recalcularSaldo();
  
  dialogEditar.hide();
  alert("Transação editada com sucesso!");
}

function excluirTransacaoAtual() {
  if (!confirm("Tem certeza que deseja excluir esta transação?")) return;

  transacoes = transacoes.filter(t => t.id != idTransacaoEditando);
  
  salvarDados();
  atualizarLista();
  recalcularSaldo();
  
  dialogEditar.hide();
  alert("Transação excluída com sucesso!");
}

function atualizarLista() {
  const lista = document.getElementById("listaTransacoes");
  if (!lista) return;

  lista.innerHTML = "";
  if (transacoes.length === 0) {
    lista.innerHTML = '<div class="text-center py-4 text-muted">Nenhuma transação encontrada.</div>';
    return;
  }

  // Ordenar por data (mais recente primeiro)
  const transacoesOrdenadas = [...transacoes].sort((a, b) => new Date(a.data) - new Date(b.data));
  transacoesOrdenadas.forEach(t => adicionarTransacaoNaLista(t));
}

function recalcularSaldo() {
  saldo = transacoes.reduce((acc, t) => {
    return t.tipo === "receita" ? acc + t.valor : acc - t.valor;
  }, 0);

  const divSaldo = document.getElementById("saldo"); // Se existir no dashboard ou aqui
  if (divSaldo) {
    divSaldo.textContent = saldo.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
    divSaldo.className = saldo >= 0 ? "text-success fw-bold" : "text-danger fw-bold";
  }
}

// Persistência sincronizada com o resto do app
function salvarDados() {
  const data = getData();
  data.transacoes = transacoes;
  saveData(data); // Função global do script.js
}

function carregarDados() {
  const data = getData();
  transacoes = data.transacoes || [];
  atualizarLista();
  recalcularSaldo();
}
