// Array de objetos 
const listaTorneios = [
    {
        jogo: "CS2",
        nome: "CS2 Championship Open",
        descricao: "Torneio eliminatório simples para jogadores acima do rank Gold. Prove sua mira e tática e leve o grande prêmio.",
        premio: "R$5.000",
        formato: "Eliminatória",
        rank: "Gold",
        jogadoresAtuais: 96,
        jogadoresTotais: 128,
        regra: "Regra: 5v5 - Sem cheats - Sem Smurfs",
        status: "Ao Vivo"
    },
    {
        jogo: "Valorant",
        nome: "Valorant Pro Series",
        descricao: "Competição de alto nível para jogadores Diamond e acima. Grupos com 4 times e fase mata-mata.",
        premio: "R$8.000",
        formato: "Eliminatória",
        rank: "Diamond",
        jogadoresAtuais: 64,
        jogadoresTotais: 64,
        regra: "Regra: 5v5 - Sem cheats - 1 agente por pessoa",
        status: "Ao Vivo"
    },
    {
        jogo: "Marvel Rivals",
        nome: "Marvels Rivals Cup",
        descricao: "Torneio semanal de Marvel Rivals, aberto a todos os rankings. Ótima oportunidade para iniciantes ganharem experiência.",
        premio: "R$1.500",
        formato: "Eliminatória",
        rank: "Qualquer",
        jogadoresAtuais: 18,
        jogadoresTotais: 36,
        regra: "Regra: 6v6 - Sem repetição de heróis",
        status: "Ao Vivo"
    },
    {
        jogo: "COD",
        nome: "CoD: Warzone - Invite Only",
        descricao: "Torneio de Warzone exclusivo para convidados. Apenas os 16 melhores jogadores da plataforma no ranking mensal são elegíveis.",
        premio: "R$3.000",
        formato: "BattleRoyale",
        rank: "16",
        jogadoresAtuais: 0,
        jogadoresTotais: 16,
        regra: "Regra: Solo - Apenas top-16 do ranking",
        status: "Em Breve"
    }
];

function renderizarTela(filtro = "Todos") {
    const container = document.getElementById('container-torneios');
    if (!container) return;

    container.innerHTML = "";

    const torneiosFiltrados = listaTorneios.filter(torneio => {
        if (filtro === "Todos") return true;
        if (filtro === "Ao Vivo") return torneio.status === "Ao Vivo";
        return torneio.jogo.toLowerCase() === filtro.toLowerCase();
    });

    torneiosFiltrados.forEach(torneio => {
        const porcentagem = (torneio.jogadoresAtuais / torneio.jogadoresTotais) * 100;

        const cardHTML = `
            <div class="tournament-card">
                <div class="card-top">
                    <span class="game-tag">${torneio.jogo}</span>
                    <span class="${torneio.status === 'Ao Vivo' ? 'live-tag' : 'soon'}">
                        ${torneio.status === 'Ao Vivo' ? '● Ao Vivo' : 'Em Breve'}
                    </span>
                </div>
                <h3>${torneio.nome}</h3>
                <p class="description">${torneio.descricao}</p>
                <hr class="divider1">
                <table class="table">
                    <tr><td>Premio Formato Rank</td></tr>
                </table>
                <table class="table-esp">
                    <tr><td>${torneio.premio} ${torneio.formato} ${torneio.rank}</td></tr>
                </table>
                <hr class="divider1">
                <p class="players-count">👥 ${torneio.jogadoresAtuais} / ${torneio.jogadoresTotais} jogadores</p>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${porcentagem}%;"></div>
                </div>
                <p class="rule">${torneio.regra}</p>
                
                ${torneio.jogadoresAtuais === torneio.jogadoresTotais 
                    ? '<div class="full">Vagas Esgotadas</div>' 
                    : torneio.status === 'Em Breve' 
                        ? '<div class="invite">Convite Necessário</div>'
                        : '<a href="#" class="btn-signon">Inscrever-se</a>'
                }
            </div>
        `;

        container.innerHTML += cardHTML;
    });
}

document.addEventListener('DOMContentLoaded', () => {
    renderizarTela("Todos");

    const botoes = document.querySelectorAll('.buttons a[data-game]');
    
    botoes.forEach(botao => {
        botao.addEventListener('click', (e) => {
            e.preventDefault();
            
            botoes.forEach(b => {
                b.style.background = "transparent";
                b.style.color = "var(--color-text)";
            });
            botao.style.background = "#ff7c7c";
            botao.style.color = "#000000";

            const jogoEscolhido = botao.getAttribute('data-game');
            renderizarTela(jogoEscolhido);
        });
    });
});