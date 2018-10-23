# Dirty reverby darkness
c=30
dir=true
with_fx :reverb, room: 1.0, mix: 0.8 do
  ##| with_fx :gverb, release: 2 do
  live_loop :timbre do
    use_synth :hoover
    play :e2, attack: 0, sustain: 4, sustain_level: 1.0,
      release: 4,
      cutoff: c, res: 0.9
    if dir
      c += 1
      if c== 120
        dir=false
      end
    else
      c -=1
      if c==30
        dir=true
      end
    end
    sleep 0.125
  end
end