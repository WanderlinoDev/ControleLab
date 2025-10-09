// HORÁRIOS FIXOS DA SEMANA
const HORARIOS = [
    "07:00-07:50", "07:50-08:40", "08:40-09:30", "Recreio",
    "09:45-10:35", "10:35-11:25", "11:25-12:15", "Almoço",
    "13:15-14:05", "14:05-14:55", "14:55-15:45"
];

// Mapeamento dos nomes dos dias e meses
const NOMES_DIAS = ["Domingo", "Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado"];
const NOME_MESES = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

// VARIÁVEIS GLOBAIS PARA CONTROLE DE MÊS/ANO VISUALIZADO E RECURSO
let anoVisualizado = new Date().getFullYear(); 
let mesVisualizado = new Date().getMonth();  
let recursoAtual = 'Laboratorio'; // Começa com Laboratório

// 🛑 REGRAS: FERIADOS NACIONAIS (2025)
const FERIADOS_NAIONAIS = [
    "2025-01-01", 
    "2025-04-21", 
    "2025-05-01", 
    "2025-09-07", 
    "2025-10-12", 
    "2025-11-02", 
    "2025-11-15", 
    "2025-12-25" 
];


// 🛑 REGRAS DE BLOQUEIO FIXO POR RECURSO
const regrasPorRecurso = {
    // Regras de Bloqueio para o Laboratório (Bloqueios Fixos Semanais - Técnico)
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
    // Regras de Bloqueio para o Projetor (Nenhum bloqueio fixo semanal)
    Projetor: [] 
};

// SIMULAÇÃO DO BANCO DE DADOS (BD): Agendamentos feitos
// 🆕 Agora inclui o campo 'recurso' para distinguir
let agendamentosDB = [
    { professor: "Prof. Ana", turma: "EJA", data: "2025-10-08", horario: "07:00-07:50", recurso: "Laboratorio" }
    // Novo agendamento de exemplo para Projetor
    // { professor: "Prof. Beto", turma: "201", data: "2025-10-09", horario: "10:35-11:25", recurso: "Projetor" }
];

// Variáveis de estado para o agendamento em andamento
let dataSelecionada = '';
let horarioSelecionado = '';

/**
 * 🆕 FUNÇÃO CHAVE: Altera o recurso atual e atualiza a tela
 */
function selecionarRecurso() {
    const radioLaboratorio = document.getElementById('radio-laboratorio');
    recursoAtual = radioLaboratorio.checked ? 'Laboratorio' : 'Projetor';
    
    // Atualiza o título do cabeçalho
    const header = document.getElementById('header-topo').querySelector('h1');
    header.textContent = `RESERVA DE ${recursoAtual.toUpperCase()} DE INFORMÁTICA`;

    // Limpa a visualização de horários e renderiza o calendário com as novas regras
    document.getElementById('horarios-detalhe').innerHTML = '<h3>Selecione um dia no calendário.</h3><p>Clique em um dia para ver a disponibilidade de horários.</p>';
    renderizarTabela();
}


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
    const bloqueiosSemanais = regrasPorRecurso[recursoAtual]; // Pega as regras do recurso atual

    for (let i = 1; i <= ultimoDia; i++) {
        const data = new Date(ano, mes, i);
        const diaSemanaIndex = data.getDay(); 
        const dataFormatada = `${ano}-${(mes + 1).toString().padStart(2, '0')}-${i.toString().padStart(2, '0')}`;
        
        // Verifica bloqueios fixos baseados no recurso atual
        const temBloqueio = bloqueiosSemanais.some(b => b.diaSemana === diaSemanaIndex);

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
    if (!seletor) return;
    
    seletor.innerHTML = ''; 
    
    const dataInicial = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    
    for (let i = 0; i < 13; i++) {
        const data = new Date(dataInicial.getFullYear(), dataInicial.getMonth() + i, 1);
        const nomeMes = NOME_MESES[data.getMonth()];
        const ano = data.getFullYear();
        const mesIndex = data.getMonth();
        
        const isDisabled = (mesIndex === 0 && ano === new Date().getFullYear()); 
        
        const valor = `${ano}-${mesIndex}`;
        
        const option = document.createElement('option');
        option.value = valor;
        option.textContent = `${nomeMes}/${ano}`;
        option.disabled = isDisabled; 
        
        if (mesIndex === mesVisualizado && ano === anoVisualizado) {
            option.selected = true;
        }
        
        seletor.appendChild(option);
    }
}


/**
 * 🆕 Atualiza o calendário quando o usuário troca o mês no <select>.
 */
function trocarMes(valor) {
    const [ano, mes] = valor.split('-').map(Number);
    
    anoVisualizado = ano;
    mesVisualizado = mes;

    renderizarTabela();
    
    document.getElementById('horarios-detalhe').innerHTML = '<h3>Selecione um novo dia no calendário.</h3><p>Clique em um dia para ver a disponibilidade de horários.</p>';
}


/**
 * 🎨 Renderiza a grade principal do calendário.
 */
