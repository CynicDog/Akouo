// Get a list of the playlists owned or followed by the current Spotify user.
export const getCurrentUserPlaylists = async (accessToken) => {
    const url = `https://api.spotify.com/v1/me/playlists`;
    return fetchData(url, accessToken);
};

const fetchData = async (url, accessToken) => {
    if (!accessToken) {
        throw new Error('Access Token not found');
    }

    const headers = {
        'Authorization': `Bearer ${accessToken}`,
    };

    const response = await fetch(url, {
        headers
    });

    if (!response.ok) {
        throw new Error(`Failed to fetch data: ${response.statusText}`);
    }

    return response.json();
};