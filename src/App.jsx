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
    // Desktop: set body height for vertical scroll. Mobile: height 0 (native horizontal).
    setScrollRange(isMobile ? 0 : totalMoveDistance);
  }, [totalMoveDistance, isMobile]);

  // Ref for mobile horizontal scroll container
  const mobileScrollRef = useRef(null);

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

  // Mobile: Native horizontal scroll handler
  const handleMobileScroll = (e) => {
    if (!isMobile) return;
    const scrollLeft = e.target.scrollLeft;
    const itemWidth = cardWidth + gap;
    const index = Math.round(scrollLeft / itemWidth);
    updateActiveState(Math.min(index, currentModels.length - 1));
    setIsScrolled(scrollLeft > 50);
  };

  // Color Sync
  const activeModel = currentModels[activeIndex] || currentModels[0];
  const activeColor = activeModel ? activeModel.color : '#00f3ff';

  const handleMonthClick = (monthName) => {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    const targetMonthIndex = months.indexOf(monthName);

    if (targetMonthIndex === -1) return;

    const modelIndex = currentModels.findIndex(m => {
      const d = parseDate(m.releaseDate);
      return d.getMonth() >= targetMonthIndex;
    });

    if (modelIndex !== -1) {
      const targetScrollPos = modelIndex * (cardWidth + gap);

      if (isMobile && mobileScrollRef.current) {
        // Mobile: Scroll the horizontal container
        mobileScrollRef.current.scrollTo({
          left: targetScrollPos,
          behavior: 'smooth'
        });
      } else if (scrollRange > 0) {
        // Desktop: Scroll the window vertically
        const progress = modelIndex / (currentModels.length - 1);
        const targetY = progress * scrollRange;
        window.scrollTo({
          top: targetY,
          behavior: 'smooth'
        });
      }
    }
  };

  const handleJumpToModel = (modelId) => {
    const index = currentModels.findIndex(m => m.id === modelId);
    if (index !== -1) {
      const targetScrollPos = index * (cardWidth + gap);

      if (isMobile && mobileScrollRef.current) {
        mobileScrollRef.current.scrollTo({
          left: targetScrollPos,
          behavior: 'smooth'
        });
      } else if (scrollRange > 0) {
        const progress = index / (currentModels.length - 1);
        const targetY = progress * scrollRange;
        window.scrollTo({
          top: targetY,
          behavior: 'smooth'
        });
      }
    }
  };

  const handleFilterChange = (val) => {
    setSelectedMaker(val);
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  return (
    <div className={styles.appContainer} style={{ height: `${scrollRange + window.innerHeight}px` }}>

      {/* X Follow Button - Top Right */}
      <a
        href="https://x.com/intent/follow?screen_name=promptdesigner1"
        target="_blank"
        rel="noopener noreferrer"
        style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          zIndex: 9999,
          pointerEvents: 'auto',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          background: 'rgba(0, 0, 0, 0.8)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          borderRadius: '20px',
          padding: '8px 16px',
          color: '#fff',
          textDecoration: 'none',
          fontSize: '14px',
          fontWeight: '500',
          transition: 'all 0.3s ease'
        }}
        onMouseEnter={(e) => {
          e.target.style.background = '#fff';
          e.target.style.color = '#000';
        }}
        onMouseLeave={(e) => {
          e.target.style.background = 'rgba(0, 0, 0, 0.8)';
          e.target.style.color = '#fff';
        }}
      >
        <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
        Follow
      </a>

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
          ref={isMobile ? mobileScrollRef : null}
          className={styles.horizontalTrack}
          style={isMobile ? {} : { x }}
          onScroll={isMobile ? handleMobileScroll : undefined}
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
