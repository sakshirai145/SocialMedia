import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import DashboardLayout from "../../layout/DashboardLayout";
import { getAboutUser, updateProfilePicture, updateProfileData } from "../../redux/action/authAction";
import { clientServer } from "../../config";
import { calcProfileStrength } from "../../components/profileStrength";
import styles from "./profile.module.css";

const SECTION_IDS = ["cover", "bio", "education", "postwork", "skills", "interests", "growthJourney", "dateOfBirth"];

export default function Profile() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const fileRef = useRef(null);
  const coverRef = useRef(null);

  const authState = useSelector((s) => s.auth);
  const profile = authState.user;
  const user = profile?.userId;

  const [editing, setEditing] = useState(null);
  const [savingSection, setSavingSection] = useState(null);
  const [msg, setMsg] = useState("");
  const [editValue, setEditValue] = useState("");
  const [highlighted, setHighlighted] = useState(null);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [headlineEditing, setHeadlineEditing] = useState(false);
  const [headlineValue, setHeadlineValue] = useState("");
  const initRef = useRef(false);
  const abortRef = useRef(null);

  const [formData, setFormData] = useState({
    education: [],
    postwork: [],
    skills: [],
    interests: [],
    growthJourney: [],
    dateOfBirth: "",
  });

  const strengthInfo = useMemo(() => calcProfileStrength(profile, user), [profile, user]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { navigate("/login"); return; }
    const controller = new AbortController();
    abortRef.current = controller;
    dispatch(getAboutUser({ token, signal: controller.signal }));
    return () => controller.abort();
  }, [navigate, dispatch]);

  // One-time formData initialization when profile first loads
  // Subsequent profile changes (after save+refresh) must NOT reset formData
  // IMPORTANT: use functional updater to preserve user edits made before getAboutUser resolves
  useEffect(() => {
    if (profile && typeof profile === "object" && !initRef.current) {
      initRef.current = true;
      setFormData((prev) => ({
        ...prev,
        education: prev.education.length ? prev.education : (profile.education || []),
        postwork: prev.postwork.length ? prev.postwork : (profile.postwork || []),
        skills: prev.skills.length ? prev.skills : (profile.skills || []),
        interests: prev.interests.length ? prev.interests : (profile.interests || []),
        growthJourney: prev.growthJourney.length ? prev.growthJourney : (profile.growthJourney || []),
        dateOfBirth: prev.dateOfBirth || profile.dateOfBirth || "",
      }));
    }
  }, [profile]);

  const refresh = useCallback(() => {
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    const token = localStorage.getItem("token");
    dispatch(getAboutUser({ token, signal: controller.signal }));
  }, [dispatch]);

  const flash = (t) => { setMsg(t); setTimeout(() => setMsg(""), 3000); };

  const startEdit = (field) => {
    setEditing(field);
    setMsg("");
    if (field === "bio") {
      setEditValue(profile?.bio || "");
    } else {
      const val = profile?.[field];
      const arrFields = ["skills", "interests", "education", "postwork", "growthJourney"];
      setFormData((prev) => ({
        ...prev,
        [field]: Array.isArray(val) ? [...val] : (arrFields.includes(field) ? [] : val || ""),
      }));
    }
  };

  const cancelEdit = (field) => {
    setEditing(null);
    if (field === "bio") { setEditValue(""); return; }
    const arrFields = ["skills", "interests", "education", "postwork", "growthJourney"];
    setFormData((prev) => ({
      ...prev,
      [field]: Array.isArray(profile?.[field]) ? [...profile[field]] : (arrFields.includes(field) ? [] : profile?.[field] || ""),
    }));
  };

  const saveField = (field) => {
    const val = field === "bio" ? editValue : formData[field];
    setSavingSection(field);
    dispatch(updateProfileData({ [field]: val })).then((res) => {
      if (res.meta.requestStatus === "fulfilled") {
        if (field !== "bio") {
          setFormData((prev) => ({ ...prev, [field]: val }));
        }
        setEditing(null);
        flash("Saved");
        refresh();
      } else {
        flash(res?.payload?.message || "Failed");
      }
      setSavingSection(null);
    }).catch(() => { flash("Error"); setSavingSection(null); });
  };

  const saveHeadline = () => {
    setSavingSection("headline");
    dispatch(updateProfileData({ headline: headlineValue })).then((res) => {
      if (res.meta.requestStatus === "fulfilled") {
        setHeadlineEditing(false);
        flash("Saved");
        refresh();
      }
      setSavingSection(null);
    }).catch(() => setSavingSection(null));
  };

  const addItem = (field, empty) => {
    setFormData((prev) => ({ ...prev, [field]: [...prev[field], { ...empty }] }));
  };

  const removeItem = (field, index) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index),
    }));
  };

  const updateItem = (field, index, key, value) => {
    setFormData((prev) => {
      const updated = [...prev[field]];
      updated[index] = { ...updated[index], [key]: value };
      return { ...prev, [field]: updated };
    });
  };

  const [skillInput, setSkillInput] = useState("");
  const [interestInput, setInterestInput] = useState("");
  const addTag = (field, val) => {
    const trimmed = val.trim();
    if (!trimmed) return;
    setFormData((prev) => {
      const updated = [...prev[field], trimmed];
      return { ...prev, [field]: updated };
    });
  };
  const removeTag = (field, index) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index),
    }));
  };

  const handleCoverUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingCover(true);
    const fd = new FormData();
    fd.append("cover_picture", file);
    try {
      const token = localStorage.getItem("token");
      await clientServer.post("/users/update_cover_picture", fd, { headers: { token } });
      refresh();
      flash("Cover photo updated");
    } catch {
      flash("Upload failed");
    }
    setUploadingCover(false);
    e.target.value = "";
  };

  const handleUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const fd = new FormData();
    fd.append("profile_picture", file);
    dispatch(updateProfilePicture(fd)).then((res) => {
      if (res.meta.requestStatus === "fulfilled") refresh();
    });
    e.target.value = "";
  };

  const isSaving = (f) => savingSection === f;
  const isEditing = (f) => editing === f;

  const hasValue = (val) => {
    if (Array.isArray(val)) return val.length > 0;
    return Boolean(val);
  };

  const renderEditActions = (field) => (
    <div className={styles.editActions}>
      <button className={styles.cancelBtn} type="button" onClick={() => cancelEdit(field)} disabled={isSaving(field)}>Cancel</button>
      <button className={styles.saveBtn} type="button" onClick={() => saveField(field)} disabled={isSaving(field)}>
        {isSaving(field) ? <span className={styles.savingSpinner} /> : "Save"}
      </button>
    </div>
  );

  const SECTION_MAP = {
    profilePhoto: "cover",
    coverPhoto: "cover",
    bio: "bio",
    education: "education",
    experience: "postwork",
    skills: "skills",
    interests: "interests",
    growthJourney: "growthJourney",
    dateOfBirth: "dateOfBirth",
  };

  const handleImproveProfile = useCallback(() => {
    const result = calcProfileStrength(profile, user);
    const first = result.missing.find((f) => SECTION_MAP[f.key]);
    if (!first) return;
    const sectionId = SECTION_MAP[first.key];
    const el = document.getElementById(`section-${sectionId}`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      setHighlighted(sectionId);
      setTimeout(() => setHighlighted(null), 3000);
    }
  }, [profile, user]);

  const renderSection = (id, title, display, editForm, filled) => (
    <div
      id={`section-${id}`}
      className={`${styles.section} ${highlighted === id ? styles.highlighted : ""} ${filled ? styles.sectionFilled : ""}`}
    >
      <div className={styles.sectionHead}>
        <div className={styles.sectionHeadLeft}>
          <h2 className={styles.sectionTitle}>{title}</h2>
          {filled && (
            <span className={styles.filledBadge}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} width="12" height="12"><path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" /></svg>
            </span>
          )}
        </div>
        {!isEditing(id) && !filled && (
          <button className={styles.editBtn} type="button" onClick={() => startEdit(id)}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} width="14" height="14"><path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" /></svg>
            Add
          </button>
        )}
        {!isEditing(id) && filled && (
          <button className={styles.editBtn} type="button" onClick={() => startEdit(id)}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} width="14" height="14"><path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" /></svg>
            Edit
          </button>
        )}
      </div>
      <div className={`${styles.sectionBody} ${isEditing(id) ? styles.sectionBodyOpen : ""}`}>
        {isEditing(id) ? editForm : display}
      </div>
    </div>
  );

  const renderEmpty = (icon, text) => (
    <div className={styles.emptyState}>
      <div className={styles.emptyIcon}>
        {icon}
      </div>
      <p className={styles.emptyText}>{text}</p>
    </div>
  );

  const renderArrayFields = (field, fields, placeholders) => (
    <div className={styles.editArea}>
      {formData[field].map((item, i) => (
        <div key={i} className={styles.subItem}>
          {fields.map((f, j) => (
            <input
              key={j}
              className={styles.inlineInput}
              placeholder={placeholders[j]}
              value={item[f.key]}
              onChange={(e) => updateItem(field, i, f.key, e.target.value)}
            />
          ))}
          <button className={styles.removeBtn} type="button" onClick={() => removeItem(field, i)} title="Remove">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} width="14" height="14"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" /></svg>
          </button>
        </div>
      ))}
      <button className={styles.addBtn} type="button" onClick={() => addItem(field, Object.fromEntries(fields.map((f) => [f.key, ""])))}>
        + Add {placeholders[0]?.toLowerCase() || "item"}
      </button>
      {renderEditActions(field)}
    </div>
  );

  return (
    <DashboardLayout wide>
      <div className={styles.container}>
        {msg && <div className={styles.feedback}>{msg}</div>}

        <div className={styles.profileCard}>
          <div className={styles.banner}>
            {profile?.coverPicture ? (
              <img src={`https://socialmedia-3yhq.onrender.com/uploads/${profile.coverPicture}`} alt="" className={styles.coverImg} />
            ) : (
              <div className={styles.bannerGradient} />
            )}
            <button className={styles.coverBtn} type="button" onClick={() => coverRef.current?.click()} title="Change cover photo">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} width="16" height="16"><path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z" /><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0Z" /></svg>
            </button>
            <input ref={coverRef} type="file" accept="image/*" hidden onChange={handleCoverUpload} />
            {uploadingCover && <div className={styles.coverUploading}><span className={styles.spinner} /></div>}
          </div>

          <div className={styles.profileContent}>
            <div className={styles.avatarWrap} onClick={() => fileRef.current?.click()}>
              {user?.profilePicture ? (
                <img src={`https://socialmedia-3yhq.onrender.com/uploads/${user.profilePicture}`} alt="" className={styles.avatarImg} />
              ) : (
                <span className={styles.avatarLetter}>{user?.name?.charAt(0)?.toUpperCase() || "?"}</span>
              )}
              <div className={styles.avatarOverlay}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} width="16" height="16"><path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z" /><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0Z" /></svg>
              </div>
              <input ref={fileRef} type="file" accept="image/*" hidden onChange={handleUpload} />
            </div>

            <div className={styles.infoContent}>
              <h1 className={styles.name}>{user?.name || "User"}</h1>

              {headlineEditing ? (
                <div className={styles.headlineEdit}>
                  <input className={styles.headlineInput} value={headlineValue}
                    onChange={(e) => setHeadlineValue(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); saveHeadline(); } if (e.key === "Escape") setHeadlineEditing(false); }}
                    placeholder="Add a professional headline..." autoFocus />
                  <button className={styles.headlineSaveBtn} type="button" onClick={saveHeadline} disabled={isSaving("headline")}>Save</button>
                  <button className={styles.headlineCancelBtn} type="button" onClick={() => setHeadlineEditing(false)}>Cancel</button>
                </div>
              ) : (
                <div className={styles.headlineRow}>
                  <p className={styles.headline}>{profile?.headline || "Add a headline"}</p>
                  <button className={styles.headlineEditBtn} type="button"
                    onClick={() => { setHeadlineValue(profile?.headline || ""); setHeadlineEditing(true); }}
                    title="Edit headline">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} width="14" height="14"><path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" /></svg>
                  </button>
                </div>
              )}

              <div className={styles.metaRow}>
                <span className={styles.username}>@{user?.username}</span>
                <span className={styles.metaSep}>·</span>
                <span className={styles.email}>{user?.email}</span>
              </div>

              <div className={styles.statsRow}>
                <button className={styles.statItem} type="button">
                  <span className={styles.statValue}>{profile?.postCount ?? 0}</span>
                  <span className={styles.statLabel}>Posts</span>
                </button>
                <button className={styles.statItem} type="button">
                  <span className={styles.statValue}>{profile?.connectionCount ?? 0}</span>
                  <span className={styles.statLabel}>Connections</span>
                </button>
                <button className={styles.statItem} type="button">
                  <span className={styles.statValue}>{strengthInfo.score}%</span>
                  <span className={styles.statLabel}>Strength</span>
                </button>
              </div>

              <div className={styles.actionRow}>
                <button className={styles.editProfileBtn} type="button" onClick={() => { document.getElementById('profile-edit-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} width="14" height="14"><path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.83 18.154a3.001 3.001 0 0 1-1.032.696l-2.7.9.9-2.7a3 3 0 0 1 .696-1.032l10.168-10.83Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" /></svg>
                  Edit Profile
                </button>
                <button className={styles.shareProfileBtn} type="button" onClick={() => { navigator.clipboard.writeText(window.location.href); flash('Link copied'); }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} width="14" height="14"><path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 1 0 0 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186 9.566-5.314m-9.566 7.5 9.566 5.314m0 0a2.25 2.25 0 1 0 3.935 2.186 2.25 2.25 0 0 0-3.935-2.186Zm0-12.814a2.25 2.25 0 1 0 3.933-2.185 2.25 2.25 0 0 0-3.933 2.185Z" /></svg>
                  Share Profile
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.strengthCard}>
              <div className={styles.strengthHeader}>
                <h3 className={styles.strengthTitle}>Profile Strength</h3>
                <span className={styles.strengthScore}>{strengthInfo.score}%</span>
              </div>
              <div className={styles.strengthBar}>
                <div className={styles.strengthFill} style={{ width: `${strengthInfo.score}%` }} />
              </div>
              <div className={styles.strengthTips}>
                {strengthInfo.filled.map((key) => {
                  const item = strengthInfo.missing.find((m) => m.key === key);
                  const label = item ? item.label : key;
                  return (
                    <span key={key} className={`${styles.strengthTip} ${styles.strengthTipDone}`}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} width="12" height="12"><path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" /></svg>
                      {label}
                    </span>
                  );
                })}
                {strengthInfo.missing.map((item, i) => (
                  <span key={i} className={`${styles.strengthTip} ${styles.strengthTipMissing}`}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} width="12" height="12"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" /></svg>
                    {item.label}
                  </span>
                ))}
              </div>
              {strengthInfo.missing.length > 0 && (
                <button className={styles.strengthImproveBtn} type="button" onClick={handleImproveProfile}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} width="14" height="14"><path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.83 18.154a3.001 3.001 0 0 1-1.032.696l-2.7.9.9-2.7a3 3 0 0 1 .696-1.032l10.168-10.83Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" /></svg>
                  Improve Profile
                </button>
              )}
            </div>

        <div id="profile-edit-section" className={styles.editSectionGroup}>
          {renderSection("bio", "About", (
            <p className={styles.fieldValue}>{profile?.bio || "No intro added yet"}</p>
          ), (
            <div className={styles.editArea}>
              <textarea className={styles.textarea} value={editValue} onChange={(e) => setEditValue(e.target.value)} rows={3} placeholder="Tell others about yourself..." />
              {renderEditActions("bio")}
            </div>
          ), hasValue(profile?.bio))}

          {renderSection("education", "Education", (
            profile?.education?.length > 0 ? (
              <div className={styles.listDisplay}>
                {profile.education.map((e, i) => (
                  <div key={i} className={styles.listItem}>
                    <div className={styles.listDot} />
                    <span>{e.school}{e.degree ? ` — ${e.degree}` : ""}{e.fieldOfStudy ? `, ${e.fieldOfStudy}` : ""}</span>
                  </div>
                ))}
              </div>
            ) : renderEmpty(
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} width="28" height="28"><path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342" /></svg>,
              "Add your academic background"
            )
          ), renderArrayFields("education",
            [{ key: "school" }, { key: "degree" }, { key: "fieldOfStudy" }],
            ["School", "Degree", "Field of study"]
          ), hasValue(profile?.education))}

          {renderSection("postwork", "Work Experience", (
            profile?.postwork?.length > 0 ? (
              <div className={styles.listDisplay}>
                {profile.postwork.map((w, i) => (
                  <div key={i} className={styles.listItem}>
                    <div className={styles.listDot} />
                    <span>{w.position ? `${w.position} at ${w.company}` : w.company}{w.years ? ` (${w.years})` : ""}</span>
                  </div>
                ))}
              </div>
            ) : renderEmpty(
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} width="28" height="28"><path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 0 0 .75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 0 0-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0 1 12 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 0 1-.673-.38m0 0A2.18 2.18 0 0 1 3 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 0 1 3.413-.387m7.5 0V5.25A2.25 2.25 0 0 0 13.5 3h-3a2.25 2.25 0 0 0-2.25 2.25v.894m7.5 0a48.667 48.667 0 0 0-7.5 0M12 12.75h.008v.008H12v-.008Z" /></svg>,
              "Add your work history"
            )
          ), renderArrayFields("postwork",
            [{ key: "company" }, { key: "position" }, { key: "years" }],
            ["Company", "Position", "Years"]
          ), hasValue(profile?.postwork))}

          {renderSection("skills", "Skills", (
            profile?.skills?.length > 0 ? (
              <div className={styles.tagList}>
                {profile.skills.map((s, i) => <span key={i} className={styles.tag}>{s}</span>)}
              </div>
            ) : renderEmpty(
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} width="28" height="28"><path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17 17.25 21A2.652 2.652 0 0 0 21 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 1 1-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 0 0 4.486-6.336l-3.276 3.277a3.004 3.004 0 0 1-2.25-2.25l3.276-3.276a4.5 4.5 0 0 0-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.087 4.113" /></svg>,
              "Add your skills"
            )
          ), (
            <div className={styles.editArea}>
              <div className={styles.tagRow}>
                <input className={styles.inlineInput} placeholder="Type a skill and press Enter" value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTag("skills", skillInput); setSkillInput(""); } }} />
                <button className={styles.addBtn} type="button" onClick={() => { addTag("skills", skillInput); setSkillInput(""); }} style={{ borderStyle: "solid" }}>Add</button>
              </div>
              <div className={styles.tagList}>
                {formData.skills.map((s, i) => (
                  <span key={i} className={styles.tag}>
                    {s}
                    <button className={styles.tagRemove} type="button" onClick={() => removeTag("skills", i)}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} width="12" height="12"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" /></svg>
                    </button>
                  </span>
                ))}
              </div>
              {renderEditActions("skills")}
            </div>
          ), hasValue(profile?.skills))}

          {renderSection("interests", "Interests", (
            profile?.interests?.length > 0 ? (
              <div className={styles.tagList}>
                {profile.interests.map((s, i) => <span key={i} className={styles.tag}>{s}</span>)}
              </div>
            ) : renderEmpty(
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} width="28" height="28"><path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" /></svg>,
              "Share what you're passionate about"
            )
          ), (
            <div className={styles.editArea}>
              <div className={styles.tagRow}>
                <input className={styles.inlineInput} placeholder="Type an interest and press Enter" value={interestInput}
                  onChange={(e) => setInterestInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTag("interests", interestInput); setInterestInput(""); } }} />
                <button className={styles.addBtn} type="button" onClick={() => { addTag("interests", interestInput); setInterestInput(""); }} style={{ borderStyle: "solid" }}>Add</button>
              </div>
              <div className={styles.tagList}>
                {formData.interests.map((s, i) => (
                  <span key={i} className={styles.tag}>
                    {s}
                    <button className={styles.tagRemove} type="button" onClick={() => removeTag("interests", i)}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} width="12" height="12"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" /></svg>
                    </button>
                  </span>
                ))}
              </div>
              {renderEditActions("interests")}
            </div>
          ), hasValue(profile?.interests))}

          {renderSection("growthJourney", "Growth Journey", (
            profile?.growthJourney?.length > 0 ? (
              <div className={styles.timeline}>
                {profile.growthJourney.map((g, i) => (
                  <div key={i} className={styles.timelineItem}>
                    <div className={styles.timelineDot}>
                      <div className={styles.timelineDotInner} />
                    </div>
                    {i < profile.growthJourney.length - 1 && <div className={styles.timelineLine} />}
                    <div className={styles.timelineContent}>
                      {g.year && <span className={styles.timelineYear}>{g.year}</span>}
                      <span className={styles.timelineTitle}>{g.title}</span>
                      {g.description && <span className={styles.timelineDesc}>{g.description}</span>}
                    </div>
                  </div>
                ))}
              </div>
            ) : renderEmpty(
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} width="28" height="28"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>,
              "Add your milestones and achievements"
            )
          ), renderArrayFields("growthJourney",
            [{ key: "title" }, { key: "description" }, { key: "year" }],
            ["Title", "Description", "Year"]
          ), hasValue(profile?.growthJourney))}

          {renderSection("dateOfBirth", "Date of Birth", (
            <p className={styles.fieldValue}>{profile?.dateOfBirth || "Not set"}</p>
          ), (
            <div className={styles.editArea}>
              <input className={styles.inlineInput} placeholder="e.g. 1995-06-15 or 15 June 1995" value={formData.dateOfBirth}
                onChange={(e) => setFormData((p) => ({ ...p, dateOfBirth: e.target.value }))} />
              {renderEditActions("dateOfBirth")}
            </div>
          ), hasValue(profile?.dateOfBirth))}
        </div>
      </div>
    </DashboardLayout>
  );
}
