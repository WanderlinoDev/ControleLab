// HORÁRIOS FIXOS DA SEMANA
const HORARIOS = [
    "07:00-07:50", "07:50-08:40", "08:40-09:30", "Recreio",
    "09:45-10:35", "10:35-11:25", "11:25-12:15", "Almoço",
    "13:15-14:05", "14:05-14:55", "14:55-15:45"
];

// Mapeamento dos nomes dos dias para a função nativa do JS (0=Dom, 1=Seg, ..., 6=Sáb)
const NOMES_DIAS = ["Domingo", "Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado"];
const NOME_MESES = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

// REGRAS DE BLOQUEIO FIXO SEMANAL (0=Dom, 1=Seg, ..., 5=Sex)
const BLOQUEIOS_FIXOS_SEMANAIS = [
    // Segunda-feira (1)
    { diaSemana: 1, horario: "14:05-14:55" }, 
    { diaSemana: 1, horario: "14:55-15:45" }, 

    // Terça-feira (2)
    { diaSemana: 2, horario: "07:50-08:40" }, 
    { diaSemana: 2, horario: "08:40-09:30" }, 
    { diaSemana: 2, horario: "09:45-10:35" }, 
    { diaSemana: 2, horario: "10:35-11:25" }, 
    { diaSemana: 2, horario: "13:15-14:05" }, 
    { diaSemana: 2, horario: "14:05-14:55" }, 

    // Quarta-feira (3)
    { diaSemana: 3, horario: "08:40-09:30" }, 
    { diaSemana: 3, horario: "09:45-10:35" }, 

    // Quinta-feira (4)
    { diaSemana: 4, horario: "11:25-12:15" }, 
    { diaSemana: 4, horario: "13:15-14:05" }, 
    { diaSemana: 4, horario: "14:05-14:55" }, 
 
   

    // Sexta-feira (5)
    { diaSemana: 5, horario: "11:25-12:15" }, 
    { diaSemana: 5, horario: "13:15-14:05" }, 

];

// Dados simulados do nosso "Banco de Dados" (BD) - Agendamentos
let agendamentosDB = [
    // Exemplo: Agendamento para o dia 8 de Outubro (assumindo 2025)
    { professor: "Prof. Ana", turma: "EJA", data: "2025-10-08", horario: "07:00-07:50" }
];

// Variáveis de estado
let dataSelecionada = '';
let horarioSelecionado = '';

/**
 * Gera os dados de todos os dias do mês atual.
 */
function getDiasDoMes() {
    const dataAtual = new Date();
    const ano = dataAtual.getFullYear();
    const mes = dataAtual.getMonth(); // 0 a 11

    // 1. Encontra o último dia do mês
    const ultimoDia = new Date(ano, mes + 1, 0).getDate();
    const dias = [];

    // 2. Preenche os dias vazios (Padding) no início do calendário
    const primeiroDiaMes = new Date(ano, mes, 1).getDay(); // 0 (Dom) a 6 (Sáb)
    for (let i = 0; i < primeiroDiaMes; i++) {
        dias.push({ data: null, diaNumero: null, diaSemanaIndex: i, isVazio: true });
    }

    // 3. Adiciona os dias reais do mês
    for (let i = 1; i <= ultimoDia; i++) {
        const data = new Date(ano, mes, i);
        const diaSemanaIndex = data.getDay(); 
        const dataFormatada = `${ano}-${(mes + 1).toString().padStart(2, '0')}-${i.toString().padStart(2, '0')}`;
        
        // Verifica se o dia tem algum bloqueio fixo (apenas para o visual do calendário)
        const temBloqueio = BLOQUEIOS_FIXOS_SEMANAIS.some(b => b.diaSemana === diaSemanaIndex);

        dias.push({
            data: dataFormatada,
            diaNumero: i,
            diaSemanaIndex: diaSemanaIndex,
            diaSemanaNome: NOMES_DIAS[diaSemanaIndex],
            isFimSemana: (diaSemanaIndex === 0 || diaSemanaIndex === 6), 
            temBloqueioFixo: temBloqueio
        });
    }
    return dias;
}

const DIAS_DO_MES = getDiasDoMes();
const DATA_ATUAL = new Date();
const MES_E_ANO_ATUAL = `${NOME_MESES[DATA_ATUAL.getMonth()]} / ${DATA_ATUAL.getFullYear()}`;

/**
 * Renderiza a grade principal do calendário.
 */
