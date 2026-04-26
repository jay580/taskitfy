// ─── Cloudinary Upload Service ───
// Uses unsigned upload preset — no server-side auth required.
// Configure CLOUD_NAME and UPLOAD_PRESET before first use.

const CLOUD_NAME = 'dtefn8n6g';
const UPLOAD_PRESET = 'taskbuzz_upload';

const CLOUDINARY_URL = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;

/**
 * Uploads a local image URI to Cloudinary and returns the secure URL.
 *
 * @param imageUri - The local file URI (e.g. from expo-image-picker)
 * @returns The Cloudinary `secure_url` for the uploaded image
 * @throws Error with a meaningful message if upload fails
 */
export const uploadToCloudinary = async (imageUri: string): Promise<string> => {
  if (!imageUri) {
    throw new Error('No image URI provided for upload.');
  }

  // Build multipart form data with universal type
  const formData = new FormData();

  formData.append('file', {
    uri: imageUri,
    name: `upload_${Date.now()}`,
    type: 'image/*',
  } as any);
  formData.append('upload_preset', UPLOAD_PRESET);

  try {
    const response = await fetch(CLOUDINARY_URL, {
      method: 'POST',
      body: formData,
      headers: {
        Accept: 'application/json',
        // Content-Type is set automatically by fetch for FormData
      },
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Cloudinary error response:', data);
      throw new Error(
        data?.error?.message || `Cloudinary upload failed (${response.status})`
      );
    }

    if (!data.secure_url) {
      console.error('Cloudinary response missing secure_url:', data);
      throw new Error('Cloudinary response did not contain a secure_url.');
    }

    return data.secure_url;
  } catch (error: any) {
    // Re-throw with context if it's not already our error
    if (error.message?.includes('Cloudinary') || error.message?.includes('upload failed')) {
      throw error;
    }
    throw new Error(`Image upload failed: ${error.message || 'Network error. Check your connection.'}`);
  }
};

/**
 * Uploads multiple images to Cloudinary in parallel.
 * Returns array of secure_urls for successful uploads.
 * Throws on first failure (fail-fast for data integrity).
 *
 * @param imageUris - Array of local file URIs
 * @returns Array of Cloudinary secure_urls
 * @throws Error if any single upload fails
 */
export const uploadMultipleToCloudinary = async (imageUris: string[]): Promise<string[]> => {
  if (!imageUris.length) {
    throw new Error('No images provided for upload.');
  }

  try {
    const results = await Promise.all(
      imageUris.map((uri) => uploadToCloudinary(uri))
    );
    return results;
  } catch (error: any) {
    throw new Error(`Multi-image upload failed: ${error.message}`);
  }
};
