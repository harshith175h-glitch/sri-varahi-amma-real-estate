import React from 'react';

interface DivineArtworkGraphicProps {
  className?: string;
}

export const DivineArtworkGraphic: React.FC<DivineArtworkGraphicProps> = ({ className = 'w-full h-full' }) => {
  return (
    <div className={`relative w-full h-full overflow-hidden select-none ${className}`}>
      <svg
        viewBox="0 0 1600 900"
        className="w-full h-full object-cover"
        preserveAspectRatio="xMidYMid slice"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Celestial Sky Gradient */}
          <radialGradient id="skyGlow" cx="50%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#1C2E52" />
            <stop offset="40%" stopColor="#0E1930" />
            <stop offset="80%" stopColor="#070B14" />
            <stop offset="100%" stopColor="#04060A" />
          </radialGradient>

          {/* Golden Divine Prabhavali Gradient */}
          <linearGradient id="goldArch" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFE58F" />
            <stop offset="25%" stopColor="#D4AF37" />
            <stop offset="50%" stopColor="#FFF1B8" />
            <stop offset="75%" stopColor="#AA771C" />
            <stop offset="100%" stopColor="#875A12" />
          </linearGradient>

          <radialGradient id="deityAura" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FFE066" stopOpacity="0.8" />
            <stop offset="50%" stopColor="#FF9900" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#D4AF37" stopOpacity="0" />
          </radialGradient>

          <linearGradient id="scrollGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFF8E7" />
            <stop offset="50%" stopColor="#F5E6C8" />
            <stop offset="100%" stopColor="#E2CA9D" />
          </linearGradient>

          <linearGradient id="sareeRed" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#D32F2F" />
            <stop offset="50%" stopColor="#B71C1C" />
            <stop offset="100%" stopColor="#7F0000" />
          </linearGradient>

          <linearGradient id="dhotiYellow" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FFD54F" />
            <stop offset="60%" stopColor="#FFB300" />
            <stop offset="100%" stopColor="#E65100" />
          </linearGradient>

          <linearGradient id="pillarStone" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#3D3730" />
            <stop offset="30%" stopColor="#696055" />
            <stop offset="70%" stopColor="#524A42" />
            <stop offset="100%" stopColor="#2A2520" />
          </linearGradient>

          <filter id="divineGlow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="16" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>

          <filter id="softShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="8" stdDeviation="12" floodColor="#000" floodOpacity="0.7" />
          </filter>
        </defs>

        {/* 1. Background Celestial Canvas */}
        <rect width="1600" height="900" fill="url(#skyGlow)" />

        {/* Starfield & Nebula Dust */}
        <g opacity="0.8">
          {[
            [200, 120, 1.5], [350, 80, 2], [500, 150, 1], [650, 90, 2.5], [800, 70, 3],
            [950, 110, 2], [1100, 85, 1.5], [1250, 140, 2], [1400, 100, 3], [750, 180, 2.5],
            [850, 220, 3], [400, 250, 1.5], [1200, 260, 2], [280, 350, 1], [1320, 340, 1.5]
          ].map(([cx, cy, r], i) => (
            <circle key={i} cx={cx} cy={cy} r={r} fill="#FFF" opacity={0.6 + (i % 5) * 0.08} />
          ))}
          {/* Constellation Sparkles */}
          <path d="M800,100 L804,115 L819,119 L804,123 L800,138 L796,123 L781,119 L796,115 Z" fill="#FFF8D6" filter="url(#divineGlow)" />
          <path d="M520,160 L522,170 L532,172 L522,174 L520,184 L518,174 L508,172 L518,170 Z" fill="#FFE58F" opacity="0.9" />
          <path d="M1080,150 L1082,160 L1092,162 L1082,164 L1080,174 L1078,164 L1068,162 L1078,160 Z" fill="#FFE58F" opacity="0.9" />
        </g>

        {/* 2. Left Background: Historic South Indian Temple Gopuram & Mandapam */}
        <g opacity="0.45" transform="translate(40, 280)">
          {/* Temple Gopuram Silhouette */}
          <polygon points="120,400 130,220 150,150 170,90 190,40 210,40 230,90 250,150 270,220 280,400" fill="#2E2824" />
          <polygon points="175,40 200,10 225,40" fill="#443B33" />
          {/* Kalashams on top */}
          <circle cx="190" cy="8" r="4" fill="#D4AF37" />
          <circle cx="200" cy="4" r="5" fill="#D4AF37" />
          <circle cx="210" cy="8" r="4" fill="#D4AF37" />
          {/* Mandapam with Carved Pillars */}
          <rect x="50" y="240" width="220" height="20" rx="4" fill="#3D352E" />
          <rect x="70" y="260" width="16" height="140" fill="#4A4138" />
          <rect x="120" y="260" width="16" height="140" fill="#4A4138" />
          <rect x="170" y="260" width="16" height="140" fill="#4A4138" />
          <rect x="220" y="260" width="16" height="140" fill="#4A4138" />
          <polygon points="40,240 160,160 280,240" fill="#362E27" />
        </g>

        {/* 3. Right Background: Modern Skyline, High-rises & Construction Cranes */}
        <g opacity="0.4" transform="translate(1250, 320)">
          {/* Skyscrapers */}
          <rect x="0" y="100" width="60" height="300" fill="#252F3F" />
          <rect x="70" y="40" width="75" height="360" fill="#1E2838" />
          <rect x="155" y="120" width="55" height="280" fill="#2B3648" />
          {/* High-rise windows */}
          <g fill="#60A5FA" opacity="0.6">
            <rect x="10" y="120" width="8" height="12" /><rect x="25" y="120" width="8" height="12" /><rect x="40" y="120" width="8" height="12" />
            <rect x="10" y="150" width="8" height="12" /><rect x="25" y="150" width="8" height="12" /><rect x="40" y="150" width="8" height="12" />
            <rect x="80" y="60" width="10" height="14" /><rect x="100" y="60" width="10" height="14" /><rect x="120" y="60" width="10" height="14" />
            <rect x="80" y="90" width="10" height="14" /><rect x="100" y="90" width="10" height="14" /><rect x="120" y="90" width="10" height="14" />
          </g>
          {/* Tower Cranes */}
          <line x1="85" y1="40" x2="85" y2="-60" stroke="#FFD54F" strokeWidth="4" />
          <line x1="10" y1="-50" x2="160" y2="-50" stroke="#FFD54F" strokeWidth="3" />
          <line x1="85" y1="-60" x2="160" y2="-50" stroke="#FFD54F" strokeWidth="2" />
          <line x1="85" y1="-60" x2="10" y2="-50" stroke="#FFD54F" strokeWidth="2" />
          <line x1="130" y1="-50" x2="130" y2="0" stroke="#E2E8F0" strokeWidth="1.5" />
          <rect x="124" y="0" width="12" height="10" fill="#D4AF37" />
        </g>

        {/* 4. Grand Golden Throne & Radiant Arch (Prabhavali) */}
        <g id="prabhavali" transform="translate(800, 430)">
          {/* Glowing Divine Aura */}
          <circle cx="0" cy="-60" r="320" fill="url(#deityAura)" />
          
          {/* Massive Golden Ornate Arch */}
          <path
            d="M-360,200 C-360,-180 -220,-320 0,-320 C220,-320 360,-180 360,200"
            fill="none"
            stroke="url(#goldArch)"
            strokeWidth="38"
            filter="url(#divineGlow)"
          />
          <path
            d="M-330,200 C-330,-150 -200,-280 0,-280 C200,-280 330,-150 330,200"
            fill="none"
            stroke="#FFF1B8"
            strokeWidth="4"
          />

          {/* Intricate Sun Rays / Carved Lotus Petals along Arch */}
          {[-75, -60, -45, -30, -15, 0, 15, 30, 45, 60, 75].map((angle, idx) => (
            <g key={idx} transform={`rotate(${angle}) translate(0, -325)`}>
              <polygon points="-8,0 0,-24 8,0" fill="#FFE58F" stroke="#AA771C" strokeWidth="1.5" />
              <circle cx="0" cy="-6" r="3" fill="#D32F2F" />
            </g>
          ))}

          {/* Throne Golden Backrest Base */}
          <rect x="-420" y="160" width="840" height="90" rx="14" fill="url(#goldArch)" stroke="#5E3F0A" strokeWidth="4" filter="url(#softShadow)" />
          <rect x="-400" y="175" width="800" height="60" rx="8" fill="#5A1A1A" stroke="#D4AF37" strokeWidth="3" />
        </g>

        {/* 5. Left Deity: LORD GANESHA */}
        <g id="lordGanesha" transform="translate(560, 470)">
          {/* Divine Head Halo */}
          <circle cx="0" cy="-140" r="100" fill="url(#deityAura)" />
          
          {/* Seated Body (Yellow Dhoti & Green Sash) */}
          {/* Legs folded in Sukhasana */}
          <path d="M-130,130 C-110,70 -40,60 0,70 C40,60 110,70 130,130 C90,165 -90,165 -130,130 Z" fill="url(#dhotiYellow)" stroke="#B26A00" strokeWidth="3" />
          
          {/* Torso & Big Auspicious Belly (Mahodara) */}
          <ellipse cx="0" cy="20" rx="90" ry="75" fill="#F8C8A0" stroke="#D99B70" strokeWidth="3" />
          <path d="M-60,-30 C-30,-20 30,-20 60,-30 L50,50 C20,70 -20,70 -50,50 Z" fill="#FCE2CC" opacity="0.6" />
          
          {/* Green Silk Angavastram Ribbon across chest */}
          <path d="M-85,-20 Q-20,40 50,110 Q60,115 70,105 Q10,30 -65,-35 Z" fill="#2E7D32" stroke="#D4AF37" strokeWidth="2.5" />
          
          {/* Sacred Golden Necklaces & Yajnopavita */}
          <path d="M-40,-40 Q0,30 40,-40" fill="none" stroke="url(#goldArch)" strokeWidth="6" />
          <path d="M-30,-40 Q0,15 30,-40" fill="none" stroke="#D32F2F" strokeWidth="3" />
          <circle cx="0" cy="25" r="7" fill="#D4AF37" />

          {/* Elephant Head */}
          <ellipse cx="0" cy="-130" rx="72" ry="60" fill="#F8C8A0" stroke="#D99B70" strokeWidth="3" />
          
          {/* Large Ears */}
          <path d="M-60,-150 C-125,-180 -135,-100 -70,-80 Z" fill="#F4B98E" stroke="#D99B70" strokeWidth="3" />
          <path d="M60,-150 C125,-180 135,-100 70,-80 Z" fill="#F4B98E" stroke="#D99B70" strokeWidth="3" />

          {/* Graceful Curved Trunk holding Modak */}
          <path d="M-12,-100 C-10,-50 -25,-15 15,0 C35,10 40,-10 20,-20 C0,-30 8,-80 8,-100 Z" fill="#F8C8A0" stroke="#D99B70" strokeWidth="3" />
          <circle cx="28" cy="-5" r="8" fill="#FFD54F" stroke="#E65100" strokeWidth="1.5" /> {/* Modak in trunk */}

          {/* Gentle Eyes & Divine Red Trishul Tilak */}
          <ellipse cx="-22" cy="-140" rx="8" ry="4" fill="#2A1B0E" />
          <ellipse cx="22" cy="-140" rx="8" ry="4" fill="#2A1B0E" />
          <circle cx="-22" cy="-141" r="2.5" fill="#FFF" />
          <circle cx="22" cy="-141" r="2.5" fill="#FFF" />
          
          {/* Tilak on Forehead */}
          <path d="M-10,-175 L0,-150 L10,-175 L4,-175 L0,-160 L-4,-175 Z" fill="#D32F2F" />
          <line x1="-12" y1="-165" x2="12" y2="-165" stroke="#FFF" strokeWidth="2.5" />
          <circle cx="0" cy="-160" r="3.5" fill="#FFEB3B" />

          {/* Majestic Golden Crown (Kireeta Mukut) */}
          <polygon points="-45,-180 0,-270 45,-180" fill="url(#goldArch)" stroke="#875A12" strokeWidth="3" />
          <circle cx="0" cy="-270" r="8" fill="#D32F2F" />
          <rect x="-50" y="-190" width="100" height="16" rx="4" fill="#FFE58F" stroke="#B26A00" strokeWidth="2" />
          <circle cx="0" cy="-182" r="5" fill="#1976D2" />
          <circle cx="-24" cy="-182" r="4" fill="#D32F2F" />
          <circle cx="24" cy="-182" r="4" fill="#D32F2F" />

          {/* Right Upper Arm: Golden Battle Axe (Parashu) */}
          <g transform="translate(-105, -70)">
            <line x1="0" y1="20" x2="-25" y2="-80" stroke="#8D6E63" strokeWidth="5" strokeLinecap="round" />
            <path d="M-25,-80 C-55,-100 -55,-50 -25,-40 Z" fill="url(#goldArch)" stroke="#5E3F0A" strokeWidth="2.5" />
          </g>

          {/* Left Upper Arm: Golden Trishula Trident */}
          <g transform="translate(125, -60)">
            <line x1="0" y1="30" x2="25" y2="-90" stroke="#AA771C" strokeWidth="5" />
            {/* Trident Prongs */}
            <path d="M10,-80 L25,-120 L40,-80" fill="none" stroke="url(#goldArch)" strokeWidth="4" />
            <line x1="25" y1="-90" x2="25" y2="-130" stroke="#FFE58F" strokeWidth="4" />
          </g>

          {/* Right Lower Hand: In Abhaya Mudra with Sacred Lotus Palm */}
          <circle cx="-95" cy="0" r="16" fill="#F8C8A0" stroke="#D99B70" strokeWidth="2" />
          <circle cx="-95" cy="0" r="6" fill="#D32F2F" />

          {/* Left Hand: Holding the Sacred "LAND DEED" MAP SCROLL */}
          <g transform="translate(-160, 40) rotate(-10)" filter="url(#softShadow)">
            {/* Rolled Golden Parchment */}
            <rect x="0" y="0" width="170" height="230" rx="8" fill="url(#scrollGrad)" stroke="#B89648" strokeWidth="4" />
            <path d="M-5,0 Q85,-15 175,0 L170,12 Q85,0 -5,12 Z" fill="#E2CA9D" />
            <path d="M-5,230 Q85,245 175,230 L170,218 Q85,230 -5,218 Z" fill="#C5A46D" />
            
            {/* LAND DEED Header & Cadastral Grid */}
            <rect x="12" y="18" width="146" height="26" rx="4" fill="#3D2914" />
            <text x="85" y="36" textAnchor="middle" fill="#FFE58F" fontFamily="serif" fontWeight="bold" fontSize="13" letterSpacing="2">
              LAND DEED
            </text>

            {/* Cadastral Survey Plot Subdivision Map */}
            <g transform="translate(18, 52)">
              <rect x="0" y="0" width="134" height="110" fill="#FFFBF0" stroke="#5A4730" strokeWidth="2" />
              {/* Plot Grid Lines */}
              <line x1="45" y1="0" x2="45" y2="110" stroke="#7A6245" strokeWidth="1.5" />
              <line x1="90" y1="0" x2="90" y2="110" stroke="#7A6245" strokeWidth="1.5" />
              <line x1="0" y1="40" x2="134" y2="40" stroke="#7A6245" strokeWidth="1.5" />
              <line x1="0" y1="75" x2="134" y2="75" stroke="#7A6245" strokeWidth="1.5" />
              
              {/* Highlighted Auspicious Clear Patta Plot */}
              <rect x="45" y="40" width="45" height="35" fill="#86EFAC" opacity="0.6" />

              {/* Plot Survey Numbers */}
              <text x="22" y="24" fill="#3D2914" fontSize="10" fontWeight="bold">#21</text>
              <text x="67" y="24" fill="#3D2914" fontSize="10" fontWeight="bold">#02</text>
              <text x="112" y="24" fill="#3D2914" fontSize="10" fontWeight="bold">#05</text>
              
              <text x="22" y="60" fill="#3D2914" fontSize="10" fontWeight="bold">#23</text>
              <text x="67" y="62" fill="#15803D" fontSize="11" fontWeight="extrabold">PATTA</text>
              <text x="112" y="60" fill="#3D2914" fontSize="10" fontWeight="bold">#28</text>
              
              <text x="22" y="96" fill="#3D2914" fontSize="10" fontWeight="bold">#33</text>
              <text x="67" y="96" fill="#3D2914" fontSize="10" fontWeight="bold">#16</text>
              <text x="112" y="96" fill="#3D2914" fontSize="10" fontWeight="bold">#36</text>
            </g>

            {/* Sacred Elephant Seal Emblem & Stamp */}
            <g transform="translate(110, 185)">
              <circle cx="18" cy="18" r="16" fill="#4A3B32" stroke="#D4AF37" strokeWidth="1.5" />
              {/* Elephant Icon */}
              <path d="M10,24 C8,18 12,12 18,12 C24,12 28,16 28,24 L24,24 C24,20 22,18 18,18 C14,18 14,24 10,24 Z" fill="#FFF8E7" />
              <path d="M14,16 Q12,25 9,23" stroke="#FFF8E7" strokeWidth="2" fill="none" />
            </g>
            <text x="24" y="200" fill="#4A3B32" fontSize="9" fontFamily="serif" fontStyle="italic">Hosur & Krishnagiri Reg.</text>
          </g>
        </g>

        {/* 6. Right Deity: GODDESS SRI VARAHI AMMA */}
        <g id="sriVarahiAmma" transform="translate(1040, 460)">
          {/* Divine Golden Halo Aura */}
          <circle cx="0" cy="-140" r="110" fill="url(#deityAura)" />

          {/* Seated Body (Royal Red Zari Saree with Rich Gold Embroidery) */}
          <path d="M-130,140 C-110,80 -40,70 0,80 C40,70 110,80 130,140 C80,180 -80,180 -130,140 Z" fill="url(#sareeRed)" stroke="#FFD54F" strokeWidth="3.5" />
          {/* Saree Pleats & Gold Borders */}
          <path d="M-40,85 Q0,140 40,85" fill="none" stroke="#FFE58F" strokeWidth="4" />
          <path d="M-60,110 Q0,160 60,110" fill="none" stroke="#FFE58F" strokeWidth="3" />

          {/* Graceful Torso in Red & Gold Saree */}
          <path d="M-50,-30 L-60,70 L60,70 L50,-30 Z" fill="url(#sareeRed)" />
          {/* Gold Zari Pallu draped across chest */}
          <path d="M-55,-25 Q0,25 55,75 L40,85 Q-10,35 -65,-15 Z" fill="#FFD54F" stroke="#AA771C" strokeWidth="2" />

          {/* Sacred Temple Jewelry & Waist Belt (Oddiyanam) */}
          <rect x="-45" y="65" width="90" height="10" rx="3" fill="url(#goldArch)" stroke="#5E3F0A" strokeWidth="1.5" />
          <circle cx="0" cy="70" r="5" fill="#D32F2F" />
          <path d="M-35,-30 Q0,20 35,-30" fill="none" stroke="url(#goldArch)" strokeWidth="6" />
          <circle cx="0" cy="15" r="6" fill="#1565C0" />

          {/* Divine Boar Face (Varahi Mukham) - Sacred Slate Blue / Dark Ash Complexion */}
          <ellipse cx="0" cy="-130" rx="55" ry="50" fill="#4B6584" stroke="#2C3E50" strokeWidth="2.5" />
          {/* Snout with Nostrils */}
          <ellipse cx="0" cy="-112" rx="22" ry="16" fill="#384C60" stroke="#1E272C" strokeWidth="2" />
          <circle cx="-8" cy="-112" r="3.5" fill="#1A252F" />
          <circle cx="8" cy="-112" r="3.5" fill="#1A252F" />

          {/* Sharp Curved White Tusks (Damshtra) of Supreme Protection */}
          <path d="M-22,-115 Q-38,-100 -24,-80 Q-26,-95 -16,-110 Z" fill="#FFFFFF" stroke="#D4AF37" strokeWidth="1.5" />
          <path d="M22,-115 Q38,-100 24,-80 Q26,-95 16,-110 Z" fill="#FFFFFF" stroke="#D4AF37" strokeWidth="1.5" />

          {/* Radiant Third Eye (Trinetra) & Red Kumkum Tilak */}
          <ellipse cx="0" cy="-148" rx="4" ry="7" fill="#D32F2F" stroke="#FFE58F" strokeWidth="1" />
          <circle cx="0" cy="-148" r="2" fill="#FFEB3B" />
          {/* Fierce & Compassionate Eyes */}
          <ellipse cx="-20" cy="-138" rx="7" ry="4" fill="#FFF" />
          <circle cx="-20" cy="-138" r="3.5" fill="#1A252F" />
          <ellipse cx="20" cy="-138" rx="7" ry="4" fill="#FFF" />
          <circle cx="20" cy="-138" r="3.5" fill="#1A252F" />

          {/* Ornate Gold Crown (Kireeta) with Radiant Crescent Moon (Chandra Kala) */}
          <polygon points="-40,-175 0,-265 40,-175" fill="url(#goldArch)" stroke="#5E3F0A" strokeWidth="3" />
          <circle cx="0" cy="-265" r="8" fill="#D32F2F" />
          {/* Crescent Moon */}
          <path d="M-18,-245 C-10,-260 10,-260 18,-245 C8,-252 -8,-252 -18,-245 Z" fill="#FFFFFF" filter="url(#divineGlow)" />
          <rect x="-45" y="-185" width="90" height="14" rx="4" fill="#FFE58F" stroke="#AA771C" strokeWidth="2" />
          <circle cx="0" cy="-178" r="4.5" fill="#D32F2F" />

          {/* Eight Divine Arms holding Sacred Real Estate Implements */}
          
          {/* Main Left Arm holding the GIANT ORNATE GOLDEN PROPERTY KEY */}
          <g transform="translate(-140, -100)">
            {/* Giant Golden Key */}
            <g transform="rotate(5)" filter="url(#softShadow)">
              {/* Key Shaft */}
              <line x1="0" y1="0" x2="0" y2="240" stroke="url(#goldArch)" strokeWidth="14" strokeLinecap="round" />
              <line x1="0" y1="20" x2="0" y2="220" stroke="#FFF1B8" strokeWidth="3" />
              
              {/* Key Bow / Head with Boar Medallion */}
              <circle cx="0" cy="-30" r="40" fill="url(#goldArch)" stroke="#5E3F0A" strokeWidth="4" />
              <circle cx="0" cy="-30" r="30" fill="#2A1B0E" stroke="#FFE58F" strokeWidth="2" />
              {/* Boar / Varahi Head Silhouette inside Key Bow */}
              <ellipse cx="0" cy="-30" rx="16" ry="12" fill="#D4AF37" />
              <circle cx="4" cy="-28" r="2.5" fill="#FFF" />
              <path d="M6,-30 L16,-22 L8,-24 Z" fill="#FFF" />

              {/* Key Bit / Teeth */}
              <path d="M0,200 L-30,200 L-30,218 L-12,218 L-12,228 L-30,228 L-30,245 L0,245 Z" fill="url(#goldArch)" stroke="#5E3F0A" strokeWidth="3" />

              {/* Official Attached Golden Tag: "PROPERTY KEY" */}
              <g transform="translate(45, 140) rotate(15)">
                <line x1="-35" y1="-15" x2="0" y2="0" stroke="#D4AF37" strokeWidth="3" />
                <polygon points="0,0 25,-15 130,-15 145,20 130,55 25,55 0,40" fill="url(#goldArch)" stroke="#5E3F0A" strokeWidth="3" filter="url(#softShadow)" />
                <circle cx="20" cy="20" r="6" fill="#3D2914" />
                <text x="75" y="18" textAnchor="middle" fill="#1C1309" fontSize="13" fontFamily="sans-serif" fontWeight="900" letterSpacing="1.5">
                  PROPERTY
                </text>
                <text x="75" y="38" textAnchor="middle" fill="#D32F2F" fontSize="14" fontFamily="sans-serif" fontWeight="900" letterSpacing="2">
                  KEY
                </text>
              </g>
            </g>
          </g>

          {/* Upper Right Arm: Sacred Conch Shell (Shankha) */}
          <g transform="translate(110, -80)">
            <ellipse cx="0" cy="0" rx="16" ry="24" fill="#FFFFFF" stroke="#D4AF37" strokeWidth="2" />
            <path d="M-6,14 Q0,26 8,18" fill="none" stroke="#D4AF37" strokeWidth="2" />
          </g>

          {/* Upper Right Outer Arm: Sacred Land Agricultural Plough (Hala) */}
          <g transform="translate(135, -30)">
            <line x1="0" y1="20" x2="35" y2="-60" stroke="#8D6E63" strokeWidth="6" strokeLinecap="round" />
            <path d="M35,-60 L70,-45 L65,-30 L30,-48 Z" fill="#90A4AE" stroke="#37474F" strokeWidth="2.5" />
          </g>

          {/* Lower Right Hand: Abhaya Mudra Blessing */}
          <circle cx="85" cy="15" r="16" fill="#4B6584" stroke="#2C3E50" strokeWidth="2" />
          <circle cx="85" cy="15" r="6" fill="#D32F2F" />

          {/* Black Buffalo Vahana (Mahisha) sitting beside throne */}
          <g transform="translate(150, 100)">
            <ellipse cx="0" cy="20" rx="45" ry="35" fill="#1E272C" stroke="#000" strokeWidth="3" />
            {/* Horns */}
            <path d="M-20,-5 C-45,-35 -15,-50 -5,-35" fill="none" stroke="#D4AF37" strokeWidth="6" strokeLinecap="round" />
            <path d="M20,-5 C45,-35 15,-50 5,-35" fill="none" stroke="#D4AF37" strokeWidth="6" strokeLinecap="round" />
            <circle cx="-12" cy="10" r="3" fill="#D32F2F" />
            <circle cx="12" cy="10" r="3" fill="#D32F2F" />
          </g>
        </g>

        {/* 7. Center Altar Foreground: GOLDEN MOOSHIKA VAHANA & STANDING KEY */}
        <g id="centerMooshika" transform="translate(800, 680)">
          {/* Ornate Multi-tiered Altar Pedestal */}
          <rect x="-140" y="50" width="280" height="50" rx="8" fill="#3D3228" stroke="#D4AF37" strokeWidth="3" />
          <rect x="-160" y="80" width="320" height="40" rx="4" fill="#241E18" stroke="#875A12" strokeWidth="2" />

          {/* Upright Sacred Golden Key standing on pedestal step */}
          <g transform="translate(-80, -40)" filter="url(#divineGlow)">
            <line x1="0" y1="0" x2="0" y2="120" stroke="url(#goldArch)" strokeWidth="8" strokeLinecap="round" />
            <circle cx="0" cy="-15" r="22" fill="url(#goldArch)" stroke="#5E3F0A" strokeWidth="2.5" />
            <circle cx="0" cy="-15" r="12" fill="#2B1A0A" />
            {/* Key Teeth */}
            <path d="M0,90 L-18,90 L-18,105 L-8,105 L-8,115 L-18,115 L-18,125 L0,125 Z" fill="url(#goldArch)" />
          </g>

          {/* Golden Mooshika Vahana (Rat) sitting reverently holding Modak */}
          <g transform="translate(30, -30)">
            {/* Body */}
            <ellipse cx="0" cy="20" rx="40" ry="30" fill="url(#goldArch)" stroke="#875A12" strokeWidth="2.5" />
            {/* Head */}
            <ellipse cx="-25" cy="5" rx="20" ry="16" fill="#FFE58F" stroke="#AA771C" strokeWidth="2" />
            <circle cx="-32" cy="0" r="3" fill="#1A1108" />
            {/* Large Ears */}
            <ellipse cx="-15" cy="-12" rx="10" ry="14" fill="#FFCDD2" stroke="#AA771C" strokeWidth="1.5" />
            {/* Curved Tail */}
            <path d="M35,30 Q65,40 70,0 Q65,-20 50, -10" fill="none" stroke="url(#goldArch)" strokeWidth="4" strokeLinecap="round" />
            {/* Paws holding Golden Modak */}
            <circle cx="-35" cy="18" r="9" fill="#FFB300" stroke="#E65100" strokeWidth="1.5" />
            <polygon points="-35,6 -42,18 -28,18" fill="#FFE082" />
            {/* Royal Caparison / Blanket */}
            <path d="M-15,10 Q0,2 15,10 L12,32 Q0,38 -12,32 Z" fill="#B71C1C" stroke="#FFD54F" strokeWidth="1.5" />
            <circle cx="0" cy="20" r="3" fill="#FFD54F" />
          </g>
        </g>

        {/* 8. Akhanda Deepams (Sacred Brass Oil Lamps with Glowing Flames) */}
        {/* Left Deepam */}
        <g transform="translate(160, 620)" filter="url(#softShadow)">
          <polygon points="-25,120 25,120 15,100 -15,100" fill="url(#goldArch)" />
          <line x1="0" y1="100" x2="0" y2="-40" stroke="url(#goldArch)" strokeWidth="8" />
          {/* Deepam Tier Plates */}
          <ellipse cx="0" cy="50" rx="30" ry="8" fill="url(#goldArch)" stroke="#5E3F0A" strokeWidth="1.5" />
          <ellipse cx="0" cy="0" rx="25" ry="7" fill="url(#goldArch)" stroke="#5E3F0A" strokeWidth="1.5" />
          <ellipse cx="0" cy="-40" rx="20" ry="6" fill="url(#goldArch)" stroke="#5E3F0A" strokeWidth="1.5" />
          {/* Golden Flame */}
          <path d="M0,-45 Q-10,-65 0,-85 Q10,-65 0,-45 Z" fill="#FFA000" filter="url(#divineGlow)" />
          <path d="M0,-48 Q-5,-62 0,-76 Q5,-62 0,-48 Z" fill="#FFF59D" />
        </g>

        {/* Right Deepam */}
        <g transform="translate(1440, 620)" filter="url(#softShadow)">
          <polygon points="-25,120 25,120 15,100 -15,100" fill="url(#goldArch)" />
          <line x1="0" y1="100" x2="0" y2="-40" stroke="url(#goldArch)" strokeWidth="8" />
          <ellipse cx="0" cy="50" rx="30" ry="8" fill="url(#goldArch)" stroke="#5E3F0A" strokeWidth="1.5" />
          <ellipse cx="0" cy="0" rx="25" ry="7" fill="url(#goldArch)" stroke="#5E3F0A" strokeWidth="1.5" />
          <ellipse cx="0" cy="-40" rx="20" ry="6" fill="url(#goldArch)" stroke="#5E3F0A" strokeWidth="1.5" />
          {/* Golden Flame */}
          <path d="M0,-45 Q-10,-65 0,-85 Q10,-65 0,-45 Z" fill="#FFA000" filter="url(#divineGlow)" />
          <path d="M0,-48 Q-5,-62 0,-76 Q5,-62 0,-48 Z" fill="#FFF59D" />
        </g>

        {/* 9. Floating Celestial Clouds around Bottom Border */}
        <g opacity="0.65" fill="#E2E8F0">
          <ellipse cx="100" cy="850" rx="160" ry="60" filter="url(#divineGlow)" />
          <ellipse cx="300" cy="880" rx="200" ry="70" filter="url(#divineGlow)" />
          <ellipse cx="600" cy="890" rx="180" ry="60" filter="url(#divineGlow)" />
          <ellipse cx="1000" cy="890" rx="180" ry="60" filter="url(#divineGlow)" />
          <ellipse cx="1300" cy="880" rx="200" ry="70" filter="url(#divineGlow)" />
          <ellipse cx="1500" cy="850" rx="160" ry="60" filter="url(#divineGlow)" />
        </g>

        {/* 10. Foreground Carved Temple Stone Pillars & Ornate Archway */}
        <g id="stonePillars">
          {/* Left Pillar */}
          <rect x="0" y="0" width="80" height="900" fill="url(#pillarStone)" stroke="#1A1510" strokeWidth="3" />
          <rect x="70" y="0" width="16" height="900" fill="#1C1814" opacity="0.6" />
          {/* Pillar Carvings */}
          <polygon points="0,150 100,150 80,180 0,180" fill="#52483E" />
          <polygon points="0,750 100,750 80,780 0,780" fill="#52483E" />

          {/* Right Pillar */}
          <rect x="1520" y="0" width="80" height="900" fill="url(#pillarStone)" stroke="#1A1510" strokeWidth="3" />
          <rect x="1514" y="0" width="16" height="900" fill="#1C1814" opacity="0.6" />
          <polygon points="1600,150 1500,150 1520,180 1600,180" fill="#52483E" />
          <polygon points="1600,750 1500,750 1520,780 1600,780" fill="#52483E" />

          {/* Top Temple Arch Trim */}
          <path d="M0,0 L1600,0 L1600,60 C1200,80 1000,120 800,120 C600,120 400,80 0,60 Z" fill="url(#pillarStone)" stroke="#1A1510" strokeWidth="3" />
          <path d="M0,15 L1600,15" stroke="#D4AF37" strokeWidth="2" opacity="0.6" />
        </g>
      </svg>
    </div>
  );
};
