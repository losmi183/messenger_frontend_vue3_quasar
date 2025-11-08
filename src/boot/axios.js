import { boot } from "quasar/wrappers";
import axios from "axios";
import { useAuthStore } from "stores/auth";

// const api = axios.create({ baseURL: "http://messenger.test/api" });
const api = axios.create({ baseURL: import.meta.env.VITE_API_URL + "/api" });

api.interceptors.request.use(
  (config) => {
    const authStore = useAuthStore();
    const token = authStore.token;

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export { api };

export default boot(({ app }) => {
  app.config.globalProperties.$axios = axios;
  app.config.globalProperties.$api = api;
});
