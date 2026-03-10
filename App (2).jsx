import {
  useState, useEffect, useRef, useCallback, useMemo,
  useReducer, useContext, createContext, memo, Component,
} from "react";

// ── Design System ──────────────────────────────────────────────────────────────
const C = Object.freeze({
  base:        "#F5F1EB",
  elevated:    "#FFFFFF",
  sunken:      "#EDE8DF",
  ink:         "#1B1916",
  inkSub:      "#3E3A33",
  inkMuted:    "#7A7468",
  inkFaint:    "#B0AA9F",
  inkGhost:    "#CEC8BF",
  brand:       "#B87255",
  brandDk:     "#9A5C3E",
  brandLt:     "#F0E4D8",
  brandMd:     "#C98468",
  brandA12:    "rgba(184,114,85,0.12)",
  brandA22:    "rgba(184,114,85,0.22)",
  sage:        "#6A917E",
  sageDk:      "#4F7260",
  sageLt:      "#E5EFEA",
  sageA14:     "rgba(106,145,126,0.14)",
  gold:        "#C49A3C",
  goldLt:      "#FBF3E0",
  goldDk:      "#A07A28",
  goldA14:     "rgba(196,154,60,0.14)",
  violet:      "#8B7EC8",
  violetLt:    "#EEEAF8",
  amber:       "#C4873C",
  amberLt:     "#FBF0E0",
  border:      "rgba(27,25,22,0.08)",
  borderMd:    "rgba(27,25,22,0.14)",
  shadowXs:    "0 1px 3px rgba(27,25,22,0.06)",
  shadowSm:    "0 2px 8px rgba(27,25,22,0.07),0 1px 3px rgba(27,25,22,0.04)",
  shadowMd:    "0 4px 16px rgba(27,25,22,0.08),0 2px 6px rgba(27,25,22,0.05)",
  shadowLg:    "0 8px 32px rgba(27,25,22,0.10),0 4px 12px rgba(27,25,22,0.06)",
  shadowGold:  "0 6px 28px rgba(196,154,60,0.28),0 2px 8px rgba(196,154,60,0.14)",
  shadowBrand: "0 6px 28px rgba(184,114,85,0.28),0 2px 8px rgba(184,114,85,0.14)",
  sidebarW:    "240px",
});

const F = Object.freeze({
  display: `"Playfair Display", Georgia, serif`,
  body:    `"Outfit", "Helvetica Neue", system-ui, sans-serif`,
  mono:    `"DM Mono", monospace`,
});

const SP  = Object.freeze({ xs:4, sm:8, md:12, lg:16, xl:20, xxl:24, xxxl:32 });
const R   = Object.freeze({ sm:8, md:12, lg:16, xl:20, xxl:28, pill:100 });
const TAP = 52;

