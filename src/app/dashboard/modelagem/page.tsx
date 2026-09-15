import ExponentialSimulator from "@/components/dashboard/ExponentialSimulator";

export default function ModelagemPage() {
  return (
    <main className="min-h-screen bg-black text-white p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <header className="border-b border-zinc-800 pb-4">
          <h1 className="text-3xl font-extrabold tracking-tight text-white">
            Modelagem Matemática & Simulação
          </h1>
          <p className="text-zinc-400 mt-1 text-sm">
            Projeções analíticas e validação de saturação do VictoryHub.
          </p>
        </header>

        <ExponentialSimulator />
      </div>
    </main>
  );
}