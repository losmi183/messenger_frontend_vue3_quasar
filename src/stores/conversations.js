// stores/conversations.js
import { defineStore } from "pinia";
import { ref, computed } from "vue";

export const useConversationsStore = defineStore("conversations", () => {
  // State
  const conversations = ref({});

  // Getters
  const getConversation = computed(() => {
    return (userId) => {
      return (
        conversations.value[userId] || {
          messages: [],
          unreadCount: 0,
          lastMessageAt: null,
          participant: null,
        }
      );
    };
  });

  const getMessagesForUser = computed(() => {
    return (userId) => {
      return conversations.value[userId]?.messages || [];
    };
  });

  const getUnreadCount = computed(() => {
    return (userId) => {
      return conversations.value[userId]?.unreadCount || 0;
    };
  });

  const getAllConversations = computed(() => {
    return Object.entries(conversations.value).map(
      ([userId, conversation]) => ({
        userId,
        ...conversation,
      })
    );
  });

  // Actions
  function initializeConversation(userId, participant = null) {
    if (!conversations.value[userId]) {
      conversations.value[userId] = {
        messages: [],
        unreadCount: 0,
        lastMessageAt: null,
        participant: participant,
      };
    }
  }

  function addMessage(userId, message) {
    // Ensure conversation exists
    initializeConversation(userId);

    // Create message with required fields
    const newMessage = {
      id: message.id || Date.now(),
      content: message.content,
      timestamp: message.timestamp || new Date().toISOString(),
      fromMe: message.fromMe || false,
      fromUser: message.fromUser || null,
      ...message, // spread any additional properties
    };

    // Add message to conversation
    conversations.value[userId].messages.push(newMessage);
    conversations.value[userId].lastMessageAt = newMessage.timestamp;

    // Increment unread count if message is not from current user
    if (!newMessage.fromMe) {
      conversations.value[userId].unreadCount++;
    }
  }

  function markAsRead(userId) {
    if (conversations.value[userId]) {
      conversations.value[userId].unreadCount = 0;
    }
  }

  function sendMessage(userId, content) {
    const message = {
      content,
      fromMe: true,
      timestamp: new Date().toISOString(),
    };

    addMessage(userId, message);

    // Here you would typically also send to your backend/pusher
    // Example:
    // window.Echo.private(`private-channel-${userId}`)
    //   .whisper('new-message', message)

    return message;
  }

  function clearConversation(userId) {
    if (conversations.value[userId]) {
      conversations.value[userId].messages = [];
      conversations.value[userId].unreadCount = 0;
    }
  }

  function removeConversation(userId) {
    delete conversations.value[userId];
  }

  function updateParticipant(userId, participant) {
    initializeConversation(userId);
    conversations.value[userId].participant = participant;
  }

  // Utility function for handling Pusher messages
  function handlePusherMessage(userId, messageData) {
    const message = {
      ...messageData,
      fromMe: false,
    };
    addMessage(userId, message);
  }

  return {
    // State
    conversations,

    // Getters
    getConversation,
    getMessagesForUser,
    getUnreadCount,
    getAllConversations,

    // Actions
    initializeConversation,
    addMessage,
    markAsRead,
    sendMessage,
    clearConversation,
    removeConversation,
    updateParticipant,
    handlePusherMessage,
  };
});
