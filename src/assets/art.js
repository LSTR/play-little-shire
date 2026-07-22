// All game art is hand-drawn vector (SVG), rasterized at 2x for crisp rendering.
// Every asset lives here as a string — zero external files, works offline.

const A = {};
const def = (key, w, h, body) => {
  A[key] = {
    w,
    h,
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">${body}</svg>`,
  };
};

/* ---------- landscape layers ---------- */

def('hill-far', 720, 240, `
  <path d="M0 130 Q120 40 250 100 Q390 160 510 80 Q620 20 720 90 L720 240 L0 240 Z" fill="#A9CE85"/>
`);

def('hill-mid', 720, 210, `
  <path d="M0 120 Q160 30 330 95 Q500 160 720 70 L720 210 L0 210 Z" fill="#7FB35A"/>
  <path d="M150 92 l15 -32 15 32 z" fill="#5E9642"/>
  <path d="M540 108 l14 -30 14 30 z" fill="#5E9642"/>
`);

def('hill-near', 720, 190, `
  <path d="M0 90 Q200 20 420 70 Q580 105 720 55 L720 190 L0 190 Z" fill="#5E9642"/>
  <path d="M90 84 l16 -34 16 34 z" fill="#3E7B3E"/>
  <path d="M300 74 l18 -38 18 38 z" fill="#3E7B3E"/>
  <path d="M610 78 l15 -32 15 32 z" fill="#3E7B3E"/>
`);

def('cloud', 220, 110, `
  <g fill="#FFFFFF" opacity="0.95">
    <ellipse cx="70" cy="70" rx="52" ry="30"/>
    <ellipse cx="125" cy="52" rx="48" ry="34"/>
    <ellipse cx="168" cy="74" rx="40" ry="24"/>
    <rect x="40" y="66" width="150" height="30" rx="15"/>
  </g>
`);

def('leaf', 28, 28, `
  <path d="M14 2 Q27 12 14 26 Q1 12 14 2 Z" fill="#7FB35A"/>
  <path d="M14 5 L14 23" stroke="#5E9642" stroke-width="1.6"/>
`);

def('firefly', 20, 20, `
  <circle cx="10" cy="10" r="9" fill="#FFE9A8" opacity="0.35"/>
  <circle cx="10" cy="10" r="4.5" fill="#FFE9A8"/>
`);

def('sparkle', 32, 32, `
  <path d="M16 2 Q18 14 30 16 Q18 18 16 30 Q14 18 2 16 Q14 14 16 2 Z" fill="#FFF7DC"/>
`);

/* ---------- wooden signpost (the app logo) ---------- */

def('sign', 340, 220, `
  <rect x="52" y="70" width="18" height="140" rx="4" fill="#6B4426"/>
  <rect x="270" y="70" width="18" height="140" rx="4" fill="#6B4426"/>
  <rect x="20" y="46" width="300" height="62" rx="10" fill="#8A5A33" stroke="#5A3A1E" stroke-width="4"/>
  <rect x="28" y="53" width="284" height="10" rx="5" fill="#A06A3E"/>
  <rect x="34" y="118" width="272" height="58" rx="10" fill="#8A5A33" stroke="#5A3A1E" stroke-width="4"/>
  <rect x="42" y="125" width="256" height="10" rx="5" fill="#A06A3E"/>
  <circle cx="36" cy="77" r="3.5" fill="#E8C27A"/><circle cx="304" cy="77" r="3.5" fill="#E8C27A"/>
  <circle cx="50" cy="147" r="3.5" fill="#E8C27A"/><circle cx="290" cy="147" r="3.5" fill="#E8C27A"/>
`);

/* ---------- the mascot: a hobbit kid ---------- */

def('mascot', 200, 230, `
  <path d="M100 96 Q152 116 160 212 Q100 230 40 212 Q48 116 100 96 Z" fill="#4E8A3C" stroke="#3E7B3E" stroke-width="4"/>
  <path d="M100 98 Q150 118 158 210 Q130 220 100 222 Z" fill="#447B34" opacity="0.5"/>
  <circle cx="100" cy="128" r="7" fill="#F2B84B" stroke="#C9912D" stroke-width="2"/>
  <ellipse cx="52" cy="74" rx="10" ry="14" fill="#FFD9B0"/>
  <ellipse cx="148" cy="74" rx="10" ry="14" fill="#FFD9B0"/>
  <circle cx="100" cy="70" r="46" fill="#FFD9B0" stroke="#EBBD92" stroke-width="3"/>
  <circle cx="100" cy="24" r="15" fill="#7A4A26"/>
  <circle cx="76" cy="28" r="13" fill="#7A4A26"/>
  <circle cx="124" cy="28" r="13" fill="#7A4A26"/>
  <circle cx="58" cy="42" r="12" fill="#7A4A26"/>
  <circle cx="142" cy="42" r="12" fill="#7A4A26"/>
  <path d="M56 62 Q54 34 100 32 Q146 34 144 62 Q122 44 100 46 Q78 44 56 62 Z" fill="#7A4A26"/>
  <path d="M77 62 Q84 57 91 62" stroke="#7A4A26" stroke-width="3.5" fill="none" stroke-linecap="round"/>
  <path d="M109 62 Q116 57 123 62" stroke="#7A4A26" stroke-width="3.5" fill="none" stroke-linecap="round"/>
  <circle cx="84" cy="73" r="5.5" fill="#3B2F22"/>
  <circle cx="116" cy="73" r="5.5" fill="#3B2F22"/>
  <circle cx="86" cy="71" r="1.8" fill="#FFFFFF"/>
  <circle cx="118" cy="71" r="1.8" fill="#FFFFFF"/>
  <circle cx="72" cy="86" r="7" fill="#F5A97F" opacity="0.55"/>
  <circle cx="128" cy="86" r="7" fill="#F5A97F" opacity="0.55"/>
  <path d="M86 89 Q100 101 114 89" stroke="#B96A4B" stroke-width="4.5" fill="none" stroke-linecap="round"/>
`);

/* ---------- game tokens (96x96) ---------- */

def('tok-ring', 96, 96, `
  <circle cx="48" cy="52" r="25" fill="none" stroke="#C9912D" stroke-width="15"/>
  <circle cx="48" cy="52" r="25" fill="none" stroke="#F2B84B" stroke-width="9"/>
  <path d="M28 42 A25 25 0 0 1 60 30" stroke="#FFE1A0" stroke-width="4" fill="none" stroke-linecap="round"/>
  <path d="M76 20 Q77.5 27 84 28 Q77.5 29 76 36 Q74.5 29 68 28 Q74.5 27 76 20 Z" fill="#F2B84B"/>
`);

