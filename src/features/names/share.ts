import * as Sharing from 'expo-sharing';
import type { RefObject } from 'react';
import { Platform, Share, type View } from 'react-native';
import { captureRef } from 'react-native-view-shot';

/** Captures the card as a PNG and opens the share sheet; text on web or if capture fails. */
export async function shareCard(ref: RefObject<View | null>, fallbackText: string): Promise<void> {
  if (Platform.OS !== 'web' && ref.current && (await Sharing.isAvailableAsync())) {
    try {
      const uri = await captureRef(ref, { format: 'png', quality: 1, result: 'tmpfile' });
      await Sharing.shareAsync(uri, { mimeType: 'image/png', UTI: 'public.png' });
      return;
    } catch {
      // Fall back to sharing the text.
    }
  }
  await Share.share({ message: fallbackText });
}
