'use strict';

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

let plugin = function () {
    console.log("Starting Plugin");
    let onlineCallback = debounce(function () {
        fetch("http://192.168.86.113/video");
        console.log("video")
    }, 1000, true);

    let offlineCallback = debounce(function () {
        fetch("http://192.168.86.113/offline");
        console.log("offline")
    }, 1000, true);

    let updateIcond = function (tabId) {
        chrome.tabs.query({ url: "https://meet.google.com/*" }, function (tabs) {
            if (tabs.length > 0) {
                // in a meet conference
                chrome.browserAction.setBadgeText({ text: 'meet' })
                chrome.browserAction.setBadgeBackgroundColor({ color: 'red' });
                onlineCallback();
            } else {
                // in no conference
                chrome.browserAction.setBadgeText({ text: '' })
                chrome.browserAction.setBadgeBackgroundColor({ color: 'green' });
                offlineCallback();
            }
        });
    }
    chrome.tabs.onUpdated.addListener(updateIcond);
    chrome.tabs.onRemoved.addListener(updateIcond);
};



chrome.runtime.onInstalled.addListener(plugin);
chrome.runtime.onStartup.addListener(plugin);