def('tok-dragon', 96, 96, `
  <path d="M30 32 L35 10 L44 30 Z" fill="#F7ECD4"/>
  <path d="M48 29 L56 8 L63 30 Z" fill="#F7ECD4"/>
  <ellipse cx="44" cy="54" rx="27" ry="25" fill="#D95B43"/>
  <rect x="56" y="46" width="30" height="20" rx="10" fill="#D95B43"/>
  <ellipse cx="44" cy="70" rx="17" ry="9" fill="#F0A083"/>
  <circle cx="46" cy="44" r="8" fill="#FFFFFF"/>
  <circle cx="48" cy="45" r="4" fill="#3B2F22"/>
  <circle cx="78" cy="53" r="2.5" fill="#8C3B2A"/>
  <path d="M86 58 Q97 61 89 69 Q91 63 84 62 Z" fill="#F2B84B"/>
`);

def('tok-wizard', 96, 96, `
  <ellipse cx="48" cy="68" rx="36" ry="11" fill="#8C8CA6" stroke="#6E6E8C" stroke-width="3"/>
  <path d="M48 6 L74 62 L22 62 Z" fill="#A5A5BF" stroke="#6E6E8C" stroke-width="3" stroke-linejoin="round"/>
  <rect x="30" y="54" width="36" height="8" rx="4" fill="#5A5A78"/>
  <path d="M48 30 Q49.5 37 56 38 Q49.5 39 48 46 Q46.5 39 40 38 Q46.5 37 48 30 Z" fill="#F2B84B"/>
`);

def('tok-mountain', 96, 96, `
  <path d="M6 78 L36 22 L56 56 L70 34 L90 78 Z" fill="#6E7B8C" stroke="#59667A" stroke-width="3" stroke-linejoin="round"/>
  <path d="M30 33 L36 22 L42 33 Q36 39 30 33 Z" fill="#FFFFFF"/>
  <path d="M65 42 L70 34 L75 43 Q70 48 65 42 Z" fill="#FFFFFF"/>
  <circle cx="84" cy="16" r="8" fill="#F2B84B"/>
`);

def('tok-tree', 96, 96, `
  <rect x="42" y="54" width="12" height="30" rx="5" fill="#7C4F2C"/>
  <circle cx="30" cy="46" r="15" fill="#6EA84B"/>
  <circle cx="66" cy="46" r="15" fill="#6EA84B"/>
  <circle cx="48" cy="32" r="21" fill="#5E9642"/>
  <circle cx="42" cy="26" r="7" fill="#8FC15C"/>
  <circle cx="26" cy="42" r="5" fill="#8FC15C"/>
  <circle cx="60" cy="42" r="2.5" fill="#F2B84B"/>
  <circle cx="50" cy="48" r="2.5" fill="#D95B43"/>
  <circle cx="36" cy="52" r="2.5" fill="#F2B84B"/>
`);

def('tok-mushroom', 96, 96, `
  <path d="M12 46 Q48 2 84 46 Q66 56 48 56 Q30 56 12 46 Z" fill="#D95B43" stroke="#B04833" stroke-width="3"/>
  <circle cx="34" cy="30" r="6" fill="#FFF3E0"/>
  <circle cx="58" cy="24" r="4.5" fill="#FFF3E0"/>
  <circle cx="66" cy="38" r="4" fill="#FFF3E0"/>
  <rect x="38" y="52" width="20" height="32" rx="8" fill="#F7ECD4" stroke="#E0CDA6" stroke-width="3"/>
`);

def('tok-sword', 96, 96, `
  <path d="M48 4 L57 16 L57 56 L48 64 L39 56 L39 16 Z" fill="#CBD5DF" stroke="#9AA9B8" stroke-width="2.5"/>
  <path d="M48 10 L48 58" stroke="#EDF2F6" stroke-width="3"/>
  <rect x="27" y="58" width="42" height="10" rx="5" fill="#F2B84B" stroke="#C9912D" stroke-width="2.5"/>
  <rect x="42" y="68" width="12" height="16" rx="5" fill="#7C4F2C"/>
  <circle cx="48" cy="88" r="6" fill="#F2B84B" stroke="#C9912D" stroke-width="2.5"/>
`);

def('tok-spider', 96, 96, `
  <path d="M48 0 L48 16" stroke="#B8B8C4" stroke-width="2.5"/>
  <g stroke="#5A4A78" stroke-width="5" stroke-linecap="round" fill="none">
    <path d="M34 48 Q12 44 8 60"/><path d="M34 58 Q14 62 14 78"/><path d="M38 66 Q24 76 28 88"/>
    <path d="M62 48 Q84 44 88 60"/><path d="M62 58 Q82 62 82 78"/><path d="M58 66 Q72 76 68 88"/>
  </g>
  <circle cx="48" cy="60" r="19" fill="#7A5AA6" stroke="#63488C" stroke-width="3"/>
  <circle cx="48" cy="58" r="5" fill="#F2B84B"/>
  <circle cx="48" cy="32" r="13" fill="#8A6BB5" stroke="#63488C" stroke-width="3"/>
  <circle cx="43" cy="30" r="4" fill="#FFFFFF"/>
  <circle cx="53" cy="30" r="4" fill="#FFFFFF"/>
  <circle cx="44" cy="31" r="2" fill="#3B2F22"/>
  <circle cx="54" cy="31" r="2" fill="#3B2F22"/>
`);

def('tok-barrel', 96, 96, `
  <path d="M28 12 Q48 6 68 12 Q76 48 68 84 Q48 90 28 84 Q20 48 28 12 Z" fill="#8A5A33" stroke="#5A3A1E" stroke-width="3"/>
  <path d="M40 9 Q36 48 40 87 M56 9 Q60 48 56 87" stroke="#6B4426" stroke-width="2.5" fill="none"/>
  <path d="M32 16 Q30 48 32 80" stroke="#A06A3E" stroke-width="4" fill="none"/>
  <rect x="22" y="26" width="52" height="9" rx="4.5" fill="#6E7B8C" stroke="#59667A" stroke-width="2"/>
  <rect x="22" y="60" width="52" height="9" rx="4.5" fill="#6E7B8C" stroke="#59667A" stroke-width="2"/>
`);

def('tok-egg', 96, 96, `
  <ellipse cx="48" cy="52" rx="26" ry="33" fill="#FFF6E3" stroke="#E8D9B8" stroke-width="3"/>
  <path d="M34 40 Q39 30 48 27" stroke="#FFFFFF" stroke-width="4" fill="none" stroke-linecap="round"/>
  <path d="M78 20 Q79.5 27 86 28 Q79.5 29 78 36 Q76.5 29 70 28 Q76.5 27 78 20 Z" fill="#F2B84B"/>
`);

