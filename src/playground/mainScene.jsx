import React from 'react';
import ReactDOM from 'react-dom';
import {compose} from 'redux';

import AppStateHOC from '../lib/app-state-hoc.jsx';
import GUI from '../containers/gui.jsx';
import HashParserHOC from '../lib/hash-parser-hoc.jsx';
import log from '../lib/log.js';
import { io } from "socket.io-client";
import{ useSearchParams} from "react-router-dom";


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
const Project = () => {
    let socket = io("http://localhost:8000/", {
        withCredentials: true,
        extraHeaders: {
          "my-custom-header": "abcd"
        }
      });

    const [searchParams] = useSearchParams();
    let room = searchParams.get("id");

    socket.emit('joinRoom', room);
    socket.emit('requestRoom');

    socket.on('giveRoom', function(rooms) {
        let title = document.getElementById("title");
        title.textContent = rooms[1];
    });

    socket.on('newPerson', function(clientArr) {
        let people = document.getElementById('people_list');
        people.innerHTML = '';
        for(var i = 0; i < clientArr.length; i++)
        {
          var item = document.createElement('li');
          item.textContent = clientArr[i];
          people.appendChild(item);
        }
    });

    // note that redux's 'compose' function is just being used as a general utility to make
    // the hierarchy of HOC constructor calls clearer here; it has nothing to do with redux's
    // ability to compose reducers.
    const WrappedGui = compose(
        AppStateHOC,
        HashParserHOC
    )(GUI);

    // TODO a hack for testing the backpack, allow backpack host to be set by url param
    const backpackHostMatches = window.location.href.match(/[?&]backpack_host=([^&]*)&?/);
    const backpackHost = backpackHostMatches ? backpackHostMatches[1] : null;

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
    
    if (process.env.NODE_ENV === 'production' && typeof window === 'object') {
        // Warn before navigating away
        window.onbeforeunload = () => true;
    }
     

   return simulateScratchDesktop ?
            <div>
                <h1 id="title"></h1>
                <ul id="people_list"></ul>
                <div style = {{height:"100vh"}}>
                <WrappedGui
                canEditTitle
                isScratchDesktop
                showTelemetryModal
                canSave={false}
                onTelemetryModalCancel={handleTelemetryModalCancel}
                onTelemetryModalOptIn={handleTelemetryModalOptIn}
                onTelemetryModalOptOut={handleTelemetryModalOptOut}
            />
            </div></div> :
            <div>
                <h1 id="title"></h1>
                <ul id="people_list"></ul>
                <div style = {{height:"100vh"}}><WrappedGui
                canEditTitle
                backpackVisible
                showComingSoon
                backpackHost={backpackHost}
                canSave={false}
                onClickLogo={onClickLogo}
            /></div></div>;
};

export default Project;