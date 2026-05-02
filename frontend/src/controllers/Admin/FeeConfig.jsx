import '../../styles/FeeConfig.css';

const FeeConfiguration = () => {
  return (
    <div className="fee-config-container">
      <div className="fee-header">
        <h2>Cấu hình học phí theo khóa học</h2>
        <button className="btn-save-navy">Lưu tất cả thay đổi</button>
      </div>

      <div className="fee-table-card">
        <table>
          <thead>
            <tr>
              <th>STT</th>
              <th>Tên khóa học</th>
              <th>Cấp độ</th>
              <th>Số buổi</th>
              <th>Học phí (VNĐ)</th>
              <th>Ghi chú</th>
            </tr>
          </thead>
          <tbody>
            {[
              { id: 1, name: 'Beginner', level: 'Beginner', sessions: 45, fee: '2.500.000' },
              { id: 2, name: 'Intermediate', level: 'Intermediate', sessions: 60, fee: '4.500.000' },
            ].map((item) => (
              <tr key={item.id}>
                <td>{item.id}</td>
                <td>{item.name}</td>
                <td>{item.level}</td>
                <td>{item.sessions}</td>
                <td>
                  <input type="text" className="fee-input" defaultValue={item.fee} />
                </td>
                <td>
                  <input type="text" className="note-input" placeholder="Nhập ghi chú..." />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default FeeConfiguration;