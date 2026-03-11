// backend/src/middleware/auth.js
const jwt = require('jsonwebtoken');
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

exports.authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access token required'
      });
    }

    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Debug: Check what's in the decoded token
    console.log('Decoded token:', decoded);
    
    // The user ID might be in decoded.id, decoded.userId, or decoded.user.id
    const userId = decoded.userId || decoded.id || decoded.user?.id;
    
    if (!userId) {
      console.error('No user ID found in token:', decoded);
      return res.status(403).json({
        success: false,
        message: 'Invalid token structure'
      });
    }
    
    // Fetch full user details from database
    const { data: user, error } = await supabase
      .from('users')
      .select('id, email, first_name, last_name, role, permissions')
      .eq('id', userId)
      .single();

    if (error || !user) {
      console.error('User lookup error:', error);
      return res.status(403).json({
        success: false,
        message: 'Invalid or expired token'
      });
    }

    // Attach user to request
    req.user = user;
    next();
  } catch (error) {
    console.error('Auth error:', error);
    return res.status(403).json({
      success: false,
      message: 'Invalid or expired token'
    });
  }
};