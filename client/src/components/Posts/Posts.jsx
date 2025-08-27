// components/Posts/Posts.jsx
import React, { useEffect, useState, useRef } from "react";
import styles from "./Posts.module.css";

const API = "http://localhost:5000";

function Posts() {
  const auth = JSON.parse(localStorage.getItem("auth"));
  const token = auth?.token;
  const user = auth?.user;

  const [posts, setPosts] = useState([]);
  const [selectedPostId, setSelectedPostId] = useState(null);
  const [comments, setComments] = useState([]);
  const [newPost, setNewPost] = useState({ title: "", body: "" });
  const [newCommentText, setNewCommentText] = useState("");
  const [loaded, setLoaded] = useState(false);
  const [commentsLoaded, setCommentsLoaded] = useState(false);
  const [isAddingPost, setIsAddingPost] = useState(false);
  const [isAddingComment, setIsAddingComment] = useState(false);

  const hasRun = useRef(false);

  // טעינת פוסטים
  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;
    if (!token) return;

    fetch(`${API}/posts`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        setPosts(data);
        setLoaded(true);
      })
      .catch((err) => console.error("Error loading posts", err));
  }, [token]);

  // הוספת פוסט
  const handleAddPost = async () => {
    if (!newPost.title.trim() || !newPost.body.trim()) return;
    setIsAddingPost(true);
    try {
      const res = await fetch(`${API}/posts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newPost),
      });
      if (!res.ok) throw new Error("Failed to create post");
      const data = await res.json();
      setPosts([...posts, data]);
      setNewPost({ title: "", body: "" });
    } catch (err) {
      console.error(err);
    } finally {
      setIsAddingPost(false);
    }
  };

  // מחיקת פוסט
  const handleDeletePost = async (id) => {
    const post = posts.find((p) => p.id === id);
    if (!post) return;

    // לוגיקה: רק יוזר שיצר או מאמן יכול למחוק
    if (user.id !== post.userId && user.role !== "coach") {
      alert("You cannot delete this post");
      return;
    }

    try {
      const res = await fetch(`${API}/posts/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to delete post");
      setPosts(posts.filter((p) => p.id !== id));
      if (selectedPostId === id) setSelectedPostId(null);
    } catch (err) {
      console.error(err);
    }
  };

  // טעינת תגובות
  const loadComments = async (postId) => {
    try {
      const res = await fetch(`${API}/posts/${postId}/comments`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to load comments");
      const data = await res.json();
      setComments(data);
      setCommentsLoaded(true);
    } catch (err) {
      console.error(err);
    }
  };

  // הוספת תגובה
  const handleAddComment = async () => {
    if (!newCommentText.trim() || !selectedPostId) return;
    setIsAddingComment(true);
    try {
      const res = await fetch(`${API}/posts/${selectedPostId}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ text: newCommentText }),
      });
      if (!res.ok) throw new Error("Failed to add comment");
      const data = await res.json();
      setComments([...comments, data]);
      setNewCommentText("");
    } catch (err) {
      console.error(err);
    } finally {
      setIsAddingComment(false);
    }
  };

  // מחיקת תגובה
  const handleDeleteComment = async (id) => {
    const comment = comments.find((c) => c.id === id);
    if (!comment) return;

    // לוגיקה: יוזר = של עצמו, מאמן = הכל
    if (user.id !== comment.userId && user.role !== "coach") {
      alert("You cannot delete this comment");
      return;
    }

    try {
      const res = await fetch(`${API}/posts/${selectedPostId}/comments/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to delete comment");
      setComments(comments.filter((c) => c.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  if (!user) return <div className={styles.noUser}>Please log in</div>;

  return (
    <div className={styles.postsContainer}>
      {/* Add Post */}
      <div className={styles.addPostSection}>
        <h3>Create New Post</h3>
        <input
          type="text"
          placeholder="Title"
          value={newPost.title}
          onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
        />
        <textarea
          placeholder="Body"
          value={newPost.body}
          onChange={(e) => setNewPost({ ...newPost, body: e.target.value })}
        />
        <button onClick={handleAddPost} disabled={isAddingPost}>
          {isAddingPost ? "Saving..." : "Publish"}
        </button>
      </div>

      {/* Posts List */}
      {loaded && posts.length === 0 ? (
        <p>No posts yet.</p>
      ) : (
        <div className={styles.postsGrid}>
          {posts.map((post) => (
            <div key={post.id} className={styles.postCard}>
              <h4>{post.title}</h4>
              <p>{post.body}</p>
              <div className={styles.actions}>
                <button onClick={() => setSelectedPostId(post.id)}>
                  View
                </button>
                {(user.id === post.userId || user.role === "coach") && (
                  <button onClick={() => handleDeletePost(post.id)}>Delete</button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Comments Modal */}
      {selectedPostId && (
        <div className={styles.modal}>
          <button onClick={() => setSelectedPostId(null)}>Close</button>
          <h3>Comments</h3>
          <button onClick={() => loadComments(selectedPostId)}>Load</button>
          <ul>
            {comments.map((c) => (
              <li key={c.id}>
                <span>{c.text}</span>
                {(user.id === c.userId || user.role === "coach") && (
                  <button onClick={() => handleDeleteComment(c.id)}>X</button>
                )}
              </li>
            ))}
          </ul>
          <input
            type="text"
            placeholder="Add a comment..."
            value={newCommentText}
            onChange={(e) => setNewCommentText(e.target.value)}
          />
          <button onClick={handleAddComment} disabled={isAddingComment}>
            Add
          </button>
        </div>
      )}
    </div>
  );
}

export default Posts;
