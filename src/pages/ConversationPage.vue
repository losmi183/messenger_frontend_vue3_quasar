<template>
  <q-page class="q-pa-md">
    <FullScreenLoader :show="loading" />

    <div class="text-h6 q-mb-md">Conversation with: {{ friendName }}</div>

    <div ref="chatWindow" class="chat-window q-pa-sm column scroll">
      <div
        v-for="msg in messages"
        :key="msg.id"
        class="q-mb-md"
        :class="msg.sender_id === userId ? 'sent' : 'received'"
      >
        <!-- Header: ko i vreme -->
        <div class="text-caption text-grey">
          <strong>{{
            msg.sender_id === userId ? "You" : msg.sender_name
          }}</strong>
          •
          {{ formatDate(msg.created_at) }}
        </div>

        <!-- Sadržaj poruke -->
        <div class="message-bubble">
          {{ msg.message }}
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { useRoute } from "vue-router";
import { ref, onMounted, watch, onUnmounted, nextTick, computed } from "vue";
import { api } from "boot/axios";
import FullScreenLoader from "components/FullScreenLoader.vue";
import { useAuthStore } from "stores/auth"; // Pinia store

const route = useRoute();
const friendId = ref(route.params.friendId);
const friendName = ref(route.params.friendName);
const messages = ref([]);
const chatWindow = ref(null);

const authStore = useAuthStore(); // Pinia store instanca

const userId = computed(() => authStore.getUser?.id);
const token = computed(() => authStore.token);
const loading = ref(false);

let pusher = null;
let channel = null;

function loadMessages() {
  loading.value = true;
  api
    .get(`/message/conversation/${friendId.value}`)
    .then((res) => {
      messages.value = res.data;
      scrollToBottom();
    })
    .catch((err) => {
      console.error("Greška prilikom učitavanja poruka:", err);
    })
    .finally(() => {
      loading.value = false;
    });
}

function initPusher() {
  pusher = new window.Pusher(import.meta.env.VITE_PUSHER_KEY, {
    cluster: import.meta.env.VITE_PUSHER_CLUSTER,
    authEndpoint: `${import.meta.env.VITE_API_URL}/api/pusher/auth`,
    auth: {
      headers: {
        Authorization: `Bearer ${token.value}`,
      },
    },
  });

  channel = pusher.subscribe(`private-user-${userId.value}`);

  channel.bind("message.sent", (data) => {
    console.log("Nova poruka stigla:", data);

    // Dodaj na kraj liste
    messages.value.push({
      id: Date.now(),
      ...data,
    });

    scrollToBottom();
  });
}

function scrollToBottom() {
  nextTick(() => {
    if (chatWindow.value) {
      chatWindow.value.scrollTop = chatWindow.value.scrollHeight;
    }
  });
}

onMounted(() => {
  loadMessages();

  if (!window.Pusher) {
    const script = document.createElement("script");
    script.src = "https://js.pusher.com/8.4.0/pusher.min.js";
    script.onload = () => initPusher();
    document.head.appendChild(script);
  } else {
    initPusher();
  }
});

onUnmounted(() => {
  if (channel) channel.unsubscribe();
  if (pusher) pusher.disconnect();
});

watch(
  () => route.params.friendId,
  (newId) => {
    friendId.value = newId;
    friendName.value = route.params.friendName;
    loadMessages();
  }
);

// Format datuma
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
.chat-window {
  flex: 1;
  overflow-y: auto;
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
</style>
