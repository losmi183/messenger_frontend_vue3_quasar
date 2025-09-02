import { defineStore } from "pinia";
import { api } from "boot/axios";

export const useConversationStore = defineStore("conversations", {
  state: () => ({
    conversations: {},
  }),

  getters: {
    getConversation: (state) => {
      return (friendId) => state.conversations[friendId] || [];
    },
  },

  actions: {
    fetchConversations(friendId) {
      api
        .get(`/message/conversation/${friendId}`)
        .then((res) => {
          this.conversations[friendId] = res.data;
        })
        .catch((error) => {
          console.error("Greška pri fetch-u konverzacije:", error);
        });
    },
  },
});
