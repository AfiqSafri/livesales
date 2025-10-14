/**
 * Mobile-Friendly Image Download Utility
 * 
 * This utility handles image downloads that work properly on mobile devices,
 * ensuring images are saved to the device's gallery/photos instead of downloads folder.
 * 
 * Features:
 * - Detects mobile devices
 * - Uses proper mobile download methods
 * - Handles both blob URLs and direct image URLs
 * - Provides fallback for desktop browsers
 * - Shows user-friendly messages
 */

/**
 * Detect if the user is on a mobile device
 * @returns {boolean} True if mobile device detected
 */
export function isMobileDevice() {
  if (typeof window === 'undefined') return false; // SSR safety
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
         window.innerWidth <= 768;
}

/**
 * Detect if the user is on iOS
 * @returns {boolean} True if iOS device detected
 */
export function isIOS() {
  if (typeof window === 'undefined') return false; // SSR safety
  return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
}

/**
 * Detect if the user is on Android
 * @returns {boolean} True if Android device detected
 */
export function isAndroid() {
  if (typeof window === 'undefined') return false; // SSR safety
  return /Android/.test(navigator.userAgent);
}

/**
 * Convert image URL to blob for better mobile compatibility
 * @param {string} imageUrl - The image URL to convert
 * @returns {Promise<Blob>} Promise that resolves to blob
 */
