import { Directory, File } from 'expo-file-system';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { Platform } from 'react-native';

/** Renders the report to a PDF in the cache directory. */
export async function renderPdf(html: string): Promise<string> {
  const { uri } = await Print.printToFileAsync({ html });
  return uri;
}

export async function sharePdf(uri: string, title: string): Promise<void> {
  if (!(await Sharing.isAvailableAsync())) return;
  await Sharing.shareAsync(uri, {
    mimeType: 'application/pdf',
    UTI: 'com.adobe.pdf',
    dialogTitle: title,
  });
}

/**
 * Saves the PDF where the user chooses. Android asks for a folder; iOS has no
 * folder picker for writing, so it opens the share sheet ("Save to Files").
 * Returns false when the user cancels.
 */
export async function savePdf(uri: string, fileName: string, title: string): Promise<boolean> {
  if (Platform.OS !== 'android') {
    await sharePdf(uri, title);
    return true;
  }
  let dir: Directory;
  try {
    dir = await Directory.pickDirectoryAsync();
  } catch {
    return false;
  }
  const bytes = await new File(uri).bytes();
  dir.createFile(fileName, 'application/pdf').write(bytes);
  return true;
}

export async function printPdf(html: string): Promise<void> {
  await Print.printAsync({ html });
}
