import './App.css';
import 'chart.js/auto';
import { Chart } from 'react-chartjs-2';
import React, { useEffect, useState } from 'react';

function groupBy(xs, key) {
  return xs.reduce(function(rv, x) {
    (rv[x[key]] = rv[x[key]] || []).push(x);
    return rv;
  }, {});
};

function parseFileToObjects(file) {
  return file.split('\n')
  .filter(entry => entry.length > 0)
  .map(entry => JSON.parse(entry));
}

function buildChartData(chart) {
  const chartData = [];
  const chartLabels = [];
  
  for (const date in chart) {
    chartData.push({
      label: 'members in',
      data: chart[date].map(item => {
        if (chartLabels.indexOf(item.time) === -1) {
          chartLabels.push(item.time);
        }
        return {
          x: item.time,
          y: parseInt(item.in),
        }
      })
    });
  }

  return {
    data: chartData,
    labels: chartLabels.sort(),
  }
}

function App() {
  const [loading, setLoading] = useState(true);
  const [capacity, setCapacity] = useState([]);
  
  const getCapacity = async () => {
    setLoading(true);

    const fileData = await fetch('data.csv').then(response => response.text());
    const chart = groupBy(parseFileToObjects(fileData), 'date');
    setCapacity(buildChartData(chart));

    setLoading(false);
  };
  useEffect(() => {
    getCapacity();
  }, []);
  
  if (loading) {
    return <div>Loading...</div>;
  }
  
  return (
    <div className="App">
    <header className="App-header">
    <Chart type='line' data={{
      labels: capacity.labels,
      datasets: capacity.data
    }} />
    </header>
    </div>
    );
  }
  
  export default App;
