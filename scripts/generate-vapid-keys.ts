/* eslint-disable no-console */
import webpush from "web-push";

const vapidKeys = webpush.generateVAPIDKeys();

console.log("\n📬 VAPID Keys generated!\n");
console.log("Add these to your .env.local:\n");
console.log(`NEXT_PUBLIC_VAPID_PUBLIC_KEY=${vapidKeys.publicKey}`);
console.log(`VAPID_PRIVATE_KEY=${vapidKeys.privateKey}`);
console.log(`VAPID_SUBJECT=mailto:${process.env.ADMIN_EMAIL || "admin@litustaste.com"}\n`);
