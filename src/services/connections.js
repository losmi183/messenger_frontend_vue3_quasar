import { api } from "boot/axios";

export function fetchMyConnections() {
  return api
    .get("/connection/my-connections")
    .then((response) => response.data)
    .catch((error) => {
      console.error("Failed to fetch connections:", error);
      throw error; // prosledi dalje da može store da reaguje
    });
}
