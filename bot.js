// bot.js - Main Bot Entry Point (FINAL VERSION)

require('dotenv').config();
const { Client, GatewayIntentBits, ActivityType } = require('discord.js');
const musicCommands = require('./commands/music');

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
    
    // Set bot status (LISTENING activity)
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
    // Ignore bots
    if (message.author.bot) return;

    // Check if message starts with prefix
    const prefix = '.';
    if (!message.content.startsWith(prefix)) return;

    // Parse command and args
    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();

    // Execute music commands
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
