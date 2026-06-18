import { useMemo, useState, useEffect } from "react";
import styles from "./styles.module.css";

const FIELDS = [
  { key: "profilePhoto", label: "Profile Photo" },
  { key: "coverPhoto", label: "Cover Photo" },
  { key: "bio", label: "Bio" },
  { key: "education", label: "Education" },
  { key: "experience", label: "Work Experience" },
  { key: "skills", label: "Skills" },
  { key: "interests", label: "Interests" },
  { key: "growthJourney", label: "Growth Journey" },
  { key: "dateOfBirth", label: "Date of Birth" },
];

const MOTIVATION = {
  beginner: "Profiles with complete information receive more connection requests and opportunities.",
  intermediate: "You're making progress. Every completed section boosts your visibility.",
  advanced: "Almost there! Just a few steps away from an All-Star profile.",
  allstar: "Your profile stands out! You're ready to connect and grow.",
};

export function calcProfileStrength(profile, user) {
  const profilePicture = user?.profilePicture;
  const bio = profile?.bio;
  const coverPicture = profile?.coverPicture;
  const education = profile?.education;
  const postwork = profile?.postwork;
  const skills = profile?.skills;
  const interests = profile?.interests;
  const growthJourney = profile?.growthJourney;
  const dateOfBirth = profile?.dateOfBirth;

  const checks = {
    profilePhoto: profilePicture && profilePicture !== "default.jpg",
    coverPhoto: Boolean(coverPicture),
    bio: Boolean(bio),
    education: Array.isArray(education) && education.length > 0,
    experience: Array.isArray(postwork) && postwork.length > 0,
    skills: Array.isArray(skills) && skills.length > 0,
    interests: Array.isArray(interests) && interests.length > 0,
    growthJourney: Array.isArray(growthJourney) && growthJourney.length > 0,
    dateOfBirth: Boolean(dateOfBirth),
  };

  const filled = Object.entries(checks).filter(([, v]) => v).map(([k]) => k);
  const completed = filled.length;
  const total = FIELDS.length;
  const score = Math.round((completed / total) * 100);

  let level;
  if (score <= 25) level = "Beginner";
  else if (score <= 50) level = "Intermediate";
  else if (score <= 75) level = "Advanced";
  else level = "All-Star";

  const missing = FIELDS.filter((f) => !checks[f.key]);
  const gain = Math.round(100 / total);

  return { score, level, missing, filled, checks, gain, total, completed };
}

function BadgeIcon({ level }) {
  if (level === "Beginner") {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} width="14" height="14">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
      </svg>
    );
  }
  if (level === "Intermediate") {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} width="14" height="14">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18 9 11.25l4.306 4.306a11.95 11.95 0 0 1 5.814-5.518l2.74-1.22m0 0-5.94-2.281m5.94 2.28-2.28 5.941" />
      </svg>
    );
  }
  if (level === "Advanced") {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} width="14" height="14">
        <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} width="14" height="14">
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 0 1 3 3h-15a3 3 0 0 1 3-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 0 1-.982-3.172M9.497 14.25a7.454 7.454 0 0 0 .981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 0 0 7.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M18.75 4.236c.982.143 1.954.317 2.916.52A6.003 6.003 0 0 1 16.27 9.728M18.75 4.236V4.5c0 2.108-.966 3.99-2.48 5.228m0 0a6.023 6.023 0 0 1-2.77.896m0 0a6.023 6.023 0 0 1-2.77-.896" />
    </svg>
  );
}

function AnimatedScore({ score }) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    let current = 0;
    const step = Math.max(1, Math.floor(score / 40));
    const timer = setInterval(() => {
      current += step;
      if (current >= score) {
        setDisplay(score);
        clearInterval(timer);
      } else {
        setDisplay(current);
      }
    }, 20);
    return () => clearInterval(timer);
  }, [score]);

  return (
    <span className={styles.heroScore}>
      {display}
      <span className={styles.percentSign}>%</span>
    </span>
  );
}

function LevelBadge({ level }) {
  const cn = styles[`badge_${level.replace("-", "")}`] || "";
  return (
    <span className={`${styles.badge} ${cn}`}>
      <BadgeIcon level={level} />
      {level}
    </span>
  );
}

export default function ProfileStrengthCard({ profile, user, onImprove }) {
  const { score, level, missing, filled, checks, gain, completed, total } = useMemo(
    () => calcProfileStrength(profile, user),
    [profile, user]
  );

  const levelKey = level === "All-Star" ? "allstar" : level.toLowerCase();
  const motivation = MOTIVATION[levelKey];
  const top3 = missing.slice(0, 3);

  return (
    <div className={styles.card}>
      <div className={styles.glow} />

      <div className={styles.header}>
        <div className={styles.headerIcon}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} width="20" height="20">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
          </svg>
        </div>
        <div>
          <h3 className={styles.title}>Profile Strength</h3>
          <p className={styles.subtitle}>
            Complete your profile to increase visibility and connection opportunities.
          </p>
        </div>
      </div>

      <div className={styles.scoreSection}>
        <div className={styles.heroWrap}>
          <AnimatedScore score={score} />
          <p className={styles.heroLabel}>Profile Completion</p>
        </div>
        <LevelBadge level={level} />
      </div>

      <div className={styles.barTrack}>
        <div
          className={`${styles.barFill} ${styles[`bar_${level}`] || ""}`}
          style={{ width: `${score}%` }}
        />
      </div>

      <p className={styles.motivation}>{motivation}</p>

      <div className={styles.checklist}>
        <h4 className={styles.checklistTitle}>
          {completed}/{total} items complete
        </h4>
        <ul className={styles.checklistList}>
          {FIELDS.map((f) => {
            const done = checks[f.key];
            return (
              <li key={f.key} className={`${styles.checklistItem} ${done ? styles.checklistDone : styles.checklistMissing}`}>
                {done ? (
                  <span className={styles.checkIcon}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} width="12" height="12"><path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" /></svg>
                  </span>
                ) : (
                  <span className={styles.checkEmpty} />
                )}
                <span className={styles.checkLabel}>{f.label}</span>
                {done ? (
                  <span className={styles.checkStatus}>Done</span>
                ) : (
                  <span className={styles.checkGain}>+{gain}%</span>
                )}
              </li>
            );
          })}
        </ul>
      </div>

      {top3.length > 0 && (
        <div className={styles.steps}>
          <h4 className={styles.stepsTitle}>Priority Suggestions</h4>
          <ul className={styles.stepsList}>
            {top3.map((f) => (
              <li key={f.key} className={styles.stepItem}>
                <span className={styles.stepIcon}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} width="12" height="12">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                  </svg>
                </span>
                <span className={styles.stepLabel}>{f.label}</span>
                <span className={styles.stepGain}>+{gain}%</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {top3.length > 0 && (
        <button type="button" className={styles.cta} onClick={onImprove}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} width="16" height="16">
            <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
          </svg>
          Improve Profile
        </button>
      )}

      {top3.length === 0 && (
        <div className={styles.perfect}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} width="18" height="18">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
          </svg>
          <span>All items complete — great profile!</span>
        </div>
      )}
    </div>
  );
}
