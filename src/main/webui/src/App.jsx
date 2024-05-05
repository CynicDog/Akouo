import './App.css';
import React, {useEffect, useState} from 'react';
import {
    Brand,
    Flex,
    FlexItem,
    Text,
    TextContent,
    TextVariants
} from '@patternfly/react-core';
import headphones from '../public/headphones.png';
import theaterJS from 'theaterjs';
import {useQuery} from "react-query";
import DarkModeSwitch from "./component/DarkmodeSwitch.jsx";
import {
    fetchGreeting, fetchLibraryPlaylists
} from './data/appleAPI.js';
import {useAuth, useTheme} from "./Context.jsx";
import BackToTopButton from "./component/BackToTopButton.jsx";
import AuthArea from "./component/AuthArea.jsx";
import AppleMusicArea from "./component/apple/PlaylistsArea.jsx";

function App() {

    const developerToken = sessionStorage.getItem('DT');
    const musicUserToken = sessionStorage.getItem('MUT');

    const {theme} = useTheme();
    const {isAppleAuthenticated, spotifyAccessToken} = useAuth();

    const {data: message, isLoading: isMessageLoading, error: messageError} = useQuery(
        'greeting',
        fetchGreeting,
        {enabled: true}
    );

    useEffect(() => {
        const theater = theaterJS();

        theater
            .addActor('Brand', {speed: 1, accuracy: 0.8})
            .addScene(`Brand: ${message}`, 1000)
            .play();
    }, [message, isMessageLoading]);

    return (
        <>
            <AuthArea />

            <Flex>
                <FlexItem>
                    <Brand src={headphones} alt="Patternfly Logo" widths={{default: '40px', md: '70px', xl: '100px'}}/>
                    <div className="actors-container my-3">
                        <div className="actor">
                            <TextContent>
                                <Text component={TextVariants.blockquote}>
                                    <div id="Brand" className="actor-content"></div>
                                </Text>
                            </TextContent>
                        </div>
                    </div>
                </FlexItem>
                <FlexItem align={{default: 'alignRight'}}>
                    <DarkModeSwitch/>
                </FlexItem>
            </Flex>

            {isAppleAuthenticated ? (
                <AppleMusicArea developerToken={developerToken} musicUserToken={musicUserToken} />
            ) : (
                <div>apple music not authenticated</div>
            )}

            {spotifyAccessToken ? (
                <div>spotify authenticated</div>
            ): (
                <div>spotify not authenticated</div>
            )}

            <BackToTopButton />
        </>
    );
}

export default App;
