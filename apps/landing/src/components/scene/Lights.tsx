/**
 * Lighting setup for the solar system.
 * 
 * Consists of:
 * - Main directional light: Simulates the Sun (off-screen, warm white)
 * - Fill light: Soft ambient light to see shadow areas
 * - Rim light: Bronze-tinted accent for depth and theme matching
 */
export function Lights() {
  return (
    <>
      {/* Main Sun light - directional, slightly warm */}
      <directionalLight
        position={[-30, 20, 30]}
        intensity={1.2}
        color="#FFF5E6"
        castShadow={false}
      />
      
      {/* Fill light - very soft, cool */}
      <ambientLight intensity={0.15} color="#ECEDEB" />
      
      {/* Rim light - bronze accent from opposite side */}
      <pointLight
        position={[40, -10, -40]}
        intensity={0.4}
        color="#B08D57"
        distance={100}
        decay={2}
      />
      
      {/* Very subtle front fill for hero content visibility */}
      <pointLight
        position={[0, 0, 30]}
        intensity={0.2}
        color="#ECEDEB"
        distance={60}
        decay={2}
      />
    </>
  );
}
