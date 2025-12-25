// bot.js - Main Bot Entry Point (FINAL VERSION with HTTP server)

require('dotenv').config();
const { Client, GatewayIntentBits, ActivityType } = require('discord.js');
const express = require('express');
const musicCommands = require('./commands/music');

// Express server for Render (to keep it alive)
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
    res.send('🎵 Music Bot is running!');
});

app.listen(PORT, () => {
    console.log(`✅ HTTP Server running on port ${PORT}`);
});

// Discord Client Setup
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildVoiceStates
    ]
});

// Bot Ready Event
client.once('clientReady', () => {
    console.log(`✅ Bot online: ${client.user.tag}`);
    
    client.user.setPresence({
        activities: [{ 
            name: '.help for commands', 
            type: ActivityType.Listening 
        }],
        status: 'online'
    });
});

// Message Handler
client.on('messageCreate', async (message) => {
    if (message.author.bot) return;

    const prefix = '.';
    if (!message.content.startsWith(prefix)) return;

    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();

    try {
        await musicCommands.execute(command, message, args);
    } catch (error) {
        console.error(`Error executing command ${command}:`, error);
        message.reply('❌ Something went wrong!');
    }
});

// Error handling
client.on('error', error => {
    console.error('Discord client error:', error);
});

process.on('unhandledRejection', error => {
    console.error('Unhandled promise rejection:', error);
});

// Login Bot
client.login(process.env.DISCORD_TOKEN);
