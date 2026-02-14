import Link from "next/link";

const projects = [
  {
    id: 1,
    category: "Branding",
    title: "Brand Identity Design",
    image: "https://images.unsplash.com/photo-1557177324-56c542165309?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80",
    href: "/projects/project-b",
  },
  {
    id: 2,
    category: "UI/UX",
    title: "Mobile App Design",
    image: "https://images.unsplash.com/photo-1557187666-4fd70cf76254?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=60",
    href: "/projects/project-b",
  },
  {
    id: 3,
    category: "Web Design",
    title: "E-commerce Platform",
    image: "https://images.unsplash.com/photo-1556680262-9990363a3e6d?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=60",
    href: "/projects/project-b",
  },
  {
    id: 4,
    category: "Illustration",
    title: "Digital Art Collection",
    image: "https://images.unsplash.com/photo-1557004396-66e4174d7bf6?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=60",
    href: "/projects/project-b",
  },
];

export default function ProjectsPage() {
  return (
    <section className="min-h-screen bg-[#1a1a2e] px-8 py-16 font-[family-name:var(--font-montserrat)]">
      <div className="mx-auto max-w-6xl">
        <Link
          href="/"
          className="mb-12 inline-block text-white/60 transition-colors hover:text-white"
        >
          ← Back to Home
        </Link>

        <h1 className="mb-12 text-4xl font-bold text-white md:text-5xl">
          Projects
        </h1>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-2">
          {projects.map((project) => (
            <Link
              key={project.id}
              href={project.href}
              className="group relative h-[400px] overflow-hidden rounded-2xl"
            >
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
                style={{ backgroundImage: `url(${project.image})` }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute bottom-0 left-0 p-8">
                <p className="mb-2 text-sm font-medium uppercase tracking-wider text-white/70">
                  {project.category}
                </p>
                <h3 className="text-2xl font-bold text-white transition-transform duration-300 group-hover:translate-x-2">
                  {project.title}
                </h3>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
