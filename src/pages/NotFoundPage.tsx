import { SiteLayout } from '../components/layout/SiteLayout'
import { business } from '../data/site'
import { HOME_PATH, MENU_PATH, usePageTitle } from '../lib/router'

export function NotFoundPage() {
  usePageTitle(`Page not found — ${business.name} ${business.signLine}`)

  return (
    <SiteLayout>
      <section className="relative overflow-hidden bg-ink py-24 sm:py-28 lg:py-32">
        <div
          className="pointer-events-none absolute left-1/2 top-1/2 h-[420px] w-[720px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gold/[0.05] blur-[140px]"
          aria-hidden="true"
        />

        <div className="container-page relative text-center">
          <span className="inline-flex items-center gap-3 text-[10px] font-medium uppercase tracking-label text-gold">
            <span className="h-px w-8 bg-gold/60" aria-hidden="true" />
            404
            <span className="h-px w-8 bg-gold/60" aria-hidden="true" />
          </span>

          <h1 className="mx-auto mt-6 max-w-xl font-display text-[clamp(2rem,5vw,3.4rem)] leading-tight text-cream">
            This page isn&apos;t on the menu.
          </h1>

          <p className="mx-auto mt-4 max-w-md text-[14px] leading-relaxed text-cream/50">
            The link may be old or mistyped. Head back home, or go straight to the food.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <a href={HOME_PATH} className="btn-gold">
              Back to Home
            </a>
            <a href={MENU_PATH} className="btn-outline">
              View the Menu
            </a>
          </div>
        </div>
      </section>
    </SiteLayout>
  )
}
