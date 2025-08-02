// Test script for AuthInterceptor and Error500 page
// Run this in browser console to test the new functionality

console.log('🔧 Testing AuthInterceptor and Error500 page...');

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

console.log('🔄 Now refresh the page to test the new system');
console.log('📝 Expected behavior:');
console.log('  1. App starts');
console.log('  2. AuthInterceptor adds credentials: include to all requests');
console.log('  3. API call to getProfile with credentials');
console.log('  4. Backend reads userId from cookie internally');
console.log('  5. If 500/401/403 error → Navigate to /error-500 page');
console.log('  6. If "No Profile Created" error → Redirect to /profile');
console.log('  7. If success → Continue normally');

// Test function to simulate the new flow
function testInterceptorFlow() {
  console.log('🔐 Testing AuthInterceptor flow...');

  // Simulate different API responses
  const testScenarios = [
    {
      name: 'Success with Profile',
      status: 200,
      response: { id: 1, firstName: 'Test', lastName: 'User' },
      expected: 'Continue normally',
      credentials: 'include',
    },
    {
      name: 'No Profile Created',
      status: 404,
      error: {
        message:
          'No Profile Created For This User Please Contact Your Administrator',
      },
      expected: 'Redirect to /profile',
      credentials: 'include',
    },
    {
      name: 'Authentication Error (500)',
      status: 500,
      error: { message: 'Internal Server Error' },
      expected: 'Navigate to /error-500 page',
      credentials: 'include',
    },
    {
      name: 'Authentication Error (401)',
      status: 401,
      error: { message: 'Unauthorized' },
      expected: 'Navigate to /error-500 page',
      credentials: 'include',
    },
  ];

  testScenarios.forEach((scenario, index) => {
    console.log(`\n📋 Test Scenario ${index + 1}: ${scenario.name}`);
    console.log(`   Status: ${scenario.status}`);
    console.log(`   Credentials: ${scenario.credentials}`);
    console.log(`   Expected: ${scenario.expected}`);
  });

  console.log('\n🔄 Refresh the page to test with real API calls');
  console.log(
    '🔧 AuthInterceptor will add credentials: include to all requests'
  );
}

// Test function to check interceptor
function testInterceptor() {
  console.log('🔧 Testing AuthInterceptor...');

  // Simulate HTTP request
  const mockRequest = {
    url: 'https://api.example.com/profile',
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  };

  console.log('📤 Original request:', mockRequest);
  console.log('📤 Expected modified request:');
  console.log('   - withCredentials: true');
  console.log('   - This will send cookies with the request');

  console.log('✅ AuthInterceptor should add credentials to all requests');
}

// Run tests
testInterceptor();
testInterceptorFlow();

console.log('\n📝 To test the error page manually:');
console.log('  1. Navigate to: /error-500');
console.log('  2. You should see the authentication error page');
console.log('  3. Click the button to go to http://etf.itechpro-eg.com/');
