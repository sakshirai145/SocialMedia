import { useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";

import { createPost } from "../../redux/action/postAction";

import styles from "./CreatePost.module.css";

export default function CreatePost() {
  const dispatch = useDispatch();
  const { isCreating, message } = useSelector((state) => state.posts);
  const token = localStorage.getItem("token");

  const [body, setBody] = useState("");
  const [media, setMedia] = useState(null);
  const [preview, setPreview] = useState("");
  const fileRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setMedia(file);
    setPreview(URL.createObjectURL(file));
  };

  const clearMedia = () => {
    setMedia(null);
    setPreview("");
    if (fileRef.current) fileRef.current.value = "";
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!body.trim()) return;

    const formData = new FormData();
    formData.append("token", token);
    formData.append("body", body);
    if (media) formData.append("media", media);

    dispatch(createPost(formData)).then(() => {
      setBody("");
      clearMedia();
    });
  };

  return (
    <div className={styles.container}>
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.heading}>Create Post</div>

        <textarea
          className={styles.textarea}
          placeholder="What's on your mind?"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={3}
        />

        {preview && (
          <div className={styles.preview}>
            {media?.type?.startsWith("video/") ? (
              <video src={preview} controls />
            ) : (
              <img src={preview} alt="Preview" />
            )}
            <button type="button" className={styles.removeMedia} onClick={clearMedia}>
              &times;
            </button>
          </div>
        )}

        <div className={styles.footer}>
          <button
            type="button"
            className={styles.mediaBtn}
            onClick={() => fileRef.current?.click()}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" width="20" height="20">
              <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0 0 22.5 18.75V5.25A2.25 2.25 0 0 0 20.25 3H3.75A2.25 2.25 0 0 0 1.5 5.25v13.5A2.25 2.25 0 0 0 3.75 21Z" />
            </svg>
            <span>Add Media</span>
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*,video/*"
            hidden
            onChange={handleFileChange}
          />

          <button
            type="submit"
            className={styles.submitBtn}
            disabled={isCreating || !body.trim()}
          >
            {isCreating ? "Posting..." : "Post"}
          </button>
        </div>

        {message && <p className={styles.message}>{message}</p>}
      </form>
    </div>
  );
}
