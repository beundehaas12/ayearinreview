import React from 'react';
import { motion } from 'framer-motion';
import styles from './MobileModelModal.module.css';

const MobileModelModal = ({ model, onClose }) => {
    if (!model) return null;

    return (
        <motion.div
            className={styles.modalOverlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{ '--accent-color': model.color }}
        >
            <motion.div
                className={styles.cardFrame}
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Decorative Elements matching ModelCard */}
                <div className={styles.holoBorder} />

                <div className={styles.cornerTL} />
                <div className={styles.cornerBL} />
                <div className={styles.cornerBR} />

                {/* Top Right is replaced by Close Button */}
                <button className={styles.closeButton} onClick={onClose}>
                    ×
                </button>

                <div className={styles.innerContent}>
                    <div className={styles.header}>
                        <div className={styles.makerCode}>
                            <span>{model.maker}</span>
                            <span className={styles.dateDisplay}>{model.releaseDate}</span>
                        </div>
                        <h2 className={styles.name}>{model.name}</h2>
                        <div className={styles.typeBadge}>{model.type}</div>
                    </div>

                    <div className={styles.description}>
                        <div className={styles.metaRow}>
                            <span><strong>PARAMS:</strong> {model.params || 'Unknown'}</span>
                            <span><strong>LICENSE:</strong> {model.license || 'Proprietary'}</span>
                        </div>
                        <p>{model.description}</p>
                    </div>

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

                    <div className={styles.actionRow}>
                        <a
                            href={`https://x.com/search?q="${encodeURIComponent(model.name)}" since:2025-01-01 until:2025-12-31&src=typed_query&f=live`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={styles.sourceButton}
                        >
                            [ SEE WHAT PEOPLE SAY ]
                        </a>

                        <a
                            href={model.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={styles.sourceButton}
                            style={{ borderColor: 'rgba(255,255,255,0.3)', color: '#fff' }}
                        >
                            [ LEARN MORE ]
                        </a>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default MobileModelModal;
