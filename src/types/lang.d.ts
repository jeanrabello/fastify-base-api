export type Translation = {
  commom: {
    error: {
      requiredFields: string;
      tokenExpired: string;
      tokenNotFound: string;
    };
  };
  user: {
    register: {
      create: {
        findUserByEmailOrUsernameError: string;
      };
      active: {
        error: {
          findByCode: string;
        };
      };
      email: {
        subject: string;
      };
    };
    createUser: {
      success: string;
      error: string;
      emailAlreadyRegistered: string;
    };
    findUser: {
      notFound: string;
    };
  };
};