const TY = Object.freeze({
  d1:   { fontFamily:F.display, fontSize:32, fontWeight:700, lineHeight:1.14, letterSpacing:-0.6 },
  d2:   { fontFamily:F.display, fontSize:26, fontWeight:600, lineHeight:1.20, letterSpacing:-0.3 },
  d3:   { fontFamily:F.display, fontSize:22, fontWeight:600, lineHeight:1.26, letterSpacing:-0.2 },
  d4:   { fontFamily:F.display, fontSize:18, fontWeight:500, lineHeight:1.35 },
  h1:   { fontFamily:F.body,    fontSize:20, fontWeight:600, lineHeight:1.32 },
  h2:   { fontFamily:F.body,    fontSize:17, fontWeight:600, lineHeight:1.38 },
  b1sb: { fontFamily:F.body,    fontSize:16, fontWeight:600, lineHeight:1.50 },
  b2:   { fontFamily:F.body,    fontSize:14, fontWeight:400, lineHeight:1.55 },
  b2md: { fontFamily:F.body,    fontSize:14, fontWeight:500, lineHeight:1.55 },
  b3:   { fontFamily:F.body,    fontSize:12, fontWeight:400, lineHeight:1.58 },
  b3md: { fontFamily:F.body,    fontSize:12, fontWeight:500, lineHeight:1.58 },
  lbl:  { fontFamily:F.mono,    fontSize:9,  fontWeight:500, lineHeight:1.40, letterSpacing:2, textTransform:"uppercase" },
  c1sb: { fontFamily:F.mono,    fontSize:11, fontWeight:600, lineHeight:1.40, letterSpacing:0.5 },
});

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,500;0,600;0,700;1,400;1,600&family=Outfit:wght@300;400;500;600&family=DM+Mono:wght@400;500;600&display=swap');
  *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; -webkit-font-smoothing:antialiased; }
  html, body, #root { height:100%; width:100%; }
  body { background:${C.base}; overscroll-behavior:none; -webkit-text-size-adjust:100%; font-family:${F.body}; }
  * { touch-action:manipulation; -webkit-tap-highlight-color:transparent; }
  @keyframes riseUp    { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
  @keyframes fadeIn    { from{opacity:0} to{opacity:1} }
  @keyframes scaleIn   { from{opacity:0;transform:scale(0.93)} to{opacity:1;transform:scale(1)} }
  @keyframes slideL    { from{opacity:0;transform:translateX(24px)} to{opacity:1;transform:translateX(0)} }
  @keyframes slideR    { from{opacity:0;transform:translateX(-24px)} to{opacity:1;transform:translateX(0)} }
  @keyframes shimmer   { 0%{transform:translateX(-100%) skewX(-12deg)} 100%{transform:translateX(280%) skewX(-12deg)} }
  @keyframes goldPulse { 0%,100%{box-shadow:0 6px 28px rgba(196,154,60,.22)} 50%{box-shadow:0 10px 44px rgba(196,154,60,.40)} }
  @keyframes spin      { to{transform:rotate(360deg)} }
  @keyframes toastUp   { from{opacity:0;transform:translateX(-50%) translateY(8px)} to{opacity:1;transform:translateX(-50%) translateY(0)} }
  @keyframes dotPulse  { 0%,100%{transform:scale(1);opacity:1} 50%{transform:scale(1.5);opacity:.5} }
  @keyframes checkDraw { from{stroke-dashoffset:24} to{stroke-dashoffset:0} }
  @keyframes streakB   { 0%{transform:scale(.6) rotate(-8deg);opacity:0} 70%{transform:scale(1.15) rotate(2deg)} 100%{transform:scale(1) rotate(0);opacity:1} }
  .rise  { animation:riseUp  .44s cubic-bezier(.22,1,.36,1) both }
  .fade  { animation:fadeIn  .30s ease both }
  .scale { animation:scaleIn .38s cubic-bezier(.22,1,.36,1) both }
  .slideL{ animation:slideL  .30s cubic-bezier(.22,1,.36,1) both }
  .slideR{ animation:slideR  .30s cubic-bezier(.22,1,.36,1) both }
  .d1{animation-delay:.05s} .d2{animation-delay:.10s} .d3{animation-delay:.15s}
  .d4{animation-delay:.20s} .d5{animation-delay:.25s} .d6{animation-delay:.30s}
  .scroll { overflow-y:auto; -webkit-overflow-scrolling:touch; overscroll-behavior-y:contain; }
  ::-webkit-scrollbar { width:6px; }
  ::-webkit-scrollbar-track { background:transparent; }
  ::-webkit-scrollbar-thumb { background:${C.inkGhost}; border-radius:3px; }
  button { font-family:inherit; cursor:pointer; border:none; outline:none; user-select:none; }
  input  { font-family:inherit; -webkit-appearance:none; }
`;

// ── Breakpoint hook ────────────────────────────────────────────────────────────
function useBreakpoint() {
  const get = () => {
    const w = window.innerWidth;
    if (w >= 1200) return "desktop";
    if (w >= 768)  return "tablet";
    return "mobile";
  };
  const [bp, setBp] = useState(get);
  useEffect(() => {
    const h = () => setBp(get());
    window.addEventListener("resize", h);
    return () => window.removeEventListener("resize", h);
  }, []);
  return bp;
}

// ── localStorage ───────────────────────────────────────────────────────────────
const STORAGE_KEY = "resilient_runner_v1";
function loadState() {
  try { const r = localStorage.getItem(STORAGE_KEY); return r ? JSON.parse(r) : null; } catch { return null; }
}
function saveState(state) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ profile:state.profile, hasOnboarded:state.hasOnboarded, completedChallenges:state.completedChallenges, workoutHistory:state.workoutHistory })); } catch {}
}

// ── Exercise Data ──────────────────────────────────────────────────────────────
const EXERCISES = [
  { id:"EX001", name:"Barbell Hip Thrust",       category:"strength",   bodyFocus:"legs",  contraindications:["back"],               goalTags:["marathon","strength","injury_prevention"], equipment:["barbell","bench"],         sets:3, reps:"10–12",   rest:75,  cue:"Drive through heels. Squeeze glutes hard at full hip extension.", muscles:["Glutes","Hamstrings"] },
  { id:"EX002", name:"Goblet Squat",             category:"strength",   bodyFocus:"legs",  contraindications:["knee"],               goalTags:["marathon","strength","5k"],               equipment:["kettlebell"],              sets:3, reps:"10–12",   rest:60,  cue:"Chest tall, elbows inside knees. Heels drive the floor away.", muscles:["Quads","Glutes"] },
  { id:"EX003", name:"Romanian Deadlift",        category:"strength",   bodyFocus:"legs",  contraindications:["back"],               goalTags:["marathon","strength"],                    equipment:["barbell","dumbbells"],     sets:3, reps:"8–10",    rest:75,  cue:"Bar stays close to the legs. Feel the hamstring stretch.", muscles:["Hamstrings","Glutes"] },
  { id:"EX004", name:"Bulgarian Split Squat",    category:"strength",   bodyFocus:"legs",  contraindications:["knee","hip"],         goalTags:["marathon","strength"],                    equipment:["dumbbells","bench"],       sets:3, reps:"8 each",  rest:75,  cue:"Front shin vertical. Drive through the heel to stand.", muscles:["Quads","Glutes"] },
  { id:"EX005", name:"Step-Up with Knee Drive",  category:"strength",   bodyFocus:"legs",  contraindications:["knee"],               goalTags:["marathon","5k","injury_prevention"],      equipment:["box","dumbbells"],         sets:3, reps:"10 each", rest:60,  cue:"Full hip extension at the top. Drive the knee up aggressively.", muscles:["Glutes","Quads"] },
  { id:"EX006", name:"Dead Bug",                 category:"core",       bodyFocus:"core",  contraindications:[],                     goalTags:["marathon","injury_prevention"],           equipment:["mat"],                     sets:3, reps:"8 each",  rest:45,  cue:"Lower back stays flat. Move slowly — control beats speed.", muscles:["Deep Core","Abs"] },
  { id:"EX007", name:"Pallof Press",             category:"core",       bodyFocus:"core",  contraindications:[],                     goalTags:["marathon","injury_prevention","5k"],      equipment:["cable","resistance_band"], sets:3, reps:"10 each", rest:45,  cue:"Fight rotation. Hips square. Breathe out as you press.", muscles:["Anti-Rotation Core","Obliques"] },
  { id:"EX008", name:"Copenhagen Plank",         category:"core",       bodyFocus:"core",  contraindications:["hip","knee"],         goalTags:["injury_prevention","marathon"],           equipment:["bench","mat"],             sets:3, reps:"20s each",rest:30,  cue:"Stack hips. Adductor drives the effort.", muscles:["Adductors","Core"] },
  { id:"EX009", name:"Farmer's Carry",           category:"core",       bodyFocus:"total", contraindications:[],                     goalTags:["strength","marathon"],                    equipment:["dumbbells","kettlebell"],  sets:3, reps:"20m",     rest:60,  cue:"Tall spine. Shoulders packed. Walk with purpose.", muscles:["Core","Grip","Traps"] },
  { id:"EX010", name:"Suitcase Carry",           category:"core",       bodyFocus:"core",  contraindications:[],                     goalTags:["injury_prevention","marathon"],           equipment:["dumbbells","kettlebell"],  sets:3, reps:"20m each",rest:60,  cue:"Resist lateral lean. Obliques working hard.", muscles:["Obliques","Core","Glutes"] },
  { id:"EX011", name:"Single-Leg Glute Bridge",  category:"glute",      bodyFocus:"legs",  contraindications:[],                     goalTags:["injury_prevention","marathon"],           equipment:["mat"],                     sets:3, reps:"12 each", rest:45,  cue:"Hips level — resist rotation through the pelvis.", muscles:["Glutes","Hamstrings"] },
  { id:"EX012", name:"Banded Hip Abduction",     category:"glute",      bodyFocus:"legs",  contraindications:[],                     goalTags:["injury_prevention","marathon"],           equipment:["resistance_band","mat"],   sets:3, reps:"15 each", rest:30,  cue:"Slow eccentric — 3 seconds down.", muscles:["Glute Medius"] },
  { id:"EX013", name:"Lateral Band Walk",        category:"stability",  bodyFocus:"legs",  contraindications:[],                     goalTags:["injury_prevention","marathon","5k"],      equipment:["resistance_band"],         sets:3, reps:"15 each", rest:30,  cue:"Slight squat. Band stays taut.", muscles:["Glute Medius","Hip Abductors"] },
  { id:"EX014", name:"Single-Leg RDL",           category:"stability",  bodyFocus:"legs",  contraindications:["back"],               goalTags:["injury_prevention","marathon","5k"],      equipment:["dumbbells","bodyweight"],  sets:3, reps:"10 each", rest:45,  cue:"Find a focal point. Hip stays square to the floor.", muscles:["Hamstrings","Glutes"] },
  { id:"EX015", name:"Banded Clamshell",         category:"stability",  bodyFocus:"legs",  contraindications:["hip"],                goalTags:["injury_prevention","marathon"],           equipment:["resistance_band","mat"],   sets:3, reps:"15 each", rest:30,  cue:"Rotate from the hip — don't roll the pelvis backward.", muscles:["Glute Medius"] },
  { id:"EX016", name:"Hip 90/90 Stretch",        category:"mobility",   bodyFocus:"legs",  contraindications:[],                     goalTags:["injury_prevention","marathon"],           equipment:["mat"],                     sets:2, reps:"45s each",rest:15,  cue:"Sit tall. Breathe into the hip socket.", muscles:["Hip External Rotators","Piriformis"] },
  { id:"EX017", name:"World's Greatest Stretch", category:"mobility",   bodyFocus:"total", contraindications:["hip"],                goalTags:["marathon","injury_prevention"],           equipment:["mat"],                     sets:2, reps:"5 each",  rest:20,  cue:"Slow, deliberate. Each rep opens the thoracic spine more.", muscles:["Hip Flexors","T-Spine","Groin"] },
  { id:"EX018", name:"Active Hamstring Floss",   category:"mobility",   bodyFocus:"legs",  contraindications:[],                     goalTags:["injury_prevention"],                     equipment:["mat"],                     sets:2, reps:"10 each", rest:15,  cue:"Neural flossing — gentle pulses only.", muscles:["Hamstrings"] },
  { id:"EX019", name:"Calf Raise Eccentric",     category:"strength",   bodyFocus:"legs",  contraindications:[],                     goalTags:["injury_prevention","marathon","5k"],      equipment:["step","bodyweight"],       sets:3, reps:"15 slow", rest:45,  cue:"3 seconds down. Load the Achilles tendon gradually.", muscles:["Calves","Achilles"] },
  { id:"EX020", name:"Trap Bar Deadlift",        category:"strength",   bodyFocus:"total", contraindications:["back"],               goalTags:["strength","marathon"],                    equipment:["trap_bar"],                sets:4, reps:"5",       rest:120, cue:"Push the floor away. Hips and shoulders rise together.", muscles:["Glutes","Hamstrings","Quads"] },
  { id:"EX021", name:"Kettlebell Swing",         category:"strength",   bodyFocus:"total", contraindications:["back"],               goalTags:["strength","5k","marathon"],               equipment:["kettlebell"],              sets:4, reps:"15",      rest:60,  cue:"Hip hinge, not a squat. Snap the hips.", muscles:["Glutes","Hamstrings"] },
  { id:"EX022", name:"Box Jump",                 category:"plyometric", bodyFocus:"legs",  contraindications:["knee","shin_splints"],goalTags:["5k","strength"],                          equipment:["box"],                     sets:3, reps:"5",       rest:90,  cue:"Land soft — absorb the force.", muscles:["Quads","Glutes","Calves"] },
  { id:"EX023", name:"Bird Dog",                 category:"core",       bodyFocus:"core",  contraindications:[],                     goalTags:["injury_prevention","marathon"],           equipment:["mat"],                     sets:3, reps:"10 each", rest:30,  cue:"Hips don't move. Reach long through fingertips and heel.", muscles:["Glutes","Core","Lower Back"] },
  { id:"EX024", name:"Hip Flexor Stretch",       category:"mobility",   bodyFocus:"legs",  contraindications:["knee","hip"],         goalTags:["injury_prevention","marathon"],           equipment:["mat"],                     sets:2, reps:"45s each",rest:15,  cue:"Posterior pelvic tilt first, then lean forward.", muscles:["Hip Flexors","Psoas"] },
  { id:"EX025", name:"Reverse Nordic Curl",      category:"strength",   bodyFocus:"legs",  contraindications:["knee"],               goalTags:["injury_prevention","marathon"],           equipment:["mat"],                     sets:3, reps:"8",       rest:60,  cue:"Controlled lean. Quad length is the goal.", muscles:["Quads","Knee Stabilizers"] },
];

// ── Workout Engine ─────────────────────────────────────────────────────────────
const ENGINE = {
  generate({ goal, injuries, bodyFocus, sessionLength, age }) {
    let pool = EXERCISES.filter(ex => {
      if (injuries.includes("Knee pain")       && ex.contraindications.includes("knee"))         return false;
      if (injuries.includes("Lower back pain") && ex.contraindications.includes("back"))         return false;
      if (injuries.includes("Hip pain")        && ex.contraindications.includes("hip"))          return false;
      if (injuries.includes("Shin splints")    && ex.contraindications.includes("shin_splints")) return false;
      return true;
    });
    const goalMap  = { "Marathon":"marathon","5K":"5k","Half Marathon":"marathon","Prevent Injury":"injury_prevention","Build Strength":"strength","Improve Endurance":"marathon" };
    const focusMap = { "Legs & Glutes":"legs","Core":"core","Total Body":"total","Upper Body":"upper","Mobility & Recovery":"legs" };
    const gTag = goalMap[goal] || "marathon";
    const fTag = focusMap[bodyFocus] || "legs";
    pool = pool.map(ex => {
      let score = 0;
      if (ex.goalTags.includes(gTag)) score += 10;
      if (ex.bodyFocus === fTag)       score += 8;
      if (ex.bodyFocus === "total")    score += 3;
      if (age === "50+" && ex.category === "mobility")   score += 5;
      if (age === "50+" && ex.category === "plyometric") score -= 8;
      return { ...ex, score };
    });
    pool.sort((a,b) => b.score - a.score);
    const catCount = {}, selected = [];
    for (const ex of pool) {
      catCount[ex.category] = (catCount[ex.category]||0)+1;
      if (catCount[ex.category] <= 3) selected.push(ex);
      if (selected.length >= 8) break;
    }
    const countMap = { "Under 15 min":3,"20–30 min":5,"45+ min":7 };
    const is40Plus = age==="40–49"||age==="50+";
    const final = selected.slice(0, countMap[sessionLength]||5)
      .map(ex => ({ ...ex, rest: is40Plus ? Math.round(ex.rest*1.25) : ex.rest }));
    const goalNotes = {
      "Marathon":"Posterior chain strength and core stability — the engine that sustains marathon pace.",
      "5K":"Speed comes from power. Hip extension and reactive ground contact are the priority.",
      "Half Marathon":"Endurance-strength balance. Hip stability that holds form at mile 10+.",
      "Prevent Injury":"Active injury prevention — hip stability, ankle mobility, and single-leg control.",
      "Build Strength":"Progressive resistance to build neuromuscular capacity and running economy.",
      "Improve Endurance":"Muscular endurance and fatigue resistance in the muscles that drive your running.",
    };
    return {
      exercises: final,
      sessionNote: goalNotes[goal]||"Built around your profile.",
      injuryNote: injuries.filter(i=>i!=="None").length ? `Adapted for: ${injuries.filter(i=>i!=="None").join(", ")}.` : null,
      ageNote: is40Plus ? `Rest periods extended 25% for ${age} bracket.` : null,
      date: new Date().toLocaleDateString("en-GB",{weekday:"short",day:"numeric",month:"short"}),
    };
  },
};

// ── Challenges ─────────────────────────────────────────────────────────────────
const CHALLENGES = [
  { id:"W01", cat:"mindset",   emoji:"🧭", title:"Values Check-In",    dur:"3 min", hook:"Know why you're lacing up today.", steps:["Take 3 slow breaths. Let your shoulders drop.","Ask: what does completing this run say about the person I'm choosing to be?","Name your answer out loud: 'Today I run because _____.","When effort builds, return to that sentence."] },
  { id:"W02", cat:"mindset",   emoji:"🔄", title:"Thought Reframe",    dur:"2 min", hook:"A tool for unhelpful pre-workout thoughts.", steps:["Notice a negative thought. Name it without judgment.","Ask: is this fact, or a story my brain is telling me?","Write a more balanced version — not positive, just accurate.","Carry the reframe. Thoughts aren't commands."] },
  { id:"W03", cat:"mindset",   emoji:"🌊", title:"Pre-Race Calm",      dur:"5 min", hook:"Channel race-day nerves into fuel.", steps:["Find a quiet spot. Sit or lie down.","Breathe in 4 counts, hold 2, out 6. Repeat 5 times.","Visualise the first mile only. See yourself calm and strong.","Say: 'I am ready. I have prepared. This is just running.'"] },
  { id:"W04", cat:"mindset",   emoji:"💬", title:"Self-Talk Audit",    dur:"4 min", hook:"Your internal coach sets the tone.", steps:["Write 3 things you said to yourself mid-effort.","Mark each: helpful, neutral, or unhelpful.","For each unhelpful phrase, write a coach version.","Practise the coach version until it's automatic."] },
  { id:"W05", cat:"mindset",   emoji:"🎯", title:"Process Goal Set",   dur:"3 min", hook:"Shift focus from outcome to process.", steps:["Write today's outcome goal.","Write 2 process goals — things entirely within your control.","Commit to judging the session on process goals only.","After: did you hit them? That's the real result."] },
  { id:"W06", cat:"nutrition", emoji:"💧", title:"Hydration Audit",    dur:"5 min", hook:"Dehydration is the silent performance killer.", steps:["Check urine colour. Pale straw = hydrated. Dark = drink now.","Weigh before and after a run to measure sweat loss.","For every kg lost, drink 1.5L to fully rehydrate.","Set phone reminders every 90 minutes throughout the day."] },
  { id:"W07", cat:"nutrition", emoji:"⚡", title:"Pre-Run Fuel",       dur:"4 min", hook:"Fuel the work, recover the adaptation.", steps:["Eat 2–3 hours before: carbs + moderate protein.","30 min before: 30–60g fast carbs (banana, dates, rice cakes).","During runs over 75 min: 30–60g carbs per hour.","Practise race nutrition in training — your gut needs it too."] },
  { id:"W08", cat:"nutrition", emoji:"🥗", title:"Recovery Meal Plan", dur:"6 min", hook:"The meal after training is your second session.", steps:["Eat within 30–45 min post-training.","Target: 20–40g protein + 1–1.2g carbs per kg bodyweight.","Anti-inflammatory foods: berries, greens, turmeric, oily fish.","Avoid alcohol in the 4-hour recovery window."] },
  { id:"W09", cat:"nutrition", emoji:"🌙", title:"Sleep Nutrition",    dur:"3 min", hook:"Sleep is where adaptation actually happens.", steps:["Avoid large meals within 2 hours of sleep.","Tart cherry juice (30ml) 1 hour before bed.","Magnesium glycinate (200–400mg) supports sleep depth.","Consistent sleep/wake time matters more than total hours."] },
  { id:"W10", cat:"mindset",   emoji:"📔", title:"Training Journal",   dur:"5 min", hook:"Reflection compounds over time.", steps:["Write 3 lines: what went well, what was hard, what to change.","Rate energy, mood, and motivation out of 10.","Note physical signals — tightness, fatigue, pain.","Review last week's entries before each key session."] },
];

// ── App State ──────────────────────────────────────────────────────────────────
const AppCtx = createContext(null);
const AppDispatchCtx = createContext(null);
const EMPTY_PROFILE = { name:"", ageRange:null, goal:null, injuries:[], bodyFocus:null, sessionLength:null, streak:0, sessionsThisWeek:0, lastWorkout:null };

function getWeekNumber(d) {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  date.setUTCDate(date.getUTCDate()+4-(date.getUTCDay()||7));
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(),0,1));
  return Math.ceil((((date-yearStart)/86400000)+1)/7);
}

function buildInitialState() {
  const saved = loadState();
  if (saved) return {
    hasOnboarded:        saved.hasOnboarded        ?? false,
    profile:             saved.profile             ?? EMPTY_PROFILE,
    completedChallenges: saved.completedChallenges ?? [],
    workoutHistory:      saved.workoutHistory      ?? [],
    screen: saved.hasOnboarded ? "home" : "onboarding",
    screenDir: null,
  };
  return { hasOnboarded:false, profile:EMPTY_PROFILE, completedChallenges:[], workoutHistory:[], screen:"onboarding", screenDir:null };
}

function appReducer(state, action) {
  switch (action.type) {
    case "COMPLETE_ONBOARDING": return { ...state, profile:{ ...action.payload, streak:state.profile.streak??0, sessionsThisWeek:state.profile.sessionsThisWeek??0, lastWorkout:state.profile.lastWorkout??null }, hasOnboarded:true };
    case "SET_SCREEN": return { ...state, screen:action.payload.screen, screenDir:action.payload.dir??null };
    case "LOG_WORKOUT": {
      const today=new Date().toDateString();
      const yesterday=new Date(); yesterday.setDate(yesterday.getDate()-1);
      const last=state.profile.lastWorkout;
      const consec=last===yesterday.toDateString()||last===today;
      const newStreak=last===today?state.profile.streak:consec?state.profile.streak+1:1;
      const newHistory=[action.payload,...state.workoutHistory].slice(0,20);
      return { ...state, profile:{ ...state.profile, sessionsThisWeek:state.profile.sessionsThisWeek+1, streak:newStreak, lastWorkout:today }, workoutHistory:newHistory };
    }
    case "LOG_CHALLENGE": return { ...state, completedChallenges:[...state.completedChallenges, action.payload] };
    case "RESET_WEEK": return { ...state, profile:{ ...state.profile, sessionsThisWeek:0 } };
    default: return state;
  }
}

function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, null, buildInitialState);
  useEffect(() => { saveState(state); }, [state]);
  useEffect(() => {
    const saved = loadState();
    if (saved?.profile?.lastWorkout) {
      const last = new Date(saved.profile.lastWorkout);
      const now  = new Date();
      if (last.getFullYear()!==now.getFullYear()||getWeekNumber(last)!==getWeekNumber(now)) dispatch({ type:"RESET_WEEK" });
    }
  }, []);
  return <AppDispatchCtx.Provider value={dispatch}><AppCtx.Provider value={state}>{children}</AppCtx.Provider></AppDispatchCtx.Provider>;
}
const useApp = () => useContext(AppCtx);
const useAppDispatch = () => useContext(AppDispatchCtx);

// ── Subscription ───────────────────────────────────────────────────────────────
const SubStateCtx    = createContext(null);
const SubDispatchCtx = createContext(null);
const FREE = { workouts:3, challenges:3 };
function getWeekStart() { const n=new Date(),d=n.getDay(),r=new Date(n); r.setDate(n.getDate()-d+(d===0?-6:1)); r.setHours(0,0,0,0); return r.toDateString(); }
function maybeReset(u) { const ws=getWeekStart(); return u.weekStart===ws?u:{workouts:0,challenges:0,weekStart:ws}; }
function subReducer(state, action) {
  switch(action.type){
    case "TOGGLE_PREMIUM": return {...state,tier:state.tier==="premium"?"free":"premium"};
    case "USE_WORKOUT":    { if(state.tier==="premium") return state; const u=maybeReset(state.usage); return {...state,usage:{...u,workouts:u.workouts+1}}; }
    case "USE_CHALLENGE":  { if(state.tier==="premium") return state; const u=maybeReset(state.usage); return {...state,usage:{...u,challenges:u.challenges+1}}; }
    case "UPGRADE":        return {...state,tier:"premium"};
    case "RESET_USAGE":    return {...state,usage:{workouts:0,challenges:0,weekStart:getWeekStart()}};
    default: return state;
  }
}
function SubProvider({ children }) {
  const [state,dispatch]=useReducer(subReducer,{tier:"free",usage:{workouts:0,challenges:0,weekStart:getWeekStart()}});
  return <SubDispatchCtx.Provider value={dispatch}><SubStateCtx.Provider value={state}>{children}</SubStateCtx.Provider></SubDispatchCtx.Provider>;
}
function useSubState() {
  const s=useContext(SubStateCtx);
  const isPremium=s.tier==="premium";
  const usage=useMemo(()=>maybeReset(s.usage),[s.usage]);
  return { tier:s.tier, isPremium, usage, canWorkout:isPremium||usage.workouts<FREE.workouts, canChallenge:isPremium||usage.challenges<FREE.challenges, workoutsLeft:isPremium?Infinity:Math.max(0,FREE.workouts-usage.workouts), challengesLeft:isPremium?Infinity:Math.max(0,FREE.challenges-usage.challenges) };
}
const useSubDispatch = () => useContext(SubDispatchCtx);

// ── Toast ──────────────────────────────────────────────────────────────────────
const _toastSubs=new Set(); let _toastList=[];
function pushToast(msg,ms=2400){const id=Date.now()+Math.random();_toastList=[..._toastList,{id,msg}];_toastSubs.forEach(f=>f([..._toastList]));setTimeout(()=>{_toastList=_toastList.filter(t=>t.id!==id);_toastSubs.forEach(f=>f([..._toastList]));},ms);}
function useToast(){const[q,setQ]=useState(()=>[..._toastList]);useEffect(()=>{_toastSubs.add(setQ);return()=>_toastSubs.delete(setQ);},[]);return q;}
function useAsync(){const[s,set]=useState({status:"idle",error:null});const run=useCallback(async fn=>{set({status:"loading",error:null});try{await fn();set({status:"idle",error:null});}catch(e){set({status:"error",error:e?.message??"Error"});}},[]);const reset=useCallback(()=>set({status:"idle",error:null}),[]);return{...s,isLoading:s.status==="loading",isError:s.status==="error",run,reset};}

class ErrBoundary extends Component {
  state={caught:false};
  static getDerivedStateFromError(){return{caught:true};}
  reset=()=>this.setState({caught:false});
  render(){if(!this.state.caught)return this.props.children;return<div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:SP.lg,padding:SP.xxxl}}><span style={{fontSize:36}}>⚠️</span><button onClick={this.reset} style={{...TY.b2md,color:C.brand,background:C.brandLt,borderRadius:R.lg,padding:`${SP.md}px ${SP.xl}px`,border:"none",cursor:"pointer"}}>Try again</button></div>;}
}

// ── UI Primitives ──────────────────────────────────────────────────────────────
const Txt = memo(({t,color,style,children,as:As="span"})=><As style={{...TY[t],color,...style}}>{children}</As>);

const CARD_V={
  base:    {background:C.elevated,borderRadius:R.xl,border:`1.5px solid ${C.border}`,boxShadow:C.shadowSm},
  elevated:{background:C.elevated,borderRadius:R.xl,border:`1.5px solid ${C.border}`,boxShadow:C.shadowMd},
  sunken:  {background:C.sunken,  borderRadius:R.lg,border:`1px solid ${C.border}`},
  gold:    {background:C.goldLt,  borderRadius:R.xl,border:`1.5px solid ${C.gold}30`,boxShadow:C.shadowGold},
  brand:   {background:C.brandLt, borderRadius:R.xl,border:`1.5px solid ${C.brand}30`,boxShadow:C.shadowBrand},
};
const Card=memo(({children,v="base",pad=SP.lg,style,className})=><div className={className} style={{...CARD_V[v],padding:pad,...style}}>{children}</div>);
const Divider=memo(({color,style})=><div style={{height:1,background:color||C.border,...style}}/>);

const Btn=memo(function Btn({onPress,style,children,disabled,aria}){
  const[p,setP]=useState(false);
  const s=useMemo(()=>({cursor:disabled?"not-allowed":"pointer",opacity:disabled?.5:1,transform:p?"scale(0.971)":"scale(1)",transition:"transform .11s ease,opacity .15s ease",WebkitTapHighlightColor:"transparent",userSelect:"none",...style}),[p,disabled,style]);
  return<button aria-label={aria} onMouseDown={()=>!disabled&&setP(true)} onMouseUp={()=>setP(false)} onMouseLeave={()=>setP(false)} onTouchStart={()=>!disabled&&setP(true)} onTouchEnd={()=>setP(false)} onClick={disabled?undefined:onPress} style={s}>{children}</button>;
});

const PremBadge=memo(({sm})=><span style={{display:"inline-flex",alignItems:"center",gap:4,...TY.lbl,fontSize:sm?8:9,letterSpacing:sm?1:1.5,padding:sm?"3px 8px":"4px 11px",borderRadius:R.pill,background:`linear-gradient(135deg,${C.goldLt},#FBF0D0)`,color:C.goldDk,border:`1px solid ${C.gold}40`}}>✦ Premium</span>);
const Shimmer=memo(()=><div aria-hidden style={{position:"absolute",inset:0,pointerEvents:"none",borderRadius:"inherit",background:"linear-gradient(105deg,transparent 38%,rgba(255,255,255,.12) 50%,transparent 62%)",animation:"shimmer 3.6s ease-in-out infinite"}}/>);

const Toggle=memo(function Toggle({value,onChange,color=C.brand,label,sub}){
  return<div role="switch" aria-checked={value} tabIndex={0} onClick={()=>onChange(!value)} style={{display:"flex",alignItems:"center",justifyContent:"space-between",minHeight:TAP,cursor:"pointer"}}>
    <div style={{flex:1,paddingRight:SP.lg}}>{label&&<Txt t="b2md" color={C.ink} style={{display:"block",marginBottom:sub?2:0}}>{label}</Txt>}{sub&&<Txt t="b3" color={C.inkMuted} style={{display:"block"}}>{sub}</Txt>}</div>
    <div style={{width:52,height:30,borderRadius:R.pill,background:value?color:C.sunken,border:`1.5px solid ${value?color:C.border}`,position:"relative",flexShrink:0,transition:"all .22s ease"}}>
      <div style={{width:22,height:22,borderRadius:"50%",background:"#FFFEFD",position:"absolute",top:3,left:value?26:3,transition:"left .22s cubic-bezier(.22,1,.36,1)",boxShadow:"0 1px 4px rgba(27,25,22,0.18)"}}/>
    </div>
  </div>;
});

const LockOverlay=memo(({onUpgrade})=>{
  const[shk,setShk]=useState(false);
  return<div onClick={()=>{setShk(true);setTimeout(()=>setShk(false),500);onUpgrade?.();}} role="button" style={{position:"absolute",inset:0,borderRadius:R.xl,zIndex:10,background:"rgba(245,241,235,.88)",backdropFilter:"blur(4px)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:SP.md,cursor:"pointer"}}>
    <div style={{fontSize:28,animation:shk?"shake .45s ease":"none"}}>🔒</div>
    <div style={{textAlign:"center"}}><Txt t="b2md" color={C.inkSub} style={{display:"block",marginBottom:4}}>Premium feature</Txt><Txt t="b3" color={C.brand} style={{textDecoration:"underline"}}>Tap to upgrade →</Txt></div>
  </div>;
});

const UsageBar=memo(({used,max,color,label,onUpgrade})=>{
  const inf=used===Infinity,pct=inf?100:Math.min(100,(used/max)*100);
  const near=!inf&&pct>=67&&pct<100,atLim=!inf&&pct>=100;
  return<div>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:SP.sm}}><Txt t="b3" color={C.inkMuted}>{label}</Txt><Txt t="c1sb" color={atLim?C.brand:near?C.gold:C.inkMuted}>{inf?"∞":`${used} / ${max}`}</Txt></div>
    <div style={{height:6,background:C.sunken,borderRadius:R.pill,overflow:"hidden"}}><div style={{height:"100%",borderRadius:R.pill,transition:"width .8s cubic-bezier(.22,1,.36,1)",width:`${pct}%`,background:inf?`linear-gradient(90deg,${C.gold},${C.goldDk})`:atLim?`linear-gradient(90deg,${C.brand},${C.brandDk})`:near?`linear-gradient(90deg,${C.gold},${C.goldDk})`:`linear-gradient(90deg,${color},${color}CC)`}}/></div>
    {atLim&&<div style={{display:"flex",alignItems:"center",gap:SP.xs,marginTop:SP.xs}}><Txt t="b3" color={C.brand}>Limit reached.</Txt><button onClick={onUpgrade} style={{...TY.b3,color:C.brand,textDecoration:"underline",background:"none",border:"none",cursor:"pointer"}}>Upgrade →</button></div>}
    {near&&!atLim&&<Txt t="b3" color={C.gold} style={{display:"block",marginTop:SP.xs}}>{max-used} left this week.</Txt>}
  </div>;
});

const ToastRenderer=memo(function ToastRenderer(){
  const q=useToast(),latest=q[q.length-1];
  if(!latest) return null;
  return<div key={latest.id} role="status" style={{position:"fixed",bottom:24,left:"50%",transform:"translateX(-50%)",...TY.b3md,background:C.ink,color:C.base,padding:`${SP.md}px ${SP.xl}px`,borderRadius:R.pill,boxShadow:C.shadowLg,whiteSpace:"nowrap",zIndex:500,animation:"toastUp .3s cubic-bezier(.22,1,.36,1) both"}}>{latest.msg}</div>;
});

// ── Paywall ────────────────────────────────────────────────────────────────────
const PAYWALL_COPY={workout:{icon:"⚡",title:"Workout limit reached",body:"You've used all 3 workout generations this week on the free plan."},challenge:{icon:"🌿",title:"Challenge limit reached",body:"You've used all 3 wellness challenges this week."},default:{icon:"✦",title:"Upgrade to Premium",body:"Unlock unlimited access to Resilient Runner."}};

const PaywallModal=memo(function PaywallModal({source,onClose,onUpgrade}){
  const dispatch=useSubDispatch();
  const{icon,title,body}=PAYWALL_COPY[source]||PAYWALL_COPY.default;
  const upgrade=()=>{dispatch({type:"UPGRADE"});onUpgrade?.();};
  return<div className="fade" onClick={e=>{if(e.target===e.currentTarget)onClose();}} style={{position:"fixed",inset:0,zIndex:400,background:"rgba(27,25,22,.55)",backdropFilter:"blur(8px)",display:"flex",alignItems:"center",justifyContent:"center",padding:SP.xl}}>
    <div className="scale" style={{width:"100%",maxWidth:460,background:C.elevated,borderRadius:R.xxl,padding:`${SP.xxl}px ${SP.xl}px ${SP.xxl}px`,boxShadow:C.shadowLg}}>
      <div style={{width:68,height:68,borderRadius:R.xl+4,background:`linear-gradient(135deg,${C.goldLt},#FDF5E0)`,border:`1.5px solid ${C.gold}30`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:30,margin:`0 auto ${SP.lg}px`,boxShadow:C.shadowGold}}>{icon}</div>
      <div style={{textAlign:"center",marginBottom:SP.xl}}>
        <Txt t="d3" color={C.ink} style={{display:"block",marginBottom:SP.sm}}>{title}</Txt>
        <Txt t="b2" color={C.inkMuted} style={{display:"block",lineHeight:1.6}}>{body}</Txt>
      </div>
      <Card v="gold" pad={SP.xl} style={{marginBottom:SP.lg}}>
        <div style={{display:"flex",alignItems:"flex-end",gap:SP.xs,marginBottom:SP.md}}><Txt t="d2" color={C.goldDk}>£7.99</Txt><Txt t="b3" color={C.gold} style={{paddingBottom:4}}>/month</Txt></div>
        {["Unlimited workouts","Unlimited challenges","Race programs","Advanced filters"].map(f=><div key={f} style={{display:"flex",alignItems:"center",gap:SP.sm,padding:"4px 0"}}><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={C.gold} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="4,13 9,18 20,7"/></svg><Txt t="b3" color={C.inkSub}>{f}</Txt></div>)}
      </Card>
      <Btn onPress={upgrade} style={{width:"100%",minHeight:TAP+4,borderRadius:R.xl,background:`linear-gradient(135deg,${C.gold} 0%,${C.goldDk} 100%)`,color:"#FFFFFE",...TY.b1sb,display:"flex",alignItems:"center",justifyContent:"center",gap:SP.sm,animation:"goldPulse 3s ease-in-out infinite",position:"relative",overflow:"hidden",marginBottom:SP.md}}>
        <Shimmer/><span>✦</span><span>Upgrade to Premium</span>
      </Btn>
      <Txt t="lbl" color={C.inkGhost} style={{display:"block",textAlign:"center",fontSize:8,marginBottom:SP.sm}}>Simulated — no payment taken</Txt>
      <Btn onPress={onClose} style={{width:"100%",minHeight:TAP,background:"transparent",color:C.inkMuted,...TY.b2md}}>Maybe later</Btn>
    </div>
  </div>;
});

// ══════════════════════════════════════════════════════════════════════════════
//  ONBOARDING
// ══════════════════════════════════════════════════════════════════════════════
const OB_GOALS=[{v:"Marathon",icon:"🏅",sub:"26.2 miles"},{v:"Half Marathon",icon:"🥈",sub:"13.1 miles"},{v:"5K",icon:"⚡",sub:"Speed & power"},{v:"Prevent Injury",icon:"🛡",sub:"Stay healthy"},{v:"Build Strength",icon:"💪",sub:"Gym & running"},{v:"Improve Endurance",icon:"🔋",sub:"Go further"}];
const OB_INJURIES=[{v:"None",icon:"✅"},{v:"Knee pain",icon:"🦵"},{v:"Lower back pain",icon:"🔙"},{v:"Hip pain",icon:"🫀"},{v:"Shin splints",icon:"🦴"},{v:"Plantar fasciitis",icon:"🦶"}];
const OB_FOCUS=[{v:"Legs & Glutes",icon:"🦵"},{v:"Core",icon:"⚙️"},{v:"Total Body",icon:"🏃"},{v:"Upper Body",icon:"💪"},{v:"Mobility & Recovery",icon:"🌿"}];
const OB_SESSION=[{v:"Under 15 min",icon:"⚡",sub:"Quick & efficient"},{v:"20–30 min",icon:"🎯",sub:"Most popular"},{v:"45+ min",icon:"🔥",sub:"Full session"}];
const OB_AGE=["18–29","30–39","40–49","50+"];

function OnboardingScreen() {
  const dispatch=useAppDispatch();
  const {profile}=useApp();
  const bp=useBreakpoint();
  const isWide=bp!=="mobile";
  const [step,setStep]=useState(0);
  const [form,setForm]=useState({ name:profile.name||"", ageRange:profile.ageRange||null, goal:profile.goal||null, injuries:profile.injuries||[], bodyFocus:profile.bodyFocus||null, sessionLength:profile.sessionLength||null });
  const scrollRef=useRef(null);
  const setF=(k,v)=>setForm(f=>({...f,[k]:v}));
  const toggle=(k,v)=>setForm(f=>{
    const arr=f[k]||[];
    if(k==="injuries"&&v==="None") return {...f,injuries:arr.includes("None")?[]:["None"]};
    if(k==="injuries"&&v!=="None") return {...f,injuries:[...arr.filter(x=>x!=="None"),arr.includes(v)?undefined:v].filter(Boolean)};
    return {...f,[k]:arr.includes(v)?arr.filter(x=>x!==v):[...arr,v]};
  });
  const goNext=()=>{setStep(s=>s+1);setTimeout(()=>scrollRef.current?.scrollTo({top:0,behavior:"smooth"}),40);};
  const goBack=()=>setStep(s=>s-1);
  const canNext=[form.name.trim().length>1,!!form.ageRange,!!form.goal,form.injuries.length>0,!!form.bodyFocus,!!form.sessionLength][step]??true;
  const total=6, isLast=step===total-1;
  const finish=()=>{dispatch({type:"COMPLETE_ONBOARDING",payload:{...form}});dispatch({type:"SET_SCREEN",payload:{screen:"home",dir:"forward"}});};

  const maxW = isWide ? 560 : "100%";

  return(
    <div style={{minHeight:"100vh",background:isWide?`linear-gradient(135deg,${C.brandLt} 0%,${C.base} 50%,${C.sageLt} 100%)`:C.base,display:"flex",alignItems:isWide?"center":"stretch",justifyContent:"center",padding:isWide?SP.xxxl:0}}>
      {isWide&&(
        <div style={{position:"fixed",left:0,top:0,bottom:0,width:"42%",background:`linear-gradient(160deg,${C.brandMd} 0%,${C.brand} 40%,${C.brandDk} 100%)`,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:SP.xxxl*2}}>
          <div style={{fontSize:64,marginBottom:SP.xxl}}>🏃</div>
          <Txt t="d1" color="#FFFEFD" style={{display:"block",marginBottom:SP.lg,textAlign:"center"}}>Resilient Runner</Txt>
          <Txt t="b2" color="rgba(255,255,255,.75)" style={{display:"block",textAlign:"center",lineHeight:1.7,maxWidth:280}}>Strength training built around your running goals, your body, and your schedule.</Txt>
          <div style={{marginTop:SP.xxxl*1.5,display:"flex",flexDirection:"column",gap:SP.md,width:"100%",maxWidth:280}}>
            {["Personalised to your injuries","AI-generated workouts","Mindset + nutrition tools"].map(f=>(
              <div key={f} style={{display:"flex",alignItems:"center",gap:SP.md}}>
                <div style={{width:22,height:22,borderRadius:"50%",background:"rgba(255,255,255,.2)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#FFF" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="4,13 9,18 20,7"/></svg></div>
                <Txt t="b3" color="rgba(255,255,255,.85)">{f}</Txt>
              </div>
            ))}
          </div>
        </div>
      )}
      <div ref={scrollRef} className="scroll" style={{flex:1,marginLeft:isWide?"42%":0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:isWide?`${SP.xxxl*2}px ${SP.xxxl}px`:0,minHeight:"100vh"}}>
        <div style={{width:"100%",maxWidth:maxW}}>
          {!isWide&&(
            <div style={{padding:`${SP.xl}px ${SP.xl}px ${SP.lg}px`,background:C.elevated,borderBottom:`1px solid ${C.border}`,position:"sticky",top:0,zIndex:10}}>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:SP.md}}>
                <div style={{display:"flex",alignItems:"center",gap:SP.sm}}><div style={{width:28,height:28,background:`linear-gradient(135deg,${C.brand},${C.brandDk})`,borderRadius:R.sm,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14}}>🏃</div><Txt t="lbl" color={C.inkMuted}>RESILIENT RUNNER</Txt></div>
                <Txt t="c1sb" color={C.inkMuted}>{step+1} / {total}</Txt>
              </div>
              <div style={{height:4,background:C.sunken,borderRadius:R.pill,overflow:"hidden"}}><div style={{height:"100%",width:`${((step+1)/total)*100}%`,background:`linear-gradient(90deg,${C.brand},${C.brandDk})`,borderRadius:R.pill,transition:"width .4s cubic-bezier(.22,1,.36,1)"}}/></div>
            </div>
          )}
          <div style={{padding:isWide?0:`${SP.xxl}px ${SP.xl}px`,paddingBottom:isWide?0:`calc(${SP.xxxl}px + env(safe-area-inset-bottom))`}}>
            {isWide&&(
              <div style={{marginBottom:SP.xxl}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:SP.md}}>
                  <Txt t="lbl" color={C.inkMuted}>Step {step+1} of {total}</Txt>
                  <div style={{display:"flex",gap:SP.xs}}>{Array.from({length:total},(_,i)=><div key={i} style={{width:i===step?24:6,height:6,borderRadius:R.pill,background:i<=step?C.brand:C.sunken,transition:"all .3s ease"}}/>)}</div>
                </div>
              </div>
            )}

            {step===0&&<div className="rise">
              <Txt t="lbl" color={C.brand} style={{display:"block",marginBottom:SP.sm}}>Welcome</Txt>
              <Txt t="d2" color={C.ink} style={{display:"block",marginBottom:SP.md}}>What's your name?</Txt>
              <Txt t="b2" color={C.inkMuted} style={{display:"block",marginBottom:SP.xxl}}>Let's personalise your experience.</Txt>
              <input value={form.name} onChange={e=>setF("name",e.target.value)} placeholder="Your first name" style={{width:"100%",padding:`${SP.lg}px`,background:C.elevated,border:`1.5px solid ${form.name.length>1?C.brand:C.border}`,borderRadius:R.lg,color:C.ink,...TY.h1,outline:"none",fontSize:20,transition:"border .2s"}} onFocus={e=>e.target.style.borderColor=C.brand} onBlur={e=>{if(form.name.length<=1)e.target.style.borderColor=C.border;}}/>
            </div>}

            {step===1&&<div className="rise">
              <Txt t="lbl" color={C.brand} style={{display:"block",marginBottom:SP.sm}}>Age range</Txt>
              <Txt t="d2" color={C.ink} style={{display:"block",marginBottom:SP.xl}}>How old are you?</Txt>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:SP.sm}}>
                {OB_AGE.map(age=><Btn key={age} onPress={()=>setF("ageRange",age)} style={{background:form.ageRange===age?C.brandLt:C.elevated,border:`2px solid ${form.ageRange===age?C.brand:C.border}`,borderRadius:R.lg,padding:`${SP.xl}px ${SP.md}px`,display:"flex",flexDirection:"column",alignItems:"center",gap:SP.xs,minHeight:88,transition:"all .15s"}}>
                  <Txt t="d3" color={form.ageRange===age?C.brand:C.inkSub}>{age}</Txt>
                  <Txt t="b3" color={form.ageRange===age?C.brandMd:C.inkMuted}>{age==="50+"?"Wise & strong":age==="40–49"?"Peak power":age==="30–39"?"Prime time":"Young gun"}</Txt>
                </Btn>)}
              </div>
            </div>}

            {step===2&&<div className="rise">
              <Txt t="lbl" color={C.brand} style={{display:"block",marginBottom:SP.sm}}>Primary goal</Txt>
              <Txt t="d2" color={C.ink} style={{display:"block",marginBottom:SP.xl}}>What are you training for?</Txt>
              <div style={{display:"grid",gridTemplateColumns:isWide?"1fr 1fr":"1fr",gap:SP.sm}}>
                {OB_GOALS.map(g=><Btn key={g.v} onPress={()=>setF("goal",g.v)} style={{display:"flex",alignItems:"center",gap:SP.md,padding:`${SP.md}px ${SP.lg}px`,background:form.goal===g.v?C.brandLt:C.elevated,border:`2px solid ${form.goal===g.v?C.brand:C.border}`,borderRadius:R.lg,textAlign:"left",minHeight:TAP,transition:"all .15s"}}>
                  <div style={{width:44,height:44,borderRadius:R.md,background:form.goal===g.v?`${C.brand}18`:C.sunken,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,flexShrink:0}}>{g.icon}</div>
                  <div style={{flex:1}}><Txt t="b2md" color={form.goal===g.v?C.brand:C.inkSub} style={{display:"block"}}>{g.v}</Txt><Txt t="b3" color={C.inkMuted}>{g.sub}</Txt></div>
                  {form.goal===g.v&&<div style={{width:22,height:22,borderRadius:"50%",background:C.brand,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#FFF" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="4,13 9,18 20,7"/></svg></div>}
                </Btn>)}
              </div>
            </div>}

            {step===3&&<div className="rise">
              <Txt t="lbl" color={C.brand} style={{display:"block",marginBottom:SP.sm}}>Injuries</Txt>
              <Txt t="d2" color={C.ink} style={{display:"block",marginBottom:SP.sm}}>Any niggles?</Txt>
              <Txt t="b3" color={C.inkMuted} style={{display:"block",marginBottom:SP.xl}}>Select all that apply. Workouts will adapt.</Txt>
              <div style={{display:"flex",flexWrap:"wrap",gap:SP.sm}}>
                {OB_INJURIES.map(inj=>{const sel=form.injuries.includes(inj.v);return<Btn key={inj.v} onPress={()=>toggle("injuries",inj.v)} style={{display:"flex",alignItems:"center",gap:SP.sm,padding:`${SP.md}px ${SP.lg}px`,background:sel?C.brandLt:C.elevated,border:`2px solid ${sel?C.brand:C.border}`,borderRadius:R.pill,...TY.b2md,color:sel?C.brand:C.inkSub,minHeight:TAP,transition:"all .15s"}}><span style={{fontSize:18}}>{inj.icon}</span>{inj.v}</Btn>;})}
              </div>
            </div>}

            {step===4&&<div className="rise">
              <Txt t="lbl" color={C.brand} style={{display:"block",marginBottom:SP.sm}}>Body focus</Txt>
              <Txt t="d2" color={C.ink} style={{display:"block",marginBottom:SP.xl}}>Where do you want to focus?</Txt>
              <div style={{display:"grid",gridTemplateColumns:isWide?"1fr 1fr":"1fr",gap:SP.sm}}>
                {OB_FOCUS.map(f=><Btn key={f.v} onPress={()=>setF("bodyFocus",f.v)} style={{display:"flex",alignItems:"center",gap:SP.md,padding:`${SP.md}px ${SP.lg}px`,background:form.bodyFocus===f.v?C.brandLt:C.elevated,border:`2px solid ${form.bodyFocus===f.v?C.brand:C.border}`,borderRadius:R.lg,textAlign:"left",minHeight:TAP,transition:"all .15s"}}>
                  <div style={{width:44,height:44,borderRadius:R.md,background:form.bodyFocus===f.v?`${C.brand}18`:C.sunken,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,flexShrink:0}}>{f.icon}</div>
                  <Txt t="b2md" color={form.bodyFocus===f.v?C.brand:C.inkSub} style={{flex:1,textAlign:"left"}}>{f.v}</Txt>
                  {form.bodyFocus===f.v&&<div style={{width:22,height:22,borderRadius:"50%",background:C.brand,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#FFF" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="4,13 9,18 20,7"/></svg></div>}
                </Btn>)}
              </div>
            </div>}

            {step===5&&<div className="rise">
              <Txt t="lbl" color={C.brand} style={{display:"block",marginBottom:SP.sm}}>Session length</Txt>
              <Txt t="d2" color={C.ink} style={{display:"block",marginBottom:SP.xl}}>How long do you have?</Txt>
              <div style={{display:"flex",flexDirection:"column",gap:SP.sm}}>
                {OB_SESSION.map(s=><Btn key={s.v} onPress={()=>setF("sessionLength",s.v)} style={{display:"flex",alignItems:"center",gap:SP.lg,padding:`${SP.xl}px ${SP.lg}px`,background:form.sessionLength===s.v?C.brandLt:C.elevated,border:`2px solid ${form.sessionLength===s.v?C.brand:C.border}`,borderRadius:R.lg,textAlign:"left",minHeight:TAP+8,transition:"all .15s"}}>
                  <div style={{width:52,height:52,borderRadius:R.md,background:form.sessionLength===s.v?`${C.brand}18`:C.sunken,display:"flex",alignItems:"center",justifyContent:"center",fontSize:26,flexShrink:0}}>{s.icon}</div>
                  <div style={{flex:1}}><Txt t="h2" color={form.sessionLength===s.v?C.brand:C.inkSub} style={{display:"block"}}>{s.v}</Txt><Txt t="b3" color={C.inkMuted}>{s.sub}</Txt></div>
                </Btn>)}
              </div>
            </div>}

            <div style={{display:"flex",gap:SP.sm,paddingTop:SP.xxl,borderTop:`1px solid ${C.border}`,marginTop:SP.xxl}}>
              {step>0&&<Btn onPress={goBack} style={{...TY.b2md,color:C.inkMuted,background:C.elevated,border:`1.5px solid ${C.border}`,borderRadius:R.lg,padding:`${SP.md}px ${SP.xl}px`,flexShrink:0,minHeight:TAP}}>← Back</Btn>}
              <Btn onPress={isLast?finish:goNext} disabled={!canNext} style={{flex:1,minHeight:TAP,background:canNext?`linear-gradient(135deg,${C.brand},${C.brandDk})`:C.sunken,borderRadius:R.lg,color:canNext?"#FFFFFE":C.inkGhost,...TY.b1sb,display:"flex",alignItems:"center",justifyContent:"center",gap:SP.sm,position:"relative",overflow:"hidden",transition:"all .2s"}}>
                {canNext&&!isLast&&<Shimmer/>}{isLast?"Build My Plan 🏃":"Continue →"}
              </Btn>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
//  SHARED CONTENT COMPONENTS (used by all screens, responsive-aware)
// ══════════════════════════════════════════════════════════════════════════════
function getGreeting(){const h=new Date().getHours();if(h<5)return"Still up?";if(h<12)return"Good morning";if(h<17)return"Good afternoon";if(h<21)return"Good evening";return"Good night";}
const WEEK_DAYS=["M","T","W","T","F","S","S"];
const CAT_COLOR={strength:C.brand,core:C.sage,mobility:C.violet,stability:C.amber,glute:C.brand,plyometric:C.gold};

// ── Home ───────────────────────────────────────────────────────────────────────
function HomeContent({onNav}) {
  const {profile,workoutHistory}=useApp();
  const {isPremium,workoutsLeft}=useSubState();
  const goalPhrases={"Marathon":"build strength for your marathon","5K":"power your 5K race pace","Half Marathon":"power your half marathon","Prevent Injury":"protect your body and run pain-free","Build Strength":"build real running strength","Improve Endurance":"build your endurance engine"};
  const today=new Date().getDay(),adjustedDay=today===0?6:today-1;

  return(
    <div style={{display:"flex",flexDirection:"column",gap:SP.md}}>
      <div className="rise" style={{display:"flex",alignItems:"center",gap:SP.sm}}>
        <div style={{width:7,height:7,borderRadius:"50%",background:C.brand,animation:"dotPulse 2.8s ease-in-out infinite"}}/>
        <Txt t="lbl" color={C.inkMuted}>{new Date().toLocaleDateString("en-GB",{weekday:"long",day:"numeric",month:"long"})}</Txt>
      </div>

      <Card v="elevated" className="rise d1" pad={SP.xl} style={{position:"relative",overflow:"hidden"}}>
        <div aria-hidden style={{position:"absolute",top:-20,right:-20,width:120,height:120,borderRadius:"50%",background:`radial-gradient(circle,${C.brandA22} 0%,transparent 70%)`}}/>
        <Txt t="lbl" color={C.brand} style={{display:"block",marginBottom:SP.sm}}>{getGreeting()}</Txt>
        <Txt t="d3" color={C.ink} style={{display:"block",marginBottom:SP.sm}}>{profile.name?`${profile.name}.`:"Resilient runner."}</Txt>
        <Txt t="b2" color={C.inkMuted} style={{display:"block",marginBottom:SP.lg}}>Ready to {goalPhrases[profile.goal]||"train smart today"}?</Txt>
        <div style={{display:"flex",flexWrap:"wrap",gap:SP.sm}}>
          {[profile.goal,profile.sessionLength,profile.bodyFocus].filter(Boolean).map(tag=><span key={tag} style={{...TY.lbl,fontSize:8,letterSpacing:1.2,padding:"3px 9px",borderRadius:R.pill,background:C.brandLt,color:C.brand,border:`1px solid ${C.brand}22`}}>{tag}</span>)}
        </div>
      </Card>

      <div className="rise d2" style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:SP.sm}}>
        <Btn onPress={()=>onNav("workout")} style={{background:`linear-gradient(140deg,${C.brandMd} 0%,${C.brand} 55%,${C.brandDk} 100%)`,borderRadius:R.xl,padding:`${SP.lg}px ${SP.xl}px`,display:"flex",alignItems:"center",gap:SP.md,boxShadow:C.shadowBrand,position:"relative",overflow:"hidden",minHeight:TAP+16,textAlign:"left"}}>
          <Shimmer/>
          <div style={{flex:1}}><Txt t="b1sb" color="#FFFEFD" style={{display:"block",marginBottom:3}}>Generate Workout</Txt><Txt t="b3" color="rgba(255,255,255,.65)">{isPremium?"Unlimited · Premium":`${workoutsLeft} of 3 left`}</Txt></div>
          <span style={{fontSize:24}}>⚡</span>
        </Btn>
        <Btn onPress={()=>onNav("wellness")} style={{background:C.elevated,border:`1.5px solid ${C.border}`,borderRadius:R.xl,padding:`${SP.lg}px ${SP.xl}px`,display:"flex",alignItems:"center",gap:SP.md,boxShadow:C.shadowSm,minHeight:TAP+16,textAlign:"left"}}>
          <div style={{flex:1}}><Txt t="b1sb" color={C.inkSub} style={{display:"block",marginBottom:3}}>Wellness Reset</Txt><Txt t="b3" color={C.inkMuted}>5-min challenges</Txt></div>
          <span style={{fontSize:24}}>🌿</span>
        </Btn>
      </div>

      <div className="rise d3" style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:SP.sm}}>
        <Card v="base" pad={SP.lg}>
          <Txt t="lbl" color={C.inkMuted} style={{display:"block",marginBottom:SP.sm}}>Streak</Txt>
          <div style={{display:"flex",alignItems:"baseline",gap:SP.xs}}><span style={{fontSize:22}}>🔥</span><Txt t="d3" color={C.brand}>{profile.streak}</Txt></div>
          <Txt t="b3" color={C.inkMuted}>days</Txt>
        </Card>
        <Card v="base" pad={SP.lg}>
          <Txt t="lbl" color={C.inkMuted} style={{display:"block",marginBottom:SP.sm}}>Sessions</Txt>
          <div style={{display:"flex",alignItems:"baseline",gap:SP.xs}}><Txt t="d3" color={C.sage}>{profile.sessionsThisWeek}</Txt><Txt t="b3" color={C.inkMuted}>/5</Txt></div>
          <div style={{height:4,background:C.sunken,borderRadius:R.pill,marginTop:SP.sm,overflow:"hidden"}}><div style={{height:"100%",width:`${(profile.sessionsThisWeek/5)*100}%`,background:`linear-gradient(90deg,${C.sage},${C.sageDk})`,borderRadius:R.pill}}/></div>
        </Card>
        <Card v="base" pad={SP.lg}>
          <Txt t="lbl" color={C.inkMuted} style={{display:"block",marginBottom:SP.sm}}>Workouts</Txt>
          <Txt t="d3" color={C.violet}>{workoutHistory.length}</Txt>
          <Txt t="b3" color={C.inkMuted} style={{display:"block"}}>total</Txt>
        </Card>
      </div>

      <Card v="base" className="rise d4" pad={SP.xl}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:SP.lg}}><Txt t="h2" color={C.ink}>This week</Txt></div>
        <div style={{display:"flex",gap:SP.sm,justifyContent:"space-between"}}>
          {WEEK_DAYS.map((d,i)=>{
            const isToday=i===adjustedDay;
            const done=workoutHistory.some(w=>{const wd=new Date(w.date);const weekDay=wd.getDay()===0?6:wd.getDay()-1;return weekDay===i;});
            return<div key={i} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:5,flex:1}}>
              <Txt t="lbl" color={isToday?C.brand:C.inkGhost} style={{fontSize:7}}>{d}</Txt>
              <div style={{width:"100%",maxWidth:36,aspectRatio:"1",borderRadius:"50%",background:isToday?C.brand:done?C.sageLt:C.sunken,border:`2px solid ${isToday?C.brand:done?C.sage:C.border}`,display:"flex",alignItems:"center",justifyContent:"center"}}>
                {isToday?<div style={{width:8,height:8,borderRadius:"50%",background:"#FFF"}}/>:done?<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={C.sage} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="4,13 9,18 20,7"/></svg>:null}
              </div>
            </div>;
          })}
        </div>
      </Card>

      {workoutHistory.length>0&&<Card v="base" className="rise d5" pad={SP.xl}>
        <Txt t="h2" color={C.ink} style={{display:"block",marginBottom:SP.lg}}>Recent workouts</Txt>
        <div style={{display:"flex",flexDirection:"column",gap:SP.sm}}>
          {workoutHistory.slice(0,4).map((w,i)=><div key={i} style={{display:"flex",alignItems:"center",gap:SP.md,padding:`${SP.sm}px 0`,borderBottom:i<3?`1px solid ${C.border}`:"none"}}>
            <div style={{width:36,height:36,borderRadius:R.md,background:C.brandLt,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,flexShrink:0}}>⚡</div>
            <div style={{flex:1}}><Txt t="b3md" color={C.ink} style={{display:"block"}}>{w.exerciseCount} exercises</Txt><Txt t="b3" color={C.inkMuted}>{w.date}</Txt></div>
            <Txt t="lbl" color={C.inkGhost} style={{fontSize:7}}>{w.goal}</Txt>
          </div>)}
        </div>
      </Card>}
    </div>
  );
}

