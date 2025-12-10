import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';

const steps = [
  {
    number: '01',
    icon: '✨',
    title: 'Create a Note',
    description: 'Tap anywhere in space to create a new idea. Each thought becomes a beautiful planet in your universe.',
    gradient: 'from-[#B08D57] to-[#8B6914]',
  },
  {
    number: '02',
    icon: '🔗',
    title: 'Connect Ideas',
    description: 'Draw connections between related concepts. Watch as links form stunning cosmic pathways through your mind.',
    gradient: 'from-[#6B7280] to-[#4B5563]',
  },
  {
    number: '03',
    icon: '🌌',
    title: 'Explore Your Galaxy',
    description: 'Switch to Galaxy view to see all your ideas interconnected. Pinch, zoom, and orbit around your thoughts.',
    gradient: 'from-[#D4AF37] to-[#B08D57]',
  },
  {
    number: '04',
    icon: '☀️',
    title: 'Focus Mode',
    description: 'Select any note as a sun to see related ideas orbit around it. Perfect for deep work and brainstorming.',
    gradient: 'from-[#C9A962] to-[#9B9F9C]',
  },
];

function StepCard({ step, index }: { step: typeof steps[0]; index: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
      animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
      transition={{ duration: 0.6, delay: index * 0.15 }}
      className="relative"
    >
      {/* Connector line (except for last item) */}
      {index < steps.length - 1 && (
        <div className="hidden lg:block absolute left-1/2 top-full w-px h-16 bg-gradient-to-b from-[#B08D57]/30 to-transparent" />
      )}
      
      <div className="glass-card p-8 rounded-2xl border border-[#B08D57]/10 hover:border-[#B08D57]/20 transition-all duration-300 hover:bg-[#B08D57]/5 group">
        <div className="flex items-start gap-6">
          {/* Number badge */}
          <div className={`flex-shrink-0 w-16 h-16 rounded-2xl bg-gradient-to-br ${step.gradient} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
            <span className="text-2xl">{step.icon}</span>
          </div>
          
          <div className="flex-1">
            {/* Step number */}
            <span className={`text-sm font-bold bg-gradient-to-r ${step.gradient} bg-clip-text text-transparent`}>
              Step {step.number}
            </span>
            
            {/* Title */}
            <h3 className="text-xl font-bold text-[#ECEDEB] mt-1 mb-3">{step.title}</h3>
            
            {/* Description */}
            <p className="text-[#9B9F9C] leading-relaxed">{step.description}</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function HowItWorks() {
  const headerRef = useRef(null);
  const isHeaderInView = useInView(headerRef, { once: true, margin: '-100px' });

  return (
    <section id="how-it-works" className="relative py-32 px-6">
      <div className="max-w-4xl mx-auto">
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
            How It Works
          </motion.span>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-[#ECEDEB] mb-6">
            Simple as{' '}
            <span className="gradient-text-glow">Stargazing</span>
          </h2>
          <p className="text-lg text-[#9B9F9C] max-w-2xl mx-auto">
            Transform your thoughts into an interactive universe in just a few taps.
          </p>
        </motion.div>

        {/* Steps */}
        <div className="space-y-8">
          {steps.map((step, index) => (
            <StepCard key={step.number} step={step} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
