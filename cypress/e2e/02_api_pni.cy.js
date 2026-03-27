describe('PNI 2025 - Validação da API de Doses Aplicadas', () => {

  const API_URL = 'https://apidadosabertos.saude.gov.br/vacinacao/doses-aplicadas-pni-2025'

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

  const UFS_VALIDAS = [
    'AC','AL','AP','AM','BA','CE','DF','ES','GO',
    'MA','MT','MS','MG','PA','PB','PR','PE','PI',
    'RJ','RN','RS','RO','RR','SC','SP','SE','TO'
  ]

  // ─── Bloco 1: Contrato da API ───────────────────────────────────────────

  describe('Contrato da API', () => {

    it('deve retornar status 200', () => {
      cy.request({ method: 'GET', url: API_URL, qs: { limit: 5, offset: 0 } })
        .then((response) => {
          expect(response.status).to.eq(200)
        })
    })

    it('deve retornar objeto com a chave doses_aplicadas_pni', () => {
      cy.request({ method: 'GET', url: API_URL, qs: { limit: 5, offset: 0 } })
        .then((response) => {
          expect(response.body).to.have.property('doses_aplicadas_pni')
          expect(response.body.doses_aplicadas_pni).to.be.an('array')
          expect(response.body.doses_aplicadas_pni.length).to.be.greaterThan(0)
        })
    })

    it('deve respeitar o parâmetro limit', () => {
      cy.request({ method: 'GET', url: API_URL, qs: { limit: 10, offset: 0 } })
        .then((response) => {
          expect(response.body.doses_aplicadas_pni.length).to.be.lte(10)
        })
    })

    it('deve retornar páginas diferentes com offset diferente', () => {
      let pagina1, pagina2

      cy.request({ method: 'GET', url: API_URL, qs: { limit: 5, offset: 0 } })
        .then((response) => {
          pagina1 = response.body.doses_aplicadas_pni[0].codigo_documento
        })

      cy.request({ method: 'GET', url: API_URL, qs: { limit: 5, offset: 5 } })
        .then((response) => {
          pagina2 = response.body.doses_aplicadas_pni[0].codigo_documento
          expect(pagina1).to.not.eq(pagina2)
        })
    })

    it('cada registro deve conter os campos obrigatórios', () => {
      cy.request({ method: 'GET', url: API_URL, qs: { limit: 10, offset: 0 } })
        .then((response) => {
          const registros = response.body.doses_aplicadas_pni
          registros.forEach((registro) => {
            CAMPOS_OBRIGATORIOS.forEach((campo) => {
              expect(registro, `campo ausente: ${campo}`).to.have.property(campo)
            })
          })
        })
    })

  })

  // ─── Bloco 2: Integridade dos Dados ────────────────────────────────────

  describe('Integridade dos Dados', () => {

    it('data_vacina deve estar no formato de data válido', () => {
      cy.request({ method: 'GET', url: API_URL, qs: { limit: 100, offset: 0 } })
        .then((response) => {
          const registros = response.body.doses_aplicadas_pni
          registros.forEach((registro) => {
            const data = new Date(registro.data_vacina)
            expect(data.toString()).to.not.eq('Invalid Date')
          })
        })
    })

    it('data_vacina deve ser do ano 2025', () => {
      cy.request({ method: 'GET', url: API_URL, qs: { limit: 100, offset: 0 } })
        .then((response) => {
          const registros = response.body.doses_aplicadas_pni
          registros.forEach((registro) => {
            const ano = new Date(registro.data_vacina).getFullYear()
            expect(ano).to.eq(2025)
          })
        })
    })

    it('sigla_uf_paciente deve ser uma UF brasileira válida', () => {
      cy.request({ method: 'GET', url: API_URL, qs: { limit: 100, offset: 0 } })
        .then((response) => {
          const registros = response.body.doses_aplicadas_pni
          registros.forEach((registro) => {
            expect(UFS_VALIDAS).to.include(
              registro.sigla_uf_paciente,
              `UF inválida encontrada: ${registro.sigla_uf_paciente}`
            )
          })
        })
    })

    it('tipo_sexo_paciente deve conter apenas valores válidos', () => {
      cy.request({ method: 'GET', url: API_URL, qs: { limit: 100, offset: 0 } })
        .then((response) => {
          const registros = response.body.doses_aplicadas_pni
          registros.forEach((registro) => {
            expect(['F', 'M', 'I']).to.include(registro.tipo_sexo_paciente)
          })
        })
    })

    it('codigo_paciente deve ter sempre 64 caracteres (SHA-256)', () => {
      cy.request({ method: 'GET', url: API_URL, qs: { limit: 100, offset: 0 } })
        .then((response) => {
          const registros = response.body.doses_aplicadas_pni
          registros.forEach((registro) => {
            expect(registro.codigo_paciente).to.have.length(64)
          })
        })
    })

    it('status_documento deve ser sempre final', () => {
      cy.request({ method: 'GET', url: API_URL, qs: { limit: 100, offset: 0 } })
        .then((response) => {
          const registros = response.body.doses_aplicadas_pni
          registros.forEach((registro) => {
            expect(registro.status_documento).to.eq('final')
          })
        })
    })

    it('nenhum registro deve ter município do paciente nulo ou vazio', () => {
      cy.request({ method: 'GET', url: API_URL, qs: { limit: 100, offset: 0 } })
        .then((response) => {
          const registros = response.body.doses_aplicadas_pni
          registros.forEach((registro) => {
            expect(registro.nome_municipio_paciente).to.not.be.null
            expect(registro.nome_municipio_paciente).to.not.eq('')
          })
        })
    })

  })

  // ─── Bloco 3: Edge Cases ───────────────────────────────────────────────

  describe('Edge Cases', () => {

    it('deve retornar array vazio ou válido com offset muito alto', () => {
      cy.request({
        method: 'GET',
        url: API_URL,
        qs: { limit: 10, offset: 999999 },
        failOnStatusCode: false
      }).then((response) => {
        expect([200, 404]).to.include(response.status)
        if (response.status === 200) {
          expect(response.body.doses_aplicadas_pni).to.be.an('array')
        }
      })
    })

    it('deve lidar com limit 1 sem quebrar', () => {
      cy.request({ method: 'GET', url: API_URL, qs: { limit: 1, offset: 0 } })
        .then((response) => {
          expect(response.status).to.eq(200)
          expect(response.body.doses_aplicadas_pni.length).to.eq(1)
        })
    })

    it('deve lidar com limit máximo (1000) sem quebrar', () => {
      cy.request({ method: 'GET', url: API_URL, qs: { limit: 1000, offset: 0 } })
        .then((response) => {
          expect(response.status).to.eq(200)
          expect(response.body.doses_aplicadas_pni.length).to.be.lte(1000)
        })
    })

  })

})