import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, Pressable, ScrollView, Image,
  StyleSheet, SafeAreaView, StatusBar, Platform
} from 'react-native';
import * as Font from 'expo-font';

import { CHARACTERS, CHARACTER_ORDER, CHAPTER_TITLES } from './src/characters';
import {
  getSceneByIndex, getTotalScenes, applyChoice, getEnding, initialGameState,
  legacyToBeats, getChapterRecap
} from './src/story';
import { getSceneImage } from './src/sceneImages';
import { THEMES, THEME_ORDER, configureAudio, playTheme, previewTheme, stopTheme, toggleMute, isMuted } from './src/audio';
import {
  VICE, SCREENS, ALIGNMENTS, FORMATS,
  RING_NAME_MAX, CHAPTER_COUNT
} from './src/constants';

// ─── ROOT ─────────────────────────────────────────────────────────────────────
export default function App() {
  const [fontsReady, setFontsReady] = useState(false);
  const [screen, setScreen]   = useState(SCREENS.TITLE);
  const [draft, setDraft]     = useState({
    ringName: '',
    character: 'jobber',  // only playable character for now
    music: null
  });
  const [game, setGame]       = useState(null);
  const [ending, setEnding]   = useState(null);

  useEffect(() => {
    (async () => {
      try {
        // Press Start 2P. Drop the .ttf into /assets/fonts/ and uncomment the require.
        // Until then we fall back to system monospace and the app still runs.
        // await Font.loadAsync({ PressStart2P: require('./assets/fonts/PressStart2P-Regular.ttf') });
      } catch (e) {
        console.warn('[font] load failed, using monospace fallback:', e?.message);
      }
      await configureAudio();
      setFontsReady(true);
    })();
  }, []);

  const go = (next) => setScreen(next);

  const resetAll = () => {
    stopTheme();
    setDraft({ ringName: '', character: 'jobber', music: null });
    setGame(null); setEnding(null);
    setScreen(SCREENS.TITLE);
  };

  const beginGame = () => {
    stopTheme(); // kill the music-select preview
    const initial = initialGameState(draft);
    setGame(initial);
    setEnding(null);
    // theme no longer auto-plays — scenes trigger it via musicCue
    setScreen(SCREENS.GAME);
  };

  // GameScreen calls these. Choice → state update. Scene-done → advance index.
  const handleChoice = (idx) => setGame(applyChoice(game, idx));

  const advanceScene = () => {
    const nextIndex = game.sceneIndex + 1;
    if (nextIndex >= getTotalScenes(game.character)) {
      stopTheme();
      setEnding(getEnding(game));
      setScreen(SCREENS.ENDING);
      return;
    }
    setGame({ ...game, sceneIndex: nextIndex });
  };

  if (!fontsReady) {
    return (
      <View style={styles.shell}>
        <Text style={[styles.h1, { color: VICE.cyan }]}>LOADING…</Text>
      </View>
    );
  }

  let body = null;
  switch (screen) {
    case SCREENS.TITLE:     body = <TitleScreen onStart={() => go(SCREENS.RING_NAME)} />; break;
    case SCREENS.RING_NAME: body = <RingNameScreen draft={draft} setDraft={setDraft} onNext={() => go(SCREENS.MUSIC)} onBack={() => go(SCREENS.TITLE)} />; break;
    case SCREENS.MUSIC:     body = <MusicScreen draft={draft} setDraft={setDraft} onNext={beginGame} onBack={() => go(SCREENS.RING_NAME)} />; break;
    case SCREENS.GAME:      body = <GameScreen game={game} onChoice={handleChoice} onAdvance={advanceScene} />; break;
    case SCREENS.ENDING:    body = <EndingScreen ending={ending} game={game} onRestart={resetAll} />; break;
    default: body = null;
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" />
      <View style={styles.shell}>
        <ScrollView contentContainerStyle={styles.scroll}>
          {body}
        </ScrollView>
        <Scanlines />
      </View>
    </SafeAreaView>
  );
}

// ─── SCREENS ──────────────────────────────────────────────────────────────────

function TitleScreen({ onStart }) {
  return (
    <View style={styles.center}>
      <Text style={styles.titleSmall}>★ APEX WRESTLING FEDERATION ★</Text>
      <Text style={styles.titleBig}>AWF</Text>
      <Text style={styles.titleSub}>WRESTLING{'\n'}PROMOS</Text>
      <View style={{ height: 24 }} />
      <Text style={styles.muted}>v0.1 · KAYFABE IS REAL</Text>
      <View style={{ height: 40 }} />
      <Btn onPress={onStart} label="▶ PRESS START" wide />
    </View>
  );
}

