// utils/ytdl.js - YouTube Audio Fetcher (Updated with play-dl)

const play = require('play-dl');

// Initialize play-dl
async function initialize() {
    try {
        // Agar cookies chahiye to uncomment karo (optional)
        // await play.setToken({ youtube: { cookie: 'your_cookies_here' } });
    } catch (error) {
        console.log('play-dl initialized without cookies');
    }
}

initialize();

// Get high quality audio stream from YouTube
async function getAudioStream(trackName, artistName) {
    try {
        // Search for track on YouTube
        const searchQuery = `${trackName} ${artistName} official audio`;
        const searchResults = await play.search(searchQuery, { limit: 5, source: { youtube: 'video' } });

        if (!searchResults || searchResults.length === 0) {
            console.error('No YouTube results found');
            return null;
        }

        // Prioritize: Official Audio > Topic channels
        let video = searchResults[0];
        
        for (const result of searchResults) {
            const title = result.title.toLowerCase();
            const channelName = result.channel?.name?.toLowerCase() || '';
            
            // Priority 1: Official Audio or Album version
            if (title.includes('official audio') || title.includes('album') || title.includes('audio')) {
                video = result;
                break;
            }
            
            // Priority 2: Topic channels
            if (channelName.includes('topic')) {
                video = result;
                break;
            }
        }

        // Get audio stream (highest quality)
        const stream = await play.stream(video.url, {
            quality: 2, // Highest quality audio
        });

        return stream.stream;

    } catch (error) {
        console.error('YouTube fetch error:', error);
        return null;
    }
}

module.exports = {
    getAudioStream
};

