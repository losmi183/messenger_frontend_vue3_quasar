<template>
  <q-page class="q-pa-md">
    <h4>Notifications</h4>

    <div v-if="notifications.length === 0" class="text-grey-6">
      No notifications
    </div>

    <q-list bordered separator v-else>
      <q-item
        v-for="notification in notifications"
        :key="notification.id"
        :class="{ 'bg-blue-1': !notification.read }"
      >
        <q-item-section avatar>
          <q-avatar
            :color="notification.read ? 'grey' : 'primary'"
            text-color="white"
          >
            <q-icon :name="getNotificationIcon(notification.type)" />
          </q-avatar>
        </q-item-section>

        <q-item-section>
          <q-item-label>{{ notification.title }}</q-item-label>
          <q-item-label caption>{{ notification.message }}</q-item-label>
          <q-item-label caption class="text-grey-5">
            {{ formatDate(notification.created_at) }}
          </q-item-label>
        </q-item-section>

        <q-item-section side>
          <div class="row q-gutter-sm">
            <q-btn
              v-if="!notification.read"
              flat
              dense
              round
              icon="check"
              color="positive"
              @click="markAsRead(notification.id)"
            >
              <q-tooltip>Mark as read</q-tooltip>
            </q-btn>
            <q-btn
              flat
              dense
              round
              icon="delete"
              color="negative"
              @click="deleteNotification(notification.id)"
            >
              <q-tooltip>Delete</q-tooltip>
            </q-btn>
          </div>
        </q-item-section>
      </q-item>
    </q-list>

    <div v-if="notifications.length > 0" class="q-mt-md row justify-end">
      <q-btn
        flat
        color="primary"
        label="Mark all as read"
        @click="markAllAsRead"
      />
    </div>
  </q-page>
</template>

<script>
import { defineComponent, ref, onMounted } from "vue";
import { api } from "../boot/axios";

export default defineComponent({
  name: "NotificationsPage",

  setup() {
    const notifications = ref([]);

    const loadNotifications = async () => {
      try {
        const response = await api.get("/notifications");
        notifications.value = response.data;
      } catch (error) {
        console.error("Error loading notifications:", error);
      }
    };

    const markAsRead = async (notificationId) => {
      try {
        await api.post(`/notifications/${notificationId}/read`);
        const notification = notifications.value.find(
          (n) => n.id === notificationId
        );
        if (notification) {
          notification.read = true;
        }
      } catch (error) {
        console.error("Error marking notification as read:", error);
      }
    };

    const markAllAsRead = async () => {
      try {
        await api.post("/notifications/read-all");
        notifications.value.forEach((n) => (n.read = true));
      } catch (error) {
        console.error("Error marking all as read:", error);
      }
    };

    const deleteNotification = async (notificationId) => {
      try {
        await api.delete(`/notifications/${notificationId}`);
        notifications.value = notifications.value.filter(
          (n) => n.id !== notificationId
        );
      } catch (error) {
        console.error("Error deleting notification:", error);
      }
    };

    const getNotificationIcon = (type) => {
      const icons = {
        friend_request: "person_add",
        message: "message",
        system: "info",
      };
      return icons[type] || "notifications";
    };

    const formatDate = (date) => {
      return new Date(date).toLocaleString();
    };

    onMounted(() => {
      loadNotifications();
    });

    return {
      notifications,
      markAsRead,
      markAllAsRead,
      deleteNotification,
      getNotificationIcon,
      formatDate,
    };
  },
});
</script>
