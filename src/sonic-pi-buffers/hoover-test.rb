use_bpm 120
notes = (scale :c3, :blues_major)

s = synth :hoover, note: :c3, sustain: 80, sustain_level: 1.0
define :synth_noise do
  control s, note: choose(notes)
  control s, cutoff: rrand(60, 120)
  sleep 0.25
end

in_thread(name: :cues) do
  loop do
    synth_noise
  end
end

