import { describe, it, expect } from 'vitest'
import { JobDescriptionSchema } from './jobDescriptionSchema'

describe('JobDescriptionSchema', () => {
  it('parses a complete job posting', () => {
    const result = JobDescriptionSchema.parse({
      title: 'Senior Frontend Engineer',
      company: 'Acme Corp',
      location: 'Remote',
      employment_type: 'full_time',
      language: 'en',
      summary: 'Build great UIs.',
      requirements: ['5+ years React', 'TypeScript'],
      responsibilities: ['Lead frontend architecture'],
      nice_to_have: ['GraphQL experience'],
      tone: 'startup',
    })

    expect(result.title).toBe('Senior Frontend Engineer')
    expect(result.language).toBe('en')
    expect(result.requirements).toHaveLength(2)
  })

  it('parses with only required fields', () => {
    const result = JobDescriptionSchema.parse({
      title: 'Backend Developer',
      company: 'Startup SRL',
      language: 'it',
      requirements: [],
      responsibilities: [],
    })

    expect(result.title).toBe('Backend Developer')
    expect(result.nice_to_have).toEqual([])
  })

  it('rejects missing required title', () => {
    expect(() =>
      JobDescriptionSchema.parse({
        company: 'Acme',
        language: 'en',
        requirements: [],
        responsibilities: [],
      })
    ).toThrow()
  })

  it('rejects missing required company', () => {
    expect(() =>
      JobDescriptionSchema.parse({
        title: 'Engineer',
        language: 'en',
        requirements: [],
        responsibilities: [],
      })
    ).toThrow()
  })
})
