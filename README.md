# barrnapx

**Browser-based rRNA, tRNA, and ncRNA annotation — no installation required**

barrnapx is a client-side reimplementation of [barrnap](https://github.com/tseemann/barrnap) that runs entirely in your browser using [minimap2](https://github.com/lh3/minimap2) compiled to WebAssembly via [Aioli / biowasm](https://biowasm.com/). Upload a FASTA genome and download a GFF3 annotation file — no data ever leaves your machine.

## Features

- Detects **rRNA**, **tRNA**, and **ncRNA** in bacterial, archaeal, and fungal genomes
- Runs entirely in the browser — no server, no installation, no data upload
- Outputs standard **GFF3** format compatible with genome browsers and downstream tools
- **Legacy mode** restricts analysis to rRNA only, mirroring barrnap &lt; 1.0 behaviour

## Supported organisms

| Kingdom | Flag | rRNA detected |
|---------|------|---------------|
| Bacteria | `bac` | 5S, 16S, 23S |
| Archaea | `arc` | 5S, 16S, 23S |
| Fungi | `fun` | 5S, 5.8S, 18S, 28S |

## Usage

Visit **https://barrnapx.genomicx.org**, upload one or more FASTA files, select a kingdom, and click **Run**.

The GFF3 output can be downloaded directly from the results panel.

### Output format

```
##gff-version 3
##source-version barrnapx 0.1.0
##input-file genome.fna
##date 2025-01-01
contig1  barrnapx  rRNA  1234  2756  99.2  +  0  ID=16S_rRNA_contig1_1234;Name=16S_rRNA;product=16S ribosomal RNA
contig1  barrnapx  tRNA   345   417  85.1  -  0  ID=tRNA-Gly_contig1_345;Name=tRNA-Gly;product=tRNA-Gly transfer RNA
```

## Identity thresholds

| Feature | Minimum identity |
|---------|-----------------|
| rRNA | 75% |
| tRNA | 70% |
| ncRNA | 65% |

Overlapping features on the same contig and strand are deduplicated, keeping the highest-scoring hit.

## How it works

1. The input FASTA is parsed in-browser and mounted into a virtual filesystem
2. Kingdom-appropriate reference sequences are fetched from the app's static assets
3. [minimap2 2.22](https://github.com/lh3/minimap2) (WebAssembly) aligns references against the genome
4. PAF output is parsed, filtered by identity, deduplicated, and serialised to GFF3

minimap2 parameters by feature type:

| Feature | Parameters |
|---------|-----------|
| rRNA | `-k 14 -w 4 -N 50` |
| tRNA | `-k 8 -w 2 -N 50` |
| ncRNA | `-k 10 -w 3 -N 50` |

## Development

```bash
npm install
npm run dev       # start dev server at http://localhost:5173
npm run test      # run tests
npm run check     # tests + lint + build (full CI gate)
```

## Acknowledgements

barrnapx is inspired by [barrnap](https://github.com/tseemann/barrnap) by Torsten Seemann. The WebAssembly runtime is provided by [biowasm](https://biowasm.com/). Reference sequences are derived from [SILVA](https://www.arb-silva.de/) and [Rfam](https://rfam.org/).

## License

[GPL-3.0](LICENSE) © Nabil-Fareed Alikhan

## Hosting

Production runs on [Cloudflare Pages](https://barrnapx.genomicx.org). Build with Node.js 24 (`npm install`, `npm run build`) and deploy `dist/`. The reference databases remain under `/data/`; the Aioli/minimap2 WebAssembly runtime remains provided by biowasm. Shared theme tokens and bundled IBM Plex fonts come from `@genomicx/ui` 0.10.1.
