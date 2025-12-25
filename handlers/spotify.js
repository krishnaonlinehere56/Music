// handlers/spotify.js - Spotify Track Info Fetcher

const axios = require('axios');
const config = require('../config');

let accessToken = null;
let tokenExpiry = 0;

// Get Spotify Access Token
async function getAccessToken() {
    // Return cached token if still valid
    if (accessToken && Date.now() < tokenExpiry) {
        return accessToken;
    }

    try {
        const response = await axios.post(
            'https://accounts.spotify.com/api/token',
            'grant_type=client_credentials',
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Authorization': 'Basic ' + Buffer.from(
                        config.SPOTIFY_CLIENT_ID + ':' + config.SPOTIFY_CLIENT_SECRET
                    ).toString('base64')
                }
            }
        );

        accessToken = response.data.access_token;
        tokenExpiry = Date.now() + (response.data.expires_in * 1000);
        
        return accessToken;
    } catch (error) {
        console.error('Spotify token error:', error);
        return null;
    }
}

// Get Track Info from Spotify or Query
async function getTrackInfo(query) {
    try {
        // Check if Spotify URL
        if (query.includes('spotify.com/track/')) {
            return await getSpotifyTrack(query);
        }

        // Search on Spotify
        return await searchSpotify(query);
        
    } catch (error) {
        console.error('Track info error:', error);
        // Fallback: return query as track name
        return {
            name: query,
            artist: 'Unknown',
            album: null
        };
    }
}

// Get Spotify track by URL
async function getSpotifyTrack(url) {
    const token = await getAccessToken();
    if (!token) return null;

    const trackId = url.split('track/')[1].split('?')[0];

    try {
        const response = await axios.get(
            `https://api.spotify.com/v1/tracks/${trackId}`,
            {
                headers: { 'Authorization': `Bearer ${token}` }
            }
        );

        return {
            name: response.data.name,
            artist: response.data.artists[0].name,
            album: response.data.album.name
        };
    } catch (error) {
        console.error('Spotify track fetch error:', error);
        return null;
    }
}

// Search track on Spotify
async function searchSpotify(query) {
    const token = await getAccessToken();
    if (!token) return null;

    try {
        const response = await axios.get(
            'https://api.spotify.com/v1/search',
            {
                params: {
                    q: query,
                    type: 'track',
                    limit: 1
                },
                headers: { 'Authorization': `Bearer ${token}` }
            }
        );

        if (response.data.tracks.items.length === 0) {
            return null;
        }

        const track = response.data.tracks.items[0];
        
        return {
            name: track.name,
            artist: track.artists[0].name,
            album: track.album.name
        };
    } catch (error) {
        console.error('Spotify search error:', error);
        return null;
    }
}

module.exports = {
    getTrackInfo
};