<template>
  <q-layout view="hHh lpR fFf">
    <!-- Simple header / navbar -->
    <q-header elevated>
      <q-toolbar>
        <q-toolbar-title>Auth Area</q-toolbar-title>
        <q-btn flat label="About" @click="goToAbout" />
        <q-btn flat label="FAQ" @click="goToFAQ" />
      </q-toolbar>
    </q-header>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { useRouter } from "vue-router";

const router = useRouter();

function goToAbout() {
  router.push("/about");
}

function goToFAQ() {
  router.push("/faq");
}
</script>
