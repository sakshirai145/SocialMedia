import { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import DashboardLayout from "../../layout/DashboardLayout";
import PostCard from "../../components/postCard/PostCard";
import { getAllPosts } from "../../redux/action/postAction";
import { getAllProfiles } from "../../redux/action/authAction";

import styles from "./discover.module.css";

export default function Discoverpage(){
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [search, setSearch] = useState("");
    const { posts, isLoading, postFetched } = useSelector((state) => state.posts);
    const { user, allProfiles } = useSelector((state) => state.auth);
    const currentUserId = user?.userId?._id;

    useEffect(() => {
        dispatch(getAllPosts());
        dispatch(getAllProfiles());
    }, [dispatch]);

    const matchedUsers = useMemo(() => {
        const q = search.trim().toLowerCase();
        if (!q) return [];
        return (allProfiles || []).filter((p) => {
            const u = p.userId || {};
            if (currentUserId && u._id?.toString() === currentUserId.toString()) return false;
            return (
                u._id?.toLowerCase().includes(q) ||
                u.name?.toLowerCase().includes(q) ||
                u.username?.toLowerCase().includes(q)
            );
        });
    }, [search, allProfiles, currentUserId]);

    const matchedIds = useMemo(() => {
        const ids = new Set();
        matchedUsers.forEach((p) => {
            if (p.userId?._id) ids.add(p.userId._id);
        });
        return ids;
    }, [matchedUsers]);

    const filteredPosts = useMemo(() => {
        if (!search.trim()) return posts;
        return posts.filter((p) => matchedIds.has(p.userId?._id));
    }, [search, posts, matchedIds]);

    const showNoResults = search.trim() && matchedUsers.length === 0 && postFetched && !isLoading;

    return(
        <DashboardLayout wide>
            <div className={styles.wrapper}>
                <div className={styles.stickySearch}>
                    <div className={styles.searchWrap}>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" width="18" height="18">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                        </svg>
                        <input
                            className={styles.searchInput}
                            type="text"
                            placeholder="Enter a user ID, name, or username..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>

                {matchedUsers.length > 0 && (
                    <div className={styles.matchedUsers}>
                        {matchedUsers.map((p) => {
                            const user = p.userId || {};
                            return (
                            <div key={p._id} className={styles.userTag} onClick={() => navigate(`/user/${user._id}`)}>
                                <div className={styles.userTagAvatar}>
                                        {user.profilePicture ? (
                                            <img src={`https://socialmedia-3yhq.onrender.com/${user.profilePicture}`} alt="" />
                                        ) : (
                                            <span>{user.name?.charAt(0)?.toUpperCase() || "?"}</span>
                                        )}
                                    </div>
                                    <div>
                                        <p className={styles.userTagName}>{user.name || "Unknown"}</p>
                                        <p className={styles.userTagUsername}>@{user.username || "unknown"}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {isLoading && !postFetched && (
                    <div className={styles.loading}>
                        <div className={styles.spinner} />
                        <p>Loading posts...</p>
                    </div>
                )}

                {showNoResults && (
                    <div className={styles.empty}>
                        <p>No users found matching "{search.trim()}".</p>
                    </div>
                )}

                {postFetched && !search.trim() && filteredPosts.length === 0 && (
                    <div className={styles.empty}>
                        <p>No posts yet.</p>
                    </div>
                )}

                {matchedUsers.length > 0 && filteredPosts.length === 0 && postFetched && (
                    <div className={styles.empty}>
                        <p>These users haven't posted anything yet.</p>
                    </div>
                )}

                <div className={styles.grid}>
                    {filteredPosts.map((post) => (
                        <PostCard key={post._id} post={post} onClick={() => navigate(`/post/${post._id}`)} />
                    ))}
                </div>
            </div>
        </DashboardLayout>
    )
}
