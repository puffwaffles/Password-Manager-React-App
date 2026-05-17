import './App.css'
import {
  BrowserRouter as Router,
  Routes,
  Route,
} from 'react-router-dom';
import Home from './pages/home.jsx';
import Prompt from './pages/prompt.jsx';
import Login from './pages/login.jsx';
import Database from './pages/database.jsx';

function App() {

  return (
    <Router>
      <Routes>
        <Route path = '/' element = {<Home />} />
        <Route path = '/prompt_database' element = {<Prompt />} />
        <Route path = '/login/:databasename' element = {<Login />} />
        <Route path = '/database/:databasename' element = {<Database />} />
      </Routes>
    </Router>
  )
}

export default App
