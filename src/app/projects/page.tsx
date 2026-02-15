import "./projects.css";

export default function ProjectsPage() {
  return (
    <section className="hero-section">
      <div className="card-grid">
        <a className="card" href="/projects/let-it-jazz">
          <div
            className="card__background"
            style={{
              backgroundImage:
                "url(/images/projects/Letitjazz-main.png)",
            }}
          />
          <div className="card__content">
            <p className="card__category">AI Music</p>
            <h3 className="card__heading">Let it jazz</h3>
          </div>
        </a>
        <a className="card" href="/projects/dive-deep">
          <div
            className="card__background"
            style={{
              backgroundImage:
                "url(/images/projects/Divedeep-main.png)",
            }}
          />
          <div className="card__content">
            <p className="card__category">AI Artworks</p>
            <h3 className="card__heading">Beyond with Humanity</h3>
          </div>
        </a>
        <a className="card" href="/projects/nostalgia">
          <div
            className="card__background"
            style={{
              backgroundImage:
                "url(/images/projects/Noting-main.png)",
            }}
          />
          <div className="card__content">
            <p className="card__category">Virtual Brand</p>
            <h3 className="card__heading">Nostalgia</h3>
          </div>
        </a>
        <a className="card" href="/projects/moving">
          <div
            className="card__background"
            style={{
              backgroundImage:
                "url(/images/projects/Moving-main.png)",
            }}
          />
          <div className="card__content">
            <p className="card__category">Media Art</p>
            <h3 className="card__heading">Moving</h3>
          </div>
        </a>
        <a className="card" href="https://linkstash.vercel.app/" target="_blank" rel="noopener noreferrer">
          <div
            className="card__background"
            style={{
              backgroundImage:
                "url(/images/projects/Linkstash-main.png)",
            }}
          />
          <div className="card__content">
            <p className="card__category">SaaS</p>
            <h3 className="card__heading">LinkStash</h3>
          </div>
        </a>
      </div>
    </section>
  );
}
