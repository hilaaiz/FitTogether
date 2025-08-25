USE fullstack7_db;


-- Seed data for Fitness App (English, with bcrypt hashed passwords)

-- Users
INSERT INTO users (id, name, username, email, phone, role, height, weight)
VALUES
('u1', 'Dana Cohen', 'danac', 'dana@example.com', '0501234567', 'user', 165.00, 58.00),
('u2', 'Yossi Levi', 'yossile', 'yossi@example.com', '0529876543', 'user', 180.00, 75.00),
('u3', 'Noa Raz', 'noar', 'noa@example.com', '0532223344', 'coach', 170.00, 62.00);

-- Passwords (bcrypt hashes)
-- Plaintext: u1=1234, u2=abcd, u3=coach123
INSERT INTO passwords (user_id, password)
VALUES
('u1', '$2b$10$O2E5CNtThjVhXwMzo.HcQu9hmYIp4k6pjrL5CqOCEyyA5EzQnODaa'),
('u2', '$2b$10$Wyp8GZjsXqx8FqqUG1ZK1etUrmMLUYn7N0rP3dTGl/BFGzi8pZhuO'),
('u3', '$2b$10$uzYoF.Xm0ReFgBkquvZ8qeJ8P8Z6O6ioNeRyX6w0LgS2gOk9shksK');

-- Personal Todos
INSERT INTO todos (id, userId, title, completed)
VALUES
('t1', 'u1', 'Run 3 km', FALSE),
('t2', 'u1', '20 Sit-ups', TRUE),
('t3', 'u2', '15 Push-ups', FALSE);

-- Challenges
INSERT INTO challenges (id, title, description, goal, progress, deadline, media_url, createdBy)
VALUES
('c1', '5K Running Challenge', 'Run at least 5 km once this week', 2, 1, '2025-09-15', 'https://example.com/run5k.jpg', 'u3'),
('c2', '30-Day Plank', 'Do a plank of at least 1 minute every day for a month', 3, 0, '2025-09-30', 'https://example.com/plank30.mp4', 'u3');

-- Todos linked to Challenges
INSERT INTO todos (id, userId, title, completed, challengeId)
VALUES
('t4', 'u1', '5K Running Challenge', TRUE, 'c1'),
('t5', 'u2', '5K Running Challenge', FALSE, 'c1'),
('t6', 'u1', '30-Day Plank', FALSE, 'c2');

-- Challenge Participants
INSERT INTO challenge_participants (challengeId, userId, completed)
VALUES
('c1', 'u1', TRUE),
('c1', 'u2', FALSE),
('c2', 'u1', FALSE),
('c2', 'u2', FALSE),
('c2', 'u3', FALSE);

-- Posts
INSERT INTO posts (id, userId, title, body, image_url)
VALUES
('p1', 'u1', 'Finished my first 5K run!', 'Couldn\'t believe I managed to run 5 km in a row 💪', 'https://example.com/dana_run.jpg'),
('p2', 'u3', 'Tip: How to stay consistent with planks', 'Try using the same music to time yourself every day', NULL);

-- Comments
INSERT INTO comments (id, postId, name, email, body, userId)
VALUES
('cm1', 'p1', 'Yossi Levi', 'yossi@example.com', 'Great job Dana! Inspiring 👏', 'u2'),
('cm2', 'p2', 'Dana Cohen', 'dana@example.com', 'Thanks for the tip, I will try it this week!', 'u1');
