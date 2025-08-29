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
        </q-item>
      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { ref } from "vue";
import EssentialLink from "components/EssentialLink.vue";
import { useAuthStore } from "stores/auth";
import { useRouter } from "vue-router";
import { useConnectionsStore } from "stores/connections";
import { onMounted } from "vue";

const auth = useAuthStore();
const router = useRouter();
const connections = useConnectionsStore();

onMounted(() => {
  connections.loadConnections();
});

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
