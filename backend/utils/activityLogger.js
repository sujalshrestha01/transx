import Organization from '../models/Organization.js';

export const logActivity = async (orgId, type, userId, options = {}) => {
  try {
    await Organization.findByIdAndUpdate(orgId, {
      $push: {
        activityLog: {
          $each: [{
            type,
            user: userId,
            fileName: options.fileName || null,
            meta: options.meta || null,
            at: new Date()
          }],
          $slice: -200 // keep last 200 events
        }
      }
    });
  } catch (err) {
    console.error('Activity log error:', err.message);
  }
};