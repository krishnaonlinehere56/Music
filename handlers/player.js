// handlers/player.js - Music Player Logic

const { 
    createAudioPlayer, 
    createAudioResource, 
    AudioPlayerStatus,
    NoSubscriberBehavior 
} = require('@discordjs/voice');
const ytdl = require('../utils/ytdl');
const spotify = require('./spotify');

// Queue system - Guild-wise
const queues = new Map();

// Play function
async function play(message, query, connection) {
    const guildId = message.guild.id;

    // Initialize queue if not exists
    if (!queues.has(guildId)) {
        queues.set(guildId, {
            songs: [],
            player: createAudioPlayer({
                behaviors: {
                    noSubscriber: NoSubscriberBehavior.Pause,
                },
            }),
            isPlaying: false
        });
    }

    const queue = queues.get(guildId);

    try {
        // Get track info from Spotify/YouTube
        const trackInfo = await spotify.getTrackInfo(query);
        
        if (!trackInfo) {
            return message.channel.send('❌ Song not found!');
        }

        // Add to queue
        queue.songs.push(trackInfo);

        // If not playing, start playing
        if (!queue.isPlaying) {
            playNext(guildId, message, connection);
        } else {
            message.channel.send(`✅ Added to queue: **${trackInfo.name}** by ${trackInfo.artist}`);
        }

    } catch (error) {
        console.error('Play error:', error);
        message.channel.send('❌ Failed to play song!');
    }
}

// Play next song in queue
async function playNext(guildId, message, connection) {
    const queue = queues.get(guildId);
    
    if (!queue || queue.songs.length === 0) {
        queue.isPlaying = false;
        return;
    }

    const song = queue.songs[0];
    queue.isPlaying = true;

    try {
        // Get audio stream from YouTube (audio only, high quality)
        const stream = await ytdl.getAudioStream(song.name, song.artist);
        
        if (!stream) {
            message.channel.send('❌ Failed to fetch audio!');
            queue.songs.shift();
            return playNext(guildId, message, connection);
        }

        // Create audio resource
        const resource = createAudioResource(stream, {
            inlineVolume: true
        });

        // Play audio
        queue.player.play(resource);
        connection.subscribe(queue.player);

        // Simple message (Jockie style)
        message.channel.send(`🎵 Playing: **${song.name}** by ${song.artist}`);

        // When song ends, play next
        queue.player.once(AudioPlayerStatus.Idle, () => {
            queue.songs.shift();
            playNext(guildId, message, connection);
        });

    } catch (error) {
        console.error('Playback error:', error);
        message.channel.send('❌ Playback failed!');
        queue.songs.shift();
        playNext(guildId, message, connection);
    }
}

// Skip current song
function skip(guildId) {
    const queue = queues.get(guildId);
    if (!queue || !queue.isPlaying) return false;
    
    queue.player.stop();
    return true;
}

// Stop playback
function stop(guildId) {
    const queue = queues.get(guildId);
    if (queue) {
        queue.songs = [];
        queue.player.stop();
        queue.isPlaying = false;
        queues.delete(guildId);
    }
}

// Pause playback
function pause(guildId) {
    const queue = queues.get(guildId);
    if (!queue || !queue.isPlaying) return false;
    
    return queue.player.pause();
}

// Resume playback
function resume(guildId) {
    const queue = queues.get(guildId);
    if (!queue) return false;
    
    return queue.player.unpause();
}

module.exports = {
    play,
    skip,
    stop,
    pause,
    resume
};