// VictoryHub - Validação do Formulário de Contato

const form = document.getElementById('contact-form');

// Função para validar o formato do email
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Função para mostrar erro no campo
function showError(inputId, errorId) {
    const input = document.getElementById(inputId);
    const error = document.getElementById(errorId);
    input.classList.add('error');
    error.classList.add('visible');
}

// Função para limpar erro do campo
function clearError(inputId, errorId) {
    const input = document.getElementById(inputId);
    const error = document.getElementById(errorId);
    input.classList.remove('error');
    error.classList.remove('visible');
}

// Limpa os erros quando o usuário digita
document.getElementById('nome').addEventListener('input', () => clearError('nome', 'nome-error'));
document.getElementById('email').addEventListener('input', () => clearError('email', 'email-error'));
document.getElementById('assunto').addEventListener('change', () => clearError('assunto', 'assunto-error'));
document.getElementById('mensagem').addEventListener('input', () => clearError('mensagem', 'mensagem-error'));

// Quando o formulário é enviado
form.addEventListener('submit', (e) => {
    e.preventDefault();

    // Pega os valores dos campos
    const nome     = document.getElementById('nome').value.trim();
    const email    = document.getElementById('email').value.trim();
    const assunto  = document.getElementById('assunto').value;
    const mensagem = document.getElementById('mensagem').value.trim();

    let isValid = true;

    // Valida o nome
    if (!nome) {
        showError('nome', 'nome-error');
        isValid = false;
    } else {
        clearError('nome', 'nome-error');
    }

    // Valida o email
    if (!email || !isValidEmail(email)) {
        showError('email', 'email-error');
        isValid = false;
    } else {
        clearError('email', 'email-error');
    }

    // Valida o assunto
    if (!assunto) {
        showError('assunto', 'assunto-error');
        isValid = false;
    } else {
        clearError('assunto', 'assunto-error');
    }

    // Valida a mensagem
    if (!mensagem) {
        showError('mensagem', 'mensagem-error');
        isValid = false;
    } else {
        clearError('mensagem', 'mensagem-error');
    }

    // Se tudo estiver ok, redireciona para página de feedback
    if (isValid) {
        window.location.href = 'feedback.html';
    }
});
