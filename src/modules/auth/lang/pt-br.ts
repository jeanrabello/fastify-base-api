import { IAuthTranslation } from "../types/IAuthTranslation";

const ptBr: IAuthTranslation = {
  shared: {
    error: {
      invalidFields: "Campos inválidos",
      requiredFields: "Campos obrigatórios não preenchidos",
      tokenExpired: "Token expirado",
      tokenNotFound: "Token não encontrado",
      internalServerError: "Erro interno do servidor",
      noMessageSpecified: "Mensagem não especificada",
      invalidToken: "Token inválido",
      authorizationRequired: "Autorização obrigatória",
      invalidAuthorizationFormat: "Formato de autorização inválido",
      accessForbidden: "Acesso proibido",
      tooManyRequests: "Muitas requisições, aguarde um momento por favor",
    },
  },
  auth: {
    login: {
      success: "Login realizado com sucesso",
      invalidCredentials: "Credenciais inválidas",
      userNotFound: "Usuário não encontrado",
      error: "Erro ao realizar login",
    },
    validateToken: {
      success: "Token válido",
      invalidToken: "Token inválido",
      expiredToken: "Token expirado",
      error: "Erro ao validar token",
    },
    refreshToken: {
      success: "Token atualizado com sucesso",
      invalidToken: "Token de refresh inválido",
      error: "Erro ao atualizar token",
    },
  },
};

export default ptBr;
