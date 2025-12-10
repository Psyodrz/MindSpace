import { useState, useEffect, lazy, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Features from './components/Features';
import HowItWorks from './components/HowItWorks';
import Screenshots from './components/Screenshots';
import Testimonials from './components/Testimonials';
import Download from './components/Download';
import Footer from './components/Footer';
import Loader from './components/Loader';

// Lazy load the 3D scene for better initial load
const SolarSystemScene = lazy(() => 
  import('./components/scene/SolarSystemScene').then(m => ({ default: m.SolarSystemScene }))
);

function App() {
  const [loading, setLoading] = useState(true);

  // Loading timer
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      {/* 3D Background Scene - fixed, behind everything */}
      <Suspense fallback={null}>
        <SolarSystemScene />
      </Suspense>

      <AnimatePresence mode="wait">
        {loading ? (
          <Loader key="loader" />
        ) : (
          <motion.div
            key="app"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            <Navbar />
            <main>
              <Hero />
              <Features />
              <HowItWorks />
              <Screenshots />
              <Testimonials />
              <Download />
            </main>
            <Footer />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default App;