export async function urlToBlob(imageUrl) {
  try {
    const response = await fetch(imageUrl, {
      mode: 'cors', // Enable CORS for production
      credentials: 'omit' // Don't send credentials
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.blob();
  } catch (error) {
    console.error('Error converting URL to blob:', error);
    throw error;
  }
}

/**
 * Create a blob URL from image data
 * @param {Blob} blob - The blob data
 * @returns {string} Blob URL
 */
export function createBlobURL(blob) {
  return URL.createObjectURL(blob);
}

/**
 * Download image for mobile devices (saves to gallery)
 * @param {string} imageUrl - The image URL to download
 * @param {string} filename - The filename for the download
 * @param {Function} onSuccess - Success callback
 * @param {Function} onError - Error callback
 */
export async function downloadImageForMobile(imageUrl, filename, onSuccess, onError) {
  try {
    // Show loading message
    if (onSuccess) {
      onSuccess('Preparing download...');
    }

    // Convert to blob for better mobile compatibility
    const blob = await urlToBlob(imageUrl);
    const blobUrl = createBlobURL(blob);

    if (isMobileDevice()) {
      // Prefer system share sheet on mobile so user can choose Photos/Gallery
      if (await tryShareImage(blob, filename)) {
        if (onSuccess) {
          onSuccess('Sharing opened — choose Photos/Gallery to save.');
        }
        setTimeout(() => URL.revokeObjectURL(blobUrl), 10000);
        return;
      }

      // Fallback mobile-specific logic
      if (isIOS()) {
        // iOS: Open image in new tab to trigger save to photos
        const newWindow = window.open(blobUrl, '_blank');
        if (newWindow) {
          // Show instruction message
          setTimeout(() => {
            if (onSuccess) {
              onSuccess('Image opened! Long press and tap "Save to Photos" to save to your gallery.');
            }
          }, 1000);
        } else {
          // Fallback: Use download link
          downloadImageFallback(blobUrl, filename);
          if (onSuccess) {
            onSuccess('Download started! Check your downloads folder.');
          }
        }
      } else if (isAndroid()) {
        // Android: Try to trigger download
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = filename;
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        if (onSuccess) {
          onSuccess('Download started! Check your gallery or downloads folder.');
        }
      } else {
        // Other mobile devices: Use fallback
        downloadImageFallback(blobUrl, filename);
        if (onSuccess) {
          onSuccess('Download started! Check your downloads folder.');
        }
      }
    } else {
      // Desktop: Use standard download
      downloadImageFallback(blobUrl, filename);
      if (onSuccess) {
        onSuccess('Download started!');
      }
    }

    // Clean up blob URL after a delay
    setTimeout(() => {
      URL.revokeObjectURL(blobUrl);
    }, 10000);

  } catch (error) {
    console.error('Error downloading image:', error);
    if (onError) {
      onError('Failed to download image. Please try again.');
    }
  }
}

/**
 * Try using the Web Share API to share image (recommended for saving to Photos/Gallery)
 * @param {Blob} blob
 * @param {string} filename
 * @returns {Promise<boolean>} true if share sheet opened
 */
export async function tryShareImage(blob, filename) {
  try {
    if (typeof navigator === 'undefined' || !navigator.share) return false;

    const file = new File([blob], filename, { type: blob.type || 'image/jpeg' });
    // Check if canShare with files (Android Chrome supports; iOS partial)
    if (navigator.canShare && !navigator.canShare({ files: [file] })) {
      // Some browsers require plain share without files; fallback to false
      return false;
    }

    await navigator.share({
      files: [file],
      title: 'Save Image',
      text: 'Save this image to your Photos/Gallery',
    });
    return true;
  } catch (err) {
    // User cancelled or not supported — fall back
    return false;
  }
}

/**
 * High-level helper to prefer saving to Photos via share sheet on mobile
 */
export async function saveImageToPhotos(imageUrl, filename, options = {}) {
  const { onSuccess, onError, showInstructions = true } = options;
  try {
    const blob = await urlToBlob(imageUrl);

    // Try share first on mobile
    if (isMobileDevice()) {
      const shared = await tryShareImage(blob, filename);
      if (shared) {
        if (onSuccess) onSuccess('Sharing opened — choose Photos/Gallery to save.');
        return;
      }

      // If share not available, show instructions and open/tab behavior will follow in download flow
      if (showInstructions) showMobileDownloadInstructions();
    }

    // Fallback: normal download flow
    const blobUrl = createBlobURL(blob);
    downloadImageFallback(blobUrl, filename);
    if (onSuccess) onSuccess(isMobileDevice() ? 'Download started — check Photos or Downloads.' : 'Download started!');
    setTimeout(() => URL.revokeObjectURL(blobUrl), 10000);
  } catch (error) {
    if (onError) onError('Failed to save image. Please try again.');
  }
}

/**
 * Fallback download method for desktop and when mobile methods fail
 * @param {string} url - The URL to download
 * @param {string} filename - The filename for the download
 */
export function downloadImageFallback(url, filename) {
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Show download instructions for mobile users
 * @param {Function} onClose - Callback when user closes instructions
 */
export function showMobileDownloadInstructions(onClose) {
  const isIOSDevice = isIOS();
  const isAndroidDevice = isAndroid();
  
  let instructions = '';
  
  if (isIOSDevice) {
    instructions = `
      <div class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div class="bg-white rounded-lg p-6 max-w-sm mx-auto">
          <h3 class="text-lg font-semibold mb-4">How to Save Image to Photos</h3>
          <div class="space-y-3 text-sm text-gray-600">
            <p>1. The image will open in a new tab</p>
            <p>2. Long press on the image</p>
            <p>3. Tap "Save to Photos" or "Add to Photos"</p>
            <p>4. The image will be saved to your Photos app</p>
          </div>
          <button onclick="this.parentElement.parentElement.remove()" 
                  class="mt-4 w-full bg-blue-600 text-white py-2 rounded-lg">
            Got it!
          </button>
        </div>
      </div>
    `;
  } else if (isAndroidDevice) {
    instructions = `
      <div class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div class="bg-white rounded-lg p-6 max-w-sm mx-auto">
          <h3 class="text-lg font-semibold mb-4">How to Save Image to Gallery</h3>
          <div class="space-y-3 text-sm text-gray-600">
            <p>1. The download will start automatically</p>
            <p>2. Check your Gallery or Downloads folder</p>
            <p>3. If not in Gallery, move it from Downloads</p>
            <p>4. The image will be available in your Gallery</p>
          </div>
          <button onclick="this.parentElement.parentElement.remove()" 
                  class="mt-4 w-full bg-blue-600 text-white py-2 rounded-lg">
            Got it!
          </button>
        </div>
      </div>
    `;
  } else {
    instructions = `
      <div class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div class="bg-white rounded-lg p-6 max-w-sm mx-auto">
          <h3 class="text-lg font-semibold mb-4">How to Save Image</h3>
          <div class="space-y-3 text-sm text-gray-600">
            <p>1. The download will start automatically</p>
            <p>2. Check your Downloads folder</p>
            <p>3. The image will be saved there</p>
          </div>
          <button onclick="this.parentElement.parentElement.remove()" 
                  class="mt-4 w-full bg-blue-600 text-white py-2 rounded-lg">
            Got it!
          </button>
        </div>
      </div>
    `;
  }
  
  // Create and show the instructions
  const instructionDiv = document.createElement('div');
  instructionDiv.innerHTML = instructions;
  document.body.appendChild(instructionDiv);
  
  // Auto-remove after 10 seconds
  setTimeout(() => {
    if (instructionDiv.parentElement) {
      instructionDiv.remove();
    }
    if (onClose) onClose();
  }, 10000);
}

/**
 * Enhanced download function with mobile optimization
 * @param {string} imageUrl - The image URL to download
 * @param {string} filename - The filename for the download
 * @param {Object} options - Additional options
 * @param {Function} options.onSuccess - Success callback
 * @param {Function} options.onError - Error callback
 * @param {boolean} options.showInstructions - Whether to show mobile instructions
 */
export async function downloadImage(imageUrl, filename, options = {}) {
  const { onSuccess, onError, showInstructions = true } = options;
  
  // Show instructions for mobile users
  if (showInstructions && isMobileDevice()) {
    showMobileDownloadInstructions();
  }
  
  // Download the image
  await downloadImageForMobile(imageUrl, filename, onSuccess, onError);
}
