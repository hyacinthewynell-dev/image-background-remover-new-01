import { NextRequest, NextResponse } from "next/server";

const REMOVE_BG_API_URL = "https://api.remove.bg/v1.0/removebg";
const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/webp"];

export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.REMOVE_BG_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: "Service configuration error." },
        { status: 500 }
      );
    }

    const formData = await request.formData();
    const imageFile = formData.get("image") as File | null;

    if (!imageFile) {
      return NextResponse.json(
        { success: false, error: "No image file provided" },
        { status: 400 }
      );
    }

    if (!ALLOWED_TYPES.includes(imageFile.type)) {
      return NextResponse.json(
        { success: false, error: "Only PNG, JPG, and WebP images are supported" },
        { status: 400 }
      );
    }

    if (imageFile.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { success: false, error: "Image must be smaller than 10MB" },
        { status: 400 }
      );
    }

    const arrayBuffer = await imageFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const removeBgFormData = new FormData();
    removeBgFormData.append("image_file", new Blob([buffer]), imageFile.name);
    removeBgFormData.append("size", "auto");
    removeBgFormData.append("output_format", "png");

    const response = await fetch(REMOVE_BG_API_URL, {
      method: "POST",
      headers: {
        "X-Api-Key": apiKey,
      },
      body: removeBgFormData,
    });

    if (!response.ok) {
      return NextResponse.json(
        { success: false, error: "Background removal failed. Please try again." },
        { status: 500 }
      );
    }

    const resultBuffer = await response.arrayBuffer();
    const base64 = Buffer.from(resultBuffer).toString("base64");
    const dataUri = "data:image/png;base64," + base64;

    return NextResponse.json({
      success: true,
      data: {
        result: dataUri,
        originalName: imageFile.name,
      },
    });
  } catch (error) {
    console.error("API route error:", error);
    return NextResponse.json(
      { success: false, error: "Network error. Please try again." },
      { status: 500 }
    );
  }
}
