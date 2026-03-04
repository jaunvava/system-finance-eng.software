
export const TIPOS_TRANSACAO = {
    RECEITA: 'receita',
    DESPESA: 'despesa'
};

export const CATEGORIAS_PADRAO = [
    { id : "1", tipo : "Alimentação", isPadrao : true },
    { id : "2", tipo : "Transporte", isPadrao : true },
    { id : "3", tipo : "Saúde", isPadrao : true },
    { id : "4", tipo : "Lazer", isPadrao : true },
    { id : "5", tipo : "Educação", isPadrao : true },
    { id : "6", tipo : "Outros", isPadrao : true },
];

export const MENSAGENS_ERRO = {
    VALOR_INVALIDO: "O valor deve ser maior que zero!",
    DATA_INVALIDA: "Digite uma data válida!",
    TIPO_INVALIDO: "Tipo inválido!",
    CATEGORIA_INVALIDA: "Categoria não encontrada",
    DESCRICAO_LONGA: "A  descrição deve conter no máximo 100 caracteres"
};
