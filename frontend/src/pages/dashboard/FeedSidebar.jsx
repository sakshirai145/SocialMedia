import { useNavigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import styles from "./Feed.module.css";

const navItems = [
  { path: "/dashboard", label: "Feed", icon: "M2.25 12l8.954-8.955a1.126 1.126 0 011.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" },
  { path: "/discover", label: "Discover", icon: "M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" },
  { path: "/profile", label: "Profile", icon: "M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" },
  { path: "/my_connections", label: "Connections", icon: "M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" },
];

export default function FeedSidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, incomingRequests, outgoingRequests } = useSelector((state) => state.auth);
  const { myPosts } = useSelector((state) => state.posts);

  const acceptedIncoming = (incomingRequests || []).filter((r) => r.status_accepted === true);
  const acceptedOutgoing = (outgoingRequests || []).filter((r) => r.status_accepted === true);
  const pendingOutgoing = (outgoingRequests || []).filter((r) => r.status_accepted === null);

  const connectedIds = new Set();
  const allConnections = [...acceptedIncoming, ...acceptedOutgoing].filter((req) => {
    const connUser = req.userId?._id ? req.userId : req.connectionId;
    if (!connUser || !connUser._id) return false;
    const id = connUser._id.toString();
    if (connectedIds.has(id) || id === user?.userId?._id) return false;
    connectedIds.add(id);
    return true;
  });

  const realPendingOutgoing = pendingOutgoing.filter((req) => {
    const connUser = req.connectionId;
    if (!connUser || !connUser._id) return false;
    return !connectedIds.has(connUser._id.toString());
  }).filter((req, i, arr) => {
    const id = req.connectionId?._id?.toString();
    if (!id) return false;
    return arr.findIndex((x) => x.connectionId?._id?.toString() === id) === i;
  });

  const avatarUrl = user?.userId?.profilePicture
    ? `http://localhost:9080/${user.userId.profilePicture}`
    : null;

  return (
    <div className={styles.sidebar}>
      <div className={styles.profileCard}>
        <div className={styles.profileAvatar}>
          {avatarUrl ? (
            <img src={avatarUrl} alt={user?.userId?.name} />
          ) : (
            <span>{user?.userId?.name?.charAt(0)?.toUpperCase() || "?"}</span>
          )}
        </div>
        <h3 className={styles.profileName}>{user?.userId?.name || "User"}</h3>
        <p className={styles.profileHeadline}>{user?.userId?.headline || ""}</p>

        <div className={styles.profileStats}>
          <button
            type="button"
            className={styles.profileStat}
            onClick={() => {
              const el = document.getElementById("feed-posts");
              if (el) {
                el.scrollIntoView({ behavior: "smooth" });
                el.classList.add(styles.feedHighlight);
                setTimeout(() => el.classList.remove(styles.feedHighlight), 1000);
              }
            }}
            title="Your posts"
          >
            <span className={styles.statValue}>{myPosts?.length || 0}</span>
            <span className={styles.statLabel}>Posts</span>
          </button>
          <button
            type="button"
            className={styles.profileStat}
            onClick={() => navigate("/my_connections")}
            title="Your connections"
          >
            <span className={styles.statValue}>{allConnections.length}</span>
            <span className={styles.statLabel}>Connections</span>
          </button>
          <button
            type="button"
            className={styles.profileStat}
            onClick={() => navigate("/my_connections")}
            title="Pending requests"
          >
            <span className={styles.statValue}>{realPendingOutgoing.length}</span>
            <span className={styles.statLabel}>Requests</span>
          </button>
        </div>
      </div>

      <nav className={styles.nav}>
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <button
              key={item.path}
              className={`${styles.navItem} ${isActive ? styles.navItemActive : ""}`}
              onClick={() => navigate(item.path)}
              type="button"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" width="20" height="20">
                <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
              </svg>
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
