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
      invalidToken: "Token inválido",
      authorizationRequired: "Autorização necessária",
      invalidAuthorizationFormat: "Formato de autorização inválido",
      accessForbidden: "Acesso proibido",
      tooManyRequests: "Muitas requisições, aguarde um momento por favor",
    },
  },
  user: {
    createUser: {
      created: "Usuário criado com sucesso!",
      error: "Erro ao criar usuário",
      emailAlreadyRegistered: "E-mail já cadastrado",
      usernameAlreadyRegistered: "Nome de usuário já cadastrado",
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
    listUsers: {
      success: "Lista de usuários obtida com sucesso",
      error: "Erro ao listar usuários",
    },
  },
};

export default ptBr;
