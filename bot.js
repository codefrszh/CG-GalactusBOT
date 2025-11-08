// bot.js (versión final - Option 3: mensajes + voz)
// Requiere: ./database/initLevels.js (sqlite db), ./utils/logger.js, carpeta commands/, carpeta events/ (opcional)
require("dotenv").config();
const fs = require("fs");
const path = require("path");
const express = require("express");
const cors = require("cors");
const db = require("./database/initLevels"); // tu initLevels.js
const fetch = (...args) => import("node-fetch").then(({ default: fetch }) => fetch(...args));
const {
  Client,
  Collection,
  GatewayIntentBits,
  Partials,
  REST,
  Routes,
  SlashCommandBuilder,
  ActivityType
} = require("discord.js");
const { sendLog } = require("./utils/logger");
const config = require("./config.json");

// -----------------------------
// Helpers DB / Leveling
// -----------------------------
/**
 * Devuelve el role ID que corresponde al nivel exacto (cuando el usuario alcanza ese nivel).
 * Si quieres roles por rango (>=5, >=10...) adapta la lógica.
 */
function getLevelRole(level) {
  const roles = {
    5: "1436449769286402191",  // tripulante
    10: "1436449687384363120", // Rango Bronze
    20: "1436449720405983402", // Rango Plata
    50: "1436449741234567890", // Rango Oro
    100: "1436449630362800229" // Rango Diamante
  };
  // Si quieres que al alcanzar >=20 reciba plata, podrías buscar el mayor <= level.
  return roles[level] || null;
}

/**
 * Actualiza XP y nivel en DB. Retorna { leveledUp: bool, newLevel }
 */
function addXpToUser(userId, xpToAdd, guild) {
  return new Promise((resolve) => {
    db.get("SELECT * FROM users WHERE user_id = ?", [userId], (err, row) => {
      if (err) {
        console.error("DB error get user:", err);
        return resolve({ leveledUp: false });
      }
      const now = Date.now();
      if (!row) {
        // insertar nuevo
        const initialLevel = 1;
        const initialXP = xpToAdd;
        db.run(
          "INSERT INTO users (user_id, xp, level, last_message, voice_time, last_join_voice) VALUES (?, ?, ?, ?, ?, ?)",
          [userId, initialXP, initialLevel, now, 0, null],
          (err2) => {
            if (err2) console.error("DB insert error:", err2);
            resolve({ leveledUp: false, newLevel: initialLevel });
          }
        );
        return;
      }
      const newXP = row.xp + xpEarned;
      let newLevel = row.level;
      let leveledUp = false;
      if (newXP >= nextLevelXP) {
    newLevel++;
    leveledUp = true;
}
    // Actualizar total_score
    const newTotal = newXP + (row.voice_time || 0);


      // Fórmula simple: nextLevelXP = level * 100
      while (newXP >= newLevel * 100) {
        newLevel++;
        leveledUp = true;
      }
      
      

      db.run(
        "UPDATE users SET xp = ?, level = ?, last_message = ? WHERE user_id = ?",
        [newXP, newLevel, now, userId],
        (err3) => {
          if (err3) console.error("DB update error:", err3);
          // si subió, asignar rol (si existe) y remover roles anteriores (opc)
          if (leveledUp && guild) {
            // Busca rol exacto para nuevoLevel (puedes adaptarlo a ranges)
            const roleId = getLevelRole(newLevel);
            if (roleId) {
              const member = guild.members.cache.get(userId);
              if (member) {
                member.roles.add(roleId).catch(() => {});
                // opcional: podrías remover roles de niveles anteriores
                // comprobar roles con getLevelRole para niveles más bajos y removerlos
                Object.values(getLevelRoleMap()).forEach(rId => {
                  if (rId && rId !== roleId) {
                    member.roles.remove(rId).catch(() => {});
                  }
                });
              }
            }
          }
          resolve({ leveledUp, newLevel });
        }
      );
    });
  });
}

/**
 * Map completo de niveles->roleId (para remover roles previos)
 */
function getLevelRoleMap() {
  return {
    5: "1436449769286402191",
    10: "1436449687384363120",
    20: "1436449720405983402",
    50: "1436449741234567890",
    100: "1436449630362800229"
  };
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
    GatewayIntentBits.GuildPresences
  ],
  partials: [Partials.Message, Partials.Channel, Partials.Reaction]
});

// -----------------------------
// Colección de comandos
// -----------------------------
client.commands = new Collection();
const commandsPath = path.join(__dirname, "commands");
const commandFiles = fs.existsSync(commandsPath) ? fs.readdirSync(commandsPath).filter((f) => f.endsWith(".js")) : [];

