// Test script to test redirect functionality
// Run this in browser console to test the redirect system

console.log('🔧 Testing redirect functionality...');

// Clear all tokens to test redirect
console.log('🗑️ Clearing all authentication tokens...');
localStorage.removeItem('authToken');
localStorage.removeItem('token');
localStorage.removeItem('accessToken');
localStorage.removeItem('userId');

// Clear cookies
document.cookie = 'authToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
document.cookie =
  'accessToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
document.cookie = 'userId=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';

console.log('✅ All tokens cleared');
console.log('📦 localStorage:', {
  authToken: localStorage.getItem('authToken'),
  token: localStorage.getItem('token'),
  accessToken: localStorage.getItem('accessToken'),
  userId: localStorage.getItem('userId'),
});
console.log('🍪 cookies:', document.cookie);

console.log(
  '🔄 Now refresh the page to test redirect to http://etf.itechpro-eg.com/'
);
console.log('📝 Expected behavior:');
console.log('  1. App starts');
console.log('  2. Authentication check fails');
console.log('  3. Redirect to http://etf.itechpro-eg.com/');

// Test function to simulate authentication check
function testAuthCheck() {
  console.log('🔐 Testing authentication check...');
  const token =
    localStorage.getItem('authToken') ||
    localStorage.getItem('token') ||
    localStorage.getItem('accessToken');

  if (!token) {
    console.log('❌ No token found - should redirect');
    console.log('🌐 Redirecting to: http://etf.itechpro-eg.com/');
    // Uncomment the next line to actually test the redirect
    // window.location.href = 'http://etf.itechpro-eg.com/';
  } else {
    console.log('✅ Token found:', token);
  }
}

// Run test
testAuthCheck();
