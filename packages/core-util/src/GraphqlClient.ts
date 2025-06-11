import xior from 'xior';

const baseURL = process.env.NEXT_PUBLIC_GRAPHQL_URL;

const api: any = xior.create({
  baseURL,
  method: 'POST',
  withCredentials: true,
});


api.interceptors.request.use(async (config: any) => {
  if (typeof config.data?.query === 'function') {
    config.data.query = config.data.query();
  }

  return config;
});

export default api;
