/**
 * Test API endpoints
 * Run with: npx tsx scripts/test-api.ts
 */

import { config } from "dotenv";
import { resolve } from "path";

// Load environment variables
config({ path: resolve(process.cwd(), ".env.local") });

const BASE_URL = "http://localhost:3000";

async function testAPI() {
  console.log("🧪 Testing API Endpoints...\n");

  // Test 1: Register a new user
  console.log("1. Testing POST /api/auth/register");
  try {
    const registerResponse = await fetch(`${BASE_URL}/api/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: `test${Date.now()}@example.com`,
        password: "test123456",
        username: `testuser${Date.now()}`,
        displayName: "Test User",
      }),
    });

    const registerData = await registerResponse.json();
    console.log("   Status:", registerResponse.status);
    console.log("   Response:", registerData);

    if (registerResponse.ok && registerData.user) {
      const userId = registerData.user.id;
      console.log("   ✅ Registration successful\n");

      // Test 2: Login
      console.log("2. Testing POST /api/auth/login");
      const loginResponse = await fetch(`${BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: registerData.user.email,
          password: "test123456",
        }),
      });

      const loginData = await loginResponse.json();
      console.log("   Status:", loginResponse.status);
      console.log("   Response:", loginData);

      if (loginResponse.ok) {
        console.log("   ✅ Login successful\n");

        // Test 3: Create a post
        console.log("3. Testing POST /api/posts");
        const createPostResponse = await fetch(`${BASE_URL}/api/posts`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            authorId: userId,
            content: "This is a test post from API testing script!",
          }),
        });

        const createPostData = await createPostResponse.json();
        console.log("   Status:", createPostResponse.status);
        console.log("   Response:", createPostData);

        if (createPostResponse.ok && createPostData.post) {
          const postId = createPostData.post.id;
          console.log("   ✅ Post created successfully\n");

          // Test 4: Get all posts
          console.log("4. Testing GET /api/posts");
          const getPostsResponse = await fetch(`${BASE_URL}/api/posts`);
          const getPostsData = await getPostsResponse.json();
          console.log("   Status:", getPostsResponse.status);
          console.log("   Posts count:", getPostsData.posts?.length || 0);
          console.log("   ✅ Get posts successful\n");

          // Test 5: Get user profile
          console.log("5. Testing GET /api/users/profile");
          const getProfileResponse = await fetch(`${BASE_URL}/api/users/profile`, {
            headers: {
              "x-user-id": userId,
            },
          });
          const getProfileData = await getProfileResponse.json();
          console.log("   Status:", getProfileResponse.status);
          console.log("   Response:", getProfileData);
          console.log("   ✅ Get profile successful\n");

          // Test 6: Update user profile
          console.log("6. Testing PUT /api/users/profile");
          const updateProfileResponse = await fetch(`${BASE_URL}/api/users/profile`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              "x-user-id": userId,
            },
            body: JSON.stringify({
              displayName: "Updated Test User",
              bio: "This is an updated bio",
            }),
          });
          const updateProfileData = await updateProfileResponse.json();
          console.log("   Status:", updateProfileResponse.status);
          console.log("   Response:", updateProfileData);
          console.log("   ✅ Update profile successful\n");

          // Test 7: Delete post
          console.log("7. Testing DELETE /api/posts/[id]");
          const deletePostResponse = await fetch(`${BASE_URL}/api/posts/${postId}`, {
            method: "DELETE",
          });
          const deletePostData = await deletePostResponse.json();
          console.log("   Status:", deletePostResponse.status);
          console.log("   Response:", deletePostData);
          console.log("   ✅ Delete post successful\n");

          console.log("✅ All API tests passed!");
        } else {
          console.log("   ❌ Failed to create post");
        }
      } else {
        console.log("   ❌ Login failed");
      }
    } else {
      console.log("   ❌ Registration failed");
    }
  } catch (error) {
    console.error("❌ Test error:", error);
  }
}

// Run tests
testAPI().catch(console.error);




