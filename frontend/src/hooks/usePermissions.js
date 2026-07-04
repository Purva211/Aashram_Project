import { useAuth } from '../context/AuthContext';

export const usePermissions = (moduleName) => {
  const { user } = useAuth();

  if (!user) return { hasView: false, hasManage: false, isAdmin: false };

  if (user.role === 'Admin') {
    return { 
      hasView: true, 
      hasManage: moduleName === 'News' ? false : true, 
      isAdmin: true 
    };
  }

  if (user.role === 'Trustee') {
    const userPerms = user.permissions || [];
    const modulePerm = userPerms.find(p => p.module === moduleName || p === moduleName);
    
    if (!modulePerm) {
      return { hasView: false, hasManage: false, isAdmin: false };
    }

    const level = modulePerm.level || 'View'; // If it's a string, level is implicitly 'View'

    return {
      hasView: true,
      hasManage: level === 'Manage',
      isAdmin: false
    };
  }

  // Fallback for other roles like BranchManager etc. They typically have full access to modules they are allowed to see.
  return { hasView: true, hasManage: true, isAdmin: false };
};
