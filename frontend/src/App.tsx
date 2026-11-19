import { useEffect } from 'react'
import { MenuProvider } from './components/menu/MenuContext'
import { BagProvider } from './components/order/BagContext'
import { OrderProvider } from './components/order/OrderContext'
import { AboutPage } from './pages/AboutPage'
import { AdminPage } from './pages/AdminPage'
import { BagPage } from './pages/BagPage'
import { CheckoutPage } from './pages/CheckoutPage'
import { ContactPage } from './pages/ContactPage'
import { GalleryPage } from './pages/GalleryPage'
import { HomePage } from './pages/HomePage'
import { MenuPage } from './pages/MenuPage'
import { NotFoundPage } from './pages/NotFoundPage'
import { SpecialsPage } from './pages/SpecialsPage'
import { TermsPage } from './pages/TermsPage'
import {
  ABOUT_PATH,
  ADMIN_PATH,
  BAG_PATH,
  CHECKOUT_PATH,
  CONTACT_PATH,
  GALLERY_PATH,
  HOME_PATH,
  MENU_PATH,
  SPECIALS_PATH,
  TERMS_PATH,
  scrollToRouteTarget,
  useLinkInterceptor,
  usePathname,
} from './lib/router'

function renderPage(path: string) {
  switch (path) {
    case HOME_PATH:
      return <HomePage />
    case ABOUT_PATH:
      return <AboutPage />
    case MENU_PATH:
      return <MenuPage />
    case SPECIALS_PATH:
      return <SpecialsPage />
    case GALLERY_PATH:
      return <GalleryPage />
    case CONTACT_PATH:
      return <ContactPage />
    case BAG_PATH:
      return <BagPage />
    case CHECKOUT_PATH:
      return <CheckoutPage />
    case TERMS_PATH:
      return <TermsPage />
    case ADMIN_PATH:
      return <AdminPage />
    default:
      return <NotFoundPage />
  }
}

export default function App() {
  const path = usePathname()
  useLinkInterceptor()

  useEffect(() => {
    scrollToRouteTarget()
  }, [path])

  return (
    <MenuProvider>
      <BagProvider>
        <OrderProvider>{renderPage(path)}</OrderProvider>
      </BagProvider>
    </MenuProvider>
  )
}


