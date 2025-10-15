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

        <template v-if="auth.user">
          <q-btn
            flat
            dense
            round
            icon="person_add"
            @click="router.push('/friends')"
          >
            <q-tooltip>Add Friends</q-tooltip>
          </q-btn>

          <q-btn
            flat
            dense
            round
            icon="notifications"
            @click="router.push('/notifications')"
          >
            <q-badge v-if="pendingRequestsCount" color="red" floating>
              {{ pendingRequestsCount }}
            </q-badge>
            <q-tooltip>Notifications</q-tooltip>
          </q-btn>

          <q-btn
            flat
            dense
            round
            icon="settings"
            @click="router.push('/settings')"
          >
            <q-tooltip>Settings</q-tooltip>
          </q-btn>

          <q-btn flat dense round icon="logout" @click="logout">
            <q-tooltip>Logout</q-tooltip>
          </q-btn>
        </template>

        <q-btn v-else label="Login" color="primary" @click="goToLogin" />
      </q-toolbar>
    </q-header>

    <q-drawer v-model="leftDrawerOpen" show-if-above bordered>
      <q-list>
        <q-item>
          <q-input
            dense
            outlined
            v-model="searchFriends"
            placeholder="Search friends..."
            class="full-width"
          >
            <template v-slot:prepend>
              <q-icon name="search" />
            </template>
          </q-input>
        </q-item>

        <q-separator />

        <q-item-label header> Friends </q-item-label>

        <q-item
          v-for="friend in filteredFriends"
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
          <q-item-section side v-if="friend.new_messages > 0">
            <q-badge color="red" :label="friend.new_messages" />
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
import { ref, computed } from "vue";
import { useAuthStore } from "stores/auth";
import { useRouter } from "vue-router";
import { useConnectionsStore } from "stores/connections";
import { onMounted } from "vue";

const auth = useAuthStore();
const router = useRouter();
const connections = useConnectionsStore();

const searchFriends = ref("");
const pendingRequestsCount = ref(0); // TODO: povezati sa pravim podacima

onMounted(() => {
  connections.loadConnections();
});

const filteredFriends = computed(() => {
  if (!searchFriends.value) {
    return connections.friends;
  }
  return connections.friends.filter((friend) =>
    friend.name.toLowerCase().includes(searchFriends.value.toLowerCase())
  );
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

const leftDrawerOpen = ref(false);

function toggleLeftDrawer() {
  leftDrawerOpen.value = !leftDrawerOpen.value;
}
</script>
