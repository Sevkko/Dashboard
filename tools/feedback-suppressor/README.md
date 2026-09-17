# Live-Feedback-Suppressor

Live-Tool, das Mikrofon-/Line-Eingang in Echtzeit auf akustische
Rueckkopplung (Feedback/Larsen-Effekt) ueberwacht und betroffene Frequenzen
automatisch per Notch-Filter unterdrueckt, waehrend das Signal live an das
Ausgabegeraet weitergereicht wird.

Basiert auf einem Offline-Proof-of-Concept, das Feedback anhand von
Frequenzbins erkennt, deren Pegel ueber mehrere aufeinanderfolgende
Analyse-Bloecke kontinuierlich ansteigt (typisches Feedback-Verhalten, im
Gegensatz zu normalen Musik-/Sprach-Peaks). Diese Version macht daraus ein
eigenstaendiges Echtzeit-Programm.

## Installation

```bash
cd tools/feedback-suppressor
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
```

`sounddevice` benoetigt die PortAudio-Systembibliothek (unter Debian/Ubuntu
z. B. `sudo apt install libportaudio2`).

## Nutzung

Verfuegbare Audiogeraete anzeigen:

```bash
python feedback_suppressor.py --list-devices
```

Mit Standardgeraeten starten:

```bash
python feedback_suppressor.py
```

Mit bestimmten Geraeten (Name oder Index aus `--list-devices`):

```bash
python feedback_suppressor.py --input-device "USB Audio" --output-device "USB Audio"
```

**Wichtig zum Testen:** Beim ersten Ausprobieren unbedingt Kopfhoerer am
Ausgabegeraet verwenden bzw. die Lautstaerke niedrig halten, um echtes
Feedback (Mikrofon -> Lautsprecher -> Mikrofon) zu vermeiden, solange die
Erkennung noch nicht getestet ist.

## Funktionsweise

- Der Audio-Callback laeuft mit kleiner Blockgroesse (`--callback-blocksize`,
  Default 256 Samples) fuer niedrige Latenz und wendet nur die bereits
  aktiven Notch-Filter an.
- Ein separater Analyse-Thread sammelt die Rohdaten zu groesseren FFT-
  Bloecken (`--fft-blocksize`, Default 2048) und prueft je Frequenzbin, ob
  der Pegel ueber ein Zeitfenster (`--rise-window`, Default 1.0 s) hinweg um
  mehr als `--rise-threshold-db` (Default 8 dB) nahezu monoton ansteigt und
  am Fensterende ueber `--prominence-db` liegt.
- Wird ein Kandidat erkannt, wird die Mittenfrequenz per parabolischer
  Interpolation verfeinert und ein schmaler IIR-Notch-Filter
  (`--notch-q`, Default 25) aktiviert. Aktive Filter bleiben fuer die Dauer
  der Sitzung bestehen (maximal `--max-notches`, Default 6, gleichzeitig).

Alle Schwellwerte sind ueber CLI-Argumente einstellbar, siehe
`python feedback_suppressor.py --help`.

## Grenzen

- Es wird nur der erste Kanal des Eingangs analysiert (Mono-Erkennung).
- Einmal aktivierte Notch-Filter werden nicht automatisch wieder entfernt
  (kein "Release"); das entspricht dem einfachen, robusten Verhalten des
  urspruenglichen Proof-of-Concept.
- Die Erkennung ist auf Frequenzen ab `--min-freq` (Default 200 Hz)
  beschraenkt, da tiefe Frequenzen selten typisches Feedback darstellen.