// ── Workout ────────────────────────────────────────────────────────────────────
function WorkoutContent({selectedExercise, onSelectExercise}) {
  const {profile}=useApp();
  const appDispatch=useAppDispatch();
  const {canWorkout,workoutsLeft,isPremium,usage}=useSubState();
  const dispatch=useSubDispatch();
  const [result,setResult]=useState(null);
  const [showPaywall,setShowPaywall]=useState(false);
  const [showSuccess,setShowSuccess]=useState(false);
  const {isLoading,isError,error,run,reset}=useAsync();

  const handleGenerate=useCallback(async()=>{
    if(!canWorkout){setShowPaywall(true);return;}
    await run(async()=>{
      dispatch({type:"USE_WORKOUT"});
      await new Promise(res=>setTimeout(res,1200));
      const w=ENGINE.generate({goal:profile.goal||"Marathon",injuries:profile.injuries||[],bodyFocus:profile.bodyFocus||"Legs & Glutes",sessionLength:profile.sessionLength||"20–30 min",age:profile.ageRange||"30–39"});
      setResult(w);
      appDispatch({type:"LOG_WORKOUT",payload:{date:new Date().toLocaleDateString("en-GB",{weekday:"short",day:"numeric",month:"short"}),exerciseCount:w.exercises.length,goal:profile.goal||"Marathon"}});
      pushToast("Workout generated 💪");
    });
  },[canWorkout,dispatch,profile,run,appDispatch]);

  const locked=!isPremium&&workoutsLeft===0;

  return(
    <div style={{display:"flex",flexDirection:"column",gap:SP.md}}>
      <div className="rise">
        <Txt t="lbl" color={C.inkMuted} style={{display:"block",marginBottom:SP.xs}}>AI Workout Engine</Txt>
        <Txt t="d3" color={C.ink}>Generate Workout</Txt>
      </div>

      {profile.goal&&<Card v="sunken" className="rise d1" pad={SP.lg}>
        <div style={{display:"flex",gap:SP.xl,flexWrap:"wrap"}}>
          {[{l:"Goal",v:profile.goal},{l:"Focus",v:profile.bodyFocus},{l:"Session",v:profile.sessionLength},{l:"Age",v:profile.ageRange}].map(({l,v})=>v&&<div key={l}><Txt t="lbl" color={C.inkGhost} style={{display:"block",marginBottom:2}}>{l}</Txt><Txt t="b3md" color={C.inkSub}>{v}</Txt></div>)}
        </div>
      </Card>}

      <Card v={isPremium?"gold":"base"} className="rise d2" pad={SP.xl}>
        {isPremium
          ?<div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}><div><PremBadge/><Txt t="b3" color={C.goldDk} style={{display:"block",marginTop:SP.xs}}>Unlimited workouts</Txt></div><span style={{fontSize:24}}>✦</span></div>
          :<UsageBar used={usage.workouts} max={3} color={C.brand} label="Workout generations this week" onUpgrade={()=>setShowPaywall(true)}/>
        }
      </Card>

      {isError&&<div className="scale" style={{padding:SP.lg,background:C.brandLt,borderRadius:R.lg,border:`1px solid ${C.brand}30`,display:"flex",gap:SP.md,alignItems:"flex-start"}}><span style={{fontSize:18}}>⚠️</span><div style={{flex:1}}><Txt t="b2md" color={C.brand} style={{display:"block",marginBottom:4}}>Generation failed</Txt><Txt t="b3" color={C.inkMuted}>{error}</Txt></div><button onClick={reset} style={{...TY.b3,color:C.brand,background:"none",border:"none",cursor:"pointer",textDecoration:"underline"}}>Dismiss</button></div>}

      <Btn onPress={handleGenerate} disabled={isLoading} className="rise d3" style={{width:"100%",minHeight:TAP+14,background:locked?C.sunken:`linear-gradient(140deg,${C.brandMd} 0%,${C.brand} 55%,${C.brandDk} 100%)`,borderRadius:R.xl,padding:`${SP.lg}px ${SP.xl}px`,display:"flex",alignItems:"center",justifyContent:"space-between",gap:SP.lg,boxShadow:locked?"none":C.shadowBrand,position:"relative",overflow:"hidden"}}>
        {!locked&&!isLoading&&<Shimmer/>}
        <div style={{textAlign:"left",flex:1}}>
          <Txt t="b1sb" color={locked?C.inkMuted:"#FFFEFD"} style={{display:"block",marginBottom:3}}>{isLoading?"Building your workout…":"Generate Today's Workout"}</Txt>
          <Txt t="b3" color={locked?C.inkFaint:"rgba(255,255,255,.65)"}>{locked?"Limit reached · Upgrade to continue":isPremium?"Unlimited · Premium":`${workoutsLeft} of 3 remaining`}</Txt>
        </div>
        <div style={{width:TAP,height:TAP,borderRadius:R.lg,flexShrink:0,background:locked?C.sunken:"rgba(255,255,255,.14)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:22}}>
          {isLoading?<div style={{width:20,height:20,borderRadius:"50%",border:`2px solid rgba(255,255,255,.4)`,borderTopColor:"#FFFEFD",animation:"spin .7s linear infinite"}}/>:locked?"🔒":"⚡"}
        </div>
      </Btn>

      {result&&<div className="scale">
        <Card v="elevated" pad={SP.xl} style={{marginBottom:SP.md}}>
          <Txt t="lbl" color={C.sage} style={{display:"block",marginBottom:SP.sm}}>Workout ready — {result.exercises.length} exercises</Txt>
          <Txt t="b3" color={C.inkMuted} style={{display:"block",lineHeight:1.7}}>{result.sessionNote}</Txt>
          {result.injuryNote&&<Txt t="b3" color={C.brand} style={{display:"block",marginTop:SP.xs}}>🛡 {result.injuryNote}</Txt>}
          {result.ageNote&&<Txt t="b3" color={C.gold} style={{display:"block",marginTop:SP.xs}}>⏱ {result.ageNote}</Txt>}
        </Card>
        <div style={{display:"flex",flexDirection:"column",gap:SP.sm}}>
          {result.exercises.map((ex,i)=>(
            <Btn key={ex.id} onPress={()=>onSelectExercise?.(ex)} style={{width:"100%",textAlign:"left",background:"transparent"}}>
              <Card v="base" pad={SP.lg} style={{display:"flex",alignItems:"center",gap:SP.md,border:selectedExercise?.id===ex.id?`2px solid ${C.brand}`:undefined,transition:"border .15s"}}>
                <div style={{width:32,height:32,borderRadius:R.md,background:C.brandLt,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,...TY.c1sb,color:C.brand,fontSize:11}}>{i+1}</div>
                <div style={{flex:1}}><Txt t="b2md" color={C.ink} style={{display:"block",marginBottom:3}}>{ex.name}</Txt><Txt t="b3" color={C.inkMuted}>{ex.sets} sets · {ex.reps} · {ex.rest}s rest</Txt></div>
                <div style={{display:"flex",flexWrap:"wrap",gap:4,justifyContent:"flex-end",maxWidth:120}}>
                  {ex.muscles.slice(0,2).map(m=><span key={m} style={{...TY.lbl,fontSize:6,padding:"2px 6px",borderRadius:R.pill,background:C.sageLt,color:C.sageDk}}>{m}</span>)}
                </div>
              </Card>
            </Btn>
          ))}
        </div>
      </div>}

      <div className="rise d4" style={{marginTop:SP.sm}}>
        <Card v="base" style={{position:"relative",overflow:"hidden"}} pad={SP.xl}>
          {!isPremium&&<LockOverlay onUpgrade={()=>setShowPaywall(true)}/>}
          <div style={{display:"flex",gap:SP.lg}}>
            <div style={{fontSize:28}}>🏁</div>
            <div><Txt t="h2" color={C.ink} style={{display:"block",marginBottom:SP.xs}}>Race Training Programs</Txt><Txt t="b3" color={C.inkMuted} style={{lineHeight:1.6}}>12–20 week plans for marathon, half marathon, and 5K.</Txt>
              <div style={{display:"flex",gap:SP.sm,marginTop:SP.md,flexWrap:"wrap"}}>{["Marathon","Half Marathon","5K"].map(p=><span key={p} style={{...TY.lbl,fontSize:7,padding:"3px 9px",borderRadius:R.pill,background:C.violetLt,color:C.violet}}>{p}</span>)}</div>
            </div>
          </div>
        </Card>
      </div>

      {showPaywall&&<PaywallModal source="workout" onClose={()=>setShowPaywall(false)} onUpgrade={()=>{setShowPaywall(false);setShowSuccess(true);}}/>}
      {showSuccess&&<div className="fade" style={{position:"fixed",inset:0,zIndex:300,background:C.base,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:SP.xl,padding:SP.xl}}><div className="scale" style={{fontSize:56}}>✦</div><div style={{textAlign:"center"}}><Txt t="d2" color={C.gold} style={{display:"block",marginBottom:SP.md}}>Welcome to Premium</Txt><Txt t="b2" color={C.inkMuted}>Unlimited access unlocked.</Txt></div><PremBadge/><Btn onPress={()=>setShowSuccess(false)} style={{marginTop:SP.lg,...TY.b2md,color:C.inkMuted,background:C.elevated,border:`1.5px solid ${C.border}`,borderRadius:R.lg,padding:`${SP.md}px ${SP.xl}px`,minHeight:TAP}}>Continue →</Btn></div>}
    </div>
  );
}

// ── Exercise Detail Panel ──────────────────────────────────────────────────────
function ExerciseDetail({exercise, onClose}) {
  if (!exercise) return (
    <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:SP.lg,color:C.inkGhost}}>
      <span style={{fontSize:48}}>💪</span>
      <Txt t="b2" color={C.inkGhost}>Select an exercise to see details</Txt>
    </div>
  );
  const ex = exercise;
  return(
    <div className="scroll" style={{flex:1,padding:SP.xl}}>
      {onClose&&<Btn onPress={onClose} style={{display:"flex",alignItems:"center",gap:SP.sm,marginBottom:SP.xl,background:"transparent",color:C.inkMuted,...TY.b2md,minHeight:TAP}}>← Back</Btn>}
      <div className="rise">
        <span style={{...TY.lbl,fontSize:8,padding:"3px 9px",borderRadius:R.pill,background:(CAT_COLOR[ex.category]||C.brand)+"18",color:CAT_COLOR[ex.category]||C.brand,display:"inline-block",marginBottom:SP.md}}>{ex.category}</span>
        <Txt t="d3" color={C.ink} style={{display:"block",marginBottom:SP.xl}}>{ex.name}</Txt>
        <Card v="base" pad={SP.xl} style={{marginBottom:SP.md}}>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:SP.md}}>
            {[{l:"Sets",v:ex.sets},{l:"Reps",v:ex.reps},{l:"Rest",v:`${ex.rest}s`},{l:"Focus",v:ex.bodyFocus}].map(({l,v})=>(
              <div key={l} style={{padding:SP.md,background:C.sunken,borderRadius:R.md,textAlign:"center"}}>
                <Txt t="lbl" color={C.inkFaint} style={{display:"block",marginBottom:3}}>{l}</Txt>
                <Txt t="b2md" color={C.ink}>{v}</Txt>
              </div>
            ))}
          </div>
        </Card>
        <Card v="brand" pad={SP.xl} style={{marginBottom:SP.md}}>
          <Txt t="lbl" color={C.brandDk} style={{display:"block",marginBottom:SP.sm}}>Coaching cue</Txt>
          <Txt t="b2" color={C.inkSub} style={{lineHeight:1.7}}>{ex.cue}</Txt>
        </Card>
        <Card v="base" pad={SP.xl}>
          <Txt t="lbl" color={C.inkMuted} style={{display:"block",marginBottom:SP.md}}>Muscles worked</Txt>
          <div style={{display:"flex",flexWrap:"wrap",gap:SP.sm,marginBottom:SP.md}}>
            {ex.muscles.map(m=><span key={m} style={{...TY.b3md,padding:"6px 14px",borderRadius:R.pill,background:C.sageLt,color:C.sageDk,border:`1px solid ${C.sage}22`}}>{m}</span>)}
          </div>
          <Txt t="lbl" color={C.inkMuted} style={{display:"block",marginBottom:SP.sm,marginTop:SP.md}}>Equipment</Txt>
          <div style={{display:"flex",flexWrap:"wrap",gap:SP.sm,marginBottom:SP.md}}>
            {ex.equipment.map(e=><span key={e} style={{...TY.b3md,padding:"6px 14px",borderRadius:R.pill,background:C.sunken,color:C.inkMuted}}>{e}</span>)}
          </div>
          {ex.contraindications.length>0&&<>
            <Txt t="lbl" color={C.inkMuted} style={{display:"block",marginBottom:SP.sm,marginTop:SP.md}}>Avoid if</Txt>
            <div style={{display:"flex",flexWrap:"wrap",gap:SP.sm}}>
              {ex.contraindications.map(c=><span key={c} style={{...TY.b3md,padding:"6px 14px",borderRadius:R.pill,background:C.brandLt,color:C.brand}}>⚠️ {c} issues</span>)}
            </div>
          </>}
        </Card>
      </div>
    </div>
  );
}

