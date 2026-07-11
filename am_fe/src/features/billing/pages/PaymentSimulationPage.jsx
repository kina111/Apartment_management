import React, { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";

export default function PaymentSimulationPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const invoiceId = searchParams.get("invoiceId");
  const amount = searchParams.get("amount");
  const desc = searchParams.get("desc") || "Thanh toan hoa don";

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSimulateSuccess = async () => {
    setLoading(true);
    setError("");
    try {
      // Trigger backend PayOS Webhook using native fetch to avoid potential axios interceptor issues
      const res = await fetch("http://localhost:8080/api/webhook/payos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          data: {
            orderCode: parseInt(invoiceId),
            amount: parseInt(amount),
            code: "00",
            desc: "Success"
          }
        })
      });

      if (!res.ok) {
        throw new Error("HTTP status " + res.status);
      }

      // Redirect to success page
      navigate(`/payment-success?invoiceId=${invoiceId}`);
    } catch (err) {
      console.error(err);
      setError("Không thể gửi dữ liệu xác nhận thanh toán đến backend server: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSimulateCancel = () => {
    navigate(`/payment-cancel?invoiceId=${invoiceId}`);
  };

  const formattedAmount = parseInt(amount || 0).toLocaleString("vi-VN") + " ₫";

  return (
    <div style={{
      fontFamily: "'Segoe UI', Roboto, sans-serif",
      backgroundColor: "#f0f2f5",
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "20px"
    }}>
      <div style={{
        backgroundColor: "white",
        borderRadius: "16px",
        boxShadow: "0 8px 30px rgba(0, 0, 0, 0.08)",
        width: "100%",
        maxWidth: "480px",
        padding: "32px",
        textAlign: "center"
      }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", marginBottom: "24px" }}>
          <div style={{
            width: "36px",
            height: "36px",
            borderRadius: "50%",
            backgroundColor: "#2b6cb0",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
            fontWeight: "bold",
            fontSize: "20px"
          }}>P</div>
          <span style={{ fontSize: "22px", fontWeight: "800", color: "#1a365d" }}>PayOS Sim</span>
          <span style={{
            fontSize: "12px",
            fontWeight: "bold",
            color: "#e28743",
            backgroundColor: "#fff3e6",
            padding: "2px 8px",
            borderRadius: "12px",
            border: "1px solid #ffe0b3"
          }}>MOCK TEST</span>
        </div>

        <h3 style={{ margin: "0 0 8px 0", color: "#2d3748", fontWeight: "700" }}>Thanh toán hóa đơn</h3>
        <p style={{ color: "#718096", fontSize: "14px", margin: "0 0 24px 0" }}>Quét mã hoặc click xác nhận để mô phỏng giao dịch thành công</p>

        <div style={{
          backgroundColor: "#f7fafc",
          borderRadius: "12px",
          padding: "20px",
          marginBottom: "24px",
          textAlign: "left",
          border: "1px solid #edf2f7"
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px" }}>
            <span style={{ color: "#718096", fontSize: "14px" }}>Mã đơn hàng:</span>
            <span style={{ fontWeight: "bold", color: "#2d3748" }}>#{invoiceId}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px" }}>
            <span style={{ color: "#718096", fontSize: "14px" }}>Số tiền:</span>
            <span style={{ fontWeight: "bold", color: "#2b6cb0", fontSize: "18px" }}>{formattedAmount}</span>
          </div>
          <div style={{ borderTop: "1px dashed #e2e8f0", margin: "12px 0" }}></div>
          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <span style={{ color: "#718096", fontSize: "14px" }}>Nội dung:</span>
            <span style={{ color: "#4a5568", fontSize: "14px", fontStyle: "italic" }}>{desc}</span>
          </div>
        </div>

        <div style={{ marginBottom: "28px" }}>
          <img 
            src={`https://img.vietqr.io/image/MB-9999999999-compact2.png?amount=${amount}&addInfo=${encodeURIComponent(desc)}`}
            alt="Simulated VietQR" 
            style={{
              maxWidth: "220px",
              border: "1px solid #e2e8f0",
              borderRadius: "8px",
              padding: "10px",
              backgroundColor: "white",
              boxShadow: "0 4px 12px rgba(0,0,0,0.02)"
            }}
          />
        </div>

        {error && (
          <div style={{
            backgroundColor: "#fff5f5",
            color: "#c53030",
            padding: "12px",
            borderRadius: "8px",
            fontSize: "14px",
            marginBottom: "20px",
            border: "1px solid #fed7d7"
          }}>
            {error}
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <button
            onClick={handleSimulateSuccess}
            disabled={loading}
            style={{
              backgroundColor: "#2b6cb0",
              color: "white",
              border: "none",
              borderRadius: "8px",
              padding: "14px",
              fontWeight: "bold",
              fontSize: "16px",
              cursor: "pointer",
              transition: "background-color 0.2s",
              opacity: loading ? 0.7 : 1
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = "#2c5282"}
            onMouseOut={(e) => e.target.style.backgroundColor = "#2b6cb0"}
          >
            {loading ? "Đang xử lý..." : "Xác nhận thanh toán thành công"}
          </button>
          
          <button
            onClick={handleSimulateCancel}
            disabled={loading}
            style={{
              backgroundColor: "transparent",
              color: "#718096",
              border: "1px solid #e2e8f0",
              borderRadius: "8px",
              padding: "12px",
              fontWeight: "600",
              fontSize: "14px",
              cursor: "pointer",
              transition: "all 0.2s"
            }}
            onMouseOver={(e) => {
              e.target.style.backgroundColor = "#f7fafc";
              e.target.style.color = "#4a5568";
            }}
            onMouseOut={(e) => {
              e.target.style.backgroundColor = "transparent";
              e.target.style.color = "#718096";
            }}
          >
            Hủy giao dịch
          </button>
        </div>
      </div>
    </div>
  );
}
