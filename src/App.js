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
  const chartLabels = new Set();
  
  for (const date in chart) {
    chartData.push({
      label: date,
      data: chart[date].map(item => {
        chartLabels.add(item.time);
        return parseInt(item.in) === 0 ? {} : {
          x: item.time,
          y: parseInt(item.in),
        }
      })
    });
  }

  return {
    datasets: chartData,
    labels: [...chartLabels].sort(),
  }
}

function App() {
  const [loading, setLoading] = useState(true);
  const [capacity, setCapacity] = useState([]);
  
  const getCapacity = async () => {
    setLoading(true);    
    const fileData = await fetch('data.csv')
      .then(response => response.text())
      .then(text => parseFileToObjects(text));
    const chart = groupBy(fileData, 'date');
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
    <Chart 
    type='line' 
    data={capacity}
    options= {{
      plugins: {
        title: {
          display: true,
          text: 'Gym capacity'
        },
        tooltip: {
          callbacks: {
            label: (context) => `IN: ${context.parsed.y}` 
          }
        }
      }
    }}
    />
    </header>
    </div>
    );
  }
  
  export default App;
