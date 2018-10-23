# Try to play the amen break N times, then breakdown
##| Not quite working yet
##| use_bpm 120
use_sample_bpm :loop_amen
define :breakdown do
  8.times do
    puts 'loop'
    n = 8
    s = rand_i n
    sample :loop_amen, slice: s, num_slices: n
    sleep 1.0/n
  end
end

define :amen do
  1.times do
    sample :loop_amen_full, sustain_level: 0.3
    sleep 4
  end
end
live_loop :beat_slicer do
  amen
  breakdown
end