// commands/music.js - All Music Commands

const { joinVoiceChannel, getVoiceConnection } = require('@discordjs/voice');
const player = require('../handlers/player');
const spotify = require('../handlers/spotify');

// Command Handler
async function execute(command, message, args) {
    
    // Help Command
    if (command === 'help') {
        return message.reply(
            '**Music Bot Commands:**\n' +
            '`.play <song name/url>` - Play song\n' +
            '`.skip` - Skip current song\n' +
            '`.stop` - Stop and disconnect\n' +
            '`.pause` - Pause playback\n' +
            '`.resume` - Resume playback\n' +
            '`.ping` - Check bot latency'
        );
    }

    // Ping Command
    if (command === 'ping') {
        const ping = Date.now() - message.createdTimestamp;
        return message.reply(`🏓 Pong! Latency: ${ping}ms`);
    }

    // Voice channel check for music commands
    const voiceChannel = message.member.voice.channel;
    if (!voiceChannel && ['play', 'skip', 'stop', 'pause', 'resume'].includes(command)) {
        return message.reply('❌ You need to be in a voice channel!');
    }

    // Play Command
    if (command === 'play') {
        if (!args.length) {
            return message.reply('❌ Provide a song name or URL!');
        }

        const query = args.join(' ');
        
        // Join voice channel if not connected
        let connection = getVoiceConnection(message.guild.id);
        if (!connection) {
            connection = joinVoiceChannel({
                channelId: voiceChannel.id,
                guildId: message.guild.id,
                adapterCreator: message.guild.voiceAdapterCreator,
            });
        }

        // Search and play
        await message.reply('🔍 Searching...');
        await player.play(message, query, connection);
        return;
    }

    // Skip Command
    if (command === 'skip') {
        const skipped = player.skip(message.guild.id);
        if (skipped) {
            return message.reply('⏭️ Skipped!');
        } else {
            return message.reply('❌ Nothing to skip!');
        }
    }

    // Stop Command
    if (command === 'stop') {
        player.stop(message.guild.id);
        const connection = getVoiceConnection(message.guild.id);
        if (connection) connection.destroy();
        return message.reply('⏹️ Stopped and disconnected!');
    }

    // Pause Command
    if (command === 'pause') {
        const paused = player.pause(message.guild.id);
        if (paused) {
            return message.reply('⏸️ Paused!');
        } else {
            return message.reply('❌ Nothing is playing!');
        }
    }

    // Resume Command
    if (command === 'resume') {
        const resumed = player.resume(message.guild.id);
        if (resumed) {
            return message.reply('▶️ Resumed!');
        } else {
            return message.reply('❌ Nothing to resume!');
        }
    }
}

module.exports = { execute };