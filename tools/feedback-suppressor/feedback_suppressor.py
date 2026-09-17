"""
Live-Feedback-Erkennung und -Unterdrueckung (Echtzeit)
=======================================================

Nimmt Audio von einem Eingabegeraet (Mikrofon/Interface) entgegen, erkennt
Rueckkopplungen (Larsen-Effekt) anhand von Frequenzbins mit kontinuierlich
ansteigendem Pegel und unterdrueckt sie automatisch per Notch-Filter, noch
waehrend das Signal live an das Ausgabegeraet weitergereicht wird.

Architektur:
- Der Audio-Callback (sounddevice) laeuft mit kleiner Blockgroesse fuer
  niedrige Latenz. Er wendet nur die bereits aktiven Notch-Filter an und
  reicht ungefiltertes Audio zusaetzlich an einen Analyse-Thread weiter.
- Ein separater Analyse-Thread sammelt die Rohdaten zu groesseren Bloecken,
  berechnet daraus per FFT ein Spektrum und prueft, ob einzelne Frequenz-
  bins ueber ein Zeitfenster hinweg deutlich und nahezu monoton ansteigen
  (typisches Feedback-Verhalten, im Gegensatz zu Sprach-/Musik-Peaks).
- Wird ein Kandidat erkannt, aktiviert der Analyse-Thread thread-sicher
  einen neuen schmalen Notch-Filter bei genau dieser Frequenz, den der
  Audio-Callback ab dem naechsten Block mitverwendet.

Benoetigt: numpy, scipy, sounddevice
"""

import argparse
import queue
import sys
import threading
import time
from collections import deque

import numpy as np
import sounddevice as sd
from scipy.signal import iirnotch, lfilter


class NotchFilter:
    """Ein einzelner IIR-Notch-Filter mit persistentem Zustand (zi) fuer
    nahtlose Verarbeitung ueber aufeinanderfolgende Audio-Bloecke hinweg."""

    def __init__(self, freq, fs, q):
        self.freq = freq
        self.b, self.a = iirnotch(freq / (fs / 2), q)
        self.zi = np.zeros(max(len(self.a), len(self.b)) - 1)

    def process(self, block):
        out, self.zi = lfilter(self.b, self.a, block, zi=self.zi)
        return out


