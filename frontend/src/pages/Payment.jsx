import { useState } from "react";
import { useNavigate } from "react-router-dom";
import PaymentForm from "../components/PaymentForm";

function Payment() {
    const navigate = useNavigate();

    const [method, setMethod] = useState("momo");
    const [percent, setPercent] = useState(100);

    const data = null;

    const handleSubmit = () => {
    navigate("/bill-view", {
      state: { data, method, percent },
    });
  };

    return (
        <PaymentForm
            data={data}
            method={method}
            setMethod={setMethod}
            percent={percent}
            setPercent={setPercent}
            onSubmit={handleSubmit}
        />
    );
}

export default Payment;