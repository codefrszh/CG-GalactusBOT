// bot.js
require("dotenv").config();
const fs = require("fs");
const path = require("path");
const express = require("express");
const cors = require("cors");
const fetch = (...args) => import("node-fetch").then(({ default: fetch }) => fetch(...args));
const {
  Client,
  Collection,
  GatewayIntentBits,
  Partials,
  REST,
  Routes,
  SlashCommandBuilder,
} = require("discord.js");
const { sendLog } = require("./utils/logger");
const config = require("./config.json");

// -----------------------------
// Función segura para responder a interacciones
// -----------------------------
async function safeReply(interaction, content, ephemeral = true) {
  try {
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({ content, ephemeral });
    } else {
      await interaction.reply({ content, ephemeral });
    }
  } catch (err) {
    console.error("❌ Error enviando respuesta:", err);
  }
}

// -----------------------------
// Crear cliente
// -----------------------------
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildVoiceStates,
<<<<<<< HEAD
     GatewayIntentBits.GuildPresences,
=======
>>>>>>> e6c235f (update y integracion de cors para api)
  ],
  partials: [Partials.Message, Partials.Channel, Partials.Reaction],
});

// -----------------------------
// Colección de comandos
// -----------------------------
client.commands = new Collection();
const commandsPath = path.join(__dirname, "commands");
const commandFiles = fs.readdirSync(commandsPath).filter((f) => f.endsWith(".js"));

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
// Cargar eventos
// -----------------------------
const eventsPath = path.join(__dirname, "events");
const eventFiles = fs.readdirSync(eventsPath).filter((f) => f.endsWith(".js"));

for (const file of eventFiles) {
  const event = require(path.join(eventsPath, file));
  if (!event.name || !event.execute) {
    console.warn(`⚠️ Evento inválido: ${file}`);
    continue;
  }
  if (event.once) {
    client.once(event.name, (...args) => event.execute(...args, client));
  } else {
    client.on(event.name, (...args) => event.execute(...args, client));
  }
  console.log(`✅ Evento cargado: ${event.name}`);
}

// -----------------------------
// Registrar slash commands
// -----------------------------
const rest = new REST({ version: "10" }).setToken(process.env.TOKEN);
const clientId = process.env.CLIENT_ID;
const guildId = process.env.GUILD_ID;

(async () => {
  try {
    console.log("⏳ Registrando comandos slash...");
    const slashCommands = [...client.commands.values()]
      .filter((cmd) => cmd.data instanceof SlashCommandBuilder)
      .map((cmd) => cmd.data.toJSON());

    if (!guildId) {
      await rest.put(Routes.applicationCommands(clientId), { body: slashCommands });
      console.log("✅ Comandos registrados globalmente.");
    } else {
      await rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: slashCommands });
      console.log("✅ Comandos registrados en el servidor de pruebas.");
    }

    sendLog("Deploy Comandos", "✅ Comandos actualizados.", "Green");
  } catch (error) {
    console.error("❌ Error registrando comandos:", error);
    sendLog("Error Deploy Comandos", `${error}`, "Red");
  }
})();

// -----------------------------
// Evento ready
// -----------------------------
client.once("ready", () => {
  console.log(`✅ Bot iniciado como ${client.user.tag}`);
  sendLog("Bot Iniciado", `✅ ${client.user.tag} está online`, "Green");

  client.user.setPresence({
    activities: [{ name: "☄️ Galacti@s", type: 3 }],
<<<<<<< HEAD
    status: "dnd",
=======
    status: "online",
>>>>>>> e6c235f (update y integracion de cors para api)
  });
});

// -----------------------------
// Interacciones slash
// -----------------------------
client.on("interactionCreate", async (interaction) => {
  try {
    if (!interaction.isCommand()) return;

    const command = client.commands.get(interaction.commandName);
    if (!command) return;

    await command.execute(interaction, safeReply);

    sendLog(
      "Comando Ejecutado",
      `Usuario <@${interaction.user.id}> ejecutó /${interaction.commandName}`,
      "Blue"
    );
  } catch (err) {
    console.error("❌ Error en interactionCreate:", err);
    sendLog("Error interactionCreate", `${err}`, "Red");

    if (interaction.isCommand()) safeReply(interaction, "❌ Error interno.", true);
  }
});

