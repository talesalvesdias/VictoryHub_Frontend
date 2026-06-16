// Constantes compartilhadas da UI (links, criadores, métricas, jogos).

export const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/torneios", label: "Torneios" },
  { href: "/sobre", label: "Sobre Nós" },
  { href: "/contato", label: "Contato" },
] as const;

export const HOME_STATS = [
  { value: "12K+", label: "JOGADORES" },
  { value: "340+", label: "TORNEIOS REALIZADOS" },
  { value: "R$500K", label: "EM PRÊMIOS" },
] as const;

export const FEATURES = [
  {
    icon: "🛡️",
    title: "Matchmaking Inteligente",
    text: "Algoritmo que busca adversários com rank semelhante ao seu para garantir partidas equilibradas e justas.",
  },
  {
    icon: "⭐",
    title: "Sistema de Rank",
    text: "Cada vitória sobe seu rank. Acompanhe seu progresso, estatísticas e posição no ranking global da plataforma.",
  },
  {
    icon: "💰",
    title: "Sistema de Moedas",
    text: "Ganhe moedas competindo e troque por itens de jogos, skins exclusivas ou converta em dinheiro real.",
  },
] as const;

export const CREATORS = [
  { initials: "TA", name: "Tales Alves Dias", rm: "RM568839" },
  { initials: "DR", name: "Danilo Ricco Rosa", rm: "RM571585" },
  { initials: "LT", name: "Leonardo Theodoro Moraes", rm: "RM570853" },
  { initials: "HW", name: "Henzo Weelthyner Chaves Santos", rm: "RM571575" },
] as const;

export const TIMELINE = [
  { tag: "INÍCIO", title: "A ideia surge", text: "Grupo de estudantes identifica lacuna no mercado de e-sports nacional." },
  { tag: "CONCEPÇÃO", title: "Planejamento do sistema", text: "Definição da arquitetura de matchmaking e sistema de rank." },
  { tag: "DESENVOLVIMENTO", title: "Primeiras páginas", text: "Construção da plataforma web com foco em UX e performance." },
  { tag: "HOJE", title: "Lançamento em fase beta", text: "Primeiros torneios ativos, primeiros jogadores competindo." },
] as const;

export const OBJECTIVES = [
  { n: "01", title: "Matchmaking Justo", text: "Desenvolver um algoritmo de matchmaking que una jogadores de nível similar, garantindo competições equilibradas e experiências satisfatórias." },
  { n: "02", title: "Monetização Real", text: "Criar um sistema de moedas e prêmios que permita aos jogadores converter suas habilidades em recompensas reais, incluindo skins, itens e dinheiro." },
  { n: "03", title: "Prevenção de Fraudes", text: "Implementar mecanismos robustos de detecção de smurfs, cheaters e comportamentos suspeitos para manter a integridade das competições." },
  { n: "04", title: "Comunidade Competitiva", text: "Construir uma comunidade saudável de jogadores competitivos no Brasil, com rankings, estatísticas e eventos regulares." },
] as const;

// Rótulos amigáveis para o enum GameType do Prisma.
export const GAME_LABELS: Record<string, string> = {
  CS2: "CS2",
  VALORANT: "VALORANT",
  MARVEL_RIVALS: "MARVEL RIVALS",
  COD: "CALL OF DUTY",
};

// Filtros da página de torneios (value casa com query ?game= / ?live=).
export const TOURNAMENT_FILTERS = [
  { value: "ALL", label: "Todos" },
  { value: "CS2", label: "CS2" },
  { value: "VALORANT", label: "Valorant" },
  { value: "MARVEL_RIVALS", label: "Marvel Rivals" },
  { value: "COD", label: "Call of Duty" },
  { value: "LIVE", label: "Ao Vivo" },
] as const;

// Opções do select "Assunto" (texto livre exibido ao usuário).
export const CONTACT_SUBJECTS = [
  "Suporte técnico",
  "Dúvidas sobre torneios",
  "Problemas com conta",
  "Pagamentos e prêmios",
  "Sugestão de melhoria",
  "Denúncia de infração",
  "Outro",
] as const;

// Tipo da mensagem (mapeia para o enum ContactType do Prisma).
export const CONTACT_TYPES = [
  { value: "SUPPORT", label: "Suporte" },
  { value: "PARTNERSHIP", label: "Parceria" },
  { value: "BUG", label: "Bug / Problema" },
  { value: "FEEDBACK", label: "Feedback" },
  { value: "OTHER", label: "Outro" },
] as const;
