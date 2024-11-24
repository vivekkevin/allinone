const express = require("express");
const nodemailer = require("nodemailer");
const otpGenerator = require("otp-generator");
const sanitizeHtml = require("sanitize-html");
const Chat = require("../models/Chat"); // Chat model
const session = require("express-session");

const router = express.Router();

// Temporary OTP storage (use Redis or database in production)
let otpStorage = {};

// Allowed email for OTP-based access
const ALLOWED_EMAIL = "vivekkevin1995@gmail.com";

// Sanitize input helper function
const sanitizeInput = (input) =>
  sanitizeHtml(input, { allowedTags: [], allowedAttributes: {} });

// Email transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Middleware to check authentication
const checkAuth = (req, res, next) => {
  if (req.session && req.session.isAuthenticated) {
    return next();
  }
  return res.redirect("/otp-verification");
};

// Route to render OTP Verification Page
router.get("/otp-verification", (req, res) => {
  res.render("otp-verification", { title: "Verify OTP" });
});

// Route to generate and send OTP
router.post("/send-otp", async (req, res) => {
  const { email } = req.body;

  if (email !== ALLOWED_EMAIL) {
    return res.status(403).json({ success: false, message: "Unauthorized email." });
  }

  const otp = otpGenerator.generate(6, { digits: true });
  otpStorage[email] = otp;

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Your OTP Code",
      text: `Your OTP code is ${otp}`,
    });
    res.status(200).json({ success: true, message: "OTP sent successfully." });
  } catch (error) {
    console.error("Error sending OTP:", error);
    res.status(500).json({ success: false, message: "Failed to send OTP." });
  }
});

// Route to verify OTP
router.post("/verify-otp", (req, res) => {
  const { email, otp } = req.body;

  if (email !== ALLOWED_EMAIL) {
    return res.status(403).json({ success: false, message: "Unauthorized email." });
  }

  if (otpStorage[email] && otpStorage[email] === otp) {
    delete otpStorage[email]; // Clear OTP after successful verification
    req.session.isAuthenticated = true; // Set session authenticated
    return res.redirect("/chat-dashboard");
  } else {
    return res.status(400).json({ success: false, message: "Invalid OTP." });
  }
});

// Route to render the chat dashboard
router.get("/chat-dashboard", checkAuth, async (req, res) => {
    try {
        // Fetch all chats and sort by most recent
        const chatCollection = await Chat.find()
            .sort({ updatedAt: -1 })
            .lean();

        // Format the chats for the dashboard
        const formattedChats = chatCollection.map(chat => ({
            id: chat._id.toString(),
            name: sanitizeInput(chat.name),
            email: sanitizeInput(chat.email),
            platform: sanitizeInput(chat.platform || 'WhatsApp'),
            messages: chat.messages.map(msg => ({
                sender: sanitizeInput(msg.sender),
                message: sanitizeInput(msg.message),
                timestamp: msg.timestamp
            }))
        }));

        // Render the dashboard with the formatted chat collection
        res.render("chat-dashboard", { 
            title: "Admin Chat Interface", 
            chatCollection: formattedChats 
        });

    } catch (error) {
        console.error("Error fetching chats:", error);
        res.render("chat-dashboard", { 
            title: "Admin Chat Interface", 
            chatCollection: [],
            error: "Error fetching chat data."
        });
    }
});


// Route to handle replies to a specific chat
router.post("/chat/reply", async (req, res) => {
    const { email, replyMessage } = req.body;

    try {
        const sanitizedReply = sanitizeInput(replyMessage);
        const chat = await Chat.findOne({ email });

        if (!chat) {
            return res.status(404).send("No chat found for this email.");
        }

        // Send the reply via email
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: "Support Response",
            text: sanitizedReply,
        });

        // Save the reply to the chat
        chat.messages.push({
            sender: "support",
            message: sanitizedReply,
            timestamp: new Date(),
        });
        await chat.save();

        res.redirect("/chat-dashboard");
    } catch (error) {
        console.error("Error sending reply:", error);
        res.status(500).send("Error sending reply.");
    }
});

// Route to start a chat session
router.post("/start-chat", async (req, res) => {
    const { name, email, platform } = req.body;
  
    // Validate input
    if (!name || !email || !platform) {
      return res.status(400).json({ success: false, message: "All fields are required." });
    }
  
    try {
      // Check if a chat session already exists for the user
      let chat = await Chat.findOne({ email });
  
      if (!chat) {
        // Create a new chat session
        chat = new Chat({
          name: sanitizeInput(name),
          email: sanitizeInput(email),
          platform: sanitizeInput(platform),
          messages: [],
        });
        await chat.save();
      }
  
      res.status(200).json({ success: true, message: "Chat started successfully." });
    } catch (error) {
      console.error("Error starting chat:", error);
      res.status(500).json({ success: false, message: "An unexpected error occurred." });
    }
  });
  

// Route to send a user message to support
router.post("/send-chat-message", async (req, res) => {
    const { email, message } = req.body;
  
    // Validate input
    if (!email || !message) {
      return res.status(400).json({ success: false, message: "Email and message are required." });
    }
  
    try {
      const chat = await Chat.findOne({ email });
  
      if (!chat) {
        return res.status(404).json({ success: false, message: "Chat session not found." });
      }
  
      // Add the message to the chat
      chat.messages.push({
        sender: "user",
        message: sanitizeInput(message),
        timestamp: new Date(),
      });
      await chat.save();
  
      res.status(200).json({ success: true, message: "Message sent successfully." });
    } catch (error) {
      console.error("Error sending chat message:", error);
      res.status(500).json({ success: false, message: "An unexpected error occurred." });
    }
  });
  
  
// Route to fetch chat messages for a specific user
router.get("/get-chat-messages", async (req, res) => {
  const { email } = req.query;

  try {
    const chat = await Chat.findOne({ email });

    if (!chat) {
      return res.status(404).json({ success: false, message: "Chat session not found." });
    }

    res.status(200).json({ success: true, messages: chat.messages });
  } catch (error) {
    console.error("Error fetching chat messages:", error);
    res.status(500).json({ success: false, message: "Failed to fetch messages." });
  }
});

// Route to fetch messages for support
router.get("/support-fetch", async (req, res) => {
  const { email } = req.query;

  try {
    const chat = await Chat.findOne({ email });

    if (!chat) {
      return res.status(404).json({ success: false, message: "Chat session not found." });
    }

    res.status(200).json({ success: true, messages: chat.messages });
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ success: false, message: "Failed to fetch messages." });
  }
});

// Route to post a support team's message
router.post("/support-post", async (req, res) => {
  const { email, message } = req.body;

  try {
    const chat = await Chat.findOne({ email });

    if (!chat) {
      return res.status(404).json({ success: false, message: "Chat session not found." });
    }

    chat.messages.push({
      sender: "support",
      message: sanitizeInput(message),
      timestamp: new Date(),
    });
    await chat.save();

    res.status(200).json({ success: true, message: "Message posted successfully." });
  } catch (error) {
    console.error("Error posting support message:", error);
    res.status(500).json({ success: false, message: "Failed to post message." });
  }
});

router.post('/chat/:chatId/deleteMessage', (req, res) => {
    const { chatId } = req.params;
    const { messageIndex } = req.body;

    // Find the chat by ID
    const chat = chatCollection.find((c) => c.id === chatId);

    if (chat && chat.messages[messageIndex]) {
        chat.messages.splice(messageIndex, 1); // Remove the message
        res.status(200).json({ message: 'Message deleted successfully' });
    } else {
        res.status(404).json({ error: 'Message not found' });
    }
});


module.exports = router;
