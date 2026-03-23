// VictoryHub - Animações da Página de Feedback

// Quando a página carrega, inicia as animações
window.addEventListener('load', () => {
    // Mostra o card com animação
    requestAnimationFrame(() => {
        document.getElementById('feedback-card').classList.add('visible');
    });

    // Cria as partículas coloridas
    const wrapper = document.getElementById('feedback-wrapper');
    const colors  = ['#fc5757', '#34d399', '#f5f5f5', '#ff7d7d'];

    // Loop para criar 18 partículas
    for (let i = 0; i < 18; i++) {
        const p = document.createElement('div');
        p.className = 'particle';
        p.style.background = colors[i % colors.length];

        // Calcula posição e movimento de cada partícula
        const angle    = (i / 18) * 360;
        const distance = 120 + Math.random() * 80;
        const tx       = Math.cos((angle * Math.PI) / 180) * distance;
        const ty       = Math.sin((angle * Math.PI) / 180) * distance;
        const delay    = 0.6 + Math.random() * 0.3;
        const size     = 4 + Math.random() * 6;

        // Aplica estilos na partícula
        p.style.cssText += `
            width: ${size}px;
            height: ${size}px;
            left: 50%;
            top: 40%;
            animation: particle-burst-${i} 0.8s ease ${delay}s forwards;
        `;

        // Cria animação única para cada partícula
        const style = document.createElement('style');
        style.textContent = `
            @keyframes particle-burst-${i} {
                0%   { transform: translate(-50%, -50%) scale(1); opacity: 1; }
                100% { transform: translate(calc(-50% + ${tx}px), calc(-50% + ${ty}px)) scale(0);
                       opacity: 0; }
            }
        `;
        document.head.appendChild(style);
        wrapper.appendChild(p);
    }

    // Redireciona para home após 5 segundos + 1.5s de delay da animação
    setTimeout(() => {
        window.location.href = '../index.html';
    }, 6500);
});
