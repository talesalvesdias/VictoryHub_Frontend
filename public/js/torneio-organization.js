// Filtros torneios
document.addEventListener('DOMContentLoaded', () => {
    const botoesFiltro = document.querySelectorAll('.buttons a[data-game]');
    const cardsTorneio = document.querySelectorAll('.tournament-card');

    const botaoInicial = document.querySelector('.buttons a[data-game="Todos"]');
    if (botaoInicial) {
        botaoInicial.style.background = "#ff7c7c";
        botaoInicial.style.color = "#000000";
    }

    botoesFiltro.forEach(botao => {
        botao.addEventListener('click', (e) => {
            e.preventDefault(); 

            botoesFiltro.forEach(b => {
                b.style.background = "transparent";
                b.style.color = "var(--color-text)";
                b.style.borderColor = "#ff7c7c";
            });

            botao.style.background = "#ff7c7c";
            botao.style.color = "#000000";
            botao.style.borderColor = "#ff7c7c";

            const filtroSelecionado = botao.getAttribute('data-game');

            cardsTorneio.forEach(card => {
                const tagJogo = card.querySelector('.game-tag').textContent.trim();
                const statusAoVivo = card.querySelector('.live-tag');

                if (filtroSelecionado === "Todos") {
                    card.style.display = "block"; 
                } else if (filtroSelecionado === "Ao Vivo") {
                    if (statusAoVivo && statusAoVivo.textContent.includes("Ao Vivo")) {
                        card.style.display = "block";
                    } else {
                        card.style.display = "none"; 
                    }
                } else if (tagJogo.toLowerCase() === filtroSelecionado.toLowerCase()) {
                    card.style.display = "block";
                } else {
                    card.style.display = "none";
                }
            });
        });
    });

    iniciarPollingVagas(cardsTorneio);
});
// Pooling
function iniciarPollingVagas(cardsTorneio) {
    setInterval(() => {
        cardsTorneio.forEach(card => {
            const elementoContador = card.querySelector('.players-count');
            const elementoPreenchimento = card.querySelector('.progress-fill');

            if (!elementoContador || !elementoPreenchimento) return;

            const numeros = elementoContador.textContent.match(/\d+/g);
            if (!numeros || numeros.length < 2) return;

            let atuais = parseInt(numeros[0]);
            const totais = parseInt(numeros[1]);

            if (atuais < totais) {
                const novaInscricao = Math.random() > 0.7; 
                if (novaInscricao) {
                    atuais += 1;
                    elementoContador.textContent = `👥 ${atuais} / ${totais} jogadores`;

                    const novaPorcentagem = (atuais / totais) * 100;
                    elementoPreenchimento.style.width = `${novaPorcentagem}%`;

                    if (atuais === totais) {
                        const btnSignon = card.querySelector('.btn-signon');
                        if (btnSignon) {
                            btnSignon.className = "full";
                            btnSignon.textContent = "Vagas Esgotadas";
                            btnSignon.style.pointerEvents = "none"; 
                        }
                    }
                }
            }
        });
    }, 5000); 
}