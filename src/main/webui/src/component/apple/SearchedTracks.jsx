import { useQuery } from "react-query";
import { searchForItem } from "../../data/spotifyAPI.js";
import {
    Badge, HelperText, HelperTextItem,
    Label,
    List,
    ListComponent,
    ListItem,
    OrderType,
    Spinner,
    Tooltip
} from "@patternfly/react-core";
import React from "react";

const SearchedTracks = ({ tracks, setSearchResults }) => {
    const { data: searchResults, isLoading, isError } = useQuery(
        ['searchTracks', tracks],
        () => searchTracksData(tracks),
        {
            enabled: !!tracks,
            staleTime: 7_200_000 // 2 hours
        }
    );

    const searchTracksData = async (tracks) => {
        const searchResults = await Promise.all(tracks.map(async (track) => {
            return await searchForItem(
                sessionStorage.getItem("ACCESS_TOKEN"),
                track.relationships?.catalog?.data[0]?.attributes?.isrc,
            );
        }));
        setSearchResults(searchResults.filter(result => result.tracks.items.length > 0));
        return searchResults;
    };

    return (
        <>
            {isLoading ? (
                <div className="d-flex justify-content-center">
                    <Spinner />
                </div>
            ) : (
                <List component={ListComponent.ol} type={OrderType.number}>
                    {searchResults.map((result, index) => (
                        <ListItem key={index}>
                            {result.tracks.items.length > 0 ? (
                                <>
                                    <span className="fw-light">
                                        {result.tracks.items[0].name}{' '}
                                    </span>
                                    <Tooltip content={<div>{result.tracks.items[0]?.album?.name}</div>}>
                                        <Label isCompact textMaxWidth="7ch">
                                            {result.tracks.items[0].album.name}
                                        </Label>
                                    </Tooltip>{' '}
                                    <Tooltip content={<div>{result.tracks.items[0]?.artists[0]?.name}</div>}>
                                        <Label isCompact textMaxWidth="7ch">
                                            {result.tracks.items[0]?.artists[0]?.name}
                                        </Label>
                                    </Tooltip>
                                </>
                            ): (
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
