const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Cache for API responses
let cache = {
  countries: null,
  populationData: null,
  flags: {},
  lastFetch: null,
};

// Cache duration (15 minutes)
const CACHE_DURATION = 15 * 60 * 1000;

const isCacheValid = () => {
  return cache.lastFetch && Date.now() - cache.lastFetch < CACHE_DURATION;
};

// Fetch and cache all data
const fetchAndCacheData = async () => {
  try {
    const [countriesRes, populationRes] = await Promise.all([
      axios.get('https://countriesnow.space/api/v0.1/countries/capital'),
      axios.get('https://countriesnow.space/api/v0.1/countries/population/cities'),
    ]);

    cache.countries = countriesRes.data.data;
    cache.populationData = populationRes.data.data;
    cache.lastFetch = Date.now();

    return true;
  } catch (error) {
    console.error('Error fetching data:', error);
    return false;
  }
};

// Endpoints
app.get('/api/countries', async (req, res) => {
  try {
    if (!isCacheValid()) {
      await fetchAndCacheData();
    }
    res.json(cache.countries);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch countries data' });
  }
});

app.get('/api/population', async (req, res) => {
  try {
    if (!isCacheValid()) {
      await fetchAndCacheData();
    }
    res.json(cache.populationData);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch population data' });
  }
});

app.post('/api/flag', async (req, res) => {
  try {
    const { country } = req.body;

    if (cache.flags[country]) {
      return res.json({ flag: cache.flags[country] });
    }

    const response = await axios.post('https://countriesnow.space/api/v0.1/countries/flag/images', {
      country,
    });

    if (response.data && response.data.data && response.data.data.flag) {
      cache.flags[country] = response.data.data.flag;
      return res.json({ flag: response.data.data.flag });
    } else {
      console.error('Invalid flag response:', response.data);
      throw new Error('Invalid flag response');
    }
  } catch (error) {
    console.error('Error fetching flag:', error.message);
    res.status(500).json({ flag: '/placeholder.png' }); // Provide a placeholder URL if the flag fetch fails
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  // Initial data fetch
  fetchAndCacheData();
});
