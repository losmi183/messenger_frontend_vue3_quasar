<script setup>
import { useRoute } from "vue-router";
import { ref, onMounted, watch, onUnmounted } from "vue";
import {
  initPusher,
  useIncomingMessage,
  disconnectPusher,
} from "../services/pusherService";
import { api } from "boot/axios";
import FullScreenLoader from "components/FullScreenLoader.vue";
import { useAuthStore } from "stores/auth";

const route = useRoute();
const friendId = ref(route.params.friendId);
const friendName = ref(route.params.friendName);
const messages = ref([]);

const authStore = useAuthStore();
const userId = authStore.user?.id;
const token = authStore.token;

const loading = ref(false);

function loadMessages() {
  loading.value = true;
  api
    .get(`/message/conversation/${friendId.value}`)
    .then((res) => (messages.value = res.data))
    .finally(() => (loading.value = false));
}

onMounted(() => {
  loadMessages();
  initPusher(userId, token);
});

onUnmounted(() => {
  disconnectPusher();
});

// kada stigne nova poruka preko Pusher-a
const incomingMessage = useIncomingMessage();
watch(incomingMessage, (msg) => {
  if (!msg) return;
  if (msg.type === "sent") {
    messages.value.push(msg);
  } else if (msg.type === "deleted") {
    messages.value = messages.value.filter((m) => m.id !== msg.id);
  } else if (msg.type === "updated") {
    const i = messages.value.findIndex((m) => m.id === msg.id);
    if (i !== -1) messages.value[i] = { ...messages.value[i], ...msg };
  }
});
</script>
