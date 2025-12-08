import { motion } from 'framer-motion';

export default function Download() {
  return (
    <section id="download" className="section-padding px-6 relative">
      {/* Background effects */}
      <div className="absolute top-0 left-1/4 w-80 h-80 bg-glow-purple rounded-full blur-3xl opacity-30" />
      <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-glow-pink rounded-full blur-3xl opacity-20" />

      <div className="max-w-4xl mx-auto relative">
        <motion.div
          className="glass-strong rounded-3xl p-10 md:p-16 text-center relative overflow-hidden"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          {/* Inner glow orbs */}
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none" />

          {/* Content */}
          <div className="relative z-10">
            {/* Icon */}
            <motion.div
              className="w-20 h-20 mx-auto mb-8 rounded-2xl bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 flex items-center justify-center shadow-2xl shadow-purple-500/30"
              animate={{ 
                rotate: [0, 5, -5, 0],
                scale: [1, 1.05, 1]
              }}
              transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
            >
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </motion.div>

            {/* Title */}
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              <span className="text-white">Ready to </span>
              <span className="gradient-text">Launch?</span>
            </h2>

            <p className="text-white/40 text-lg mb-10 max-w-md mx-auto">
              Download MindSpace and start organizing your thoughts in a beautiful 3D universe.
            </p>

            {/* Download Button */}
            <motion.a
              href="/mindspace.apk"
              download="MindSpace.apk"
              className="inline-flex items-center gap-3 glow-button px-12 py-5 rounded-full text-xl font-semibold text-white"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download APK
            </motion.a>

            {/* Info */}
            <div className="flex items-center justify-center gap-6 mt-8 text-white/30 text-sm">
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                Support
              </span>
              <span>Android 8.0+</span>
              <span>~25MB</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
