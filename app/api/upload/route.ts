import { NextRequest, NextResponse } from "next/server";
import { createHash } from "crypto";

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const API_KEY = process.env.CLOUDINARY_API_KEY;
const API_SECRET = process.env.CLOUDINARY_API_SECRET;

export async function POST(req: NextRequest) {
  if (!CLOUD_NAME || !API_KEY || !API_SECRET) {
      return NextResponse.json({ error: "Cloudinary configuration error on server" }, { status: 500 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });

    const timestamp = Math.round(new Date().getTime() / 1000);
    const params: Record<string, any> = {
      timestamp,
      folder: "software_factory_avatars"
    };

    // Generate Signature
    const sortedKeys = Object.keys(params).sort();
    const signatureStr = sortedKeys.map(k => `${k}=${params[k]}`).join("&") + API_SECRET;
    const signature = createHash("sha1").update(signatureStr).digest("hex");

    // Prepare Cloudinary call
    const uploadData = new FormData();
    uploadData.append("file", file);
    uploadData.append("api_key", API_KEY);
    uploadData.append("timestamp", timestamp.toString());
    uploadData.append("signature", signature);
    uploadData.append("folder", params.folder);

    const cloudinaryResponse = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
      method: "POST",
      body: uploadData,
    });

    if (!cloudinaryResponse.ok) {
        const errorText = await cloudinaryResponse.text();
        console.error("Cloudinary Error:", errorText);
        return NextResponse.json({ error: `Cloudinary response error: ${errorText}` }, { status: 500 });
    }

    const result = await cloudinaryResponse.json();
    return NextResponse.json({ url: result.secure_url });

  } catch (error: any) {
    console.error("[upload-api]", error);
    return NextResponse.json({ error: "Server error during upload" }, { status: 500 });
  }
}
