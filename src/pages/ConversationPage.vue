<template>
  <q-page class="q-pa-md">
    <FullScreenLoader :show="loading" />

    <div class="text-h6 q-mb-md">Conversation with: {{ friendName }}</div>

    <div class="chat-window q-pa-sm column scroll">
      <div
        v-for="msg in messages"
        :key="msg.id"
        class="q-mb-md"
        :class="msg.sender_id === userId ? 'sent' : 'receiver'"
      >
        <!-- Header ko i vreme -->
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
import { ref, onMounted, watch } from "vue";
import { incomingMessage, initPusher } from "../services/pusherService";
import axios from "axios";
import { api } from "boot/axios";
import FullScreenLoader from "components/FullScreenLoader.vue";

const route = useRoute();
const friendId = ref(route.params.friendId);
const friendName = ref(route.params.friendName);
const messages = ref([]);
const userId = 1; // kasnije setovati iz auth store-a
const token = "JWT-TOKEN"; // auth token

const loading = ref(false);

function loadMessages() {
  loading.value = true; // <<< ovo je obavezno
  api
    .get(`/message/conversation/${friendId.value}`)
    .then((res) => {
      messages.value = res.data;
    })
    .catch((err) => {
      console.error("Greška prilikom učitavanja poruka:", err);
    })
    .finally(() => {
      loading.value = false;
    });
}

onMounted(() => {
  loadMessages();
  initPusher(userId, token);
});

watch(
  () => route.params.friendId,
  (newId) => {
    friendId.value = newId;
    friendName.value = route.params.friendName;
    loadMessages();
  }
);

watch(incomingMessage, (msg) => {
  if (msg) {
    messages.value.push(msg);
  }
});

// Format datuma
function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", {
    weekday: "short", // Mon, Tue, Wed...
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
