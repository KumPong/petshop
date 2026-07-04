// import libary
import { Routes, Route} from 'react-router-dom'

//import Layouts
import CustomerLayout from './layouts/customerLayout';
import ManagerLayout from './layouts/managerLayout';
import StaffLayout from './layouts/staffLayout';

// import pages
import CustomerDashboard from './pages/Customer/customerDashboard';
import ManagerDashboard from './pages/Manager/managerDashboard';
import StaffDashBoard from './pages/Staff/staffDashboard';

function App() {
  return (
    <Routes>
      {/* ของ Customer */}
      <Route element={<CustomerLayout />}>
        <Route path='/' element={<CustomerDashboard />} />
        {/* หน้าอื่นๆ ของลูกค้าในอนาคต เช่น /shop, /cart ก็ใส่ในนี้ได้เลย */}
      </Route>

      {/* ของ Staff */}
      <Route path='/staff' element={<StaffLayout />}>
        <Route index element={<StaffDashBoard />} />
        {/* หน้าอื่นๆ ของstaff เช่น /staff/tasks, /staff/schedule ก็ใส่ในนี้ได้เลย */}
      </Route>

      {/* ของ Manager */}
      <Route path='/manager' element={<ManagerLayout />}>
        <Route index element={<ManagerDashboard />} />
        {/* หน้าอื่นๆ ของmanager เช่น /manager/reports, /manager/inventory ก็ใส่ในนี้ได้เลย */}
      </Route>
    </Routes>
  )
}

export default App
