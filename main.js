// 1. Render bài hát lên
// 2. Scroll scrollTop
// 3. Play / Pause / Tua
// 4. CD rotate 
// 5. Next / Prev
// 6. Random
// 7. Next / Repeat when ended
// 8. Active song
// 9. Active song into view

const $ = document.querySelector.bind(document)
const $$ = document.querySelectorAll.bind(document)

const PLAYER_SOTRAGE_KEY = 'NGOCHAI_PLAYERMUSIC'

const heading = $('header h2')
const cdThumb = $('.cd-thumb')
const audio = $('#audio')
const cd = $('.cd')
const playBtn = $('.btn-toggle-play')
const player = $('.player')
const progress = $('#progress')
const nextBtn = $('.btn-next')
const prevBtn = $('.btn-prev')
const randomBtn = $('.btn-random')
var count =0
var arrayTemp = []
const repeatBtn = $('.btn-repeat')
const playlist = $('.playlist') 

//console.log(prevBtn, nextBtn)
const app = {
    currentIndex: 0,
    isPlaying: false,
    isRandom: false,
    isRepeat: false,
    config: JSON.parse(localStorage.getItem(PLAYER_SOTRAGE_KEY)) || {},
    setConfig: function (key, value) {
        this.config[key] = value
        localStorage.setItem(PLAYER_SOTRAGE_KEY, JSON.stringify(this.config))
    },
    songs: [
        {
            name: 'Nevada',
            singer: 'Vicetone',
            path: './assets/music/song1.mp3',
            image: './assets/image/song1.png'
        },
        {
            name: 'Waiting For Love',
            singer: 'Avicii',
            path: './assets/music/song2.mp3',
            image: './assets/image/song2.png'
        },
        {
            name: 'Lemon Tree',
            singer: 'Fools Garden',
            path: './assets/music/song3.mp3',
            image: './assets/image/song3.png'
        },
        {
            name: 'Làm Người Luôn Yêu Em',
            singer: 'Sơn Tùng MTP',
            path: './assets/music/song4.mp3',
            image: './assets/image/song4.png'
        },
        {
            name: 'Lãng Du',
            singer: 'Tofu',
            path: './assets/music/song5.mp3',
            image: './assets/image/song5.png'
        },
        {
            name: 'Happy',
            singer: 'Pharrell Williams',
            path: './assets/music/song6.mp3',
            image: './assets/image/song6.png'
        },
        {
            name: 'Monsters',
            singer: 'Katie Sky',
            path: './assets/music/song7.mp3',
            image: './assets/image/song7.png'
        },
        {
            name: 'YoungDumbBroke ',
            singer: 'Khalid',
            path: './assets/music/song8.mp3',
            image: './assets/image/song8.png'
        },
        {
            name: 'Chơi',
            singer: 'HIEUTHUHAI',
            path: './assets/music/song9.mp3',
            image: './assets/image/song9.png'
        },
        {
            name: 'Sugar',
            singer: 'Maroon 5',
            path: './assets/music/song10.mp3',
            image: './assets/image/song10.png'
        },
    ],
    //render ra templates
    render: function () {
        const htmls = this.songs.map((song, index) => {
            //render list nhạc
            return `
                <div class="song ${index === this.currentIndex ? 'active' : ''}" data-index=${index}>
                    <div class="thumb" style="background-image: url('${song.image}')">
                    </div>
                    <div class="body">
                        <h3 class="title">${song.name}</h3>
                        <p class="author">${song.singer}</p>
                    </div>            
                </div>    
            `   
        })
        playlist.innerHTML = htmls.join('')
    },

    //Định nghĩa các thuộc tính cho object
    defindProperties: function () {
        Object.defineProperty(this, 'currentSong', {
            get: function () {
                return this.songs[this.currentIndex]
            }
        })
    },

    //lắng nghe xử lý các sự kiện
    handleEnvents: function () {
        const _this = this
        const cdWidth = cd.offsetWidth

        //xử lý cd quay và dừng cd
        const cdThumbAnimate = cdThumb.animate([
            {transform: 'rotate(360deg)'}
        ],{
            duration: 12000, // 12 seconds
            iterations: Infinity
        })

        cdThumbAnimate.pause()
        //xử lý phóng to thu nhỏ cd
        document.onscroll = function () {
            const scrollTop = window.scrollY || document.documentElement.scrollTop
            const newCdWidth = cdWidth - scrollTop
            cd.style.width = newCdWidth > 0 ? newCdWidth + 'px' : 0
            cd.style.opacity = newCdWidth / cdWidth
        }

        //xử lý khi click play
        playBtn.onclick = function() {
            if(_this.isPlaying){   
                audio.pause()
            }else{
                audio.play()
            }
        }

        //khi bài hát được play 
        audio.onplay = function() {
            _this.isPlaying = true
            player.classList.add('playing')
            cdThumbAnimate.play()
        }

        //khi bài hát bị pause
        audio.onpause = function() {
            _this.isPlaying = false
            player.classList.remove('playing')
            cdThumbAnimate.pause()
        }

        //khi tiến độ bài hát thay đổi khi
        audio.ontimeupdate = function() {
            //kiểm tra audio.duration khác NaN
            if(audio.duration){
                const progressPercent = Math.floor(audio.currentTime / audio.duration * 100)
                progress.value = progressPercent
            }
         
        }

        //xử lý khi tua
        progress.onchange = function(e) {
            const seekTime = audio.duration / 100 * e.target.value
            audio.currentTime = seekTime
        }

        //nút khi next bài hát
        nextBtn.onclick = function () {
            if(_this.isRandom){
                _this.playRandomSong()
            }else{
                _this.nextSong()
            }
            audio.play()
            _this.render()
            _this.scrollToAciveSong()
           
        }

        //nút khi prev bài hát
        prevBtn.onclick = function () {
            if(_this.isRandom){
                _this.playRandomSong()
            }else{
                _this.prevSong()
            }
            audio.play()
            _this.render()
            _this.scrollToAciveSong()
        }

        //nút random bật / tắt
        randomBtn.onclick = function () {
            _this.isRandom = !_this.isRandom
            _this.setConfig("isRandom", _this.isRandom)
            randomBtn.classList.toggle('active', _this.isRandom)
           
        }

        //Xử lý next song khi audio ended
        audio.onended = function () {
            if(_this.isRepeat){
                audio.play()
            }else{
                nextBtn.onclick()
            }
           
        }

        //xử lý lặp lại bài hát lặp
        repeatBtn.onclick= function (e) {
            _this.isRepeat = !_this.isRepeat
            _this.setConfig("isRepeat", _this.isRepeat)
            repeatBtn.classList.toggle('active', _this.isRepeat)
        }

        //lắng nghe khi click vào playlist
        playlist.onclick = function (e) {
            const songNode = e.target.closest('.song:not(.active)')
            const songoption = !e.target.closest('.option')
           if(songNode || songoption){
                if(songNode){
                    _this.currentIndex = Number(songNode.dataset.index)
                    _this.loadCurrentSong()
                    _this.render()
                    audio.play()
                }
           }
        }
    },

    //tải bài hát hiện tại lên UI khi chạy ứng dụng
    loadCurrentSong: function () {
        
        heading.textContent = this.currentSong.name + ' - ' + this.currentSong.singer
        cdThumb.style.backgroundImage = `url('${this.currentSong.image}')`
        audio.src = this.currentSong.path
    },

    //bài hát tiếp theo
    nextSong: function () {
        this.currentIndex++
        if(this.currentIndex >= this.songs.length){
            this.currentIndex = 0 
        }
        this.loadCurrentSong()
    },

    //bài hát phía trước
    prevSong: function () {
        this.currentIndex--
        if(this.currentIndex < 0){
            this.currentIndex = this.songs.length -1 
        }
        this.loadCurrentSong()
    },

    loadConfig : function () {
        this.isRandom = this.config.isRandom
        this.isRepeat = this.config.isRepeat

        randomBtn.classList.toggle('active', this.isRandom)
        repeatBtn.classList.toggle('active', this.isRepeat)

    },

    scrollToAciveSong: function () {
        setTimeout(() => {
            $('.song.active').scrollIntoView({
                behavior: 'smooth',
                block: 'center',
            })
        }, 200)
    }, 
    //random index song không trùng với bài đã phát
    playRandomSong: function () {
        let newIndex;
        newIndex = Math.floor(Math.random() * this.songs.length);
        
        if(count >0) {
            do {
                newIndex = Math.floor(Math.random() * this.songs.length);
                var isCheck = arrayTemp.includes(newIndex);
            }
            while(isCheck == true)
        }

        arrayTemp[count]=newIndex;
        //console.log(arrayTemp);
        this.currentIndex = newIndex;
        this.loadCurrentSong();
        if(count == this.songs.length-1)
        {
            arrayTemp=[];
            count=-1;
        }
        count++;
        
    },
    //hàm main của chương trình
    start: function () {
        this.loadConfig()
        this.defindProperties()
        this.handleEnvents()
        this.loadCurrentSong()
        this.render()
        
    }
}
app.start()