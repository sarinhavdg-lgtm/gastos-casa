import { useState } from "react";
import {
  HelpCircle,
  X,
  CreditCard,
  Receipt,
  BarChart3,
  Layers,
  ListOrdered,
  Smartphone,
  CheckCircle2,
  ChevronRight,
  Sparkles,
  ArrowRight,
  Sun,
  Moon,
  Info,
} from "lucide-react";

interface TutorialModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDark?: boolean;
}

interface TutorialStep {
  id: string;
  title: string;
  icon: any;
  iconBg: string;
  shortDesc: string;
  details: {
    heading: string;
    points: string[];
    tip?: string;
  };
}

export function TutorialModal({ isOpen, onClose, isDark = false }: TutorialModalProps) {
  const [activeTab, setActiveTab] = useState<string>("cartoes");

  if (!isOpen) return null;

  const steps: TutorialStep[] = [
    {
      id: "cartoes",
      title: "1. Melhor Data de Compra",
      icon: CreditCard,
      iconBg: "bg-orange-500",
      shortDesc: "Como ter até 40 dias de prazo para pagar",
      details: {
        heading: "Como funciona a 'Janela de Ouro' dos Cartões",
        points: [
          "O aplicativo calcula automaticamente a diferença entre o Dia de Fechamento da fatura e o Dia de Vencimento.",
          "Quando você compra no dia do fechamento ou no dia seguinte, essa despesa só será cobrada na fatura do mês seguinte.",
          "O banner de aviso no topo da tela inicial destaca em tempo real qual dos seus cartões é o mais vantajoso para comprar hoje.",
          "Você pode cadastrar múltiplos cartões com seus respectivos dias de fechamento e limites.",
        ],
        tip: "Dica: Use o simulador no banner para ver em qual fatura cairia uma compra feita em outra data!",
      },
    },
    {
      id: "nfce",
      title: "2. Baixar NFC-e Automática",
      icon: Receipt,
      iconBg: "bg-indigo-600",
      shortDesc: "Importar cupom fiscal com todos os itens",
      details: {
        heading: "Importação Inteligente de Compras do Supermercado",
        points: [
          "Digite ou cole a Chave de Acesso de 44 dígitos impressa no seu cupom fiscal (fica abaixo do QR Code).",
          "O sistema baixa automaticamente a lista completa com nome dos produtos, quantidade, valor unitário e valor total.",
          "Você também pode enviar o arquivo .XML da nota fiscal ou colar o link do QR Code lido pela câmera do celular.",
          "Escolha se deseja salvar como uma única despesa consolidada (com os itens salvos no histórico) ou separar cada produto individualmente na tabela.",
        ],
        tip: "Dica: Na aba 'Exemplos Rápidos' você pode testar uma nota com 10 itens com apenas 1 clique!",
      },
    },
    {
      id: "metricas",
      title: "3. Indicadores & Saldo",
      icon: Info,
      iconBg: "bg-emerald-600",
      shortDesc: "Total gasto, contas a pagar e saldo líquido",
      details: {
        heading: "Controle do Orçamento em Tempo Real",
        points: [
          "Total de Despesas: Soma de todas as compras e contas do mês selecionado.",
          "A Pagar / Pendente: Contas que você ainda não pagou (aluguel, água, energia, diarista).",
          "Saldo Líquido: Calcula sua renda mensal cadastrada menos os gastos totais para você saber quanto sobrou.",
          "Barras de Progresso: Mostram visualmente a porcentagem de consumo do seu orçamento.",
        ],
        tip: "Dica: Clique em 'Editar Renda' nos indicadores para ajustar o salário ou receita familiar.",
      },
    },
    {
      id: "graficos",
      title: "4. Gráficos Interativos",
      icon: BarChart3,
      iconBg: "bg-indigo-500",
      shortDesc: "Categorias, evolução e formas de pagamento",
      details: {
        heading: "Visualização Gráfica do Orçamento",
        points: [
          "Por Categoria: Gráfico em rosca mostrando as maiores fatias (Alimentação, Moradia, Energia, Empregada, etc.).",
          "Evolução Mensal: Gráfico de barras comparando os gastos mês a mês em relação à sua renda mensal.",
          "Formas de Pagamento: Divisão entre Cartão de Crédito, Pix, Boleto, Débito e Dinheiro.",
        ],
        tip: "Dica: Passe o mouse ou toque nas barras e fatias para ver o valor exato em Reais.",
      },
    },
    {
      id: "comparativo",
      title: "5. Comparativo de Meses",
      icon: Layers,
      iconBg: "bg-purple-600",
      shortDesc: "Descubra se economizou ou gastou a mais",
      details: {
        heading: "Análise Comparativa Período a Período",
        points: [
          "Selecione qualquer mês anterior para comparar lado a lado com o mês atual.",
          "O aplicativo calcula a diferença percentual (%) e nominal (R$).",
          "A tabela detalha exatamente em quais categorias os gastos subiram ou diminuíram (ex: energia elétrica subiu R$ 40, alimentação caiu R$ 120).",
        ],
        tip: "Dica: Ótimo para saber o impacto de contas sazonais (como ar-condicionado no verão ou IPTU/IPVA no início do ano).",
      },
    },
    {
      id: "tabela",
      title: "6. Tabela de Contas da Casa",
      icon: ListOrdered,
      iconBg: "bg-blue-600",
      shortDesc: "Registro, filtros, status e exportação",
      details: {
        heading: "Gestão do Dia a Dia e Histórico de Pagamentos",
        points: [
          "Marcar como Paga: Clique no ícone de relógio/pendente para marcar a conta como paga instantaneamente.",
          "Filtros Rápidos: Busque por texto (ex: 'mercado', 'enel', 'diarista') ou filtre por categoria e forma de pagamento.",
          "Edição e Exclusão: Modifique valores ou remova registros a qualquer momento.",
          "Exportar CSV: Baixe a planilha para abrir no Excel ou Google Planilhas.",
        ],
        tip: "Dica: Contas que têm itens de NFC-e mostram um botão para visualizar o cupom detalhado!",
      },
    },
    {
      id: "link",
      title: "7. Acesso em Qualquer Lugar",
      icon: Smartphone,
      iconBg: "bg-emerald-500",
      shortDesc: "Como salvar e abrir no celular via link",
      details: {
        heading: "Acesso Remoto sem Instalação",
        points: [
          "Seus dados ficam sincronizados e salvos no servidor da aplicação.",
          "Clique em 'Acessar pelo Celular / Salvar Link' no topo ou no rodapé para ver o QR Code e o link direto.",
          "Abra no navegador do seu smartphone (Chrome, Safari) e adicione à Tela Inicial como um aplicativo.",
          "Você e sua família podem acessar o mesmo link em qualquer computador, tablet ou celular.",
        ],
        tip: "Dica: O modal de compartilhamento também permite gerar backup dos dados em arquivo JSON!",
      },
    },
    {
      id: "tema",
      title: "8. Layout Claro e Escuro",
      icon: Moon,
      iconBg: "bg-slate-700",
      shortDesc: "Alternar entre modo claro e modo escuro",
      details: {
        heading: "Dois Tipos de Layout Completos",
        points: [
          "Modo Claro (High Density): Fundo clean em tom ardósia claro com máxima legibilidade para o dia a dia.",
          "Modo Escuro (Dark Slate): Fundo em ardósia profundo com elementos em alto contraste, ideal para uso noturno e menor cansaço visual.",
          "Use o botão de Sol/Lua no topo direito da barra de navegação para alternar a qualquer momento.",
          "Sua escolha de layout fica salva no navegador e permanece ao recarregar a página.",
        ],
      },
    },
  ];

  const currentStep = steps.find((s) => s.id === activeTab) || steps[0];

  const bgModal = isDark ? "bg-slate-900 border-slate-800 text-white" : "bg-white border-slate-200 text-slate-900";
  const bgSidebar = isDark ? "bg-slate-950/60 border-slate-800" : "bg-slate-50 border-slate-200";

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
    >
      <div
        className={`w-full max-w-4xl rounded-2xl border shadow-2xl overflow-hidden my-6 flex flex-col max-h-[85vh] transition-all ${bgModal}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-200/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-indigo-700 flex items-center justify-center text-white shadow-md">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold tracking-tight">
                Tutorial & Guia Completo das Abas
              </h2>
              <p className="text-xs text-slate-400">
                Aprenda a tirar o máximo proveito de cada funcionalidade do aplicativo
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content with 2 columns: Sidebar steps + Details */}
        <div className="grid grid-cols-1 md:grid-cols-12 flex-1 overflow-hidden">
          {/* Steps List Sidebar */}
          <div
            className={`md:col-span-5 p-3 border-r overflow-y-auto space-y-1.5 ${bgSidebar}`}
          >
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 py-1 block">
              Selecione o Módulo / Aba
            </span>
            {steps.map((step) => {
              const Icon = step.icon;
              const isActive = activeTab === step.id;
              return (
                <button
                  key={step.id}
                  onClick={() => setActiveTab(step.id)}
                  className={`w-full p-2.5 rounded-xl text-left transition-all flex items-center gap-3 cursor-pointer ${
                    isActive
                      ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/25 font-bold"
                      : "text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-800/60"
                  }`}
                >
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center text-white shrink-0 ${
                      isActive ? "bg-white/20" : step.iconBg
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold truncate">{step.title}</p>
                    <p
                      className={`text-[10px] truncate ${
                        isActive ? "text-indigo-100" : "text-slate-400"
                      }`}
                    >
                      {step.shortDesc}
                    </p>
                  </div>
                  <ChevronRight
                    className={`w-3.5 h-3.5 shrink-0 transition-transform ${
                      isActive ? "text-white translate-x-0.5" : "text-slate-400 opacity-50"
                    }`}
                  />
                </button>
              );
            })}
          </div>

          {/* Step Details Pane */}
          <div className="md:col-span-7 p-6 overflow-y-auto space-y-5">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-200/20">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-md ${currentStep.iconBg}`}
              >
                <currentStep.icon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                  {currentStep.details.heading}
                </h3>
                <p className="text-xs text-slate-400">{currentStep.shortDesc}</p>
              </div>
            </div>

            {/* Bullet points */}
            <div className="space-y-3">
              {currentStep.details.points.map((pt, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-emerald-500/15 text-emerald-500 flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                    {pt}
                  </p>
                </div>
              ))}
            </div>

            {/* Tip box */}
            {currentStep.details.tip && (
              <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500 dark:text-amber-400 text-xs flex items-start gap-2.5">
                <Sparkles className="w-4 h-4 shrink-0 mt-0.5" />
                <p className="leading-relaxed font-medium">{currentStep.details.tip}</p>
              </div>
            )}

            {/* Navigation to next step */}
            <div className="pt-4 flex justify-between items-center border-t border-slate-200/20">
              <button
                onClick={onClose}
                className="text-xs text-slate-400 hover:text-slate-200 cursor-pointer font-medium"
              >
                Fechar Tutorial
              </button>

              {(() => {
                const currentIndex = steps.findIndex((s) => s.id === activeTab);
                if (currentIndex < steps.length - 1) {
                  const nextStep = steps[currentIndex + 1];
                  return (
                    <button
                      onClick={() => setActiveTab(nextStep.id)}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-md shadow-indigo-600/20 cursor-pointer"
                    >
                      Próxima: {nextStep.title.split(". ")[1]}
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  );
                }
                return (
                  <button
                    onClick={onClose}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-md shadow-emerald-600/20 cursor-pointer"
                  >
                    Entendido! Começar a Usar
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </button>
                );
              })()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
