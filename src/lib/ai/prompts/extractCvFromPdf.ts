import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic()

// ─── Output schema ────────────────────────────────────────────────────────────

export interface PersonalInfo {
  name: string
  email?: string
  phone?: string
  location?: string
  linkedin?: string
  github?: string
  portfolio?: string
  website?: string
  summary?: string
}

export interface WorkExperience {
  company: string
  title: string
  location?: string
  start_date: string // "YYYY-MM" or "YYYY"
  end_date?: string // "YYYY-MM" or "YYYY", omit if current
  current: boolean
  description?: string
  achievements: string[]
}

export interface Education {
  institution: string
  degree: string
  field?: string
  location?: string
  start_date?: string
  end_date?: string
  grade?: string
  description?: string
}

export interface SkillGroup {
  category: string
  items: string[]
}

export interface Language {
  language: string
  level: string // "Native" | "Fluent" | "Professional" | "Conversational" | "Basic"
}

export interface Certification {
  name: string
  issuer?: string
  date?: string
  url?: string
}

export interface Project {
  name: string
  description: string
  technologies?: string[]
  url?: string
  date?: string
}

export interface MasterProfileData {
  personal: PersonalInfo
  experience: WorkExperience[]
  education: Education[]
  skills: SkillGroup[]
  languages: Language[]
  certifications: Certification[]
  projects: Project[]
}

// ─── Tool definition ──────────────────────────────────────────────────────────

const extractionTool: Anthropic.Tool = {
  name: 'extract_cv_data',
  description: 'Extract structured professional profile data from a CV/resume.',
  input_schema: {
    type: 'object' as const,
    required: ['personal', 'experience', 'education', 'skills', 'languages', 'certifications', 'projects'],
    properties: {
      personal: {
        type: 'object',
        required: ['name'],
        properties: {
          name: { type: 'string' },
          email: { type: 'string' },
          phone: { type: 'string' },
          location: { type: 'string' },
          linkedin: { type: 'string' },
          github: { type: 'string' },
          portfolio: { type: 'string' },
          website: { type: 'string' },
          summary: { type: 'string' },
        },
      },
      experience: {
        type: 'array',
        items: {
          type: 'object',
          required: ['company', 'title', 'start_date', 'current', 'achievements'],
          properties: {
            company: { type: 'string' },
            title: { type: 'string' },
            location: { type: 'string' },
            start_date: { type: 'string' },
            end_date: { type: 'string' },
            current: { type: 'boolean' },
            description: { type: 'string' },
            achievements: { type: 'array', items: { type: 'string' } },
          },
        },
      },
      education: {
        type: 'array',
        items: {
          type: 'object',
          required: ['institution', 'degree'],
          properties: {
            institution: { type: 'string' },
            degree: { type: 'string' },
            field: { type: 'string' },
            location: { type: 'string' },
            start_date: { type: 'string' },
            end_date: { type: 'string' },
            grade: { type: 'string' },
            description: { type: 'string' },
          },
        },
      },
      skills: {
        type: 'array',
        items: {
          type: 'object',
          required: ['category', 'items'],
          properties: {
            category: { type: 'string' },
            items: { type: 'array', items: { type: 'string' } },
          },
        },
      },
      languages: {
        type: 'array',
        items: {
          type: 'object',
          required: ['language', 'level'],
          properties: {
            language: { type: 'string' },
            level: { type: 'string' },
          },
        },
      },
      certifications: {
        type: 'array',
        items: {
          type: 'object',
          required: ['name'],
          properties: {
            name: { type: 'string' },
            issuer: { type: 'string' },
            date: { type: 'string' },
            url: { type: 'string' },
          },
        },
      },
      projects: {
        type: 'array',
        items: {
          type: 'object',
          required: ['name', 'description'],
          properties: {
            name: { type: 'string' },
            description: { type: 'string' },
            technologies: { type: 'array', items: { type: 'string' } },
            url: { type: 'string' },
            date: { type: 'string' },
          },
        },
      },
    },
  },
}

// ─── System prompt ────────────────────────────────────────────────────────────

const SYSTEM_PROMPT = `You are a precise CV data extractor. Your task is to extract structured professional profile information from a CV or resume document.

STRICT RULES:
- Extract ONLY information explicitly present in the document. Never infer, invent, or add data not present.
- If a field is not present in the CV, omit it (do not guess or fabricate).
- Preserve the original language of the content (do not translate).
- For dates, use "YYYY-MM" format when month is available, "YYYY" when only year is present.
- For achievements/bullet points: extract them verbatim or as close as possible. Preserve specificity (numbers, percentages, technologies, company names).
- Group skills by category as they appear in the CV (e.g. "Programming Languages", "Frameworks", "Tools"). If no categories exist, group logically.
- You MUST call the extract_cv_data tool with the extracted data.`

// ─── Main function ────────────────────────────────────────────────────────────

export async function extractCvFromPdf(pdfBase64: string): Promise<MasterProfileData> {
  const response = await client.messages.create({
    model: 'claude-sonnet-4-5',
    max_tokens: 4096,
    system: SYSTEM_PROMPT,
    tools: [extractionTool],
    tool_choice: { type: 'any' },
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'document',
            source: {
              type: 'base64',
              media_type: 'application/pdf',
              data: pdfBase64,
            },
          },
          {
            type: 'text',
            text: 'Extract all professional profile data from this CV using the extract_cv_data tool.',
          },
        ],
      },
    ],
  })

  const toolUse = response.content.find((block) => block.type === 'tool_use')
  if (!toolUse || toolUse.type !== 'tool_use') {
    throw new Error('Model did not call the extraction tool')
  }

  return toolUse.input as MasterProfileData
}
