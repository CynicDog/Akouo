import SpotifyIcon from '../../public/spotify.jsx';
import AppleIcon from "../../public/apple.jsx";
import {useAuth} from "../Context.jsx";
import {Tooltip} from "@patternfly/react-core";

const AuthArea = () => {
    const { isAppleAuthenticated, spotifyAccessToken, handleAppleSignIn, handleAppleSignOut, handleSpotifySignOut } = useAuth();

    const appleSignOut = () => {
        handleAppleSignOut();
    }

    const appleSignIn = () => {
        handleAppleSignIn();
    }

    const spotifySignOut = () => {
        handleSpotifySignOut();
    }

    return (
        <div className="d-flex justify-content-end p-3">
            {isAppleAuthenticated ? (
                <div onClick={appleSignOut} className="btn">
                    <Tooltip content={<div>sign out</div>}>
                        <AppleIcon/>
                    </Tooltip>
                </div>
            ) : (
                <a onClick={appleSignIn} className="btn text-primary link-underline link-underline-opacity-0">
                    <Tooltip content={<div>sign in</div>}>
                        <AppleIcon />
                    </Tooltip>
                </a>
            )}
            {spotifyAccessToken ? (
                <div onClick={spotifySignOut} className="btn">
                    <Tooltip content={<div>sign out</div>}>
                        <SpotifyIcon/>
                    </Tooltip>
                </div>
            ) : (
                <a href="/login" className="btn text-primary link-underline link-underline-opacity-0">
                    <Tooltip content={<div>sign in</div>}>
                        <SpotifyIcon/>
                    </Tooltip>
                </a>
            )}
        </div>
    );
};

export default AuthArea;
