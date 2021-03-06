import React from 'react';
import ReactDOM from 'react-dom';
import {compose} from 'redux';

import AppStateHOC from '../lib/app-state-hoc.jsx';
import GUI from '../containers/gui.jsx';
import HashParserHOC from '../lib/hash-parser-hoc.jsx';
import TitledHOC from '../lib/titled-hoc.jsx';
import log from '../lib/log.js';
import ITCH_CONFIG from '../../itch.config';

const onClickLogo = () => {
    window.location = 'https://scratch.mit.edu';
};

const handleTelemetryModalCancel = () => {
    log('User canceled telemetry modal');
};

const handleTelemetryModalOptIn = () => {
    log('User opted into telemetry');
};

const handleTelemetryModalOptOut = () => {
    log('User opted out of telemetry');
};

/*
 * Render the GUI playground. This is a separate function because importing anything
 * that instantiates the VM causes unsupported browsers to crash
 * {object} appTarget - the DOM element to render to
 */
export default appTarget => {
    GUI.setAppElement(appTarget);

    // note that redux's 'compose' function is just being used as a general utility to make
    // the hierarchy of HOC constructor calls clearer here; it has nothing to do with redux's
    // ability to compose reducers.
    const WrappedGui = compose(
        AppStateHOC,
        HashParserHOC,
        TitledHOC
    )(GUI);

    // TODO a hack for testing the backpack, allow backpack host to be set by url param
    const backpackHostMatches = window.location.href.match(/[?&]backpackHost=([^&]*)&?/);
    const scratchEditor = document.getElementById('scratch-editor');
    const backpackHost = scratchEditor ? window.getBackPackHost() : (
        backpackHostMatches ? backpackHostMatches[1] : ITCH_CONFIG.BACKPACK_HOST
    );

    const scratchDesktopMatches = window.location.href.match(/[?&]isScratchDesktop=([^&]+)/);
    let simulateScratchDesktop;
    if (scratchDesktopMatches) {
        try {
            // parse 'true' into `true`, 'false' into `false`, etc.
            simulateScratchDesktop = JSON.parse(scratchDesktopMatches[1]);
        } catch {
            // it's not JSON so just use the string
            // note that a typo like "falsy" will be treated as true
            simulateScratchDesktop = scratchDesktopMatches[1];
        }
    }

    /* if (process.env.NODE_ENV === 'production' && typeof window === 'object') {
        // Warn before navigating away
        window.onbeforeunload = () => true;
    }*/
    const user = {
        banned: false,
        dateJoined: '2019-02-22T16:04:53',
        email: 'toskapasho@gmail.com',
        id: 41620062,
        thumbnailUrl: '//cdn2.scratch.mit.edu/get_image/user/default_32x32.png',
        token: '45bb4c94bccd49c1875477e5a5bc8485:qSx_8wRgzgRvhPA-ckpBikBZjyI',
        username: 'ptoska'
    };


    ReactDOM.render(
        // important: this is checking whether `simulateScratchDesktop` is truthy, not just defined!
        simulateScratchDesktop ?
            <WrappedGui
                isScratchDesktop
                showTelemetryModal
                assetHost={ITCH_CONFIG.ASSET_SERVER}
                canSave={false}
                isScratchEditor={!!scratchEditor}
                onTelemetryModalCancel={handleTelemetryModalCancel}
                onTelemetryModalOptIn={handleTelemetryModalOptIn}
                onTelemetryModalOptOut={handleTelemetryModalOptOut}
            /> :
            <WrappedGui
                backpackVisible
                showComingSoon
                assetHost={ITCH_CONFIG.ASSET_SERVER}
                backpackHost={backpackHost}
                canSave={false}
                isScratchEditor={!!scratchEditor}
                projectHost={'http://api.itchcode.com/api/project'}
                projectId={0}
                user={user}
                onClickLogo={onClickLogo}
            />,
        appTarget);
};
