// backend/src/controllers/adminController.js
const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');
const { logActivity } = require('./logsController');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// Get all users (Super Admin only)
exports.getAllUsers = async (req, res) => {
  try {
    // Check if user is super admin
    if (req.user.role !== 'super_admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Super Admin only.'
      });
    }

    const { data: users, error } = await supabase
      .from('users')
      .select('id, email, first_name, last_name, role, is_active, permissions, created_at, created_by')
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json({
      success: true,
      users
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching users',
      error: error.message
    });
  }
};

// Create new user (Super Admin only)
exports.createUser = async (req, res) => {
  try {
    // Check if user is super admin
    if (req.user.role !== 'super_admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Super Admin only.'
      });
    }

    const { email, password, first_name, last_name, role, permissions } = req.body;

    // Validation
    if (!email || !password || !first_name || !last_name || !role) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Hash password
    const password_hash = await bcrypt.hash(password, 10);

    // Default permissions based on role
    const defaultPermissions = {
      super_admin: {
        can_view: true,
        can_edit: true,
        can_delete: true,
        can_create: true,
        can_manage_users: true
      },
      admin: {
        can_view: true,
        can_edit: true,
        can_delete: false,
        can_create: true,
        can_manage_users: false
      },
      leader: {
        can_view: true,
        can_edit: true,
        can_delete: false,
        can_create: true,
        can_manage_users: false
      },
      scout: {
        can_view: true,
        can_edit: false,
        can_delete: false,
        can_create: false,
        can_manage_users: false
      }
    };

    const userPermissions = permissions || defaultPermissions[role] || defaultPermissions.scout;

    // Create user
    const { data: user, error } = await supabase
      .from('users')
      .insert([
        {
          email,
          password_hash,
          first_name,
          last_name,
          role,
          permissions: userPermissions,
          is_active: true,
          created_by: req.user.id
        }
      ])
      .select('id, email, first_name, last_name, role, permissions, is_active')
      .single();

    if (error) throw error;

    // Log user creation
    await logActivity(
      req.user.id,
      `${req.user.first_name} ${req.user.last_name}`,
      'create_user',
      'user',
      user.id,
      `${first_name} ${last_name}`,
      { email, role },
      req.ip
    );

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      user
    });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating user',
      error: error.message
    });
  }
};

// Update user (Super Admin only)
exports.updateUser = async (req, res) => {
  try {
    // Check if user is super admin
    if (req.user.role !== 'super_admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Super Admin only.'
      });
    }

    const { id } = req.params;
    const { first_name, last_name, email, role, permissions, is_active } = req.body;

    const updateData = {};
    if (first_name) updateData.first_name = first_name;
    if (last_name) updateData.last_name = last_name;
    if (email) updateData.email = email;
    if (role) updateData.role = role;
    if (permissions) updateData.permissions = permissions;
    if (typeof is_active !== 'undefined') updateData.is_active = is_active;

    const { data: user, error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', id)
      .select('id, email, first_name, last_name, role, permissions, is_active')
      .single();

    if (error) throw error;

    // Log user update
    await logActivity(
      req.user.id,
      `${req.user.first_name} ${req.user.last_name}`,
      'update_user',
      'user',
      id,
      `${user.first_name} ${user.last_name}`,
      { changes: updateData },
      req.ip
    );

    res.json({
      success: true,
      message: 'User updated successfully',
      user
    });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating user',
      error: error.message
    });
  }
};

// Update user permissions (Super Admin only)
exports.updateUserPermissions = async (req, res) => {
  try {
    // Check if user is super admin
    if (req.user.role !== 'super_admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Super Admin only.'
      });
    }

    const { id } = req.params;
    const { permissions } = req.body;

    if (!permissions) {
      return res.status(400).json({
        success: false,
        message: 'Permissions are required'
      });
    }

    const { data: user, error } = await supabase
      .from('users')
      .update({ permissions })
      .eq('id', id)
      .select('id, email, first_name, last_name, role, permissions')
      .single();

    if (error) throw error;

    // Log permission update
    await logActivity(
      req.user.id,
      `${req.user.first_name} ${req.user.last_name}`,
      'update_permissions',
      'user',
      id,
      `${user.first_name} ${user.last_name}`,
      { permissions },
      req.ip
    );

    res.json({
      success: true,
      message: 'Permissions updated successfully',
      user
    });
  } catch (error) {
    console.error('Error updating permissions:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating permissions',
      error: error.message
    });
  }
};

// Deactivate user (Super Admin only)
exports.deactivateUser = async (req, res) => {
  try {
    // Check if user is super admin
    if (req.user.role !== 'super_admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Super Admin only.'
      });
    }

    const { id } = req.params;

    // Prevent deactivating self
    if (id === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'Cannot deactivate your own account'
      });
    }

    const { data: user, error } = await supabase
      .from('users')
      .update({ is_active: false })
      .eq('id', id)
      .select('id, email, first_name, last_name')
      .single();

    if (error) throw error;

    // Log deactivation
    await logActivity(
      req.user.id,
      `${req.user.first_name} ${req.user.last_name}`,
      'deactivate_user',
      'user',
      id,
      `${user.first_name} ${user.last_name}`,
      { email: user.email },
      req.ip
    );

    res.json({
      success: true,
      message: 'User deactivated successfully',
      user
    });
  } catch (error) {
    console.error('Error deactivating user:', error);
    res.status(500).json({
      success: false,
      message: 'Error deactivating user',
      error: error.message
    });
  }
};

// Delete user permanently (Super Admin only)
exports.deleteUser = async (req, res) => {
  try {
    // Check if user is super admin
    if (req.user.role !== 'super_admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Super Admin only.'
      });
    }

    const { id } = req.params;

    // Prevent deleting self
    if (id === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete your own account'
      });
    }

    // Get user details before deleting
    const { data: userToDelete } = await supabase
      .from('users')
      .select('first_name, last_name, email, role')
      .eq('id', id)
      .single();

    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', id);

    if (error) throw error;

    // Log deletion
    if (userToDelete) {
      await logActivity(
        req.user.id,
        `${req.user.first_name} ${req.user.last_name}`,
        'delete_user',
        'user',
        id,
        `${userToDelete.first_name} ${userToDelete.last_name}`,
        { email: userToDelete.email, role: userToDelete.role },
        req.ip
      );
    }

    res.json({
      success: true,
      message: 'User deleted permanently'
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting user',
      error: error.message
    });
  }
};

// Reset user password (Super Admin only)
exports.resetUserPassword = async (req, res) => {
  try {
    // Check if user is super admin
    if (req.user.role !== 'super_admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Super Admin only.'
      });
    }

    const { id } = req.params;
    const { new_password } = req.body;

    if (!new_password || new_password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters'
      });
    }

    // Get user details
    const { data: userToUpdate } = await supabase
      .from('users')
      .select('first_name, last_name, email')
      .eq('id', id)
      .single();

    // Hash new password
    const password_hash = await bcrypt.hash(new_password, 10);

    const { error } = await supabase
      .from('users')
      .update({ password_hash })
      .eq('id', id);

    if (error) throw error;

    // Log password reset
    if (userToUpdate) {
      await logActivity(
        req.user.id,
        `${req.user.first_name} ${req.user.last_name}`,
        'reset_password',
        'user',
        id,
        `${userToUpdate.first_name} ${userToUpdate.last_name}`,
        null,
        req.ip
      );
    }

    res.json({
      success: true,
      message: 'Password reset successfully'
    });
  } catch (error) {
    console.error('Error resetting password:', error);
    res.status(500).json({
      success: false,
      message: 'Error resetting password',
      error: error.message
    });
  }
};