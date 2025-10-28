<template>
  <q-page class="chat-page">
    <FullScreenLoader :show="loading" />

    <!-- Header -->
    <div class="chat-header q-pa-md row items-center justify-between">
      <div class="text-h6">
        Conversation with: {{ friendName }}
        <span class="text-caption text-grey"> (salt: {{ salt }})</span>
      </div>

      <div class="row items-center">
        <q-input
          v-model="passphrase"
          :type="isLocked ? 'password' : 'text'"
          :disable="isLocked"
          label="Conversation password"
          dense
          outlined
          class="q-mr-sm"
          style="width: 220px"
        />

        <q-btn
          :label="isLocked ? 'Change conversation password' : 'OK'"
          :color="isLocked ? 'negative' : 'primary'"
          @click="passphraseEntered"
        />
      </div>
    </div>

    <!-- Chat prozor sa fiksnom visinom -->
    <div ref="chatWindow" class="chat-window q-pa-sm">
      <div
        v-for="msg in displayMessages"
        :key="msg.id"
        class="q-mb-md"
        :class="msg.sender_id === userId ? 'sent' : 'received'"
      >
        <div class="text-caption text-grey">
          <strong>{{
            msg.sender_id === userId ? "You" : msg.sender_name
          }}</strong>
          •
          {{ formatDate(msg.created_at) }}
        </div>
        <div class="message-bubble">
          {{ msg.message }}
        </div>
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
          :disable="sending"
          @keyup.enter="sendMessage"
        />
        <q-btn
          color="primary"
          icon="send"
          round
          dense
          :disable="sending"
          @click="sendMessage"
        />
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
import { useConversationsStore } from "stores/conversations";
import CryptoJS from "crypto-js";
import { encrypt, decrypt } from "src/utils/crypto";

const route = useRoute();
const friendId = ref(route.params.friendId);
const friendName = ref(route.params.friendName);
const salt = ref(null);
const passphrase = ref(null);
const messages = ref([]);
const chatWindow = ref(null);
const newMessage = ref("");
const loading = ref(false);
const sending = ref(false);
const isLocked = ref(false);
const displayMessages = ref([]);

const authStore = useAuthStore();
const conversations = useConversationsStore();
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

// učitavanje prethodnih poruka
async function loadMessages() {
  loading.value = true;
  try {
    const res = await api.get(`/message/conversation/${friendId.value}`);
    messages.value = res.data.messages;
    salt.value = res.data.salt;
    scrollToBottom();
  } catch (err) {
    console.error("Greška prilikom učitavanja poruka:", err);
  } finally {
    loading.value = false;
  }
}

function passphraseEntered() {
  if (!isLocked.value) {
    // Kliknuto "OK" — zaključavamo input i dešifrujemo poruke
    isLocked.value = true;
    try {
      displayMessages.value = messages.value.map((msg) => {
        const plainText = decrypt(msg.message, passphrase.value, salt.value);
        return {
          ...msg,
          message: plainText || "[Nevažeća lozinka]",
        };
      });
    } catch (e) {
      displayMessages.value = messages.value.map((msg) => ({
        ...msg,
        message: "[Greška pri dekripciji]",
      }));
    }
  } else {
    // Kliknuto "Change password"
    isLocked.value = false;
    passphrase.value = "";
    displayMessages.value = []; // brišemo prikaz dok se ne unese nova lozinka
  }
}

// slanje poruke
function sendMessage() {
  const rawText = newMessage.value.trim();

  const content = encrypt(rawText, passphrase.value, salt.value);

  if (!content || sending.value) return;

  sending.value = true;

  api
    .post("/message/send", {
      recipient_id: friendId.value,
      content: content,
    })
    .then((res) => {
      const date = new Date().toISOString();
      messages.value.push({
        id: res.data.id || Date.now(),
        sender_id: userId.value,
        sender_name: authStore.getUser.name,
        message: content,
        created_at: res.data.created_at || date,
      });
      displayMessages.value.push({
        id: res.data.id || Date.now(),
        sender_id: userId.value,
        sender_name: authStore.getUser.name,
        message: rawText,
        created_at: res.data.created_at || date,
      });
      newMessage.value = "";
      scrollToBottom();
    })
    .catch((err) => {
      console.error("Greška prilikom slanja poruke:", err);
    })
    .finally(() => {
      sending.value = false;
    });
}

// inicijalizacija Pusher-a
function initPusher() {
  if (!userId.value) return;

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
    const isFromCurrentFriend = data.from.id === parseInt(friendId.value);

    if (isFromCurrentFriend) {
      messages.value.push({
        id: Date.now(),
        ...data,
      });
    }

    const plainText = decrypt(data.message, passphrase.value, salt.value);
    displayMessages.value.push({
      id: Date.now(),
      sender_id: data.from.id,
      sender_name: data.from.name,
      message: plainText || "[Nevažeća lozinka]",
      created_at: data.created_at || new Date().toISOString(),
    });

    scrollToBottom();
  });
}

onMounted(async () => {
  if (!authStore.getUser && authStore.token) {
    await authStore.restoreSession();
  }

  await loadMessages();

  // Samo jedan poziv!
  conversations.markConversationAsSeen(friendId.value, userId.value);

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
  async (newId) => {
    friendId.value = newId;
    friendName.value = route.params.friendName;
    await loadMessages();

    conversations.markConversationAsSeen(newId, userId.value);
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
</style>
