(function() {
    window.musique_show = 1;

    const playlist = [
        { name: "Nuit Paisible", link: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3", cover: "https://picsum.photos/id/10/200/200" },
        { name: "Lofi Beats", link: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3", cover: "https://picsum.photos/id/20/200/200" },
        { name: "Horizon", link: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3", cover: "https://picsum.photos/id/30/200/200" }
    ];

    // Création du conteneur principal (Glassomorphisme)
    const win = document.createElement('div');
    win.id = 'apple-window';
    win.setAttribute('style', `
        position: fixed; top: 30px; right: 30px; z-index: 10000;
        width: 280px; border-radius: 16px; overflow: hidden;
        background: rgba(255, 255, 255, 0.4);
        backdrop-filter: blur(15px) saturate(180%);
        -webkit-backdrop-filter: blur(15px) saturate(180%);
        border: 1px solid rgba(255, 255, 255, 0.3);
        box-shadow: 0 10px 40px rgba(0,0,0,0.15);
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        transition: all cubic-bezier(0.4, 0, 0.2, 1);
        display: none;
    `);

    win.innerHTML = `
        <div class="window-header" style="height: 40px; background: rgba(255, 255, 255, 0.1); display: flex; align-items: center; padding: 0 15px; cursor: move; border-bottom: 0.5px solid rgba(255, 255, 255, 0.2);">
            <div style="display: flex; gap: 8px;">
                <div class="close" style="width: 12px; height: 12px; border-radius: 50%; background: #ff5f56; cursor: pointer;"></div>
                <div class="minimize" style="width: 12px; height: 12px; border-radius: 50%; background: #ffbd2e; cursor: pointer;"></div>
                <div style="width: 12px; height: 12px; border-radius: 50%; background: #27c93f; opacity: 0.3;"></div>
            </div>
        </div>

        <div class="window-content" style="padding: 20px;">
            <div style="display: flex; align-items: center; gap: 15px; margin-bottom: 20px;">
                <img id="track-cover" src="" style="width: 55px; height: 55px; border-radius: 10px; object-fit: cover; box-shadow: 0 4px 10px rgba(0,0,0,0.1);">
                <p id="track-title" style="margin: 0; font-size: 15px; font-weight: 600; color: #1d1d1f; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;"></p>
            </div>

            <div style="margin-bottom: 15px;">
                <input type="range" id="seek-bar" value="0" step="0.1" style="width: 100%; height: 4px; cursor: pointer; accent-color: #007aff;">
                <div style="display: flex; justify-content: space-between; font-size: 10px; color: rgba(0,0,0,0.5); margin-top: 5px;">
                    <span id="cur">0:00</span><span id="dur">0:00</span>
                </div>
            </div>

            <div style="display: flex; justify-content: center; align-items: center; gap: 25px;">
                <button id="prev-btn" style="background:none; border:none; font-size:22px; cursor:pointer; color:#1d1d1f;">⏮</button>
                <button id="play-btn" style="background:none; border:none; font-size:35px; cursor:pointer; color:#1d1d1f;">▶</button>
                <button id="next-btn" style="background:none; border:none; font-size:22px; cursor:pointer; color:#1d1d1f;">⏭</button>
            </div>
        </div>
    `;

    document.body.appendChild(win);

    // Audio Logic
    const audio = new Audio();
    const playBtn = win.querySelector('#play-btn');
    const seekBar = win.querySelector('#seek-bar');
    let currentIndex = Math.floor(Math.random() * playlist.length);

    const load = (i) => {
        const t = playlist[i];
        win.querySelector('#track-title').innerText = t.name;
        win.querySelector('#track-cover').src = t.cover;
        audio.src = t.link;
        audio.load();
    };

    // Events
    win.querySelector('.close').onclick = () => { window.musique_show = 0; audio.pause(); };
    win.querySelector('.minimize').onclick = () => { window.musique_show = 0; };
    
    playBtn.onclick = () => {
        audio.paused ? audio.play() : audio.pause();
        playBtn.innerText = audio.paused ? '▶' : '⏸';
    };

    win.querySelector('#next-btn').onclick = () => {
        currentIndex = (currentIndex + 1) % playlist.length;
        load(currentIndex); audio.play(); playBtn.innerText = '⏸';
    };

    win.querySelector('#prev-btn').onclick = () => {
        currentIndex = (currentIndex - 1 + playlist.length) % playlist.length;
        load(currentIndex); audio.play(); playBtn.innerText = '⏸';
    };

    audio.ontimeupdate = () => {
        if (!isNaN(audio.duration)) {
            seekBar.value = (audio.currentTime / audio.duration) * 100;
            win.querySelector('#cur').innerText = Math.floor(audio.currentTime / 60) + ":" + ("0" + Math.floor(audio.currentTime % 60)).slice(-2);
            win.querySelector('#dur').innerText = Math.floor(audio.duration / 60) + ":" + ("0" + Math.floor(audio.duration % 60)).slice(-2);
        }
    };

    seekBar.oninput = () => audio.currentTime = (seekBar.value / 100) * audio.duration;
    audio.onended = () => win.querySelector('#next-btn').click();

    // Surveillance window.musique_show
    setInterval(() => {
        if (window.musique_show === 1) {
            if (win.style.display === 'none') {
                win.style.display = 'block';
                setTimeout(() => win.style.opacity = '1', 10);
            }
        } else {
            win.style.opacity = '0';
            setTimeout(() => { if(window.musique_show === 0) win.style.display = 'none'; }, 400);
        }
    }, 200);

    // Drag & Drop
    let isDragging = false, offset = [0,0];
    win.querySelector('.window-header').onmousedown = (e) => {
        isDragging = true;
        offset = [win.offsetLeft - e.clientX, win.offsetTop - e.clientY];
    };
    document.onmousemove = (e) => {
        if (isDragging) {
            win.style.left = (e.clientX + offset[0]) + 'px';
            win.style.top = (e.clientY + offset[1]) + 'px';
        }
    };
    document.onmouseup = () => isDragging = false;

    load(currentIndex);
})();