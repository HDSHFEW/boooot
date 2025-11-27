// ===========================
// EXPRESS SERVER
// ===========================
const express = require('express');
const app = express();
const port = 1445;

app.get('/', (req, res) => res.send('Bot Is Working Well!'));

const config = require('./config.json');

app.listen(port, () => console.log(`listening at http://localhost:${port}`));

// ===========================
// IMPORTS
// ===========================
const { Client, Collection } = require('discord.js-selfbot-v13');
const { joinVoiceChannel } = require('@discordjs/voice');
const fs = require('fs');
const { Manager } = require('erela.js');
const Spotify = require('erela.js-spotify');

const {
  token,
  ownerid,
  nodes,
  SpotifyID,
  SpotifySecret,
  trackedUser
} = config;

// ===========================
// CHECK CONFIG
// ===========================
if (!token || !ownerid) {
  console.log('Please Fill Out Config file');
  process.exit();
}

// ===========================
// CLIENT SETUP
// ===========================
const client = new Client({ checkUpdate: false });
client.commands = new Collection();
client.aliases = new Collection();

// ===========================
// MANAGER SETUP
// ===========================
client.manager = new Manager({
  nodes: nodes,
  plugins: [new Spotify({ clientID: SpotifyID, clientSecret: SpotifySecret })],
  send(id, payload) {
    const guild = client.guilds.cache.get(id);
    if (guild) guild.shard.send(payload);
  },
});

// ===========================
// LOAD COMMANDS
// ===========================
const commandFiles = fs.readdirSync('./Commands').filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
  const command = require(`./Commands/${file}`);
  client.commands.set(command.name, command);
}

// ===========================
// LOAD EVENTS
// ===========================
fs.readdirSync("./events/Client/").forEach(file => {
  const event = require(`./events/Client/${file}`);
  client.on(event.name, (...args) => event.execute(client, ...args));
});

fs.readdirSync("./events/Lavalink/").forEach(file => {
  const event = require(`./events/Lavalink/${file}`);
  let eventName = file.split(".")[0];
  client.manager.on(eventName, event.bind(null, client));
});

// ===========================
// UNHANDLED REJECTION
// ===========================
process.on("unhandledRejection", (reason, promise) => {
  try {
    console.error("Unhandled Rejection at: ", promise, "reason: ", reason.stack || reason);
  } catch {
    console.error(reason);
  }
});

// ===========================
// SECURITY SYSTEM
// ===========================
const securitySystem = require('./security');
securitySystem(client);

// ===========================
// REACTIONS COMMANDS
// ===========================
client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  // -------------------------
  // SET REACT
  // -------------------------
  if (message.content.startsWith('.setreact') && ownerid.includes(message.author.id)) {
    const args = message.content.slice('.setreact'.length).trim().split(' ');
    const user = message.mentions.users.first() || client.users.cache.get(args[0]);
    const emoji = args[1];

    if (!user || !emoji) return message.reply("Please mention a user and provide an emoji.");

    const emojiRegex = /<a?:\w+:\d+>|[\u{1F600}-\u{1F64F}]/gu;
    if (!emojiRegex.test(emoji)) return message.reply("Invalid emoji.");

    if (!config.reactions) config.reactions = {};
    config.reactions[user.id] = emoji;
    fs.writeFileSync('./config.json', JSON.stringify(config, null, 2));

    return message.reply(`Bot will now react to ${user.tag}'s messages with ${emoji}.`);
  }

  // -------------------------
  // REACT TO MESSAGES
  // -------------------------
  if (config.reactions && config.reactions[message.author.id]) {
    const emoji = config.reactions[message.author.id];
    try { await message.react(emoji); } catch { }
  }

  // -------------------------
  // SET REPLY TO OWNER
  // -------------------------
  if (message.content.startsWith('.setreplyme') && ownerid.includes(message.author.id)) {
    const args = message.content.slice('.setreplyme'.length).trim();
    if (!args) return message.reply("Please provide a message to set as the reply.");
    config.replyMessage = args;
    fs.writeFileSync('./config.json', JSON.stringify(config, null, 2));
    return message.reply(`Bot will now reply with: "${args}" when the owner is mentioned.`);
  }

  // REPLY TO DETECTED MESSAGE
  if (config.replyMessage && message.author.id !== client.user.id) {
    if (typeof config.replyMessage === 'object') {
      const detect = config.replyMessage.detect;
      const reply = config.replyMessage.reply;
      if (message.content.toLowerCase().includes(detect)) message.reply(reply);
    } else {
      if (message.mentions.users.has(ownerid[0])) message.reply(config.replyMessage);
    }
  }

  // REMOVE REACT
  if (message.content.startsWith('.removereact') && ownerid.includes(message.author.id)) {
    const args = message.content.slice('.removereact'.length).trim();
    const userID = args;
    if (!config.reactions || !config.reactions[userID]) return message.reply("No reaction found for this user.");
    delete config.reactions[userID];
    fs.writeFileSync('./config.json', JSON.stringify(config, null, 2));
    return message.reply(`Removed reactions for user with ID ${userID}.`);
  }

  // SET REPLY COMMAND
  if (message.content.startsWith('.setreply') && ownerid.includes(message.author.id)) {
    const args = message.content.slice('.setreply'.length).trim().split(' ');
    if (args.length < 2) return message.reply("Provide message to detect and reply.");
    const messageToDetect = args[0].toLowerCase();
    const replyMessage = args.slice(1).join(' ');
    config.replyMessage = { detect: messageToDetect, reply: replyMessage };
    fs.writeFileSync('./config.json', JSON.stringify(config, null, 2));
    return message.reply(`I will reply "${replyMessage}" to messages that match "${messageToDetect}".`);
  }
});

// ===========================
// VOICE STATE TRACKING
// ===========================
client.on('voiceStateUpdate', async (oldState, newState) => {
  if (newState.member?.id === trackedUser && newState.channelId && oldState.channelId !== newState.channelId) {
    try {
      joinVoiceChannel({
        channelId: newState.channelId,
        guildId: newState.guild.id,
        adapterCreator: newState.guild.voiceAdapterCreator,
        selfDeaf: false,
      });
      console.log(`Joined ${newState.channel.name} to follow user ${trackedUser}`);
    } catch { console.error('Failed to join voice channel'); }
  }
});

// ===========================
// LOGIN
// ===========================
client.login("MTExMjgzNTgwMjI4ODg4MTcyNQ.Gbjh3B.zJGjBDxWxIBtNh-D0BMP_IKvEeA74ev6Np4gpY");
