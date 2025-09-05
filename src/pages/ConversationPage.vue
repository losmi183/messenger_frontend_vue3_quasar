<template>
  <q-page class="chat-page">
    <FullScreenLoader :show="loading" />

    <!-- Header -->
    <div class="chat-header q-pa-md">
      <div class="text-h6">Conversation with: {{ friendName }}</div>
    </div>

    <!-- Chat prozor sa fiksnom visinom -->
    <div ref="chatWindow" class="chat-window q-pa-sm">
      <div
        v-for="msg in messages"
        :key="msg.id || msg.tempId"
        class="q-mb-md"
        :class="[
          msg.sender_id === userId ? 'sent' : 'received',
          msg.status === 'pending' ? 'pending' : '',
        ]"
      >
        <div class="text-caption text-grey">
          <strong>{{
            msg.sender_id === userId ? "You" : msg.sender_name
          }}</strong>
          <span v-if="msg.status === 'pending'">• Pending</span>
          <span v-else>• {{ formatDate(msg.created_at) }}</span>
        </div>
        <div class="message-bubble">{{ msg.message }}</div>
      </div>
    </div>

    <!-- Input fiksiran na dnu -->
    <div class="chat-input q-pa-md">
      <div class="row items-center">
        <q-input
          v-model="newMessage"
          outlined
          dense
          class="col-grow q-mr-sm"
          placeholder="Type a message..."
          @keyup.enter="sendMessage"
        />
        <q-btn color="primary" icon="send" round dense @click="sendMessage" />
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { useRoute } from "vue-router";
import { ref, onMounted, watch, onUnmounted, nextTick, computed } from "vue";
import { api } from "boot/axios";
import FullScreenLoader from "components/FullScreenLoader.vue";
import { useAuthStore } from "stores/auth";
import { useConversationStore } from "stores/conversations";

const route = useRoute();
const friendId = ref(route.params.friendId);
const friendName = ref(route.params.friendName);
const chatWindow = ref(null);
const newMessage = ref("");
const loading = ref(false);

const authStore = useAuthStore();
const conversationStore = useConversationStore();
const userId = computed(() => authStore.getUser?.id);
const token = computed(() => authStore.token);

let pusher = null;
let channel = null;

// Funkcija za skrolovanje dole
function scrollToBottom() {
  nextTick(() => {
    if (chatWindow.value) {
      chatWindow.value.scrollTop = chatWindow.value.scrollHeight;
    }
  });
}

// slanje poruke
function sendMessage() {
  const content = newMessage.value.trim();
  if (!content) return;

  newMessage.value = "";
  scrollToBottom();

  conversationStore
    .sendMessage(friendId.value, content, authStore.getUser)
    .then(() => {});
}

onMounted(() => {
  conversationStore.fetchConversations(friendId.value);
  conversationStore.setActiveConversation(friendId.value);
  conversationStore.friendMessagesSeen(friendId.value);
});

const messages = computed(() =>
  conversationStore.getConversation(friendId.value)
);

onUnmounted(() => {
  if (channel) channel.unsubscribe();
  if (pusher) pusher.disconnect();
});

watch(
  () => route.params.friendId,
  (newId) => {
    friendId.value = newId;
    friendName.value = route.params.friendName;
    conversationStore.fetchConversations(newId);

    conversationStore.setActiveConversation(newId);
    conversationStore.friendMessagesSeen(friendId.value);
  }
);
watch(
  () => messages.value.length,
  () => {
    scrollToBottom();
  }
);

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", {
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}
</script>

<style scoped>
.chat-page {
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.chat-header {
  flex-shrink: 0;
  border-bottom: 1px solid #e0e0e0;
}

.chat-window {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  display: flex;
  flex-direction: column;
}

.chat-input {
  flex-shrink: 0;
  border-top: 1px solid #e0e0e0;
  background: white;
}

.sent {
  align-self: flex-end;
  max-width: 70%;
  text-align: right;
}

.received {
  align-self: flex-start;
  max-width: 70%;
  text-align: left;
}

.message-bubble {
  padding: 8px 12px;
  border-radius: 12px;
  margin-top: 4px;
  display: inline-block;
  word-break: break-word;
}

.sent .message-bubble {
  background: linear-gradient(135deg, #42a5f5, #1e88e5);
  color: white;
}

.received .message-bubble {
  background: #f1f1f1;
  color: #333;
}
.pending .message-bubble {
  background: #cfd8dc; /* bleda boja */
  color: #555;
  font-style: italic;
}
</style>
