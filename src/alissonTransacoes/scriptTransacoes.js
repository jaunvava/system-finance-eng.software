const dialog = document.getElementById("modalDialog");

window.addEventListener("load", () => {
  dialog.close();
  dialogEditar.close();
  carregarLocalStorage();
});

const tipo = document.getElementById("tipo");
const categorias = document.getElementById("categorias");

tipo.addEventListener("change", () => {
  if (tipo.value === "despesa") {
    categorias.style.display = "block";
  } else {
    categorias.style.display = "none";
  };
});

const botaoAbrir = document.getElementById("botaoAbrirTransacao");

botaoAbrir.addEventListener("click", () => {
  form.reset();
  dialog.showModal();
});

const botoesFechar = document.querySelectorAll(".buttonFechar");

botoesFechar.forEach((botao) => {
  botao.addEventListener("click", () => {
    dialog.close();
    dialogEditar.close();
  });
});

const transacoes = [];
let saldo = 0;
let saldoAnterior = 0;

const MENSAGENS_ERRO = {
  VALOR_INVALIDO: "O valor deve ser maior que zero!",
  DATA_INVALIDA: "Digite uma data válida!",
  TIPO_INVALIDO: "Tipo inválido!",
  CATEGORIA_INVALIDA: "Categoria não encontrada",
  DESCRICAO_LONGA: "A  descrição deve conter no máximo 100 caracteres",
};

class Transacao {
  constructor({ id = null, tipo, valor, data, categoriaId, descricao = "" }) {
    this.id = id || this.gerarId();
    this.tipo = tipo;
    this.valor = Number(valor);
    this.data = data;
    this.categoriaId = categoriaId;
    this.descricao = descricao || "";
  };

  gerarId() {
    return Math.floor(Math.random() * 100000);
  };
};

const tipoTransacao = document.getElementById("tipo");
const valor = document.getElementById("valor");
const data = document.getElementById("data");
const categoriaId = document.getElementById("categorias");
const descricao = document.getElementById("descricao");

function validarTransacao() {
  const erros = [];

  if (!tipoTransacao.value) {
    erros.push(MENSAGENS_ERRO.TIPO_INVALIDO);
  };

  if (!valor.value || Number(valor.value) <= 0) {
    erros.push(MENSAGENS_ERRO.VALOR_INVALIDO);
  };

  const dataHoje = new Date();
  const dataDigitada = new Date(data.value);

  if (!data.value || dataDigitada > dataHoje) {
    erros.push(MENSAGENS_ERRO.DATA_INVALIDA);
  };

  if (!categoriaId.value && tipoTransacao.value !== "receita") {
    erros.push(MENSAGENS_ERRO.CATEGORIA_INVALIDA);
  };

  if (descricao.value.length > 100) {
    erros.push(MENSAGENS_ERRO.DESCRICAO_LONGA);
  };

  return {
    valido: erros.length === 0,
    erros: erros,
  };
};

function novaTransacao({ tipoTransacao, valor, data, categoriaId, descricao }) {
  const valido = validarTransacao();

  if (!valido.valido) {
    alert(valido.erros.join("\n"));
    return null;
  };

  const valorFormatado = Number(valor) || 0;

  if (tipoTransacao === "receita") {
    categoriaId = "";
    saldo += valorFormatado;
  } else {
    saldo -= valorFormatado;
  };

  const transacao = new Transacao({
    tipo: tipoTransacao,
    valor: valorFormatado,
    data,
    categoriaId,
    descricao,
  });

  transacoes.push(transacao);

  salvarLocalStorage();

  adicionarTransacaoNaLista(transacao);

  dialog.close();

  return transacao;
};

const form = document.getElementById("formTransacao");

form.addEventListener("submit", (event) => {
  event.preventDefault();

  const efetuada = novaTransacao({
    tipoTransacao: tipoTransacao.value,
    valor: valor.value,
    data: data.value,
    categoriaId: categoriaId.value,
    descricao: descricao.value,
  });

  if (efetuada) {
    alert("Transação efetuada com sucesso!");
  } else {
    alert("Transação mal sucedida!");
  }
});

