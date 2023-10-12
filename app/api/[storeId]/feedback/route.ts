// feedbackService.js

import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs";
import prismadb from "@/lib/prismadb";


export async function POST(req: Request ) {
    
    try {
      const { userId } = auth();
      const body = await req.json();
      console.log('[body]', body);

        const { rating,productId,orderId,  comment } = body;
      if (!userId) {
        return new NextResponse("Unauthenticated", { status: 403 });
      }
  
      if (!productId) {
        console.log('[no product id]');

        return new NextResponse("Product id is required", { status: 400 });
      }
  
      
  
      if (!rating || !comment) {
        return new NextResponse("Rating and comment are required", { status: 400 });
      }
  
      const feedbackData = {
        productId,
        rating,
        comment,
        // Make orderId optional in the data object
        ...(orderId && { orderId }),
      };
  
      const feedback = await prismadb.feedback.create({
        data: feedbackData,
      });
  
      return NextResponse.json(feedback, { status: 201 }); // Status 201 means "Created"
    } catch (error) {
      console.log('[FEEDBACK_CREATE]', error);
      return new NextResponse("Internal error", { status: 500 });
    }
  }
  


  export async function GET(
    req: Request,
    { params }: { params: { productId: string } }
  )  {
    const { searchParams } = new URL(req.url)
    const productId = searchParams.get('productId') || undefined;

    console.log("==========", productId);

    try {

      
  
      if (!productId) {
        return new NextResponse("Product id is required", { status: 400 });
      }
  
      const feedbacks = await prismadb.feedback.findMany({
        where: {
          productId: productId,
        },
      });
  
      return NextResponse.json(feedbacks);
    } catch (error) {
      console.error("[FEEDBACK_GET]", error);
      return new NextResponse("Internal error", { status: 500 });
    }
  }
  
  
  
  