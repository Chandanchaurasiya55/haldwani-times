import React, { useState } from 'react';
import Header from './components/Header';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import ArticleDetail from './pages/ArticleDetail';
import Footer from './components/Footer';

function App() {
  const [currentPage, setCurrentPage] = useState('home'); // 'home' or 'dashboard'
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [articles, setArticles] = useState([]);

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
          selectedCategory={selectedCategory} 
          onSelectCategory={handleSelectCategory}
          searchQuery={searchQuery}
          selectedDate={selectedDate}
          onSelectArticle={setSelectedArticle}
          onArticlesLoaded={setArticles}
        />
      ) : (
        <Dashboard onClose={() => handleNavigate('home')} />
      )}
      <Footer />
    </>
  );
}

export default App;
