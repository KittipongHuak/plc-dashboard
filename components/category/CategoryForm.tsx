"use client";

import { useState } from "react";
import Input from "../ui/Input";
import Button from "../ui/Button";

interface CategoryFormProps {
  onSubmit: (data: { id: string; name: string; description: string }) => void;
  initialData?: {
    id: string;
    name: string;
    description: string;
  };
  disabled?: boolean;
}

export default function CategoryForm({
  onSubmit,
  initialData,
  disabled = false,
}: CategoryFormProps) {
  const [id, setId] = useState(initialData?.id || "");
  const [name, setName] = useState(initialData?.name || "");
  const [description, setDescription] = useState(initialData?.description || "");

  const isEdit = !!initialData;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!id.trim() || !name.trim()) return;

    onSubmit({
      id: id.trim(),
      name: name.trim(),
      description: description.trim(),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* รหัสประเภทไฟล์ */}
      <Input
        label="รหัสประเภทไฟล์"
        required
        value={id}
        onChange={(e) => setId(e.target.value)}
        placeholder="เช่น CAT007 (ตัวอักษรและตัวเลขเท่านั้น)"
        disabled={disabled}
      />

      {/* ชื่อประเภทไฟล์ */}
      <Input
        label="ชื่อประเภทไฟล์"
        required
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="เช่น SCADA Program หรือ Device Config"
        disabled={disabled}
      />

      {/* รายละเอียดเพิ่มเติม */}
      <Input
        as="textarea"
        label="รายละเอียดการใช้ชนิดไฟล์"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="อธิบายสั้นๆ ว่าชนิดไฟล์นี้ใช้กับงานประเภทไหน หรือไฟล์ชนิดใด..."
        rows={3}
        disabled={disabled}
      />

      {/* ปุ่ม submit */}
      <div className="flex items-center justify-end gap-2 pt-2">
        <Button
          type="submit"
          variant="primary"
          icon="save"
          loading={disabled}
        >
          {isEdit ? "บันทึกการแก้ไข" : "บันทึกข้อมูล"}
        </Button>
      </div>
    </form>
  );
}
