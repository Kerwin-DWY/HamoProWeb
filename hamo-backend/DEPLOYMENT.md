# Hamo Backend Deployment Guide

This guide will help you deploy the Hamo backend Lambda functions and DynamoDB tables to AWS.

## Prerequisites

1. AWS CLI installed and configured
2. AWS SAM CLI installed ([Installation Guide](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/install-sam-cli.html))
3. Node.js 18+ installed
4. A Gemini API key from Google AI Studio

## Step 1: Set Up Gemini API Key

The chat function requires a Gemini API key. Store it securely in AWS Systems Manager Parameter Store:

```bash
aws ssm put-parameter \
  --name "/hamo/gemini-api-key" \
  --value "YOUR_GEMINI_API_KEY" \
  --type "SecureString" \
  --region ap-east-1
```

Replace `YOUR_GEMINI_API_KEY` with your actual API key from [Google AI Studio](https://makersuite.google.com/app/apikey).

## Step 2: Install Dependencies

```bash
cd hamo-backend
npm install
```

## Step 3: Build the SAM Application

```bash
sam build
```

This will:
- Package all Lambda functions
- Resolve dependencies
- Prepare for deployment

## Step 4: Deploy to AWS

For the first deployment:

```bash
sam deploy --guided
```

You'll be prompted for:
- **Stack Name**: `hamo-backend` (or your preferred name)
- **AWS Region**: `ap-east-1` (or your preferred region)
- **Confirm changes**: Y
- **Allow SAM CLI IAM role creation**: Y
- **Disable rollback**: N
- **Save arguments to configuration file**: Y

For subsequent deployments:

```bash
sam deploy
```

## Step 5: Get the API URL

After deployment, note the API URL from the outputs:

```bash
aws cloudformation describe-stacks \
  --stack-name hamo-backend \
  --query 'Stacks[0].Outputs[?OutputKey==`ApiUrl`].OutputValue' \
  --output text
```

## Step 6: Update Frontend API_BASE

Update the `API_BASE` in your frontend file:

**File**: `src/api/lambdaAPI/hamoChatApi.js`

```javascript
const API_BASE = "YOUR_API_URL_HERE";
```

Replace `YOUR_API_URL_HERE` with the API URL from Step 5.

## API Endpoints

After deployment, the following endpoints will be available:

### Chat Endpoints
- `POST /chat` - Generate AI response
- `GET /chat/history?clientId=xxx&avatarId=xxx` - Get chat history
- `POST /chat/message` - Save a chat message
- `GET /chat/conversations` - Get all conversations (therapist)

### Avatar Endpoints
- `GET /avatars` - List all avatars
- `POST /avatars` - Create new avatar
- `PUT /avatars/{avatarId}` - Update avatar
- `DELETE /avatars/{avatarId}` - Delete avatar

### Client Endpoints
- `GET /clients` - List all clients
- `POST /clients` - Create new client
- `PUT /clients/{clientId}` - Update client
- `DELETE /clients/{clientId}` - Delete client

### Invite Endpoints
- `POST /invites` - Create invite code
- `POST /invites/accept` - Accept invite code

### User Endpoints
- `POST /user/init` - Initialize user profile

## DynamoDB Tables

The deployment creates two tables:

1. **HamoPro** - Main table for users, clients, avatars, invites
2. **HamoChatMessages** - Dedicated table for chat messages

## Monitoring

View logs in CloudWatch:

```bash
sam logs -n ChatFunction --stack-name hamo-backend --tail
```

## Troubleshooting

### Deployment Fails

1. Check your AWS credentials: `aws sts get-caller-identity`
2. Ensure you have necessary IAM permissions
3. Check CloudFormation console for specific errors

### Gemini API Key Not Found

Make sure the parameter exists:

```bash
aws ssm get-parameter --name "/hamo/gemini-api-key" --region ap-east-1
```

### CORS Issues

The API is configured for `http://localhost:5174`. Update the `AllowOrigins` in `template.yaml` if deploying to production.

## Clean Up

To delete all resources:

```bash
sam delete --stack-name hamo-backend
```

**Warning**: This will delete all DynamoDB tables and data!

## Next Steps

After deployment:
1. Update frontend API endpoints
2. Test chat functionality
3. Set up monitoring and alerts
4. Configure production CORS origins
5. Set up CI/CD pipeline (optional)
