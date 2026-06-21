import { useState } from "react";
import { Sparkles, Loader2 } from "lucide-react";
import { getPersonalizedInsight } from "../utils/geminiInsights";

export default function InsightCard({ logs, totalCO2 }) {
  const [insight, setInsight] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleGenerate() {
    if (logs.length === 0) {
      setError("Log a few activities first, then generate insights.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const result = await getPersonalizedInsight(logs, totalCO2);
      setInsight(result);
    } catch (err) {
      setError(err.message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="insight-card">
      <h3>
        <Sparkles size={18} /> Personalized insight
      </h3>

      {!insight && !loading && (
        <button onClick={handleGenerate} className="insight-btn">
          Generate this week's insight
        </button>
      )}

      {loading && (
        <p className="insight-loading">
          <Loader2 className="spin" size={16} /> Analyzing your week...
        </p>
      )}

      {error && <p className="form-error">{error}</p>}

      {insight && (
        <div className="insight-result">
          <p className="insight-text">{insight.insight}</p>
          <p className="insight-suggestion">💡 {insight.suggestion}</p>
          {insight.potentialSavingKg > 0 && (
            <p className="insight-saving">
              Potential saving: <strong>{insight.potentialSavingKg} kg CO2/week</strong>
            </p>
          )}
          <button onClick={handleGenerate} className="insight-refresh">
            Refresh
          </button>
        </div>
      )}
    </section>
  );
}
