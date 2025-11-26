module.exports = {
    name: 'dc',
    description: 'Disconnect!',
    player: false,
    inVoiceChannel: true,
    sameVoiceChannel: true,
    owner: true,
    async execute(message) {
        // Get the player for the guild
        const player = message.client.manager.get(message.guild.id);
        
        // Check if the player exists and is valid
        if (player) {
            // If the player exists, destroy it
            player.destroy();
        } else {
            // If no player is found, send a message
            message.channel.send('No player is currently connected!');
        }
    },
};