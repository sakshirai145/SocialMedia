import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import styles from "./Feed.module.css";

function StrengthBadge({ score }) {
  if (score >= 80) return <span className={`${styles.strengthBadge} ${styles.badgeStrong}`}>Strong</span>;
  if (score >= 60) return <span className={`${styles.strengthBadge} ${styles.badgeGood}`}>Good</span>;
  if (score >= 40) return <span className={`${styles.strengthBadge} ${styles.badgeFair}`}>Fair</span>;
  return <span className={`${styles.strengthBadge} ${styles.badgeWeak}`}>Weak</span>;
}

function CircularProgress({ score }) {
  const radius = 26;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className={styles.strengthCircle}>
      <svg viewBox="0 0 60 60">
        <circle className={styles.strengthCircleBg} cx="30" cy="30" r={radius} />
        <circle
          className={styles.strengthCircleFill}
          cx="30"
          cy="30"
          r={radius}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <span className={styles.strengthCircleLabel}>{score}%</span>
    </div>
  );
}

export default function FeedRightSidebar() {
  const navigate = useNavigate();
  const { user, allProfiles, incomingRequests, outgoingRequests } = useSelector((state) => state.auth);
  const { myPosts } = useSelector((state) => state.posts);

  const currentUserId = user?.userId?._id;

  const acceptedIncoming = (incomingRequests || []).filter((r) => r.status_accepted === true);
  const acceptedOutgoing = (outgoingRequests || []).filter((r) => r.status_accepted === true);
  const pendingIncoming = (incomingRequests || []).filter((r) => r.status_accepted === null);
  const pendingOutgoing = (outgoingRequests || []).filter((r) => r.status_accepted === null);

  const excludeIds = new Set();
  if (currentUserId) excludeIds.add(currentUserId);
  [...acceptedIncoming, ...acceptedOutgoing, ...pendingIncoming, ...pendingOutgoing].forEach((req) => {
    const u = req.userId?._id ? req.userId : req.connectionId;
    if (u?._id) excludeIds.add(u._id.toString());
  });

  const suggestions = (allProfiles || [])
    .filter((p) => {
      const id = p.userId?._id;
      return id && !excludeIds.has(id.toString());
    })
    .filter((p, i, arr) => {
      const id = p.userId?._id?.toString();
      if (!id) return false;
      return arr.findIndex((x) => x.userId?._id?.toString() === id) === i;
    })
    .slice(0, 3);

  const recentActivity = (myPosts || []).slice(0, 3);

  const profileStrength = getProfileStrength(user);

  return (
    <div className={styles.rightSidebar}>
      <div className={styles.widget}>
        <h4 className={styles.widgetTitle}>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
          </svg>
          Profile Strength
        </h4>
        <div className={styles.strengthContainer}>
          <CircularProgress score={profileStrength} />
          <div className={styles.strengthInfo}>
            <p className={styles.strengthTitle}>Profile Completion</p>
            <p className={styles.strengthLabel}>{profileStrength}% complete</p>
            <StrengthBadge score={profileStrength} />
          </div>
        </div>
      </div>

      <div className={styles.widget}>
        <h4 className={styles.widgetTitle}>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
          </svg>
          Suggested Connections
        </h4>
        {suggestions.length === 0 ? (
          <p className={styles.widgetEmpty}>No suggestions yet</p>
        ) : (
          <div className={styles.suggestionList}>
            {suggestions.map((p) => {
              const u = p.userId || {};
              return (
                <div
                  key={p._id}
                  className={styles.suggestionItem}
                  onClick={() => navigate(`/user/${u._id}`)}
                >
                  <div className={styles.suggestionAvatar}>
                    {u.profilePicture ? (
                      <img src={`http://localhost:9080/${u.profilePicture}`} alt="" />
                    ) : (
                      <span>{u.name?.charAt(0)?.toUpperCase() || "?"}</span>
                    )}
                  </div>
                  <div className={styles.suggestionInfo}>
                    <p className={styles.suggestionName}>{u.name || "Unknown"}</p>
                    <p className={styles.suggestionUsername}>@{u.username || "unknown"}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className={styles.widget}>
        <h4 className={styles.widgetTitle}>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Recent Activity
        </h4>
        {recentActivity.length === 0 ? (
          <p className={styles.widgetEmpty}>No recent activity</p>
        ) : (
          <div className={styles.activityList}>
            {recentActivity.map((post) => (
              <div key={post._id} className={styles.activityItem}>
                <div className={styles.activityIcon}>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 0 1-.923 1.785A5.969 5.969 0 0 0 6 21c1.282 0 2.47-.402 3.445-1.087.81.22 1.668.337 2.555.337Z" />
                  </svg>
                </div>
                <div>
                  <p className={styles.activityText}>
                    {post.body?.length > 60 ? post.body.slice(0, 60) + "..." : post.body}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function getProfileStrength(user) {
  if (!user?.userId) return 0;
  const u = user.userId;
  let score = 0;
  if (u.name) score += 20;
  if (u.headline) score += 20;
  if (u.profilePicture) score += 20;
  if (u.bio) score += 20;
  if (u.username) score += 10;
  if (u.location) score += 10;
  return Math.min(score, 100);
}
