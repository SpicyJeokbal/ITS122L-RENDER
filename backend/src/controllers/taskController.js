// backend/src/controllers/taskController.js
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);
const { logTaskHistory } = require('./historyController');
const { logActivity } = require('./logsController');

// Get all tasks (non-archived)
exports.getTasks = async (req, res) => {
  try {
    const { data: tasks, error } = await supabase
      .from('tasks')
      .select(`
        *,
        assigned_to_user:users!tasks_assigned_to_fkey(id, first_name, last_name),
        created_by_user:users!tasks_created_by_fkey(id, first_name, last_name)
      `)
      .eq('is_archived', false)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Format the response
    const formattedTasks = tasks.map(task => ({
      id: task.id,
      title: task.title,
      description: task.description,
      assigned_to: task.assigned_to,
      assigned_to_name: task.assigned_to_user 
        ? `${task.assigned_to_user.first_name} ${task.assigned_to_user.last_name}`
        : 'Entire Organization',
      created_by: task.created_by,
      created_by_name: `${task.created_by_user.first_name} ${task.created_by_user.last_name}`,
      status: task.status,
      priority: task.priority,
      category: task.category,
      due_date: task.due_date,
      notes: task.notes,
      created_at: task.created_at,
      completed_at: task.completed_at,
      cancelled_at: task.cancelled_at
    }));

    res.json({
      success: true,
      tasks: formattedTasks
    });
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching tasks',
      error: error.message
    });
  }
};

