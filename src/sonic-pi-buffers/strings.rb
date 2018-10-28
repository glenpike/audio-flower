##| notes = (scale :Bb5, :melodic_major).shuffle
notes = (scale :f5, :minor_pentatonic).shuffle

define :strings do
  use_synth :dsaw
  n = notes.tick
  ##| Plays chords because we are ticking through for 2nd sound!
  play n, attack: 1, release: 1, amp: 0.3
  play notes.tick - 12, detune: 5, attack: 1, release: 1, amp: 0.3
  play n - 48, detune: 0.1, attack: 1, release: 1, amp: 0.3
  sleep 4
end


with_fx :reverb, room: 1 do
  live_loop :string_loop do
    strings
  end
end
