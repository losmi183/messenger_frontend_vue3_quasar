// stores/conversations.js
import { defineStore } from "pinia";
import { ref, computed } from "vue";

export const useConversationsStore = defineStore("conversations", () => {
  // State - organizuje poruke po user ID-u
  const conversations = ref({});

  // Getters
  const getMessagesForUser = computed(() => {
    return (userId) => {
      return conversations.value[userId] || [];
    };
  });

  const getUnreadCount = computed(() => {
    return (userId) => {
      // Broji poruke koje nisu od trenutnog korisnika i nisu označene kao pročitane
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

  // Helper function - treba da se proslijedi iz auth store-a
  function getCurrentUserId() {
    // Ovo će biti prosliješeno iz komponente
    return window._currentUserId || null;
  }

  // Actions
  function setMessagesForUser(userId, messages) {
    // Postavlja sve poruke za korisnika (koristi se za učitavanje sa API-ja)
    conversations.value[userId] = [...messages];
  }

  function addMessageToUser(userId, message) {
    // Dodaje jednu poruku za korisnika
    if (!conversations.value[userId]) {
      conversations.value[userId] = [];
    }

    // Provjeri da poruka već ne postoji (da izbegne duplikate)
    const exists = conversations.value[userId].find(
      (msg) => msg.id === message.id
    );
    if (!exists) {
      conversations.value[userId].push(message);
    }
  }

  function markUserMessagesAsRead(userId, currentUserId) {
    // Označava sve poruke od datog korisnika kao pročitane
    if (conversations.value[userId]) {
      conversations.value[userId] = conversations.value[userId].map((msg) => ({
        ...msg,
        isRead: msg.sender_id !== currentUserId ? true : msg.isRead,
      }));
    }
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
    removeConversation,
    clearAllConversations,
  };
});
