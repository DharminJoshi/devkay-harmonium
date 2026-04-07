# 🎹 DevKay Harmonium

**DevKay Harmonium** is a powerful, browser-based virtual harmonium designed for Indian classical music practice, performance, and experimentation. It combines traditional concepts like **Raag**, **Taal**, and **Shruti tuning** with modern features like **MIDI export**, **audio recording**, and **real-time pitch detection**.

---

## ✨ Features

### 🎼 Core Instrument

* Real harmonium sample playback (pitch-shifted)
* Sustain loop for continuous notes
* Adjustable:

  * Volume
  * Reverb
  * Sustain length

---

### 🎹 Scale & Tuning System

* Select **Sa (root note)** across all 12 semitones
* Adjustable **root octave (2–6)**
* Fine-tune pitch (± semitones)
* Multiple **tuning temperaments**:

  * Equal (12-TET)
  * Just Intonation
  * Pythagorean
  * Meantone (¼-comma)
  * Shruti (22 microtones – Indian classical)

---

### 🎵 Raag System

* Predefined raags with:

  * Allowed notes
  * Vadi (primary note)
  * Samvadi (secondary note)
* **Raag restriction mode** (limits playable notes)
* Dynamic raag info display
* “Raag of the Hour” suggestion

---

### 🪕 Drone

* Toggle **Sa–Pa–Sa drone**
* Helps maintain pitch reference while practicing

---

### 🎚 Reed & Sound Design

Simulates harmonium reed behavior:

* Main / Chorus / Bass reeds
* Chime effect toggle
* Brightness control
* Chorus depth
* Tremolo (depth + rate)
* Sub-octave bass

---

### 🎛 Harmonic Overtone Mixer

* Additive synthesis control
* Adjust individual harmonics
* Presets:

  * Natural
  * Bright
  * Mellow
  * Organ
  * Flute

---

### 🎤 Pitch Detection

* Real-time microphone input
* Detects sung/hummed pitch
* Displays nearest note

---

### 🎧 Recorder

* Record live performance
* Playback recording
* Clear session

#### Export Options:

* JSON (session data)
* MIDI (for DAWs)
* WAV (lossless audio)
* MP3/WebM (compressed)

---

### 🧠 Practice Mode

* Built-in lessons
* Guided hints
* Progress tracking (score %)
* Step-by-step learning

---

### 🪘 Taal Metronome

Supports common taals:

* Teentaal (16)
* Ektaal (12)
* Jhaptaal (10)
* Keherwa (8)
* Rupak (7)
* Dadra (6)

Features:

* BPM control (30–240)
* Visual beat indicators:

  * Sam (first beat)
  * Khali (empty beat)
  * Regular beats

---

### 🎼 Performance Modes

Simulates classical progression:

* 🌅 **Alap** – free, slow, exploratory
* 🌊 **Jod** – introduces pulse
* ⚡ **Jhala** – fast, rhythmic intensity

---

### 📊 Visualizations

* Real-time waveform display
* Piano roll recording view
* Active note + sargam display

---

### 💾 Session Management

* Save entire session locally:

  * Settings
  * Raag
  * Recordings
* Reload anytime

---

### 🎹 Keyboard Mapping

#### White Keys

| Key | Note |
| --- | ---- |
| `   | B    |
| Q   | Sa   |
| W   | Re   |
| E   | Ga   |
| R   | Ma   |
| T   | Pa   |
| Y   | Dha  |
| U   | Ni   |
| I   | Sa'  |

#### Black Keys

| Key | Note      |
| --- | --------- |
| 1   | komal Re  |
| 2   | komal Ga  |
| 4   | tivra Ma  |
| 5   | komal Dha |
| 7   | komal Ni  |

---

## 🚀 Getting Started

### 1. Clone or Download

```bash
git clone https://github.com/DharminJoshi/devkay-harmonium.git
cd devkay-harmonium
```

### 2. Open in Browser

Simply open:

```
index.html
```

> No build step required. Fully client-side.

---

## 🔊 Audio Initialization

Due to browser autoplay policies:

* Click **“Initialise Audio”** before playing
* This activates the Web Audio API

---

## 🧰 Tech Stack

* **HTML5 / CSS3**
* **Vanilla JavaScript**
* **Web Audio API**
* Canvas API (visualizations)

---

## ⚙️ Audio Engine Details

* Base sample: Harmonium recording at **D3 (~147 Hz)**
* Pitch shifting via:

  ```js
  playbackRate
  ```
* Loop region:

  * Start: 7.2s
  * End: 9.2s
* Additive synthesis layered on top
* Temperament offsets applied in **cents**

---

## 📁 File Structure

```
/project-root
│
├── index.html      # Main UI layout
├── styles.css      # Styling and layout
├── app.js          # Core logic and audio engine
└── README.md       # Documentation
```

---

## 🧪 Use Cases

* Indian classical practice (vocal/instrumental)
* Ear training
* Composition & experimentation
* Teaching tool
* MIDI sketching for DAWs

---

## ⚠️ Limitations

* Requires modern browser (Chrome recommended)
* Microphone access needed for pitch detection
* Performance depends on device CPU
* Audio latency varies per system

---

## 🔮 Future Improvements

* More raags & lessons
* Recording timeline editing
* Multi-track layering
* Mobile UI optimization
* Cloud session sync
* MIDI input support (external keyboards)

---

## 🙌 Credits

* Inspired by Indian classical music traditions
* Built using Web Audio experimentation

---

## ⚖️ License

This project is licensed under the **CC BY-NC 4.0**  License.  
See the [LICENSE](LICENSE) file for full details.

---

## 📬 Contact

- **Developer:** Dharmin Joshi / DevKay  
- **Email:** info.dharmin@gmail.com  
- **LinkedIn:** [linkedin.com/in/dharmin-joshi-3bab42232](https://www.linkedin.com/in/dharmin-joshi-3bab42232/)  
- **GitHub:** [github.com/DharminJoshi](https://github.com/DharminJoshi)  

---

## ❤️ Final Note

DevKay Harmonium is designed to bridge **tradition and technology**—bringing the soul of Indian classical music into a modern interactive experience.

