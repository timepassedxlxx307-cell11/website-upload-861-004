import { H as Hls } from "./hls-vendor.js";

export function initMoviePlayer(videoId, sourceUrl, coverId, triggerId) {
    var video = document.getElementById(videoId);
    var cover = document.getElementById(coverId);
    var trigger = document.getElementById(triggerId);
    var hlsInstance = null;

    if (!video || !sourceUrl) {
        return;
    }

    function showCover() {
        if (cover) {
            cover.classList.remove("is-hidden");
        }
    }

    function hideCover() {
        if (cover) {
            cover.classList.add("is-hidden");
        }
    }

    function attachSource() {
        if (video.getAttribute("data-ready") === "true") {
            return;
        }

        if (Hls.isSupported()) {
            hlsInstance = new Hls({
                enableWorker: true,
                lowLatencyMode: true,
                backBufferLength: 90
            });
            hlsInstance.loadSource(sourceUrl);
            hlsInstance.attachMedia(video);
            hlsInstance.on(Hls.Events.ERROR, function (eventName, data) {
                if (!data || !data.fatal || !hlsInstance) {
                    return;
                }
                if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
                    hlsInstance.startLoad();
                    return;
                }
                if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
                    hlsInstance.recoverMediaError();
                    return;
                }
                hlsInstance.destroy();
            });
        } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = sourceUrl;
        }

        video.setAttribute("data-ready", "true");
    }

    function startPlayback() {
        attachSource();
        hideCover();
        var attempt = video.play();
        if (attempt && typeof attempt.catch === "function") {
            attempt.catch(function () {
                showCover();
            });
        }
    }

    attachSource();

    if (trigger) {
        trigger.addEventListener("click", function (event) {
            event.preventDefault();
            event.stopPropagation();
            startPlayback();
        });
    }

    if (cover) {
        cover.addEventListener("click", startPlayback);
    }

    video.addEventListener("play", hideCover);
    video.addEventListener("pause", function () {
        if (video.currentTime === 0 || video.ended) {
            showCover();
        }
    });
    video.addEventListener("ended", showCover);

    window.addEventListener("pagehide", function () {
        if (hlsInstance) {
            hlsInstance.destroy();
            hlsInstance = null;
        }
    });
}
