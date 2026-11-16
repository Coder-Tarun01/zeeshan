import { SiteLayout } from '../components/layout/SiteLayout'
import { About } from '../components/sections/About'
import { business } from '../data/site'
import { usePageTitle } from '../lib/router'

export function AboutPage() {
  usePageTitle(`About Us — ${business.name} ${business.signLine}`)

  return (
    <SiteLayout>
      <About headingLevel={1} />
    </SiteLayout>
  )
}
