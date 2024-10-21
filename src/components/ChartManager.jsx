import { useState } from 'react';
import SearchBar from './SearchBar';
import ChartPreview from './ChartPreview';
import ChartEditModal from './ChartEditModal';
import Loader from './Loader';
import { searchFredSeries, getFredSeriesData } from '../services/fredApi';
import { v4 as uuidv4 } from 'uuid';

const SESSION_STORAGE_KEY = 'fredCharts';

const getChartsFromSessionStorage = () => {
  const storedCharts = sessionStorage.getItem(SESSION_STORAGE_KEY);
  return storedCharts ? JSON.parse(storedCharts) : [];
};

const saveChartsToSessionStorage = (charts) => {
  sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(charts));
};

const ChartManager = () => {
  const [charts, setCharts] = useState(getChartsFromSessionStorage());
  const [selectedChart, setSelectedChart] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const updateCharts = (newCharts) => {
    setCharts(newCharts);
    saveChartsToSessionStorage(newCharts);
  };

  const handleSearch = async (searchTerm) => {
    if (searchTerm) {
      setIsLoading(true);
      try {
        const results = await searchFredSeries(searchTerm);
        if (results && results.seriess && results.seriess.length > 0) {
          const firstResult = results.seriess[0];
          await addChart(firstResult);
        } else {
          console.warn('No series found for the given search term');
        }
      } catch (error) {
        console.error('Error searching for series:', error);
        alert(`Error searching for series: ${error.message}`);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const addChart = async (seriesInfo) => {
    setIsLoading(true);
    try {
      const seriesData = await getFredSeriesData(seriesInfo.id);
      if (seriesData && seriesData.observations) {
        const newChart = {
          id: uuidv4(),
          seriesId: seriesInfo.id,
          title: seriesInfo.title,
          type: 'area',
          data: seriesData.observations.map(obs => ({
            date: obs.date,
            value: parseFloat(obs.value) || 0,
          })),
        };
        updateCharts([...charts, newChart]);
      } else {
        throw new Error('No data available for this series.');
      }
    } catch (error) {
      console.error('Error adding chart:', error);
      alert(`Error adding chart: ${error.message}. Please try again.`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditChart = (chart) => {
    setSelectedChart(chart);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedChart(null);
  };

  const handleUpdateChart = async (updatedConfig) => {
    setIsLoading(true);
    try {
      if (updatedConfig.seriesId !== selectedChart.seriesId) {
        const seriesData = await getFredSeriesData(updatedConfig.seriesId);
        if (seriesData && seriesData.observations) {
          const newChart = {
            ...updatedConfig,
            id: selectedChart.id,
            data: seriesData.observations.map(obs => ({
              date: obs.date,
              value: parseFloat(obs.value) || 0,
            })),
          };
          updateCharts(charts.map(chart =>
            chart.id === selectedChart.id ? newChart : chart
          ));
        } else {
          throw new Error('No data available for this series.');
        }
      } else {
        updateCharts(charts.map(chart =>
          chart.id === selectedChart.id ? { ...chart, ...updatedConfig } : chart
        ));
      }
      setSelectedChart(null);
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error updating chart:', error);
      alert(`Error updating chart: ${error.message}. Please try again.`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveChart = (chartId) => {
    updateCharts(charts.filter(chart => chart.id !== chartId));
  };

  return (
    <div className={`chart-manager ${isLoading ? 'loading' : ''}`}>
      {isLoading && <Loader />}
      <SearchBar onSearch={handleSearch} />
      <div className="chart-preview-grid">
        {charts.map(chart => (
          <ChartPreview
            key={chart.id}
            chart={chart}
            onEdit={() => handleEditChart(chart)}
            onRemove={() => handleRemoveChart(chart.id)}
          />
        ))}
      </div>
      {isModalOpen && (
        <ChartEditModal
          chart={selectedChart}
          onClose={handleCloseModal}
          onUpdate={handleUpdateChart}
        />
      )}
    </div>
  );
};

export default ChartManager;
