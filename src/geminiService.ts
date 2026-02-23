
import { Submission } from "./types";

// AI features disabled as requested

export const analyzeSubmission = async (submission: Submission): Promise<string> => {
  // AI analysis disabled - returning placeholder text
  return "AI analysis feature is currently disabled. Please enable Gemini API to use this feature.";
};

export const improveAbstract = async (text: string): Promise<string> => {
  // AI improvement disabled - returning original text
  return text;
};
