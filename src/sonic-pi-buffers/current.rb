# Welcome to Sonic Pi v3.0.1
use_bpm 120
in_thread(name: :cues) do
  loop do
    cue :beat_sync
    sleep 1
  end
end


with_fx :echo, phase: 0.25, decay: 2, mix: 0.2 do
  live_loop :snippets do
    use_real_time
    file = sync "/osc/trigger/sample"
    sync :beat_sync
    sample file
  end
end

live_loop :synth do
  use_synth :prophet
  sync "/osc/trigger/prophet"
  sync :beat_sync
  play choose(chord(:E3, :minor)), release: 0.3, sustain_level: 0.5, cutoff: rrand(60, 120)
  sleep 0.5
  play choose(chord(:E3, :minor)), release: 0.3, sustain_level: 0.5, cutoff: rrand(60, 120)
  sleep 0.5
  play choose(chord(:E3, :minor)), release: 0.3, sustain_level: 0.5, cutoff: rrand(60, 120)
  sleep 0.5
  play choose(chord(:E3, :minor)), release: 0.3, sustain_level: 0.5, cutoff: rrand(60, 120)
  sleep 0.5
end

define :scanner_synth do
  puts 'scanner_synth'
  play :f1, cutoff: 100, release: 7, attack: 1, cutoff_attack: 32, cutoff_release: 4
  sleep 32
end

c = 30
inc = true

define :squelch_synth do
  64.times do
    n = (ring :f1, :f2, :f3).tick
    play n, release: 0.125, cutoff_attack: 0.1, cutoff: c, res: 0.8, wave: 1
    if inc
      c += 1
      if c == 120
        inc = false
      end
    else
      c -= 1
      if c == 30
        inc = true
      end
    end
    sleep 0.25
  end
end


with_fx :reverb, room: 1 do
  live_loop :space_scanner do
    use_synth :tb303
    sync "/osc/trigger/synth/space_scanner"
    sync :beat_sync
    scanner_synth
  end
  live_loop :squelch do
    use_synth :tb303
    sync "/osc/trigger/synth/squelch"
    sync :beat_sync
    squelch_synth
  end
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
    sample :loop_amen_full, num_slices: 4, slice: get[:drum_index], sustain_level: 0.3, beat_stretch: 16
    set :drum_index, 0
    sleep 4
  end
end
