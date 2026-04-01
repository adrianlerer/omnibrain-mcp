import { z } from "zod";
// Los 24 Principios Legales Universales identificados por Adrian Lerer
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
// Esquema Estricto Obligatorio para OpenAI (Structured Outputs no permite diccionarios dinámicos)
export const ConceptScoresSchema = z.object({
    Legalidad: z.number(),
    Igualdad: z.number(),
    DignidadHumana: z.number(),
    JerarquiaNormativa: z.number(),
    BuenaFe: z.number(),
    ConfianzaLegitima: z.number(),
    NoDanar: z.number(),
    Proporcionalidad: z.number(),
    Equidad: z.number(),
    AbusoDerecho: z.number(),
    Responsabilidad: z.number(),
    NoEnriquecimientoSinCausa: z.number(),
    Solidaridad: z.number(),
    DebidoProceso: z.number(),
    PresuncionInocencia: z.number(),
    Irretroactividad: z.number(),
    InDubioProHomine: z.number(),
    AutonomiaVoluntad: z.number(),
    PactaSuntServanda: z.number(),
    Integridad: z.number(),
    TratoDigno: z.number(),
    Publicidad: z.number(),
    Motivacion: z.number(),
    TutelaJudicialEfectiva: z.number()
});
// Estructura de Salida Determinista que el LLM será forzado a cumplir (95% Interpretabilidad)
export const ExtractionSchema = z.object({
    summary: z.string(),
    principles_scores: ConceptScoresSchema,
    confidence_score: z.number()
});
