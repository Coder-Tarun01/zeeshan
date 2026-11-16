import { SiteLayout } from '../components/layout/SiteLayout'
import { ExplorePages } from '../components/sections/ExplorePages'
import { Hero } from '../components/sections/Hero'
import { MarqueeStrip } from '../components/sections/MarqueeStrip'
import { WhyChoose } from '../components/sections/WhyChoose'
import { business } from '../data/site'
import { usePageTitle } from '../lib/router'

export function HomePage() {
  usePageTitle(
    `${business.name} ${business.signLine} | Chicken Pakodi, Lollipop & Non-Veg Specialities`,
  )

  return (
    <SiteLayout padded={false}>
      <Hero />
      <MarqueeStrip />
      <ExplorePages />
      <WhyChoose />
    </SiteLayout>
  )
}
