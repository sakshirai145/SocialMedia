import axios from "axios";

export const clientServer = axios.create({
  baseURL: "https://socialmedia-3yhq.onrender.com/api",
});

const savedToken = typeof localStorage !== "undefined"
  ? localStorage.getItem("token")
  : null;

if (savedToken) {
  clientServer.defaults.headers.common.token = savedToken;
}

clientServer.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 404 && error.response?.data?.message === "User not found") {
      localStorage.removeItem("token");
      delete clientServer.defaults.headers.common.token;
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);
