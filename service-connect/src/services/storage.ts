import { supabase } from './supabase';
import { decode } from 'base64-arraybuffer';

const BUCKET_NAME = 'problem-photos';

export async function uploadProblemPhoto(
  base64: string,
  userId: string
): Promise<string> {
  try {
    const fileName = `${userId}/${Date.now()}.jpg`;

    // Convert base64 to ArrayBuffer for Supabase
    const arrayBuffer = decode(base64);

    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(fileName, arrayBuffer, {
        contentType: 'image/jpeg',
        upsert: false,
      });

    if (error) {
      throw error;
    }

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from(BUCKET_NAME).getPublicUrl(data.path);

    return publicUrl;
  } catch (error) {
    console.error('Error uploading photo:', error);
    throw error;
  }
}
