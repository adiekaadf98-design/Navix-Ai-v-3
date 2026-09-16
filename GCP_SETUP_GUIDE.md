# Google Cloud Vertex AI Setup Guide

To enable high-quality image (Imagen 3) and video (Veo 2.0) generation in Navix AI, the application routes these specific requests to Google Cloud Vertex AI instead of the standard Gemini API endpoints.

This requires authenticating your application with a Google Cloud Project that has the Vertex AI API enabled.

## 1. Prerequisites
- A Google Cloud account.
- A Google Cloud Project with billing enabled.
- The **Vertex AI API** enabled in your project.

## 2. Environment Variables
You need to provide the following environment variables. In the AI Studio preview, you can add these in the Secrets/Settings menu. For local development, add them to your `.env` file based on the `.env.example`.

- \`GOOGLE_CLOUD_PROJECT\` (or \`GOOGLE_CLOUD_PROJECT_ID\`): Your Google Cloud Project ID (e.g., \`my-awesome-project-12345\`).
- \`GOOGLE_CLOUD_LOCATION\` (or \`LOCATION\`): The region where you want to execute Vertex AI requests (default: \`us-central1\`).
- \`GOOGLE_APPLICATION_CREDENTIALS\`: The absolute path to your Service Account JSON key file. 
- \`GOOGLE_APPLICATION_CREDENTIALS_JSON\`: Alternatively, if your deployment environment does not support file uploads, you can paste the entire stringified contents of your Service Account JSON key here. You will need to handle parsing this into a temporary file or directly into the auth client at runtime if your SDK requires it.

*(Note: If deploying directly to Google Cloud environments like Cloud Run, Application Default Credentials (ADC) will automatically authenticate your app using the attached service account, making the credential variables optional as long as the service account has the necessary permissions).*

## 3. Creating a Service Account
If you are running this locally or in an environment outside of GCP that requires explicit credentials:
1. Go to the [Google Cloud Console](https://console.cloud.google.com/).
2. Navigate to **IAM & Admin > Service Accounts**.
3. Click **Create Service Account**, give it a name, and click **Create and Continue**.
4. Grant the service account the **Vertex AI User** role (this allows it to run generation models).
5. Click **Done**.
6. Find the newly created service account in the list, click the three dots under "Actions", and select **Manage keys**.
7. Click **ADD KEY > Create new key**, choose **JSON**, and click **Create**.
8. Save the downloaded JSON file securely. **Never commit this file to version control.**
9. Set the \`GOOGLE_APPLICATION_CREDENTIALS\` environment variable to the absolute path of this file.

## 4. Enabling Models
Make sure that your Google Cloud Project has access to the required models:
- **imagen-3.0-generate-001** (for image generation)
- **veo-2.0-generate-001** (for video generation)

You can check model availability and request access if needed in the Vertex AI Model Garden within the Google Cloud Console.
