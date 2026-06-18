import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import FeedLayout from "../../layout/FeedLayout/FeedLayout";
import FeedSidebar from "./FeedSidebar";
import FeedRightSidebar from "./FeedRightSidebar";
import FeedCreatePost from "./FeedCreatePost";
import FeedPostCard from "./FeedPostCard";
import { getAllPosts, getMyPosts } from "../../redux/action/postAction";
import {
  getAboutUser,
  getAllProfiles,
  getIncomingRequests,
  getOutgoingRequests,
} from "../../redux/action/authAction";

import styles from "./Feed.module.css";

export default function Dashboard() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { posts, isLoading, postFetched } = useSelector((state) => state.posts);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token === null) {
      navigate("/login");
      return;
    }
    dispatch(getAllPosts());
    dispatch(getMyPosts());
    dispatch(getAboutUser({ token }));
    dispatch(getAllProfiles());
    dispatch(getIncomingRequests());
    dispatch(getOutgoingRequests());
  }, [navigate, dispatch]);

  return (
    <FeedLayout
      leftSidebar={<FeedSidebar />}
      rightSidebar={<FeedRightSidebar />}
    >
      <FeedCreatePost />

      <div id="feed-posts" className={styles.feed}>
        {isLoading && !postFetched && (
          <div className={styles.loading}>
            <div className={styles.spinner} />
            <p>Loading posts...</p>
          </div>
        )}

        {postFetched && posts?.length === 0 && (
          <div className={styles.empty}>
            <p>No posts yet. Be the first to share something!</p>
          </div>
        )}

        {postFetched &&
          posts.map((post) => <FeedPostCard key={post._id} post={post} />)}
      </div>
    </FeedLayout>
  );
}
