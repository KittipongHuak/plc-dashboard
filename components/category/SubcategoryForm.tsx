"use client";

import { useState } from "react";
import Input from "../ui/Input";
import Button from "../ui/Button";

interface SubcategoryFormProps {
  onSubmit: (data: { code: string; name: string; description: string }) => void;
  initialData?: {
    code: string;
    name: string;
    description: string;
  };
  disabled?: boolean;
}

export default function SubcategoryForm({
  onSubmit,
  initialData,
  disabled = false,
}: SubcategoryFormProps) {
  const [code, setCode] = useState(initialData?.code || "");
  const [name, setName] = useState(initialData?.name || "");
  const [description, setDescription] = useState(initialData?.description || "");

  const isEdit = !!initialData;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || !name.trim()) return;

    onSubmit({
      code: code.trim(),
      name: name.trim(),
      description: description.trim(),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* รหัสประเภทย่อยชนิดไฟล์ */}
      <Input
        label="รหัสประเภทย่อยชนิดไฟล์"
        required
        value={code}
        onChange={(e) => setCode(e.target.value)}
        placeholder="เช่น SUB001 (ตัวอักษรและตัวเลขเท่านั้น)"
        disabled={disabled}
      />

      {/* ชื่อประเภทย่อยชนิดไฟล์ */}
      <Input
        label="ชื่อประเภทย่อยชนิดไฟล์"
        required
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="เช่น Main Logic หรือ Safety Logic"
        disabled={disabled}
      />

      {/* รายละเอียดเพิ่มเติม */}
      <Input
        as="textarea"
        label="รายละเอียดประเภทย่อยชนิดไฟล์"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="อธิบายสั้นๆ เกี่ยวกับรายละเอียดประเภทย่อย..."
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
