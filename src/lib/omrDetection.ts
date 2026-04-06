/**
 * OMR Bubble Detection Engine
 * Grid-based detection: analyzes darkness of bubbles in a structured OMR sheet image.
 */

export interface OMRDetectionConfig {
  totalQuestions: number;
  optionsPerQuestion: 4 | 5;
  // Grid layout
  columns?: number; // how many question columns on the sheet
}

export interface DetectedAnswer {
  questionNumber: number;
  detectedOption: number | null; // 0-indexed, null = no bubble filled
  confidence: number; // 0-1
}

export interface OMRDetectionResult {
  answers: DetectedAnswer[];
  imageWidth: number;
  imageHeight: number;
  processingTimeMs: number;
}

/**
 * Analyze an image and detect filled OMR bubbles using pixel darkness analysis.
 */
export async function detectOMRBubbles(
  imageFile: File | Blob,
  config: OMRDetectionConfig
): Promise<OMRDetectionResult> {
  const startTime = performance.now();

  const imageBitmap = await createImageBitmap(imageFile);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d')!;
  
  canvas.width = imageBitmap.width;
  canvas.height = imageBitmap.height;
  ctx.drawImage(imageBitmap, 0, 0);

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const { data, width, height } = imageData;

  // Convert to grayscale for analysis
  const grayscale = new Uint8Array(width * height);
  for (let i = 0; i < width * height; i++) {
    const r = data[i * 4];
    const g = data[i * 4 + 1];
    const b = data[i * 4 + 2];
    grayscale[i] = Math.round(0.299 * r + 0.587 * g + 0.114 * b);
  }

  // Estimate grid layout
  const columns = config.columns || (config.totalQuestions > 30 ? 2 : 1);
  const questionsPerColumn = Math.ceil(config.totalQuestions / columns);
  const options = config.optionsPerQuestion;

  // Define regions - assume standard OMR layout
  // Margins: 10% on each side, 8% top, 5% bottom
  const marginX = Math.round(width * 0.10);
  const marginTop = Math.round(height * 0.08);
  const marginBottom = Math.round(height * 0.05);
  
  const usableWidth = width - 2 * marginX;
  const usableHeight = height - marginTop - marginBottom;
  
  const colWidth = Math.round(usableWidth / columns);
  const rowHeight = Math.round(usableHeight / questionsPerColumn);
  
  // Bubble size estimation
  const bubbleRadius = Math.round(Math.min(colWidth / (options + 2), rowHeight) * 0.3);

  const answers: DetectedAnswer[] = [];

  for (let q = 0; q < config.totalQuestions; q++) {
    const col = Math.floor(q / questionsPerColumn);
    const row = q % questionsPerColumn;

    // Question number area takes ~25% of column width
    const questionAreaWidth = colWidth * 0.25;
    const bubbleAreaWidth = colWidth * 0.70;
    const bubbleSpacing = bubbleAreaWidth / options;

    const baseX = marginX + col * colWidth + questionAreaWidth;
    const baseY = marginTop + row * rowHeight + rowHeight / 2;

    let darkestOption = -1;
    let darkestValue = 255;
    let secondDarkest = 255;
    const optionDarkness: number[] = [];

    for (let opt = 0; opt < options; opt++) {
      const cx = Math.round(baseX + opt * bubbleSpacing + bubbleSpacing / 2);
      const cy = Math.round(baseY);

      // Sample pixels in bubble region
      const darkness = sampleRegionDarkness(grayscale, width, height, cx, cy, bubbleRadius);
      optionDarkness.push(darkness);

      if (darkness < darkestValue) {
        secondDarkest = darkestValue;
        darkestValue = darkness;
        darkestOption = opt;
      } else if (darkness < secondDarkest) {
        secondDarkest = darkness;
      }
    }

    // Determine if a bubble is actually filled
    // Threshold: darkest must be significantly darker than the average of others
    const avgOthers = optionDarkness
      .filter((_, i) => i !== darkestOption)
      .reduce((a, b) => a + b, 0) / (options - 1);

    const darknessDiff = avgOthers - darkestValue;
    const threshold = 30; // minimum darkness difference to consider filled

    let detectedOption: number | null = null;
    let confidence = 0;

    if (darknessDiff > threshold) {
      detectedOption = darkestOption;
      confidence = Math.min(1, darknessDiff / 100);
    }

    answers.push({
      questionNumber: q + 1,
      detectedOption,
      confidence,
    });
  }

  const endTime = performance.now();

  return {
    answers,
    imageWidth: width,
    imageHeight: height,
    processingTimeMs: Math.round(endTime - startTime),
  };
}

/**
 * Sample the average darkness of pixels in a circular region.
 */
function sampleRegionDarkness(
  grayscale: Uint8Array,
  width: number,
  height: number,
  cx: number,
  cy: number,
  radius: number
): number {
  let sum = 0;
  let count = 0;

  for (let dy = -radius; dy <= radius; dy++) {
    for (let dx = -radius; dx <= radius; dx++) {
      if (dx * dx + dy * dy > radius * radius) continue;
      const x = cx + dx;
      const y = cy + dy;
      if (x < 0 || x >= width || y < 0 || y >= height) continue;
      sum += grayscale[y * width + x];
      count++;
    }
  }

  return count > 0 ? sum / count : 255;
}

/**
 * Score detected answers against an answer key.
 */
export function scoreDetectedAnswers(
  detected: DetectedAnswer[],
  answerKey: (number | number[])[],
  marksPerQuestion: number,
  negativeMarking: number
): {
  score: number;
  correct: number;
  wrong: number;
  unattempted: number;
  accuracy: number;
  maxScore: number;
} {
  let correct = 0;
  let wrong = 0;
  let unattempted = 0;

  detected.forEach((d, i) => {
    if (d.detectedOption === null) {
      unattempted++;
      return;
    }
    const key = answerKey[i];
    const isCorrect = Array.isArray(key) ? key.includes(d.detectedOption) : d.detectedOption === key;
    if (isCorrect) correct++;
    else wrong++;
  });

  const score = Math.max(0, correct * marksPerQuestion - wrong * negativeMarking);
  const maxScore = detected.length * marksPerQuestion;
  const accuracy = detected.length > 0 ? Math.round((correct / detected.length) * 100) : 0;

  return { score, correct, wrong, unattempted, accuracy, maxScore };
}
