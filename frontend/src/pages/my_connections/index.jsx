import { useEffect, useRef, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import DashboardLayout from "../../layout/DashboardLayout";
import {
  getAllProfiles,
  getIncomingRequests,
  getOutgoingRequests,
  sendConnectionRequest,
  acceptConnectionRequest,
  cancelConnectionRequest,
  removeConnection,
  getMutualConnections,
} from "../../redux/action/authAction";

import styles from "./myConnections.module.css";

const TABS = [
  { key: "all", label: "All" },
  { key: "pending", label: "Pending" },
  { key: "connections", label: "Connections" },
  { key: "suggestions", label: "Suggestions" },
];

export default function MyConnectionsPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [sentIds, setSentIds] = useState(new Set());
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const {
    allProfiles,
    profilesLoading,
    incomingRequests,
    outgoingRequests,
    user,
    mutualConnections,
  } = useSelector((state) => state.auth);

  const currentUserId = user?.userId?._id;

  useEffect(() => {
    dispatch(getAllProfiles());
    dispatch(getIncomingRequests());
    dispatch(getOutgoingRequests());
  }, [dispatch]);

  const acceptedIncoming = (incomingRequests || []).filter((r) => r.status_accepted === true);
  const acceptedOutgoing = (outgoingRequests || []).filter((r) => r.status_accepted === true);

  const seenIds = new Set();
  const allAccepted = [...acceptedIncoming, ...acceptedOutgoing].filter((req) => {
    const connUser = req.userId?._id ? req.userId : req.connectionId;
    if (!connUser || !connUser._id) return false;
    const id = connUser._id.toString();
    if (seenIds.has(id) || id === currentUserId) return false;
    seenIds.add(id);
    return true;
  });
  const connectionCount = allAccepted.length;

  const connectedIds = new Set();
  acceptedIncoming.forEach((r) => {
    if (r.userId?._id && r.userId._id.toString() !== currentUserId) connectedIds.add(r.userId._id.toString());
  });
  acceptedOutgoing.forEach((r) => {
    if (r.connectionId?._id && r.connectionId._id.toString() !== currentUserId) connectedIds.add(r.connectionId._id.toString());
  });

  const pendingIncoming = (incomingRequests || []).filter((r) => r.status_accepted === null);
  const pendingOutgoing = (outgoingRequests || []).filter((r) => r.status_accepted === null);

  const realPendingOutgoing = pendingOutgoing.filter((req) => {
    const connUser = req.connectionId;
    if (!connUser || !connUser._id) return false;
    return !connectedIds.has(connUser._id.toString());
  });

  const suggestions = (allProfiles || []).filter((p) => {
    if (!p.userId?._id) return false;
    const pid = p.userId._id.toString();
    if (pid === currentUserId) return false;
    if (connectedIds.has(pid)) return false;
    return true;
  });

  const fetchedMutualRef = useRef(new Set());
  useEffect(() => {
    suggestions.forEach((p) => {
      const id = p.userId?._id;
      if (id && !fetchedMutualRef.current.has(id)) {
        fetchedMutualRef.current.add(id);
        dispatch(getMutualConnections({ targetUserId: id }));
      }
    });
  }, [suggestions, dispatch]);

  const filteredAccepted = useMemo(() => {
    if (!searchQuery.trim()) return allAccepted;
    const q = searchQuery.toLowerCase();
    return allAccepted.filter((req) => {
      const connUser = req.userId?._id ? req.userId : req.connectionId;
      if (!connUser) return false;
      return (connUser.name?.toLowerCase().includes(q) || connUser.username?.toLowerCase().includes(q));
    });
  }, [allAccepted, searchQuery]);

  const filteredSuggestions = useMemo(() => {
    if (!searchQuery.trim()) return suggestions;
    const q = searchQuery.toLowerCase();
    return suggestions.filter((p) => {
      const pu = p.userId || {};
      return (pu.name?.toLowerCase().includes(q) || pu.username?.toLowerCase().includes(q));
    });
  }, [suggestions, searchQuery]);

  const refetch = () => {
    dispatch(getIncomingRequests());
    dispatch(getOutgoingRequests());
  };

  const handleConnect = (connectionId) => {
    dispatch(sendConnectionRequest({ connectionId })).then((res) => {
      if (res.meta.requestStatus === "fulfilled") {
        setSentIds((prev) => new Set(prev).add(connectionId));
        refetch();
      }
    });
  };

  const handleAccept = (requestId) => {
    dispatch(acceptConnectionRequest({ requestId, action_type: "accept" })).then((res) => {
      if (res.meta.requestStatus === "fulfilled") refetch();
    });
  };

  const handleReject = (requestId) => {
    dispatch(acceptConnectionRequest({ requestId, action_type: "reject" })).then((res) => {
      if (res.meta.requestStatus === "fulfilled") refetch();
    });
  };

  const handleCancel = (connectionId) => {
    dispatch(cancelConnectionRequest({ connectionId })).then((res) => {
      if (res.meta.requestStatus === "fulfilled") refetch();
    });
  };

  const handleRemove = (connectionId) => {
    dispatch(removeConnection({ connectionId })).then((res) => {
      if (res.meta.requestStatus === "fulfilled") refetch();
    });
  };

  const tabCounts = {
    all: connectionCount + pendingIncoming.length + realPendingOutgoing.length + suggestions.length,
    pending: pendingIncoming.length + realPendingOutgoing.length,
    connections: connectionCount,
    suggestions: suggestions.length,
  };

  return (
    <DashboardLayout wide>
      <div className={styles.container}>
        <div className={styles.header}>
          <div>
            <h1>My Connections</h1>
          </div>
          <div className={styles.headerRight}>
            <div className={styles.searchWrap}>
              <svg className={styles.searchIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} width="14" height="14"><path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" /></svg>
              <input
                className={styles.searchInput}
                type="text"
                placeholder="Search connections..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <span className={styles.connectionCount}>
              {connectionCount} connection{connectionCount !== 1 ? "s" : ""}
            </span>
          </div>
        </div>

        <div className={styles.tabs}>
          {TABS.map((tab) => (
            <button
              key={tab.key}
              className={`${styles.tab} ${activeTab === tab.key ? styles.tabActive : ""}`}
              type="button"
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.label}
              <span className={styles.tabCount}>{tabCounts[tab.key]}</span>
            </button>
          ))}
        </div>

        <div className={styles.mainWrap}>
          <div className={styles.content}>
            {/* ── Pending Incoming ── */}
            {(activeTab === "all" || activeTab === "pending") && pendingIncoming.length > 0 && (
              <>
                <div className={styles.sectionTitle}>
                  <h2>Connection Requests ({pendingIncoming.length})</h2>
                </div>
                <div className={styles.requestList}>
                  {pendingIncoming.map((req) => {
                    const reqUser = req.userId || {};
                    return (
                      <div key={req._id} className={styles.requestCard}>
                        <div className={styles.requestInfo} onClick={() => navigate(`/user/${reqUser._id}`)}>
                          <div className={styles.requestAvatar}>
                            {reqUser.profilePicture ? (
                              <img src={`http://localhost:9080/${reqUser.profilePicture}`} alt="" />
                            ) : (
                              <span>{reqUser.name?.charAt(0)?.toUpperCase() || "?"}</span>
                            )}
                          </div>
                          <div>
                            <p className={styles.requestName}>{reqUser.name || "Unknown"}</p>
                            <p className={styles.requestUsername}>@{reqUser.username || "unknown"}</p>
                          </div>
                        </div>
                        <div className={styles.requestActions}>
                          <button className={styles.acceptBtn} type="button" onClick={() => handleAccept(req._id)}>Accept</button>
                          <button className={styles.rejectBtn} type="button" onClick={() => handleReject(req._id)}>Reject</button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}

            {/* ── Pending Outgoing ── */}
            {(activeTab === "all" || activeTab === "pending") && realPendingOutgoing.length > 0 && (
              <>
                <div className={styles.sectionTitle}>
                  <h2>Sent Requests ({realPendingOutgoing.length})</h2>
                </div>
                <div className={styles.requestList}>
                  {realPendingOutgoing.map((req) => {
                    const reqUser = req.connectionId || {};
                    return (
                      <div key={req._id} className={styles.requestCard}>
                        <div className={styles.requestInfo} onClick={() => navigate(`/user/${reqUser._id}`)}>
                          <div className={styles.requestAvatar}>
                            {reqUser.profilePicture ? (
                              <img src={`http://localhost:9080/${reqUser.profilePicture}`} alt="" />
                            ) : (
                              <span>{reqUser.name?.charAt(0)?.toUpperCase() || "?"}</span>
                            )}
                          </div>
                          <div>
                            <p className={styles.requestName}>{reqUser.name || "Unknown"}</p>
                            <p className={styles.requestUsername}>@{reqUser.username || "unknown"}</p>
                            <p className={styles.requestId}>{reqUser._id}</p>
                          </div>
                        </div>
                        <button className={styles.rejectBtn} type="button" onClick={() => handleCancel(reqUser._id)}>Cancel</button>
                      </div>
                    );
                  })}
                </div>
              </>
            )}

            {/* ── Accepted Connections ── */}
            {(activeTab === "all" || activeTab === "connections") && (
              <>
                {filteredAccepted.length > 0 ? (
                  <>
                    <div className={styles.sectionTitle}>
                      <h2>Your Connections ({filteredAccepted.length})</h2>
                    </div>
                    <div className={styles.connectionGrid}>
                      {filteredAccepted.map((req) => {
                        const connUser = req.userId?._id ? req.userId : req.connectionId;
                        if (!connUser || !connUser._id) return null;
                        return (
                          <div key={req._id} className={styles.connectionCard} onClick={() => navigate(`/user/${connUser._id}`)}>
                            <div className={styles.connectionAvatar}>
                              {connUser.profilePicture ? (
                                <img src={`http://localhost:9080/${connUser.profilePicture}`} alt="" />
                              ) : (
                                <span>{connUser.name?.charAt(0)?.toUpperCase()}</span>
                              )}
                            </div>
                            <div className={styles.connectionInfo}>
                              <p className={styles.connectionName}>{connUser.name}</p>
                              <p className={styles.connectionUsername}>@{connUser.username}</p>
                            </div>
                            <button className={styles.rejectBtn} type="button" onClick={(e) => { e.stopPropagation(); handleRemove(connUser._id); }}>Remove</button>
                          </div>
                        );
                      })}
                    </div>
                  </>
                ) : (
                  activeTab === "connections" && (
                    <div className={styles.empty}>
                      <p>No connections yet. Start connecting with people you may know!</p>
                    </div>
                  )
                )}
              </>
            )}

            {/* ── Suggestions ── */}
            {(activeTab === "all" || activeTab === "suggestions") && (
              <>
                {(activeTab === "suggestions" || (activeTab === "all" && pendingIncoming.length === 0 && realPendingOutgoing.length === 0)) && (
                  <div className={styles.sectionTitle}>
                    <h2>People you may know</h2>
                  </div>
                )}

                {profilesLoading && (
                  <div className={styles.loading}>
                    <div className={styles.spinner} />
                    <p>Loading suggestions...</p>
                  </div>
                )}

                {!profilesLoading && filteredSuggestions.length === 0 && activeTab === "suggestions" && (
                  <div className={styles.empty}>
                    <p>No suggestions available.</p>
                  </div>
                )}

                {filteredSuggestions.length > 0 && (
                  <div className={styles.grid}>
                    {filteredSuggestions.map((profile) => {
                      const pUser = profile.userId || {};
                      const isSent = sentIds.has(pUser._id) || pendingOutgoing.some((r) => r.connectionId?._id === pUser._id);
                      return (
                        <div key={profile._id} className={styles.card}>
                          <div className={styles.cardClickable} onClick={() => navigate(`/user/${pUser._id}`)}>
                            <div className={styles.avatar}>
                              {pUser.profilePicture ? (
                                <img src={`http://localhost:9080/${pUser.profilePicture}`} alt="" />
                              ) : (
                                <span>{pUser.name?.charAt(0)?.toUpperCase() || "?"}</span>
                              )}
                            </div>
                            <p className={styles.name}>{pUser.name || "Unknown"}</p>
                            <p className={styles.username}>@{pUser.username || "unknown"}</p>
                            {mutualConnections[pUser._id]?.count > 0 && (
                              <p className={styles.mutualCount}>
                                {mutualConnections[pUser._id].count} Mutual Connection{mutualConnections[pUser._id].count !== 1 ? "s" : ""}
                              </p>
                            )}
                          </div>
                          <button
                            className={`${styles.connectBtn} ${isSent ? styles.sentBtn : ""}`}
                            type="button"
                            disabled={isSent}
                            onClick={() => handleConnect(pUser._id)}
                          >
                            {isSent ? (
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} width="16" height="16"><path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" /></svg>
                            ) : (
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} width="16" height="16"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
                            )}
                            {isSent ? "Sent" : "Connect"}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </>
            )}
          </div>

          {/* ── Right Sidebar ── */}
          <div className={styles.sidebar}>
            <div className={styles.sidebarWidget}>
              <h3 className={styles.sidebarWidgetTitle}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} width="16" height="16"><path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" /></svg>
                Network Stats
              </h3>
              <div className={styles.statWidgetGrid}>
                <div className={styles.statWidgetItem}>
                  <span className={styles.statWidgetValue}>{connectionCount}</span>
                  <span className={styles.statWidgetLabel}>Connections</span>
                </div>
                <div className={styles.statWidgetItem}>
                  <span className={styles.statWidgetValue}>{pendingIncoming.length}</span>
                  <span className={styles.statWidgetLabel}>Requests</span>
                </div>
                <div className={styles.statWidgetItem}>
                  <span className={styles.statWidgetValue}>{realPendingOutgoing.length}</span>
                  <span className={styles.statWidgetLabel}>Sent</span>
                </div>
                <div className={styles.statWidgetItem}>
                  <span className={styles.statWidgetValue}>{suggestions.length}</span>
                  <span className={styles.statWidgetLabel}>Suggestions</span>
                </div>
              </div>
            </div>

            <div className={styles.sidebarWidget}>
              <h3 className={styles.sidebarWidgetTitle}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} width="16" height="16"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18 9 11.25l4.306 4.306a11.95 11.95 0 0 1 5.814-5.518l2.74-1.22m0 0-5.94-2.281m5.94 2.28-2.28 5.941" /></svg>
                Recent Activity
              </h3>
              <div className={styles.sidebarActivityList}>
                {pendingIncoming.length > 0 ? (
                  <>
                    {pendingIncoming.slice(0, 3).map((req) => {
                      const ru = req.userId || {};
                      return (
                        <div key={req._id} className={styles.sidebarActivityItem}>
                          <div className={`${styles.sidebarActivityDot} ${styles.sidebarActivityDotBlue}`} />
                          <span><span className={styles.sidebarActivityName}>{ru.name || "Someone"}</span> sent you a request</span>
                        </div>
                      );
                    })}
                  </>
                ) : (
                  <div className={styles.sidebarActivityItem}>
                    <div className={`${styles.sidebarActivityDot} ${styles.sidebarActivityDotGreen}`} />
                    <span>No pending requests</span>
                  </div>
                )}
                {connectionCount > 0 && (
                  <div className={styles.sidebarActivityItem}>
                    <div className={`${styles.sidebarActivityDot} ${styles.sidebarActivityDotGreen}`} />
                    <span>Connected with <span className={styles.sidebarActivityName}>{allAccepted[0] ? (allAccepted[0].userId?._id ? allAccepted[0].userId : allAccepted[0].connectionId)?.name || "someone" : "someone"}</span></span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
