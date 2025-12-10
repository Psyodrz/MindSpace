/**
 * Solar System Configuration
 * Defines planetary categories and orbital parameters for Solar System View
 */

export type ViewMode = 'galaxy' | 'solar-system';

export interface OrbitConfig {
  radius: number;        // Distance from sun (scaled)
  speed: number;         // Orbital speed (deg/sec)
  eccentricity: number;  // 0 = circle, 0.1-0.3 = ellipse
  inclination: number;   // Tilt from ecliptic plane (degrees)
}

export interface PlanetCategory {
  id: string;
  name: string;
  label: string;
  color: string;
  textureUrl?: string;
  description: string;
  orbit: OrbitConfig;
  size: number;
}

export interface MoonOrbit {
  radius: number;  // Distance from planet
  angle: number;   // Current angle in orbit
  speed: number;   // Orbital speed
}

export const PLANET_CATEGORIES: PlanetCategory[] = [
  {
    id: 'mercury',
    name: 'Mercury',
    label: 'Quick Notes',
    color: '#8C7853',
    textureUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/30/Mercury_in_color_-_Prockter07_centered.jpg/1024px-Mercury_in_color_-_Prockter07_centered.jpg',
    description: 'Inbox, fleeting thoughts, quick captures',
    orbit: { radius: 15, speed: 4.8, eccentricity: 0.2, inclination: 7 },
    size: 1.2
  },
  {
    id: 'venus',
    name: 'Venus',
    label: 'Ideas',
    color: '#FFC649',
    textureUrl: 'https://upload.wikimedia.org/wikipedia/commons/e/e5/Venus-real_color.jpg',
    description: 'Brainstorming, creative ideas, experiments',
    orbit: { radius: 22, speed: 3.5, eccentricity: 0.01, inclination: 3.4 },
    size: 2
  },
  {
    id: 'earth',
    name: 'Earth',
    label: 'Current Work',
    color: '#4A90E2',
    textureUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/97/The_Earth_seen_from_Apollo_17.jpg/1024px-The_Earth_seen_from_Apollo_17.jpg',
    description: 'Active projects, tasks in progress',
    orbit: { radius: 30, speed: 3.0, eccentricity: 0.02, inclination: 0 },
    size: 2
  },
  {
    id: 'mars',
    name: 'Mars',
    label: 'Future Plans',
    color: '#E27B58',
    textureUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/02/OSIRIS_Mars_true_color.jpg/1024px-OSIRIS_Mars_true_color.jpg',
    description: 'Upcoming projects, goals, aspirations',
    orbit: { radius: 40, speed: 2.4, eccentricity: 0.09, inclination: 1.85 },
    size: 1.5
  },
  {
    id: 'asteroid-belt',
    name: 'Asteroid Belt',
    label: 'Archive',
    color: '#8B7355',
    description: 'Old notes, completed items, reference',
    orbit: { radius: 55, speed: 1.8, eccentricity: 0.1, inclination: 0 },
    size: 0 // No planet, just belt
  },
  {
    id: 'jupiter',
    name: 'Jupiter',
    label: 'Major Projects',
    color: '#C88B3A',
    textureUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e2/Jupiter.jpg/1024px-Jupiter.jpg',
    description: 'Large initiatives, complex work',
    orbit: { radius: 75, speed: 1.3, eccentricity: 0.05, inclination: 1.3 },
    size: 4
  },
  {
    id: 'saturn',
    name: 'Saturn',
    label: 'Resources',
    color: '#FAD5A5',
    textureUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c7/Saturn_during_Equinox.jpg/1200px-Saturn_during_Equinox.jpg',
    description: 'References, documentation, knowledge base',
    orbit: { radius: 95, speed: 0.97, eccentricity: 0.06, inclination: 2.5 },
    size: 3.5
  },
  {
    id: 'uranus',
    name: 'Uranus',
    label: 'Experiments',
    color: '#4FD0E0',
    textureUrl: 'https://upload.wikimedia.org/wikipedia/commons/3/3d/Uranus2.jpg',
    description: 'Testing, prototypes, learning',
    orbit: { radius: 115, speed: 0.68, eccentricity: 0.05, inclination: 0.8 },
    size: 2.8
  },
  {
    id: 'neptune',
    name: 'Neptune',
    label: 'Long-term Goals',
    color: '#4B70DD',
    textureUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/63/Neptune_-_Voyager_2_%2829347980845%29_flatten_crop.jpg/1024px-Neptune_-_Voyager_2_%2829347980845%29_flatten_crop.jpg',
    description: 'Vision, dreams, distant objectives',
    orbit: { radius: 135, speed: 0.54, eccentricity: 0.01, inclination: 1.8 },
    size: 2.6
  }
];

export const SUN_CONFIG = {
  size: 6,
  color: '#FDB813',
  emissiveIntensity: 2
};

export const ASTEROID_BELT_CONFIG = {
  innerRadius: 45,  // Just outside Mars (40)
  outerRadius: 55,  // Well before Jupiter (60+)
  count: 60,        // Reduced to avoid overlap
  sizeRange: [0.08, 0.25] as [number, number]  // Smaller asteroids
};

// Passing asteroids - large asteroids far from planets
export const PASSING_ASTEROIDS_CONFIG = {
  count: 5,          // Very few
  minRadius: 180,    // Far outside Neptune (135)
  maxRadius: 250,
  sizeRange: [1.0, 2.5] as [number, number]  // Larger asteroids
};

// Default moon orbit for new notes
export const getDefaultMoonOrbit = (): MoonOrbit => ({
  radius: 3 + Math.random() * 3,
  angle: Math.random() * Math.PI * 2,
  speed: 2 + Math.random() * 3
});

// Get planet by ID
export const getPlanet = (id: string): PlanetCategory | undefined => 
  PLANET_CATEGORIES.find(p => p.id === id);
