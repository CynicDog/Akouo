export const getSpotifyAccessTokenFromCookie = () => {
    const cookie = document.cookie.split('; ').find(row => row.startsWith('access_token='));
    if (cookie) {
        return cookie.split('=')[1];
    }
    return null;
};

export const removeSpotifyAccessTokenCookie = () => {
    document.cookie = 'access_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
};