function RingNameScreen({ draft, setDraft, onNext, onBack }) {
  return (
    <View>
      <Header>RING NAME</Header>
      <Text style={styles.body}>What do they call you on the card?</Text>
      <View style={{ height: 20 }} />
      <TextInput
        value={draft.ringName}
        onChangeText={(t) => setDraft({ ...draft, ringName: t.toUpperCase().slice(0, RING_NAME_MAX) })}
        maxLength={RING_NAME_MAX}
        placeholder="ENTER NAME"
        placeholderTextColor={VICE.textDim}
        autoFocus
        style={styles.input}
      />
      <Text style={styles.small}>{RING_NAME_MAX - draft.ringName.length} CHARS LEFT</Text>
      <NavRow onBack={onBack} onNext={onNext} canNext={!!draft.ringName.trim()} />
    </View>
  );
}

function CharacterScreen({ draft, setDraft, onNext, onBack }) {
  return (
    <View>
      <Header>SELECT WRESTLER</Header>
      {CHARACTER_ORDER.map(id => {
        const c = CHARACTERS[id];
        const selected = draft.character === id;
        const locked   = c.comingSoon;
        return (
          <Pressable
            key={id}
            onPress={locked ? null : () => setDraft({ ...draft, character: id })}
            style={[
              styles.card,
              selected && styles.cardSelected,
              locked   && styles.cardLocked
            ]}
          >
            <View style={styles.cardHeader}>
              <Text style={[styles.cardTitle, locked && styles.lockedText]}>{c.name}</Text>
              {locked && <Text style={styles.comingSoonBadge}>COMING SOON</Text>}
            </View>
            <View style={styles.row}>
              <DiffBar level={c.difficultyBar} />
              <Text style={[styles.muted, locked && styles.lockedText]}>{c.difficulty}</Text>
            </View>
            <Text style={[styles.body, locked && styles.lockedText]}>{c.blurb}</Text>
            <Text style={[styles.small, locked && styles.lockedText]}>Primary: {c.primary}</Text>
            <Text style={[styles.small, locked && styles.lockedText]}>Secondary: {c.secondary}</Text>
          </Pressable>
        );
      })}
      <NavRow onBack={onBack} onNext={onNext} canNext={!!draft.character} />
    </View>
  );
}

function AlignmentScreen({ draft, setDraft, onNext, onBack }) {
  return (
    <View>
      <Header>FACE OR HEEL?</Header>
      <Pressable onPress={() => setDraft({ ...draft, alignment: ALIGNMENTS.FACE })}
        style={[styles.card, draft.alignment === ALIGNMENTS.FACE && styles.cardSelected]}>
        <Text style={styles.cardTitle}>FACE</Text>
        <Text style={styles.body}>Vulnerability. Fighting spirit. Win the crowd the hard way. They start lukewarm.</Text>
      </Pressable>
      <Pressable onPress={() => setDraft({ ...draft, alignment: ALIGNMENTS.HEEL })}
        style={[styles.card, draft.alignment === ALIGNMENTS.HEEL && styles.cardSelected]}>
        <Text style={styles.cardTitle}>HEEL</Text>
        <Text style={styles.body}>Manipulation. Contempt for the fans is your weapon. The war room favors you — heels are easier to book.</Text>
      </Pressable>
      <NavRow onBack={onBack} onNext={onNext} canNext={!!draft.alignment} />
    </View>
  );
}

function FormatScreen({ draft, setDraft, onNext, onBack }) {
  return (
    <View>
      <Header>SOLO OR TAG TEAM?</Header>
      <Pressable onPress={() => setDraft({ ...draft, format: FORMATS.SOLO })}
        style={[styles.card, draft.format === FORMATS.SOLO && styles.cardSelected]}>
        <Text style={styles.cardTitle}>SOLO</Text>
        <Text style={styles.body}>Harder. Every moment is yours alone. No partner to lean on. No partner to turn on you.</Text>
      </Pressable>
      <Pressable onPress={() => setDraft({ ...draft, format: FORMATS.TAG })}
        style={[styles.card, draft.format === FORMATS.TAG && styles.cardSelected]}>
        <Text style={styles.cardTitle}>TAG TEAM</Text>
        <Text style={styles.body}>Easier. A partner shares the load. But trust is a stat too — and partners do turn.</Text>
      </Pressable>
      <NavRow onBack={onBack} onNext={onNext} canNext={!!draft.format} />
    </View>
  );
}

