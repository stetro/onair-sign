setInterval(function () {
    let controlElements = document.querySelectorAll('[data-is-muted][jsshadow]');
    if (controlElements == null) {
        console.debug("not in a call");
        chrome.runtime.sendMessage({ audio: false, video: false, noSession: true });
    } else {
        let audio = controlElements[0].getAttribute('data-is-muted') == 'false';
        let video = controlElements[1].getAttribute('data-is-muted') == 'false';
        console.debug("audio is on: '" + audio + "' , video is on: '" + video + "' ");
        chrome.runtime.sendMessage({ audio: audio, video: video, noSession: false });
    }
}, 1000);