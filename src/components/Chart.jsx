import { useState, useEffect } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, AreaChart, Area } from 'recharts';
import { getFredSeriesData } from '../services/fredApi';
import PropTypes from 'prop-types';

const Chart = ({ id, config, removeChart, updateChartConfig }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!config.seriesId) {
        setError('No series ID provided.');
        return;
      }

      setLoading(true);
      try {
        const seriesData = await getFredSeriesData(config.seriesId);
        if (seriesData && seriesData.observations) {
          setData(seriesData.observations.map(obs => ({
            date: obs.date,
            value: parseFloat(obs.value) || 0,
          })));
          setError(null);
        } else {
          setError('No data available for this series.');
        }
      } catch (err) {
        setError(`Error loading chart data: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [config.seriesId]);

  const handleConfigChange = (key, value) => {
    updateChartConfig(id, { ...config, [key]: value });
  };

  const renderChart = () => {
    switch (config.type) {
      case 'line':
        return (
          <LineChart width={500} height={300} data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis label={{ value: config.yAxisLabel, angle: -90, position: 'insideLeft' }} />
            <Tooltip />
            <Legend />
            <Line type={config.lineStyle || 'monotone'} dataKey="value" stroke={config.color || "#8884d8"} />
          </LineChart>
        );
      case 'bar':
        return (
          <BarChart width={500} height={300} data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis label={{ value: config.yAxisLabel, angle: -90, position: 'insideLeft' }} />
            <Tooltip />
            <Legend />
            <Bar dataKey="value" fill={config.color || "#8884d8"} />
          </BarChart>
        );
      case 'area':
      default:
        return (
          <AreaChart width={500} height={300} data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis label={{ value: config.yAxisLabel, angle: -90, position: 'insideLeft' }} />
            <Tooltip />
            <Legend />
            <Area type={config.lineStyle || 'monotone'} dataKey="value" stroke={config.color || "#8884d8"} fill={config.color || "#8884d8"} />
          </AreaChart>
        );
    }
  };

  return (
    <div>
      <h2>
        <input
          type="text"
          value={config.title || 'Chart Title'}
          onChange={(e) => handleConfigChange('title', e.target.value)}
          placeholder="Enter chart title"
        />
      </h2>
      <label>Series ID:</label>
      <input
        type="text"
        placeholder="Enter series ID"
        value={config.seriesId || ''}
        onChange={(e) => handleConfigChange('seriesId', e.target.value)}
        style={{ marginBottom: '10px', padding: '5px' }}
      />
      <label>Chart Type:</label>
      <select
        value={config.type}
        onChange={(e) => handleConfigChange('type', e.target.value)}
      >
        <option value="line">Line</option>
        <option value="bar">Bar</option>
        <option value="pie">Pie</option>
        <option value="radar">Radar</option>
        <option value="scatter">Scatter</option>
        <option value="area">Area</option>
        <option value="composed">Composed</option>
        <option value="radialBar">Radial Bar</option>
        <option value="treemap">Treemap</option>
      </select>
      <label>Color:</label>
      <input
        type="color"
        value={config.color || '#8884d8'}
        onChange={(e) => handleConfigChange('color', e.target.value)}
      />
      <label>Line Style:</label>
      <select
        value={config.lineStyle || 'monotone'}
        onChange={(e) => handleConfigChange('lineStyle', e.target.value)}
      >
        <option value="monotone">Monotone</option>
        <option value="linear">Linear</option>
        <option value="step">Step</option>
      </select>
      <label>Y-Axis Label:</label>
      <input
        type="text"
        placeholder="Y-Axis Label"
        value={config.yAxisLabel || ''}
        onChange={(e) => handleConfigChange('yAxisLabel', e.target.value)}
      />
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {loading ? <p>Loading...</p> : data.length > 0 ? renderChart() : <p>No data available</p>}
      <button onClick={() => removeChart(id)}>Remove Chart</button>
    </div>
  );
};

Chart.propTypes = {
  id: PropTypes.string.isRequired,
  config: PropTypes.shape({
    seriesId: PropTypes.string,
    type: PropTypes.oneOf(['line', 'bar', 'pie', 'radar', 'scatter', 'area', 'composed', 'radialBar', 'treemap']).isRequired,
    title: PropTypes.string,
    color: PropTypes.string,
    lineStyle: PropTypes.oneOf(['monotone', 'linear', 'step']),
    yAxisLabel: PropTypes.string,
  }).isRequired,
  removeChart: PropTypes.func.isRequired,
  updateChartConfig: PropTypes.func.isRequired,
};

export default Chart;
