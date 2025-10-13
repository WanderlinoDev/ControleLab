// ===========================================================
// SCRIPT PRINCIPAL - AGENDAMENTO DE RECURSOS ESCOLARES (ATUALIZADO COMPLETO)
// ===========================================================

// HORÁRIOS FIXOS
const HORARIOS = [
  "07:00-07:50", "07:50-08:40", "08:40-09:30", "Recreio",
  "09:45-10:35", "10:35-11:25", "11:25-12:15", "Almoço",
  "13:15-14:05", "14:05-14:55", "14:55-15:45"
];

// BLOQUEIOS FIXOS POR RECURSO
const regrasPorRecurso = {
  Laboratorio: [
    { diaSemana: 1, horario: "14:05-14:55" },
    { diaSemana: 1, horario: "14:55-15:45" },
    { diaSemana: 2, horario: "07:50-08:40" },
    { diaSemana: 2, horario: "08:40-09:30" },
    { diaSemana: 2, horario: "09:45-10:35" },
    { diaSemana: 2, horario: "10:35-11:25" },
    { diaSemana: 2, horario: "13:15-14:05" },
    { diaSemana: 2, horario: "14:05-14:55" },
    { diaSemana: 3, horario: "08:40-09:30" },
    { diaSemana: 3, horario: "09:45-10:35" },
    { diaSemana: 3, horario: "11:25-12:15" },
    { diaSemana: 3, horario: "13:15-14:05" },
    { diaSemana: 3, horario: "14:05-14:55" },
    { diaSemana: 3, horario: "14:55-15:45" },
    { diaSemana: 4, horario: "08:40-09:30" },
    { diaSemana: 4, horario: "09:45-10:35" },
    { diaSemana: 4, horario: "11:25-12:15" },
    { diaSemana: 4, horario: "13:15-14:05" },
    { diaSemana: 4, horario: "14:05-14:55" },
    { diaSemana: 4, horario: "14:55-15:45" },
    { diaSemana: 5, horario: "11:25-12:15" },
    { diaSemana: 5, horario: "13:15-14:05" },
    { diaSemana: 5, horario: "14:05-14:55" }
  ],
  Projetor: []
};

// NOMES DE DIAS E MESES
const NOMES_DIAS = ["Domingo","Segunda","Terça","Quarta","Quinta","Sexta","Sábado"];
const NOME_MESES = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];

let anoVisualizado = new Date().getFullYear();
let mesVisualizado = new Date().getMonth();
let dataSelecionada = null;
let agendamentosDoDia = [];
let recursoAtual = 'Laboratorio';
let bloqueiosCalendario = {};
let RECURSOS_DISPONIVEIS = [];

const API_URL = "http://localhost:3000/api";

