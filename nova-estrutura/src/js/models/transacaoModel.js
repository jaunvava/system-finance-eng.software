import { TIPOS_TRANSACAO, MENSAGENS_ERRO } from "../contants";
import { CatgoriaModel } from './CategoriaModel.js';
import { Storage } from './Storage.js';

export class Transacao {

    constructor ({ id = null, tipo, valor, data, categoriaId, descricao = '' }) {
        id = id || gerarId();
        tipo = tipo;
        valor = Number(valor);
        data = data;
        categoriaId = categoriaId;
        descricao = descricao || "";
    }


    gerarId() {
        return Math.floor(Math.random() * 101);
    }

}

