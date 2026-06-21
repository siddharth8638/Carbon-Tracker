const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const GEMINI_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

/**
 * Build a structured summary of the user's week from raw logs.
 * Keeps the Gemini prompt compact and numeric rather than dumping raw logs.
 */
function summarizeLogs(logs) {
  const summary = { transport: [], energy: [], food: [] };
  for (const log of logs) {
    summary[log.type]?.push({
      subtype: log.subtype,
      value: log.value,
      co2Kg: log.co2Kg,
      date: log.date,
    });
  }
  return summary;
}

/**
 * Ask Gemini for a personalized, specific insight based on the user's
 * actual logged week — not generic eco-tips.
 * @param {Array} logs - this week's log entries
 * @param {number} totalCO2 - total kg CO2 for the period
 * @returns {Promise<{insight: string, suggestion: string, potentialSavingKg: number}>}
 */
export async function getPersonalizedInsight(logs, totalCO2) {
  if (!GEMINI_API_KEY) {
    throw new Error(
      "Missing VITE_GEMINI_API_KEY — add it to your .env file (get one free at aistudio.google.com/app/apikey)"
    );
  }

  const summary = summarizeLogs(logs);

  const prompt = `You are a carbon footprint coach analyzing one user's actual logged activity for the past week. Be specific and reference their real numbers — never give generic advice that could apply to anyone.

User's logged data this week (JSON):
${JSON.stringify(summary, null, 2)}

Total CO2 this week: ${totalCO2} kg

Respond with ONLY valid JSON, no markdown formatting, no backticks, in exactly this shape:
{
  "insight": "1-2 sentences identifying the single biggest contributor in THEIR data, citing the actual number",
  "suggestion": "1 concrete, specific swap they could make next week, tied to their logged habit (e.g. naming the specific trip pattern or appliance use)",
  "potentialSavingKg": <number, estimated kg CO2 saved per week if they make the suggested swap>
}

Keep total length under 60 words. Be encouraging but concrete — no vague phrases like "consider reducing" without saying exactly what to change.`;

  const response = await fetch(`${GEMINI_URL}?key=${GEMINI_API_KEY}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.4,
        maxOutputTokens: 1024,
        thinkingConfig: {
          thinkingBudget: 0,
        },
      },
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Gemini API error: ${response.status} ${errText}`);
  }

  const data = await response.json();
  const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || "";

  // Defensive parsing — strip any stray markdown fences if the model adds them.
  const cleaned = rawText.replace(/```json|```/g, "").trim();

  try {
    return JSON.parse(cleaned);
  } catch (err) {
    console.error("Failed to parse Gemini response:", rawText);
    return {
      insight: "Couldn't generate a personalized insight right now.",
      suggestion: "Try logging a few more entries and refresh.",
      potentialSavingKg: 0,
    };
  }
}
