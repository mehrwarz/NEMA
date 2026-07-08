import { GraduationCap, Building2, Brain } from "lucide-react";
import { db } from "@/lib/db";
import { learningPaths } from "@/lib/db/schema";
import { asc, eq } from "drizzle-orm";

const iconMap: Record<string, React.ReactNode> = {
  "graduation-cap": <GraduationCap size={26} />,
  university: <Building2 size={26} />,
  brain: <Brain size={26} />,
};

export default async function EducationPaths() {
  let paths;
  try {
    paths = await db
      .select()
      .from(learningPaths)
      .where(eq(learningPaths.isActive, true))
      .orderBy(asc(learningPaths.sortOrder));
  } catch {
    // Fallback data if DB is unreachable
    paths = [
      { id: 1, title: "Primary Students", subtitle: "Grades 1-8", description: "Foundational subjects with fun interactive lessons, diagrams, and age-appropriate exercises.", icon: "graduation-cap", sortOrder: 1, isActive: true, createdAt: new Date() },
      { id: 2, title: "College Students", subtitle: "Undergraduate & Graduate", description: "Advanced topics, research resources, past exams, and academic references.", icon: "university", sortOrder: 2, isActive: true, createdAt: new Date() },
      { id: 3, title: "Self-Learners", subtitle: "Any Age, Any Pace", description: "Flexible, self-paced courses with video guides, practice tests, and certification prep.", icon: "brain", sortOrder: 3, isActive: true, createdAt: new Date() },
    ];
  }

  return (
    <section className="section section-alt" id="education-paths">
      <div className="section-inner">
        <div className="section-header">
          <h2>Education Tailored For You</h2>
          <p>
            We build paths for every stage of your educational journey.
          </p>
        </div>

        <div className="paths-grid">
          {paths.map((path, i) => (
            <div
              key={path.id}
              className={`path-card animate-in delay-${(i + 1) * 100}`}
            >
              <div className="path-card-icon">
                {iconMap[path.icon] ?? <GraduationCap size={26} />}
              </div>
              <h3>{path.title}</h3>
              {path.subtitle && (
                <div className="subtitle">{path.subtitle}</div>
              )}
              {path.description && <p>{path.description}</p>}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
