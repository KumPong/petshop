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
import ProtectedRoute from './components/protectedRoute';
import Login from './pages/login';
import Register from './pages/register';
import Profile from './pages/Customer/profile';
import Address from './pages/Customer/address';
import OrderHistory from './pages/Customer/orderHistory';
import ChangePassword from './pages/Customer/changePassword';

function App() {
  return (
    <Routes>
      {/* Login & Register */}
      <Route path='/login' element={<Login />} />
      <Route path='/register' element={<Register />} />

      {/* ของ Customer */}
      <Route element={<CustomerLayout />}>
        <Route path='/' element={<CustomerDashboard />} />
        <Route path='/products' element={<ProductListing />} />
        <Route path='/products/dogs' element={<ProductListing selectedSegment="dogs" />} />
        <Route path='/products/cats' element={<ProductListing selectedSegment="cats" />} />
        <Route path='/products/accessories' element={<ProductListing selectedSegment="accessories" />} />
        <Route path='/products/:id' element={<ProductDetail />} />
        {/* หน้าอื่นๆ ของลูกค้าในอนาคต เช่น /shop, /cart ก็ใส่ในนี้ได้เลย */}
        <Route path='/profile' element={<Profile />} />
        <Route path='/address' element={<Address />} />
        <Route path='/orders' element={<OrderHistory />} />
        <Route path='/change-password' element={<ChangePassword />} />
      </Route>

      {/* ของ Staff */}
      <Route path='/staff' element={
        <ProtectedRoute>
          <StaffLayout /> 
        </ProtectedRoute>
      }>
        <Route index element={<StaffDashBoard />} />
        <Route path='inventory' element={<Inventory />} />
        {/* หน้าอื่นๆ ของstaff เช่น /staff/tasks, /staff/schedule ก็ใส่ในนี้ได้เลย */}
      </Route>

      {/* ของ Manager */}
      <Route path='/manager' element={
        <ProtectedRoute>
          <ManagerLayout />
        </ProtectedRoute>
      }>
        <Route index element={<ManagerDashboard />} />
        <Route path='inventory' element={<RestockOrder />} />
        {/* หน้าอื่นๆ ของmanager เช่น /manager/reports ก็ใส่ในนี้ได้เลย */}
      </Route>
    </Routes>
  )
}

export default App