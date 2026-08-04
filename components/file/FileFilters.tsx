"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import Input from "../ui/Button"; // Wait, is Input inside components/ui/Input.tsx? Yes!
// Ah, let's make sure we import Input from components/ui/Input instead of Button!
import CustomInput from "../ui/Input";

interface FileFiltersProps {
  machines: { id: string; name: string }[];
  categories: { id: string; name: string }[];
}

export default function FileFilters({ machines, categories }: FileFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  // ท้องถิ่นสำหรับ Search query
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [machineId, setMachineId] = useState(searchParams.get("machineId") || "");
  const [categoryId, setCategoryId] = useState(searchParams.get("categoryId") || "");

  // ซิงค์ URL search params กับ Local state เมื่อ URL เปลี่ยนแปลง
  useEffect(() => {
    setSearch(searchParams.get("search") || "");
    setMachineId(searchParams.get("machineId") || "");
    setCategoryId(searchParams.get("categoryId") || "");
  }, [searchParams]);

  // ฟังก์ชันอัปเดตฟิลเตอร์ลง URL Query String
  const applyFilters = (updates: { search?: string; machineId?: string; categoryId?: string }) => {
    const params = new URLSearchParams(searchParams.toString());

    // อัปเดตพารามิเตอร์แต่ละตัว
    if (updates.search !== undefined) {
      if (updates.search) params.set("search", updates.search);
      else params.delete("search");
    }
    if (updates.machineId !== undefined) {
      if (updates.machineId) params.set("machineId", updates.machineId);
      else params.delete("machineId");
    }
    if (updates.categoryId !== undefined) {
      if (updates.categoryId) params.set("categoryId", updates.categoryId);
      else params.delete("categoryId");
    }

    router.push(`${pathname}?${params.toString()}`);
  };

  // ล้างการค้นหาทั้งหมด
  const handleClear = () => {
    setSearch("");
    setMachineId("");
    setCategoryId("");
    router.push(pathname);
  };

  const machineOptions = [
    { value: "", label: "ทั้งหมด" },
    ...machines.map((m) => ({ value: m.id, label: `${m.id} - ${m.name}` })),
  ];

  const categoryOptions = [
    { value: "", label: "ทั้งหมด" },
    ...categories.map((c) => ({ value: c.id, label: c.name })),
  ];

  return (
    <div className="bg-surface-container-lowest border border-outline-variant p-5 rounded-2xl shadow-sm space-y-4 mb-6">
      <h3 className="font-title-md text-title-md text-on-surface flex items-center gap-2">
        <span className="material-symbols-outlined text-primary text-[20px]">
          search
        </span>
        ตัวกรองและค้นหาซอฟต์แวร์
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
        {/* ค้นหาจากชื่อไฟล์ */}
        <CustomInput
          label="ค้นหาชื่อไฟล์"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            applyFilters({ search: e.target.value });
          }}
          placeholder="พิมพ์คำค้นหา..."
        />

        {/* ตัวกรองเครื่องจักร */}
        <CustomInput
          as="select"
          label="กรองรายเครื่องจักร"
          value={machineId}
          onChange={(e) => {
            setMachineId(e.target.value);
            applyFilters({ machineId: e.target.value });
          }}
          options={machineOptions}
        />

        {/* ตัวกรองประเภทไฟล์ */}
        <CustomInput
          as="select"
          label="กรองรายประเภทไฟล์"
          value={categoryId}
          onChange={(e) => {
            setCategoryId(e.target.value);
            applyFilters({ categoryId: e.target.value });
          }}
          options={categoryOptions}
        />

        {/* ปุ่มล้างการค้นหา */}
        <button
          onClick={handleClear}
          className="h-14 px-5 bg-surface-container-high text-on-surface rounded-xl text-label-md font-label-md hover:bg-outline-variant transition-all flex items-center justify-center gap-2 border border-outline"
        >
          <span className="material-symbols-outlined text-[20px]">
            restart_alt
          </span>
          ล้างตัวกรอง
        </button>
      </div>
    </div>
  );
}
