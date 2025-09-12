import { IUserTranslation } from "../types/IUserTranslation";

const frFr: IUserTranslation = {
  shared: {
    error: {
      invalidFields: "Champs invalides",
      requiredFields: "Champs obligatoires non remplis",
      tokenExpired: "Jeton expiré",
      tokenNotFound: "Jeton non trouvé",
      internalServerError: "Erreur interne du serveur",
      noMessageSpecified: "Aucun message spécifié",
      invalidToken: "Jeton invalide",
      authorizationRequired: "Autorisation requise",
      invalidAuthorizationFormat: "Format d'autorisation invalide",
      accessForbidden: "Accès refusé",
    },
  },
  user: {
    createUser: {
      created: "Utilisateur créé avec succès !",
      error: "Erreur lors de la création de l'utilisateur",
      emailAlreadyRegistered: "Email déjà enregistrée",
      usernameAlreadyRegistered: "Nom d'utilisateur déjà enregistré",
    },
    findUser: {
      notFound: "Utilisateur non trouvé",
      found: "Utilisateur trouvé",
    },
    deleteUser: {
      deleted: "Utilisateur supprimé avec succès",
      notFound: "Utilisateur non trouvé",
      error: "Erreur lors de la suppression de l'utilisateur",
    },
    updateUserEmail: {
      notFound: "Utilisateur non trouvé",
      emailAlreadyRegistered: "Email déjà enregistrée",
      error: "Erreur lors de la mise à jour de l'email de l'utilisateur",
      updated: "Email de l'utilisateur mise à jour avec succès",
    },
    listUsers: {
      success: "Utilisateurs récupérés avec succès",
      error: "Erreur lors de la récupération des utilisateurs",
    },
  },
};

export default frFr;
