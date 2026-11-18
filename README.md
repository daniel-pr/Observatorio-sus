# 🏥 Observatório SIH/SUS
### Análise Exploratória de Dados de Internações Hospitalares no Brasil

O **Observatório SIH/SUS** é um projeto de análise exploratória de dados (EDA) desenvolvido com o objetivo de transformar dados públicos de internações hospitalares do Sistema Único de Saúde (SUS) em informações visuais e interativas.

O projeto utiliza dados do **Sistema de Informações Hospitalares do SUS (SIH/SUS)**, disponibilizados pelo DATASUS, permitindo explorar indicadores relacionados às internações, mortalidade, doenças, distribuição geográfica e custos hospitalares.

🔗 **[Acessar o Dashboard](https://daniel-pr.github.io/Observatorio-sus/)**

---

## 🎯 Objetivos do Projeto

- Explorar os dados públicos de internações hospitalares do SUS.
- Identificar padrões e tendências nas internações ao longo do tempo.
- Analisar a distribuição das internações entre os estados brasileiros.
- Investigar as principais causas de internação com base na classificação CID-10.
- Comparar indicadores de internações e óbitos.
- Explorar os custos associados às internações hospitalares.
- Transformar grandes volumes de dados em informações acessíveis por meio de visualizações interativas.

## 📊 Dashboard

O dashboard foi desenvolvido para facilitar a exploração dos dados por meio de filtros e visualizações interativas.

### Principais funcionalidades

- **Indicadores:** acompanhamento dos principais números de internações e óbitos.
- **Série temporal:** análise da evolução das internações ao longo do tempo.
- **Perfil epidemiológico:** exploração das características das internações.
- **CID-10:** identificação e análise das principais causas de internação.
- **Custos hospitalares:** exploração dos valores associados às internações.
- **Filtros por estado:** possibilidade de selecionar e comparar diferentes unidades federativas.
- **Exportação de dados:** opção para baixar os dados filtrados em formato CSV.

## 🛠️ Tecnologias e Ferramentas

| Tecnologia | Aplicação |
|---|---|
| Python | Extração e processamento dos dados |
| PySUS | Acesso aos arquivos públicos do SIH/SUS |
| Jupyter Notebook | Exploração e preparação dos dados |
| HTML5 | Estrutura do dashboard |
| CSS3 | Estilização e responsividade |
| JavaScript | Processamento dos dados e interatividade |
| Plotly.js | Construção de gráficos interativos |
| GitHub Pages | Hospedagem do dashboard |

## 📁 Estrutura do Projeto

```text
Observatorio-sus/
│
├── data/
│   └── Arquivos de dados utilizados no dashboard
│
├── app.js
│   └── Lógica e processamento das visualizações
│
├── index.html
│   └── Estrutura principal do dashboard
│
├── style.css
│   └── Estilos e layout da aplicação
│
├── package.json
│   └── Configurações do projeto
│
└── README.md
    └── Documentação do projeto
```

## 📚 Fonte dos Dados

Os dados utilizados são provenientes do **Sistema de Informações Hospitalares do SUS (SIH/SUS)**, disponibilizados pelo Departamento de Informática do Sistema Único de Saúde (DATASUS).

- [DATASUS](https://datasus.saude.gov.br/)
- [Transferência de Arquivos DATASUS](https://datasus.saude.gov.br/transferencia-de-arquivos/)

Os arquivos são processados para possibilitar sua utilização nas análises e visualizações do dashboard.

## 🔎 Metodologia

O desenvolvimento do projeto envolve as seguintes etapas:

1. **Coleta:** obtenção dos dados públicos de internações hospitalares do SIH/SUS.
2. **Extração:** utilização de ferramentas de processamento para acessar os arquivos disponibilizados pelo DATASUS.
3. **Tratamento:** organização e preparação dos dados para análise.
4. **Análise exploratória (EDA):** investigação de padrões, distribuições, tendências e possíveis relações entre variáveis.
5. **Visualização:** construção de indicadores e gráficos interativos.
6. **Publicação:** disponibilização dos resultados por meio do GitHub Pages.

## 💡 Objetivo de Aprendizado

Este projeto também faz parte da minha jornada de desenvolvimento profissional na área de **Análise de Dados**, colocando em prática conhecimentos de:

- Extração e manipulação de dados.
- Análise exploratória de dados (EDA).
- Python e SQL.
- Construção de indicadores.
- Visualização e interpretação de dados.
- Desenvolvimento de dashboards.

## ⚠️ Observações

Este projeto possui finalidade educacional e analítica, utilizando dados públicos disponibilizados pelo DATASUS.

Os indicadores apresentados dependem da disponibilidade, atualização e processamento dos arquivos de origem. Os dados devem ser interpretados considerando possíveis limitações e particularidades dos registros administrativos do SIH/SUS.

---

## 👨‍💻 Autor

**Daniel Protopapa**

Projeto desenvolvido como parte do meu portfólio de estudos e práticas em Análise de Dados.

- GitHub: [@daniel-pr](https://github.com/daniel-pr)
- Projeto: [Observatório SIH/SUS](https://github.com/daniel-pr/Observatorio-sus)
- Dashboard: [Acessar Observatório](https://daniel-pr.github.io/Observatorio-sus/)

---

⭐ Se este projeto for útil para você, considere deixar uma estrela no repositório!
