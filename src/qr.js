import QRCode from 'qrcode';

/**
 * Generates a QR code data URL (PNG) from text
 * @param {string} text 
 * @param {object} options
 */
export async function generateQRDataUrl(text, options = {}) {
  try {
    const dataUrl = await QRCode.toDataURL(text, {
      width: options.width || 280,
      margin: 2,
      color: {
        dark: options.darkColor || '#0f172a',
        light: options.lightColor || '#ffffff'
      },
      errorCorrectionLevel: 'H'
    });
    return dataUrl;
  } catch (err) {
    console.error('Failed to generate QR Code:', err);
    throw err;
  }
}

/**
 * Generates an SVG string of the QR code
 * @param {string} text 
 * @param {object} options 
 */
export async function generateQRSVG(text, options = {}) {
  try {
    const svgString = await QRCode.toString(text, {
      type: 'svg',
      width: options.width || 280,
      margin: 2,
      color: {
        dark: options.darkColor || '#0f172a',
        light: options.lightColor || '#ffffff'
      },
      errorCorrectionLevel: 'H'
    });
    return svgString;
  } catch (err) {
    console.error('Failed to generate QR SVG:', err);
    throw err;
  }
}
