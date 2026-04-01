/**
 * testRun.ts — Demo standalone del Concept Bottleneck SCM
 *
 * Ejecutar sin Claude Desktop ni infraestructura adicional:
 *   npx tsx src/testRun.ts
 *
 * Requiere OPENAI_API_KEY en el entorno o en un archivo .env en la raíz.
 */
import * as dotenv from "dotenv";
import { ConceptExtractor } from "./conceptExtractor.js";

dotenv.config();

const openAiKey = process.env.OPENAI_API_KEY;
if (!openAiKey) {
  console.error("Error: OPENAI_API_KEY not set. Create a .env file with OPENAI_API_KEY=sk-...");
  process.exit(1);
}

/**
 * Casos de prueba: textos con perfiles conceptuales contrastantes.
 * Elegidos para demostrar que el Bottleneck discrimina, no infla scores.
 */
const TEST_CASES = [
  {
    label: "Cláusula abusiva con renuncia al derecho de defensa",
    text: `El proveedor obliga al contratante a renunciar expresamente a su derecho
    de defensa en juicio ante cualquier disputa comercial, aceptando que todo
    reclamo caduca a las 24 horas de ocurrido, con efecto retroactivo y bajo
    apercibimiento de embargos preventivos sin previo aviso ni audiencia.`,
  },
  {
    label: "Principio de buena fe en contrato de distribución",
    text: `Las partes se obligan a actuar de buena fe en la ejecución del presente
    contrato de distribución exclusiva, comunicando de manera oportuna cualquier
    circunstancia que pudiera afectar el cumplimiento de sus obligaciones
    recíprocas, y absteniéndose de conductas que puedan frustrar la finalidad
    económica del acuerdo.`,
  },
];

async function runDemo() {
  const extractor = new ConceptExtractor(openAiKey!);

  console.log("\n" + "=".repeat(60));
  console.log("  SCM Legal Concept Bottleneck — Demo");
  console.log("  Lerer Architecture · 24 Universal Legal Principles");
  console.log("=".repeat(60));

  for (const testCase of TEST_CASES) {
    console.log(`\n--- ${testCase.label} ---`);
    console.log(`Text: "${testCase.text.trim().slice(0, 80)}..."`);
    console.log("\nRunning triple-consensus evaluation...\n");

    try {
      const result = await extractor.evaluateText(testCase.text);

      // Mostrar solo los principios con score >= 0.3 (relevantes)
      const relevant = Object.entries(result.principles_scores)
        .filter(([, score]) => score >= 0.3)
        .sort(([, a], [, b]) => b - a);

      console.log("Active principles (score >= 0.3):");
      for (const [principle, score] of relevant) {
        const spread = result.confidence_spread[principle];
        const bar = "█".repeat(Math.round(score * 20)).padEnd(20, "░");
        const spreadNote = spread > 0.15 ? " ⚠ high variance" : "";
        console.log(`  ${principle.padEnd(28)} ${bar} ${score.toFixed(3)}  spread=${spread.toFixed(3)}${spreadNote}`);
      }

      console.log(`\nSummary: ${result.summary}`);
      console.log(`Global confidence: ${result.confidence_score.toFixed(3)}`);
      console.log(`Schema version: ${result.schema_version}`);

    } catch (err: any) {
      console.error(`Error: ${err.message}`);
    }
  }

  console.log("\n" + "=".repeat(60));
  console.log("  Demo complete.");
  console.log("=".repeat(60) + "\n");
}

runDemo();
