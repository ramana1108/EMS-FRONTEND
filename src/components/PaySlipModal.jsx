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
      const safeMonth = String(payroll.month || "Period").replace(/[^a-z0-9]/gi, "_");
      const filename = `Salary_Payslip_${safeMonth}_${payroll.year || "Year"}.pdf`;

      const opt = {
        margin: [10, 10, 10, 10],
        filename: filename,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, logging: false },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" }
      };

      const pdfBlob = await html2pdf().set(opt).from(element).outputPdf("blob");
      const blobUrl = URL.createObjectURL(pdfBlob);
      const downloadLink = document.createElement("a");
      downloadLink.href = blobUrl;
      downloadLink.download = filename;
      downloadLink.rel = "noopener";
      document.body.appendChild(downloadLink);
      downloadLink.click();
      downloadLink.remove();
      window.setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
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
      padding: "12px",
      overflowY: "auto"
    }}>
      <style>{`
        @media (max-width: 640px) {
          .info-grid {
            grid-template-columns: 1fr !important;
          }
          .header-flex {
            flex-direction: column !important;
            gap: 12px !important;
          }
          .pay-slip-footer {
            gap: 6px !important;
            padding: 10px !important;
          }
          .pay-slip-action {
            min-width: 0 !important;
            flex: 1 1 auto !important;
            padding: 7px 8px !important;
            font-size: 12px !important;
            white-space: nowrap !important;
          }
          .payslip-card-container {
            padding: 12px !important;
          }
          .payslip-modal-header {
            padding: 12px 14px !important;
          }
          .payslip-modal-body {
            padding: 10px 10px 4px !important;
          }
          .payslip-table-desktop {
            display: none !important;
          }
          .payslip-breakdown-mobile {
            display: grid !important;
          }
        }
        @media (max-width: 340px) {
          .pay-slip-action {
            padding: 6px 5px !important;
            font-size: 11px !important;
          }
          .pay-slip-action svg {
            width: 14px !important;
            height: 14px !important;
          }
        }
        @media (min-width: 641px) {
          .payslip-breakdown-mobile {
            display: none !important;
          }
        }
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
        width: "min(680px, calc(100vw - 24px))",
        maxWidth: "calc(100vw - 24px)",
        maxHeight: "calc(var(--app-vh, 100dvh) - 24px)",
        display: "flex",
        flexDirection: "column",
        boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
        overflow: "hidden",
        margin: "auto"
      }}>

        {/* Modal Top Header Bar */}
        <div className="payslip-modal-header" style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "14px 20px",
          borderBottom: "1px solid #f1f5f9",
          backgroundColor: "#f8fafc",
          position: "sticky",
          top: 0,
          zIndex: 2
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
        <div className="payslip-modal-body" style={{ flex: 1, overflowY: "auto", padding: "12px 16px 6px", WebkitOverflowScrolling: "touch", minHeight: 0 }}>
          
          {/* Payslip Document Card Reference for PDF & Print */}
          <div
            ref={payslipRef}
            id="payslip-printable-area"
            className="payslip-card-container"
            style={{
              backgroundColor: "#ffffff",
              borderRadius: "12px",
              border: "1px solid #e2e8f0",
              padding: "18px",
              boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.05)",
              maxWidth: "100%",
              overflowWrap: "anywhere",
              wordBreak: "break-word"
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
              gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
              gap: "16px",
              backgroundColor: "#f8fafc",
              padding: "16px",
              borderRadius: "8px",
              border: "1px solid #e2e8f0",
              marginBottom: "20px",
              width: "100%"
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
            <div className="payslip-table-desktop" style={{ width: "100%", overflowX: "auto", WebkitOverflowScrolling: "touch", marginBottom: "20px", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
              <table className="calc-table" style={{ width: "100%", minWidth: "520px", borderCollapse: "collapse", margin: 0 }}>
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
                    <td style={{ padding: "10px 12px", fontSize: "13px", borderBottom: "1px solid #e2e8f0", color: "#0f172a" }}>Basic Salary</td>
                    <td style={{ padding: "10px 12px", fontSize: "13px", borderBottom: "1px solid #e2e8f0", textAlign: "right", fontWeight: "700", color: "#1e293b" }}>{formatCurrency(basic)}</td>
                    <td style={{ padding: "10px 12px", fontSize: "13px", borderBottom: "1px solid #e2e8f0", color: "#0f172a" }}>PF & Deductions</td>
                    <td style={{ padding: "10px 12px", fontSize: "13px", borderBottom: "1px solid #e2e8f0", textAlign: "right", fontWeight: "700", color: "#dc2626" }}>{formatCurrency(deductions)}</td>
                  </tr>
                  <tr>
                    <td style={{ padding: "10px 12px", fontSize: "13px", borderBottom: "1px solid #e2e8f0", color: "#0f172a" }}>HRA & Allowances</td>
                    <td style={{ padding: "10px 12px", fontSize: "13px", borderBottom: "1px solid #e2e8f0", textAlign: "right", fontWeight: "700", color: "#059669" }}>{formatCurrency(allowance)}</td>
                    <td style={{ padding: "10px 12px", fontSize: "13px", borderBottom: "1px solid #e2e8f0", color: "#0f172a" }}>Income Tax</td>
                    <td style={{ padding: "10px 12px", fontSize: "13px", borderBottom: "1px solid #e2e8f0", textAlign: "right", fontWeight: "700", color: "#dc2626" }}>{formatCurrency(tax)}</td>
                  </tr>
                  <tr>
                    <td style={{ padding: "10px 12px", fontSize: "13px", borderBottom: "1px solid #e2e8f0", color: "#0f172a" }}>Performance Bonus</td>
                    <td style={{ padding: "10px 12px", fontSize: "13px", borderBottom: "1px solid #e2e8f0", textAlign: "right", fontWeight: "700", color: "#059669" }}>{formatCurrency(bonus)}</td>
                    <td style={{ padding: "10px 12px", fontSize: "13px", borderBottom: "1px solid #e2e8f0", color: "#0f172a" }}>—</td>
                    <td style={{ padding: "10px 12px", fontSize: "13px", borderBottom: "1px solid #e2e8f0", textAlign: "right" }}>—</td>
                  </tr>

                  <tr style={{ backgroundColor: "#f8fafc" }}>
                    <td style={{ padding: "8px 12px", fontSize: "12px", fontWeight: "800", color: "#475569" }}>Total Gross Earnings</td>
                    <td style={{ padding: "8px 12px", fontSize: "12px", fontWeight: "800", color: "#059669", textAlign: "right" }}>{formatCurrency(totalEarnings)}</td>
                    <td style={{ padding: "8px 12px", fontSize: "12px", fontWeight: "800", color: "#475569" }}>Total Deductions</td>
                    <td style={{ padding: "8px 12px", fontSize: "12px", fontWeight: "800", color: "#dc2626", textAlign: "right" }}>{formatCurrency(totalDeductions)}</td>
                  </tr>

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
            </div>

            <div className="payslip-breakdown-mobile" style={{ display: "none", gridTemplateColumns: "1fr", gap: "10px", marginBottom: "16px" }}>
              <div style={{ border: "1px solid #D5F2E9", borderRadius: "10px", overflow: "hidden" }}>
                <div style={{ padding: "9px 12px", background: "#E8F8F3", color: "#075E4A", fontSize: "11px", fontWeight: "800", letterSpacing: "0.08em" }}>EARNINGS</div>
                <div style={{ padding: "4px 12px" }}>
                  {[
                    ["Basic Salary", basic],
                    ["HRA & Allowances", allowance],
                    ["Performance Bonus", bonus]
                  ].map(([label, amount]) => (
                    <div key={label} style={{ display: "flex", justifyContent: "space-between", gap: "12px", padding: "8px 0", borderBottom: "1px solid #E8F8F3", fontSize: "12px" }}>
                      <span style={{ color: "#475569" }}>{label}</span>
                      <strong style={{ color: "#087F72", whiteSpace: "nowrap" }}>{formatCurrency(amount)}</strong>
                    </div>
                  ))}
                  <div style={{ display: "flex", justifyContent: "space-between", gap: "12px", padding: "9px 0", fontSize: "12px" }}>
                    <strong style={{ color: "#172033" }}>Total Earnings</strong>
                    <strong style={{ color: "#087F72", whiteSpace: "nowrap" }}>{formatCurrency(totalEarnings)}</strong>
                  </div>
                </div>
              </div>

              <div style={{ border: "1px solid #FDE7C0", borderRadius: "10px", overflow: "hidden" }}>
                <div style={{ padding: "9px 12px", background: "#FFF1D6", color: "#92400E", fontSize: "11px", fontWeight: "800", letterSpacing: "0.08em" }}>DEDUCTIONS</div>
                <div style={{ padding: "4px 12px" }}>
                  {[
                    ["PF & Deductions", deductions],
                    ["Income Tax", tax]
                  ].map(([label, amount]) => (
                    <div key={label} style={{ display: "flex", justifyContent: "space-between", gap: "12px", padding: "8px 0", borderBottom: "1px solid #FFF1D6", fontSize: "12px" }}>
                      <span style={{ color: "#475569" }}>{label}</span>
                      <strong style={{ color: "#DC2626", whiteSpace: "nowrap" }}>{formatCurrency(amount)}</strong>
                    </div>
                  ))}
                  <div style={{ display: "flex", justifyContent: "space-between", gap: "12px", padding: "9px 0", fontSize: "12px" }}>
                    <strong style={{ color: "#172033" }}>Total Deductions</strong>
                    <strong style={{ color: "#DC2626", whiteSpace: "nowrap" }}>{formatCurrency(totalDeductions)}</strong>
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px", padding: "12px", borderRadius: "10px", background: "#ECFDF5", border: "1px solid #A7F3D0" }}>
                <strong style={{ color: "#043E30", fontSize: "12px" }}>NET TAKE-HOME SALARY</strong>
                <strong style={{ color: "#043E30", fontSize: "15px", whiteSpace: "nowrap" }}>{formatCurrency(netSalary)}</strong>
              </div>
            </div>

            {/* Footer Verification Note */}
            <div className="footer-note" style={{ textAlign: "center", marginTop: "20px", paddingTop: "14px", borderTop: "1px dashed #cbd5e1", fontSize: "11px", color: "#64748b" }}>
              <p style={{ margin: 0, fontWeight: "600" }}>This slip is dynamically rendered and digitally verified by EMS Payroll System.</p>
              <p style={{ margin: "2px 0 0 0", fontSize: "10px", color: "#94a3b8" }}>Generated on: {new Date().toLocaleString()}</p>
            </div>
          </div>

        </div>

        {/* Modal Footer Actions */}
        <div className="pay-slip-footer" style={{
          display: "flex",
          justifyContent: "flex-end",
          alignItems: "center",
          gap: "12px",
          padding: "12px 20px",
          borderTop: "1px solid #f1f5f9",
          backgroundColor: "#f8fafc",
          flexWrap: "wrap"
        }}>
          <button
            type="button"
            onClick={onClose}
            className="pay-slip-action"
            style={{
              padding: "9px 18px",
              border: "1px solid #cbd5e1",
              borderRadius: "8px",
              backgroundColor: "#ffffff",
              color: "#475569",
              fontSize: "13px",
              fontWeight: "700",
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              flex: "0 0 auto",
              minWidth: "0"
            }}
          >
            Close
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="pay-slip-action"
            style={{
              padding: "9px 18px",
              border: "1px solid #043e30",
              borderRadius: "8px",
              backgroundColor: "#ffffff",
              color: "#043e30",
              fontSize: "13px",
              fontWeight: "700",
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "6px",
              flex: "0 0 auto",
              minWidth: "0"
            }}
          >
            <Printer size={16} />
            <span>Print Slip</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadPDF}
            disabled={downloading}
            className="pay-slip-action"
            style={{
              padding: "9px 18px",
              border: "none",
              borderRadius: "8px",
              backgroundColor: "#043e30",
              color: "#ffffff",
              fontSize: "13px",
              fontWeight: "700",
              cursor: downloading ? "wait" : "pointer",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "6px",
              opacity: downloading ? 0.8 : 1,
              flex: "0 0 auto",
              minWidth: "0"
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
