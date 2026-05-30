import { CHARACTERS, CHAPTER_FLOW } from './characters';
import { WIN_THRESHOLDS, ENDING_GATES, GM_TRUST_BONUS } from './constants';

// SCENE SHAPE
// {
//   id, chapter, type,
//   setup: string,             // narrative lead-in (player sees this first)
//   tagSetup: string | null,   // appended in setup if format === 'tag'
//   choices: [{
//     text: string,            // the dialogue or decision the player picks
//     effects: { pop?, heat?, push? },
//     outcome: string,         // narrative reaction shown after pick
//     flag?: { gmTrusted?, partnerBetrayed?, shootPromoGiven?, workedTheBookerDelta? },
//     conditional?: (state) => effects  // war room politic / business pitch
//   }]
// }

// ──────────────────────────────────────────────────────────────────────────────
// DISGRUNTLED JOBBER — 24 mini-scenes. 8 chapters × 3 beats each.
// Beats: (a) backstage / pre-moment, (b) the moment itself, (c) aftermath.
// Stat deltas are small (1-2) since there are 3x as many picks per chapter.
// Scene fields: { id, chapter, part, chapterTitle, location, setup, choices: [...] }
// ──────────────────────────────────────────────────────────────────────────────
const JOBBER = [
  // ─── CH 1 — DEBUT (visual novel beats) ─────────────────────────────────
  {
    id: 'jobber_1a', chapter: 1, part: 'a',
    chapterTitle: 'DEBUT', location: 'The ring · opening line',
    beats: [
      { text: "I can't believe I'm finally back after 10 years." },
      { text: "All I had to do was become King of the Indies..." },
      { text: "...bled in front of 50 people at the legion for pocket change." },
      { text: "But now I'm back — for Johnny Bigdeal's retirement tour." },
      { text: "What they don't know is I'm not selling for him." },
      { text: "I'm selling for myself." },
      { type: 'narration', text: 'Your music hits.' },
      {
        type: 'choice',
        options: [
          {
            text: '"I know none of you came out here for me. That\'s alright. I came here for me."',
            effects: { pop: 5 },
            response: [
              { type: 'narration', text: 'Scattered, surprised pop from the smart marks.' },
              { type: 'speech', speaker: 'VOICE (cheap seats)', text: "Let\'s go, kid!" }
            ]
          },
          {
            text: `"I don't think I have ever seen so many ugly people..."`,
            effects: { heat: 5 },
            response: [
              { type: 'narration', text: 'Real heat. Not the worked kind. Boos roll from the front row back.' }
            ]
          },
          {
            text: '"I\'m not asking for the spot. I\'m taking it."',
            effects: { pop: 2, heat: 2, push: 2 },
            response: [
              { type: 'narration', text: 'Confused murmur. Nobody knows what this is yet.' },
              { type: 'speech', speaker: 'VOICE', text: "Whose music is this?" }
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'jobber_1b', chapter: 1, part: 'b',
    chapterTitle: 'DEBUT', location: 'The ring · they\'re listening now',
    beats: [
      { type: 'narration', text: 'The crowd is locked in. Phones down. Whatever you said next had better land.' },
      {
        type: 'choice',
        options: [
          {
            text: '"I\'m not the guy on the poster. I\'m the guy who keeps showing up after you cut him."',
            effects: { pop: 5 },
            response: [
              { type: 'narration', text: 'The cheap seats start a "you deserve it" chant. It catches.' }
            ]
          },
          {
            text: '"Every one of you forgot me. Tonight I make sure you remember."',
            effects: { heat: 5 },
            response: [
              { type: 'narration', text: 'The boos sharpen. You picked a fight. They like fighting back.' }
            ]
          },
          {
            text: '"I don\'t need your cheers. I don\'t need your boos. I need this microphone for thirty more seconds."',
            effects: { pop: 2, heat: 2, push: 2 },
            response: [
              { type: 'narration', text: 'A laugh from somewhere in row three. The booker leans forward backstage.' }
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'jobber_1c', chapter: 1, part: 'c',
    chapterTitle: 'DEBUT', location: 'The ring · the closer',
    beats: [
      { type: 'narration', text: 'You let the crowd settle. Whatever you say next is what they\'ll quote on the way home.' },
      {
        type: 'choice',
        options: [
          {
            text: '"Send me anybody. I\'ll out-work him. That\'s the only promise I make."',
            effects: { pop: 6, push: 2 },
            response: [
              { type: 'narration', text: 'The pop is real. A small "let\'s go kid" chant breaks out.' }
            ]
          },
          {
            text: '"Whoever comes through that curtain — I\'m going to hurt him on purpose."',
            effects: { heat: 6, push: 2 },
            response: [
              { type: 'narration', text: 'The arena gets loud. Not cheers. Not boos. Both.' }
            ]
          },
          {
            text: '"Whoever you put in front of me, the booker\'s about to learn something."',
            effects: { pop: 3, heat: 3, push: 4 },
            response: [
              { type: 'narration', text: 'GM\'s eyes narrow on the monitor. That was a threat to the boss. They liked it.' }
            ]
          }
        ]
      }
    ]
  },

  // ─── CH 1 — DEBUT MATCH (game interface, not prose) ─────────────────────
  // After the ring promo, the opponent's music hits and the match interface
  // takes over. No story choices inside the match — only the mechanic
  // (3 rounds of move draws + climax choice). Win/loss branches the aftermath.
  {
    id: 'jobber_1_match', chapter: 1, part: 'd', type: 'match',
    chapterTitle: 'DEBUT', location: 'The ring',
    opponentId: 'the_squash',
    intro: [
      { type: 'narration', text: "Chad Excellence's music hits before you can finish your thought." },
      { type: 'narration', text: 'He swaggers down the ramp like the building belongs to him. Crowd half-pops out of habit.' },
      { type: 'narration', text: "He doesn't even look at you on the way in. The ref signals for the bell." },
      { type: 'narration', text: 'Lockup.' }
    ],
    afterWin: [
      { type: 'narration', text: '[TODO] You pin him. The ref counts three. Crowd reaction.' },
      { type: 'narration', text: '[TODO] Walk back through the curtain. GM reaction.' }
    ],
    afterLoss: [
      { type: 'narration', text: '[TODO] He pins you. Same as it ever was.' },
      { type: 'narration', text: '[TODO] Walk back. Agent\'s line. The cycle continues.' }
    ]
  },

  // ─── CH 2 — RIVAL INTRODUCED ────────────────────────────────────────────
  {
    id: 'jobber_2a', chapter: 2, part: 'a',
    chapterTitle: 'THE BOOKER\'S OFFICE', location: "Booker's office",
    setup: "Booker's office. He doesn't look up from his laptop. \"I'm giving you a spot. Don't make me regret it. Do the job — twice, kid. Two clean jobs. Then we talk about your spot on the card.\"",
    choices: [
      {
        text: '"Whatever you need, boss."',
        effects: { push: 2 },
        flag: { workedTheBookerDelta: 1 },
        outcome: 'Nod without looking up. Push climbs. You ate it. Again.'
      },
      {
        text: '"I\'ve been doing my job for ten years. The \'next month\' never comes."',
        effects: { heat: 2, push: -2 },
        outcome: 'He looks up. "Then quit." Goes back to the laptop.'
      },
      {
        text: '"What\'s the something? I\'ll do it. But I need to know."',
        effects: {},
        outcome: 'He actually closes the laptop. "Listen..." The plan is real. Maybe.',
        conditional: state => state.heat > state.pop || (state.flags.workedTheBooker || 0) >= 1
          ? { push: 2 }
          : { push: 0 }
      }
    ]
  },
  {
    id: 'jobber_2b', chapter: 2, part: 'b',
    chapterTitle: 'THE HALLWAY', location: 'Backstage hallway',
    setup: "Walking back to the locker room. A vet you came up with is leaning against the wall. He saw you go in. \"What\'d he say?\"",
    choices: [
      {
        text: '"He\'s putting me in something."',
        effects: { pop: 1 },
        outcome: 'Vet nods. "Good. You earned it." Stays leaning.'
      },
      {
        text: '"Nothing I haven\'t heard before."',
        effects: { heat: 1 },
        outcome: 'Vet half-laughs. "Yeah." Pushes off the wall.'
      },
      {
        text: '"Same shit."',
        effects: { push: 1 },
        outcome: 'Vet smiles small. "Sure."'
      }
    ]
  },
  {
    id: 'jobber_2c', chapter: 2, part: 'c',
    chapterTitle: 'THE LOCKER ROOM', location: 'Locker room',
    setup: "The rookie you're scheduled to work tonight is in the corner, lacing his boots. He sees you. Stops.",
    choices: [
      {
        text: '(Walk over. Introduce yourself. Set the tone.)',
        effects: { pop: 1 },
        outcome: 'Rookie\'s shoulders relax. He shakes your hand. "I won\'t let you down."'
      },
      {
        text: '(Walk past. Ignore him.)',
        effects: { heat: 1 },
        outcome: 'Rookie tries to say something. You don\'t hear it.'
      },
      {
        text: '(Nod once, sit down across the room.)',
        effects: { push: 1 },
        outcome: 'Rookie understands. Sits. Doesn\'t speak.'
      }
    ]
  },

  // ─── CH 3 — FIRST BUSINESS DECISION ─────────────────────────────────────
  {
    id: 'jobber_3a', chapter: 3, part: 'a',
    chapterTitle: 'THE BOOKING', location: 'Locker room doorway',
    setup: "Agent in the locker room doorway. \"You\'re putting the rookie over tonight. Quick squash. Three minutes. He needs the rub.\"",
    choices: [
      {
        text: '"Sure thing. I\'ll make him look strong."',
        effects: { push: 2, pop: -1 },
        flag: { workedTheBookerDelta: 1 },
        outcome: '"Good kid." He walks.'
      },
      {
        text: '"I\'m not laying down for some green kid who couldn\'t tell you my finisher."',
        effects: { heat: 3, push: -3 },
        outcome: 'Long silence. "I\'ll let him know." He doesn\'t.'
      },
      {
        text: '"I\'ll do it. But after the match I want five minutes with the booker. Yes or no."',
        effects: {},
        flag: { workedTheBookerDelta: 1 },
        outcome: '"Five minutes. Don\'t waste \'em." He nods once.',
        conditional: state => state.heat > state.pop || (state.flags.workedTheBooker || 0) >= 1
          ? { push: 2 }
          : { push: 0 }
      }
    ]
  },
  {
    id: 'jobber_3b', chapter: 3, part: 'b',
    chapterTitle: 'THE GORILLA', location: 'Curtain, pre-match',
    setup: "Pre-match at the curtain. The rookie is white-knuckling the rope three steps away. He turns. \"Hey — you wanna call it out there? I\'ve never done a TV spot.\"",
    choices: [
      {
        text: '"I\'ll call it. You just hit hard and sell big."',
        effects: { pop: 1, push: 1 },
        outcome: 'He exhales. "Thank you, man." First peaceful breath he\'s taken.'
      },
      {
        text: '"Call your own match, kid. You wanted this spot."',
        effects: { heat: 1 },
        outcome: 'He nods like he expected it. Doesn\'t say anything.'
      },
      {
        text: '"We\'ll feel it out."',
        effects: { pop: 1, heat: 1 },
        outcome: 'He doesn\'t know what to do with that. Says "ok" twice.'
      }
    ]
  },
  {
    id: 'jobber_3_match', chapter: 3, part: 'c', type: 'match',
    chapterTitle: 'THE SCREWJOB', location: 'The ring',
    opponentId: 'the_rookie',
    intro: [
      { type: 'narration', text: "Tyler Knox's music hits. The booker's pick. Three months on TV and already a polished entrance video." },
      { type: 'narration', text: 'He sprints down the ramp. Crowd reacts on cue — the company wants them to. Most of them oblige.' },
      { type: 'narration', text: 'He slides under the bottom rope and points at you. Doesn\'t say a word.' },
      { type: 'narration', text: "Bell. The booked finish is a clothesline into a clean three. You know what you're supposed to do. Whether you do it is the only question that matters tonight." }
    ],
    afterWin: [
      { type: 'narration', text: '[TODO] You pin the rookie clean. The arena freezes. So does the booker.' },
      { type: 'narration', text: '[TODO] Walk back through the curtain. Agent\'s face is unreadable. Booker is already yelling at someone.' }
    ],
    afterLoss: [
      { type: 'narration', text: '[TODO] The kid pins you. Job done. Booker exhales backstage.' },
      { type: 'narration', text: '[TODO] Walk back. Agent gives you the nod. Tyler\'s already cutting a promo on the monitor.' }
    ]
  },

  // ─── CH 4 — IT GETS PERSONAL ────────────────────────────────────────────
  {
    id: 'jobber_4a', chapter: 4, part: 'a',
    chapterTitle: 'THE CURTAIN', location: 'Gorilla position',
    setup: "Curtain. Agent\'s voice is softer than usual. \"Booker\'s watching this one. Do the job clean. He likes that.\"",
    choices: [
      {
        text: '"Clean. I got it. I\'ll see him after."',
        effects: {},
        flag: { gmTrusted: true },
        outcome: 'Agent gives you a small nod. The kind he doesn\'t give twice a year.'
      },
      {
        text: '"I\'ve heard that one before."',
        effects: { push: 2 },
        flag: { gmTrusted: false },
        outcome: 'Agent doesn\'t answer. Walks.'
      },
      {
        text: '"We\'ll see what the match gives us."',
        effects: { pop: 1, heat: 1 },
        outcome: 'Agent half-laughs. "Don\'t be a hero." Pause. "Or do."'
      }
    ]
  },
  {
    id: 'jobber_4b', chapter: 4, part: 'b',
    chapterTitle: 'STIFF SHOT', location: 'Mid-match, the ring',
    setup: "Match is going well. Opponent — a midcarder you've worked five times — throws a forearm a foot too hard. Right in your jaw. The crowd noticed. He looks at you.",
    choices: [
      {
        text: '(Eat it. Keep the match going.)',
        effects: { pop: 1, push: 1 },
        outcome: 'Crowd respects it. Opponent looks ashamed. Match continues.'
      },
      {
        text: '(Receipt. Give him one back, harder.)',
        effects: { heat: 2 },
        outcome: 'He sells big — too big. Worked heat is now real heat. Match gets stiff the rest of the way.'
      },
      {
        text: '(Shoot back. Take him down for real. End the match.)',
        effects: { heat: 3, push: -2 },
        outcome: 'He\'s on his back not selling. Ref doesn\'t know what to do. Bell rings early.'
      }
    ]
  },
  {
    id: 'jobber_4c', chapter: 4, part: 'c',
    chapterTitle: 'CATERING', location: 'Backstage catering',
    setup: "Catering. He's at a table with a vet. Sees you walk in. The vet looks up too. Everyone\'s waiting.",
    choices: [
      {
        text: '(Sit at the table. Eat. Don\'t say anything.)',
        effects: { pop: 1, push: 1 },
        outcome: 'He thaws. The vet thaws. After a minute he says "sorry, man." Everyone keeps eating.'
      },
      {
        text: '(Walk past, loud enough for him to hear: "Be careful out there next time.")',
        effects: { heat: 2 },
        outcome: 'He stops chewing. Doesn\'t look up. The vet does.'
      },
      {
        text: '(Pull up a chair. "We good?" Look him in the eye.)',
        effects: { pop: 1, heat: 1 },
        outcome: 'He looks at you for a long second. "Yeah. We\'re good." The vet exhales.'
      }
    ]
  },

  // ─── CH 5 — THE TURN ────────────────────────────────────────────────────
  {
    id: 'jobber_5a', chapter: 5, part: 'a',
    chapterTitle: 'PRODUCTION MEETING', location: 'Production meeting room',
    setup: "Big production meeting. The board is up. Every name on the card is on it. Yours isn't. Booker is going through the runsheet. Doesn\'t look at you.",
    choices: [
      {
        text: '(Stand up.) "I should be on this card."',
        effects: { heat: 2, push: -1 },
        outcome: 'Booker laughs without smiling. "You should be?" Long silence. You sit.'
      },
      {
        text: '(Stay seated. Take notes. Wait for the meeting to end.)',
        effects: { push: 1 },
        outcome: 'Meeting ends. People file out. You\'re invisible. Same as it ever was.'
      },
      {
        text: '(Stand up.) "Three weeks from now. Give me a singles spot. I\'ll prepare anything."',
        effects: {},
        flag: { workedTheBookerDelta: 1 },
        outcome: 'Booker actually pauses. "Three weeks. We\'ll see." Not yes. Not no.',
        conditional: state => state.heat > state.pop || (state.flags.workedTheBooker || 0) >= 1
          ? { push: 2 }
          : { push: 0 }
      }
    ]
  },
  {
    id: 'jobber_5b', chapter: 5, part: 'b',
    chapterTitle: 'THE COFFEE MACHINE', location: 'Catering, after the meeting',
    setup: "Whatever you did or didn't do, the room cleared. The vet from earlier is at the coffee machine. He saw the whole thing.",
    choices: [
      {
        text: '"What do you think?"',
        effects: { pop: 1, push: 1 },
        outcome: 'Vet thinks. "You did what you had to. Now stay ready." Hands you a coffee.'
      },
      {
        text: '"He\'s never gonna give me a spot. We both know it."',
        effects: { heat: 1 },
        outcome: 'Vet looks at you. "Maybe. Maybe not." Drinks his coffee.'
      },
      {
        text: '(Don\'t say anything. Get coffee. Walk.)',
        effects: { push: 1 },
        outcome: 'Vet watches you go. Doesn\'t say a word. Nods once.'
      }
    ]
  },
  {
    id: 'jobber_5c', chapter: 5, part: 'c',
    chapterTitle: 'LOCKER ROOM RUMOR', location: 'Locker room',
    setup: "Two of the boys are murmuring. They stop when you walk in. The bigger one says, loud and casual: \"Heard you went into business for yourself at the meeting.\"",
    choices: [
      {
        text: '"I asked for a spot. That\'s not into business for myself."',
        effects: { pop: 1 },
        outcome: 'He shrugs. "Alright." Murmuring stops.'
      },
      {
        text: '"What\'s it to you?"',
        effects: { heat: 1, push: -1 },
        outcome: 'He stares. Doesn\'t blink. Goes back to lacing his boots.'
      },
      {
        text: '(Look at him. Don\'t answer. Open your locker.)',
        effects: { push: 1 },
        outcome: 'He waits for an answer. Doesn\'t get one. Eventually goes back to his bag.'
      }
    ]
  },

  // ─── CH 6 — PROMO WAR ───────────────────────────────────────────────────
  {
    id: 'jobber_6a', chapter: 6, part: 'a',
    chapterTitle: 'SCRIPT NOTES', location: "Booker's desk",
    setup: "First real promo segment in over a year. Booker actually wrote script notes. Three pages. He hands them to you. \"Stick to this. We don\'t have time for surprises.\"",
    choices: [
      {
        text: '(Read every line. Memorize it. Go with the script.)',
        effects: { push: 2 },
        flag: { workedTheBookerDelta: 1 },
        outcome: 'Booker watches you read. Nods. "Good." Walks.'
      },
      {
        text: '(Skim it. Toss it in the bin. Wing it.)',
        effects: { heat: 2 },
        outcome: 'Booker doesn\'t see you toss it. Yet. He will. After.'
      },
      {
        text: '(Read it. Keep the structure. Change the words.)',
        effects: { pop: 1, push: 1 },
        outcome: 'Booker doesn\'t notice. The Agent does. Half-smile.'
      }
    ]
  },
  {
    id: 'jobber_6b', chapter: 6, part: 'b',
    chapterTitle: 'THE WALK OUT', location: 'Entrance ramp',
    setup: "Your music hits. The rival is already in the ring. He's got the mic. He's been talking for two minutes. Crowd is hot on him already.",
    choices: [
      {
        text: '(Walk down with purpose. Don\'t acknowledge him.)',
        effects: { pop: 1, push: 1 },
        outcome: 'Crowd respects the all-business approach. Cheers build.'
      },
      {
        text: '(Stop on the ramp. Stare at him.)',
        effects: { heat: 2 },
        outcome: 'He stops talking. The arena gets quiet. Cameras hold the shot.'
      },
      {
        text: '(Walk past the ring. Grab the second mic from the announcer. Walk in slow.)',
        effects: { pop: 2, push: 1 },
        outcome: 'Smart-mark pop. He notices. The crowd reads everything.'
      }
    ]
  },
  {
    id: 'jobber_6c', chapter: 6, part: 'c',
    chapterTitle: 'THE PROMO', location: 'Center ring',
    setup: "You're in the ring. The mic is yours. The arena is full and listening. This doesn't happen often.",
    choices: [
      {
        text: '"I\'m not gonna apologize for being here. I belong on this card. I always did."',
        effects: { pop: 2, heat: -1 },
        outcome: 'Slow pop. Then a "you deserve it" chant from section 220.'
      },
      {
        text: '"Every one of you watched me lose for a decade. You knew my name. You just didn\'t say it. Say it now."',
        effects: { heat: 2, pop: 1 },
        outcome: 'Chant of your name. Both sides of the arena. Loud both ways.'
      },
      {
        text: '"This is one chance. I\'m not wasting it on threats. You\'ll see what I came to do."',
        effects: { pop: 1, heat: 1, push: 1 },
        outcome: 'Arena holds. Pin-drop quiet. Then a long, building roar.'
      }
    ]
  },

  // ─── CH 7 — CONTRACT SIGNING ────────────────────────────────────────────
  {
    id: 'jobber_7a', chapter: 7, part: 'a',
    chapterTitle: 'THE HALLWAY', location: 'Backstage hallway',
    setup: "Walking to the gorilla. The Booker himself appears in the hallway. He's never come to find you before. He stops. Looks at you.",
    choices: [
      {
        text: '(Stop. Wait for him to speak first.)',
        effects: { push: 1 },
        outcome: 'He sizes you up. "Don\'t disappoint me." Walks past.'
      },
      {
        text: '"Boss." (Acknowledge, keep walking.)',
        effects: { pop: 1 },
        outcome: 'He grunts. Keeps walking. Says over his shoulder: "Don\'t disappoint me."'
      },
      {
        text: '(Hold his eyes. Say nothing.)',
        effects: { heat: 1, push: 1 },
        outcome: 'He holds your eyes back. "Don\'t disappoint me." Walks past slower than he needed to.'
      }
    ]
  },
  {
    id: 'jobber_7b', chapter: 7, part: 'b',
    chapterTitle: 'THE TABLE', location: 'Contract signing, the ring',
    setup: "Contract signing. You're at the table. Rival across. Pen between you. Crowd is feral. The Booker is at ringside.",
    choices: [
      {
        text: '(Sign clean. Slide it back. Stand up.)',
        effects: { push: 2 },
        flag: { workedTheBookerDelta: 1 },
        outcome: 'Crowd polite. Rival respects it. Booker exhales.'
      },
      {
        text: '(Sign. Then flip the table.)',
        effects: { heat: 3, pop: 1 },
        outcome: 'Crowd loses it. Rival has to roll out. Booker is laughing despite himself.'
      },
      {
        text: '(Don\'t sign.) "Add no-DQ. Then we sign."',
        effects: { pop: 1, heat: 1, push: 1 },
        outcome: 'Booker walks over. Looks at the contract. Adds the line. Hands it back. The arena explodes.'
      }
    ]
  },
  {
    id: 'jobber_7c', chapter: 7, part: 'c',
    chapterTitle: 'AFTER', location: 'Backstage hallway',
    setup: "Back through the curtain. The hallway is empty for once. You can hear the crowd buzzing through the wall.",
    choices: [
      {
        text: '(Find the Agent. Thank him.)',
        effects: { pop: 1 },
        outcome: 'Agent looks up. "Don\'t thank me yet." Half-smile.'
      },
      {
        text: '(Find the rival\'s locker room. Door\'s open. Look in.)',
        effects: { heat: 2 },
        outcome: 'He\'s pacing. Doesn\'t see you. You watch for ten seconds. Walk away.'
      },
      {
        text: '(Go straight to your locker. Sit down. Don\'t talk to anyone.)',
        effects: { push: 1 },
        outcome: 'You sit. The buzz keeps going through the wall. You listen.'
      }
    ]
  },

  // ─── CH 8 — CHAMPIONSHIP ────────────────────────────────────────────────
  {
    id: 'jobber_8a', chapter: 8, part: 'a',
    chapterTitle: 'THE CURTAIN', location: 'Gorilla position',
    setup: "PPV night. Your music is queued. The Agent is at the curtain.",
    choices: [
      {
        text: '(Listen to whatever he says. Follow it.)',
        effects: { push: 1 },
        outcome: 'Agent: "Whatever happens — you earned this spot. Go." Tap on the shoulder.'
      },
      {
        text: '(Don\'t engage. Stretch. Wait for the cue.)',
        effects: { heat: 1 },
        outcome: 'Agent doesn\'t speak. Just nods at the music cue.'
      },
      {
        text: '"I appreciate it." (Look him in the eye.)',
        effects: { pop: 1 },
        outcome: 'Agent: "Yeah you do." Quiet.'
      }
    ]
  },
  {
    id: 'jobber_8b', chapter: 8, part: 'b',
    chapterTitle: 'THE WALK', location: 'Entrance ramp',
    setup: "Full house. Your music is real this time — they remixed it for the PPV. Crowd is split: half came because they love you, half came to watch you fail. Both halves are loud.",
    choices: [
      {
        text: '(Walk slow. Take in every face.)',
        effects: { pop: 2 },
        outcome: 'The pop is real. Phones are up. This is being filmed for thirty different reasons.'
      },
      {
        text: '(Walk fast. Head down. Eyes on the ring.)',
        effects: { push: 2 },
        outcome: 'All business. Workers in the back nod. That\'s how a champion walks.'
      },
      {
        text: '(Stop halfway. Drop to a knee. Tie your boot for ten seconds.)',
        effects: { heat: 2, pop: 1 },
        outcome: 'Crowd doesn\'t know what they\'re watching. Then they realize you\'re stalling. They start a chant.'
      }
    ]
  },
  {
    id: 'jobber_8c', chapter: 8, part: 'c',
    chapterTitle: 'THE FINAL WORD', location: 'Center ring',
    setup: "You're in the ring. Rival across from you. Bell hasn't rung. Ref has the mic. He hands it to you. Last chance to say anything to anyone in this building.",
    choices: [
      {
        text: '"I worked ten years to be here. I\'m not leaving without it."',
        effects: { pop: 3 },
        outcome: 'Crowd erupts. They believe you. They\'ve decided. This is your night.'
      },
      {
        text: '"Every guy that ever pinned me clean. Every booker that wrote me off. Watch this."',
        effects: { heat: 3, pop: 1 },
        outcome: 'Both halves of the crowd chant. The arena is shaking. The ref takes the mic carefully.'
      },
      {
        text: '"Don\'t say my name yet. Wait til the bell rings. Then you\'ll know."',
        effects: { pop: 2, push: 2 },
        outcome: 'Quiet hangs for a second. Then a long building roar. The booker watches the monitor. He doesn\'t blink.'
      }
    ]
  }
];

// ──────────────────────────────────────────────────────────────────────────────
// NEPO SON — gain 15. All 8 scenes are promos.
// ──────────────────────────────────────────────────────────────────────────────
const NEPO = [
  {
    id: 'nepo_1', chapter: 1, type: 'promo',
    setup: "Your music hits. The boos start before the first synth note. Your last name is on the building — always has been. You take the mic and walk the apron, waiting for them to settle. They don't.",
    choices: [
      {
        text: '"I love it here in sunny Tampa. Best fans in the world."',
        effects: { pop: 15, heat: -5 },
        outcome: 'The cheap pop hits. Half the boos turn to cheers. The other half get louder.'
      },
      {
        text: '"I knew Florida had ugly people. I didn\'t know there were this many."',
        effects: { pop: -5, heat: 15 },
        outcome: 'A guy in the front row throws his beer. You ducked. Mostly. The heat is real.'
      },
      {
        text: '"Yeah. Save your breath. The mic\'s on. I\'m here. Deal with it."',
        effects: { pop: 7, heat: 7, push: 7 },
        outcome: "The arena gets quiet for a beat. Then split — half pop, half heat. The booker watching backstage nods."
      }
    ]
  },
  {
    id: 'nepo_2', chapter: 2, type: 'promo',
    setup: "Mid-promo, a young midcarder hops the barricade and grabs the second mic. He's got fire. He's got nothing to lose. He stares right at you: \"You're standing on your daddy's grave.\"",
    tagSetup: "Your partner steps between you and the kid. You wave him off — this one's yours.",
    choices: [
      {
        text: '"My old man earned every dollar in this building. Watch your mouth."',
        effects: { pop: 15, heat: -5 },
        outcome: 'The crowd splits — the smarks cheer the kid, the loyalists pop for you defending dad.'
      },
      {
        text: '"You got the wrong guy. I don\'t fight at the bus stop. Get in the ring."',
        effects: { pop: -5, heat: 15 },
        outcome: 'The kid laughs in your face. The crowd loves him for it. They hate you for being above it.'
      },
      {
        text: '"Cute speech. Was that yours, or did the booker write it for you?"',
        effects: { pop: 7, heat: 7, push: 7 },
        outcome: "The kid loses his rhythm. You held the floor. The Agent in the back is making notes."
      }
    ]
  },
  {
    id: 'nepo_3', chapter: 3, type: 'promo',
    setup: "Anniversary of dad's first title win. Lights down. Single spot on the ring. Crowd hushed for once — the legacy is real to them, even if you aren't.",
    choices: [
      {
        text: '"He stood right here twenty years ago. He told me to be twice the man he was. I\'m trying."',
        effects: { pop: 15, heat: -5 },
        outcome: 'A "Thank you, Dad" chant breaks out. You didn\'t expect that. Neither did the booker.'
      },
      {
        text: '"Twenty years. I\'m doing this for twenty more. Whether you like it or not."',
        effects: { pop: -5, heat: 15 },
        outcome: 'The hush turns to boos fast. You used dad\'s night to plant your flag. They felt that.'
      },
      {
        text: '"He didn\'t believe in promos. He believed in the work. I\'ll show you the work."',
        effects: { pop: 7, heat: 7, push: 7 },
        outcome: 'You walk to the ring. No more talk. The Agent gives a small nod from the curtain — that was a worker\'s answer.'
      }
    ]
  },
  {
    id: 'nepo_4', chapter: 4, type: 'promo',
    setup: "Last week the rival aired a thirty-year-old clip of your dad in a compromising backstage moment. Crowd is hot. You're walking to the ring with the clip still hanging in everyone's heads.",
    choices: [
      {
        text: '"He\'s gone. He can\'t defend himself. So I will. Tonight."',
        effects: { pop: 15, heat: -5 },
        outcome: 'Real pop. The kind you can\'t fake. The crowd remembered why they loved your dad in the first place.'
      },
      {
        text: '"You think a thirty-year-old clip moves the needle? You don\'t know what real heat is."',
        effects: { pop: -5, heat: 15 },
        outcome: 'The rival smiles. He wanted you angry. He got it. The crowd boos you for taking the bait.'
      },
      {
        text: '"He warned me about guys like you. He was right."',
        effects: { pop: 7, heat: 7, push: 7 },
        outcome: 'A quiet line. The whole arena leans in. Sometimes less is the work.'
      }
    ]
  },
  {
    id: 'nepo_5', chapter: 5, type: 'promo',
    setup: "The champion was on TV last week. He called the AWF \"your daddy's company.\" You're in front of the home crowd. The strap is on the line in three weeks.",
    choices: [
      {
        text: '"This company belongs to the people in this building. I\'m just here to serve it."',
        effects: { pop: 15, heat: -5 },
        outcome: '"YOU DESERVE IT" chant from the upper deck. Working class fans buy the humble line.'
      },
      {
        text: '"The man calling out my family is two letters from being a footnote. Watch what I do."',
        effects: { pop: -5, heat: 15 },
        outcome: 'The crowd boos but it\'s the heat kind — they want to see if you can back it up.'
      },
      {
        text: '"I\'m not gonna talk about the champion. I\'m gonna talk about who\'s gonna be next. Spoiler — he\'s holding this mic."',
        effects: { pop: 7, heat: 7, push: 7 },
        outcome: 'A cocky setup. The kind that books itself. The Agent in the back smiles.'
      }
    ]
  },
  {
    id: 'nepo_6', chapter: 6, type: 'promo',
    setup: "Crowd has turned on you over the last month. The rival built sympathy with a series of great matches. You're standing across from him at the desk. He's quiet. You're not.",
    choices: [
      {
        text: '"You wanted me to feel something tonight? You\'re gonna feel something at the PPV. That\'s a promise."',
        effects: { pop: 15, heat: -5 },
        outcome: 'Fighting babyface energy. Half the boos flip mid-promo. The other half stay loud.'
      },
      {
        text: '"Every word out of his mouth is a lie. Every chant from this crowd is a mistake."',
        effects: { pop: -5, heat: 15 },
        outcome: 'You called the crowd wrong. Worst thing a face can do, best thing a heel can do. Pick a side.'
      },
      {
        text: '"You built a story, kid. I\'ll give you that. Now I\'m gonna end it."',
        effects: { pop: 7, heat: 7, push: 7 },
        outcome: 'Calm. Heavy. The crowd shuts up for a second. That second was for you.'
      }
    ]
  },
  {
    id: 'nepo_7', chapter: 7, type: 'promo',
    setup: "Contract signing. Both men at the table. Pen sitting between you. Crowd is feral. The Agent stands at ringside, ready for anything.",
    choices: [
      {
        text: '"I\'ll sign first. So everyone knows who showed up to work tonight."',
        effects: { pop: 15, heat: -5 },
        outcome: 'You sign clean. The crowd respects it. The rival has to follow. He looks small for it.'
      },
      {
        text: '"Sign the contract, kid. You just signed your own paycheck out of existence."',
        effects: { pop: -5, heat: 15 },
        outcome: 'Real heat. He throws the contract in your face. You knew he would. So did the cameras.'
      },
      {
        text: '"I want one thing in this contract. No DQ. No countout. Just me, you, and the truth."',
        effects: { pop: 7, heat: 7, push: 14 },
        outcome: 'The booker walks in from gorilla, signs the stipulation, walks back out. That just happened.'
      }
    ]
  },
  {
    id: 'nepo_8', chapter: 8, type: 'promo',
    setup: "Pay-per-view. Title on the line. Crowd half against you, half for you, all in. Your music is queued. The Agent gives you a look from the curtain — listen if you trusted him, ignore if you didn't.",
    choices: [
      {
        text: '"I\'m walking out with the strap and a clear conscience. That\'s what I owe the people who built this."',
        effects: { pop: 22, heat: -7 },
        outcome: 'The most face thing you\'ve ever said. The crowd decides right now whether they believe you.'
      },
      {
        text: '"When this is over, the title is mine. The legacy is mine. The company is mine."',
        effects: { pop: -7, heat: 22 },
        outcome: 'The heel line of the year. The arena is shaking with hatred. That\'s currency too.'
      },
      {
        text: '"I didn\'t ask to be here. I asked to deserve it. After tonight, you\'ll have your answer."',
        effects: { pop: 10, heat: 10, push: 10 },
        outcome: 'Quiet. Lethal. The booker exhales. Whatever happens next — you said the right thing.'
      }
    ]
  }
];

// ──────────────────────────────────────────────────────────────────────────────
// AMERICAN OUTLAW — gain 12. Promos + light politics (Ch3/5) + Curtain+Promo (Ch7).
// ──────────────────────────────────────────────────────────────────────────────
const OUTLAW = [
  {
    id: 'outlaw_1', chapter: 1, type: 'promo',
    setup: "Memphis. Country track. You step out in jeans and boots. Crowd is cautious — they don't know your name yet. They'll decide tonight if you're worth remembering.",
    choices: [
      {
        text: '"Memphis. I came up working towns just like yours. Glad to be home."',
        effects: { pop: 12, heat: -4 },
        outcome: "Warm pop from the older fans. Working-class respect. The kind that sticks."
      },
      {
        text: '"Don\'t take it personal. None of you are gonna remember being here. I will."',
        effects: { pop: -4, heat: 12 },
        outcome: 'Cold reception. They were ready to like you. You spit on it. The heat is earned.'
      },
      {
        text: '"Don\'t need an introduction. You\'ll know my name by the end of the night."',
        effects: { pop: 6, heat: 6, push: 6 },
        outcome: 'Confident. Workmanlike. The Agent at the curtain mutters "he gets it" to nobody in particular.'
      }
    ]
  },
  {
    id: 'outlaw_2', chapter: 2, type: 'promo',
    setup: "A foreign heel in a slick suit and a flute of champagne enters from the rampway. He sneers down the aisle. \"I don't even know what this hayseed is doing on my show.\"",
    tagSetup: "Your tag partner is in the corner. He whispers \"let him hang himself.\" You hear him.",
    choices: [
      {
        text: '"Where I come from, men don\'t talk like that. We do something about it."',
        effects: { pop: 12, heat: -4 },
        outcome: 'Pop on the line "men don\'t talk like that." Old-school crowd loves a code.'
      },
      {
        text: '"Your suit cost more than my truck. My truck still runs. Let\'s see how you run."',
        effects: { pop: -4, heat: 12 },
        outcome: 'He gets the pop. You took the bait and turned it on him too hard.'
      },
      {
        text: '"I don\'t have a problem with you. Yet. But you\'re working on it real hard."',
        effects: { pop: 6, heat: 6, push: 6 },
        outcome: 'Quiet menace. He stops talking for the first time tonight. The crowd noticed.'
      }
    ]
  },
  {
    id: 'outlaw_3', chapter: 3, type: 'lightPolitics',
    setup: "After your match the Agent catches you in the hallway, clipboard in hand. \"Hey kid. Booker liked what you did. He's got an idea about the finish next week. Wants you to take the pin.\"",
    choices: [
      {
        text: '"Whatever he wants. I\'m here to work."',
        effects: { push: 12 },
        outcome: 'The Agent nods. "Good kid." The push climbs because you\'re easy to book.'
      },
      {
        text: '"I don\'t change finishes after the deal\'s already done. I work the match the right way."',
        effects: { heat: 12, push: -12 },
        outcome: "Real backstage heat. The Agent walks off without a word. He won't forget that."
      },
      {
        text: '"What\'s the idea? I\'ll listen."',
        effects: {},
        outcome: 'The Agent talks for two minutes. You said yes. He liked that you asked.',
        conditional: state => state.heat > state.pop
          ? { push: 12 }
          : { push: -6 }
      }
    ]
  },
  {
    id: 'outlaw_4', chapter: 4, type: 'promo',
    setup: "Last week the rival burned an American flag on TV. The clip aired six times in one episode. You walk to the ring with the burnt remains in your hand. Crowd is silent.",
    choices: [
      {
        text: '"This is what he thinks of you. I\'m gonna do something about it. For all of you."',
        effects: { pop: 12, heat: -4 },
        outcome: 'Pop builds slow then explodes. Old-school flag-waver energy. The booker is grinning backstage.'
      },
      {
        text: '"You disrespect this country, you disrespect me. There\'s a debt coming."',
        effects: { pop: -4, heat: 12 },
        outcome: 'You went too far on the threat. Some of the crowd thought you sounded just like him.'
      },
      {
        text: '"He thinks he made a statement. He made a target."',
        effects: { pop: 6, heat: 6, push: 6 },
        outcome: 'You hand the flag to a kid in the front row and walk back up the ramp. Nobody breathes.'
      }
    ]
  },
  {
    id: 'outlaw_5', chapter: 5, type: 'lightPolitics',
    setup: "Backstage. A veteran corners you near the catering table. \"You're getting too much TV time, kid. The boys are talking. Just a heads up.\"",
    choices: [
      {
        text: '"I respect the boys. I\'ll talk to creative about it."',
        effects: { push: 12 },
        outcome: 'The vet pats your shoulder. Locker room politics handled the right way.'
      },
      {
        text: '"I show up, I work, I leave. If the boys got a problem, they can tell me to my face."',
        effects: { heat: 12, push: -12 },
        outcome: 'The vet stares at you for a long moment. "Alright." That word is gonna echo for weeks.'
      },
      {
        text: '"Who\'s talking?"',
        effects: {},
        outcome: 'The vet gives you two names. You\'ll handle it your way.',
        conditional: state => state.heat > state.pop
          ? { push: 12 }
          : { push: -6 }
      }
    ]
  },
  {
    id: 'outlaw_6', chapter: 6, type: 'promo',
    setup: "Standing across from the rival. He's smug. He's been working a heat segment all night. Crowd is yours but barely.",
    choices: [
      {
        text: '"Sunday I take what you stole. The belt and the respect of these people."',
        effects: { pop: 12, heat: -4 },
        outcome: 'Pop on "the respect of these people." That line plays in every working town in America.'
      },
      {
        text: '"Cry all you want. I\'m walking out of Sunday with everything you came in with."',
        effects: { pop: -4, heat: 12 },
        outcome: 'You went too heel on that one. The crowd remembers you for it.'
      },
      {
        text: '"I\'m not here to argue with you. I\'m here to schedule your retirement."',
        effects: { pop: 6, heat: 6, push: 6 },
        outcome: 'Cold. Funny. Threatening. All three at once. The crowd murmurs.'
      }
    ]
  },
  {
    id: 'outlaw_7', chapter: 7, type: 'curtainPromo',
    setup: "Curtain area. The Agent catches you with the clipboard. \"Brawl spot at the signing. They want you to put him through the announce table. Cleared and ready. Booker says don't deviate.\"",
    tagSetup: "Your partner is here too. He's not on the card tonight but he'll come down if you call. He's looking at you to decide.",
    choices: [
      {
        text: '(Sign clean, brawl on cue as booked.) "Tell the table guys to be ready."',
        effects: { push: 6 },
        flag: { __noShoot: true },
        outcome: 'Goes off perfect. Table breaks first try. The booker hugs the Agent at gorilla.'
      },
      {
        text: '(Skip the brawl spot.) "No table. We sign, we walk. I\'m not here for the booker\'s TV moment."',
        effects: { heat: 12, pop: 6 },
        outcome: 'Crowd disappointed. Booker furious. The vet from last week nods at you in the hallway.'
      },
      {
        text: '(Shoot promo on a hot mic.) "Forget the brawl. Give me a mic. No script. I\'ve been quiet too long."',
        effects: { pop: 12, heat: 12 },
        flag: { shootPromoGiven: true },
        outcome: 'You went off-script. Crowd is silent then deafening. The booker doesn\'t move from the monitor.'
      }
    ]
  },
  {
    id: 'outlaw_8', chapter: 8, type: 'promo',
    setup: "Sunday night. PPV. Title on the line. Crowd is split but loud. The Agent gives you a look from the curtain.",
    choices: [
      {
        text: '"I worked twelve years in the back of vans for this. Tonight I take what I built."',
        effects: { pop: 18, heat: -6 },
        outcome: 'Pop of the night. Working class wrestling fans see themselves in that line.'
      },
      {
        text: '"Every guy that ever doubted me — you\'re gonna watch this. I came for what\'s mine."',
        effects: { pop: -6, heat: 18 },
        outcome: 'The line goes too hard. Crowd starts a "you sold out" chant.'
      },
      {
        text: '"I\'m not here to make a speech. I\'m here to take a belt. See you out there."',
        effects: { pop: 8, heat: 8, push: 8 },
        outcome: 'Short. Final. The booker exhales and grabs his radio. Showtime.'
      }
    ]
  }
];

// ──────────────────────────────────────────────────────────────────────────────
// CULT HERO — gain 10. 4 promos + 2 war room (Ch3/5) + 1 curtain (Ch4) + 1 curtainPromo (Ch7).
// ──────────────────────────────────────────────────────────────────────────────
const CULT = [
  {
    id: 'cult_1', chapter: 1, type: 'promo',
    setup: "Your indie theme hits. The smart marks in the cheap seats lose their minds. The casual fans don't know what to do with you. Your gear is weird. Your hair is weird. They came to watch the champ. They got you.",
    choices: [
      {
        text: '"Some of you know me. The rest of you are about to. Either way — let\'s go."',
        effects: { pop: 10, heat: -3 },
        outcome: 'The smarts pop loud. The casuals start to come around. Inclusive face line — works.'
      },
      {
        text: '"You don\'t get me. That\'s fine. I don\'t get you either. We\'re gonna ride this out together."',
        effects: { pop: -3, heat: 10 },
        outcome: 'You insulted the casuals on purpose. The smarts loved it. The casuals booed. Mission accomplished?'
      },
      {
        text: '"I\'m not what they pitched you. I\'m what you actually wanted."',
        effects: { pop: 5, heat: 5, push: 5 },
        outcome: 'The phrase travels. The clip goes everywhere in twelve hours. The booker hates that.'
      }
    ]
  },
  {
    id: 'cult_2', chapter: 2, type: 'promo',
    setup: "A clean-cut, suited heel comes to the ring with management's backing. He calls you \"a flavor of the week the booker is humoring.\" The crowd boos him. He doesn't care.",
    tagSetup: "Your partner offers to take the mic. You shake your head — this one's personal.",
    choices: [
      {
        text: '"You\'re worried because you should be. The people in this building decide who matters. Not the suits."',
        effects: { pop: 10, heat: -3 },
        outcome: 'Pop on "the people decide." Crowd is yours. Smug heel looks at the camera, smiles.'
      },
      {
        text: '"You\'re a haircut and a contract. I\'m the reason this place sells out. We\'ll see who they remember."',
        effects: { pop: -3, heat: 10 },
        outcome: "Strong line but you went too cocky. The crowd doesn't like cocky cult heroes."
      },
      {
        text: '"You sound like the booker wrote that. He probably did."',
        effects: { pop: 5, heat: 5, push: 5 },
        outcome: 'Quiet pop. Smart-mark approval. The booker watching backstage just put down his coffee.'
      }
    ]
  },
  {
    id: 'cult_3', chapter: 3, type: 'warRoom',
    setup: "Creative meeting. The head booker has a binder open. \"We love what you're doing, kid. But we wanna repackage. Lose the look. New name. Big push.\"",
    choices: [
      {
        text: '"Whatever puts me on top, boss. You\'re driving."',
        effects: { push: 10 },
        outcome: 'Booker grins. The push moves up the wall. You sold the gimmick that got you here, but he likes you.'
      },
      {
        text: '"The look is why they\'re chanting. You change it and they go quiet. Don\'t do that to the company."',
        effects: { heat: 10, push: -10 },
        outcome: 'Cold silence. You just told the booker he doesn\'t know his job. That stays in the room. For now.'
      },
      {
        text: '"What\'s the new name? Let me hear it before I say no."',
        effects: {},
        outcome: 'Booker pitches it. The name is bad. You nod thoughtfully. He keeps talking. You bought time.',
        conditional: state => state.heat > state.pop
          ? { push: 10 }
          : { push: -5 }
      }
    ]
  },
  {
    id: 'cult_4', chapter: 4, type: 'curtain',
    setup: "Curtain. Music about to hit. The Agent steps in close. \"Booker wants you on your back for this guy tonight. Clean three count. You good?\"",
    tagSetup: "Your partner is at the curtain too. He shrugs. \"Your call, man.\" He means it.",
    choices: [
      {
        text: '"Yeah. I got him over. Tell the booker I said hello."',
        effects: {},
        flag: { gmTrusted: true },
        outcome: 'Agent nods. "Good kid." You\'re putting the company first. The Agent will remember.'
      },
      {
        text: '"Tell him I\'m gonna do what\'s right for the crowd. He\'ll figure it out."',
        effects: { push: 10 },
        flag: { gmTrusted: false },
        outcome: 'You went into business for yourself. The Agent didn\'t say a word. He turned and walked.'
      },
      {
        text: '"We\'ll figure it out in there."',
        effects: { pop: 5, heat: 5 },
        outcome: 'Vague. The Agent doesn\'t love vague. Neither does the booker. But the crowd will see something real.'
      }
    ]
  },
  {
    id: 'cult_5', chapter: 5, type: 'warRoom',
    setup: "Production meeting. The booker laid it out. \"Sunday. Stooge over you. Clean. You sell big, sympathy spot for him.\" The room is quiet.",
    choices: [
      {
        text: '"Got it. I\'ll make him look like a million bucks."',
        effects: { push: 10 },
        outcome: 'Booker nods. You\'re the easy guy now. The Agent gives you a look across the room. He saw.'
      },
      {
        text: '"The crowd is gonna riot. Read the room."',
        effects: { heat: 10, push: -10 },
        outcome: 'Booker doesn\'t look up from his notes. "We\'ll see." Three words. None of them good.'
      },
      {
        text: '"Make him work for it. Give me a near-fall sequence."',
        effects: {},
        outcome: 'Booker thinks for a second. "Two near-falls. Done." You got something.',
        conditional: state => state.heat > state.pop
          ? { push: 10 }
          : { push: -5 }
      }
    ]
  },
  {
    id: 'cult_6', chapter: 6, type: 'promo',
    setup: "Standing across from the corporate stooge. Crowd is fully yours. He has a mic and a clipboard of talking points. He looks at the clipboard.",
    choices: [
      {
        text: '"Sunday — you find out what these people want. And what they don\'t."',
        effects: { pop: 10, heat: -3 },
        outcome: 'Crowd erupts on the pivot. Stooge fumbles his cards. The cameras caught it.'
      },
      {
        text: '"I\'m not gonna out-promo you. I don\'t need to. They already chose."',
        effects: { pop: -3, heat: 10 },
        outcome: 'You sounded like the very thing you hate. Some of the crowd noticed.'
      },
      {
        text: '"You read your script. I\'ll do mine. The cameras decide."',
        effects: { pop: 5, heat: 5, push: 5 },
        outcome: 'You drop the mic and stare. Stooge has to keep going alone. Brutal.'
      }
    ]
  },
  {
    id: 'cult_7', chapter: 7, type: 'curtainPromo',
    setup: "Curtain. The Agent appears with a rewrite in his hand. \"Booker pulled an audible. He wants you to walk out before signing. We push the angle to next week. Smart play.\"",
    choices: [
      {
        text: '(Sign clean despite the audible.) "I\'m signing. Tell him I\'m signing."',
        effects: { push: 5 },
        outcome: 'You went against the booker for the right reasons. The Agent shrugs. The crowd gets a clean segment.'
      },
      {
        text: '(Brawl, big spot.) "Forget the signing. I\'m putting him through the table."',
        effects: { heat: 10, pop: 5 },
        outcome: 'Table breaks in two. Crowd is feral. The booker is laughing in spite of himself.'
      },
      {
        text: '(Shoot promo on a live mic.) "Give me five minutes. I have things to say to these people. And to the booker."',
        effects: { pop: 10, heat: 10 },
        flag: { shootPromoGiven: true },
        outcome: 'You named names. Live. The Agent muted nothing. The booker is on the radio yelling but it\'s too late.'
      }
    ]
  },
  {
    id: 'cult_8', chapter: 8, type: 'promo',
    setup: "Title match. The biggest moment of your career. Crowd fully yours. Management still doesn't believe. The Agent meets you at the curtain — you know which look he gave you.",
    choices: [
      {
        text: '"This is for everyone who chanted my name when management told you to be quiet."',
        effects: { pop: 15, heat: -5 },
        outcome: 'Loudest pop of the year. The Agent looks at his shoes. He knows what this means.'
      },
      {
        text: '"I\'m taking the belt. And every smug suit watching can chew on that."',
        effects: { pop: -5, heat: 15 },
        outcome: 'The smarks cheer. The casuals jeer. Mixed reaction but loud. Heat-built run, doubling down.'
      },
      {
        text: '"I didn\'t ask to be here. You asked me to be here. Same as it ever was."',
        effects: { pop: 7, heat: 7, push: 7 },
        outcome: 'A line that doubles as a thesis statement. Quiet. Earned. The crowd holds its breath.'
      }
    ]
  }
];

// ──────────────────────────────────────────────────────────────────────────────
// SAD CLOWN — gain 8. Same shape as Cult Hero.
// ──────────────────────────────────────────────────────────────────────────────
const CLOWN = [
  {
    id: 'clown_1', chapter: 1, type: 'promo',
    setup: "Painted face. The crowd doesn't know whether to laugh, cheer, or look away. Music is light circus. You stand center ring. Half-hearted reaction. The booker behind the curtain is already wincing.",
    choices: [
      {
        text: '"I know I look like a joke. Wait til you see the punchline."',
        effects: { pop: 8, heat: -3 },
        outcome: 'A small earnest pop. Some kids cheer. A few adults find it sad in a good way.'
      },
      {
        text: '"You\'re laughing now. You\'re gonna stop."',
        effects: { pop: -3, heat: 8 },
        outcome: 'A few uncomfortable boos. People aren\'t sure if this is a heel or a horror movie. Effective either way.'
      },
      {
        text: '"The face comes off when the bell rings. Just so we\'re clear."',
        effects: { pop: 4, heat: 4, push: 4 },
        outcome: 'You take a step toward the camera. The lens fogs from how close. Murmur from the crowd.'
      }
    ]
  },
  {
    id: 'clown_2', chapter: 2, type: 'promo',
    setup: "A polished athletic-looking heel rolls his eyes from the corner. \"I don't promo with clowns. Bring me a real opponent.\" The crowd boos him for the dismissal.",
    tagSetup: "Your partner — also painted, also unloved — stays silent in the corner. Your fight.",
    choices: [
      {
        text: '"I\'ve heard that line my whole career. I\'m still here. Where are the guys who said it before you?"',
        effects: { pop: 8, heat: -3 },
        outcome: 'Real pop. The veterans in the crowd nod. You earned that line.'
      },
      {
        text: '"You\'ll talk to me. Or you\'ll bleed. Your choice."',
        effects: { pop: -3, heat: 8 },
        outcome: 'Heel got the pop on his face — he made you sound like the threat he said you were.'
      },
      {
        text: '"Real opponent. Cute. I\'ll see you in the ring, and we\'ll find out what real means."',
        effects: { pop: 4, heat: 4, push: 4 },
        outcome: 'Quiet menace. The heel\'s face changes for the first time tonight. He clocked it.'
      }
    ]
  },
  {
    id: 'clown_3', chapter: 3, type: 'warRoom',
    setup: "Booker has a stack of sponsor emails on his desk. \"Two of them flagged the makeup. Not a vibe for the brand, they said. We gotta talk about a refresh.\"",
    choices: [
      {
        text: '"Whatever they want. I work here."',
        effects: { push: 8 },
        outcome: 'Booker pleased. You\'re the kind of guy who doesn\'t make him do extra work. Push climbs.'
      },
      {
        text: '"The makeup IS the act. You take the makeup, you take the act. There\'s no refresh."',
        effects: { heat: 8, push: -8 },
        outcome: 'Long silence. Booker shrugs. "Alright then." He doesn\'t mean alright then.'
      },
      {
        text: '"What does the refresh look like? I\'ll consider it."',
        effects: {},
        outcome: 'Booker walks you through three options. None of them are good. You nod a lot.',
        conditional: state => state.heat > state.pop
          ? { push: 8 }
          : { push: -4 }
      }
    ]
  },
  {
    id: 'clown_4', chapter: 4, type: 'curtain',
    setup: "Curtain. Music about to hit. The Agent stops you. \"Booker wants you out there cold. No paint. No entrance. Just walk. Serious face. Try it.\"",
    tagSetup: "Your partner is already half-painted. He stops mid-stripe and looks at you.",
    choices: [
      {
        text: '"Alright. No paint, no dance. Just me."',
        effects: {},
        flag: { gmTrusted: true },
        outcome: 'You walk out unpainted for the first time in eight years. Crowd silent. Different silence than usual.'
      },
      {
        text: '"I do my entrance. I do my act. That\'s the deal."',
        effects: { push: 8 },
        flag: { gmTrusted: false },
        outcome: 'Full entrance. Paint on. The Agent walked away halfway through the music. You felt it.'
      },
      {
        text: '"Half the paint. Compromise. Watch what happens."',
        effects: { pop: 4, heat: 4 },
        outcome: 'You go out with one side painted, one side bare. The crowd has no idea what they\'re watching.'
      }
    ]
  },
  {
    id: 'clown_5', chapter: 5, type: 'warRoom',
    setup: "Booker is direct. \"Last chance. The gimmick is dying. Pitch me something new or we put you in a tag with a comedy guy and call it a day.\"",
    choices: [
      {
        text: '"Whatever you want. I\'ll do the tag."',
        effects: { push: 8 },
        outcome: 'Booker nods. The repackage is happening. You\'re still on the card. That\'s the trade.'
      },
      {
        text: '"The gimmick is not dying. The booking is killing it. Give me one storyline that matters."',
        effects: { heat: 8, push: -8 },
        outcome: 'Booker stares at you. "We\'ll talk after the show." He won\'t. That\'s how this works.'
      },
      {
        text: '"I\'ll pitch you something. Give me a week."',
        effects: {},
        outcome: 'Booker shrugs. "A week." It\'s not a yes. It\'s not a no.',
        conditional: state => state.heat > state.pop
          ? { push: 8 }
          : { push: -4 }
      }
    ]
  },
  {
    id: 'clown_6', chapter: 6, type: 'promo',
    setup: "Standing across from the straight man. He's smiling. He thinks he's already won. The crowd is split — half are tired of you, half are just starting to get it.",
    choices: [
      {
        text: '"I\'ve been laughed at my entire career. I learned how to take a punch. You haven\'t. Sunday."',
        effects: { pop: 8, heat: -3 },
        outcome: 'Quiet pop that builds. The crowd hadn\'t thought of it that way. Now they have.'
      },
      {
        text: '"The paint is the only thing keeping me from doing what I want to do to you. The paint comes off Sunday."',
        effects: { pop: -3, heat: 8 },
        outcome: 'Threat too explicit. The straight man laughs. So does part of the crowd.'
      },
      {
        text: '"You can\'t out-perform me. You don\'t know what performing is."',
        effects: { pop: 4, heat: 4, push: 4 },
        outcome: 'The crowd sits with that for a second. It hits different. Like you said something true.'
      }
    ]
  },
  {
    id: 'clown_7', chapter: 7, type: 'curtainPromo',
    setup: "Curtain. Agent has the script. \"Booker wants the signing done clean. Suit and tie. No paint. He wants to see if you can do it. Big audition.\"",
    choices: [
      {
        text: '(Suit, sign clean.) "Alright. I\'ll wear the suit."',
        effects: { push: 4 },
        outcome: 'You walk out in a suit. Crowd doesn\'t recognize you for ten seconds. The booker likes that.'
      },
      {
        text: '(Suit and brawl.) "I\'ll wear the suit. Then I\'ll throw him through the table in it."',
        effects: { heat: 8, pop: 4 },
        outcome: 'Suit lasted thirty seconds. Crowd goes nuts when the table breaks. Booker shrugs.'
      },
      {
        text: '(Full paint, hot mic.) "I\'m wearing the paint. I\'m saying what nobody in this company will say."',
        effects: { pop: 8, heat: 8 },
        flag: { shootPromoGiven: true },
        outcome: 'You called out everyone. Including the booker. By name. The mic was hotter than anyone expected.'
      }
    ]
  },
  {
    id: 'clown_8', chapter: 8, type: 'promo',
    setup: "Championship match. The Agent meets you at the curtain — depending on what you told him, his face is either friendly or unreadable. Paint on or off. You already decided.",
    choices: [
      {
        text: '"I took every joke. Every backhanded compliment. Tonight — every laugh becomes a chant. Watch."',
        effects: { pop: 12, heat: -4 },
        outcome: 'Pop you didn\'t know was possible from this crowd. Every painted kid in the front row is screaming.'
      },
      {
        text: '"When this is over, none of you will be laughing. That was always the plan."',
        effects: { pop: -4, heat: 12 },
        outcome: 'The crowd doesn\'t laugh. Doesn\'t cheer. They just stare. Effective.'
      },
      {
        text: '"The act is the act. The match is the match. You\'ll see the difference Sunday."',
        effects: { pop: 6, heat: 6, push: 6 },
        outcome: 'Quiet. The arena is one frame from holding its breath. Then your music hits.'
      }
    ]
  }
];

export const SCENES = {
  jobber: JOBBER,
  nepo:   NEPO,
  outlaw: OUTLAW,
  cult:   CULT,
  clown:  CLOWN
};

// ──────────────────────────────────────────────────────────────────────────────
// ENDINGS
// ──────────────────────────────────────────────────────────────────────────────
export const ENDINGS = {
  LEGEND: {
    code: 'LEGEND',
    title: '★ LEGEND',
    body: "Pop ≥ 65 at the bell. Win in hand. They'll chant your name forever. Generations of fans will tell their kids about tonight. You earned every inch."
  },
  CONTROVERSIAL_CHAMP: {
    code: 'CONTROVERSIAL_CHAMP',
    title: 'CONTROVERSIAL CHAMP',
    body: "Heat ≥ 65 at the bell. Win in hand. They hate you. They can't look away. The boos shake the building. The merch sells out. A generation of heels will try to copy you. They'll never admit it."
  },
  BELOVED_LOSER: {
    code: 'BELOVED_LOSER',
    title: 'BELOVED LOSER',
    body: "You lost the match. You won the night. The crowd stayed past the bell. They chanted your name out of the arena. You got more from this program than the title."
  },
  FORGOTTEN: {
    code: 'FORGOTTEN',
    title: 'FORGOTTEN',
    body: "Curtain jerker for life. The wrestler who beat you is being booked for the rematch. You're being booked for the next town's opener. At least you got paid. The cycle continues."
  },
  GREATEST_UPSET_EVER: {
    code: 'GREATEST_UPSET_EVER',
    title: '★ GREATEST UPSET EVER',
    body: "The shock pin nobody saw coming. The Agent stood with his mouth open. The booker looked at the monitor and didn't move. Ten years of jobs. One title. Forever."
  },
  STILL_A_JOBBER: {
    code: 'STILL_A_JOBBER',
    title: '★ STILL A JOBBER',
    body: "You knew what this was. You always knew. A loss. A real one. The Agent gave you a pat on the back and a fifty for a beer. See you next week, pal."
  },
  WORKHORSE: {
    code: 'WORKHORSE',
    title: '★ THE WORKHORSE',
    body: "Push ≥ 65 at the bell. You never got over with the fans, never sold a shirt. But the booker stopped second-guessing your spot. The Agent puts you in every show. You\'re the guy who never misses a date and never blows a spot. They\'ll never chant your name. They\'ll never write a book about you. You\'ll work until you decide to stop. That\'s the career most of them dream about. Quietly."
  }
};

// ──────────────────────────────────────────────────────────────────────────────
// CORE LOGIC
// ──────────────────────────────────────────────────────────────────────────────

export function getSceneByIndex(characterId, sceneIndex) {
  return SCENES[characterId][sceneIndex];
}

export function getTotalScenes(characterId) {
  return SCENES[characterId].length;
}

// legacy lookup — kept for any caller still on the old chapter API
export function getScene(characterId, chapter) {
  return SCENES[characterId].find(s => s.chapter === chapter);
}

// BEAT FORMAT —————————————————————————————————————————————————————————————
// New scenes have `beats: [...]`. Each beat is one of:
//   { type: 'narration', text }
//   { type: 'speech', speaker, text }
//   { type: 'choice', options: [ { text, effects, flag, conditional, response: [...beats] } ] }
//
// Legacy scenes still use setup + choices + per-choice outcome. legacyToBeats
// converts on the fly so GameScreen can render both seamlessly.
export function legacyToBeats(scene) {
  if (scene.beats) return scene.beats;
  return [
    { type: 'narration', text: scene.setup },
    {
      type: 'choice',
      options: (scene.choices || []).map(c => ({
        text: c.text,
        effects: c.effects,
        flag: c.flag,
        conditional: c.conditional,
        response: [{ type: 'narration', text: c.outcome }]
      }))
    }
  ];
}

// Chapter recap — diegetic state-of-things between chapters. Called at the
// start of any scene where part === 'a' and chapter > 1. Returns beats.
export function getChapterRecap(state, chapterNum) {
  const { pop, heat, push } = state;
  const beats = [];

  // a passage-of-time line per chapter
  const timeLines = {
    2: 'A week passes.',
    3: 'Another week. Another TV taping.',
    4: 'The program is two months old now.',
    5: 'The PPV is on the horizon.',
    6: 'Television looms.',
    7: 'The contract signing is set for tonight.',
    8: 'PPV. Tonight is the night.'
  };
  beats.push({ type: 'narration', text: timeLines[chapterNum] || 'Time passes.' });

  // crowd status
  if (pop >= 50 && pop > heat + 5) {
    beats.push({ type: 'narration', text: 'The crowd is starting to chant your name when you walk through the curtain.' });
  } else if (heat >= 50 && heat > pop + 5) {
    beats.push({ type: 'narration', text: 'They hate you in every town. Real hate. The kind you can build a career on.' });
  } else if (pop + heat >= 80) {
    beats.push({ type: 'narration', text: 'Half the arena cheers when your music hits. The other half boos. Both are loud.' });
  } else if (pop + heat >= 40) {
    beats.push({ type: 'narration', text: 'The crowd knows your name now. They\'re still deciding how they feel about it.' });
  } else {
    beats.push({ type: 'narration', text: 'The crowd is still on their phones when you walk out.' });
  }

  // GM / push status
  if (push >= 50) {
    beats.push({ type: 'narration', text: 'The GM has been saying your name in production meetings.' });
  } else if (push >= 30) {
    beats.push({ type: 'narration', text: 'The GM is watching. He hasn\'t decided yet.' });
  } else {
    beats.push({ type: 'narration', text: 'The GM still hasn\'t said your name out loud.' });
  }

  return beats;
}

export function applyChoice(state, choiceIndex) {
  const scene = getSceneByIndex(state.character, state.sceneIndex);
  // find choice in beats (new format) or legacy choices array
  let choice;
  if (scene.beats) {
    const choiceBeat = scene.beats.find(b => b.type === 'choice');
    choice = choiceBeat?.options?.[choiceIndex];
  } else {
    choice = scene.choices?.[choiceIndex];
  }
  if (!choice) return state;

  let effects = choice.effects || {};
  if (choice.conditional) {
    effects = choice.conditional(state);
  }

  const pop  = clamp(state.pop  + (effects.pop  || 0));
  const heat = clamp(state.heat + (effects.heat || 0));
  const push = clamp(state.push + (effects.push || 0));

  const flags = { ...state.flags };
  if (choice.flag) {
    if (typeof choice.flag.gmTrusted === 'boolean') {
      flags.gmTrusted = choice.flag.gmTrusted;
    }
    if (choice.flag.partnerBetrayed != null) {
      flags.partnerBetrayed = choice.flag.partnerBetrayed;
    }
    if (choice.flag.shootPromoGiven) {
      flags.shootPromoGiven = true;
    }
    if (choice.flag.workedTheBookerDelta) {
      flags.workedTheBooker = (flags.workedTheBooker || 0) + choice.flag.workedTheBookerDelta;
    }
  }

  return {
    ...state,
    pop, heat, push,
    flags,
    history: [...state.history, { sceneIndex: state.sceneIndex, choiceIndex, outcome: choice.outcome }]
  };
}

function clamp(n) {
  if (n < 0) return 0;
  if (n > 100) return 100;
  return n;
}

export function computeWin(state) {
  const { pop, heat, push, character, flags } = state;
  const trustBonus = flags.gmTrusted === true ? GM_TRUST_BONUS
                   : flags.gmTrusted === false ? -GM_TRUST_BONUS
                   : 0;
  const p = push + trustBonus;

  if (character === 'jobber') {
    return (pop + heat + p) >= WIN_THRESHOLDS.jobber
        && (flags.workedTheBooker || 0) >= 2;
  }
  return (pop + p) >= WIN_THRESHOLDS.facePath
      || (heat + p) >= WIN_THRESHOLDS.heelPath;
}

export function getEnding(state) {
  const won = computeWin(state);
  const { pop, heat, push, character } = state;

  // WORKHORSE — push-track ending. Available to any archetype when push
  // dominates and crowd stats lag. The booker's most reliable hand.
  const workhorse = push >= 65 && pop < ENDING_GATES.legend && heat < ENDING_GATES.controversial;

  if (character === 'jobber') {
    if (workhorse) return ENDINGS.WORKHORSE;
    return won ? ENDINGS.GREATEST_UPSET_EVER : ENDINGS.STILL_A_JOBBER;
  }
  if (won && pop  >= ENDING_GATES.legend)        return ENDINGS.LEGEND;
  if (won && heat >= ENDING_GATES.controversial) return ENDINGS.CONTROVERSIAL_CHAMP;
  if (workhorse)                                  return ENDINGS.WORKHORSE;
  if (!won && pop >= ENDING_GATES.beloved)       return ENDINGS.BELOVED_LOSER;
  return ENDINGS.FORGOTTEN;
}

// Initial game state. Alignment + format are no longer chosen up front —
// alignment emerges from your Ch 1 promo pick (and running pop/heat totals);
// format defaults to solo (tag team will become an in-story decision later).
export function initialGameState({ ringName, character, music }) {
  const c = CHARACTERS[character];
  return {
    ringName,
    character,
    format: 'solo',
    partnerName: null,
    music,
    pop:  c.startStats.pop,
    heat: c.startStats.heat,
    push: c.startStats.push,
    sceneIndex: 0,
    flags: {
      gmTrusted: null,
      partnerBetrayed: false,
      shootPromoGiven: false,
      workedTheBooker: 0
    },
    history: []
  };
}
