// get current stage
export const STAGE_PROD = 'prod';
export const isProd = (stage?: string) => (stage || getSstStage()) === STAGE_PROD;
export const getSstStage = () => process.env['SST_STAGE'] || 'unknown';
export const getSstApp = () => process.env['SST_APP'] || 'unknown';
