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

**Rasadgah** is a self-hosted KPI observatory: upload a JSON file with a personal token and see your KPIs as a dashboard over HTTPS, with no account required.

## 2. Short Description (about 50 words)

Rasadgah turns a KPI file into a dashboard. Open the site to receive an access token, upload your KPIs as JSON, and view them at a private URL. Each card shows value, change, trend and target status. Uploads keep the token alive for a week. Deploy it with one Docker Compose command.

## 3. Full Description

### 3.1 The problem

Small teams often track a handful of KPIs in spreadsheets or scripts. Sharing them as a dashboard usually means adopting a BI platform, managing user accounts and connecting data sources — more than the task requires.

### 3.2 How Rasadgah works

1. **Get a token.** The first visit to the site issues a random access token. There is no sign-up.
2. **Upload KPIs.** Upload a JSON file from the browser or with `curl`. The file is validated and every problem is listed by field.
3. **Observe.** Open `/?token=<token>` to see one card per KPI: formatted value, change since the previous value, trend and whether the target is met.
4. **Keep it fresh.** A token expires one week after the last upload. A weekly scheduled job keeps a dashboard alive indefinitely.

### 3.3 Who it is for

- Team leads who report a few KPIs every week.
- Engineers who want to publish metrics from a CI job or script.
- Administrators who need a self-hosted tool without a database.

### 3.4 Key features

- Token-based access, no accounts, no personal data.
- Four units: number, percent, currency, duration; direction-aware assessment ("higher is better" or "lower is better").
- Validation messages that name the exact field.
- HTTPS by default through Caddy, including automatic certificates.
- One `docker compose up` to run; CI/CD pipeline included.

### 3.5 What Rasadgah is not

- Not a BI platform: no charts, history or data-source connectors.
- Not multi-user: whoever holds the token can view and replace the KPIs.
- Not a long-term archive: idle dashboards expire after one week.

## 4. Repository Description

GitHub "About" field (max. 350 characters):

> Rasadgah — KPI observatory. Upload a KPI JSON file with a personal token and view it as a dashboard over HTTPS. No accounts. Next.js, Docker Compose, Caddy.

## 5. Related Documents

- [REF-025 Slogan, Taglines and Voice](slogan.md)
- [USR-001 User Guide](../../../06-user/user-guide.md)
