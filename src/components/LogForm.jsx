import { useState } from "react";
import { EMISSION_FACTORS } from "../utils/carbonCalc";
import { addLog } from "../firebase/logsService";

const TYPES = ["transport", "energy", "food"];

export default function LogForm({ uid }) {
  const [type, setType] = useState("transport");
  const [subtype, setSubtype] = useState(
    Object.keys(EMISSION_FACTORS.transport)[0]
  );
  const [value, setValue] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const subtypeOptions = EMISSION_FACTORS[type];

  function handleTypeChange(newType) {
    setType(newType);
    setSubtype(Object.keys(EMISSION_FACTORS[newType])[0]);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!value || Number(value) <= 0) {
      setError("Enter a value greater than 0");
      return;
    }
    setError("");
    setSubmitting(true);
    try {
      const today = new Date().toISOString().split("T")[0];
      await addLog(uid, { type, subtype, value, date: today });
      setValue("");
    } catch (err) {
      setError("Couldn't save — try again");
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="log-form" onSubmit={handleSubmit}>
      <div className="type-tabs">
        {TYPES.map((t) => (
          <button
            type="button"
            key={t}
            className={t === type ? "tab active" : "tab"}
            onClick={() => handleTypeChange(t)}
          >
            {t}
          </button>
        ))}
      </div>

      <label>
        Activity
        <select value={subtype} onChange={(e) => setSubtype(e.target.value)}>
          {Object.entries(subtypeOptions).map(([key, { label }]) => (
            <option key={key} value={key}>
              {label}
            </option>
          ))}
        </select>
      </label>

      <label>
        {subtypeOptions[subtype].unit === "meal" ? "Number of meals" : `Amount (${subtypeOptions[subtype].unit})`}
        <input
          type="number"
          min="0"
          step="0.1"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={`e.g. ${subtypeOptions[subtype].unit === "meal" ? "2" : "10"}`}
        />
      </label>

      {error && <p className="form-error">{error}</p>}

      <button type="submit" disabled={submitting} className="submit-btn">
        {submitting ? "Saving..." : "Log entry"}
      </button>
    </form>
  );
}
