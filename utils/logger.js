// src/utils/logger.js
const { WebhookClient, EmbedBuilder } = require("discord.js");

let webhook;

if (process.env.WEBHOOK_URL) {
  const parts = process.env.WEBHOOK_URL.split("/").slice(-2);
  if (parts.length === 2) {
    const [id, token] = parts;
    webhook = new WebhookClient({ id, token });
    console.log("✅ Logger: Webhook configurado correctamente");
  } else {
    console.log("❌ Logger: WEBHOOK_URL no tiene formato válido");
  }
} else {
  console.log("❌ Logger: WEBHOOK_URL no definido en .env");
}

const sendLog = async (title, description, color = "Blue") => {
  if (!webhook)
    return console.log("❌ Logger: Webhook no definido, mensaje:", title, description);

  const embed = new EmbedBuilder()
    .setTitle(title)
    .setDescription(description)
    .setColor(color)
    .setTimestamp();

  try {
    await webhook.send({ embeds: [embed] });
    console.log(`📤 Logger: ${title}`);
  } catch (err) {
    console.error("❌ Logger: Error enviando log al webhook:", err);
  }
};

// Export explícito para que otros módulos puedan usarlo
module.exports = { sendLog };
