import {useQuery} from "react-query";
import {searchForItem} from "../data/spotifyAPI.js";
import {fetchMultipleCatalogSongsByISRC} from "../data/appleAPI.js";
import {
    HelperText,
    HelperTextItem,
    Label,
    List,
    ListItem,
    Spinner,
    Tooltip
} from "@patternfly/react-core";
import React from "react";

const SearchedTracks = ({targetService, tracks, setSearchResults}) => {
    const {data: searchResults, isLoading, isError} = useQuery(
        ['searchTracks', tracks],
        () => searchTracksData(tracks),
        {
            enabled: !!tracks,
            staleTime: 7_200_000, // 2 hours
            retry: 2,
            retryDelay: 3000, // 3 seconds
        }
    );

    const searchTracksData = async (tracks) => {
        try {
            let storefrontId;

            if (targetService !== 'spotify') {
                storefrontId = await fetch('https://api.music.apple.com/v1/me/storefront', {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${import.meta.env.VITE_APPLE_DEVELOPER_TOKEN}`,
                        'Music-User-Token': sessionStorage.getItem("MUT")
                    }
                })
                    .then(response => {
                        if (!response.ok) {
                            throw new Error(`Error: ${response.status} ${response.statusText}`);
                        }
                        return response.json();
                    })
                    .then(data => data.data[0].id)
                    .catch(error => {
                        console.error('Failed to fetch storefront:', error);
                        throw error;
                    });
            }

            const searchResults = await Promise.all(
                tracks.map(async (track) => {
                    return targetService === "spotify"
                        ? await searchForItem(track.relationships?.catalog?.data[0]?.attributes?.isrc)
                        : await fetchMultipleCatalogSongsByISRC(track.track.external_ids.isrc, storefrontId);
                })
            );
            setSearchResults(
                searchResults.filter((result) =>
                    targetService === "spotify"
                        ? result.tracks.items.length > 0
                        : result.data.length > 0
                )
            );
            return searchResults;
        } catch (error) {
            throw new Error(
                "An error occurred while fetching search results. Possibly too many requests."
            );
        }
    };

    return (
        <>
            {isLoading ? (
                <div className="d-flex justify-content-center">
                    <Spinner/>
                </div>
            ) : isError ? (
                <HelperText>
                    <HelperTextItem variant="error" hasIcon>
                        An error occurred while fetching search results. Possibly too many requests.
                    </HelperTextItem>
                </HelperText>
            ) : (
                <List component="ol" type="number">
                    {searchResults.map((result, index) => (
                        <ListItem key={index}>
                            {targetService === "spotify" ? (
                                result.tracks.items.length > 0 ? (
                                    <>
                                        <span className="fw-light">
                                            {result.tracks.items[0].name}{" "}
                                        </span>
                                        <Tooltip content={<div>{result.tracks.items[0]?.album?.name}</div>}>
                                            <Label
                                                isCompact
                                                textMaxWidth="7ch">
                                                {result.tracks.items[0].album.name}
                                            </Label>
                                        </Tooltip>{" "}
                                        <Tooltip content={<div>{result.tracks.items[0]?.artists[0]?.name}</div>}>
                                            <Label
                                                isCompact
                                                textMaxWidth="7ch">
                                                {result.tracks.items[0]
                                                    ?.artists[0]?.name}
                                            </Label>
                                        </Tooltip>
                                    </>
                                ) : (
                                    <HelperText>
                                        <HelperTextItem variant="error" hasIcon>
                                            not found
                                        </HelperTextItem>
                                    </HelperText>
                                )
                            ) : result.data.length > 0 ? (
                                <>
                                    <span className="fw-light">
                                        {result.data[0].attributes.name}{" "}
                                    </span>
                                    <Tooltip content={<div>{result.data[0].attributes.albumName}</div>}>
                                        <Label isCompact textMaxWidth="7ch">
                                            {result.data[0].attributes.albumName}
                                        </Label>
                                    </Tooltip>{" "}
                                    <Tooltip content={<div>{result.data[0].attributes.artistName}</div>}>
                                        <Label isCompact textMaxWidth="7ch">
                                            {result.data[0].attributes.artistName}
                                        </Label>
                                    </Tooltip>
                                </>
                            ) : (
                                <HelperText>
                                    <HelperTextItem variant="error" hasIcon>
                                        not found
                                    </HelperTextItem>
                                </HelperText>
                            )}
                        </ListItem>
                    ))}
                </List>
            )}
        </>
    );
};

export default SearchedTracks;
