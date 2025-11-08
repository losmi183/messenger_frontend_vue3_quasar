<template>
  <q-page class="q-pa-md">
    <h4>Settings</h4>

    <q-card class="q-mb-md">
      <q-card-section>
        <div class="teht-h6">Profile</div>
      </q-card-section>

      <q-separator />

      <q-card-section>
        <div class="q-mb-md">
          <q-avatar size="100px" class="q-mb-md">
            <img v-if="avatarPreview" :src="avatarPreview" />
            <img v-else-if="currentAvatar" :src="currentAvatar" />
            <div v-else class="bg-primary text-white text-h4">
              {{ profile.name ? profile.name.charAt(0).toUpperCase() : "U" }}
            </div>
          </q-avatar>

          <q-file
            v-model="avatarFile"
            label="Chose Avatar"
            outlined
            accept="image/*"
            @update:model-value="onAvatarSelect"
            class="q-mb-md"
          >
            <template v-slot:prepend>
              <q-icon name="attach_file" />
            </template>
          </q-file>

          <q-input
            v-model="profile.name"
            label="Name"
            outlined=""
            class="q-mb-md"
            :rules="[(val) => !!val || 'Name is required']"
          ></q-input>
          <q-input
            v-model="profile.email"
            label="Email"
            outlined
            disabled
            class="q-mb-md"
          ></q-input>

          <q-btn
            color="primary"
            label="Update Profile"
            @click="updateProfile"
            :loading="profileLoading"
            :disable="!profile.name"
          ></q-btn>
        </div>
      </q-card-section>

      <q-card-section>
        <div class="teht-h6">Change Password</div>
      </q-card-section>

      <q-separator />

      <q-card-section>
        <div class="q-mb-md">
          <q-input
            v-model="password.new"
            label="Password"
            type="password"
            outlined
            class="q-mb-md"
            :rules="[
              (val) =>
                !val ||
                val.length >= 6 ||
                'Password must be at least 6 characters',
            ]"
          />
          <q-input
            v-model="password.confirm"
            label="Confirm New Password"
            type="password"
            outlined
            class="q-mb-md"
            :rules="[
              (val) => !val || val === password.new || 'Passwords must match',
            ]"
          />
          <q-btn
            label="Change Password"
            color="primary"
            @click="changePassword"
            :loading="passwordLoading"
            :disable="!password.new || !password.confirm"
          />
        </div>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script>
import { defineComponent, ref, computed, onMounted } from "vue";
import { useAuthStore } from "stores/auth";
import { api } from "../boot/axios";
import { Notify } from "quasar";

export default defineComponent({
  name: "SettingPage",
  setup() {
    const authStore = useAuthStore();

    const API_BASE_URL = import.meta.env.VITE_API_URL || api.defaults.baseURL;
    const BASE_URL = API_BASE_URL.replace("/api", "");
    const avatarFile = ref(null);
    const avatarPreview = ref(null);
    const profileLoading = ref(false);
    const passwordLoading = ref(false);

    const profile = ref({
      name: "",
      email: "",
      avatar: "",
    });

    const password = ref({
      new: "",
      confirm: "",
    });

    onMounted(() => {
      api
        .get("/auth/whoami")
        .then((res) => {
          console.log(res);
          profile.value = res.data;
        })
        .catch((err) => {
          alert(err);
        });
    });

    const currentAvatar = computed(() => {
      if (!profile.value.avatar) return null;
      return BASE_URL + profile.value.avatar;
    });

    const onAvatarSelect = (value) => {
      let file = null;

      if (Array.isArray(value)) {
        if (value.length === 0) return;
        file = value[0];
      } else {
        file = value;
      }

      if (!file) return;

      avatarPreview.value = URL.createObjectURL(file);
      console.log("Avatar selected:", file);
    };

    const updateProfile = () => {
      const formData = new FormData();
      formData.append("name", profile.value.name);

      if (avatarFile.value) {
        formData.append("avatar", avatarFile.value);
      }

      api
        .post("/user/update", formData, {
          headers: {
            "Content-Type": "multipart-form-data",
          },
        })
        .then((res) => {
          console.log("Profile updated:", res.data);
          Notify.create({
            type: "positive",
            message: "Profile updated successfully!",
          });
        })
        .catch((err) => {
          console.log(err);
          Notify.create({
            type: "negative",
            message: "Error updating profile.",
          });
        });
    };

    const changePassword = () => {
      api
        .post("/user/change-password", {
          password: password.value.new,
          password2: password.value.confirm,
        })
        .then((res) => {
          Notify.create({
            type: "positive",
            message: "Password updated successfully!",
          });
        })
        .catch((err) => {
          console.error(err);
          Notify.create({
            type: "negative",
            message: "Error updating password.",
          });
        });
    };

    return {
      profile,
      password,
      currentAvatar,
      avatarFile,
      avatarPreview,
      onAvatarSelect,
      updateProfile,
      changePassword,
      profileLoading,
      passwordLoading,
    };
  },
});
</script>
