use_osc "localhost", 57122

# Fix your keys / chords, or separate into different people?

bpm_multiplier=4
use_bpm 30 * bpm_multiplier

in_thread(name: :cues) do
  loop do
    ##| cue :beat_sync
    sleep 1
  end
end

load_samples "ambi_"
define :ambient do |index|
  sample "ambi_", index, rate: 0.5, attack: (10), amp:0.75
  sleep (sample_duration "ambi_", index)
end

##| Melodic sounds
define :slo_bells do
  use_bpm 60
  with_fx :hpf, cutoff: 70 do
    notes = (scale :Bb1, :melodic_minor).shuffle
    64.times do
      use_synth :pretty_bell
      play notes.tick, attack: 0.1, sustain: 1, sustain_level: 0.6,
        release: 2, amp: 0.5
      sleep 0.25
    end
  end
end

define :tri_me do
  use_bpm 60
  notes = (scale :Bb4, :major_pentatonic).shuffle
  32.times do
    use_synth :mod_tri
    play notes.tick, attack: 1, sustain: 1, sustain_level: 0.4,
      release: 1, amp: 0.1
    sleep 0.5
  end
end

define :strings do
  use_bpm 60
  use_synth :dsaw
  notes = (scale :f5, :minor_pentatonic).shuffle
  4.times do
    n = notes.tick
    ##| Plays chords because we are ticking through for 2nd sound!
    play n, attack: 1, release: 1, amp: 0.1
    play notes.tick - 12, detune: 5, attack: 1, release: 1, amp: 0.1
    play n - 48, detune: 0.1, attack: 1, release: 1, amp: 0.1
    sleep 4
  end
end

##| Sweepy sounds
define :sweep do |sweep|
  use_bpm 60
  c = 30
  dir = true
  if sweep == 'trance'
    use_synth :supersaw
    use_random_seed 30
    notes = (scale :e3, :minor_pentatonic).shuffle
    sleep_time = 0.125
  end
  if sweep == 'squelch'
    use_synth :tb303
    notes = ring :f1, :f2, :f3
    sleep_time = 0.25
  end
  8.times do
    16.times do
      if sweep == 'trance'
        play notes.tick, pulse_width: 0.3, sustain: 0.7, sustain_level: 0.3, release: 0.3, cutoff: c, res: 0.2, wave: 0, amp: 0.3 if one_in(2)
      end
      if sweep == 'squelch'
        play notes.tick, release: 0.125, cutoff_attack: 0.1, cutoff: c, res: 0.8, wave: 1, amp: 0.3
      end
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

define :space_scanner do
  use_synth :tb303
  play :f1, cutoff: 100, release: 7, attack: 1, cutoff_attack: 32, cutoff_release: 4, amp:0.2
  sleep 32
end

dark_ambience_notes = (ring :C3, :Eb3, :F3, :Fs3).shuffle
define :dark_ambient do
  use_synth :dark_ambience
  n = dark_ambience_notes.tick
  play n, attack: 0, sustain: 8, sustain_level: 1.0,
    release: 8,
    cutoff: 130, ring: 0.6, res: 0.9,
    detune1: 12, amp: 0.5
  use_synth :supersaw
  play n - 12, attack: 1, sustain: 8, sustain_level: 0.9,
    release: 32, cutoff: 60, amp: 0.4
  sleep 16
end

with_fx :echo, phase: 0.25, decay: 2, mix: 0.2 do
  live_loop :positive_samples do
    use_real_time
    file = sync "/osc/trigger/sample/hitz"
    sample file[0]
    osc "/sample-finished/hitz"
  end
  live_loop :ambient_loop do
    index = sync "/osc/trigger/ambient"
    ambient index
  end
end

with_fx :reverb, room: 1 do
  live_loop :quote_samples do
    use_real_time
    file = sync "/osc/trigger/sample/quotes"
    sample file[0]
    sleep sample_duration(file[0])
    osc "/sample-finished/quotes"
  end
  live_loop :long_samples do
    use_real_time
    file = sync "/osc/trigger/sample/long"
    sample file[0]
    sleep sample_duration(file[0])
    osc "/sample-finished/long"
  end
  live_loop :synths do
    synth_bg = sync "/osc/trigger/synth"
    space_scanner if synth_bg[0] == "space_scanner"
    sweep 'squelch' if synth_bg[0] == "squelch"
    sweep 'trance' if synth_bg[0] == 'trance'
    dark_ambient if synth_bg[0] == "dark_ambient"
    slo_bells if synth_bg[0] == 'slo_bells'
    osc "/synth-finished"
  end
end