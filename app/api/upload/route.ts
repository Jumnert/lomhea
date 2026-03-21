import { NextRequest, NextResponse } from "next/server";
import cloudinary from "@/lib/cloudinary";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      console.error("Upload failed: Unauthorized");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      console.error("Upload failed: No file provided");
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    console.log("Cloudinary Config Status:", {
      has_url: !!process.env.CLOUDINARY_URL,
      cloud_name: !!process.env.CLOUDINARY_CLOUD_NAME,
      api_key: !!process.env.CLOUDINARY_API_KEY,
      api_secret: !!process.env.CLOUDINARY_API_SECRET,
    });

    console.log(
      `Starting Cloudinary upload for file: ${file.name} (${file.size} bytes)`,
    );

    const uploadResult = await new Promise<{ url: string } | { error: string }>(
      (resolve) => {
        cloudinary.uploader
          .upload_stream(
            {
              resource_type: "auto",
              folder: "lomhea",
            },
            (error, result) => {
              if (error) {
                console.error("Cloudinary upload error:", error);
                resolve({ error: "Upload failed" });
              } else {
                console.log("Cloudinary upload success:", result?.secure_url);
                resolve({ url: result?.secure_url as string });
              }
            },
          )
          .end(buffer);
      },
    );

    if ("error" in uploadResult) {
      return NextResponse.json({ error: uploadResult.error }, { status: 500 });
    }

    return NextResponse.json({ url: uploadResult.url }, { status: 200 });
  } catch (error) {
    console.error("Upload route error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
