import { SiteLayout } from '../components/layout/SiteLayout'
import { MuttonChicken } from '../components/sections/MuttonChicken'
import { SignatureMenu } from '../components/sections/SignatureMenu'
import { business } from '../data/site'
import { usePageTitle } from '../lib/router'

export function MenuPage() {
  usePageTitle(`Our Menu — ${business.name} ${business.signLine}`)

  return (
    <SiteLayout>
      <SignatureMenu headingLevel={1} />
      <MuttonChicken />
    </SiteLayout>
  )
}
