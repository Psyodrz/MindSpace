import type { Vector3Object } from '../types';

export const generateRandomPosition = (radius: number): Vector3Object => {
  const theta = Math.random() * Math.PI * 2;
  const phi = Math.acos((Math.random() * 2) - 1);
  const r = Math.cbrt(Math.random()) * radius;

  return {
    x: r * Math.sin(phi) * Math.cos(theta),
    y: r * Math.sin(phi) * Math.sin(theta),
    z: r * Math.cos(phi)
  };
};

export const distance3D = (a: Vector3Object, b: Vector3Object): number => {
  return Math.sqrt(
    Math.pow(b.x - a.x, 2) + 
    Math.pow(b.y - a.y, 2) + 
    Math.pow(b.z - a.z, 2)
  );
};
