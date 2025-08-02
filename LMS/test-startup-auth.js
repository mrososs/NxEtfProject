// Test script for startup authentication and interceptor
// Run this in browser console to test the new functionality

console.log('🔧 Testing startup authentication and interceptor...');

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
console.log('  2. AuthInterceptor adds credentials: include to ALL requests');
console.log('  3. checkAuthenticationOnStartup() is called');
console.log('  4. API call to getProfile with credentials');
console.log('  5. If 401 error → Navigate to /error-500 page');
console.log('  6. If "No Profile Created" error → Redirect to /profile');
console.log('  7. If success → Continue normally');

// Test function to simulate the new flow
function testStartupAuthFlow() {
  console.log('🔐 Testing startup authentication flow...');

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
      name: '401 Not Authorized',
      status: 401,
      error: { message: 'Not Authorized' },
      expected: 'Navigate to /error-500 page',
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
      name: 'Authentication Error (403)',
      status: 403,
      error: { message: 'Forbidden' },
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
    '🔧 AuthInterceptor will add credentials: include to ALL requests'
  );
  console.log(
    '🚀 checkAuthenticationOnStartup() will be called on app startup'
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
  console.log('   - This will send cookies with ALL requests');

  console.log('✅ AuthInterceptor should add credentials to ALL requests');
  console.log('✅ This includes getProfile and all other API calls');
}

// Test function to check startup auth
function testStartupAuth() {
  console.log('🚀 Testing startup authentication...');

  console.log('📋 Startup authentication flow:');
  console.log('  1. App starts');
  console.log('  2. AppComponent.ngOnInit() is called');
  console.log('  3. profileService.checkAuthenticationOnStartup() is called');
  console.log('  4. API call to getProfile with credentials');
  console.log('  5. Handle response based on status code');

  console.log('\n📋 Error handling:');
  console.log('  - 401: Show error page → http://etf.itechpro-eg.com/');
  console.log('  - 403: Show error page → http://etf.itechpro-eg.com/');
  console.log('  - 500: Show error page → http://etf.itechpro-eg.com/');
  console.log('  - 404 (No Profile): Redirect to /profile');
  console.log('  - 200: Continue normally');
}

// Run tests
testInterceptor();
testStartupAuth();
testStartupAuthFlow();

console.log('\n📝 To test the error page manually:');
console.log('  1. Navigate to: /error-500');
console.log('  2. You should see the authentication error page');
console.log('  3. Click the button to go to http://etf.itechpro-eg.com/');

console.log('\n🔧 To test 401 error:');
console.log('  1. Clear all tokens (localStorage.clear())');
console.log('  2. Refresh the page');
console.log('  3. Should redirect to /error-500 if API returns 401');
