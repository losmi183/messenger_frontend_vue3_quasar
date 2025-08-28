import { ref } from "vue";

let pusherInstance = null;
const incomingMessage = ref(null);

export function initPusher(userId, token) {
  if (!userId || !token) {
    console.error("Pusher init failed: userId or token missing");
    return;
  }

  if (!window.Pusher) {
    const script = document.createElement("script");
    script.src = "https://js.pusher.com/8.4.0/pusher.min.js";
    script.onload = () => setupPusher(userId, token);
    document.head.appendChild(script);
  } else {
    setupPusher(userId, token);
  }
}

function setupPusher(userId, token) {
  pusherInstance = new window.Pusher(import.meta.env.VITE_PUSHER_KEY, {
    cluster: import.meta.env.VITE_PUSHER_CLUSTER,
    authEndpoint: `${import.meta.env.VITE_API_URL}/api/pusher/auth`,
    auth: {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  });

  const channel = pusherInstance.subscribe(`private-user-${userId}`);

  // bind na više eventova
  channel.bind("message.sent", (data) => {
    incomingMessage.value = { type: "sent", ...data };
  });

  channel.bind("message.deleted", (data) => {
    incomingMessage.value = { type: "deleted", ...data };
  });

  channel.bind("message.updated", (data) => {
    incomingMessage.value = { type: "updated", ...data };
  });
}

export function useIncomingMessage() {
  return incomingMessage;
}

export function disconnectPusher() {
  if (pusherInstance) {
    pusherInstance.disconnect();
    pusherInstance = null;
  }
}
