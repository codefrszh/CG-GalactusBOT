// src/events/voiceStateUpdate.js
const voiceTimes = require("../utils/voiceTimes");

module.exports = {
  name: "voiceStateUpdate",
  async execute(oldState, newState) {
    const userId = newState.id;
    const now = Date.now();

    if (oldState.channelId && !newState.channelId) {
      // salió de voz
      const data = voiceTimes.get(userId);
      if (data && data.joinedAt) {
        const seconds = Math.floor((now - data.joinedAt) / 1000);
        data.total = (data.total || 0) + seconds;
        data.joinedAt = null;
        voiceTimes.set(userId, data);
      }
    }

    if (!oldState.channelId && newState.channelId) {
      // entró a voz
      const data = voiceTimes.get(userId) || { total: 0 };
      data.joinedAt = now;
      voiceTimes.set(userId, data);
    }
  },
};
