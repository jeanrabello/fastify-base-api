import { IUserTranslation } from "../types/IUserTranslation";

const esEs: IUserTranslation = {
  shared: {
    error: {
      invalidFields: "Campos inválidos",
      requiredFields: "Campos obligatorios no rellenados",
      tokenExpired: "Token expirado",
      tokenNotFound: "Token no encontrado",
      internalServerError: "Error interno del servidor",
      noMessageSpecified: "No se especificó ningún mensaje",
      invalidToken: "Token inválido",
      authorizationRequired: "Autorización requerida",
      invalidAuthorizationFormat: "Formato de autorización inválido",
      accessForbidden: "Acceso prohibido",
      tooManyRequests: "Demasiadas solicitudes, espere un momento por favor",
    },
  },
  user: {
    createUser: {
      created: "¡Usuario creado exitosamente!",
      error: "Error al crear usuario",
      emailAlreadyRegistered: "Correo electrónico ya registrado",
      usernameAlreadyRegistered: "Nombre de usuario ya registrado",
    },
    findUser: {
      notFound: "Usuario no encontrado",
      found: "Usuario encontrado",
    },
    deleteUser: {
      deleted: "Usuario eliminado exitosamente",
      notFound: "Usuario no encontrado",
      error: "Error al eliminar usuario",
    },
    updateUserEmail: {
      notFound: "Usuario no encontrado",
      emailAlreadyRegistered: "Correo electrónico ya registrado",
      error: "Error al actualizar el correo electrónico del usuario",
      updated: "Correo electrónico del usuario actualizado exitosamente",
    },
    listUsers: {
      success: "Usuarios recuperados exitosamente",
      error: "Error al recuperar usuarios",
    },
  },
};

export default esEs;
