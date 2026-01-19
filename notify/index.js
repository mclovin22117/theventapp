// functions/index.js
const functions = require("firebase-functions");
const admin = require("firebase-admin");
const {Expo} = require("expo-server-sdk");

admin.initializeApp();
const db = admin.firestore();
const expo = new Expo();

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