function TagNameScreen({ draft, setDraft, onNext, onBack }) {
  return (
    <View>
      <Header>TAG PARTNER</Header>
      <Text style={styles.body}>Your partner's ring name.</Text>
      <TextInput
        value={draft.partnerName}
        onChangeText={(t) => setDraft({ ...draft, partnerName: t.toUpperCase().slice(0, RING_NAME_MAX) })}
        maxLength={RING_NAME_MAX}
        placeholder="ENTER NAME"
        placeholderTextColor={VICE.textDim}
        style={styles.input}
      />
      <NavRow onBack={onBack} onNext={onNext} canNext={!!draft.partnerName.trim()} />
    </View>
  );
}

function MusicScreen({ draft, setDraft, onNext, onBack }) {
  return (
    <View>
      <Header>ENTRANCE MUSIC</Header>
      {THEME_ORDER.map(id => {
        const t = THEMES[id];
        const selected = draft.music === id;
        return (
          <Pressable
            key={id}
            onPress={() => { setDraft({ ...draft, music: id }); previewTheme(id); }}
            style={[styles.card, selected && styles.cardSelected]}
          >
            <Text style={styles.cardTitle}>{t.label}</Text>
            <Text style={styles.body}>{t.blurb}</Text>
            <Text style={styles.small}>BPM {t.bpm}{selected ? '   ▶ PREVIEW' : ''}</Text>
          </Pressable>
        );
      })}
      <NavRow onBack={onBack} onNext={onNext} canNext={!!draft.music} nextLabel="START MATCH →" />
    </View>
  );
}

// ─── FF-style helpers ─────────────────────────────────────────────────────────

function useTypewriter(text, speed = 22) {
  const [displayed, setDisplayed] = useState('');
  const [done, setDone] = useState(false);

  useEffect(() => {
    setDisplayed('');
    setDone(false);
    if (!text) { setDone(true); return; }
    let i = 0;
    const id = setInterval(() => {
      i++;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) {
        clearInterval(id);
        setDone(true);
      }
    }, speed);
    return () => clearInterval(id);
  }, [text, speed]);

  const skip = () => { setDisplayed(text || ''); setDone(true); };
  return { displayed, done, skip };
}

function DialogueBox({ text, label, speaker, onAdvance, advanceHint = '▼' }) {
  const { displayed, done, skip } = useTypewriter(text);
  return (
    <Pressable onPress={done ? onAdvance : skip} style={styles.dialogueBox}>
      {!!speaker && <Text style={styles.dialogueSpeaker}>{speaker}</Text>}
      {!speaker && !!label && <Text style={styles.dialogueLabel}>{label}</Text>}
      <Text style={styles.dialogueText}>{displayed}</Text>
      {done && <Text style={styles.dialogueHint}>{advanceHint}</Text>}
    </Pressable>
  );
}

function ChoiceMenu({ choices, onSelect }) {
  return (
    <View style={styles.choiceMenu}>
      {choices.map((c, i) => (
        <Pressable key={i} onPress={() => onSelect(i)} style={styles.choiceMenuItem}>
          <Text style={styles.choiceCursor}>▶</Text>
          <Text style={styles.choiceMenuText}>{c.text}</Text>
        </Pressable>
      ))}
    </View>
  );
}

function MiniHud({ game }) {
  const [mute, setMute] = useState(isMuted());
  const handleMute = async () => {
    const next = await toggleMute();
    setMute(next);
  };
  return (
    <View style={styles.miniHud}>
      <Text style={styles.miniHudName}>{game.ringName}</Text>
      <View style={styles.miniHudStats}>
        <MiniStat label="POP"  value={game.pop}  color={VICE.cyan} />
        <MiniStat label="HEAT" value={game.heat} color={VICE.border} />
        <MiniStat label="PUSH" value={game.push} color={VICE.yellow} />
      </View>
      <Pressable onPress={handleMute} style={styles.muteBtn} hitSlop={8}>
        <Text style={styles.muteBtnText}>{mute ? '♪̸' : '♪'}</Text>
      </Pressable>
    </View>
  );
}
function MiniStat({ label, value, color }) {
  return (
    <View style={styles.miniStat}>
      <Text style={[styles.miniStatLabel, { color }]}>{label}</Text>
      <Text style={[styles.miniStatValue, { color }]}>{String(value).padStart(2, '0')}</Text>
    </View>
  );
}

