import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import DashboardLayout from "../../layout/DashboardLayout";
import PostCard from "../../components/postCard/PostCard";
import { getAllPosts } from "../../redux/action/postAction";

import styles from "./postDetail.module.css";

export default function PostDetail() {
  const { postId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { posts, isLoading, postFetched } = useSelector((s) => s.posts);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!postFetched && !isLoading) {
      dispatch(getAllPosts()).then(() => setLoaded(true));
    } else if (postFetched) {
      setLoaded(true);
    }
  }, [dispatch, postFetched, isLoading]);

  const post = posts.find((p) => p._id === postId);

  return (
    <DashboardLayout>
      <div className={styles.container}>
        <button className={styles.backBtn} onClick={() => navigate(-1)}>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" width="20" height="20">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
          </svg>
          Back
        </button>

        {!loaded && (
          <div className={styles.loading}>
            <div className={styles.spinner} />
            <p>Loading post...</p>
          </div>
        )}

        {loaded && !post && (
          <div className={styles.empty}>
            <p>Post not found.</p>
          </div>
        )}

        {post && (
          <div className={styles.postWrap}>
            <PostCard post={post} />
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
