import type { SceneId } from "@cineai/domain-types";

const CyberpunkScene = () => (
  <svg viewBox="0 0 320 180" xmlns="http://www.w3.org/2000/svg">
    <rect width="320" height="180" fill="#050014" />
    <rect x="0" y="60" width="28" height="120" fill="#0D0020" />
    <rect x="4" y="70" width="4" height="3" fill="#FF2D7A" opacity=".9" />
    <rect x="10" y="80" width="4" height="3" fill="#FF2D7A" opacity=".7" />
    <rect x="4" y="90" width="4" height="3" fill="#3EE8FF" opacity=".8" />
    <rect x="30" y="40" width="22" height="140" fill="#0A001A" />
    <rect x="34" y="50" width="4" height="3" fill="#3EE8FF" opacity=".9" />
    <rect x="40" y="62" width="4" height="3" fill="#FF2D7A" />
    <rect x="54" y="20" width="32" height="160" fill="#07000F" />
    <rect x="58" y="28" width="5" height="4" fill="#3EE8FF" />
    <rect x="65" y="28" width="5" height="4" fill="#3EE8FF" />
    <rect x="72" y="28" width="5" height="4" fill="#FF2D7A" />
    <rect x="88" y="50" width="20" height="130" fill="#0E0025" />
    <rect x="180" y="30" width="40" height="150" fill="#06000E" />
    <rect x="185" y="40" width="6" height="5" fill="#3EE8FF" />
    <rect x="193" y="40" width="6" height="5" fill="#FF2D7A" />
    <rect x="201" y="40" width="6" height="5" fill="#FFB930" />
    <rect x="225" y="10" width="50" height="170" fill="#080018" />
    <rect x="230" y="18" width="7" height="6" fill="#FF2D7A" />
    <rect x="240" y="18" width="7" height="6" fill="#3EE8FF" />
    <rect x="250" y="18" width="7" height="6" fill="#FFB930" />
    <rect x="278" y="45" width="42" height="135" fill="#050010" />
    <rect x="0" y="145" width="320" height="35" fill="#0A0015" />
    <rect x="50" y="148" width="8" height="30" fill="#FF2D7A" opacity=".18" />
    <rect x="100" y="152" width="5" height="25" fill="#3EE8FF" opacity=".15" />
    <rect x="190" y="150" width="10" height="28" fill="#FF2D7A" opacity=".12" />
    <line x1="30" y1="0" x2="28" y2="45" stroke="rgba(150,180,255,0.12)" strokeWidth="0.5" />
    <line x1="150" y1="5" x2="148" y2="55" stroke="rgba(150,180,255,0.15)" strokeWidth="0.5" />
  </svg>
);

const OceanScene = () => (
  <svg viewBox="0 0 320 180" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="oc-sky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#0A1A3A" />
        <stop offset="40%" stopColor="#FF6B35" stopOpacity="0.6" />
        <stop offset="100%" stopColor="#FFB347" />
      </linearGradient>
      <radialGradient id="oc-sun" cx="50%" cy="55%">
        <stop offset="0%" stopColor="#FFF0A0" />
        <stop offset="30%" stopColor="#FFB347" stopOpacity="0.6" />
        <stop offset="100%" stopColor="transparent" />
      </radialGradient>
      <linearGradient id="oc-sea" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#1E4080" />
        <stop offset="100%" stopColor="#0A1A3A" />
      </linearGradient>
    </defs>
    <rect width="320" height="180" fill="url(#oc-sky)" />
    <ellipse cx="160" cy="92" rx="80" ry="80" fill="url(#oc-sun)" />
    <circle cx="160" cy="92" r="18" fill="#FFF0A0" opacity="0.95" />
    <ellipse cx="60" cy="70" rx="35" ry="12" fill="#FF7A50" opacity="0.35" />
    <ellipse cx="260" cy="60" rx="45" ry="14" fill="#FF9060" opacity="0.30" />
    <rect x="0" y="100" width="320" height="80" fill="url(#oc-sea)" />
    <ellipse cx="160" cy="105" rx="12" ry="40" fill="#FFE070" opacity="0.25" />
    <path d="M0 115 Q80 110 160 115 Q240 120 320 115" stroke="rgba(255,255,255,0.15)" strokeWidth="1" fill="none" />
    <path d="M0 125 Q100 121 200 125 Q260 129 320 125" stroke="rgba(255,255,255,0.10)" strokeWidth="1" fill="none" />
  </svg>
);

