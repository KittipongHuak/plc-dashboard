"use client";

import { useState } from "react";
import Input from "../ui/Input";
import Button from "../ui/Button";

interface SubcategoryFormProps {
  onSubmit: (data: { code: string; name: string; description: string; ipAddress: string }) => void;
  initialData?: {
    code: string;
    name: string;
    description: string;
    ipAddress?: string;
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
  const [ipAddress, setIpAddress] = useState(initialData?.ipAddress || "");

  const isEdit = !!initialData;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || !name.trim()) return;

    onSubmit({
      code: code.trim(),
      name: name.trim(),
      description: description.trim(),
      ipAddress: ipAddress.trim(),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* รหัสประเภทย่อยชนิดไฟล์ */}
      <Input
        label="รหัสประเภทย่อย"
        required
        value={code}
        onChange={(e) => setCode(e.target.value)}
        placeholder="เช่น CPU01"
        disabled={disabled}
      />

      {/* รุ่นอุปกรณ์ */}
      <Input
        label="รุ่นอุปกรณ์"
        required
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="เช่น QCPU หรือ FX5U"
        disabled={disabled}
      />

      {/* IP Address */}
      <Input
        label="IP Address"
        value={ipAddress}
        onChange={(e) => setIpAddress(e.target.value)}
        placeholder="เช่น 10.153.16.192"
        disabled={disabled}
      />

      {/* รายละเอียดเพิ่มเติม */}
      <Input
        as="textarea"
        label="รายละเอียด"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="อธิบายข้อมูล รายละเอียด หรือหมายเหตุเพิ่มเติม..."
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
