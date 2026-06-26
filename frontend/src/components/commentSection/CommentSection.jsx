import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import { getComments, createComment } from "../../redux/action/postAction";
import EmojiPicker from "../emojiPicker/EmojiPicker";

import styles from "./CommentSection.module.css";

export default function CommentSection({ postId }) {
  const dispatch = useDispatch();
  const currentUser = useSelector((s) => s.auth.user?.userId);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    if (!postId) return;
    setLoading(true);
    dispatch(getComments({ postId })).then((res) => {
      if (res.meta.requestStatus === "fulfilled") {
        setComments(res.payload.comments);
      }
      setLoading(false);
    });
  }, [postId, dispatch]);

  const handleEmojiSelect = (emoji) => {
    const el = inputRef.current;
    if (!el) {
      setText((prev) => prev + emoji);
      return;
    }
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const newText = text.slice(0, start) + emoji + text.slice(end);
    setText(newText);
    requestAnimationFrame(() => {
      el.setSelectionRange(start + emoji.length, start + emoji.length);
      el.focus();
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;

    setSubmitting(true);
    const res = await dispatch(createComment({ postId, body: text }));
    if (res.meta.requestStatus === "fulfilled") {
      setComments((prev) => [res.payload.comment, ...prev]);
      setText("");
    }
    setSubmitting(false);
  };

  return (
    <div className={styles.container}>
      {loading && <p className={styles.loadingText}>Loading comments...</p>}

      {!loading && comments.length === 0 && (
        <p className={styles.emptyText}>No comments yet.</p>
      )}

      {comments.length > 0 && (
        <div className={styles.list}>
          {comments.map((c) => (
            <div key={c._id} className={styles.comment}>
              <div className={styles.avatar}>
                {c.userId?.profilePicture ? (
                  <img src={`https://socialmedia-3yhq.onrender.com/uploads/${c.userId.profilePicture}`} alt="" />
                ) : (
                  <span>{c.userId?.name?.charAt(0)?.toUpperCase() || "?"}</span>
                )}
              </div>
              <div className={styles.body}>
                <p className={styles.commentName}>{c.userId?.name || "Unknown"}</p>
                <p className={styles.commentText}>{c.body}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      <form className={styles.form} onSubmit={handleSubmit}>
        <EmojiPicker onSelect={handleEmojiSelect} />
        <input
          ref={inputRef}
          className={styles.input}
          placeholder="Write a comment..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <button
          type="submit"
          className={styles.submitBtn}
          disabled={submitting || !text.trim()}
        >
          {submitting ? "..." : "Post"}
        </button>
      </form>
    </div>
  );
}
