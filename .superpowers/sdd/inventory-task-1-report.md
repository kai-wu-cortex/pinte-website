# Guides Topic Inventory Task 1 Report

Date: 2026-07-16

## Deliverables

- `content/guides/taxonomy.json`
- `content/guides/source-registry.json`
- `.superpowers/sdd/inventory-task-1-report.md`

The Obsidian vault was used as read-only evidence. No vault file was edited.

## Repository Evidence Consulted

- `data/guideClusters.ts`
- `data/content.ts`
- `data/foil_data.ts`
- `data/productSeoProfiles.ts`
- `data/geoGuides.ts`
- `content/guides/topics.json`
- `content/guides/HF-000001/en.md`

Key catalog finding: `data/foil_data.ts` contains 64 PK, 38 PC, 36 PL, and 29 PY color records. DIGITAL exists as a product category in `data/content.ts` but has no item-level records in `data/foil_data.ts`.

## Vault Paths Consulted

Vault root: `/Users/kyle/Library/Mobile Documents/iCloud~md~obsidian/Documents/HotFoil_Database`

- `03_GitMemory_工艺配方客户案例知识库/产品条目/PK 咖啡底胶烫金膜系列.md`
- `03_GitMemory_工艺配方客户案例知识库/产品条目/PC 塑胶烫金膜系列.md`
- `03_GitMemory_工艺配方客户案例知识库/产品条目/PL-PY 颜料箔系列.md`
- `03_GitMemory_工艺配方客户案例知识库/产品条目/烫金膜产品技术Q&A结构化摘要.md`
- `04_L1L2L3_产品线应用工艺参数/L1_产品线大类/L1_电化铝烫金膜.md`
- `04_L1L2L3_产品线应用工艺参数/L2_应用场景细分/L2_塑胶皮革.md`
- `04_L1L2L3_产品线应用工艺参数/L2_应用场景细分/L2_标签防伪.md`
- `04_L1L2L3_产品线应用工艺参数/L3_底层工艺参数/L3_工艺参数字段.md`
- `02_PRD_客户定制开发工单/烫金膜开发Spec字段字典.md`
- `01_ProductSpec_产品规格白皮书/PINTE品特烫金膜产品规格白皮书.md`

## Mapping Decisions

- PK maps to metallic hot stamping for paper, textured/difficult paper, selected laminations, paper labels, and grade-specific natural/synthetic leather applications.
- PC maps primarily to plastic hot stamping. Internal sources also describe cold/digital variants, but a rule prevents inferring cold-transfer compatibility from the PC series name alone.
- PLPY maps the public group to raw catalog series PL (gloss pigment) and PY (matte pigment). Paper and paperboard uses are confirmed internal; plastics and leather remain uncertain until an individual grade is qualified.
- DIGITAL is marked `uncertain-internal`: category-level content exists, but item-level catalog and grade data do not. Its groups are qualification/research groups for distinct toner, UV-varnish, screen-printed adhesive, narrow-web, and sheet-fed systems.
- Decorative holographic transfer and registered security holograms are separate groups. Decorative diffraction is not treated as proof of anti-counterfeit performance.
- Regions may alter language, logistics, documentation, and standards selection, but never technical compatibility.

## Taxonomy Counts

| Array | Count |
| --- | ---: |
| clusters | 12 |
| industries | 8 |
| substrates | 20 |
| surfaceTreatments | 12 |
| processes | 11 |
| diagnosticVariables | 34 |
| defects | 12 |
| tests | 13 |
| equipment | 11 |
| artworkTypes | 8 |
| procurementConcerns | 12 |
| regions | 7 |
| productSeries | 4 |
| compatibilityGroups | 16 |
| compatibilityRules | 14 |

Total taxonomy records: 194.

The 12 cluster IDs exactly match `data/guideClusters.ts` and retain its order.

## Source Registry Counts

Total verified sources: 22.

| Source type | Count |
| --- | ---: |
| standard | 4 |
| manufacturer | 9 |
| manufacturer-technical | 1 |
| equipment-manufacturer | 3 |
| trade-publication | 1 |
| trade-association | 1 |
| question-research | 3 |

