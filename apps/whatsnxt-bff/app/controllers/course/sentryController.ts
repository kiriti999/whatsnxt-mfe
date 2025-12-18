const sentryController = {
  handler: async (req, res) => {
    throw new Error("Sentry test error");
  },
};

export default sentryController;
