import type { Metadata } from "next";
import SuccessAnimation from "@/components/feedback/SuccessAnimation";

export const metadata: Metadata = {
  title: "VictoryHub | Mensagem Enviada",
};

export default function Feedback() {
  return <SuccessAnimation redirectTo="/" seconds={5} />;
}