// -----------------------------
// Mensajes con prefijo (!)
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
// Login bot
// -----------------------------
client
  .login(process.env.TOKEN)
  .then(() => console.log("🔑 Token válido, bot conectado."))
  .catch((err) => {
    console.error("❌ Error al iniciar sesión:", err);
  });

// ======================================================
// ✅ SERVIDOR WEB (RENDER) + API /stats + API /health
// ======================================================
const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 10000;

// ✅ Página principal
app.get("/", (req, res) => {
  res.send("✅ Galactus API Online");
});

<<<<<<< HEAD
// ==============================
// ✅ STATS DEL SERVIDOR
// ==============================
=======
// ✅ STATS DEL SERVIDOR
>>>>>>> e6c235f (update y integracion de cors para api)
app.get("/api/stats", async (req, res) => {
  try {
    const guildId = "1032134781284126791"; // tu servidor
    const guild = client.guilds.cache.get(guildId);

    if (!guild) return res.status(404).json({ error: "Guild not found" });

<<<<<<< HEAD
    // Traer todos los miembros para que la caché esté completa
    await guild.members.fetch();

    // Miembros humanos online
    const onlineMembers = guild.members.cache.filter(
      (m) =>
        !m.user.bot &&
        (m.presence?.status === "online" ||
          m.presence?.status === "idle" ||
          m.presence?.status === "dnd")
    ).size;

    // Total miembros humanos
    const totalMembers = guild.members.cache.filter((m) => !m.user.bot).size;

    // Bots activos (online, idle, dnd)
    const activeBots = guild.members.cache.filter(
      (m) =>
        m.user.bot &&
        (m.presence?.status === "online" ||
          m.presence?.status === "idle" ||
          m.presence?.status === "dnd")
    ).size;

    // Responder JSON
=======
    await guild.members.fetch();

    const onlineMembers = guild.members.cache.filter(
      (m) =>
        m.presence?.status === "online" ||
        m.presence?.status === "idle" ||
        m.presence?.status === "dnd"
    ).size;

    const totalMembers = guild.members.cache.filter((m) => !m.user.bot).size;

    const botCount = guild.members.cache.filter((m) => m.user.bot).size;

>>>>>>> e6c235f (update y integracion de cors para api)
    return res.json({
      guildName: guild.name,
      onlineMembers,
      totalMembers,
<<<<<<< HEAD
      botCount: activeBots,
=======
      botCount,
>>>>>>> e6c235f (update y integracion de cors para api)
      timestamp: Date.now(),
    });
  } catch (err) {
    console.error("❌ /api/stats error:", err);
    res.status(500).json({ error: "Failed to fetch stats" });
  }
});

<<<<<<< HEAD

=======
>>>>>>> e6c235f (update y integracion de cors para api)
// ✅ HEALTH CHECK
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    botOnline: client.ws.ping > 0,
    latency: client.ws.ping,
    timestamp: Date.now(),
  });
});

// ✅ Iniciar servidor
app.listen(PORT, () => {
  console.log(`🌐 API escuchando en puerto ${PORT}`);
});

// -----------------------------
// Auto-ping para Render
// -----------------------------
const KEEP_ALIVE_INTERVAL = 5 * 60 * 1000;
const keepAliveUrl = process.env.URL;

if (keepAliveUrl) {
  setInterval(async () => {
    try {
      await fetch(keepAliveUrl, { method: "GET" });
      console.log("🔄 Auto-ping enviado a Render");
      sendLog("KEEPALIVE", `Ping enviado a ${keepAliveUrl}`, "Blue");
    } catch (err) {
      console.error("❌ Error en auto-ping:", err);
    }
  }, KEEP_ALIVE_INTERVAL);
}

module.exports = { client, safeReply };