const ForestScene = () => (
  <svg viewBox="0 0 320 180" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="fr-sky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#0A1F0A" />
        <stop offset="100%" stopColor="#1A3A0A" />
      </linearGradient>
    </defs>
    <rect width="320" height="180" fill="url(#fr-sky)" />
    <rect x="0" y="60" width="20" height="120" fill="#0A2A0A" />
    <polygon points="10,20 0,65 20,65" fill="#0D3A0D" />
    <rect x="25" y="50" width="22" height="130" fill="#0D300D" />
    <polygon points="36,5 22,55 50,55" fill="#10420A" />
    <rect x="55" y="55" width="18" height="125" fill="#0A280A" />
    <polygon points="64,18 50,60 78,60" fill="#0D380D" />
    <rect x="240" y="45" width="25" height="135" fill="#0A280A" />
    <polygon points="252,8 235,50 269,50" fill="#103A0A" />
    <rect x="270" y="60" width="20" height="120" fill="#0D300D" />
    <polygon points="280,22 265,65 295,65" fill="#0A3A08" />
    <rect x="100" y="70" width="15" height="110" fill="#152815" />
    <polygon points="108,35 97,75 119,75" fill="#1A4010" />
    <rect x="195" y="65" width="16" height="115" fill="#152015" />
    <polygon points="203,28 190,70 216,70" fill="#1C3C12" />
    <line x1="160" y1="0" x2="100" y2="180" stroke="rgba(184,255,62,0.06)" strokeWidth="20" />
    <line x1="160" y1="0" x2="220" y2="180" stroke="rgba(184,255,62,0.06)" strokeWidth="20" />
    <ellipse cx="160" cy="175" rx="160" ry="20" fill="rgba(180,255,100,0.07)" />
  </svg>
);

const GalaxyScene = () => (
  <svg viewBox="0 0 320 180" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient id="gal-core" cx="50%" cy="50%">
        <stop offset="0%" stopColor="#7B35FF" stopOpacity="0.8" />
        <stop offset="40%" stopColor="#3B1080" stopOpacity="0.5" />
        <stop offset="100%" stopColor="#02000A" />
      </radialGradient>
      <radialGradient id="gal-pink" cx="30%" cy="40%">
        <stop offset="0%" stopColor="#FF3ECC" stopOpacity="0.3" />
        <stop offset="100%" stopColor="transparent" />
      </radialGradient>
    </defs>
    <rect width="320" height="180" fill="#02000A" />
    <circle cx="20" cy="15" r="1" fill="white" opacity=".9" />
    <circle cx="55" cy="8" r="1.5" fill="white" opacity=".8" />
    <circle cx="130" cy="12" r="1" fill="white" opacity=".9" />
    <circle cx="170" cy="5" r="1.5" fill="white" />
    <circle cx="245" cy="10" r="1" fill="white" opacity=".6" />
    <circle cx="285" cy="20" r="1.5" fill="white" opacity=".9" />
    <circle cx="100" cy="45" r="1.5" fill="#B0C4FF" opacity=".8" />
    <circle cx="300" cy="55" r="1.5" fill="#FFD0B0" opacity=".7" />
    <ellipse cx="160" cy="90" rx="120" ry="55" fill="url(#gal-core)" />
    <ellipse cx="160" cy="90" rx="120" ry="55" fill="url(#gal-pink)" />
    <circle cx="160" cy="90" r="22" fill="#9D60FF" opacity="0.7" />
    <circle cx="160" cy="90" r="10" fill="#EAD4FF" opacity="0.9" />
    <ellipse cx="160" cy="90" rx="80" ry="20" fill="rgba(155,100,255,0.2)" transform="rotate(-30 160 90)" />
    <ellipse cx="160" cy="90" rx="60" ry="15" fill="rgba(200,150,255,0.15)" transform="rotate(50 160 90)" />
    <circle cx="70" cy="120" r="1" fill="white" opacity=".6" />
    <circle cx="240" cy="130" r="1.5" fill="white" opacity=".8" />
  </svg>
);

