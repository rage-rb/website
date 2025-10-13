import React, {type ReactNode} from 'react';
import { Github, Heart } from 'lucide-react';
import Link from '@docusaurus/Link';
import ThemedImage from "@theme/ThemedImage";
import useBaseUrl from "@docusaurus/useBaseUrl";

function Footer(): ReactNode {
  return (
    <footer className="bg-slate-50 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 py-12 border-t border-l-0 border-r-0 border-b-0 border-solid border-slate-200 dark:border-zinc-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <ThemedImage
                className="w-6 h-6"
                alt="Rage.rb Logo"
                sources={{
                  light: useBaseUrl('/img/logo.svg'),
                  dark: useBaseUrl('/img/logo-dark.svg'),
                }}
              />
              <span className="text-xl font-bold text-slate-900 dark:text-white">Rage.rb</span>
            </div>
            <p className="text-sm leading-relaxed m-0">
              Fast, Rails-compatible web framework for Ruby.
            </p>
          </div>

          <div>
            <div className="text-slate-900 dark:text-white font-semibold mb-4">Resources</div>
            <ul className="space-y-2 text-sm list-none m-0 p-0">
              <li>
                <Link
                  to="/docs/intro"
                  className="hover:text-rage-500 dark:hover:text-rage-600 transition-colors !no-underline text-inherit"
                >
                  Documentation
                </Link>
              </li>
              <li>
                <a
                  href="https://github.com/rage-rb/rage/issues"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-rage-500 dark:hover:text-rage-600 transition-colors !no-underline text-inherit"
                >
                  Issues & Support
                </a>
              </li>
              <li>
                <a
                  href="https://openapi-playground.rage-rb.dev"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-rage-500 dark:hover:text-rage-600 transition-colors !no-underline text-inherit"
                >
                  OpenAPI Playground
                </a>
              </li>
            </ul>
          </div>

          <div>
            <div className="text-slate-900 dark:text-white font-semibold mb-4">Community</div>
            <ul className="space-y-2 text-sm list-none m-0 p-0">
              <li>
                <a
                  href="https://github.com/rage-rb/rage/discussions"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-rage-500 dark:hover:text-rage-600 transition-colors !no-underline text-inherit"
                >
                  Discussions
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/rage-rb/rage/stargazers"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-rage-500 dark:hover:text-rage-600 transition-colors !no-underline text-inherit"
                >
                  Star on GitHub
                </a>
              </li>
              <li>
                <a
                  href="https://rubygems.org/gems/rage-rb"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-rage-500 dark:hover:text-rage-600 transition-colors !no-underline text-inherit"
                >
                  RubyGems Package
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-solid border-t border-b-0 border-r-0 border-l-0 border-slate-200 dark:border-zinc-700">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2 text-sm">
              <span>Made with</span>
              <Heart className="w-4 h-4 text-rage-500 dark:text-rage-600 fill-current" />
              <span>for the Ruby community</span>
            </div>

            <div className="flex items-center gap-6">
              <a
                href="https://github.com/rage-rb/rage"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 hover:text-rage-500 dark:hover:text-rage-600 transition-colors !no-underline text-inherit text-sm"
              >
                <Github className="w-5 h-5" />
                <span>GitHub</span>
              </a>
            </div>
          </div>

          <div className="mt-6 text-center text-sm">
            <p className='m-0'>
              Released under the MIT License.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default React.memo(Footer);