function renderizarTabela() {
    const container = document.getElementById('dias-do-mes');
    const nomeMesElement = document.getElementById('nome-mes');
    
    // Atualiza o Título
    if(nomeMesElement) {
        nomeMesElement.innerText = MES_E_ANO_ATUAL;
    }

    let html = '';

    // Cria as células dos dias
    DIAS_DO_MES.forEach(diaInfo => {
        let classe = 'dia-celula';
        let conteudo = '';

        if (diaInfo.isVazio) {
            classe += ' vazio';
        } else {
            conteudo = diaInfo.diaNumero;
            if (diaInfo.isFimSemana) {
                classe += ' fim-semana';
            }
            if (diaInfo.temBloqueioFixo) {
                classe += ' tem-bloqueio';
            }
        }
        
        // Adiciona um listener de clique a todos os dias reais (não vazios e não fim de semana)
        html += `<div class="${classe}" 
                       data-data="${diaInfo.data}" 
                       data-dia-nome="${diaInfo.diaSemanaNome}"
                       onclick="${diaInfo.isVazio || diaInfo.isFimSemana ? '' : `mostrarHorariosDoDia('${diaInfo.data}')`}">
                       ${conteudo}
                 </div>`;
    });

    container.innerHTML = html;
}

/**
 * Mostra os horários disponíveis para o dia clicado.
 * @param {string} data - A data selecionada (YYYY-MM-DD).
 */
function mostrarHorariosDoDia(data) {
    // 1. Remove a classe 'selecionado' de todos os dias
    document.querySelectorAll('.dia-celula').forEach(d => d.classList.remove('selecionado'));
    
    // 2. Adiciona a classe 'selecionado' ao dia clicado
    const celulaClicada = document.querySelector(`.dia-celula[data-data="${data}"]`);
    if (celulaClicada) {
        celulaClicada.classList.add('selecionado');
    }

    dataSelecionada = data; // Define a data globalmente para o agendamento
    const infoDia = DIAS_DO_MES.find(d => d.data === data);
    const diaSemanaIndex = infoDia ? infoDia.diaSemanaIndex : -1;
    
    let htmlHorarios = `<h3>Horários para ${infoDia.diaSemanaNome}, ${infoDia.diaNumero}</h3>`;
    
    // 3. Monta a lista de horários
    HORARIOS.forEach(horario => {
        let classe = 'horario';
        let status = 'Livre';
        let professorInfo = '';
        
        // Checa Bloqueio Fixo
        const isBloqueadoFixo = BLOQUEIOS_FIXOS_SEMANAIS.some(b => 
            b.diaSemana === diaSemanaIndex && b.horario === horario
        );

        // Checa Agendamento Dinâmico
        const reserva = agendamentosDB.find(r => r.data === data && r.horario === horario);
        
        if (horario === "Recreio" || horario === "Almoço") {
            classe += ' intervalo';
            status = horario;
        } else if (isBloqueadoFixo) {
            classe += ' bloqueio-tecnico';
            status = 'TÉCNICO INFO.';
        } else if (reserva) {
            classe += ' agendado';
            status = `${reserva.professor} - Turma: ${reserva.turma}`;
        } else {
            classe += ' livre';
            // Adiciona a função de abrir o modal ao horário livre
            status = `<span onclick="abrirModalAgendamento('${data}', '${horario}')">Livre - CLIQUE PARA AGENDAR</span>`;
        }

        htmlHorarios += `<div class="${classe}">${horario} - ${status}</div>`;
    });
    
    document.getElementById('horarios-detalhe').querySelector('h3').innerHTML = htmlHorarios;
}

/**
 * Prepara e abre o modal de agendamento.
 * @param {string} data - A data completa (YYYY-MM-DD).
 * @param {string} horario - O horário.
 */
function abrirModalAgendamento(data, horario) {
    dataSelecionada = data;
    horarioSelecionado = horario;
    
    const infoDia = DIAS_DO_MES.find(d => d.data === data);
    const dataDisplay = `${infoDia.diaSemanaNome} (${infoDia.diaNumero}) - ${horario}`;
    
    document.getElementById('info-horario').innerText = dataDisplay;
    document.getElementById('modal-reserva').style.display = 'block';
}


// Lógica de Submissão do Formulário
document.addEventListener('DOMContentLoaded', () => {
    // Listener do formulário de submissão
    document.getElementById('form-reserva').addEventListener('submit', function(e) {
        e.preventDefault(); 

        const professor = document.getElementById('nome-professor').value;
        const turma = document.getElementById('nome-turma').value;

        // Cria o novo agendamento
        const novoAgendamento = {
            professor: professor,
            turma: turma,
            data: dataSelecionada, // Usa a data definida ao abrir o modal
            horario: horarioSelecionado
        };

        // Grava e atualiza
        agendamentosDB.push(novoAgendamento);

        document.getElementById('modal-reserva').style.display = 'none';
        document.getElementById('form-reserva').reset();

        // Atualiza a visualização do calendário (para o dia selecionado)
        renderizarTabela(); 
        mostrarHorariosDoDia(dataSelecionada); // Recarrega os detalhes do dia

        alert(`Agendado com sucesso! Horário bloqueado para ${professor}.`);
    });
    
    // Roda a função principal para carregar o calendário assim que o HTML estiver pronto
    renderizarTabela();
});