import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema, } from "@modelcontextprotocol/sdk/types.js";
import * as dotenv from "dotenv";
import { ConceptExtractor } from "./conceptExtractor.js";
// Load environment variables (OPENAI_API_KEY)
dotenv.config();
const openAiKey = process.env.OPENAI_API_KEY;
if (!openAiKey) {
    console.error("Missing environment variable: OPENAI_API_KEY");
    process.exit(1);
}
const scmExtractor = new ConceptExtractor(openAiKey);
// MCP Server Configuration
const server = new Server({
    name: "SCM-Concept-Bottleneck",
    version: "1.0.0",
}, {
    capabilities: {
        tools: {},
    },
});
// Define Tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
        tools: [
            {
                name: "evaluate_scm_concept_bottleneck",
                description: "Forces the SCM (Small Concept Model) to read a factual text and return a strict JSON evaluating the 24 universal legal principles.",
                inputSchema: {
                    type: "object",
                    properties: {
                        text: {
                            type: "string",
                            description: "The factual fragment or legal text to evaluate.",
                        }
                    },
                    required: ["text"],
                },
            }
        ],
    };
});
// Implement Tool Logic
server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;
    try {
        if (name === "evaluate_scm_concept_bottleneck") {
            const text = String(args?.text);
            // Bottleneck Evaluation using OpenAI Structured Outputs and Zod
            const conceptData = await scmExtractor.evaluateText(text);
            return {
                content: [
                    {
                        type: "text",
                        text: JSON.stringify(conceptData, null, 2),
                    },
                ],
            };
        }
        else {
            throw new Error(`Tool not found: ${name}`);
        }
    }
    catch (error) {
        return {
            content: [
                {
                    type: "text",
                    text: `Error executing tool ${name}: ${error.message}`,
                },
            ],
            isError: true,
        };
    }
});
// Start the server with Stdio transport
async function run() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("SCM MCP Server connected successfully.");
}
run().catch(console.error);