def('tok-fish', 96, 96, `
  <circle cx="18" cy="26" r="3" fill="#A8D8EA"/>
  <circle cx="26" cy="17" r="2.2" fill="#A8D8EA"/>
  <path d="M78 48 L93 33 L88 48 L93 63 Z" fill="#4179A6"/>
  <path d="M14 48 Q32 26 56 33 Q74 39 82 48 Q74 57 56 63 Q32 70 14 48 Z" fill="#5FA8D9" stroke="#4179A6" stroke-width="3"/>
  <path d="M44 34 Q50 23 59 27 Q52 33 50 38 Z" fill="#4179A6"/>
  <circle cx="29" cy="44" r="4.5" fill="#FFFFFF"/>
  <circle cx="30" cy="45" r="2.2" fill="#2B3440"/>
`);

def('tok-wind', 96, 96, `
  <g stroke="#B9C4D6" stroke-width="6" fill="none" stroke-linecap="round">
    <path d="M10 34 Q40 24 60 32 Q74 38 68 46 Q62 52 56 46"/>
    <path d="M14 58 Q44 50 66 58 Q78 64 72 72 Q66 78 60 72"/>
  </g>
  <path d="M78 26 Q90 33 80 44 Q70 35 78 26 Z" fill="#7FB35A"/>
`);

def('tok-eagle', 96, 96, `
  <path d="M44 60 Q66 64 80 84 Q52 84 36 70 Z" fill="#6B4426"/>
  <circle cx="42" cy="42" r="25" fill="#8A5A33" stroke="#6B4426" stroke-width="3"/>
  <circle cx="34" cy="20" r="7" fill="#8A5A33"/>
  <circle cx="48" cy="16" r="7" fill="#8A5A33"/>
  <circle cx="35" cy="38" r="6" fill="#FFFFFF"/>
  <circle cx="37" cy="39" r="3" fill="#3B2F22"/>
  <path d="M62 38 Q80 44 64 54 Q60 47 60 42 Z" fill="#F2B84B" stroke="#C9912D" stroke-width="2"/>
`);

def('tok-troll', 96, 96, `
  <path d="M34 26 Q36 16 42 22 M48 24 Q48 12 54 20 M60 26 Q64 18 66 26" stroke="#7E947A" stroke-width="3" fill="none" stroke-linecap="round"/>
  <ellipse cx="20" cy="52" rx="7" ry="9" fill="#9DB08A" stroke="#7E947A" stroke-width="2"/>
  <ellipse cx="76" cy="52" rx="7" ry="9" fill="#9DB08A" stroke="#7E947A" stroke-width="2"/>
  <ellipse cx="48" cy="52" rx="30" ry="27" fill="#9DB08A" stroke="#7E947A" stroke-width="3"/>
  <circle cx="38" cy="42" r="6" fill="#FFFFFF"/><circle cx="58" cy="46" r="6" fill="#FFFFFF"/>
  <circle cx="39" cy="43" r="3" fill="#3B2F22"/><circle cx="59" cy="47" r="3" fill="#3B2F22"/>
  <ellipse cx="48" cy="58" rx="9" ry="7" fill="#8AA076"/>
  <path d="M36 68 Q48 74 60 68" stroke="#7E947A" stroke-width="4" fill="none" stroke-linecap="round"/>
  <rect x="43" y="67" width="7" height="8" rx="2" fill="#FFFFFF"/>
`);

def('tok-elf', 96, 96, `
  <path d="M48 6 Q78 18 74 58 L22 58 Q18 18 48 6 Z" fill="#5E9642" stroke="#3E7B3E" stroke-width="3"/>
  <circle cx="48" cy="48" r="16" fill="#FFD9B0"/>
  <path d="M34 44 Q38 34 48 34 Q58 34 62 44 Q54 38 48 40 Q42 38 34 44 Z" fill="#E8C27A"/>
  <circle cx="43" cy="48" r="2.8" fill="#3B2F22"/><circle cx="53" cy="48" r="2.8" fill="#3B2F22"/>
  <path d="M42 56 Q48 60 54 56" stroke="#B96A4B" stroke-width="3" fill="none" stroke-linecap="round"/>
  <path d="M48 66 Q54 70 48 76 Q42 70 48 66 Z" fill="#8FC15C" stroke="#5E9642" stroke-width="2"/>
`);

def('tok-honey', 96, 96, `
  <ellipse cx="74" cy="24" rx="7" ry="5" fill="#F2B84B" stroke="#C9912D" stroke-width="1.5"/>
  <path d="M70 22 L78 26 M70 26 L78 22" stroke="#8C6A1F" stroke-width="1.5"/>
  <circle cx="70" cy="18" r="3.5" fill="#FFFFFF" opacity="0.85"/><circle cx="78" cy="18" r="3.5" fill="#FFFFFF" opacity="0.85"/>
  <path d="M28 40 Q23 76 48 82 Q73 76 68 40 Z" fill="#D9A441" stroke="#B08429" stroke-width="3"/>
  <rect x="29" y="31" width="38" height="11" rx="5.5" fill="#B08429"/>
  <path d="M40 42 Q40 54 46 54 Q50 52 48 42 Z" fill="#F2B84B"/>
  <path d="M32 48 Q30 66 36 74" stroke="#E8C27A" stroke-width="4" fill="none" stroke-linecap="round"/>
`);

def('hobbit-door', 96, 96, `
  <circle cx="48" cy="50" r="40" fill="none" stroke="#D9C6A0" stroke-width="8"/>
  <circle cx="48" cy="50" r="34" fill="#67A046" stroke="#3E7B3E" stroke-width="4"/>
  <path d="M48 18 L48 82 M25 30 L71 70 M25 70 L71 30 M16 50 L80 50" stroke="#4E8A3C" stroke-width="3"/>
  <circle cx="48" cy="50" r="34" fill="none" stroke="#3E7B3E" stroke-width="4"/>
  <circle cx="36" cy="50" r="5" fill="#F2B84B" stroke="#C9912D" stroke-width="2"/>
`);

