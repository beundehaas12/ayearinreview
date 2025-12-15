import React, { useRef, useEffect } from 'react';
import styles from './MonthNavigator.module.css';

import { parseDate } from '../utils/dateUtils';

const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

export default function MonthNavigator({ activeMonth, onMonthClick, onModelClick, activeModelId, activeColor = 'var(--color-neon-blue)', models = [], isMobile = false }) {
    const scrollRef = useRef(null);
    const itemRefs = useRef({});

    // Auto-scroll to active month
    useEffect(() => {
        const activeItem = itemRefs.current[activeMonth];
        if (activeItem && scrollRef.current) {
            const container = scrollRef.current;
            const scrollLeft = activeItem.offsetLeft - (container.clientWidth / 2) + (activeItem.clientWidth / 2);

            container.scrollTo({
                left: scrollLeft,
                behavior: 'smooth'
            });
        }
    }, [activeMonth]);

    // Mobile View
    if (isMobile) {
        const currentIndex = months.indexOf(activeMonth);
        const prevMonth = currentIndex > 0 ? months[currentIndex - 1] : null;
        const nextMonth = currentIndex < months.length - 1 ? months[currentIndex + 1] : null;

        // Active Month Data
        const monthReleases = models.filter(m =>
            parseDate(m.releaseDate).toLocaleString('en-US', { month: 'long' }) === activeMonth
        );
        const hasReleases = monthReleases.length > 0;

        return (
            <div className={styles.mobileNavContainer} style={{ zIndex: 99999 }}>
                {/* Prev Button */}
                <button
                    className={styles.navArrow}
                    onClick={() => prevMonth && onMonthClick && onMonthClick(prevMonth)}
                    disabled={!prevMonth}
                    aria-label="Previous Month"
                >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M15 18l-6-6 6-6" />
                    </svg>
                </button>

                {/* Single Month Display */}
                <div className={styles.mobileMonthDisplay}>
                    <span className={styles.mobileLabel}>{activeMonth}</span>
                    <div className={styles.indicatorRow}>
                        {hasReleases ? (
                            monthReleases.map(m => {
                                const isModelActive = m.id === activeModelId;
                                return (
                                    <div
                                        key={m.id}
                                        className={`${styles.indicator} ${isModelActive ? styles.modelActive : ''}`}
                                        style={isModelActive ? {
                                            backgroundColor: '#ffffff',
                                            boxShadow: `0 0 10px #ffffff`,
                                            transform: 'scale(1.5)'
                                        } : {}}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onModelClick && onModelClick(m.id);
                                        }}
                                    />
                                );
                            })
                        ) : (
                            <div className={styles.indicator} style={{ opacity: 0 }} /> // Invisible spacer to keep height
                        )}
                    </div>
                </div>

                {/* Next Button */}
                <button
                    className={styles.navArrow}
                    onClick={() => nextMonth && onMonthClick && onMonthClick(nextMonth)}
                    disabled={!nextMonth}
                    aria-label="Next Month"
                >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M9 18l6-6-6-6" />
                    </svg>
                </button>
            </div>
        );
    }

    // Desktop View
    return (
        <div
            className={styles.navContainer}
            style={{ zIndex: 99999 }}
            ref={scrollRef}
        >
            <div className={styles.track}>
                {months.map((month) => {
                    const isMonthActive = activeMonth === month;
                    // Find releases for this month
                    const monthReleases = models.filter(m =>
                        parseDate(m.releaseDate).toLocaleString('en-US', { month: 'long' }) === month
                    );

                    const hasReleases = monthReleases.length > 0;

                    return (
                        <div
                            key={month}
                            ref={el => itemRefs.current[month] = el}
                            className={`${styles.monthItem} ${isMonthActive ? styles.active : ''}`}
                            onClick={() => onMonthClick && onMonthClick(month)}
                        >
                            {/* Tooltip */}
                            <div className={styles.tooltip}>
                                <div className={styles.tooltipContent}>
                                    <h5>{month}</h5>
                                    {hasReleases ? (
                                        <ul>
                                            {monthReleases.map(m => (
                                                <li key={m.id}>
                                                    {m.name}
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <p className={styles.emptyMsg}>This month we've got nothing.</p>
                                    )}
                                </div>
                            </div>

                            <span className={styles.label}>{month.substring(0, 3)}</span>

                            {/* Indicators: 1 per model (or 1 dummy if empty) */}
                            <div className={styles.indicatorRow}>
                                {hasReleases ? (
                                    monthReleases.map(m => {
                                        const isModelActive = m.id === activeModelId;
                                        return (
                                            <div
                                                key={m.id}
                                                className={`${styles.indicator} ${isModelActive ? styles.modelActive : ''}`}
                                                style={isModelActive ? {
                                                    backgroundColor: '#ffffff',
                                                    boxShadow: `0 0 10px #ffffff`,
                                                    transform: 'scale(1.5)'
                                                } : {}}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onModelClick && onModelClick(m.id);
                                                }}
                                            />
                                        );
                                    })
                                ) : (
                                    <div className={styles.indicator} />
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div >
    );
}
