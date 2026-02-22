
import React from 'react';
import { HashRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { LanguageProvider } from './contexts/LanguageContext';
import NavBar from './components/NavBar';
import Footer from './components/Footer';
import ChatWidget from './components/ChatWidget';
import Home from './pages/Home';
import ProductCatalog from './pages/ProductCatalog';
import ProductCategory from './pages/ProductCategory';
import ProductItem from './pages/ProductItem';
import SolutionDetail from './pages/SolutionDetail';
import Culture from './pages/Culture';
import Quote from './pages/Quote';
import FactoryTour from './pages/FactoryTour';
import BlogCatalog from './pages/BlogCatalog';
import BlogItem from './pages/BlogItem';

// Helper to scroll to top on route change
const ScrollToTop = () => {
  const { pathname } = useLocation();
  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

const App: React.FC = () => {
  return (
    <LanguageProvider>
      <Router>
        <ScrollToTop />
        <div className="min-h-screen bg-white font-sans text-neutral-900 selection:bg-pinte-blue selection:text-white flex flex-col">
          {/* NavBar is inside Router to use hooks */}
          <NavBar />
          
          <main className="flex-1">
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
          </main>

          {/* Footer logic is mostly static, but it contains nav links */}
          <Footer />
          
          <ChatWidget />
        </div>
      </Router>
    </LanguageProvider>
  );
};

export default App;