// ===========================================================
// UTILITÁRIAS
// ===========================================================
function formatarData(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function atualizarTituloCalendario() {
  document.getElementById("mes-ano-atual").textContent =
    `${NOME_MESES[mesVisualizado]} de ${anoVisualizado}`;
}

// ===========================================================
// NAVEGAÇÃO ENTRE MESES
// ===========================================================
function mesAnterior() {
  mesVisualizado--;
  if (mesVisualizado < 0) {
    mesVisualizado = 11;
    anoVisualizado--;
  }
  renderizarTabela();
}

function proximoMes() {
  mesVisualizado++;
  if (mesVisualizado > 11) {
    mesVisualizado = 0;
    anoVisualizado++;
  }
  renderizarTabela();
}

// ===========================================================
// CALENDÁRIO
// ===========================================================
function renderizarTabela() {
  atualizarTituloCalendario();
  const container = document.getElementById("dias-do-mes");
  container.innerHTML = "";

  const primeiroDiaMes = new Date(anoVisualizado, mesVisualizado, 1);
  const ultimoDiaMes = new Date(anoVisualizado, mesVisualizado + 1, 0);
  const primeiroDiaSemana = primeiroDiaMes.getDay();

  for (let i = 0; i < primeiroDiaSemana; i++) {
    const celulaVazia = document.createElement("div");
    celulaVazia.className = "dia-celula vazio";
    container.appendChild(celulaVazia);
  }

  for (let dia = 1; dia <= ultimoDiaMes.getDate(); dia++) {
    const dataAtual = new Date(anoVisualizado, mesVisualizado, dia);
    const dataStr = formatarData(dataAtual);
    const celula = document.createElement("div");
    celula.className = "dia-celula";
    celula.dataset.data = dataStr;

    const bloqueio = bloqueiosCalendario[dataStr];
    const isFimDeSemana = dataAtual.getDay() === 0 || dataAtual.getDay() === 6;
    const isHoje = formatarData(dataAtual) === formatarData(new Date());

    if (isFimDeSemana) celula.classList.add("fim-semana");
    if (bloqueio) {
      if (bloqueio.tipo === "FERIADO_NACIONAL") celula.classList.add("feriado-dia-inteiro");
      if (bloqueio.tipo === "RECESSO") celula.classList.add("recesso-dia-inteiro");
    }

    // 🔒 Bloquear sábados, domingos, feriados e recessos
    if (isFimDeSemana || bloqueio) {
      celula.style.cursor = "not-allowed";
    } else {
      celula.addEventListener("click", () => selecionarDia(dataAtual, dataStr));
    }

    if (isHoje) celula.classList.add("selecionado");

    celula.innerHTML = `
      <span class="font-bold text-lg">${dia}</span>
      ${bloqueio ? `<div class="text-xs">${bloqueio.nome}</div>` : ""}
    `;
    container.appendChild(celula);
  }
}

// ===========================================================
// SELECIONAR DIA
// ===========================================================
async function selecionarDia(dateObj, dateStr) {
  dataSelecionada = dateStr;
  document.querySelectorAll(".dia-celula").forEach(c => c.classList.remove("selecionado"));
  const cel = document.querySelector(`.dia-celula[data-data="${dateStr}"]`);
  if (cel) cel.classList.add("selecionado");
  await carregarAgendamentos(recursoAtual, dateStr);
  mostrarHorariosDoDia(dateObj);
}

// ===========================================================
// BUSCAR BLOQUEIOS, AGENDAMENTOS E RECURSOS
// ===========================================================
async function carregarBloqueios() {
  try {
    const res = await fetch(`${API_URL}/bloqueios`);
    if (!res.ok) throw new Error("Falha ao carregar bloqueios do banco.");
    const dados = await res.json();

    bloqueiosCalendario = {};
    dados.forEach(b => {
      const dataISO = b.data.split('T')[0]; // garante formato yyyy-mm-dd
      bloqueiosCalendario[dataISO] = {
        data: dataISO,
        nome: b.nome || "Bloqueio",
        tipo: b.tipo || "FERIADO_NACIONAL"
      };
    });

    console.log("✅ Bloqueios carregados do banco:", bloqueiosCalendario);
  } catch (erro) {
    console.warn("⚠️ Erro ao carregar bloqueios, usando mock:", erro.message);
    const MOCK = [
      { data: "2025-10-12", nome: "Feriado Nacional", tipo: "FERIADO_NACIONAL" },
      { data: "2025-10-13", nome: "Recesso Escolar", tipo: "RECESSO" }
    ];
    MOCK.forEach(b => bloqueiosCalendario[b.data] = b);
  }
}

async function carregarAgendamentos(recurso, data) {
  try {
    const ano = data.split("-")[0];
    const mes = data.split("-")[1];
    const res = await fetch(`${API_URL}/agendamentos/1/${ano}/${mes}`);
    const dados = await res.json();
    agendamentosDoDia = dados.agendamentos.filter(a => a.data_reserva === data);
  } catch {
    agendamentosDoDia = [];
  }
}

const RECURSOS_MOCK = [
  { id: 1, nome: "Laboratorio", descricao: "Laboratório de Informática" },
  { id: 2, nome: "Projetor", descricao: "Projetor portátil" }
];

async function carregarRecursos() {
  const container = document.getElementById("recurso-selector");
  if (!container) return;
  try {
    const res = await fetch(`${API_URL}/recursos`);
    if (!res.ok) throw new Error();
    RECURSOS_DISPONIVEIS = await res.json();
  } catch {
    RECURSOS_DISPONIVEIS = RECURSOS_MOCK;
  }
  renderizarRecursos();
}

function renderizarRecursos() {
  const container = document.getElementById("recurso-selector");
  container.innerHTML = '';
  RECURSOS_DISPONIVEIS.forEach(recurso => {
    const ativo = recurso.nome === recursoAtual;
    const label = document.createElement('label');
    label.className = `inline-flex items-center cursor-pointer p-3 rounded-xl shadow-sm ${ativo ? 'bg-[#003366] text-[#FFD700]' : 'bg-white text-gray-700'}`;
    label.innerHTML = `<input type='radio' name='recurso' value='${recurso.nome}' ${ativo ? 'checked' : ''} class='hidden'><span class='ml-2 font-medium'>${recurso.nome}</span>`;
    label.querySelector('input').addEventListener('change', e => selecionarRecurso(e.target.value));
    container.appendChild(label);
  });
}

async function selecionarRecurso(recurso) {
  recursoAtual = recurso;
  renderizarRecursos();
  renderizarTabela();
  if (dataSelecionada) {
    await carregarAgendamentos(recursoAtual, dataSelecionada);
    mostrarHorariosDoDia(new Date(dataSelecionada));
  }
}

// ===========================================================
// MOSTRAR HORÁRIOS DO DIA
// ===========================================================
function mostrarHorariosDoDia(dateObj) {
  const container = document.getElementById("detalhe-container");
  container.classList.remove("hidden");

  // Atualiza título “Horários para --”
  document.getElementById("dia-detalhe").textContent =
    `${dateObj.getDate()} de ${NOME_MESES[dateObj.getMonth()]} de ${dateObj.getFullYear()}`;

  const lista = document.getElementById("horarios-lista");
  lista.innerHTML = "";
  const diaSemana = dateObj.getDay();
  const bloqueiosFixos = regrasPorRecurso[recursoAtual] || [];

  HORARIOS.forEach(horario => {
    const item = document.createElement("div");

    if (horario === "Recreio" || horario === "Almoço") {
      item.className = "p-2 border rounded-md text-center ocupado";
      item.textContent = horario;
      lista.appendChild(item);
      return;
    }

    const bloqueadoFixo = bloqueiosFixos.some(r => r.diaSemana === diaSemana && r.horario === horario);
    const bloqueioDia = bloqueiosCalendario[dataSelecionada];
    const ocupadoBanco = agendamentosDoDia.some(a => a.horario_reserva === horario);

    if (bloqueadoFixo || bloqueioDia || ocupadoBanco) {
      item.className = "p-2 border rounded-md text-center ocupado";
      item.textContent = `${horario} - TÉCNICO INFO.`;
    } else {
      item.className = "p-2 border rounded-md text-center livre";
      item.textContent = `${horario} - Livre - CLIQUE PARA AGENDAR`;
      item.addEventListener("click", () => agendarHorario(horario));
    }

    lista.appendChild(item);
  });
}

// ===========================================================
// AGENDAR HORÁRIO
// ===========================================================
async function agendarHorario(horario) {
  const professor = prompt("Informe seu nome:");
  const turma = prompt("Informe sua turma:");
  if (!professor || !turma) return alert("Dados obrigatórios!");

  const body = { id_recurso: 1, professor, turma, data_reserva: dataSelecionada, horario_reserva: horario };
  try {
    const res = await fetch(`${API_URL}/agendar`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });
    if (!res.ok) {
      const err = await res.json();
      alert(err.error || "Erro ao agendar.");
    } else {
      alert("✅ Agendamento realizado com sucesso!");
      await carregarAgendamentos(recursoAtual, dataSelecionada);
      mostrarHorariosDoDia(new Date(dataSelecionada));
    }
  } catch {
    alert("Erro de conexão com o servidor.");
  }
}

// ===========================================================
// INICIALIZAÇÃO
// ===========================================================
document.addEventListener("DOMContentLoaded", async () => {
  await carregarBloqueios();
  await carregarRecursos();
  renderizarTabela();
  document.getElementById("btn-anterior").addEventListener("click", mesAnterior);
  document.getElementById("btn-proximo").addEventListener("click", proximoMes);
});
