import {
    Button, Checkbox, HelperText, HelperTextItem, Label, List, ListComponent, ListItem,
    Modal,
    ModalVariant, OrderType, Radio,
    SimpleList,
    SimpleListItem, TextInput, Tooltip, ValidatedOptions,
    Wizard,
    WizardHeader,
    WizardStep
} from "@patternfly/react-core";
import React, {useState} from "react";
import SearchedTracks from "./SearchedTracks.jsx";

const SearchModal = ({playlist, tracks, isModalOpen, handleModalToggle, handleWizardToggle}) => {

    const [searchResults, setSearchResults] = useState([]);
    const [playlistName, setPlaylistName] = useState(playlist.attributes.name);
    const [playlistDescription, setPlaylistDescription] = useState(playlist.attributes.description?.standard);
    const [playlistPublicity, setPlaylistPublicity] = useState(playlist.attributes.isPublic);

    const handleCheckboxChecked = () => {
        setPlaylistPublicity(prevState => !prevState);
    };

    return (
        <>
            <Modal
                variant={ModalVariant.large}
                showClose={false}
                isOpen={isModalOpen}
                onClose={handleModalToggle}
                width="1300px"
                hasNoBodyWrapper>
                <Wizard
                    height={400}
                    header={
                        <WizardHeader
                            title="Find in Spotify"
                            titleId="modal-wizard-label"
                            description="Find tracks of your Apple Music playlist in Spotify!"
                            onClose={handleWizardToggle}
                            closeButtonAriaLabel="Close wizard"/>
                    }
                    onClose={handleWizardToggle}>
                    <WizardStep
                        id="with-wizard-step-1"
                        name="Find Apple Music Tracks in Spotify">
                        <div className="row">
                            <div className="col-lg-6">
                                <div className="fs-4 fw-lighter mb-3 p-2 bg-secondary-subtle">
                                    Apple Music Tracks
                                </div>
                                <List component={ListComponent.ol} type={OrderType.number}>
                                    {tracks.map((track, index) => (
                                        <ListItem key={index}>
                                            <span className="fw-light">
                                                {track.attributes.name}{' '}
                                            </span>
                                            <Tooltip content={<div>{track.attributes.albumName}</div>}>
                                                <Label isCompact textMaxWidth="7ch">
                                                    {track.attributes.albumName}
                                                </Label>
                                            </Tooltip>{' '}
                                            <Tooltip content={<div>{track.attributes.artistName}</div>}>
                                                <Label isCompact textMaxWidth="7ch">
                                                    {track.attributes.artistName}
                                                </Label>
                                            </Tooltip>
                                        </ListItem>
                                    ))}
                                </List>
                            </div>
                            <div className="col-lg-6">
                                <div className="fs-4 fw-lighter mb-3 p-2 bg-secondary-subtle">Tracks searched in
                                    Spotify
                                </div>
                                <SearchedTracks tracks={tracks} setSearchResults={setSearchResults}/>
                            </div>
                        </div>
                    </WizardStep>
                    <WizardStep
                        id="with-wizard-step-2"
                        name="Package to Spotify"
                        footer={{
                            nextButtonText: 'Finish',
                            onNext: handleWizardToggle
                        }}>
                        <div className="m-3 p-3 border rounded shadow-sm">
                            <div className="d-flex my-3">
                                <span className="my-1 pe-5 fw-light">
                                    Playlist name *
                                </span>
                                <TextInput
                                    className="w-75 ms-auto"
                                    isRequired
                                    value={playlistName}
                                    type="text"
                                    onChange={(_event, value) => setPlaylistName(value)}/>
                            </div>
                            <div className="d-flex my-3">
                                <span className="my-1 pe-5 fw-light">
                                    Playlist description
                                </span>
                                <TextInput
                                    className="w-75 ms-auto"
                                    value={playlistDescription}
                                    type="text"
                                    onChange={(_event, value) => setPlaylistDescription(value)}/>
                            </div>
                            <div className="d-flex my-3">

                                <Checkbox
                                    isChecked={playlistPublicity}
                                    onChange={handleCheckboxChecked}
                                    label="is public"
                                    id="radio-controlled"/>
                            </div>
                        </div>
                        <div className="m-3 p-3 border rounded shadow-sm">
                            <div style={{padding: "15px", height: "200px", overflow: "auto"}}>
                                <List component={ListComponent.ol} type={OrderType.number}>
                                    {searchResults.map((result, index) => (
                                        <ListItem key={index}>
                                            {result.tracks.items.length > 0 ? (
                                                <div className="d-flex">
                                                    <span className="fw-light">
                                                        {result.tracks.items[0].name}{' '}
                                                    </span>
                                                    <div className="ms-auto">
                                                        <Tooltip content={<div>{result.tracks.items[0]?.album?.name}</div>}>
                                                            <Label isCompact textMaxWidth="30ch">
                                                                {result.tracks.items[0].album.name}
                                                            </Label>
                                                        </Tooltip>{' '}
                                                        <Tooltip
                                                            content={<div>{result.tracks.items[0]?.artists[0]?.name}</div>}>
                                                            <Label isCompact textMaxWidth="30ch" color="blue">
                                                                {result.tracks.items[0]?.artists[0]?.name}
                                                            </Label>
                                                        </Tooltip>
                                                    </div>
                                                </div>
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
                            </div>
                        </div>
                    </WizardStep>
                </Wizard>
            </Modal>
        </>
    )
}

export default SearchModal;