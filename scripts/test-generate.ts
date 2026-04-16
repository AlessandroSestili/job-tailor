import { extractJobFromText } from '../src/lib/ai/prompts/extractJobFromText'
import { generateTailoredCv } from '../src/lib/ai/prompts/generateTailoredCv'
import { generateCoverLetter } from '../src/lib/ai/prompts/generateCoverLetter'
import type { MasterProfileData } from '../src/lib/ai/_shared/masterProfileSchema'

// Minimal fixture profile — replace with real extractCvFromPdf output when fixtures available
const SAMPLE_PROFILE: MasterProfileData = {
  personal: {
    name: 'Mario Rossi',
    email: 'mario.rossi@example.com',
    location: 'Milan, Italy',
    linkedin: 'linkedin.com/in/mariorossi',
    github: 'github.com/mariorossi',
  },
  experience: [
    {
      company: 'Startup XYZ',
      title: 'Frontend Developer',
      start_date: '2021-03',
      current: true,
      achievements: [
        'Built the main dashboard from scratch using React and TypeScript',
        'Reduced page load time by 35% through code splitting and lazy loading',
        'Mentored 2 junior developers on React best practices',
        'Collaborated with UX team to implement a new design system',
      ],
    },
    {
      company: 'Agency ABC',
      title: 'Junior Web Developer',
      start_date: '2019-06',
      end_date: '2021-02',
      current: false,
      achievements: [
        'Developed 10+ client websites using React and vanilla JavaScript',
        'Integrated REST APIs for e-commerce and CMS platforms',
      ],
    },
  ],
  education: [
    {
      institution: 'Politecnico di Milano',
      degree: 'BSc Computer Science',
      end_date: '2019',
    },
  ],
  skills: [
    {
      category: 'Frontend',
      items: ['React', 'TypeScript', 'Next.js', 'Tailwind CSS', 'HTML/CSS'],
    },
    {
      category: 'Tools & APIs',
      items: ['Git', 'REST APIs', 'Figma', 'Webpack', 'Vite'],
    },
  ],
  languages: [
    { language: 'Italian', level: 'Native' },
    { language: 'English', level: 'Fluent' },
  ],
  certifications: [],
  projects: [
    {
      name: 'Open Source Component Library',
      description: 'A React component library with 20+ accessible components, 500+ GitHub stars.',
      technologies: ['React', 'TypeScript', 'Storybook'],
      url: 'github.com/mariorossi/ui-lib',
    },
  ],
}

const SAMPLE_JOB = `
Senior Frontend Engineer — Acme Corp (Remote)

We're looking for a Senior Frontend Engineer to help build our SaaS platform.

Requirements:
- 5+ years React and TypeScript
- Performance optimization experience
- REST API integration
- Team collaboration

Nice to have:
- Next.js experience
- Mentoring experience
`

async function main() {
  console.log('Step 1: Extracting job description...\n')
  const job = await extractJobFromText(SAMPLE_JOB)
  console.log('Job:', JSON.stringify(job, null, 2))

  console.log('\nStep 2: Generating tailored CV...\n')
  const tailoredCv = await generateTailoredCv(SAMPLE_PROFILE, job)
  console.log('Tailored CV:', JSON.stringify(tailoredCv, null, 2))

  console.log('\nStep 3: Generating cover letter...\n')
  const coverLetter = await generateCoverLetter(SAMPLE_PROFILE, job)
  console.log('\n=== COVER LETTER ===\n')
  console.log(coverLetter)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
