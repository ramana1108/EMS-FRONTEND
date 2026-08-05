import React, { useState, useEffect } from "react";
import "../App.css";
import Sidebar from "../components/Sidebar";
import {
    Wallet,
    Coins,
    CreditCard,
    Landmark,
    Download,
    Eye,
    X,
    Printer,
    Menu
} from "lucide-react";
import api from "../api";

export default function Payrolls() {
    const [activeTab, setActiveTab] = useState("Payrolls");
    const [isOpen, setIsOpen] = useState(false);
    const [payrolls, setPayrolls] = useState([]);
    const [loading, setLoading] = useState(false);
    const [user, setUser] = useState(null);
    const [selectedSlip, setSelectedSlip] = useState(null);

    // Latest payroll stats derived dynamically
    const [latestStats, setLatestStats] = useState({
        basicSalary: 0,
        allowance: 0,
        deductions: 0,
        netSalary: 0,
        tax: 0,
        bonus: 0
    });

    useEffect(() => {
        const loggedInUser = JSON.parse(localStorage.getItem("user") || "null");
        setUser(loggedInUser);

        const loadPayrolls = async () => {
            setLoading(true);
            try {
                let employeeDbId = null;
                if (loggedInUser?.email) {
                    const all = await api.getAllEmployees();
                    const list = Array.isArray(all) ? all : all?.employees || [];
                    if (list && list.length > 0) {
                        const found = list.find(
                            (e) =>
                                e.email?.toLowerCase() === loggedInUser.email.toLowerCase()
                        );
                        if (found) {
                            employeeDbId = found._id;
                        }
                    }
                }

                const res = await api.getPayrolls();
                const list = Array.isArray(res) ? res : res?.payrolls || [];

                // Filter payrolls for current employee
                const userPayrolls = list.filter((p) => {
                    let payEmpId = p.employeeId?._id || p.employeeId || "";
                    if (typeof p.employeeId === "object" && p.employeeId !== null) {
                        payEmpId = p.employeeId._id || p.employeeId.employeeId || "";
                    }
                    return payEmpId === employeeDbId;
                });

                // Sort by year and month descending (using a simple dictionary map for months)
                const monthWeight = {
                    January: 1, February: 2, March: 3, April: 4, May: 5, June: 6,
                    July: 7, August: 8, September: 9, October: 10, November: 11, December: 12
                };

                const sortedPayrolls = userPayrolls.sort((a, b) => {
                    if (b.year !== a.year) return b.year - a.year;
                    return (monthWeight[b.month] || 0) - (monthWeight[a.month] || 0);
                });

                setPayrolls(sortedPayrolls);

                // Compute Latest Stats from the most recent month
                if (sortedPayrolls.length > 0) {
                    const latest = sortedPayrolls[0];
                    setLatestStats({
                        basicSalary: latest.basicSalary || 0,
                        allowance: latest.allowance || 0,
                        deductions: latest.deductions || 0,
                        netSalary: latest.netSalary || 0,
                        tax: latest.tax || 0,
                        bonus: latest.bonus || 0
                    });
                }
            } catch (err) {
                console.error("Failed to fetch payroll information:", err);
            } finally {
                setLoading(false);
            }
        };

        loadPayrolls();
    }, []);

    const formatCurrency = (val) => {
        return new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: "INR",
            maximumFractionDigits: 0
        }).format(val);
    };

    const handlePrintSlip = () => {
        const printContent = document.getElementById("payslip-print-section").innerHTML;
        const originalContent = document.body.innerHTML;

        // Create new windows/styles and print
        const printWindow = window.open("", "", "height=600,width=800");
        printWindow.document.write("<html><head><title>Employee Payslip</title>");
        printWindow.document.write("<style>");
        printWindow.document.write(`
      body { fontFamily: sans-serif; padding: 40px; color: #334155; }
      .header { display: flex; justifyContent: space-between; borderBottom: 2px solid #043e30; paddingBottom: 20px; marginBottom: 20px; }
      .company-name { fontSize: 24px; fontWeight: bold; color: #043e30; }
      .title { fontSize: 18px; margin: 0; }
      .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; marginBottom: 30px; }
      .section-title { fontSize: 14px; textTransform: uppercase; color: #64748b; fontWeight: bold; borderBottom: 1px solid #cbd5e1; paddingBottom: 6px; marginBottom: 12px; }
      .row { display: flex; justifyContent: space-between; padding: 6px 0; fontSize: 14px; }
      .total-row { display: flex; justifyContent: space-between; padding: 12px 0; fontSize: 16px; fontWeight: bold; borderTop: 1px solid #94a3b8; borderBottom: 1px solid #94a3b8; marginTop: 10px; }
    `);
        printWindow.document.write("</style></head><body>");
        printWindow.document.write(printContent);
        printWindow.document.write("</body></html>");
        printWindow.document.close();
        printWindow.print();
    };

    const getInitials = (name) => {
        if (!name) return "U";
        return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
    };

    return (
        <div className="emp-dashboard-app">
            <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} isOpen={isOpen} setIsOpen={setIsOpen} />

            <div className="emp-main-content" style={{ display: "flex", flexDirection: "column", minHeight: "100vh", flex: 1 }}>

                {/* Mobile Header */}
                <div className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-200/80 bg-white/95 px-4 py-3 backdrop-blur-xl lg:hidden" style={{ minHeight: "60px" }}>
                    <button
                        onClick={() => setIsOpen(true)}
                        className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-[#043e30] text-white shadow-sm shadow-[#043e30]/10"
                        style={{ border: "none", cursor: "pointer" }}
                        aria-label="Open sidebar"
                    >
                        <Menu size={20} />
                    </button>
                    <div className="text-sm font-semibold text-slate-900">EMS Portal</div>
                </div>

                {/* Top Header Bar */}
                <div className="emp-top-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px", padding: "0 10px" }}>
                <div style={{ visibility: "hidden" }}>Placeholder</div>

                <div className="emp-user-profile-badge" style={{ display: "flex", alignItems: "center", gap: "8px", backgroundColor: "#ffffff", padding: "6px 14px", borderRadius: "12px", border: "1px solid #cbd5e1", fontWeight: "700", color: "#000000" }}>
                    <div className="emp-avatar-circle" style={{ width: "30px", height: "30px", borderRadius: "50%", backgroundColor: "#043e30", color: "#ffffff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: "bold" }}>
                    {getInitials(user?.name || "Akshaya Mehta")}
                </div>
                <span>{user?.name || "Akshaya Mehta"}</span>
            </div>
        </div>

        {/* Page Content */ }
    <div style={{ flex: 1, padding: "0 10px" }}>
        <div className="page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <div>
            <h1 className="dashboard-title" style={{ fontSize: "32px", fontWeight: "800", color: "#000000", margin: 0 }}>Payrolls</h1>
            <p className="dashboard-subtitle" style={{ fontSize: "14px", color: "#64748b", marginTop: "4px" }}>View your salary details and download payslips</p>
        </div>
    </div>

    {/* Stats Grid representing Current/Latest Payslip breakdown */ }
    <div className="emp-stats-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))", gap: "20px", marginBottom: "32px" }}>
        {/* Basic Salary */}
        <div className="emp-stat-card" style={{ backgroundColor: "#ffffff", padding: "20px", borderRadius: "16px", border: "1px solid #e2e8f0" }}>
            <div className="emp-stat-top" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
            <span className="emp-stat-title" style={{ fontSize: "13px", fontWeight: "700", color: "#64748b" }}>Basic Salary</span>
            <div className="emp-stat-icon-box" style={{ backgroundColor: "#ecfdf5", color: "#10b981", padding: "8px", borderRadius: "10px" }}>
                <Wallet size={20} />
            </div>
        </div>
        <p className="emp-stat-value" style={{ fontSize: "24px", fontWeight: "800", color: "#000000", margin: 0 }}>
            {formatCurrency(latestStats.basicSalary)}
        </p>
        <div style={{ marginTop: "4px" }}>
            <span className="emp-stat-subtext" style={{ fontSize: "12px", color: "#64748b", fontWeight: "bold" }}>Base allowance structure</span>
        </div>
    </div>

    {/* Allowances */ }
            <div className="emp-stat-card" style={{ backgroundColor: "#ffffff", padding: "20px", borderRadius: "16px", border: "1px solid #e2e8f0" }}>
              <div className="emp-stat-top" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                <span className="emp-stat-title" style={{ fontSize: "13px", fontWeight: "700", color: "#64748b" }}>Allowances</span>
                <div className="emp-stat-icon-box" style={{ backgroundColor: "#eff6ff", color: "#3b82f6", padding: "8px", borderRadius: "10px" }}>
                  <Coins size={20} />
                </div>
              </div>
              <p className="emp-stat-value" style={{ fontSize: "24px", fontWeight: "800", color: "#000000", margin: 0 }}>
                {formatCurrency(latestStats.allowance + latestStats.bonus)}
              </p>
              <div style={{ marginTop: "4px" }}>
                <span className="emp-stat-subtext" style={{ fontSize: "12px", color: "#10b981", fontWeight: "bold" }}>Includes HRA & Bonus</span>
              </div>
            </div >

        {/* Deductions */ }
        < div className = "emp-stat-card" style = {{ backgroundColor: "#ffffff", padding: "20px", borderRadius: "16px", border: "1px solid #e2e8f0" }
}>
    <div className="emp-stat-top" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                <span className="emp-stat-title" style={{ fontSize: "13px", fontWeight: "700", color: "#64748b" }}>Deductions</span>
                <div className="emp-stat-icon-box" style={{ backgroundColor: "#fef2f2", color: "#ef4444", padding: "8px", borderRadius: "10px" }}>
                  <CreditCard size={20} />
                </div>
              </div >
              <p className="emp-stat-value" style={{ fontSize: "24px", fontWeight: "800", color: "#000000", margin: 0 }}>
                {formatCurrency(latestStats.deductions + latestStats.tax)}
              </p>
              <div style={{ marginTop: "4px" }}>
                <span className="emp-stat-subtext" style={{ fontSize: "12px", color: "#ef4444", fontWeight: "bold" }}>Includes PF & Tax</span>
              </div>
            </div >

    {/* Net Salary */ }
    < div className = "emp-stat-card" style = {{ backgroundColor: "#ffffff", padding: "20px", borderRadius: "16px", border: "1px solid #e2e8f0" }}>
        <div className="emp-stat-top" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                <span className="emp-stat-title" style={{ fontSize: "13px", fontWeight: "700", color: "#64748b" }}>Net Salary</span>
                <div className="emp-stat-icon-box" style={{ backgroundColor: "#faf5ff", color: "#a855f7", padding: "8px", borderRadius: "10px" }}>
                  <Landmark size={20} />
                </div>
              </div >
              <p className="emp-stat-value" style={{ fontSize: "24px", fontWeight: "800", color: "#000000", margin: 0 }}>
                {formatCurrency(latestStats.netSalary)}
              </p>
              <div style={{ marginTop: "4px" }}>
                <span className="emp-stat-subtext" style={{ fontSize: "12px", color: "#059669", fontWeight: "bold" }}>Deposited successfully</span>
              </div>
            </div >
          </div >

    {/* Payslip History Box */ }
    < div className = "employee-directory-card" style = {{ backgroundColor: "#ffffff", borderRadius: "16px", border: "1px solid #e2e8f0" }}>
            <div className="filters-row" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 24px", borderBottom: "1px solid #f1f5f9" }}>
              <h2 className="emp-card-title" style={{ margin: 0, fontSize: "18px", fontWeight: "800", color: "#000000" }}>Payslip History</h2>
            </div>

            <div className="table-responsive">
              <table className="employee-table">
                <thead>
                  <tr>
                    <th style={{ padding: "14px 24px" }}>Month/Year</th>
                    <th style={{ padding: "14px 24px" }}>Basic Salary</th>
                    <th style={{ padding: "14px 24px" }}>Allowances</th>
                    <th style={{ padding: "14px 24px" }}>Deductions</th>
                    <th style={{ padding: "14px 24px" }}>Net Salary</th>
                    <th style={{ padding: "14px 24px" }}>Payment Status</th>
                    <th style={{ padding: "14px 24px", textAlign: "right" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="7" style={{ textAlign: "center", color: "#64748b", padding: "30px" }}>Loading payslips...</td>
                    </tr>
                  ) : payrolls.length === 0 ? (
                    <tr>
                      <td colSpan="7" style={{ textAlign: "center", color: "#64748b", padding: "30px" }}>No payroll items found for your account.</td>
                    </tr>
                  ) : (
                    payrolls.map((pay) => {
                      const totalAllowances = (pay.allowance || 0) + (pay.bonus || 0);
                      const totalDeductions = (pay.deductions || 0) + (pay.tax || 0);
                      const isPaid = pay.paymentStatus === "Paid";

                      return (
                        <tr key={pay._id} className="employee-row">
                          <td style={{ padding: "16px 24px", fontWeight: "700", color: "#0f172a" }}>
                            {pay.month} {pay.year}
                          </td>
                          <td style={{ padding: "16px 24px", color: "#334155" }}>
                            {formatCurrency(pay.basicSalary)}
                          </td>
                          <td style={{ padding: "16px 24px", color: "#059669" }}>
                            + {formatCurrency(totalAllowances)}
                          </td>
                          <td style={{ padding: "16px 24px", color: "#dc2626" }}>
                            - {formatCurrency(totalDeductions)}
                          </td>
                          <td style={{ padding: "16px 24px", fontWeight: "700", color: "#0f172a" }}>
                            {formatCurrency(pay.netSalary)}
                          </td>
                          <td style={{ padding: "16px 24px" }}>
                            <span
                              className="employee-status-badge active"
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                padding: "4px 10px",
                                borderRadius: "8px",
                                fontSize: "12px",
                                fontWeight: "700",
                                backgroundColor: isPaid ? "#ecfdf5" : "#fef3c7",
                                color: isPaid ? "#047857" : "#d97706",
                                border: isPaid ? "1px solid #a7f3d0" : "1px solid #fde68a"
                              }}
                            >
                              <span
                                className="bullet"
                                style={{
                                  backgroundColor: isPaid ? "#10b981" : "#f59e0b",
                                  width: "6px",
                                  height: "6px",
                                  borderRadius: "50%",
                                  marginRight: "6px"
                                }}
                              />
                              {pay.paymentStatus}
                            </span>
                          </td>
                          <td style={{ padding: "16px 24px", textAlign: "right" }}>
                            <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
                              <button
                                onClick={() => setSelectedSlip(pay)}
                                className="action-icon-btn"
                                title="View Payslip Summary"
                                style={{ display: "inline-flex", alignItems: "center", padding: "6px", cursor: "pointer" }}
                              >
                                <Eye size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div >
        </div >

    {/* Detailed Pop-up: Payslip Summary Viewer matches beautiful layout */ }
{
    selectedSlip && (
          <div style={{ position: "fixed", inset: 0, zIndex: 999, display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "rgba(15, 23, 42, 0.4)", backdropFilter: "blur(4px)" }}>
            <div style={{ backgroundColor: "#ffffff", borderRadius: "16px", border: "1px solid #e2e8f0", width: "550px", maxWidth: "90%", padding: "28px", boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)" }}>
              
              {/* Header */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", borderBottom: "1px solid #f1f5f9", paddingBottom: "12px" }}>
                <h3 style={{ margin: 0, fontSize: "18px", fontWeight: "800", color: "#0f172a" }}>
                  Payslip - {selectedSlip.month} {selectedSlip.year}
                </h3>
                <button onClick={() => setSelectedSlip(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "#64748b" }}>
                  <X size={20} />
                </button>
              </div>

              {/* Printable Body Section */}
              <div id="payslip-print-section" style={{ padding: "12px", border: "1px dashed #cbd5e1", borderRadius: "8px", backgroundColor: "#f8fafc", marginBottom: "20px" }}>
                <div className="header" style={{ display: "flex", justifyContent: "space-between", borderBottom: "2px solid #043e30", paddingBottom: "12px", marginBottom: "16px" }}>
                  <div>
                    <span className="company-name" style={{ fontSize: "20px", fontWeight: "800", color: "#043e30" }}>EMS Corporation</span>
                    <p style={{ margin: "2px 0 0 0", fontSize: "12px", color: "#64748b" }}>Corporate HQ, Tech City</p>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <h4 className="title" style={{ margin: 0, fontSize: "14px", fontWeight: "700" }}>Salary Slip</h4>
                    <p style={{ margin: "2px 0 0 0", fontSize: "12px", color: "#64748b" }}>Period: {selectedSlip.month} {selectedSlip.year}</p>
                  </div>
                </div>

                <div className="grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "20px" }}>
                  <div>
                    <div style={{ fontSize: "12px", color: "#64748b", fontWeight: "700" }}>EMPLOYEE DETAILS</div>
                    <div style={{ fontSize: "13px", fontWeight: "600", marginTop: "4px", color: "#1e293b" }}>{user?.name || "Akshaya Mehta"}</div>
                    <div style={{ fontSize: "12px", color: "#475569" }}>ID: {user?.employeeId || "EMP001"}</div>
                    <div style={{ fontSize: "12px", color: "#475569" }}>Email: {user?.email || "akshaya@gmail.com"}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: "12px", color: "#64748b", fontWeight: "700" }}>PAYMENT INFO</div>
                    <div style={{ fontSize: "13px", fontWeight: "600", marginTop: "4px", color: "#1e293b" }}>Status: {selectedSlip.paymentStatus}</div>
                    <div style={{ fontSize: "12px", color: "#475569" }}>
                      Date: {selectedSlip.paymentDate ? new Date(selectedSlip.paymentDate).toLocaleDateString() : "Processing"}
                    </div>
                    <div style={{ fontSize: "12px", color: "#475569" }}>Mode: Bank Transfer</div>
                  </div>
                </div>

                <div className="grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
                  {/* Earnings */}
                  <div>
                    <div className="section-title" style={{ fontSize: "11px", fontWeight: "800", textTransform: "uppercase", color: "#475569", borderBottom: "1px solid #cbd5e1", paddingBottom: "4px", marginBottom: "8px" }}>EARNINGS</div>
                    <div className="row" style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", padding: "4px 0" }}>
                      <span>Basic Salary</span>
                      <span style={{ fontWeight: "600" }}>{formatCurrency(selectedSlip.basicSalary)}</span>
                    </div>
                    <div className="row" style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", padding: "4px 0" }}>
                      <span>HRA / Allowance</span>
                      <span style={{ fontWeight: "600" }}>{formatCurrency(selectedSlip.allowance || 0)}</span>
                    </div>
                    <div className="row" style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", padding: "4px 0" }}>
                      <span>Bonus Credit</span>
                      <span style={{ fontWeight: "600" }}>{formatCurrency(selectedSlip.bonus || 0)}</span>
                    </div>
                  </div>

                  {/* Deductions */}
                  <div>
                    <div className="section-title" style={{ fontSize: "11px", fontWeight: "800", textTransform: "uppercase", color: "#475569", borderBottom: "1px solid #cbd5e1", paddingBottom: "4px", marginBottom: "8px" }}>DEDUCTIONS</div>
                    <div className="row" style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", padding: "4px 0" }}>
                      <span>PF Contribution</span>
                      <span style={{ fontWeight: "600" }}>{formatCurrency(selectedSlip.deductions || 0)}</span>
                    </div>
                    <div className="row" style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", padding: "4px 0" }}>
                      <span>Professional Tax</span>
                      <span style={{ fontWeight: "600" }}>{formatCurrency(selectedSlip.tax || 0)}</span>
                    </div>
                    <div className="row" style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", padding: "4px 0"
}}>
                      <span>—</span>
                      <span>—</span>
                    </div >
                  </div >
                </div >

    <div className="total-row" style={{ display: "flex", justifyContent: "space-between", fontSize: "14px", fontWeight: "800", borderTop: "1px solid #cbd5e1", borderBottom: "1px solid #cbd5e1", padding: "10px 0", marginTop: "12px", color: "#043e30" }}>
                  <span>NET TAKE-HOME SALARY</span>
                  <span>{formatCurrency(selectedSlip.netSalary)}</span>
                </div >
              </div >

    {/* Actions Footer */ }
    < div style = {{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                <button
                  type="button"
                  onClick={() => setSelectedSlip(null)}
                  style={{ padding: "8px 16px", border: "1px solid #cbd5e1", borderRadius: "6px", background: "#ffffff", fontSize: "13px", fontWeight: "700", cursor: "pointer", color: "#475569" }}
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={handlePrintSlip}
                  style={{ padding: "8px 16px", backgroundColor: "#043e30", color: "#ffffff", border: "none", borderRadius: "6px", fontSize: "13px", fontWeight: "700", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}
                >
                  <Printer size={14} />
                  <span>Print Slip</span>
                </button>
              </div >

            </div >
          </div >
        )}

      </div >
    </div >
  );
}
