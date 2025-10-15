<template>
  <q-page class="q-pa-md">
    <h4>Add Friends</h4>

    <!-- Pristigli zahtevi -->
    <div v-if="receivedRequests.length > 0" class="q-mb-lg">
      <div class="row items-center q-mb-sm">
        <h6 class="q-ma-none">Friend Requests</h6>
        <q-badge color="red" :label="receivedRequests.length" class="q-ml-sm" />
      </div>
      <q-list bordered separator>
        <q-item
          v-for="request in receivedRequests"
          :key="request.connection_id"
        >
          <q-item-section avatar>
            <q-avatar color="secondary" text-color="white">
              {{ request.name.charAt(0) }}
            </q-avatar>
          </q-item-section>
          <q-item-section>
            <q-item-label>{{ request.name }}</q-item-label>
            <q-item-label caption>{{ request.email }}</q-item-label>
          </q-item-section>
          <q-item-section side>
            <div class="row q-gutter-sm">
              <q-btn
                color="positive"
                label="Accept"
                size="sm"
                @click="acceptRequest(request.connection_id)"
                :loading="request.acceptLoading"
              />
              <q-btn
                color="negative"
                label="Reject"
                size="sm"
                @click="rejectRequest(request.connection_id)"
                :loading="request.rejectLoading"
              />
            </div>
          </q-item-section>
        </q-item>
      </q-list>
    </div>

    <q-separator v-if="receivedRequests.length > 0" class="q-mb-lg" />

    <!-- Search Section -->
    <q-input
      v-model="searchQuery"
      outlined
      label="Search users by name (min 2 characters)"
      class="q-mb-md"
      @update:model-value="onSearchInput"
    >
      <template v-slot:append>
        <q-icon v-if="searchLoading" name="hourglass_empty" />
        <q-icon v-else name="search" />
      </template>
    </q-input>

    <!-- Search Results -->
    <div v-if="searchResults.length > 0">
      <h6>Search Results</h6>
      <q-list bordered separator>
        <q-item v-for="user in searchResults" :key="user.user_id">
          <q-item-section avatar>
            <q-avatar color="primary" text-color="white">
              {{ user.name.charAt(0) }}
            </q-avatar>
          </q-item-section>
          <q-item-section>
            <q-item-label>{{ user.name }}</q-item-label>
            <q-item-label caption>{{ user.email }}</q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-btn
              v-if="user.status === null"
              color="primary"
              label="Add Friend"
              @click="sendFriendRequest(user.user_id)"
              :loading="user.loading"
            />
            <q-chip
              v-else
              :color="user.status === 'PENDING' ? 'orange' : 'positive'"
              text-color="white"
            >
              {{ user.status }}
            </q-chip>
          </q-item-section>
        </q-item>
      </q-list>
    </div>

    <div
      v-if="
        searchQuery.length >= 2 && searchResults.length === 0 && !searchLoading
      "
    >
      <p class="text-grey-6">No users found</p>
    </div>

    <div
      v-if="
        searchQuery.length < 2 &&
        searchResults.length === 0 &&
        receivedRequests.length === 0
      "
    >
      <p class="text-grey-6">Type at least 2 characters to search for users</p>
    </div>
  </q-page>
</template>

<script>
import { defineComponent, ref, onMounted, computed } from "vue";
import { useAuthStore } from "stores/auth";
import { useConnectionsStore } from "stores/connections";
import { api } from "../boot/axios";

let searchTimeout = null;

export default defineComponent({
  name: "FriendsPage",

  setup() {
    const authStore = useAuthStore();
    const connections = useConnectionsStore();
    const searchQuery = ref("");
    const searchResults = ref([]);
    const searchLoading = ref(false);

    const receivedRequests = computed(() => connections.receivedRequests);

    const onSearchInput = (value) => {
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }

      if (value.length < 2) {
        searchResults.value = [];
        return;
      }

      searchLoading.value = true;

      searchTimeout = setTimeout(() => {
        searchUsers(value);
      }, 400);
    };

    const searchUsers = (query) => {
      api
        .post("/user/search", { search: query })
        .then((response) => {
          searchResults.value = response.data.map((user) => ({
            ...user,
            loading: false,
          }));
        })
        .catch((error) => {
          console.error("Error searching users:", error);
        })
        .finally(() => {
          searchLoading.value = false;
        });
    };

    const sendFriendRequest = (userId) => {
      const user = searchResults.value.find((u) => u.user_id === userId);
      user.loading = true;

      connections
        .sendFriendRequest(userId)
        .then(() => {
          user.status = "PENDING";
        })
        .catch(() => {
          // Error već logovan u store
        })
        .finally(() => {
          user.loading = false;
        });
    };

    const acceptRequest = (connectionId) => {
      connections.acceptRequest(connectionId);
    };

    const rejectRequest = (connectionId) => {
      connections.rejectRequest(connectionId);
    };

    onMounted(() => {
      connections.loadReceivedRequests();
    });

    return {
      searchQuery,
      searchResults,
      receivedRequests,
      searchLoading,
      onSearchInput,
      sendFriendRequest,
      acceptRequest,
      rejectRequest,
    };
  },
});
</script>
