describe('PNI 2025 - Validação da API de Doses Aplicadas', () => {

  const API_URL = 'https://apidadosabertos.saude.gov.br/vacinacao/doses-aplicadas-pni-2025'

  // Campos obrigatórios mapeados da resposta real da API
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

  it('deve retornar status 200', () => {
    cy.request({
      method: 'GET',
      url: API_URL,
      qs: { limit: 5, offset: 0 }
    }).then((response) => {
      expect(response.status).to.eq(200)
    })
  })

  it('deve retornar objeto com a chave doses_aplicadas_pni', () => {
    cy.request({
      method: 'GET',
      url: API_URL,
      qs: { limit: 5, offset: 0 }
    }).then((response) => {
      expect(response.body).to.have.property('doses_aplicadas_pni')
      expect(response.body.doses_aplicadas_pni).to.be.an('array')
      expect(response.body.doses_aplicadas_pni.length).to.be.greaterThan(0)
    })
  })

  it('cada registro deve conter os campos obrigatórios', () => {
    cy.request({
      method: 'GET',
      url: API_URL,
      qs: { limit: 10, offset: 0 }
    }).then((response) => {
      const registros = response.body.doses_aplicadas_pni
      registros.forEach((registro) => {
        CAMPOS_OBRIGATORIOS.forEach((campo) => {
          expect(registro, `campo ausente: ${campo}`).to.have.property(campo)
        })
      })
    })
  })

  it('nenhum registro deve ter município do paciente nulo ou vazio', () => {
    cy.request({
      method: 'GET',
      url: API_URL,
      qs: { limit: 100, offset: 0 }
    }).then((response) => {
      const registros = response.body.doses_aplicadas_pni
      registros.forEach((registro) => {
        expect(registro.nome_municipio_paciente).to.not.be.null
        expect(registro.nome_municipio_paciente).to.not.eq('')
      })
    })
  })

  it('nenhum registro deve ter data de vacinação nula ou vazia', () => {
    cy.request({
      method: 'GET',
      url: API_URL,
      qs: { limit: 100, offset: 0 }
    }).then((response) => {
      const registros = response.body.doses_aplicadas_pni
      registros.forEach((registro) => {
        expect(registro.data_vacina).to.not.be.null
        expect(registro.data_vacina).to.not.eq('')
      })
    })
  })

  it('tipo_sexo_paciente deve conter apenas valores válidos', () => {
    cy.request({
      method: 'GET',
      url: API_URL,
      qs: { limit: 100, offset: 0 }
    }).then((response) => {
      const registros = response.body.doses_aplicadas_pni
      const valoresValidos = ['F', 'M', 'I']
      registros.forEach((registro) => {
        expect(valoresValidos).to.include(registro.tipo_sexo_paciente)
      })
    })
  })

  it('status_documento deve ser sempre final', () => {
    cy.request({
      method: 'GET',
      url: API_URL,
      qs: { limit: 100, offset: 0 }
    }).then((response) => {
      const registros = response.body.doses_aplicadas_pni
      registros.forEach((registro) => {
        expect(registro.status_documento).to.eq('final')
      })
    })
  })

})