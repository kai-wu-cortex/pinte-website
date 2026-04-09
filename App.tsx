import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, Outlet } from 'react-router-dom';
import { LanguageProvider } from './contexts/LanguageContext';
import NavBar from './components/NavBar';
import Footer from './components/Footer';

// Lazy load heavy interactive components
const ChatWidget = React.lazy(() => import('./components/ChatWidget'));

// Lazy load all page components for better performance
const Home = React.lazy(() => import('./pages/Home'));
const About = React.lazy(() => import('./pages/About'));
const ProductCatalog = React.lazy(() => import('./pages/ProductCatalog'));
const ProductCategory = React.lazy(() => import('./pages/ProductCategory'));
const ProductItem = React.lazy(() => import('./pages/ProductItem'));
const SolutionDetail = React.lazy(() => import('./pages/SolutionDetail'));
const Culture = React.lazy(() => import('./pages/Culture'));
const Quote = React.lazy(() => import('./pages/Quote'));
const FactoryTour = React.lazy(() => import('./pages/FactoryTour'));
const BlogCatalog = React.lazy(() => import('./pages/BlogCatalog'));
const BlogItem = React.lazy(() => import('./pages/BlogItem'));
const Privacy = React.lazy(() => import('./pages/Privacy'));
const Terms = React.lazy(() => import('./pages/Terms'));
const PinteFoils = React.lazy(() => import('./pages/PinteFoils'));

// Loading spinner component for Suspense
const PageLoader = () => (
  <div className="min-h-[50vh] flex items-center justify-center">
    <div className="w-12 h-12 border-4 border-pinte-blue/20 border-t-pinte-blue rounded-full animate-spin"></div>
  </div>
);

// Helper to scroll to top on route change
const ScrollToTop = () => {
  const { pathname } = useLocation();
  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

const LanguageLayout = () => {
  return (
    <LanguageProvider>
      <div className="min-h-screen bg-white font-sans text-neutral-900 selection:bg-pinte-blue selection:text-white flex flex-col">
        {/* NavBar is inside to use language context */}
        <NavBar />

        <main className="flex-1">
          <Suspense fallback={<PageLoader />}>
            <Outlet />
        </Suspense>
        </main>

        <Footer />

        <Suspense fallback={null}>
          <ChatWidget />
        </Suspense>
      </div>
  </LanguageProvider>
  );
};

const AppRoutes = () => {
  return (
    <Routes>
      {/* Redirect root to default language (Chinese) */}
      <Route path="/" element={<Navigate to="/cn" replace />} />

      {/* PinteFoils standalone page - no NavBar/Footer */}
      <Route path="/pintefoils" element={<PinteFoils />} />
      <Route path="/:lang/pintefoils" element={<PinteFoils />} />

      {/* Redirect any non-language prefixed routes to default language (Chinese) */}
      <Route path="/about" element={<Navigate to="/cn/about" replace />} />
      <Route path="/solutions/:id" element={<Navigate replace to={`/cn/solutions/${':id'}`} />} />
      <Route path="/products" element={<Navigate to="/cn/products" replace />} />
      <Route path="/products/foils" element={<Navigate to="/cn/products/foils" replace />} />
      <Route path="/products/category/:id" element={<Navigate replace to={`/cn/products/category/${':id'}`} />} />
      <Route path="/products/item/:id" element={<Navigate replace to={`/cn/products/item/${':id'}`} />} />
      <Route path="/culture" element={<Navigate to="/cn/culture" replace />} />
      <Route path="/quote" element={<Navigate to="/cn/quote" replace />} />
      <Route path="/tour" element={<Navigate to="/cn/tour" replace />} />
      <Route path="/blog" element={<Navigate to="/cn/blog" replace />} />
      <Route path="/blog/:slug" element={<Navigate replace to={`/cn/blog/${':slug'}`} />} />
      <Route path="/privacy" element={<Navigate to="/cn/privacy" replace />} />
      <Route path="/terms" element={<Navigate to="/cn/terms" replace />} />

      {/* All routes with language prefix - LanguageProvider reads lang from URL params */}
      <Route path="/:lang" element={<LanguageLayout />}>
        <Route index element={<Home />} />
        <Route path="about" element={<About />} />
        <Route path="solutions/:id" element={<SolutionDetail />} />
        <Route path="products" element={<ProductCatalog />} />
        <Route path="products/foils" element={<ProductCatalog />} />
        <Route path="products/category/:id" element={<ProductCategory />} />
        <Route path="products/item/:id" element={<ProductItem />} />
        <Route path="culture" element={<Culture />} />
        <Route path="quote" element={<Quote />} />
        <Route path="tour" element={<FactoryTour />} />
        <Route path="blog" element={<BlogCatalog />} />
        <Route path="blog/:slug" element={<BlogItem />} />
        <Route path="privacy" element={<Privacy />} />
        <Route path="terms" element={<Terms />} />
      </Route>
    </Routes>
  );
};

const App: React.FC = () => {
  return (
    <Router>
      <ScrollToTop />
      <AppRoutes />
    </Router>
  );
};

export default App;
