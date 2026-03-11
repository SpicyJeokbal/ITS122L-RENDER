// backend/src/controllers/logsController.js
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// Get all activity logs (Super Admin only)
exports.getActivityLogs = async (req, res) => {
  console.log('GET ACTIVITY LOGS called');
  try {
    if (req.user.role !== 'super_admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Super Admin only.'
      });
    }

    const { action, user_id, target_type, limit = 100 } = req.query;

    let query = supabase
      .from('activity_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(parseInt(limit));

    if (action) {
      query = query.eq('action', action);
    }

    if (user_id) {
      query = query.eq('user_id', user_id);
    }

    if (target_type) {
      query = query.eq('target_type', target_type);
    }

    const { data: logs, error } = await query;

    if (error) throw error;

    res.json({
      success: true,
      logs,
      total: logs.length
    });
  } catch (error) {
    console.error('Error fetching activity logs:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching activity logs',
      error: error.message
    });
  }
};

// Get logs for a specific user
exports.getUserLogs = async (req, res) => {
  try {
    if (req.user.role !== 'super_admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Super Admin only.'
      });
    }

    const { userId } = req.params;

    const { data: logs, error } = await supabase
      .from('activity_logs')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) throw error;

    res.json({
      success: true,
      logs
    });
  } catch (error) {
    console.error('Error fetching user logs:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user logs',
      error: error.message
    });
  }
};

// Helper function to log activity (exported for use in other controllers)
exports.logActivity = async (userId, userName, action, targetType, targetId, targetName, details, ipAddress) => {
  try {
    const { error } = await supabase
      .from('activity_logs')
      .insert([{
        user_id: userId,
        user_name: userName,
        action,
        target_type: targetType,
        target_id: targetId,
        target_name: targetName,
        details,
        ip_address: ipAddress
      }]);

    if (error) {
      console.error('Error logging activity:', error);
    }
  } catch (error) {
    console.error('Error in logActivity:', error);
  }
};