// ── Wellness ───────────────────────────────────────────────────────────────────
function WellnessContent({selectedChallenge, onSelectChallenge}) {
  const {completedChallenges}=useApp();
  const appDispatch=useAppDispatch();
  const {canChallenge,isPremium,usage}=useSubState();
  const dispatch=useSubDispatch();
  const [filter,setFilter]=useState("all");
  const [showPaywall,setShowPaywall]=useState(false);
  const displayed=useMemo(()=>filter==="all"?CHALLENGES:CHALLENGES.filter(c=>c.cat===filter),[filter]);

  const startChallenge=useCallback((c)=>{
    if(!canChallenge){setShowPaywall(true);return;}
    dispatch({type:"USE_CHALLENGE"});
    onSelectChallenge?.(c);
  },[canChallenge,dispatch,onSelectChallenge]);

  return(
    <div style={{display:"flex",flexDirection:"column",gap:SP.md}}>
      <div className="rise">
        <Txt t="lbl" color={C.inkMuted} style={{display:"block",marginBottom:SP.xs}}>Mind &amp; Body</Txt>
        <Txt t="d3" color={C.ink}>Wellness Challenges</Txt>
      </div>
      <Card v={isPremium?"gold":"base"} className="rise d1" pad={SP.xl}>
        {isPremium
          ?<div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}><div><PremBadge/><Txt t="b3" color={C.goldDk} style={{display:"block",marginTop:SP.xs}}>Unlimited challenges</Txt></div><span style={{fontSize:24}}>✦</span></div>
          :<UsageBar used={usage.challenges} max={3} color={C.sage} label="Wellness challenges this week" onUpgrade={()=>setShowPaywall(true)}/>
        }
      </Card>
      <div className="rise d2" style={{display:"flex",gap:SP.sm}}>
        {["all","mindset","nutrition"].map(f=><Btn key={f} onPress={()=>setFilter(f)} style={{...TY.lbl,fontSize:8,letterSpacing:1.2,padding:"8px 16px",borderRadius:R.pill,background:filter===f?C.sage:C.elevated,color:filter===f?"#FFF":C.inkMuted,border:`1.5px solid ${filter===f?C.sage:C.border}`,minHeight:TAP-8,transition:"all .15s",textTransform:"capitalize"}}>{f}</Btn>)}
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:SP.sm}}>
        {displayed.map((ch,i)=>{
          const done=completedChallenges.includes(ch.id);
          const isSelected=selectedChallenge?.id===ch.id;
          return<Card key={ch.id} v="base" className={`rise d${Math.min(i+2,6)}`} pad={SP.lg} style={{border:isSelected?`2px solid ${C.sage}`:undefined,transition:"border .15s"}}>
            <div style={{display:"flex",gap:SP.md,alignItems:"flex-start"}}>
              <div style={{width:52,height:52,borderRadius:R.md,background:done?C.sageLt:ch.cat==="mindset"?C.sageLt:C.amberLt,display:"flex",alignItems:"center",justifyContent:"center",fontSize:26,flexShrink:0}}>{done?"✓":ch.emoji}</div>
              <div style={{flex:1}}>
                <div style={{display:"flex",alignItems:"center",gap:SP.sm,marginBottom:3,flexWrap:"wrap"}}>
                  <Txt t="b2md" color={done?C.sage:C.ink}>{ch.title}</Txt>
                  <span style={{...TY.lbl,fontSize:7,padding:"2px 7px",borderRadius:R.pill,background:ch.cat==="mindset"?C.sageLt:C.amberLt,color:ch.cat==="mindset"?C.sageDk:C.amber}}>{ch.cat}</span>
                  <span style={{...TY.lbl,fontSize:7,padding:"2px 7px",borderRadius:R.pill,background:C.sunken,color:C.inkMuted}}>{ch.dur}</span>
                </div>
                <Txt t="b3" color={C.inkMuted}>{ch.hook}</Txt>
                {!done&&<Btn onPress={()=>startChallenge(ch)} style={{marginTop:SP.md,...TY.b3md,color:C.sage,background:C.sageLt,border:`1px solid ${C.sage}30`,borderRadius:R.md,padding:`${SP.sm}px ${SP.md}px`,minHeight:TAP-10,display:"inline-flex",alignItems:"center",gap:SP.sm}}>Start →</Btn>}
              </div>
            </div>
          </Card>;
        })}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:SP.sm,textAlign:"center"}}>
        {[{v:CHALLENGES.filter(c=>c.cat==="mindset").length,l:"Mindset",color:C.sage},{v:CHALLENGES.filter(c=>c.cat==="nutrition").length,l:"Nutrition",color:C.amber},{v:completedChallenges.length,l:"Completed",color:C.brand}].map(s=><Card key={s.l} v="sunken" pad={SP.md}><Txt t="d3" color={s.color} style={{display:"block",marginBottom:4,lineHeight:1}}>{s.v}</Txt><Txt t="lbl" color={C.inkFaint}>{s.l}</Txt></Card>)}
      </div>
      {showPaywall&&<PaywallModal source="challenge" onClose={()=>setShowPaywall(false)}/>}
    </div>
  );
}

