import { defineStore } from "pinia";
import { fetchMyConnections } from "../services/connections";

export const useConnectionsStore = defineStore("connections", {
  state: () => ({
    friends: [],
    loading: false,
  }),

  actions: {
    loadConnections() {
      this.loading = true;
      fetchMyConnections()
        .then((data) => {
          this.friends = data;
        })
        .catch((err) => {
          console.error("Failed to load connections:", err);
        })
        .finally(() => {
          this.loading = false;
        });
    },
  },
});
