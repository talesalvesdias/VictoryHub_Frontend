import { z } from "zod";

export const contactSchema = z.object({
  nome: z.string().trim().min(2, "Informe seu nome.").max(120),
  email: z.string().trim().email("E-mail inválido."),
  assunto: z.string().trim().min(1, "Selecione um assunto."),
  mensagem: z.string().trim().min(10, "Mensagem muito curta.").max(2000),
  type: z.enum(["SUPPORT", "PARTNERSHIP", "BUG", "FEEDBACK", "OTHER"]).default("SUPPORT"),
});
export type ContactInput = z.infer<typeof contactSchema>;

export const signupSchema = z.object({
  name: z.string().trim().min(2, "Informe seu nome.").max(80),
  email: z.string().trim().email("E-mail inválido."),
  password: z.string().min(6, "A senha deve ter ao menos 6 caracteres.").max(100),
});
export type SignupInput = z.infer<typeof signupSchema>;

export const loginSchema = z.object({
  email: z.string().trim().email("E-mail inválido."),
  password: z.string().min(1, "Informe a senha."),
});
