import { TrendingUp, Database, Zap, Cpu, Cable } from 'lucide-react';

const benchmarks = [
  {
    icon: Cable,
    title: "increased throughput",
    metric: "8.5x",
    description: "I/O-intensive apps",
    comparison: "vs Rails",
    color: "from-orange-400 to-rage-500",
  },
  {
    icon: Database,
    title: "faster response times",
    metric: "150ms",
    description: "I/O-intensive apps",
    comparison: "vs Rails",
    color: "from-emerald-400 to-green-500",
  },
  {
    icon: Cpu,
    title: "increased throughput",
    metric: "2.6x",
    description: "CPU-intensive apps",
    comparison: "vs Rails",
    color: "from-blue-400 to-indigo-500",
  },
  {
    icon: Zap,
    title: "faster response times",
    metric: "80ms",
    description: "CPU-intensive apps",
    comparison: "vs Rails",
    color: "from-rage-500 to-rage-600",
  },
];

export default function Benchmarks() {
  return (
    <section className="py-24 bg-white dark:bg-zinc-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-rage-50 dark:bg-zinc-900 text-rage-600 dark:text-rage-500 rounded-full text-sm font-semibold mb-6">
            <TrendingUp className="w-4 h-4" />
            Performance Benchmarks
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold text-slate-900 dark:text-white mb-4">
            Designed for Speed
          </h2>
          <p className="text-xl text-slate-600 dark:text-zinc-400 max-w-3xl mx-auto">
            Real-world benchmarks show significant performance improvements over both I/O- and CPU-intensive Rails applications.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {benchmarks.map((benchmark, index) => {
            const Icon = benchmark.icon;
            return (
              <div
                key={index}
                className="relative p-6 bg-white dark:bg-zinc-900 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-200 dark:border-zinc-700 overflow-hidden group"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-rage-500 to-rage-600 opacity-0 group-hover:opacity-5 dark:group-hover:opacity-10 transition-opacity duration-300"></div>

                <div className="relative">
                  <div className="inline-flex items-center justify-center w-12 h-12 mb-4 rounded-xl bg-white dark:bg-zinc-900 border-2 border-rage-500 dark:border-rage-600 shadow-lg">
                    <Icon className="w-6 h-6 text-rage-500 dark:text-rage-600" />
                  </div>

                  <div className="text-5xl font-bold text-slate-900 dark:text-white mb-2">
                    {benchmark.metric}
                  </div>

                  <h3 className="text-sm font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                    {benchmark.title}
                  </h3>

                  <p className="text-sm text-slate-600 dark:text-zinc-400">
                    {benchmark.description}
                  </p>

                  <div className="mt-3 text-xs text-slate-500 dark:text-zinc-500 font-medium">
                    {benchmark.comparison}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
