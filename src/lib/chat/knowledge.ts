import { CREATORS, GAME_LABELS, OBJECTIVES } from "@/lib/constants";

// Base de conhecimento do assistente. Fontes: páginas do site, README,
// docs/DOCUMENTACAO.md e os Termos de Uso (public/Termos_de_Uso_VictoryHub.pdf).
// Regra: só entra aqui o que o site faz HOJE ou o que está publicado nos Termos.
// Proposta de produto que ainda não existe no site é marcada como tal.
// Texto estático de propósito: faz parte do prefixo cacheado do prompt.

const games = Object.values(GAME_LABELS).join(", ");
const creators = CREATORS.map((c) => c.name).join(", ");
const objectives = OBJECTIVES.map((o) => `- ${o.title}: ${o.text}`).join("\n");

export const KNOWLEDGE_BASE = `
## Sobre a VictoryHub
- Plataforma brasileira de torneios de jogos competitivos: ${games}.
- Nasceu como projeto de quatro estudantes de Sistemas de Informação: ${creators}. Está em fase beta.
- Objetivos do projeto:
${objectives}

## Páginas do site
- [Início](/): apresentação da plataforma e prévia dos torneios.
- [Torneios](/torneios): lista com filtros por jogo (CS2, Valorant, Marvel Rivals, Call of Duty) e "Ao Vivo".
- [Sobre](/sobre): história, objetivos e criadores.
- [Contato](/contato): formulário com nome, e-mail, assunto, tipo (Suporte, Parceria, Bug/Problema, Feedback, Outro) e mensagem.
- [Cadastro](/cadastro) e [Login](/login).
- [Dashboard](/dashboard): área logada com perfil, rank, saldo de moedas e dados da Steam.
- [Demonstração](/demonstracao): jornada guiada que apresenta perfil, vínculo Steam simulado, inscrição, recomendações e recursos de segurança.
- [Política de Cookies](/cookies) e [Termos de Uso](/Termos_de_Uso_VictoryHub.pdf).

## Conta
- Para criar conta, acesse /cadastro e informe nome, e-mail e senha. A senha precisa ter pelo menos 8 caracteres, com letra maiúscula, letra minúscula, número e caractere especial.
- A plataforma é exclusiva para maiores de 18 anos (Termos, item 4).
- Cada pessoa pode ter só uma conta. É proibido compartilhar, vender, emprestar ou transferir a conta (Termos, item 5).
- O site ainda não tem recuperação automática de senha. Quem perdeu o acesso deve escrever em /contato com o assunto "Problemas com conta".
- Pedidos sobre dados pessoais (LGPD), como correção ou exclusão, também vão por /contato.

## Torneios
- Cada torneio mostra jogo, situação (Ao Vivo, Em breve, Esgotado ou Finalizado), premiação, formato, rank exigido ("Livre" quando não há exigência), regras e vagas preenchidas.
- Para se inscrever é preciso estar logado: no card do torneio em /torneios, use o botão "Inscrever-se". Sem login, o site leva para /login.
- Cada conta se inscreve uma única vez por torneio. Torneios esgotados ou finalizados não aceitam inscrição.
- Cada torneio tem regras próprias, que valem junto com os Termos. O jogador deve ler as regras antes de se inscrever (Termos, itens 3 e 6).
- Algumas competições podem cobrar taxa de inscrição; o valor é informado antes da confirmação. A taxa não garante prêmio (Termos, item 7). Nesta versão beta, o site não processa pagamentos.
- O valor e a forma de distribuição dos prêmios estão no regulamento de cada torneio. O prêmio só é liberado depois da validação do resultado e, quando aplicável, da verificação de identidade (Termos, item 8).
- Trapaça, uso de cheats, bots, conluio, contas múltiplas ou compartilhadas são proibidos e podem levar a desclassificação e suspensão (Termos, itens 10 e 20).
- Contestações de resultado são feitas pelo canal oficial, hoje o formulário de /contato (Termos, item 21).
- A VictoryHub pode cancelar ou adiar uma competição por motivo técnico ou de segurança e, nesse caso, informa as condições de reembolso (Termos, item 12).

## Rank, moedas e matchmaking
- Todo perfil tem um rank (contas novas começam como "Unranked") e um saldo de moedas (começa em 0), visíveis no /dashboard.
- A proposta do produto é que o jogador ganhe moedas competindo e possa trocá-las por itens ou convertê-las em dinheiro. Nesta versão beta, o site ainda não tem loja, troca nem saque de moedas; as regras de conversão ainda não foram publicadas.
- O matchmaking por rank, que junta adversários de nível parecido, é um dos pilares do projeto, mas ainda não está disponível no site. Hoje a plataforma funciona com torneios.

## Steam
- No /dashboard, o botão "Vincular conta Steam" leva para a página oficial de login da Steam. A VictoryHub nunca vê a senha da Steam: a Steam só confirma a identidade e devolve o identificador da conta.
- Depois de vincular, o dashboard mostra o perfil Steam, a biblioteca de jogos com horas jogadas e estatísticas de CS2. O botão "Sincronizar dados" atualiza essas informações, e "Revincular Steam" troca a conta vinculada.
- As estatísticas de CS2 só aparecem se os detalhes de jogo estiverem públicos nas configurações de privacidade do perfil Steam.

## Privacidade e cookies
- No primeiro acesso aparece um aviso para aceitar ou recusar cookies opcionais. Cookies necessários ao funcionamento ficam sempre ativos. Detalhes em /cookies.
- O tratamento de dados pessoais segue a LGPD (Lei nº 13.709/2018).
- Este assistente usa IA (Claude, da Anthropic): as mensagens são enviadas à Anthropic para gerar a resposta e não são guardadas pela VictoryHub. Por isso, ninguém deve enviar dados pessoais no chat.
`.trim();
