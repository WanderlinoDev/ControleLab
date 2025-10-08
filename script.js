// HORÁRIOS FIXOS DA SEMANA
const HORARIOS = [
    "07:00-07:50", "07:50-08:40", "08:40-09:30", "Recreio",
    "09:45-10:35", "10:35-11:25", "11:25-12:15", "Almoço",
    "13:15-14:05", "14:05-14:55", "14:55-15:45"
];

// Mapeamento dos nomes dos dias (0=Dom, 1=Seg, ..., 6=Sáb)
const NOMES_DIAS = ["Domingo", "Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado"];
const NOME_MESES = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

// 🛑 REGRAS: FERIADOS NACIONAIS (2025 - ATUALIZE ESTAS DATAS TODO ANO!)
// Formato: YYYY-MM-DD. Feriados bloqueiam o dia inteiro.
const FERIADOS_NACIONAIS = [
    "2025-01-01", // Confraternização Universal
    "2025-04-21", // Tiradentes
    "2025-05-01", // Dia do Trabalho
    "2025-09-07", // Independência do Brasil
    "2025-10-12", // Nossa Senhora Aparecida
    "2025-11-02", // Finados
    "2025-11-15", // Proclamação da República
    "2025-12-25"  // Natal
];


// 🛑 REGRAS DE BLOQUEIO FIXO SEMANAL (0=Dom, 1=Seg, ..., 5=Sex)
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
    { diaSemana: 3, horario: "11:25-12:15" }, 
    { diaSemana: 3, horario: "13:15-14:05" }, 
    { diaSemana: 3, horario: "14:05-14:55" }, 
    { diaSemana: 3, horario: "14:55-15:45" }, 
    // Quinta-feira (4)
    { diaSemana: 4, horario: "08:40-09:30" }, 
    { diaSemana: 4, horario: "09:45-10:35" }, 
    { diaSemana: 4, horario: "11:25-12:15" }, 
    { diaSemana: 4, horario: "13:15-14:05" }, 
    { diaSemana: 4, horario: "14:05-14:55" }, 
    { diaSemana: 4, horario: "14:55-15:45" }, 
    // Sexta-feira (5)
    { diaSemana: 5, horario: "11:25-12:15" }, 
    { diaSemana: 5, horario: "13:15-14:05" }, 
    { diaSemana: 5, horario: "14:05-14:55" } 
];

// SIMULAÇÃO DO BANCO DE DADOS (BD): Agendamentos feitos
let agendamentosDB = [
    // Exemplo: Agendamento para o dia 8 de Outubro (assumindo 2025)
    { professor: "Prof. Ana", turma: "EJA", data: "2025-10-08", horario: "07:00-07:50" }
];

// VARIÁVEIS GLOBAIS PARA CONTROLE DE MÊS/ANO VISUALIZADO
let anoVisualizado = new Date().getFullYear(); // Começa no ano atual
let mesVisualizado = new Date().getMonth();   // Começa no mês atual (0=Jan, 11=Dez)

// Variáveis de estado para o agendamento em andamento
let dataSelecionada = '';
let horarioSelecionado = '';


/**
 * 🔢 Retorna os dados de todos os dias do mês e ano visualizados.
 */
function getDiasDoMes() {
    const ano = anoVisualizado;
    const mes = mesVisualizado;
    const ultimoDia = new Date(ano, mes + 1, 0).getDate();
    const primeiroDiaMes = new Date(ano, mes, 1).getDay();
    const dias = [];

    // 1. Preenche os dias vazios (padding)
    for (let i = 0; i < primeiroDiaMes; i++) {
        dias.push({ data: null, diaNumero: null, isVazio: true });
    }

    // 2. Adiciona os dias reais do mês
    for (let i = 1; i <= ultimoDia; i++) {
        const data = new Date(ano, mes, i);
        const diaSemanaIndex = data.getDay(); 
        const dataFormatada = `${ano}-${(mes + 1).toString().padStart(2, '0')}-${i.toString().padStart(2, '0')}`;
        
        const temBloqueio = BLOQUEIOS_FIXOS_SEMANAIS.some(b => b.diaSemana === diaSemanaIndex);

        dias.push({
            data: dataFormatada,
            diaNumero: i,
            diaSemanaIndex: diaSemanaIndex,
            diaSemanaNome: NOMES_DIAS[diaSemanaIndex],
            isFimSemana: (diaSemanaIndex === 0 || diaSemanaIndex === 6), 
            temBloqueioFixo: temBloqueio,
            isVazio: false
        });
    }
    return dias;
}


/**
 * 🆕 Preenche o <select> com opções do mês e bloqueia Janeiro (férias).
 */
function preencherSeletorMes() {
    const seletor = document.getElementById('seletor-mes');
    seletor.innerHTML = ''; 
    
    // Pega a data de início (mês atual)
    const dataInicial = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    
    // Gera 13 meses a partir do mês atual (1 ano de visualização)
    for (let i = 0; i < 13; i++) {
        const data = new Date(dataInicial.getFullYear(), dataInicial.getMonth() + i, 1);
        const nomeMes = NOME_MESES[data.getMonth()];
        const ano = data.getFullYear();
        const mesIndex = data.getMonth();
        
        // 🛑 Regra de bloqueio: Janeiro (mês 0) é Férias!
        const isDisabled = (mesIndex === 0);
        
        const valor = `${ano}-${mesIndex}`;
        
        const option = document.createElement('option');
        option.value = valor;
        option.textContent = `${nomeMes}/${ano}`;
        option.disabled = isDisabled; 
        
        // Marca o mês atualmente visualizado como selecionado
        if (mesIndex === mesVisualizado && ano === anoVisualizado) {
            option.selected = true;
        }
        
        seletor.appendChild(option);
    }
}


