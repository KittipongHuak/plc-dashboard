"use client";

import { useState } from "react";
import Button from "../ui/Button";
import Input from "../ui/Input";

interface MachineFormProps {
  onSubmit: (data: { id: string; name: string; description: string }) => void;
  initialData?: { id: string; name: string; description: string };
  disabled?: boolean;
}

export default function MachineForm({
  onSubmit,
  initialData,
  disabled = false,
}: MachineFormProps) {
  const [id, setId] = useState(initialData?.id || "");
  const [name, setName] = useState(initialData?.name || "");
  const [description, setDescription] = useState(initialData?.description || "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!id.trim() || !name.trim()) return;
    onSubmit({ id: id.trim(), name: name.trim(), description: description.trim() });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
      <Input
        label="รหัสเครื่องจักร"
        required
        value={id}
        onChange={(e) => setId(e.target.value)}
        placeholder="เช่น M001"
        disabled={disabled}
      />
      <Input
        label="ชื่อเครื่องจักร"
        required
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="เช่น CNC Machine A"
        disabled={disabled}
      />
      <Input
        as="textarea"
        label="รายละเอียดเครื่องจักร"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="ใส่ข้อมูลเกี่ยวกับตำแหน่งเครื่องจักรหรือรายละเอียดการบำรุงรักษา..."
        rows={3}
        disabled={disabled}
      />
      <div className="flex justify-end pt-2">
        <Button type="submit" disabled={disabled} icon="save">
          บันทึกข้อมูล
        </Button>
      </div>
    </form>
  );
}
