// utils/ytdl.js - YouTube Audio Fetcher (Using distube/ytdl-core)

const ytdl = require('@distube/ytdl-core');

// Search YouTube using simple method
async function searchYouTube(query) {
    try {
        // Use YouTube search URL
        const searchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
        
        // Use ytdl to validate and get video
        // Alternative: construct likely video URL pattern
        const searchQuery = query.replace(/ /g, '+');
        const videoId = await getFirstVideoId(searchQuery);
        
        if (!videoId) return null;
        
        return `https://www.youtube.com/watch?v=${videoId}`;
        
    } catch (error) {
        console.error('YouTube search error:', error);
        return null;
    }
}

// Simple video ID extractor (fallback method)
async function getFirstVideoId(query) {
    try {
        const axios = require('axios');
        const response = await axios.get(
            `https://www.youtube.com/results?search_query=${query}`,
            { headers: { 'User-Agent': 'Mozilla/5.0' } }
        );
        
        const html = response.data;
        const match = html.match(/"videoId":"([a-zA-Z0-9_-]{11})"/);
        
        return match ? match[1] : null;
    } catch (error) {
        console.error('Video ID extraction error:', error);
        return null;
    }
}

// Get high quality audio stream
async function getAudioStream(trackName, artistName) {
    try {
        // Search for video
        const searchQuery = `${trackName} ${artistName} official audio`;
        const videoUrl = await searchYouTube(searchQuery);
        
        if (!videoUrl) {
            console.error('No video found for query');
            return null;
        }

        // Validate URL
        if (!ytdl.validateURL(videoUrl)) {
            console.error('Invalid YouTube URL');
            return null;
        }

        // Get audio stream
        const stream = ytdl(videoUrl, {
            filter: 'audioonly',
            quality: 'highestaudio',
            highWaterMark: 1 << 25,
            dlChunkSize: 0,
        });

        return stream;

    } catch (error) {
        console.error('Audio stream error:', error);
        return null;
    }
}

module.exports = {
    getAudioStream
};
