const HF_API = "https://api-inference.huggingface.co/models";

interface HFSummarizeResponse {
  summary_text: string;
}

interface HFQAResponse {
  answer: string;
  score: number;
}

async function hfPost<T>(model: string, payload: object, retries = 2): Promise<T> {
  const res = await fetch(`${HF_API}/${model}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (res.status === 503 && retries > 0) {
    await new Promise((r) => setTimeout(r, 3000));
    return hfPost<T>(model, payload, retries - 1);
  }

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`HF API error (${res.status}): ${err}`);
  }

  return res.json();
}

export async function summarizeText(text: string): Promise<string> {
  const truncated = text.slice(0, 2000);
  try {
    const result = await hfPost<HFSummarizeResponse[]>(
      "sshleifer/distilbart-cnn-12-6",
      { inputs: truncated, parameters: { max_length: 200, min_length: 50 } }
    );
    return result[0]?.summary_text ?? "";
  } catch {
    // fallback model
    const result = await hfPost<HFSummarizeResponse[]>(
      "facebook/bart-large-cnn",
      { inputs: truncated, parameters: { max_length: 200, min_length: 50 } }
    );
    return result[0]?.summary_text ?? "";
  }
}

export async function answerQuestion(question: string, context: string): Promise<HFQAResponse> {
  const result = await hfPost<HFQAResponse>(
    "distilbert/distilbert-base-cased-distilled-squad",
    { inputs: { question, context: context.slice(0, 2000) } }
  );
  return result;
}
