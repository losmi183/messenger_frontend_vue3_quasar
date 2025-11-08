<template>
  <q-layout view="lHh Lpr lFf">
    <!-- HEADER -->
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
        <q-toolbar-title>Admin Panel</q-toolbar-title>
        <q-space />
        <q-btn flat dense round icon="logout" @click="logout">
          <q-tooltip>Logout</q-tooltip>
        </q-btn>
      </q-toolbar>
    </q-header>

    <!-- LEVI DRAWER -->
    <q-drawer v-model="leftDrawerOpen" show-if-above bordered>
      <q-list padding>
        <q-item-label header>Upravljanje</q-item-label>

        <q-item
          clickable
          v-ripple
          :active="isActive('dashboard')"
          @click="goTo('dashboard')"
        >
          <q-item-section avatar><q-icon name="dashboard" /></q-item-section>
          <q-item-section>Dashboard</q-item-section>
        </q-item>

        <q-item
          clickable
          v-ripple
          :active="isActive('users')"
          @click="goTo('users')"
        >
          <q-item-section avatar><q-icon name="people" /></q-item-section>
          <q-item-section>Korisnici</q-item-section>
        </q-item>

        <q-item
          clickable
          v-ripple
          :active="isActive('requests')"
          @click="goTo('requests')"
        >
          <q-item-section avatar><q-icon name="person_add" /></q-item-section>
          <q-item-section>Zahtevi</q-item-section>
        </q-item>

        <q-item
          clickable
          v-ripple
          :active="isActive('messages')"
          @click="goTo('messages')"
        >
          <q-item-section avatar><q-icon name="chat" /></q-item-section>
          <q-item-section>Poruke (log)</q-item-section>
        </q-item>

        <q-item
          clickable
          v-ripple
          :active="isActive('settings')"
          @click="goTo('settings')"
        >
          <q-item-section avatar><q-icon name="settings" /></q-item-section>
          <q-item-section>Postavke</q-item-section>
        </q-item>
      </q-list>
    </q-drawer>

    <!-- CENTRALNI SADRŽAJ -->
    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { ref } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useAuthStore } from "stores/auth";

defineOptions({ name: "AdminLayout" });

const router = useRouter();
const route = useRoute();
const auth = useAuthStore();
const leftDrawerOpen = ref(false);

function toggleLeftDrawer() {
  leftDrawerOpen.value = !leftDrawerOpen.value;
}

function goTo(page) {
  router.push(`/admin/${page}`);
}

function isActive(page) {
  return route.path === `/admin/${page}`;
}

function logout() {
  auth.clearAuth();
  router.push("/login");
}
</script>