def('gate', 96, 96, `
  <path d="M43 16 Q48 6 53 16 Q49 20 48 24 Q47 20 43 16 Z" fill="#F2B84B"/>
  <path d="M14 88 L14 44 Q48 12 82 44 L82 88 Z" fill="#6E7B8C" stroke="#59667A" stroke-width="3"/>
  <circle cx="24" cy="52" r="2.5" fill="#8B99AB"/><circle cx="72" cy="52" r="2.5" fill="#8B99AB"/>
  <circle cx="30" cy="76" r="2.5" fill="#8B99AB"/><circle cx="66" cy="76" r="2.5" fill="#8B99AB"/>
  <path d="M28 88 L28 54 Q48 36 68 54 L68 88 Z" fill="#5A3A1E" stroke="#3B2F22" stroke-width="3"/>
  <path d="M38 45 L38 88 M48 40 L48 88 M58 45 L58 88" stroke="#6B4426" stroke-width="2.5"/>
  <circle cx="42" cy="68" r="4" fill="#F2B84B" stroke="#C9912D" stroke-width="1.5"/>
`);

def('peaks', 720, 170, `
  <path d="M0 170 L0 120 L80 40 L150 120 L220 60 L300 130 L370 30 L450 120 L520 70 L600 130 L680 50 L720 100 L720 170 Z" fill="#59667A"/>
  <path d="M66 54 L80 40 L94 54 Q80 62 66 54 Z" fill="#EDF2F6"/>
  <path d="M356 44 L370 30 L384 44 Q370 52 356 44 Z" fill="#EDF2F6"/>
  <path d="M666 64 L680 50 L694 64 Q680 72 666 64 Z" fill="#EDF2F6"/>
  <path d="M0 170 L0 140 L100 90 L200 150 L320 80 L440 150 L560 95 L680 150 L720 130 L720 170 Z" fill="#6E7B8C" opacity="0.85"/>
`);

def('river', 720, 110, `
  <path d="M0 30 Q120 10 240 35 Q380 60 520 30 Q630 10 720 40 L720 80 Q600 60 480 78 Q330 96 180 72 Q80 58 0 74 Z" fill="#5FA8D9" opacity="0.85"/>
  <path d="M60 48 Q100 42 140 50 M300 60 Q340 54 380 62 M520 46 Q560 40 600 48" stroke="#A8D8EA" stroke-width="4" fill="none" stroke-linecap="round"/>
`);

def('web', 64, 64, `
  <g stroke="#C9C9D4" stroke-width="2.5" fill="none">
    <path d="M2 2 L62 10 M2 2 L52 30 M2 2 L30 52 M2 2 L10 62"/>
    <path d="M18 6 Q16 14 8 18 M34 10 Q30 24 14 32 M50 14 Q42 36 20 48"/>
  </g>
`);

def('icon-arrow', 64, 64, `
  <path d="M12 32 H44 M30 14 L50 32 L30 50" stroke="#FFFFFF" stroke-width="7" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
`);

/* ---------- the traveling party ---------- */

def('gandalf', 96, 130, `
  <rect x="78" y="36" width="5" height="90" rx="2.5" fill="#7C4F2C"/>
  <circle cx="80.5" cy="34" r="5" fill="#F2B84B" stroke="#C9912D" stroke-width="1.5"/>
  <path d="M48 96 Q70 100 74 126 L22 126 Q26 100 48 96 Z" fill="#8C8CA6" stroke="#6E6E8C" stroke-width="3"/>
  <path d="M32 58 Q30 92 48 100 Q66 92 64 58 Q48 66 32 58 Z" fill="#E8E8EC" stroke="#C9C9D4" stroke-width="2"/>
  <circle cx="48" cy="54" r="14" fill="#FFD9B0"/>
  <circle cx="43" cy="52" r="2.6" fill="#3B2F22"/><circle cx="53" cy="52" r="2.6" fill="#3B2F22"/>
  <path d="M48 4 L70 46 L26 46 Z" fill="#8C8CA6" stroke="#6E6E8C" stroke-width="3" stroke-linejoin="round"/>
  <ellipse cx="48" cy="46" rx="30" ry="7" fill="#8C8CA6" stroke="#6E6E8C" stroke-width="3"/>
`);

def('dwarf', 96, 112, `
  <path d="M48 86 Q68 90 72 110 L24 110 Q28 90 48 86 Z" fill="#7C4F2C" stroke="#5A3A1E" stroke-width="3"/>
  <path d="M28 44 Q26 84 48 90 Q70 84 68 44 Q58 56 48 54 Q38 56 28 44 Z" fill="#C8553D" stroke="#9C3F2E" stroke-width="2.5"/>
  <circle cx="36" cy="74" r="4" fill="#F2B84B"/><circle cx="60" cy="74" r="4" fill="#F2B84B"/>
  <circle cx="48" cy="44" r="16" fill="#FFD9B0"/>
  <circle cx="42" cy="42" r="2.8" fill="#3B2F22"/><circle cx="54" cy="42" r="2.8" fill="#3B2F22"/>
  <path d="M28 36 Q28 12 48 12 Q68 12 68 36 Z" fill="#6E7B8C" stroke="#59667A" stroke-width="3"/>
  <rect x="44" y="30" width="8" height="12" rx="3" fill="#59667A"/>
  <circle cx="34" cy="26" r="2" fill="#B9C4D6"/><circle cx="48" cy="20" r="2" fill="#B9C4D6"/><circle cx="62" cy="26" r="2" fill="#B9C4D6"/>
`);

def('elf-fig', 96, 120, `
  <path d="M48 30 Q70 38 72 116 L24 116 Q26 38 48 30 Z" fill="#5E9642" stroke="#3E7B3E" stroke-width="3"/>
  <circle cx="48" cy="62" r="5" fill="#F2B84B" stroke="#C9912D" stroke-width="2"/>
  <path d="M30 40 L20 33 L30 48 Z" fill="#FFD9B0"/>
  <path d="M66 40 L76 33 L66 48 Z" fill="#FFD9B0"/>
  <circle cx="48" cy="42" r="16" fill="#FFD9B0"/>
  <path d="M32 42 Q30 22 48 22 Q66 22 64 42 Q58 30 48 32 Q38 30 32 42 Z" fill="#E8C27A"/>
  <circle cx="42" cy="44" r="2.8" fill="#3B2F22"/><circle cx="54" cy="44" r="2.8" fill="#3B2F22"/>
  <path d="M42 51 Q48 56 54 51" stroke="#B96A4B" stroke-width="3" fill="none" stroke-linecap="round"/>
`);

def('icon-pencil', 64, 64, `
  <path d="M40 10 L54 24 L28 50 L12 54 L16 38 Z" fill="#FFFFFF"/>
  <path d="M36 14 L50 28" stroke="#8C8C99" stroke-width="4" stroke-linecap="round"/>
`);

/* ---------- riddles: the cave friend + cave dressing ---------- */

