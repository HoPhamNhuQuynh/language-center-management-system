import { useLocation, useNavigate } from "react-router-dom";
import ConfirmForm from "../components/ConfirmForm";

function Confirm() {
  const navigate = useNavigate();
  const { state } = useLocation();

  const data = state?.data || {};
  const method = state?.method;
  const percent = state?.percent;

  const handleSubmit = () => {
    navigate("/bill-view", {
      state: {
        data,
        method,
        percent,
      },
    });
  };

  const handleCancel = () => {
  navigate("/payment", {
    state: {
      data,
      method,
      percent,
    },
  });
};

  return (
    <ConfirmForm
      data={data}
      method={method}
      percent={percent}
      onSubmit={handleSubmit}
      onCancel={handleCancel}
    />
  );
}

export default Confirm;