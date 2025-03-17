console.log("JavaScript");
let songs
let currentSong = new Audio()
let currFolder

function convertSecondsToMinutesSeconds(totalSeconds) {
    if (isNaN(totalSeconds) || totalSeconds<0) {
        return "00:00"
    }
    const minutes = Math.floor(totalSeconds / 60);
    const remainingSeconds = Math.floor(totalSeconds % 60);

    // Format minutes and seconds to ensure two digits
    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');

    return `${formattedMinutes}:${formattedSeconds}`;
}


async function getSongs(folder) {
    currFolder = folder
    let a = await fetch(`http://127.0.0.1:3000/${folder}/`)
    let response = await a.text();
    let div = document.createElement("div")
    div.innerHTML = response;
    let as = div.getElementsByTagName("a")
    songs = []
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`/${folder}/`)[1])
        }
        console.log(songs)
    }

    let songUL = document.querySelector(".songlist").getElementsByTagName("ul")[0]
    songUL.innerHTML = ""
    for (const song of songs) {
        songUL.innerHTML = songUL.innerHTML + `<li>                           
                            <img class="invert" src="music.svg" alt="">
                            <div class="info">
                                <div>${song.replaceAll("%20", " ")}</div>
                                <div></div>
                            </div> 
                            <button class="lpbtn">
                                <img class="invert lplay" src="play.svg" alt="">
                            </button>
                         </li>`;
    }

    // Attach an event listener to each song
    Array.from(document.querySelector(".songlist").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", element=> {
            console.log(e.querySelector(".info").firstElementChild.innerHTML)
            playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim())
        })

    })
    
}

const playMusic = (track, pause = false)=> {  
    currentSong.src = `/${currFolder}/` + track
    if(!pause) {
        currentSong.play()
        play.src = "pause.svg"
    }
    document.querySelector(".songinfo").innerHTML = decodeURI(track) 
    document.querySelector(".songtime").innerHTML = "00:00/00:00"
} 

async function displayAlbums() {
    let a = await fetch(`http://127.0.0.1:3000/songs`)
    let response = await a.text();
    let div = document.createElement("div")
    div.innerHTML = response;
    let anchors = div.getElementsByTagName("a")
    let artistContainer = document.querySelector(".artistContainer")
    let array = Array.from(anchors)
    for (let index = 0; index < array.length; index++) {
        const e = array[index];
        if(e.href.includes("/songs")) {
            let folder = e.href.split("/").slice(-2)[0]
            // Get the metadata of the folder
            let a = await fetch(`http://127.0.0.1:3000/songs/${folder}/info.json`)
            let response = await a.json();
            artistContainer.innerHTML = artistContainer.innerHTML + `<div data-folder="${folder}" class="card">
                        <div class="play">
                            <button class="playbtn">
                                <img src="play.svg" alt=""> 
                            </button>
                        </div>
                        <img src="songs/${folder}/cover.jpg" alt="">
                        <h2>${response.title}</h2>
                        <p>${response.discription}</p>
                    </div>`

        }
    }
    // Load the playlist whenever card is clicked
    Array.from(document.getElementsByClassName("card")).forEach(e=> {
        e.addEventListener("click" , async item=> {
            songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`)
        })
    })
}


async function main() { 
    // Get list of all songs
    const newLocal = "songs/ARRahman";
    await getSongs(newLocal)
    playMusic(songs[0], true)
    // console.log(songs);

    // display all the albums
    displayAlbums()

    // Attach an event listener to play next and previous
    play.addEventListener("click", ()=> {
        if (currentSong.paused) {
            currentSong.play()
            play.src = "pause.svg"
        }
        else {
            currentSong.pause()
            play.src = "play.svg"
        }
    })
    
    // Attach an event listener for previous
    previous.addEventListener("click",()=> {
        currentSong.pause()
        console.log(currentSong.src.split("/").slice(-1)[0]);
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
        console.log(index);
        if ((index-1) >= 0) {
            playMusic(songs[index-1])
        }
    })
     
    // Attach an event listener for next
    next.addEventListener("click",()=> {
        currentSong.pause()
        console.log(currentSong.src.split("/").slice(-1)[0]);
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
        console.log(index);
        if ((index+1) < songs.length) { 
            playMusic(songs[index+1])
        }
    })

    // Event listener to update time of current song
    currentSong.addEventListener("timeupdate", ()=> {
        // console.log(currentSong.currentTime, currentSong.duration);
        document.querySelector(".songtime").innerHTML = `${convertSecondsToMinutesSeconds(currentSong.currentTime)}
            / ${convertSecondsToMinutesSeconds(currentSong.duration)}`
        document.querySelector(".circle").style.left = (currentSong.currentTime/ currentSong.duration) * 100 + "%"
    } )

    // Event listener to seekbar
    document.querySelector(".seekbar").addEventListener("click", e=>{
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100
        document.querySelector(".circle").style.left = percent + "%"
        currentSong.currentTime = (currentSong.duration*percent) / 100
    })

    //event listener for hamburger
    document.querySelector(".hamburgerCont").addEventListener("click", e=> {
        document.querySelector(".left").style.left = "0"
    })
    document.querySelector(".cross").addEventListener("click", e=> {
        document.querySelector(".left").style.left = "-150%"
    })
    
    // Add an event listener for volume
    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e)=> {
        currentSong.volume = parseInt(e.target.value)/100
        if (currentSong.volume > 0) {
            document.querySelector(".volume>img").src = document.querySelector(".volume>img").src.replace("mute.svg" , "volume.svg")
        }
    })
    
    // Add an event listener to mute the volume
    document.querySelector(".volume>img").addEventListener("click", e=> {
        if(e.target.src.includes("volume.svg")) {
            e.target.src = e.target.src.replace("volume.svg", "mute.svg")
            currentSong.volume = 0
            document.querySelector(".range").getElementsByTagName("input")[0].value = 0
        }
        else {
            e.target.src = e.target.src.replace("mute.svg", "volume.svg")
            currentSong.volume = .20;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 20;
        }
    })

    
    
} 
main()