All records use HTTPS, include `accessDate: 2026-07-16`, and define a bounded `claimScope`. All Reddit records are `question-research`; they are for question language and cannot be sole technical evidence.

## URLs Verified Online

Each URL below was opened or returned as a live source during online verification on 2026-07-16.

1. `https://www.iso.org/standard/76041.html`
2. `https://store.astm.org/d3359-23.html`
3. `https://store.astm.org/d5264-98r19.html`
4. `https://www.iso.org/standard/76452.html`
5. `https://www.kurz-graphics.com/en/hot-stamping/`
6. `https://www.kurz-graphics.com/en/cold-transfer/`
7. `https://www.kurz-graphics.com/en/digital-transfer/`
8. `https://www.kurz-world.com/en/solutions/decoration-processes/`
9. `https://www.kurz-world.com/en/solutions/holograms/`
10. `https://www.univacco.com/hot-stamping-foil.htm`
11. `https://www.univacco.com/narrow-web-cold-foil.htm`
12. `https://www.univacco.com/sheet-fed-offset-cold-foil.htm`
13. `https://www.foilco.com/app/uploads/2019/05/Grade-Guide-Booklet_E_Doc.pdf`
14. `https://www.inxinternational.com/blog/shelf-appeal/mastering-art-foil-printing-complete-guide-hot-and-cold-techniques`
15. `https://www.heidelberg.com/global/en/print_and_packaging/products/offset_printing/peripherals/printing_and_coating_unit/foil_star/product_information_19/foil_star.jsp`
16. `https://media.bobst.com/en/news/detail/article/1692017402-bobst-combines-a-new-benchmark-hologram-application-system-with-connected-tools-to-achieve-maximum-quality-and-efficiency/`
17. `https://www.gietz.ch/en/home.html`
18. `https://www.labelsandlabeling.com/labels/label-academy/article/reviewing-hot-foiling-process`
19. `https://fsea.com/uncategorized/2020/fsea-and-paperspecs-release-print-decorating-reference-for-designers-foil-cheat-sheet/`
20. `https://www.reddit.com/r/Leathercraft/comments/1373gxw/advice_for_hot_foil_stamping/`
21. `https://www.reddit.com/r/CommercialPrinting/comments/1k87760/uv_inkjet_and_hot_foil/`
22. `https://www.reddit.com/r/Leathercraft/comments/1bhmxew/`

## Validation

Required parse command passed with exit 0:

```bash
PATH=/usr/local/bin:$PATH node -e "JSON.parse(require('fs').readFileSync('content/guides/taxonomy.json')); JSON.parse(require('fs').readFileSync('content/guides/source-registry.json'));"
```

Additional semantic validation passed for:

- duplicate IDs across all taxonomy arrays and the source registry;
- exact cluster IDs and order;
- taxonomy cross-references in substrates, product series, groups, tests, defects, and rules;
- every source `supportedTopics` value resolving to a stable taxonomy ID;
- HTTPS-only URLs, required access dates, and non-empty claim scopes;
- Reddit records using only `sourceType: question-research`.

## Commit

Commit message: `Add curated hot stamping topic taxonomy`

## Task Review Fix: Compatibility Tuple Semantics

The compatibility-group arrays are candidate pools, not permission to combine every listed value. Schema version 2 adds a machine-readable `candidate-pool-intersection` policy. A tuple is allowed only when its group is declared by the substrate and its process is declared by both the substrate and surface treatment.

The substrate declarations were completed for the existing digital-transfer and registered-hologram groups, and the unused primer candidate was removed from `digital-uv-enhancement`. No cluster ID, topic record, route, sitemap entry, source record, or public taxonomy label changed.

### Required JSON parse

Command:

```bash
node -e "JSON.parse(require('fs').readFileSync('content/guides/taxonomy.json')); JSON.parse(require('fs').readFileSync('content/guides/source-registry.json'));"
```

Pristine output (exit 0):

```text
```

### Compatibility-group semantic validation

Command:

