import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';

const testimonials = [
  {
    name: 'Alex Chen',
    role: 'Product Designer',
    avatar: '👨‍💻',
    rating: 5,
    quote: 'MindSpace completely transformed how I organize project ideas. Seeing my thoughts as orbiting planets makes brainstorming feel magical.',
    gradient: 'from-[#B08D57] to-[#8B6914]',
  },
  {
    name: 'Sarah Miller',
    role: 'Creative Writer',
    avatar: '👩‍🎨',
    rating: 5,
    quote: 'The 3D visualization helps me see connections between story elements I never noticed before. It\'s like having a universe of creativity.',
    gradient: 'from-[#6B7280] to-[#4B5563]',
  },
  {
    name: 'James Rodriguez',
    role: 'Student',
    avatar: '🧑‍🎓',
    rating: 5,
    quote: 'Perfect for studying! I can link concepts together and the galaxy view shows me exactly how everything connects. Game changer!',
    gradient: 'from-[#D4AF37] to-[#C9A962]',
  },
];

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-1">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg
          key={i}
          className={`w-4 h-4 ${i < rating ? 'text-[#B08D57]' : 'text-[#6B7280]/30'}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

function TestimonialCard({ testimonial, index }: { testimonial: typeof testimonials[0]; index: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
      transition={{ duration: 0.6, delay: index * 0.15 }}
      className="group relative"
    >
      <div className="glass-card p-8 rounded-2xl h-full border border-[#B08D57]/10 hover:border-[#B08D57]/20 transition-all duration-300 hover:bg-[#B08D57]/5">
        {/* Quote icon */}
        <div className="absolute top-6 right-6 text-4xl opacity-10 text-[#B08D57]">❝</div>
        
        {/* Rating */}
        <StarRating rating={testimonial.rating} />
        
        {/* Quote */}
        <p className="text-[#9B9F9C] mt-4 mb-6 leading-relaxed italic">
          "{testimonial.quote}"
        </p>
        
        {/* Author */}
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${testimonial.gradient} flex items-center justify-center text-xl`}>
            {testimonial.avatar}
          </div>
          <div>
            <h4 className="text-[#ECEDEB] font-semibold">{testimonial.name}</h4>
            <p className="text-[#9B9F9C] text-sm">{testimonial.role}</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function Testimonials() {
  const headerRef = useRef(null);
  const isHeaderInView = useInView(headerRef, { once: true, margin: '-100px' });

  return (
    <section id="testimonials" className="relative py-32 px-6">
      <div className="max-w-7xl mx-auto">
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
            Testimonials
          </motion.span>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-[#ECEDEB] mb-6">
            Loved by{' '}
            <span className="gradient-text-glow">Explorers</span>
          </h2>
          <p className="text-lg text-[#9B9F9C] max-w-2xl mx-auto">
            Join thousands of creative minds who've transformed the way they organize ideas.
          </p>
        </motion.div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <TestimonialCard key={testimonial.name} testimonial={testimonial} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
