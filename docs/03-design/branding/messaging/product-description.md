---
id: REF-024
title: Product Description
type: reference
status: approved
version: 2.0
owner: product
audience:
  - product
  - design
  - developer
tags:
  - product
  - messaging
---

# Product Description

Approved copy for describing Rasadgah. Facts in this document are defined in [PRJ-001](../../../00-project/README.md) and [REQ-000](../../../01-requirements/requirements.md); update this copy when they change.

## Table of Contents

- [1. One Sentence](#1-one-sentence)
- [2. Short Description (about 50 words)](#2-short-description-about-50-words)
- [3. Full Description](#3-full-description)
  - [3.1 The problem](#31-the-problem)
  - [3.2 How Rasadgah works](#32-how-rasadgah-works)
  - [3.3 Who it is for](#33-who-it-is-for)
  - [3.4 Key features](#34-key-features)
  - [3.5 What Rasadgah is not](#35-what-rasadgah-is-not)
- [4. Repository Description](#4-repository-description)
- [5. Related Documents](#5-related-documents)

## 1. One Sentence

**Rasadgah** is a self-hosted KPI observatory: upload a JSON file with a private write token, share a read-only link, and see your KPIs as a dashboard over HTTPS, with no account required.

## 2. Short Description (about 50 words)

Rasadgah turns a KPI file into a shareable dashboard. Open the site to receive a write token and a read token, upload your KPIs as JSON, and share the read-only link. Viewers see clean KPI cards and how fresh the data is. Uploads keep both tokens alive for a week.

## 3. Full Description

### 3.1 The problem

Small teams often track a handful of KPIs in spreadsheets or scripts. Sharing them as a dashboard usually means adopting a BI platform, managing user accounts and connecting data sources — more than the task requires.

### 3.2 How Rasadgah works

1. **Get two tokens.** The first visit issues a write token (keep it secret) and a read token (share it). There is no sign-up.
2. **Upload KPIs.** Upload a JSON file with the write token, from the browser or with `curl`. The file is validated and every problem is listed by field.
3. **Share.** Send the read-only link. Viewers see one card per KPI — formatted value, change since the previous value, trend and target status — and a line such as "Updated 3 hours ago". Nothing else.
4. **Keep it fresh.** Both tokens expire one week after the last upload. A weekly scheduled job keeps a dashboard alive indefinitely.

### 3.3 Who it is for

- Team leads who report a few KPIs every week.
- Engineers who want to publish metrics from a CI job or script.
- Administrators who need a self-hosted tool without a database.

### 3.4 Key features

- Write token for publishing, read token for sharing; no accounts, no personal data.
- Clean read-only view with a freshness timestamp.
- Four units: number, percent, currency, duration; direction-aware assessment ("higher is better" or "lower is better").
- Validation messages that name the exact field.
- HTTPS by default through Caddy, including automatic certificates.
- One `docker compose up` to run; CI/CD pipeline included.

### 3.5 What Rasadgah is not

- Not a BI platform: no charts, history or data-source connectors.
- Not multi-user: one write token per dashboard, and a shared read token cannot be revoked individually.
- Not a long-term archive: idle dashboards expire after one week.

## 4. Repository Description

GitHub "About" field (max. 350 characters):

> Rasadgah — KPI observatory. Upload KPIs as JSON with a private write token and share a clean, read-only dashboard over HTTPS. No accounts. Next.js, Docker Compose, Caddy.

## 5. Related Documents

- [REF-025 Slogan, Taglines and Voice](slogan.md)
- [USR-001 User Guide](../../../06-user/user-guide.md)
