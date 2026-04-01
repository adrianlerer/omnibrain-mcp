# SCM Legal Concept Bottleneck

**Proof of Concept** — Small Concept Model applied to legal reasoning in Hispanic-American jurisdictions.

> *"Instead of predicting the next token, force the model to answer: which legal principles does this text activate, and how strongly?"*

---

## Theoretical Background

This repository implements the core architectural idea from:

> Lerer, I.A. (2025). **Small Concept Models: A Specialized Framework for Legal AI in Hispanic-American Jurisdictions**. SSRN 5555478. [https://papers.ssrn.com/sol3/papers.cfm?abstract_id=5555478](https://papers.ssrn.com/sol3/papers.cfm?abstract_id=5555478)

The framework draws directly on:

> Barrault et al. (2024). **Large Concept Models: Language Modeling in a Sentence Representation Space**. Meta FAIR. [https://arxiv.org/abs/2412.08821](https://arxiv.org/abs/2412.08821)

### The Core Idea

Standard LLMs operate in **Token Space**: a ~100,000-dimensional vocabulary where each forward pass predicts the next token via statistical pattern matching. This produces fluent text but makes reasoning opaque and non-deterministic — two runs on the same legal question may produce contradictory answers.

This system operates in **Concept Space**: a 24-dimensional space of Universal Legal Principles. Every legal text is projected onto this fixed basis. The output is not prose but a vector of scores in [0,1]²⁴ — fully auditable, comparable across documents, and reproducible.

```
Token Space (LLM):    "El contrato..." → [token₁, token₂, ...] → fluent text (stochastic)
Concept Space (SCM):  "El contrato..." → [AbusoDerecho: 0.91, BuenaFe: 0.12, ...] (deterministic)
```

This is analogous to how LCMs (Barrault et al., 2024) operate in sentence embedding space rather than word-level token space — achieving cross-lingual generalization by reasoning at a higher level of abstraction. SCM applies the same insight to legal reasoning: concepts, not tokens, are the right unit of analysis for law.

### The 24 Universal Legal Principles (Lerer Architecture)

| # | Principle | Domain |
|---|-----------|--------|
| 1 | Legalidad | Constitutional |
| 2 | Igualdad | Constitutional |
| 3 | DignidadHumana | Constitutional |
| 4 | JerarquiaNormativa | Constitutional |
| 5 | BuenaFe | Civil/Commercial |
| 6 | ConfianzaLegitima | Civil/Administrative |
| 7 | NoDanar | Civil (neminem laedere) |
| 8 | Proporcionalidad | Administrative/Criminal |
| 9 | Equidad | Civil/Commercial |
| 10 | AbusoDerecho | Civil/Commercial |
| 11 | Responsabilidad | Civil/Commercial |
| 12 | NoEnriquecimientoSinCausa | Civil |
| 13 | Solidaridad | Social/Labor |
| 14 | DebidoProceso | Procedural |
| 15 | PresuncionInocencia | Criminal/Administrative |
| 16 | Irretroactividad | Constitutional |
| 17 | InDubioProHomine | Human Rights |
| 18 | AutonomiaVoluntad | Civil/Commercial |
| 19 | PactaSuntServanda | Civil/Commercial |
| 20 | Integridad | Ethics/Professional |
| 21 | TratoDigno | Labor/Consumer |
| 22 | Publicidad | Administrative |
| 23 | Motivacion | Administrative/Judicial |
| 24 | TutelaJudicialEfectiva | Procedural |

---

## Architecture

```
Input text
    │
    ▼
┌─────────────────────────────────────────┐
│         Concept Bottleneck              │
│  GPT-4o + Zod Structured Outputs        │
│  Triple-run consensus (3x parallel)     │
│  Output: vector ∈ [0,1]²⁴              │
└─────────────────────────────────────────┘
    │
    ├── principles_scores: { AbusoDerecho: 0.91, BuenaFe: 0.12, ... }
    ├── confidence_score: 0.87
    ├── confidence_spread: { AbusoDerecho: 0.03, ... }  ← inter-run variance
    ├── summary: "factual summary"
    └── schema_version: "2.1.0"
```

**Triple-run consensus**: each evaluation runs three independent calls to GPT-4o in parallel and averages the scores. The `confidence_spread` field reports the max-min range per principle across the three runs. A spread > 0.15 signals semantic instability in the evaluated text.

**MCP integration**: the engine is exposed as an MCP (Model Context Protocol) tool, allowing Claude Desktop or Cursor to call it before generating any legal analysis — anchoring the LLM's reasoning in the principle-based output rather than in free statistical generation.

---

## Quick Start

### Requirements

- Node.js >= 18
- An OpenAI API key with access to `gpt-4o`

### Installation

```bash
git clone https://github.com/adrianlerer/omnibrain-mcp.git
cd omnibrain-mcp
npm install
cp .env.example .env       # Add your OPENAI_API_KEY
```

### Run the demo (no Claude required)

```bash
npm run demo
```

Expected output:

```
Active principles (score >= 0.3):
  AbusoDerecho                 ████████████████████ 0.912  spread=0.021
  DebidoProceso                ██████████████░░░░░░ 0.731  spread=0.043
  TutelaJudicialEfectiva       █████████░░░░░░░░░░░ 0.448  spread=0.089
  Proporcionalidad             ████░░░░░░░░░░░░░░░░ 0.221  spread=0.034

Summary: The clause forces the counterparty to waive due process rights...
Global confidence: 0.841
Schema version: 2.1.0
```

### Build and connect to Claude Desktop

```bash
npm run build
```

Add to your Claude Desktop config (`~/Library/Application Support/Claude/claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "scm-legal": {
      "command": "node",
      "args": ["/absolute/path/to/omnibrain-mcp/dist/index.js"],
      "env": {
        "OPENAI_API_KEY": "<your-key>"
      }
    }
  }
}
```

Then ask Claude: *"Evaluate this contract clause using the SCM Concept Bottleneck."*

---

## Relation to OmniBrain

This repository is the **pure SCM engine**: concept extraction only, no persistence.

The full system — with vectorial storage (pgvector/Supabase), bulk document indexer, and hybrid retrieval by principle scores — is in:

- [`adrianlerer/omnibrain-pro`](https://github.com/adrianlerer/omnibrain-pro) — private, production system
- [`adrianlerer/scm-omnibrain-pipeline`](https://github.com/adrianlerer/scm-omnibrain-pipeline) — pipeline integration

The separation is intentional: the Concept Bottleneck is an independent reasoning layer. OmniBrain is the memory layer that consumes it.

---

## Citing this work

```bibtex
@article{lerer2025scm,
  title     = {Small Concept Models: A Specialized Framework for
               Legal AI in Hispanic-American Jurisdictions},
  author    = {Lerer, Ignacio Adrián},
  year      = {2025},
  month     = {10},
  journal   = {SSRN},
  note      = {SSRN 5555478},
  url       = {https://papers.ssrn.com/sol3/papers.cfm?abstract_id=5555478}
}
```

---

## License

MIT — see [LICENSE](LICENSE).
