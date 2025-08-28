<template>
  <q-page class="q-pa-md">
    <h3 v-if="authStore.user">
      Poruke za {{ authStore.user.name }} (ID: {{ authStore.user.id }})
    </h3>
    <h3 v-else>Učitava se...</h3>

    <div v-if="messages.length === 0">Nema poruka...</div>

    <div
      v-for="message in messages"
      :key="message.id"
      class="q-mb-md q-pa-md"
      style="border: 1px solid #ccc"
    >
      <div><strong>Od:</strong> {{ message.from.name }}</div>
      <div><strong>Poruka:</strong> {{ message.message }}</div>
    </div>
  </q-page>
</template>

<script>
import { defineComponent, ref, onMounted, onUnmounted, computed } from "vue";
import { useAuthStore } from "stores/auth";

export default defineComponent({
  name: "MessagePage",

  setup() {
    const authStore = useAuthStore();
    const messages = ref([]);
    let pusher = null;

    const userId = computed(() => authStore.user?.id);

    const initPusher = () => {
      if (!userId.value) {
        console.log("User ID not available yet");
        return;
      }

      pusher = new window.Pusher(import.meta.env.VITE_PUSHER_KEY, {
        cluster: import.meta.env.VITE_PUSHER_CLUSTER,
        authEndpoint: `${import.meta.env.VITE_API_URL}/api/pusher/auth`,
        auth: {
          headers: {
            Authorization: `Bearer ${authStore.token}`,
          },
        },
      });

      const channel = pusher.subscribe(`private-user-${userId.value}`);

      channel.bind("message.sent", (data) => {
        console.log("Received message:", data);

        // Dodaj poruku na vrh liste
        messages.value.unshift({
          id: Date.now(),
          ...data,
        });
      });
    };

    onMounted(async () => {
      // Prvo restore session ako nije već učitan user
      if (!authStore.user && authStore.token) {
        await authStore.restoreSession();
      }

      if (!window.Pusher) {
        const script = document.createElement("script");
        script.src = "https://js.pusher.com/8.4.0/pusher.min.js";
        script.onload = () => {
          initPusher();
        };
        document.head.appendChild(script);
      } else {
        initPusher();
      }
    });

    onUnmounted(() => {
      if (pusher) {
        pusher.disconnect();
      }
    });

    return {
      messages,
      authStore,
    };
  },
});
</script>
