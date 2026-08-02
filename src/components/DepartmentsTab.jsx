import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { motion } from "framer-motion";
import { Building2, Users, User, Plus, X } from "lucide-react";


export default function DepartmentsTab() {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  
const navigate = useNavigate();

  const [formData, setFormData] = useState({
    departmentName: "",
    description: "",
    headName: "",
    headDesignation: "",
    employeeCount: 0,
  });

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      setLoading(true);

      const token = localStorage.getItem("token");

      const response = await axios.get(
        "http://localhost:5000/departments",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // IMPORTANT
      setDepartments(response.data.departments);
    } catch (error) {
      console.error(error);
      alert("Unable to fetch departments");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData({
      ...formData,
      [name]:
        name === "employeeCount"
          ? Number(value)
          : value,
    });
  };

  const resetForm = () => {
    setFormData({
      departmentName: "",
      description: "",
      headName: "",
      headDesignation: "",
      employeeCount: 0,
    });
  };

  const closeModal = () => {
    resetForm();
    setShowModal(false);
  };

  const addDepartment = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("token");

      await axios.post(
        "http://localhost:5000/departments",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert("Department Added Successfully");

      closeModal();

      fetchDepartments();

    } catch (error) {
      alert(error.response?.data?.message || "Unable to add department");
    }
  };

  if (loading) {
    return (
      <div className="flex h-80 items-center justify-center">
        <h2 className="text-xl font-semibold">
          Loading Departments...
        </h2>
      </div>
    );
  }

  return (
    <>
  <motion.div
    initial={{ opacity: 0, y: 15 }}
    animate={{ opacity: 1, y: 0 }}
    className="space-y-6 text-left"
  >
    {/* Header */}
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Departments
        </h1>

        <p className="mt-1 text-sm font-medium text-slate-500 dark:text-slate-400">
          Review and analyze core departmental units and hierarchy.
        </p>
      </div>

      <button
        onClick={() => setShowModal(true)}
        className="flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-white shadow-lg transition hover:bg-emerald-700"
      >
        <Plus size={18} />
        Add Department
      </button>
    </div>

    {/* Department Cards */}
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
      {departments.map((dept, index) => (
        <motion.div
  key={dept._id}
  initial={{ opacity: 0, scale: 0.95 }}
  animate={{ opacity: 1, scale: 1 }}
  transition={{ delay: index * 0.05 }}
  onClick={() => navigate(`/departments/${dept._id}`)}
  className="cursor-pointer rounded-2xl border border-slate-200 bg-white/80 p-6 shadow-xl backdrop-blur-lg dark:border-slate-800 dark:bg-slate-900/70 hover:shadow-2xl hover:scale-[1.02] transition-all duration-300"
>
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-700 to-emerald-500 text-white">
                <Building2 size={22} />
              </div>

              <div>
                <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">
                  {dept.departmentName}
                </h3>

                <p className="text-xs text-slate-500">
                  {dept.description}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-2 dark:bg-emerald-900/20">
              <Users
                size={16}
                className="text-emerald-600 dark:text-emerald-400"
              />

              <span className="font-bold text-emerald-600 dark:text-emerald-400">
                {dept.employeeCount}
              </span>
            </div>
          </div>

          <div className="border-t border-slate-200 pt-4 dark:border-slate-800">
            <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-400">
              Department Head
            </h4>

            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
                <User size={18} />
              </div>

              <div>
                <p className="font-semibold text-slate-800 dark:text-slate-100">
                  {dept.headName}
                </p>

                <p className="text-sm text-slate-500">
                  {dept.headDesignation}
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  </motion.div>

  {/* Add Department Modal */}

  {showModal && (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-2xl bg-white p-8 shadow-2xl dark:bg-slate-900">

        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold dark:text-white">
            Add Department
          </h2>

          <button
            onClick={closeModal}
            className="rounded-lg p-2 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X />
          </button>
        </div>

        <form
          onSubmit={addDepartment}
          className="space-y-4"
        >

          <input
            type="text"
            name="departmentName"
            placeholder="Department Name"
            value={formData.departmentName}
            onChange={handleChange}
            required
            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          />

          <input
            type="text"
            name="description"
            placeholder="Description"
            value={formData.description}
            onChange={handleChange}
            required
            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          />

          <input
            type="text"
            name="headName"
            placeholder="Department Head"
            value={formData.headName}
            onChange={handleChange}
            required
            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          />

          <input
            type="text"
            name="headDesignation"
            placeholder="Head Designation"
            value={formData.headDesignation}
            onChange={handleChange}
            required
            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          />

          <input
            type="number"
            name="employeeCount"
            placeholder="Employee Count"
            value={formData.employeeCount}
            onChange={handleChange}
            required
            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          />

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={closeModal}
              className="rounded-xl border border-slate-300 px-5 py-2"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="rounded-xl bg-emerald-600 px-5 py-2 text-white hover:bg-emerald-700"
            >
              Add Department
            </button>
          </div>

        </form>
      </div>
    </div>
  )}
</>

  );
}