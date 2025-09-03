import { defineStore } from "pinia";
import { api } from "boot/axios";

export const useAuthStore = defineStore("auth", {
  state: () => ({
    token: null,
    user: null,
  }),
  getters: {
    isAuthencated: (state) => !!state.token,
    getUser: (state) => state.user,
  },
  actions: {
    setToken(token) {
      this.token = token;
      localStorage.setItem("token", token);
    },
    async clearAuth() {
      // reset auth state
      this.$reset();
      localStorage.removeItem("token");

      // reset conversation store
      const { useConversationStore } = await import("./conversations");
      const conversationStore = useConversationStore();
      conversationStore.resetStore();

      // reset connection store
      const { useConnectionsStore } = await import("./connections");
      const connectionStore = useConnectionsStore();
      connectionStore.resetStore();
    },
    login(email, password) {
      return api.post("/auth/login", { email, password }).then((res) => {
        const token = res.data.token;
        this.setToken(token);

        // Odmah posle login pokupi user podatke
        return api
          .get("/auth/whoami", {
            headers: { Authorization: `Bearer ${token}` },
          })
          .then((whoami) => {
            this.user = whoami.data;
            return true;
          })
          .catch((err) => {
            this.clearAuth();
            throw err.response?.data?.message || "Login failed";
          });
      });
    },
    setUser(user) {
      this.user = user;
    },
    restoreSession() {
      // Ako već postoji promise, koristi ga (sprječava višestruke pozive)
      if (this.restorePromise) return this.restorePromise;

      const token = localStorage.getItem("token");

      if (token) {
        this.token = token;

        return api
          .get("/auth/whoami")
          .then((response) => {
            this.user = response.data;
          })
          .catch(() => {
            this.clearAuth();
          });
      }
    },
  },
});
