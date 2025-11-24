import * as FileSystem from 'expo-file-system/legacy';

const PHOTOS_DIR = FileSystem.documentDirectory + 'problem-photos/';

// Initialize photos directory
export async function initPhotoStorage() {
  const dirInfo = await FileSystem.getInfoAsync(PHOTOS_DIR);
  if (!dirInfo.exists) {
    await FileSystem.makeDirectoryAsync(PHOTOS_DIR, { intermediates: true });
    console.log('✅ Photo storage initialized');
  }
}

// Save photo locally and return local URI
export async function savePhotoLocally(
  base64: string,
  userId: string
): Promise<string> {
  await initPhotoStorage();

  const fileName = `${userId}_${Date.now()}.jpg`;
  const fileUri = PHOTOS_DIR + fileName;

  await FileSystem.writeAsStringAsync(fileUri, base64, {
    encoding: FileSystem.EncodingType.Base64,
  });

  console.log('✅ Photo saved locally:', fileUri);
  return fileUri;
}

// Get photo as base64 (for OpenAI)
export async function getPhotoAsBase64(uri: string): Promise<string> {
  return await FileSystem.readAsStringAsync(uri, {
    encoding: FileSystem.EncodingType.Base64,
  });
}

// Delete photo
export async function deletePhoto(uri: string): Promise<void> {
  const fileInfo = await FileSystem.getInfoAsync(uri);
  if (fileInfo.exists) {
    await FileSystem.deleteAsync(uri);
    console.log('✅ Photo deleted:', uri);
  }
}

// Get all photos
export async function getAllPhotos(): Promise<string[]> {
  await initPhotoStorage();
  const files = await FileSystem.readDirectoryAsync(PHOTOS_DIR);
  return files.map((file) => PHOTOS_DIR + file);
}
