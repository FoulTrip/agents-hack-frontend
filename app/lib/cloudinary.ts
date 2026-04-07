/**
 * Helper to upload files to Cloudinary via our secure API proxy.
 * This keeps API_SECRET off the client side.
 */

export async function uploadToCloudinary(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);

  try {
    const response = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Error uploading to Cloudinary via Proxy");
    }

    const data = await response.json();
    return data.url;
  } catch (error) {
    console.error("Cloudinary upload failed:", error);
    throw error;
  }
}
