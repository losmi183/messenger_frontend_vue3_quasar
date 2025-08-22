<template>
  <q-page class="flex flex-center">
    <q-form @submit.prevent="submitLogin" style="width: 350px">
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
        label="Login"
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

const email = ref("");
const password = ref("");
const emailError = ref("");
const passwordError = ref("");
const router = useRouter();

function isValidEmail(value) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(value);
}

function submitLogin() {
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

  axios
    .post("http://messenger.test/api/auth/login", {
      email: email.value,
      password: password.value,
    })
    .then((response) => {
      const token = response.data.token;
      localStorage.setItem("auth_token", token);
      router.push("/");
    })
    .catch((error) => {
      if (error.response?.data?.message) {
        passwordError.value = error.response.data.message;
      } else {
        passwordError.value = "Login error";
      }
    });
}
</script>
