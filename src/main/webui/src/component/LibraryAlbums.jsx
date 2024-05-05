import React from 'react';
import {
    Card,
    CardBody,
    CardFooter,
    CardHeader,
    CardTitle,
    Flex,
    FlexItem, Grid, GridItem,
    Label, List, ListItem,
    Spinner
} from '@patternfly/react-core';
import {useQuery} from 'react-query';
import {fetchLibraryAlbumRelationByName} from '../data/api';

const LibraryAlbums = ({albums, isAlbumLoading}) => {
    return (
        <div>
            {isAlbumLoading ? (
                <Spinner/>
            ) : (
                <>
                    {albums.map((album, index) => (
                        <AlbumCard key={index} album={album}/>
                    ))}
                </>
            )}
        </div>
    );
};

const AlbumCard = ({album}) => {
    const developerToken = sessionStorage.getItem('DT');
    const musicUserToken = sessionStorage.getItem('MUT');

    const {data: songs, isLoading: isSongLoading} = useQuery(
        ['albumSongs', album.id],
        () => fetchLibraryAlbumRelationByName(developerToken, musicUserToken, album.id, "tracks"),
        {
            enabled: !!album.id,
            staleTime: 7_200_000 // 2 hours
        }
    );

    return (
        <Card key={album.id} id={album.id} isClickable>
            <CardHeader selectableActions={{selectableActionId: album.id}}>
                <CardTitle>
                    <div className="fw-lighter fs-5">
                        {album.attributes.name} {' '}
                        {album.attributes.genreNames.map((genre, genreIndex) => (
                            <React.Fragment key={genreIndex}>
                                <Label isCompact>
                                    {genre}
                                </Label>
                                <Label isCompact>
                                    {album.attributes.releaseDate}
                                </Label>
                                <Label isCompact color="orange">
                                    {album.attributes.dateAdded.split("T")[0]}
                                </Label>
                            </React.Fragment>
                        ))}
                    </div>
                    <div>
                        {album.attributes.artistName}
                    </div>
                </CardTitle>
            </CardHeader>
            <CardBody>
                <div className="row">
                    <div className="col-md-4">
                        <div className="m-4">
                            <apple-music-artwork
                                alt={album.attributes.name}
                                source={album.attributes.artwork.url}
                                width="200px"
                            />
                        </div>
                    </div>
                    <div className="col-md-8">
                        {isSongLoading ? (
                            <Spinner/>
                        ) : (
                            <SongList songs={songs}/>
                        )}
                    </div>
                </div>
            </CardBody>
        </Card>
    );
};

const SongList = ({songs}) => {
    return (
        <List isPlain isBordered>
            {songs.data.map((song, index) => (
                <ListItem key={index} className="fw-lighter">
                    {song.attributes.name}
                </ListItem>
            ))}
        </List>
    );
};

export default LibraryAlbums;

