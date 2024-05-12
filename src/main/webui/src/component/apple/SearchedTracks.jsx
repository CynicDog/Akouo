import { useQuery } from "react-query";
import { searchForItem } from "../../data/spotifyAPI.js";
import {
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
                track.attributes.name,
                track.attributes.albumName,
                track.attributes.artistName,
                track.attributes.releaseDate,
                track.attributes.genreNames
            );
        }));
        setSearchResults(searchResults);
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
                            {result.tracks.items[0].name}{' '}
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
                        </ListItem>
                    ))}
                </List>
            )}
        </>
    );
};

export default SearchedTracks;
