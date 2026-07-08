import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import ArticleDetail from './pages/ArticleDetail';
import Footer from './components/Footer';

const API_BASE_URL = 'http://localhost:5000/api';

function App() {
  const [currentPage, setCurrentPage] = useState('home'); // 'home' or 'dashboard'
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [articles, setArticles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchArticles = async () => {
    try {
      setIsLoading(true);
      const res = await fetch(`${API_BASE_URL}/articles`);
      if (res.ok) {
        const data = await res.json();
        setArticles(data);
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
      ) : currentPage === 'home' ? (
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
      ) : (
        <Dashboard 
          onClose={() => handleNavigate('home')} 
          onRefreshArticles={fetchArticles}
        />
      )}
      <Footer />
    </>
  );
}

export default App;
