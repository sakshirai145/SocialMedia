import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { deletePost, likePost } from "../../redux/action/postAction";

import CommentSection from "../commentSection/CommentSection";
import styles from "./PostCard.module.css";

export default function PostCard({ post, onClick }) {
  const dispatch = useDispatch();
  const [showComments, setShowComments] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [copied, setCopied] = useState(false);
  const currentUserId = useSelector((s) => s.auth.user?.userId?._id);
  const user = post.userId || {};
  const timeAgo = formatTimeAgo(post.createdAt);

  const likedBy = post.likedBy || [];
  const isLiked = currentUserId && likedBy.some(
    (id) => (typeof id === "string" ? id : id._id || id.toString()) === currentUserId
  );

  const postUserId = (user._id || user).toString();
  const isOwner = currentUserId && postUserId === currentUserId;

  const handleLike = () => {
    dispatch(likePost({ postId: post._id }));
  };

  const handleShare = () => {
    const shareText = `${user.name} posted on SocialMedia:\n"${post.body}"`;
    const url = window.location.href.split('?')[0];
    const fullText = `${shareText}\n${url}`;
    navigator.clipboard.writeText(fullText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    if (window.confirm("Delete this post?")) {
      setDeleting(true);
      dispatch(deletePost({ postId: post._id })).finally(() => setDeleting(false));
    }
  };

  return (
    <div className={`${styles.card} ${onClick ? styles.clickable : ""} ${deleting ? styles.cardDeleting : ""}`} onClick={onClick}>
      {post.media && (
        <div className={styles.media}>
          {post.fileType?.startsWith("image") || ["jpg","jpeg","png","gif","webp"].includes(post.fileType) ? (
            <img src={`http://localhost:9080/${post.media}`} alt="Post media" />
          ) : (
            <video src={`http://localhost:9080/${post.media}`} controls />
          )}
        </div>
      )}

      <div className={styles.content}>
        <div className={styles.header}>
          <div className={styles.avatar}>
            {user.profilePicture ? (
              <img src={`http://localhost:9080/${user.profilePicture}`} alt={user.name} />
            ) : (
              <span>{user.name?.charAt(0)?.toUpperCase() || "?"}</span>
            )}
          </div>
          <div className={styles.userInfo}>
            <p className={styles.name}>{user.name || "Unknown User"}</p>
            <p className={styles.username}>@{user.username || "unknown"}</p>
          </div>
          <div className={styles.headerRight}>
            <p className={styles.time}>{timeAgo}</p>
            {isOwner && (
              <button className={`${styles.deleteBtn} ${deleting ? styles.deleting : ""}`} type="button" onClick={handleDelete} title="Delete post">
                {deleting ? (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" width="16" height="16">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" width="16" height="16">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                  </svg>
                )}
                <span>Delete</span>
              </button>
            )}
          </div>
        </div>

        <p className={styles.body}>{post.body}</p>

        <div className={styles.footer}>
          <div className={styles.actions}>
            <button
              className={`${styles.actionBtn} ${isLiked ? styles.liked : ""}`}
              type="button"
              onClick={handleLike}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill={isLiked ? "#1877f2" : "none"} viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" width="20" height="20">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.633 10.25c.806 0 1.533-.446 2.031-1.08a9.041 9.041 0 0 1 2.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 0 0 .322-1.672V2.75a.75.75 0 0 1 .75-.75 2.25 2.25 0 0 1 2.25 2.25c0 1.152-.26 2.243-.723 3.218-.266.558.107 1.282.725 1.282m0 0h3.126c1.026 0 1.945.694 2.054 1.715.045.422.068.85.068 1.285a11.95 11.95 0 0 1-2.649 7.521c-.388.482-.987.729-1.605.729H13.48c-.483 0-.964-.078-1.423-.23l-3.114-1.04a4.501 4.501 0 0 0-1.423-.23H5.904m10.598-9.75H14.25M5.904 18.5c.083.205.173.405.27.602.197.4-.078.898-.523.898h-.908c-.889 0-1.713-.518-1.972-1.368a12 12 0 0 1-.521-3.507c0-1.553.295-3.036.831-4.398C3.387 9.953 4.167 9.5 5 9.5h1.053c.472 0 .745.556.5.96a8.958 8.958 0 0 0-1.302 4.665c0 1.194.232 2.333.654 3.375Z" />
              </svg>
              <span>Like{post.likes > 0 && ` (${post.likes})`}</span>
            </button>
            <button
              className={`${styles.actionBtn} ${showComments ? styles.activeComment : ""}`}
              type="button"
              onClick={() => setShowComments((prev) => !prev)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" width="20" height="20">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 0 1-.923 1.785A5.969 5.969 0 0 0 6 21c1.282 0 2.47-.402 3.445-1.087.81.22 1.668.337 2.555.337Z" />
              </svg>
              <span>Comment</span>
            </button>
            <button
              className={`${styles.actionBtn} ${copied ? styles.copied : ""}`}
              type="button"
              onClick={handleShare}
            >
              {copied ? (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" width="20" height="20">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" width="20" height="20">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 1 0 0 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186 9.566-5.314m-9.566 7.5 9.566 5.314m0 0a2.25 2.25 0 1 0 3.935 2.186 2.25 2.25 0 0 0-3.935-2.186Zm0-12.814a2.25 2.25 0 1 0 3.933-2.185 2.25 2.25 0 0 0-3.933 2.185Z" />
                </svg>
              )}
              <span>{copied ? "Copied!" : "Share"}</span>
            </button>
          </div>
        </div>
      </div>

      {showComments && <CommentSection postId={post._id} />}
    </div>
  );
}

function formatTimeAgo(dateString) {
  if (!dateString) return "";
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHrs = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHrs / 24);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHrs < 24) return `${diffHrs}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}
