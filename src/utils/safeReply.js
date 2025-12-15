async function safeReply(interaction, options) {
  try {
    if (interaction.deferred || interaction.replied) {
      return await interaction.editReply(options);
    } else {
      return await interaction.reply(options);
    }
  } catch (err) {
    console.error("❌ safeReply error:", err.message);
  }
}
module.exports = safeReply;
          "Error Comando",
          `Ocurrió un error al ejecutar /${interaction.commandName}: ${err.message}`,
          "Red"