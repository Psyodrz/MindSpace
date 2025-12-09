/**
 * Centralized Theme Configuration
 * Themes represent different "thinking modes" with dramatically different visuals
 */

export type ThemeId = 'deep-space' | 'nebula' | 'cyberpunk';

export interface ThemeConfig {
  id: ThemeId;
  name: string;
  description: string;
  backgroundColor: string;
  fogColor: string;
  fogNear: number;
  fogFar: number;
  
  // Lighting
  ambientIntensity: number;
  ambientColor: string;
  sunColor: string;
  sunIntensity: number;
  fillLightColor: string;
  fillLightIntensity: number;
  
  // Stars
  star: {
    color: string;
    secondaryColor?: string; // For cyberpunk alternating
    density: number; // multiplier: 0.5 = low, 1.0 = medium, 1.5 = high
    size: number;
  };
  
  // Planet Material
  planet: {
    baseColor: string;
    emissiveColor: string;
    emissiveIntensity: number;
    roughness: number;
    metalness: number;
  };
  
  // Selection Ring
  ring: {
    color: string;
    thickness: number; // 0.05 = thin, 0.1 = medium, 0.15 = wide
    glowStrength: number; // 0-1
    pulse: boolean;
  };
  
  // Orbit/Connection Lines
  orbit: {
    color: string;
    dashed: boolean;
    glowStrength: number; // 0-1
    opacity: number; // 0-1
  };
  
  // Motion
  motion: {
    rotationSpeed: number; // multiplier
    bobAmplitude: number; // vertical oscillation
  };
  
  // UI Accent
  accentColor: string;
  accentGlow: string;
}

export const THEMES: Record<ThemeId, ThemeConfig> = {
  'deep-space': {
    id: 'deep-space',
    name: 'Deep Space',
    description: 'Focused, long-term, serious work',
    backgroundColor: '#000000',
    fogColor: '#000000',
    fogNear: 30,
    fogFar: 250,
    ambientIntensity: 0.5,
    ambientColor: '#cccccc',
    sunColor: '#ffffee',
    sunIntensity: 1.2,
    fillLightColor: '#333355',
    fillLightIntensity: 0.3,
    
    star: {
      color: '#f5f5ff',
      density: 1.0,
      size: 0.15,
    },
    
    planet: {
      baseColor: '#0b4f6c',
      emissiveColor: '#000000',
      emissiveIntensity: 0,
      roughness: 0.8,
      metalness: 0.1,
    },
    
    ring: {
      color: '#555555',
      thickness: 0.05,
      glowStrength: 0.1,
      pulse: false,
    },
    
    orbit: {
      color: '#444444',
      dashed: true,
      glowStrength: 0,
      opacity: 0.3,
    },
    
    motion: {
      rotationSpeed: 0.3,
      bobAmplitude: 0.02,
    },
    
    accentColor: '#555555',
    accentGlow: 'rgba(85, 85, 85, 0.3)',
  },
  
  'nebula': {
    id: 'nebula',
    name: 'Nebula',
    description: 'Messy brainstorming, idea dump',
    backgroundColor: '#070018',
    fogColor: '#070018',
    fogNear: 200,
    fogFar: 600,
    ambientIntensity: 0.6,
    ambientColor: '#ffccff',
    sunColor: '#ff88ff',
    sunIntensity: 1.3,
    fillLightColor: '#8844ff',
    fillLightIntensity: 0.7,
    
    star: {
      color: '#ffb7ff',
      density: 1.5,
      size: 0.22,
    },
    
    planet: {
      baseColor: '#b347ff',
      emissiveColor: '#4a008a',
      emissiveIntensity: 0.3,
      roughness: 0.6,
      metalness: 0.05,
    },
    
    ring: {
      color: '#d580ff',
      thickness: 0.08,
      glowStrength: 0.6,
      pulse: true,
    },
    
    orbit: {
      color: '#b347ff',
      dashed: true,
      glowStrength: 0.4,
      opacity: 0.5,
    },
    
    motion: {
      rotationSpeed: 0.8,
      bobAmplitude: 0.08,
    },
    
    accentColor: '#d580ff',
    accentGlow: 'rgba(213, 128, 255, 0.5)',
  },
  
  'cyberpunk': {
    id: 'cyberpunk',
    name: 'Cyberpunk',
    description: 'High-energy tech, startup ideas',
    backgroundColor: '#130026',
    fogColor: '#130026',
    fogNear: 300,
    fogFar: 600,
    ambientIntensity: 0.9,
    ambientColor: '#e0d0ff',
    sunColor: '#ff00ff',
    sunIntensity: 1.5,
    fillLightColor: '#00ffff',
    fillLightIntensity: 0.8,
    
    star: {
      color: '#ff2cf7',
      secondaryColor: '#00e5ff',
      density: 1.2,
      size: 0.18,
    },
    
    planet: {
      baseColor: '#404060',
      emissiveColor: '#00e5ff',
      emissiveIntensity: 0.6,
      roughness: 0.2,
      metalness: 0.4,
    },
    
    ring: {
      color: '#00f6ff',
      thickness: 0.05,
      glowStrength: 0.9,
      pulse: false,
    },
    
    orbit: {
      color: '#00e5ff',
      dashed: true,
      glowStrength: 0.7,
      opacity: 0.8,
    },
    
    motion: {
      rotationSpeed: 1.0,
      bobAmplitude: 0.04,
    },
    
    accentColor: '#00f6ff',
    accentGlow: 'rgba(0, 246, 255, 0.6)',
  },
};

export const getTheme = (id: ThemeId): ThemeConfig => THEMES[id] || THEMES['deep-space'];
