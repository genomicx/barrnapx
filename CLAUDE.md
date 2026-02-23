# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What is barrnapx

Browser-based rRNA, tRNA, and ncRNA annotation tool. It mirrors the functionality of the CLI tool [barrnap](https://github.com/tseemann/barrnap) but runs entirely in the browser using minimap2 compiled to WebAssembly via [Aioli](https://biowasm.com/). No data leaves the user's machine.

Supported kingdoms: bacteria (`bac`), archaea (`arc`), fungi (`fun`).

## Commands

```bash
npm run dev          # start Vite dev server
npm run build        # TypeScript check + Vite production build
npm run lint         # ESLint
npm run test         # run Vitest tests once
npm run test:watch   # run Vitest in watch mode
npm run check        # test + lint + build (full CI check)
```

Run a single test file:
```bash
npx vitest run src/barrnapx/parsePAF.test.ts
```

## Architecture

### Pipeline (`src/barrnapx/pipeline.ts`)

The core entry point is `runBarrnapx()`. It orchestrates the full annotation pipeline:
1. Parse input FASTA → extract contigs
2. Fetch reference sequences from `public/data/` via HTTP
3. Initialise Aioli with minimap2 WebAssembly
4. Mount genome FASTA into the virtual FS
5. Run minimap2 alignments for rRNA / tRNA / ncRNA (each as a separate `cli.exec()` call)
6. Parse PAF output → filter by identity threshold → deduplicate overlaps → sort
7. Serialise to GFF3

### Aioli / minimap2 WebAssembly

Aioli is loaded as a **global CDN script** in `index.html` (`https://biowasm.com/cdn/v3/aioli.js`). It is not an npm dependency. The pipeline accesses it via `declare const Aioli: any`. Minimap2 params differ by feature type:
- rRNA: `-k 14 -w 4 -N 50`
- tRNA: `-k 8 -w 2 -N 50`
- ncRNA: `-k 10 -w 3 -N 50`

### Reference databases (`public/data/`)

Served as static FASTA files. Fetched at runtime by `databases.ts` with in-memory caching. Layout:
- `public/data/bacteria/` — 16S, 23S, 5S FASTA
- `public/data/archaea/` — 16S, 23S, 5S FASTA
- `public/data/fungi/` — 18S, 28S, 5.8S, 5S FASTA
- `public/data/tRNA/bacteria.fasta`
- `public/data/ncRNA/` — currently empty (`.gitkeep` only)

Note: ncRNA reference files are **missing** — ncRNA detection will silently return no results.

### PAF → GFF3 conversion

**PAF orientation**: in barrnapx output, the PAF `query` is the *reference* RNA sequence and the PAF `target` is the *genome contig*. Coordinate conversion: PAF is 0-based half-open; GFF3 is 1-based inclusive (`start + 1`, end unchanged).

Identity filter: `numMatches / blockLen * 100 ≥ threshold`. Deduplication removes overlapping features on the same contig+strand, keeping the highest-scoring hit.

### Types (`src/barrnapx/types.ts`)

Central type definitions: `Kingdom`, `FeatureType`, `GFF3Feature`, `PAFHit`, `BarrnapOptions`, `BarrnapResult`, `DEFAULT_OPTIONS`.

### App shell (`src/App.tsx`)

Currently a stub (`<p>Loading...</p>`). The full UI is not yet implemented — `Theme` and `View` types are exported to prevent unused-type warnings.

## Testing

Tests use Vitest + jsdom + `@testing-library/jest-dom`. Test files sit alongside the modules they test (`*.test.ts`). The `check` script is the canonical pre-commit gate.
