<template>
  <q-page class="flex flex-center">
    <img
      alt="Quasar logo"
      src="~assets/quasar-logo-vertical.svg"
      style="width: 200px; height: 200px"
    />
    <q-btn label="test token" @click="testToken" class="q-mt-md" />
  </q-page>
</template>

<script setup>
defineOptions({
  name: "IndexPage",
});

import axios from "axios";
import { api } from "boot/axios";

function testToken() {
  api
    .post("/auth/whoami")
    .then((response) => {
      console.log(response);
    })
    .catch((error) => {
      console.error("Greška:", error.response?.data || error);
    });
}
</script>
