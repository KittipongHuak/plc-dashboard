import { pool } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const fileId = parseInt(id, 10);

    if (isNaN(fileId)) {
      return new NextResponse("Invalid file ID", { status: 400 });
    }

    // ดึงชื่อไฟล์ นามสกุล และข้อมูลไบนารีจากตาราง plc_files
    const res = await pool.query(
      "SELECT file_name, file_extension, file_data FROM plc_files WHERE id = $1;",
      [fileId]
    );

    if (res.rows.length === 0) {
      return new NextResponse("File not found", { status: 404 });
    }

    const { file_name, file_extension, file_data } = res.rows[0];
    const fullName = `${file_name}${file_extension}`;

    // file_data จะมีรูปแบบเป็น Buffer จาก pg node driver สำหรับชนิดข้อมูล bytea
    const fileBuffer = file_data as Buffer;

    // บังคับดาวน์โหลดไฟล์ในบราวเซอร์ด้วยการระบุ Content-Disposition
    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Disposition": `attachment; filename="${encodeURIComponent(fullName)}"`,
        "Content-Type": "application/octet-stream",
        "Content-Length": fileBuffer.length.toString(),
      },
    });
  } catch (err: any) {
    console.error("Error streaming file download in API route:", err.message);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
