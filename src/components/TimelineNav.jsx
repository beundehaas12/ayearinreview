import React, { useEffect, useState } from 'react';
import styles from './TimelineNav.module.css';

export default function TimelineNav({ models }) {
    const [activeId, setActiveId] = useState(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setActiveId(entry.target.id);
                    }
                });
            },
            { rootMargin: '-40% 0px -40% 0px', threshold: 0 }
        );

        models.forEach((model) => {
            const el = document.getElementById(`card-${model.id}`);
            if (el) observer.observe(el);
        });

        return () => observer.disconnect();
    }, [models]);

    const scrollToModel = (id) => {
        const el = document.getElementById(`card-${id}`);
        if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    };

    return (
        <nav className={styles.navContainer}>
            <div className={styles.line} />
            {models.map((model) => (
                <div
                    key={model.id}
                    className={`${styles.item} ${activeId === `card-${model.id}` ? styles.active : ''}`}
                    onClick={() => scrollToModel(model.id)}
                    title={model.name}
                    style={{ '--item-color': model.color }}
                >
                    <div className={styles.tooltip}>
                        {model.name}
                        <span className={styles.tooltipDate}>
                            {new Date(model.releaseDate).toLocaleDateString('en-US', { month: 'short' })}
                        </span>
                    </div>

                    <div className={styles.dot} />
                </div>
            ))}
        </nav>
    );
}
