import { SiteLayout } from '../components/layout/SiteLayout'
import { Gallery } from '../components/sections/Gallery'
import { business } from '../data/site'
import { usePageTitle } from '../lib/router'

export function GalleryPage() {
  usePageTitle(`Food Gallery — ${business.name} ${business.signLine}`)

  return (
    <SiteLayout>
      <Gallery headingLevel={1} />
    </SiteLayout>
  )
}
