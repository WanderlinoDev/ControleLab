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

// 🛑 REGRAS: FERIADOS NACIONAIS (Bloqueia o DIA INTEIRO)
const FERIADOS_NAIONAIS = [
    "2025-01-01", 
    "2025-04-21", 
    "2025-05-01", 
    "2025-09-07", 
    "2025-10-12", 
    "2025-11-02", 
    "2025-11-15", 
    "2025-11-20", 
    "2025-12-25" 
];

// 🛑 BLOQUEIOS ADICIONAIS E RECESSOS (Bloqueia o DIA INTEIRO)
// Formato: { data: "AAAA-MM-DD", tipo: "Texto de Bloqueio" }
const BLOQUEIOS_ADICIONAIS = [
    // Recesso dos Professores em Outubro/2025
    { data: "2025-10-13", tipo: "Recesso Escolar" },
    { data: "2025-10-14", tipo: "Recesso Escolar" },
    { data: "2025-10-15", tipo: "Recesso Escolar" },
    { data: "2025-10-16", tipo: "Recesso Escolar" },
    { data: "2025-10-17", tipo: "Recesso Escolar" },
    { data: "2025-11-21", tipo: "Recesso Escolar" },
    // Exemplo de Feriado Municipal
    { data: "2025-11-20", tipo: "Feriado Municipal" },
];


