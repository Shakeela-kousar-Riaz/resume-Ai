import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export interface AnalysisResult {
  overallScore: number;
  grammarImprovements: {
    mistakes: string[];
    corrections: { original: string; improved: string }[];
  };
  atsOptimization: {
    missingKeywords: string[];
    formattingIssues: string[];
    sectionOrderImprovements: string;
  };
  skillGapAnalysis: {
    missingOrWeakSkills: string[];
    suggestions: string[];
  };
  sectionFeedback: {
    professionalSummary: string;
    skills: string;
    experience: string;
    education: string;
  };
  improvedSummary: string;
  sevenDayActionPlan: { day: number; task: string }[];
}

export async function analyzeResume(
  resumeText: string, 
  targetRole: string, 
  experienceLevel: string
): Promise<AnalysisResult> {
  const model = "gemini-3-flash-preview";
  
  const truncatedText = resumeText.slice(0, 15000);
  
  const prompt = `
    You are a professional Resume Analyzer, ATS Expert, and Career Coach.
    Analyze the user's resume based on the target job role and experience level provided.
    
    USER INPUT:
    Resume Text: ${truncatedText}
    Target Job Role: ${targetRole}
    Experience Level: ${experienceLevel}

    INSTRUCTIONS:
    Analyze based on:
    - Grammar and language accuracy
    - Professional tone and clarity
    - ATS compatibility
    - Relevance to the target job role
    - Skills strength and gaps

    Provide the response strictly as a JSON object matching the schema.
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: [{ parts: [{ text: prompt }] }],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            overallScore: { type: Type.NUMBER },
            grammarImprovements: {
              type: Type.OBJECT,
              properties: {
                mistakes: { type: Type.ARRAY, items: { type: Type.STRING } },
                corrections: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      original: { type: Type.STRING },
                      improved: { type: Type.STRING }
                    },
                    required: ["original", "improved"]
                  }
                }
              },
              required: ["mistakes", "corrections"]
            },
            atsOptimization: {
              type: Type.OBJECT,
              properties: {
                missingKeywords: { type: Type.ARRAY, items: { type: Type.STRING } },
                formattingIssues: { type: Type.ARRAY, items: { type: Type.STRING } },
                sectionOrderImprovements: { type: Type.STRING }
              },
              required: ["missingKeywords", "formattingIssues", "sectionOrderImprovements"]
            },
            skillGapAnalysis: {
              type: Type.OBJECT,
              properties: {
                missingOrWeakSkills: { type: Type.ARRAY, items: { type: Type.STRING } },
                suggestions: { type: Type.ARRAY, items: { type: Type.STRING } }
              },
              required: ["missingOrWeakSkills", "suggestions"]
            },
            sectionFeedback: {
              type: Type.OBJECT,
              properties: {
                professionalSummary: { type: Type.STRING },
                skills: { type: Type.STRING },
                experience: { type: Type.STRING },
                education: { type: Type.STRING }
              },
              required: ["professionalSummary", "skills", "experience", "education"]
            },
            improvedSummary: { type: Type.STRING },
            sevenDayActionPlan: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  day: { type: Type.NUMBER },
                  task: { type: Type.STRING }
                },
                required: ["day", "task"]
              }
            }
          },
          required: [
            "overallScore", 
            "grammarImprovements", 
            "atsOptimization", 
            "skillGapAnalysis", 
            "sectionFeedback", 
            "improvedSummary", 
            "sevenDayActionPlan"
          ]
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("Empty AI response");
    return JSON.parse(text) as AnalysisResult;
  } catch (error) {
    console.error("Resume Analysis Error:", error);
    throw new Error("Failed to analyze resume. Please try again.");
  }
}
