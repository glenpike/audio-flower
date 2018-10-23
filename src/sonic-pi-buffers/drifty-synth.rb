# Welcome to Sonic Pi v3.1
# Nice trancy synth sound with sweeping cutoff
c=30
dir=true
with_fx :reverb do
  live_loop :random_riff do
    use_synth :supersaw
    use_random_seed 30
    notes = (scale :e3, :minor_pentatonic).shuffle
    16.times do
      play notes.tick, pulse_width: 0.3, sustain: 0.9, release: 0.5, cutoff: c, wave: 0 if one_in(2)
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
end