const VolcanoScene = () => (
  <svg viewBox="0 0 320 180" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="vol-sky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#1A0500" />
        <stop offset="60%" stopColor="#3D0E00" />
        <stop offset="100%" stopColor="#6A1800" />
      </linearGradient>
      <radialGradient id="vol-glow" cx="50%" cy="75%">
        <stop offset="0%" stopColor="#FF6A00" stopOpacity="0.6" />
        <stop offset="100%" stopColor="transparent" />
      </radialGradient>
    </defs>
    <rect width="320" height="180" fill="url(#vol-sky)" />
    <rect width="320" height="180" fill="url(#vol-glow)" />
    <ellipse cx="160" cy="35" rx="55" ry="22" fill="#2A0A00" opacity=".8" />
    <ellipse cx="160" cy="25" rx="35" ry="15" fill="#150400" opacity=".9" />
    <polygon points="160,55 60,180 260,180" fill="#200600" />
    <polygon points="160,55 100,180 220,180" fill="#2A0800" />
    <ellipse cx="160" cy="62" rx="20" ry="10" fill="#FF4500" opacity=".9" />
    <ellipse cx="160" cy="62" rx="12" ry="6" fill="#FFB300" opacity=".95" />
    <path d="M155 68 Q148 90 140 120 Q134 140 128 160" stroke="#FF6A00" strokeWidth="3" fill="none" opacity=".7" />
    <path d="M165 68 Q172 90 180 120 Q186 140 192 160" stroke="#FF4500" strokeWidth="2.5" fill="none" opacity=".6" />
    <circle cx="140" cy="48" r="2" fill="#FF8C00" opacity=".9" />
    <circle cx="175" cy="42" r="1.5" fill="#FF6A00" opacity=".8" />
    <circle cx="155" cy="38" r="2" fill="#FFB300" opacity=".7" />
  </svg>
);

const ArcticScene = () => (
  <svg viewBox="0 0 320 180" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="arc-sky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#000A1A" />
        <stop offset="100%" stopColor="#002050" />
      </linearGradient>
      <radialGradient id="arc-a1" cx="40%" cy="30%">
        <stop offset="0%" stopColor="#00FF88" stopOpacity="0.4" />
        <stop offset="100%" stopColor="transparent" />
      </radialGradient>
      <radialGradient id="arc-a2" cx="70%" cy="25%">
        <stop offset="0%" stopColor="#00CCFF" stopOpacity="0.3" />
        <stop offset="100%" stopColor="transparent" />
      </radialGradient>
    </defs>
    <rect width="320" height="180" fill="url(#arc-sky)" />
    <ellipse cx="100" cy="55" rx="120" ry="30" fill="url(#arc-a1)" />
    <ellipse cx="220" cy="45" rx="130" ry="25" fill="url(#arc-a2)" />
    <path d="M0 50 Q80 20 160 55 Q240 90 320 40" stroke="#00FF88" strokeWidth="2" fill="none" opacity=".3" />
    <path d="M0 65 Q100 35 200 65 Q260 80 320 55" stroke="#00CCFF" strokeWidth="1.5" fill="none" opacity=".25" />
    <circle cx="25" cy="10" r="1" fill="white" opacity=".8" />
    <circle cx="200" cy="8" r="1.5" fill="white" opacity=".9" />
    <circle cx="310" cy="28" r="1" fill="white" opacity=".5" />
    <path d="M0 130 Q60 115 120 122 Q180 130 240 118 Q280 112 320 115 L320 180 L0 180 Z" fill="#0A2040" />
    <path d="M0 130 Q60 115 120 122 Q180 130 240 118 Q280 112 320 115" stroke="rgba(150,220,255,0.3)" strokeWidth="1.5" fill="none" />
    <polygon points="50,130 40,160 60,160" fill="#0D2A45" opacity=".9" />
    <polygon points="220,120 205,155 235,155" fill="#0D2A45" opacity=".85" />
    <ellipse cx="160" cy="160" rx="80" ry="10" fill="rgba(0,200,140,0.08)" />
  </svg>
);

