# Parte 4 - Acessibilidade Digital

Responsável: Henzo Weelthyner - RM571575

Melhorias implementadas:

1. Link de salto para o conteúdo principal (`src/app/layout.tsx` + `src/app/globals.css`) - WCAG 2.4.1.
2. Indicador global de foco visível e reforço de foco em campos (`globals.css` e `fieldStyles.ts`) - WCAG 2.4.7.
3. Erros acessíveis no formulário de contato com `aria-invalid`, `aria-describedby`, IDs e `role=alert` - WCAG 3.3.1/3.3.3 e 4.1.3.
4. Contraste do placeholder alterado de `#666` para `#a3a3a3` - WCAG 1.4.3.
5. `prefers-reduced-motion` para reduzir animações quando solicitado pelo sistema - melhoria adicional (WCAG 2.3.3, AAA).
6. `aria-current="page"` no link ativo da navegação.

## Evidências recomendadas

- Pressione Tab ao carregar uma página para registrar o link "Ir para o conteúdo principal".
- Navegue com Tab para registrar o contorno de foco.
- Envie `/contato` vazio para registrar as mensagens de erro.
- Ative a preferência de movimento reduzido do sistema e abra `/feedback`.

O relatório completo da Parte 4 foi entregue separadamente em DOCX e PDF.
