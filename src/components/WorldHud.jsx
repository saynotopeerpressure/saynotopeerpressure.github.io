import { useEffect, useMemo, useState } from 'react';

const biomes = [
  { id: 'home', name: 'Sakura Spawn', coord: 'X 024 / Y 086 / Z 001' },
  { id: 'research', name: 'Research Plateau', coord: 'X 064 / Y 112 / Z 017' },
  { id: 'projects', name: 'Build District', coord: 'X 128 / Y 071 / Z 042' },
  { id: 'papers', name: 'Paper Library', coord: 'X 196 / Y 064 / Z 088' },
  { id: 'contact', name: 'Portal Gate', coord: 'X 256 / Y 079 / Z 144' },
];

function WorldHud() {
  const [activeId, setActiveId] = useState('home');
  const [progress, setProgress] = useState(0);

  const activeBiome = useMemo(
    () => biomes.find((biome) => biome.id === activeId) ?? biomes[0],
    [activeId],
  );

  useEffect(() => {
    const sections = biomes
      .map((biome) => document.getElementById(biome.id))
      .filter(Boolean);

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible?.target?.id) setActiveId(visible.target.id);
      },
      { rootMargin: '-28% 0px -48% 0px', threshold: [0.08, 0.2, 0.42, 0.64] },
    );

    sections.forEach((section) => observer.observe(section));

    const handleScroll = () => {
      const maxScroll = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
      const nextProgress = Math.min(window.scrollY / maxScroll, 1);
      document.documentElement.style.setProperty('--world-scroll', nextProgress.toFixed(4));
      setProgress(nextProgress);
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <aside className={`world-hud ${activeId === 'home' ? 'is-home' : ''}`} aria-label="World status">
      <div className="hud-screen">
        <span className="hud-signal" />
        <strong>{activeBiome.name}</strong>
        <span>{activeBiome.coord}</span>
      </div>
      <div className="hud-progress" aria-hidden="true">
        <span style={{ transform: `scaleX(${Math.max(progress, 0.035)})` }} />
      </div>
    </aside>
  );
}

export default WorldHud;
