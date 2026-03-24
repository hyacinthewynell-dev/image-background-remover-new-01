import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

const REMOVE_BG_API_URL = "https://api.remove.bg/v1.0/removebg";
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/webp"];

export async function POST(request: NextRequest) {
  try {
    // Get API key from environment
    const apiKey = process.env.REMOVE_BG_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: "Service configuration error. Contact administrator." },
        { status: 500 }
      );
    }

    // Parse form data
    const formData = await request.formData();
    const imageFile = formData.get("image") as File | null;

    if (!imageFile) {
      return NextResponse.json(
        { success: false, error: "No image file provided" },
        { status: 400 }
      );
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(imageFile.type)) {
      return NextResponse.json(
        { success: false, error: "Only PNG, JPG, and WebP images are supported" },
        { status: 400 }
      );
    }

    // Validate file size
    if (imageFile.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { success: false, error: "Image must be smaller than 10MB" },
        { status: 400 }
      );
    }

    // Convert file to buffer for Remove.bg API
    const arrayBuffer = await imageFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Call Remove.bg API
    const removeBgFormData = new FormData();
    removeBgFormData.append("image_file", new Blob([buffer]), imageFile.name);
    removeBgFormData.append("size", "auto");
    removeBgFormData.append("output_format", "png");
    removeBgFormData.append("bg_color", "none");

    const response = await fetch(REMOVE_BG_API_URL, {
      method: "POST",
      headers: {
        "X-Api-Key": apiKey,
      },
      body: removeBgFormData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Remove.bg API error:", errorText);

      // Handle specific error codes
      if (response.status === 401) {
        return NextResponse.json(
          { success: false, error: "Invalid API key. Please contact administrator." },
          { status: 401 }
        );
      }
      if (response.status === 402) {
        return NextResponse.json(
          { success: false, error: "API quota exceeded. Please try again tomorrow." },
          { status: 502 }
        );
      }

      return NextResponse.json(
        { success: false, error: "Background removal failed. Please try again." },
        { status: 500 }
      );
    }

    // Get result as buffer
    const resultBuffer = await response.arrayBuffer();
    const base64 = Buffer.from(resultBuffer).toString("base64");
    const dataUri = `data:image/png;base64,${base64}`;

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
