import { Translation } from "@src/shared/types/lang";

export interface IUserTranslation extends Translation {
  user: {
    createUser: {
      created: string;
      error: string;
      emailAlreadyRegistered: string;
    };
    findUser: {
      notFound: string;
      found: string;
    };
    deleteUser: {
      deleted: string;
      notFound: string;
      error: string;
    };
    updateUserEmail: {
      notFound: string;
      emailAlreadyRegistered: string;
      error: string;
      updated: string;
    };
  };
}
