import React from "react";
import { useSearchParams, useNavigate } from "react-router-dom";

export default function PaymentSuccessPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const invoiceId = searchParams.get("invoiceId");

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
        maxWidth: "440px",
        padding: "40px 32px",
        textAlign: "center"
      }}>
        <div style={{
          width: "72px",
          height: "72px",
          borderRadius: "50%",
          backgroundColor: "#c6f6d5",
          color: "#22543d",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "36px",
          marginBottom: "24px"
        }}>
          ✓
        </div>

        <h3 style={{ margin: "0 0 8px 0", color: "#2d3748", fontWeight: "700" }}>Thanh toán thành công!</h3>
        <p style={{ color: "#718096", fontSize: "15px", margin: "0 0 28px 0" }}>
          Hóa đơn #{invoiceId} đã được thanh toán thành công và cập nhật trạng thái trên hệ thống.
        </p>

        <button
          onClick={() => navigate("/billing/invoices")}
          style={{
            backgroundColor: "#2b6cb0",
            color: "white",
            border: "none",
            borderRadius: "8px",
            padding: "14px 28px",
            fontWeight: "bold",
            fontSize: "16px",
            cursor: "pointer",
            width: "100%",
            transition: "background-color 0.2s"
          }}
          onMouseOver={(e) => e.target.style.backgroundColor = "#2c5282"}
          onMouseOut={(e) => e.target.style.backgroundColor = "#2b6cb0"}
        >
          Quay lại danh sách hóa đơn
        </button>
      </div>
    </div>
  );
}
