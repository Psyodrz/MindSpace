import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';

export default function Download() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section id="download" className="relative py-32 px-6 overflow-hidden">

      <div className="max-w-4xl mx-auto relative z-10">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          {/* Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={isInView ? { scale: 1 } : { scale: 0 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="w-20 h-20 mx-auto mb-8 rounded-2xl bg-gradient-to-br from-[#B08D57] to-[#8B6914] flex items-center justify-center shadow-2xl shadow-[#B08D57]/30"
          >
            <span className="text-4xl">🚀</span>
          </motion.div>

          {/* Heading */}
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-[#ECEDEB] mb-6">
            Ready to{' '}
            <span className="gradient-text-glow">Launch</span>?
          </h2>

          <p className="text-lg text-[#9B9F9C] max-w-xl mx-auto mb-10">
            Download MindSpace now and start organizing your thoughts in a whole new dimension.
          </p>

          {/* Download Button */}
          <motion.a
            href="/mindspace.apk"
            download="MindSpace.apk"
            className="glow-button inline-flex items-center justify-center gap-3 px-12 py-5 rounded-full text-xl font-bold text-[#ECEDEB] group"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <svg className="w-7 h-7 group-hover:animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Download for Android
          </motion.a>

          {/* Version info */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : { opacity: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-6 text-sm text-[#6B7280]"
          >
            v1.0.9 • Android 8.0+
          </motion.p>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="flex justify-center gap-12 mt-16"
          >
            {[
              { value: '3D', label: 'Immersive Views' },
              { value: '∞', label: 'Ideas to Connect' },
              { value: '0', label: 'Subscriptions' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl md:text-4xl font-bold gradient-text-glow mb-1">
                  {stat.value}
                </div>
                <div className="text-sm text-[#9B9F9C]">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
