/**
 * ready
 *
 * Function to call when the DOM is ready
 * Example: ready(() => { do_stuff() });
 */
const ready = (fn) => {
    if (document.readyState != "loading") fn();
    else document.addEventListener("DOMContentLoaded", fn);
};

const App = {
    files: [
        '001-beginning-looped.mp3',
        '002-white-mountain-looped.mp3',
        '003-dusk-looped.mp3',
        '004-salmacis-looped.mp3',
        '005-suppers-ready-looped.mp3',
        '006-wardrobe-looped.mp3',
        '007-fly-looped.mp3',
        '008-waiting-room-looped.mp3',
        '009-slippermen-looped.mp3',
        '010-ravine-looped.mp3',
        '011-ripples-looped.mp3',
        '012-unquiet-slumbers-looped.mp3',
        '013-down-and-out-looped.mp3',
        '014-duchess-looped.mp3',
        'moonlight-knight-outro.mp3',
    ],
    fade_in_dur: 10000,
    fade_out_dur: 5000,
    vol_sync_interval: 100,
    next_sound_interval: 22000,
    sounds: [],
    play_heads: [],
    init: function() {
        this.make_arena();
        this.load_sounds();
        this.make_sounds();
        this.bind();
        this.start_volume_sync();
        this.inited = true;
    },
    make_arena: function() {
        const app = document.getElementById('app');
        app.innerHTML = `<div id="sounds"></div>
        <div id="ctrls">
            <button id="start">Play</button>
            <button id="stop">Stop</button>
        </div>`;
    },
    load_sounds: function() {
        this.files.forEach((item, i) => {
            const audio = new Howl({src: [`audio/${item}`], volume: 0.0, loop: true});
            audio.index = i;
            audio.is_fading_in = false;
            audio.is_fading_out = false;
            this.sounds.push(audio);
        });
    },
    make_sounds: function() {
        const ctr = document.getElementById('sounds');
        this.sounds.forEach((item, i) => {
            ctr.innerHTML += `<div class="audio">
            <input type="range" id="vol_${i}" name="vol_${i}" min="0" max="1" step="0.01" value="0" disabled="disabled" />
            <button class="btn" id="btn_${i}" data-index="${i}">${i}</button>
            </div>`;
        });
    },
    bind: function() {
        document.querySelectorAll('.btn').forEach((el) => {
            el.addEventListener('click', (e) => {
                this.toggle_sound(e.target.getAttribute('data-index'));
            });
        });
        document.getElementById('start').addEventListener('click', (e) => {
            this.start_playlist();
        });
        document.getElementById('stop').addEventListener('click', (e) => {
            this.stop_playlist();
        });
    },
    start_volume_sync: function() {
        if (this._interval) {
            return; // already started
        }
        this._interval = setInterval(() => {
            this.sync_all();
        }, this.vol_sync_interval);
    },
    toggle_sound: function(index) {
        const sound = this.sounds[index];
        if (sound.playing() || sound.is_fading_in) {
            this.fade_out(sound);
        } else {
            this.fade_in(sound);
        }
    },
    pick_random: function(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min) + min);
    },
    pick_random_sound_id: function() {
        var picked = this.pick_random(0, this.sounds.length);
        while (app.play_heads.indexOf(picked) > -1) {
            picked = this.pick_random(0, this.sounds.length);
        }
        return picked;
    },
    start_playlist: function() {
        this.play_heads = [];
        this.play_heads.push(this.pick_random_sound_id());
        this.play_heads.push(this.pick_random_sound_id());
        this.play_heads.forEach((id) => {
            this.toggle_sound(id);
        });
        this.trigger_next();
    },
    stop_playlist: function() {
        this.fade_out_all();
        this.play_heads = [];
        if (this.playlist_timer) {
            clearTimeout(this.playlist_timer);
        }
    },
    continue_playlist: function() {
        // Add in a third sound
        const s3 = this.pick_random_sound_id();
        this.play_heads.push(s3);
        this.toggle_sound(s3);

        // Fade out the oldest sound
        const s1 = this.play_heads.shift();
        this.toggle_sound(s1);

        this.trigger_next();
    },
    trigger_next: function() {
        if (this.playlist_timer) {
            clearTimeout(this.playlist_timer);
        }
        // After an interval of time, pick another sound
        this.playlist_timer = setTimeout(() => {
            this.continue_playlist();
        }, this.next_sound_interval);
    },
    fade_in: function(sound) {
        sound.off('fade');
        if (!sound.playing()) {
            sound.play();
        }
        sound.is_fading_in = true;
        sound.is_fading_out = false;
        sound.fade(sound.volume(), 0.8, this.fade_in_dur);
        sound.on('fade', function() {
            this.is_fading_in = false;
        });
    },
    fade_out: function(sound) {
        sound.off('fade');
        sound.is_fading_in = false;
        sound.is_fading_out = true;
        sound.fade(sound.volume(), 0, this.fade_out_dur);
        sound.on('fade', function() {
            this.pause();
            this.is_fading_out = false;
        });
    },
    fade_out_all: function() {
        this.sounds.forEach((item, i) => {
            if (item.playing()) {
                this.fade_out(item);
            }
        });
    },
    sync_all: function() {
        this.sounds.forEach((item, i) => {
            this.sync_volume(i);
        });
    },
    sync_volume: function(index) {
        document.getElementById('vol_' + index).value = this.sounds[index].volume();
    }
}

ready(() => {
    function init() {
        App.init();
        document.removeEventListener('click', init);
    }
    document.addEventListener('click', init);

    window.app = App;
});
