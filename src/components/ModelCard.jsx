import React, { useRef, useState, useEffect } from 'react';
import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from 'framer-motion';
import styles from './ModelCard.module.css';

const ModelCard = React.memo(({ model, index, isActive, onSelect }) => {
    const ref = useRef(null);
    const [isExpanded, setIsExpanded] = useState(false);

    // If onSelect is provided, use it (mobile behavior). Otherwise toggle local state.
    const handleClick = () => {
        if (onSelect) {
            onSelect();
        } else {
            setIsExpanded(!isExpanded);
        }
    };

    // 3D Tilt State
    const x = useMotionValue(0);
    const y = useMotionValue(0);

    // Removed useSpring for direct transform
    const rotateX = useTransform(y, [-100, 100], [10, -10]);
    const rotateY = useTransform(x, [-100, 100], [-10, 10]);

    // Auto-Expand when Active
    useEffect(() => {
        setIsExpanded(isActive);
    }, [isActive]);

    const handleMouseMove = (e) => {
        if (!ref.current) return;
        const rect = ref.current.getBoundingClientRect();
        const width = rect.width; // Fix: was missing
        const height = rect.height;
        const mouseXPos = (e.clientX - rect.left) / width - 0.5;
        const mouseYPos = (e.clientY - rect.top) / height - 0.5;
        x.set(mouseXPos);
        y.set(mouseYPos);
    };

    const handleMouseLeave = () => {
        x.set(0);
        y.set(0);
    };

    return (
        <motion.div
            id={`card-${model.id}`}
            className={styles.perspectiveWrapper}
            initial={{ opacity: 0, scale: 0.8, filter: 'blur(10px)' }}
            whileInView={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
            viewport={{ once: true, margin: "-10%" }}
            transition={{ duration: 0.8 }}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
        >
            <motion.div
                ref={ref}
                className={`${styles.card} ${isExpanded ? styles.open : ''}`} // Fix: isExpanded
                style={{ rotateX, rotateY, '--accent-color': model.color }}
            >
                <div
                    className={styles.spotlight}
                    style={{
                        background: useTransform(
                            [x, y],
                            ([latestX, latestY]) => `radial-gradient(600px circle at ${(latestX + 0.5) * 100}% ${(latestY + 0.5) * 100}%, rgba(255,255,255,0.1), transparent 40%)`
                        ) // Fix: useTransform on x/y directly
                    }}
                />
                <div className={styles.holoBorder} />

                <div className={styles.cornerTL} />
                <div className={styles.cornerTR} />
                <div className={styles.cornerBL} />
                <div className={styles.cornerBR} />

                <div className={styles.innerContent} onClick={handleClick}>
                    <div className={styles.header}>
                        <div className={styles.makerCode}>
                            <span>{model.maker}</span>
                            <span className={styles.dateDisplay}>{model.releaseDate}</span>
                            <span className={styles.code}>ID: {model.id.toUpperCase().substring(0, 6)}</span>
                        </div>
                        <h2 className={styles.name}>{model.name}</h2>
                        <div className={styles.typeBadge}>{model.type}</div>
                    </div>

                    <div className={styles.togglePrompt}>
                        {isExpanded ? '[- MINIMIZE DATA -]' : '[+ EXPAND ANALYSIS +]'} {/* Fix: isExpanded */}
                    </div>

                    <AnimatePresence>
                        {isExpanded && ( // Fix: isExpanded
                            <motion.div
                                className={styles.expandedContent}
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                            >
                                {/* New Meta Data Row */}
                                <div className={styles.metaRow} style={{ display: 'flex', gap: '20px', marginBottom: '15px', color: 'var(--color-text-secondary)', fontSize: '0.9rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '10px' }}>
                                    <span><strong>PARAMS:</strong> {model.params || 'Unknown'}</span>
                                    <span><strong>LICENSE:</strong> {model.license || 'Proprietary'}</span>
                                </div>

                                <p className={styles.description}>{model.description}</p>
                                <div className={styles.gridAnalysis}>
                                    <div className={styles.col}>
                                        <h5>SYSTEM_STRENGTHS</h5>
                                        <ul>{model.pros.map((p, i) => <li key={i}>{p}</li>)}</ul>
                                    </div>
                                    <div className={styles.col}>
                                        <h5>SYSTEM_LIMITS</h5>
                                        <ul>{model.cons.map((c, i) => <li key={i}>{c}</li>)}</ul>
                                    </div>
                                </div>

                                <div className={styles.actionRow} style={{ gap: '20px' }}>
                                    <a
                                        href={`https://x.com/search?q="${encodeURIComponent(model.name)}" since:2025-01-01 until:2025-12-31&src=typed_query&f=live`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className={styles.sourceButton}
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        [ SEE WHAT PEOPLE SAY ]
                                    </a>

                                    <a
                                        href={model.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className={styles.sourceButton}
                                        onClick={(e) => e.stopPropagation()}
                                        style={{ borderColor: 'rgba(255,255,255,0.3)', color: '#fff' }}
                                    >
                                        [ LEARN MORE ]
                                    </a>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
                <div className={styles.scanLine} />
            </motion.div>
        </motion.div>
    );
});

export default ModelCard;
