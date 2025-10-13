import { Gauge, Layers, Wifi, FileCode, Boxes, Sparkles } from 'lucide-react';

const features = [
  {
    icon: Gauge,
    title: "Blazing Fast Performance",
    description: "Built on a dedicated runtime with an optimized router, Rage delivers exceptional speed by minimizing overhead and maximizing throughput.",
  },
  {
    icon: Layers,
    title: "Rails-Compatible API",
    description: "Familiar Rails-like syntax and patterns make migration seamless. Write Ruby the way you know, but faster.",
  },
  {
    icon: Sparkles,
    title: "Fiber-Based Concurrency",
    description: "Non-blocking I/O powered by fibers handles thousands of concurrent requests efficiently, similar to Node.js and Nginx.",
  },
  {
    icon: Wifi,
    title: "Native WebSocket Support",
    description: "Built-in WebSocket handling for real-time features. Scale to thousands of simultaneous connections without additional dependencies.",
  },
  {
    icon: FileCode,
    title: "Auto-Generated OpenAPI Docs",
    description: "Generate OpenAPI documentation directly from your route definitions. Keep your API specs always in sync with your code.",
  },
  {
    icon: Boxes,
    title: "Stable & Focused",
    description: "A narrow, well-defined scope means predictable updates. No major rewrites or breaking changes with every release.",
  },
];

export default function Features() {
  return (
    <section className="py-24 bg-white dark:bg-zinc-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold text-slate-900 dark:text-white mb-4">
            Why Choose Rage?
          </h2>
          <p className="text-xl text-slate-600 dark:text-zinc-400 max-w-3xl mx-auto">
            A modern Ruby framework for building fast, scalable applications without sacrificing developer experience.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="group relative p-8 bg-white dark:bg-zinc-800 rounded-2xl border border-slate-200 dark:border-zinc-700 hover:border-rage-200 dark:hover:border-rage-500 transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-rage-50 to-red-50 dark:from-rage-900/30 dark:to-red-900/30 rounded-2xl opacity-0 group-hover:opacity-100 dark:group-hover:opacity-50 transition-opacity duration-300"></div>

                <div className="relative">
                  <div className="inline-flex items-center justify-center w-12 h-12 mb-5 rounded-xl bg-white dark:bg-zinc-900 border-2 border-rage-500 dark:border-rage-600 shadow-md group-hover:scale-110 group-hover:bg-gradient-to-br group-hover:from-rage-500 group-hover:to-rage-600 dark:group-hover:from-rage-600 dark:group-hover:to-rage-500 group-hover:border-transparent transition-all duration-300">
                    <Icon className="w-6 h-6 text-rage-500 dark:text-rage-600 group-hover:text-white transition-colors duration-300" />
                  </div>

                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">
                    {feature.title}
                  </h3>

                  <p className="text-slate-600 dark:text-zinc-400 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
