// utils/leaderboardManager.js
const { sendLog } = require("./logger");

const voiceTimes = new Map(); // userId => segundos

// Roles de recompensa
const rewardRoles = ["🥇 Top 1 Voz", "🥈 Top 2 Voz", "🥉 Top 3 Voz"];

/**
 * Sumar tiempo de voz a un usuario
 * @param {string} userId 
 * @param {number} seconds 
 */
function addVoiceTime(userId, seconds = 60) {
  const prev = voiceTimes.get(userId) || 0;
  voiceTimes.set(userId, prev + seconds);
}

/**
 * Obtener ranking ordenado
 */
function getRanking() {
  return Array.from(voiceTimes.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([userId, total], index) => ({ userId, total, position: index + 1 }));
}

/**
 * Reset semanal y asignar roles
 * @param {Guild} guild 
 */
async function resetWeeklyLeaderboard(guild) {
  try {
    const ranking = getRanking();

    // Limpiar roles antiguos
    for (const [userId] of voiceTimes) {
      const member = guild.members.cache.get(userId);
      if (!member) continue;
      for (const roleName of rewardRoles) {
        const role = guild.roles.cache.find(r => r.name === roleName);
        if (role && member.roles.cache.has(role.id)) await member.roles.remove(role).catch(()=>{});
      }
    }

    // Crear/Asignar roles top 3
    for (let i = 0; i < 3; i++) {
      const entry = ranking[i];
      if (!entry) continue;
      const member = guild.members.cache.get(entry.userId);
      if (!member) continue;

      let role = guild.roles.cache.find(r => r.name === rewardRoles[i]);
      if (!role) {
        role = await guild.roles.create({ name: rewardRoles[i], color: "Random", reason: "Roles top 3 semanal" });
        sendLog("Leaderboard", `Rol creado: ${rewardRoles[i]}`, "Blue");
      }

      await member.roles.add(role).catch(() => {});
    }

    sendLog(
      "Leaderboard Semanal",
      `Top 3 actualizado:\n${ranking.slice(0,3).map((r,i)=>`#${i+1} <@${r.userId}>: ${Math.round(r.total/60)} min`).join("\n")}`,
      "Green"
    );

    // Reiniciar
    voiceTimes.clear();

  } catch (err) {
    console.error("❌ Error resetWeeklyLeaderboard:", err);
    sendLog("Leaderboard Error", `${err}`, "Red");
  }
}

module.exports = { addVoiceTime, getRanking, resetWeeklyLeaderboard };
