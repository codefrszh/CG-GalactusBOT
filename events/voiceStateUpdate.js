module.exports = {
  name: "voiceStateUpdate",
  async execute(oldState, newState, client) {
    const { sendLog } = require("../utils/logger");

    // Detectar entrada o salida de canal de voz
    if (!oldState.channelId && newState.channelId) {
      sendLog("Voice Join", `<@${newState.id}> se unió a <#${newState.channelId}>`, "Green");
    } else if (oldState.channelId && !newState.channelId) {
      sendLog("Voice Leave", `<@${newState.id}> salió de <#${oldState.channelId}>`, "Yellow");
    }

    // Aquí puedes agregar conteo de tiempo para leaderboard
  }
};
