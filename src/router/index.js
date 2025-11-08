import { route } from "quasar/wrappers";
import {
  createRouter,
  createMemoryHistory,
  createWebHistory,
  createWebHashHistory,
} from "vue-router";
import routes from "./routes";
import { useAuthStore } from "src/stores/auth";

export default route(function (/* { store, ssrContext } */) {
  const createHistory = process.env.SERVER
    ? createMemoryHistory
    : process.env.VUE_ROUTER_MODE === "history"
    ? createWebHistory
    : createWebHashHistory;

  const Router = createRouter({
    scrollBehavior: () => ({ left: 0, top: 0 }),
    routes,

    // Leave this as is and make changes in quasar.conf.js instead!
    // quasar.conf.js -> build -> vueRouterMode
    // quasar.conf.js -> build -> publicPath
    history: createHistory(process.env.VUE_ROUTER_BASE),
  });

  Router.beforeEach(async (to, from, next) => {
    const auth = useAuthStore();

    // Uvek pokušaj da obnoviš sesiju (ako je već učitana, biće instant)
    await auth.restoreSession();

    const user = auth.getUser;

    // Ako store nema token, pokušaj restoreSession
    if (!auth.token) {
      await auth.restoreSession();
    }
    const isAuth = auth.isAuthencated;

    // Ako ruta zahteva admina, a korisnik nije admin → pošalji ga na početnu
    if (to.meta.requiresAdmin && auth.user?.role !== "admin") {
      return next("/");
    }

    // Ako ruta zahteva login, a korisnik nije ulogovan → login
    if (to.meta.requiresAuth && !isAuth) {
      return next("/login");
    }

    // Ako ruta je samo za goste (npr. login/register), a korisnik je već ulogovan → početna
    if (to.meta.guest && isAuth) {
      return next("/");
    }

    // Sve ostalo dozvoljeno
    next();
  });

  return Router;
});
