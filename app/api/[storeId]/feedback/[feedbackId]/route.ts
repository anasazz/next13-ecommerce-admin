import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs";

import prismadb from "@/lib/prismadb";



export async function DELETE(
  req: Request,
  { params }: { params: { feedbackId: string, storeId: string } }
) {
  try {
    const { userId } = auth();

    if (!userId) {
      return new NextResponse("Unauthenticated", { status: 403 });
    }

    if (!params.feedbackId) {
      return new NextResponse("fedback id is required", { status: 400 });
    }


    const feedback = await prismadb.feedback.delete({
      where: {
        id: params.feedbackId,
      }
    });
  
    return new NextResponse("Deleted", { status: 201 });

  } catch (error) {
    console.log('[BILLBOARD_DELETE]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
};