// Get single task by ID
exports.getTaskById = async (req, res) => {
  try {
    const { id } = req.params;

    const { data: task, error } = await supabase
      .from('tasks')
      .select(`
        *,
        assigned_to_user:users!tasks_assigned_to_fkey(id, first_name, last_name),
        created_by_user:users!tasks_created_by_fkey(id, first_name, last_name)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    const formattedTask = {
      id: task.id,
      title: task.title,
      description: task.description,
      assigned_to: task.assigned_to,
      assigned_to_name: task.assigned_to_user 
        ? `${task.assigned_to_user.first_name} ${task.assigned_to_user.last_name}`
        : 'Entire Organization',
      created_by: task.created_by,
      created_by_name: `${task.created_by_user.first_name} ${task.created_by_user.last_name}`,
      status: task.status,
      priority: task.priority,
      category: task.category,
      due_date: task.due_date,
      notes: task.notes,
      created_at: task.created_at,
      completed_at: task.completed_at,
      cancelled_at: task.cancelled_at
    };

    res.json({
      success: true,
      task: formattedTask
    });
  } catch (error) {
    console.error('Error fetching task:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching task',
      error: error.message
    });
  }
};

// Create new task
exports.createTask = async (req, res) => {
  try {
    const {
      title,
      description,
      assigned_to,
      priority,
      due_date,
      category,
      notes,
      status
    } = req.body;

    const created_by = req.user.id; // From auth middleware
    const user_name = `${req.user.first_name} ${req.user.last_name}`;

    // Validation
    if (!title || !due_date) {
      return res.status(400).json({
        success: false,
        message: 'Title and due_date are required'
      });
    }

    const taskData = {
      title,
      description: description || '',
      assigned_to: assigned_to || null, // Allow null for organization-wide tasks
      created_by,
      status: status || 'ongoing',
      priority: priority || 'medium',
      category: category || 'other',
      due_date,
      notes: notes || '',
      is_archived: false
    };

    const { data: task, error } = await supabase
      .from('tasks')
      .insert([taskData])
      .select()
      .single();

    if (error) throw error;

    // Log task history
    await logTaskHistory(task.id, taskData, 'created', created_by, user_name);

    // Log activity
    await logActivity(
      created_by,
      user_name,
      'create_task',
      'task',
      task.id,
      title,
      { priority, category, status },
      req.ip
    );

    res.json({
      success: true,
      message: 'Task created successfully',
      task
    });
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating task',
      error: error.message
    });
  }
};

// Update task
exports.updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      description,
      assigned_to,
      priority,
      due_date,
      category,
      notes,
      status
    } = req.body;

    const user_name = `${req.user.first_name} ${req.user.last_name}`;

    const updateData = {
      title,
      description,
      assigned_to,
      priority,
      due_date,
      category,
      notes,
      status
    };

    const { data: task, error } = await supabase
      .from('tasks')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    // Log task history
    await logTaskHistory(id, updateData, 'updated', req.user.id, user_name);

    // Log activity
    await logActivity(
      req.user.id,
      user_name,
      'update_task',
      'task',
      id,
      title,
      { changes: updateData },
      req.ip
    );

    res.json({
      success: true,
      message: 'Task updated successfully',
      task
    });
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating task',
      error: error.message
    });
  }
};

// Update task status (for drag and drop)
exports.updateTaskStatus = async (req, res) => {
  try {
    const { task_id, status } = req.body;

    if (!task_id || !status) {
      return res.status(400).json({
        success: false,
        message: 'task_id and status are required'
      });
    }

    const user_name = `${req.user.first_name} ${req.user.last_name}`;

    const updateData = { status };

    // Set completion/cancellation timestamps
    if (status === 'done') {
      updateData.completed_at = new Date().toISOString();
      updateData.cancelled_at = null;
    } else if (status === 'cancelled') {
      updateData.cancelled_at = new Date().toISOString();
      updateData.completed_at = null;
    } else {
      updateData.completed_at = null;
      updateData.cancelled_at = null;
    }

    const { data: task, error } = await supabase
      .from('tasks')
      .update(updateData)
      .eq('id', task_id)
      .select()
      .single();

    if (error) throw error;

    // Log task history
    await logTaskHistory(task_id, updateData, 'status_changed', req.user.id, user_name);

    // Log activity
    await logActivity(
      req.user.id,
      user_name,
      'update_task_status',
      'task',
      task_id,
      task.title,
      { new_status: status },
      req.ip
    );

    res.json({
      success: true,
      message: 'Task status updated successfully',
      task
    });
  } catch (error) {
    console.error('Error updating task status:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating task status',
      error: error.message
    });
  }
};

// Delete task
exports.deleteTask = async (req, res) => {
  try {
    const { id } = req.params;
    const user_name = `${req.user.first_name} ${req.user.last_name}`;

    // Get task details before deleting
    const { data: task } = await supabase
      .from('tasks')
      .select('*')
      .eq('id', id)
      .single();

    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id);

    if (error) throw error;

    // Log task history
    if (task) {
      await logTaskHistory(id, task, 'deleted', req.user.id, user_name);
    }

    // Log activity
    await logActivity(
      req.user.id,
      user_name,
      'delete_task',
      'task',
      id,
      task?.title || 'Unknown Task',
      null,
      req.ip
    );

    res.json({
      success: true,
      message: 'Task deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting task',
      error: error.message
    });
  }
};

// Archive task manually
exports.archiveTask = async (req, res) => {
  try {
    const { id } = req.params;

    const { data: task, error } = await supabase
      .from('tasks')
      .update({ 
        is_archived: true,
        archived_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    res.json({
      success: true,
      message: 'Task archived successfully',
      task
    });
  } catch (error) {
    console.error('Error archiving task:', error);
    res.status(500).json({
      success: false,
      message: 'Error archiving task',
      error: error.message
    });
  }
};

// Generate PDF for task
exports.generateTaskPDF = async (req, res) => {
  try {
    const { id } = req.params;

    // Fetch task with user details
    const { data: task, error } = await supabase
      .from('tasks')
      .select(`
        *,
        assigned_to_user:users!tasks_assigned_to_fkey(first_name, last_name),
        created_by_user:users!tasks_created_by_fkey(first_name, last_name)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    // Create simple HTML for PDF
    const formatDate = (dateString) => {
      if (!dateString) return '-';
      return new Date(dateString).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      });
    };

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; padding: 40px; color: #333; }
          .header { border-bottom: 3px solid #2c5f2d; padding-bottom: 20px; margin-bottom: 30px; }
          .header h1 { color: #2c5f2d; margin: 0; }
          .header p { color: #666; margin: 5px 0 0 0; }
          .section { margin-bottom: 25px; }
          .section-title { color: #2c5f2d; font-size: 14px; font-weight: bold; margin-bottom: 8px; text-transform: uppercase; }
          .section-content { font-size: 16px; line-height: 1.6; }
          .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
          .field { margin-bottom: 15px; }
          .field-label { font-size: 12px; color: #666; text-transform: uppercase; margin-bottom: 4px; }
          .field-value { font-size: 14px; }
          .priority { padding: 4px 8px; border-radius: 4px; display: inline-block; font-size: 11px; font-weight: bold; }
          .priority-high { background: #ffebee; color: #c62828; }
          .priority-medium { background: #fff3e0; color: #f57c00; }
          .priority-low { background: #e3f2fd; color: #1976d2; }
          .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #e0e0e0; font-size: 12px; color: #999; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>TASK DETAILS</h1>
          <p>Boy Scouts of the Philippines - Parañaque City Council</p>
        </div>

        <div class="section">
          <div class="section-title">Task Information</div>
          <div class="section-content">
            <h2 style="margin: 0 0 10px 0;">${task.title}</h2>
            <p style="margin: 0;">${task.description || 'No description provided'}</p>
          </div>
        </div>

        <div class="grid">
          <div class="field">
            <div class="field-label">Assigned To</div>
            <div class="field-value">${task.assigned_to_user ? `${task.assigned_to_user.first_name} ${task.assigned_to_user.last_name}` : 'Entire Organization'}</div>
          </div>
          <div class="field">
            <div class="field-label">Created By</div>
            <div class="field-value">${task.created_by_user.first_name} ${task.created_by_user.last_name}</div>
          </div>
          <div class="field">
            <div class="field-label">Priority</div>
            <div class="field-value">
              <span class="priority priority-${task.priority}">${task.priority.toUpperCase()}</span>
            </div>
          </div>
          <div class="field">
            <div class="field-label">Category</div>
            <div class="field-value">${task.category.charAt(0).toUpperCase() + task.category.slice(1)}</div>
          </div>
          <div class="field">
            <div class="field-label">Due Date</div>
            <div class="field-value">${formatDate(task.due_date)}</div>
          </div>
          <div class="field">
            <div class="field-label">Status</div>
            <div class="field-value">${task.status.toUpperCase()}</div>
          </div>
          <div class="field">
            <div class="field-label">Created Date</div>
            <div class="field-value">${formatDate(task.created_at)}</div>
          </div>
          ${task.completed_at ? `
          <div class="field">
            <div class="field-label">Completed Date</div>
            <div class="field-value">${formatDate(task.completed_at)}</div>
          </div>
          ` : ''}
        </div>

        ${task.notes ? `
        <div class="section">
          <div class="section-title">Additional Notes</div>
          <div class="section-content">${task.notes}</div>
        </div>
        ` : ''}

        <div class="footer">
          Generated on ${formatDate(new Date().toISOString())} | Task ID: ${task.id.substring(0, 8)}
        </div>
      </body>
      </html>
    `;

    // Set headers for PDF download
    res.setHeader('Content-Type', 'text/html');
    res.setHeader('Content-Disposition', `attachment; filename="task-${task.title.replace(/\s+/g, '-')}.html"`);
    res.send(html);

  } catch (error) {
    console.error('Error generating PDF:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating PDF',
      error: error.message
    });
  }
};