def('creature', 220, 200, `
  <path d="M38 70 Q8 38 19 88 Q25 106 44 95 Z" fill="#B8CBB4" stroke="#93A98F" stroke-width="3"/>
  <path d="M182 70 Q212 38 201 88 Q195 106 176 95 Z" fill="#B8CBB4" stroke="#93A98F" stroke-width="3"/>
  <path d="M110 28 Q172 28 181 108 Q185 158 150 177 Q110 191 70 177 Q35 158 39 108 Q48 28 110 28 Z" fill="#B8CBB4" stroke="#93A98F" stroke-width="4"/>
  <ellipse cx="110" cy="150" rx="42" ry="26" fill="#D2E0CE"/>
  <circle cx="82" cy="90" r="26" fill="#FFFFFF" stroke="#93A98F" stroke-width="2"/>
  <circle cx="138" cy="90" r="26" fill="#FFFFFF" stroke="#93A98F" stroke-width="2"/>
  <circle cx="85" cy="94" r="13" fill="#6FC7D9"/>
  <circle cx="135" cy="94" r="13" fill="#6FC7D9"/>
  <circle cx="85" cy="94" r="6" fill="#2B3440"/>
  <circle cx="135" cy="94" r="6" fill="#2B3440"/>
  <circle cx="88" cy="90" r="2.6" fill="#FFFFFF"/>
  <circle cx="138" cy="90" r="2.6" fill="#FFFFFF"/>
  <path d="M96 136 Q110 147 124 136" stroke="#7E947A" stroke-width="4" fill="none" stroke-linecap="round"/>
  <ellipse cx="70" cy="168" rx="12" ry="8" fill="#B8CBB4" stroke="#93A98F" stroke-width="3"/>
  <ellipse cx="150" cy="168" rx="12" ry="8" fill="#B8CBB4" stroke="#93A98F" stroke-width="3"/>
`);

def('stalactites', 720, 150, `
  <path d="M0 0 L720 0 L720 40 L690 40 L672 96 L654 40 L600 40 L585 76 L570 40 L500 40 L480 120 L460 40 L400 40 L388 70 L376 40 L300 40 L282 104 L264 40 L200 40 L188 66 L176 40 L110 40 L92 88 L74 40 L0 40 Z" fill="#141B30"/>
  <path d="M476 112 L480 132 L487 115 Z" fill="#6FC7D9" opacity="0.9"/>
  <path d="M278 96 L282 114 L288 99 Z" fill="#6FC7D9" opacity="0.75"/>
  <path d="M88 80 L92 98 L98 83 Z" fill="#8FD9E8" opacity="0.6"/>
`);

def('crystal-glow', 20, 20, `
  <circle cx="10" cy="10" r="9" fill="#8FD9E8" opacity="0.3"/>
  <circle cx="10" cy="10" r="4" fill="#B9EDF7"/>
`);

/* ---------- the signature: round hobbit door (memory card back) ---------- */

def('card-back', 140, 170, `
  <rect x="3" y="3" width="134" height="164" rx="18" fill="#3E7B3E" stroke="#2F5D2F" stroke-width="5"/>
  <rect x="12" y="12" width="116" height="146" rx="12" fill="none" stroke="#5E9642" stroke-width="2.5"/>
  <circle cx="70" cy="85" r="47" fill="#D9C6A0"/>
  <circle cx="70" cy="85" r="40" fill="#67A046"/>
  <path d="M70 45 L70 125 M42 57 L98 113 M42 113 L98 57 M30 85 L110 85" stroke="#4E8A3C" stroke-width="3"/>
  <circle cx="70" cy="85" r="40" fill="none" stroke="#3E7B3E" stroke-width="4"/>
  <circle cx="56" cy="85" r="6" fill="#F2B84B" stroke="#C9912D" stroke-width="2"/>
`);

def('tok-moon', 96, 96, `
  <path d="M60 12 A38 38 0 1 0 60 84 A30 30 0 1 1 60 12 Z" fill="#F7ECD4" stroke="#D9C6A0" stroke-width="3"/>
  <circle cx="38" cy="34" r="5" fill="#E4D2AE"/>
  <circle cx="30" cy="56" r="4" fill="#E4D2AE"/>
  <circle cx="44" cy="70" r="3" fill="#E4D2AE"/>
  <path d="M76 24 Q77.5 31 84 32 Q77.5 33 76 40 Q74.5 33 68 32 Q74.5 31 76 24 Z" fill="#F2B84B"/>
`);

def('tok-sun', 96, 96, `
  <g stroke="#F2B84B" stroke-width="6" stroke-linecap="round">
    <path d="M78 48 L88 48"/><path d="M69 69 L76 76"/><path d="M48 78 L48 88"/><path d="M27 69 L20 76"/>
    <path d="M18 48 L8 48"/><path d="M27 27 L20 20"/><path d="M48 18 L48 8"/><path d="M69 27 L76 20"/>
  </g>
  <circle cx="48" cy="48" r="22" fill="#F2B84B" stroke="#C9912D" stroke-width="3"/>
  <circle cx="41" cy="44" r="2.5" fill="#8C6A1F"/>
  <circle cx="55" cy="44" r="2.5" fill="#8C6A1F"/>
  <path d="M41 54 Q48 59 55 54" stroke="#8C6A1F" stroke-width="3" fill="none" stroke-linecap="round"/>
`);

def('tok-candle', 96, 96, `
  <path d="M48 12 Q60 26 48 40 Q36 26 48 12 Z" fill="#F2B84B" stroke="#C9912D" stroke-width="2.5"/>
  <path d="M48 24 Q53 30 48 37 Q43 30 48 24 Z" fill="#D95B43"/>
  <path d="M48 40 L48 46" stroke="#5A3A1E" stroke-width="3"/>
  <rect x="36" y="46" width="24" height="38" rx="7" fill="#F7ECD4" stroke="#E0CDA6" stroke-width="3"/>
  <path d="M40 46 Q38 58 42 62" stroke="#FFFFFF" stroke-width="4" fill="none" stroke-linecap="round"/>
`);

def('tok-key', 96, 96, `
  <circle cx="32" cy="32" r="16" fill="none" stroke="#F2B84B" stroke-width="9"/>
  <circle cx="32" cy="32" r="16" fill="none" stroke="#C9912D" stroke-width="2" opacity="0.5"/>
  <path d="M43 43 L76 76" stroke="#F2B84B" stroke-width="9" stroke-linecap="round"/>
  <path d="M64 64 L74 54 M72 72 L82 62" stroke="#F2B84B" stroke-width="8" stroke-linecap="round"/>
`);

/* ---------- the sleeping dragon (front-facing; eyes are separate sprites) ---------- */

