export type Translation = {
  commom: {
    error: {
      requiredFields: string;
    };
  };
  user: {
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
