<template>
  <q-page class="q-pa-md">
    <!-- ENCRYPT ROW -->
    <div class="row items-center q-mb-md">
      <q-input
        label="Text to encrypt"
        v-model="text"
        type="text"
        class="col"
        dense
        outlined
      />

      <q-btn
        label="Encrypt"
        @click="encrypt"
        dense
        color="primary"
        class="q-ml-sm"
      />

      <q-input
        label="Encrypted text"
        v-model="crypted"
        type="text"
        class="col q-ml-sm"
        dense
        outlined
        readonly
      />
    </div>

    <!-- DECRYPT ROW -->
    <div class="row items-center">
      <q-input
        label="Text to decrypt"
        v-model="crypted"
        type="text"
        class="col"
        dense
        outlined
      />

      <q-btn
        label="Decrypt"
        @click="decrypt"
        dense
        color="secondary"
        class="q-ml-sm"
      />

      <q-input
        label="Decrypted text"
        v-model="decrypted"
        type="text"
        class="col q-ml-sm"
        dense
        outlined
        readonly
      />
    </div>
  </q-page>
</template>

<script setup>
import { ref } from "vue";
import CryptoJS from "crypto-js";

const text = ref("");
const crypted = ref("");
const decrypted = ref("");

const salt = "8f9c180a5e48746fb8ab4bd196ad4e4b";
const passphrase = "milosemil";

function encrypt() {
  if (!text.value) return;

  const key = passphrase + salt;

  const kriptovano = CryptoJS.AES.encrypt(text.value, key).toString();
  crypted.value = kriptovano;
}
function decrypt() {
  if (!crypted.value) return;

  const key = passphrase + salt;

  try {
    const bytes = CryptoJS.AES.decrypt(crypted.value, key);
    const originalText = bytes.toString(CryptoJS.enc.Utf8);
    decrypted.value = originalText || "[Nevažeća šifra]";
  } catch (e) {
    decrypted.value = "[Greška pri dekripciji]";
  }
}
</script>

<style scoped>
.row {
  display: flex;
  align-items: center;
}
.col {
  flex: 1 1 auto;
}
.q-ml-sm {
  margin-left: 8px;
}
.q-mb-md {
  margin-bottom: 16px;
}
</style>