const DesertScene = () => (
  <svg viewBox="0 0 320 180" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="des-sky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#1A0A00" />
        <stop offset="100%" stopColor="#8B4500" />
      </linearGradient>
    </defs>
    <rect width="320" height="180" fill="url(#des-sky)" />
    <ellipse cx="160" cy="30" rx="40" ry="40" fill="#FFD070" opacity=".7" />
    <ellipse cx="60" cy="55" rx="70" ry="25" fill="#AA5500" opacity=".4" />
    <ellipse cx="260" cy="50" rx="60" ry="20" fill="#AA4400" opacity=".35" />
    <path d="M0 140 Q80 120 160 130 Q240 140 320 125 L320 180 L0 180 Z" fill="#5A2800" />
    <path d="M80 140 Q100 100 120 140" fill="#6A3200" />
    <path d="M200 130 Q230 85 260 130" fill="#6A3200" />
    <ellipse cx="160" cy="170" rx="160" ry="15" fill="rgba(180,100,30,0.15)" />
  </svg>
);

const WaterfallScene = () => (
  <svg viewBox="0 0 320 180" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="wf-bg" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#0A1A0A" />
        <stop offset="100%" stopColor="#1A3A1A" />
      </linearGradient>
    </defs>
    <rect width="320" height="180" fill="url(#wf-bg)" />
    <rect x="0" y="0" width="90" height="180" fill="#0A1A0A" />
    <rect x="230" y="0" width="90" height="180" fill="#0A1A0A" />
    <polygon points="0,0 90,0 90,70 0,50" fill="#152015" />
    <polygon points="230,0 320,0 320,50 230,70" fill="#152015" />
    <rect x="110" y="0" width="100" height="80" fill="#152515" />
    <path d="M110 0 L130 80 L190 80 L210 0 Z" fill="#1A2A1A" />
    <path d="M130 80 L125 120 L120 160 L115 180 L145 180 L140 160 L136 120 L133 80 Z" fill="#3399CC" opacity=".7" />
    <path d="M170 80 L175 120 L180 160 L185 180 L155 180 L160 160 L163 120 L167 80 Z" fill="#44AADD" opacity=".6" />
    <ellipse cx="155" cy="175" rx="50" ry="12" fill="#2288BB" opacity=".4" />
    <path d="M0 160 Q80 150 160 155 Q240 160 320 155 L320 180 L0 180 Z" fill="#0A1A0A" opacity=".5" />
  </svg>
);

const SCENE_MAP: Record<string, () => JSX.Element> = {
  cyberpunk: CyberpunkScene,
  ocean: OceanScene,
  forest: ForestScene,
  galaxy: GalaxyScene,
  volcano: VolcanoScene,
  arctic: ArcticScene,
  desert: DesertScene,
  waterfall: WaterfallScene,
};

interface ThumbProps {
  scene: SceneId | string;
}

export default function Thumb({ scene }: ThumbProps) {
  const Comp = SCENE_MAP[scene] ?? CyberpunkScene;
  return <Comp />;
}
