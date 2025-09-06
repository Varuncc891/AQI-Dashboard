import '../../styles/ResultsPanel.css';

const ResultsPanel = ({ results, filters, loading, alerts }) => {
  if (loading) {
    return (
      <div className="results-panel loading">
        <div className="loading-spinner">Loading results...</div>
      </div>
    );
  }

  if (!results) {
    return (
      <div className="results-panel">
        <div className="no-results">No results to display</div>
      </div>
    );
  }

  const getCardData = () => {
    const metric = filters.metric || 'aqi';
    const { summary } = results;

    const formatValue = (value, suffix = '') => {
      if (value === 0 || value === '0' || value === 'No data') return 'No data available';
      return `${value}${suffix}`;
    };

    const formatZoneValue = (zone, value, suffix = '') => {
      if (!zone || zone === 'No data' || value === 0) return 'No data available';
      return `${zone} (${Math.round(value)}${suffix})`;
    };

    switch(metric) {
      case 'pm25':
        return [
          { 
            title: 'PM2.5 at zone', 
            value: formatValue(summary.pm25Value, ' μg/m³'), 
            subtitle: 'Average Level' 
          },
          { 
            title: 'Best PM2.5 Zone', 
            value: formatZoneValue(summary.bestZone, summary.bestZoneValue, ' μg/m³'), 
            subtitle: 'Lowest Pollution' 
          },
          { 
            title: 'Worst PM2.5 Zone', 
            value: formatZoneValue(summary.worstZone, summary.worstZoneValue, ' μg/m³'), 
            subtitle: 'Highest Pollution' 
          }
        ];
      
      case 'traffic':
        return [
          { 
            title: 'Average Traffic Density', 
            value: formatValue(summary.avgVehicles), 
            subtitle: 'Vehicles per hour' 
          },
          { 
            title: 'Least Traffic Zone', 
            value: formatZoneValue(summary.bestZone, summary.bestZoneValue, ' vehicles'), 
            subtitle: 'Lowest Density' 
          },
          { 
            title: 'Highest Traffic Zone', 
            value: formatZoneValue(summary.worstZone, summary.worstZoneValue, ' vehicles'), 
            subtitle: 'Highest Density' 
          }
        ];
      
      case 'congestion':
        return [
          { 
            title: 'Average Speed', 
            value: formatValue(summary.avgSpeed, ' km/h'), 
            subtitle: 'Across all zones' 
          },
          { 
            title: 'Least Congested Zone', 
            value: formatZoneValue(summary.bestZone, summary.bestZoneValue, ' km/h'), 
            subtitle: 'Highest Speed' 
          },
          { 
            title: 'Most Congested Zone', 
            value: formatZoneValue(summary.worstZone, summary.worstZoneValue, ' km/h'), 
            subtitle: 'Lowest Speed' 
          }
        ];
      
      default: 
        return [
          { 
            title: 'Average AQI', 
            value: formatValue(summary.averageAQI), 
            subtitle: 'Overall Quality' 
          },
          { 
            title: 'Best AQI Zone', 
            value: formatZoneValue(summary.bestZone, summary.bestZoneValue), 
            subtitle: 'Cleanest Air' 
          },
          { 
            title: 'Worst AQI Zone', 
            value: formatZoneValue(summary.worstZone, summary.worstZoneValue), 
            subtitle: 'Most Polluted' 
          }
        ];
    }
  };

  const cardData = getCardData();

  return (
    <div className="results-panel">
      <div className="results-header">
        <h3>Analytics Results</h3>
        <div className="filters-summary">
          {filters.city && <span>City: {filters.city}</span>}
          {filters.timeRange && <span>Period: {filters.timeRange}</span>}
          {filters.metric && <span>Metric: {filters.metric}</span>}
          {filters.zone && <span>Zone: {filters.zone}</span>}
        </div>
      </div>

      {alerts && alerts.length > 0 && (
        <div className="alerts-container">
          <h4>⚠️ System Alerts</h4>
          {alerts.map((alert, index) => (
            <div key={index} className={`alert alert-${alert.severity}`}>
              <strong>{alert.type.toUpperCase()}:</strong> {alert.message}
            </div>
          ))}
        </div>
      )}

      <div className="results-content">
        <div className="summary-cards">
          {cardData.map((card, index) => (
            <div key={index} className="summary-card">
              <h4>{card.title}</h4>
              <div className="value">{card.value}</div>
              <span>{card.subtitle}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ResultsPanel;