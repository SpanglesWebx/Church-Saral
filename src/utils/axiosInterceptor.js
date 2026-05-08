import axios from "axios";

axios.interceptors.response.use(

  (response) => response,

  (error) => {

    const message = error.response?.data?.message;

    // logout ONLY when token expired
    if (error.response?.status === 401 && message === "Token expired") {

      window.dispatchEvent(new Event("tokenExpired"));

    }

    return Promise.reject(error);

  }

);