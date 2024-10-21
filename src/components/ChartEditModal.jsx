import { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { getFredSeriesData, getFredSeriesMetadata } from '../services/fredApi';

const ChartEditModal = ({ chart, onClose, onUpdate }) => {
  const [config, setConfig] = useState({
    seriesId: chart.seriesId,
    title: chart.title,
    color: chart.color || '#8884d8',
    type: chart.type || 'area', 
    yAxisLabel: chart.yAxisLabel || '',
  });
  const [newSeriesId, setNewSeriesId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadNewSeriesData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [seriesData, seriesMetadata] = await Promise.all([
        getFredSeriesData(newSeriesId),
        getFredSeriesMetadata(newSeriesId)
      ]);
      
      if (seriesData && seriesData.observations && seriesData.observations.length > 0) {
        const newTitle = seriesMetadata?.seriess[0]?.title || `Series ${newSeriesId}`;
        setConfig(prevConfig => ({
          ...prevConfig,
          seriesId: newSeriesId,
          title: newTitle,
        }));
      } else {
        setError('No data available for this series ID. Please check the ID and try again.');
      }
    } catch (err) {
      setError(`Error fetching new series data: ${err.message}. Please try again.`);
    } finally {
      setLoading(false);
    }
  }, [newSeriesId]); // Add newSeriesId as a dependency

  useEffect(() => {
    if (newSeriesId && newSeriesId !== chart.seriesId) {
      loadNewSeriesData();
    }
  }, [newSeriesId, chart.seriesId, loadNewSeriesData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setConfig(prevConfig => ({ ...prevConfig, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    onUpdate(config);
  };

  return (
    <div className="modal">
      <div className="modal-content">
        <h2>Edit Chart</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="seriesId">Replace the source series</label>
            <input
              id="seriesId"
              type="text"
              value={newSeriesId}
              onChange={(e) => setNewSeriesId(e.target.value)}
              placeholder="Enter new series ID (optional)"
            />
          </div>
          <div className="form-group">
            <label htmlFor="title">Title</label>
            <input 
              id="title" 
              type="text" 
              name="title" 
              value={config.title} 
              onChange={handleChange}
              disabled={newSeriesId && newSeriesId !== chart.seriesId}
            />
          </div>
          <div className="form-group">
            <label htmlFor="type">Chart Type</label>
            <select id="type" name="type" value={config.type} onChange={handleChange}>
              <option value="bar">Bar</option>
              <option value="line">Line</option>
              <option value="area">Area</option>
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="color">Color</label>
            <div className="color-input-group">
              <input
                id="color"
                type="color"
                name="color"
                value={config.color}
                onChange={handleChange}
              />
              <input
                type="text"
                name="colorHex"
                value={config.color}
                onChange={(e) => {
                  const newColor = e.target.value.startsWith('#') ? e.target.value : `#${e.target.value}`;
                  handleChange({ target: { name: 'color', value: newColor } });
                }}
                placeholder="#RRGGBB"
              />
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="yAxisLabel">Y-Axis Label</label>
            <input
              id="yAxisLabel"
              type="text"
              name="yAxisLabel"
              value={config.yAxisLabel || ''}
              onChange={handleChange}
              placeholder="Enter Y-axis label"
            />
          </div>
          {error && <p className="error-message">{error}</p>}
          {loading && <p>Loading new series data...</p>}
          <div className="modal-buttons">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>Update</button>
          </div>
        </form>
      </div>
    </div>
  );
};

ChartEditModal.propTypes = {
  chart: PropTypes.shape({
    id: PropTypes.string.isRequired,
    seriesId: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    color: PropTypes.string,
    type: PropTypes.oneOf(['bar', 'line', 'area']),
    yAxisLabel: PropTypes.string,
  }).isRequired,
  onClose: PropTypes.func.isRequired,
  onUpdate: PropTypes.func.isRequired,
};

export default ChartEditModal;
