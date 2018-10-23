# Welcome to Sonic Pi v3.0.1

files_list =
  ["/home/pi/samples/Still_Time.wav",
   "/home/pi/samples/FIGHT.wav",
   "/home/pi/samples/Don't Give Up.wav"
   ]
  
in_thread(name: :cues) do
  loop do
    cue :drum_sync
    sleep 2
  end
end

live_loop :osc2 do
  use_synth :prophet
  use_real_time
  a = sync "/osc/trigger/prophet"
  play a, release: 0.3, sustain_level: 1.0, cutoff: rrand(60, 120)
  sleep 0.5
end


with_fx :echo, phase: 0.5, decay: 4, mix: 0.5 do
  live_loop :snippets do
    use_real_time
    index = sync "/osc/trigger/sample"
    sync :drum_sync
    sample files_list[index[0]]
  end
end

live_loop :synth do
  use_synth :prophet
  sync "/osc/trigger/synth"
  sync :drum_sync
  play choose(chord(:E3, :minor)), release: 0.3, sustain_level: 0.5, cutoff: rrand(60, 120)
  sleep 0.5
  play choose(chord(:E3, :minor)), release: 0.3, sustain_level: 0.5, cutoff: rrand(60, 120)
  sleep 0.5
  play choose(chord(:E3, :minor)), release: 0.3, sustain_level: 0.5, cutoff: rrand(60, 120)
  sleep 0.5
  play choose(chord(:E3, :minor)), release: 0.3, sustain_level: 0.5, cutoff: rrand(60, 120)
  sleep 0.5
end

set :drum_index, 0

live_loop :setter do
  drum_index = sync "/osc/trigger/drums"
  set :drum_index, drum_index[0]
  puts :drum_index
  sleep 1
end

in_thread(name: :beats) do
  loop do
    sync :drum_sync
    sample :loop_amen_full, num_slices: 4, slice: get[:drum_index], sustain_level: 0.3, beat_stretch: 8
    set :drum_index, 0
  end
end
