// Empty fs polyfill for browser
export default {};
export const readFileSync = () => { throw new Error('fs.readFileSync is not available in browser'); };
export const writeFileSync = () => { throw new Error('fs.writeFileSync is not available in browser'); };
export const existsSync = () => false;
export const mkdirSync = () => { throw new Error('fs.mkdirSync is not available in browser'); };
