import { Translation } from "../types/lang";

const ptBr: Translation = {
  commom: {
    error: {
      requiredFields: "Campos obrigatórios não preenchidos",
    },
  },
  user: {
    createUser: {
      success: "Usuário criado com sucesso!",
      error: "Erro ao criar usuário",
    },
    findUser: {
      notFound: "Usuário não encontrado",
    },
  },
};

module.exports = ptBr;
