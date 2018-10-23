# Playing with ambient sounds...
# Maybe add some sub-bass in the background?
notes = (ring :C3, :Eb3, :F3, :Fs3).shuffle
live_loop :timbre do
  use_synth :dark_ambience
  n = notes.tick
  set :n, n
  play n, attack: 0, sustain: 8, sustain_level: 1.0,
    release: 8,
    cutoff: 130, ring: 0.6, res: 0.9,
    detune1: 12
  sleep 16
end

live_loop :bass do
  use_synth :supersaw
  play notes.tick - 12, attack: 1, sustain: 8, sustain_level: 0.9,
    release: 32, cutoff: 60, amp: 0.5
  sleep 16
end