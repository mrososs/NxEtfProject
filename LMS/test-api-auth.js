// Test script for API-based authentication
// Run this in browser console to test the new authentication flow

console.log('🔧 Testing API-based authentication...');

// Clear all tokens to test API-only authentication
console.log('🗑️ Clearing all authentication tokens...');
localStorage.clear();
document.cookie = '';

console.log('✅ All tokens cleared');
console.log('📦 localStorage:', {
  authToken: localStorage.getItem('authToken'),
  token: localStorage.getItem('token'),
  accessToken: localStorage.getItem('accessToken'),
  userId: localStorage.getItem('userId'),
});
console.log('🍪 cookies:', document.cookie);

console.log('🔄 Now refresh the page to test API-based authentication');
console.log('📝 Expected behavior:');
console.log('  1. App starts');
console.log('  2. API call to getProfile (no token in headers)');
console.log('  3. Backend reads userId from cookie internally');
console.log('  4. If 500/401/403 error → Show auth error page');
console.log('  5. If "No Profile Created" error → Redirect to /profile');
console.log('  6. If success → Continue normally');

// Test function to simulate the new flow
function testApiAuthFlow() {
  console.log('🔐 Testing API-based authentication flow...');

  // Simulate different API responses
  const testScenarios = [
    {
      name: 'Success with Profile',
      status: 200,
      response: { id: 1, firstName: 'Test', lastName: 'User' },
      expected: 'Continue normally',
    },
    {
      name: 'No Profile Created',
      status: 404,
      error: {
        message:
          'No Profile Created For This User Please Contact Your Administrator',
      },
      expected: 'Redirect to /profile',
    },
    {
      name: 'Authentication Error (500)',
      status: 500,
      error: { message: 'Internal Server Error' },
      expected: 'Show auth error page',
    },
    {
      name: 'Authentication Error (401)',
      status: 401,
      error: { message: 'Unauthorized' },
      expected: 'Show auth error page',
    },
  ];

  testScenarios.forEach((scenario, index) => {
    console.log(`\n📋 Test Scenario ${index + 1}: ${scenario.name}`);
    console.log(`   Status: ${scenario.status}`);
    console.log(`   Expected: ${scenario.expected}`);
  });

  console.log('\n🔄 Refresh the page to test with real API calls');
}

// Run test
testApiAuthFlow();
