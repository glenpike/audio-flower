# Steve Reich's Piano Phase

notes = (ring :E4, :Fs4, :B4, :Cs5, :D5, :Fs4, :E4, :Cs5, :B4, :Fs4, :D5, :Cs5)
with_fx :reverb, room: 1 do
  with_fx :ixi_techno, phase: 16 do
    use_synth :piano
    live_loop :slow do
      play notes.tick, sustain_level: 0.9, release: 1
      sleep 0.3
    end
    
    live_loop :faster do
      play notes.tick, sustain_level: 0.9, release: 1
      sleep 0.295
    end
  end
end

