// config.js - Configuration File

require('dotenv').config();

module.exports = {
    // Discord Bot Token
    DISCORD_TOKEN: process.env.DISCORD_TOKEN,

    // Spotify API Credentials
    SPOTIFY_CLIENT_ID: process.env.SPOTIFY_CLIENT_ID,
    SPOTIFY_CLIENT_SECRET: process.env.SPOTIFY_CLIENT_SECRET,

    // Bot Settings
    PREFIX: '.',
    
    // Audio Quality Settings
    AUDIO_QUALITY: 'highestaudio',
    BUFFER_SIZE: 1 << 25, // 32MB
    
    // Bot Activity
    ACTIVITY: '.help for commands',
    ACTIVITY_TYPE: 'LISTENING'
};