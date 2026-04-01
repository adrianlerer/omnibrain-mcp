import OpenAI from "openai";
import { zodResponseFormat } from "openai/helpers/zod";
import { ExtractionSchema } from "./principles.js";
/**
 * ConceptExtractor es el motor de "Concept Bottleneck" del entorno de Adrian Lerer.
 * No genera oraciones predictivas al azar; obliga a la matriz neuronal a
 * vaciar su razonamiento a través del tamiz de los 24 principios.
 */
export class ConceptExtractor {
    openai;
    constructor(apiKey) {
        this.openai = new OpenAI({ apiKey });
    }
    /**
     * Evalúa cualquier texto crudo (contratos, audios, evidencias) contra los 24 principios.
     */
    async evaluateText(contextText) {
        console.error("[ConceptExtractor] Realizando abstracción Bottleneck...");
        const response = await this.openai.chat.completions.create({
            model: "gpt-4o", // Modelo base de conocimiento.
            messages: [
                {
                    role: "system",
                    content: "You are the SCM-OmniBrain Concept Bottleneck Engine. Your job is to read legal text and map its core implications to Adrian Lerer's Universal Legal Principles. You must strictly output JSON evaluating the intensity of each principle involved from 0.0 (Irrelevant) to 1.0 (Core Pillar of the text)."
                },
                {
                    role: "user",
                    content: `Analiza el siguiente texto y evalúa el peso de los 24 principios legales:\n\n${contextText}`
                }
            ],
            response_format: zodResponseFormat(ExtractionSchema, "concept_bottleneck_evaluation")
        });
        if (response.choices[0].message.content) {
            return JSON.parse(response.choices[0].message.content);
        }
        else {
            throw new Error("Fallo en la extracción conceptual determinista.");
        }
    }
    /**
     * Genera el vector matemático clásico (Token Space) a la vez para convivir con el SCM.
     */
    async generateEmbedding(contextText) {
        console.error("[ConceptExtractor] Generando Token-Embedding (1536d)...");
        const response = await this.openai.embeddings.create({
            model: "text-embedding-3-small",
            input: contextText
        });
        return response.data[0].embedding;
    }
}
