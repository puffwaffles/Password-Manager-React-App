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
import Entry from './pages/entry.jsx';
import Editentry from './pages/editentry.jsx';
import Copy from './pages/copy.jsx';

function App() {

  return (
    <Router>
      <Routes>
        <Route path = '/' element = {<Home />} />
        <Route path = '/prompt_database' element = {<Prompt />} />
        <Route path = '/login' element = {<Login />} />
        <Route path = '/database' element = {<Database />} />
        <Route path = '/database/entry' element = {<Entry />} />
        <Route path = '/database/editentry' element = {<Editentry />} />
        <Route path = '/database/copy' element = {<Copy />} />
      </Routes>
    </Router>
  )
}

export default App
