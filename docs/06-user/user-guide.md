---
id: USR-001
title: User Guide
type: user-guide
status: proposed
version: 1.0
audience:
  - user
tags:
  - user-guide
---

# User Guide

## Table of Contents

- [1. Introduction](#1-introduction)
- [2. Intended Users](#2-intended-users)
- [3. Prerequisites](#3-prerequisites)
- [4. Getting Started](#4-getting-started)
- [5. Basic Operation](#5-basic-operation)
  - [5.1 Prepare a KPI file](#51-prepare-a-kpi-file)
  - [5.2 Upload KPIs](#52-upload-kpis)
  - [5.3 View the dashboard](#53-view-the-dashboard)
  - [5.4 Update KPIs](#54-update-kpis)
- [6. Reading a KPI Card](#6-reading-a-kpi-card)
- [7. Token Lifetime](#7-token-lifetime)
- [8. Advanced Usage: Uploading from Scripts](#8-advanced-usage-uploading-from-scripts)
- [9. Troubleshooting](#9-troubleshooting)
- [10. Frequently Asked Questions](#10-frequently-asked-questions)
- [11. Related Documents](#11-related-documents)

## 1. Introduction

Rasadgah shows your key performance indicators as a dashboard. You receive a personal access token, upload a JSON file with your KPIs, and open your dashboard with the token.

## 2. Intended Users

People who publish KPIs for themselves or a team, manually or from an automated job.

## 3. Prerequisites

- A current web browser.
- A KPI file in the format described in [INT-001](../02-specification/kpi-file-format.md).

## 4. Getting Started

1. Open the site address without any parameters, for example `https://kpi.example.com/`.
2. The page shows **Your access token**. Select **Copy** and store the token in a password manager.

The token is the only key to your dashboard. It cannot be recovered and it is not linked to any account.

## 5. Basic Operation

### 5.1 Prepare a KPI file

Download the example from the start page (**download an example**) or use [public/kpis.example.json](../../public/kpis.example.json) and replace the values. Each KPI needs at least `id`, `label`, `value` and `unit`.

### 5.2 Upload KPIs

1. Under **Upload KPIs**, select **Choose file** and pick your JSON file.
2. Select **Upload**.
3. On success the dashboard opens. If the file is invalid, the page lists each problem, for example `kpis.0.unit: …`. Correct the file and upload again.

### 5.3 View the dashboard

Open `https://<site>/?token=<your token>`, or select **Open my dashboard** on the start page. Bookmark this URL only on a private device, because the URL contains your token.

The header shows:

| Field         | Meaning                                               |
| ------------- | ----------------------------------------------------- |
| Last upload   | Time of the last successful upload (UTC)              |
| Token expires | Time after which the token stops working (UTC)        |
| On target     | KPIs that meet their target / KPIs that have a target |

### 5.4 Update KPIs

Upload a new file under **Update KPIs** on the dashboard. The new file replaces all previous KPIs and extends the token lifetime by one week from now.

## 6. Reading a KPI Card

| Element                    | Meaning                                                                                               |
| -------------------------- | ----------------------------------------------------------------------------------------------------- |
| Label                      | `label` from the file                                                                                 |
| Large number               | `value`, formatted by unit                                                                            |
| ▲ / ▼ / ■ and percentage   | Direction and size of change from `previousValue`                                                     |
| Left border colour         | Green: change in the desired direction. Red: change against it. Grey: no change or no previous value. |
| "On target" / "Off target" | Comparison with `target`, taking `direction` into account                                             |

Formatting rules: [INT-001, Section 4](../02-specification/kpi-file-format.md#4-presentation-rules).

## 7. Token Lifetime

A token expires 7 days after the last upload. A token that never received an upload expires 7 days after it was issued. After expiry, the token and its KPIs are deleted. Open the start page to get a new token.

## 8. Advanced Usage: Uploading from Scripts

```bash
curl -fsS -X PUT "https://<site>/api/kpis" \
  -H "Authorization: Bearer $RASADGAH_TOKEN" \
  -H 'Content-Type: application/json' \
  --data-binary '@kpis.json'
```

Run this at least once a week, for example from a scheduled CI job, to keep the token alive. Full API: [API-001](../02-specification/api-specification.md).

## 9. Troubleshooting

### 9.1 "Token expired or unknown"

**Symptom:** The dashboard URL shows "Token expired or unknown".

**Cause:** No upload for 7 days, or the token was mistyped.

**Solution:** Check the token for missing characters. If it is correct, select **Get a new token** and upload your file again.

### 9.2 "KPI file does not match the expected format"

**Symptom:** The upload is rejected with a list of problems.

**Cause:** The file breaks a rule in INT-001.

**Solution:** Fix each listed field. The path `kpis.2.currency` refers to the third KPI's `currency` field (counting starts at 0).

### 9.3 "KPI file must be at most … bytes"

**Cause:** The file is larger than the configured limit (default 256 KiB).

**Solution:** Remove unused fields or KPIs. A file holds at most 100 KPIs.

### 9.4 "Too many requests"

**Cause:** Too many tokens were requested from your network within one hour.

**Solution:** Wait up to one hour, or reuse an existing token.

More: [REF-002 Troubleshooting](../07-reference/troubleshooting.md).

## 10. Frequently Asked Questions

### 10.1 Can I recover a lost token?

No. Request a new token and upload your file again.

### 10.2 Can I share my dashboard?

Sharing the URL also shares the ability to replace your KPIs. Share it only with people you trust.

### 10.3 Is history kept?

No. Each upload replaces the previous one. Use `previousValue` to show change.

## 11. Related Documents

- [INT-001 KPI File Format](../02-specification/kpi-file-format.md)
- [API-001 HTTP API Specification](../02-specification/api-specification.md)
