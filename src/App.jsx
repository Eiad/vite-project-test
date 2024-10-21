import { useState } from 'react';
import ChartManager from './components/ChartManager';
import Loader from './components/Loader';

const App = () => {
  const [isLoading, setIsLoading] = useState(false);

  return (
    <div className="app-container">
      {isLoading && <Loader />}
      <header className="app-header">
        <h1>FRED Data Visualizer</h1>
        <p className="app-description">
          Explore U.S. economic data from the Federal Reserve Economic Data (FRED). 
          Search for data series and visualize them instantly.
        </p>
      </header>
      <main className={`app-main ${isLoading ? 'loading' : ''}`}>
        <ChartManager setIsLoading={setIsLoading} />
      </main>
      <footer className="app-footer">
        <p>&copy; {new Date().getFullYear()} All rights reserved.</p>
      </footer>
    </div>
  );
};

export default App;
