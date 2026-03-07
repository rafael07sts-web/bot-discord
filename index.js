require("dotenv").config();

const http = require("http");
const { Client, GatewayIntentBits } = require("discord.js");

const PORT = process.env.PORT || 10000;

http.createServer((req, res) => {
  res.writeHead(200, { "Content-Type": "text/plain" });
  res.end("Bot is online!");
}).listen(PORT, () => {
  console.log("HTTP running on port", PORT);
});

async function testToken() {
  try {
    const response = await fetch("https://discord.com/api/v10/users/@me", {
      headers: {
        Authorization: `Bot ${process.env.TOKEN}`,
      },
    });

    console.log("TOKEN TEST STATUS:", response.status);

    const text = await response.text();
    console.log("TOKEN TEST RESPONSE:", text);
  } catch (error) {
    console.error("TOKEN TEST ERROR:", error);
  }
}

const client = new Client({
  intents: [GatewayIntentBits.Guilds],
});

client.once("ready", () => {
  console.log(`READY: ${client.user.tag}`);
});

client.on("error", (error) => {
  console.error("CLIENT ERROR:", error);
});

process.on("unhandledRejection", (reason) => {
  console.error("UNHANDLED REJECTION:", reason);
});

process.on("uncaughtException", (error) => {
  console.error("UNCAUGHT EXCEPTION:", error);
});

console.log("Starting login...");
console.log("TOKEN exists:", !!process.env.TOKEN);

testToken();

client.login(process.env.TOKEN)
  .then(() => {
    console.log("LOGIN PROMISE RESOLVED");
  })
  .catch((error) => {
    console.error("LOGIN FAILED:", error);
  });

setTimeout(() => {
  console.log("Login still pending after 20 seconds...");
}, 20000);