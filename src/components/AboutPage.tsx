export function AboutPage() {
  return (
    <div className="about-page">
      <section>
        <h2>About barrnapx</h2>
        <p>
          barrnapx is a browser-based reimplementation of{' '}
          <a href="https://github.com/tseemann/barrnap" target="_blank" rel="noopener noreferrer">
            barrnap
          </a>{' '}
          for annotating ribosomal RNA, transfer RNA, and non-coding RNA in
          bacterial, archaeal, and fungal genomes. It uses minimap2 WebAssembly
          to align reference RNA sequences against your input genome — entirely
          in the browser.
        </p>
        <div className="privacy-note">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
          <p>
            No data leaves your machine — all processing happens client-side
            using WebAssembly. Your genome sequences are never uploaded to any
            server.
          </p>
        </div>
      </section>

      <section>
        <h2>References</h2>
        <p>
          <strong>barrnap</strong>: Seemann T.{' '}
          <em>barrnap: BAsic Rapid Ribosomal RNA Predictor.</em>{' '}
          <a
            href="https://github.com/tseemann/barrnap"
            target="_blank"
            rel="noopener noreferrer"
          >
            https://github.com/tseemann/barrnap
          </a>
        </p>
        <p>
          <strong>minimap2</strong>: Li H. (2018). Minimap2: pairwise alignment
          for nucleotide sequences.{' '}
          <em>Bioinformatics</em>, 34(18):3094–3100.
        </p>
        <p>
          Reference sequences sourced from NCBI RefSeq (E. coli K-12 MG1655,
          M. jannaschii DSM 2661, S. cerevisiae S288C) and Rfam consensus
          models.
        </p>
      </section>

      <section>
        <h2>About the Author</h2>
        <h3>Nabil-Fareed Alikhan</h3>
        <p className="about-role">
          Senior Bioinformatician, Centre for Genomic Pathogen Surveillance,
          University of Oxford
        </p>
        <p>
          Bioinformatics researcher and software developer specialising in
          microbial genomics. I build widely used open-source tools, publish
          peer-reviewed research, and co-host the MicroBinfie podcast.
        </p>
        <div className="about-links">
          <a href="https://www.happykhan.com" target="_blank" rel="noopener noreferrer">
            happykhan.com
          </a>
          <a href="https://orcid.org/0000-0002-1243-0767" target="_blank" rel="noopener noreferrer">
            ORCID: 0000-0002-1243-0767
          </a>
          <a href="mailto:nabil@happykhan.com">nabil@happykhan.com</a>
          <a href="https://twitter.com/happy_khan" target="_blank" rel="noopener noreferrer">
            @happy_khan
          </a>
        </div>
      </section>
    </div>
  )
}
