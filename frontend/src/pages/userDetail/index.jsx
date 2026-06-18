import { useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import DashboardLayout from "../../layout/DashboardLayout";
import PostCard from "../../components/postCard/PostCard";
import { getAllPosts } from "../../redux/action/postAction";
import { getAllProfiles, getMutualConnections } from "../../redux/action/authAction";

import styles from "./userDetail.module.css";

export default function UserDetail() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { posts, isLoading, postFetched } = useSelector((s) => s.posts);
  const { allProfiles, profilesLoading, mutualConnections } = useSelector((s) => s.auth);

  useEffect(() => {
    dispatch(getAllPosts());
    dispatch(getAllProfiles());
  }, [dispatch]);

  const fetchedMutualRef = useRef(new Set());
  useEffect(() => {
    if (userId && !fetchedMutualRef.current.has(userId)) {
      fetchedMutualRef.current.add(userId);
      dispatch(getMutualConnections({ targetUserId: userId }));
    }
  }, [userId, dispatch]);

  const profile = (allProfiles || []).find((p) => p.userId?._id === userId);
  const user = profile?.userId || {};
  const userPosts = posts.filter((p) => p.userId?._id === userId);

  return (
    <DashboardLayout>
      <div className={styles.container}>
        <button className={styles.backBtn} onClick={() => navigate(-1)}>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" width="20" height="20">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
          </svg>
          Back
        </button>

        {!profile && !profilesLoading && (
          <div className={styles.empty}>
            <p>User not found.</p>
          </div>
        )}

        {(profilesLoading || isLoading) && !profile && (
          <div className={styles.loading}>
            <div className={styles.spinner} />
            <p>Loading user...</p>
          </div>
        )}

        {profile && (
          <>
            <div className={styles.profileCard}>
              <div className={styles.banner} />
              <div className={styles.profileContent}>
                <div className={styles.avatar}>
                  {user.profilePicture ? (
                    <img src={`https://socialmedia-3yhq.onrender.com/${user.profilePicture}`} alt="" />
                  ) : (
                    <span>{user.name?.charAt(0)?.toUpperCase() || "?"}</span>
                  )}
                </div>
                <h1 className={styles.name}>{user.name || "Unknown"}</h1>
                <p className={styles.username}>@{user.username || "unknown"}</p>
                <p className={styles.userId}>ID: {user._id}</p>
                <p className={styles.postCount}>{userPosts.length} post{userPosts.length !== 1 ? "s" : ""}</p>
                {mutualConnections[userId]?.count > 0 && (
                  <p className={styles.mutualCount}>
                    {mutualConnections[userId].count} Mutual Connection{mutualConnections[userId].count !== 1 ? "s" : ""}
                  </p>
                )}
              </div>
            </div>

            {userPosts.length === 0 && postFetched && (
              <div className={styles.empty}>
                <p>This user hasn't posted anything yet.</p>
              </div>
            )}

            <div className={styles.grid}>
              {userPosts.map((post) => (
                <PostCard key={post._id} post={post} onClick={() => navigate(`/post/${post._id}`)} />
              ))}
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