for (const file of commandFiles) {
  try {
    const command = require(path.join(commandsPath, file));
    if (!command.data || !command.data.name) {
      console.warn(`⚠️ Comando inválido: ${file}`);
      continue;
    }
    client.commands.set(command.data.name, command);
    console.log(`✅ Comando cargado: ${command.data.name}`);
  } catch (err) {
    console.error(`❌ Error cargando comando ${file}:`, err);
  }
}

// -----------------------------
// Cargar eventos (salteamos voiceStateUpdate si lo manejamos aquí)
// -----------------------------
const eventsPath = path.join(__dirname, "events");
if (fs.existsSync(eventsPath)) {
  const eventFiles = fs.readdirSync(eventsPath).filter((f) => f.endsWith(".js"));
  for (const file of eventFiles) {
    try {
      // evitar duplicar voiceStateUpdate (lo manejamos en este archivo)
      if (file === "voiceStateUpdate.js") {
        console.log("⚠️ Skipping events/voiceStateUpdate.js (voice handled in bot.js)");
        continue;
      }
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
    } catch (err) {
      console.error(`❌ Error cargando evento ${file}:`, err);
    }
  }
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
    activities: [{ name: "☄️ Galacti@s", type: ActivityType.Watching }],
    status: "online"
  });
});

// -----------------------------
// SAFE reply helper (para interacciones)
// -----------------------------
async function safeReply(interaction, content, ephemeral = true) {
  try {
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({ content, ephemeral }).catch(console.error);
    } else {
      await interaction.reply({ content, ephemeral }).catch(console.error);
    }
  } catch (err) {
    console.error("❌ Error enviando respuesta:", err);
  }
}

// -----------------------------
// Interactions (slash) -> delegamos cada comando
// cada comando debe manejar deferReply si requiere tiempo
// -----------------------------
client.on("interactionCreate", async (interaction) => {
  try {
    if (!interaction.isCommand()) return;
    const command = client.commands.get(interaction.commandName);
    if (!command) return;

    // Ejecuta (muchos comandos usan defer dentro del propio comando)
    await command.execute(interaction, safeReply);

    sendLog("Comando Ejecutado", `Usuario <@${interaction.user.id}> ejecutó /${interaction.commandName}`, "Blue");
  } catch (err) {
    console.error("❌ Error en interactionCreate:", err);
    sendLog("Error interactionCreate", `${err}`, "Red");
    if (interaction.isCommand()) safeReply(interaction, "❌ Error interno.", true);
  }
});

