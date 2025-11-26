module.exports = {
  name: 'fullcheck',
  description: 'Checks a user\'s roles and permissions across all mutual servers and sends the info in a DM.',
  aliases: ['fc'],
  owner: true,
  async execute(message, args) {
    // Get the member by user ID or mention
    const memberId = args[0] ? args[0].replace(/[<@!>]/g, '') : message.author.id; // Handle mention or ID
    const member = message.guild.members.cache.get(memberId) || await message.guild.members.fetch(memberId).catch(() => null);

    if (!member) {
      return message.reply('❌ | **User not found. Please provide a valid user ID or mention.**');
    }

    // Create an array to store all mutual server info
    const mutualServersInfo = [];

    // Iterate through all guilds the bot shares with the user
    const mutualGuilds = member.client.guilds.cache.filter(guild => guild.members.cache.has(member.id));

    // For each mutual guild, gather information about the user
    mutualGuilds.forEach(guild => {
      const memberInGuild = guild.members.cache.get(member.id);
      const roles = memberInGuild ? memberInGuild.roles.cache.map(role => role.name).join(', ') : 'No roles';
      const isAdmin = memberInGuild.permissions.has('ADMINISTRATOR') ? 'Yes' : 'No';
      const joinedAt = memberInGuild.joinedAt ? memberInGuild.joinedAt.toDateString() : 'Unknown';
      const createdAt = member.user.createdAt.toDateString();

      // Push the server's info to the array
      mutualServersInfo.push(`
        **Server Name**: ${guild.name} (ID: ${guild.id})
        - **Roles**: ${roles}
        - **Is Administrator**: ${isAdmin}
        - **Joined Server**: ${joinedAt}
        - **Account Created**: ${createdAt}
      `);
    });
    // If no mutual servers, send a message
    if (mutualServersInfo.length === 0) {
      return message.reply('❌ | **The user is not in any mutual servers with the bot.**');
    }

    // Join all server info into one message
    const fullCheckMessage = `**Full Check for ${member.user.tag} (ID: ${member.id})**\n\n${mutualServersInfo.join('\n\n')}`;

    // Inform the user that the information has been sent
    const replyMessage = await message.reply('✅ | **The full check details  have been sent to your DM.**');

    // Delete the confirmation message after 5 seconds
    setTimeout(() => {
      replyMessage.delete();
    }, 5000);

    // Split the full check message if it exceeds 2000 characters (Discord message limit)
    const chunkSize = 2000;
    const messages = [];
    for (let i = 0; i < fullCheckMessage.length; i += chunkSize) {
      messages.push(fullCheckMessage.slice(i, i + chunkSize));
    }

    // Send the information via DM in chunks
    try {
      const dmChannel = await message.author.createDM();
      for (const chunk of messages) {
        await dmChannel.send(chunk);
      }
    } catch (err) {
      console.error('Error sending DM:', err);
      return message.reply('❌ | **I couldn\'t send you a DM. Please make sure your DMs are open.**');
    }
  },
};