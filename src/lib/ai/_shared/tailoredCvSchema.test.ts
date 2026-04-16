import { describe, it, expect } from 'vitest'
import { TailoredCvSchema } from './tailoredCvSchema'

describe('TailoredCvSchema', () => {
  it('parses a complete tailored CV', () => {
    const result = TailoredCvSchema.parse({
      personal: {
        name: 'Mario Rossi',
        email: 'mario@example.com',
        location: 'Milan, Italy',
      },
      summary: 'Experienced engineer focused on React and TypeScript.',
      experience: [
        {
          company: 'Acme Corp',
          title: 'Frontend Engineer',
          start_date: '2021-03',
          current: true,
          achievements: ['Reduced bundle size by 40%'],
        },
      ],
      education: [
        {
          institution: 'Politecnico di Milano',
          degree: 'MSc Computer Science',
        },
      ],
      skills: [{ category: 'Frontend', items: ['React', 'TypeScript'] }],
      languages: [{ language: 'Italian', level: 'Native' }],
    })

    expect(result.personal.name).toBe('Mario Rossi')
    expect(result.experience).toHaveLength(1)
    expect(result.skills[0].items).toContain('React')
  })

  it('parses with empty optional arrays', () => {
    const result = TailoredCvSchema.parse({
      personal: { name: 'Test User' },
      experience: [],
      education: [],
      skills: [],
      languages: [],
    })

    expect(result.certifications).toEqual([])
    expect(result.projects).toEqual([])
  })

  it('rejects missing personal.name', () => {
    expect(() =>
      TailoredCvSchema.parse({
        personal: {},
        experience: [],
        education: [],
        skills: [],
        languages: [],
      })
    ).toThrow()
  })
})
