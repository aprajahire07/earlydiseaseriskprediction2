import { DiseasePredictionItem } from '../types';

/**
 * Cleanly format disease/condition names:
 * E.g., 'heart_disease' -> 'Heart Disease'
 * Preserves existing emojis, titles, and abbreviations.
 */
export function formatDiseaseName(rawName: string): string {
  if (!rawName) return 'Condition';
  const trimmed = rawName.trim();

  // If already formatted with emojis or spaces (e.g. "🫀 Coronary Heart Disease" or "Type-2 Diabetes")
  if (/[A-Z]/.test(trimmed) && trimmed.includes(' ')) {
    return trimmed;
  }

  // Handle snake_case or kebab-case
  return trimmed
    .replace(/[_-]+/g, ' ')
    .split(' ')
    .map((word) => {
      if (word.toLowerCase() === 'bmi') return 'BMI';
      if (word.toLowerCase() === 'bp') return 'Blood Pressure';
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(' ');
}

/**
 * Standardized risk category derived purely from documented display thresholds:
 * < 30%: Low Risk
 * 30% - 65%: Moderate Risk
 * > 65%: High Risk
 */
export function getRiskCategoryFromPercentage(percentage: number): 'Low' | 'Moderate' | 'High' {
  if (percentage >= 65) return 'High';
  if (percentage >= 30) return 'Moderate';
  return 'Low';
}

/**
 * Safe normalization layer between raw Render backend response and UI.
 *
 * Guaranteed Rules:
 * 1. Reads actual prediction fields from Render.
 * 2. Preserves every disease/condition.
 * 3. Converts probabilities to percentages ONLY if fractions (< 1.0).
 * 4. Never multiplies an already-percentage value.
 * 5. Never invents missing values.
 * 6. Never creates a disease that Render did not return.
 * 7. Never deletes a disease returned by Render.
 * 8. Every returned item is tagged with source: 'render_ml'.
 */
export function normalizeRenderPredictions(rawResponse: any): DiseasePredictionItem[] {
  if (!rawResponse || typeof rawResponse !== 'object') {
    return [];
  }

  const results: DiseasePredictionItem[] = [];
  const seenDiseases = new Set<string>();

  const addUnique = (item: DiseasePredictionItem) => {
    const key = item.disease.toLowerCase().trim();
    if (!seenDiseases.has(key)) {
      seenDiseases.add(key);
      results.push(item);
    }
  };

  const parseNumber = (val: any): { percentage: number; probability: number } | null => {
    if (val === null || val === undefined) return null;
    let num: number;
    if (typeof val === 'number') {
      num = val;
    } else if (typeof val === 'string') {
      const cleaned = val.replace('%', '').trim();
      num = parseFloat(cleaned);
      if (isNaN(num)) return null;
    } else {
      return null;
    }

    if (num < 0) return null;

    // Fractional probability (e.g. 0.245) -> 24.5%
    if (num <= 1.0 && num > 0) {
      const percentage = Math.round(num * 100 * 10) / 10;
      return {
        probability: Math.round(num * 1000) / 1000,
        percentage,
      };
    }

    // Already percentage scale (e.g. 24.5 or 88.1)
    const percentage = Math.round(num * 10) / 10;
    const probability = Math.round((percentage / 100) * 1000) / 1000;
    return {
      percentage,
      probability,
    };
  };

  // Case 1: predictions or condition_results as an object
  // E.g., { "predictions": { "diabetes": 24.5, "heart_disease": 13.2 } }
  const predictionsObj =
    (rawResponse.predictions && typeof rawResponse.predictions === 'object' && !Array.isArray(rawResponse.predictions) && rawResponse.predictions) ||
    (rawResponse.condition_results && typeof rawResponse.condition_results === 'object' && !Array.isArray(rawResponse.condition_results) && rawResponse.condition_results) ||
    (rawResponse.disease_predictions && typeof rawResponse.disease_predictions === 'object' && !Array.isArray(rawResponse.disease_predictions) && rawResponse.disease_predictions) ||
    (rawResponse.conditions && typeof rawResponse.conditions === 'object' && !Array.isArray(rawResponse.conditions) && rawResponse.conditions) ||
    (rawResponse.diseases && typeof rawResponse.diseases === 'object' && !Array.isArray(rawResponse.diseases) && rawResponse.diseases);

  if (predictionsObj) {
    for (const [key, val] of Object.entries(predictionsObj)) {
      const parsed = parseNumber(val);
      if (parsed) {
        addUnique({
          disease: formatDiseaseName(key),
          probability: parsed.probability,
          percentage: parsed.percentage,
          percentageFormatted: `${parsed.percentage}%`,
          riskCategory: getRiskCategoryFromPercentage(parsed.percentage),
          source: 'render_ml',
          rawLabel: key,
        });
      }
    }
    if (results.length > 0) return results;
  }

  // Case 2: predictions, results, conditions as an array
  // E.g., [ { "disease": "Diabetes", "probability": 0.245 }, ... ]
  const predictionsArr =
    (Array.isArray(rawResponse.predictions) && rawResponse.predictions) ||
    (Array.isArray(rawResponse.results) && rawResponse.results) ||
    (Array.isArray(rawResponse.condition_results) && rawResponse.condition_results) ||
    (Array.isArray(rawResponse.conditions) && rawResponse.conditions) ||
    (Array.isArray(rawResponse.diseases) && rawResponse.diseases);

  if (predictionsArr && predictionsArr.length > 0) {
    for (const item of predictionsArr) {
      if (item && typeof item === 'object') {
        const name = item.disease || item.condition || item.name || item.target || item.title;
        const val =
          item.probability !== undefined
            ? item.probability
            : item.percentage !== undefined
            ? item.percentage
            : item.risk_percentage !== undefined
            ? item.risk_percentage
            : item.score;

        if (name && val !== undefined) {
          const parsed = parseNumber(val);
          if (parsed) {
            addUnique({
              disease: formatDiseaseName(String(name)),
              probability: parsed.probability,
              percentage: parsed.percentage,
              percentageFormatted: `${parsed.percentage}%`,
              riskCategory: getRiskCategoryFromPercentage(parsed.percentage),
              source: 'render_ml',
              rawLabel: String(name),
            });
          }
        }
      }
    }
    if (results.length > 0) return results;
  }

  // Case 3: multi-line target_disease or disease string from Render ML
  // E.g.: "🫀 Coronary Heart Disease (Confidence: 86.7%)\n• 🩸 Type-2 Diabetes (Confidence: 88.1%)"
  const rawTargetDisease = rawResponse.target_disease || rawResponse.disease || rawResponse.primary_risk;
  if (typeof rawTargetDisease === 'string' && rawTargetDisease.trim().length > 0) {
    const lines = rawTargetDisease
      .split(/\n|•/)
      .map((l) => l.trim().replace(/^[•\-\*]\s*/, ''))
      .filter((l) => l.length > 0);

    for (const line of lines) {
      // Regex looking for: "Disease Name (Confidence: 86.7%)" or "Disease Name: 86.7%" or "Disease Name (86.7%)"
      const match =
        line.match(/^(.*?)(?:\s*\((?:Confidence|Risk|Probability)?:\s*([0-9.]+)%?\))$/i) ||
        line.match(/^(.*?)(?:\s*\(?Confidence:\s*([0-9.]+)%?\)?)$/i) ||
        line.match(/^(.*?)(?:\s*[:\-]\s*([0-9.]+)%?)$/i) ||
        line.match(/^(.*?)\s*\(?([0-9.]+)%\)?$/i);

      if (match) {
        const name = match[1].trim();
        const scoreStr = match[2].trim();
        const parsed = parseNumber(scoreStr);
        if (name && parsed) {
          addUnique({
            disease: formatDiseaseName(name),
            probability: parsed.probability,
            percentage: parsed.percentage,
            percentageFormatted: `${parsed.percentage}%`,
            riskCategory: getRiskCategoryFromPercentage(parsed.percentage),
            source: 'render_ml',
            rawLabel: line,
          });
        }
      } else if (lines.length === 1) {
        // Single disease line without parentheses, check if overall risk_percentage applies
        const overallScore = parseNumber(rawResponse.risk_percentage ?? rawResponse.probability ?? rawResponse.risk_score);
        if (overallScore) {
          addUnique({
            disease: formatDiseaseName(line),
            probability: overallScore.probability,
            percentage: overallScore.percentage,
            percentageFormatted: `${overallScore.percentage}%`,
            riskCategory: getRiskCategoryFromPercentage(overallScore.percentage),
            source: 'render_ml',
            rawLabel: line,
          });
        }
      }
    }

    if (results.length > 0) return results;
  }

  // Case 4: Single top-level disease & probability when no multi-lines exist
  const singleDisease = rawResponse.target_disease || rawResponse.disease || rawResponse.prediction;
  const singleProb = parseNumber(rawResponse.risk_percentage ?? rawResponse.probability ?? rawResponse.risk_score);
  if (singleDisease && typeof singleDisease === 'string' && singleProb) {
    addUnique({
      disease: formatDiseaseName(singleDisease),
      probability: singleProb.probability,
      percentage: singleProb.percentage,
      percentageFormatted: `${singleProb.percentage}%`,
      riskCategory: getRiskCategoryFromPercentage(singleProb.percentage),
      source: 'render_ml',
      rawLabel: singleDisease,
    });
  }

  return results;
}
