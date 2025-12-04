import {optional, z} from 'zod'

const zodJob = z.object(
    {
        title: z.string(),
        description: z.string(),
        location: z.string(),
        requiredSkills: z.array(z.string()),
    }
)

const zodResume = z.object(
    {
        id: z.string(),
        companyName: z.string().optional(),
        jobTitle: z.string().optional(),
        imagePath: z.string(),
        resumePath: z.string(),
        feedback: zodFeedback,
    }
)

const zodFeedback = z.object({
    overallScore: z.number(),
    ATS: z.object({
        score: z.number(),
        tips: z.array(z.object({
            type: z.string("good" | "improve"),
            tip: z.string(),
        }))
    }),
    toneAndStyle: z.object({
        score: z.number(),
        tips: z.array(z.object({
            type: z.string("good" | "improve"),
            tip: z.string(),
            explanation: z.string()
        }))
    }),
    content: z.object({
        score: z.number(),
        tips: z.array(z.object({
            type: z.string("good" | "improve"),
            tip: z.string(),
            explanation: z.string()
        }))
    }),
    structure: z.object({
        score: z.number(),
        tips: z.array(z.object({
            type: z.string("good" | "improve"),
            tip: z.string(),
            explanation: z.string()
        }))
    }),
    skills: z.object({
        score: z.number(),
        tips: z.array(z.object({
            type: z.string("good" | "improve"),
            tip: z.string(),
            explanation: z.string()
        }))
    }),
})