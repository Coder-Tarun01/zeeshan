import { SiteLayout } from '../components/layout/SiteLayout'
import { ChickenSpecials } from '../components/sections/ChickenSpecials'
import { business } from '../data/site'
import { usePageTitle } from '../lib/router'

export function SpecialsPage() {
  usePageTitle(`Chicken Specials — ${business.name} ${business.signLine}`)

  return (
    <SiteLayout>
      <ChickenSpecials headingLevel={1} />
    </SiteLayout>
  )
}
