import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Header from '../components/common/Header';
import FilterBar from '../components/dashboard/FilterBar';
import ResultsPanel from '../components/dashboard/ResultsPanel';
import '../styles/Dashboard.css';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    city: '',
    timeRange: '7d',
    metric: 'aqi',
    zone: 'all',
    dailyPattern: 'all',
    season: 'all',
    weather: 'all',
    sensorStatus: 'all'
  });
  const [results, setResults] = useState(null);
  const [showResults, setShowResults] = useState(false);
  const [selectedCity, setSelectedCity] = useState('');

  useEffect(() => {
    setLoading(false);
  }, []);

  const handleFilterSubmit = (selectedFilters) => {
    setFilters(selectedFilters);
    setShowResults(true);
    fetchResults(selectedFilters);
  };

  const handleCitySelect = (cityName) => {
    setSelectedCity(cityName);
    const updatedFilters = { ...filters, city: cityName };
    setFilters(updatedFilters);
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    if (showResults) {
      fetchResults(newFilters);
    }
  };

  const fetchResults = async (selectedFilters) => {
  try {
    setLoading(true);

    const query = new URLSearchParams(selectedFilters).toString();
    const response = await fetch(`http://localhost:5000/api/data/analytics?${query}`);

    if (!response.ok) {
      throw new Error(`Server error: ${response.status}`);
    }

    const data = await response.json();
    setResults(data);
    setLoading(false);
  } catch (error) {
    console.error("Error fetching results:", error);
    setLoading(false);
  }
};



  const clearFilters = () => {
    setFilters({
      city: '',
      timeRange: '7d',
      metric: 'aqi',
      zone: 'all',
      dailyPattern: 'all',
      season: 'all',
      weather: 'all',
      sensorStatus: 'all'
    });
    setSelectedCity('');
    setShowResults(false);
    setResults(null);
  };

  if (loading && !showResults) {
    return (
      <div className="dashboard-container">
        <Header />
        <div className="loading">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <Header />
      
      <div className="dashboard-content">
        <div className="dashboard-header">
          <h1>Municipal AQI & Traffic Analytics</h1>
          <div className="header-actions">
            <button onClick={clearFilters} className="clear-filters-btn">
              Clear Filters
            </button>
          </div>
        </div>

        <div className="dashboard-layout">
         <div className="left-panel">
            <FilterBar 
              filters={filters}
              onSubmit={handleFilterSubmit}
              onFiltersChange={handleFilterChange}
              selectedCity={selectedCity}
            />
          </div>

          <div className="right-panel">
            {showResults ? (
              <ResultsPanel 
                results={results}
                filters={filters}
                loading={loading}
                selectedCity={selectedCity}
              />
            ) : (
              <div className="welcome-message">
                <h2>Welcome to Municipal AQI Dashboard</h2>
                <p>Select filters or click on a city in the map to view analytics data</p>
                <div className="feature-list">
                  <h3>Available Features:</h3>
                  <ul>
                    <li>✅ Real-time pollution heatmaps by zone</li>
                    <li>✅ Traffic congestion analytics</li>
                    <li>✅ Vehicle emission rankings</li>
                    <li>✅ Sensor health monitoring</li>
                    <li>✅ Automated alert system</li>
                    <li>✅ Multi-city comparison</li>
                    <li>✅ Historical data analysis</li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;