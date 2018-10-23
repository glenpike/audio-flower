# Didjeridoo-ish
# Not sure whether to keep the bell synth?
min=30
max=120
c=min
dir=true
with_fx :gverb, release: 1 do
  ##| with_fx :flanger, phase: 4, delay: 3, depth: 10, mix: 0.8 do
  notes = (scale :Bb1, :major_pentatonic).shuffle
  live_loop :bell do
    use_synth :mod_tri
    ##| play notes.tick, attack: 1, sustain: 1, sustain_level: 0.7,
    ##|   release: 1
    sleep 0.5
  end
  live_loop :noise do
    use_synth :mod_pulse
    play :Bb1, cutoff: c, mod_range: 1, mod_wave: 3
    if dir
      c += 1
      if c==max
        dir=false
      end
    else
      c -=1
      if c==min
        dir=true
      end
    end
    sleep 0.125
  end
  ##| end
end