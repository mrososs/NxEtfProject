// Test script to add authentication tokens
// Run this in browser console to test the profile system

console.log('🔧 Setting up test authentication tokens...');

// Add test tokens to localStorage
localStorage.setItem('authToken', 'test-auth-token-123');
localStorage.setItem('token', 'test-token-456');
localStorage.setItem('accessToken', 'test-access-token-789');
localStorage.setItem('userId', 'test-user-123');

// Add test tokens to cookies
document.cookie = 'authToken=test-auth-token-123; path=/';
document.cookie = 'token=test-token-456; path=/';
document.cookie = 'accessToken=test-access-token-789; path=/';
document.cookie = 'userId=test-user-123; path=/';

console.log('✅ Test tokens added to localStorage and cookies');
console.log('📦 localStorage:', {
  authToken: localStorage.getItem('authToken'),
  token: localStorage.getItem('token'),
  accessToken: localStorage.getItem('accessToken'),
  userId: localStorage.getItem('userId'),
});
console.log('🍪 cookies:', document.cookie);

// Test the ProfileService
if (window.angular) {
  const app = window.angular.element(document.body).scope();
  if (app && app.profileService) {
    console.log('🔐 Testing authentication...');
    console.log('Is authenticated:', app.profileService.isAuthenticated());
  }
}

console.log('🔄 Refresh the page to test the profile system');
