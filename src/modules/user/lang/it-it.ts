import { IUserTranslation } from "../types/IUserTranslation";

const itIt: IUserTranslation = {
  shared: {
    error: {
      invalidFields: "Campi non validi",
      requiredFields: "Campi obbligatori non compilati",
      tokenExpired: "Token scaduto",
      tokenNotFound: "Token non trovato",
      internalServerError: "Errore interno del server",
      noMessageSpecified: "Nessun messaggio specificato",
    },
  },
  user: {
    createUser: {
      created: "Utente creato con successo!",
      error: "Errore durante la creazione dell'utente",
      emailAlreadyRegistered: "Email già registrata",
    },
    findUser: {
      notFound: "Utente non trovato",
      found: "Utente trovato",
    },
    deleteUser: {
      deleted: "Utente eliminato con successo",
      notFound: "Utente non trovato",
      error: "Errore durante l'eliminazione dell'utente",
    },
    updateUserEmail: {
      notFound: "Utente non trovato",
      emailAlreadyRegistered: "Email già registrata",
      error: "Errore durante l'aggiornamento dell'email dell'utente",
      updated: "Email dell'utente aggiornata con successo",
    },
    listUsers: {
      success: "Utenti recuperati con successo",
      error: "Errore durante il recupero degli utenti",
    },
  },
};

export default itIt;
