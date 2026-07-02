import {
  ArrowUpRight,
  Blocks,
  BookOpen,
  ChevronDown,
  Github,
  Mail,
  Map,
  Mountain,
  Sparkles,
  Sprout,
} from 'lucide-react';
import MinecraftWorld from './components/MinecraftWorld.jsx';
import PixelDivider from './components/PixelDivider.jsx';
import VoxelSectionWorld from './components/VoxelSectionWorld.jsx';
import WorldHud from './components/WorldHud.jsx';
import {
  navigation,
  profile,
  projects,
  publications,
  researchTrails,
  worldStats,
} from './data/profile.js';

const iconMap = {
  research: Mountain,
  projects: Blocks,
  papers: BookOpen,
};

function App() {
  return (
    <div className="site-shell">
      <div className="world-route" aria-hidden="true" />
      <WorldHud />
      <nav className="topbar" aria-label="Primary navigation">
        <a className="brand" href="#home" aria-label="Back to world">
          <span className="brand-mark" aria-hidden="true" />
          <span>{profile.name}</span>
        </a>
        <div className="nav-links">
          {navigation.map((item) => (
            <a key={item.id} href={`#${item.id}`}>
              {item.label}
            </a>
          ))}
        </div>
        <a className="icon-link" href={profile.github} aria-label="Open GitHub profile">
          <Github size={18} />
        </a>
      </nav>

      <header className="hero" id="home">
        <MinecraftWorld />
        <div className="hero-overlay" />
        <section className="hero-content" aria-labelledby="hero-title">
          <div className="eyebrow">
            <Sparkles size={16} />
            Japanese Minecraft academic world
          </div>
          <h1 id="hero-title">{profile.name}</h1>
          <p className="hero-title">{profile.title}</p>
          <p className="hero-copy">{profile.statement}</p>
          <div className="hero-actions" aria-label="Hero actions">
            <a className="primary-action" href="#research">
              Explore world
              <ChevronDown size={18} />
            </a>
            <a className="secondary-action" href={`mailto:${profile.email}`}>
              <Mail size={18} />
              Contact
            </a>
          </div>
          <div className="tag-row" aria-label="Research tags">
            {profile.tags.map((tag) => (
              <span key={tag}>{tag}</span>
            ))}
          </div>
        </section>
      </header>

      <main>
        <section className="stat-band" aria-label="Profile highlights">
          {worldStats.map((stat) => (
            <div className="stat-tile" key={stat.label}>
              <span>{stat.label}</span>
              <strong>{stat.value}</strong>
            </div>
          ))}
        </section>

        <PixelDivider />

        <section className="world-zone zone-research" id="research">
          <VoxelSectionWorld type="research" />
          <div className="content-section intro-section">
            <div className="section-heading scene-heading">
              <div>
                <span className="section-kicker">Research terrain</span>
                <h2>Blocks arranged around spatial intelligence.</h2>
              </div>
            </div>
            <div className="research-grid">
              {researchTrails.map((trail) => {
                const Icon = iconMap.research;
                return (
                  <article className="info-card trail-card" key={trail.title}>
                    <div className="card-topline">
                      <Icon size={20} />
                      <span>{trail.type}</span>
                    </div>
                    <h3>{trail.title}</h3>
                    <p>{trail.summary}</p>
                    <div className="mini-tags">
                      {trail.blocks.map((block) => (
                        <span key={block}>{block}</span>
                      ))}
                    </div>
                    <span className="status-chip">{trail.status}</span>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section className="world-zone zone-projects" id="projects">
          <VoxelSectionWorld type="projects" />
          <div className="content-section split-section">
            <div className="section-heading scene-heading">
              <div>
                <span className="section-kicker">Project islands</span>
                <h2>Playable places for code, notes, and reproductions.</h2>
              </div>
            </div>
            <div className="project-list">
              {projects.map((project, index) => {
                const Icon = iconMap.projects;
                return (
                  <article className="project-row" key={project.name}>
                    <div className="project-index">{String(index + 1).padStart(2, '0')}</div>
                    <div>
                      <div className="card-topline">
                        <Icon size={18} />
                        <span>{project.role}</span>
                      </div>
                      <h3>{project.name}</h3>
                      <p>{project.summary}</p>
                    </div>
                    <a href={project.link} aria-label={`Open ${project.name}`}>
                      <ArrowUpRight size={20} />
                      <span>{project.year}</span>
                    </a>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section className="world-zone zone-papers" id="papers">
          <VoxelSectionWorld type="papers" />
          <div className="content-section papers-section">
            <div className="section-heading scene-heading">
              <div>
                <span className="section-kicker">Paper lanterns</span>
                <h2>Reserved slots for publications and reading notes.</h2>
              </div>
            </div>
            <div className="paper-grid">
              {publications.map((paper) => {
                const Icon = iconMap.papers;
                return (
                  <article className="info-card paper-card" key={paper.title}>
                    <div className="card-topline">
                      <Icon size={19} />
                      <span>{paper.venue}</span>
                    </div>
                    <h3>{paper.title}</h3>
                    <p>{paper.description}</p>
                    <time>{paper.year}</time>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section className="world-zone zone-contact" id="contact">
          <VoxelSectionWorld type="contact" />
          <div className="content-section contact-section">
            <div className="contact-panel">
              <div>
                <span className="section-kicker">Village gate</span>
                <h2>Open to collaboration, reproduction, and open source.</h2>
                <p>
                  Interests: {profile.interests.join(' / ')}. Internships: {profile.internships.join(' + ')}.
                </p>
              </div>
              <div className="contact-actions">
                <a className="primary-action" href={`mailto:${profile.email}`}>
                  <Mail size={18} />
                  {profile.email}
                </a>
                <a className="secondary-action" href={profile.github}>
                  <Github size={18} />
                  GitHub
                </a>
                <a className="secondary-action" href={profile.homepage}>
                  <Map size={18} />
                  Pages
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <Sprout size={17} />
        <span>
          Built as a living academic world for @{profile.handle}. Update the world by editing
          src/data/profile.js.
        </span>
      </footer>
    </div>
  );
}

export default App;
