(() => {
  "use strict";

  const MESES_CURTOS = [
    "Jan", "Fev", "Mar", "Abr", "Mai", "Jun",
    "Jul", "Ago", "Set", "Out", "Nov", "Dez"
  ];

  const MESES_COMPLETOS = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ];

  const fmtInt = new Intl.NumberFormat("pt-BR", {
    maximumFractionDigits: 0
  });

  const fmtDec1 = new Intl.NumberFormat("pt-BR", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1
  });

  const fmtDec2 = new Intl.NumberFormat("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });

  const fmtBRL = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL"
  });

  const state = {
    index: null,
    usandoExemplo: false,
    ufCache: new Map(),
    ufCidCache: new Map(),
    selectedUFs: new Set(),
    anoInicio: null,
    anoFim: null,
    selectedCids: new Set(),
    sexo: "todos",
    filteredRows: [],
    isLoading: false,
    lastThemeDark: window.matchMedia("(prefers-color-scheme: dark)").matches,

    cidSectionOpen: false,
    cidTopN: 20,
    cidCatalogo: [],
    cidCatalogoMap: new Map(),
    selectedCid3: new Set(),
    cid3Inicializado: false,
    cidFoco: null,
    cidAggregatedList: [],
    cidFilteredRows: [],
    cidBindingsAttached: new Set()
  };

  const els = {
    pageMeta: document.getElementById("page-meta"),
    bannerExemplo: document.getElementById("banner-exemplo"),
    bannerErro: document.getElementById("banner-erro"),
    bannerErroTexto: document.getElementById("banner-erro-texto"),
    btnRetry: document.getElementById("btn-retry"),
    loadingIndicator: document.getElementById("loading-indicator"),
    loadingText: document.getElementById("loading-text"),

    triggerUf: document.getElementById("trigger-uf"),
    textUf: document.getElementById("text-uf"),
    popoverUf: document.getElementById("popover-uf"),
    optionsUf: document.getElementById("options-uf"),
    btnUfTodas: document.getElementById("btn-uf-todas"),
    btnUfPrimeira: document.getElementById("btn-uf-primeira"),

    anoInicio: document.getElementById("filter-ano-inicio"),
    anoFim: document.getElementById("filter-ano-fim"),

    triggerCid: document.getElementById("trigger-cid"),
    textCid: document.getElementById("text-cid"),
    popoverCid: document.getElementById("popover-cid"),
    optionsCid: document.getElementById("options-cid"),
    searchCid: document.getElementById("search-cid"),
    btnCidTodos: document.getElementById("btn-cid-todos"),
    btnCidNenhum: document.getElementById("btn-cid-nenhum"),

    sexo: document.getElementById("filter-sexo"),
    btnReset: document.getElementById("btn-reset-filters"),
    btnEmptyReset: document.getElementById("btn-empty-reset"),
    btnExportCsv: document.getElementById("btn-export-csv"),

    kpiInternacoes: document.getElementById("kpi-internacoes"),
    kpiObitos: document.getElementById("kpi-obitos"),
    kpiMortalidade: document.getElementById("kpi-mortalidade"),
    kpiCustoTotal: document.getElementById("kpi-custo-total"),
    kpiCustoMedio: document.getElementById("kpi-custo-medio"),
    kpiPermanencia: document.getElementById("kpi-permanencia"),

    emptyState: document.getElementById("empty-state"),
    chartsSection: document.getElementById("charts-section"),

    navDoencas: document.getElementById("nav-doencas"),
    btnToggleCidSection: document.getElementById("btn-toggle-cid-section"),
    cidToggleLabel: document.getElementById("cid-toggle-label"),
    cidSectionBody: document.getElementById("cid-section-body"),
    cidLoadingIndicator: document.getElementById("cid-loading-indicator"),
    cidLoadingText: document.getElementById("cid-loading-text"),
    cidErrorBanner: document.getElementById("cid-error-banner"),
    cidErrorText: document.getElementById("cid-error-text"),
    btnCidRetry: document.getElementById("btn-cid-retry"),
    cidControls: document.getElementById("cid-controls"),
    cidScopeInfo: document.getElementById("cid-scope-info"),

    triggerCid3: document.getElementById("trigger-cid3"),
    textCid3: document.getElementById("text-cid3"),
    popoverCid3: document.getElementById("popover-cid3"),
    optionsCid3: document.getElementById("options-cid3"),
    searchCid3: document.getElementById("search-cid3"),
    btnCid3Todos: document.getElementById("btn-cid3-todos"),
    btnCid3Nenhum: document.getElementById("btn-cid3-nenhum"),
    btnCid3Reset: document.getElementById("btn-cid3-reset"),

    cidEmptyState: document.getElementById("cid-empty-state"),
    cidChartsContent: document.getElementById("cid-charts-content"),
    cidTopIntTitle: document.getElementById("cid-top-int-title"),
    cidMortEmpty: document.getElementById("cid-mort-empty"),
    chartCidMortEl: document.getElementById("chart-cid3-mortalidade"),
    cidDetailKpis: document.getElementById("cid-detail-kpis"),
    selectCidFoco: document.getElementById("select-cid-foco"),

    footerFonte: document.getElementById("footer-fonte"),
    footerGerado: document.getElementById("footer-gerado")
  };

  function criarDadosExemploEmMemoria() {
    const index = {
      gerado_em: new Date().toISOString(),
      fonte: "SIH/DATASUS — Dados de exemplo (fictícios)",
      ufs: ["SE"],
      anos: [2021, 2022, 2023, 2024, 2025],
      dicionarios: {
        cid_capitulo: [
          "I. Algumas doenças infecciosas e parasitárias",
          "II. Neoplasias (tumores)",
          "IV. Doenças endócrinas, nutricionais e metabólicas",
          "V. Transtornos mentais e comportamentais",
          "VI. Doenças do sistema nervoso",
          "IX. Doenças do aparelho circulatório",
          "X. Doenças do aparelho respiratório",
          "XI. Doenças do aparelho digestivo",
          "XIV. Doenças do aparelho geniturinário",
          "XV. Gravidez, parto e puerpério",
          "XIX. Lesões, envenenamentos e causas externas",
          "XXI. Fatores que influenciam o estado de saúde"
        ],
        faixa_etaria: ["<1", "1-4", "5-14", "15-24", "25-39", "40-59", "60-79", "80+"],
        sexo: ["Masculino", "Feminino", "Ignorado"]
      },
      colunas: [
        "ano", "mes", "cid_capitulo", "faixa_etaria", "sexo",
        "internacoes", "obitos", "valor_total", "dias_perm_total"
      ]
    };

    let seed = 20261110;
    const rand = () => {
      seed |= 0;
      seed = (seed + 0x6d2b79f5) | 0;
      let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };

    const colunas = {
      ano: [], mes: [], cid_capitulo: [], faixa_etaria: [], sexo: [],
      internacoes: [], obitos: [], valor_total: [], dias_perm_total: []
    };

    const cidPerfil = [
      { peso: 1.2, mort: 0.065, custo: 1650, perm: 6.2 },
      { peso: 1.0, mort: 0.095, custo: 3400, perm: 7.4 },
      { peso: 0.6, mort: 0.038, custo: 1450, perm: 5.1 },
      { peso: 0.5, mort: 0.008, custo: 1900, perm: 14.5 },
      { peso: 0.45, mort: 0.042, custo: 2250, perm: 6.0 },
      { peso: 1.5, mort: 0.088, custo: 3850, perm: 6.8 },
      { peso: 1.45, mort: 0.072, custo: 1980, perm: 5.9 },
      { peso: 1.1, mort: 0.031, custo: 1720, perm: 4.3 },
      { peso: 0.9, mort: 0.029, custo: 1580, perm: 4.5 },
      { peso: 1.7, mort: 0.002, custo: 1120, perm: 2.6 },
      { peso: 1.25, mort: 0.035, custo: 2150, perm: 5.2 },
      { peso: 0.4, mort: 0.012, custo: 980, perm: 3.1 }
    ];
    const faixaMortMult = [1.4, 0.35, 0.2, 0.28, 0.42, 0.85, 1.55, 2.6];
    const faixaPermMult = [1.3, 0.75, 0.65, 0.7, 0.8, 1.0, 1.25, 1.5];

    for (let i = 0; i < 510; i++) {
      const ano = index.anos[i % index.anos.length];
      const mes = (Math.floor(i / index.anos.length) % 12) + 1;
      const cid = (i * 7 + Math.floor(rand() * 12)) % 12;
      let faixa = (i * 3 + Math.floor(rand() * 8)) % 8;
      let sexo = rand() < 0.015 ? 2 : rand() < 0.52 ? 1 : 0;

      if (cid === 9) {
        sexo = 1;
        faixa = rand() < 0.45 ? 3 : 4;
      }

      const perfil = cidPerfil[cid];
      const anoFator = 1 + (ano - 2021) * 0.045;
      const sazonal = (cid === 6 || cid === 0) && mes >= 4 && mes <= 8 ? 1.32 : 1.0;
      const sexoFator = sexo === 2 ? 0.08 : 1.0;

      const baseInt = Math.max(
        1,
        Math.round((14 + rand() * 58) * perfil.peso * anoFator * sazonal * sexoFator)
      );
      const probMort = Math.min(
        0.45,
        perfil.mort * faixaMortMult[faixa] * (0.85 + rand() * 0.35)
      );
      const obitos = Math.min(baseInt, Math.round(baseInt * probMort));
      const permMedia = Math.max(
        1.1,
        perfil.perm * faixaPermMult[faixa] * (0.8 + rand() * 0.4)
      );
      const diasPerm = Math.max(baseInt, Math.round(baseInt * permMedia));
      const inflacao = 1 + (ano - 2021) * 0.06;
      const custoUnit =
        perfil.custo * inflacao * (0.78 + rand() * 0.48) * (0.85 + 0.15 * faixaPermMult[faixa]);
      const valorTotal = Number((baseInt * custoUnit).toFixed(2));

      colunas.ano.push(ano);
      colunas.mes.push(mes);
      colunas.cid_capitulo.push(cid);
      colunas.faixa_etaria.push(faixa);
      colunas.sexo.push(sexo);
      colunas.internacoes.push(baseInt);
      colunas.obitos.push(obitos);
      colunas.valor_total.push(valorTotal);
      colunas.dias_perm_total.push(diasPerm);
    }

    return { index, ufData: { SE: { colunas } } };
  }

  function formatarDataHora(isoString) {
    if (!isoString) return "—";
    const dt = new Date(isoString);
    if (Number.isNaN(dt.getTime())) return String(isoString);
    return new Intl.DateTimeFormat("pt-BR", {
      dateStyle: "long",
      timeStyle: "short"
    }).format(dt);
  }

  function setLoading(ativo, texto = "Carregando dados...") {
    state.isLoading = ativo;
    els.loadingText.textContent = texto;
    els.loadingIndicator.hidden = !ativo;
  }

  function mostrarErro(mensagem) {
    if (!mensagem) {
      els.bannerErro.hidden = true;
      return;
    }
    els.bannerErroTexto.textContent = mensagem;
    els.bannerErro.hidden = false;
  }

  function validarEstruturaUF(dados, uf) {
    if (!dados || !dados.colunas) {
      throw new Error(`Arquivo da UF ${uf} sem o objeto "colunas".`);
    }
    const obrigatorias = [
      "ano", "mes", "cid_capitulo", "faixa_etaria", "sexo",
      "internacoes", "obitos", "valor_total", "dias_perm_total"
    ];
    let tamanho = null;
    for (const col of obrigatorias) {
      const arr = dados.colunas[col];
      if (!Array.isArray(arr)) {
        throw new Error(`Coluna "${col}" ausente no arquivo da UF ${uf}.`);
      }
      if (tamanho === null) {
        tamanho = arr.length;
      } else if (arr.length !== tamanho) {
        throw new Error(`Colunas com tamanhos divergentes no arquivo da UF ${uf}.`);
      }
    }
    return dados;
  }

  async function carregarIndex() {
    try {
      const res = await fetch("data/index.json", { cache: "no-cache" });
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      const json = await res.json();
      if (!json || !Array.isArray(json.ufs) || json.ufs.length === 0) {
        throw new Error("Catálogo de UFs vazio ou inválido.");
      }
      state.index = json;
      state.usandoExemplo = false;
      els.bannerExemplo.hidden = true;
    } catch (_err) {
      const exemplo = criarDadosExemploEmMemoria();
      state.index = exemplo.index;
      state.usandoExemplo = true;
      for (const [uf, payload] of Object.entries(exemplo.ufData)) {
        state.ufCache.set(uf, payload);
      }
      els.bannerExemplo.hidden = false;
    }
  }

  async function carregarUF(uf) {
    if (state.ufCache.has(uf)) {
      return state.ufCache.get(uf);
    }
    const caminho = `data/uf/${encodeURIComponent(uf)}.json`;
    const res = await fetch(caminho);
    if (!res.ok) {
      throw new Error(`Falha ao baixar ${caminho} (HTTP ${res.status}).`);
    }
    const json = await res.json();
    const validado = validarEstruturaUF(json, uf);
    state.ufCache.set(uf, validado);
    return validado;
  }

  async function garantirUFsSelecionadas() {
    const ufs = Array.from(state.selectedUFs);
    const faltantes = ufs.filter((uf) => !state.ufCache.has(uf));

    if (faltantes.length === 0) {
      mostrarErro(null);
      return;
    }

    setLoading(
      true,
      faltantes.length === 1
        ? `Baixando dados de ${faltantes[0]}...`
        : `Baixando dados de ${faltantes.length} UFs (${faltantes.join(", ")})...`
    );
    mostrarErro(null);

    try {
      const resultados = await Promise.allSettled(faltantes.map((uf) => carregarUF(uf)));
      const falhas = [];
      resultados.forEach((r, idx) => {
        if (r.status === "rejected") {
          falhas.push(`${faltantes[idx]} (${r.reason?.message || "erro de rede"})`);
        }
      });

      if (falhas.length > 0) {
        mostrarErro(`Não foi possível carregar: ${falhas.join("; ")}.`);
      }
    } finally {
      setLoading(false);
    }
  }

  function popularFiltros() {
    const { ufs, anos, dicionarios } = state.index;
    const anosOrdenados = [...anos].sort((a, b) => a - b);

    // Defaults
    state.selectedUFs = new Set([ufs[0]]);
    state.anoInicio = anosOrdenados[0];
    state.anoFim = anosOrdenados[anosOrdenados.length - 1];
    state.selectedCids = new Set(dicionarios.cid_capitulo.map((_, idx) => idx));
    state.sexo = "todos";

    // Options UF
    els.optionsUf.innerHTML = "";
    ufs.forEach((uf) => {
      const label = document.createElement("label");
      label.className = "option-row";

      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.value = uf;
      checkbox.checked = state.selectedUFs.has(uf);
      checkbox.addEventListener("change", async () => {
        if (checkbox.checked) {
          state.selectedUFs.add(uf);
        } else {
          state.selectedUFs.delete(uf);
        }
        atualizarTextoMultiselectUF();
        await garantirUFsSelecionadas();
        if (state.cidSectionOpen) {
          await garantirUFsCidSelecionadas();
          reconstruirCatalogoCid3();
        } else {
          state.cid3Inicializado = false;
        }
        atualizarDashboard();
      });

      const span = document.createElement("span");
      span.textContent = uf;

      label.append(checkbox, span);
      els.optionsUf.appendChild(label);
    });

    // Anos
    els.anoInicio.innerHTML = "";
    els.anoFim.innerHTML = "";
    anosOrdenados.forEach((ano) => {
      const opt1 = document.createElement("option");
      opt1.value = String(ano);
      opt1.textContent = String(ano);
      els.anoInicio.appendChild(opt1);

      const opt2 = document.createElement("option");
      opt2.value = String(ano);
      opt2.textContent = String(ano);
      els.anoFim.appendChild(opt2);
    });
    els.anoInicio.value = String(state.anoInicio);
    els.anoFim.value = String(state.anoFim);

    // CID-10
    els.optionsCid.innerHTML = "";
    dicionarios.cid_capitulo.forEach((nome, idx) => {
      const label = document.createElement("label");
      label.className = "option-row";
      label.dataset.search = nome.toLowerCase();

      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.value = String(idx);
      checkbox.checked = state.selectedCids.has(idx);
      checkbox.addEventListener("change", () => {
        if (checkbox.checked) {
          state.selectedCids.add(idx);
        } else {
          state.selectedCids.delete(idx);
        }
        atualizarTextoMultiselectCID();
        atualizarDashboard();
      });

      const span = document.createElement("span");
      span.textContent = nome;

      label.append(checkbox, span);
      els.optionsCid.appendChild(label);
    });

    // Sexo
    els.sexo.innerHTML = "";
    const optTodos = document.createElement("option");
    optTodos.value = "todos";
    optTodos.textContent = "Todos";
    els.sexo.appendChild(optTodos);

    dicionarios.sexo.forEach((labelSexo, idx) => {
      const opt = document.createElement("option");
      opt.value = String(idx);
      opt.textContent = labelSexo;
      els.sexo.appendChild(opt);
    });
    els.sexo.value = "todos";

    atualizarTextoMultiselectUF();
    atualizarTextoMultiselectCID();

    els.footerFonte.textContent = `Fonte: ${state.index.fonte || "SIH/DATASUS"}`;
    els.footerGerado.textContent = `Gerado em: ${formatarDataHora(state.index.gerado_em)}`;
  }

  function sincronizarCheckboxesUF() {
    const inputs = els.optionsUf.querySelectorAll('input[type="checkbox"]');
    inputs.forEach((input) => {
      input.checked = state.selectedUFs.has(input.value);
    });
    atualizarTextoMultiselectUF();
  }

  function sincronizarCheckboxesCID() {
    const inputs = els.optionsCid.querySelectorAll('input[type="checkbox"]');
    inputs.forEach((input) => {
      input.checked = state.selectedCids.has(Number(input.value));
    });
    atualizarTextoMultiselectCID();
  }

  function atualizarTextoMultiselectUF() {
    const total = state.index.ufs.length;
    const sel = Array.from(state.selectedUFs);
    if (sel.length === 0) {
      els.textUf.textContent = "Nenhuma UF";
    } else if (sel.length === total && total > 1) {
      els.textUf.textContent = `Todas (${total} UFs)`;
    } else if (sel.length <= 3) {
      els.textUf.textContent = sel.join(", ");
    } else {
      els.textUf.textContent = `${sel.length} UFs selecionadas`;
    }
  }

  function atualizarTextoMultiselectCID() {
    const total = state.index.dicionarios.cid_capitulo.length;
    const qtd = state.selectedCids.size;
    if (qtd === 0) {
      els.textCid.textContent = "Nenhum capítulo";
    } else if (qtd === total) {
      els.textCid.textContent = "Todos os capítulos";
    } else if (qtd === 1) {
      const idx = Array.from(state.selectedCids)[0];
      els.textCid.textContent = state.index.dicionarios.cid_capitulo[idx];
    } else {
      els.textCid.textContent = `${qtd} de ${total} capítulos`;
    }
  }

  function filtrarDados() {
    const linhas = [];
    const sexoFiltro = state.sexo === "todos" ? null : Number(state.sexo);

    for (const uf of state.selectedUFs) {
      const payload = state.ufCache.get(uf);
      if (!payload) continue;

      const c = payload.colunas;
      const n = c.ano.length;

      for (let i = 0; i < n; i++) {
        const ano = c.ano[i];
        if (ano < state.anoInicio || ano > state.anoFim) continue;

        const cid = c.cid_capitulo[i];
        if (!state.selectedCids.has(cid)) continue;

        const sexo = c.sexo[i];
        if (sexoFiltro !== null && sexo !== sexoFiltro) continue;

        linhas.push({
          uf,
          ano,
          mes: c.mes[i],
          cid_capitulo: cid,
          faixa_etaria: c.faixa_etaria[i],
          sexo,
          internacoes: c.internacoes[i],
          obitos: c.obitos[i],
          valor_total: c.valor_total[i],
          dias_perm_total: c.dias_perm_total[i]
        });
      }
    }

    state.filteredRows = linhas;
    return linhas;
  }

  function atualizarKPIs(linhas) {
    let totalInt = 0;
    let totalObt = 0;
    let totalValor = 0;
    let totalDias = 0;

    for (let i = 0; i < linhas.length; i++) {
      const r = linhas[i];
      totalInt += r.internacoes;
      totalObt += r.obitos;
      totalValor += r.valor_total;
      totalDias += r.dias_perm_total;
    }

    els.kpiInternacoes.textContent = fmtInt.format(totalInt);
    els.kpiObitos.textContent = fmtInt.format(totalObt);

    if (totalInt > 0) {
      const mortalidade = (totalObt / totalInt) * 100;
      const custoMedio = totalValor / totalInt;
      const permMedia = totalDias / totalInt;

      els.kpiMortalidade.textContent = `${fmtDec2.format(mortalidade)}%`;
      els.kpiCustoTotal.textContent = fmtBRL.format(totalValor);
      els.kpiCustoMedio.textContent = fmtBRL.format(custoMedio);
      els.kpiPermanencia.textContent = `${fmtDec1.format(permMedia)} dias`;
    } else {
      els.kpiMortalidade.textContent = "—";
      els.kpiCustoTotal.textContent = fmtBRL.format(0);
      els.kpiCustoMedio.textContent = "—";
      els.kpiPermanencia.textContent = "—";
    }
  }

  function getPlotlyTheme() {
    const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    return {
      isDark,
      paperBg: isDark ? "#111925" : "#ffffff",
      plotBg: isDark ? "#111925" : "#ffffff",
      text: isDark ? "#e2e8f0" : "#0f172a",
      muted: isDark ? "#94a3b8" : "#475569",
      grid: isDark ? "#233044" : "#e2e8f0",
      zeroLine: isDark ? "#33445d" : "#cbd5e1",
      hoverBg: isDark ? "#182232" : "#0f172a",
      hoverText: "#f8fafc",
      accent: isDark ? "#2dd4bf" : "#0f766e",
      palette: isDark
        ? ["#2dd4bf", "#60a5fa", "#fbbf24", "#a78bfa", "#f87171", "#94a3b8"]
        : ["#0f766e", "#2563eb", "#d97706", "#7c3aed", "#dc2626", "#64748b"],
      heatscale: isDark
        ? [
            [0, "#132234"],
            [0.35, "#115e59"],
            [0.7, "#14b8a6"],
            [1, "#99f6e4"]
          ]
        : [
            [0, "#f1f5f9"],
            [0.35, "#99f6e4"],
            [0.7, "#0d9488"],
            [1, "#134e4a"]
          ]
    };
  }

  function baseLayout(theme, extra = {}) {
    return {
      paper_bgcolor: theme.paperBg,
      plot_bgcolor: theme.plotBg,
      font: {
        family: '"Plus Jakarta Sans", "Avenir Next", "Segoe UI", system-ui, sans-serif',
        color: theme.text,
        size: 12
      },
      separators: ",.",
      hoverlabel: {
        bgcolor: theme.hoverBg,
        bordercolor: theme.grid,
        font: { color: theme.hoverText, size: 12 }
      },
      margin: { t: 20, r: 20, b: 48, l: 60 },
      ...extra
    };
  }

  const PLOTLY_CONFIG = {
    responsive: true,
    displaylogo: false,
    modeBarButtonsToRemove: ["lasso2d", "select2d", "autoScale2d"]
  };

  function truncarTexto(str, max = 38) {
    if (str.length <= max) return str;
    return `${str.slice(0, max - 1)}…`;
  }

  function renderizarGraficos(linhas) {
    if (typeof window.Plotly === "undefined") {
      return;
    }

    const theme = getPlotlyTheme();
    const dict = state.index.dicionarios;

    // 1. Linha: internações por mês (com rangeslider)
    const mapaMensal = new Map();
    for (let i = 0; i < linhas.length; i++) {
      const r = linhas[i];
      const chave = `${r.ano}-${String(r.mes).padStart(2, "0")}`;
      mapaMensal.set(chave, (mapaMensal.get(chave) || 0) + r.internacoes);
    }
    const chavesMensais = Array.from(mapaMensal.keys()).sort();
    const datasMensais = chavesMensais.map((k) => `${k}-01`);
    const valoresMensais = chavesMensais.map((k) => mapaMensal.get(k));
    const labelsMensais = chavesMensais.map((k) => {
      const [a, m] = k.split("-");
      return `${MESES_COMPLETOS[Number(m) - 1]}/${a}`;
    });

    window.Plotly.react(
      "chart-mensal",
      [
        {
          type: "scatter",
          mode: "lines+markers",
          name: "Internações",
          x: datasMensais,
          y: valoresMensais,
          customdata: labelsMensais,
          line: { color: theme.accent, width: 2.5 },
          marker: { size: 5, color: theme.accent },
          fill: "tozeroy",
          fillcolor: theme.isDark ? "rgba(45, 212, 191, 0.08)" : "rgba(15, 118, 110, 0.08)",
          hovertemplate: "<b>%{customdata}</b><br>Internações: %{y:,.0f}<extra></extra>"
        }
      ],
      baseLayout(theme, {
        margin: { t: 16, r: 24, b: 40, l: 64 },
        xaxis: {
          type: "date",
          gridcolor: theme.grid,
          tickformat: "%b/%Y",
          rangeslider: {
            visible: true,
            thickness: 0.14,
            bgcolor: theme.isDark ? "#0b1119" : "#f8fafc",
            bordercolor: theme.grid
          }
        },
        yaxis: {
          title: { text: "Internações", font: { color: theme.muted } },
          gridcolor: theme.grid,
          zerolinecolor: theme.zeroLine,
          rangemode: "tozero"
        }
      }),
      PLOTLY_CONFIG
    );

    // 2. Heatmap: ano x mês de internações
    const anosPresentes = [];
    for (let a = state.anoInicio; a <= state.anoFim; a++) {
      anosPresentes.push(a);
    }
    const zHeatmap = anosPresentes.map((ano) => {
      const linhaAno = new Array(12).fill(0);
      for (let i = 0; i < linhas.length; i++) {
        if (linhas[i].ano === ano) {
          linhaAno[linhas[i].mes - 1] += linhas[i].internacoes;
        }
      }
      return linhaAno;
    });

    window.Plotly.react(
      "chart-heatmap",
      [
        {
          type: "heatmap",
          x: MESES_CURTOS,
          y: anosPresentes.map(String),
          z: zHeatmap,
          colorscale: theme.heatscale,
          hoverongaps: false,
          colorbar: {
            title: { text: "Intern.", font: { size: 11, color: theme.muted } },
            thickness: 12,
            len: 0.9
          },
          hovertemplate: "<b>%{x}/%{y}</b><br>Internações: %{z:,.0f}<extra></extra>"
        }
      ],
      baseLayout(theme, {
        margin: { t: 16, r: 20, b: 48, l: 56 },
        xaxis: { title: { text: "Mês", font: { color: theme.muted } }, side: "bottom" },
        yaxis: {
          title: { text: "Ano", font: { color: theme.muted } },
          type: "category",
          autorange: "reversed"
        }
      }),
      PLOTLY_CONFIG
    );

    // 3. Barras agrupadas: internações por faixa etária e sexo
    const faixas = dict.faixa_etaria;
    const sexos = dict.sexo;
    const tracesFaixaSexo = sexos
      .map((nomeSexo, sIdx) => {
        const totaisPorFaixa = new Array(faixas.length).fill(0);
        let somaSexo = 0;
        for (let i = 0; i < linhas.length; i++) {
          const r = linhas[i];
          if (r.sexo === sIdx && r.faixa_etaria >= 0 && r.faixa_etaria < faixas.length) {
            totaisPorFaixa[r.faixa_etaria] += r.internacoes;
            somaSexo += r.internacoes;
          }
        }
        return {
          somaSexo,
          trace: {
            type: "bar",
            name: nomeSexo,
            x: faixas,
            y: totaisPorFaixa,
            marker: { color: theme.palette[sIdx % theme.palette.length] },
            hovertemplate: `<b>Faixa %{x}</b> · ${nomeSexo}<br>Internações: %{y:,.0f}<extra></extra>`
          }
        };
      })
      .filter((item) => item.somaSexo > 0)
      .map((item) => item.trace);

    window.Plotly.react(
      "chart-faixa-sexo",
      tracesFaixaSexo,
      baseLayout(theme, {
        barmode: "group",
        margin: { t: 24, r: 16, b: 56, l: 60 },
        legend: { orientation: "h", y: 1.12, x: 0 },
        xaxis: {
          title: { text: "Faixa etária (anos)", font: { color: theme.muted } },
          type: "category"
        },
        yaxis: {
          title: { text: "Internações", font: { color: theme.muted } },
          gridcolor: theme.grid,
          zerolinecolor: theme.zeroLine
        }
      }),
      PLOTLY_CONFIG
    );

    // 4. Barras horizontais: internações por capítulo da CID-10 (ordenado)
    const cidMap = new Map();
    for (let i = 0; i < linhas.length; i++) {
      const r = linhas[i];
      cidMap.set(r.cid_capitulo, (cidMap.get(r.cid_capitulo) || 0) + r.internacoes);
    }
    const cidOrdenado = Array.from(cidMap.entries())
      .map(([idx, total]) => ({
        nomeCompleto: dict.cid_capitulo[idx] || `Capítulo ${idx}`,
        total
      }))
      .sort((a, b) => a.total - b.total);

    window.Plotly.react(
      "chart-cid",
      [
        {
          type: "bar",
          orientation: "h",
          x: cidOrdenado.map((d) => d.total),
          y: cidOrdenado.map((d) => truncarTexto(d.nomeCompleto, 42)),
          customdata: cidOrdenado.map((d) => d.nomeCompleto),
          marker: { color: theme.accent },
          hovertemplate: "<b>%{customdata}</b><br>Internações: %{x:,.0f}<extra></extra>"
        }
      ],
      baseLayout(theme, {
        margin: { t: 16, r: 32, b: 48, l: 290 },
        xaxis: {
          title: { text: "Internações", font: { color: theme.muted } },
          gridcolor: theme.grid,
          zerolinecolor: theme.zeroLine
        },
        yaxis: {
          type: "category",
          automargin: true,
          tickfont: { size: 12 }
        }
      }),
      PLOTLY_CONFIG
    );

    // 5. Barras: taxa de mortalidade por ano e por faixa etária
    const tracesMortalidade = anosPresentes.map((ano, aIdx) => {
      const intPorFaixa = new Array(faixas.length).fill(0);
      const obtPorFaixa = new Array(faixas.length).fill(0);

      for (let i = 0; i < linhas.length; i++) {
        const r = linhas[i];
        if (r.ano === ano && r.faixa_etaria >= 0 && r.faixa_etaria < faixas.length) {
          intPorFaixa[r.faixa_etaria] += r.internacoes;
          obtPorFaixa[r.faixa_etaria] += r.obitos;
        }
      }

      const taxas = faixas.map((_, fIdx) =>
        intPorFaixa[fIdx] > 0 ? (obtPorFaixa[fIdx] / intPorFaixa[fIdx]) * 100 : 0
      );
      const custom = faixas.map((_, fIdx) => [obtPorFaixa[fIdx], intPorFaixa[fIdx]]);

      return {
        type: "bar",
        name: String(ano),
        x: faixas,
        y: taxas,
        customdata: custom,
        marker: { color: theme.palette[aIdx % theme.palette.length] },
        hovertemplate:
          `<b>${ano} · Faixa %{x}</b><br>` +
          "Taxa de mortalidade: %{y:.2f}%<br>" +
          "Óbitos: %{customdata[0]:,.0f} / Internações: %{customdata[1]:,.0f}<extra></extra>"
      };
    });

    window.Plotly.react(
      "chart-mortalidade",
      tracesMortalidade,
      baseLayout(theme, {
        barmode: "group",
        margin: { t: 24, r: 16, b: 56, l: 60 },
        legend: { orientation: "h", y: 1.12, x: 0 },
        xaxis: {
          title: { text: "Faixa etária (anos)", font: { color: theme.muted } },
          type: "category"
        },
        yaxis: {
          title: { text: "Taxa de mortalidade (%)", font: { color: theme.muted } },
          gridcolor: theme.grid,
          zerolinecolor: theme.zeroLine,
          ticksuffix: "%"
        }
      }),
      PLOTLY_CONFIG
    );

    // 6. Barras + linha em eixo secundário: custo total e custo médio por ano
    const custoTotalPorAno = [];
    const custoMedioPorAno = [];
    anosPresentes.forEach((ano) => {
      let val = 0;
      let intern = 0;
      for (let i = 0; i < linhas.length; i++) {
        if (linhas[i].ano === ano) {
          val += linhas[i].valor_total;
          intern += linhas[i].internacoes;
        }
      }
      custoTotalPorAno.push(val);
      custoMedioPorAno.push(intern > 0 ? val / intern : 0);
    });

    window.Plotly.react(
      "chart-custos",
      [
        {
          type: "bar",
          name: "Custo total (R$)",
          x: anosPresentes.map(String),
          y: custoTotalPorAno,
          marker: {
            color: theme.isDark ? "rgba(96, 165, 250, 0.78)" : "rgba(37, 99, 235, 0.82)"
          },
          yaxis: "y",
          hovertemplate: "<b>%{x}</b><br>Custo total: R$ %{y:,.2f}<extra></extra>"
        },
        {
          type: "scatter",
          mode: "lines+markers",
          name: "Custo médio (R$)",
          x: anosPresentes.map(String),
          y: custoMedioPorAno,
          yaxis: "y2",
          line: { color: theme.palette[2], width: 3 },
          marker: { size: 8, color: theme.palette[2] },
          hovertemplate: "<b>%{x}</b><br>Custo médio: R$ %{y:,.2f}<extra></extra>"
        }
      ],
      baseLayout(theme, {
        margin: { t: 28, r: 72, b: 52, l: 78 },
        legend: { orientation: "h", y: 1.14, x: 0 },
        xaxis: {
          title: { text: "Ano", font: { color: theme.muted } },
          type: "category"
        },
        yaxis: {
          title: { text: "Custo total (R$)", font: { color: theme.muted } },
          gridcolor: theme.grid,
          zerolinecolor: theme.zeroLine,
          tickprefix: "R$ "
        },
        yaxis2: {
          title: { text: "Custo médio (R$)", font: { color: theme.palette[2] } },
          overlaying: "y",
          side: "right",
          showgrid: false,
          tickprefix: "R$ ",
          rangemode: "tozero"
        }
      }),
      PLOTLY_CONFIG
    );
  }

  function atualizarMetaCabecalho(linhas) {
    const ufs = Array.from(state.selectedUFs);
    const ufTexto = ufs.length > 0 ? ufs.join(", ") : "Nenhuma";
    const periodo = `${state.anoInicio}–${state.anoFim}`;
    els.pageMeta.textContent =
      `SIH/DATASUS · UFs: ${ufTexto} · Período: ${periodo} · ${fmtInt.format(linhas.length)} registros filtrados`;
  }

  function atualizarDashboard() {
    const linhas = filtrarDados();
    atualizarMetaCabecalho(linhas);
    atualizarKPIs(linhas);

    const vazio = linhas.length === 0;
    els.emptyState.hidden = !vazio;
    els.chartsSection.hidden = vazio;
    els.btnExportCsv.disabled = vazio;

    if (!vazio) {
      renderizarGraficos(linhas);
    }

    if (state.cidSectionOpen) {
      atualizarSecaoCid();
    }
  }

  /* ======================== SEÇÃO DOENÇAS (CID-10 3 CARACTERES) ======================== */

  function normalizarTexto(str) {
    return String(str ?? "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();
  }

  function formatarLabelCid3(codigo, nome) {
    const cod = String(codigo ?? "").trim();
    if (cod.toUpperCase() === "NI") {
      return "Não informado";
    }
    const nomeLimpo = typeof nome === "string" ? nome.trim() : "";
    if (nomeLimpo) {
      return `${cod} – ${nomeLimpo}`;
    }
    return cod;
  }

  function criarDadosExemploCidEmMemoria() {
    const cids = [
      ["A09", "Diarreia e gastroenterite de origem infecciosa presumível", 1.1, 0.015, 950, 3.4],
      ["A41", "Outras septicemias", 0.9, 0.24, 4800, 9.8],
      ["B34", "Doenças por vírus, de localização não especificada", 0.7, 0.012, 1100, 3.8],
      ["C50", "Neoplasia maligna da mama", 0.85, 0.045, 3600, 4.9],
      ["C18", "Neoplasia maligna do cólon", 0.65, 0.082, 4200, 7.2],
      ["C34", "Neoplasia maligna dos brônquios e dos pulmões", 0.55, 0.165, 4100, 8.1],
      ["D50", "Anemia por deficiência de ferro", 0.5, 0.018, 1250, 4.2],
      ["E11", "Diabetes mellitus não-insulino-dependente", 1.0, 0.042, 1750, 5.6],
      ["F20", "Esquizofrenia", 0.6, 0.004, 2100, 16.4],
      ["G40", "Epilepsia", 0.65, 0.019, 1550, 4.5],
      ["I10", "Hipertensão essencial (primária)", 1.05, 0.025, 1300, 4.1],
      ["I21", "Infarto agudo do miocárdio", 1.25, 0.115, 5900, 7.4],
      ["I50", "Insuficiência cardíaca", 1.35, 0.105, 3400, 7.6],
      ["I64", "Acidente vascular cerebral, não especificado", 1.2, 0.145, 3900, 8.5],
      ["J15", "Pneumonia bacteriana não classificada em outra parte", 1.15, 0.078, 2200, 6.4],
      ["J18", "Pneumonia por microrganismo não especificado", 1.7, 0.084, 2150, 6.1],
      ["J44", "Outras doenças pulmonares obstrutivas crônicas", 0.95, 0.075, 2400, 6.8],
      ["J45", "Asma", 0.9, 0.009, 1180, 3.5],
      ["K35", "Apendicite aguda", 1.1, 0.006, 1850, 3.2],
      ["K40", "Hérnia inguinal", 0.95, 0.003, 1420, 2.1],
      ["K80", "Colelitíase", 1.35, 0.009, 1980, 3.1],
      ["N18", "Insuficiência renal crônica", 0.85, 0.092, 3700, 7.9],
      ["N39", "Outros transtornos do trato urinário", 1.15, 0.032, 1480, 4.6],
      ["O80", "Parto único espontâneo", 1.85, 0.001, 1050, 2.2],
      ["O82", "Parto único por cesariana", 1.6, 0.002, 1380, 2.8],
      ["S52", "Fratura do antebraço", 0.85, 0.003, 1750, 2.9],
      ["S72", "Fratura do fêmur", 1.05, 0.055, 4350, 7.8],
      ["T14", "Traumatismo de região não especificada do corpo", 0.55, 0.022, 1900, 4.0],
      ["NI", "Não informado", 0.35, 0.03, 1200, 4.1]
    ];

    let seed = 20261116;
    const rand = () => {
      seed |= 0;
      seed = (seed + 0x6d2b79f5) | 0;
      let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };

    const anos = state.index.anos;
    const faixaMortMult = [1.3, 0.35, 0.2, 0.25, 0.4, 0.85, 1.5, 2.5];
    const faixaPermMult = [1.25, 0.75, 0.65, 0.7, 0.8, 1.0, 1.25, 1.5];

    const colunas = {
      ano: [], cid3: [], faixa_etaria: [], sexo: [],
      internacoes: [], obitos: [], valor_total: [], dias_perm_total: []
    };

    for (let i = 0; i < 820; i++) {
      const ano = anos[i % anos.length];
      const cidIdx = (i * 5 + Math.floor(rand() * cids.length)) % cids.length;
      const [codigo, _nome, peso, mortBase, custoBase, permBase] = cids[cidIdx];

      let faixa = (i * 3 + Math.floor(rand() * 8)) % 8;
      let sexo = rand() < 0.015 ? 2 : rand() < 0.52 ? 1 : 0;
      if (codigo === "O80" || codigo === "O82") {
        sexo = 1;
        faixa = rand() < 0.45 ? 3 : 4;
      } else if (codigo === "C50") {
        sexo = 1;
        faixa = rand() < 0.55 ? 5 : 6;
      } else if (codigo === "S72" || codigo === "I50" || codigo === "I64") {
        faixa = rand() < 0.5 ? 6 : rand() < 0.7 ? 7 : 5;
      }

      const anoMult = 1 + (ano - 2021) * 0.04;
      const sexoMult = sexo === 2 ? 0.12 : 1.0;
      const internacoes = Math.max(1, Math.round((12 + rand() * 38) * peso * anoMult * sexoMult));
      const probMort = Math.min(0.45, mortBase * faixaMortMult[faixa] * (0.85 + rand() * 0.35));
      const obitos = Math.min(internacoes, Math.round(internacoes * probMort));
      const permMedia = Math.max(1.1, permBase * faixaPermMult[faixa] * (0.85 + rand() * 0.35));
      const diasPerm = Math.max(internacoes, Math.round(internacoes * permMedia));
      const inflacao = 1 + (ano - 2021) * 0.055;
      const custoUnit = custoBase * inflacao * (0.82 + rand() * 0.4);
      const valorTotal = Number((internacoes * custoUnit).toFixed(2));

      colunas.ano.push(ano);
      colunas.cid3.push(cidIdx);
      colunas.faixa_etaria.push(faixa);
      colunas.sexo.push(sexo);
      colunas.internacoes.push(internacoes);
      colunas.obitos.push(obitos);
      colunas.valor_total.push(valorTotal);
      colunas.dias_perm_total.push(diasPerm);
    }

    return {
      dicionario_cid3: cids.map((c) => c[0]),
      nomes_cid3: cids.map((c) => c[1]),
      colunas
    };
  }

  function validarEstruturaUFCid(dados, uf) {
    if (!dados || !Array.isArray(dados.dicionario_cid3) || !dados.colunas) {
      throw new Error(`Arquivo ${uf}_cid.json com formato inválido.`);
    }
    const obrigatorias = [
      "ano", "cid3", "faixa_etaria", "sexo",
      "internacoes", "obitos", "valor_total", "dias_perm_total"
    ];
    let tamanho = null;
    for (const col of obrigatorias) {
      const arr = dados.colunas[col];
      if (!Array.isArray(arr)) {
        throw new Error(`Coluna "${col}" ausente em ${uf}_cid.json.`);
      }
      if (tamanho === null) {
        tamanho = arr.length;
      } else if (arr.length !== tamanho) {
        throw new Error(`Colunas com tamanhos divergentes em ${uf}_cid.json.`);
      }
    }
    return dados;
  }

  async function carregarUFCid(uf) {
    if (state.ufCidCache.has(uf)) {
      return state.ufCidCache.get(uf);
    }
    if (state.usandoExemplo) {
      const exemplo = criarDadosExemploCidEmMemoria();
      state.ufCidCache.set(uf, exemplo);
      return exemplo;
    }
    const caminho = `data/uf/${encodeURIComponent(uf)}_cid.json`;
    const res = await fetch(caminho);
    if (!res.ok) {
      throw new Error(`Falha ao baixar ${caminho} (HTTP ${res.status}).`);
    }
    const json = await res.json();
    const validado = validarEstruturaUFCid(json, uf);
    state.ufCidCache.set(uf, validado);
    return validado;
  }

  function setCidLoading(ativo, texto = "Carregando doenças (CID-10)...") {
    els.cidLoadingText.textContent = texto;
    els.cidLoadingIndicator.hidden = !ativo;
  }

  function mostrarErroCid(mensagem) {
    if (!mensagem) {
      els.cidErrorBanner.hidden = true;
      return;
    }
    els.cidErrorText.textContent = mensagem;
    els.cidErrorBanner.hidden = false;
  }

  async function garantirUFsCidSelecionadas() {
    if (!state.cidSectionOpen) return;

    const ufs = Array.from(state.selectedUFs);
    const faltantes = ufs.filter((uf) => !state.ufCidCache.has(uf));

    if (faltantes.length === 0) {
      mostrarErroCid(null);
      return;
    }

    setCidLoading(
      true,
      faltantes.length === 1
        ? `Baixando doenças (CID-10) de ${faltantes[0]}...`
        : `Baixando doenças (CID-10) de ${faltantes.length} UFs...`
    );
    mostrarErroCid(null);

    try {
      const resultados = await Promise.allSettled(faltantes.map((uf) => carregarUFCid(uf)));
      const falhas = [];
      resultados.forEach((r, idx) => {
        if (r.status === "rejected") {
          falhas.push(`${faltantes[idx]} (${r.reason?.message || "erro de rede"})`);
        }
      });
      if (falhas.length > 0) {
        mostrarErroCid(`Não foi possível carregar dados de CID-10: ${falhas.join("; ")}.`);
      }
    } finally {
      setCidLoading(false);
    }
  }

  function reconstruirCatalogoCid3() {
    const mapa = new Map();
    for (const uf of state.selectedUFs) {
      const payload = state.ufCidCache.get(uf);
      if (!payload) continue;

      const codigos = payload.dicionario_cid3 || [];
      const nomes = Array.isArray(payload.nomes_cid3) ? payload.nomes_cid3 : null;

      for (let i = 0; i < codigos.length; i++) {
        const codigo = String(codigos[i] ?? "").trim();
        if (!codigo) continue;
        const nome = nomes && typeof nomes[i] === "string" ? nomes[i].trim() : "";

        const existente = mapa.get(codigo);
        if (!existente) {
          const label = formatarLabelCid3(codigo, nome);
          const extraNI = codigo.toUpperCase() === "NI" ? " nao informado não informado" : "";
          mapa.set(codigo, {
            codigo,
            nome,
            label,
            searchKey: normalizarTexto(`${codigo} ${nome} ${label}${extraNI}`)
          });
        } else if (!existente.nome && nome) {
          existente.nome = nome;
          existente.label = formatarLabelCid3(codigo, nome);
          existente.searchKey = normalizarTexto(`${codigo} ${nome} ${existente.label}`);
        }
      }
    }

    const lista = Array.from(mapa.values()).sort((a, b) => {
      if (a.codigo.toUpperCase() === "NI") return 1;
      if (b.codigo.toUpperCase() === "NI") return -1;
      return a.codigo.localeCompare(b.codigo, "pt-BR");
    });

    const estavaTudoSelecionado =
      !state.cid3Inicializado ||
      (state.cidCatalogo.length > 0 && state.selectedCid3.size === state.cidCatalogo.length);

    state.cidCatalogo = lista;
    state.cidCatalogoMap = mapa;

    if (estavaTudoSelecionado) {
      state.selectedCid3 = new Set(lista.map((d) => d.codigo));
    } else {
      const preservadas = new Set();
      state.selectedCid3.forEach((cod) => {
        if (mapa.has(cod)) preservadas.add(cod);
      });
      state.selectedCid3 = preservadas;
    }
    state.cid3Inicializado = true;

    els.optionsCid3.innerHTML = "";
    lista.forEach((item) => {
      const labelEl = document.createElement("label");
      labelEl.className = "option-row";
      labelEl.dataset.search = item.searchKey;

      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.value = item.codigo;
      checkbox.checked = state.selectedCid3.has(item.codigo);
      checkbox.addEventListener("change", () => {
        if (checkbox.checked) {
          state.selectedCid3.add(item.codigo);
        } else {
          state.selectedCid3.delete(item.codigo);
        }
        atualizarTextoMultiselectCid3();
        renderizarSecaoCid();
      });

      const span = document.createElement("span");
      span.textContent = item.label;

      labelEl.append(checkbox, span);
      els.optionsCid3.appendChild(labelEl);
    });

    const termo = normalizarTexto(els.searchCid3.value.trim());
    if (termo) {
      els.optionsCid3.querySelectorAll(".option-row").forEach((r) => {
        r.hidden = !r.dataset.search.includes(termo);
      });
    }

    atualizarTextoMultiselectCid3();
  }

  function sincronizarCheckboxesCid3() {
    els.optionsCid3.querySelectorAll('input[type="checkbox"]').forEach((input) => {
      input.checked = state.selectedCid3.has(input.value);
    });
    atualizarTextoMultiselectCid3();
  }

  function atualizarTextoMultiselectCid3() {
    const total = state.cidCatalogo.length;
    const qtd = state.selectedCid3.size;
    if (total === 0 || qtd === 0) {
      els.textCid3.textContent = "Nenhuma doença selecionada";
    } else if (qtd === total) {
      els.textCid3.textContent = `Todas as doenças (${total})`;
    } else if (qtd === 1) {
      const cod = Array.from(state.selectedCid3)[0];
      const item = state.cidCatalogoMap.get(cod);
      els.textCid3.textContent = item ? item.label : cod;
    } else {
      els.textCid3.textContent = `${qtd} de ${total} doenças`;
    }
  }

  function filtrarDadosCid3() {
    const sexoFiltro = state.sexo === "todos" ? null : Number(state.sexo);
    const aggMap = new Map();
    const linhas = [];

    for (const uf of state.selectedUFs) {
      const payload = state.ufCidCache.get(uf);
      if (!payload) continue;

      const codigos = payload.dicionario_cid3;
      const c = payload.colunas;
      const n = c.ano.length;

      for (let i = 0; i < n; i++) {
        const ano = c.ano[i];
        if (ano < state.anoInicio || ano > state.anoFim) continue;

        const sexo = c.sexo[i];
        if (sexoFiltro !== null && sexo !== sexoFiltro) continue;

        const codigo = String(codigos[c.cid3[i]] ?? "").trim();
        if (!codigo || !state.selectedCid3.has(codigo)) continue;

        const internacoes = c.internacoes[i];
        const obitos = c.obitos[i];
        const valor_total = c.valor_total[i];
        const dias_perm_total = c.dias_perm_total[i];
        const faixa_etaria = c.faixa_etaria[i];

        linhas.push({
          ano,
          codigo,
          faixa_etaria,
          sexo,
          internacoes,
          obitos,
          valor_total,
          dias_perm_total
        });

        let acc = aggMap.get(codigo);
        if (!acc) {
          const meta = state.cidCatalogoMap.get(codigo);
          acc = {
            codigo,
            label: meta ? meta.label : formatarLabelCid3(codigo, ""),
            internacoes: 0,
            obitos: 0,
            valor_total: 0,
            dias_perm_total: 0
          };
          aggMap.set(codigo, acc);
        }
        acc.internacoes += internacoes;
        acc.obitos += obitos;
        acc.valor_total += valor_total;
        acc.dias_perm_total += dias_perm_total;
      }
    }

    const lista = Array.from(aggMap.values()).map((item) => ({
      ...item,
      taxa_mortalidade: item.internacoes > 0 ? (item.obitos / item.internacoes) * 100 : 0
    }));

    state.cidAggregatedList = lista;
    state.cidFilteredRows = linhas;
    return { lista, linhas };
  }

  function anexarCliqueDetalheCid(chartId) {
    if (state.cidBindingsAttached.has(chartId)) return;
    const el = document.getElementById(chartId);
    if (!el || typeof el.on !== "function") return;
    state.cidBindingsAttached.add(chartId);

    el.on("plotly_click", (evt) => {
      const pt = evt && evt.points && evt.points[0];
      if (!pt) return;
      const custom = pt.customdata;
      const codigo = Array.isArray(custom) ? custom[0] : custom;
      if (!codigo || !state.cidCatalogoMap.has(codigo)) return;

      state.cidFoco = codigo;
      if (els.selectCidFoco) {
        els.selectCidFoco.value = codigo;
      }
      renderizarDetalheDoenca(state.cidFilteredRows, state.cidAggregatedList);
      const detailCard = document.getElementById("cid-detalhe-card");
      if (detailCard) {
        detailCard.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }
    });
  }

  function renderizarDetalheDoenca(linhas, listaAgg) {
    if (typeof window.Plotly === "undefined") return;

    const theme = getPlotlyTheme();
    const dict = state.index.dicionarios;
    const anosPresentes = [];
    for (let a = state.anoInicio; a <= state.anoFim; a++) {
      anosPresentes.push(a);
    }

    const codigoFoco = state.cidFoco;
    const usarSelecao = codigoFoco === "__selecao__";

    let totalInt = 0;
    let totalObt = 0;
    let totalValor = 0;
    let totalDias = 0;

    const intPorAno = new Map(anosPresentes.map((a) => [a, 0]));
    const intPorFaixa = new Array(dict.faixa_etaria.length).fill(0);
    const intPorSexo = new Array(dict.sexo.length).fill(0);

    for (let i = 0; i < linhas.length; i++) {
      const r = linhas[i];
      if (!usarSelecao && r.codigo !== codigoFoco) continue;

      totalInt += r.internacoes;
      totalObt += r.obitos;
      totalValor += r.valor_total;
      totalDias += r.dias_perm_total;

      if (intPorAno.has(r.ano)) {
        intPorAno.set(r.ano, intPorAno.get(r.ano) + r.internacoes);
      }
      if (r.faixa_etaria >= 0 && r.faixa_etaria < intPorFaixa.length) {
        intPorFaixa[r.faixa_etaria] += r.internacoes;
      }
      if (r.sexo >= 0 && r.sexo < intPorSexo.length) {
        intPorSexo[r.sexo] += r.internacoes;
      }
    }

    const metaFoco = usarSelecao
      ? `${listaAgg.length} doenças selecionadas`
      : state.cidCatalogoMap.get(codigoFoco)?.label || codigoFoco;

    if (totalInt > 0) {
      const mort = (totalObt / totalInt) * 100;
      const custoMedio = totalValor / totalInt;
      const perm = totalDias / totalInt;
      els.cidDetailKpis.textContent =
        `${metaFoco} · Internações: ${fmtInt.format(totalInt)} · Óbitos: ${fmtInt.format(totalObt)} (${fmtDec2.format(mort)}%) · Custo total: ${fmtBRL.format(totalValor)} (médio ${fmtBRL.format(custoMedio)}) · Permanência média: ${fmtDec1.format(perm)} dias`;
    } else {
      els.cidDetailKpis.textContent = `${metaFoco} · Sem internações no filtro atual.`;
    }

    // 5a. Internações por ano
    window.Plotly.react(
      "chart-cid3-det-ano",
      [
        {
          type: "bar",
          x: anosPresentes.map(String),
          y: anosPresentes.map((a) => intPorAno.get(a) || 0),
          marker: { color: theme.accent },
          hovertemplate: "<b>%{x}</b><br>Internações: %{y:,.0f}<extra></extra>"
        }
      ],
      baseLayout(theme, {
        margin: { t: 12, r: 12, b: 40, l: 54 },
        xaxis: { type: "category" },
        yaxis: {
          title: { text: "Internações", font: { color: theme.muted } },
          gridcolor: theme.grid,
          zerolinecolor: theme.zeroLine,
          rangemode: "tozero"
        }
      }),
      PLOTLY_CONFIG
    );

    // 5b. Internações por faixa etária
    window.Plotly.react(
      "chart-cid3-det-faixa",
      [
        {
          type: "bar",
          x: dict.faixa_etaria,
          y: intPorFaixa,
          marker: { color: theme.palette[1] },
          hovertemplate: "<b>Faixa %{x}</b><br>Internações: %{y:,.0f}<extra></extra>"
        }
      ],
      baseLayout(theme, {
        margin: { t: 12, r: 12, b: 44, l: 54 },
        xaxis: { type: "category" },
        yaxis: {
          title: { text: "Internações", font: { color: theme.muted } },
          gridcolor: theme.grid,
          zerolinecolor: theme.zeroLine,
          rangemode: "tozero"
        }
      }),
      PLOTLY_CONFIG
    );

    // 5c. Internações por sexo
    window.Plotly.react(
      "chart-cid3-det-sexo",
      [
        {
          type: "bar",
          x: dict.sexo,
          y: intPorSexo,
          marker: {
            color: dict.sexo.map((_, idx) => theme.palette[idx % theme.palette.length])
          },
          hovertemplate: "<b>%{x}</b><br>Internações: %{y:,.0f}<extra></extra>"
        }
      ],
      baseLayout(theme, {
        margin: { t: 12, r: 12, b: 40, l: 54 },
        xaxis: { type: "category" },
        yaxis: {
          title: { text: "Internações", font: { color: theme.muted } },
          gridcolor: theme.grid,
          zerolinecolor: theme.zeroLine,
          rangemode: "tozero"
        }
      }),
      PLOTLY_CONFIG
    );
  }

  function atualizarSeletorFocoCid(listaPorInt) {
    const totalCatalogo = state.cidCatalogo.length;
    const isSubconjunto =
      state.selectedCid3.size > 1 && state.selectedCid3.size < totalCatalogo;

    els.selectCidFoco.innerHTML = "";

    if (isSubconjunto) {
      const optSel = document.createElement("option");
      optSel.value = "__selecao__";
      optSel.textContent = `Conjunto selecionado (${state.selectedCid3.size} doenças)`;
      els.selectCidFoco.appendChild(optSel);
    }

    listaPorInt.forEach((item) => {
      const opt = document.createElement("option");
      opt.value = item.codigo;
      opt.textContent = item.label;
      els.selectCidFoco.appendChild(opt);
    });

    const codigosValidos = new Set(listaPorInt.map((d) => d.codigo));
    if (isSubconjunto) {
      if (state.cidFoco !== "__selecao__" && !codigosValidos.has(state.cidFoco)) {
        state.cidFoco = "__selecao__";
      } else if (!state.cidFoco) {
        state.cidFoco = "__selecao__";
      }
    } else if (!state.cidFoco || state.cidFoco === "__selecao__" || !codigosValidos.has(state.cidFoco)) {
      state.cidFoco = listaPorInt[0]?.codigo || null;
    }

    if (state.cidFoco) {
      els.selectCidFoco.value = state.cidFoco;
    }
  }

  function renderizarSecaoCid() {
    if (!state.cidSectionOpen) return;

    const temDadosUF = Array.from(state.selectedUFs).some((uf) => state.ufCidCache.has(uf));
    if (!temDadosUF) {
      els.cidControls.hidden = true;
      els.cidChartsContent.hidden = true;
      els.cidEmptyState.hidden = true;
      return;
    }

    els.cidControls.hidden = false;
    const ufsTexto = Array.from(state.selectedUFs).join(", ") || "Nenhuma";
    const sexoTexto =
      state.sexo === "todos"
        ? "Todos os sexos"
        : state.index.dicionarios.sexo[Number(state.sexo)] || "Todos";
    els.cidScopeInfo.textContent =
      `Filtros ativos: UFs (${ufsTexto}) · ${state.anoInicio}–${state.anoFim} · ${sexoTexto}`;

    const { lista, linhas } = filtrarDadosCid3();
    const vazio = lista.length === 0 || linhas.length === 0;
    els.cidEmptyState.hidden = !vazio;
    els.cidChartsContent.hidden = vazio;
    if (vazio) return;

    if (typeof window.Plotly === "undefined") return;

    const theme = getPlotlyTheme();

    // 2. Top N CID por internações (10/20/50)
    const ordenadasInt = [...lista].sort((a, b) => b.internacoes - a.internacoes);
    const topInt = ordenadasInt.slice(0, state.cidTopN).reverse();
    els.cidTopIntTitle.textContent = `Top ${state.cidTopN} CID-10 por internações`;

    const elInt = document.getElementById("chart-cid3-internacoes");
    if (elInt) {
      elInt.style.height = `${Math.max(380, topInt.length * 25 + 88)}px`;
    }

    window.Plotly.react(
      "chart-cid3-internacoes",
      [
        {
          type: "bar",
          orientation: "h",
          x: topInt.map((d) => d.internacoes),
          y: topInt.map((d) => truncarTexto(d.label, 42)),
          customdata: topInt.map((d) => [d.codigo, d.label]),
          marker: { color: theme.accent },
          hovertemplate:
            "<b>%{customdata[1]}</b><br>Internações: %{x:,.0f}<extra></extra>"
        }
      ],
      baseLayout(theme, {
        margin: { t: 12, r: 28, b: 44, l: 290 },
        xaxis: {
          title: { text: "Internações", font: { color: theme.muted } },
          gridcolor: theme.grid,
          zerolinecolor: theme.zeroLine
        },
        yaxis: { type: "category", automargin: true, tickfont: { size: 12 } }
      }),
      PLOTLY_CONFIG
    );
    anexarCliqueDetalheCid("chart-cid3-internacoes");

    // 3. Top 20 CID por taxa de mortalidade (>= 100 internações)
    const topMort = lista
      .filter((d) => d.internacoes >= 100)
      .sort((a, b) => b.taxa_mortalidade - a.taxa_mortalidade)
      .slice(0, 20)
      .reverse();

    const semMort = topMort.length === 0;
    els.cidMortEmpty.hidden = !semMort;
    els.chartCidMortEl.hidden = semMort;

    if (!semMort) {
      els.chartCidMortEl.style.height = `${Math.max(380, topMort.length * 25 + 88)}px`;
      window.Plotly.react(
        "chart-cid3-mortalidade",
        [
          {
            type: "bar",
            orientation: "h",
            x: topMort.map((d) => d.taxa_mortalidade),
            y: topMort.map((d) => truncarTexto(d.label, 34)),
            customdata: topMort.map((d) => [d.codigo, d.label, d.obitos, d.internacoes]),
            marker: { color: theme.palette[4] },
            hovertemplate:
              "<b>%{customdata[1]}</b><br>" +
              "Taxa de mortalidade: %{x:.2f}%<br>" +
              "Óbitos: %{customdata[2]:,.0f} / Internações: %{customdata[3]:,.0f}<extra></extra>"
          }
        ],
        baseLayout(theme, {
          margin: { t: 12, r: 24, b: 44, l: 230 },
          xaxis: {
            title: { text: "Taxa de mortalidade (%)", font: { color: theme.muted } },
            gridcolor: theme.grid,
            zerolinecolor: theme.zeroLine,
            ticksuffix: "%"
          },
          yaxis: { type: "category", automargin: true, tickfont: { size: 11.5 } }
        }),
        PLOTLY_CONFIG
      );
      anexarCliqueDetalheCid("chart-cid3-mortalidade");
    }

    // 4. Top 20 CID por custo total
    const topCusto = [...lista]
      .sort((a, b) => b.valor_total - a.valor_total)
      .slice(0, 20)
      .reverse();

    const elCusto = document.getElementById("chart-cid3-custo");
    if (elCusto) {
      elCusto.style.height = `${Math.max(380, topCusto.length * 25 + 88)}px`;
    }

    window.Plotly.react(
      "chart-cid3-custo",
      [
        {
          type: "bar",
          orientation: "h",
          x: topCusto.map((d) => d.valor_total),
          y: topCusto.map((d) => truncarTexto(d.label, 34)),
          customdata: topCusto.map((d) => [d.codigo, d.label, d.internacoes]),
          marker: { color: theme.palette[1] },
          hovertemplate:
            "<b>%{customdata[1]}</b><br>" +
            "Custo total: R$ %{x:,.2f}<br>" +
            "Internações: %{customdata[2]:,.0f}<extra></extra>"
        }
      ],
      baseLayout(theme, {
        margin: { t: 12, r: 24, b: 44, l: 230 },
        xaxis: {
          title: { text: "Custo total (R$)", font: { color: theme.muted } },
          gridcolor: theme.grid,
          zerolinecolor: theme.zeroLine,
          tickprefix: "R$ "
        },
        yaxis: { type: "category", automargin: true, tickfont: { size: 11.5 } }
      }),
      PLOTLY_CONFIG
    );
    anexarCliqueDetalheCid("chart-cid3-custo");

    // 5. Detalhamento da doença selecionada
    atualizarSeletorFocoCid(ordenadasInt);
    renderizarDetalheDoenca(linhas, lista);
  }

  async function atualizarSecaoCid(forcarCatalogo = false) {
    if (!state.cidSectionOpen) return;
    await garantirUFsCidSelecionadas();
    if (forcarCatalogo || !state.cid3Inicializado) {
      reconstruirCatalogoCid3();
    }
    renderizarSecaoCid();
  }

  async function abrirSecaoCid() {
    if (state.cidSectionOpen) return;
    state.cidSectionOpen = true;
    els.btnToggleCidSection.setAttribute("aria-expanded", "true");
    els.cidToggleLabel.textContent = "Recolher análise";
    els.cidSectionBody.hidden = false;
    await atualizarSecaoCid(true);
  }

  function fecharSecaoCid() {
    if (!state.cidSectionOpen) return;
    state.cidSectionOpen = false;
    els.btnToggleCidSection.setAttribute("aria-expanded", "false");
    els.cidToggleLabel.textContent = "Abrir análise";
    els.cidSectionBody.hidden = true;
  }

  function escaparCSV(valor) {
    const str = String(valor ?? "");
    if (/[",;\n\r]/.test(str)) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  }

  function exportarCSV() {
    if (state.filteredRows.length === 0) return;

    const dict = state.index.dicionarios;
    const cabecalho = [
      "uf", "ano", "mes", "cid_capitulo", "faixa_etaria", "sexo",
      "internacoes", "obitos", "valor_total", "dias_perm_total"
    ];

    const linhasCSV = [cabecalho.join(",")];
    for (let i = 0; i < state.filteredRows.length; i++) {
      const r = state.filteredRows[i];
      linhasCSV.push(
        [
          escaparCSV(r.uf),
          r.ano,
          r.mes,
          escaparCSV(dict.cid_capitulo[r.cid_capitulo] ?? r.cid_capitulo),
          escaparCSV(dict.faixa_etaria[r.faixa_etaria] ?? r.faixa_etaria),
          escaparCSV(dict.sexo[r.sexo] ?? r.sexo),
          r.internacoes,
          r.obitos,
          r.valor_total.toFixed(2),
          r.dias_perm_total
        ].join(",")
      );
    }

    const blob = new Blob(["\uFEFF" + linhasCSV.join("\n")], {
      type: "text/csv;charset=utf-8;"
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `sih_sus_internacoes_${state.anoInicio}_${state.anoFim}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  function fecharPopovers(exceto = null) {
    if (exceto !== "uf") {
      els.popoverUf.hidden = true;
      els.triggerUf.setAttribute("aria-expanded", "false");
    }
    if (exceto !== "cid") {
      els.popoverCid.hidden = true;
      els.triggerCid.setAttribute("aria-expanded", "false");
    }
    if (exceto !== "cid3") {
      els.popoverCid3.hidden = true;
      els.triggerCid3.setAttribute("aria-expanded", "false");
    }
  }

  function registrarEventos() {
    els.triggerUf.addEventListener("click", (e) => {
      e.stopPropagation();
      const abrir = els.popoverUf.hidden;
      fecharPopovers(abrir ? "uf" : null);
      els.popoverUf.hidden = !abrir;
      els.triggerUf.setAttribute("aria-expanded", String(abrir));
    });

    els.triggerCid.addEventListener("click", (e) => {
      e.stopPropagation();
      const abrir = els.popoverCid.hidden;
      fecharPopovers(abrir ? "cid" : null);
      els.popoverCid.hidden = !abrir;
      els.triggerCid.setAttribute("aria-expanded", String(abrir));
      if (abrir) {
        els.searchCid.focus();
      }
    });

    els.triggerCid3.addEventListener("click", (e) => {
      e.stopPropagation();
      const abrir = els.popoverCid3.hidden;
      fecharPopovers(abrir ? "cid3" : null);
      els.popoverCid3.hidden = !abrir;
      els.triggerCid3.setAttribute("aria-expanded", String(abrir));
      if (abrir) {
        els.searchCid3.focus();
      }
    });

    els.popoverUf.addEventListener("click", (e) => e.stopPropagation());
    els.popoverCid.addEventListener("click", (e) => e.stopPropagation());
    els.popoverCid3.addEventListener("click", (e) => e.stopPropagation());

    document.addEventListener("click", () => fecharPopovers());
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") fecharPopovers();
    });

    els.btnUfTodas.addEventListener("click", async () => {
      state.selectedUFs = new Set(state.index.ufs);
      sincronizarCheckboxesUF();
      await garantirUFsSelecionadas();
      if (state.cidSectionOpen) {
        await garantirUFsCidSelecionadas();
        reconstruirCatalogoCid3();
      } else {
        state.cid3Inicializado = false;
      }
      atualizarDashboard();
    });

    els.btnUfPrimeira.addEventListener("click", async () => {
      state.selectedUFs = new Set([state.index.ufs[0]]);
      sincronizarCheckboxesUF();
      await garantirUFsSelecionadas();
      if (state.cidSectionOpen) {
        await garantirUFsCidSelecionadas();
        reconstruirCatalogoCid3();
      } else {
        state.cid3Inicializado = false;
      }
      atualizarDashboard();
    });

    els.btnCidTodos.addEventListener("click", () => {
      state.selectedCids = new Set(
        state.index.dicionarios.cid_capitulo.map((_, idx) => idx)
      );
      sincronizarCheckboxesCID();
      atualizarDashboard();
    });

    els.btnCidNenhum.addEventListener("click", () => {
      state.selectedCids = new Set();
      sincronizarCheckboxesCID();
      atualizarDashboard();
    });

    els.searchCid.addEventListener("input", () => {
      const termo = els.searchCid.value.trim().toLowerCase();
      const rows = els.optionsCid.querySelectorAll(".option-row");
      rows.forEach((row) => {
        row.hidden = termo.length > 0 && !row.dataset.search.includes(termo);
      });
    });

    els.btnCid3Todos.addEventListener("click", () => {
      state.selectedCid3 = new Set(state.cidCatalogo.map((d) => d.codigo));
      sincronizarCheckboxesCid3();
      renderizarSecaoCid();
    });

    els.btnCid3Nenhum.addEventListener("click", () => {
      state.selectedCid3 = new Set();
      sincronizarCheckboxesCid3();
      renderizarSecaoCid();
    });

    els.btnCid3Reset.addEventListener("click", () => {
      state.selectedCid3 = new Set(state.cidCatalogo.map((d) => d.codigo));
      els.searchCid3.value = "";
      els.optionsCid3.querySelectorAll(".option-row").forEach((r) => {
        r.hidden = false;
      });
      sincronizarCheckboxesCid3();
      renderizarSecaoCid();
    });

    els.searchCid3.addEventListener("input", () => {
      const termo = normalizarTexto(els.searchCid3.value.trim());
      els.optionsCid3.querySelectorAll(".option-row").forEach((row) => {
        row.hidden = termo.length > 0 && !row.dataset.search.includes(termo);
      });
    });

    document.querySelectorAll(".seg-btn[data-topn]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const val = Number(btn.dataset.topn);
        if (!val || val === state.cidTopN) return;
        state.cidTopN = val;
        document.querySelectorAll(".seg-btn[data-topn]").forEach((b) => {
          b.classList.toggle("is-active", Number(b.dataset.topn) === val);
        });
        renderizarSecaoCid();
      });
    });

    els.selectCidFoco.addEventListener("change", () => {
      state.cidFoco = els.selectCidFoco.value;
      renderizarDetalheDoenca(state.cidFilteredRows, state.cidAggregatedList);
    });

    els.btnToggleCidSection.addEventListener("click", async () => {
      if (state.cidSectionOpen) {
        fecharSecaoCid();
      } else {
        await abrirSecaoCid();
      }
    });

    els.navDoencas.addEventListener("click", async () => {
      if (!state.cidSectionOpen) {
        await abrirSecaoCid();
      }
    });

    els.btnCidRetry.addEventListener("click", async () => {
      await atualizarSecaoCid(true);
    });

    els.anoInicio.addEventListener("change", () => {
      state.anoInicio = Number(els.anoInicio.value);
      if (state.anoInicio > state.anoFim) {
        state.anoFim = state.anoInicio;
        els.anoFim.value = String(state.anoFim);
      }
      atualizarDashboard();
    });

    els.anoFim.addEventListener("change", () => {
      state.anoFim = Number(els.anoFim.value);
      if (state.anoFim < state.anoInicio) {
        state.anoInicio = state.anoFim;
        els.anoInicio.value = String(state.anoInicio);
      }
      atualizarDashboard();
    });

    els.sexo.addEventListener("change", () => {
      state.sexo = els.sexo.value;
      atualizarDashboard();
    });

    const resetarFiltros = async () => {
      const anosOrdenados = [...state.index.anos].sort((a, b) => a - b);
      state.selectedUFs = new Set([state.index.ufs[0]]);
      state.anoInicio = anosOrdenados[0];
      state.anoFim = anosOrdenados[anosOrdenados.length - 1];
      state.selectedCids = new Set(
        state.index.dicionarios.cid_capitulo.map((_, idx) => idx)
      );
      state.sexo = "todos";

      els.anoInicio.value = String(state.anoInicio);
      els.anoFim.value = String(state.anoFim);
      els.sexo.value = "todos";
      els.searchCid.value = "";
      els.optionsCid.querySelectorAll(".option-row").forEach((r) => {
        r.hidden = false;
      });

      sincronizarCheckboxesUF();
      sincronizarCheckboxesCID();
      await garantirUFsSelecionadas();
      if (state.cidSectionOpen) {
        state.cid3Inicializado = false;
        await atualizarSecaoCid(true);
      } else {
        state.cid3Inicializado = false;
      }
      atualizarDashboard();
    };

    els.btnReset.addEventListener("click", resetarFiltros);
    els.btnEmptyReset.addEventListener("click", resetarFiltros);
    els.btnExportCsv.addEventListener("click", exportarCSV);

    els.btnRetry.addEventListener("click", async () => {
      await garantirUFsSelecionadas();
      atualizarDashboard();
    });

    const mediaDark = window.matchMedia("(prefers-color-scheme: dark)");
    const onThemeChange = () => {
      if (state.filteredRows.length > 0) {
        renderizarGraficos(state.filteredRows);
      }
      if (state.cidSectionOpen) {
        renderizarSecaoCid();
      }
    };
    if (typeof mediaDark.addEventListener === "function") {
      mediaDark.addEventListener("change", onThemeChange);
    } else if (typeof mediaDark.addListener === "function") {
      mediaDark.addListener(onThemeChange);
    }
  }

  async function inicializar() {
    setLoading(true, "Carregando catálogo do SIH/SUS...");
    await carregarIndex();
    popularFiltros();
    registrarEventos();
    await garantirUFsSelecionadas();
    atualizarDashboard();
  }

  document.addEventListener("DOMContentLoaded", inicializar);
})();