```bash
node <<'NODE'
const assert = require('assert');
const taxonomy = JSON.parse(require('fs').readFileSync('content/guides/taxonomy.json'));
const policy = taxonomy.generatorPolicy.compatibilityTuplePolicy;
assert.equal(policy.mode, 'candidate-pool-intersection');
assert.deepEqual(policy.constraints, [
  { dimension: 'compatibilityGroupId', operator: 'member-of', collection: 'substrates[substrateId].compatibilityGroupIds' },
  { dimension: 'processId', operator: 'member-of', collection: 'substrates[substrateId].processIds' },
  { dimension: 'processId', operator: 'member-of', collection: 'surfaceTreatments[surfaceTreatmentId].compatibleProcessIds' }
]);
const substrates = new Map(taxonomy.substrates.map(record => [record.id, record]));
const treatments = new Map(taxonomy.surfaceTreatments.map(record => [record.id, record]));
let allowedTotal = 0;
let rejectedTotal = 0;
for (const group of taxonomy.compatibilityGroups) {
  const allowed = [];
  for (const substrateId of group.substrateIds) {
    const substrate = substrates.get(substrateId);
    assert(substrate, `${group.id}: missing substrate ${substrateId}`);
    for (const surfaceTreatmentId of group.surfaceTreatmentIds) {
      const treatment = treatments.get(surfaceTreatmentId);
      assert(treatment, `${group.id}: missing treatment ${surfaceTreatmentId}`);
      for (const processId of group.processIds) {
        const tuple = { compatibilityGroupId: group.id, substrateId, surfaceTreatmentId, processId };
        const passes = substrate.compatibilityGroupIds.includes(group.id)
          && substrate.processIds.includes(processId)
          && treatment.compatibleProcessIds.includes(processId);
        if (passes) {
          assert(substrate.compatibilityGroupIds.includes(tuple.compatibilityGroupId));
          assert(substrate.processIds.includes(tuple.processId));
          assert(treatment.compatibleProcessIds.includes(tuple.processId));
          allowed.push(tuple);
          allowedTotal++;
        } else {
          rejectedTotal++;
        }
      }
    }
  }
  assert(allowed.length > 0, `${group.id}: no allowed tuple`);
  for (const [field, tupleField] of [['substrateIds', 'substrateId'], ['surfaceTreatmentIds', 'surfaceTreatmentId'], ['processIds', 'processId']]) {
    for (const id of group[field]) assert(allowed.some(tuple => tuple[tupleField] === id), `${group.id}: unused candidate ${id}`);
  }
  console.log(`${group.id}: ${allowed.length} allowed`);
}
const rigid = taxonomy.compatibilityGroups.find(group => group.id === 'rigid-plastic-hot');
const abs = substrates.get('plastic-abs');
const primer = treatments.get('primer');
assert(rigid.substrateIds.includes(abs.id) && rigid.surfaceTreatmentIds.includes(primer.id) && rigid.processIds.includes('hot-stamping-flatbed'));
assert(!(abs.compatibilityGroupIds.includes(rigid.id) && abs.processIds.includes('hot-stamping-flatbed') && primer.compatibleProcessIds.includes('hot-stamping-flatbed')));
console.log(`PASS: ${taxonomy.compatibilityGroups.length} groups; ${allowedTotal} allowed tuples; ${rejectedTotal} incompatible candidate tuples rejected`);
NODE
```

Pristine output (exit 0):

```text
standard-paper-hot: 35 allowed
textured-paper-hot: 30 allowed
laminated-paper-hot: 7 allowed
paper-label-hot: 30 allowed
film-label-hot: 6 allowed
rigid-plastic-hot: 19 allowed
low-surface-energy-plastic-hot: 8 allowed
leather-hot: 5 allowed
pigment-paper-hot: 42 allowed
coated-paper-cold: 4 allowed
label-cold-transfer: 15 allowed
digital-toner-enhancement: 3 allowed
digital-uv-enhancement: 12 allowed
decorative-holographic-transfer: 30 allowed
registered-security-hologram: 10 allowed
coated-glass-specialty-hot: 1 allowed
PASS: 16 groups; 257 allowed tuples; 111 incompatible candidate tuples rejected
```
