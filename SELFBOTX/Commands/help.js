module.exports = {
  name: 'help',
  description: 'Shows a list of available commands.',
  aliases: ['h'],
  owner: true,
  async execute(message) {
    const commands = [
      {
        name: 'join',
        description: 'Join the voice channel!',
        usage: 'cjoin',
      },
      {
        name: 'play',
        description: 'Play music from a search or URL!',
        usage: 'cplay <song>',
      },
      {
        name: 'pause',
        description: 'Pause the currently playing music!',
        usage: 'cpause',
      },
      {
        name: 'resume',
        description: 'Resume the paused music!',
        usage: 'cresume',
      },
      {
        name: 'skip',
        description: 'Skip the current track!',
        usage: 'cskip',
      },
      {
        name: 'volume',
        description: 'Adjust the music volume!',
        usage: 'cvolume <0-100>',
      },
      {
        name: 'loop',
        description: 'Loop the current queue!',
        usage: 'cloop',
      },
      {
        name: 'ping',
        description: 'Check the bot\'s latency!',
        usage: 'cping',
      },
      {
          name: '.setreply',
          description: 'reply for mention!',
          usage: '.setreply <id> <text>',
      },
      {
          name: '.setreact',
          description: 'add react for user!',
          usage: '.setreact <id> <emoji>',
        },
    ];

    // generate the help command
    const helpMessage = commands.map(command => {
      return `**${command.name}**: ${command.description}\nUsage: \`${command.usage}\`\n`;
    }).join('\n');

    // reply anahom siftha sans erorr
    const replyMessage = await message.reply(':white_check_mark: | **I\'ve sent the list of commands to your DM.**');
  
    // 5s ou ytms7 l msg
    setTimeout(() => {
      replyMessage.delete();
    }, 5000);
  
    // code bach tsift l help f dm dialk abro
    try {
      const dmChannel = await message.author.createDM();
      dmChannel.send(helpMessage);
    } catch (err) {
      console.error('Error sending DM:', err);
      return message.reply(':x: | **I couldn\'t send you a DM. Please make sure your DMs are open.**');
    }
  },
};
