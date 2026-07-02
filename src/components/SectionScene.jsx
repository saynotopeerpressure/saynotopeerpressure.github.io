const sceneConfig = {
  research: {
    className: 'scene-research',
    actors: [
      { type: 'reader', x: 66, y: 31, delay: '0s' },
      { type: 'mapper', x: 86, y: 34, delay: '0.35s' },
    ],
    mobs: [
      { type: 'villager', x: 76, y: 33, delay: '0.2s' },
      { type: 'chicken', x: 55, y: 47, delay: '0.1s' },
      { type: 'pig', x: 92, y: 51, delay: '0.6s' },
    ],
    floaters: [
      ['ore', 14, 25],
      ['grass', 31, 20],
      ['lantern', 54, 18],
      ['stone', 92, 17],
      ['book', 44, 40],
    ],
    blocks: [
      ['grass', 8, 72],
      ['grass', 18, 72],
      ['grass', 28, 72],
      ['grass', 38, 72],
      ['grass', 48, 72],
      ['grass', 58, 72],
      ['grass', 68, 72],
      ['grass', 78, 72],
      ['dirt', 13, 84],
      ['dirt', 23, 84],
      ['stone', 52, 61],
      ['stone', 62, 61],
      ['torch', 82, 58],
    ],
  },
  projects: {
    className: 'scene-projects',
    actors: [
      { type: 'builder', x: 64, y: 31, delay: '0.15s' },
      { type: 'carrier', x: 78, y: 36, delay: '0.5s' },
      { type: 'builder', x: 91, y: 29, delay: '0.75s' },
    ],
    mobs: [
      { type: 'villager', x: 71, y: 34, delay: '0.3s' },
      { type: 'pig', x: 52, y: 51, delay: '0.5s' },
      { type: 'chicken', x: 87, y: 47, delay: '0.15s' },
    ],
    floaters: [
      ['wood', 16, 22],
      ['stone', 31, 18],
      ['grass', 48, 24],
      ['lantern', 82, 16],
      ['ore', 92, 38],
    ],
    blocks: [
      ['grass', 8, 74],
      ['grass', 18, 74],
      ['grass', 28, 74],
      ['grass', 38, 74],
      ['grass', 48, 74],
      ['grass', 58, 74],
      ['grass', 68, 74],
      ['grass', 78, 74],
      ['wood', 37, 50],
      ['wood', 47, 50],
      ['stone', 37, 62],
      ['stone', 47, 62],
      ['torch', 88, 50],
    ],
  },
  papers: {
    className: 'scene-papers',
    actors: [
      { type: 'librarian', x: 64, y: 33, delay: '0.1s' },
      { type: 'reader', x: 84, y: 36, delay: '0.55s' },
    ],
    mobs: [
      { type: 'villager', x: 76, y: 34, delay: '0.2s' },
      { type: 'chicken', x: 54, y: 50, delay: '0.4s' },
      { type: 'pig', x: 91, y: 53, delay: '0.1s' },
    ],
    floaters: [
      ['book', 17, 23],
      ['book', 33, 18],
      ['lantern', 48, 20],
      ['stone', 91, 22],
      ['grass', 68, 43],
    ],
    blocks: [
      ['wood', 14, 66],
      ['wood', 24, 66],
      ['wood', 34, 66],
      ['wood', 58, 66],
      ['wood', 68, 66],
      ['wood', 78, 66],
      ['book', 19, 54],
      ['book', 29, 54],
      ['book', 63, 54],
      ['book', 73, 54],
      ['torch', 46, 45],
    ],
  },
  contact: {
    className: 'scene-contact',
    actors: [
      { type: 'traveler', x: 10, y: 38, delay: '0.2s' },
      { type: 'mapper', x: 22, y: 42, delay: '0.65s' },
    ],
    mobs: [
      { type: 'villager', x: 16, y: 40, delay: '0.35s' },
      { type: 'pig', x: 8, y: 58, delay: '0.1s' },
      { type: 'chicken', x: 30, y: 56, delay: '0.55s' },
    ],
    floaters: [
      ['water', 13, 21],
      ['stone', 38, 25],
      ['lantern', 58, 18],
      ['grass', 84, 27],
      ['ore', 73, 45],
    ],
    blocks: [
      ['grass', 10, 75],
      ['grass', 20, 75],
      ['grass', 30, 75],
      ['grass', 60, 75],
      ['grass', 70, 75],
      ['grass', 80, 75],
      ['stone', 43, 69],
      ['stone', 53, 69],
      ['water', 17, 88],
      ['water', 27, 88],
      ['torch', 39, 50],
      ['torch', 57, 50],
    ],
  },
};

