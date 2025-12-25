// utils/embedBuilder.js - Simple Message Builder (No Heavy Embeds)

// Simple playing message (Jockie style)
function createPlayingMessage(trackName, artistName) {
    return `🎵 Playing: **${trackName}** by ${artistName}`;
}

// Queue added message
function createQueueMessage(trackName, artistName, position) {
    return `✅ Added to queue: **${trackName}** by ${artistName} (Position: ${position})`;
}

// Error message
function createErrorMessage(errorText) {
    return `❌ ${errorText}`;
}

// Success message
function createSuccessMessage(text) {
    return `✅ ${text}`;
}

module.exports = {
    createPlayingMessage,
    createQueueMessage,
    createErrorMessage,
    createSuccessMessage
};