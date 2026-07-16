# First Batch Task 1 Report

Status: DONE

Scope:
- Implemented deterministic first-batch topic selection in `scripts/select-first-guide-batch.mjs`.
- Generated `reports/guides/first-batch-selection.json` with exactly 50 selected records.
- Updated `content/guides/topics.json` to mark selected records with `batch: "2026-07-p0-01"`, `batch_priority: "P0"`, `batch_position`, and `selection_rule`.
- Kept all selected records in `draft` status. No guide pages were published and no sitemap/manifest entries were added.

Selection behavior:
- Covers UV label adhesion and incomplete transfer, PP/PE scratch and surface-treatment qualification, natural/PU/PVC leather logo work, coated/UV/laminated/textured/specialty paper, process comparisons, large solids, fine detail, registration, durability tests, sampling, roll specs, MOQ, supplier evaluation, lead time, color master approval, cosmetic/wine/plastic/security applications.
- Excludes legacy guide duplicates by recording `legacyOverlapCheck` and requiring narrower substrate/process/test context for selected records.
- Each report entry includes `selectionReason`, `legacyOverlapCheck`, `requiredEvidence`, `sourceKeys`, `relatedProducts`, `relatedGuides`, and topic-difference metadata.

Verification:
- `node scripts/select-first-guide-batch.mjs` passed and selected 50 topics.
- `node -e "const x=require('./reports/guides/first-batch-selection.json'); if(x.length!==50) process.exit(1); if(new Set(x.map(r=>r.topic_id)).size!==50) process.exit(2); console.log('selection ok', x.length)"` passed.
- Draft-state check passed: 50 selected, 0 published, 0 reviewed, 50 draft.
- `npm run guides:topics:test` passed: 7/7 tests.
- `npm run guides:check` passed: 38/38 tests plus guide verification checks.

Concern:
- The plan says "P0 topics"; the generated inventory has some required first-batch coverage areas originally ranked P1/P2, especially process comparisons and application pages. The implementation preserves the original `priority` field and assigns `batch_priority: "P0"` only for this publishing batch so the editorial priority is explicit without rewriting the inventory score.

## Fix: First Guide Batch Selection Gate

Status: DONE

Files changed:
- `scripts/select-first-guide-batch.mjs`
- `content/guides/topics.json`
- `reports/guides/first-batch-selection.json`
- `.superpowers/sdd/first-batch-task-1-report.md`

Review findings addressed:
- Selected records are now genuine P0 records. The selector deterministically promotes only the 50 named coverage/quota inventory records before selection when their source cluster has no native P0 inventory; each promotion records its original priority and rationale in `priority_promotion`. Selection rejects any coverage or quota-fill record that is not P0 after that promotion. The generated report now writes both `originalPriority` and `priority` as `P0`, and retains the promotion audit data separately.
- Added explicit fixed min/max quotas for all 11 represented clusters. Forty-four required coverage rules are selected first; six separate records are selected only to fill remaining cluster quota capacity. The selector fails if any quota is missed or exceeded, so the result is not determined solely by a 50-rule list.
- Legacy exclusion is now a hard gate. The selector normalizes generated slug suffixes, rejects direct matches to legacy slugs unless the record contains a documented narrower difference, and records the decision, matching legacy slugs, and rationale in every report entry.
- Re-runs now remove batch metadata only from non-selected records whose `batch` is this batch ID. Records assigned to another/future batch are left unchanged; a selected future-batch record fails explicitly rather than being overwritten.

Commands run:
- `node scripts/select-first-guide-batch.mjs`
- `node -e "const x=require('./reports/guides/first-batch-selection.json'); if(x.length!==50) process.exit(1); if(new Set(x.map(r=>r.topic_id)).size!==50) process.exit(2); if(x.some(r=>r.originalPriority!=='P0')) process.exit(3); console.log('selection ok', x.length)"`
- `npm run guides:topics:test` (7 passed)
- `npm run guides:check` (38 passed plus guide verification)

No guide pages were published.
