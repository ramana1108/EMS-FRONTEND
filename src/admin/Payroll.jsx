import { useState, useEffect } from "react";
import "../App.css";
import {
    Wallet,
    Plus,
    Trash2,
    Download,
    Calendar,
    ArrowUpRight,
    TrendingDown,
    Percent,
    AlertCircle,
    Clock
} from "lucide-react";

export default function Payroll() {
    const [payrolls, setPayrolls] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    // Form Fields
    const [selectedEmpId, setSelectedEmpId] = useState("");
    const [month, setMonth] = useState("");
    const [year, setYear] = useState(new Date().getFullYear());
    const [basicSalary, setBasicSalary] = useState("");
    const [allowance, setAllowance] = useState("0");
    const [bonus, setBonus] = useState("0");
    const [deductions, setDeductions] = useState("0");
    const [tax, setTax] = useState("0");
    const [paymentStatus, setPaymentStatus] = useState("Pending");
    const [paymentDate, setPaymentDate] = useState("");

    // Search/Filters
    const [searchYear, setSearchYear] = useState("All Years");
    const [searchMonth, setSearchMonth] = useState("All Months");

    const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

    function getHeaders() {
        const token = localStorage.getItem("token");
        return token
            ? { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }
            : { "Content-Type": "application/json" };
    }

    const fetchEmployees = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/employees`, {
                headers: getHeaders(),
            });
            const data = await res.json();
            if (res.ok) {
                setEmployees(data.employees || []);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const fetchPayrolls = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/payrolls`, {
                headers: getHeaders(),
            });
            const data = await res.json();
            if (res.ok) {
                setPayrolls(data.payrolls || []);
            } else {
                setError(data.message || "Failed to fetch payrolls");
            }
        } catch (err) {
            console.error(err);
            setError("Failed to fetch payroll data");
        }
    };

    const loadData = async () => {
        setLoading(true);
        await Promise.all([fetchPayrolls(), fetchEmployees()]);
        setLoading(false);
    };

    useEffect(() => {
        loadData();
    }, []);

    // Set default basic salary when employee is selected
    useEffect(() => {
        if (selectedEmpId) {
            const emp = employees.find(e => e._id === selectedEmpId);
            if (emp && emp.salary) {
                setBasicSalary(emp.salary.toString());
            } else {
                setBasicSalary("");
            }
        } else {
            setBasicSalary("");
        }
    }, [selectedEmpId, employees]);

    const handleAddPayroll = async (e) => {
        e.preventDefault();
        if (!selectedEmpId || !month || !year || !basicSalary || !paymentStatus) {
            setError("Please fill out all required fields: Employee, Month, Year, Basic Salary, Status");
            return;
        }
        setError("");
        setSuccess("");
        try {
            const res = await fetch(`${API_BASE_URL}/payrolls`, {
                method: "POST",
                headers: getHeaders(),
                body: JSON.stringify({
                    employeeId: selectedEmpId,
                    month,
                    year: Number(year),
                    basicSalary: Number(basicSalary),
                    allowance: Number(allowance),
                    bonus: Number(bonus),
                    deductions: Number(deductions),
                    tax: Number(tax),
                    paymentStatus,
                    paymentDate: paymentDate ? new Date(paymentDate) : undefined,
                }),
            });
            const data = await res.json();
            if (res.ok) {
                setSuccess("Payroll processed successfully!");
                setSelectedEmpId("");
                setMonth("");
                setBasicSalary("");
                setAllowance("0");
                setBonus("0");
                setDeductions("0");
                setTax("0");
                setPaymentStatus("Pending");
                setPaymentDate("");
                fetchPayrolls();
            } else {
                setError(data.message || "Failed to process payroll");
            }
        } catch (err) {
            console.error(err);
            setError("An error occurred while processing payroll");
        }
    };

    const handleDeletePayroll = async (id) => {
        if (!window.confirm("Are you sure you want to delete this payroll record?")) return;
        setError("");
        setSuccess("");
        try {
            const res = await fetch(`${API_BASE_URL}/payrolls/${id}`, {
                method: "DELETE",
                headers: getHeaders(),
            });
            const data = await res.json();
            if (res.ok) {
                setSuccess("Payroll record deleted successfully!");
                fetchPayrolls();
            } else {
                setError(data.message || "Failed to delete payroll record");
            }
        } catch (err) {
            console.error(err);
            setError("Failed to delete payroll record");
        }
    };

    // Helper: Print / Download PDF Payslip
    const handleDownloadPayslip = (payroll) => {
        const printWindow = window.open("", "_blank");
        if (!printWindow) {
            alert("Please allow popups to download payslip PDF!");
            return;
        }

        const basic = Number(payroll.basicSalary || 0);
        const allow = Number(payroll.allowance || 0);
        const bon = Number(payroll.bonus || 0);
        const ded = Number(payroll.deductions || 0);
        const tx = Number(payroll.tax || 0);
        const net = Number(payroll.netSalary || (basic + allow + bon - ded - tx));

        const formattedPaymentDate = payroll.paymentDate
            ? new Date(payroll.paymentDate).toLocaleDateString("en-US", { year: 'numeric', month: 'long', day: 'numeric' })
            : "N/A";

        printWindow.document.write(`
      <html>
        <head>
          <title>Payslip - ${payroll.employeeId?.firstName} ${payroll.employeeId?.lastName}</title>
          <style>
            body { font-family: 'Segoe UI', Arial, sans-serif; padding: 40px; color: #1e293b; background-color: #ffffff; }
            .slip-card { border: 2px solid #e2e8f0; border-radius: 12px; padding: 32px; max-width: 800px; margin: 0 auto; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.05); }
            .header-row { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #059669; padding-bottom: 20px; margin-bottom: 30px; }
            .header-left h1 { color: #065f46; margin: 0; font-size: 28px; font-weight: 800; letter-spacing: -0.5px; }
            .header-right { text-align: right; }
            .company { font-weight: 700; color: #0d9488; font-size: 16px; margin: 0; }
            .meta-info { color: #64748b; font-size: 12px; margin-top: 4px; }
            .grid-details { display: grid; grid-template-columns: 1fr 1fr; gap: 20px 40px; margin-bottom: 30px; font-size: 14px; background-color: #f8fafc; padding: 20px; border-radius: 8px; }
            .detail-item { display: flex; justify-content: space-between; border-bottom: 1px dashed #cbd5e1; padding-bottom: 6px; }
            .detail-label { font-weight: 600; color: #64748b; }
            .detail-val { font-weight: 700; color: #1e293b; }
            .table-calculations { width: 100%; border-collapse: collapse; margin: 30px 0; }
            .table-calculations th, .table-calculations td { padding: 14px; border-bottom: 1px solid #cbd5e1; text-align: left; }
            .table-calculations th { background-color: #f1f5f9; font-weight: 700; color: #475569; font-size: 13px; }
            .table-calculations td { font-size: 14px; }
            .total-net-row { font-size: 18px; font-weight: 800; background-color: #ecfdf5; color: #065f46; }
            .total-net-row td { border-top: 2px solid #059669; border-bottom: 2px solid #059669; }
            .notes-footer { text-align: center; margin-top: 50px; border-top: 1px solid #e2e8f0; padding-top: 24px; color: #64748b; font-size: 12px; }
            @media print {
              body { padding: 0; }
              .slip-card { border: none; box-shadow: none; max-width: 100%; padding: 0; }
            }
          </style>
        </head>
        <body>
          <div class="slip-card">
            <div class="header-row">
              <div class="header-left">
                <h1>PAYSLIP</h1>
                <p class="company">Enterprise Employee Management System (EMS)</p>
              </div>
              <div class="header-right">
                <span style="font-weight: 700; padding: 4px 12px; border-radius: 20px; font-size: 12px; text-transform: uppercase; background-color: ${payroll.paymentStatus === 'Paid' ? '#ecfdf5' : '#fef2f2'}; color: ${payroll.paymentStatus === 'Paid' ? '#065f46' : '#b91c1c'}; border: 1px solid ${payroll.paymentStatus === 'Paid' ? '#34d399' : '#fca5a5'}">
                  ${payroll.paymentStatus}
                </span>
                <p class="meta-info" style="margin-top: 8px;">Month: <strong>${payroll.month} ${payroll.year}</strong></p>
              </div>
            </div>

            <div class="grid-details">
              <div class="detail-item">
                <span class="detail-label">Employee ID:</span>
                <span class="detail-val">${payroll.employeeId?.employeeId || "N/A"}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Employee Name:</span>
                <span class="detail-val">${payroll.employeeId?.firstName || ""} ${payroll.employeeId?.lastName || "Unknown"}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Email Address:</span>
                <span class="detail-val">${payroll.employeeId?.email || "N/A"}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Payment Date:</span>
                <span class="detail-val">${formattedPaymentDate}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Salary Period From:</span>
                <span class="detail-val">01-${payroll.month?.slice(0, 3)}-${payroll.year}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Salary Period To:</span>
                <span class="detail-val">End of ${payroll.month}-${payroll.year}</span>
              </div>
            </div>

            <table class="table-calculations">
              <thead>
                <tr>
                  <th style="width: 70%;">EARNINGS / DEDUCTIONS DETAILS</th>
                  <th style="width: 30%; text-align: right;">AMOUNT (USD)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style="font-weight: 600;">Basic Salary (Actual)</td>
                  <td style="text-align: right; font-weight: 700;">$${basic.toLocaleString("en-US", { minimumFractionDigits: 2 })}</td>
                </tr>
                <tr style="color: #0d9488;">
                  <td style="padding-left: 24px;">+ Allowance</td>
                  <td style="text-align: right;">$${allow.toLocaleString("en-US", { minimumFractionDigits: 2 })}</td>
                </tr>
                <tr style="color: #0d9488;">
                  <td style="padding-left: 24px;">+ Bonus</td>
                  <td style="text-align: right;">$${bon.toLocaleString("en-US", { minimumFractionDigits: 2 })}</td>
                </tr>
                <tr style="color: #b91c1c;">
                  <td style="padding-left: 24px;">- Reductions</td>
                  <td style="text-align: right;">$${ded.toLocaleString("en-US", { minimumFractionDigits: 2 })}</td>
                </tr>
                <tr style="color: #b91c1c;">
                  <td style="padding-left: 24px;">- Tax Withholding</td>
                  <td style="text-align: right;">$${tx.toLocaleString("en-US", { minimumFractionDigits: 2 })}</td>
                </tr>
                <tr class="total-net-row">
                  <td>NET DISBURSED AMOUNT</td>
                  <td style="text-align: right;">$${net.toLocaleString("en-US", { minimumFractionDigits: 2 })}</td>
                </tr>
              </tbody>
            </table>

            <div class="notes-footer">
              <p>This document is digitally rendered and verified. No physical signature is required.</p>
              <p style="margin-top: 4px; font-size: 10px; color: #94a3b8;">Printed on: ${new Date().toLocaleString()}</p>
            </div>
          </div>
          <script>
            window.onload = function() {
              window.print();
            };
          </script>
        </body>
      </html>
    `);
        printWindow.document.close();
    };

    // Derive calculated net salary locally for the form
    const getCalculatedNet = () => {
        const basic = Number(basicSalary || 0);
        const allow = Number(allowance || 0);
        const bon = Number(bonus || 0);
        const ded = Number(deductions || 0);
        const tx = Number(tax || 0);
        return basic + allow + bon - ded - tx;
    };

    // Monthly breakdown stats
    const totalDisbursed = payrolls
        .filter(p => p.paymentStatus === "Paid")
        .reduce((sum, p) => sum + (p.netSalary || 0), 0);

    const pendingDisbursed = payrolls
        .filter(p => p.paymentStatus === "Pending")
        .reduce((sum, p) => sum + (p.netSalary || 0), 0);

    const filteredPayrolls = payrolls.filter(p => {
        const matchesYear = searchYear === "All Years" || p.year === Number(searchYear);
        const matchesMonth = searchMonth === "All Months" || p.month === searchMonth;
        return matchesYear && matchesMonth;
    });

    return (
        <div className="p-6">
            {/* Header */}
            <div className="page-header">
                <div>
                    <h1 className="dashboard-title">Payroll Center</h1>
                    <p className="dashboard-subtitle">Disburse salaries, calculate taxes, deductions, and log payment records.</p>
                </div>
            </div>

            {/* Stats Widget */}
            <div className="stats-grid" style={{ marginBottom: "24px" }}>
                <div className="stat-card">
                    <div className="stat-header">
                        <div className="stat-icon-box active-staff-icon" style={{ backgroundColor: "#065f46" }}>
                            <ArrowUpRight size={20} color="#ffffff" />
                        </div>
                        <div>
                            <p className="stat-label">Total Disbursed (Paid)</p>
                            <p className="stat-value">${totalDisbursed.toLocaleString("en-US", { maximumFractionDigits: 0 })}</p>
                        </div>
                    </div>
                    <p className="stat-description">Successfully disbursed salaries</p>
                </div>

                <div className="stat-card">
                    <div className="stat-header">
                        <div className="stat-icon-box depts-icon" style={{ backgroundColor: "#d97706" }}>
                            <Clock size={20} color="#ffffff" />
                        </div>
                        <div>
                            <p className="stat-label">Total Outstandings (Pending)</p>
                            <p className="stat-value">${pendingDisbursed.toLocaleString("en-US", { maximumFractionDigits: 0 })}</p>
                        </div>
                    </div>
                    <p className="stat-description">Pending disbursements</p>
                </div>

                <div className="stat-card">
                    <div className="stat-header">
                        <div className="stat-icon-box total-employees-icon" style={{ backgroundColor: "#0d9488" }}>
                            <Percent size={20} color="#ffffff" />
                        </div>
                        <div>
                            <p className="stat-label">Processed Months</p>
                            <p className="stat-value">{Array.from(new Set(payrolls.map(p => `${p.month}-${p.year}`))).length}</p>
                        </div>
                    </div>
                    <p className="stat-description">Unique monthly logs</p>
                </div>
            </div>

            {error && (
                <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#b91c1c", backgroundColor: "#fef2f2", padding: "12px", borderRadius: "8px", marginBottom: "20px", fontSize: "14px" }}>
                    <AlertCircle size={16} />
                    <span>{error}</span>
                </div>
            )}

            {success && (
                <div style={{ color: "#065f46", backgroundColor: "#ecfdf5", padding: "12px", borderRadius: "8px", marginBottom: "20px", fontSize: "14px" }}>
                    {success}
                </div>
            )}

            {/* Main Grid split */}
            <div className="emp-middle-grid" style={{ display: "grid", gridTemplateColumns: "2.3fr 1fr", gap: "24px", alignItems: "start" }}>

                {/* Payroll List */}
                <div className="employee-directory-card" style={{ padding: "24px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "10px" }}>
                        <h2 className="emp-card-title" style={{ margin: 0 }}>Payroll Logs</h2>

                        {/* Local Filter controls */}
                        <div style={{ display: "flex", gap: "8px" }}>
                            <select
                                value={searchYear}
                                onChange={(e) => setSearchYear(e.target.value)}
                                style={{ padding: "6px 12px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "13px", backgroundColor: "#ffffff" }}
                            >
                                <option value="All Years">All Years</option>
                                <option value="2025">2025</option>
                                <option value="2026">2026</option>
                                <option value="2027">2027</option>
                            </select>
                            <select
                                value={searchMonth}
                                onChange={(e) => setSearchMonth(e.target.value)}
                                style={{ padding: "6px 12px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "13px", backgroundColor: "#ffffff" }}
                            >
                                <option value="All Months">All Months</option>
                                {["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"].map(m => (
                                    <option key={m} value={m}>{m}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="table-responsive">
                        <table className="employee-table">
                            <thead>
                                <tr>
                                    <th style={{ padding: "12px" }}>EMPLOYEE</th>
                                    <th style={{ padding: "12px" }}>PERIOD</th>
                                    <th style={{ padding: "12px", textAlign: "right" }}>BASIC ($)</th>
                                    <th style={{ padding: "12px", textAlign: "right" }}>REDUCTION ($)</th>
                                    <th style={{ padding: "12px", textAlign: "right" }}>TAX ($)</th>
                                    <th style={{ padding: "12px", textAlign: "right" }}>NET PAID ($)</th>
                                    <th style={{ padding: "12px", textAlign: "center" }}>STATUS</th>
                                    <th style={{ padding: "12px", textAlign: "right" }}>ACTIONS</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan="8" style={{ textAlign: "center", padding: "30px 0" }}>Loading payroll data...</td>
                                    </tr>
                                ) : filteredPayrolls.length === 0 ? (
                                    <tr>
                                        <td colSpan="8" style={{ textAlign: "center", padding: "30px 0" }}>No payroll records found matching filters.</td>
                                    </tr>
                                ) : (
                                    filteredPayrolls.map((payroll) => (
                                        <tr key={payroll._id} className="employee-row">
                                            <td style={{ padding: "12px" }}>
                                                <div>
                                                    <p style={{ fontWeight: "700", color: "#1e293b", fontSize: "14px" }}>
                                                        {payroll.employeeId?.firstName} {payroll.employeeId?.lastName}
                                                    </p>
                                                    <p style={{ fontSize: "11px", color: "#64748b" }}>{payroll.employeeId?.employeeId}</p>
                                                </div>
                                            </td>
                                            <td style={{ padding: "12px" }}>
                                                <span style={{ fontSize: "13px", fontWeight: "600", color: "#475569" }}>
                                                    {payroll.month} {payroll.year}
                                                </span>
                                            </td>
                                            <td style={{ padding: "12px", textAlign: "right", fontWeight: "600" }}>
                                                {(payroll.basicSalary || 0).toLocaleString()}
                                            </td>
                                            <td style={{ padding: "12px", textAlign: "right", color: "#b91c1c" }}>
                                                -{(payroll.deductions || 0).toLocaleString()}
                                            </td>
                                            <td style={{ padding: "12px", textAlign: "right", color: "#b91c1c" }}>
                                                -{(payroll.tax || 0).toLocaleString()}
                                            </td>
                                            <td style={{ padding: "12px", textAlign: "right", fontWeight: "700", color: "#065f46" }}>
                                                {(payroll.netSalary || 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                                            </td>
                                            <td style={{ padding: "12px", textAlign: "center" }}>
                                                <span style={{
                                                    padding: "2px 8px",
                                                    fontSize: "11px",
                                                    fontWeight: "750",
                                                    borderRadius: "12px",
                                                    display: "inline-block",
                                                    backgroundColor: payroll.paymentStatus === "Paid" ? "#ecfdf5" : "#fef2f2",
                                                    color: payroll.paymentStatus === "Paid" ? "#065f46" : "#b91c1c"
                                                }}>
                                                    {payroll.paymentStatus === "Paid" ? "✓ Paid" : "⚠ Pending"}
                                                </span>
                                            </td>
                                            <td style={{ padding: "12px", textAlign: "right" }}>
                                                <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
                                                    <button
                                                        onClick={() => handleDownloadPayslip(payroll)}
                                                        style={{
                                                            border: "none",
                                                            backgroundColor: "#e2e8f0",
                                                            color: "#475569",
                                                            padding: "4px 8px",
                                                            borderRadius: "6px",
                                                            cursor: "pointer",
                                                            display: "flex",
                                                            alignItems: "center",
                                                            gap: "4px",
                                                            fontSize: "12px",
                                                            fontWeight: "600"
                                                        }}
                                                        title="Print Pay Slip / Save as PDF"
                                                    >
                                                        <Download size={14} />
                                                        <span>Slip</span>
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeletePayroll(payroll._id)}
                                                        className="action-icon-btn delete"
                                                        style={{ border: "none", background: "none", cursor: "pointer", color: "#b91c1c" }}
                                                        title="Delete Record"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Process Salary Form */}
                <div className="emp-card-box" style={{ padding: "24px" }}>
                    <h2 className="emp-card-title" style={{ marginBottom: "16px" }}>Process Salary</h2>
                    <form onSubmit={handleAddPayroll}>

                        <div style={{ marginBottom: "12px" }}>
                            <label style={{ display: "block", fontSize: "11px", fontWeight: "700", textTransform: "uppercase", color: "#475569", marginBottom: "4px" }}>Employee*</label>
                            <select
                                value={selectedEmpId}
                                onChange={(e) => setSelectedEmpId(e.target.value)}
                                style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid #cbd5e1", backgroundColor: "#ffffff" }}
                            >
                                <option value="">Select Employee...</option>
                                {employees.map(emp => (
                                    <option key={emp._id} value={emp._id}>
                                        {emp.firstName} {emp.lastName} ({emp.employeeId})
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "12px" }}>
                            <div>
                                <label style={{ display: "block", fontSize: "11px", fontWeight: "700", textTransform: "uppercase", color: "#475569", marginBottom: "4px" }}>Month*</label>
                                <select
                                    value={month}
                                    onChange={(e) => setMonth(e.target.value)}
                                    style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid #cbd5e1", backgroundColor: "#ffffff" }}
                                >
                                    <option value="">Month</option>
                                    {["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"].map(m => (
                                        <option key={m} value={m}>{m}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label style={{ display: "block", fontSize: "11px", fontWeight: "700", textTransform: "uppercase", color: "#475569", marginBottom: "4px" }}>Year*</label>
                                <input
                                    type="number"
                                    value={year}
                                    onChange={(e) => setYear(e.target.value)}
                                    style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid #cbd5e1" }}
                                    placeholder="e.g. 2026"
                                />
                            </div>
                        </div>

                        <div style={{ marginBottom: "12px" }}>
                            <label style={{ display: "block", fontSize: "11px", fontWeight: "700", textTransform: "uppercase", color: "#475569", marginBottom: "4px" }}>Basic Salary* ($)</label>
                            <input
                                type="number"
                                value={basicSalary}
                                onChange={(e) => setBasicSalary(e.target.value)}
                                style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid #cbd5e1" }}
                                placeholder="e.g. 5000"
                            />
                        </div>

                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "12px" }}>
                            <div>
                                <label style={{ display: "block", fontSize: "11px", fontWeight: "700", textTransform: "uppercase", color: "#475569", marginBottom: "4px" }}>Allowance ($)</label>
                                <input
                                    type="number"
                                    value={allowance}
                                    onChange={(e) => setAllowance(e.target.value)}
                                    style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid #cbd5e1" }}
                                />
                            </div>
                            <div>
                                <label style={{ display: "block", fontSize: "11px", fontWeight: "700", textTransform: "uppercase", color: "#475569", marginBottom: "4px" }}>Bonus ($)</label>
                                <input
                                    type="number"
                                    value={bonus}
                                    onChange={(e) => setBonus(e.target.value)}
                                    style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid #cbd5e1" }}
                                />
                            </div>
                        </div>

                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "12px" }}>
                            <div>
                                <label style={{ display: "block", fontSize: "11px", fontWeight: "700", textTransform: "uppercase", color: "#475569", marginBottom: "4px" }}>Reductions ($)</label>
                                <input
                                    type="number"
                                    value={deductions}
                                    onChange={(e) => setDeductions(e.target.value)}
                                    style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid #cbd5e1" }}
                                    placeholder="Deduction/Reduction"
                                />
                            </div>
                            <div>
                                <label style={{ display: "block", fontSize: "11px", fontWeight: "700", textTransform: "uppercase", color: "#475569", marginBottom: "4px" }}>Income Tax ($)</label>
                                <input
                                    type="number"
                                    value={tax}
                                    onChange={(e) => setTax(e.target.value)}
                                    style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid #cbd5e1" }}
                                    placeholder="Tax"
                                />
                            </div>
                        </div>

                        {/* Calculated Net Salary Indicator */}
                        {basicSalary && (
                            <div style={{ padding: "10px", backgroundColor: "#f0fdf4", border: "1px solid #34d399", borderRadius: "6px", marginBottom: "12px", fontSize: "13px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <span style={{ fontWeight: "700", color: "#065f46" }}>Estimated Net:</span>
                                <span style={{ fontWeight: "800", color: "#065f46" }}>${getCalculatedNet().toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
                            </div>
                        )}

                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr", gap: "10px", marginBottom: "20px" }}>
                            <div>
                                <label style={{ display: "block", fontSize: "11px", fontWeight: "700", textTransform: "uppercase", color: "#475569", marginBottom: "4px" }}>Payment Status*</label>
                                <select
                                    value={paymentStatus}
                                    onChange={(e) => setPaymentStatus(e.target.value)}
                                    style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid #cbd5e1", backgroundColor: "#ffffff" }}
                                >
                                    <option value="Pending">Pending</option>
                                    <option value="Paid">Paid</option>
                                </select>
                            </div>
                            <div>
                                <label style={{ display: "block", fontSize: "11px", fontWeight: "700", textTransform: "uppercase", color: "#475569", marginBottom: "4px" }}>Payment Date</label>
                                <input
                                    type="date"
                                    value={paymentDate}
                                    onChange={(e) => setPaymentDate(e.target.value)}
                                    style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid #cbd5e1" }}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            style={{ width: "100%", padding: "10px", backgroundColor: "#065f46", color: "#ffffff", border: "none", borderRadius: "6px", fontWeight: "600", fontSize: "14px", cursor: "pointer", display: "flex", alignItems: "center", justifyBox: "center", justifyContent: "center", gap: "8px" }}
                        >
                            <Plus size={16} />
                            <span>Process Salary Disbursal</span>
                        </button>
                    </form>
                </div>

            </div>
        </div >
    );
}
