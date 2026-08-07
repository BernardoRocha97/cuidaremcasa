import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ photoId: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return new NextResponse("Não autenticado", { status: 401 });
  }

  const { photoId } = await params;
  const photo = await prisma.visitPhoto.findUnique({
    where: { id: photoId },
    include: { visit: true },
  });

  if (!photo) {
    return new NextResponse("Não encontrado", { status: 404 });
  }

  if (session.user.role !== "ADMIN" && photo.visit.nurseId !== session.user.id) {
    return new NextResponse("Sem permissão", { status: 403 });
  }

  return new NextResponse(new Uint8Array(photo.data), {
    headers: {
      "Content-Type": photo.mimeType,
      "Cache-Control": "private, max-age=3600",
    },
  });
}