function ChapterStrip({ scene, chapterScenes, partsIndex }) {
  const chTitle  = (scene.chapterTitle || CHAPTER_TITLES[scene.chapter - 1] || '').toUpperCase();
  const location = (scene.location || '').toUpperCase();
  return (
    <View style={styles.chapterStrip}>
      <View style={styles.chapterStripRow}>
        <Text style={styles.chapterNum}>{`CH ${scene.chapter} / ${CHAPTER_COUNT}`}</Text>
        <Text style={styles.chapterTitleText}>{chTitle}</Text>
        {chapterScenes && (
          <View style={styles.progressDots}>
            {chapterScenes.map((_, i) => (
              <View key={i} style={[styles.dot, i <= partsIndex && styles.dotActive]} />
            ))}
          </View>
        )}
      </View>
      {!!location && <Text style={styles.locationText}>{location}</Text>}
    </View>
  );
}

// ─── GAME SCREEN — visual-novel beat flow ─────────────────────────────────────

function GameScreen({ game, onChoice, onAdvance }) {
  const scene  = getSceneByIndex(game.character, game.sceneIndex);
  const total  = getTotalScenes(game.character);
  const isLastScene = game.sceneIndex >= total - 1;
  const nextScene   = !isLastScene ? getSceneByIndex(game.character, game.sceneIndex + 1) : null;
  const isChapterEnd = nextScene && nextScene.chapter !== scene.chapter;

  // build beat list for this scene. Prepend chapter recap on the FIRST scene
  // of any chapter past 1 (i.e. part === 'a' && chapter > 1).
  const buildInitialBeats = () => {
    const sceneBeats = legacyToBeats(scene);
    if (scene.part === 'a' && scene.chapter > 1) {
      return [...getChapterRecap(game, scene.chapter), ...sceneBeats];
    }
    return sceneBeats;
  };

  const [beats, setBeats] = useState(buildInitialBeats);
  const [beatIndex, setBeatIndex] = useState(0);

  useEffect(() => {
    setBeats(buildInitialBeats());
    setBeatIndex(0);
    // music cue — entrance scenes fire 'play', in-ring scenes fire 'stop'
    if (scene.musicCue === 'play') playTheme(game.music);
    else if (scene.musicCue === 'stop') stopTheme();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scene.id]);

  const beat = beats[beatIndex];
  const isLastBeat = beatIndex >= beats.length - 1;

  const advanceBeat = () => {
    if (isLastBeat) {
      onAdvance();
    } else {
      setBeatIndex(beatIndex + 1);
    }
  };

  const pickChoice = (i) => {
    const choice = beat.options[i];
    onChoice(i); // apply stat/flag effects via parent
    const response = choice.response || [];
    // splice response beats in after the current choice beat
    const newBeats = [
      ...beats.slice(0, beatIndex + 1),
      ...response,
      ...beats.slice(beatIndex + 1)
    ];
    setBeats(newBeats);
    setBeatIndex(beatIndex + 1);
  };

  // chapter strip — derived per-chapter scene list for progress dots
  const chapterScenes = scene.part
    ? Array.from({ length: total }, (_, i) => getSceneByIndex(game.character, i))
        .filter(s => s.chapter === scene.chapter)
    : null;
  const partsIndex = chapterScenes ? chapterScenes.findIndex(s => s.part === scene.part) : -1;

  return (
    <View>
      <MiniHud game={game} />
      <ChapterStrip scene={scene} chapterScenes={chapterScenes} partsIndex={partsIndex} />
      <ScenePanel scene={scene} />

      {beat?.type === 'choice' ? (
        <ChoiceMenu choices={beat.options} onSelect={pickChoice} />
      ) : (
        <DialogueBox
          text={beat?.text}
          speaker={beat?.type === 'speech' ? beat.speaker : null}
          onAdvance={advanceBeat}
          advanceHint={
            isLastBeat && isLastScene  ? '▶ SEE RESULT'
          : isLastBeat && isChapterEnd ? '▶ NEXT CHAPTER'
          :                              '▶ CONTINUE'
          }
        />
      )}
    </View>
  );
}

