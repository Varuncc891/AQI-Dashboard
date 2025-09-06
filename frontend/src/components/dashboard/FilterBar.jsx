import { useState } from 'react';
import '../../styles/FilterBar.css';

const FilterBar = ({ filters, onSubmit, onFiltersChange, selectedCity }) => {
  const [localFilters, setLocalFilters] = useState(filters);

  const handleInputChange = (field, value) => {
    const newFilters = { ...localFilters, [field]: value };
    setLocalFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(localFilters);
  };

  useState(() => {
    if (selectedCity && selectedCity !== localFilters.city) {
      const newFilters = { ...localFilters, city: selectedCity };
      setLocalFilters(newFilters);
      onFiltersChange(newFilters);
    }
  }, [selectedCity]);

  return (
    <div className="filter-bar">
      <div className="filter-header">
    <h3>Data Filters</h3>
    <div className="filter-subtitle">Refine analytics data by selecting filters below</div>
      </div>
      <form onSubmit={handleSubmit} className="filter-form">
        <div className="filter-row-full">
      <div className="filter-group">
            <label htmlFor="city">City</label>
            <select id="city" value={localFilters.city} onChange={(e) => handleInputChange('city', e.target.value)}>
            <option value="">All Cities</option>
            <option value="hyderabad">Hyderabad</option>
            <option value="bangalore">Bangalore</option>
          <option value="chennai">Chennai</option>
          <option value="assam">Assam</option>
          <option value="kochi">Kochi</option>
          <option value="jaipur">Jaipur</option>
        </select>
      </div>
    </div>

    <div className="filter-row-full">
      <div className="filter-group">
        <label htmlFor="timeRange">Time Range</label>
        <select id="timeRange" value={localFilters.timeRange} onChange={(e) => handleInputChange('timeRange', e.target.value)}>
          <option value="1d">Last 24 Hours</option>
          <option value="7d">Last 7 Days</option>
          <option value="30d">Last 30 Days</option>
        </select>
      </div>
    </div>

    <div className="filter-row">
      <div className="filter-group">
        <label htmlFor="metric">Primary Metric</label>
        <select id="metric" value={localFilters.metric} onChange={(e) => handleInputChange('metric', e.target.value)}>
          <option value="aqi">(AQI)</option>
          <option value="pm25">PM 2.5 Levels</option>
          <option value="traffic">Traffic Density</option>
          <option value="emissions">Vehicle Emissions</option>
          <option value="congestion">Traffic Congestion</option>
        </select>
      </div>
      
      <div className="filter-group">
        <label htmlFor="zone">Zone Type</label>
        <select id="zone" value={localFilters.zone} onChange={(e) => handleInputChange('zone', e.target.value)}>
          <option value="all">All Zones</option>
          <option value="downtown">Downtown</option>
          <option value="residential">Residential</option>
          <option value="industrial">Industrial</option>
          <option value="commercial">Commercial</option>
          <option value="mixed">Mixed Use</option>
        </select>
      </div>
    </div>

    <div className="filter-row">
      <div className="filter-group">
        <label htmlFor="dailyPattern">Daily Pattern</label>
        <select id="dailyPattern" value={localFilters.dailyPattern} onChange={(e) => handleInputChange('dailyPattern', e.target.value)}>
          <option value="all">All Day</option>
          <option value="morning">Morning Rush (7-10 AM)</option>
          <option value="midday">Mid-Day (10 AM-4 PM)</option>
          <option value="evening">Evening Rush (4-7 PM)</option>
          <option value="night">Night (8 PM-6 AM)</option>
        </select>
      </div>
    </div>

    <div className="filter-row">
      <div className="filter-group">
        <label htmlFor="weather">Weather Condition</label>
        <select id="weather" value={localFilters.weather} onChange={(e) => handleInputChange('weather', e.target.value)}>
          <option value="all">All Weather</option>
          <option value="sunny">Sunny/Clear</option>
          <option value="rainy">Rainy</option>
        </select>
      </div>
    </div>

    <div className="filter-row-full">
      <div className="filter-group">
        <label className="invisible-label">Apply</label>
        <button type="submit" className="view-results-btn">
          Apply Filters
        </button>
      </div>
    </div>
  </form>
  
      {selectedCity && (
        <div className="selected-city-indicator">
        <span className="city-badge">Selected: {selectedCity}</span>
        <button onClick={() => handleInputChange('city', '')} className="clear-city-btn">
          Clear
        </button>
      </div>
    )}
  </div>
  );
};

export default FilterBar;