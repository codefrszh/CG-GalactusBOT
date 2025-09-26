// utils/safeReply.js
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

module.exports = { safeReply };
