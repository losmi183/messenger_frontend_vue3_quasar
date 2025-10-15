// stores/conversations.js
import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { api } from "../boot/axios";
import { useConnectionsStore } from "./connections";

export const useConversationsStore = defineStore("conversations", () => {
  // State
  const conversations = ref({});

  // Getters
  const getMessagesForUser = computed(() => {
    return (userId) => {
      return conversations.value[userId] || [];
    };
  });

  const getUnreadCount = computed(() => {
    return (userId) => {
      const messages = conversations.value[userId] || [];
      return messages.filter(
        (msg) => !msg.isRead && msg.sender_id !== getCurrentUserId()
      ).length;
    };
  });

  const getAllConversations = computed(() => {
    return Object.keys(conversations.value).map((userId) => ({
      userId,
      messages: conversations.value[userId],
      lastMessage: conversations.value[userId]?.slice(-1)[0] || null,
    }));
  });

  // Helper function
  function getCurrentUserId() {
    return window._currentUserId || null;
  }

  // Actions
  function setMessagesForUser(userId, messages) {
    conversations.value[userId] = [...messages];
  }

  function addMessageToUser(userId, message) {
    if (!conversations.value[userId]) {
      conversations.value[userId] = [];
    }

    const exists = conversations.value[userId].find(
      (msg) => msg.id === message.id
    );
    if (!exists) {
      conversations.value[userId].push(message);
    }
  }

  function markUserMessagesAsRead(userId, currentUserId) {
    if (conversations.value[userId]) {
      conversations.value[userId] = conversations.value[userId].map((msg) => ({
        ...msg,
        isRead: msg.sender_id !== currentUserId ? true : msg.isRead,
      }));
    }
  }

  function markConversationAsSeen(friendId, currentUserId) {
    return api
      .post("/message/mark-as-seen", {
        friend_id: friendId,
      })
      .then(() => {
        markUserMessagesAsRead(friendId, currentUserId);
        const connectionsStore = useConnectionsStore();
        connectionsStore.resetNewMessages(friendId);
      })
      .catch((err) => {
        console.error("Greška pri označavanju poruka:", err);
        throw err;
      });
  }

  function removeConversation(userId) {
    delete conversations.value[userId];
  }

  function clearAllConversations() {
    conversations.value = {};
  }

  return {
    // State
    conversations,

    // Getters
    getMessagesForUser,
    getUnreadCount,
    getAllConversations,

    // Actions
    setMessagesForUser,
    addMessageToUser,
    markUserMessagesAsRead,
    markConversationAsSeen,
    removeConversation,
    clearAllConversations,
  };
});