// ── Challenge Detail Panel ─────────────────────────────────────────────────────
function ChallengeDetail({challenge, onClose}) {
  const appDispatch=useAppDispatch();
  const [step,setStep]=useState(0);

  useEffect(()=>{setStep(0);},[challenge]);

  if(!challenge) return(
    <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:SP.lg}}>
      <span style={{fontSize:48}}>🌿</span>
      <Txt t="b2" color={C.inkGhost}>Select a challenge to begin</Txt>
    </div>
  );

  const total=challenge.steps.length;
  const complete=()=>{
    appDispatch({type:"LOG_CHALLENGE",payload:challenge.id});
    pushToast(`${challenge.emoji} Challenge complete!`);
    onClose?.();
  };

  return(
    <div className="scroll" style={{flex:1,padding:SP.xl}}>
      {onClose&&<Btn onPress={onClose} style={{display:"flex",alignItems:"center",gap:SP.sm,marginBottom:SP.xl,background:"transparent",color:C.inkMuted,...TY.b2md,minHeight:TAP}}>← Back</Btn>}
      <div className="rise" style={{textAlign:"center",marginBottom:SP.xxl}}>
        <div style={{fontSize:52,marginBottom:SP.md}}>{challenge.emoji}</div>
        <Txt t="d3" color={C.ink} style={{display:"block",marginBottom:SP.sm}}>{challenge.title}</Txt>
        <Txt t="b2" color={C.inkMuted}>{challenge.hook}</Txt>
      </div>
      <div style={{display:"flex",gap:SP.sm,marginBottom:SP.xl}}>
        {challenge.steps.map((_,i)=><div key={i} style={{flex:1,height:4,borderRadius:R.pill,background:i<=step?C.sage:C.sunken,transition:"background .3s"}}/>)}
      </div>
      <Card v="elevated" pad={SP.xl} style={{marginBottom:SP.xl}}>
        <Txt t="lbl" color={C.sage} style={{display:"block",marginBottom:SP.md}}>Step {step+1} of {total}</Txt>
        <Txt t="b2" color={C.ink} style={{display:"block",lineHeight:1.7}}>{challenge.steps[step]}</Txt>
      </Card>
      <div style={{display:"flex",gap:SP.sm}}>
        {step>0&&<Btn onPress={()=>setStep(s=>s-1)} style={{...TY.b2md,color:C.inkMuted,background:C.elevated,border:`1.5px solid ${C.border}`,borderRadius:R.lg,padding:`${SP.md}px ${SP.xl}px`,flexShrink:0,minHeight:TAP}}>← Back</Btn>}
        <Btn onPress={step<total-1?()=>setStep(s=>s+1):complete} style={{flex:1,minHeight:TAP,background:`linear-gradient(135deg,${C.sage},${C.sageDk})`,borderRadius:R.lg,color:"#FFFFFE",...TY.b1sb,display:"flex",alignItems:"center",justifyContent:"center",gap:SP.sm,position:"relative",overflow:"hidden"}}>
          <Shimmer/>{step<total-1?"Next step →":"Complete ✓"}
        </Btn>
      </div>
    </div>
  );
}

