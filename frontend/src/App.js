import Upload from './components/Upload';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

const App = () => {
  return (
    <div>
      <Router>
        <Routes>
          <Route exact path="/upload" element={<Upload/>} />
        </Routes>
      </Router>
    </div>
  )
}

export default App;