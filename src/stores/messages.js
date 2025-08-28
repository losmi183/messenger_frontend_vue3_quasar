// stores/messages.js
import { defineStore } from "pinia";
import axios from "axios";

export const useMessagesStore = defineStore("messages", {
  state: () => ({
    conversations: {}, // { friendId: [ {id, sender_id, receiver_id, message, created_at} ] }
  }),

  actions: {
    fetchConversation(friendId) {
      axios
        .get(`/api/messages/${friendId}`)
        .then((res) => {
          this.conversations[friendId] = res.data;
        })
        .catch((err) => {
          console.error("Greška prilikom učitavanja poruka:", err);
        });
    },

    addMessage(friendId, messageObj) {
      if (!this.conversations[friendId]) {
        this.conversations[friendId] = [];
      }
      this.conversations[friendId].push(messageObj);
    },
  },

  getters: {
    getConversation: (state) => (friendId) => {
      return state.conversations[friendId] || [];
    },
  },
});
