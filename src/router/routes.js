const routes = [
  {
    path: "/",
    component: () => import("layouts/MainLayout.vue"),
    meta: { requiresAuth: true },
    children: [{ path: "", component: () => import("pages/IndexPage.vue") }],
  },
  {
    path: "/login",
    component: () => import("layouts/GuestLayout.vue"),
    meta: { guest: true },
    children: [{ path: "", component: () => import("pages/LoginPage.vue") }],
  },
  {
    path: "/register",
    component: () => import("layouts/AuthLayout.vue"),
    meta: { guest: true },
    children: [{ path: "", component: () => import("pages/RegisterPage.vue") }],
  },

  {
    path: "/conversation/:friendId/:friendName",
    component: () => import("layouts/MainLayout.vue"),
    meta: { requiresAuth: true },
    children: [
      { path: "", component: () => import("pages/ConversationPage.vue") },
    ],
  },

  {
    path: "/friends",
    component: () => import("layouts/MainLayout.vue"),
    meta: { requiresAuth: true },
    children: [{ path: "", component: () => import("pages/FriendsPage.vue") }],
  },

  {
    path: "/notifications",
    component: () => import("layouts/MainLayout.vue"),
    meta: { requiresAuth: true },
    children: [
      { path: "", component: () => import("pages/NotificationsPage.vue") },
    ],
  },

  {
    path: "/settings",
    component: () => import("layouts/MainLayout.vue"),
    meta: { requiresAuth: true },
    children: [{ path: "", component: () => import("pages/SettingsPage.vue") }],
  },

  {
    path: "/message",
    component: () => import("layouts/MainLayout.vue"),
    children: [{ path: "", component: () => import("pages/MessagePage.vue") }],
  },
  {
    path: "/msg",
    component: () => import("layouts/MainLayout.vue"),
    children: [{ path: "", component: () => import("pages/MsgPage.vue") }],
  },

  {
    path: "/:catchAll(.*)*",
    component: () => import("pages/ErrorNotFound.vue"),
  },
];

export default routes;
