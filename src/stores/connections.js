import { defineStore } from "pinia";
import { fetchMyConnections } from "../services/connections";
import { api } from "boot/axios";

export const useConnectionsStore = defineStore("connections", {
  state: () => ({
    friends: [],
    receivedRequests: [],
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

    loadReceivedRequests() {
      return api
        .get("/connection/requested")
        .then((response) => {
          this.receivedRequests = response.data.map((request) => ({
            ...request,
            acceptLoading: false,
            rejectLoading: false,
          }));
          return response.data;
        })
        .catch((error) => {
          console.error("Error loading received requests:", error);
          throw error;
        });
    },

    resetNewMessages(friendId) {
      const friend = this.friends.find((f) => f.id === parseInt(friendId));
      if (friend) {
        friend.new_messages = 0;
      }
    },

    sendFriendRequest(userId) {
      return api
        .post("/connection/initiate", { recipient_id: userId })
        .then((response) => {
          return response.data;
        })
        .catch((error) => {
          console.error("Error sending friend request:", error);
          throw error;
        });
    },

    acceptRequest(connectionId) {
      const request = this.receivedRequests.find(
        (r) => r.connection_id === connectionId
      );
      if (request) {
        request.acceptLoading = true;
      }

      return api
        .post("/connection/accept", { connection_id: connectionId })
        .then((response) => {
          // Ukloni iz receivedRequests
          this.receivedRequests = this.receivedRequests.filter(
            (r) => r.connection_id !== connectionId
          );

          // Refresh friends list
          this.loadConnections();

          return response.data;
        })
        .catch((error) => {
          console.error("Error accepting request:", error);
          throw error;
        })
        .finally(() => {
          if (request) {
            request.acceptLoading = false;
          }
        });
    },

    rejectRequest(connectionId) {
      const request = this.receivedRequests.find(
        (r) => r.connection_id === connectionId
      );
      if (request) {
        request.rejectLoading = true;
      }

      return api
        .post("/connection/reject", { connection_id: connectionId })
        .then((response) => {
          // Ukloni iz receivedRequests
          this.receivedRequests = this.receivedRequests.filter(
            (r) => r.connection_id !== connectionId
          );

          return response.data;
        })
        .catch((error) => {
          console.error("Error rejecting request:", error);
          throw error;
        })
        .finally(() => {
          if (request) {
            request.rejectLoading = false;
          }
        });
    },
  },
});
