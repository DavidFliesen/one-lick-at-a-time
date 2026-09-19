/* One Lick at a Time — lick library
 * Strings: 1 = high E, 6 = low E (standard tuning E A D G B e).
 * Each event: { d: beats, notes:[{s,f,t?,ba?}] }  or a rest { d, r:true }
 * Technique tags (t): 'h' hammer-on  'p' pull-off  'b' bend (ba = semitones, default 2)
 *   'r' bend+release  'sl' slide-in  'v' vibrato  'pm' palm mute  'x' dead note
 * These are original teaching phrases (scales, boxes, common techniques) — free to use, remix and share.
 */
window.OLAT_LICKS = [
  {
    id:"first-blood", name:"First Blood", genre:"Blues", difficulty:"Beginner",
    key:"A minor pentatonic", bpm:92,
    techniques:["Bending","Vibrato","Box 1"],
    tip:"Land the bend by ear against the 5th-fret note, then add a slow, wide vibrato. Bends live and die on their pitch — sing the target note first.",
    why:"This is the doorway to blues lead. Box 1 of the minor pentatonic is the single most-used shape in rock and blues — get fluid here and you can improvise over a 12-bar in any key.",
    notes:[
      {d:.5,notes:[{s:2,f:8}]},{d:.5,notes:[{s:2,f:5}]},
      {d:.5,notes:[{s:3,f:7}]},{d:.5,notes:[{s:3,f:5}]},
      {d:.5,notes:[{s:4,f:7}]},{d:.5,notes:[{s:4,f:5}]},
      {d:1.5,notes:[{s:3,f:7,t:["b","v"],ba:2}]}
    ]
  },
  {
    id:"lightning-slide", name:"Lightning Slide", genre:"Rock", difficulty:"Beginner",
    key:"E minor pentatonic", bpm:120,
    techniques:["Slides","Hammer-on","Open strings"],
    tip:"Keep your fretting hand relaxed on the slide so the note rings the whole way up. Let the open strings ring into each other for that big, open rock sound.",
    why:"Slides give your playing motion and confidence. Learning to move along one string teaches the fretboard far faster than staying boxed in one position.",
    notes:[
      {d:.5,notes:[{s:3,f:0}]},{d:.5,notes:[{s:3,f:2,t:["h"]}]},
      {d:.5,notes:[{s:2,f:0}]},{d:.5,notes:[{s:2,f:3}]},
      {d:.5,notes:[{s:1,f:0}]},{d:1,notes:[{s:1,f:3,t:["sl"]}]},
      {d:1,notes:[{s:1,f:0,t:["v"]}]}
    ]
  },
  {
    id:"gallop-run", name:"Gallop Run", genre:"Metal", difficulty:"Intermediate",
    key:"E minor", bpm:150,
    techniques:["Palm mute","Gallop rhythm","Pull-off"],
    tip:"Rest the edge of your palm on the strings near the bridge for the muted low E. The gallop is one-two-and — down, down-up — keep the wrist loose and even.",
    why:"The palm-muted gallop is the engine of metal. Nailing tight right-hand muting is what separates a heavy riff from a muddy one, and it builds the picking control every lead needs.",
    notes:[
      {d:.25,notes:[{s:6,f:0,t:["pm"]}]},{d:.25,notes:[{s:6,f:0,t:["pm"]}]},{d:.5,notes:[{s:6,f:0,t:["pm"]}]},
      {d:.25,notes:[{s:6,f:0,t:["pm"]}]},{d:.25,notes:[{s:6,f:3,t:["pm"]}]},{d:.5,notes:[{s:6,f:0,t:["pm"]}]},
      {d:.5,notes:[{s:5,f:2}]},{d:.5,notes:[{s:5,f:0}]},
      {d:.5,notes:[{s:4,f:2,t:["p"]}]},{d:1,notes:[{s:4,f:0,t:["v"]}]}
    ]
  },
  {
    id:"chicken-pickin", name:"Chicken Pickin' Twang", genre:"Country", difficulty:"Intermediate",
    key:"G major", bpm:108,
    techniques:["Open-string pull-off","Double-stop","Twang"],
    tip:"Dig in and snap the notes. Pop the open-string pull-offs so they cluck, and mute stray strings with your palm for that percussive country snap.",
    why:"Country lead is a masterclass in articulation. Open-string licks and double-stops train your ears and hands to make single notes 'talk' — a skill that lifts every genre you play.",
    notes:[
      {d:.5,notes:[{s:3,f:2}]},{d:.25,notes:[{s:3,f:0,t:["p"]}]},{d:.25,notes:[{s:2,f:3}]},
      {d:.5,notes:[{s:2,f:0,t:["p"]}]},{d:.5,notes:[{s:1,f:3}]},
      {d:.5,notes:[{s:1,f:0,t:["p"]}]},
      {d:1,notes:[{s:2,f:3},{s:1,f:3}]},{d:1,notes:[{s:2,f:0},{s:1,f:0,t:["v"]}]}
    ]
  },
  {
    id:"wah-bubble", name:"Wah Bubble", genre:"Funk", difficulty:"Intermediate",
    key:"E Dorian", bpm:100,
    techniques:["Double-stops","Slides","Ghost notes"],
    tip:"Think rhythm first, notes second. Slide into the double-stops on the off-beats and mute everything in between so the groove breathes.",
    why:"Funk lead teaches pocket and space — the notes you don't play. Locking double-stops to a groove makes you a player people want to jam with.",
    notes:[
      {d:.5,notes:[{s:3,f:9,t:["sl"]},{s:2,f:9}]},{d:.5,r:true},
      {d:.5,notes:[{s:3,f:7},{s:2,f:8}]},{d:.5,notes:[{s:4,f:9,t:["x"]}]},
      {d:.5,notes:[{s:3,f:9},{s:2,f:9}]},{d:.5,notes:[{s:3,f:7,t:["sl"]},{s:2,f:8}]},
      {d:1,notes:[{s:4,f:7,t:["v"]}]}
    ]
  },
  {
    id:"reverb-dive", name:"Reverb Dive", genre:"Surf", difficulty:"Beginner",
    key:"E major", bpm:150,
    techniques:["Tremolo picking","Slide","Staccato"],
    tip:"Tremolo pick from the wrist — small, fast, even down-up motion. Drench it in reverb and let the low slide swoop like a wave pulling back.",
    why:"Surf is the fun way to build picking speed and stamina. Fast even tremolo picking is the foundation for shred, and the big slides teach dramatic phrasing.",
    notes:[
      {d:.25,notes:[{s:4,f:2}]},{d:.25,notes:[{s:4,f:2}]},{d:.25,notes:[{s:4,f:2}]},{d:.25,notes:[{s:4,f:2}]},
      {d:.25,notes:[{s:4,f:4}]},{d:.25,notes:[{s:4,f:4}]},{d:.5,notes:[{s:4,f:5}]},
      {d:.5,notes:[{s:5,f:5,t:["sl"]}]},{d:1.5,notes:[{s:5,f:2,t:["v"]}]}
    ]
  },
  {
    id:"bebop-enclosure", name:"Bebop Enclosure", genre:"Jazz", difficulty:"Advanced",
    key:"C major (jazz)", bpm:132,
    techniques:["Chromatic enclosure","Legato","Target notes"],
    tip:"Approach each chord tone from a half-step above and below before landing on it. Keep it smooth and even — swing the eighths slightly.",
    why:"Enclosures are the vocabulary of jazz phrasing. Surrounding a target note with chromatics teaches your ear to hear tension and release — the heart of expressive soloing.",
    notes:[
      {d:.5,notes:[{s:3,f:5}]},{d:.5,notes:[{s:3,f:4,t:["h"]}]},{d:.5,notes:[{s:3,f:5}]},
      {d:.5,notes:[{s:2,f:6}]},{d:.5,notes:[{s:2,f:5,t:["p"]}]},{d:.5,notes:[{s:2,f:8}]},
      {d:.5,notes:[{s:1,f:5}]},{d:.5,notes:[{s:1,f:4}]},{d:1,notes:[{s:1,f:5,t:["v"]}]}
    ]
  },
  {
    id:"travis-lead", name:"Fingerstyle Lead", genre:"Folk", difficulty:"Beginner",
    key:"C major", bpm:96,
    techniques:["Melody on top","Let ring","Open position"],
    tip:"Let every note ring into the next — don't lift your fingers early. Play the melody notes a touch louder than the rest so the tune sings out.",
    why:"Melodic playing over open chords trains the most important lead skill of all: making a memorable line. Great solos are melodies, not just fast scales.",
    notes:[
      {d:.5,notes:[{s:2,f:1}]},{d:.5,notes:[{s:1,f:0}]},
      {d:.5,notes:[{s:1,f:3}]},{d:.5,notes:[{s:1,f:0,t:["p"]}]},
      {d:.5,notes:[{s:2,f:1}]},{d:.5,notes:[{s:2,f:3}]},
      {d:1,notes:[{s:2,f:1,t:["v"]}]},{d:1,notes:[{s:3,f:0}]}
    ]
  },
  {
    id:"bend-wail", name:"Bend & Release Wail", genre:"Blues-Rock", difficulty:"Intermediate",
    key:"A minor pentatonic", bpm:80,
    techniques:["Full-step bend","Bend & release","Vibrato"],
    tip:"Push the string with two or three fingers for strength. Bend up in time, hold, then release smoothly back down — it should feel like a voice crying out.",
    why:"Expressive bending is the single most vocal thing a guitar can do. Control the pitch on the way up AND the way down and your leads stop sounding like exercises and start sounding like you.",
    notes:[
      {d:1.5,notes:[{s:2,f:8,t:["b","v"],ba:2}]},
      {d:.5,notes:[{s:2,f:5}]},
      {d:1,notes:[{s:3,f:7,t:["b"],ba:2}]},{d:.5,notes:[{s:3,f:7,t:["r"],ba:2}]},
      {d:.5,notes:[{s:3,f:5}]},{d:2,notes:[{s:4,f:7,t:["v"]}]}
    ]
  },
  {
    id:"pentatonic-sprint", name:"Pentatonic Sprint", genre:"Hard Rock", difficulty:"Advanced",
    key:"A minor pentatonic", bpm:120,
    techniques:["Legato","Hammer/pull","Speed"],
    tip:"Start slow. Keep fingers close to the strings and let hammer-ons and pull-offs do the work — the pick only starts each string. Speed is a by-product of relaxation.",
    why:"Legato runs build the fluid, effortless technique that makes fast playing look easy. Master this and you can rip through the pentatonic in your sleep.",
    notes:[
      {d:.25,notes:[{s:1,f:8}]},{d:.25,notes:[{s:1,f:5,t:["p"]}]},{d:.25,notes:[{s:2,f:8,t:["p"]}]},{d:.25,notes:[{s:2,f:5,t:["p"]}]},
      {d:.25,notes:[{s:3,f:7}]},{d:.25,notes:[{s:3,f:5,t:["p"]}]},{d:.25,notes:[{s:4,f:7}]},{d:.25,notes:[{s:4,f:5,t:["p"]}]},
      {d:.25,notes:[{s:5,f:7}]},{d:.25,notes:[{s:5,f:5,t:["p"]}]},{d:1.5,notes:[{s:6,f:5,t:["v"]}]}
    ]
  },
  {
    id:"pull-off-cascade", name:"Pull-off Cascade", genre:"Classic Rock", difficulty:"Intermediate",
    key:"E minor pentatonic", bpm:126,
    techniques:["Pull-offs","Repeating lick","Phrasing"],
    tip:"Pull the fretting finger slightly downward so it plucks the string as it releases. Repeat the pattern to build a hypnotic, rolling phrase.",
    why:"Repeating licks are how great solos build tension and excitement. This teaches you to develop one idea instead of just running scales.",
    notes:[
      {d:.25,notes:[{s:1,f:8,t:["p"]}]},{d:.25,notes:[{s:1,f:5}]},{d:.25,notes:[{s:2,f:7,t:["p"]}]},{d:.25,notes:[{s:2,f:5}]},
      {d:.25,notes:[{s:1,f:8,t:["p"]}]},{d:.25,notes:[{s:1,f:5}]},{d:.25,notes:[{s:2,f:7,t:["p"]}]},{d:.25,notes:[{s:2,f:5}]},
      {d:.5,notes:[{s:3,f:7}]},{d:.5,notes:[{s:3,f:5}]},{d:1,notes:[{s:4,f:7,t:["v"]}]}
    ]
  },
  {
    id:"three-per-string", name:"Three-Per-String Run", genre:"Shred", difficulty:"Advanced",
    key:"A natural minor", bpm:104,
    techniques:["3-note-per-string","Alternate picking","Aeolian"],
    tip:"Anchor a consistent 1-3-4 or 1-2-4 finger pattern per string. Practice with a metronome, one click faster only when it's clean. Clean slow beats sloppy fast every time.",
    why:"Three-note-per-string patterns unlock the whole neck and the modes. This is the framework behind modern shred and melodic metal lead.",
    notes:[
      {d:.25,notes:[{s:6,f:5}]},{d:.25,notes:[{s:6,f:7,t:["h"]}]},{d:.25,notes:[{s:6,f:8,t:["h"]}]},
      {d:.25,notes:[{s:5,f:5}]},{d:.25,notes:[{s:5,f:7,t:["h"]}]},{d:.25,notes:[{s:5,f:8,t:["h"]}]},
      {d:.25,notes:[{s:4,f:5}]},{d:.25,notes:[{s:4,f:7,t:["h"]}]},{d:.5,notes:[{s:4,f:9,t:["h"]}]},
      {d:1,notes:[{s:3,f:9,t:["v"]}]}
    ]
  },
  {
    id:"offbeat-skank", name:"Off-beat Lead", genre:"Reggae", difficulty:"Beginner",
    key:"A major", bpm:76,
    techniques:["Off-beat phrasing","Space","Staccato"],
    tip:"Play on the 'and' of each beat and cut the notes short. The silence is the groove — count out loud so your notes land in the pockets.",
    why:"Reggae is the ultimate lesson in feel and restraint. Learning to place notes off the beat and leave space makes everything you play more musical.",
    notes:[
      {d:.5,r:true},{d:.5,notes:[{s:3,f:2}]},
      {d:.5,r:true},{d:.5,notes:[{s:2,f:2}]},
      {d:.5,r:true},{d:.5,notes:[{s:2,f:5,t:["sl"]}]},
      {d:.5,r:true},{d:.5,notes:[{s:1,f:2,t:["v"]}]}
    ]
  },
  {
    id:"hooky-motif", name:"Hooky Motif", genre:"Pop", difficulty:"Beginner",
    key:"C major", bpm:100,
    techniques:["Simple melody","Repetition","Singable"],
    tip:"If you can hum it, you can play it. Keep it simple and repeat it — a hook people remember beats a hundred fast notes they forget.",
    why:"The best lead lines are hooks. Writing short, singable motifs is the skill behind every solo that gets stuck in your head.",
    notes:[
      {d:.5,notes:[{s:2,f:1}]},{d:.5,notes:[{s:2,f:3}]},{d:.5,notes:[{s:1,f:0}]},{d:.5,notes:[{s:1,f:1}]},
      {d:1,notes:[{s:1,f:0}]},{d:.5,notes:[{s:2,f:3}]},{d:1.5,notes:[{s:2,f:1,t:["v"]}]}
    ]
  },
  {
    id:"rockabilly-rip", name:"Rockabilly Rip", genre:"Rockabilly", difficulty:"Intermediate",
    key:"E major", bpm:150,
    techniques:["Open-string runs","Hybrid feel","Bounce"],
    tip:"Keep it bouncy and light. Mix open strings with fretted notes so the line rolls along, and let a little slapback echo do the rest.",
    why:"Rockabilly lead teaches speed with a relaxed, dancing feel. Blending open and fretted notes trains your fretboard vision and your rhythm together.",
    notes:[
      {d:.25,notes:[{s:3,f:0}]},{d:.25,notes:[{s:3,f:2,t:["h"]}]},{d:.25,notes:[{s:2,f:0}]},{d:.25,notes:[{s:2,f:2,t:["h"]}]},
      {d:.25,notes:[{s:1,f:0}]},{d:.25,notes:[{s:1,f:2,t:["h"]}]},{d:.5,notes:[{s:1,f:4,t:["sl"]}]},
      {d:.5,notes:[{s:2,f:2}]},{d:.5,notes:[{s:2,f:0,t:["p"]}]},{d:1,notes:[{s:3,f:2,t:["v"]}]}
    ]
  },
  {
    id:"delay-swell", name:"Delay Swell Melody", genre:"Ambient", difficulty:"Beginner",
    key:"E minor", bpm:68,
    techniques:["Volume swells","Let ring","Wide vibrato"],
    tip:"Pick a note with the volume down, then roll it up for a swell that has no attack. Let notes overlap and add a slow, wide vibrato at the end of each phrase.",
    why:"Ambient playing is where you learn tone and touch. Swells and long sustained notes teach dynamics and patience — the taste that keeps a solo from sounding rushed.",
    notes:[
      {d:2,notes:[{s:3,f:9,t:["v"]}]},
      {d:2,notes:[{s:2,f:8,t:["v"]}]},
      {d:1,notes:[{s:2,f:12,t:["sl"]}]},{d:3,notes:[{s:3,f:9,t:["b","v"],ba:2}]}
    ]
  }
];
