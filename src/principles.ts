import { z } from "zod";

/**
 * Los 24 Principios Generales del Derecho — Arquitectura Lerer
 *
 * Representan el "Concept Space" del sistema SCM: el conjunto cerrado y
 * exhaustivo de dimensiones sobre las cuales se proyecta cualquier texto
 * jurídico. A diferencia del "Token Space" de los LLMs (vocabulario abierto
 * de ~100k tokens), este espacio tiene exactamente 24 dimensiones, lo que
 * hace el razonamiento completamente auditable.
 *
 * Referencia teórica: Barrault et al. (2024) "Large Concept Models", Meta FAIR.
 * Aplicación: Lerer, I.A. (2025) "Small Concept Models: A Specialized
 * Framework for Legal AI in Hispanic-American Jurisdictions", SSRN 5555478.
 */
export const LegalPrinciplesEnum = z.enum([
  "Legalidad",
  "Igualdad",
  "DignidadHumana",
  "JerarquiaNormativa",
  "BuenaFe",
  "ConfianzaLegitima",
  "NoDanar",
  "Proporcionalidad",
  "Equidad",
  "AbusoDerecho",
  "Responsabilidad",
  "NoEnriquecimientoSinCausa",
  "Solidaridad",
  "DebidoProceso",
  "PresuncionInocencia",
  "Irretroactividad",
  "InDubioProHomine",
  "AutonomiaVoluntad",
  "PactaSuntServanda",
  "Integridad",
  "TratoDigno",
  "Publicidad",
  "Motivacion",
  "TutelaJudicialEfectiva"
]);

export type UniversalPrinciple = z.infer<typeof LegalPrinciplesEnum>;

/**
 * Schema estricto de puntuaciones.
 * Cada principio recibe un valor en [0.0, 1.0]:
 *   0.0 = Irrelevante para este texto
 *   1.0 = Pilar central del texto
 *
 * El rango cerrado es intencional: garantiza que el output del LLM sea
 * directamente comparable entre ejecuciones y documentos distintos.
 */
export const ConceptScoresSchema = z.object({
  Legalidad:                 z.number().min(0).max(1),
  Igualdad:                  z.number().min(0).max(1),
  DignidadHumana:            z.number().min(0).max(1),
  JerarquiaNormativa:        z.number().min(0).max(1),
  BuenaFe:                   z.number().min(0).max(1),
  ConfianzaLegitima:         z.number().min(0).max(1),
  NoDanar:                   z.number().min(0).max(1),
  Proporcionalidad:          z.number().min(0).max(1),
  Equidad:                   z.number().min(0).max(1),
  AbusoDerecho:              z.number().min(0).max(1),
  Responsabilidad:           z.number().min(0).max(1),
  NoEnriquecimientoSinCausa: z.number().min(0).max(1),
  Solidaridad:               z.number().min(0).max(1),
  DebidoProceso:             z.number().min(0).max(1),
  PresuncionInocencia:       z.number().min(0).max(1),
  Irretroactividad:          z.number().min(0).max(1),
  InDubioProHomine:          z.number().min(0).max(1),
  AutonomiaVoluntad:         z.number().min(0).max(1),
  PactaSuntServanda:         z.number().min(0).max(1),
  Integridad:                z.number().min(0).max(1),
  TratoDigno:                z.number().min(0).max(1),
  Publicidad:                z.number().min(0).max(1),
  Motivacion:                z.number().min(0).max(1),
  TutelaJudicialEfectiva:    z.number().min(0).max(1),
});

export type ConceptScores = z.infer<typeof ConceptScoresSchema>;

/**
 * Schema de salida del Concept Bottleneck.
 *
 * El LLM es forzado a cumplir este schema via OpenAI Structured Outputs
 * (zodResponseFormat). No puede generar texto libre ni omitir campos.
 *
 * schema_version permite rastrear la generación del schema con la que
 * fue producido cada registro, facilitando migraciones futuras.
 */
export const ExtractionSchema = z.object({
  summary: z.string().describe(
    "Resumen factual del fragmento legal en 2-3 oraciones. Sin opinión. Solo hechos."
  ),
  principles_scores: ConceptScoresSchema.describe(
    "Evaluación cuantitativa de los 24 principios. 0.0 = irrelevante, 1.0 = pilar central."
  ),
  confidence_score: z.number().min(0).max(1).describe(
    "Confianza global del modelo en su propia abstracción conceptual."
  ),
  schema_version: z.string().default(
    "2.1.0"
  ).describe(
    "Versión del schema de extracción. Incrementar al agregar o modificar principios."
  ),
});

export type ConceptExtraction = z.infer<typeof ExtractionSchema>;

/** Fuente de verdad para la versión actual del schema. */
export const CURRENT_SCHEMA_VERSION = "2.1.0";
