---
id: USR-001
title: User Guide
type: user-guide
status: proposed
version: 1.2
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
  - [5.3 Use the editor](#53-use-the-editor)
  - [5.4 Update KPIs](#54-update-kpis)
  - [5.5 Share your KPIs](#55-share-your-kpis)
- [6. Reading a KPI Card](#6-reading-a-kpi-card)
- [7. Token Lifetime](#7-token-lifetime)
- [8. Advanced Usage: Uploading from Scripts](#8-advanced-usage-uploading-from-scripts)
- [9. Troubleshooting](#9-troubleshooting)
- [10. Frequently Asked Questions](#10-frequently-asked-questions)
- [11. Related Documents](#11-related-documents)

## 1. Introduction

Rasadgah shows your key performance indicators as a dashboard. You receive two tokens: a **write token** to upload your KPIs and a **read token** to share them. People with the read token see a clean page with only your KPIs and how fresh they are.

## 2. Intended Users

People who publish KPIs for themselves or a team, manually or from an automated job, and the people they share them with.

## 3. Prerequisites

- A current web browser.
- A KPI file in the format described in [INT-001](../02-specification/kpi-file-format.md).

## 4. Getting Started

1. Open the site address without any parameters, for example `https://kpi.example.com/`.
2. The page shows **Your tokens**:

   | Token       | Purpose                           | Keep it                     |
   | ----------- | --------------------------------- | --------------------------- |
   | Write token | Uploads KPIs and opens the editor | Secret, like a password     |
   | Read token  | Shows your KPIs read-only         | Share it with your audience |

3. Select **Copy** next to each token and store both in a password manager.

The tokens cannot be recovered and are not linked to any account.

## 5. Basic Operation

### 5.1 Prepare a KPI file

Download the example from the start page (**download an example**) or use [public/kpis.example.json](../../public/kpis.example.json) and replace the values. Each KPI needs at least `id`, `label`, `value` and `unit`.

### 5.2 Upload KPIs

1. Under **Upload KPIs**, select **Choose file** and pick your JSON file.
2. Select **Upload**.
3. On success the editor opens. If the file is invalid, the page lists each problem, for example `kpis.0.unit: …`. Correct the file and upload again.

### 5.3 Use the editor

Open `https://<site>/?token=<write token>`, or select **Open editor** on the start page. Bookmark this URL only on a private device, because it contains your write token.

The status panel shows:

| Field         | Meaning                                               |
| ------------- | ----------------------------------------------------- |
| Last upload   | Time of the last successful upload (UTC) and its age  |
| Tokens expire | Time after which both tokens stop working (UTC)       |
| On target     | KPIs that meet their target / KPIs that have a target |
| Share link    | Read-only link to send to others (see Section 5.5)    |

### 5.4 Update KPIs

Upload a new file under **Update KPIs** in the editor. The new file replaces all previous KPIs and extends the lifetime of both tokens by one week from now.

To change a few values without preparing a file, use **Edit JSON** in the editor:

1. The text box contains your current KPIs. Before the first upload it contains a one-KPI template.
2. Change the JSON. **Format** re-indents it; **Reset** restores the stored version.
3. Select **Save**. The change is published like an upload and extends both tokens. If the JSON is invalid or breaks a rule in [INT-001](../02-specification/kpi-file-format.md), the problems are listed below the text box and nothing is saved.

### 5.5 Share your KPIs

1. In the editor, select **Copy** next to **Share link (read-only)**, or copy the read token from the start page.
2. Send the link `https://<site>/?token=<read token>`.

Viewers see only the KPI cards and a line such as "Updated 3 hours ago (Oct 7, 2026, 9:00 AM UTC)". If your file contains `generatedAt`, the line also shows "data as of …". Until you publish KPIs, viewers see a full-page Rasadgah logo with the slogan "Observe what matters." and the note "No KPIs published yet." Viewers cannot upload, cannot see your write token and do not extend the lifetime.

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

Both tokens expire together, 7 days after the last upload with the write token. If nothing was ever uploaded, they expire 7 days after they were issued. Viewing does not extend the lifetime. After expiry, the tokens and the KPIs are deleted. Open the start page to get new tokens.

## 8. Advanced Usage: Uploading from Scripts

```bash
curl -fsS -X PUT "https://<site>/api/kpis" \
  -H "Authorization: Bearer $RASADGAH_WRITE_TOKEN" \
  -H 'Content-Type: application/json' \
  --data-binary '@kpis.json'
```

Run this at least once a week, for example from a scheduled CI job, to keep both tokens alive. Store the write token as a CI secret. Full API: [API-001](../02-specification/api-specification.md).

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

**Solution:** Wait up to one hour, or reuse existing tokens.

### 9.5 "This is a read token"

**Symptom:** An upload with `curl` returns HTTP 403.

**Cause:** The read token was used instead of the write token.

**Solution:** Use the write token for uploads.

More: [REF-002 Troubleshooting](../07-reference/troubleshooting.md).

## 10. Frequently Asked Questions

### 10.1 Can I recover a lost token?

No. If you lost the write token, viewers can still use the read token until the dashboard expires, but you cannot update it. Request new tokens and upload your file again.

### 10.2 Can I share my dashboard?

Yes. Share the read token or the share link from the editor. Never share the write token.

### 10.3 Can I revoke a shared link?

Not individually. Stop uploading so that the dashboard expires within 7 days, and create a new dashboard for the people who should keep access.

### 10.4 Is history kept?

No. Each upload replaces the previous one. Use `previousValue` to show change.

## 11. Related Documents

- [INT-001 KPI File Format](../02-specification/kpi-file-format.md)
- [API-001 HTTP API Specification](../02-specification/api-specification.md)
