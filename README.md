# datasus-qa-suite

Automated test suite validating the integrity of public health vaccination data from Brazil's National Immunization Program (PNI) via the DATASUS Open Data API.

![CI](https://github.com/helenaciorra/datasus-qa-suite/actions/workflows/ci.yml/badge.svg)

## Overview

This project was built to demonstrate practical QA engineering skills using real-world public health data. It covers API contract validation, data integrity checks, edge case testing, and automated execution via CI/CD — applied across 7 years of vaccination records from Brazil's public health system.

**Data source:** [Portal de Dados Abertos do SUS — PNI](https://dadosabertos.saude.gov.br/dataset/doses-aplicadas-pelo-programa-de-nacional-de-imunizacoes-pni-2025)

## Tech Stack

- [Cypress](https://www.cypress.io/) — E2E and API testing
- [GitHub Actions](https://github.com/features/actions) — CI/CD pipeline (runs on every push + weekly schedule)
- Node.js

## Test Suites

### 01 — Homepage (`01_homepage.cy.js`)

Basic E2E smoke tests on the DATASUS portal.

| Test | Description |
|---|---|
| ✅ Page load | Validates the portal loads and returns a non-empty title |
| ✅ Navigation | Confirms the main navigation menu is visible |

---

### 02 — PNI 2025 API (`02_api_pni.cy.js`)

Deep validation suite for the 2025 vaccination dataset specifically.

**Contract**
| Test | Description |
|---|---|
| ✅ HTTP 200 | Endpoint returns a successful response |
| ✅ Response structure | Body contains the `doses_aplicadas_pni` array |
| ✅ Limit parameter | Returns correct number of records per page |
| ✅ Pagination | Different offsets return different records |
| ✅ Required fields | All mandatory fields present in every record |

**Data Integrity**
| Test | Description |
|---|---|
| ✅ Date format | `data_vacina` is a parseable date |
| ✅ Year range | All records belong to 2025 |
| ✅ UF validation | State codes match the 27 valid Brazilian states |
| ✅ Sex field | Values restricted to `F`, `M`, or `I` |
| ✅ Patient hash | `codigo_paciente` is always 64 characters (SHA-256) |
| ✅ Document status | `status_documento` is always `final` |
| ✅ Municipality | `nome_municipio_paciente` is never an empty string when populated |

**Edge Cases**
| Test | Description |
|---|---|
| ✅ High offset | Handles `offset=999999` gracefully (200 or 404) |
| ✅ Limit 1 | Returns exactly 1 record without breaking |
| ✅ Limit 1000 | Handles maximum allowed limit without breaking |

---

### 03 — Multi-Year PNI API (`03_api_pni_multi_year.cy.js`)

The most comprehensive suite — runs the same validation logic across all 7 years of available PNI data (2020–2026) using a data-driven approach.

Each year is defined as a configuration object with its own endpoint and field map, allowing the test runner to adapt assertions to schema differences across API versions. 2026 uses softer assertions as data is still being collected.

**Per year (× 7 years = 91 tests)**
| Test | Description |
|---|---|
| ✅ HTTP 200 | Endpoint returns a successful response |
| ✅ Response structure | Body contains the `doses_aplicadas_pni` array |
| ✅ Limit parameter | Returns correct number of records per page |
| ✅ Required fields | Year-specific mandatory fields present in every record |
| ✅ Date format | `data_vacina` is a parseable date |
| ✅ Year range | Records belong to the expected year (±1 for migration tolerance) |
| ✅ UF validation | State codes are valid when field is populated |
| ✅ Sex field | Values restricted to valid codes when field is populated |
| ✅ Patient hash | `codigo_paciente` is 64 characters when populated |
| ✅ Document status | Status field is non-empty when populated |
| ✅ Municipality | Municipality field is non-empty when populated |
| ✅ High offset | Handles `offset=999999` gracefully |
| ✅ Limit 1 | Returns at most 1 record without breaking |

---

## Results

| Suite | Tests | Status |
|---|---|---|
| 01_homepage | 2 | ✅ passing |
| 02_api_pni_2025 | 17 | ✅ passing |
| 03_api_pni_multi_year | 91 | ✅ passing |
| **Total** | **110** | **✅ all passing** |

---

## Key Engineering Decisions

**API over UI:** The DATASUS portal uses a legacy form-submission architecture (no XHR). After mapping the network layer via DevTools, the decision was made to test the REST API directly — more reliable, faster, and closer to the data source.

**Schema-aware testing:** The PNI API schema changed significantly between years — field names, types, and availability vary from 2020 to 2026. Rather than duplicating test files, a data-driven approach maps each year to its correct field names, keeping the suite maintainable as new years are added.

**Nullable field handling:** Fields like `sigla_uf_paciente`, `codigo_paciente`, and `nome_municipio_paciente` are nullable in older API versions. Tests validate values only when present, reflecting real-world data quality in public datasets.

**Year tolerance on date validation:** Some records in the 2024 endpoint contain dates from 2023, likely due to delayed data entry in the public health system.
Assertions accept a ±1 year tolerance to avoid false positives on known data quality issues at the source.

**Weekly scheduled runs:** The CI pipeline runs automatically every Monday, detecting structural or schema changes in the API before they impact downstream consumers.

---

## Running Locally
```bash
# Install dependencies
npm install

# Open Cypress interactive mode
npx cypress open

# Run all tests headless
npx cypress run

# Run a specific suite
npx cypress run --spec "cypress/e2e/03_api_pni_multi_year.cy.js"
```