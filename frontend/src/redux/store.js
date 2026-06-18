import { configureStore } from "@reduxjs/toolkit";

import authReducer from "./reducer/authReducer";
import postReducer from "./reducer/postReducer";

const store = configureStore({
  reducer: {
    posts: postReducer,
    auth: authReducer,
  },
});

export default store;



