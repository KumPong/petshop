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
import Inventory from './pages/Staff/inventory.jsx';
import OrderManage from './pages/Staff/orderManage.jsx';
import OrderVerify from './pages/Staff/orderVerify.jsx';
import RestockOrder from './pages/Manager/restockOrder.jsx';
import ProductListing from './pages/Customer/productListing.jsx';
import ProductDetail from './pages/Customer/productDetail.jsx';
import Payment from './pages/Customer/payment.jsx';
import Confirmation from './pages/Customer/confirmation.jsx';
import Tracking from './pages/Customer/tracking.jsx';
import ProtectedRoute from './components/protectedRoute';
import Login from './pages/login';
import Register from './pages/register';
import Profile from './pages/Customer/profile';
import Address from './pages/Customer/address';
import OrderHistory from './pages/Customer/orderHistory';
import ChangePassword from './pages/Customer/changePassword';
import ManageUsers from './pages/Manager/manageUsers.jsx';
import Report from './pages/Manager/report.jsx';
import ProductManagement from './pages/Manager/productManagement.jsx';

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

        <Route element={<ProtectedRoute allowedRoles={['Customer']}/>}>
          <Route path='/payment' element={<Payment />} />
          <Route path='/confirmation/:orderId' element={<Confirmation />} />
          <Route path='/tracking' element={<Tracking />} />
          <Route path='/tracking/:orderId' element={<Tracking />} />
          <Route path='/profile' element={<Profile />} />
          <Route path='/address' element={<Address />} />
          <Route path='/orders' element={<OrderHistory />} />
          <Route path='/change-password' element={<ChangePassword />} />
        </Route>
      </Route>

      {/* ของ Staff */}
      <Route path='/staff' element={
        <ProtectedRoute allowedRoles={['Staff']}>
          <StaffLayout />
        </ProtectedRoute>
      }>
        <Route index element={<StaffDashBoard />} />
        <Route path='inventory' element={<Inventory />} />
        <Route path='orders' element={<OrderManage />} />
        <Route path='orders/:id' element={<OrderVerify />} />
      </Route>

      {/* ของ Manager */}
      <Route path='/manager' element={
        <ProtectedRoute allowedRoles={['Manager']}>
          <ManagerLayout />
        </ProtectedRoute>
      }>
        <Route index element={<ManagerDashboard />} />
        <Route path='suppliers' element={<RestockOrder />} />
        <Route path='users' element={<ManageUsers />} />
        <Route path='reports' element={<Report />} />
        <Route path='products' element={<ProductManagement />} />
      </Route>
    </Routes>
  )
}

export default App