// -----------------------------
// Mensajes con prefijo (!) + XP por mensajes
// -----------------------------
client.on("messageCreate", async (message) => {
  // mantiene cualquier manejo de comandos por prefijo
  if (!message.guild || message.author.bot) return;

  // Prefijo simple
  if (message.content.startsWith(config.prefix)) {
    const args = message.content.slice(config.prefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();
    if (commandName === "ping") {
      await message.reply("🏓 Pong!");
      sendLog("Comando Ping", `Usuario <@${message.author.id}> ejecutó !ping`, "Blue");
    }
    // otros comandos por prefijo...
  }

  // --- Sistema XP por mensajes (cooldown 60s por usuario) ---
  const userId = message.author.id;
  const now = Date.now();

  db.get("SELECT * FROM users WHERE user_id = ?", [userId], async (err, row) => {
    if (err) {
      console.error("DB get user error:", err);
      return;
    }

    if (!row) {
      // insert básico
      db.run(
        "INSERT INTO users (user_id, xp, level, last_message, voice_time, last_join_voice) VALUES (?, ?, ?, ?, ?, ?)",
        [userId, 0, 1, 0, 0, null],
        (e) => { if (e) console.error("DB insert initial:", e); }
      );
      // no dar XP este primer mensaje (evitar spam)
      return;
    }

    if (row.last_message && now - row.last_message < 60_000) {
      // cooldown 60s
      return;
    }

    const xpEarned = Math.floor(Math.random() * 6) + 5; // 5-10 XP
    const result = await addXpToUser(userId, xpEarned, message.guild);

    if (result.leveledUp) {
      const embedMsg = `🎉 **${message.author.username} ha subido al nivel ${result.newLevel}!**`;
      message.channel.send({ content: embedMsg }).catch(() => {});
      sendLog("Level Up", `<@${userId}> subió al nivel ${result.newLevel}`, "Green");
    }
  });
});

// -----------------------------
// VOICE: manejamos joins/leaves y damos XP por minutos en voz
// lógica: al entrar guardamos last_join_voice timestamp en DB
// al salir calculamos duración y damos XP (1 XP cada 30s por ejemplo)
// -----------------------------
client.on("voiceStateUpdate", async (oldState, newState) => {
  try {
    // ignorar bots
    const member = newState.member ?? oldState.member;
    if (!member || member.user.bot) return;
    const userId = member.id;

    // Si entra a voz
    if (!oldState.channelId && newState.channelId) {
      // guardar last_join_voice
      const now = Date.now();
      db.run("UPDATE users SET last_join_voice = ? WHERE user_id = ?", [now, userId], (err) => {
        if (err) {
          // si no existe fila, crearla
          db.run("INSERT OR IGNORE INTO users (user_id, xp, level, last_message, voice_time, last_join_voice, total_score) VALUES (?, ?, ?, ?, ?, ?, ?)",
            [userId, 0, 1, 0, 0, now, 0], (e) => { if (e) console.error(e); }
          );
        }
      });
      sendLog("Voice Join", `<@${userId}> entró a voz en ${newState.channelId}`, "Green");
      return;
    }

    // Si sale de voz
    if (oldState.channelId && !newState.channelId) {
      db.get("SELECT * FROM users WHERE user_id = ?", [userId], async (err, row) => {
        if (err) return console.error("DB error voice leave:", err);
        if (!row || !row.last_join_voice) return;
        const joinedAt = row.last_join_voice;
        const durationMs = Date.now() - joinedAt;
        const seconds = Math.floor(durationMs / 1000);
        const minutes = Math.floor(seconds / 60);

        // actualizar voice_time y limpiar last_join_voice
        const newVoiceTotal = (row.voice_time || 0) + seconds;

        // 🔹 Actualizar total_score combinando XP y voice_time
        const newTotalScore = (row.xp || 0) + newVoiceTotal;

        db.run(
          "UPDATE users SET voice_time = ?, last_join_voice = NULL, total_score = ? WHERE user_id = ?",
          [newVoiceTotal, newTotalScore, userId],
          (e) => { if (e) console.error("DB update voice_time error:", e); }
        );

        // Dar XP por tiempo de voz: 1 XP por 30 segundos
        const xpFromVoice = Math.floor(seconds / 30);
        if (xpFromVoice > 0) {
          const guild = oldState.guild;
          const res = await addXpToUser(userId, xpFromVoice, guild);
          if (res.leveledUp) {
            // notificar en el primer canal de texto si posible
            const defaultChannel = guild.systemChannel || guild.channels.cache.find(c => c.type === 0 && c.permissionsFor(guild.members.me).has("SendMessages"));
            if (defaultChannel) defaultChannel.send(`🎉 **${member.user.username} ha subido al nivel ${res.newLevel}!**`).catch(() => {});
            sendLog("Level Up (voz)", `<@${userId}> subió al nivel ${res.newLevel} por tiempo en voz`, "Green");
          }
        }

        sendLog("Voice Leave", `<@${userId}> salió de voz (${seconds}s)`, "Yellow");
      });
    }
  } catch (err) {
    console.error("Voice handler error:", err);
  }
});


// -----------------------------
// Login bot
// -----------------------------
client.login(process.env.TOKEN)
  .then(() => console.log("🔑 Token válido, bot conectado."))
  .catch((err) => {
    console.error("❌ Error al iniciar sesión:", err);
  });

// ======================================================
// SERVIDOR WEB (RENDER) + API /stats + API /health
// ======================================================
const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 10000;

// Página principal
app.get("/", (req, res) => {
  res.json({ status: "ok", message: "Galactus API Online" });
});

// STATS endpoint (para tu web)
app.get("/api/stats", async (req, res) => {
  try {
    const guildId = process.env.GUILD_ID || config.defaultGuildId || null;
    if (!guildId) return res.status(500).json({ error: "GUILD_ID not configured" });

    const guild = client.guilds.cache.get(guildId);
    if (!guild) return res.status(404).json({ error: "Guild not found" });

    // fetch members para tener presencia actualizada
    await guild.members.fetch();

    const onlineMembers = guild.members.cache.filter(
      (m) => !m.user.bot && (m.presence?.status === "online" || m.presence?.status === "idle" || m.presence?.status === "dnd")
    ).size;

    const totalMembers = guild.members.cache.filter((m) => !m.user.bot).size;

    const activeBots = guild.members.cache.filter(
      (m) => m.user.bot && (m.presence?.status === "online" || m.presence?.status === "idle" || m.presence?.status === "dnd")
    ).size;

    return res.json({
      guildName: guild.name,
      onlineMembers,
      totalMembers,
      activeBots,
      timestamp: Date.now()
    });
  } catch (err) {
    console.error("❌ /api/stats error:", err);
    res.status(500).json({ error: "Failed to fetch stats" });
  }
});

// HEALTH
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    botOnline: client.ws.status === 0, // 0 = ready
    latency: client.ws.ping || 0,
    timestamp: Date.now()
  });
});

// Start express
app.listen(PORT, () => {
  console.log(`🌐 API escuchando en puerto ${PORT}`);
  sendLog("API", `API escuchando en puerto ${PORT}`, "Blue");
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

module.exports = { client };
