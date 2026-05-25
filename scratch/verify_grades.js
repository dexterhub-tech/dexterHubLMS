

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
const learner = {
  email: 'testlearner@example.com',
  password: 'Pass123!',
  firstName: 'Test',
  lastName: 'Learner',
  role: 'learner'
};

async function register() {
  const res = await fetch(`${API_URL}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(learner)
  });
  const data = await res.json();
  if (!res.ok) {
    console.error('Register error:', data);
    throw new Error('Register failed');
  }
  console.log('Registered:', data.user.email);
  return data.user._id;
}

async function login() {
  const res = await fetch(`${API_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: learner.email, password: learner.password })
  });
  const data = await res.json();
  if (!res.ok) {
    console.error('Login error:', data);
    throw new Error('Login failed');
  }
  console.log('Logged in, token received');
  return { token: data.token, userId: data.user._id };
}

async function getGrades(token, userId) {
  const res = await fetch(`${API_URL}/api/learner-progress/${userId}/grades-review`, {
    method: 'GET',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const data = await res.json();
  console.log('Grades Review response status:', res.status);
  console.log('Response:', JSON.stringify(data, null, 2));
}

(async () => {
  try {
    // Register may fail if user exists; ignore errors
    let userId;
    try { userId = await register(); } catch (e) { console.log('User may already exist, proceeding to login'); }
    const loginData = await login();
    await getGrades(loginData.token, loginData.userId);
  } catch (err) {
    console.error('Verification script error:', err);
    process.exit(1);
  }
})();
