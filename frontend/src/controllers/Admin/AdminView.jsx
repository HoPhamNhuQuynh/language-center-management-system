import { useNavigate } from 'react-router-dom';
import { 
  BookOutlined, 
  UserOutlined, 
  DollarOutlined, 
  SettingOutlined,
  CalendarOutlined 
} from '@ant-design/icons';
import '../../styles/Admin.css'; 

const managementModules = [
  { id: 1, title: 'Quản lý lớp học', icon: <BookOutlined />, path: '/class-config', color: '#1890ff', desc: 'Danh sách lớp, lịch học và trạng thái.' },
  { id: 2, title: 'Quản lý khóa học', icon: <CalendarOutlined />, path: '/course-config', color: '#52c41a', desc: 'Cấu hình khóa học và học phí.' },
  { id: 3, title: 'Sắp xếp lịch dạy', icon: <UserOutlined />, path: '/student-config', color: '#722ed1', desc: 'Sắp xếp, phân công lịch giảng dạy cho giáo viên.' },
  { id: 4, title: 'Quản lý học phí', icon: <DollarOutlined />, path: 'fee-config', color: '#faad14', desc: 'Theo dõi thanh toán và công nợ.' },
  { id: 5, title: 'Cấu hình hệ thống', icon: <SettingOutlined />, path: '/account-config', color: '#f5222d', desc: 'Cài đặt chung và phân quyền tài khoản.' },
];

const AdminView = () => {
  const navigate = useNavigate();

  return (
    <div className="admin-container">
      <h2 className="admin-title">Quản trị hệ thống</h2>
      
      <div className="admin-grid">
        {managementModules.map((item) => (
          <div 
            key={item.id}
            className="admin-card"
            style={{ borderTopColor: item.color }} 
            onClick={() => navigate(item.path)}
          >
            <div className="admin-card-icon" style={{ color: item.color }}>
              {item.icon}
            </div>
            <h3 className="admin-card-title">{item.title}</h3>
            <p className="admin-card-desc">{item.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminView;