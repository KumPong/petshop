import { BrowserRouter, Routes, Route} from 'react-router-dom'
import Dashboard from './pages/dashboard.jsx'

function App() {
  return (
    <BrowserRouter>
        <div>
          <nav>
            <Routes>
              <Route path='/dashboard' element={<Dashboard />}/>
            </Routes>
          </nav>
        </div>
      </BrowserRouter>
  )
}

export default App