// ── Library ────────────────────────────────────────────────────────────────────
function LibraryContent({selectedExercise, onSelectExercise}) {
  const [q,setQ]=useState("");
  const [cat,setCat]=useState("all");
  const cats=useMemo(()=>["all",...[...new Set(EXERCISES.map(e=>e.category))]]  ,[]);
  const filtered=useMemo(()=>EXERCISES.filter(e=>(!q||e.name.toLowerCase().includes(q.toLowerCase())||e.muscles.some(m=>m.toLowerCase().includes(q.toLowerCase())))&&(cat==="all"||e.category===cat)),[q,cat]);

  return(
    <div style={{display:"flex",flexDirection:"column",gap:SP.md}}>
      <div className="rise">
        <Txt t="lbl" color={C.inkMuted} style={{display:"block",marginBottom:SP.xs}}>Reference</Txt>
        <Txt t="d3" color={C.ink}>{EXERCISES.length} Exercises</Txt>
      </div>
      <div className="rise d1" style={{position:"relative"}}>
        <span style={{position:"absolute",left:SP.lg,top:"50%",transform:"translateY(-50%)",fontSize:16,pointerEvents:"none"}}>🔍</span>
        <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search by name or muscle…" style={{width:"100%",padding:`${SP.md}px ${SP.xl}px ${SP.md}px ${SP.xxxl+4}px`,background:C.elevated,border:`1.5px solid ${C.border}`,borderRadius:R.lg,color:C.ink,...TY.b2,outline:"none",fontSize:16}} onFocus={e=>e.target.style.borderColor=C.brand} onBlur={e=>e.target.style.borderColor=C.border}/>
      </div>
      <div className="rise d2" style={{display:"flex",gap:SP.sm,overflowX:"auto",paddingBottom:SP.xs}}>
        {cats.map(c=><Btn key={c} onPress={()=>setCat(c)} style={{...TY.lbl,fontSize:7,padding:"6px 12px",borderRadius:R.pill,background:cat===c?(CAT_COLOR[c]||C.brand):C.elevated,color:cat===c?"#FFF":C.inkMuted,border:`1.5px solid ${cat===c?(CAT_COLOR[c]||C.brand):C.border}`,flexShrink:0,minHeight:TAP-16,textTransform:"capitalize",transition:"all .15s"}}>{c}</Btn>)}
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:SP.sm}}>
        {filtered.map((ex,i)=>(
          <Btn key={ex.id} onPress={()=>onSelectExercise?.(ex)} style={{width:"100%",textAlign:"left",background:"transparent"}}>
            <Card v="base" pad={SP.lg} style={{display:"flex",alignItems:"center",gap:SP.md,border:selectedExercise?.id===ex.id?`2px solid ${C.brand}`:undefined,transition:"border .15s"}}>
              <div style={{width:44,height:44,borderRadius:R.md,background:(CAT_COLOR[ex.category]||C.brand)+"14",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,...TY.b2md,color:CAT_COLOR[ex.category]||C.brand,fontSize:11}}>{ex.category.substring(0,3).toUpperCase()}</div>
              <div style={{flex:1,minWidth:0}}>
                <Txt t="b2md" color={C.ink} style={{display:"block",marginBottom:3}}>{ex.name}</Txt>
                <Txt t="b3" color={C.inkMuted} style={{display:"block",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{ex.muscles.join(" · ")}</Txt>
              </div>
              <div style={{textAlign:"right",flexShrink:0}}>
                <Txt t="b3md" color={C.inkMuted} style={{display:"block"}}>{ex.sets}×{ex.reps}</Txt>
                <Txt t="lbl" color={C.inkGhost} style={{fontSize:7}}>{ex.rest}s rest</Txt>
              </div>
            </Card>
          </Btn>
        ))}
        {filtered.length===0&&<div style={{textAlign:"center",padding:SP.xxxl}}><span style={{fontSize:32}}>🔍</span><Txt t="b2" color={C.inkMuted} style={{display:"block",marginTop:SP.md}}>No exercises found</Txt></div>}
      </div>
    </div>
  );
}

