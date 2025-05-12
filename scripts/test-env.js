// This script tests whether the .env file is being loaded correctly
require('dotenv').config();

console.log('======= Testing .env file loading =======');
console.log('OPENAI_API_KEY exists:', process.env.OPENAI_API_KEY ? 'Yes' : 'No');
console.log('OPENAI_API_KEY type:', typeof process.env.OPENAI_API_KEY);

// Only log the beginning of the key for security
if (typeof process.env.OPENAI_API_KEY === 'string' && process.env.OPENAI_API_KEY.length > 0) {
  console.log('Key starts with:', process.env.OPENAI_API_KEY.substring(0, 3) + '...');
  console.log('Key length:', process.env.OPENAI_API_KEY.length);
  console.log('Environment variable is loading correctly!');
} else {
  console.log('ERROR: Environment variable is not loading correctly!');
  console.log('Make sure your .env file exists and has the format:');
  console.log('OPENAI_API_KEY=sk-your-key-here');
  console.log('No quotes, no spaces, just the key directly after =');
} 