// Endpoints available in the DATASUS Open Data API
// 2026 uses softer assertions — data is still being collected
const YEARS = [
  {
    year: 2020,
    endpoint: 'doses-aplicadas-pni-2020',
    current: false,
    campos: ['data_vacina', 'nome_municipio_paciente', 'uf_paciente', 'sg_vacina', 'descricao_dose_vacina', 'sexo_paciente', 'st_documento', 'codigo_paciente'],
    fields: { uf: 'uf_paciente', sexo: 'sexo_paciente', status: 'st_documento', municipio: 'nome_municipio_paciente' }
  },
  {
    year: 2021,
    endpoint: 'doses-aplicadas-pni-2021',
    current: false,
    campos: ['data_vacina', 'uf_paciente', 'sg_vacina', 'tipo_sexo_paciente', 'st_documento'],
    fields: { uf: 'uf_paciente', sexo: 'tipo_sexo_paciente', status: 'st_documento', municipio: null }
  },
  {
    year: 2022,
    endpoint: 'doses-aplicadas-pni-2022',
    current: false,
    campos: ['data_vacina', 'uf_paciente', 'nome_municipio_paciente', 'tipo__sexo_paciente', 'descricao_dose_vacina'],
    fields: { uf: 'uf_paciente', sexo: 'tipo__sexo_paciente', status: null, municipio: 'nome_municipio_paciente' }
  },
  {
    year: 2023,
    endpoint: 'doses-aplicadas-pni-2023',
    current: false,
    campos: ['data_vacina', 'uf_paciente', 'descricao_vacina', 'codigo_dose_vacina', 'codigo_paciente', 'situacao_documento'],
    fields: { uf: null, sexo: null, status: 'situacao_documento', municipio: null }
  },
  {
    year: 2024,
    endpoint: 'doses-aplicadas-pni-2024',
    current: false,
    campos: ['data_vacina', 'nome_municipio_paciente', 'sigla_uf_paciente', 'descricao_vacina', 'codigo_dose_vacina', 'tipo_sexo_paciente', 'status_documento', 'codigo_paciente'],
    fields: { uf: 'sigla_uf_paciente', sexo: 'tipo_sexo_paciente', status: 'status_documento', municipio: 'nome_municipio_paciente' }
  },
  {
    year: 2025,
    endpoint: 'doses-aplicadas-pni-2025',
    current: true, // endpoint not yet available
    campos: ['data_vacina', 'nome_municipio_paciente', 'sigla_uf_paciente', 'descricao_vacina', 'codigo_dose_vacina', 'tipo_sexo_paciente', 'status_documento', 'codigo_paciente'],
    fields: { uf: 'sigla_uf_paciente', sexo: 'tipo_sexo_paciente', status: 'status_documento', municipio: 'nome_municipio_paciente' }
  },
  {
    year: 2026,
    endpoint: 'doses-aplicadas-pni-2026',
    current: true,
    campos: ['data_vacina', 'nome_municipio_paciente', 'sigla_uf_paciente', 'descricao_vacina', 'codigo_dose_vacina', 'tipo_sexo_paciente', 'status_documento', 'codigo_paciente'],
    fields: { uf: 'sigla_uf_paciente', sexo: 'tipo_sexo_paciente', status: 'status_documento', municipio: 'nome_municipio_paciente' }
  },
]

const API_BASE = 'https://apidadosabertos.saude.gov.br/vacinacao'

const UFS_VALIDAS = [
  'AC','AL','AP','AM','BA','CE','DF','ES','GO',
  'MA','MT','MS','MG','PA','PB','PR','PE','PI',
  'RJ','RN','RS','RO','RR','SC','SP','SE','TO'
]

const CAMPOS_OBRIGATORIOS = [
  'data_vacina',
  'nome_municipio_paciente',
  'sigla_uf_paciente',
  'descricao_vacina',
  'codigo_dose_vacina',
  'tipo_sexo_paciente',
  'status_documento',
  'codigo_paciente'
]