// ── Settings ───────────────────────────────────────────────────────────────────
function SettingsContent({onNav}) {
  const {profile,workoutHistory,completedChallenges}=useApp();
  const appDispatch=useAppDispatch();
  const {tier,isPremium,usage}=useSubState();
  const dispatch=useSubDispatch();
  const togglePrem=()=>{dispatch({type:"TOGGLE_PREMIUM"});pushToast(tier==="free"?"✦ Premium activated":"Switched to Free");};
  const resetUsage=()=>{dispatch({type:"RESET_USAGE"});pushToast("Usage reset ↺");};
  const resetOnboard=()=>{appDispatch({type:"SET_SCREEN",payload:{screen:"onboarding",dir:"back"}});pushToast("Onboarding reset");};
  const clearData=()=>{if(window.confirm("Clear all saved data? This cannot be undone.")){localStorage.removeItem(STORAGE_KEY);window.location.reload();}};

  return(
    <div style={{display:"flex",flexDirection:"column",gap:SP.md}}>
      <div className="rise">
        <Txt t="lbl" color={C.inkMuted} style={{display:"block",marginBottom:SP.xs}}>Account &amp; Preferences</Txt>
        <Txt t="d3" color={C.ink}>Settings</Txt>
      </div>

      {profile.name&&<Card v={isPremium?"gold":"base"} className="rise d1" pad={SP.xl}>
        <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:SP.md}}>
          <div><Txt t="lbl" color={isPremium?C.goldDk:C.inkMuted} style={{display:"block",marginBottom:SP.xs}}>Current plan</Txt><div style={{display:"flex",alignItems:"center",gap:SP.sm}}><Txt t="h1" color={C.ink}>{profile.name}</Txt>{isPremium&&<PremBadge/>}</div></div>
          <span style={{fontSize:26}}>{isPremium?"✦":"○"}</span>
        </div>
        <Txt t="b3" color={C.inkMuted}>{isPremium?"Unlimited access active.":profile.goal&&`Training for: ${profile.goal}`}</Txt>
      </Card>}

      <div className="rise d2" style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:SP.sm}}>
        {[{v:workoutHistory.length,l:"Workouts",color:C.brand},{v:completedChallenges.length,l:"Challenges",color:C.sage},{v:profile.streak,l:"Day streak",color:C.gold}].map(s=><Card key={s.l} v="sunken" pad={SP.md} style={{textAlign:"center"}}><Txt t="d3" color={s.color} style={{display:"block",marginBottom:4,lineHeight:1}}>{s.v}</Txt><Txt t="lbl" color={C.inkFaint}>{s.l}</Txt></Card>)}
      </div>

      <Card v="base" className="rise d3" pad={SP.xl}>
        <Txt t="lbl" color={C.brand} style={{display:"block",marginBottom:SP.md}}>Developer / Testing</Txt>
        <div style={{padding:SP.md,background:C.brandA12,borderRadius:R.lg,border:`1px solid ${C.brand}22`,marginBottom:SP.lg}}><Txt t="b3" color={C.brand}>🛠 Toggle simulates premium without payment.</Txt></div>
        <Toggle value={tier==="premium"} onChange={togglePrem} color={C.gold} label="Simulate Premium" sub="Toggles between Free and Premium instantly"/>
        <Divider style={{margin:`${SP.sm}px 0`}}/>
        <Btn onPress={resetUsage} style={{width:"100%",minHeight:TAP,display:"flex",alignItems:"center",justifyContent:"space-between",background:"transparent",padding:`${SP.sm}px 0`}}>
          <div style={{textAlign:"left"}}><Txt t="b2md" color={C.ink} style={{display:"block",marginBottom:2}}>Reset Weekly Usage</Txt><Txt t="b3" color={C.inkMuted}>Workouts and challenges back to 0</Txt></div>
          <div style={{width:34,height:34,borderRadius:R.sm,background:C.sunken,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16}}>↺</div>
        </Btn>
      </Card>

      <Card v="base" className="rise d4" pad={SP.xl}>
        <Txt t="lbl" color={C.inkMuted} style={{display:"block",marginBottom:SP.lg}}>This week's usage</Txt>
        <div style={{display:"flex",flexDirection:"column",gap:SP.lg}}>
          <UsageBar used={isPremium?Infinity:usage.workouts}   max={3} color={C.brand} label="Workout generations"/>
          <Divider/>
          <UsageBar used={isPremium?Infinity:usage.challenges} max={3} color={C.sage}  label="Wellness challenges"/>
        </div>
      </Card>

      <Card v="gold" className="rise d5" pad={SP.xl} style={{position:"relative"}}>
        <div style={{position:"absolute",top:-10,right:SP.xl,...TY.lbl,fontSize:8,letterSpacing:1.5,padding:"4px 12px",borderRadius:R.pill,background:C.gold,color:"#FFFFFE"}}>Most Popular</div>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:SP.md}}><div style={{display:"flex",alignItems:"center",gap:SP.sm}}><Txt t="h2" color={C.goldDk}>Premium</Txt><PremBadge sm/></div><div style={{textAlign:"right"}}><Txt t="h2" color={C.goldDk} style={{display:"block"}}>£7.99</Txt><Txt t="b3" color={C.gold}>/month</Txt></div></div>
        <Divider color={`${C.gold}22`} style={{marginBottom:SP.md}}/>
        {["Unlimited workouts","Unlimited challenges","Race programs","Advanced filters","Export workouts"].map((l,i)=><div key={i} style={{display:"flex",alignItems:"center",gap:SP.md,padding:`${SP.sm}px 0`}}><div style={{width:18,height:18,borderRadius:R.sm,background:C.goldA14,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={C.gold} strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="4,13 9,18 20,7"/></svg></div><Txt t="b3" color={C.inkSub}>{l}</Txt></div>)}
        {!isPremium&&<Btn onPress={()=>dispatch({type:"UPGRADE"})} style={{width:"100%",minHeight:TAP+4,marginTop:SP.lg,background:`linear-gradient(135deg,${C.gold} 0%,${C.goldDk} 100%)`,borderRadius:R.xl,color:"#FFFFFE",...TY.b1sb,display:"flex",alignItems:"center",justifyContent:"center",gap:SP.sm,animation:"goldPulse 3s ease-in-out infinite",position:"relative",overflow:"hidden"}}><Shimmer/><span>✦</span><span>Upgrade (Simulated)</span></Btn>}
        {isPremium&&<div style={{marginTop:SP.lg,padding:`${SP.md}px ${SP.lg}px`,borderRadius:R.lg,background:`${C.gold}18`,border:`1px solid ${C.gold}30`,textAlign:"center"}}><Txt t="b3md" color={C.goldDk}>✦ Premium active — unlimited access</Txt></div>}
        <Txt t="lbl" color={`${C.gold}70`} style={{display:"block",textAlign:"center",marginTop:SP.md,fontSize:8}}>No payment taken — simulation only</Txt>
      </Card>

      <Card v="sunken" className="rise d6" pad={SP.lg} style={{marginBottom:SP.sm}}>
        <Btn onPress={resetOnboard} style={{width:"100%",display:"flex",alignItems:"center",justifyContent:"space-between",background:"transparent",minHeight:TAP}}>
          <div style={{textAlign:"left"}}><Txt t="b2md" color={C.ink} style={{display:"block",marginBottom:2}}>Update Profile</Txt><Txt t="b3" color={C.inkMuted}>Redo onboarding to change your goals</Txt></div>
          <span style={{fontSize:20,color:C.inkMuted}}>→</span>
        </Btn>
      </Card>
      <Card v="sunken" className="rise" pad={SP.lg}>
        <Btn onPress={clearData} style={{width:"100%",display:"flex",alignItems:"center",justifyContent:"space-between",background:"transparent",minHeight:TAP}}>
          <div style={{textAlign:"left"}}><Txt t="b2md" color={C.brand} style={{display:"block",marginBottom:2}}>Clear All Data</Txt><Txt t="b3" color={C.inkMuted}>Erase profile, history &amp; progress</Txt></div>
          <span style={{fontSize:20,color:C.brand}}>🗑</span>
        </Btn>
      </Card>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
//  NAVIGATION
// ══════════════════════════════════════════════════════════════════════════════
const NAV_TABS = [
  { id:"home",     icon:"🏠", label:"Home"     },
  { id:"workout",  icon:"⚡", label:"Workout"  },
  { id:"wellness", icon:"🌿", label:"Wellness" },
  { id:"library",  icon:"📚", label:"Library"  },
  { id:"settings", icon:"⚙",  label:"Settings" },
];
const TAB_IDX = NAV_TABS.reduce((acc,t,i)=>({...acc,[t.id]:i}),{});

// ── Sidebar (tablet + desktop) ─────────────────────────────────────────────────
function Sidebar({active, onNav, isPremium}) {
  return(
    <div style={{width:C.sidebarW,flexShrink:0,background:C.elevated,borderRight:`1px solid ${C.border}`,display:"flex",flexDirection:"column",height:"100%",overflowY:"auto"}}>
      <div style={{padding:`${SP.xl}px ${SP.lg}px ${SP.lg}px`,borderBottom:`1px solid ${C.border}`}}>
        <div style={{display:"flex",alignItems:"center",gap:SP.md,marginBottom:SP.md}}>
          <div style={{width:36,height:36,background:`linear-gradient(135deg,${C.brand},${C.brandDk})`,borderRadius:R.md,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0}}>🏃</div>
          <div><Txt t="b1sb" color={C.ink} style={{display:"block",lineHeight:1.1}}>Resilient</Txt><Txt t="b1sb" color={C.brand} style={{display:"block",lineHeight:1.1}}>Runner</Txt></div>
        </div>
        {isPremium&&<PremBadge/>}
      </div>
      <nav style={{flex:1,padding:`${SP.sm}px ${SP.sm}px`}}>
        {NAV_TABS.map(tab=>{
          const isActive=tab.id===active;
          return<Btn key={tab.id} onPress={()=>onNav(tab.id)} style={{width:"100%",display:"flex",alignItems:"center",gap:SP.md,padding:`${SP.md}px ${SP.md}px`,borderRadius:R.lg,background:isActive?C.brandLt:"transparent",marginBottom:SP.xs,minHeight:TAP,textAlign:"left",transition:"background .15s"}}>
            <span style={{fontSize:18,width:22,textAlign:"center"}}>{tab.icon}</span>
            <Txt t="b2md" color={isActive?C.brand:C.inkMuted}>{tab.label}</Txt>
            {isActive&&<div style={{marginLeft:"auto",width:5,height:5,borderRadius:"50%",background:C.brand,flexShrink:0}}/>}
          </Btn>;
        })}
      </nav>
      <div style={{padding:`${SP.lg}px`,borderTop:`1px solid ${C.border}`}}>
        <Txt t="lbl" color={C.inkGhost} style={{display:"block",fontSize:7}}>Resilient Runner v1.0</Txt>
        <Txt t="b3" color={C.inkFaint} style={{display:"block",marginTop:2}}>Built for runners</Txt>
      </div>
    </div>
  );
}

// ── Bottom nav (mobile) ────────────────────────────────────────────────────────
function BottomNav({active, onNav}) {
  return(
    <div style={{background:C.elevated,borderTop:`1px solid ${C.border}`,boxShadow:"0 -1px 12px rgba(27,25,22,.06)",flexShrink:0,paddingBottom:"env(safe-area-inset-bottom, 0px)"}}>
      <div style={{display:"grid",gridTemplateColumns:`repeat(${NAV_TABS.length},1fr)`,height:56}}>
        {NAV_TABS.map(tab=>{
          const isActive=tab.id===active;
          return<Btn key={tab.id} onPress={()=>onNav(tab.id)} aria={tab.label} style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:2,background:"transparent",minHeight:TAP,position:"relative"}}>
            <span style={{fontSize:20,lineHeight:1}}>{tab.icon}</span>
            <Txt t="lbl" color={isActive?C.brand:C.inkFaint} style={{fontSize:7,letterSpacing:.6}}>{tab.label}</Txt>
            {isActive&&<div style={{position:"absolute",bottom:0,width:18,height:2.5,background:C.brand,borderRadius:R.pill}}/>}
          </Btn>;
        })}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
//  APP SHELL — ties everything together
// ══════════════════════════════════════════════════════════════════════════════
function AppShell() {
  const {screen,screenDir,hasOnboarded}=useApp();
  const {isPremium}=useSubState();
  const appDispatch=useAppDispatch();
  const bp=useBreakpoint();
  const isMobile=bp==="mobile";
  const isDesktop=bp==="desktop";

  // Second-panel state for two-panel desktop layout
  const [selectedExercise, setSelectedExercise]=useState(null);
  const [selectedChallenge, setSelectedChallenge]=useState(null);

  const navTo=useCallback((id)=>{
    if(id===screen)return;
    const dir=(TAB_IDX[id]??0)>(TAB_IDX[screen]??0)?"forward":"back";
    appDispatch({type:"SET_SCREEN",payload:{screen:id,dir}});
    setSelectedExercise(null);
    setSelectedChallenge(null);
  },[screen,appDispatch]);

  if(!hasOnboarded||screen==="onboarding") return <OnboardingScreen/>;

  const animClass=!screenDir?"fade":screenDir==="forward"?"slideL":"slideR";

  // ── What to render in the main (left) panel ──────────────────────────────
  function MainPanel() {
    switch(screen) {
      case "home":     return <HomeContent onNav={navTo}/>;
      case "workout":  return <WorkoutContent selectedExercise={selectedExercise} onSelectExercise={isDesktop?setSelectedExercise:ex=>{setSelectedExercise(ex);}}/>;
      case "wellness": return <WellnessContent selectedChallenge={selectedChallenge} onSelectChallenge={isDesktop?setSelectedChallenge:setSelectedChallenge}/>;
      case "library":  return <LibraryContent selectedExercise={selectedExercise} onSelectExercise={isDesktop?setSelectedExercise:setSelectedExercise}/>;
      case "settings": return <SettingsContent onNav={navTo}/>;
      default:         return <HomeContent onNav={navTo}/>;
    }
  }

  // ── Mobile layout ──────────────────────────────────────────────────────────
  if (isMobile) {
    // Mobile: if an exercise or challenge is selected, show its detail full-screen
    if (selectedExercise && (screen==="workout"||screen==="library")) {
      return(
        <div style={{position:"fixed",inset:0,background:C.base,display:"flex",flexDirection:"column",overflow:"hidden"}}>
          <div style={{height:"env(safe-area-inset-top, 44px)",minHeight:44,background:C.elevated,flexShrink:0}}/>
          <ExerciseDetail exercise={selectedExercise} onClose={()=>setSelectedExercise(null)}/>
          <BottomNav active={screen} onNav={navTo}/>
          <ToastRenderer/>
        </div>
      );
    }
    if (selectedChallenge && screen==="wellness") {
      return(
        <div style={{position:"fixed",inset:0,background:C.base,display:"flex",flexDirection:"column",overflow:"hidden"}}>
          <div style={{height:"env(safe-area-inset-top, 44px)",minHeight:44,background:C.elevated,flexShrink:0}}/>
          <ChallengeDetail challenge={selectedChallenge} onClose={()=>setSelectedChallenge(null)}/>
          <BottomNav active={screen} onNav={navTo}/>
          <ToastRenderer/>
        </div>
      );
    }
    return(
      <div style={{position:"fixed",inset:0,background:C.base,display:"flex",flexDirection:"column",overflow:"hidden"}}>
        <div style={{height:"env(safe-area-inset-top, 44px)",minHeight:44,background:C.elevated,flexShrink:0,display:"flex",alignItems:"flex-end",justifyContent:"space-between",padding:`0 ${SP.xxl}px ${SP.sm}px`}}>
          <Txt t="c1sb" color={C.inkMuted}>{new Date().toLocaleTimeString("en-US",{hour:"2-digit",minute:"2-digit"})}</Txt>
          {isPremium&&<PremBadge sm/>}
        </div>
        <ErrBoundary key={screen}>
          <div key={screen} className={`scroll ${animClass}`} style={{flex:1}}>
            <div style={{padding:`${SP.xl}px ${SP.xl}px`,paddingBottom:`calc(${SP.xxxl}px + env(safe-area-inset-bottom))`}}>
              <MainPanel/>
            </div>
          </div>
        </ErrBoundary>
        <BottomNav active={screen} onNav={navTo}/>
        <ToastRenderer/>
      </div>
    );
  }

  // ── Tablet / Desktop layout ────────────────────────────────────────────────
  const showSecondPanel = isDesktop && (screen==="workout"||screen==="wellness"||screen==="library");

  return(
    <div style={{position:"fixed",inset:0,display:"flex",flexDirection:"column",background:C.base,overflow:"hidden"}}>
      {/* Top header bar */}
      <div style={{height:56,background:C.elevated,borderBottom:`1px solid ${C.border}`,display:"flex",alignItems:"center",justifyContent:"space-between",padding:`0 ${SP.xxl}px`,flexShrink:0,boxShadow:C.shadowXs}}>
        <div style={{display:"flex",alignItems:"center",gap:SP.md}}>
          <div style={{width:30,height:30,background:`linear-gradient(135deg,${C.brand},${C.brandDk})`,borderRadius:R.sm,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16}}>🏃</div>
          <Txt t="h2" color={C.ink}>Resilient Runner</Txt>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:SP.lg}}>
          {isPremium&&<PremBadge/>}
          <Txt t="lbl" color={C.inkMuted} style={{fontSize:8}}>{new Date().toLocaleDateString("en-GB",{weekday:"long",day:"numeric",month:"long"})}</Txt>
        </div>
      </div>

      {/* Body: sidebar + content */}
      <div style={{flex:1,display:"flex",overflow:"hidden"}}>
        <Sidebar active={screen} onNav={navTo} isPremium={isPremium}/>

        {/* Main content area */}
        <div style={{flex:1,display:"flex",overflow:"hidden",background:C.base}}>

          {/* Primary panel */}
          <div key={screen} className={`scroll ${animClass}`} style={{flex:showSecondPanel?`0 0 ${isDesktop?"420px":"100%"}`:"1 1 auto",minWidth:0,borderRight:showSecondPanel?`1px solid ${C.border}`:"none"}}>
            <div style={{padding:`${SP.xl}px ${SP.xxl}px`,maxWidth:showSecondPanel?undefined:860,margin:showSecondPanel?undefined:"0 auto"}}>
              <ErrBoundary key={screen}><MainPanel/></ErrBoundary>
            </div>
          </div>

          {/* Detail panel — desktop only */}
          {showSecondPanel&&(
            <div className="scroll" style={{flex:1,minWidth:0,background:C.elevated,borderLeft:`1px solid ${C.border}`}}>
              {(screen==="workout"||screen==="library")&&<ExerciseDetail exercise={selectedExercise} onClose={()=>setSelectedExercise(null)}/>}
              {screen==="wellness"&&<ChallengeDetail challenge={selectedChallenge} onClose={()=>setSelectedChallenge(null)}/>}
            </div>
          )}
        </div>
      </div>

      <ToastRenderer/>
    </div>
  );
}

// ── Root ───────────────────────────────────────────────────────────────────────
export default function ResilientRunnerApp() {
  return(
    <>
      <style>{CSS}</style>
      <AppProvider>
        <SubProvider>
          <AppShell/>
        </SubProvider>
      </AppProvider>
    </>
  );
}