import { Server, Rocket, MessageSquare, Workflow } from 'lucide-react';

const useCases = [
  {
    icon: Server,
    title: "API-Only Applications",
    description: "Perfect for building fast, scalable REST APIs. Handle high request volumes with minimal resource usage.",
    benefits: [
      "Low latency responses",
      "Efficient resource utilization",
      "Auto-generated API documentation",
    ],
  },
  {
    icon: Rocket,
    title: "High-Performance Microservices",
    description: "Build microservices that can handle massive scale. Fiber-based concurrency ensures maximum throughput.",
    benefits: [
      "Process hundreds of concurrent requests",
      "Minimal memory footprint",
      "Easy horizontal scaling",
    ],
  },
  {
    icon: MessageSquare,
    title: "Real-Time Applications",
    description: "Native WebSocket support for chat apps, live dashboards, and collaborative tools.",
    benefits: [
      "Built-in WebSocket handling",
      "Thousands of simultaneous connections",
      "Low-latency message delivery",
    ],
  },
  {
    icon: Workflow,
    title: "Rails Integration",
    description: "Gradually migrate from Rails or use Rage alongside your existing Rails app for performance-critical endpoints.",
    benefits: [
      "Rails API compatibility",
      "Familiar development patterns",
      "Easy incremental adoption",
    ],
  },
];

export default function UseCases() {
  return (
    <section className="pt-24 pb-0 bg-slate-50 dark:bg-zinc-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold text-slate-900 dark:text-white mb-4">
            Built for Modern Applications
          </h2>
          <p className="text-xl text-slate-600 dark:text-zinc-400 max-w-3xl mx-auto">
            Whether you're building a new API or scaling an existing application, Rage provides the performance and features you need.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {useCases.map((useCase, index) => {
            const Icon = useCase.icon;
            return (
              <div
                key={index}
                className="group relative bg-white dark:bg-zinc-900 rounded-2xl p-8 shadow-sm hover:shadow-2xl transition-all duration-300 border border-slate-200 dark:border-zinc-700 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-rage-500 to-rage-600 opacity-0 group-hover:opacity-5 dark:group-hover:opacity-10 transition-opacity duration-300"></div>

                <div className="relative">
                  <div className="inline-flex items-center justify-center w-14 h-14 mb-6 rounded-xl bg-white dark:bg-zinc-900 border-2 border-rage-500 dark:border-rage-600 shadow-lg">
                    <Icon className="w-7 h-7 text-rage-500 dark:text-rage-600" />
                  </div>

                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">
                    {useCase.title}
                  </h3>

                  <p className="text-slate-600 dark:text-zinc-400 mb-6 leading-relaxed">
                    {useCase.description}
                  </p>

                  <div className="space-y-3">
                    {useCase.benefits.map((benefit, idx) => (
                      <div key={idx} className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-5 h-5 mt-0.5 rounded-full bg-white dark:bg-zinc-900 border-2 border-rage-500 dark:border-rage-600 flex items-center justify-center">
                          <svg className="w-3 h-3 text-rage-500 dark:text-rage-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <span className="text-slate-700 dark:text-zinc-300 font-medium">{benefit}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-16 bg-white dark:bg-zinc-900 rounded-2xl p-8 md:p-12 text-center border border-slate-200 dark:border-zinc-700 shadow-sm">
          <div className="relative">
            <h3 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
              Performance Meets Developer Experience
            </h3>
            <p className="text-xl text-slate-600 dark:text-zinc-400 mb-8 max-w-3xl mx-auto">
              Don't choose between speed and productivity. Rage gives you both with Rails-like syntax and fiber-based performance.
            </p>
            <div className="flex flex-wrap gap-4 justify-center text-sm">
              <div className="px-6 py-3 bg-slate-50 dark:bg-zinc-800 rounded-lg border border-slate-200 dark:border-zinc-700">
                <div className="text-rage-500 dark:text-rage-600 font-bold text-2xl mb-1">2.6x+</div>
                <div className="text-slate-600 dark:text-zinc-400">Improved Throughput</div>
              </div>
              <div className="px-6 py-3 bg-slate-50 dark:bg-zinc-800 rounded-lg border border-slate-200 dark:border-zinc-700">
                <div className="text-rage-500 dark:text-rage-600 font-bold text-2xl mb-1">100%</div>
                <div className="text-slate-600 dark:text-zinc-400">API Compatible</div>
              </div>
              <div className="px-6 py-3 bg-slate-50 dark:bg-zinc-800 rounded-lg border border-slate-200 dark:border-zinc-700">
                <div className="text-rage-500 dark:text-rage-600 font-bold text-2xl mb-1">0</div>
                <div className="text-slate-600 dark:text-zinc-400">Learning Curve</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
