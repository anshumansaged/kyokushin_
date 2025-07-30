const testRegistration = async () => {
  try {
    console.log('🧪 Testing Registration API...');
    
    const registrationData = {
      email: 'test@example.com',
      password: 'password123',
      role: 'student',
      profile: {
        firstName: 'Test',
        lastName: 'User',
        phoneNumber: '1234567890',
        assignedInstructor: 'admin-approval'
      }
    };

    const response = await fetch('http://localhost:5001/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(registrationData),
    });

    const result = await response.json();
    console.log('Registration Response:', result);
    return result;
  } catch (error) {
    console.error('Registration Test Error:', error);
  }
};

const testLogin = async () => {
  try {
    console.log('🧪 Testing Login API...');
    
    const loginData = {
      email: 'test@example.com',
      password: 'password123'
    };

    const response = await fetch('http://localhost:5001/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(loginData),
    });

    const result = await response.json();
    console.log('Login Response:', result);
    return result;
  } catch (error) {
    console.error('Login Test Error:', error);
  }
};

const testAPI = async () => {
  console.log('🚀 Starting API Tests...');
  
  // Test basic server connection
  try {
    const healthCheck = await fetch('http://localhost:5001/');
    const health = await healthCheck.json();
    console.log('Server Health:', health);
  } catch (error) {
    console.error('Server connection error:', error);
    return;
  }

  // Test registration
  await testRegistration();
  
  // Wait a bit, then test login
  setTimeout(async () => {
    await testLogin();
  }, 1000);
};

// Run tests if we're in Node.js environment
if (typeof window === 'undefined') {
  testAPI();
}

module.exports = { testRegistration, testLogin, testAPI };
