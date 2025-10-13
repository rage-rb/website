import { CheckCircle2 } from 'lucide-react';

const timelineEntries = [
  {
    date: "Jul 2023",
    title: "Project Genesis",
    description: "Development begins on a faster, fiber-based Ruby framework.",
  },
  {
    date: "Mar 2024",
    title: "Version 1.0",
    description: "First production-ready release after extensive real-world testing and stability improvements.",
  },
  {
    date: "Aug 2024",
    title: "WebSocket Support",
    description: "Version 1.8 adds native WebSocket support for real-time applications."
  },
  {
    date: "Dec 2024",
    title: "OpenAPI Integration",
    description: "Automatic OpenAPI documentation generation directly from route definitions."
  },
  {
    date: "Mar 2025",
    title: "TechEmpower Benchmarks",
    description: "Round 23 results show Rage outperforms Rails by 81-219% and Sinatra by 31-100% across all database tests."
  },
  {
    date: "Jul 2025",
    title: "Cloudflare Support",
    description: "Accepted into Cloudflare's Project Alexandria initiative."
  },
];

export default function Timeline() {
  return (
    <section className="py-24 bg-slate-50 dark:bg-zinc-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl sm:text-5xl font-bold text-slate-900 dark:text-white mb-4">
            Project Timeline
          </h2>
          <p className="text-xl text-slate-600 dark:text-zinc-400 max-w-3xl mx-auto">
            Key milestones in the evolution of the Rage framework.
          </p>
        </div>

        <div className="relative max-w-5xl mx-auto">
          <div className="absolute top-6 left-0 right-0 h-0.5 bg-gradient-to-r from-rage-500 via-rage-400 to-rage-500 dark:from-rage-600 dark:via-rage-500 dark:to-rage-600"></div>

          <div className="relative flex justify-between items-start pt-0">
            {timelineEntries.map((entry, index) => (
              <div
                key={index}
                className="group relative flex flex-col items-center"
                style={{ flex: '0 0 auto' }}
              >
                <div className="relative z-10 flex items-center justify-center mb-4 cursor-pointer">
                  <div className="w-12 h-12 rounded-full bg-white dark:bg-zinc-900 border-4 border-rage-500 dark:border-rage-600 shadow-lg flex items-center justify-center group-hover:scale-125 transition-transform duration-300">
                    <CheckCircle2 className="w-6 h-6 text-rage-500 dark:text-rage-600" />
                  </div>
                </div>

                <div className={`absolute top-[4rem] left-1/2 -translate-x-1/2 ${index < 2 && "-translate-x-[5%]"} ${index > timelineEntries.length - 3 && "-translate-x-[95%]"} xl:-translate-x-1/2 w-64 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-20`}>
                  <div className="p-4 bg-white dark:bg-zinc-900 rounded-xl border-2 border-rage-500 dark:border-rage-600 shadow-xl">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="inline-block px-2 py-1 text-xs font-semibold text-rage-600 dark:bg-zinc-800 bg-rage-50 dark:text-rage-500 rounded-full">
                        {entry.date}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                      {entry.title}
                    </h3>

                    <p className="text-sm text-slate-600 dark:text-zinc-400 leading-relaxed">
                      {entry.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
