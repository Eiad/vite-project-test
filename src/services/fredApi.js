import axios from 'axios';

const API_KEY = 'b5012636c81dde3475ff4c99dba14ec9';

export const getFredSeriesData = async (seriesId) => {
  try {
    const response = await axios.get(`/api/fred/series/observations`, {
      params: {
        series_id: seriesId,
        api_key: API_KEY,
        file_type: 'json',
        observation_end: new Date().toISOString().split('T')[0], 
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching FRED series data:', error);
    throw new Error(`Error fetching FRED series data: ${error.message}`);
  }
};

export const searchFredSeries = async (searchTerm) => {
  try {
    const response = await axios.get(`/api/fred/series/search`, {
      params: {
        search_text: searchTerm,
        api_key: API_KEY,
        file_type: 'json',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error searching FRED series:', error);
    throw new Error(`Error searching FRED series: ${error.message}`);
  }
};

export const getFredSeriesMetadata = async (seriesId) => {
  try {
    const response = await axios.get(`/api/fred/series`, {
      params: {
        series_id: seriesId,
        api_key: API_KEY,
        file_type: 'json',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching FRED series metadata:', error);
    throw new Error(`Error fetching FRED series metadata: ${error.message}`);
  }
};