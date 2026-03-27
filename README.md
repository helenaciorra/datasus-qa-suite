# datasus-qa-suite

Automated test suite validating the integrity of public health vaccination data from Brazil's National Immunization Program (PNI) via the DATASUS Open Data API.

![CI](https://github.com/helenaciorra/datasus-qa-suite/actions/workflows/ci.yml/badge.svg)

## Overview

This project was built to demonstrate practical QA engineering skills using real-world public health data. It covers API contract validation, data integrity checks, edge case testing, and automated execution via CI/CD.

**Data source:** [Portal de Dados Abertos do SUS — PNI 2025](https://dadosabertos.saude.gov.br/dataset/doses-aplicadas-pelo-programa-de-nacional-de-imunizacoes-pni-2025)

## Tech Stack

- [Cypress](https://www.cypress.io/) — E2E and API testing
- [GitHub Actions](https://github.com/features/actions) — CI/CD pipeline (runs on every push + weekly schedule)
- Node.js

## Test Coverage

### E2E — Homepage (`01_homepage.cy.js`)
- Page loads successfully
- Main navigation is visible

### API — PNI 2025 Vaccination Data (`02_api_pni.cy.js`)

**Contract**
- Returns HTTP 200
- Response contains `doses_aplicadas_pni` array
- Respects `limit` parameter
- Returns different records with different `offset` values
- All required fields are present in every record

**Data Integrity**
- `data_vacina` is a valid date format
- `data_vacina` is within the year 2025
- `sigla_uf_paciente` is a valid Brazilian state code when populated
- `tipo_sexo_paciente` contains only valid values (`F`, `M`, `I`)
- `codigo_paciente` is always 64 characters (SHA-256 hash)
- `status_documento` is always `final`
- `nome_municipio_paciente` is never an empty string when populated

**Edge Cases**
- Handles very high `offset` values gracefully
- Returns exactly 1 record when `limit=1`
- Handles maximum `limit` (1000) without breaking

## Key Engineering Decisions

**API over UI:** The DATASUS portal uses a legacy form-submission architecture (no XHR). After mapping the network layer, the decision was made to test the REST API directly — more reliable, faster, and closer to the data source.

**Nullable field handling:** Fields like `sigla_uf_paciente` and `nome_municipio_paciente` are nullable in the API. Tests validate values only when present, reflecting real-world data quality in public datasets.

**Weekly scheduled runs:** The CI pipeline runs automatically every Monday, detecting structural changes in the API before they impact downstream consumers.

## Running Locally
```bash
# Install dependencies
npm install

# Open Cypress interactive mode
npx cypress open

# Run headless
npx cypress run
```

## Results

17 tests — 0 failures