def('dragon-sleep', 300, 230, `
  <ellipse cx="150" cy="200" rx="142" ry="26" fill="#D9A441"/>
  <circle cx="60" cy="196" r="7" fill="#F2B84B" stroke="#C9912D" stroke-width="2"/>
  <circle cx="92" cy="206" r="6" fill="#F2B84B" stroke="#C9912D" stroke-width="2"/>
  <circle cx="216" cy="204" r="7" fill="#F2B84B" stroke="#C9912D" stroke-width="2"/>
  <circle cx="248" cy="196" r="5.5" fill="#F2B84B" stroke="#C9912D" stroke-width="2"/>
  <path d="M36 184 Q37.5 191 44 192 Q37.5 193 36 200 Q34.5 193 28 192 Q34.5 191 36 184 Z" fill="#FFF7DC"/>
  <path d="M262 178 Q263.5 185 270 186 Q263.5 187 262 194 Q260.5 187 254 186 Q260.5 185 262 178 Z" fill="#FFF7DC"/>
  <path d="M240 170 Q290 150 284 110 Q280 88 262 92 Q272 108 258 122 Q244 134 230 150 Z" fill="#D95B43" stroke="#B04833" stroke-width="3"/>
  <path d="M284 112 L298 96 L292 120 Z" fill="#B04833"/>
  <path d="M62 130 Q40 96 66 82 Q74 106 92 118 Z" fill="#B04833"/>
  <path d="M238 130 Q260 96 234 82 Q226 106 208 118 Z" fill="#B04833"/>
  <ellipse cx="150" cy="152" rx="96" ry="52" fill="#D95B43" stroke="#B04833" stroke-width="4"/>
  <ellipse cx="150" cy="168" rx="62" ry="28" fill="#F0A083"/>
  <ellipse cx="112" cy="198" rx="20" ry="10" fill="#D95B43" stroke="#B04833" stroke-width="3"/>
  <ellipse cx="188" cy="198" rx="20" ry="10" fill="#D95B43" stroke="#B04833" stroke-width="3"/>
  <path d="M108 52 L100 26 L124 44 Z" fill="#F7ECD4"/>
  <path d="M192 52 L200 26 L176 44 Z" fill="#F7ECD4"/>
  <path d="M138 40 L150 24 L162 40 Z" fill="#B04833"/>
  <circle cx="150" cy="96" r="56" fill="#D95B43" stroke="#B04833" stroke-width="4"/>
  <ellipse cx="150" cy="120" rx="34" ry="20" fill="#F0A083"/>
  <circle cx="138" cy="118" r="4" fill="#8C3B2A"/>
  <circle cx="162" cy="118" r="4" fill="#8C3B2A"/>
  <path d="M136 134 Q150 141 164 134" stroke="#8C3B2A" stroke-width="3" fill="none" stroke-linecap="round"/>
`);

def('eyes-closed', 140, 60, `
  <g stroke="#8C3B2A" stroke-width="5" fill="none" stroke-linecap="round">
    <path d="M30 30 Q48 40 66 30"/>
    <path d="M74 30 Q92 40 110 30"/>
  </g>
`);

def('eyes-half', 140, 60, `
  <path d="M30 32 Q48 22 66 32 Q48 42 30 32 Z" fill="#FFE9A8" stroke="#C9912D" stroke-width="2.5"/>
  <path d="M74 32 Q92 22 110 32 Q92 42 74 32 Z" fill="#FFE9A8" stroke="#C9912D" stroke-width="2.5"/>
  <rect x="45" y="27" width="6" height="10" rx="3" fill="#2B3440"/>
  <rect x="89" y="27" width="6" height="10" rx="3" fill="#2B3440"/>
`);

def('eyes-open', 140, 60, `
  <ellipse cx="48" cy="30" rx="19" ry="17" fill="#FFE9A8" stroke="#C9912D" stroke-width="3"/>
  <ellipse cx="92" cy="30" rx="19" ry="17" fill="#FFE9A8" stroke="#C9912D" stroke-width="3"/>
  <ellipse cx="48" cy="30" rx="6" ry="13" fill="#2B3440"/>
  <ellipse cx="92" cy="30" rx="6" ry="13" fill="#2B3440"/>
  <circle cx="52" cy="23" r="2.5" fill="#FFFFFF"/>
  <circle cx="96" cy="23" r="2.5" fill="#FFFFFF"/>
`);

def('gem', 96, 96, `
  <path d="M30 22 L66 22 L82 44 L48 84 L14 44 Z" fill="#6FC7D9" stroke="#4A9AB5" stroke-width="3" stroke-linejoin="round"/>
  <path d="M30 22 L48 44 L66 22 M14 44 L82 44 M48 44 L48 84" stroke="#A8E4F0" stroke-width="2.5" fill="none"/>
  <path d="M34 30 L42 25" stroke="#FFFFFF" stroke-width="4" stroke-linecap="round"/>
`);

/* ---------- second breakfast: plate + thought bubble ---------- */

def('plate', 96, 96, `
  <ellipse cx="48" cy="56" rx="42" ry="30" fill="#E8E3D8" stroke="#C9C2B0" stroke-width="4"/>
  <ellipse cx="48" cy="52" rx="30" ry="20" fill="#F7F4EC" stroke="#DAD3C2" stroke-width="2.5"/>
`);

def('bubble', 130, 96, `
  <ellipse cx="65" cy="42" rx="60" ry="38" fill="#FFFFFF" stroke="#D9C6A0" stroke-width="4"/>
  <circle cx="28" cy="84" r="11" fill="#FFFFFF" stroke="#D9C6A0" stroke-width="3"/>
  <circle cx="14" cy="98" r="5.5" fill="#FFFFFF" stroke="#D9C6A0" stroke-width="2.5"/>
`);

/* ---------- barrel race: river obstacle ---------- */

def('obstacle-rock', 100, 76, `
  <ellipse cx="50" cy="60" rx="44" ry="14" fill="#FFFFFF" opacity="0.55"/>
  <ellipse cx="50" cy="58" rx="34" ry="9" fill="#FFFFFF" opacity="0.5"/>
  <path d="M14 52 Q8 22 42 12 Q72 4 88 26 Q98 44 76 58 Q50 68 14 52 Z" fill="#8B96A3" stroke="#616D7A" stroke-width="4" stroke-linejoin="round"/>
  <path d="M30 26 Q42 18 54 22" stroke="#AEB8C2" stroke-width="4" fill="none" stroke-linecap="round"/>
  <path d="M50 40 Q64 34 74 42" stroke="#616D7A" stroke-width="3" fill="none" stroke-linecap="round" opacity="0.5"/>
  <path d="M24 42 Q22 34 30 30" stroke="#616D7A" stroke-width="3" fill="none" stroke-linecap="round" opacity="0.4"/>
`);

