import { useState, useEffect } from 'react';
import Header from './components/Header';
import Home from './pages/Home';
import AdminDashboard from './pages/AdminDashboard';
import ReporterDashboard from './pages/ReporterDashboard';
import UserDashboard from './pages/UserDashboard';
import ArticleDetail from './pages/ArticleDetail';
import Footer from './components/Footer';

const API_BASE_URL = 'http://localhost:5000/api';

function App() {
  const [currentPage, setCurrentPage] = useState('home'); // 'home' or 'dashboard'
  const [currentPath, setCurrentPath] = useState(window.location.pathname);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [articles, setArticles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Sync URL changes dynamically
  useEffect(() => {
    const handleLocationChange = () => {
      setCurrentPath(window.location.pathname);
    };
    window.addEventListener('popstate', handleLocationChange);
    return () => window.removeEventListener('popstate', handleLocationChange);
  }, []);

  const fetchArticles = async () => {
    try {
      setIsLoading(true);
      const res = await fetch(`${API_BASE_URL}/articles`);
      if (res.ok) {
        const data = await res.json();
        // Filter out articles that do not have an image
        const articlesWithImages = data.filter(art => art.image_url && art.image_url.trim() !== '');
        setArticles(articlesWithImages);
      }
    } catch (err) {
      console.error('Failed to fetch articles:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchArticles();
  }, []);

  const handleNavigate = (page) => {
    if (page === 'dashboard') {
      window.location.href = '/dashboard';
      return;
    }
    setCurrentPage(page);
    setSelectedArticle(null);
    if (page === 'home') {
      setSelectedCategory('All');
      setSearchQuery('');
      setSelectedDate('');
    }
  };

  const handleSelectCategory = (category) => {
    setCurrentPage('home');
    setSelectedArticle(null);
    setSelectedCategory(category);
  };

  // Render standalone dashboard pages based on URL routes
  if (currentPath === '/maalik-access') {
    return <AdminDashboard onRefreshArticles={fetchArticles} />;
  }

  if (currentPath === '/reporter/login') {
    return <ReporterDashboard onRefreshArticles={fetchArticles} />;
  }

  if (currentPath === '/dashboard') {
    return <UserDashboard onRefreshArticles={fetchArticles} />;
  }

  return (
    <>
      <Header 
        onNavigate={handleNavigate} 
        onSelectCategory={handleSelectCategory} 
        selectedCategory={selectedCategory}
        onSearch={setSearchQuery}
        searchQuery={searchQuery}
        onSelectDate={setSelectedDate}
        selectedDate={selectedDate}
      />
      {selectedArticle ? (
        <ArticleDetail 
          article={selectedArticle} 
          onClose={() => setSelectedArticle(null)} 
          onSelectArticle={setSelectedArticle}
          allArticles={articles}
        />
      ) : (
        <Home 
          articles={articles}
          isLoading={isLoading}
          selectedCategory={selectedCategory} 
          onSelectCategory={handleSelectCategory}
          searchQuery={searchQuery}
          selectedDate={selectedDate}
          onSelectArticle={setSelectedArticle}
          onRefreshArticles={fetchArticles}
        />
      )}
      <Footer />
    </>
  );
}

export default App;
