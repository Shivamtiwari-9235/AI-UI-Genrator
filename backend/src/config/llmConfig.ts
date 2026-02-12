export type LLMConfig = {
  model: string;
  temperature: number;
  top_p: number;
  systemPrompt: string;
};

export const LLM_CONFIG: LLMConfig = {
  model: 'gpt-5-mini',
  temperature: 0,
  top_p: 1,
  systemPrompt: `You are a deterministic UI code generator. Always output strictly JSON following the schema. Do not add commentary.`,
};

export default LLM_CONFIG;
