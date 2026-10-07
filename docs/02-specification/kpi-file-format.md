---
id: INT-001
title: KPI File Format
type: specification
status: proposed
version: 1.0
audience:
  - user
  - developer
  - tester
tags:
  - kpi
  - json
  - interface
---

# KPI File Format

## Table of Contents

- [1. Purpose](#1-purpose)
- [2. Message Format](#2-message-format)
- [3. Fields](#3-fields)
  - [3.1 Report object](#31-report-object)
  - [3.2 KPI object](#32-kpi-object)
- [4. Presentation Rules](#4-presentation-rules)
- [5. Validation Rules](#5-validation-rules)
- [6. Examples](#6-examples)
- [7. Verification](#7-verification)
- [8. Related Documents](#8-related-documents)

## 1. Purpose

Defines the JSON document accepted by `PUT /api/kpis` and by the browser upload form. The authoritative implementation is [src/application/kpiReportSchema.ts](../../src/application/kpiReportSchema.ts).

## 2. Message Format

- Encoding: UTF-8 JSON.
- Maximum size: `MAX_UPLOAD_BYTES` (default 262 144 bytes).
- Fields not listed in Section 3 are ignored and not stored.

## 3. Fields

### 3.1 Report object

| Field         | Type         | Required | Rule                                                                        |
| ------------- | ------------ | -------- | --------------------------------------------------------------------------- |
| `generatedAt` | string       | no       | ISO 8601 date-time with `Z` or numeric offset, e.g. `2026-10-07T08:00:00Z`. |
| `kpis`        | array of KPI | yes      | 0 to 100 items. `id` values shall be unique.                                |

### 3.2 KPI object

| Field           | Type   | Required | Rule                                                                                |
| --------------- | ------ | -------- | ----------------------------------------------------------------------------------- |
| `id`            | string | yes      | 1–64 characters after trimming whitespace.                                          |
| `label`         | string | yes      | 1–120 characters after trimming whitespace. Shown on the card.                      |
| `value`         | number | yes      | Finite number.                                                                      |
| `unit`          | string | yes      | One of `number`, `percent`, `currency`, `duration_ms`.                              |
| `direction`     | string | no       | `higher_is_better` (default) or `lower_is_better`.                                  |
| `previousValue` | number | no       | Enables change and trend.                                                           |
| `target`        | number | no       | Enables target status.                                                              |
| `currency`      | string | no       | Three upper-case letters (ISO 4217). Used when `unit` is `currency`. Default `USD`. |

## 4. Presentation Rules

All numbers are formatted with the `en-US` locale. Times are shown in UTC.

| `unit`        | Interpretation of `value`          | Display                                                     | Example            |
| ------------- | ---------------------------------- | ----------------------------------------------------------- | ------------------ |
| `number`      | Plain number                       | Up to 2 decimals, grouped                                   | `8,421.46`         |
| `percent`     | Percent points (`3.8` means 3.8 %) | Up to 1 decimal                                             | `3.8%`             |
| `currency`    | Amount in `currency`               | No decimals                                                 | `$128,400`         |
| `duration_ms` | Milliseconds                       | `< 1000`: whole ms; otherwise seconds with up to 2 decimals | `245 ms`, `1.25 s` |

Derived values:

| Value         | Rule                                                                                                                                      |
| ------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| Change        | `(value − previousValue) / abs(previousValue)`, signed percentage with 1 decimal. `—` when `previousValue` is absent or `0`.              |
| Trend         | `up`, `down` or `flat` comparing `value` to `previousValue`. `flat` when `previousValue` is absent.                                       |
| Assessment    | `positive` when the trend matches `direction`, `negative` when it opposes it, `neutral` when flat. Controls the card colour.              |
| Target status | `met` when `value ≥ target` (`higher_is_better`) or `value ≤ target` (`lower_is_better`); otherwise `missed`. Not shown without `target`. |

## 5. Validation Rules

A file that breaks any rule in Section 3 is rejected with HTTP 422. Each violation is reported as `<path>: <message>`, where `<path>` uses dots and array indices, for example `kpis.0.label: <message>`. A violation at the top level is reported with the path `(root)`.

## 6. Examples

Complete example: [public/kpis.example.json](../../public/kpis.example.json). It is also served at `/kpis.example.json`.

Minimal valid file:

```json
{ "kpis": [{ "id": "users", "label": "Active users", "value": 8421, "unit": "number" }] }
```

## 7. Verification

TST-003 in [TST-000](../05-testing/test-specification.md). The published example is checked against the schema by `src/application/kpiReportSchema.test.ts`.

## 8. Related Documents

- [API-001 HTTP API Specification](api-specification.md)
- [USR-001 User Guide](../06-user/user-guide.md)
