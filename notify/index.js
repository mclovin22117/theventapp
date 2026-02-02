// functions/index.js
const functions = require("firebase-functions");
const admin = require("firebase-admin");
const {Expo} = require("expo-server-sdk");
const crypto = require("crypto");

// Load environment variables
require('dotenv').config();

admin.initializeApp();
const db = admin.firestore();
const expo = new Expo();

// Cloudinary signed upload endpoint
exports.generateCloudinarySignature = functions.https.onCall(async (data, context) => {
  // Ensure the user is authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError(
        "unauthenticated",
        "User must be authenticated to upload images",
    );
  }

  const {timestamp, folder} = data;

  // Get Cloudinary credentials from environment variables
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  const uploadPreset = process.env.CLOUDINARY_UPLOAD_PRESET;

  if (!cloudName || !apiKey || !apiSecret || !uploadPreset) {
    throw new functions.https.HttpsError(
        "failed-precondition",
        "Cloudinary credentials not configured in environment variables",
    );
  }

  // Generate signature for secure upload
  const paramsToSign = {
    timestamp: timestamp || Math.round(new Date().getTime() / 1000),
    upload_preset: uploadPreset,
  };

  if (folder) {
    paramsToSign.folder = folder;
  }

  // Create signature string
  const signatureString = Object.keys(paramsToSign)
      .sort()
      .map((key) => `${key}=${paramsToSign[key]}`)
      .join("&");

  const signature = crypto
      .createHash("sha256")
      .update(signatureString + apiSecret)
      .digest("hex");

  return {
    signature,
    timestamp: paramsToSign.timestamp,
    apiKey,
    cloudName,
    uploadPreset,
  };
});

exports.sendNotificationOnReply = functions.firestore
    .document("notifications/{notificationId}")
    .onCreate(async (snap, context) => {
      const notification = snap.data();
      const recipientId = notification.recipientId;

      // Get the recipient's push token from the 'users' collection
      const userDoc = await db.collection("users").doc(recipientId).get();
      const user = userDoc.data();
      const pushToken = user.expoPushToken;

      if (!pushToken || !Expo.isExpoPushToken(pushToken)) {
        console.error(`Not a valid Expo push token: ${pushToken}`);
        return;
      }

      // Build the notification message
      const messages = [{
        to: pushToken,
        sound: "default",
        title: "New Reply!",
        body: `${notification.senderUsername} 
        replied to your thought: "${notification.postText}"`,
        data: {postId: notification.postId},
      }];

      // Send the notification
      try {
        const tickets = await expo.sendPushNotificationsAsync(messages);
        console.log("Notification sent successfully:", tickets);
      } catch (error) {
        console.error("Error sending notification:", error);
      }
    });