// 🛑 REGRAS DE BLOQUEIO FIXO POR RECURSO (Técnico/Manutenção)
const regrasPorRecurso = {
    // Regras de Bloqueio para o Laboratório 
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
let agendamentosDB = [
    { professor: "Prof. Ana", turma: "EJA", data: "2025-10-08", horario: "07:00-07:50", recurso: "Laboratorio" }
];

// Variáveis de estado para o agendamento em andamento
let dataSelecionada = '';
let horarioSelecionado = '';

/**
 * FUNÇÃO CHAVE: Altera o recurso atual e atualiza a tela
 */
function selecionarRecurso() {
    const radioLaboratorio = document.getElementById('radio-laboratorio');
    recursoAtual = radioLaboratorio.checked ? 'Laboratorio' : 'Projetor';
    
    // 1. Define o nome completo do recurso para Header (CAIXA ALTA) e Modal (Amigável)
    let nomeRecursoHeader = '';
    let nomeRecursoModal = '';

    if (recursoAtual === 'Laboratorio') {
        nomeRecursoHeader = 'LABORATÓRIO DE INFORMÁTICA';
        nomeRecursoModal = 'Laboratório de Informática';
    } else {
        nomeRecursoHeader = 'PROJETOR | NOTEBOOK'; 
        nomeRecursoModal = 'Projetor | Notebook';
    }
    
    // Atualiza o texto dinâmico na tela principal (span dentro do H1)
    const spanRecurso = document.getElementById('recurso-selecionado');
    if (spanRecurso) {
        spanRecurso.textContent = nomeRecursoHeader;
    }


    // 2. Atualiza o título do modal (usando o formato amigável)
    document.getElementById('modal-reserva').querySelector('h3').textContent = `Agendar ${nomeRecursoModal}`;

    // 3. Limpa a visualização de horários e renderiza o calendário com as novas regras
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
    const bloqueiosSemanais = regrasPorRecurso[recursoAtual]; 

    for (let i = 1; i <= ultimoDia; i++) {
        const data = new Date(ano, mes, i);
        const diaSemanaIndex = data.getDay(); 
        const dataFormatada = `${ano}-${(mes + 1).toString().padStart(2, '0')}-${i.toString().padStart(2, '0')}`;
        
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
 * Preenche o <select> com opções do mês.
 */
function preencherSeletorMes() {
    const seletor = document.getElementById('seletor-mes');
    if (!seletor) return;
    
    seletor.innerHTML = ''; 
    
    const dataInicial = new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1);
    
    for (let i = 0; i < 15; i++) { 
        const data = new Date(dataInicial.getFullYear(), dataInicial.getMonth() + i, 1);
        const nomeMes = NOME_MESES[data.getMonth()];
        const ano = data.getFullYear();
        const mesIndex = data.getMonth();
        
        const valor = `${ano}-${mesIndex}`;
        
        const option = document.createElement('option');
        option.value = valor;
        option.textContent = `${nomeMes}/${ano}`;
        
        if (mesIndex === mesVisualizado && ano === anoVisualizado) {
            option.selected = true;
        }
        
        seletor.appendChild(option);
    }
}


/**
 * Atualiza o calendário quando o usuário troca o mês no <select>.
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
        
        // Verifica se a data é um feriado nacional
        const isFeriadoNacional = FERIADOS_NAIONAIS.includes(diaInfo.data);
        // Verifica se a data é um bloqueio adicional (Recesso/Municipal)
        const bloqueioAdicional = BLOQUEIOS_ADICIONAIS.find(b => b.data === diaInfo.data);
        const isDiaBloqueado = isFeriadoNacional || bloqueioAdicional; 

        if (diaInfo.isVazio) {
            classe += ' vazio';
        } else {
            // Conteúdo principal é o número do dia
            conteudo = `<span>${diaInfo.diaNumero}</span>`;
            
            if (diaInfo.isFimSemana) {
                classe += ' fim-semana';
            }
            
            // Se for FERIADO ou RECESSO/MUNICIPAL, adiciona a classe 'bloqueio-dia-inteiro'
            if (isDiaBloqueado) {
                classe += ' bloqueio-dia-inteiro'; // Classe base (para borda/texto)
                
                // Lógica para FUNDOS diferentes (Recesso vs. Feriado)
                let textoBloqueio = '';
                
                if (isFeriadoNacional) {
                    classe += ' feriado-dia-inteiro'; // Fundo Vermelho
                    textoBloqueio = 'FERIADO NACIONAL';
                } else if (bloqueioAdicional) {
                    if (bloqueioAdicional.tipo.toUpperCase().includes('RECESSO')) {
                        classe += ' recesso-dia-inteiro'; // Fundo Verde
                    } else {
                        // Trata Feriado Municipal como Feriado Nacional visualmente
                        classe += ' feriado-dia-inteiro'; // Fundo Vermelho
                    }
                    textoBloqueio = bloqueioAdicional.tipo.toUpperCase();
                }

                conteudo += `<small class="info-bloqueio">${textoBloqueio}</small>`;
            }
        }
        
        // Bloqueia clique no feriado, no recesso e no fim de semana
        const podeClicar = !diaInfo.isVazio && !diaInfo.isFimSemana && !isDiaBloqueado; 

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
    
    // Identificação dos Bloqueios de Dia Inteiro
    const isFeriadoNacional = FERIADOS_NAIONAIS.includes(data); 
    const bloqueioAdicional = BLOQUEIOS_ADICIONAIS.find(b => b.data === data);
    const isDiaBloqueado = isFeriadoNacional || bloqueioAdicional;

    const bloqueiosSemanais = regrasPorRecurso[recursoAtual]; 

    HORARIOS.forEach(horario => {
        let classe = 'horario';
        let status = 'Livre';
        
        // Verifica bloqueio fixo semanal 
        const isBloqueadoFixo = bloqueiosSemanais.some(b => 
            b.diaSemana === diaSemanaIndex && b.horario === horario
        );
        // Verifica se já existe agendamento para ESTE RECURSO e ESTA DATA/HORÁRIO
        const reserva = agendamentosDB.find(r => r.data === data && r.horario === horario && r.recurso === recursoAtual);
        
        if (horario === "Recreio" || horario === "Almoço") {
            // ⬜ INTERVALO
            classe += ' intervalo';
            status = horario; 
        } else if (isDiaBloqueado || infoDia.isFimSemana) { 
            // 🟥 Bloqueia feriados, recessos e fins de semana (dia inteiro)
            classe += ' bloqueio-tecnico';
            
            if (infoDia.isFimSemana) {
                status = 'FIM DE SEMANA';
            } else {
                // Pega a razão do bloqueio (Nacional, Municipal, Recesso)
                status = isFeriadoNacional ? 'FERIADO NACIONAL' : bloqueioAdicional.tipo.toUpperCase();
            }
        } else if (isBloqueadoFixo) {
            // 🟥 Bloqueio Fixo (Manutenção/Técnico)
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
    
    const nomeRecursoModal = (recursoAtual === 'Laboratorio') ? 'Laboratório de Informática' : 'Projetor | Notebook';
    document.getElementById('modal-reserva').querySelector('h3').textContent = `Agendar ${nomeRecursoModal}`;
    
    document.getElementById('info-horario').innerText = dataDisplay;
    document.getElementById('modal-reserva').style.display = 'block';
}


// 🚀 INICIA O SISTEMA E ESCUTA EVENTOS
document.addEventListener('DOMContentLoaded', () => {
    // 1. Tenta preencher o seletor de meses
    preencherSeletorMes();
    
    // 2. Garante que o recurso inicial (Laboratório) esteja selecionado e o calendário seja renderizado
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
                recurso: recursoAtual 
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