function renderizarTabela() {
    const diasDoMesAtual = getDiasDoMes();
    const container = document.getElementById('dias-do-mes');
    
    if (!container) return; 

    let html = '';

    diasDoMesAtual.forEach(diaInfo => {
        let classe = 'dia-celula';
        let conteudo = '';
        
        // Verifica se a data é um feriado
        const isFeriado = FERIADOS_NAIONAIS.includes(diaInfo.data);

        if (diaInfo.isVazio) {
            classe += ' vazio';
        } else {
            conteudo = diaInfo.diaNumero;
            
            if (diaInfo.isFimSemana) {
                classe += ' fim-semana';
            }
            // 🟡 Se for feriado, adiciona a classe 'feriado'
            if (isFeriado) {
                 classe += ' feriado'; 
            }
        }
        
        // Bloqueia clique no feriado e no fim de semana
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
 */
function mostrarHorariosDoDia(data) {
    // Remove seleção de dias anteriores
    document.querySelectorAll('.dia-celula').forEach(d => d.classList.remove('selecionado'));
    const celulaClicada = document.querySelector(`.dia-celula[data-data="${data}"]`);
    if (celulaClicada) {
        celulaClicada.classList.add('selecionado');
    }

    dataSelecionada = data; 
    const infoDia = getDiasDoMes().find(d => d.data === data);
    const diaSemanaIndex = infoDia ? infoDia.diaSemanaIndex : -1;
    
    let htmlHorarios = `<h3>Horários para ${infoDia.diaSemanaNome}, ${infoDia.diaNumero}</h3>`;
    
    const isFeriado = FERIADOS_NAIONAIS.includes(data);
    const bloqueiosSemanais = regrasPorRecurso[recursoAtual]; // Regras do recurso selecionado

    HORARIOS.forEach(horario => {
        let classe = 'horario';
        let status = 'Livre';
        
        // Verifica bloqueio fixo semanal (só afeta o Laboratório)
        const isBloqueadoFixo = bloqueiosSemanais.some(b => 
            b.diaSemana === diaSemanaIndex && b.horario === horario
        );
        // Verifica se já existe agendamento para ESTE RECURSO e ESTA DATA/HORÁRIO
        const reserva = agendamentosDB.find(r => r.data === data && r.horario === horario && r.recurso === recursoAtual);
        
        if (horario === "Recreio" || horario === "Almoço") {
            // ⬜ INTERVALO
            classe += ' intervalo';
            status = horario; 
        } else if (isFeriado || infoDia.isFimSemana) { 
            // 🟥 Bloqueia feriados e fins de semana para AMBOS os recursos
            classe += ' bloqueio-tecnico';
            status = isFeriado ? 'FERIADO NACIONAL' : 'FIM DE SEMANA';
        } else if (isBloqueadoFixo) {
            // 🟥 Bloqueio Fixo (Apenas Laboratório)
            classe += ' bloqueio-tecnico';
            status = 'TÉCNICO INFO.';
        } else if (reserva) {
            // 🟦 Agendado
            classe += ' agendado';
            status = `${reserva.professor} - Turma: ${reserva.turma}`;
        } else {
            // 🟩 Livre (Clicável)
            classe += ' livre'; 
            status = `<span onclick="abrirModalAgendamento('${data}', '${horario}')">Livre - CLIQUE PARA AGENDAR</span>`;
        }

        const displayStatus = (horario === "Recreio" || horario === "Almoço") ? status : `${horario} - ${status}`;

        htmlHorarios += `<div class="${classe}">${displayStatus}</div>`;
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
    const dataDisplay = `${infoDia.diaSemanaNome}, ${infoDia.diaNumero} - ${horario}`;
    
    // Atualiza o título do modal com o recurso atual
    document.getElementById('modal-reserva').querySelector('h3').textContent = `Agendar ${recursoAtual}`;
    document.getElementById('info-horario').innerText = dataDisplay;
    document.getElementById('modal-reserva').style.display = 'block';
}


// 🚀 INICIA O SISTEMA E ESCUTA EVENTOS
document.addEventListener('DOMContentLoaded', () => {
    // 1. Tenta preencher o seletor de meses
    preencherSeletorMes();
    
    // 2. Garante que o recurso inicial esteja selecionado e o calendário seja renderizado
    selecionarRecurso();
    
    // 3. Listener do formulário de submissão
    const form = document.getElementById('form-reserva');
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault(); 

            const professor = document.getElementById('nome-professor').value;
            const turma = document.getElementById('nome-turma').value;

            const novoAgendamento = {
                professor: professor,
                turma: turma,
                data: dataSelecionada,
                horario: horarioSelecionado,
                recurso: recursoAtual // 🆕 Salva o recurso!
            };

            agendamentosDB.push(novoAgendamento);

            document.getElementById('modal-reserva').style.display = 'none';
            form.reset();

            // Atualiza o calendário e os horários do dia selecionado
            renderizarTabela(); 
            mostrarHorariosDoDia(dataSelecionada); 

            alert(`Agendado com sucesso! Horário bloqueado para ${professor} no ${recursoAtual}.`);
        });
    }
});