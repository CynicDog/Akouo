import {createContext, useContext, useEffect, useState} from "react";
import {getSpotifyAccessTokenFromCookie, removeSpotifyAccessTokenCookie} from "./module/cookie.js";

// Theme Provider
const ThemeContext = createContext();

export const ThemeProvider = ({children}) => {
    const [theme, setTheme] = useState('light');

    const toggleTheme = () => {
        setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
    }

    return (
        <ThemeContext.Provider value={{theme, toggleTheme}}>
            {children}
        </ThemeContext.Provider>
    );
}
export const useTheme = () => useContext(ThemeContext);


// Auth Provider
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [isAppleAuthenticated, setIsAppleAuthenticated] = useState(false);
    const [spotifyAccessToken, setSpotifyAccessToken] = useState(null);
    const [musicInstance, setMusicInstance] = useState(null);

    useEffect(() => {

        sessionStorage.setItem("DT", '{DEVELOPER_TOKEN}');

        const token = getSpotifyAccessTokenFromCookie();
        setSpotifyAccessToken(token);

        configureMusicKit();
    }, []);

    const configureMusicKit = async () => {
        try {
            const MusicKit = window.MusicKit;
            await MusicKit.configure({
                developerToken: sessionStorage.getItem("DT"),
                app: {
                    name: 'Akouo',
                    build: '2024.4.22',
                },
            });
            const music = MusicKit.getInstance();
            setMusicInstance(music);

            var myStation =  await music.api.music('/v1/catalog/kr/stations', {
                'filter[identity]': 'personal',
            });

            if (!music.isQueueEmpty) {
                await music.setQueue({ station: myStation.data.data[0].attributes.playParams.id, startPlaying: false });
            }

            if (sessionStorage.getItem("MUT") === null || !music.isAuthorized) {
                setIsAppleAuthenticated(false);
            } else {
                setIsAppleAuthenticated(true);
            }
        } catch (error) {
            console.error('Error configuring MusicKit:', error);
        }
    };

    const handleAppleSignIn = async () => {
        if (musicInstance) {
            try {
                const response = await musicInstance.authorize();
                sessionStorage.setItem("MUT", response);

                setIsAppleAuthenticated(true);
            } catch (error) {
                console.error('Error authorizing with Apple Music:', error);
            }
        }
    };

    const handleAppleSignOut = async () => {
        if (musicInstance) {
            try {
                await musicInstance.unauthorize();
                setIsAppleAuthenticated(false);
            } catch (error) {
                console.error('Error signing out from Apple Music:', error);
            }
        }
        sessionStorage.removeItem('MUT');
        // window.location.reload();
    };

    const handleSpotifySignOut = () => {
        removeSpotifyAccessTokenCookie();
        setSpotifyAccessToken(null);
        // window.location.reload();
    };

    const value = {
        isAppleAuthenticated,
        spotifyAccessToken,
        musicInstance,
        handleAppleSignIn,
        handleAppleSignOut,
        handleSpotifySignOut
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
export const useAuth = () => useContext(AuthContext);