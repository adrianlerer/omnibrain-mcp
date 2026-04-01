import OpenAI from "openai";
import { zodResponseFormat } from "openai/helpers/zod";
import { ExtractionSchema, ConceptExtraction, CURRENT_SCHEMA_VERSION } from "./principles.js";

/**
 * ConceptExtractor: motor del Concept Bottleneck SCM.
 *
 * En lugar de generar texto libre (modo LLM clásico), este motor obliga
 * al modelo a vaciar su razonamiento a través de un tamiz de 24 dimensiones
 * conceptuales fijas. El resultado es un vector de scores en [0,1]^24,
 * completamente auditable y comparable entre documentos.
 *
 * Analogía con LCM (Barrault et al., 2024): así como los Large Concept Models
 * operan en "sentence embedding space" en lugar de token space, el SCM opera
 * en "concept space" de 24 dimensiones jurídicas en lugar del espacio de tokens
 * abierto del LLM subyacente.
 *
 * Implementa triple-run con consenso para mitigar varianza estocástica:
 * tres llamadas independientes se promedian, y el campo `confidence_spread`
 * expone la dispersión máxima por principio. Un spread > 0.15 indica
 * inestabilidad semántica en el texto evaluado.
 */
export class ConceptExtractor {
  private openai: OpenAI;

  constructor(apiKey: string) {
    this.openai = new OpenAI({ apiKey });
  }

  /**
   * Ejecuta una sola llamada al Concept Bottleneck.
   * Privado: el caller usa evaluateText() para obtener el consenso triple.
   */
  private async singleEvaluate(contextText: string): Promise<ConceptExtraction> {
    const response = await this.openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: [
            "You are the SCM Legal Concept Bottleneck Engine.",
            "Your task: read the legal text and map it to the 24 Universal Legal Principles of the Lerer Architecture.",
            "Output ONLY the structured JSON. Each principle receives a score from 0.0 (irrelevant) to 1.0 (core pillar).",
            "Be precise and consistent. Do not inflate scores. Most principles in any given text will score below 0.3.",
          ].join(" ")
        },
        {
          role: "user",
          content: `Evaluate the following legal text against the 24 principles:\n\n${contextText}`
        }
      ],
      response_format: zodResponseFormat(ExtractionSchema, "concept_bottleneck_evaluation"),
    });

    if (!response.choices[0].message.content) {
      throw new Error("Empty response from OpenAI Structured Outputs.");
    }
    return JSON.parse(response.choices[0].message.content) as ConceptExtraction;
  }

  /**
   * Evalúa un texto jurídico contra los 24 principios con consenso triple.
   *
   * Ejecuta tres llamadas en paralelo (Promise.all) para minimizar latencia
   * y promedia los scores. Retorna además confidence_spread: para cada
   * principio, la diferencia entre el valor máximo y el mínimo observados
   * en las tres corridas.
   *
   * Interpretación de confidence_spread:
   *   < 0.05  — el modelo es muy consistente en este principio
   *   0.05–0.15 — varianza normal; score confiable
   *   > 0.15  — el modelo oscila; interpretar con reservas
   */
  async evaluateText(
    contextText: string
  ): Promise<ConceptExtraction & { confidence_spread: Record<string, number> }> {
    console.error("[SCM] Running triple-consensus Bottleneck evaluation...");

    const [r1, r2, r3] = await Promise.all([
      this.singleEvaluate(contextText),
      this.singleEvaluate(contextText),
      this.singleEvaluate(contextText),
    ]);

    const runs = [r1, r2, r3];
    const keys = Object.keys(r1.principles_scores) as (keyof typeof r1.principles_scores)[];

    const averaged_scores = {} as typeof r1.principles_scores;
    const confidence_spread: Record<string, number> = {};

    for (const key of keys) {
      const vals = runs.map(r => r.principles_scores[key]);
      averaged_scores[key] = vals.reduce((a, b) => a + b, 0) / 3;
      confidence_spread[key] = +(Math.max(...vals) - Math.min(...vals)).toFixed(4);
    }

    const avg_confidence = runs.reduce((a, r) => a + r.confidence_score, 0) / 3;
    const best = runs.reduce((b, r) => r.confidence_score > b.confidence_score ? r : b, r1);

    console.error(`[SCM] Consensus complete. avg_confidence=${avg_confidence.toFixed(3)}`);

    return {
      summary: best.summary,
      principles_scores: averaged_scores,
      confidence_score: +avg_confidence.toFixed(4),
      schema_version: CURRENT_SCHEMA_VERSION,
      confidence_spread,
    };
  }

  /**
   * Genera el embedding vectorial estándar (1536d, token space).
   *
   * Coexiste con el Concept Space para permitir búsqueda semántica clásica
   * en paralelo con el filtrado por principios. Los dos espacios son
   * complementarios: el token embedding captura similitud léxica y contextual;
   * el concept space captura el "qué principios viola este texto".
   */
  async generateEmbedding(contextText: string): Promise<number[]> {
    console.error("[SCM] Generating token-space embedding (1536d)...");
    const response = await this.openai.embeddings.create({
      model: "text-embedding-3-small",
      input: contextText,
    });
    return response.data[0].embedding;
  }
}
