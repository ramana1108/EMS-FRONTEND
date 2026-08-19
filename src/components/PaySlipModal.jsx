import React, { useRef, useState } from "react";
import { X, Printer, Download, Building2, CheckCircle2, Clock } from "lucide-react";
import html2pdf from "html2pdf.js";

export default function PaySlipModal({ payroll, user, isOpen, onClose }) {
  const [downloading, setDownloading] = useState(false);
  const payslipRef = useRef(null);

  if (!isOpen || !payroll) return null;

  // Format currency helpers
  const formatCurrency = (val) => {
    const num = Number(val || 0);
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
      minimumFractionDigits: 2
    }).format(num);
  };

  // Derive calculations cleanly
  const basic = Number(payroll.basicSalary || 0);
  const allowance = Number(payroll.allowance || 0);
  const bonus = Number(payroll.bonus || 0);
  const totalEarnings = basic + allowance + bonus;

  const deductions = Number(payroll.deductions || 0);
  const tax = Number(payroll.tax || 0);
  const totalDeductions = deductions + tax;

  const netSalary = payroll.netSalary !== undefined && payroll.netSalary !== null
    ? Number(payroll.netSalary)
    : (totalEarnings - totalDeductions);

  // Derive employee info
  const emp = payroll.employeeId || {};
  const empName = emp.firstName
    ? `${emp.firstName} ${emp.lastName || ""}`.trim()
    : (user?.name || user?.username || "Employee");

  const empCode = emp.employeeId || user?.employeeId || "EMP-000";
  const empEmail = emp.email || user?.email || "N/A";
  
  const deptName = typeof emp.departmentId === "object" && emp.departmentId?.deptName
    ? emp.departmentId.deptName
    : (emp.department || "General");

  const desigTitle = typeof emp.designationId === "object" && emp.designationId?.designationName
    ? emp.designationId.designationName
    : (emp.designation || "Staff Member");

  const paymentDateFormatted = payroll.paymentDate
    ? new Date(payroll.paymentDate).toLocaleDateString("en-IN", {
        year: "numeric",
        month: "long",
        day: "numeric"
      })
    : "Processing / Pending";

  const isPaid = payroll.paymentStatus === "Paid";

  // PDF Download Handler using html2pdf.js
  const handleDownloadPDF = async () => {
    if (!payslipRef.current) return;
    setDownloading(true);

    try {
      const element = payslipRef.current;
      const filename = `Payslip_${empCode}_${payroll.month}_${payroll.year}.pdf`;

      const opt = {
        margin: [10, 10, 10, 10],
        filename: filename,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, logging: false },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" }
      };

      await html2pdf().set(opt).from(element).save();
    } catch (err) {
      console.error("PDF Download error:", err);
    } finally {
      setDownloading(false);
    }
  };

  // Print Handler - Pure React Native Window Print
  const handlePrint = () => {
    window.print();
  };

  return (
    <div style={{
      position: "fixed",
      inset: 0,
      zIndex: 9999,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "rgba(15, 23, 42, 0.6)",
      backdropFilter: "blur(6px)",
      padding: "16px"
    }}>
      <style>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          #payslip-printable-area, #payslip-printable-area * {
            visibility: visible !important;
          }
          #payslip-printable-area {
            position: fixed !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            height: auto !important;
            padding: 20px !important;
            margin: 0 !important;
            border: none !important;
            box-shadow: none !important;
            background: #ffffff !important;
          }
        }
      `}</style>

      <div style={{
        backgroundColor: "#ffffff",
        borderRadius: "20px",
        border: "1px solid #e2e8f0",
        width: "680px",
        maxWidth: "95vw",
        maxHeight: "90vh",
        display: "flex",
        flexDirection: "column",
        boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
        overflow: "hidden"
      }}>

        {/* Modal Top Header Bar */}
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "18px 24px",
          borderBottom: "1px solid #f1f5f9",
          backgroundColor: "#f8fafc"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{
              width: "36px",
              height: "36px",
              borderRadius: "10px",
              backgroundColor: "#043e30",
              color: "#ffffff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}>
              <Building2 size={20} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: "16px", fontWeight: "800", color: "#0f172a" }}>
                Salary Payslip
              </h3>
              <p style={{ margin: 0, fontSize: "12px", color: "#64748b" }}>
                {payroll.month} {payroll.year}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "#64748b",
              padding: "6px",
              borderRadius: "8px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}
            title="Close Modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div style={{ flex: 1, overflowY: "auto", padding: "24px" }}>
          
          {/* Payslip Document Card Reference for PDF & Print */}
          <div
            ref={payslipRef}
            id="payslip-printable-area"
            className="payslip-card-container"
            style={{
              backgroundColor: "#ffffff",
              borderRadius: "12px",
              border: "1px solid #e2e8f0",
              padding: "24px",
              boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.05)"
            }}
          >
            {/* Header Flex */}
            <div className="header-flex" style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              borderBottom: "2px solid #043e30",
              paddingBottom: "16px",
              marginBottom: "20px"
            }}>
              <div>
                <h2 className="company-title" style={{ fontSize: "22px", fontWeight: "800", color: "#043e30", margin: 0 }}>
                  EMS Corporation
                </h2>
                <p className="company-sub" style={{ fontSize: "12px", color: "#64748b", margin: "4px 0 0 0" }}>
                  Corporate HQ • Tech City, Innovation Hub
                </p>
              </div>

              <div style={{ textAlign: "right" }}>
                <h4 className="slip-title" style={{ fontSize: "16px", fontWeight: "800", textTransform: "uppercase", color: "#1e293b", margin: 0 }}>
                  Salary Slip
                </h4>
                <p className="slip-period" style={{ fontSize: "12px", color: "#059669", fontWeight: "700", margin: "4px 0 0 0" }}>
                  Period: {payroll.month} {payroll.year}
                </p>
              </div>
            </div>

            {/* Employee & Payment Info Grid */}
            <div className="info-grid" style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "16px",
              backgroundColor: "#f8fafc",
              padding: "16px",
              borderRadius: "8px",
              border: "1px solid #e2e8f0",
              marginBottom: "20px"
            }}>
              <div>
                <div style={{ marginBottom: "8px" }}>
                  <div className="info-label" style={{ fontSize: "11px", fontWeight: "700", color: "#64748b", textTransform: "uppercase" }}>Employee Name</div>
                  <div className="info-val" style={{ fontSize: "14px", fontWeight: "800", color: "#0f172a" }}>{empName}</div>
                </div>
                <div style={{ marginBottom: "8px" }}>
                  <div className="info-label" style={{ fontSize: "11px", fontWeight: "700", color: "#64748b", textTransform: "uppercase" }}>Employee ID</div>
                  <div className="info-val" style={{ fontSize: "13px", fontWeight: "700", color: "#334155" }}>{empCode}</div>
                </div>
                <div>
                  <div className="info-label" style={{ fontSize: "11px", fontWeight: "700", color: "#64748b", textTransform: "uppercase" }}>Role / Designation</div>
                  <div className="info-val" style={{ fontSize: "13px", fontWeight: "600", color: "#475569" }}>{desigTitle} ({deptName})</div>
                </div>
              </div>

              <div>
                <div style={{ marginBottom: "8px" }}>
                  <div className="info-label" style={{ fontSize: "11px", fontWeight: "700", color: "#64748b", textTransform: "uppercase" }}>Email Address</div>
                  <div className="info-val" style={{ fontSize: "13px", fontWeight: "600", color: "#334155" }}>{empEmail}</div>
                </div>
                <div style={{ marginBottom: "8px" }}>
                  <div className="info-label" style={{ fontSize: "11px", fontWeight: "700", color: "#64748b", textTransform: "uppercase" }}>Payment Status</div>
                  <div style={{ marginTop: "2px" }}>
                    <span className={`status-badge ${isPaid ? "status-paid" : "status-pending"}`} style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "4px",
                      padding: "4px 10px",
                      borderRadius: "12px",
                      fontSize: "11px",
                      fontWeight: "800",
                      textTransform: "uppercase",
                      backgroundColor: isPaid ? "#ecfdf5" : "#fffbeb",
                      color: isPaid ? "#047857" : "#b45309",
                      border: isPaid ? "1px solid #a7f3d0" : "1px solid #fde68a"
                    }}>
                      {isPaid ? <CheckCircle2 size={12} /> : <Clock size={12} />}
                      {payroll.paymentStatus}
                    </span>
                  </div>
                </div>
                <div>
                  <div className="info-label" style={{ fontSize: "11px", fontWeight: "700", color: "#64748b", textTransform: "uppercase" }}>Disbursed Date</div>
                  <div className="info-val" style={{ fontSize: "13px", fontWeight: "600", color: "#475569" }}>{paymentDateFormatted}</div>
                </div>
              </div>
            </div>

            {/* Calculations Breakdown Table */}
            <table className="calc-table" style={{ width: "100%", borderCollapse: "collapse", marginBottom: "20px" }}>
              <thead>
                <tr>
                  <th style={{ backgroundColor: "#f1f5f9", padding: "10px 12px", fontSize: "11px", fontWeight: "800", color: "#334155", textTransform: "uppercase", textAlign: "left", borderBottom: "1px solid #cbd5e1" }}>Earnings Description</th>
                  <th style={{ backgroundColor: "#f1f5f9", padding: "10px 12px", fontSize: "11px", fontWeight: "800", color: "#334155", textTransform: "uppercase", textAlign: "right", borderBottom: "1px solid #cbd5e1" }}>Amount (₹)</th>
                  <th style={{ backgroundColor: "#f1f5f9", padding: "10px 12px", fontSize: "11px", fontWeight: "800", color: "#334155", textTransform: "uppercase", textAlign: "left", borderBottom: "1px solid #cbd5e1" }}>Deductions Description</th>
                  <th style={{ backgroundColor: "#f1f5f9", padding: "10px 12px", fontSize: "11px", fontWeight: "800", color: "#334155", textTransform: "uppercase", textAlign: "right", borderBottom: "1px solid #cbd5e1" }}>Amount (₹)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ padding: "10px 12px", fontSize: "13px", borderBottom: "1px solid #e2e8f0" , color:"black" }}>Basic Salary</td>
                  <td style={{ padding: "10px 12px", fontSize: "13px", borderBottom: "1px solid #e2e8f0", textAlign: "right", fontWeight: "700", color: "#1e293b" }}>{formatCurrency(basic)}</td>
                  <td style={{ padding: "10px 12px", fontSize: "13px", borderBottom: "1px solid #e2e8f0", color:"black" }}>PF & Deductions</td>
                  <td style={{ padding: "10px 12px", fontSize: "13px", borderBottom: "1px solid #e2e8f0", textAlign: "right", fontWeight: "700", color: "#dc2626" }}>{formatCurrency(deductions)}</td>
                </tr>
                <tr>
                  <td style={{ padding: "10px 12px", fontSize: "13px", borderBottom: "1px solid #e2e8f0", color:"black" }}>HRA & Allowances</td>
                  <td style={{ padding: "10px 12px", fontSize: "13px", borderBottom: "1px solid #e2e8f0", textAlign: "right", fontWeight: "700", color: "#059669" }}>{formatCurrency(allowance)}</td>
                  <td style={{ padding: "10px 12px", fontSize: "13px", borderBottom: "1px solid #e2e8f0", color:"black" }}>Income Tax</td>
                  <td style={{ padding: "10px 12px", fontSize: "13px", borderBottom: "1px solid #e2e8f0", textAlign: "right", fontWeight: "700", color: "#dc2626" }}>{formatCurrency(tax)}</td>
                </tr>
                <tr>
                  <td style={{ padding: "10px 12px", fontSize: "13px", borderBottom: "1px solid #e2e8f0", color:"black" }}>Performance Bonus</td>
                  <td style={{ padding: "10px 12px", fontSize: "13px", borderBottom: "1px solid #e2e8f0", textAlign: "right", fontWeight: "700", color: "#059669" }}>{formatCurrency(bonus)}</td>
                  <td style={{ padding: "10px 12px", fontSize: "13px", borderBottom: "1px solid #e2e8f0", color:"black" }}>—</td>
                  <td style={{ padding: "10px 12px", fontSize: "13px", borderBottom: "1px solid #e2e8f0", textAlign: "right" }}>—</td>
                </tr>

                {/* Subtotals */}
                <tr style={{ backgroundColor: "#f8fafc" }}>
                  <td style={{ padding: "8px 12px", fontSize: "12px", fontWeight: "800", color: "#475569" }}>Total Gross Earnings</td>
                  <td style={{ padding: "8px 12px", fontSize: "12px", fontWeight: "800", color: "#059669", textAlign: "right" }}>{formatCurrency(totalEarnings)}</td>
                  <td style={{ padding: "8px 12px", fontSize: "12px", fontWeight: "800", color: "#475569" }}>Total Deductions</td>
                  <td style={{ padding: "8px 12px", fontSize: "12px", fontWeight: "800", color: "#dc2626", textAlign: "right" }}>{formatCurrency(totalDeductions)}</td>
                </tr>

                {/* Highlighted Net Disbursed Salary Row */}
                <tr className="total-row" style={{ backgroundColor: "#ecfdf5" }}>
                  <td colSpan="2" style={{ padding: "12px", fontSize: "14px", fontWeight: "800", color: "#043e30", borderTop: "2px solid #10b981", borderBottom: "2px solid #10b981" }}>
                    NET TAKE-HOME DISBURSED SALARY
                  </td>
                  <td colSpan="2" style={{ padding: "12px", fontSize: "16px", fontWeight: "800", color: "#043e30", textAlign: "right", borderTop: "2px solid #10b981", borderBottom: "2px solid #10b981" }}>
                    {formatCurrency(netSalary)}
                  </td>
                </tr>
              </tbody>
            </table>

            {/* Footer Verification Note */}
            <div className="footer-note" style={{ textAlign: "center", marginTop: "20px", paddingTop: "14px", borderTop: "1px dashed #cbd5e1", fontSize: "11px", color: "#64748b" }}>
              <p style={{ margin: 0, fontWeight: "600" }}>This slip is dynamically rendered and digitally verified by EMS Payroll System.</p>
              <p style={{ margin: "2px 0 0 0", fontSize: "10px", color: "#94a3b8" }}>Generated on: {new Date().toLocaleString()}</p>
            </div>
          </div>

        </div>

        {/* Modal Footer Actions */}
        <div style={{
          display: "flex",
          justify: "flex-end",
          gap: "12px",
          padding: "16px 24px",
          borderTop: "1px solid #f1f5f9",
          backgroundColor: "#f8fafc"
        }}>
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: "9px 18px",
              border: "1px solid #cbd5e1",
              borderRadius: "8px",
              backgroundColor: "#ffffff",
              color: "#475569",
              fontSize: "13px",
              fontWeight: "700",
              cursor: "pointer"
            }}
          >
            Close
          </button>

          <button
            type="button"
            onClick={handlePrint}
            style={{
              padding: "9px 18px",
              border: "1px solid #043e30",
              borderRadius: "8px",
              backgroundColor: "#ffffff",
              color: "#043e30",
              fontSize: "13px",
              fontWeight: "700",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "6px"
            }}
          >
            <Printer size={16} />
            <span>Print Slip</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadPDF}
            disabled={downloading}
            style={{
              padding: "9px 18px",
              border: "none",
              borderRadius: "8px",
              backgroundColor: "#043e30",
              color: "#ffffff",
              fontSize: "13px",
              fontWeight: "700",
              cursor: downloading ? "wait" : "pointer",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              opacity: downloading ? 0.8 : 1
            }}
          >
            <Download size={16} />
            <span>{downloading ? "Generating PDF..." : "Download PDF"}</span>
          </button>
        </div>

      </div>
    </div>
  );
}
