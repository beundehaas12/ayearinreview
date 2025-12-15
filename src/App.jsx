import React, { Suspense, useRef, useEffect, useState } from 'react';
import ThreeBackground from './components/ThreeBackground';
import ModelCard from './components/ModelCard';
import MobileModelModal from './components/MobileModelModal';
import MonthNavigator from './components/MonthNavigator';
import FilterDropdown from './components/FilterDropdown';
import { models2025 } from './data/models2025';
import { parseDate } from './utils/dateUtils';
import styles from './App.module.css';
import { motion, useScroll, useTransform, useSpring, useMotionValueEvent, AnimatePresence } from 'framer-motion';

function App() {
  const [activeMonth, setActiveMonth] = useState('January');
  const [isScrolled, setIsScrolled] = useState(false);
  const [scrollRange, setScrollRange] = useState(0);
  const [activeIndex, setActiveIndex] = useState(0);
  const [selectedModel, setSelectedModel] = useState(null);
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1000);

  // Handle Resize
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const [selectedMaker, setSelectedMaker] = useState('All');

  // Filter Logic
  const makers = ['All', ...new Set(models2025.map(m => m.maker))].sort();
  const getFilteredModels = () => {
    if (selectedMaker === 'All') return models2025;
    return models2025.filter(m => m.maker === selectedMaker);
  };
  const currentModels = getFilteredModels();

  // Layout Constants
  const isMobile = windowWidth < 768;
  const cardWidth = isMobile ? windowWidth * 0.85 : 600;
  // Gap calculation (must match CSS: 15vw desktop, 5vw mobile)
  const gap = isMobile ? windowWidth * 0.05 : windowWidth * 0.15;

  // Centering Offset: Place first card exactly in center
  const centeringOffset = (windowWidth - cardWidth) / 2;

  // Total scroll distance needed to reach the last card
  const totalMoveDistance = Math.max(0, (currentModels.length - 1) * (cardWidth + gap));

  useEffect(() => {
    // Set the body height so we can scroll (Universal)
    setScrollRange(totalMoveDistance);
  }, [totalMoveDistance]);

  const { scrollY } = useScroll();

  // Desktop: Spring for smooth mousewheel. Mobile: Direct mapping for 1:1 touch.
  const physicsScroll = useSpring(scrollY, { stiffness: 200, damping: 30, mass: 0.2 });
  const finalScrollY = isMobile ? scrollY : physicsScroll;

  // Map vertical scroll to horizontal movement
  const x = useTransform(finalScrollY, [0, scrollRange], [0, -totalMoveDistance]);

  // Scroll Container Ref for Mobile (Removed native scroll)

  // Helper to sync state from index
  const updateActiveState = (index) => {
    setActiveIndex(index);
    const model = currentModels[index];
    if (model) {
      const month = parseDate(model.releaseDate).toLocaleString('en-US', { month: 'long' });
      setActiveMonth(prev => prev !== month ? month : prev);
    }
  };

  // Robust Active Month & Index Listener
  useMotionValueEvent(finalScrollY, "change", (latest) => {
    // Toggle Intro/Month Header
    setIsScrolled(latest > 50);

    if (scrollRange === 0) return;

    // effectiveScroll matches the input to the 'x' transform
    const progress = Math.max(0, Math.min(latest / scrollRange, 1));
    const exactIndex = progress * (currentModels.length - 1);
    const index = Math.round(exactIndex);

    updateActiveState(index);
  });

  // OMNI-SCROLL: Touch Injector with Inertia
  // Allows horizontal flicks to drive vertical scroll with momentum
  useEffect(() => {
    if (!isMobile) return;

    let touchStartX = 0;
    let touchStartY = 0;
    let lastTouchX = 0;
    let velocityX = 0;
    let lastTime = 0;
    let animationFrameId;
    let isDragging = false;

    const handleTouchStart = (e) => {
      // Stop any active inertia
      cancelAnimationFrame(animationFrameId);

      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
      lastTouchX = touchStartX;
      lastTime = Date.now();
      velocityX = 0;
      isDragging = true;
    };

    const handleTouchMove = (e) => {
      if (!isDragging) return;

      const touchX = e.touches[0].clientX;
      const touchY = e.touches[0].clientY;
      const deltaX = lastTouchX - touchX;
      // Total delta from start to check dominance
      const totalDeltaX = touchStartX - touchX;
      const totalDeltaY = touchStartY - touchY;

      // Update for next frame
      const now = Date.now();
      const dt = now - lastTime;

      // Calculate velocity (pixels per ms)
      if (dt > 0) {
        velocityX = (deltaX / dt);
      }

      lastTouchX = touchX;
      lastTime = now;

      // If horizontal swipe is dominant (check total drag)
      if (Math.abs(totalDeltaX) > Math.abs(totalDeltaY)) {
        if (e.cancelable) e.preventDefault();
        // 2.0x multiplier for snappier 1:1 feel
        window.scrollBy({ top: deltaX * 2.0, behavior: 'instant' });
      }
    };

    const handleTouchEnd = () => {
      isDragging = false;

      // Inertia Loop
      const friction = 0.95; // Decay rate
      const stopThreshold = 0.1;

      const step = () => {
        if (Math.abs(velocityX) > stopThreshold) {
          window.scrollBy({ top: velocityX * 16, behavior: 'instant' }); // *16 for ~60fps frame time scaling
          velocityX *= friction;
          animationFrameId = requestAnimationFrame(step);
        }
      };

      // Start momentum if velocity is significant
      if (Math.abs(velocityX) > 0.5) {
        animationFrameId = requestAnimationFrame(step);
      }
    };

    window.addEventListener('touchstart', handleTouchStart, { passive: false });
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', handleTouchEnd);
    window.addEventListener('touchcancel', handleTouchEnd);

    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
      window.removeEventListener('touchcancel', handleTouchEnd);
      cancelAnimationFrame(animationFrameId);
    };
  }, [isMobile]);

  // Color Sync
  const activeModel = currentModels[activeIndex] || currentModels[0];
  const activeColor = activeModel ? activeModel.color : '#00f3ff';

  const handleMonthClick = (monthName) => {
    // robust mapping
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    const targetMonthIndex = months.indexOf(monthName);

    if (targetMonthIndex === -1) return;

    // Find the first model that is in this month OR after it
    // This handles gaps (like September) by jumping to October
    const modelIndex = currentModels.findIndex(m => {
      const d = parseDate(m.releaseDate);
      return d.getMonth() >= targetMonthIndex;
    });

    if (modelIndex !== -1 && scrollRange > 0) {
      // Calculate progress based on index
      const progress = modelIndex / (currentModels.length - 1);
      const targetY = progress * scrollRange;

      window.scrollTo({
        top: targetY,
        behavior: 'smooth'
      });
    }
  };

  const handleJumpToModel = (modelId) => {
    const index = currentModels.findIndex(m => m.id === modelId);
    if (index !== -1 && scrollRange > 0) {
      // Calculate progress based on index
      const progress = index / (currentModels.length - 1);
      const targetY = progress * scrollRange;

      window.scrollTo({
        top: targetY,
        behavior: 'smooth'
      });
    }
  };

  const handleFilterChange = (val) => {
    setSelectedMaker(val);
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  return (
    <div className={styles.appContainer} style={{ height: `${scrollRange + window.innerHeight}px` }}>

      <div className={styles.viewport}>
        <Suspense fallback={null}>
          <ThreeBackground
            scrollY={finalScrollY}
            maxScroll={scrollRange}
            activeColor={activeColor}
          />
        </Suspense>

        <header className={styles.header}>
          <motion.div
            className={styles.intro}
            animate={{ opacity: 1 }} // Force Visible
          >
            <h1>2025<br />
              <motion.span
                key={isScrolled ? activeMonth : "intro"}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                style={{
                  display: 'inline-block',
                  color: isScrolled ? activeColor : '#fff', // Use activeColor
                  transition: 'color 0.5s ease' // Smooth transition
                }}
              >
                {isScrolled ? activeMonth.toUpperCase() : "YEAR IN REVIEW"}
              </motion.span>
            </h1>
            {!isScrolled && <p>Scroll to explore the intelligence explosion →</p>}

            {/* Custom Filter Dropdown */}
            <div style={{ marginTop: '20px', pointerEvents: 'auto', display: 'flex', gap: '10px', alignItems: 'center' }}>
              <FilterDropdown
                options={makers}
                selected={selectedMaker}
                onSelect={handleFilterChange}
              />

              {selectedMaker !== 'All' && (
                <motion.button
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  onClick={() => handleFilterChange('All')}
                  style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    color: '#fff',
                    padding: '8px 12px',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '0.7rem',
                    fontFamily: 'var(--font-body)',
                    textTransform: 'uppercase',
                    backdropFilter: 'blur(10px)'
                  }}
                  whileHover={{ background: 'rgba(255,255,255,0.15)', borderColor: '#fff' }}
                  whileTap={{ scale: 0.95 }}
                >
                  Reset
                </motion.button>
              )}
            </div>

          </motion.div>
        </header>

        <motion.div
          className={styles.horizontalTrack}
          style={{ x }}
        >

          {/* Continuous Axis Line - Explicitly sized to full track width */}
          <div
            className={styles.axisLine}
            style={{
              width: `${centeringOffset + (currentModels.length * (cardWidth + gap)) + windowWidth}px`
            }}
          />

          {/* Dynamic Spacer for Centering */}
          <div className={styles.spacer} style={{ width: centeringOffset, minWidth: centeringOffset }} />

          {currentModels.map((model, index) => {
            const date = parseDate(model.releaseDate);
            const month = date.toLocaleString('en-US', { month: 'long' });

            let showMonth = index === 0;
            if (index > 0) {
              const prevDate = parseDate(currentModels[index - 1].releaseDate);
              showMonth = prevDate.getMonth() !== date.getMonth();
            }

            return (
              <div
                key={model.id}
                className={styles.timelineItem}
                style={{ marginRight: index === currentModels.length - 1 ? 0 : gap }} // Explicit gap control
              >
                {showMonth && <div className={styles.monthMarker}>{month} 2025</div>}
                {/* Node removed as per request */}
                <ModelCard
                  model={model}
                  index={index}
                  isActive={!isMobile && index === activeIndex} // Only auto-expand on desktop
                  onSelect={() => isMobile && setSelectedModel(model)} // Only trigger modal on mobile
                />
              </div>
            );
          })}

          <div className={styles.endCredits} style={{ minWidth: windowWidth }}>
            <h2>2026 Loading...</h2>
          </div>
        </motion.div>

        {/* Bottom Month Navigator */}
        {/* Bottom Month Navigator - Hide when modal is open on mobile */}
        <AnimatePresence>
          {!selectedModel && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              transition={{ duration: 0.3 }}
              style={{ position: 'fixed', bottom: 0, left: 0, width: '100%', zIndex: 999 }}
            >
              <MonthNavigator
                activeMonth={activeMonth}
                onMonthClick={handleMonthClick}
                models={currentModels}
                activeModelId={currentModels[activeIndex]?.id}
                onModelClick={handleJumpToModel}
                activeColor={activeColor}
                isMobile={isMobile}
              />
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div className={styles.progressBar}>
          <motion.div
            className={styles.progressFill}
            style={{
              width: useTransform(finalScrollY, [0, scrollRange > 0 ? scrollRange : 1], ['0%', '100%']),
              backgroundColor: activeColor, // Sync color
              boxShadow: `0 0 10px ${activeColor}`,
              transition: 'background-color 0.5s ease, box-shadow 0.5s ease'
            }}
          />
        </motion.div>

        <AnimatePresence>
          {selectedModel && (
            <MobileModelModal
              model={selectedModel}
              onClose={() => setSelectedModel(null)}
            />
          )}
        </AnimatePresence>
      </div>

      {/* Scroll Spacer: Drives the document height */}
      <div
        style={{
          height: `${scrollRange + window.innerHeight}px`,
          width: '100%',
          position: 'absolute',
          top: 0,
          left: 0,
          pointerEvents: 'none',
          zIndex: -1
        }}
      >
        {/* Generate Snap Points for Vertical Scroll Snapping */}
        {currentModels.map((_, i) => (
          <div
            key={i}
            style={{
              height: `${cardWidth + gap}px`,
              scrollSnapAlign: 'start',
              scrollSnapStop: isMobile ? 'normal' : 'always'
            }}
          />
        ))}
      </div>
    </div>
  );
}

export default App;
