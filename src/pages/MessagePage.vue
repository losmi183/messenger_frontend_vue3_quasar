<template>
  <q-page class="q-pa-md">
    <h3>Poruke za User 1</h3>

    <div v-if="messages.length === 0">Nema poruka...</div>

    <div
      v-for="message in messages"
      :key="message.id"
      class="q-mb-md q-pa-md"
      style="border: 1px solid #ccc"
    >
      <div><strong>Od:</strong> {{ message.from }}</div>
      <div><strong>Poruka:</strong> {{ message.message }}</div>
    </div>
  </q-page>
</template>

<script>
import { defineComponent, ref, onMounted, onUnmounted } from "vue";

export default defineComponent({
  name: "MessagePage",

  setup() {
    const messages = ref([]);
    let pusher = null;

    const initPusher = () => {
      // Hardkodovano za user 1
      const userId = 1;

      pusher = new window.Pusher("d842d9bd852a8bbc74b0", {
        cluster: "eu",
        authEndpoint: "http://messenger.test/api/pusher/auth",
      });

      const channel = pusher.subscribe(`private-user-${userId}`);

      channel.bind("my-event", (data) => {
        console.log("Received message:", data);

        // Dodaj poruku na vrh liste
        messages.value.unshift({
          id: Date.now(),
          ...data,
        });
      });
    };

    onMounted(() => {
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
    };
  },
});
</script>
