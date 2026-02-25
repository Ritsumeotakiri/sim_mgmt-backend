const QRCode = require('qrcode');
const logger = require('../utils/logger');

/**
 * Generate QR code image as Data URL (base64)
 * Generated on-demand using ICCID
 */
const generateQRCodeImage = async (data) => {
  try {
    const qrCodeDataURL = await QRCode.toDataURL(data, {
      errorCorrectionLevel: 'H',
      type: 'image/png',
      quality: 0.92,
      margin: 1,
      width: 300,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });
    return qrCodeDataURL;
  } catch (error) {
    logger.error('Error generating QR code image', { error: error.message });
    throw new Error('Failed to generate QR code image');
  }
};

/**
 * Generate QR code as buffer (for file download)
 * Generated on-demand using ICCID
 */
const generateQRCodeBuffer = async (data) => {
  try {
    const buffer = await QRCode.toBuffer(data, {
      errorCorrectionLevel: 'H',
      type: 'png',
      quality: 0.92,
      margin: 1,
      width: 300
    });
    return buffer;
  } catch (error) {
    logger.error('Error generating QR code buffer', { error: error.message });
    throw new Error('Failed to generate QR code buffer');
  }
};

/**
 * Create QR data object for a SIM using ICCID
 */
const createSimQRData = (simId, iccid) => {
  return {
    type: 'SIM',
    iccid: iccid,
    simId: simId,
    url: `${process.env.API_URL || 'http://localhost:3000'}/api/sims/scan/${iccid}`,
    timestamp: new Date().toISOString()
  };
};

/**
 * Generate QR code image for a SIM using ICCID
 */
const generateSimQRImage = async (simId, iccid) => {
  const qrData = createSimQRData(simId, iccid);
  const qrString = JSON.stringify(qrData);
  return await generateQRCodeImage(qrString);
};

/**
 * Generate QR code buffer for a SIM using ICCID
 */
const generateSimQRBuffer = async (simId, iccid) => {
  const qrData = createSimQRData(simId, iccid);
  const qrString = JSON.stringify(qrData);
  return await generateQRCodeBuffer(qrString);
};

module.exports = {
  generateQRCodeImage,
  generateQRCodeBuffer,
  createSimQRData,
  generateSimQRImage,
  generateSimQRBuffer
};
