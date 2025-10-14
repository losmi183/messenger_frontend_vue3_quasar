<template>
  <q-page class="q-pa-md">
    <h4>Settings</h4>

    <q-card class="q-mb-md">
      <q-card-section>
        <div class="text-h6">Profile</div>
      </q-card-section>

      <q-separator />

      <q-card-section>
        <q-input v-model="profile.name" label="Name" outlined class="q-mb-md" />
        <q-input v-model="profile.email" label="Email" outlined disable />

        <q-btn
          color="primary"
          label="Update Profile"
          @click="updateProfile"
          :loading="profileLoading"
        />
      </q-card-section>
    </q-card>

    <q-card class="q-mb-md">
      <q-card-section>
        <div class="text-h6">Change Password</div>
      </q-card-section>

      <q-separator />

      <q-card-section>
        <q-input
          v-model="password.current"
          label="Current Password"
          type="password"
          outlined
          class="q-mb-md"
        />
        <q-input
          v-model="password.new"
          label="New Password"
          type="password"
          outlined
          class="q-mb-md"
        />
        <q-input
          v-model="password.confirm"
          label="Confirm New Password"
          type="password"
          outlined
          class="q-mb-md"
        />

        <q-btn
          color="primary"
          label="Change Password"
          @click="changePassword"
          :loading="passwordLoading"
        />
      </q-card-section>
    </q-card>

    <q-card class="q-mb-md">
      <q-card-section>
        <div class="text-h6">Preferences</div>
      </q-card-section>

      <q-separator />

      <q-card-section>
        <q-toggle
          v-model="preferences.notifications"
          label="Enable notifications"
          class="q-mb-md"
        />
        <q-toggle
          v-model="preferences.soundEnabled"
          label="Enable sound"
          class="q-mb-md"
        />

        <q-btn
          color="primary"
          label="Save Preferences"
          @click="savePreferences"
          :loading="preferencesLoading"
        />
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script>
import { defineComponent, ref, onMounted } from "vue";
import { useAuthStore } from "stores/auth";
import { api } from "../boot/axios";
import { useQuasar } from "quasar";

export default defineComponent({
  name: "SettingsPage",

  setup() {
    const authStore = useAuthStore();
    const $q = useQuasar();

    const profile = ref({
      name: "",
      email: "",
    });

    const password = ref({
      current: "",
      new: "",
      confirm: "",
    });

    const preferences = ref({
      notifications: true,
      soundEnabled: true,
    });

    const profileLoading = ref(false);
    const passwordLoading = ref(false);
    const preferencesLoading = ref(false);

    const loadSettings = () => {
      if (authStore.user) {
        profile.value.name = authStore.user.name;
        profile.value.email = authStore.user.email;
      }
    };

    const updateProfile = async () => {
      profileLoading.value = true;
      try {
        const response = await api.put("/user/profile", {
          name: profile.value.name,
        });
        authStore.user.name = profile.value.name;
        $q.notify({
          type: "positive",
          message: "Profile updated successfully",
        });
      } catch (error) {
        console.error("Error updating profile:", error);
        $q.notify({
          type: "negative",
          message: "Error updating profile",
        });
      } finally {
        profileLoading.value = false;
      }
    };

    const changePassword = async () => {
      if (password.value.new !== password.value.confirm) {
        $q.notify({
          type: "negative",
          message: "Passwords do not match",
        });
        return;
      }

      passwordLoading.value = true;
      try {
        await api.put("/user/password", {
          current_password: password.value.current,
          new_password: password.value.new,
        });
        password.value = { current: "", new: "", confirm: "" };
        $q.notify({
          type: "positive",
          message: "Password changed successfully",
        });
      } catch (error) {
        console.error("Error changing password:", error);
        $q.notify({
          type: "negative",
          message: "Error changing password",
        });
      } finally {
        passwordLoading.value = false;
      }
    };

    const savePreferences = async () => {
      preferencesLoading.value = true;
      try {
        await api.put("/user/preferences", preferences.value);
        $q.notify({
          type: "positive",
          message: "Preferences saved successfully",
        });
      } catch (error) {
        console.error("Error saving preferences:", error);
        $q.notify({
          type: "negative",
          message: "Error saving preferences",
        });
      } finally {
        preferencesLoading.value = false;
      }
    };

    onMounted(() => {
      loadSettings();
    });

    return {
      profile,
      password,
      preferences,
      profileLoading,
      passwordLoading,
      preferencesLoading,
      updateProfile,
      changePassword,
      savePreferences,
    };
  },
});
</script>
