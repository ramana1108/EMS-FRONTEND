import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Users,
  Megaphone,
  Building2,
  FileText,
  X,
  ChevronRight,
  ArrowRight
} from "lucide-react";
import api from "../api";

export default function PredictiveSearchBar({ searchTerm, setSearchTerm, placeholder = "Search Employees, Notices, Departments..." }) {
  const [isOpen, setIsOpen] = useState(false);
  const [data, setData] = useState({ employees: [], notices: [], departments: [] });
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Load search index data dynamically from API / cache
  useEffect(() => {
    let mounted = true;
    const fetchSearchData = async () => {
      setLoading(true);
      try {
        const [dashRes, empRes] = await Promise.all([
          api.getAdminDashboard().catch(() => null),
          api.getAllEmployees().catch(() => null)
        ]);

        if (!mounted) return;

        const employeeList = Array.isArray(empRes) ? empRes : empRes?.employees || dashRes?.dashboard?.recentEmployees || [];
        const noticeList = dashRes?.dashboard?.recentNotices || [];

        setData({
          employees: employeeList,
          notices: noticeList,
          departments: [
            { name: "Production", path: "/admin/departments" },
            { name: "Sales", path: "/admin/departments" },
            { name: "IT & Infrastructure", path: "/admin/departments" },
            { name: "HR & Admin", path: "/admin/departments" }
          ]
        });
      } catch (err) {
        console.error("Failed to load search index data:", err);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchSearchData();
    return () => (mounted = false);
  }, []);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleInputChange = (e) => {
    const val = e.target.value;
    if (setSearchTerm) setSearchTerm(val);
    setIsOpen(val.trim().length > 0);
  };

  const handleClear = () => {
    if (setSearchTerm) setSearchTerm("");
    setIsOpen(false);
  };

  const handleItemClick = (path) => {
    setIsOpen(false);
    navigate(path);
  };

  const query = (searchTerm || "").trim().toLowerCase();

  // Filter matching items
  const matchedEmployees = query
    ? data.employees.filter((emp) => {
        const name = (emp.name || `${emp.firstName || ""} ${emp.lastName || ""}`).toLowerCase();
        const id = (emp.employeeId || "").toLowerCase();
        const email = (emp.email || "").toLowerCase();
        return name.includes(query) || id.includes(query) || email.includes(query);
      })
    : [];

  const matchedNotices = query
    ? data.notices.filter((n) => {
        const title = (n.title || n.description || "").toLowerCase();
        return title.includes(query);
      })
    : [];

  const matchedDepartments = query
    ? data.departments.filter((d) => d.name.toLowerCase().includes(query))
    : [];

  const pagesList = [
    { name: "Employees Management", path: "/admin/employee", icon: Users },
    { name: "Departments Directory", path: "/admin/departments", icon: Building2 },
    { name: "Designations Roster", path: "/admin/designations", icon: FileText },
    { name: "Roles & Permissions", path: "/admin/roles", icon: FileText },
    { name: "Attendance Log", path: "/admin/attendance", icon: FileText },
    { name: "Payroll Dashboard", path: "/admin/payroll", icon: FileText },
    { name: "Notice Board", path: "/admin/notices", icon: Megaphone },
  ];

  const matchedPages = query
    ? pagesList.filter((p) => p.name.toLowerCase().includes(query))
    : [];

  const totalMatches =
    matchedEmployees.length + matchedNotices.length + matchedDepartments.length + matchedPages.length;

  return (
    <div className="relative w-full max-w-3xl" ref={dropdownRef}>
      {/* Search Input Bar */}
      <div className="relative flex items-center">
        <div className="absolute left-3.5 text-[#64748B] pointer-events-none">
          <Search size={18} />
        </div>
        <input
          type="text"
          placeholder={placeholder}
          value={searchTerm || ""}
          onChange={handleInputChange}
          onFocus={() => {
            if ((searchTerm || "").trim().length > 0) setIsOpen(true);
          }}
          className="w-full pl-10 pr-10 py-2.5 bg-white border border-[#CBD5E1] rounded-2xl text-sm font-semibold text-[#172033] placeholder-[#94A3B8] shadow-sm hover:border-[#94A3B8] focus:border-[#2563EB] focus:ring-4 focus:ring-[#2563EB]/10 focus:outline-none transition-all duration-200"
        />
        {searchTerm && (
          <button
            onClick={handleClear}
            className="absolute right-3 p-1 rounded-full text-[#94A3B8] hover:text-[#172033] hover:bg-[#F1F5F9] transition-colors"
            title="Clear search"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Live Dropdown Overlay */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-2 bg-white border border-[#E2E8F0] rounded-2xl shadow-2xl z-50 max-h-[70vh] overflow-y-auto divide-y divide-[#F1F5F9] transition-all duration-200 animate-in fade-in slide-in-from-top-2">
          {totalMatches === 0 ? (
            <div className="p-6 text-center text-sm font-medium text-[#64748B]">
              No results found for &ldquo;<span className="font-bold text-[#172033]">{searchTerm}</span>&rdquo;
            </div>
          ) : (
            <>
              {/* Matching Employees */}
              {matchedEmployees.length > 0 && (
                <div className="p-3">
                  <div className="px-3 py-1.5 flex items-center justify-between text-xs font-bold text-[#64748B] uppercase tracking-wider">
                    <span className="flex items-center gap-1.5"><Users size={14} /> Employees</span>
                    <span className="bg-[#EFF6FF] text-[#2563EB] px-2 py-0.5 rounded-full text-[10px]">{matchedEmployees.length}</span>
                  </div>
                  <div className="space-y-1 mt-1">
                    {matchedEmployees.slice(0, 4).map((emp, i) => {
                      const empName = emp.name || `${emp.firstName || ""} ${emp.lastName || ""}`.trim() || "Employee";
                      return (
                        <button
                          key={emp._id || i}
                          onClick={() => handleItemClick("/admin/employee")}
                          className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-left hover:bg-[#F8FAFC] transition-colors group cursor-pointer"
                        >
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-lg bg-[#2563EB]/10 text-[#2563EB] font-bold text-xs flex items-center justify-center flex-shrink-0">
                              {empName[0]}
                            </div>
                            <div>
                              <p className="text-xs font-bold text-[#172033] group-hover:text-[#2563EB] transition-colors">{empName}</p>
                              <p className="text-[10px] text-[#64748B]">{emp.employeeId || "Staff Member"}</p>
                            </div>
                          </div>
                          <ChevronRight size={14} className="text-[#94A3B8] group-hover:text-[#2563EB] group-hover:translate-x-0.5 transition-all" />
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Matching Notices */}
              {matchedNotices.length > 0 && (
                <div className="p-3">
                  <div className="px-3 py-1.5 flex items-center justify-between text-xs font-bold text-[#64748B] uppercase tracking-wider">
                    <span className="flex items-center gap-1.5"><Megaphone size={14} /> Notices & Announcements</span>
                    <span className="bg-[#ECFDF5] text-[#059669] px-2 py-0.5 rounded-full text-[10px]">{matchedNotices.length}</span>
                  </div>
                  <div className="space-y-1 mt-1">
                    {matchedNotices.slice(0, 3).map((n, i) => (
                      <button
                        key={i}
                        onClick={() => handleItemClick("/admin/notices")}
                        className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-left hover:bg-[#F8FAFC] transition-colors group cursor-pointer"
                      >
                        <span className="text-xs font-bold text-[#172033] group-hover:text-[#2563EB] transition-colors line-clamp-1">
                          {n.title || n}
                        </span>
                        <ChevronRight size={14} className="text-[#94A3B8] group-hover:text-[#2563EB] transition-all flex-shrink-0" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Matching Departments */}
              {matchedDepartments.length > 0 && (
                <div className="p-3">
                  <div className="px-3 py-1.5 flex items-center justify-between text-xs font-bold text-[#64748B] uppercase tracking-wider">
                    <span className="flex items-center gap-1.5"><Building2 size={14} /> Departments</span>
                    <span className="bg-[#F3E8FF] text-[#7C3AED] px-2 py-0.5 rounded-full text-[10px]">{matchedDepartments.length}</span>
                  </div>
                  <div className="space-y-1 mt-1">
                    {matchedDepartments.map((d, i) => (
                      <button
                        key={i}
                        onClick={() => handleItemClick(d.path)}
                        className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-left hover:bg-[#F8FAFC] transition-colors group cursor-pointer"
                      >
                        <span className="text-xs font-bold text-[#172033] group-hover:text-[#2563EB] transition-colors">{d.name}</span>
                        <ChevronRight size={14} className="text-[#94A3B8] group-hover:text-[#2563EB] transition-all" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Matching Navigation Pages */}
              {matchedPages.length > 0 && (
                <div className="p-3">
                  <div className="px-3 py-1.5 flex items-center justify-between text-xs font-bold text-[#64748B] uppercase tracking-wider">
                    <span className="flex items-center gap-1.5"><ArrowRight size={14} /> Quick Navigation Pages</span>
                    <span className="bg-[#FEF3C7] text-[#D97706] px-2 py-0.5 rounded-full text-[10px]">{matchedPages.length}</span>
                  </div>
                  <div className="space-y-1 mt-1">
                    {matchedPages.map((p, i) => {
                      const Icon = p.icon;
                      return (
                        <button
                          key={i}
                          onClick={() => handleItemClick(p.path)}
                          className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-left hover:bg-[#F8FAFC] transition-colors group cursor-pointer"
                        >
                          <div className="flex items-center gap-2">
                            <Icon size={14} className="text-[#64748B] group-hover:text-[#2563EB]" />
                            <span className="text-xs font-bold text-[#172033] group-hover:text-[#2563EB] transition-colors">{p.name}</span>
                          </div>
                          <ChevronRight size={14} className="text-[#94A3B8] group-hover:text-[#2563EB] transition-all" />
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
