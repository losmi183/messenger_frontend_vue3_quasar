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
      label="Search users by name (min 3 characters)"
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
              v-if="user.status === 'none'"
              color="primary"
              label="Add Friend"
              @click="sendFriendRequest(user.user_id)"
              :loading="user.loading"
            />
            <q-btn
              v-else-if="user.status === 'pending_sent'"
              color="grey"
              label="Pending"
              disable
            />
            <q-btn
              v-else-if="user.status === 'pending_received'"
              color="orange"
              label="Respond"
              disable
            />
          </q-item-section>
        </q-item>
      </q-list>
    </div>

    <div
      v-if="
        searchQuery.length >= 3 && searchResults.length === 0 && !searchLoading
      "
    >
      <p class="text-grey-6">No users found</p>
    </div>

    <div
      v-if="
        searchQuery.length < 3 &&
        searchResults.length === 0 &&
        receivedRequests.length === 0
      "
    >
      <p class="text-grey-6">Type at least 3 characters to search for users</p>
    </div>
  </q-page>
</template>

<script>
import { defineComponent, ref, onMounted } from "vue";
import { useAuthStore } from "stores/auth";
import { api } from "../boot/axios";

let searchTimeout = null;

export default defineComponent({
  name: "FriendsPage",

  setup() {
    const authStore = useAuthStore();
    const searchQuery = ref("");
    const searchResults = ref([]);
    const receivedRequests = ref([]);
    const searchLoading = ref(false);

    const loadReceivedRequests = () => {
      api
        .get("/connection/requested")
        .then((response) => {
          receivedRequests.value = response.data.map((request) => ({
            ...request,
            acceptLoading: false,
            rejectLoading: false,
          }));
        })
        .catch((error) => {
          console.error("Error loading received requests:", error);
        });
    };

    const onSearchInput = (value) => {
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }

      if (value.length < 3) {
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

      api
        .post("/connection/initiate", { recipient_id: userId })
        .then(() => {
          user.status = "pending_sent";
        })
        .catch((error) => {
          console.error("Error sending friend request:", error);
        })
        .finally(() => {
          user.loading = false;
        });
    };

    const acceptRequest = (connectionId) => {
      const request = receivedRequests.value.find(
        (r) => r.connection_id === connectionId
      );
      request.acceptLoading = true;

      api
        .post("/connection/accept", { connection_id: connectionId })
        .then(() => {
          receivedRequests.value = receivedRequests.value.filter(
            (r) => r.connection_id !== connectionId
          );
        })
        .catch((error) => {
          console.error("Error accepting request:", error);
        })
        .finally(() => {
          request.acceptLoading = false;
        });
    };

    const rejectRequest = (connectionId) => {
      const request = receivedRequests.value.find(
        (r) => r.connection_id === connectionId
      );
      request.rejectLoading = true;

      api
        .post("/connection/reject", { connection_id: connectionId })
        .then(() => {
          receivedRequests.value = receivedRequests.value.filter(
            (r) => r.connection_id !== connectionId
          );
        })
        .catch((error) => {
          console.error("Error rejecting request:", error);
        })
        .finally(() => {
          request.rejectLoading = false;
        });
    };

    onMounted(() => {
      loadReceivedRequests();
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
