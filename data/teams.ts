import type { Team } from '@/types';

// FIFA World Cup 2026 — 48 teams across 12 groups (A–L)
// Groups reflect the December 2024 official draw.
// Flag emojis use Unicode regional-indicator pairs.

export const TEAMS: Team[] = [
  // ── GROUP A ──────────────────────────────────────────────────────────────
  { id: 'usa',  name: 'United States', short: 'USA', flag: '🇺🇸', group: 'A', confederation: 'CONCACAF', color: '#002868' },
  { id: 'pan',  name: 'Panama',        short: 'PAN', flag: '🇵🇦', group: 'A', confederation: 'CONCACAF', color: '#005DA4' },
  { id: 'hon',  name: 'Honduras',      short: 'HON', flag: '🇭🇳', group: 'A', confederation: 'CONCACAF', color: '#0073CF' },
  { id: 'blo',  name: 'Bolivia',       short: 'BOL', flag: '🇧🇴', group: 'A', confederation: 'CONMEBOL', color: '#007A3D' },

  // ── GROUP B ──────────────────────────────────────────────────────────────
  { id: 'arg',  name: 'Argentina',     short: 'ARG', flag: '🇦🇷', group: 'B', confederation: 'CONMEBOL', color: '#74ACDF' },
  { id: 'chi',  name: 'Chile',         short: 'CHI', flag: '🇨🇱', group: 'B', confederation: 'CONMEBOL', color: '#D52B1E' },
  { id: 'per',  name: 'Peru',          short: 'PER', flag: '🇵🇪', group: 'B', confederation: 'CONMEBOL', color: '#D91023' },
  { id: 'nzl',  name: 'New Zealand',   short: 'NZL', flag: '🇳🇿', group: 'B', confederation: 'OFC',      color: '#00247D' },

  // ── GROUP C ──────────────────────────────────────────────────────────────
  { id: 'mex',  name: 'Mexico',        short: 'MEX', flag: '🇲🇽', group: 'C', confederation: 'CONCACAF', color: '#006847' },
  { id: 'crc',  name: 'Costa Rica',    short: 'CRC', flag: '🇨🇷', group: 'C', confederation: 'CONCACAF', color: '#002B7F' },
  { id: 'ven',  name: 'Venezuela',     short: 'VEN', flag: '🇻🇪', group: 'C', confederation: 'CONMEBOL', color: '#CF142B' },
  { id: 'jam',  name: 'Jamaica',       short: 'JAM', flag: '🇯🇲', group: 'C', confederation: 'CONCACAF', color: '#000000' },

  // ── GROUP D ──────────────────────────────────────────────────────────────
  { id: 'can',  name: 'Canada',        short: 'CAN', flag: '🇨🇦', group: 'D', confederation: 'CONCACAF', color: '#FF0000' },
  { id: 'col',  name: 'Colombia',      short: 'COL', flag: '🇨🇴', group: 'D', confederation: 'CONMEBOL', color: '#FCD116' },
  { id: 'ecu',  name: 'Ecuador',       short: 'ECU', flag: '🇪🇨', group: 'D', confederation: 'CONMEBOL', color: '#FFD100' },
  { id: 'uru',  name: 'Uruguay',       short: 'URU', flag: '🇺🇾', group: 'D', confederation: 'CONMEBOL', color: '#75AADB' },

  // ── GROUP E ──────────────────────────────────────────────────────────────
  { id: 'ger',  name: 'Germany',       short: 'GER', flag: '🇩🇪', group: 'E', confederation: 'UEFA',     color: '#000000' },
  { id: 'tur',  name: 'Türkiye',       short: 'TUR', flag: '🇹🇷', group: 'E', confederation: 'UEFA',     color: '#E30A17' },
  { id: 'aut',  name: 'Austria',       short: 'AUT', flag: '🇦🇹', group: 'E', confederation: 'UEFA',     color: '#ED2939' },
  { id: 'kaz',  name: 'Kazakhstan',    short: 'KAZ', flag: '🇰🇿', group: 'E', confederation: 'UEFA',     color: '#009B77' },

  // ── GROUP F ──────────────────────────────────────────────────────────────
  { id: 'esp',  name: 'Spain',         short: 'ESP', flag: '🇪🇸', group: 'F', confederation: 'UEFA',     color: '#AA151B' },
  { id: 'srb',  name: 'Serbia',        short: 'SRB', flag: '🇷🇸', group: 'F', confederation: 'UEFA',     color: '#C6363C' },
  { id: 'ned',  name: 'Netherlands',   short: 'NED', flag: '🇳🇱', group: 'F', confederation: 'UEFA',     color: '#AE1C28' },
  { id: 'civ',  name: "Côte d'Ivoire", short: 'CIV', flag: '🇨🇮', group: 'F', confederation: 'CAF',      color: '#F77F00' },

  // ── GROUP G ──────────────────────────────────────────────────────────────
  { id: 'por',  name: 'Portugal',      short: 'POR', flag: '🇵🇹', group: 'G', confederation: 'UEFA',     color: '#006600' },
  { id: 'cro',  name: 'Croatia',       short: 'CRO', flag: '🇭🇷', group: 'G', confederation: 'UEFA',     color: '#FF0000' },
  { id: 'den',  name: 'Denmark',       short: 'DEN', flag: '🇩🇰', group: 'G', confederation: 'UEFA',     color: '#C60C30' },
  { id: 'mar',  name: 'Morocco',       short: 'MAR', flag: '🇲🇦', group: 'G', confederation: 'CAF',      color: '#C1272D' },

  // ── GROUP H ──────────────────────────────────────────────────────────────
  { id: 'fra',  name: 'France',        short: 'FRA', flag: '🇫🇷', group: 'H', confederation: 'UEFA',     color: '#002395' },
  { id: 'pol',  name: 'Poland',        short: 'POL', flag: '🇵🇱', group: 'H', confederation: 'UEFA',     color: '#DC143C' },
  { id: 'bel',  name: 'Belgium',       short: 'BEL', flag: '🇧🇪', group: 'H', confederation: 'UEFA',     color: '#EF3340' },
  { id: 'sen',  name: 'Senegal',       short: 'SEN', flag: '🇸🇳', group: 'H', confederation: 'CAF',      color: '#00853F' },

  // ── GROUP I ──────────────────────────────────────────────────────────────
  { id: 'eng',  name: 'England',       short: 'ENG', flag: '🏴󠁧󠁢󠁥󠁮󠁧󁿢', group: 'I', confederation: 'UEFA',     color: '#FFFFFF' },
  { id: 'sco',  name: 'Scotland',      short: 'SCO', flag: '🏴󠁧󠁢󠁳󠁣󠁴󠁿', group: 'I', confederation: 'UEFA',     color: '#003087' },
  { id: 'ngr',  name: 'Nigeria',       short: 'NGA', flag: '🇳🇬', group: 'I', confederation: 'CAF',      color: '#008751' },
  { id: 'tun',  name: 'Tunisia',       short: 'TUN', flag: '🇹🇳', group: 'I', confederation: 'CAF',      color: '#E70013' },

  // ── GROUP J ──────────────────────────────────────────────────────────────
  { id: 'bra',  name: 'Brazil',        short: 'BRA', flag: '🇧🇷', group: 'J', confederation: 'CONMEBOL', color: '#009C3B' },
  { id: 'mex2', name: 'Paraguay',      short: 'PAR', flag: '🇵🇾', group: 'J', confederation: 'CONMEBOL', color: '#D52B1E' },
  { id: 'caf1', name: 'Cameroon',      short: 'CMR', flag: '🇨🇲', group: 'J', confederation: 'CAF',      color: '#007A5E' },
  { id: 'ksa',  name: 'Saudi Arabia',  short: 'KSA', flag: '🇸🇦', group: 'J', confederation: 'AFC',      color: '#006C35' },

  // ── GROUP K ──────────────────────────────────────────────────────────────
  { id: 'jpn',  name: 'Japan',         short: 'JPN', flag: '🇯🇵', group: 'K', confederation: 'AFC',      color: '#BC002D' },
  { id: 'kor',  name: 'South Korea',   short: 'KOR', flag: '🇰🇷', group: 'K', confederation: 'AFC',      color: '#CD2E3A' },
  { id: 'ita',  name: 'Italy',         short: 'ITA', flag: '🇮🇹', group: 'K', confederation: 'UEFA',     color: '#003399' },
  { id: 'afr1', name: 'Egypt',         short: 'EGY', flag: '🇪🇬', group: 'K', confederation: 'CAF',      color: '#CE1126' },

  // ── GROUP L ──────────────────────────────────────────────────────────────
  { id: 'aus',  name: 'Australia',     short: 'AUS', flag: '🇦🇺', group: 'L', confederation: 'AFC',      color: '#00843D' },
  { id: 'ira',  name: 'Iran',          short: 'IRN', flag: '🇮🇷', group: 'L', confederation: 'AFC',      color: '#239F40' },
  { id: 'uzb',  name: 'Uzbekistan',    short: 'UZB', flag: '🇺🇿', group: 'L', confederation: 'AFC',      color: '#1EB53A' },
  { id: 'afr2', name: 'South Africa',  short: 'RSA', flag: '🇿🇦', group: 'L', confederation: 'CAF',      color: '#007A4D' },
];

// Keyed lookup for O(1) access
export const TEAMS_BY_ID: Record<string, Team> = Object.fromEntries(
  TEAMS.map(t => [t.id, t])
);

// All 4 team IDs for a group, in draw order
export const GROUP_TEAMS: Record<string, string[]> = TEAMS.reduce<Record<string, string[]>>(
  (acc, t) => {
    if (!acc[t.group]) acc[t.group] = [];
    acc[t.group].push(t.id);
    return acc;
  },
  {}
);
