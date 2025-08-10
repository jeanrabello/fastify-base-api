import { IUserTranslation } from "../types/IUserTranslation";

const ptBr: IUserTranslation = {
  shared: {
    error: {
      invalidFields: "Campos inválidos",
      requiredFields: "Campos obrigatórios não preenchidos",
      tokenExpired: "Token expirado",
      tokenNotFound: "Token não encontrado",
      internalServerError: "Erro interno do servidor",
      noMessageSpecified: "Mensagem não especificada",
    },
  },
  user: {
    createUser: {
      created: "Usuário criado com sucesso!",
      error: "Erro ao criar usuário",
      emailAlreadyRegistered: "E-mail já cadastrado",
    },
    findUser: {
      notFound: "Usuário não encontrado",
      found: "Usuário encontrado",
    },
    deleteUser: {
      deleted: "Usuário deletado com sucesso!",
      notFound: "Usuário nao encontrado",
      error: "Erro ao deletar usuário",
    },
    updateUserEmail: {
      notFound: "Usuário nao encontrado",
      emailAlreadyRegistered: "E-mail já cadastrado",
      error: "Erro ao atualizar e-mail",
      updated: "E-mail atualizado com sucesso",
    },
  },
};

export default ptBr;