// Drifting log — same wood tones as tok-barrel, oriented to float sideways.
def('obstacle-log', 120, 60, `
  <ellipse cx="60" cy="50" rx="48" ry="7" fill="#1E2430" opacity="0.18"/>
  <rect x="12" y="16" width="96" height="28" rx="14" fill="#8A5A33" stroke="#5A3A1E" stroke-width="4"/>
  <path d="M32 19 Q52 25 72 19 M28 41 Q52 35 76 41" stroke="#6B4426" stroke-width="2.5" fill="none" stroke-linecap="round" opacity="0.6"/>
  <ellipse cx="18" cy="30" rx="11" ry="16" fill="#A06A3E" stroke="#5A3A1E" stroke-width="3"/>
  <ellipse cx="18" cy="30" rx="5.5" ry="9" fill="#6B4426"/>
`);

// Signal beacon — stone platform with stacked logs, unlit and ablaze.
// Same 110x150 footprint on both so swapping the texture never jumps position.
def('beacon-unlit', 110, 150, `
  <path d="M20 138 L38 98 L72 98 L90 138 Z" fill="#6E7B8C" stroke="#59667A" stroke-width="3" stroke-linejoin="round"/>
  <path d="M30 128 L42 108 L68 108 L80 128 Z" fill="#59667A"/>
  <rect x="38" y="78" width="34" height="10" rx="4" fill="#8A5A33" stroke="#5A3A1E" stroke-width="2" transform="rotate(-18 55 83)"/>
  <rect x="38" y="78" width="34" height="10" rx="4" fill="#6B4426" stroke="#5A3A1E" stroke-width="2" transform="rotate(14 55 83)"/>
`);

def('beacon-lit', 110, 150, `
  <ellipse cx="55" cy="60" rx="48" ry="48" fill="#F2B84B" opacity="0.2"/>
  <path d="M20 138 L38 98 L72 98 L90 138 Z" fill="#6E7B8C" stroke="#59667A" stroke-width="3" stroke-linejoin="round"/>
  <path d="M30 128 L42 108 L68 108 L80 128 Z" fill="#59667A"/>
  <rect x="38" y="78" width="34" height="10" rx="4" fill="#3B2A1E" stroke="#241A12" stroke-width="2" transform="rotate(-18 55 83)"/>
  <rect x="38" y="78" width="34" height="10" rx="4" fill="#2A1D14" stroke="#241A12" stroke-width="2" transform="rotate(14 55 83)"/>
  <path d="M55 18 Q77 46 62 68 Q71 50 55 39 Q39 50 48 68 Q33 46 55 18 Z" fill="#F2B84B" stroke="#C9912D" stroke-width="2"/>
  <path d="M55 40 Q65 53 57 66 Q61 55 55 48 Q49 55 53 66 Q45 53 55 40 Z" fill="#D95B43"/>
`);

/* ---------- tug of war: full-body troll + mud pool ---------- */

def('troll-body', 150, 170, `
  <path d="M45 62 Q38 22 72 14" stroke="#9DB08A" stroke-width="15" fill="none" stroke-linecap="round"/>
  <path d="M105 62 Q112 22 78 14" stroke="#9DB08A" stroke-width="15" fill="none" stroke-linecap="round"/>
  <ellipse cx="52" cy="158" rx="15" ry="11" fill="#8AA076" stroke="#7E947A" stroke-width="3"/>
  <ellipse cx="98" cy="158" rx="15" ry="11" fill="#8AA076" stroke="#7E947A" stroke-width="3"/>
  <ellipse cx="75" cy="102" rx="53" ry="57" fill="#9DB08A" stroke="#7E947A" stroke-width="4"/>
  <ellipse cx="75" cy="124" rx="30" ry="24" fill="#B8CBB4"/>
  <path d="M58 52 Q60 44 66 48 M84 48 Q90 44 92 52" stroke="#7E947A" stroke-width="3" fill="none" stroke-linecap="round"/>
  <circle cx="60" cy="76" r="9" fill="#FFFFFF"/><circle cx="90" cy="79" r="9" fill="#FFFFFF"/>
  <circle cx="61" cy="78" r="4" fill="#3B2F22"/><circle cx="91" cy="81" r="4" fill="#3B2F22"/>
  <path d="M55 68 L66 72 M95 71 L84 74" stroke="#7E947A" stroke-width="3" stroke-linecap="round"/>
  <ellipse cx="75" cy="90" rx="8" ry="6" fill="#8AA076"/>
  <path d="M62 104 Q68 98 75 104 Q82 110 88 104" stroke="#7E947A" stroke-width="4" fill="none" stroke-linecap="round"/>
  <rect x="70" y="102" width="7" height="8" rx="2" fill="#FFFFFF"/>
`);

// Sleep overlays for troll-body: skin patches cover its painted-on open eyes,
// centered on the eye midpoint (75, 77.5 in troll-body coordinates).
def('troll-eyes-closed', 100, 60, `
  <circle cx="35" cy="28.5" r="13.5" fill="#9DB08A"/>
  <circle cx="65" cy="31.5" r="13.5" fill="#9DB08A"/>
  <g stroke="#6B8560" stroke-width="4.5" fill="none" stroke-linecap="round">
    <path d="M25 26 Q35 34 45 26"/>
    <path d="M55 29 Q65 37 75 29"/>
  </g>
`);

def('troll-eyes-half', 100, 60, `
  <circle cx="35" cy="28.5" r="13.5" fill="#9DB08A"/>
  <circle cx="65" cy="31.5" r="13.5" fill="#9DB08A"/>
  <path d="M23 28 Q35 20 47 28 Q35 37 23 28 Z" fill="#EFEADF" stroke="#7E947A" stroke-width="2.5"/>
  <path d="M53 31 Q65 23 77 31 Q65 40 53 31 Z" fill="#EFEADF" stroke="#7E947A" stroke-width="2.5"/>
  <rect x="32.5" y="24" width="5" height="9" rx="2.5" fill="#3B2F22"/>
  <rect x="62.5" y="27" width="5" height="9" rx="2.5" fill="#3B2F22"/>
`);

def('mud', 220, 70, `
  <ellipse cx="110" cy="35" rx="102" ry="27" fill="#6B4426" stroke="#5A3A1E" stroke-width="4"/>
  <ellipse cx="90" cy="32" rx="55" ry="14" fill="#7C4F2C"/>
  <circle cx="150" cy="28" r="6" fill="#7C4F2C" stroke="#5A3A1E" stroke-width="2"/>
  <circle cx="168" cy="40" r="4" fill="#7C4F2C" stroke="#5A3A1E" stroke-width="2"/>
  <circle cx="55" cy="45" r="5" fill="#5A3A1E"/>
`);

