import api from '../utils/api';

export const getDashboardStats = async () => {
  try {
    return await api.get('/user/dashboard-stats');
  } catch {
    return {
      data: {
        success: true,
        data: {
          totalOrders: 0,
          totalDonations: 0,
          totalDonationAmount: 0,
          totalAnnadaan: 0
        }
      }
    };
  }
};

export const getMyOrders = async ({ page = 1, limit = 10 } = {}) => {
  try {
    return await api.get(`/user/my-orders?page=${page}&limit=${limit}`);
  } catch {
    return { data: { success: true, data: [] } };
  }
};

export const getMyDonations = async ({ page = 1, limit = 10 } = {}) => {
  try {
    return await api.get(`/user/my-donations?page=${page}&limit=${limit}`);
  } catch {
    return { data: { success: true, data: [] } };
  }
};

export const getMyAnnadaan = async () => {
  try {
    return await api.get('/user/my-annadaan');
  } catch {
    return { data: { success: true, data: [] } };
  }
};

export const updateProfile = async (profileData) => {
  return await api.put('/user/profile', profileData);
};

export const getProfile = async () => {
  try {
    return await api.get('/user/profile');
  } catch {
    return { data: { success: true, data: {} } };
  }
};

export const downloadDonationReceipt = async (id) => {
  return await api.get(`/user/my-donations/${id}/receipt?t=${Date.now()}`, { responseType: 'blob' });
};

export const downloadAnnadaanReceipt = async (id) => {
  return await api.get(`/user/my-annadaan/${id}/receipt?t=${Date.now()}`, { responseType: 'blob' });
};

export const cancelAnnadaan = async (id) => {
  return await api.delete(`/user/my-annadaan/${id}`);
};
