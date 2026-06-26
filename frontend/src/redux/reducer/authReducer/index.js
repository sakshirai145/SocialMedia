

import { createSlice } from "@reduxjs/toolkit";

import { login, registerUser, getAboutUser, getAllProfiles, getIncomingRequests, getOutgoingRequests, acceptConnectionRequest, sendConnectionRequest, cancelConnectionRequest, removeConnection, updateProfileData, updateUserData, getMutualConnections } from "../../action/authAction";

const savedToken = typeof localStorage !== "undefined"
    ? localStorage.getItem("token")
    : null;

const initialState = {
    user: savedToken,
    isError: false,
    isSuccess: false,
    isLoading: false,
    loggedIn: Boolean(savedToken),
    message: "",
    profileFetched: false,
    connections:[],
    connectionRequests: [],
    incomingRequests: [],
    outgoingRequests: [],
    allProfiles: [],
    profilesLoading: false,
    mutualConnections: {},
};
const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        reset: (state) => {
            localStorage.removeItem("token");
            state.user = null;
            state.loggedIn = false;
            state.message = "";
            state.isError = false;
            state.isSuccess = false;
            state.isLoading = false;
            state.profileFetched = false;
            state.connections = [];
            state.connectionRequests = [];
        },
        emptyMessage: (state) => {
            state.message = "";
        }
    },

    extraReducers: (builder) => {
        builder
        .addCase(login.pending, (state) => {
            state.isLoading = true;
            state.isError = false;
            state.message = "knocking the door...";
        })
        .addCase(login.fulfilled, (state, action) => {
            state.isLoading = false;
            state.isError = false;
            state.isSuccess = true;
            state.loggedIn = true;
            state.user = action.payload;
            state.message = "login successful";
        })
        .addCase(login.rejected, (state, action) => {
            state.isLoading = false;
            state.isError = true;
            state.message = action.payload?.message || "Login failed";
        })
        .addCase(registerUser.pending, (state) => {
            state.isLoading = true;
            state.isError = false;
            state.message = "registering user...";
        })
        .addCase(registerUser.fulfilled, (state, action) => {
            state.isLoading = false;
            state.isError = false;
            state.isSuccess = true;
            state.loggedIn = true;
            state.user = action.payload;
            state.message = "registration successful";
        })
        .addCase(registerUser.rejected, (state, action) => {
            state.isLoading = false;
            state.isError = true;
            state.message = action.payload?.message || "Registration failed";
        })
        .addCase(getAboutUser.fulfilled, (state, action) => {
            state.isLoading = false;
            state.isError = false;
            if (!action.payload) return;
            state.profileFetched = true;
            const existing = typeof state.user === 'object' && state.user !== null ? state.user : {};
            state.user = {
                ...existing,
                ...action.payload,
            };
            state.connections = action.payload.connections || [];
            state.connectionRequests = action.payload.connectionRequests || [];
        })
        .addCase(getAboutUser.rejected, (state, action) => {
            state.isError = true;
            state.message = action.payload?.message || "Failed to fetch profile";
        })
        .addCase(getAllProfiles.pending, (state) => {
            state.profilesLoading = true;
        })
        .addCase(getAllProfiles.fulfilled, (state, action) => {
            state.profilesLoading = false;
            const raw = action.payload.profiles || [];
            const seen = new Set();
            state.allProfiles = raw.filter((p) => {
              const id = p._id || p.userId?._id;
              if (!id || seen.has(id.toString())) return false;
              seen.add(id.toString());
              return true;
            });
        })
        .addCase(getAllProfiles.rejected, (state, action) => {
            state.profilesLoading = false;
            state.isError = true;
            state.message = action.payload?.message || "Failed to fetch profiles";
        })
        .addCase(getIncomingRequests.fulfilled, (state, action) => {
            state.incomingRequests = action.payload;
        })
        .addCase(getOutgoingRequests.fulfilled, (state, action) => {
            state.outgoingRequests = action.payload;
        })
        .addCase(acceptConnectionRequest.fulfilled, (state, action) => {
            const { requestId, action_type } = action.payload;
            state.incomingRequests = state.incomingRequests.map((r) =>
                r._id === requestId ? { ...r, status_accepted: action_type === "accept" } : r
            );
            state.message = action.payload.message;
        })
        .addCase(sendConnectionRequest.fulfilled, (state, action) => {
            state.message = action.payload.message;
        })
        .addCase(cancelConnectionRequest.fulfilled, (state, action) => {
            const { connectionId } = action.payload;
            state.outgoingRequests = state.outgoingRequests.filter((r) =>
                !(r.connectionId?._id?.toString() === connectionId && r.status_accepted === null)
            );
            state.message = action.payload.message;
        })
        .addCase(cancelConnectionRequest.rejected, (state, action) => {
            state.message = action.payload?.message || action.error?.message || "Cancel request failed";
        })
        .addCase(removeConnection.fulfilled, (state, action) => {
            const { connectionId } = action.payload;
            state.outgoingRequests = state.outgoingRequests.filter((r) =>
                !(r.connectionId?._id?.toString() === connectionId && r.status_accepted === true)
            );
            state.incomingRequests = state.incomingRequests.filter((r) =>
                !(r.userId?._id?.toString() === connectionId && r.status_accepted === true)
            );
            state.message = action.payload.message;
        })
        .addCase(updateProfileData.fulfilled, (state, action) => {
            state.message = action.payload.message;
            if (state.user && typeof state.user === 'object' && action.payload.profileData) {
                Object.assign(state.user, action.payload.profileData);
            }
        })
        .addCase(updateUserData.fulfilled, (state, action) => {
            state.message = action.payload.message;
        })
        .addCase(getMutualConnections.pending, (state, action) => {
            const { targetUserId } = action.meta.arg;
            state.mutualConnections[targetUserId] = {
                ...state.mutualConnections[targetUserId],
                loading: true
            };
        })
        .addCase(getMutualConnections.fulfilled, (state, action) => {
            const { targetUserId, count, users } = action.payload;
            state.mutualConnections[targetUserId] = { count, users, loading: false };
        })
        .addCase(getMutualConnections.rejected, (state, action) => {
            const { targetUserId } = action.meta.arg;
            state.mutualConnections[targetUserId] = { count: 0, users: [], loading: false };
        });
    },
});

export const { reset, emptyMessage } = authSlice.actions;
export default authSlice.reducer;
