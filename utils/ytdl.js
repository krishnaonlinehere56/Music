// utils/ytdl.js - YouTube Audio-Only Fetcher (High Quality)

const ytdl = require('ytdl-core');
const ytsr = require('ytsr');

// Get high quality audio stream from YouTube
async function getAudioStream(trackName, artistName) {
    try {
        // Search for track on YouTube (album version priority)
        const searchQuery = `${trackName} ${artistName} official audio`;
        const searchResults = await ytsr(searchQuery, { limit: 5 });

        if (!searchResults || searchResults.items.length === 0) {
            console.error('No YouTube results found');
            return null;
        }

        // Filter only videos (no playlists, channels)
        const videos = searchResults.items.filter(item => item.type === 'video');
        
        if (videos.length === 0) {
            console.error('No valid videos found');
            return null;
        }

        // Prioritize: Official Audio > Topic channels > others
        let videoUrl = videos[0].url;
        
        for (const video of videos) {
            const title = video.title.toLowerCase();
            const author = video.author?.name?.toLowerCase() || '';
            
            // Priority 1: Official Audio or Album version
            if (title.includes('official audio') || title.includes('album')) {
                videoUrl = video.url;
                break;
            }
            
            // Priority 2: Topic channels (official releases)
            if (author.includes('topic')) {
                videoUrl = video.url;
                break;
            }
        }

        // Get audio stream (highest quality audio only, no video)
        const stream = ytdl(videoUrl, {
            filter: 'audioonly',
            quality: 'highestaudio',
            highWaterMark: 1 << 25, // 32MB buffer for smooth playback
        });

        return stream;

    } catch (error) {
        console.error('YouTube fetch error:', error);
        return null;
    }
}

module.exports = {
    getAudioStream
};