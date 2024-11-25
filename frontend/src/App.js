import React, { useEffect, useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';
import './App.css';

function App() {
  const [countries, setCountries] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [populationData, setPopulationData] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [chartType, setChartType] = useState('line');
  const [sortOrder, setSortOrder] = useState('alphabetical');
  const [theme, setTheme] = useState('light');
  const [showFavorites, setShowFavorites] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [countriesRes, populationRes] = await Promise.all([
        fetch('http://localhost:5000/api/countries'),
        fetch('http://localhost:5000/api/population'),
      ]);

      const countriesData = await countriesRes.json();
      const populationData = await populationRes.json();

      const countriesWithFlags = await Promise.all(
        countriesData.map(async (country) => {
          const flagRes = await fetch('http://localhost:5000/api/flag', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ country: country.name }),
          });
          const flagData = await flagRes.json();
          const cityData = populationData.find(
            (city) => city.city.toLowerCase() === country.capital.toLowerCase()
          );
          return {
            ...country,
            flag: flagData.flag || '/placeholder.png',
            population: cityData?.populationCounts[0]?.value || 0,
          };
        })
      );

      setCountries(countriesWithFlags);
    } catch (err) {
      setError('Failed to load data. Please try again.');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => setSearchTerm(e.target.value.toLowerCase());

  const handleSort = (order) => {
    setSortOrder(order);
    setCountries((prevCountries) => {
      const sortedCountries = [...prevCountries];
      if (order === 'alphabetical') {
        sortedCountries.sort((a, b) => a.name.localeCompare(b.name));
      } else if (order === 'highest') {
        sortedCountries.sort((a, b) => b.population - a.population);
      } else if (order === 'lowest') {
        sortedCountries.sort((a, b) => a.population - b.population);
      }
      return sortedCountries;
    });
  };

  const toggleFavorite = (country) => {
    setFavorites((prevFavorites) => {
      if (prevFavorites.includes(country)) {
        return prevFavorites.filter((fav) => fav !== country);
      } else {
        return [...prevFavorites, country];
      }
    });
  };

  const removeFromFavorites = (country) => {
    setFavorites((prevFavorites) => prevFavorites.filter((fav) => fav !== country));
  };

  const filteredCountries = countries.filter(
    (country) =>
      country.name.toLowerCase().includes(searchTerm) ||
      country.capital.toLowerCase().includes(searchTerm)
  );

  const top20Countries = filteredCountries.slice(0, 20);

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (error) {
    return (
      <div className="error">
        <p>{error}</p>
        <button onClick={fetchData}>Retry</button>
      </div>
    );
  }

  return (
    <div className={`app ${theme}`}>
      <header className="header">
      <img src="https://imgs.search.brave.com/v1cuKtLyVihV0k61-xKOhhzBC2xMX7_1IMQS_MTQFHs/rs:fit:500:0:0:0/g:ce/aHR0cHM6Ly90NC5m/dGNkbi5uZXQvanBn/LzA2LzE4Lzk1Lzgz/LzM2MF9GXzYxODk1/ODM5N193Ym1aVWta/YVRJbzlZdnNvZXNP/Q0RkaEttM1lvNXRv/VC5qcGc" alt="Population Globe" />
        <h1>Globgraphics</h1>
        <input
          type="text"
          placeholder="Search by country or capital..."
          value={searchTerm}
          onChange={handleSearch}
          className="search-input"
        />
      </header>

      <div className="toggle-buttons">
        <button
          className="action-button"
          onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
        >
          Toggle to {theme === 'light' ? 'Dark' : 'Light'} Mode
        </button>
        <button
          className="action-button"
          onClick={() => setShowFavorites(!showFavorites)}
        >
          {showFavorites ? 'Hide Favorites' : 'Show Favorites'}
        </button>
        <select
          value={sortOrder}
          onChange={(e) => handleSort(e.target.value)}
          className="sort-dropdown"
        >
          <option value="alphabetical">Alphabetical</option>
          <option value="highest">Highest Population</option>
          <option value="lowest">Lowest Population</option>
        </select>
      </div>

      {showFavorites && (
        <div className="favorites-section">
          <h2>Countries !You Like  !
          </h2>
          {favorites.length === 0 ? (
            <p>No favorite countries added yet.</p>
          ) : (
            <div className="countries-grid">
              {favorites.map((country, index) => (
                <div key={index} className="country-card">
                  <div className="flag-container">
                    <img
                      src={country.flag}
                      alt={`${country.name} flag`}
                      className="country-flag"
                    />
                  </div>
                  <div className="country-info">
                    <h3>{country.name}</h3>
                    <p>Capital: {country.capital}</p>
                    <p>Population: {country.population.toLocaleString()}</p>
                    <button
                      className="remove-button"
                      onClick={() => removeFromFavorites(country)}
                    >
                      Remove from Favorites
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="main-content">
        <div className="countries-grid">
          {filteredCountries.map((country, index) => (
            <div
              key={index}
              className={`country-card ${
                selectedCountry === country ? 'selected' : ''
              }`}
              onClick={() => setSelectedCountry(country)}
            >
              <div className="flag-container">
                <img
                  src={country.flag}
                  alt={`${country.name} flag`}
                  className="country-flag"
                />
              </div>
              <div className="country-info">
                <h3>{country.name}</h3>
                <p>Capital: {country.capital}</p>
                <p>Population: {country.population.toLocaleString()}</p>
                <button
                  className={`favorite-button ${
                    favorites.includes(country) ? 'added' : ''
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFavorite(country);
                  }}
                >
                  {favorites.includes(country) ? 'Remove from Favorites' : 'Add to Favorites'}
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="chart-container">
          <h2>Population Distribution Graph</h2>
          <button
            className="action-button"
            onClick={() => setChartType(chartType === 'line' ? 'bar' : 'line')}
          >
            Switch to {chartType === 'line' ? 'Bar Chart' : 'Line Chart'}
          </button>
          <ResponsiveContainer width="100%" height={400}>
            {chartType === 'line' ? (
              <LineChart data={top20Countries}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} interval={0} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="population" stroke="#2196F3" />
              </LineChart>
            ) : (
              <BarChart data={top20Countries}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} interval={0} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="population" fill="#2196F3" />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

export default App;
