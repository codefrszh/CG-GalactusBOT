// utils/safeReply.js
module.exports = async function safeReply(interaction, content, ephemeral = false) {
    try {
        // Si ya se deferió, usamos editReply
        if (interaction.deferred) {
            return await interaction.editReply(typeof content === "string" ? { content } : content);
        }
        // Si ya se respondió, ignoramos
        if (interaction.replied) return;

        // Respuesta inicial
        return await interaction.reply(typeof content === "string" ? { content, flags: ephemeral ? 64 : undefined } : content);
    } catch (err) {
        console.error("❌ safeReply error:", err);
    }
};
