import { ArrowRight, Terminal } from 'lucide-react';

export default function CTA() {
  return (
    <section className="py-24 bg-white dark:bg-zinc-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative bg-gradient-to-br from-rage-500 to-rage-400 dark:from-rage-600 dark:to-rage-500 rounded-3xl overflow-hidden shadow-lg">
          <div className="relative px-8 py-16 md:px-16 md:py-24">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
                Ready to Build Something Fast?
              </h2>

              <p className="text-xl md:text-2xl text-rage-50 mb-12">
                Start building high-performance Ruby applications today. No complex setup required.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
                <a
                  href="https://github.com/rage-rb/rage"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-rage-600 hover:text-rage-600 font-bold rounded-xl hover:bg-rage-50 transition-all duration-200 shadow-md hover:no-underline"
                >
                  Get Started
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </a>

                <a
                  href="https://github.com/rage-rb/rage#readme"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-transparent text-white font-bold rounded-xl border-2 border-white hover:bg-white hover:text-rage-600 transition-all duration-200 hover:no-underline"
                >
                  Read the Docs
                </a>
              </div>

              <div className="inline-flex items-center gap-3 px-6 py-4 bg-white/20 backdrop-blur-sm rounded-xl border border-white/30">
                <Terminal className="w-5 h-5 text-white" />
                <div className="text-white font-mono text-lg">
                  gem install rage-rb
                </div>
              </div>

              <div className="mt-12 flex flex-wrap gap-8 justify-center text-white">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Rails Compatible</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Open Source</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Production Ready</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
