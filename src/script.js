function criarGrafico(idCanvas, tipo, labels, dados, labelDataset) {
    const grafico = document.getElementById(idCanvas).getContext('2d');

    return new Chart(grafico, {
        type: tipo,
        data: {
            labels: labels,
            datasets: [{
                label: labelDataset,
                data: dados,
                 backgroundColor: [
                    'rgba(35, 186, 1, 0.6)',  // vermelho
                    'rgba(255, 0, 0, 0.6)'   // verde
                ],
                borderColor: [
                    'rgba(35, 186, 1, 0.6)',
                    'rgba(255, 0, 0, 0.6)' 
                ],
                borderWidth: 2
            }]
        }
    });
}

criarGrafico('despesasPorCategoria', 'bar', ['Receitas', 'Despesas'], [5000, 900], 'Despesas', 'Receitas', );