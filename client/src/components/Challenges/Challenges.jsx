import { useEffect, useMemo, useState } from "react";
import styles from "./Challenges.module.css";

function Challenges() {
  // auth נשמר כ- { token, user } ב-localStorage.auth
  const auth = JSON.parse(localStorage.getItem("auth"));
  const token = auth?.token;
  const user = auth?.user;
  const isCoach = user?.role === 'coach';

  const [challenges, setChallenges] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState("");

  // filters
  const [filter, setFilter] = useState({
    text: "",
    type: "all", // "all" | "mine"
  });
  const [sortBy, setSortBy] = useState("title"); // "title" | "deadline" | "progress"

  // new challenge (coach only)
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newChallenge, setNewChallenge] = useState({
    title: "",
    description: "",
    deadline: "",
    media_url: ""
  });
  const [isCreatingChallenge, setIsCreatingChallenge] = useState(false);

  // joining challenge
  const [joiningChallengeId, setJoiningChallengeId] = useState(null);

  // טעינת אתגרים מהשרת
  useEffect(() => {
    if (!user || !token) return;
    loadChallenges();
  }, [user, token]);

  const loadChallenges = async () => {
    try {
      const res = await fetch("http://localhost:5000/challenges", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(`Failed to load challenges (${res.status})`);
      const data = await res.json();
      setChallenges(data);
      setLoaded(true);
    } catch (e) {
      console.error(e);
      setError(e.message || "Failed to load challenges");
      setLoaded(true);
    }
  };

  // יצירת אתגר חדש (coach בלבד)
  const handleCreateChallenge = async () => {
    if (!newChallenge.title.trim() || !newChallenge.deadline) {
      setError("Title and deadline are required");
      return;
    }

    setIsCreatingChallenge(true);
    try {
      const res = await fetch("http://localhost:5000/challenges", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newChallenge),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to create challenge");
      }
      const created = await res.json();
      setChallenges(prev => [created, ...prev]);
      setNewChallenge({ title: "", description: "", deadline: "", media_url: "" });
      setShowCreateForm(false);
      setError("");
    } catch (e) {
      console.error(e);
      setError(e.message || "Failed to create challenge");
    } finally {
      setIsCreatingChallenge(false);
    }
  };

  // הצטרפות לאתגר
  const handleJoinChallenge = async (challengeId) => {
    setJoiningChallengeId(challengeId);
    try {
      const res = await fetch(`http://localhost:5000/challenges/${challengeId}/join`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || "Failed to join challenge");
      }
      
      // עדכון הסטטיסטיקות של האתגר (goal++ = עוד משתתף)
      setChallenges(prev =>
        prev.map(challenge =>
          challenge.id === challengeId
            ? { ...challenge, goal: challenge.goal + 1 }
            : challenge
        )
      );
      
      setError("");
    } catch (e) {
      console.error(e);
      setError(e.message || "Failed to join challenge");
    } finally {
      setJoiningChallengeId(null);
    }
  };

  // מחיקת אתגר (coach בלבד)
  const handleDeleteChallenge = async (challengeId) => {
    if (!window.confirm("Are you sure you want to delete this challenge? This will remove it for all participants.")) {
      return;
    }

    try {
      const res = await fetch(`http://localhost:5000/challenges/${challengeId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to delete challenge");
      }
      setChallenges(prev => prev.filter(c => c.id !== challengeId));
    } catch (e) {
      console.error(e);
      setError(e.message || "Failed to delete challenge");
    }
  };

  // פילטור ומיון
  const filteredChallenges = useMemo(() => {
    let arr = [...challenges];

    if (filter.text.trim()) {
      const q = filter.text.toLowerCase();
      arr = arr.filter(c =>
        (c.title || "").toLowerCase().includes(q) ||
        (c.description || "").toLowerCase().includes(q) ||
        String(c.id).toLowerCase().includes(q)
      );
    }

    if (filter.type === "mine" && isCoach) {
      arr = arr.filter(c => c.createdBy === user.id);
    }

    if (sortBy === "title") arr.sort((a, b) => (a.title || "").localeCompare(b.title || ""));
    if (sortBy === "deadline") arr.sort((a, b) => new Date(a.deadline) - new Date(b.deadline));
    if (sortBy === "progress") arr.sort((a, b) => (b.progress / Math.max(b.goal, 1)) - (a.progress / Math.max(a.goal, 1)));

    return arr;
  }, [challenges, filter, sortBy, isCoach, user?.id]);

  // פונקציות עזר
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('he-IL');
  };

  const getProgressPercentage = (progress, goal) => {
    return goal > 0 ? Math.round((progress / goal) * 100) : 0;
  };

  const isDeadlinePassed = (deadline) => {
    return new Date(deadline) < new Date();
  };

  const isChallengeCompleted = (progress, goal) => {
    return progress >= goal && goal > 0;
  };

  if (!user) {
    return <div className={styles.noUser}>יש להתחבר כדי לראות אתגרים.</div>;
  }

  return (
    <div className={styles.challengeContainer}>
      <div className={styles.backgroundElements}>
        <div className={`${styles.bgElement} ${styles.bgElement1}`} />
        <div className={`${styles.bgElement} ${styles.bgElement2}`} />
        <div className={`${styles.bgElement} ${styles.bgElement3}`} />
      </div>

      <div className={styles.content}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.titleGroup}>
            <div className={styles.iconWrapper}>
              <span className={styles.sparkleIcon}>🏆</span>
            </div>
            <h1 className={styles.mainTitle}>Group Challenges</h1>
          </div>

          <div className={styles.statsContainer}>
            <div className={styles.stat}>
              <div className={styles.statNumber}>{challenges.length}</div>
              <div className={styles.statLabel}>Total</div>
            </div>
            <div className={styles.statDivider}></div>
            <div className={styles.stat}>
              <div className={styles.statNumber}>
                {challenges.filter(c => !isDeadlinePassed(c.deadline)).length}
              </div>
              <div className={styles.statLabel}>Active</div>
            </div>
            <div className={styles.statDivider}></div>
            <div className={styles.stat}>
              <div className={styles.statNumber}>
                {isCoach ? challenges.filter(c => c.createdBy === user.id).length : 0}
              </div>
              <div className={styles.statLabel}>
                {isCoach ? "Created by me" : "My Role"}
              </div>
            </div>
          </div>
        </div>

        {/* Create Challenge Section (Coach Only) */}
        {isCoach && (
          <div className={styles.createChallengeSection}>
            <div className={styles.createChallengeContainer}>
              {!showCreateForm ? (
                <button
                  onClick={() => setShowCreateForm(true)}
                  className={styles.showFormButton}
                >
                  <span className={styles.plusIcon}>+</span>
                  Create New Challenge
                </button>
              ) : (
                <div className={styles.createForm}>
                  <div className={styles.formRow}>
                    <input
                      type="text"
                      placeholder="Challenge title"
                      value={newChallenge.title}
                      onChange={(e) => setNewChallenge({ ...newChallenge, title: e.target.value })}
                      className={styles.formInput}
                    />
                    <input
                      type="date"
                      value={newChallenge.deadline}
                      onChange={(e) => setNewChallenge({ ...newChallenge, deadline: e.target.value })}
                      className={styles.formInput}
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                  
                  <div className={styles.formRow}>
                    <textarea
                      placeholder="Challenge description (optional)"
                      value={newChallenge.description}
                      onChange={(e) => setNewChallenge({ ...newChallenge, description: e.target.value })}
                      className={styles.formTextarea}
                      rows="3"
                    />
                  </div>

                  <div className={styles.formRow}>
                    <input
                      type="url"
                      placeholder="Image/Video URL (optional)"
                      value={newChallenge.media_url}
                      onChange={(e) => setNewChallenge({ ...newChallenge, media_url: e.target.value })}
                      className={styles.formInput}
                    />
                  </div>

                  <div className={styles.formActions}>
                    <button
                      onClick={handleCreateChallenge}
                      disabled={isCreatingChallenge || !newChallenge.title.trim() || !newChallenge.deadline}
                      className={styles.createButton}
                    >
                      {isCreatingChallenge ? <div className={styles.loadingSpinner}></div> : "Create Challenge"}
                    </button>
                    <button
                      onClick={() => {
                        setShowCreateForm(false);
                        setNewChallenge({ title: "", description: "", deadline: "", media_url: "" });
                        setError("");
                      }}
                      className={styles.cancelButton}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Filters */}
        <div className={styles.filtersSection}>
          <div className={styles.filtersContainer}>
            <div className={styles.filterGroup}>
              <div className={styles.searchGroup}>
                <span className={styles.searchIcon}>🔍</span>
                <input
                  type="text"
                  placeholder="Search challenges by title, description or #id"
                  value={filter.text}
                  onChange={(e) => setFilter({ ...filter, text: e.target.value })}
                  className={styles.searchInput}
                />
              </div>

              {isCoach && (
                <div className={styles.selectGroup}>
                  <span className={styles.filterIcon}>🏷️</span>
                  <select
                    value={filter.type}
                    onChange={(e) => setFilter({ ...filter, type: e.target.value })}
                    className={styles.filterSelect}
                  >
                    <option value="all">All challenges</option>
                    <option value="mine">Created by me</option>
                  </select>
                </div>
              )}

              <div className={styles.selectGroup}>
                <span className={styles.sortIcon}>📊</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className={styles.sortSelect}
                >
                  <option value="title">Sort by Title</option>
                  <option value="deadline">Sort by Deadline</option>
                  <option value="progress">Sort by Progress</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Error Banner */}
        {!!error && <div className={styles.errorBanner}>⚠️ {error}</div>}

        {/* Challenges List */}
        {loaded && filteredChallenges.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>🏆</div>
            <p className={styles.emptyTitle}>No challenges found</p>
            <p className={styles.emptySubtitle}>
              {isCoach ? "Create your first challenge!" : "Check back later for new challenges."}
            </p>
          </div>
        ) : (
          <div className={styles.challengeList}>
            {filteredChallenges.map((challenge, idx) => {
              const progressPercentage = getProgressPercentage(challenge.progress, challenge.goal);
              const deadlinePassed = isDeadlinePassed(challenge.deadline);
              const challengeCompleted = isChallengeCompleted(challenge.progress, challenge.goal);
              const isMyChallenge = isCoach && challenge.createdBy === user.id;

              return (
                <div
                  key={challenge.id}
                  className={`${styles.challengeItem} ${deadlinePassed ? styles.expired : ""} ${challengeCompleted ? styles.completed : ""}`}
                  style={{ animationDelay: `${idx * 90}ms` }}
                >
                  <div className={styles.challengeHeader}>
                    <div className={styles.challengeLeft}>
                      <span className={styles.challengeId}>#{String(challenge.id).slice(0, 8)}</span>
                      <h3 className={styles.challengeTitle}>
                        {challenge.title}
                        {challengeCompleted && <span className={styles.completedBadge}>🎉 Completed!</span>}
                      </h3>
                      {deadlinePassed && <span className={styles.expiredBadge}>Expired</span>}
                      {isMyChallenge && <span className={styles.myChallengeBadge}>Created by me</span>}
                    </div>
                    <div className={styles.challengeActions}>
                      <button
                        onClick={() => handleJoinChallenge(challenge.id)}
                        disabled={joiningChallengeId === challenge.id || deadlinePassed}
                        className={styles.joinButton}
                        title={deadlinePassed ? "Challenge expired" : "Join this challenge"}
                      >
                        {joiningChallengeId === challenge.id ? (
                          <div className={styles.loadingSpinner}></div>
                        ) : deadlinePassed ? "Expired" : "Join"}
                      </button>
                      
                      {isMyChallenge && (
                        <button
                          onClick={() => handleDeleteChallenge(challenge.id)}
                          className={styles.deleteButton}
                          title="Delete challenge"
                        >
                          🗑️
                        </button>
                      )}
                    </div>
                  </div>

                  {challenge.description && (
                    <div className={styles.challengeDescription}>
                      {challenge.description}
                    </div>
                  )}

                  <div className={styles.challengeStats}>
                    <div className={styles.statItem}>
                      <span className={styles.statLabel}>Total participants:</span>
                      <span className={styles.statValue}>{challenge.goal}</span>
                    </div>
                    <div className={styles.statItem}>
                      <span className={styles.statLabel}>Completed:</span>
                      <span className={styles.statValue}>{challenge.progress}</span>
                    </div>
                    <div className={styles.statItem}>
                      <span className={styles.statLabel}>Deadline:</span>
                      <span className={`${styles.statValue} ${deadlinePassed ? styles.expiredDate : ""}`}>
                        {formatDate(challenge.deadline)}
                      </span>
                    </div>
                  </div>

                  <div className={styles.progressSection}>
                    <div className={styles.progressHeader}>
                      <span>Completion: {progressPercentage}%</span>
                      <span>{challenge.progress}/{challenge.goal} completed</span>
                    </div>
                    <div className={styles.progressBar}>
                      <div
                        className={`${styles.progressFill} ${challengeCompleted ? styles.completedFill : ""}`}
                        style={{ width: `${progressPercentage}%` }}
                      />
                    </div>
                    {challengeCompleted && (
                      <div className={styles.completionMessage}>
                        🎉 All participants completed this challenge!
                      </div>
                    )}
                  </div>

                  {challenge.media_url && (
                    <div className={styles.challengeMedia}>
                      <img
                        src={challenge.media_url}
                        alt="Challenge media"
                        className={styles.mediaImage}
                        onError={(e) => { e.target.style.display = 'none'; }}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default Challenges;