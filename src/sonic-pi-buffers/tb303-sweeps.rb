#  Long note and sweeping arp
use_synth :tb303
with_fx :reverb, room: 1 do
  live_loop :space_scanner do
    play :f1, cutoff: 100, release: 7, attack: 1, cutoff_attack: 8, cutoff_release: 4
    sleep 8
  end
  c = 30
  inc = true
  live_loop :squelch do
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
    sleep 0.125
  end
end
