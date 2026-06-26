import { createAsyncThunk } from "@reduxjs/toolkit";

import { clientServer } from "../../../config.js";

const setTokenHeader = (token) => {
  clientServer.defaults.headers.common.token = token;
};

export const login = createAsyncThunk(
  "auth/loginUser",
  async (user, thunkAPI) => {
    try {
      const response = await clientServer.post("/users/login", {
        email: user.email,
        password: user.password,
      });

      if (!response.data.token) {
        return thunkAPI.rejectWithValue({ message: "Login failed" });
      }

      localStorage.setItem("token", response.data.token);
      setTokenHeader(response.data.token);

      return response.data.token;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data || { message: error.message }
      );
    }
  }
);

export const registerUser = createAsyncThunk(
  "auth/registerUser",
  async (user, thunkAPI) => {
    try {
      await clientServer.post("/users/register", {
        name: user.name,
        username: user.username,
        email: user.email,
        password: user.password,
      });

      const loginResponse = await clientServer.post("/users/login", {
        email: user.email,
        password: user.password,
      });

      if (!loginResponse.data.token) {
        return thunkAPI.rejectWithValue({ message: "Registration succeeded, but login failed" });
      }

      localStorage.setItem("token", loginResponse.data.token);
      setTokenHeader(loginResponse.data.token);

      return loginResponse.data.token;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data || { message: error.message }
      );
    }
  }
);

export const getAllProfiles = createAsyncThunk(
  "user/getAllProfiles",
  async(_, thunkAPI) => {
    try{
      const state = thunkAPI.getState();
      const currentUserId = state.auth.user?.userId?._id;
      let url = "/users/get_all_user_profile";
      if (currentUserId) {
        url += `?excludeUserId=${currentUserId}`;
      }
      const response = await clientServer.get(url)
      return thunkAPI.fulfillWithValue(response.data)
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data || { message: error.message }
      )
    }
  }
)

export const updateProfilePicture = createAsyncThunk(
  "user/updateProfilePicture",
  async (formData, thunkAPI) => {
    try {
      const token = localStorage.getItem("token");
      const response = await clientServer.post("/users/update_profile_picture", formData, {
        headers: { token },
      });
      return thunkAPI.fulfillWithValue({ message: response.data.message });
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data || { message: error.message }
      );
    }
  }
)

export const sendConnectionRequest = createAsyncThunk(
  "user/sendConnectionRequest",
  async ({ connectionId }, thunkAPI) => {
    try {
      const token = localStorage.getItem("token");
      const response = await clientServer.post("/users/user/send_connection_request", { token, connectionId });
      return thunkAPI.fulfillWithValue({ connectionId, message: response.data.message });
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data || { message: error.message }
      );
    }
  }
)

export const cancelConnectionRequest = createAsyncThunk(
  "user/cancelConnectionRequest",
  async ({ connectionId }, thunkAPI) => {
    try {
      const token = localStorage.getItem("token");
      const response = await clientServer.post("/users/user/cancel_connection_request", { token, connectionId });
      return thunkAPI.fulfillWithValue({ connectionId, message: response.data.message });
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data || { message: error.message }
      );
    }
  }
)

export const removeConnection = createAsyncThunk(
  "user/removeConnection",
  async ({ connectionId }, thunkAPI) => {
    try {
      const token = localStorage.getItem("token");
      const response = await clientServer.post("/users/user/remove_connection", { token, connectionId });
      return thunkAPI.fulfillWithValue({ connectionId, message: response.data.message });
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data || { message: error.message }
      );
    }
  }
)

export const getIncomingRequests = createAsyncThunk(
  "user/getIncomingRequests",
  async (_, thunkAPI) => {
    try {
      const token = localStorage.getItem("token");
      const response = await clientServer.post("/users/user/my_connections", { token });
      return thunkAPI.fulfillWithValue(response.data);
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data || { message: error.message }
      );
    }
  }
)

export const getOutgoingRequests = createAsyncThunk(
  "user/getOutgoingRequests",
  async (_, thunkAPI) => {
    try {
      const token = localStorage.getItem("token");
      const response = await clientServer.post("/users/user/get_connection_requests", { token });
      return thunkAPI.fulfillWithValue(response.data.connections);
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data || { message: error.message }
      );
    }
  }
)

export const acceptConnectionRequest = createAsyncThunk(
  "user/acceptConnectionRequest",
  async ({ requestId, action_type }, thunkAPI) => {
    try {
      const token = localStorage.getItem("token");
      const response = await clientServer.post("/users/user/accept_connection_request", { token, requestId, action_type });
      return thunkAPI.fulfillWithValue({ requestId, action_type, message: response.data.message });
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data || { message: error.message }
      );
    }
  }
)

export const updateUserData = createAsyncThunk(
  "user/updateUserData",
  async (userData, thunkAPI) => {
    try {
      const token = localStorage.getItem("token");
      const response = await clientServer.post("/users/user_update", userData, {
        headers: { token },
      });
      return thunkAPI.fulfillWithValue({ message: response.data.message, userData });
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data || { message: error.message }
      );
    }
  }
);

export const updateProfileData = createAsyncThunk(
  "user/updateProfileData",
  async (profileData, thunkAPI) => {
    try {
      const token = localStorage.getItem("token");
      const response = await clientServer.post("/users/update_profile_data", profileData, {
        headers: { token },
      });
      return thunkAPI.fulfillWithValue({ message: response.data.message, profileData });
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data || { message: error.message }
      );
    }
  }
);

export const getAboutUser = createAsyncThunk(
  "user/getAboutUser",
  async(user,thunkAPI) => {
    try{
      const config = {
        headers: {
          token: user.token
        }
      };
      if (user.signal) {
        config.signal = user.signal;
      }
      const response = await clientServer.get("/users/get_user_and_profile", config);

      return thunkAPI.fulfillWithValue(response.data)
    } catch (error) {
      if (error.name === 'CanceledError' || error.name === 'AbortError') {
        return thunkAPI.fulfillWithValue(null);
      }
      return thunkAPI.rejectWithValue(
        error.response?.data || { message: error.message }
      )
    }
  }
)

export const getMutualConnections = createAsyncThunk(
  "user/getMutualConnections",
  async ({ targetUserId }, thunkAPI) => {
    try {
      const response = await clientServer.get(`/users/user/mutual_connections/${targetUserId}`);
      return thunkAPI.fulfillWithValue({ targetUserId, ...response.data });
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data || { message: error.message }
      );
    }
  }
)


