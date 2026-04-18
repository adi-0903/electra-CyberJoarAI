import { SYSTEM_PROMPT } from '../data/seedData';

const GROQ_BASE_URL = 'https://api.groq.com/openai/v1/chat/completions';
const MODEL = 'llama-3.3-70b-versatile';

export const callClaude = async (userMessage, onChunk) => {
  const apiKey = import.meta.env.VITE_GROQ_API_KEY;
  if (!apiKey) {
    throw new Error(
      'Groq API key not configured. Create a .env file with VITE_GROQ_API_KEY=your_key'
    );
  }

  const useStreaming = typeof onChunk === 'function';

  const response = await fetch(GROQ_BASE_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 1024,
      temperature: 0.7,
      stream: useStreaming,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userMessage },
      ],
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(
      err.error?.message || `API request failed with status ${response.status}`
    );
  }

  // Non-streaming: return full response
  if (!useStreaming) {
    const data = await response.json();
    return data.choices?.[0]?.message?.content || 'No response generated.';
  }

  // Streaming: parse SSE chunks
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let fullText = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const chunk = decoder.decode(value, { stream: true });
    const lines = chunk.split('\n');

    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const data = line.slice(6).trim();
        if (data === '[DONE]') continue;
        try {
          const parsed = JSON.parse(data);
          const delta = parsed.choices?.[0]?.delta?.content;
          if (delta) {
            fullText += delta;
            onChunk(fullText);
          }
        } catch {
          // Skip non-JSON SSE lines
        }
      }
    }
  }

  return fullText;
};
