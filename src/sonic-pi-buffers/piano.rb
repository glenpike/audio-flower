# Nice echoey soft piano
# Uncomment the flanger for slightly fatter sound.
with_fx :reverb, room: 1.0, mix: 0.8 do
  ##| with_fx :flanger, phase: 4, delay: 3, depth: 10, mix: 0.8 do
  notes = (scale :f3, :minor_pentatonic).shuffle
  live_loop :timbre do
    use_synth :piano
    play notes.tick, attack: 0.125, sustain: 6, sustain_level: 1.0,
      release: 6
    sleep 0.25
  end
  ##| end
end