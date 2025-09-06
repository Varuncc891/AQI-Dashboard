const pool = require('../config/database');

function normalizeFilters(filters) {
  const normalized = { ...filters };

  if (normalized.city) {
    normalized.city = normalized.city.trim().toLowerCase();
  }

  if (normalized.zone === 'mixed') normalized.zone = 'mixed_use';
  if (normalized.weather === 'sunny') normalized.weather = 'clear';

  return normalized;
}

const getAnalytics = async (req, res) => {
  try {
    const filters = normalizeFilters({ ...req.query, ...req.body });
    const {
      city,
      timeRange = '7d',
      metric = 'aqi',
      zone = 'all',
      dailyPattern = 'all',
      season = 'all',
      weather = 'all',
      sensorStatus = 'all',
    } = filters;

    let whereClause = 'WHERE 1=1';
    const params = [];
    let i = 1;

    if (city) {
      whereClause += ` AND LOWER(c.name) = $${i++}`;
      params.push(city);
    }
    if (zone !== 'all') {
      whereClause += ` AND z.zone_type = $${i++}`;
      params.push(zone);
    }
    if (sensorStatus !== 'all') {
      whereClause += ` AND s.status = $${i++}`;
      params.push(sensorStatus);
    }
    if (weather !== 'all') {
      whereClause += ` AND r.weather_condition = $${i++}`;
      params.push(weather);
    }

    const referenceDate = "2025-09-01";
    const ranges = {
      '1d': "1 DAY",
      '7d': "7 DAYS",
      '30d': "30 DAYS",
    };
    const interval = ranges[timeRange] || "7 DAYS";
    whereClause += ` AND r.timestamp >= DATE '${referenceDate}' - INTERVAL '${interval}'`;

    if (dailyPattern !== 'all') {
      if (dailyPattern === 'morning') whereClause += ` AND EXTRACT(HOUR FROM r.timestamp) BETWEEN 7 AND 10`;
      if (dailyPattern === 'midday') whereClause += ` AND EXTRACT(HOUR FROM r.timestamp) BETWEEN 10 AND 16`;
      if (dailyPattern === 'evening') whereClause += ` AND EXTRACT(HOUR FROM r.timestamp) BETWEEN 16 AND 19`;
      if (dailyPattern === 'night') whereClause += ` AND (EXTRACT(HOUR FROM r.timestamp) BETWEEN 20 AND 23 OR EXTRACT(HOUR FROM r.timestamp) BETWEEN 0 AND 6)`;
    }

    const baseSummaryQuery = `
      SELECT
        ROUND(AVG(r.aqi_value)::numeric, 1) AS average_aqi,
        COALESCE(SUM(r.vehicle_count), 0) AS total_vehicles,
        COUNT(DISTINCT s.sensor_id) FILTER (WHERE s.status='active') AS active_sensors,
        COUNT(r.reading_id) AS data_points
      FROM readings r
      JOIN sensors s ON r.sensor_id = s.sensor_id
      JOIN zones z ON s.zone_id = z.zone_id
      JOIN cities c ON z.city_id = c.city_id
      ${whereClause}
    `;

    let summary = {};
    const baseResult = await pool.query(baseSummaryQuery, params);
    const baseRow = baseResult.rows[0] || {};
    
    summary.averageAQI = baseRow.average_aqi || 0;
    summary.totalVehicles = baseRow.total_vehicles || 0;
    summary.activeSensors = baseRow.active_sensors || 0;
    summary.dataPoints = baseRow.data_points || 0;

    switch (metric) {
      case 'pm25':
        const avgPm25Result = await pool.query(`
          SELECT ROUND(AVG(r.pm25)::numeric, 1) AS avg_pm25
          FROM readings r
          JOIN sensors s ON r.sensor_id = s.sensor_id
          JOIN zones z ON s.zone_id = z.zone_id
          JOIN cities c ON z.city_id = c.city_id
          ${whereClause}
          AND r.pm25 IS NOT NULL AND r.pm25 > 0
        `, params);
        
        const bestPm25Result = await pool.query(`
          SELECT z.name, ROUND(AVG(r.pm25)::numeric, 1) AS avg_value
          FROM readings r
          JOIN sensors s ON r.sensor_id = s.sensor_id
          JOIN zones z ON s.zone_id = z.zone_id
          JOIN cities c ON z.city_id = c.city_id
          ${whereClause}
          AND r.pm25 IS NOT NULL AND r.pm25 > 0
          GROUP BY z.zone_id, z.name
          HAVING COUNT(r.reading_id) > 0
          ORDER BY avg_value ASC
          LIMIT 1
        `, params);
        
        const worstPm25Result = await pool.query(`
          SELECT z.name, ROUND(AVG(r.pm25)::numeric, 1) AS avg_value
          FROM readings r
          JOIN sensors s ON r.sensor_id = s.sensor_id
          JOIN zones z ON s.zone_id = z.zone_id
          JOIN cities c ON z.city_id = c.city_id
          ${whereClause}
          AND r.pm25 IS NOT NULL AND r.pm25 > 0
          GROUP BY z.zone_id, z.name
          HAVING COUNT(r.reading_id) > 0
          ORDER BY avg_value DESC
          LIMIT 1
        `, params);
        
        summary.pm25Value = avgPm25Result.rows[0]?.avg_pm25 || 0;
        summary.bestZone = bestPm25Result.rows[0]?.name || 'No data';
        summary.bestZoneValue = bestPm25Result.rows[0]?.avg_value || 0;
        summary.worstZone = worstPm25Result.rows[0]?.name || 'No data';
        summary.worstZoneValue = worstPm25Result.rows[0]?.avg_value || 0;
        break;

      case 'traffic':
        const avgTrafficResult = await pool.query(`
          SELECT ROUND(AVG(r.vehicle_count)::numeric, 1) AS avg_vehicles
          FROM readings r
          JOIN sensors s ON r.sensor_id = s.sensor_id
          JOIN zones z ON s.zone_id = z.zone_id
          JOIN cities c ON z.city_id = c.city_id
          ${whereClause}
          AND r.vehicle_count IS NOT NULL AND r.vehicle_count > 0
        `, params);
        
        const bestTrafficResult = await pool.query(`
          SELECT z.name, ROUND(AVG(r.vehicle_count)::numeric, 1) AS avg_value
          FROM readings r
          JOIN sensors s ON r.sensor_id = s.sensor_id
          JOIN zones z ON s.zone_id = z.zone_id
          JOIN cities c ON z.city_id = c.city_id
          ${whereClause}
          AND r.vehicle_count IS NOT NULL AND r.vehicle_count > 0
          GROUP BY z.zone_id, z.name
          HAVING COUNT(r.reading_id) > 0
          ORDER BY avg_value ASC
          LIMIT 1
        `, params);
        
        const worstTrafficResult = await pool.query(`
          SELECT z.name, ROUND(AVG(r.vehicle_count)::numeric, 1) AS avg_value
          FROM readings r
          JOIN sensors s ON r.sensor_id = s.sensor_id
          JOIN zones z ON s.zone_id = z.zone_id
          JOIN cities c ON z.city_id = c.city_id
          ${whereClause}
          AND r.vehicle_count IS NOT NULL AND r.vehicle_count > 0
          GROUP BY z.zone_id, z.name
          HAVING COUNT(r.reading_id) > 0
          ORDER BY avg_value DESC
          LIMIT 1
        `, params);
        
        summary.avgVehicles = avgTrafficResult.rows[0]?.avg_vehicles || 0;
        summary.bestZone = bestTrafficResult.rows[0]?.name || 'No data';
        summary.bestZoneValue = bestTrafficResult.rows[0]?.avg_value || 0;
        summary.worstZone = worstTrafficResult.rows[0]?.name || 'No data';
        summary.worstZoneValue = worstTrafficResult.rows[0]?.avg_value || 0;
        break;

      case 'congestion':
        const avgSpeedResult = await pool.query(`
          SELECT ROUND(AVG(r.avg_speed_kmh)::numeric, 1) AS avg_speed
          FROM readings r
          JOIN sensors s ON r.sensor_id = s.sensor_id
          JOIN zones z ON s.zone_id = z.zone_id
          JOIN cities c ON z.city_id = c.city_id
          ${whereClause}
          AND r.avg_speed_kmh IS NOT NULL AND r.avg_speed_kmh > 0
        `, params);
        
        const bestCongestionResult = await pool.query(`
          SELECT z.name, ROUND(AVG(r.avg_speed_kmh)::numeric, 1) AS avg_value
          FROM readings r
          JOIN sensors s ON r.sensor_id = s.sensor_id
          JOIN zones z ON s.zone_id = z.zone_id
          JOIN cities c ON z.city_id = c.city_id
          ${whereClause}
          AND r.avg_speed_kmh IS NOT NULL AND r.avg_speed_kmh > 0
          GROUP BY z.zone_id, z.name
          HAVING COUNT(r.reading_id) > 0
          ORDER BY avg_value DESC
          LIMIT 1
        `, params);
        
        const worstCongestionResult = await pool.query(`
          SELECT z.name, ROUND(AVG(r.avg_speed_kmh)::numeric, 1) AS avg_value
          FROM readings r
          JOIN sensors s ON r.sensor_id = s.sensor_id
          JOIN zones z ON s.zone_id = z.zone_id
          JOIN cities c ON z.city_id = c.city_id
          ${whereClause}
          AND r.avg_speed_kmh IS NOT NULL AND r.avg_speed_kmh > 0
          GROUP BY z.zone_id, z.name
          HAVING COUNT(r.reading_id) > 0
          ORDER BY avg_value ASC
          LIMIT 1
        `, params);
        
        summary.avgSpeed = avgSpeedResult.rows[0]?.avg_speed || 0;
        summary.bestZone = bestCongestionResult.rows[0]?.name || 'No data';
        summary.bestZoneValue = bestCongestionResult.rows[0]?.avg_value || 0;
        summary.worstZone = worstCongestionResult.rows[0]?.name || 'No data';
        summary.worstZoneValue = worstCongestionResult.rows[0]?.avg_value || 0;
        break;

      default: 
        const bestAqiResult = await pool.query(`
          SELECT z.name, ROUND(AVG(r.aqi_value)::numeric, 1) AS avg_value
          FROM readings r
          JOIN sensors s ON r.sensor_id = s.sensor_id
          JOIN zones z ON s.zone_id = z.zone_id
          JOIN cities c ON z.city_id = c.city_id
          ${whereClause}
          AND r.aqi_value IS NOT NULL AND r.aqi_value > 0
          GROUP BY z.zone_id, z.name
          HAVING COUNT(r.reading_id) > 0
          ORDER BY avg_value ASC
          LIMIT 1
        `, params);
        
        const worstAqiResult = await pool.query(`
          SELECT z.name, ROUND(AVG(r.aqi_value)::numeric, 1) AS avg_value
          FROM readings r
          JOIN sensors s ON r.sensor_id = s.sensor_id
          JOIN zones z ON s.zone_id = z.zone_id
          JOIN cities c ON z.city_id = c.city_id
          ${whereClause}
          AND r.aqi_value IS NOT NULL AND r.aqi_value > 0
          GROUP BY z.zone_id, z.name
          HAVING COUNT(r.reading_id) > 0
          ORDER BY avg_value DESC
          LIMIT 1
        `, params);
        
        summary.bestZone = bestAqiResult.rows[0]?.name || 'No data';
        summary.bestZoneValue = bestAqiResult.rows[0]?.avg_value || 0;
        summary.worstZone = worstAqiResult.rows[0]?.name || 'No data';
        summary.worstZoneValue = worstAqiResult.rows[0]?.avg_value || 0;
    }

    let bucket = 'hour';
    if (timeRange === '7d' || timeRange === '30d') bucket = 'day';
    if (timeRange === '90d') bucket = 'week';

    const metricColumn =
      metric === 'pm25' ? 'r.pm25'
      : metric === 'traffic' ? 'r.vehicle_count'
      : metric === 'emissions' ? 'r.co2_ppm'
      : metric === 'congestion' ? 'r.avg_speed_kmh'
      : 'r.aqi_value';

    const chartQuery = `
      SELECT DATE_TRUNC('${bucket}', r.timestamp) AS bucket,
             ROUND(AVG(${metricColumn})::numeric, 1) AS value
      FROM readings r
      JOIN sensors s ON r.sensor_id = s.sensor_id
      JOIN zones z ON s.zone_id = z.zone_id
      JOIN cities c ON z.city_id = c.city_id
      ${whereClause}
      GROUP BY bucket
      ORDER BY bucket
      LIMIT 100
    `;

    const chartRes = await pool.query(chartQuery, params);
    const chartsData = chartRes.rows.map(r => ({
      time: r.bucket,
      value: r.value,
    }));

    const alerts = [];
    if (summary.averageAQI > 200) alerts.push({ type: 'pollution', severity: 'critical', message: 'AQI above 200' });
    else if (summary.averageAQI > 150) alerts.push({ type: 'pollution', severity: 'high', message: 'AQI above 150' });

    if (summary.activeSensors < 5) alerts.push({ type: 'sensors', severity: 'warning', message: 'Too few active sensors' });

    res.json({ summary, chartsData, alerts });
  } catch (err) {
    console.error('Error in getAnalytics:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = { getAnalytics };