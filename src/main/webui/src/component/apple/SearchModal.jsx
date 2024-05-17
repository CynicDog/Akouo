import {
    Button,
    Checkbox, HelperText, HelperTextItem, Label, List, ListComponent, ListItem,
    Modal,
    ModalVariant, OrderType,
    TextInput, Tooltip, useWizardContext,
    Wizard, WizardFooter, WizardFooterWrapper,
    WizardHeader,
    WizardStep
} from "@patternfly/react-core";
import React, {useState} from "react";
import SearchedTracks from "./SearchedTracks.jsx";
import {useMutation} from "react-query";
import {createPlaylist} from "../../data/spotifyAPI.js";
import {useAuth} from "../../Context.jsx";
import PlaylistDetail from "../spotify/PlaylistDetail.jsx";

const SearchModal = ({targetService, playlist, tracks, isModalOpen, handleModalToggle, handleWizardToggle}) => {

    const {spotifyUserId} = useAuth();
    const [searchResults, setSearchResults] = useState([]);
    const [playlistName, setPlaylistName] = useState(targetService === "spotify" ? playlist.attributes.name : playlist.name);
    const [playlistDescription, setPlaylistDescription] = useState(targetService === "spotify" ? playlist.attributes.description?.standard : playlist.description);
    const [playlistPublicity, setPlaylistPublicity] = useState(targetService === "spotify" ? playlist.attributes.isPublic : playlist.public);
    const [generatedPlaylist, setGeneratedPlaylist] = useState(null);

    const CustomWizardFooter = () => {
        const {activeStep, goToNextStep, goToPrevStep, close} = useWizardContext();
        return (
            <WizardFooter
                nextButtonText="Create a playlist and add tracks"
                activeStep={activeStep}
                onNext={() => {
                    goToNextStep();
                    mutation.mutate();
                }}
                onBack={goToPrevStep}
                onClose={close}
                isBackDisabled={activeStep.index === 1}/>
        );
    };

    const handleCheckboxChecked = () => {
        setPlaylistPublicity(prevState => !prevState);
    };

    const mutation = useMutation({
        mutationFn: async () => {
            try {
                var generatedPlaylist = await createPlaylist(
                    spotifyUserId,
                    playlistName,
                    playlistDescription,
                    playlistPublicity,
                    searchResults
                );

                setGeneratedPlaylist(generatedPlaylist);
            } catch (error) {
                // handle error
            }
        }
    });

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
                    isProgressive
                    height={400}
                    header={
                        <WizardHeader
                            title={"Find in " + (targetService === "spotify" ? "Spotify" : "Apple Music")}
                            titleId="modal-wizard-label"
                            description={"Find tracks of your " + (targetService === "spotify" ? "Apple Music" : "Spotify") + " playlist in " + (targetService === "spotify" ? "Spotify" : "Apple Music")}
                            onClose={handleWizardToggle}
                            closeButtonAriaLabel="Close wizard"/>
                    }
                    onClose={handleWizardToggle}>
                    <WizardStep
                        id="with-wizard-step-1"
                        name={"🔍 Search "+ (targetService === "spotify" ? "Apple Music" : "Spotify") +" Tracks"}>
                        <div className="row">
                            <div className="col-lg-6">
                                <div className="fs-4 fw-lighter mb-3 p-2 bg-secondary-subtle">
                                    {(targetService === "spotify" ? "Apple Music" : "Spotify") + " Tracks"}
                                </div>
                                <List component={ListComponent.ol} type={OrderType.number}>
                                    {tracks.map((track, index) => (
                                        <ListItem key={index}>
                                            <span className="fw-light">
                                                {targetService === "spotify" ? track.attributes.name : track.track.name}{' '}
                                            </span>
                                            <Tooltip content={<div>{targetService === "spotify" ? track.attributes.albumName : track.track.album.name}</div>}>
                                                <Label isCompact textMaxWidth="7ch">
                                                    {targetService === "spotify" ? track.attributes.albumName : track.track.album.name}
                                                </Label>
                                            </Tooltip>{' '}
                                            <Tooltip content={<div>{targetService === "spotify" ? track.attributes.artistName : track.track.artists[0].name}</div>}>
                                                <Label isCompact textMaxWidth="7ch">
                                                    {targetService === "spotify" ? track.attributes.artistName : track.track.artists[0].name}
                                                </Label>
                                            </Tooltip>
                                        </ListItem>
                                    ))}
                                </List>
                            </div>
                            <div className="col-lg-6">
                                <div className="fs-4 fw-lighter mb-3 p-2 bg-secondary-subtle">Tracks searched in
                                    {targetService === "spotify" ? " Spotify" : " Apple Music"}
                                </div>
                                <SearchedTracks targetService={targetService} tracks={tracks} setSearchResults={setSearchResults}/>
                            </div>
                        </div>
                    </WizardStep>
                    <WizardStep
                        id="with-wizard-step-2"
                        name={"📦 Package to " + (targetService === "spotify" ? "Spotify" : "Apple Music")}
                        footer={
                            <CustomWizardFooter />
                        }>
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
                                <span className="my-1 pe-5 ">
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
                                    label="Set to public"
                                    description="If checked, the playlist will be shown to public"
                                    id="radio-controlled"/>
                            </div>
                        </div>
                        <div className="m-3 p-3 border rounded shadow-sm">
                            <div style={{padding: "15px", height: "200px", overflow: "auto"}}>
                                <List component={ListComponent.ol} type={OrderType.number}>
                                    {searchResults.map((result, index) => (
                                        <ListItem key={index}>
                                            {targetService === "spotify" ? (
                                                result.tracks.items.length > 0 ? (
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
                                                ) : (
                                                    <HelperText>
                                                        <HelperTextItem variant="error" hasIcon>
                                                            not found
                                                        </HelperTextItem>
                                                    </HelperText>
                                                )
                                            ) : (
                                                result.data.length > 0 ? (
                                                    <>
                                                        <span className="fw-light">
                                                            {result.data[0].attributes.name}{' '}
                                                        </span>
                                                        <Tooltip content={<div>{result.data[0].attributes.albumName}</div>}>
                                                            <Label isCompact textMaxWidth="7ch">
                                                                {result.data[0].attributes.albumName}
                                                            </Label>
                                                        </Tooltip>{' '}
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
                                                )
                                            )}
                                        </ListItem>
                                    ))}
                                </List>
                            </div>
                        </div>
                    </WizardStep>
                    <WizardStep
                        id="with-wizard-step-3"
                        name="🤓 Review"
                        footer={{
                            nextButtonText: 'Finish',
                            onNext: handleWizardToggle
                        }}>
                        {generatedPlaylist && (
                            <>
                                <PlaylistDetail playlist={generatedPlaylist} height={470} />
                            </>
                        )}
                    </WizardStep>
                </Wizard>
            </Modal>
        </>
    )
}

export default SearchModal;