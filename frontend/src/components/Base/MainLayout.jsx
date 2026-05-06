import { Outlet } from "react-router-dom";
import Navbar from "../Navbar/Navbar";
import Footer from "../Footer/Footer";
import { FloatButton } from "antd"; 
import { ArrowUpOutlined } from "@ant-design/icons";

function MainLayout() {
    return (
        <>
            <Navbar />
            <main style={{ minHeight: "80vh" }}>
                <Outlet />
            </main>
            <Footer />

            <FloatButton.BackTop 
                visibilityHeight={400} 
                shape="square" 
                icon={<ArrowUpOutlined style={{ color: '#ffffff' }} />} 
                style={{ 
                    right: 40, 
                    bottom: 60,
                    backgroundColor: "#191970", 
                }}
                styles={{ 
                    body: { 
                        color: "#ffffff",
                        backgroundColor: "#191970" 
                    } 
                }}
                tooltip={<div>Lên đầu trang</div>}
            />
        </>
    );
}
export default MainLayout;