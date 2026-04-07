import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { LanguageProvider } from './contexts/LanguageContext';
import NavBar from './components/NavBar';
import Footer from './components/Footer';

// Lazy load heavy interactive components
const ChatWidget = React.lazy(() => import('./components/ChatWidget'));

// Lazy load all page components for better performance
const Home = React.lazy(() => import('./pages/Home'));
const ProductCatalog = React.lazy(() => import('./pages/ProductCatalog'));
const ProductCategory = React.lazy(() => import('./pages/ProductCategory'));
const ProductItem = React.lazy(() => import('./pages/ProductItem'));
const SolutionDetail = React.lazy(() => import('./pages/SolutionDetail'));
const Culture = React.lazy(() => import('./pages/Culture'));
const Quote = React.lazy(() => import('./pages/Quote'));
const FactoryTour = React.lazy(() => import('./pages/FactoryTour'));
const BlogCatalog = React.lazy(() => import('./pages/BlogCatalog'));
const BlogItem = React.lazy(() => import('./pages/BlogItem'));

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

const AppRoutes = () => {
  return (
    <Routes>
      {/* Redirect root to default language (Chinese) */}
      <Route path="/" element={<Navigate to="/cn" replace />} />

      {/* All routes with language prefix - LanguageProvider reads lang from URL params */}
      <Route path="/:lang/*">
        <Route element={
          <LanguageProvider>
            <div className="min-h-screen bg-white font-sans text-neutral-900 selection:bg-pinte-blue selection:text-white flex flex-col">
              {/* NavBar is inside to use language context */}
              <NavBar />

              <main className="flex-1">
                <Suspense fallback={<PageLoader />}>
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/solutions/:id" element={<SolutionDetail />} />
                    <Route path="/products" element={<ProductCatalog />} />
                    <Route path="/products/category/:id" element={<ProductCategory />} />
                    <Route path="/products/item/:id" element={<ProductItem />} />
                    <Route path="/culture" element={<Culture />} />
                    <Route path="/quote" element={<Quote />} />
                    <Route path="/tour" element={<FactoryTour />} />
                    <Route path="/blog" element={<BlogCatalog />} />
                    <Route path="/blog/:slug" element={<BlogItem />} />
                  </Routes>
                </Suspense>
              </main>

              <Footer />

              <Suspense fallback={null}>
                <ChatWidget />
              </Suspense>
            </div>
          </LanguageProvider>
        } />
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