class FeedbackSuppressor:
    def __init__(self, fs, fft_blocksize, hop_size, rise_window_sec,
                 rise_threshold_db, prominence_db, min_freq_hz, notch_q,
                 max_notches):
        self.fs = fs
        self.fft_blocksize = fft_blocksize
        self.hop_size = hop_size
        self.min_freq_hz = min_freq_hz
        self.rise_threshold_db = rise_threshold_db
        self.prominence_db = prominence_db
        self.notch_q = notch_q
        self.max_notches = max_notches

        self.freqs = np.fft.rfftfreq(fft_blocksize, d=1.0 / fs)
        self.bin_width = self.freqs[1] - self.freqs[0]
        self.window = np.hanning(fft_blocksize)

        frame_step_sec = hop_size / fs
        self.rise_frames = max(3, int(round(rise_window_sec / frame_step_sec)))
        self.history = deque(maxlen=self.rise_frames)

        self._filters_lock = threading.Lock()
        self._active_filters = []
        self._active_freqs = []

        self._analysis_buffer = np.zeros(0, dtype=np.float32)

    # -- Analyse (laeuft im Analyse-Thread) ---------------------------------
    def feed_for_analysis(self, samples):
        self._analysis_buffer = np.concatenate([self._analysis_buffer, samples])
        while len(self._analysis_buffer) >= self.fft_blocksize:
            block = self._analysis_buffer[: self.fft_blocksize]
            self._analysis_buffer = self._analysis_buffer[self.hop_size :]
            self._analyze_block(block)

    def _analyze_block(self, block):
        spec = np.fft.rfft(block * self.window)
        mag_db = 20 * np.log10(np.abs(spec) + 1e-10)
        self.history.append(mag_db)
        if len(self.history) < self.rise_frames:
            return

        window = np.array(self.history)  # (rise_frames, n_freqs)
        start_level = window[0]
        end_level = window[-3:].mean(axis=0)
        rise = end_level - start_level
        monotonic_ratio = (np.diff(window, axis=0) > -0.5).mean(axis=0)

        candidate_mask = (
            (self.freqs >= self.min_freq_hz)
            & (rise > self.rise_threshold_db)
            & (end_level > self.prominence_db)
            & (monotonic_ratio > 0.8)
        )
        candidate_idx = np.where(candidate_mask)[0]
        if len(candidate_idx) == 0:
            return

        with self._filters_lock:
            active_freqs = list(self._active_freqs)
        candidate_idx = [
            i
            for i in candidate_idx
            if not any(abs(self.freqs[i] - f) < 2 * self.bin_width for f in active_freqs)
        ]
        if not candidate_idx:
            return

        best_idx = max(candidate_idx, key=lambda i: end_level[i])
        freq = self._refine_frequency(window[-1], best_idx)
        self._activate_notch(freq, end_level[best_idx], rise[best_idx])

    def _refine_frequency(self, mag_db_frame, idx):
        # Parabolische Interpolation um den Ziel-Bin fuer eine praezisere
        # Notch-Mittenfrequenz, als es die reine FFT-Aufloesung erlaubt.
        if 0 < idx < len(self.freqs) - 1:
            alpha, beta, gamma = (
                mag_db_frame[idx - 1],
                mag_db_frame[idx],
                mag_db_frame[idx + 1],
            )
            denom = alpha - 2 * beta + gamma
            p = 0.5 * (alpha - gamma) / denom if denom != 0 else 0.0
            return self.freqs[idx] + p * self.bin_width
        return self.freqs[idx]

    def _activate_notch(self, freq, level_db, rise_db):
        with self._filters_lock:
            if len(self._active_filters) >= self.max_notches:
                print(
                    f"[Warnung] Maximale Anzahl Notch-Filter ({self.max_notches}) "
                    f"erreicht, ignoriere {freq:.1f} Hz.",
                    file=sys.stderr,
                )
                return
            self._active_filters.append(NotchFilter(freq, self.fs, self.notch_q))
            self._active_freqs.append(freq)
        print(
            f"[Feedback erkannt] {freq:8.1f} Hz  "
            f"(Pegel {level_db:5.1f} dB, Anstieg {rise_db:4.1f} dB ueber "
            f"{self.rise_frames} Frames) -> Notch-Filter aktiviert."
        )

    # -- Filterung (laeuft im Audio-Callback) -------------------------------
    def apply_filters(self, block):
        with self._filters_lock:
            filters = list(self._active_filters)
        out = block
        for f in filters:
            out = f.process(out)
        return out

    def active_notch_count(self):
        with self._filters_lock:
            return len(self._active_filters)


def list_devices():
    print(sd.query_devices())


def build_stream(args, suppressor, analysis_queue):
    def callback(indata, outdata, frames, time_info, status):
        if status:
            print(status, file=sys.stderr)

        mono_in = indata[:, 0].astype(np.float32, copy=True)
        filtered = suppressor.apply_filters(mono_in)

        for ch in range(outdata.shape[1]):
            outdata[:, ch] = filtered

        try:
            analysis_queue.put_nowait(mono_in)
        except queue.Full:
            # Analyse-Thread haengt hinterher: lieber Analyse-Samples
            # verwerfen als den Echtzeit-Audiopfad zu blockieren.
            pass

    return sd.Stream(
        samplerate=args.samplerate,
        blocksize=args.callback_blocksize,
        channels=(args.channels, args.channels),
        dtype="float32",
        device=(args.input_device, args.output_device),
        callback=callback,
        latency=args.latency,
    )


