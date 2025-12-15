import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './FilterDropdown.module.css';

export default function FilterDropdown({ options, selected, onSelect }) {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef(null);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleSelect = (option) => {
        onSelect(option);
        setIsOpen(false);
    };

    return (
        <div className={styles.container} ref={containerRef}>
            <div
                className={`${styles.trigger} ${isOpen ? styles.active : ''}`}
                onClick={() => setIsOpen(!isOpen)}
            >
                FILTER: <span className={styles.activeLabel}>{selected === 'All' ? 'ALL MAKERS' : selected}</span>
                <span className={styles.arrow} />
            </div>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        className={styles.menu}
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                    >
                        {options.map((option) => (
                            <div
                                key={option}
                                className={`${styles.option} ${selected === option ? styles.selected : ''}`}
                                onClick={() => handleSelect(option)}
                            >
                                {option === 'All' ? 'All Makers' : option}
                            </div>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