function adicionarTransacaoNaLista(transacao) {
  const divListaTransacoes = document.getElementById("listaTransacoes");

  const divTransacao = document.createElement("div");
  divTransacao.className = "infoTransacoes";

  const pId = document.createElement("p");
  pId.textContent = "0" + transacao.id;

  const pData = document.createElement("p");
  pData.textContent = transacao.data;

  const pDescricao = document.createElement("p");
  pDescricao.textContent = transacao.descricao;

  const pTipo = document.createElement("p");

  if (transacao.tipo === "receita") {
    pTipo.textContent = `${transacao.tipo.toUpperCase()}`;
  } else {
    pTipo.textContent = `${transacao.tipo.toUpperCase()} / ${transacao.categoriaId}`;
  }

  const pValor = document.createElement("p");
  pValor.textContent = transacao.valor.toFixed(2);

  if (transacao.tipo === "receita") {
    pValor.style.color = "green";
  } else {
    pValor.style.color = "red";
  }

  const button = document.createElement("button");
  button.textContent = "Editar";
  button.className = "buttonDepositar Editar";
  button.value = transacao.id;

  button.addEventListener("click", (event) => {
    const id = event.target.value;

    abrirModalEditar(id);
  });

  divTransacao.append(pId);
  divTransacao.append(pData);
  divTransacao.append(pDescricao);
  divTransacao.append(pTipo);
  divTransacao.append(pValor);
  divTransacao.append(button);

  divListaTransacoes.prepend(divTransacao);

  atualizarSaldo(saldo);
};

function atualizarSaldo(saldo) {
  const div = document.getElementById("saldo");

  div.textContent = saldo.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });

  if (saldo < 0) {
    div.style.color = "red";
  } else {
    div.style.color = "green";
  };

  return {
    saldo,
    saldoAnterior,
  };
};

const dialogEditar = document.getElementById("modalDialogEditar");
const formEditar = document.getElementById("formEditarTransacao");
const tipoEditar = formEditar.querySelector("#tipo");
const categoriasEditar = formEditar.querySelector("#categorias");
const botaoExcluir = document.getElementById("excluirTransacao");

tipoEditar.addEventListener("change", () => {
  if (tipoEditar.value === "despesa") {
    categoriasEditar.style.display = "block";
  } else {
    categoriasEditar.style.display = "none";
  };
});

let idTransacaoEditando = null;

function abrirModalEditar(id) {
  let transacao = null;

  for (let i = 0; i < transacoes.length; i++) {
    if (transacoes[i].id == id) {
      transacao = transacoes[i];
      break;
    };
  };

  if (!transacao) return;

  idTransacaoEditando = id;

  formEditar.querySelector("#tipo").value = transacao.tipo;
  formEditar.querySelector("#valor").value = transacao.valor;
  formEditar.querySelector("#data").value = transacao.data;
  formEditar.querySelector("#descricao").value = transacao.descricao;
  formEditar.querySelector("#categorias").value = transacao.categoriaId;

  dialogEditar.showModal();
};

formEditar.addEventListener("submit", (event) => {
  event.preventDefault();

  const transacao = transacoes.find((t) => t.id == idTransacaoEditando);

  if (!transacao) return;

  transacao.tipo = formEditar.querySelector("#tipo").value;
  transacao.valor = Number(formEditar.querySelector("#valor").value);
  transacao.data = formEditar.querySelector("#data").value;
  transacao.descricao = formEditar.querySelector("#descricao").value;
  transacao.categoriaId = formEditar.querySelector("#categorias").value;

  console.log("Transação editada con sucesso!");
  alert("Transação editada con sucesso!");

  recalcularSaldo();
  atualizarLista();
  salvarLocalStorage();

  dialogEditar.close();
});

botaoExcluir.addEventListener("click", (event) => {
  event.preventDefault();

  const confirmarExclusao = confirm(
    "Tem certeza que deseja excluir esta transação?",
  );

  if (!confirmarExclusao) {
    return;
  };

  for (let i = 0; i < transacoes.length; i++) {
    if (transacoes[i].id == idTransacaoEditando) {
      transacoes.splice(i, 1);
      break;
    };
    
  };

  console.log("Transação excluída com sucesso!");
  alert("Transação excluída com sucesso!");

  recalcularSaldo();
  atualizarLista();
  salvarLocalStorage();

  dialogEditar.close();
});

function atualizarLista() {
  const lista = document.getElementById("listaTransacoes");

  lista.innerHTML = "";

  transacoes.forEach((t) => {
    adicionarTransacaoNaLista(t);
  });
};

function recalcularSaldo() {
  saldo = 0;

  for (let i = 0; i < transacoes.length; i++) {
    if (transacoes[i].tipo === "receita") {
      saldo += transacoes[i].valor;
    } else {
      saldo -= transacoes[i].valor;
    }
  };

  atualizarSaldo(saldo);
};

function salvarLocalStorage() {
  localStorage.setItem("transacoes", JSON.stringify(transacoes));
};

function carregarLocalStorage() {
  const dados = localStorage.getItem("transacoes");

  if (!dados) return;

  const transacoesSalvas = JSON.parse(dados);

  transacoesSalvas.forEach((t) => {
    transacoes.push(t);
  });

  atualizarLista();
  recalcularSaldo();
};
