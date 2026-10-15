
import express from "express";
import cors from "cors";
import jwt from "jsonwebtoken";

const app = express();

app.use(cors());
app.use(express.json());

const SECRET = "library-demo-secret-change-this";

const members = [
  {
    id: "M001",
    email: "member@library.com",
    password: "library123",
    name: "Arjun Kumar"
  }
];

function authenticate(req, res, next) {
  const header = req.headers.authorization;

  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({
      message: "Authentication token required."
    });
  }

  try {
    req.user = jwt.verify(header.slice(7), SECRET);
    next();
  } catch {
    return res.status(401).json({
      message: "Invalid or expired token. Please log in again."
    });
  }
}


app.post("/api/auth/login", (req, res) => {
  const idOrEmail = String(req.body.idOrEmail || "").trim().toLowerCase();
  const password = String(req.body.password || "").trim();

  console.log("Login attempt:", idOrEmail);
  console.log("Password received:", JSON.stringify(req.body.password));

  const member = members.find((m) => {
    const memberId = String(m.id || "").trim().toLowerCase();
    const email = String(m.email || "").trim().toLowerCase();

    return (
      (memberId === idOrEmail || email === idOrEmail) &&
      String(m.password) === password
    );
  });

  if (!member) {
    console.log("Login failed: member not found or password mismatch");

    return res.status(401).json({
      message: "Invalid member ID/email or password."
    });
  }

  const accessToken = jwt.sign(
    { sub: member.id, name: member.name },
    SECRET,
    { expiresIn: "15m" }
  );

  console.log("Login successful:", member.id);

  res.json({
    accessToken,
    user: {
      id: member.id,
      name: member.name,
      email: member.email
    }
  });
});


app.get("/api/profile", authenticate, (req, res) => {
  const member = members.find((m) => m.id === req.user.sub);

  if (!member) {
    return res.status(404).json({ message: "Member not found." });
  }

  res.json({
    id: member.id,
    name: member.name,
    email: member.email
  });
});

app.get("/api/history", authenticate, (req, res) => {
  res.json({ message: "Protected reading history", records: [] });
});

app.get("/api/borrowings", authenticate, (req, res) => {
  res.json({ message: "Protected borrowing API", records: [] });
});

app.listen(3002, () => {
  console.log("Authentication API running at http://localhost:3002");
});
