# Welcome to Sonic Pi v3.1
# Playing with ambient sounds...
# Maybe add some sub-bass in the background?
live_loop :timbre do
  use_synth :dark_ambience
  play :e3, attack: 0, sustain: 8, sustain_level: 1.0,
    release: 8,
    cutoff: 130, ring: 0.6, res: 0.9,
    detune1: 12
  sleep 16
end