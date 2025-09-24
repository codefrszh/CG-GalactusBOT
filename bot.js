require("dotenv").config();
const fs = require("fs");
const path = require("path");
const express = require("express");
const { Client, Collection, GatewayIntentBits, Partials, REST, Routes, SlashCommandBuilder } = require("discord.js");
const { sendLog } = require("./utils/logger");
const config = require("./config.json");

// -----------------------------
// Crear cliente
// -----------------------------
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildVoiceStates
  ],
  partials: [Partials.Message, Partials.Channel, Partials.Reaction],
});

// -----------------------------
// Colección de comandos
// -----------------------------
client.commands = new Collection();
const commandsPath = path.join(__dirname, "commands");
const commandFiles = fs.readdirSync(commandsPath).filter(f => f.endsWith(".js"));

for (const file of commandFiles) {
  const command = require(path.join(commandsPath, file));
  if (!command.data || !command.data.name) {
    console.warn(`⚠️ Comando inválido: ${file}`);
    continue;
  }
  client.commands.set(command.data.name, command);
  console.log(`✅ Comando cargado: ${command.data.name}`);
}

// -----------------------------
// Registrar comandos slash
// -----------------------------
const rest = new REST({ version: "10" }).setToken(process.env.TOKEN);
const clientId = process.env.CLIENT_ID;
const guildId = process.env.GUILD_ID;

const slashCommands = Array.from(client.commands.values())
  .filter(cmd => cmd.data instanceof SlashCommandBuilder)
  .map(cmd => cmd.data.toJSON());

(async () => {
  try {
    console.log("⏳ Registrando comandos slash...");
    if (!guildId) {
      await rest.put(Routes.applicationCommands(clientId), { body: slashCommands });
      console.log("✅ Comandos registrados globalmente.");
    } else {
      await rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: slashCommands });
      console.log("✅ Comandos registrados en servidor de prueba.");
    }
  } catch (err) {
    console.error("❌ Error registrando comandos slash:", err);
    sendLog("Error Deploy Comandos", `${err}`, "Red");
  }
})();

// -----------------------------
// Cargar eventos
// -----------------------------
const eventsPath = path.join(__dirname, "events");
const eventFiles = fs.readdirSync(eventsPath).filter(f => f.endsWith(".js"));

for (const file of eventFiles) {
  const event = require(path.join(eventsPath, file));
  if (event.once) {
    client.once(event.name, (...args) => event.execute(...args, client));
  } else {
    client.on(event.name, (...args) => event.execute(...args, client));
  }
  console.log(`✅ Evento cargado: ${event.name}`);
}

// -----------------------------
// Evento ready
// -----------------------------
client.once("ready", () => {
  console.log(`✅ Bot iniciado como ${client.user.tag}`);
  sendLog("Bot Iniciado", `Bot iniciado como **${client.user.tag}**`, "Green");

  client.user.setPresence({
    activities: [{ name: "☄️ 3I|Atlas", type: 3 }],
    status: "online"
  });
});

// -----------------------------
// Comandos por prefix
// -----------------------------
client.on("messageCreate", async (message) => {
  if (!message.content.startsWith(config.prefix) || message.author.bot) return;

  const args = message.content.slice(config.prefix.length).trim().split(/ +/);
  const commandName = args.shift().toLowerCase();

  if (commandName === "ping") {
    await message.reply("🏓 Pong!");
    sendLog("Comando Ping", `Usuario <@${message.author.id}> ejecutó !ping`, "Blue");
  }
});

// -----------------------------
// Login del bot
// -----------------------------
client.login(process.env.TOKEN)
  .then(() => console.log("🔑 Bot conectado."))
  .catch(err => console.error("❌ Error login:", err));

// -----------------------------
// Servidor web para mantener vivo en Render
// -----------------------------
const app = express();
const PORT = process.env.PORT || 10000;

app.get("/", (req, res) => res.send("Servidor web activo ✅"));
app.listen(PORT, () => console.log(`Servidor web escuchando en puerto ${PORT}`));

// -----------------------------
// Auto-ping
// -----------------------------
const KEEP_ALIVE_INTERVAL = 5 * 60 * 1000;
const keepAliveUrl = process.env.URL;

if (keepAliveUrl) {
  setInterval(async () => {
    try {
      await fetch(keepAliveUrl, { method: "GET" });
      console.log("🔄 Auto-ping enviado");
      sendLog("KeepAlive", `Auto-ping enviado al servidor (${keepAliveUrl})`, "Blue");
    } catch (err) {
      console.error("❌ Error auto-ping:", err);
      sendLog("KeepAlive Error", `${err}`, "Red");
    }
  }, KEEP_ALIVE_INTERVAL);
} else {
  console.warn("⚠️ process.env.URL no definido, auto-ping desactivado.");
}
