/**
 * SCM Legal Concept Bottleneck — MCP Server
 *
 * Expone el motor SCM como una herramienta MCP (Model Context Protocol)
 * para Claude Desktop, Cursor u otros clientes compatibles.
 *
 * Solo requiere OPENAI_API_KEY. No depende de Supabase ni de ninguna
 * infraestructura de persistencia: es el motor SCM puro.
 *
 * Para la versión con persistencia vectorial (OmniBrain), ver:
 * https://github.com/adrianlerer/omnibrain-pro
 */
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import * as dotenv from "dotenv";
import { ConceptExtractor } from "./conceptExtractor.js";

dotenv.config();

const openAiKey = process.env.OPENAI_API_KEY;
if (!openAiKey) {
  console.error("[SCM] Missing required environment variable: OPENAI_API_KEY");
  process.exit(1);
}

const extractor = new ConceptExtractor(openAiKey);

const server = new Server(
  { name: "SCM-Legal-Concept-Bottleneck", version: "2.1.0" },
  { capabilities: { tools: {} } }
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: "evaluate_scm_concept_bottleneck",
      description: [
        "Forces the SCM (Small Concept Model) to read a legal or factual text and return a",
        "deterministic JSON evaluating the 24 Universal Legal Principles of the Lerer Architecture.",
        "",
        "Each principle receives a score from 0.0 (irrelevant) to 1.0 (core pillar of the text).",
        "The output also includes confidence_spread per principle: the variance across three",
        "independent evaluation runs. Use this to assess the reliability of each score.",
        "",
        "Use this tool BEFORE any legal analysis to anchor reasoning in a principle-based",
        "framework rather than in statistical language patterns.",
      ].join(" "),
      inputSchema: {
        type: "object",
        properties: {
          text: {
            type: "string",
            description: "The legal or factual text to evaluate (contracts, clauses, rulings, facts).",
          },
          source: {
            type: "string",
            description: "Optional label for the source document (e.g. 'Contract A', 'Ruling 2024-05').",
          },
        },
        required: ["text"],
      },
    },
  ],
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    if (name === "evaluate_scm_concept_bottleneck") {
      const text = String(args?.text ?? "");
      if (!text.trim()) {
        throw new Error("The 'text' argument cannot be empty.");
      }

      const result = await extractor.evaluateText(text);

      // Incluir source en el output si fue provisto
      const output = {
        ...result,
        source: args?.source ?? null,
      };

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(output, null, 2),
          },
        ],
      };
    }

    throw new Error(`Unknown tool: ${name}`);

  } catch (error: any) {
    console.error(`[SCM] Error in tool '${name}':`, error.message);
    return {
      content: [
        {
          type: "text",
          text: `Error: ${error.message}`,
        },
      ],
      isError: true,
    };
  }
});

async function run() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("[SCM] MCP Server ready. Waiting for connections.");
}

run().catch((err) => {
  console.error("[SCM] Fatal startup error:", err);
  process.exit(1);
});
