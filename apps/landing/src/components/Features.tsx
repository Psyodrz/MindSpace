import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';

const features = [
  {
    icon: '🪐',
    title: 'Notes as Planets',
    description: 'Transform each thought into a beautiful, orbiting celestial body in your personal universe.',
    gradient: 'from-[#B08D57] to-[#8B6914]',
  },
  {
    icon: '🌌',
    title: 'Galaxy View',
    description: 'See all your ideas interconnected in a stunning 3D galaxy visualization.',
    gradient: 'from-[#6B7280] to-[#4B5563]',
  },
  {
    icon: '☀️',
    title: 'Solar System Mode',
    description: 'Focus on a central idea with related concepts orbiting around it like planets around a sun.',
    gradient: 'from-[#D4AF37] to-[#B08D57]',
  },
  {
    icon: '🔗',
    title: 'Connect Ideas',
    description: 'Draw connections between any notes to visualize relationships and dependencies.',
    gradient: 'from-[#9B9F9C] to-[#6B7280]',
  },
  {
    icon: '🎨',
    title: 'Custom Themes',
    description: 'Choose from Deep Space, Nebula, or Ocean themes to match your creative mood.',
    gradient: 'from-[#C9A962] to-[#B08D57]',
  },
  {
    icon: '📱',
    title: 'Mobile First',
    description: 'Designed for touch interactions. Explore your ideas with intuitive gestures.',
    gradient: 'from-[#B08D57] to-[#6B7280]',
  },
];

function FeatureCard({ feature, index }: { feature: typeof features[0]; index: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      className="group relative"
    >
      <div className="absolute inset-0 bg-gradient-to-r opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl blur-xl -z-10"
        style={{
          background: `linear-gradient(to right, ${feature.gradient.split(' ')[1]}, ${feature.gradient.split(' ')[3]})`
        }}
      />
      <div className="glass-card p-8 rounded-2xl h-full hover:bg-[#B08D57]/5 transition-all duration-300 border border-[#B08D57]/10 hover:border-[#B08D57]/20">
        <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center text-2xl mb-6 shadow-lg`}>
          {feature.icon}
        </div>
        <h3 className="text-xl font-bold text-[#ECEDEB] mb-3">{feature.title}</h3>
        <p className="text-[#9B9F9C] leading-relaxed">{feature.description}</p>
      </div>
    </motion.div>
  );
}

export default function Features() {
  const headerRef = useRef(null);
  const isHeaderInView = useInView(headerRef, { once: true, margin: '-100px' });

  return (
    <section id="features" className="relative py-32 px-6">

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section Header */}
        <motion.div
          ref={headerRef}
          initial={{ opacity: 0, y: 30 }}
          animate={isHeaderInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-20"
        >
          <motion.span
            className="inline-block text-sm font-semibold text-[#B08D57] uppercase tracking-[0.2em] mb-4"
            initial={{ opacity: 0 }}
            animate={isHeaderInView ? { opacity: 1 } : { opacity: 0 }}
            transition={{ delay: 0.2 }}
          >
            Features
          </motion.span>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-[#ECEDEB] mb-6">
            Explore the{' '}
            <span className="gradient-text-glow">Universe</span>
          </h2>
          <p className="text-lg text-[#9B9F9C] max-w-2xl mx-auto">
            Everything you need to organize your thoughts in a beautiful, interactive 3D space.
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <FeatureCard key={feature.title} feature={feature} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
