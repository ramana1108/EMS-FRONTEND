import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export default function DepartmentEmployees() {
  const { id } = useParams();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#F8FAFC] px-6 py-10 text-[#172033]">
      <div className="mx-auto max-w-3xl">
        <button
          onClick={() => navigate(-1)}
          className="mb-6 flex items-center gap-2 rounded-xl border border-[#D7E7FF] bg-[#EFF6FF] px-4 py-2 text-sm font-bold text-[#2563EB] transition hover:bg-[#E0EDFF] cursor-pointer"
        >
          <ArrowLeft size={16} />
          Back
        </button>

        <div className="rounded-2xl border border-[#E2E8F0] bg-white p-8 shadow-xs text-[#172033]">
          <h1 className="text-2xl font-bold text-[#172033]">Department Details</h1>
          <p className="mt-2 text-[#64748B]">
            Viewing department ID: <span className="font-semibold text-[#2563EB]">{id}</span>
          </p>
          <p className="mt-6 text-[#334155]">
            The department page is ready for employee listing and detail views.
          </p>
        </div>
      </div>
    </div>
  );
}
