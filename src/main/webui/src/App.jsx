import './App.css';
import React, {useEffect, useState} from 'react';
import {
    Brand, EmptyState, EmptyStateBody, EmptyStateHeader, EmptyStateIcon, EmptyStateVariant,
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
import {fetchGreeting} from './data/appleAPI.js';
import {useAuth, useTheme} from "./Context.jsx";
import BackToTopButton from "./component/BackToTopButton.jsx";
import AuthArea from "./component/AuthArea.jsx";
import {CubesIcon} from "@patternfly/react-icons";
import AppleIcon from "../public/apple.jsx";
import SpotifyIcon from "../public/spotify.jsx";
import AppleComponentsArea from "./component/apple/AppleComponentsArea.jsx";
import SpotifyComponentsArea from "./component/spotify/SpotifyComponentsArea.jsx";
import AppleMusicPlayer from "./component/apple/AppleMusicPlayer.jsx";

function App() {

    const {theme} = useTheme();
    const {isAppleAuthenticated, isSpotifyAuthenticated} = useAuth();

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
            <AuthArea/>

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

            {/* Apple Components Area */}
            <div id="apple-music" className="border rounded-4 p-3 my-3">
                <h3 className="fw-lighter">Apple Music</h3>
                {isAppleAuthenticated ? (
                    <AppleComponentsArea />
                ) : (
                    <EmptyState variant={EmptyStateVariant.sm}>
                        <EmptyStateHeader
                            titleText="Empty state"
                            headingLevel="h4"
                            icon={<EmptyStateIcon icon={CubesIcon}/>} />
                        <EmptyStateBody>
                            sign in to Apple Music first ( <AppleIcon/> )
                        </EmptyStateBody>
                    </EmptyState>
                )}
            </div>

            {/* Spotify Components Area */}
            <div id="spotify" className="border rounded-4 p-3 my-3">
                <h3 className="fw-lighter">Spotify</h3>
                {isSpotifyAuthenticated ? (
                    <SpotifyComponentsArea />
                ) : (
                    <EmptyState variant={EmptyStateVariant.lg}>
                        <EmptyStateHeader
                            titleText="Empty state"
                            headingLevel="h4"
                            icon={<EmptyStateIcon icon={CubesIcon}/>} />
                        <EmptyStateBody>
                            sign in to Spotify first ( <SpotifyIcon/> )
                        </EmptyStateBody>
                    </EmptyState>
                )}
            </div>

            {/*<AppleMusicPlayer />*/}
            <BackToTopButton />
        </>
    );
}

export default App;
