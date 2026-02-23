import Link from '@docusaurus/Link';
import { Github, BookOpen } from 'lucide-react';

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-white dark:bg-zinc-900">
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 right-0 h-[600px] hero--bg-radial-light dark:hero--bg-radial-dark"></div>
        <div className="absolute top-0 left-0 right-0 h-[600px] bg-gradient-to-b from-transparent via-transparent to-white dark:to-zinc-900"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32 lg:py-40">
        <div className="text-center">
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-slate-900 dark:text-white mb-6 max-w-5xl mx-auto leading-tight">
            The <span className="text-rage-500 dark:text-rage-600">Real-Time</span> Ruby Framework
          </h1>

          <p className="text-xl sm:text-2xl text-slate-600 dark:text-zinc-200 mb-4 max-w-3xl mx-auto font-medium">
            Rails-compatible. Zero-dependency. All in one process.
          </p>

          <p className="text-lg sm:text-xl text-slate-500 dark:text-zinc-400 mb-12 max-w-2xl mx-auto">
            Build high-concurrency APIs, streaming architectures, and background systems using the Ruby you already know.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <a
              href="https://github.com/rage-rb/rage"
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-2 px-8 py-4 bg-rage-500 hover:bg-rage-600 dark:bg-rage-600 dark:hover:bg-rage-700 text-white font-semibold rounded-lg transition-all duration-200 shadow-md hover:shadow-lg hover:text-white hover:no-underline"
            >
              <Github className="w-5 h-5" />
              View on Github
            </a>

            <Link
              to="/docs/intro"
              className="group inline-flex items-center gap-2 px-8 py-4 bg-white dark:bg-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 font-semibold rounded-lg transition-all duration-200 border-2 border-slate-200 dark:border-zinc-700 hover:border-slate-300 dark:hover:border-zinc-600 hover:text-slate-700 hover:no-underline"
            >
              <BookOpen className="w-5 h-5" />
              Documentation
            </Link>
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-slate-200 dark:via-zinc-700 to-transparent"></div>
    </section>
  );
}
