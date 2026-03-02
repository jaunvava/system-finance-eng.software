// script.js

// Dados iniciais
let saldoAtual = 0;
let receitas = 0;
let despesas = 0;

// Dados das categorias para o gráfico
let categorias = [
    { nome: 'Alimentação', valor: 400 },
    { nome: 'Transporte', valor: 200 },
    { nome: 'Lazer', valor: 150 },
    { nome: 'Moradia', valor: 250 },
    { nome: 'Outros', valor: 0 }
];

// Atualiza os valores na tela
function atualizarValores() {
    document.querySelector('.saldo-principal h1').textContent = 
        "R$ ${saldoAtual.toFixed(2).replace('.', ',')}";
    
    document.querySelector('.mini-card.receita strong').textContent = 
        "R$ ${receitas.toFixed(2).replace('.', ',')}";
    
    document.querySelector('.mini-card.despesa strong').textContent = 
        "R$ ${despesas.toFixed(2).replace('.', ',')}";
}

// Configuração do Gráfico de Saldo (Linha)
const ctxSaldo = document.getElementById('graficoSaldo').getContext('2d');
const graficoSaldo = new Chart(ctxSaldo, {
    type: 'line',
    data: {
        labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'],
        datasets: [{
            label: 'Saldo (R$)',
            data: [0,0,0,0,0,0],
            borderColor: '#15803d',
            backgroundColor: 'rgba(21, 128, 61, 0.1)',
            tension: 0.4,
            fill: true
        }]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false
            }
        },
        scales: {
            y: {
                beginAtZero: false,
                grid: {
                    color: 'rgba(0, 0, 0, 0.05)'
                }
            }
        }
    }
});

// Configuração do Gráfico de Despesas por Categoria (Pizza)
const ctxDespesas = document.getElementById('graficoDespesas').getContext('2d');
const graficoDespesas = new Chart(ctxDespesas, {
    type: 'doughnut',
    data: {
        labels: categorias.map(c => c.nome),
        datasets: [{
            data: categorias.map(c => c.valor),
            backgroundColor: [
                '#ef4444', // Alimentação
                '#3b82f6', // Transporte
                '#eab308', // Lazer
                '#8b5cf6', // Moradia
                '#6b7280'  // Outros
            ],
            borderWidth: 0
        }]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'bottom'
            }
        },
        cutout: '60%'
    }
});

// Função para atualizar gráfico de despesas
function atualizarGraficoDespesas() {
    graficoDespesas.data.datasets[0].data = categorias.map(c => c.valor);
    graficoDespesas.update();
}

// Formulário de Depósito
document.getElementById('formDeposito').addEventListener('submit', function(e) {
    e.preventDefault();
    const input = this.querySelector('input[type="number"]');
    const valor = parseFloat(input.value);
    
    if (valor > 0) {
        saldoAtual += valor;
        receitas += valor;
        
        // Atualiza os valores na tela
        atualizarValores();
        
        // Feedback visual
        alert("Depósito de R$ ${valor.toFixed(2)} realizado com sucesso!");
        input.value = '';
    } else {
        alert('Por favor, insira um valor válido!');
    }
});

// Formulário de Saque
document.getElementById('formSaque').addEventListener('submit', function(e) {
    e.preventDefault();
    const input = this.querySelector('input[type="number"]');
    const valor = parseFloat(input.value);
    
    if (valor > 0 && valor <= saldoAtual) {
        saldoAtual -= valor;
        
        // Atualiza os valores na tela
        atualizarValores();
        
        // Feedback visual
        alert("Saque de R$ ${valor.toFixed(2)} realizado com sucesso!");
        input.value = '';
    } else if (valor > saldoAtual) {
        alert('Saldo insuficiente para realizar o saque!');
    } else {
        alert('Por favor, insira um valor válido!');
    }
});

// Formulário de Adicionar Despesa
document.getElementById('formDespesa').addEventListener('submit', function(e) {
    e.preventDefault();
    const input = this.querySelector('input[type="text"]');
    const descricao = input.value.trim().toUpperCase();
    
    if (descricao) {
        // Simula uma despesa aleatória entre R$ 50 e R$ 200
        const valorDespesa = Math.floor(Math.random() * 150) + 50;
        
        // Atualiza saldo e despesas
        saldoAtual -= valorDespesa;
        despesas += valorDespesa;
        
        // Adiciona à categoria "Outros" para simplificar
        const categoriaOutros = categorias.find(c => c.nome === 'Outros');
        if (categoriaOutros) {
            categoriaOutros.valor += valorDespesa;
        }
        
        // Atualiza a interface
        atualizarValores();
        atualizarGraficoDespesas();
        
        // Feedback visual
        alert("Despesa ${descricao} adicionada no valor de R$ ${valorDespesa.toFixed(2)}!");
        input.value = '';
    } else {
        alert('Por favor, descreva a despesa!');
    }
});

// Inicializa os valores na tela
atualizarValores();

// Dados adicionais para demonstração do gráfico de saldo
setTimeout(() => {
    // Pequena animação para mostrar que o gráfico pode ser atualizado
    graficoSaldo.data.datasets[0].data = [4600, 4900, 5100, 5300, 5500, saldoAtual];
    graficoSaldo.update();
}, 1000);
