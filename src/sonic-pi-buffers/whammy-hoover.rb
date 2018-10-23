# Nice sweepy effected noise layers.
min=30
max=120
c=min
dir=true
with_fx :whammy, transpose: -12, deltime: 0.2, grainsize: 0.5 do |e|
  live_loop :noise do
    use_synth :hoover
    play :Bb2, cutoff: c, res: 0.7
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
end