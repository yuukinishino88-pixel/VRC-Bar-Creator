rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Global Deny by default
    match /{document=**} {
      allow read, write: if false;
    }

    // Relaxed rules for development to prevent stuck loading
    // In production these should be hardened to check request.auth
    
    match /users/{userId} {
      allow read, write: if true;
    }
    
    match /products/{productId} {
      allow read, write: if true;
    }
    
    match /orders/{orderId} {
      allow read, write: if true;
    }
    
    match /global/{docId} {
      allow read, write: if true;
    }
    
    match /announcements/{annId} {
      allow read, write: if true;
    }
    
    match /emergencyCalls/{callId} {
      allow read, write: if true;
    }
    
    match /rotationAssignments/{rotId} {
      allow read, write: if true;
    }
    
    match /staffTasks/{taskId} {
      allow read, write: if true;
    }
    
    match /userDeleteLogs/{logId} {
      allow read, write: if true;
    }

    match /rotationStatusHistory/{histId} {
      allow read, write: if true;
    }

    match /historyResetLogs/{logId} {
      allow read, write: if true;
    }
    
    match /customerStamps/{stampId} {
      allow read, write: if true;
    }
    
    match /lotteryItems/{itemId} {
      allow read, write: if true;
    }
    
    match /lotteryEntries/{entryId} {
      allow read, write: if true;
    }
    
    match /gameSessions/{sessionId} {
      allow read, write: if true;
    }
    
    match /gameSettings/{docId} {
      allow read, write: if true;
    }
    
    match /attendanceRequests/{docId} {
      allow read, write: if true;
    }
    
    match /shiftRequests/{shiftId} {
      allow read, write: if true;
    }

    match /errorLogs/{logId} {
      allow read, write: if true;
    }
  }
}
