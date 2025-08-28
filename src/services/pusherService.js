import Pusher from "pusher-js";
import { ref } from "vue";

let pusher = null;
let channel = null;

export const incomingMessage = ref(null);

export function initPusher(userId, token) {
  if (pusher) return; // singleton

  pusher = new Pusher(import.meta.env.VITE_PUSHER_KEY, {
    cluster: import.meta.env.VITE_PUSHER_CLUSTER,
    authEndpoint: "/broadcasting/auth",
    auth: {
      headers: { Authorization: `Bearer ${token}` },
    },
  });

  channel = pusher.subscribe(`private-user.${userId}`);

  channel.bind("message.received", (data) => {
    incomingMessage.value = data;
  });
}
