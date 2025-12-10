import { motion, useInView } from 'framer-motion';
import { useRef, useState, useEffect } from 'react';

const screenshots = [
  {
    id: 1,
    title: 'Galaxy View',
    description: 'See all your ideas interconnected in stunning 3D space',
    gradient: 'from-[#B08D57]/20 to-[#8B6914]/20',
    icon: '🌌',
  },
  {
    id: 2,
    title: 'Solar System',
    description: 'Focus on one idea with related concepts orbiting around',
    gradient: 'from-[#D4AF37]/20 to-[#C9A962]/20',
    icon: '☀️',
  },
  {
    id: 3,
    title: 'Connection Mode',
    description: 'Draw beautiful cosmic links between your thoughts',
    gradient: 'from-[#6B7280]/20 to-[#4B5563]/20',
    icon: '🔗',
  },
];

function PhoneMockup({ screenshot, isActive }: { screenshot: typeof screenshots[0]; isActive: boolean }) {
  return (
    <motion.div
      className={`relative flex-shrink-0 transition-all duration-500 ${
        isActive ? 'scale-100 opacity-100' : 'scale-90 opacity-50'
      }`}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: isActive ? 1 : 0.5, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Phone frame */}
      <div className="relative w-64 md:w-72 mx-auto">
        {/* Phone bezel */}
        <div className="relative bg-gradient-to-b from-[#1a1f1e] to-[#121716] rounded-[3rem] p-2 shadow-2xl border border-[#B08D57]/20">
          {/* Notch */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-6 bg-[#121716] rounded-b-2xl z-10" />
          
          {/* Screen */}
          <div className={`relative bg-gradient-to-br ${screenshot.gradient} rounded-[2.5rem] overflow-hidden aspect-[9/19]`}>
            {/* Placeholder app content */}
            <div className="absolute inset-0 bg-[#0C0F0E] flex flex-col items-center justify-center p-6">
              {/* Stars background effect */}
              <div className="absolute inset-0 overflow-hidden">
                {Array.from({ length: 30 }).map((_, i) => (
                  <div
                    key={i}
                    className="absolute w-1 h-1 bg-[#ECEDEB] rounded-full animate-pulse"
                    style={{
                      top: `${Math.random() * 100}%`,
                      left: `${Math.random() * 100}%`,
                      animationDelay: `${Math.random() * 2}s`,
                      opacity: Math.random() * 0.5 + 0.2,
                    }}
                  />
                ))}
              </div>
              
              {/* Central icon */}
              <motion.div
                className="text-6xl mb-4 relative z-10"
                animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              >
                {screenshot.icon}
              </motion.div>
              
              {/* View title */}
              <h4 className="text-[#ECEDEB] font-bold text-lg relative z-10">{screenshot.title}</h4>
              <p className="text-[#9B9F9C] text-xs text-center mt-2 relative z-10 px-4">
                {screenshot.description}
              </p>
              
              {/* Decorative orbits */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-40 h-40 border border-[#B08D57]/20 rounded-full animate-spin" style={{ animationDuration: '20s' }} />
                <div className="absolute w-56 h-56 border border-[#B08D57]/10 rounded-full animate-spin" style={{ animationDuration: '30s', animationDirection: 'reverse' }} />
              </div>
            </div>
          </div>
        </div>
        
        {/* Glow effect */}
        <div className={`absolute -inset-4 bg-gradient-to-r ${screenshot.gradient} rounded-[4rem] blur-2xl opacity-30 -z-10`} />
      </div>
    </motion.div>
  );
}

export default function Screenshots() {
  const headerRef = useRef(null);
  const isHeaderInView = useInView(headerRef, { once: true, margin: '-100px' });
  const [activeIndex, setActiveIndex] = useState(0);

  // Auto-rotate screenshots
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % screenshots.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section id="screenshots" className="relative py-32 px-6 overflow-hidden">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <motion.div
          ref={headerRef}
          initial={{ opacity: 0, y: 30 }}
          animate={isHeaderInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <motion.span
            className="inline-block text-sm font-semibold text-[#B08D57] uppercase tracking-[0.2em] mb-4"
            initial={{ opacity: 0 }}
            animate={isHeaderInView ? { opacity: 1 } : { opacity: 0 }}
            transition={{ delay: 0.2 }}
          >
            App Preview
          </motion.span>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-[#ECEDEB] mb-6">
            Experience the{' '}
            <span className="gradient-text-glow">Cosmos</span>
          </h2>
          <p className="text-lg text-[#9B9F9C] max-w-2xl mx-auto">
            Explore the beautiful interfaces designed to make idea management feel like space exploration.
          </p>
        </motion.div>

        {/* Screenshot Carousel */}
        <div className="relative">
          {/* Screenshots */}
          <div className="flex justify-center items-center gap-4 md:gap-8">
            {screenshots.map((screenshot, index) => (
              <PhoneMockup
                key={screenshot.id}
                screenshot={screenshot}
                isActive={index === activeIndex}
              />
            ))}
          </div>

          {/* Dots indicator */}
          <div className="flex justify-center gap-3 mt-10">
            {screenshots.map((_, index) => (
              <button
                key={index}
                onClick={() => setActiveIndex(index)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === activeIndex
                    ? 'bg-gradient-to-r from-[#B08D57] to-[#D4AF37] w-8'
                    : 'bg-[#6B7280]/30 hover:bg-[#6B7280]/50'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
