import { useState, useEffect } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, AreaChart, Area, ResponsiveContainer } from 'recharts';
import { getFredSeriesData, getFredSeriesMetadata } from '../services/fredApi'; 
import PropTypes from 'prop-types';

const chartTheme = {
  lineColor: "#6366f1",
  barColor: "#4f46e5", 
  areaColor: "#10b981",
  axisColor: "#1f2937",
  gridColor: "#e5e7eb",
  tooltipBgColor: "#ffffff",
  tooltipTextColor: "#1f2937",
};

const ChartPreview = ({ chart, onEdit, onRemove }) => {
  const [data, setData] = useState([]);
  const [metadata, setMetadata] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const seriesData = await getFredSeriesData(chart.seriesId);
        const seriesMetadata = await getFredSeriesMetadata(chart.seriesId);

        if (seriesData && seriesData.observations) {
          setData(seriesData.observations.map(obs => ({
            date: obs.date,
            value: parseFloat(obs.value) || 0,
          })));
        } else {
          setError('No data available for this series.');
        }

        if (seriesMetadata && seriesMetadata.seriess.length > 0) {
          setMetadata(seriesMetadata.seriess[0]);
        }
      } catch (err) {
        setError(`Error loading chart data: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [chart.seriesId]);

  if (loading) return <p className='text-center loading-text'>Loading...</p>;
  if (error) return <div>{error}</div>;

  const renderChart = () => {
    switch (chart.type) {
      case 'line':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={data}>
              <CartesianGrid stroke={chartTheme.gridColor} />
              <XAxis dataKey="date" stroke={chartTheme.axisColor} />
              <YAxis label={{ value: chart.yAxisLabel, angle: -90, position: 'insideLeft', fill: chartTheme.axisColor }} />
              <Tooltip contentStyle={{ backgroundColor: chartTheme.tooltipBgColor, color: chartTheme.tooltipTextColor }} />
              <Legend />
              <Line type={chart.lineStyle || 'monotone'} dataKey="value" stroke={chart.color || chartTheme.lineColor} />
            </LineChart>
          </ResponsiveContainer>
        );
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={data}>
              <CartesianGrid stroke={chartTheme.gridColor} />
              <XAxis dataKey="date" stroke={chartTheme.axisColor} />
              <YAxis label={{ value: chart.yAxisLabel, angle: -90, position: 'insideLeft', fill: chartTheme.axisColor }} />
              <Tooltip contentStyle={{ backgroundColor: chartTheme.tooltipBgColor, color: chartTheme.tooltipTextColor }} />
              <Legend />
              <Bar dataKey="value" fill={chart.color || chartTheme.barColor} />
            </BarChart>
          </ResponsiveContainer>
        );
      case 'area':
      default:
        return (
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart data={data}>
              <CartesianGrid stroke={chartTheme.gridColor} />
              <XAxis dataKey="date" stroke={chartTheme.axisColor} />
              <YAxis label={{ value: chart.yAxisLabel, angle: -90, position: 'insideLeft', fill: chartTheme.axisColor }} />
              <Tooltip contentStyle={{ backgroundColor: chartTheme.tooltipBgColor, color: chartTheme.tooltipTextColor }} />
              <Legend />
              <Area type={chart.lineStyle || 'monotone'} dataKey="value" stroke={chart.color || chartTheme.areaColor} fill={chart.color || chartTheme.areaColor} />
            </AreaChart>
          </ResponsiveContainer>
        );
    }
  };

  return (
    <div className="chart-preview">
      <div className="chart-info">
        <h3>{chart.title || (metadata ? metadata.title : 'Untitled Chart')}</h3>
        <p>Series ID: {chart.seriesId}</p>
        <p>Units: {metadata ? metadata.units : 'Loading...'}</p>
        <p>Frequency: {metadata ? metadata.frequency : 'Loading...'}</p>
        <p>Last Updated: {metadata ? metadata.last_updated : 'Loading...'}</p>
        <div className="button-group">
          <button className="edit-btn" onClick={() => onEdit(chart)}>Edit</button>
          <button className="remove-btn" onClick={() => onRemove(chart.id)}>Remove</button>
        </div>
      </div>        
      <div className="chart-container">
        {renderChart()}
      </div>
    </div>
  );
};

ChartPreview.propTypes = {
  chart: PropTypes.shape({
    id: PropTypes.string.isRequired,
    seriesId: PropTypes.string.isRequired,
    type: PropTypes.oneOf(['bar', 'line', 'area']).isRequired,
    title: PropTypes.string.isRequired,
    yAxisLabel: PropTypes.string,
    lineStyle: PropTypes.string,
    color: PropTypes.string,
    additionalInfo: PropTypes.string,
  }).isRequired,
  onEdit: PropTypes.func.isRequired,
  onRemove: PropTypes.func.isRequired,
};

export default ChartPreview;