/* ---------- defend the Shire: shared life ---------- */

def('heart', 64, 60, `
  <path d="M32 54 C10 38 4 24 10 14 Q17 4 32 16 Q47 4 54 14 C60 24 54 38 32 54 Z" fill="#E06A5A" stroke="#9C3F2E" stroke-width="4"/>
  <ellipse cx="22" cy="18" rx="6" ry="4" fill="#FFFFFF" opacity="0.35" transform="rotate(-20 22 18)"/>
`);

/* ---------- treasure of Erebor: the great chest ---------- */

def('chest-open', 260, 210, `
  <path d="M60 100 L60 48 Q60 16 130 16 Q200 16 200 48 L200 100 Z" fill="#8A5A33" stroke="#5A3A1E" stroke-width="5"/>
  <path d="M72 100 L72 50 Q72 28 130 28 Q188 28 188 50 L188 100 Z" fill="#3B2517"/>
  <rect x="118" y="16" width="24" height="84" fill="#F2B84B" stroke="#C9912D" stroke-width="3"/>
  <path d="M64 100 Q95 80 128 94 Q160 78 196 100 Z" fill="#F2B84B" stroke="#C9912D" stroke-width="3"/>
  <circle cx="98" cy="92" r="5" fill="#FFE9A8"/>
  <circle cx="150" cy="90" r="4" fill="#FFE9A8"/>
  <rect x="50" y="100" width="160" height="92" rx="10" fill="#8A5A33" stroke="#5A3A1E" stroke-width="5"/>
  <rect x="118" y="100" width="24" height="92" fill="#F2B84B" stroke="#C9912D" stroke-width="3"/>
  <rect x="50" y="100" width="160" height="14" fill="#5A3A1E" opacity="0.35"/>
  <rect x="114" y="106" width="32" height="26" rx="5" fill="#F2B84B" stroke="#C9912D" stroke-width="3"/>
  <circle cx="130" cy="116" r="4" fill="#5A3A1E"/>
`);

def('chest-closed', 260, 150, `
  <rect x="50" y="55" width="160" height="90" rx="10" fill="#8A5A33" stroke="#5A3A1E" stroke-width="5"/>
  <path d="M50 62 Q50 12 130 12 Q210 12 210 62 L210 72 L50 72 Z" fill="#7C4F2C" stroke="#5A3A1E" stroke-width="5"/>
  <rect x="118" y="14" width="24" height="130" fill="#F2B84B" stroke="#C9912D" stroke-width="3"/>
  <rect x="114" y="66" width="32" height="30" rx="5" fill="#F2B84B" stroke="#C9912D" stroke-width="3"/>
  <circle cx="130" cy="77" r="4.5" fill="#5A3A1E"/>
  <path d="M130 77 L130 88" stroke="#5A3A1E" stroke-width="4" stroke-linecap="round"/>
`);

/* ---------- UI icons (64x64, white line style) ---------- */

def('icon-home', 64, 64, `
  <path d="M12 32 L32 13 L52 32" fill="none" stroke="#FFFFFF" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M20 30 L20 52 L44 52 L44 30" fill="none" stroke="#FFFFFF" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>
`);

def('icon-gear', 64, 64, `
  <circle cx="32" cy="32" r="11" fill="none" stroke="#FFFFFF" stroke-width="6"/>
  <g stroke="#FFFFFF" stroke-width="6" stroke-linecap="round">
    <path d="M32 10 L32 16"/><path d="M32 48 L32 54"/><path d="M10 32 L16 32"/><path d="M48 32 L54 32"/>
    <path d="M17 17 L21 21"/><path d="M43 43 L47 47"/><path d="M47 17 L43 21"/><path d="M21 43 L17 47"/>
  </g>
`);

def('icon-sound-on', 64, 64, `
  <path d="M12 25 H22 L34 13 V51 L22 39 H12 Z" fill="#FFFFFF"/>
  <path d="M41 24 Q47 32 41 40 M47 18 Q56 32 47 46" stroke="#FFFFFF" stroke-width="5" fill="none" stroke-linecap="round"/>
`);

def('icon-sound-off', 64, 64, `
  <path d="M12 25 H22 L34 13 V51 L22 39 H12 Z" fill="#FFFFFF"/>
  <path d="M42 25 L56 39 M56 25 L42 39" stroke="#FFFFFF" stroke-width="6" stroke-linecap="round"/>
`);

def('icon-lock', 64, 64, `
  <path d="M22 30 V21 Q22 10 32 10 Q42 10 42 21 V30" fill="none" stroke="#FFFFFF" stroke-width="6" stroke-linecap="round"/>
  <rect x="16" y="29" width="32" height="25" rx="7" fill="#FFFFFF"/>
  <circle cx="32" cy="40" r="4" fill="#8C8C99"/>
`);

def('icon-star', 64, 64, `
  <polygon points="32,6 38.8,24.7 58.6,25.3 42.9,37.6 48.5,56.7 32,45.5 15.5,56.7 21.1,37.6 5.4,25.3 25.2,24.7"
    fill="#F2B84B" stroke="#C9912D" stroke-width="3" stroke-linejoin="round"/>
`);

def('icon-play', 64, 64, `
  <path d="M22 13 L52 32 L22 51 Z" fill="#FFFFFF" stroke="#FFFFFF" stroke-width="4" stroke-linejoin="round"/>
`);

def('icon-close', 64, 64, `
  <path d="M18 18 L46 46 M46 18 L18 46" stroke="#FFFFFF" stroke-width="7" stroke-linecap="round"/>
`);

def('icon-replay', 64, 64, `
  <path d="M50 34 A18 18 0 1 1 42 19" fill="none" stroke="#FFFFFF" stroke-width="6" stroke-linecap="round"/>
  <path d="M40 6 L54 16 L38 24 Z" fill="#FFFFFF"/>
`);

/* ---------- loader ---------- */

// Rasterizes every SVG at `scale`x into a Phaser canvas texture.
export function loadArt(scene, scale = 2) {
  return Promise.all(
    Object.entries(A).map(
      ([key, { w, h, svg }]) =>
        new Promise((resolve) => {
          const img = new Image();
          img.onload = () => {
            const c = document.createElement('canvas');
            c.width = w * scale;
            c.height = h * scale;
            c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
            if (!scene.textures.exists(key)) scene.textures.addCanvas(key, c);
            resolve();
          };
          img.onerror = () => resolve();
          img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
        })
    )
  );
}