/**
 * 🆕 Atualiza o calendário quando o usuário troca o mês no <select>.
 * @param {string} valor - O valor selecionado (YYYY-MM).
 */
function trocarMes(valor) {
    const [ano, mes] = valor.split('-').map(Number);
    
    // Atualiza as variáveis globais
    anoVisualizado = ano;
    mesVisualizado = mes;

    // Redesenha a tela
    renderizarTabela();
    
    // Limpa a área de detalhes
    document.getElementById('horarios-detalhe').innerHTML = '<h3>Selecione um novo dia no calendário.</h3><p>Clique em um dia para ver a disponibilidade de horários.</p>';
}


/**
 * 🎨 Renderiza a grade principal do calendário.
 */
function renderizarTabela() {
    const diasDoMesAtual = getDiasDoMes();
    const container = document.getElementById('dias-do-mes');
    
    // ❌ NOTA: A referência ao elemento #nome-mes (h2) foi removida, conforme solicitado!
    
    let html = '';

    diasDoMesAtual.forEach(diaInfo => {
        let classe = 'dia-celula';
        let conteudo = '';
        
        const isFeriado = FERIADOS_NACIONAIS.includes(diaInfo.data);

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
            if (isFeriado) {
                 classe += ' feriado'; 
            }
        }
        
        const podeClicar = !diaInfo.isVazio && !diaInfo.isFimSemana && !isFeriado;

        html += `<div class="${classe}" 
                       data-data="${diaInfo.data}" 
                       onclick="${podeClicar ? `mostrarHorariosDoDia('${diaInfo.data}')` : ''}">
                       ${conteudo}
                 </div>`;
    });

    container.innerHTML = html;
}

/**
 * ⏰ Função que mostra a lista de horários quando um dia é clicado.
 * @param {string} data - A data selecionada (YYYY-MM-DD).
 */
function mostrarHorariosDoDia(data) {
    // 1. Marca o dia clicado
    document.querySelectorAll('.dia-celula').forEach(d => d.classList.remove('selecionado'));
    const celulaClicada = document.querySelector(`.dia-celula[data-data="${data}"]`);
    if (celulaClicada) {
        celulaClicada.classList.add('selecionado');
    }

    dataSelecionada = data; 
    const infoDia = getDiasDoMes().find(d => d.data === data);
    const diaSemanaIndex = infoDia ? infoDia.diaSemanaIndex : -1;
    
    let htmlHorarios = `<h3>Horários para ${infoDia.diaSemanaNome}, ${infoDia.diaNumero}</h3>`;
    
    // 🛑 Checagem de Feriado
    const isFeriado = FERIADOS_NACIONAIS.includes(data);

    // 2. Monta a lista de horários
    HORARIOS.forEach(horario => {
        let classe = 'horario';
        let status = 'Livre';
        
        const isBloqueadoFixo = BLOQUEIOS_FIXOS_SEMANAIS.some(b => 
            b.diaSemana === diaSemanaIndex && b.horario === horario
        );
        const reserva = agendamentosDB.find(r => r.data === data && r.horario === horario);
        
        if (horario === "Recreio" || horario === "Almoço") {
            classe += ' intervalo';
            status = horario;
        } else if (isFeriado) { // 🛑 SE FOR FERIADO, BLOQUEIA GERAL!
            classe += ' bloqueio-tecnico';
            status = 'FERIADO NACIONAL';
        } else if (isBloqueadoFixo) {
            classe += ' bloqueio-tecnico';
            status = 'TÉCNICO INFO.';
        } else if (reserva) {
            classe += ' agendado';
            status = `${reserva.professor} - Turma: ${reserva.turma}`;
        } else {
            classe += ' livre'; 
            status = `<span onclick="abrirModalAgendamento('${data}', '${horario}')">Livre - CLIQUE PARA AGENDAR</span>`;
        }

        htmlHorarios += `<div class="${classe}">${horario} - ${status}</div>`;
    });
    
    document.getElementById('horarios-detalhe').innerHTML = htmlHorarios; 
}


/**
 * 📋 Prepara e abre o modal de agendamento (Pop-up).
 */
function abrirModalAgendamento(data, horario) {
    dataSelecionada = data;
    horarioSelecionado = horario;
    
    const infoDia = getDiasDoMes().find(d => d.data === data);
    const dataDisplay = `${infoDia.diaSemanaNome} (${infoDia.diaNumero}) - ${horario}`;
    
    document.getElementById('info-horario').innerText = dataDisplay;
    document.getElementById('modal-reserva').style.display = 'block';
}


// 🚀 INICIA O SISTEMA E ESCUTA EVENTOS
document.addEventListener('DOMContentLoaded', () => {
    // 1. Preenche o seletor de meses
    preencherSeletorMes();
    
    // 2. Carrega o calendário padrão (Mês/Ano atuais)
    renderizarTabela(); 
    
    // 3. Listener do formulário de submissão (A mágica de agendar!)
    document.getElementById('form-reserva').addEventListener('submit', function(e) {
        e.preventDefault(); 

        const professor = document.getElementById('nome-professor').value;
        const turma = document.getElementById('nome-turma').value;

        const novoAgendamento = {
            professor: professor,
            turma: turma,
            data: dataSelecionada,
            horario: horarioSelecionado
        };

        agendamentosDB.push(novoAgendamento);

        document.getElementById('modal-reserva').style.display = 'none';
        document.getElementById('form-reserva').reset();

        // ATUALIZA A TELA!
        renderizarTabela(); 
        mostrarHorariosDoDia(dataSelecionada); 

        alert(`Agendado com sucesso! Horário bloqueado para ${professor}.`);
    });
});