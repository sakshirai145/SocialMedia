
import { createAsyncThunk } from "@reduxjs/toolkit";
import { clientServer } from "../../../config.js";

export const getAllPosts = createAsyncThunk(
    "post/getallPosts",
    async(_,thunkAPI) => {
       try{
         const response = await clientServer.get('/posts/all')

         return thunkAPI.fulfillWithValue(response.data)
       } catch (error) {
         return thunkAPI.rejectWithValue(
           error.response?.data || { message: error.message }
         )
       }
    }
)

export const createPost = createAsyncThunk(
  "post/createPost",
  async (postData, thunkAPI) => {
    try {
      const response = await clientServer.post("/posts/post", postData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const authUser = thunkAPI.getState().auth.user;
      const userIdData = authUser?.userId || authUser;

      const enriched = {
        ...response.data.post,
        userId: typeof userIdData === "object" && userIdData?._id
          ? userIdData
          : response.data.post.userId,
      };

      return thunkAPI.fulfillWithValue({ post: enriched });
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data || { message: error.message }
      );
    }
  }
)

export const getComments = createAsyncThunk(
  "post/getComments",
  async ({ postId }, thunkAPI) => {
    try {
      const response = await clientServer.get(`/posts/comments?postId=${postId}`);
      return thunkAPI.fulfillWithValue({ postId, comments: response.data.comments });
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data || { message: error.message }
      );
    }
  }
)

export const createComment = createAsyncThunk(
  "post/createComment",
  async ({ postId, body }, thunkAPI) => {
    try {
      const token = localStorage.getItem("token");
      const response = await clientServer.post("/posts/comment", { token, postId, body });
      return thunkAPI.fulfillWithValue({ postId, comment: response.data.comment });
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data || { message: error.message }
      );
    }
  }
)

export const deletePost = createAsyncThunk(
  "post/deletePost",
  async ({ postId }, thunkAPI) => {
    try {
      const token = localStorage.getItem("token");
      await clientServer.post("/posts/delete", { token, postId });
      return thunkAPI.fulfillWithValue({ postId });
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data || { message: error.message }
      );
    }
  }
);

export const getMyPosts = createAsyncThunk(
  "post/getMyPosts",
  async (_, thunkAPI) => {
    try {
      const token = localStorage.getItem("token");
      const response = await clientServer.get("/users/user/my_posts", {
        headers: { token },
      });
      return thunkAPI.fulfillWithValue(response.data);
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data || { message: error.message }
      );
    }
  }
);

export const likePost = createAsyncThunk(
  "post/likePost",
  async ({ postId }, thunkAPI) => {
    try {
      const token = localStorage.getItem("token");
      const response = await clientServer.post("/posts/like", { postId, token });
      return thunkAPI.fulfillWithValue(response.data);
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data || { message: error.message }
      );
    }
  }
)