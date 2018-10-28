# Nice sweepy effected noise layers.
min=40
max=120
c=min
sweep_up=true

define :make_noise do
  use_synth :hoover
  ##| use_synth :dsaw
  play :Bb2, wave: 1, cutoff: c, res: 0.7, amp: 0.5
  if sweep_up
    c += 1
    if c == max
      sweep_up = false
    end
  else
    c -=1
    if c == min
      sweep_up = true
    end
  end
  sleep 0.25
end

with_fx :whammy, transpose: -12, deltime: 0.2, grainsize: 0.5, amp: 0.5 do |e|
  live_loop :noise do
    make_noise
  end
end