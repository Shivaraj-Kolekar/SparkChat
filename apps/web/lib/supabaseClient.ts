import { createClient } from '@supabase/supabase-js';

// These environment variables should be set in your .env.local or deployment environment
const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY!;

// Create a single Supabase client for the app
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Utility function for uploading a file to a bucket
export async function uploadChatFile({
  file,
  chatId,
  userId,
  bucket = 'chat-files',
}: {
  file: File;
  chatId: string;
  userId: string;
  bucket?: string;
}): Promise<{ url: string; fileName: string; fileType: string } | { error: string }> {
  const fileExt = file.name.split('.').pop();
  const fileName = `${chatId}/${userId}/${Date.now()}-${file.name}`;
  const filePath = fileName;

  // Upload file to Supabase Storage
  const { data, error } = await supabase.storage.from(bucket).upload(filePath, file, {
    cacheControl: '3600',
    upsert: false,
    contentType: file.type,
  });

  if (error) {
    return { error: error.message };
  }

  // Get public URL for the uploaded file
  const { data: publicUrlData } = supabase.storage.from(bucket).getPublicUrl(filePath);

  return {
    url: publicUrlData?.publicUrl ?? '',
    fileName: file.name,
    fileType: file.type,
  };
}
