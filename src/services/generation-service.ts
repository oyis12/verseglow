// import { authorizedFetch } from "./auth-service";

// type GenerateInsightInput = {
//   book: string;
//   chapter: string;
//   verse: string;
//   category: string;
//   regionalVoice: string;
//   country: string;
// };

// type GenerateInsightResponse = {
//   success: boolean;
//   message?: string;
//   data?: {
//     reference: string;
//     translation: string;
//     scripture: string;
//     explanation: {
//       id: number;
//       text: string;
//       category: string;
//       regionalVoice: string;
//       country: string;
//       aiGenerated: true;
//     };
//   };
// };

// export async function generateInsight(input: GenerateInsightInput) {
//   const response = await authorizedFetch("/api/verses/generate", {
//     method: "POST",
//     body: JSON.stringify(input),
//   });
//   const result = (await response.json()) as GenerateInsightResponse;

//   if (!response.ok || !result.success || !result.data) {
//     throw new Error(
//       result.message || "Unable to generate this insight right now.",
//     );
//   }

//   return result.data;
// }

import { authorizedFetch } from "./auth-service";
import type { UsageSnapshot } from "./usage-service";

type GenerateInsightInput = {
  book: string;
  chapter: string;
  verse: string;
  category: string;
  regionalVoice: string;
  country: string;
};

type GenerateInsightResponse = {
  success: boolean;
  message?: string;
  code?: string;
  usage?: UsageSnapshot;
  data?: {
    reference: string;
    translation: string;
    scripture: string;
    explanation: {
      id: number;
      text: string;
      category: string;
      regionalVoice: string;
      country: string;
      aiGenerated: true;
    };
  };
};

export class GenerateInsightError extends Error {
  code?: string;
  constructor(message: string, code?: string) {
    super(message);
    this.code = code;
  }
}

export async function generateInsight(input: GenerateInsightInput) {
  const response = await authorizedFetch("/api/verses/generate", {
    method: "POST",
    body: JSON.stringify(input),
  });
  const result = (await response.json()) as GenerateInsightResponse;

  if (!response.ok || !result.success || !result.data) {
    throw new GenerateInsightError(
      result.message || "Unable to generate this insight right now.",
      result.code,
    );
  }

  return { ...result.data, usage: result.usage };
}
