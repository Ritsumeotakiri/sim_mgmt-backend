const soap = require('soap');
const logger = require('../utils/logger');

const SOAP_ENDPOINT = process.env.SOAP_ENDPOINT;
const SOAP_USERNAME = process.env.SOAP_USERNAME;
const SOAP_PASSWORD = process.env.SOAP_PASSWORD;

let soapClient = null;

/**
 * Initialize SOAP client
 */
const initSoapClient = async () => {
  try {
    if (!SOAP_ENDPOINT) {
      logger.warn('SOAP_ENDPOINT not configured');
      return null;
    }

    const client = await soap.createClientAsync(SOAP_ENDPOINT, {
      wsdl_options: {
        timeout: 30000,
      },
    });

    // Add authentication if credentials are provided
    if (SOAP_USERNAME && SOAP_PASSWORD) {
      client.setSecurity(
        new soap.BasicAuthSecurity(SOAP_USERNAME, SOAP_PASSWORD)
      );
    }

    soapClient = client;
    logger.info('SOAP client initialized successfully');
    return client;
  } catch (error) {
    logger.error('Failed to initialize SOAP client', { error: error.message });
    throw error;
  }
};

/**
 * Get SOAP client (initialize if not already done)
 */
const getSoapClient = async () => {
  if (!soapClient) {
    await initSoapClient();
  }
  return soapClient;
};

/**
 * Call a SOAP method
 * @param {string} methodName - Name of the SOAP method
 * @param {object} params - Parameters for the SOAP method
 */
const callSoapMethod = async (methodName, params) => {
  try {
    const client = await getSoapClient();
    
    if (!client) {
      throw new Error('SOAP client not available');
    }

    logger.info(`Calling SOAP method: ${methodName}`, { params });

    const result = await client[methodName + 'Async'](params);
    
    logger.info(`SOAP method ${methodName} executed successfully`);
    return result;
  } catch (error) {
    logger.error(`SOAP method ${methodName} failed`, { error: error.message });
    throw error;
  }
};

/**
 * Example: Activate SIM card via SOAP
 */
const activateSIM = async (simNumber, customerData) => {
  try {
    const params = {
      simNumber,
      customerData,
    };

    const result = await callSoapMethod('ActivateSIM', params);
    return result;
  } catch (error) {
    logger.error('Failed to activate SIM', { simNumber, error: error.message });
    throw error;
  }
};

/**
 * Example: Deactivate SIM card via SOAP
 */
const deactivateSIM = async (simNumber) => {
  try {
    const params = {
      simNumber,
    };

    const result = await callSoapMethod('DeactivateSIM', params);
    return result;
  } catch (error) {
    logger.error('Failed to deactivate SIM', { simNumber, error: error.message });
    throw error;
  }
};

/**
 * Example: Check SIM status via SOAP
 */
const checkSIMStatus = async (simNumber) => {
  try {
    const params = {
      simNumber,
    };

    const result = await callSoapMethod('CheckSIMStatus', params);
    return result;
  } catch (error) {
    logger.error('Failed to check SIM status', { simNumber, error: error.message });
    throw error;
  }
};

module.exports = {
  initSoapClient,
  getSoapClient,
  callSoapMethod,
  activateSIM,
  deactivateSIM,
  checkSIMStatus,
};
