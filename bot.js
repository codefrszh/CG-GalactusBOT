require("dotenv").config();
const express = require("express");
const { Client, GatewayIntentBits, Partials, Collection } = require("discord.js");
const fs = require("fs");
const path = require("path");
const config = require("./config.json");
const { sendLog } = require("./utils/logger");

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMembers],
  partials: [Partials.Message, Partials.Channel, Partials.Reaction]
});

client.commands = new Collection();

// Cargar comandos
const commandsPath = path.join(__dirname, "commands");
fs.readdirSync(commandsPath).filter(f => f.endsWith(".js")).forEach(file => {
  const command = require(path.join(commandsPath, file));
  client.commands.set(command.data.name, command);
});

// Cargar eventos
const eventsPath = path.join(__dirname, "events");
fs.readdirSync(eventsPath).filter(f => f.endsWith(".js")).forEach(file => {
  const event = require(path.join(eventsPath, file));
  client.on(event.name, (...args) => event.execute(...args));
});

// Eventos básicos
client.on("ready", () => {
  console.log(`✅ Bot iniciado como ${client.user.tag}`);
  sendLog("Bot iniciado", `Bot iniciado como ${client.user.tag}`, "Green");
});

client.on("error", err => sendLog("Error client", err.message, "Red"));

// Prefix comandos opcional
client.on("messageCreate", msg => {
  if (!msg.content.startsWith(config.prefix) || msg.author.bot) return;
  const args = msg.content.slice(config.prefix.length).trim().split(/ +/);
  const cmd = args.shift().toLowerCase();
  if (cmd === "ping") msg.reply("🏓 Pong!");
});

// Login
client.login(process.env.TOKEN).catch(err => console.error("❌ Token inválido:", err));

// ===== Servidor web para keep-alive =====
const app = express();
const PORT = process.env.PORT || 10000;

app.get("/", (req, res) => res.send("Bot activo!"));

app.listen(PORT, () => console.log(`Servidor web escuchando en el puerto ${PORT}`));