YEARS.forEach(({ year, endpoint, current, campos, fields }) => {
  describe(`PNI ${year} - API Validation`, () => {

    const API_URL = `${API_BASE}/${endpoint}`

    describe('Contract', () => {

      it('should return HTTP 200', () => {
        cy.request({ method: 'GET', url: API_URL, qs: { limit: 5, offset: 0 }, failOnStatusCode: !current })
          .then((response) => {
            if (current && response.status !== 200) return // endpoint not yet available
            expect(response.status).to.eq(200)
          })
      })

      it('should return an object with doses_aplicadas_pni array', () => {
        cy.request({ method: 'GET', url: API_URL, qs: { limit: 5, offset: 0 }, failOnStatusCode: !current})
          .then((response) => {
            if (current && response.status !== 200) return
            expect(response.body).to.have.property('doses_aplicadas_pni')
            expect(response.body.doses_aplicadas_pni).to.be.an('array')
          })
      })

      it('should respect the limit parameter', () => {
        cy.request({ method: 'GET', url: API_URL, qs: { limit: 10, offset: 0 }, failOnStatusCode: !current })
          .then((response) => {
            if (current && response.status !== 200) return
            expect(response.body.doses_aplicadas_pni.length).to.be.lte(10)
          })
      })

      it('should contain required fields in every record', () => {
        cy.request({ method: 'GET', url: API_URL, qs: { limit: 10, offset: 0 }, failOnStatusCode: !current })
          .then((response) => {
            if (current && response.status !== 200) return
            const registros = response.body.doses_aplicadas_pni
            if (current && response.status !== 200) return
            if (current && registros.length === 0) return
            registros.forEach((registro) => {
              campos.forEach((campo) => {
                expect(registro, `missing field: ${campo}`).to.have.property(campo)
              })
            })
          })
      })

    })

    describe('Data Integrity', () => {

      it('data_vacina should be a valid date', () => {
        cy.request({ method: 'GET', url: API_URL, qs: { limit: 100, offset: 0 }, failOnStatusCode: !current })
          .then((response) => {
            const registros = response.body.doses_aplicadas_pni
            if (current && response.status !== 200) return
            if (current && registros.length === 0) return
            registros.forEach((registro) => {
              expect(new Date(registro.data_vacina).toString()).to.not.eq('Invalid Date')
            })
          })
      })

      it(`data_vacina should be within year ${year}`, () => {
        cy.request({ method: 'GET', url: API_URL, qs: { limit: 100, offset: 0 }, failOnStatusCode: !current })
          .then((response) => {
            const registros = response.body.doses_aplicadas_pni
            if (current && response.status !== 200) return
            if (current && registros.length === 0) return
            registros.forEach((registro) => {
              const recordYear = new Date(registro.data_vacina).getFullYear()
              expect(recordYear).to.be.within(year - 1, year)
            })
          })
      })

      it('UF field should be a valid Brazilian state when populated', () => {
        if (!fields.uf) return
        cy.request({ method: 'GET', url: API_URL, qs: { limit: 100, offset: 0 }, failOnStatusCode: !current })
          .then((response) => {
            const registros = response.body.doses_aplicadas_pni
            if (current && response.status !== 200) return
            if (current && registros.length === 0) return
            registros.forEach((registro) => {
              if (registro[fields.uf] !== null) {
                expect(UFS_VALIDAS).to.include(registro[fields.uf], `invalid UF: ${registro[fields.uf]}`)
              }
            })
          })
      })

      it('sex field should only contain valid values when populated', () => {
        if (!fields.sexo) return
        cy.request({ method: 'GET', url: API_URL, qs: { limit: 100, offset: 0 }, failOnStatusCode: !current })
          .then((response) => {
            const registros = response.body.doses_aplicadas_pni
            if (current && response.status !== 200) return
            if (current && registros.length === 0) return
            registros.forEach((registro) => {
              if (registro[fields.sexo] !== null) {
                expect(['F', 'M', 'I']).to.include(registro[fields.sexo])
              }
            })
          })
      })

      it('codigo_paciente should always be 64 characters (SHA-256)', () => {
        cy.request({ method: 'GET', url: API_URL, qs: { limit: 100, offset: 0 }, failOnStatusCode: !current })
            .then((response) => {
            const registros = response.body.doses_aplicadas_pni
            if (current && response.status !== 200) return
            if (current && registros.length === 0) return
            registros.forEach((registro) => {
                if (registro.codigo_paciente != null) {
                expect(registro.codigo_paciente).to.have.length(64)
                }
            })
            })
        })

      it('status field should be a non-empty string when populated', () => {
        if (!fields.status) return
        cy.request({ method: 'GET', url: API_URL, qs: { limit: 100, offset: 0 }, failOnStatusCode: !current })
          .then((response) => {
            const registros = response.body.doses_aplicadas_pni
            if (current && response.status !== 200) return
            if (current && registros.length === 0) return
            registros.forEach((registro) => {
              if (registro[fields.status] !== null) {
                expect(registro[fields.status]).to.not.eq('')
              }
            })
          })
      })

      it('municipality field should not be empty string when populated', () => {
        if (!fields.municipio) return
        cy.request({ method: 'GET', url: API_URL, qs: { limit: 100, offset: 0 }, failOnStatusCode: !current })
          .then((response) => {
            const registros = response.body.doses_aplicadas_pni
            if (current && response.status !== 200) return
            if (current && registros.length === 0) return
            registros.forEach((registro) => {
              if (registro[fields.municipio] !== null) {
                expect(registro[fields.municipio]).to.not.eq('')
              }
            })
          })
      })

    })

    describe('Edge Cases', () => {

      it('should handle very high offset gracefully', () => {
        cy.request({
          method: 'GET', url: API_URL,
          qs: { limit: 10, offset: 999999 },
          failOnStatusCode: false
        }).then((response) => {
          expect([200, 404]).to.include(response.status)
          if (response.status === 200) {
            expect(response.body.doses_aplicadas_pni).to.be.an('array')
          }
        })
      })

      it('should handle limit 1 without breaking', () => {
        cy.request({ method: 'GET', url: API_URL, qs: { limit: 1, offset: 0 } })
          .then((response) => {
            expect(response.status).to.eq(200)
            expect(response.body.doses_aplicadas_pni.length).to.be.lte(1)
          })
      })

    })

  })
})