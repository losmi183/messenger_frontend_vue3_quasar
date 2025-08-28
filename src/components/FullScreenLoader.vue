<template>
  <div v-if="show" class="fullscreen-loader flex flex-center column">
    <div class="overlay"></div>
    <q-spinner-dots size="80px" color="primary" />
  </div>
</template>

<script setup>
import { defineProps } from "vue";

defineProps({
  show: {
    type: Boolean,
    default: false,
  },
});
</script>

<style scoped>
.fullscreen-loader {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 9999;
}

.fullscreen-loader .overlay {
  position: absolute;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.4);
  top: 0;
  left: 0;
  z-index: 1;
}

.fullscreen-loader q-spinner-dots {
  z-index: 2;
}
</style>
