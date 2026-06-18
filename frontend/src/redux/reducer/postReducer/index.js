import { createSlice } from "@reduxjs/toolkit";
import { getAllPosts, createPost, getMyPosts, deletePost, likePost } from "../../action/postAction";

const initialState = {
    posts: [],
    myPosts: [],
    postFetched: false,
    myPostsFetched: false,
    isLoading: false,
    myPostsLoading: false,
    isCreating: false,
    message: "",
    postId:"",
}

const postSlice = createSlice({
    name:"post",
    initialState,
    reducers:{
        reset:() => initialState,
        resetPostId:(state) => {
            state.postId = "";
        }
    },
    extraReducers:(builder) => {
        builder
        .addCase(getAllPosts.pending, (state) => {
            state.isLoading = true;
            state.message = "fetching posts...";
        })
        .addCase(getAllPosts.fulfilled, (state, action) => {
            state.isLoading = false;
            state.isError = false;
            state.postFetched = true;
            state.posts = action.payload.posts;
        })
        .addCase(getAllPosts.rejected, (state, action) => {
            state.isLoading = false;
            state.isError = true;
            state.message = action.payload?.message || "Failed to fetch posts";
        })
        .addCase(getMyPosts.pending, (state) => {
            state.myPostsLoading = true;
        })
        .addCase(getMyPosts.fulfilled, (state, action) => {
            state.myPostsLoading = false;
            state.myPostsFetched = true;
            state.myPosts = action.payload.posts;
        })
        .addCase(getMyPosts.rejected, (state) => {
            state.myPostsLoading = false;
            state.myPostsFetched = true;
        })
        .addCase(deletePost.fulfilled, (state, action) => {
            const { postId } = action.payload;
            state.posts = state.posts.filter((p) => p._id !== postId);
            state.myPosts = state.myPosts.filter((p) => p._id !== postId);
        })
        .addCase(createPost.pending, (state) => {
            state.isCreating = true;
            state.message = "";
        })
        .addCase(createPost.fulfilled, (state, action) => {
            state.isCreating = false;
            state.isError = false;
            state.posts.unshift(action.payload.post);
            state.myPosts.unshift(action.payload.post);
            state.message = "Post created!";
        })
        .addCase(createPost.rejected, (state, action) => {
            state.isCreating = false;
            state.isError = true;
            state.message = action.payload?.message || "Failed to create post";
        })
        .addCase(likePost.fulfilled, (state, action) => {
            const updated = action.payload.post;
            const idx = state.posts.findIndex((p) => p._id === updated._id);
            if (idx !== -1) {
                state.posts[idx].likes = updated.likes;
                state.posts[idx].likedBy = updated.likedBy;
            }
        })
        .addCase(likePost.rejected, (state, action) => {
            state.isError = true;
            state.message = action.payload?.message || "Failed to like post";
        })
    }
});

export default postSlice.reducer;