function EndingScreen({ ending, game, onRestart }) {
  return (
    <View>
      <Header>{ending.title}</Header>
      <Hud game={game} />
      <Text style={styles.setup}>{ending.body}</Text>
      <View style={{ height: 16 }} />
      <Text style={styles.small}>★ {game.ringName} ★</Text>
      <Text style={styles.small}>{CHARACTERS[game.character].name} · {game.heat > game.pop ? 'HEEL' : 'FACE'}</Text>
      <View style={{ height: 24 }} />
      <Btn onPress={onRestart} label="NEW CAREER" wide />
    </View>
  );
}

// ─── PRIMITIVES ───────────────────────────────────────────────────────────────

function Btn({ label, onPress, disabled, wide }) {
  return (
    <Pressable
      onPress={disabled ? null : onPress}
      style={[
        styles.btn,
        wide && styles.btnWide,
        disabled && styles.btnDisabled
      ]}
    >
      <Text style={[styles.btnText, disabled && styles.btnTextDisabled]}>{label}</Text>
    </Pressable>
  );
}

function NavRow({ onBack, onNext, canNext, nextLabel = 'NEXT →' }) {
  return (
    <View style={styles.navRow}>
      <Btn onPress={onBack} label="← BACK" />
      <Btn onPress={onNext} label={nextLabel} disabled={!canNext} />
    </View>
  );
}

function Header({ children }) {
  return <Text style={styles.h2}>{children}</Text>;
}
function Footer({ children }) {
  return <View style={{ marginTop: 16 }}>{children}</View>;
}

function DiffBar({ level }) {
  return (
    <View style={styles.diffBar}>
      {[1, 2, 3, 4, 5].map(i => (
        <View key={i} style={[
          styles.diffPip,
          { backgroundColor: i <= level ? VICE.border : VICE.borderDim }
        ]} />
      ))}
    </View>
  );
}

function Hud({ game }) {
  return (
    <View style={styles.hud}>
      <Text style={styles.hudName}>{game.ringName}</Text>
      <View style={styles.hudStats}>
        <StatBar label="POP"  value={game.pop}  color={VICE.cyan} />
        <StatBar label="HEAT" value={game.heat} color={VICE.border} />
        <StatBar label="PUSH" value={game.push} color={VICE.yellow} />
      </View>
    </View>
  );
}

function StatBar({ label, value, color }) {
  return (
    <View style={styles.statBlock}>
      <Text style={[styles.statLabel, { color }]}>{label}</Text>
      <View style={styles.statBarBg}>
        <View style={[styles.statBarFill, { width: `${value}%`, backgroundColor: color }]} />
      </View>
      <Text style={[styles.statValue, { color }]}>{String(value).padStart(2, '0')}</Text>
    </View>
  );
}

function ScenePanel({ scene }) {
  const img = getSceneImage(scene.id);
  if (img) {
    return (
      <View style={styles.scenePanelFrame}>
        <Image source={img} style={styles.sceneImage} resizeMode="cover" />
      </View>
    );
  }
  // placeholder when no art yet — neon block with scene id, looks intentional
  return (
    <View style={styles.scenePanelPlaceholder}>
      <Text style={styles.placeholderId}>{scene.id.toUpperCase().replace('_', ' · ')}</Text>
      <Text style={styles.placeholderTag}>[ ART PENDING ]</Text>
    </View>
  );
}

function Scanlines() {
  // overlay of horizontal lines for the DMG/CRT feel
  return (
    <View pointerEvents="none" style={styles.scanlines}>
      {Array.from({ length: 80 }).map((_, i) => (
        <View key={i} style={styles.scanline} />
      ))}
    </View>
  );
}

// ─── STYLES ───────────────────────────────────────────────────────────────────

const PIXEL = Platform.select({ ios: 'PressStart2P', android: 'PressStart2P', default: 'monospace' });

