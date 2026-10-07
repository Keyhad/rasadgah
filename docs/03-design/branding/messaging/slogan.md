---
id: REF-025
title: Slogan, Taglines and Voice
type: reference
status: approved
version: 2.0
owner: product
audience:
  - design
  - developer
  - product
tags:
  - branding
  - messaging
---

# Slogan, Taglines and Voice

## Table of Contents

- [1. Name](#1-name)
- [2. Slogan](#2-slogan)
- [3. Tagline](#3-tagline)
- [4. Secondary Lines](#4-secondary-lines)
- [5. Voice and Tone](#5-voice-and-tone)
- [6. Product Vocabulary](#6-product-vocabulary)
- [7. Related Documents](#7-related-documents)

## 1. Name

**Rasadgah** — from Persian رصدگاه (*rasad-gāh*), "observatory": *rasad* (observation) + *gāh* (place).

- Write "Rasadgah" with one capital letter. Do not write "RasadGah", "RASADGAH" (except in the logo tagline style) or "Rasadgah App".
- Pronunciation: *ra-SAD-gah*.

## 2. Slogan

> **Observe what matters.**

Use on the landing page, repository description and presentations.

## 3. Tagline

> **KPI observatory**

Part of the logo lockup and the application header. Always lower case except as the first letter of a sentence, or in upper-case letter-spaced form inside the logo.

## 4. Secondary Lines

| Context      | Line                                                                       |
| ------------ | -------------------------------------------------------------------------- |
| How it works | "Upload a file. See your KPIs. No account needed."                         |
| Token model  | "Write privately. Share read-only."                                        |
| Lifetime     | "Keep it fresh: every upload keeps your dashboard alive for another week." |
| Automation   | "From JSON to dashboard with one `curl`."                                  |
| Self-hosting | "Your server, your numbers, one `docker compose up`."                      |

## 5. Voice and Tone

| Principle           | Do                                                                   | Avoid                                                     |
| ------------------- | -------------------------------------------------------------------- | --------------------------------------------------------- |
| Plain               | "Keep the write token secret. Share the read token."                 | "Securely persist your unique credential identifier."     |
| Precise             | "Both tokens expire 7 days after the last upload."                   | "Tokens expire after a while."                            |
| Honest about limits | "A lost token cannot be recovered."                                  | Implying accounts, recovery or history that do not exist. |
| Calm                | "Too many tokens were requested from your network. Try again later." | Alarmist wording, exclamation marks.                      |
| Short               | Button labels of one or two words: "Upload", "Copy".                 | Sentences on buttons.                                     |

## 6. Product Vocabulary

| Use                    | Do not use                                 | Reason                                                                       |
| ---------------------- | ------------------------------------------ | ---------------------------------------------------------------------------- |
| write token            | admin token, secret key, password          | Grants uploading and the editor; matches the UI and API (`writeToken`).      |
| read token, share link | viewer key, public link                    | Grants viewing only; matches the UI and API (`readToken`).                   |
| editor                 | admin page, dashboard (for the write view) | The page at `/?token=<write token>`.                                         |
| shared view            | public page, report page                   | The page at `/?token=<read token>`.                                          |
| KPI file               | data file, payload                         | The uploaded JSON ([INT-001](../../../02-specification/kpi-file-format.md)). |
| upload                 | import, sync                               | The only write action.                                                       |
| on target / off target | pass / fail, green / red                   | Matches the KPI cards.                                                       |
| expires                | is deleted (in user text)                  | Deletion is an implementation detail; expiry is what users experience.       |

## 7. Related Documents

- [REF-024 Product Description](product-description.md)
- [USR-001 User Guide](../../../06-user/user-guide.md)
