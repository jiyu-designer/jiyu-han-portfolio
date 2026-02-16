import Image from "next/image";
import "./projects.css";

export default function ProjectsPage() {
  const projects = [
    { href: "/projects/let-it-jazz", category: "AI Music", heading: "Let it jazz", image: "/images/projects/Letitjazz-main.png" },
    { href: "/projects/dive-deep", category: "AI Artworks", heading: "Beyond with Humanity", image: "/images/projects/Divedeep-main.png" },
    { href: "/projects/moving", category: "Media Art", heading: "Moving", image: "/images/projects/Moving-main.png" },
    { href: "/projects/nostalgia", category: "Virtual Brand", heading: "Nostalgia", image: "/images/projects/Noting-main.png" },
    { href: "https://linkstash.vercel.app/", category: "SaaS", heading: "LinkStash", image: "/images/projects/Linkstash-main.png", external: true },
  ];

  return (
    <section className="hero-section">
      <div className="card-grid">
        {projects.map((project) => (
          <a
            key={project.heading}
            className="card"
            href={project.href}
            {...(project.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
          >
            <div className="card__background">
              <Image
                src={project.image}
                alt={project.heading}
                fill
                className="object-cover"
                sizes="(max-width: 539px) 100vw, (max-width: 959px) 50vw, 20vw"
              />
            </div>
            <div className="card__content">
              <p className="card__category">{project.category}</p>
              <h3 className="card__heading">{project.heading}</h3>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}
