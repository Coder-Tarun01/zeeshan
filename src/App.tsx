import { Footer } from './components/layout/Footer'
import { FloatingActions } from './components/layout/FloatingActions'
import { Navbar } from './components/layout/Navbar'
import { BagProvider } from './components/order/BagContext'
import { OrderProvider } from './components/order/OrderContext'
import { About } from './components/sections/About'
import { ChickenSpecials } from './components/sections/ChickenSpecials'
import { Contact } from './components/sections/Contact'
import { Gallery } from './components/sections/Gallery'
import { Hero } from './components/sections/Hero'
import { MarqueeStrip } from './components/sections/MarqueeStrip'
import { MuttonChicken } from './components/sections/MuttonChicken'
import { SignatureMenu } from './components/sections/SignatureMenu'
import { WhyChoose } from './components/sections/WhyChoose'
import { BagPage } from './pages/BagPage'
import { BAG_PATH, useHashLinkBridge, usePathname } from './lib/router'

export default function App() {
  const path = usePathname()
  useHashLinkBridge()

  const isBagPage = path === BAG_PATH

  return (
    <BagProvider>
      <OrderProvider>
        {isBagPage ? (
          <BagPage />
        ) : (
          <>
            <a
              href="#main"
              className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[200] focus:bg-gold focus:px-4 focus:py-2 focus:text-[11px] focus:font-semibold focus:uppercase focus:tracking-[0.18em] focus:text-ink"
            >
              Skip to content
            </a>

            <Navbar />

            <main id="main">
              <Hero />
              <MarqueeStrip />
              <SignatureMenu />
              <ChickenSpecials />
              <MuttonChicken />
              <About />
              <WhyChoose />
              <Gallery />
              <Contact />
            </main>

            <Footer />
            <FloatingActions />
          </>
        )}
      </OrderProvider>
    </BagProvider>
  )
}

