import React, { useState } from "react";
import { motion } from "framer-motion";
import { Shield, Check, X, ShieldAlert, Award } from "lucide-react";

const initialRoles = [
    {
        name: "Admin",
        description: "Complete control of all resources, database records, security credentials, and payroll management.",
        permissions: {
            "Employee Database (CRUD)": true,
            "Department Configuration": true,
            "Approve Leave Requests": true,
            "Process Payroll": true,
            "Publish System Notices": true,
            "Modify System Settings": true
        }
    },
    {
        name: "Manager",
        description: "Supervise department employees, request leave, review timesheets, and post departmental updates.",
        permissions: {
            "Employee Database (CRUD)": false,
            "Department Configuration": false,
            "Approve Leave Requests": true,
            "Process Payroll": false,
            "Publish System Notices": true,
            "Modify System Settings": false
        }
    },
    {
        name: "HR Administrator",
        description: "Manage employee contracts, payroll disbursements, and coordinate public announcements.",
        permissions: {
            "Employee Database (CRUD)": true,
            "Department Configuration": true,
            "Approve Leave Requests": true,
            "Process Payroll": true,
            "Publish System Notices": true,
            "Modify System Settings": false
        }
    },
    {
        name: "Standard Employee",
        description: "Submit personal leave requests, request payroll details, check in attendance, and read announcements.",
        permissions: {
            "Employee Database (CRUD)": false,
            "Department Configuration": false,
            "Approve Leave Requests": false,
            "Process Payroll": false,
            "Publish System Notices": false,
            "Modify System Settings": false
        }
    }
];

export default function RolesTab() {
    const permissions = [
        "Employee Database (CRUD)",
        "Department Configuration",
        "Approve Leave Requests",
        "Process Payroll",
        "Publish System Notices",
        "Modify System Settings"
    ];

    return (
        <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6 text-left"
        >
            <div>
                <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Security Roles</h1>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">Verify system features access and resource authentication permission gates.</p>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
                <div className="xl:col-span-1 space-y-4">
                    {initialRoles.map((role) => (
                        <div key={role.name} className="p-4 bg-white/70 dark:bg-slate-900/70 backdrop-blur-lg border border-slate-205 dark:border-slate-800 rounded-2xl shadow-sm space-y-2">
                            <div className="flex items-center gap-2">
                                <Shield className="text-emerald-500" size={16} />
                                <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">{role.name}</h3>
                            </div>
                            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-semibold">
                                {role.description}
                            </p>
                        </div>
                    ))}
                </div>

                <div className="xl:col-span-3 bg-white/70 dark:bg-slate-900/70 backdrop-blur-lg border border-slate-205 dark:border-slate-800 rounded-2xl shadow-xl shadow-emerald-950/[0.015] overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 uppercase text-[10px] font-black tracking-widest border-b border-slate-100 dark:border-slate-800/60">
                                    <th className="px-6 py-4">Security Permission Name</th>
                                    <th className="px-6 py-4 text-center">Admin</th>
                                    <th className="px-6 py-4 text-center">Manager</th>
                                    <th className="px-6 py-4 text-center">HR Admin</th>
                                    <th className="px-6 py-4 text-center">Employee</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40">
                                {permissions.map((perm) => (
                                    <tr key={perm} className="hover:bg-slate-50/30 dark:hover:bg-slate-800/10 transition-colors">
                                        <td className="px-6 py-4 text-sm font-bold text-slate-800 dark:text-slate-200">{perm}</td>
                                        {initialRoles.map((role) => (
                                            <td key={role.name} className="px-6 py-4 text-center">
                                                <div className="flex items-center justify-center">
                                                    {role.permissions[perm] ? (
                                                        <div className="w-6 h-6 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/60 text-emerald-600 dark:text-emerald-450 flex items-center justify-center">
                                                            <Check size={14} className="stroke-[3]" />
                                                        </div>
                                                    ) : (
                                                        <div className="w-6 h-6 rounded-full bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-slate-400 flex items-center justify-center">
                                                            <X size={12} className="stroke-[2.5]" />
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
