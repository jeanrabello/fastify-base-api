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
    };
    findUser: {
      notFound: string;
    };
  };
};
