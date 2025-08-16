console.log('Lets write JavaScript');
let currentSong = new Audio();
let songs = [];
let currAlbum = null;

function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

const playMusic = (track, pause = false) => {
    currentSong.src = track;
    if (!pause) {
        currentSong.play();
        play.src = "./img/pause.svg";
    }
    let fileName = decodeURIComponent(track.split("/").pop());
    document.querySelector(".songinfo").innerHTML = fileName;
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00";
};

function renderSongs(songList) {
    let songUL = document.querySelector(".songList ul");
    songUL.innerHTML = "";
    songList.forEach((song, i) => {
        let fileName = decodeURIComponent(song.split("/").pop());
        songUL.innerHTML += `
        <li>
            <img class="invert" width="34" src="img/music.svg" alt="">
            <div class="info">
                <div>${fileName}</div>
                <div>Artist</div>
            </div>
            <div class="playnow">
                <span>Play Now</span>
                <img class="invert" src="./img/play.svg" alt="">
            </div>
        </li>`;
    });

    // Add click listeners
    Array.from(songUL.querySelectorAll("li")).forEach((li, index) => {
        li.addEventListener("click", () => {
            playMusic(songList[index]);
        });
    });
}

async function displayAlbums() {
    let res = await fetch("songs.json");
    let data = await res.json();
    let cardContainer = document.querySelector(".cardContainer");

    data.albums.forEach(album => {
        cardContainer.innerHTML += `
        <div data-folder="${album.folder}" class="card">
            <div class="play">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                    xmlns="http://www.w3.org/2000/svg">
                    <path d="M5 20V4L19 12L5 20Z" stroke="#141B34" fill="#000" stroke-width="1.5"
                        stroke-linejoin="round" />
                </svg>
            </div>
            <img src="${album.cover}" alt="">
            <h2>${album.title}</h2>
            <p>${album.description}</p>
        </div>`;
    });

    // When album card is clicked
    Array.from(document.getElementsByClassName("card")).forEach((e, i) => {
        e.addEventListener("click", () => {
            let album = data.albums[i];
            songs = album.songs;
            currAlbum = album;
            renderSongs(album.songs);
            playMusic(album.songs[0]);
        });
    });

    // Load first album by default
    if (data.albums.length > 0) {
        let album = data.albums[0];
        songs = album.songs;
        currAlbum = album;
        renderSongs(album.songs);
        playMusic(album.songs[0], true);
    }
}

async function main() {
    // Display all the albums
    await displayAlbums();

    // Attach an event listener to play, next and previous
    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play();
            play.src = "./img/pause.svg";
        }
        else {
            currentSong.pause();
            play.src = "./img/play.svg";
        }
    });

    // Listen for timeupdate event
    currentSong.addEventListener("timeupdate", () => {
        document.querySelector(".songtime").innerHTML = `${secondsToMinutesSeconds(currentSong.currentTime)} / ${secondsToMinutesSeconds(currentSong.duration)}`;
        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";
    });

    // Add an event listener to seekbar
    document.querySelector(".seekbar").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        currentSong.currentTime = ((currentSong.duration) * percent) / 100;
    });

    // Add an event listener for hamburger
    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0";
    });

    // Add an event listener for close button
    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-120%";
    });

    // Add an event listener to previous
    previous.addEventListener("click", () => {
        currentSong.pause();
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
        if ((index - 1) >= 0) {
            playMusic(songs[index - 1]);
        }
    });

    // Add an event listener to next
    next.addEventListener("click", () => {
        currentSong.pause();
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
        if ((index + 1) < songs.length) {
            playMusic(songs[index + 1]);
        }
    });

    // Add an event to volume
    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {
        currentSong.volume = parseInt(e.target.value) / 100;
        if (currentSong.volume > 0) {
            document.querySelector(".volume>img").src = document.querySelector(".volume>img").src.replace("mute.svg", "volume.svg");
        }
    });

    // Add event listener to mute the track
    document.querySelector(".volume>img").addEventListener("click", e => {
        if (e.target.src.includes("volume.svg")) {
            e.target.src = e.target.src.replace("volume.svg", "mute.svg");
            currentSong.volume = 0;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 0;
        }
        else {
            e.target.src = e.target.src.replace("mute.svg", "volume.svg");
            currentSong.volume = .10;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 10;
        }
    });
}

main();
