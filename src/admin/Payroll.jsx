import { useState, useEffect } from "react";
import api from "../api";

// styles are loaded globally via src/index.css (Tailwind + custom styles)
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
    Clock,
    CheckCircle,
    X
} from "lucide-react";

export default function Payroll() {
    const [payrolls, setPayrolls] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    // Modal Control States
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

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
            const data = await api.getAllEmployees();
            setEmployees(data.employees || data.users || []);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchPayrolls = async () => {
        try {
            const data = await api.getPayrolls();
            setPayrolls(data.payrolls || []);
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
            const data = await api.createPayroll({
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
            });
            if (data && (data.payroll || data.message === "Payroll Created Successfully" || data.payroll)) {
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
                setIsAddModalOpen(false);
                setCurrentPage(1);
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
            const data = await api.deletePayroll(id);
            if (data && (data.message === "Payroll Deleted Successfully" || data.success)) {
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
            ? new Date(payroll.paymentDate).toLocaleDateString("en-IN", { year: 'numeric', month: 'long', day: 'numeric' })
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
                  <th style="width: 30%; text-align: right;">AMOUNT (INR)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style="font-weight: 600;">Basic Salary (Actual)</td>
                  <td style="text-align: right; font-weight: 700;">₹${basic.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
                </tr>
                <tr style="color: #0d9488;">
                  <td style="padding-left: 24px;">+ Allowance</td>
                  <td style="text-align: right;">₹${allow.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
                </tr>
                <tr style="color: #0d9488;">
                  <td style="padding-left: 24px;">+ Bonus</td>
                  <td style="text-align: right;">₹${bon.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
                </tr>
                <tr style="color: #b91c1c;">
                  <td style="padding-left: 24px;">- Reductions</td>
                  <td style="text-align: right;">₹${ded.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
                </tr>
                <tr style="color: #b91c1c;">
                  <td style="padding-left: 24px;">- Tax Withholding</td>
                  <td style="text-align: right;">₹${tx.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
                </tr>
                <tr class="total-net-row">
                  <td>NET DISBURSED AMOUNT</td>
                  <td style="text-align: right;">₹${net.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
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

    // Pagination Calculation
    const totalPages = Math.ceil(filteredPayrolls.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedPayrolls = filteredPayrolls.slice(startIndex, startIndex + itemsPerPage);

    return (
        <div className="p-6">
            {/* Header */}
            <div className="page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
                <div>
                    <h1 className="text-2xl font-bold">Payroll Center</h1>
                    <p className="text-sm text-slate-600">Disburse salaries, calculate taxes, deductions, and log payment records.</p>
                </div>
                <button
                    className="btn-enroll-employee"
                    onClick={() => {
                        setError("");
                        setSuccess("");
                        setIsAddModalOpen(true);
                    }}
                    style={{ display: "flex", alignItems: "center", gap: "8px" }}
                >
                    <Plus size={16} />
                    <span>Process Salary</span>
                </button>
            </div>

            {/* Stats Widget */}
            <div className="stats-grid mb-6">
                <div className="stat-card">
                    <div className="stat-header">
                        <div className="stat-icon-box bg-emerald-800">
                            <ArrowUpRight size={20} color="#ffffff" />
                        </div>
                        <div>
                            <p className="stat-label">Total Disbursed (Paid)</p>
                            <p className="stat-value">₹{totalDisbursed.toLocaleString("en-IN", { maximumFractionDigits: 0 })}</p>
                        </div>
                    </div>
                    <p className="stat-description">Successfully disbursed salaries</p>
                </div>

                <div className="stat-card">
                    <div className="stat-header">
                        <div className="stat-icon-box bg-amber-600">
                            <Clock size={20} color="#ffffff" />
                        </div>
                        <div>
                            <p className="stat-label">Total Outstandings (Pending)</p>
                            <p className="stat-value">₹{pendingDisbursed.toLocaleString("en-IN", { maximumFractionDigits: 0 })}</p>
                        </div>
                    </div>
                    <p className="stat-description">Pending disbursements</p>
                </div>

                <div className="stat-card">
                    <div className="stat-header">
                        <div className="stat-icon-box bg-emerald-700">
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
                <div className="flex items-center gap-2 text-rose-700 bg-rose-50 p-3 rounded-md mb-5">
                    <AlertCircle size={16} />
                    <span>{error}</span>
                </div>
            )}

            {success && (
                <div className="text-emerald-800 bg-emerald-50 p-3 rounded-md mb-5">{success}</div>
            )}


            {/* Main Grid split */}
            <div className="grid lg:grid-cols-[2.3fr_1fr] gap-6 items-start">

                {/* Payroll List */}
                <div className="bg-white rounded-xl p-6 shadow-sm">
                    <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
                        <h2 className="text-lg font-semibold">Payroll Logs</h2>

                        {/* Local Filter controls */}
                        <div className="flex gap-2">
                            <select value={searchYear} onChange={(e) => setSearchYear(e.target.value)} className="px-3 py-2 rounded-md border border-slate-300 text-sm bg-white">
                                <option value="All Years">All Years</option>
                                <option value="2025">2025</option>
                                <option value="2026">2026</option>
                                <option value="2027">2027</option>
                            </select>

                            <select value={searchMonth} onChange={(e) => setSearchMonth(e.target.value)} className="px-3 py-2 rounded-md border border-slate-300 text-sm bg-white">
                                <option value="All Months">All Months</option>
                                {[["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]][0].map(m => (
                                    <option key={m} value={m}>{m}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="overflow-auto rounded-md border border-slate-100">
                        <table className="min-w-full divide-y table-fixed">
                            <thead>
                                <tr>
                                    <th className="table-col-3xl">EMPLOYEE</th>
                                    <th className="table-col-lg">PERIOD</th>
                                    <th className="table-col-md table-number-col">BASIC (₹)</th>
                                    <th className="table-col-md table-number-col">REDUCTION (₹)</th>
                                    <th className="table-col-md table-number-col">TAX (₹)</th>
                                    <th className="table-col-md table-number-col">NET PAID (₹)</th>
                                    <th className="table-col-sm table-center-col">STATUS</th>
                                    <th className="table-col-actions table-actions-col">ACTIONS</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan="8" className="text-center py-8">Loading payroll data...</td>
                                    </tr>
                                ) : paginatedPayrolls.length === 0 ? (
                                    <tr>
                                        <td colSpan="8" className="text-center py-8">No payroll records found matching filters.</td>
                                    </tr>
                                ) : (

                                    filteredPayrolls.map((payroll) => (
                                        <tr key={payroll._id} className="border-b last:border-b-0">
                                            <td className="px-4 py-3">
                                                <div>
                                                    <p className="font-semibold text-slate-900 text-sm">{payroll.employeeId?.firstName} {payroll.employeeId?.lastName}</p>
                                                    <p className="text-xs text-slate-500">{payroll.employeeId?.employeeId}</p>
                                                </div>
                                            </td>

                                            <td className="px-4 py-3">
                                                <span className="text-sm font-medium text-slate-600">{payroll.month} {payroll.year}</span>
                                            </td>
                                            <td className="px-4 py-3 text-right font-semibold">{(payroll.basicSalary || 0).toLocaleString()}</td>
                                            <td className="px-4 py-3 text-right text-rose-600">-{(payroll.deductions || 0).toLocaleString()}</td>
                                            <td className="px-4 py-3 text-right text-rose-600">-{(payroll.tax || 0).toLocaleString()}</td>
                                            <td className="px-4 py-3 text-right font-bold text-emerald-700">{(payroll.netSalary || 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}</td>
                                            <td className="px-4 py-3 text-center">
                                                <span className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${payroll.paymentStatus === 'Paid' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-600'}`}>
                                                    {payroll.paymentStatus === "Paid" ? "✓ Paid" : "⚠ Pending"}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <div className="flex gap-2 justify-end">
                                                    <button onClick={() => handleDownloadPayslip(payroll)} className="px-2 py-1 rounded-md bg-slate-100 text-slate-700 text-sm font-semibold flex items-center gap-2" title="Print Pay Slip / Save as PDF">
                                                        <Download size={14} />
                                                        <span>Slip</span>
                                                    </button>
                                                    <button onClick={() => handleDeletePayroll(payroll._id)} className="text-rose-600 hover:text-rose-800">
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

                    {/* Pagination Controls */}
                    {totalPages > 1 && (
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "16px" }}>
                            <span style={{ fontSize: "13px", color: "#64748b" }}>
                                Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredPayrolls.length)} of {filteredPayrolls.length} records
                            </span>
                            <div style={{ display: "flex", gap: "8px" }}>
                                <button
                                    disabled={currentPage === 1}
                                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                    className="btn-close"
                                    style={{ padding: "6px 12.5px" }}
                                >
                                    Previous
                                </button>
                                <span style={{ fontSize: "14px", fontWeight: "600", alignSelf: "center" }}>
                                    {currentPage} of {totalPages}
                                </span>
                                <button
                                    disabled={currentPage === totalPages}
                                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                    className="btn-close"
                                    style={{ padding: "6px 12.5px" }}
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    )}
                    </div>

                {/* Process Salary Form */}
                <div className="bg-white rounded-xl p-6 shadow-sm">
                    <h2 className="text-lg font-semibold mb-4">Process Salary</h2>
                    <form onSubmit={handleAddPayroll}>

                        <div className="mb-3">
                            <label className="block text-xs font-semibold uppercase text-slate-600 mb-2">Employee*</label>
                            <select value={selectedEmpId} onChange={(e) => setSelectedEmpId(e.target.value)} className="w-full px-3 py-2 rounded-md border border-slate-300">
                                <option value="">Select Employee...</option>
                                {employees.map(emp => (<option key={emp._id} value={emp._id}>{emp.firstName} {emp.lastName} ({emp.employeeId})</option>))}
                            </select>
                        </div>

                        <div className="grid grid-cols-2 gap-2 mb-3">
                            <div>
                                <label className="block text-xs font-semibold uppercase text-slate-600 mb-2">Month*</label>
                                <select value={month} onChange={(e) => setMonth(e.target.value)} className="w-full px-3 py-2 rounded-md border border-slate-300">
                                    <option value="">Month</option>
                                    {["January","February","March","April","May","June","July","August","September","October","November","December"].map(m=> (<option key={m} value={m}>{m}</option>))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold uppercase text-slate-600 mb-2">Year*</label>
                                <input type="number" value={year} onChange={(e)=>setYear(e.target.value)} placeholder="e.g. 2026" className="w-full px-3 py-2 rounded-md border border-slate-300" />
                            </div>

                        </div>


                        <div className="mb-3">
                            <label className="block text-xs font-semibold uppercase text-slate-600 mb-2">Basic Salary* ($)</label>
                            <input type="number" value={basicSalary} onChange={(e)=>setBasicSalary(e.target.value)} placeholder="e.g. 5000" className="w-full px-3 py-2 rounded-md border border-slate-300" />
                        </div>

                        <div className="grid grid-cols-2 gap-2 mb-3">
                            <div>
                                <label className="block text-xs font-semibold uppercase text-slate-600 mb-2">Allowance ($)</label>
                                <input type="number" value={allowance} onChange={(e)=>setAllowance(e.target.value)} className="w-full px-3 py-2 rounded-md border border-slate-300" />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold uppercase text-slate-600 mb-2">Bonus ($)</label>
                                <input type="number" value={bonus} onChange={(e)=>setBonus(e.target.value)} className="w-full px-3 py-2 rounded-md border border-slate-300" />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2 mb-3">
                            <div>
                                <label className="block text-xs font-semibold uppercase text-slate-600 mb-2">Reductions ($)</label>
                                <input type="number" value={deductions} onChange={(e)=>setDeductions(e.target.value)} placeholder="Deduction/Reduction" className="w-full px-3 py-2 rounded-md border border-slate-300" />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold uppercase text-slate-600 mb-2">Income Tax ($)</label>
                                <input type="number" value={tax} onChange={(e)=>setTax(e.target.value)} placeholder="Tax" className="w-full px-3 py-2 rounded-md border border-slate-300" />
                            </div>
                        </div>

                        {/* Calculated Net Salary Indicator */}
                        {basicSalary && (
                            <>
                                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-md mb-3 flex justify-between items-center text-sm">
                                    <span className="font-semibold text-emerald-700">Estimated Net:</span>
                                    <span className="font-bold text-emerald-700">${getCalculatedNet().toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
                                </div>

                                <div className="grid grid-cols-[1fr_1.2fr] gap-2 mb-5">
                            <div>
                                <label className="block text-xs font-semibold uppercase text-slate-600 mb-2">Payment Status*</label>
                                <select value={paymentStatus} onChange={(e)=>setPaymentStatus(e.target.value)} className="w-full px-3 py-2 rounded-md border border-slate-300">
                                    <option value="Pending">Pending</option>
                                    <option value="Paid">Paid</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold uppercase text-slate-600 mb-2">Payment Date</label>
                                <input type="date" value={paymentDate} onChange={(e)=>setPaymentDate(e.target.value)} className="w-full px-3 py-2 rounded-md border border-slate-300" />
                            </div>

                                </div>
                            </>
                        )}

                        <button type="submit" className="w-full py-2 rounded-md bg-emerald-800 text-white font-semibold flex items-center justify-center gap-2">
                            <Plus size={16} />
                            <span>Process Salary Disbursal</span>
                        </button>
                    </form>
                </div>

            </div>
        </div>
    );
}
