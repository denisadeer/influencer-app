require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const http = require('http');
const jwt = require('jsonwebtoken');
const { Server } = require('socket.io');
const Message = require("./models/Message");

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: 'http://localhost:5716',
    methods: ['GET', 'POST'],
  },
});

const PORT = process.env.PORT || 5713;
const mongoUri = process.env.MONGO_URI;

// Stripe webhook
// ✅ SPRÁVNĚ:
app.use('/api/stripe/webhook', require('./routes/stripeWebhook'));


// Middleware
app.use(cors({
  origin: "http://localhost:5716",
  credentials: true,
}));app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// MongoDB připojení
mongoose.connect(mongoUri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('✅ MongoDB připojeno'))
  .catch(err => console.error('❌ MongoDB error:', err));

// Upload adresář
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname),
});
const upload = multer({ storage, limits: { fileSize: 50 * 1024 * 1024 } });

const authenticateToken = require('./middleware/authenticateToken');

// ROUTY
app.use(express.static(path.join(__dirname, 'landing')));
app.use('/', require('./landingRoutes'));
app.use("/api/auth", require("./routes/authRoutes"));
app.use('/api/influencer', require('./routes/influencerRoutes'));
app.use('/api/business', require('./routes/businessRoutes'));
app.use('/api/subscription', require('./routes/subscriptionRoutes'));
app.use('/api/influencers', require('./routes/influencerListRoute'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/admin', require('./routes/adminUserProfileRoutes'));
app.use('/api/chat', require('./routes/chatRoutes'));
app.use('/api/public', require('./routes/publicRoutes'));


// Upload fotky
app.post('/upload-photo', upload.single('photo'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'Žádný soubor nebyl nahrán.' });
  }

  try {
    const photoUrl = `/uploads/${req.file.filename}`;
    res.status(200).json({ message: 'Fotka byla úspěšně nahrána.', photoUrl });
  } catch (error) {
    console.error('❌ Chyba při ukládání fotky:', error);
    res.status(500).json({ message: 'Chyba serveru', error: error.message });
  }
});

// Testovací chráněná route
app.get('/protected', authenticateToken, (req, res) => {
  res.json({ message: `Ahoj ${req.user.userId}, máš přístup!`, role: req.user.role });
});


// 💬 SOCKET.IO AUTENTIZACE
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) {
    console.warn("❌ Socket bez tokenu");
    return next(new Error("Authentication error"));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.user = decoded;
    console.log("✅ JWT ověřený (socket):", socket.user);
    next();
  } catch (err) {
    console.error("❌ Neplatný JWT token:", err.message);
    return next(new Error("Invalid token"));
  }
});

// 💬 SOCKET.IO realtime zprávy
io.on("connection", (socket) => {
  console.log("🔌 Připojen:", socket.id);

  // ✅ Připojit uživatele do vlastní místnosti
  const userId = socket.user?.userId;
  if (userId) {
    socket.join(userId.toString());
    console.log(`✅ Socket přidán do místnosti: ${userId}`);
  }

  socket.on("send_message", async (data) => {
    console.log("📩 Příjem zprávy (socket):", data);

    const senderId = socket.user?.userId;
    const { receiverId: rawReceiverId, message, timestamp } = data;

    if (!senderId || !rawReceiverId || !message) {
      console.error("❌ Chybí data (senderId, receiverId nebo message)", {
        senderId,
        rawReceiverId,
        message,
      });
      return;
    }

    let receiverId;
    try {
      receiverId = new mongoose.Types.ObjectId(rawReceiverId);
    } catch (err) {
      console.error("❌ receiverId není validní ObjectId:", rawReceiverId);
      return;
    }

    try {
      const savedMessage = new Message({
        senderId,
        receiverId,
        message,
        timestamp: timestamp || new Date(),
      });

      await savedMessage.save();

      // ✅ Emit zprávy odesílateli i příjemci do jejich místností
      io.to(senderId.toString()).emit("receive_message", {
        senderId,
        receiverId,
        message,
        timestamp,
      });

      io.to(receiverId.toString()).emit("receive_message", {
        senderId,
        receiverId,
        message,
        timestamp,
      });
    } catch (err) {
      console.error("❌ Chyba při ukládání zprávy (socket):", err);
    }
  });

  socket.on("disconnect", () => {
    console.log("❌ Odpojen:", socket.id);
  });
});

// Spuštění serveru
server.listen(PORT, () => {
  console.log(`🚀 Server běží na portu ${PORT}`);
});
