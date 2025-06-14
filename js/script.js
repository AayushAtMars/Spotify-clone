console.log("lets Write javascript!")
let currentSong = new Audio();
let songs;
let currFolder;



function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');

    return `${formattedMinutes}:${formattedSeconds}`;
}




async function getSongs(folder) {
    currFolder = folder;
    let a = await fetch(`/${folder}/`);
    let response = await a.text();
    // console.log(response);
    let div = document.createElement("div");
    div.innerHTML = response;
    let as = div.getElementsByTagName("a");
    songs = []

    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`/${folder}/`)[1])
        }
    }

    //Showing Songs in Playlist
    let songUL = document.querySelector(".songList").getElementsByTagName("ul")[0];
    songUL.innerHTML = ""
    for (const song of songs) {
        songUL.innerHTML = songUL.innerHTML + `<li><img class="invert" src="img/music.svg" width="25px" alt="">
            <div class="info">
                <div>${song.replaceAll("%20", " ")}</div>
                <div>Aayush</div>
            </div>
            <div class="playNow">
                <span>Play Now</span>
                <img class="invert" src="img/playSong.svg" alt="">
            </div>`;
    }

    //Attach an event listener to each song
    Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", element => {
            // console.log(e.querySelector(".info").firstElementChild.innerHTML);
            playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim())

        })
    })
    return songs;

}


const playMusic = (track , pause=false) => {
    // let audio = new Audio("/Songs/" + track)
    currentSong.src = `/${currFolder}/` + track
    if(!pause){
        currentSong.play()
    }
    currentSong.play()
    play.src = "img/pause.svg"
    document.querySelector(".songinfo").innerHTML = decodeURI(track)
    document.querySelector(".songTime").innerHTML = "00:00 / 00:00"
}

async function displayAlbums(){
    console.log("displaying albums")
    let a = await fetch(`/songs/`);
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let anchors = div.getElementsByTagName("a")
    let cardContainer = document.querySelector(".cardContainer")
    let array = Array.from(anchors)
    for(let index = 0; index<array.length; index++){
            const e = array[index];
        if(e.href.includes("/songs") && !e.href.includes(".htaccess")){
            let folder = (e.href.split("/").slice(-2)[0])

            //Get the meta data of the folder
            let a = await fetch(`/songs/${folder}/info.json`);
            let response = await a.json();

            cardContainer.innerHTML = cardContainer.innerHTML + `<div data-folder="${folder}"  class="card rounded">
                        <div class="play">
                            <img src="img/play-button.svg" alt="">
                        </div>
                        <img src="/songs/${folder}/cover.jpg" alt="">
                        <h4>${response.title}</h4>
                        <p>${response.description}</p>
                    </div>`
        }
    }

    //Load the playlist whenever card is clicked
    Array.from(document.getElementsByClassName("card")).forEach(e=>{
        e.addEventListener("click" ,async item=>{
            songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`)
            playMusic(songs[0])
                document.querySelector(".left").style.left=0;
        })
    })
}

async function main() {

    //list of songs
    await getSongs("songs/pop")
    // console.log(songs)
    playMusic(songs[0], true)
    play.src = "img/playSong.svg"


    //Display all the albums on the page
    displayAlbums()

    //Attach an event listener to play next and previous
    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play()
            play.src = "img/pause.svg"
        }
        else {
            currentSong.pause()
            play.src = "img/playSong.svg"
        }
    })


    //Listen for time update event
    currentSong.addEventListener("timeupdate", () => {
        // console.log(currentSong.currentTime, currentSong.duration)
        document.querySelector(".songTime").innerHTML = `${secondsToMinutesSeconds(currentSong.currentTime)} / ${secondsToMinutesSeconds(currentSong.duration)}`
        document.querySelector(".circle").style.left = (currentSong.currentTime/ currentSong.duration)*100 + "%"
    })

    //Add an Event listener to seek bar

    document.querySelector(".seekbar").addEventListener("click", e=>{   
        let percent = (e.offsetX/e.target.getBoundingClientRect().width)*100
        document.querySelector(".circle").style.left=percent + "%"
        currentSong.currentTime=((currentSong.duration)*percent)/100
    })

    //Add an event listener for hamburger
    document.querySelector(".hamburger").addEventListener("click", ()=>{
        document.querySelector(".left").style.left=0;
    })

    //Add an event listener for close button
    document.querySelector(".close").addEventListener("click", ()=>{
        document.querySelector(".left").style.left="-120%";
    })

    //Add an event listener to play previous song
    previous.addEventListener("click",()=>{
        // console.log("Previous clicked")
        let index=songs.indexOf(currentSong.src.split("/").slice(-1)[0])
        if((index-1>=0)){
            playMusic(songs[index-1])
        }
    })

    //Add an event listener to play next song
    next.addEventListener("click",()=>{
        // console.log("Next clicked")
        let index=songs.indexOf(currentSong.src.split("/").slice(-1)[0])
        let length=songs.length;
        // console.log(length)
        if((index+1)<length){
            playMusic(songs[index+1])
        }
    })

    //Add an event to volume
    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {
        console.log("Setting volume to", e.target.value)
        currentSong.volume=parseInt(e.target.value)/100
    })

    //Add event listener to mute the track
    document.querySelector(".volume>img").addEventListener("click", e=>{
        // console.log(e.target)

        if(e.target.src.includes("img/volume.svg")){
            e.target.src = e.target.src.replace("img/volume.svg","img/mute.svg")
            currentSong.volume = 0;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 0
        }
        else{
            e.target.src = e.target.src.replace("img/mute.svg", "img/volume.svg")
            document.querySelector(".range").getElementsByTagName("input")[0].value = 50
            currentSong.volume = .1;
        }
    })
}

main()