import {
  Calculator,
  Atom,
  FlaskConical,
  Dna,
  Code,
  Landmark,
  BookOpen,
  Wrench,
} from "lucide-react";
import { db } from "@/lib/db";
import { subjectAreas } from "@/lib/db/schema";
import { asc, eq } from "drizzle-orm";

const iconMap: Record<string, React.ReactNode> = {
  calculator: <Calculator size={22} />,
  atom: <Atom size={22} />,
  "flask-conical": <FlaskConical size={22} />,
  dna: <Dna size={22} />,
  code: <Code size={22} />,
  landmark: <Landmark size={22} />,
  "book-open": <BookOpen size={22} />,
  wrench: <Wrench size={22} />,
};

export default async function SubjectAreas() {
  let subjects;
  try {
    subjects = await db
      .select()
      .from(subjectAreas)
      .where(eq(subjectAreas.isActive, true))
      .orderBy(asc(subjectAreas.sortOrder));
  } catch {
    subjects = [
      { id: 1, title: "Mathematics", description: "Algebra, Calculus, Statistics & Geometry.", icon: "calculator", colorScheme: "blue", sortOrder: 1, isActive: true, createdAt: new Date() },
      { id: 2, title: "Physics", description: "Mechanics, Thermodynamics & Quantum.", icon: "atom", colorScheme: "purple", sortOrder: 2, isActive: true, createdAt: new Date() },
      { id: 3, title: "Chemistry", description: "Organic, Inorganic & Physical Chemistry.", icon: "flask-conical", colorScheme: "green", sortOrder: 3, isActive: true, createdAt: new Date() },
      { id: 4, title: "Biology", description: "Molecular Biology, Ecology & Genetics.", icon: "dna", colorScheme: "emerald", sortOrder: 4, isActive: true, createdAt: new Date() },
      { id: 5, title: "Computer Science", description: "Programming, Algorithms & Data Structures.", icon: "code", colorScheme: "indigo", sortOrder: 5, isActive: true, createdAt: new Date() },
      { id: 6, title: "History", description: "World History, Civilizations & Modern Era.", icon: "landmark", colorScheme: "amber", sortOrder: 6, isActive: true, createdAt: new Date() },
      { id: 7, title: "Literature", description: "Poetry, Prose, Drama & Literary Analysis.", icon: "book-open", colorScheme: "rose", sortOrder: 7, isActive: true, createdAt: new Date() },
      { id: 8, title: "Engineering", description: "Electrical, Mechanical & Civil Engineering.", icon: "wrench", colorScheme: "slate", sortOrder: 8, isActive: true, createdAt: new Date() },
    ];
  }

  return (
    <section className="section" id="subject-areas">
      <div className="section-inner">
        <div className="section-header">
          <h2>Explore Our Subject Areas</h2>
          <p>
            Dive into a world of knowledge across disciplines, all completely
            free and open-source.
          </p>
        </div>

        <div className="subjects-grid">
          {subjects.map((subject) => (
            <div
              key={subject.id}
              className={`subject-card ${subject.colorScheme}`}
            >
              <div className="subject-card-icon">
                {iconMap[subject.icon] ?? <BookOpen size={22} />}
              </div>
              <h3>{subject.title}</h3>
              {subject.description && <p>{subject.description}</p>}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
