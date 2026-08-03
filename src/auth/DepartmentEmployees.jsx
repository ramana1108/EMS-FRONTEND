import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export default function DepartmentEmployees() {
  const { id } = useParams();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-950 px-6 py-10 text-white">
      <div className="mx-auto max-w-3xl">
        <button
          onClick={() => navigate(-1)}
          className="mb-6 flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-4 py-2 text-sm font-medium text-slate-200 transition hover:bg-slate-800"
        >
          <ArrowLeft size={16} />
          Back
        </button>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-8 shadow-2xl">
          <h1 className="text-2xl font-bold">Department Details</h1>
          <p className="mt-2 text-slate-400">
            Viewing department ID: <span className="font-semibold text-emerald-400">{id}</span>
          </p>
          <p className="mt-6 text-slate-300">
            The department page is ready for employee listing and detail views.
          </p>
        </div>
      </div>
    </div>
  );
}
