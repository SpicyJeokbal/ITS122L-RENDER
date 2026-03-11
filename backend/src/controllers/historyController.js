// backend/src/controllers/historyController.js
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// Get all task history (Super Admin only)
exports.getTaskHistory = async (req, res) => {
  try {
    if (req.user.role !== 'super_admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Super Admin only.'
      });
    }

    const { task_id, action_type, user_id, limit = 100 } = req.query;

    let query = supabase
      .from('task_history')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(parseInt(limit));

    if (task_id) {
      query = query.eq('task_id', task_id);
    }

    if (action_type) {
      query = query.eq('action_type', action_type);
    }

    if (user_id) {
      query = query.eq('performed_by', user_id);
    }

    const { data: history, error } = await query;

    if (error) throw error;

    res.json({
      success: true,
      history,
      total: history.length
    });
  } catch (error) {
    console.error('Error fetching task history:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching task history',
      error: error.message
    });
  }
};

// Get history for a specific task
exports.getTaskHistoryById = async (req, res) => {
  try {
    if (req.user.role !== 'super_admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Super Admin only.'
      });
    }

    const { taskId } = req.params;

    const { data: history, error } = await supabase
      .from('task_history')
      .select('*')
      .eq('task_id', taskId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json({
      success: true,
      history
    });
  } catch (error) {
    console.error('Error fetching task history:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching task history',
      error: error.message
    });
  }
};

// Helper function to log task history (exported for use in taskController)
exports.logTaskHistory = async (taskId, taskData, actionType, userId, userName) => {
  try {
    const { error } = await supabase
      .from('task_history')
      .insert([{
        task_id: taskId,
        task_data: taskData,
        action_type: actionType,
        performed_by: userId,
        performed_by_name: userName
      }]);

    if (error) {
      console.error('Error logging task history:', error);
    }
  } catch (error) {
    console.error('Error in logTaskHistory:', error);
  }
};