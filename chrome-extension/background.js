'use strict';

const displayIp = "192.168.86.113";

let lastState = { audio: false, video: false, noSession: true };

let debounce = function (func, wait, immediate) {
    var timeout;
    return function () {
        var context = this, args = arguments;
        var later = function () {
            timeout = null;
            if (!immediate) func.apply(context, args);
        };
        var callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func.apply(context, args);
    };
};

let deviceIsNotConnected = function () {
    console.log("device is not connected")
    chrome.browserAction.setBadgeText({ text: 'off' });
    chrome.browserAction.setBadgeBackgroundColor({ color: 'red' });
};

let sendState = debounce(function () {
    let esc = encodeURIComponent;
    let query = Object.keys(lastState)
        .map(k => esc(k) + '=' + esc(lastState[k]))
        .join('&');
    fetch("http://" + displayIp + '/status?' + query).catch(deviceIsNotConnected);
    console.log(JSON.stringify(lastState) + " published")
}, 1000, true);

let updateBadge = function () {
    if (lastState.noSession) {
        chrome.browserAction.setBadgeText({ text: '' })
    } else {
        let audio = lastState.audio ? '🎤' : '🚫';
        let video = lastState.video ? '📷' : '🚫';
        chrome.browserAction.setBadgeText({ text: audio + video });
        if (!lastState.audio && !lastState.video) {
            chrome.browserAction.setBadgeBackgroundColor({ color: 'yellow' });
        } else {
            chrome.browserAction.setBadgeBackgroundColor({ color: 'red' });
        }
    }
};

let noSession = function () {
    lastState = { audio: false, video: false, noSession: true };
    updateBadge();
    sendState()
}

let sessionStarted = function () {
    if (lastState.noSession == true) {
        lastState = { audio: true, video: true, noSession: false };
    }
    updateBadge();
    sendState();
}

let plugin = function () {
    console.log("Starting Plugin");
    let updateMeetingState = function () {
        chrome.tabs.query({ url: "https://meet.google.com/*" }, function (tabs) {
            tabs = tabs.filter(t => t.url != "https://meet.google.com/");
            if (tabs.length > 0) {
                // in a meet conference
                sessionStarted();
            } else {
                // in no conference
                noSession();
            }
        });
    }
    chrome.tabs.onUpdated.addListener(updateMeetingState);
    chrome.tabs.onRemoved.addListener(updateMeetingState);

    chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
        if (lastState.video != request.video || lastState.audio != request.audio || lastState.noSession != request.noSession) {
            lastState = request;
            updateMeetingState();
        }
    });
};



chrome.runtime.onInstalled.addListener(plugin);
chrome.runtime.onStartup.addListener(plugin);

