<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar>
        <q-btn
          flat
          dense
          round
          icon="menu"
          aria-label="Menu"
          @click="toggleLeftDrawer"
        />

        <q-toolbar-title> {{ auth?.user?.name }} </q-toolbar-title>

        <q-btn
          v-if="auth.user"
          label="Logout"
          color="negative"
          @click="logout"
        />
        <q-btn v-else label="Login" color="primary" @click="goToLogin" />
      </q-toolbar>
    </q-header>

    <q-drawer v-model="leftDrawerOpen" show-if-above bordered>
      <q-list>
        <q-item-label header> Friends </q-item-label>

        <q-item
          v-for="friend in connections.friends"
          :key="friend.id"
          clickable
          @click="openConversation(friend)"
        >
          <q-item-section avatar>
            <q-avatar color="primary" text-color="white">
              {{ friend.name.charAt(0) }}
            </q-avatar>
          </q-item-section>
          <q-item-section>
            <q-item-label>{{ friend.name }}</q-item-label>
          </q-item-section>

          <q-item-section
            side
            v-if="conversationStore.newMessages[friend.id] > 0"
          >
            <q-badge
              color="red"
              text-color="white"
              :label="conversationStore.newMessages[friend.id]"
              rounded
            ></q-badge>
          </q-item-section>
        </q-item>
      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { ref, onMounted, watch } from "vue";
import { useAuthStore } from "stores/auth";
import { useRouter } from "vue-router";
import { useConnectionsStore } from "stores/connections";
import { useConversationStore } from "stores/conversations";

const auth = useAuthStore();
const router = useRouter();
const connections = useConnectionsStore();
const conversationStore = useConversationStore();

onMounted(() => {
  connections.loadConnections();
});

// 👇 prati kad se `connections.friends` promeni
watch(
  () => connections.friends,
  (friends) => {
    friends.forEach((friend) => {
      if (friend.new_messages > 0) {
        conversationStore.newMessages[friend.id] = friend.new_messages;
      }
    });
  },
  { immediate: true } // pokreni odmah i kad prvi put dođe vrednost
);

function logout() {
  auth.clearAuth();
  router.push("/login");
}

function goToLogin() {
  router.push("/login");
}

function openConversation(friend) {
  router.push(`/conversation/${friend.id}/${friend.name}`);
}

defineOptions({
  name: "MainLayout",
});

const linksList = [
  {
    title: "Docs",
    caption: "quasar.dev",
    icon: "school",
    link: "https://quasar.dev",
  },
];

const leftDrawerOpen = ref(false);

function toggleLeftDrawer() {
  leftDrawerOpen.value = !leftDrawerOpen.value;
}
</script>
