# Test Gap-Fill Design — 2026-02-23

## Scope

Fill coverage gaps in the four existing unit test files. No new test files. No mocking of `fetch` or `Aioli`.

## Cases by file

### parseFasta.test.ts
- Multi-line sequences joined into one string
- CRLF line endings handled correctly
- Trailing whitespace stripped from sequence lines

### parsePAF.test.ts
- Invalid strand character → line skipped
- Non-numeric field → line skipped
- Multiple valid lines → all parsed
- Extra optional tag columns (>12 fields) → still parsed
- Negative strand parsed as `'-'`

### buildFeatures.test.ts
- Empty hits array → `[]`
- Non-overlapping features on same contig → both kept
- Same coordinates, different strands → both kept
- tRNA product naming (`tRNA-Gly` → `tRNA-Gly transfer RNA`)
- Known ncRNA product (`RNaseP_bact` → `Bacterial RNase P RNA`)
- Unknown query name → falls back to query name itself
- Score rounded to one decimal place

### formatGFF3.test.ts
- Score formatted to one decimal
- Attributes column contains correct `ID`, `Name`, `product`
- Date header line is present
- Multiple features produce correct number of data lines