def parse_args():
    parser = argparse.ArgumentParser(
        description="Live-Erkennung und automatische Unterdrueckung von akustischer "
        "Rueckkopplung (Feedback/Larsen-Effekt)."
    )
    parser.add_argument("--list-devices", action="store_true", help="Verfuegbare Audiogeraete auflisten und beenden.")
    parser.add_argument("--input-device", type=str, default=None, help="Name oder Index des Eingabegeraets.")
    parser.add_argument("--output-device", type=str, default=None, help="Name oder Index des Ausgabegeraets.")
    parser.add_argument("--samplerate", type=int, default=44100, help="Samplerate in Hz (Default: 44100).")
    parser.add_argument("--channels", type=int, default=1, help="Anzahl Kanaele (Default: 1 = mono).")
    parser.add_argument("--latency", type=str, default="low", help="'low', 'high' oder Sekunden als Zahl (Default: low).")
    parser.add_argument("--callback-blocksize", type=int, default=256, help="Blockgroesse des Audio-Callbacks (Latenz). Default: 256.")
    parser.add_argument("--fft-blocksize", type=int, default=2048, help="FFT-Blockgroesse fuer die Analyse. Default: 2048.")
    parser.add_argument("--hop-size", type=int, default=1024, help="Hop-Size zwischen Analyse-Bloecken. Default: 1024.")
    parser.add_argument("--rise-window", type=float, default=1.0, help="Zeitfenster (s) fuer den Anstiegs-Check. Default: 1.0.")
    parser.add_argument("--rise-threshold-db", type=float, default=8.0, help="Mindestanstieg (dB) im Zeitfenster. Default: 8.0.")
    parser.add_argument("--prominence-db", type=float, default=-30.0, help="Mindestpegel (dB) am Fensterende. Default: -30.0.")
    parser.add_argument("--min-freq", type=float, default=200.0, help="Ignoriert Frequenzen unterhalb (Hz). Default: 200.")
    parser.add_argument("--notch-q", type=float, default=25.0, help="Guete des Notch-Filters. Default: 25.")
    parser.add_argument("--max-notches", type=int, default=6, help="Maximale Anzahl gleichzeitig aktiver Notch-Filter. Default: 6.")
    return parser.parse_args()


def resolve_device(value):
    if value is None:
        return None
    try:
        return int(value)
    except ValueError:
        return value


def main():
    args = parse_args()

    if args.list_devices:
        list_devices()
        return

    args.input_device = resolve_device(args.input_device)
    args.output_device = resolve_device(args.output_device)
    try:
        args.latency = float(args.latency)
    except ValueError:
        pass  # bleibt 'low'/'high' als String

    suppressor = FeedbackSuppressor(
        fs=args.samplerate,
        fft_blocksize=args.fft_blocksize,
        hop_size=args.hop_size,
        rise_window_sec=args.rise_window,
        rise_threshold_db=args.rise_threshold_db,
        prominence_db=args.prominence_db,
        min_freq_hz=args.min_freq,
        notch_q=args.notch_q,
        max_notches=args.max_notches,
    )

    analysis_queue = queue.Queue(maxsize=200)
    stop_event = threading.Event()

    def analysis_worker():
        while not stop_event.is_set():
            try:
                samples = analysis_queue.get(timeout=0.5)
            except queue.Empty:
                continue
            suppressor.feed_for_analysis(samples)

    worker = threading.Thread(target=analysis_worker, daemon=True)
    worker.start()

    stream = build_stream(args, suppressor, analysis_queue)

    print("Live-Feedback-Unterdrueckung gestartet.")
    print(f"  Eingabe:  {args.input_device if args.input_device is not None else '(Standard)'}")
    print(f"  Ausgabe:  {args.output_device if args.output_device is not None else '(Standard)'}")
    print(f"  Samplerate: {args.samplerate} Hz, Callback-Block: {args.callback_blocksize}")
    print("  Strg+C zum Beenden.\n")

    try:
        with stream:
            while True:
                time.sleep(0.2)
    except KeyboardInterrupt:
        print("\nBeende...")
    finally:
        stop_event.set()
        worker.join(timeout=1.0)
        print(f"Insgesamt {suppressor.active_notch_count()} Notch-Filter aktiv gewesen.")


if __name__ == "__main__":
    main()
