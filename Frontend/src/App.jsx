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
import Inventory from './pages/inventory.jsx';
import RestockOrder from './pages/Manager/restockOrder.jsx';
import ProductListing from './pages/Customer/productListing.jsx';
import ProductDetail from './pages/Customer/productDetail.jsx';

function App() {
  return (
    <Routes>
      {/* ของ Customer */}
      <Route element={<CustomerLayout />}>
        <Route path='/' element={<CustomerDashboard />} />
        <Route path='/products' element={<ProductListing />} />
        <Route path='/products/:id' element={<ProductDetail />} />
        {/* หน้าอื่นๆ ของลูกค้าในอนาคต เช่น /shop, /cart ก็ใส่ในนี้ได้เลย */}
      </Route> {/* <--- เติมปิดตรงนี้ครับ */}

      {/* ของ Staff */}
      <Route path='/staff' element={<StaffLayout />}>
        <Route index element={<StaffDashBoard />} />
        <Route path='inventory' element={<Inventory />} />
        {/* หน้าอื่นๆ ของstaff เช่น /staff/tasks, /staff/schedule ก็ใส่ในนี้ได้เลย */}
      </Route>

      {/* ของ Manager */}
      <Route path='/manager' element={<ManagerLayout />}>
        <Route index element={<ManagerDashboard />} />
        <Route path='inventory' element={<RestockOrder />} />
        {/* หน้าอื่นๆ ของmanager เช่น /manager/reports ก็ใส่ในนี้ได้เลย */}
      </Route>
    </Routes>
  )
}

export default App