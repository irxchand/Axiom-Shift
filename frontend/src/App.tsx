import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import './App.css';

function CommandCenter() {
  return (
    <div>
      <h2>Command Center Dashboard</h2>
      <p>Welcome to Semester Operations. Content goes here.</p>
    </div>
  );
}

function Timetable() {
  return (
    <div>
      <h2>Timetable</h2>
      <p>Weekly timetable and current/next class will go here.</p>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <div className="App">
        <header>
          <h1>Semester Operations Command Center</h1>
          <nav style={{ display: 'flex', gap: '1rem', padding: '1rem 0' }}>
            <Link to="/">Dashboard</Link>
            <Link to="/timetable">Timetable</Link>
          </nav>
        </header>
        <main>
          <Routes>
            <Route path="/" element={<CommandCenter />} />
            <Route path="/timetable" element={<Timetable />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