function PixelActor({ actor }) {
  return (
    <span
      className={`pixel-actor actor-${actor.type}`}
      style={{ '--x': `${actor.x}%`, '--y': `${actor.y}%`, '--delay': actor.delay }}
      aria-hidden="true"
    >
      <span className="actor-shadow" />
      <span className="actor-head" />
      <span className="actor-hair" />
      <span className="actor-eye actor-eye-left" />
      <span className="actor-eye actor-eye-right" />
      <span className="actor-mouth" />
      <span className="actor-body" />
      <span className="actor-arm actor-arm-left" />
      <span className="actor-arm actor-arm-right" />
      <span className="actor-hand actor-hand-left" />
      <span className="actor-hand actor-hand-right" />
      <span className="actor-leg actor-leg-left" />
      <span className="actor-leg actor-leg-right" />
      <span className="actor-tool" />
    </span>
  );
}

function PixelMob({ mob }) {
  return (
    <span
      className={`scene-mob mob-${mob.type}`}
      style={{ '--x': `${mob.x}%`, '--y': `${mob.y}%`, '--delay': mob.delay }}
      aria-hidden="true"
    >
      <span className="mob-shadow" />
      <span className="mob-body" />
      <span className="mob-head" />
      <span className="mob-ear mob-ear-left" />
      <span className="mob-ear mob-ear-right" />
      <span className="mob-eye mob-eye-left" />
      <span className="mob-eye mob-eye-right" />
      <span className="mob-nose" />
      <span className="mob-wing" />
      <span className="mob-leg mob-leg-left" />
      <span className="mob-leg mob-leg-right" />
      <span className="mob-arm mob-arm-left" />
      <span className="mob-arm mob-arm-right" />
      <span className="mob-badge" />
    </span>
  );
}

function SectionScene({ type }) {
  const scene = sceneConfig[type];
  if (!scene) return null;

  return (
    <div className={`section-scene ${scene.className}`} aria-hidden="true">
      <div className="scene-skyline">
        <span className="scene-cloud cloud-a" />
        <span className="scene-cloud cloud-b" />
        <span className="scene-sun" />
      </div>
      {scene.floaters.map(([kind, x, y], index) => (
        <span
          className={`scene-floater floater-${kind}`}
          key={`floater-${kind}-${x}-${y}-${index}`}
          style={{ '--x': `${x}%`, '--y': `${y}%`, '--delay': `${index * 0.17}s` }}
        />
      ))}
      <div className="scene-ground">
        {scene.blocks.map(([kind, x, y], index) => (
          <span
            className={`scene-block block-${kind}`}
            key={`${kind}-${x}-${y}-${index}`}
            style={{ '--x': `${x}%`, '--y': `${y}%`, '--delay': `${index * 0.08}s` }}
          />
        ))}
      </div>
      {type === 'research' && (
        <div className="scene-building observatory">
          <span className="dome" />
          <span className="scope" />
          <span className="base" />
        </div>
      )}
      {type === 'projects' && (
        <div className="scene-building scaffold">
          <span className="post post-a" />
          <span className="post post-b" />
          <span className="beam beam-a" />
          <span className="beam beam-b" />
          <span className="crate crate-a" />
          <span className="crate crate-b" />
        </div>
      )}
      {type === 'papers' && (
        <div className="scene-building library">
          <span className="shelf shelf-a" />
          <span className="shelf shelf-b" />
          <span className="roof" />
          <span className="lantern" />
        </div>
      )}
      {type === 'contact' && (
        <div className="scene-building portal">
          <span className="portal-core" />
          <span className="portal-frame frame-a" />
          <span className="portal-frame frame-b" />
          <span className="portal-frame frame-c" />
        </div>
      )}
      {scene.actors.map((actor, index) => (
        <PixelActor actor={actor} key={`${actor.type}-${index}`} />
      ))}
      {scene.mobs.map((mob, index) => (
        <PixelMob mob={mob} key={`${mob.type}-${index}`} />
      ))}
    </div>
  );
}

export default SectionScene;
