// security.js
module.exports = (client) => {
  const SPAM_LIMIT = 8;
  const SPAM_TIME = 7000; // 7 sec
  const TIMEOUT_DURATION = 10 * 60 * 1000; // 10 min

  const messageLog = new Map();

  client.on('messageCreate', async (message) => {
    if (!message.guild || message.author.bot) return;

    const member = message.member;
    const now = Date.now();

    // Anti-Link + Discord Invites
    const linkRegex = /(https?:\/\/[^\s]+|discord\.gg\/[^\s]+)/gi;
    if (linkRegex.test(message.content)) {
      await message.delete().catch(() => {});
      await member.timeout(TIMEOUT_DURATION, 'Sending links is not allowed').catch(() => {});
      return message.channel.send(`${member} ⚠️ الروابط و الدعوات ممنوعة! Timeout 10 دقائق.`);
    }

    // Anti-Attachment
    if (message.attachments.size > 0) {
      await message.delete().catch(() => {});
      await member.timeout(TIMEOUT_DURATION, 'Attachments not allowed').catch(() => {});
      return message.channel.send(`${member} ⚠️ الملفات و الصور ممنوعة! Timeout 10 دقائق.`);
    }

    // Anti-Spam
    if (!messageLog.has(member.id)) {
      messageLog.set(member.id, { timestamps: [], warned: false });
    }

    const userData = messageLog.get(member.id);
    userData.timestamps.push(now);
    const recent = userData.timestamps.filter(t => now - t < SPAM_TIME);
    userData.timestamps = recent;

    // Warning
    if (!userData.warned && recent.length >= SPAM_LIMIT) {
      userData.warned = true;
      return message.reply(`⚠️ تحذير! إذا استمر السبام غادي تاخد Timeout 10 دقائق.`);
    }

    // Timeout after warning
    if (userData.warned && recent.length > SPAM_LIMIT) {
      await member.timeout(TIMEOUT_DURATION, 'Spamming messages').catch(() => {});
      const fetched = await message.channel.messages.fetch({ limit: 50 });
      const userMessages = fetched.filter(m => m.author.id === member.id);
      await message.channel.bulkDelete(userMessages, true).catch(() => {});
      messageLog.delete(member.id); // reset user log
      return message.channel.send(`${member} 🚫 سبام مفرط! Timeout 10 دقائق وتم مسح الرسائل.`);
    }
  });
};