const styles = StyleSheet.create({
  safe:   { flex: 1, backgroundColor: VICE.bg },
  shell:  { flex: 1, backgroundColor: VICE.bg, position: 'relative' },
  scroll: { padding: 16, paddingBottom: 60 },
  center: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60 },

  // arcade title typography
  titleBig:   { fontFamily: PIXEL, fontSize: 72, color: VICE.yellow,  textAlign: 'center', letterSpacing: 8, marginTop: 8 },
  titleSmall: { fontFamily: PIXEL, fontSize: 9,  color: VICE.cyan,    textAlign: 'center', letterSpacing: 2, marginBottom: 16 },
  titleSub:   { fontFamily: PIXEL, fontSize: 16, color: VICE.border,  textAlign: 'center', letterSpacing: 4, marginTop: 16, lineHeight: 26 },

  h1: { fontFamily: PIXEL, fontSize: 32, color: VICE.yellow, textAlign: 'center', letterSpacing: 3 },
  h2: { fontFamily: PIXEL, fontSize: 16, color: VICE.cyan,   textAlign: 'center', marginVertical: 14, letterSpacing: 2 },

  body:  { fontFamily: PIXEL, fontSize: 11, color: VICE.text,    lineHeight: 18 },
  small: { fontFamily: PIXEL, fontSize: 8,  color: VICE.textDim, lineHeight: 14 },
  muted: { fontFamily: PIXEL, fontSize: 9,  color: VICE.textDim, textAlign: 'center', marginTop: 4, letterSpacing: 1 },
  label: { fontFamily: PIXEL, fontSize: 10, color: VICE.cyan,    marginBottom: 6, letterSpacing: 1 },

  setup: {
    fontFamily: PIXEL, fontSize: 11, color: VICE.text, lineHeight: 20,
    marginBottom: 16, padding: 14,
    borderWidth: 2, borderColor: VICE.cyan, backgroundColor: VICE.panel
  },

  chapterBar: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline',
    marginTop: 6
  },
  chapterNum:       { fontFamily: PIXEL, fontSize: 10, color: VICE.textDim, letterSpacing: 1 },
  chapterTitleText: { fontFamily: PIXEL, fontSize: 14, color: VICE.yellow,  letterSpacing: 2 },
  locationText:     { fontFamily: PIXEL, fontSize: 9,  color: VICE.cyan,    letterSpacing: 2, textAlign: 'center', marginTop: 4, marginBottom: 4 },

  progressDots: { flexDirection: 'row', justifyContent: 'center', marginVertical: 8 },
  dot:          { width: 10, height: 10, marginHorizontal: 4, borderWidth: 1, borderColor: VICE.borderDim, backgroundColor: 'transparent' },
  dotActive:    { backgroundColor: VICE.border, borderColor: VICE.border },

  scenePanelFrame: {
    aspectRatio: 1, width: '100%',
    borderWidth: 3, borderColor: VICE.border,
    backgroundColor: VICE.black, marginVertical: 12
  },
  sceneImage: { width: '100%', height: '100%' },

  scenePanelPlaceholder: {
    aspectRatio: 1, width: '100%',
    borderWidth: 3, borderColor: VICE.borderDim,
    backgroundColor: VICE.bgLight,
    alignItems: 'center', justifyContent: 'center',
    marginVertical: 12
  },
  placeholderId:  { fontFamily: PIXEL, fontSize: 14, color: VICE.cyan,   letterSpacing: 2, marginBottom: 8 },
  placeholderTag: { fontFamily: PIXEL, fontSize: 9,  color: VICE.textDim, letterSpacing: 2 },

  card: {
    borderWidth: 3, borderColor: VICE.borderDim, padding: 14, marginBottom: 10,
    backgroundColor: VICE.panel
  },
  cardSelected: { borderColor: VICE.border, backgroundColor: VICE.panelHi },
  cardLocked:   { borderColor: VICE.borderDim, backgroundColor: VICE.bgLight, opacity: 0.55 },
  lockedText:   { color: VICE.textDim },
  cardHeader:   { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  comingSoonBadge: { fontFamily: PIXEL, fontSize: 8, color: VICE.border, letterSpacing: 1, borderWidth: 1, borderColor: VICE.border, paddingHorizontal: 6, paddingVertical: 2 },
  cardTitle:    { fontFamily: PIXEL, fontSize: 14, color: VICE.yellow, letterSpacing: 1 },

  row:     { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  diffBar: { flexDirection: 'row', marginRight: 10 },
  diffPip: { width: 12, height: 12, marginRight: 3 },

  input: {
    fontFamily: PIXEL, fontSize: 14, color: VICE.yellow,
    borderWidth: 3, borderColor: VICE.border, padding: 12,
    backgroundColor: VICE.bgLight, marginBottom: 12, letterSpacing: 3, textAlign: 'center'
  },

  btn: {
    borderWidth: 3, borderColor: VICE.border, paddingVertical: 12, paddingHorizontal: 18,
    backgroundColor: VICE.panelHi, alignSelf: 'center', marginVertical: 6
  },
  btnWide:        { alignSelf: 'stretch', alignItems: 'center' },
  btnDisabled:    { borderColor: VICE.borderDim, backgroundColor: VICE.bgLight },
  btnText:        { fontFamily: PIXEL, fontSize: 12, color: VICE.yellow, letterSpacing: 2 },
  btnTextDisabled:{ color: VICE.textDim },

  navRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 14 },

  // ─── FF-style dialogue + choice menu ───────────────────────────────────
  dialogueBox: {
    borderWidth: 3, borderColor: VICE.cyan,
    backgroundColor: VICE.bg,
    padding: 16, marginTop: 14, minHeight: 140,
    justifyContent: 'flex-start'
  },
  dialogueLabel: {
    fontFamily: PIXEL, fontSize: 9, color: VICE.yellow,
    textAlign: 'center', letterSpacing: 2, marginBottom: 10
  },
  dialogueSpeaker: {
    fontFamily: PIXEL, fontSize: 11, color: VICE.yellow,
    letterSpacing: 2, marginBottom: 8
  },
  dialogueText: {
    fontFamily: PIXEL, fontSize: 12, color: VICE.text, lineHeight: 22
  },
  dialogueHint: {
    fontFamily: PIXEL, fontSize: 11, color: VICE.yellow,
    textAlign: 'right', marginTop: 12, letterSpacing: 2,
    borderTopWidth: 1, borderTopColor: VICE.borderDim, paddingTop: 10
  },

  choiceMenu: {
    borderWidth: 3, borderColor: VICE.border,
    backgroundColor: VICE.bg,
    padding: 14, marginTop: 14
  },
  choiceMenuItem: {
    flexDirection: 'row', alignItems: 'flex-start',
    paddingVertical: 10, paddingHorizontal: 6
  },
  choiceCursor: {
    fontFamily: PIXEL, fontSize: 14, color: VICE.yellow,
    marginRight: 12, marginTop: 2, width: 18
  },
  choiceMenuText: {
    fontFamily: PIXEL, fontSize: 12, color: VICE.text,
    flex: 1, lineHeight: 22
  },

  // ─── mini HUD strip at top ─────────────────────────────────────────────
  miniHud: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    borderWidth: 2, borderColor: VICE.border, backgroundColor: VICE.panel,
    paddingVertical: 6, paddingHorizontal: 10, marginBottom: 8
  },
  miniHudName:  { fontFamily: PIXEL, fontSize: 10, color: VICE.yellow, letterSpacing: 2, flex: 1 },
  miniHudStats: { flexDirection: 'row' },
  miniStat:     { alignItems: 'center', marginLeft: 10, minWidth: 36 },
  miniStatLabel:{ fontFamily: PIXEL, fontSize: 7, letterSpacing: 1 },
  miniStatValue:{ fontFamily: PIXEL, fontSize: 11, marginTop: 2 },

  muteBtn: {
    marginLeft: 12, paddingHorizontal: 8, paddingVertical: 4,
    borderWidth: 1, borderColor: VICE.cyan
  },
  muteBtnText: { fontFamily: PIXEL, fontSize: 14, color: VICE.cyan },

  // ─── chapter strip ─────────────────────────────────────────────────────
  chapterStrip:    { marginVertical: 4 },
  chapterStripRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },

  hud: {
    borderWidth: 2, borderColor: VICE.border, padding: 12, backgroundColor: VICE.panel,
    marginBottom: 14
  },
  hudName:  { fontFamily: PIXEL, fontSize: 13, color: VICE.yellow, marginBottom: 10, letterSpacing: 3, textAlign: 'center' },
  hudStats: {},

  statBlock:   { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  statLabel:   { fontFamily: PIXEL, fontSize: 9, width: 44, letterSpacing: 1 },
  statBarBg:   { flex: 1, height: 12, borderWidth: 1, borderColor: VICE.textDim, marginHorizontal: 8, backgroundColor: VICE.black },
  statBarFill: { height: '100%' },
  statValue:   { fontFamily: PIXEL, fontSize: 9, width: 26, textAlign: 'right' },

  scanlines: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.12,
    flexDirection: 'column',
    justifyContent: 'space-between'
  },
  scanline: { height: 1, backgroundColor: VICE.black, marginBottom: 2 }
});
