import React, { useState } from 'react';
import { skillService } from '../services/api';
import SkillCard from '../components/SkillCard';

const SearchSkills = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [userName] = useState(localStorage.getItem('userName') || '');

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    try {
      setLoading(true);
      const response = await skillService.searchSkills(query);
      setResults(response.data);
      setSearched(true);
    } catch (err) {
      console.error('Search error:', err);
      alert(`Search failed. Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fade-in">
      <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '2rem' }}>Find a Barter Partner</h1>
        
        <form onSubmit={handleSearch} style={{ maxWidth: '600px', margin: '0 auto', display: 'flex', gap: '1rem' }}>
          <input
            type="text"
            className="form-input"
            placeholder="Search skills, users, or locations..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{ flex: 1 }}
          />
          <button type="submit" className="btn btn-primary">Search</button>
        </form>
      </div>

      {loading && <p style={{ textAlign: 'center' }}>Searching...</p>}

      {searched && !loading && results.length === 0 && (
        <p style={{ textAlign: 'center', opacity: 0.5 }}>No results found for "{query}"</p>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '2rem' }}>
        {results.map((skill) => (
          <SkillCard 
            key={skill.id} 
            skill={skill} 
            onDelete={() => setResults(results.filter(r => r.id !== skill.id))} 
            currentUser={userName}
          />
        ))}
      </div>
    </div>
  );
};

export default SearchSkills;
