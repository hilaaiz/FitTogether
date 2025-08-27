import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import useLocalStorage from "../../useLocalStorage";
import styles from "./Posts.module.css";

const API = "http://localhost:5000";

function Posts() {
    const { id } = useParams();
    const [auth] = useLocalStorage("auth", { token: null, user: null });

    const [posts, setPosts] = useState([]);
    const [selectedPostId, setSelectedPostId] = useState(null);
    const [comments, setComments] = useState([]);
    const [newPost, setNewPost] = useState({ title: "", body: "" });
    const [filter, setFilter] = useState({ text: "", sortBy: "id" });
    const [newCommentText, setNewCommentText] = useState("");
    const [loaded, setLoaded] = useState(false);

    // 👇 מה שהיה חסר
    const [commentsLoaded, setCommentsLoaded] = useState(false);

    const [isAddingPost, setIsAddingPost] = useState(false);
    const [isAddingComment, setIsAddingComment] = useState(false);

    // עריכה
    const [isEditingPost, setIsEditingPost] = useState(false);
    const [editedPost, setEditedPost] = useState({ title: "", body: "" });
    const [isSavingPost, setIsSavingPost] = useState(false);

    const hasRun = useRef(false);

    // --- טעינת פוסטים ---
    useEffect(() => {
        if (hasRun.current) return;
        hasRun.current = true;

        if (auth?.token) {
            fetch(`${API}/posts`, {
                headers: { Authorization: `Bearer ${auth.token}` },
            })
                .then(async (res) => {
                    if (!res.ok) throw new Error(`Failed: ${res.status}`);
                    const data = await res.json();
                    setPosts(Array.isArray(data) ? data : []);
                    setLoaded(true);

                    if (id && data.find((post) => post.id === id)) {
                        setSelectedPostId(id);
                        loadComments(id);
                    }
                })
                .catch((err) => {
                    console.error("Error loading posts", err);
                    setLoaded(true);
                });
        }
    }, [auth, id]);

    // --- טעינת תגובות ---
    const loadComments = async (postId) => {
        try {
            const res = await fetch(`${API}/posts/${postId}/comments`, {
                headers: { Authorization: `Bearer ${auth.token}` },
            });
            if (res.ok) {
                const data = await res.json();
                setComments(Array.isArray(data) ? data : []);
                setCommentsLoaded(true);
            }
        } catch (err) {
            console.error("Error loading comments:", err);
        }
    };

    // --- יצירת פוסט ---
    const handleAddPost = async () => {
        if (!newPost.title.trim() || !newPost.body.trim()) return;
        setIsAddingPost(true);

        try {
            const res = await fetch(`${API}/posts`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${auth.token}`,
                },
                body: JSON.stringify(newPost),
            });
            if (res.ok) {
                const data = await res.json();
                setPosts((prev) => [...prev, data]);
                setNewPost({ title: "", body: "" });
            }
        } catch (err) {
            console.error("Error adding post:", err);
        } finally {
            setIsAddingPost(false);
        }
    };

    // --- מחיקת פוסט ---
    const handleDeletePost = async (post) => {
        if (post.userId !== auth.user.id && auth.user.role !== "coach") {
            return alert("You can delete only your own posts (unless coach).");
        }
        try {
            const res = await fetch(`${API}/posts/${post.id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${auth.token}` },
            });
            if (res.ok) {
                setPosts((prev) => prev.filter((p) => p.id !== post.id));
                if (selectedPostId === post.id) handleCloseModal();
            }
        } catch (err) {
            console.error("Error deleting post:", err);
        }
    };

    // --- הוספת תגובה ---
    const handleAddComment = async () => {
        if (!newCommentText.trim() || !selectedPostId) return;
        setIsAddingComment(true);

        try {
            const res = await fetch(`${API}/posts/${selectedPostId}/comments`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${auth.token}`,
                },
                body: JSON.stringify({ body: newCommentText }),
            });
            if (res.ok) {
                await loadComments(selectedPostId); // ✅ טוען מחדש
                setNewCommentText("");
            }
        } catch (err) {
            console.error("Error adding comment:", err);
        } finally {
            setIsAddingComment(false);
        }
    };

    // --- בחירת פוסט ---
    const handleSelectPost = (id) => {
        setSelectedPostId(id);
        setComments([]);
        setCommentsLoaded(false);
        loadComments(id);
        window.history.pushState(null, "", `/posts/${id}`);
    };

    const handleCloseModal = () => {
        setSelectedPostId(null);
        setComments([]);
        setCommentsLoaded(false);
        setNewCommentText("");
        window.history.pushState(null, "", "/posts");
    };

    // --- עריכת פוסט ---
    const handleEditPost = () => {
        const post = posts.find((p) => p.id === selectedPostId);
        if (post) {
            setEditedPost({ title: post.title, body: post.body });
            setIsEditingPost(true);
        }
    };
    const handleCancelEdit = () => {
        setIsEditingPost(false);
        setEditedPost({ title: "", body: "" });
    };
    const handleSavePost = async () => {
        if (!editedPost.title.trim() || !editedPost.body.trim()) return;
        setIsSavingPost(true);

        try {
            const res = await fetch(`${API}/posts/${selectedPostId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${auth.token}`,
                },
                body: JSON.stringify(editedPost),
            });
            if (res.ok) {
                setPosts((prev) =>
                    prev.map((p) =>
                        p.id === selectedPostId ? { ...p, ...editedPost } : p
                    )
                );
                setIsEditingPost(false);
            }
        } catch (err) {
            console.error("Error saving post:", err);
        } finally {
            setIsSavingPost(false);
        }
    };

    // --- סינון פוסטים ---
    const filteredPosts = posts
        .filter((p) =>
            filter.text === ""
                ? true
                : p.title.toLowerCase().includes(filter.text.toLowerCase())
        )
        .sort((a, b) =>
            filter.sortBy === "id"
                ? a.id.localeCompare(b.id)
                : a.title.localeCompare(b.title)
        );

    if (!auth.user) return <div className={styles.noUser}>No user found.</div>;

    const selectedPost = posts.find((p) => p.id === selectedPostId);
    return (
        <div className={styles.postsContainer}>
            {/* Animated background elements */}
            <div className={styles.backgroundElements}>
                <div className={`${styles.bgElement} ${styles.bgElement1}`}></div>
                <div className={`${styles.bgElement} ${styles.bgElement2}`}></div>
                <div className={`${styles.bgElement} ${styles.bgElement3}`}></div>
            </div>

            <div className={styles.content}>
                {/* Header Section */}
                <div className={styles.header}>
                    <div className={styles.titleGroup}>
                        <div className={styles.iconWrapper}>
                            <span className={styles.sparkleIcon}>📝</span>
                        </div>
                        <h1 className={styles.mainTitle}>Posts Dashboard</h1>
                    </div>
                </div>

                {/* Add New Post Section */}
                <div className={styles.addPostSection}>
                    <div className={styles.addPostContainer}>
                        <h3 className={styles.sectionTitle}>
                            <span className={styles.sectionIcon}>✍️</span>
                            Create New Post
                        </h3>
                        <div className={styles.inputGroup}>
                            <input
                                type="text"
                                placeholder="Post title..."
                                value={newPost.title}
                                onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                                className={styles.titleInput}
                            />
                            <textarea
                                placeholder="Share your thoughts..."
                                value={newPost.body}
                                onChange={(e) => setNewPost({ ...newPost, body: e.target.value })}
                                className={styles.bodyTextarea}
                                rows="3"
                            />
                        </div>
                        <button
                            onClick={handleAddPost}
                            disabled={isAddingPost || !newPost.title.trim() || !newPost.body.trim()}
                            className={styles.addButton}
                        >
                            {isAddingPost ? (
                                <div className={styles.loadingSpinner}></div>
                            ) : (
                                <>
                                    <span className={styles.buttonIcon}>📤</span>
                                    Publish
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {loaded && posts.length === 0 ? (
                    <div className={styles.emptyState}>
                        <div className={styles.emptyIcon}>📄</div>
                        <p className={styles.emptyTitle}>No posts yet!</p>
                        <p className={styles.emptySubtitle}>Create your first post to start sharing.</p>
                    </div>
                ) : (
                    <>
                        {/* Filter Section */}
                        <div className={styles.filtersSection}>
                            <div className={styles.filtersContainer}>
                                <div className={styles.filterGroup}>
                                    <div className={styles.searchGroup}>
                                        <span className={styles.searchIcon}>🔍</span>
                                        <input
                                            type="text"
                                            placeholder="Search posts..."
                                            value={filter.text}
                                            onChange={(e) => setFilter({ ...filter, text: e.target.value })}
                                            className={styles.searchInput}
                                        />
                                    </div>

                                    <div className={styles.selectGroup}>
                                        <span className={styles.sortIcon}>📊</span>
                                        <select
                                            value={filter.sortBy}
                                            onChange={(e) => setFilter({ ...filter, sortBy: e.target.value })}
                                            className={styles.sortSelect}
                                        >
                                            <option value="id">Sort by ID</option>
                                            <option value="title">Sort by Title</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Posts Grid */}
                        <div className={styles.postsListSection}>
                            <h3 className={styles.sectionTitle}>
                                <span className={styles.sectionIcon}>📋</span>
                                Your Posts ({filteredPosts.length})
                            </h3>

                            <div className={styles.postsGrid}>
                                {filteredPosts.map((post, index) => (
                                    <div
                                        key={post.id}
                                        className={styles.postCard}
                                        style={{ animationDelay: `${index * 50}ms` }}
                                    >
                                        <div className={styles.postHeader}>
                                            <span className={styles.postId}>#{post.id}</span>
                                        </div>

                                        <h4 className={styles.postTitle}>{post.title}</h4>

                                        <div className={styles.postPreview}>
                                            {post.body.substring(0, 80)}...
                                        </div>

                                        <div className={styles.postActions}>
                                            <button
                                                className={styles.viewButton}
                                                onClick={() => handleSelectPost(post.id)}
                                            >
                                                👁️ View
                                            </button>
                                            <button
                                                className={styles.deleteButton}
                                                onClick={() => handleDeletePost(post)}
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* Modal for Selected Post */}
            {selectedPostId && selectedPost && (
                <>
                    <div className={styles.modalOverlay} onClick={handleCloseModal}></div>
                    <div className={styles.modal}>
                        <div className={styles.modalHeader}>
                            <h3 className={styles.modalTitle}>
                                <span className={styles.sectionIcon}>📖</span>
                                Post #{selectedPostId}
                            </h3>
                            <button className={styles.closeButton} onClick={handleCloseModal}>
                                ✕
                            </button>
                        </div>

                        <div className={styles.modalContent}>
                            {/* Edit Post Content */}
                            <div className={styles.editSection}>
                                <div className={styles.editHeader}>
                                    {!isEditingPost ? (
                                        <button
                                            className={styles.editButton}
                                            onClick={handleEditPost}
                                        >
                                            ✏️ Edit Post
                                        </button>
                                    ) : (
                                        <div className={styles.editActions}>
                                            <button
                                                className={styles.saveButton}
                                                onClick={handleSavePost}
                                                disabled={isSavingPost || !editedPost.title.trim() || !editedPost.body.trim()}
                                            >
                                                {isSavingPost ? (
                                                    <div className={styles.loadingSpinner}></div>
                                                ) : (
                                                    <>💾 Save</>
                                                )}
                                            </button>
                                            <button
                                                className={styles.cancelButton}
                                                onClick={handleCancelEdit}
                                                disabled={isSavingPost}
                                            >
                                                ❌ Cancel
                                            </button>
                                        </div>
                                    )}
                                </div>

                                <div className={styles.editGroup}>
                                    <label className={styles.fieldLabel}>Title:</label>
                                    {isEditingPost ? (
                                        <input
                                            type="text"
                                            value={editedPost.title}
                                            onChange={(e) => setEditedPost({ ...editedPost, title: e.target.value })}
                                            className={styles.editInput}
                                        />
                                    ) : (
                                        <div className={styles.readOnlyField}>{selectedPost.title}</div>
                                    )}
                                </div>

                                <div className={styles.editGroup}>
                                    <label className={styles.fieldLabel}>Content:</label>
                                    {isEditingPost ? (
                                        <textarea
                                            rows="4"
                                            value={editedPost.body}
                                            onChange={(e) => setEditedPost({ ...editedPost, body: e.target.value })}
                                            className={styles.editTextarea}
                                        />
                                    ) : (
                                        <div className={styles.readOnlyField}>{selectedPost.body}</div>
                                    )}
                                </div>
                            </div>

                            {/* Comments Section */}
                            <div className={styles.commentsSection}>
                                <div className={styles.commentsHeader}>
                                    <h4 className={styles.sectionTitle}>
                                        <span className={styles.sectionIcon}>💬</span>
                                        Comments ({comments.length})
                                    </h4>
                                    <button
                                        className={styles.loadCommentsButton}
                                        onClick={() => loadComments(selectedPostId)}
                                    >
                                        {commentsLoaded ? "🔄" : "👁️"}
                                    </button>
                                </div>

                                {/* Add Comment */}
                                <div className={styles.addCommentSection}>
                                    <div className={styles.addCommentGroup}>
                                        <input
                                            type="text"
                                            placeholder="Add a comment..."
                                            value={newCommentText}
                                            onChange={(e) => setNewCommentText(e.target.value)}
                                            onKeyPress={(e) => e.key === 'Enter' && handleAddComment()}
                                            className={styles.commentInput}
                                        />
                                        <button
                                            onClick={handleAddComment}
                                            disabled={isAddingComment || !newCommentText.trim()}
                                            className={styles.addCommentButton}
                                        >
                                            {isAddingComment ? (
                                                <div className={styles.loadingSpinner}></div>
                                            ) : (
                                                "💌"
                                            )}
                                        </button>
                                    </div>
                                </div>

                                {/* Comments List */}
                                {commentsLoaded && (
                                    <div className={styles.commentsList}>
                                        {comments.length === 0 ? (
                                            <div className={styles.noComments}>
                                                <span className={styles.noCommentsIcon}>💭</span>
                                                <p>No comments yet.</p>
                                            </div>
                                        ) : (
                                            comments.map((comment, index) => (
                                                <div
                                                    key={comment.id}
                                                    className={`${styles.commentItem} ${comment.userId === auth.user.id ? styles.ownComment : ""
                                                        }`}
                                                    style={{ animationDelay: `${index * 30}ms` }}
                                                >
                                                    <div className={styles.commentHeader}>
                                                        <span className={styles.commentId}>#{comment.id}</span>
                                                        <span className={styles.commentAuthor}>{comment.username}</span>
                                                        {comment.userId === auth.user.id && (
                                                            <span className={styles.ownBadge}>You</span>
                                                        )}
                                                    </div>

                                                    <div className={styles.commentContent}>
                                                        <div className={styles.commentText}>{comment.body}</div>
                                                        {comment.userId === auth.user.id && (
                                                            <button
                                                                className={styles.deleteCommentButton}
                                                                onClick={() => handleDeleteComment(comment.id)}
                                                            >
                                                                ✕
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
export default Posts;
