// stores/conversations.js
import { defineStore } from "pinia";
import { api } from "boot/axios";
import { useAuthStore } from "stores/auth";
import { watch } from "vue";

export const useConversationStore = defineStore("conversations", {
  state: () => ({
    conversations: {},
    pusher: null,
    channel: null,
  }),

  getters: {
    getConversation: (state) => {
      return (friendId) => state.conversations[friendId] || [];
    },
  },

  actions: {
    sendMessage(friendId, content, user) {
      const tempId = Date.now(); // privremeni id

      // 1️⃣ Dodaj odmah u store sa statusom "pending"
      this.addMessage(friendId, {
        tempId,
        id: null,
        sender_id: user.id,
        sender_name: user.name,
        message: content,
        status: "pending",
        created_at: new Date().toISOString(),
      });

      // 2️⃣ API poziv (VAŽNO ➝ return dodato)
      return api
        .post("/message/send", {
          recipient_id: friendId,
          content,
        })
        .then((res) => {
          this.updateMessage(friendId, tempId, {
            id: res.data.id,
            status: "sent",
            created_at: res.data.created_at,
          });
          return res.data; // vrati response da može da se koristi u komponenti
        })
        .catch((err) => {
          this.updateMessage(friendId, tempId, { status: "error" });
          console.error(err);
          throw err; // propagira grešku
        });
    },

    addMessage(friendId, message) {
      if (!this.conversations[friendId]) {
        this.conversations[friendId] = [];
      }
      this.conversations[friendId].push(message);
    },

    updateMessage(friendId, tempId, newData) {
      const conversation = this.conversations[friendId];
      if (!conversation) return;

      const msg = conversation.find((m) => m.tempId === tempId);
      if (msg) {
        Object.assign(msg, newData);
      }
    },

    async fetchConversations(friendId) {
      try {
        const res = await api.get(`/message/conversation/${friendId}`);
        this.conversations[friendId] = res.data;
      } catch (err) {
        console.error("Greška pri fetch-u konverzacije:", err);
      }
    },

    initPusher(userId, token) {
      if (this.pusher || !userId || !token) return;

      const startPusher = () => {
        const base = api.defaults.baseURL || "";
        const authEndpoint = `${base}/pusher/auth`;

        this.pusher = new window.Pusher(import.meta.env.VITE_PUSHER_KEY, {
          cluster: import.meta.env.VITE_PUSHER_CLUSTER,
          authEndpoint,
          auth: {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        });

        this.channel = this.pusher.subscribe(`private-user-${userId}`);
        this.channel.bind("message.sent", (data) => {
          const friendId = data.from.id;
          this.addMessage(friendId, {
            id: data.id || Date.now(),
            sender_id: data.from.id,
            sender_name: data.from.name,
            message: data.message,
            created_at: data.created_at || new Date().toISOString(),
          });
        });
      };

      // ako Pusher još nije učitan → učitaj ga
      if (!window.Pusher) {
        const script = document.createElement("script");
        script.src = "https://js.pusher.com/8.4.0/pusher.min.js";
        script.onload = startPusher;
        document.head.appendChild(script);
      } else {
        startPusher();
      }
    },

    resetStore() {
      // Disconnect Pusher
      if (this.pusher) {
        this.pusher.disconnect();
        this.pusher = null;
        this.channel = null;
      }

      // Reset all states
      this.$reset(); // <-- obavezno zagrade!
    },
  },
});

// 🔹 Auto-init Pusher kad se user/token pojave
const authStore = useAuthStore();
const conversationStore = useConversationStore();

watch(
  () => [authStore.getUser, authStore.token],
  ([user, token]) => {
    if (user && token) {
      conversationStore.initPusher(user.id, token);
    }
  },
  { immediate: true }
);
