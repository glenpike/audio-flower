# Bell / hum and sweeping noise.
min=30
max=120
c=min
dir=true
with_fx :gverb, release: 2 do
  ##| with_fx :flanger, phase: 4, delay: 3, depth: 10, mix: 0.8 do
  notes = (scale :Bb1, :melodic_minor).shuffle
  live_loop :bell do
    use_synth :pretty_bell
    play notes.tick, attack: 0.05, sustain: 4, sustain_level: 0.9,
      release: 4
    sleep 0.25
  end
  live_loop :noise do
    use_synth :pnoise
    play :Bb1, cutoff: c
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