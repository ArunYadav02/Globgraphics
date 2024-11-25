import React from 'react';
import { Bar } from 'react-chartjs-2';
import Chart from 'chart.js/auto';

const ChartComponent = ({ populationData }) => {
  const labels = populationData.map((city) => city?.city || 'Unknown');
  const populations = populationData.map(
    (city) => city?.populationCounts?.slice(-1)[0]?.value || 0
  );

  const data = {
    labels,
    datasets: [
      {
        label: 'Population',
        data: populations,
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      },
    ],
  };

  return <Bar data={data} />;
};

export default ChartComponent;
