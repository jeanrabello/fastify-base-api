import { Translation } from "../types/lang";

const ptBr: Translation = {
  commom: {
    error: {
      requiredFields: "Campos obrigatórios não preenchidos",
      tokenExpired: "Token expirado",
      tokenNotFound: "Token não encontrado",
    },
  },
  user: {
    register: {
      create: {
        findUserByEmailOrUsernameError:
          "Nome de usuário ou e-mail já cadastrado",
      },
      active: {
        error: {
          findByCode: "Código de ativação inválido",
        },
      },
      email: {
        subject: "Bem-vindo à plataforma",
      },
    },
    createUser: {
      success: "Usuário criado com sucesso!",
      error: "Erro ao criar usuário",
      emailAlreadyRegistered: "E-mail já cadastrado",
    },
    findUser: {
      notFound: "Usuário não encontrado",
    },
  },
};

module.exports = ptBr;
