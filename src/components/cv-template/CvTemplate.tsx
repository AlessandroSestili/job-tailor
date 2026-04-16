import type { TailoredCvData } from '@/lib/ai/_shared/tailoredCvSchema'

interface CvTemplateProps {
  data: TailoredCvData
}

export function CvTemplate({ data }: CvTemplateProps) {
  const { personal, summary, experience, education, skills, languages, certifications, projects } = data

  return (
    <div
      className="bg-white text-gray-900 p-10 max-w-[794px] mx-auto"
      style={{ fontFamily: 'Georgia, serif', fontSize: '10pt', lineHeight: 1.5 }}
    >
      {/* Header */}
      <div className="border-b-2 border-gray-900 pb-4 mb-6">
        <h1 style={{ fontSize: '22pt', fontWeight: 700, fontFamily: 'Arial, sans-serif', letterSpacing: '-0.02em' }}>
          {personal.name}
        </h1>
        <div className="flex flex-wrap gap-3 mt-2 text-gray-600" style={{ fontSize: '9pt', fontFamily: 'Arial, sans-serif' }}>
          {personal.email && <span>{personal.email}</span>}
          {personal.phone && <><span>·</span><span>{personal.phone}</span></>}
          {personal.location && <><span>·</span><span>{personal.location}</span></>}
          {personal.linkedin && <><span>·</span><span>{personal.linkedin}</span></>}
          {personal.github && <><span>·</span><span>{personal.github}</span></>}
        </div>
      </div>

      {/* Summary */}
      {summary && (
        <Section title="Profilo">
          <p className="text-gray-700">{summary}</p>
        </Section>
      )}

      {/* Experience */}
      {experience.length > 0 && (
        <Section title="Esperienza">
          {experience.map((exp, i) => (
            <div key={i} className={i > 0 ? 'mt-4' : ''}>
              <div className="flex justify-between items-baseline">
                <span style={{ fontWeight: 700, fontFamily: 'Arial, sans-serif' }}>{exp.company}</span>
                <span className="text-gray-500" style={{ fontSize: '9pt' }}>
                  {exp.start_date} — {exp.current ? 'Presente' : exp.end_date}
                </span>
              </div>
              <div className="text-gray-600 italic" style={{ fontSize: '9.5pt' }}>{exp.title}</div>
              {exp.achievements.length > 0 && (
                <ul className="mt-1.5 space-y-1">
                  {exp.achievements.map((a, j) => (
                    <li key={j} className="flex gap-2 text-gray-700">
                      <span className="flex-shrink-0 mt-0.5">•</span>
                      <span>{a}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </Section>
      )}

      {/* Education */}
      {education.length > 0 && (
        <Section title="Formazione">
          {education.map((edu, i) => (
            <div key={i} className={i > 0 ? 'mt-3' : ''}>
              <div className="flex justify-between items-baseline">
                <span style={{ fontWeight: 700, fontFamily: 'Arial, sans-serif' }}>{edu.institution}</span>
                {edu.end_date && <span className="text-gray-500" style={{ fontSize: '9pt' }}>{edu.end_date}</span>}
              </div>
              <div className="text-gray-600 italic" style={{ fontSize: '9.5pt' }}>
                {edu.degree}{edu.field ? ` — ${edu.field}` : ''}
              </div>
              {edu.grade && <div className="text-gray-500 text-sm">Voto: {edu.grade}</div>}
            </div>
          ))}
        </Section>
      )}

      {/* Skills */}
      {skills.length > 0 && (
        <Section title="Competenze">
          {skills.map((group, i) => (
            <div key={i} className="flex gap-2 mt-1">
              <span style={{ fontWeight: 600, fontFamily: 'Arial, sans-serif', minWidth: '120px' }}>
                {group.category}:
              </span>
              <span className="text-gray-700">{group.items.join(', ')}</span>
            </div>
          ))}
        </Section>
      )}

      {/* Languages */}
      {languages.length > 0 && (
        <Section title="Lingue">
          <div className="flex flex-wrap gap-4">
            {languages.map((l, i) => (
              <span key={i}>
                <span style={{ fontWeight: 600, fontFamily: 'Arial, sans-serif' }}>{l.language}</span>
                {' '}<span className="text-gray-600">— {l.level}</span>
              </span>
            ))}
          </div>
        </Section>
      )}

      {/* Certifications */}
      {certifications.length > 0 && (
        <Section title="Certificazioni">
          {certifications.map((c, i) => (
            <div key={i} className="mt-1">
              <span style={{ fontWeight: 600, fontFamily: 'Arial, sans-serif' }}>{c.name}</span>
              {c.issuer && <span className="text-gray-600"> — {c.issuer}</span>}
              {c.date && <span className="text-gray-500"> ({c.date})</span>}
            </div>
          ))}
        </Section>
      )}

      {/* Projects */}
      {projects.length > 0 && (
        <Section title="Progetti">
          {projects.map((p, i) => (
            <div key={i} className={i > 0 ? 'mt-3' : ''}>
              <span style={{ fontWeight: 700, fontFamily: 'Arial, sans-serif' }}>{p.name}</span>
              {p.technologies && (
                <span className="text-gray-500 text-sm"> — {p.technologies.join(', ')}</span>
              )}
              <p className="text-gray-700 mt-0.5">{p.description}</p>
            </div>
          ))}
        </Section>
      )}
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-5">
      <h2
        className="uppercase tracking-widest border-b border-gray-300 pb-1 mb-3"
        style={{ fontSize: '8pt', fontWeight: 700, fontFamily: 'Arial, sans-serif', letterSpacing: '0.15em', color: '#374151' }}
      >
        {title}
      </h2>
      {children}
    </div>
  )
}
