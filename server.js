const express = require("express");
const http = require("http");
const WebSocket = require("ws");

const app = express();
const server = http.createServer(app);

const PORT = process.env.PORT || 3000;

// Normal HTTP test
app.get("/", (req, res) => {
  res.send("AI Assistant Server is online ✅");
});

// -------------------------------
// FIXED RESPONSES
// -------------------------------

function getResponse(text) {
  text = text.toLowerCase();

  if (
    text.includes("hello") ||
    text.includes("hi") ||
    text.includes("hey")
  ) {
    return "Hello! How can I help you today?";
  }

  if (
    text.includes("opening") ||
    text.includes("hours") ||
    text.includes("open")
  ) {
    return "We are open Monday to Saturday.";
  }

  if (
    text.includes("location") ||
    text.includes("where are you") ||
    text.includes("address")
  ) {
    return "Please visit our website for our location information.";
  }

  if (
    text.includes("human") ||
    text.includes("person") ||
    text.includes("agent") ||
    text.includes("someone")
  ) {
    return "Okay. I will connect you to a member of the team.";
  }

  if (
    text.includes("bye") ||
    text.includes("goodbye")
  ) {
    return "Thank you for calling. Goodbye!";
  }

  return "Sorry, I didn't understand that. Could you please say that again?";
}

// -------------------------------
// WEBSOCKET
// -------------------------------

const wss = new WebSocket.Server({
  server,
  path: "/ws"
});

wss.on("connection", (ws) => {

  console.log("🟢 WebSocket connected");

  // Send a welcome message
  ws.send(JSON.stringify({
    type: "welcome",
    text: "Hello! How can I help you today?"
  }));

  ws.on("message", (data) => {

    const raw = data.toString();

    console.log("Received:", raw);

    let message;

    try {
      message = JSON.parse(raw);
    } catch {
      message = {
        text: raw
      };
    }

    const userText =
      message.text ||
      message.message ||
      "";

    if (!userText) {
      return;
    }

    console.log("👤 User:", userText);

    const response = getResponse(userText);

    console.log("🤖 Assistant:", response);

    ws.send(JSON.stringify({
      type: "response",
      text: response
    }));
  });

  ws.on("close", () => {
    console.log("🔴 WebSocket disconnected");
  });

  ws.on("error", (error) => {
    console.error("WebSocket error:", error);
  });
});

// -------------------------------
// START SERVER
// -------------------------------

server.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
