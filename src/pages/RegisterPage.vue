<template>
  <q-page class="flex flex-center">
    <q-form @submit.prevent="submitRegister" style="width: 350px">
      <q-input
        filled
        v-model="email"
        label="Email"
        type="email"
        :error="emailError !== ''"
        :error-message="emailError"
        required
      />
      <q-input
        filled
        v-model="password"
        label="Password"
        type="password"
        class="q-mt-md"
        :error="passwordError !== ''"
        :error-message="passwordError"
        required
      />
      <q-btn
        label="Register"
        type="submit"
        color="primary"
        class="full-width q-mt-md"
      />
    </q-form>
  </q-page>
</template>

<script setup>
import { ref } from "vue";
import axios from "axios";
import { useRouter } from "vue-router";
import { useAuthStore } from "stores/auth";

const email = ref("");
const password = ref("");
const emailError = ref("");
const passwordError = ref("");
const router = useRouter();
const authStore = useAuthStore();

function isValidEmail(value) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(value);
}

function submitRegister() {
  emailError.value = "";
  passwordError.value = "";

  if (!email.value || !isValidEmail(email.value)) {
    emailError.value = "Enter a valid email";
    return;
  }

  if (!password.value) {
    passwordError.value = "Enter password";
    return;
  }

  authStore
    .Register(email.value, password.value)
    .then(() => {
      router.push("/");
    })
    .catch((err) => {
      passwordError.value = err || "Register error";
    });
}
</script>
