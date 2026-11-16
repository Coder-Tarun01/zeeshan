import { SiteLayout } from '../components/layout/SiteLayout'
import { Contact } from '../components/sections/Contact'
import { business } from '../data/site'
import { usePageTitle } from '../lib/router'

export function ContactPage() {
  usePageTitle(`Contact & Location — ${business.name} ${business.signLine}`)

  return (
    <SiteLayout>
      <Contact headingLevel={1} />
    </SiteLayout>
  )
}
