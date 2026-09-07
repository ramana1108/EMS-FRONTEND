import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Building2, Mail, Phone, Search, Users } from "lucide-react";
import api from "../api";

const getEmployeeName = (employee) =>
  employee.name || `${employee.firstName || ""} ${employee.lastName || ""}`.trim() || "Employee";

const getDesignation = (employee) => {
  if (employee.designationId && typeof employee.designationId === "object") {
    return employee.designationId.designationName || employee.designationId.name || "Not assigned";
  }
  return employee.designation || employee.designationId || "Not assigned";
};

const getDepartmentId = (employee) => {
  if (employee.departmentId && typeof employee.departmentId === "object") {
    return employee.departmentId._id || employee.departmentId.id;
  }
  return employee.departmentId || employee.department?._id || employee.department?.id;
};

export default function DepartmentEmployees() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [department, setDepartment] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDepartmentEmployees = useCallback(async () => {
    setLoading(true);
    setError("");
    setEmployees([]);

    try {
      const [departmentResponse, employeeResponse] = await Promise.all([
        api.getDepartmentById(id),
        api.getDepartmentEmployees(id),
      ]);

      if (departmentResponse?.success === false || !departmentResponse?.department) {
        throw new Error(departmentResponse?.message || "Department not found.");
      }
      if (employeeResponse?.success === false) {
        throw new Error(employeeResponse.message || "Unable to load employees.");
      }

      const responseEmployees = employeeResponse?.employees || employeeResponse?.data || [];
      const departmentEmployees = responseEmployees.filter((employee) => String(getDepartmentId(employee)) === String(id));
      setDepartment(departmentResponse.department);
      setEmployees(departmentEmployees);
    } catch (loadError) {
      console.error("Failed to load department employees:", loadError);
      setError(loadError.message || "Unable to load employees for this department.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadDepartmentEmployees();
  }, [loadDepartmentEmployees]);

  const filteredEmployees = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return employees.filter((employee) => {
      const matchesSearch = !query || [
        getEmployeeName(employee),
        employee.employeeId,
        employee.email,
        employee.phone,
        getDesignation(employee),
      ].some((value) => String(value || "").toLowerCase().includes(query));
      const matchesStatus = statusFilter === "All" || String(employee.status || "").toLowerCase() === statusFilter.toLowerCase();
      return matchesSearch && matchesStatus;
    });
  }, [employees, searchQuery, statusFilter]);

  const initials = (name) => getEmployeeName({ name }).split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase();

  return (
    <div className="min-h-full text-[#172033]">
      <div className="mx-auto max-w-6xl">
        <button
          onClick={() => navigate(-1)}
          className="mb-5 flex items-center gap-2 rounded-xl border border-[#D7E7FF] bg-[#EFF6FF] px-4 py-2 text-sm font-bold text-[#2563EB] transition hover:bg-[#E0EDFF] cursor-pointer"
        >
          <ArrowLeft size={16} />
          Back to Departments
        </button>

        {loading ? (
          <div className="space-y-4" aria-busy="true">
            <div className="h-36 animate-pulse rounded-2xl bg-white shadow-sm" />
            <div className="h-20 animate-pulse rounded-2xl bg-white shadow-sm" />
            <div className="h-24 animate-pulse rounded-2xl bg-white shadow-sm" />
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-rose-200 bg-white p-8 text-center shadow-sm">
            <h1 className="text-xl font-black text-[#172033]">Unable to load employees</h1>
            <p className="mt-2 text-sm text-[#64748B]">{error}</p>
            <button onClick={loadDepartmentEmployees} className="mt-5 rounded-xl bg-[#2563EB] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#1D4ED8]">Retry</button>
          </div>
        ) : (
          <>
            <section className="rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-sm sm:p-7">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#EFF6FF] text-[#2563EB]"><Building2 size={27} /></div>
                  <div>
                    <h1 className="text-2xl font-black text-[#172033]">{department?.departmentName}</h1>
                    <p className="mt-1 max-w-2xl text-sm text-[#64748B]">{department?.description || "Employees working under this department."}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 rounded-xl bg-[#ECFDF5] px-4 py-3 text-[#047857]">
                  <Users size={18} />
                  <span className="text-sm font-black">{employees.length} Employees</span>
                </div>
              </div>
            </section>

            <section className="mt-5 rounded-2xl border border-[#E2E8F0] bg-white p-4 shadow-sm sm:p-6">
              <div className="mb-5 flex flex-col gap-3 sm:flex-row">
                <label className="relative flex-1">
                  <Search size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
                  <input value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder="Search employees..." className="w-full rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] py-3 pl-10 pr-3 text-sm outline-none focus:border-[#2563EB]" />
                </label>
                <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="rounded-xl border border-[#E2E8F0] bg-white px-3 py-3 text-sm font-semibold text-[#334155] outline-none focus:border-[#2563EB]">
                  <option>All</option>
                  <option>Active</option>
                  <option>Inactive</option>
                </select>
              </div>

              {filteredEmployees.length === 0 ? (
                <div className="rounded-xl border border-dashed border-[#CBD5E1] bg-[#F8FAFC] px-5 py-12 text-center">
                  <Users size={30} className="mx-auto text-[#94A3B8]" />
                  <h2 className="mt-3 text-lg font-black text-[#172033]">{employees.length ? "No matching employees" : "No employees found"}</h2>
                  <p className="mt-1 text-sm text-[#64748B]">{employees.length ? "Try a different search or status filter." : "There are currently no employees assigned to this department."}</p>
                </div>
              ) : (
                <div className="grid gap-3">
                  {filteredEmployees.map((employee) => {
                    const name = getEmployeeName(employee);
                    return (
                      <article key={employee._id || employee.employeeId} className="flex min-w-0 flex-col gap-4 rounded-xl border border-[#E2E8F0] p-4 transition hover:border-[#BFDBFE] hover:shadow-sm sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex min-w-0 items-center gap-3">
                          {employee.profileImage ? <img src={employee.profileImage} alt="" className="h-11 w-11 shrink-0 rounded-full object-cover" /> : <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#DBEAFE] text-sm font-black text-[#2563EB]">{initials(name)}</div>}
                          <div className="min-w-0">
                            <h2 className="truncate font-black text-[#172033]">{name}</h2>
                            <p className="truncate text-sm text-[#64748B]">{getDesignation(employee)} · {employee.employeeId || "No employee ID"}</p>
                          </div>
                        </div>
                        <div className="flex min-w-0 flex-wrap items-center gap-x-4 gap-y-2 text-xs text-[#64748B] sm:justify-end">
                          {employee.email && <span className="flex max-w-full items-center gap-1.5 truncate"><Mail size={14} />{employee.email}</span>}
                          {employee.phone && <span className="flex items-center gap-1.5"><Phone size={14} />{employee.phone}</span>}
                          {employee.status && <span className={`rounded-full px-2.5 py-1 font-bold ${employee.status === "Active" ? "bg-[#ECFDF5] text-[#047857]" : "bg-[#F1F5F9] text-[#64748B]"}`}>{employee.status}</span>}
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </section>
          </>
        )}
        </div>
    </div>
  );
}
