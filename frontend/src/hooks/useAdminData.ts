import { useState, useEffect } from 'react';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

// Types
export interface User {
  _id: string;
  email: string;
  profile: {
    firstName: string;
    lastName: string;
    phoneNumber: string;
    state?: string;
    city?: string;
    assignedInstructor?: string;
  };
  role: 'student' | 'instructor' | 'admin';
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

export interface DashboardStats {
  overview: {
    totalStudents: number;
    totalInstructors: number;
    pendingApprovals: number;
    activeCamps: number;
    upcomingTournaments: number;
    totalUsers: number;
  };
  breakdown: {
    stateWise: Array<{ _id: string; count: number }>;
    cityWise: Array<{ _id: { state: string; city: string }; count: number }>;
    monthlyTrends: Array<{
      _id: { month: number; year: number };
      students: number;
      instructors: number;
    }>;
  };
}

export interface Announcement {
  _id: string;
  title: string;
  content: string;
  author: {
    _id: string;
    profile: {
      firstName: string;
      lastName: string;
    };
    role: string;
  };
  priority: 'low' | 'medium' | 'high';
  status: 'draft' | 'published' | 'archived';
  targetAudience: 'all' | 'students' | 'instructors' | 'specific';
  createdAt: string;
  likeCount: number;
  commentCount: number;
}

export interface Tournament {
  _id: string;
  name: string;
  description?: string;
  date: string;
  location: {
    venue: string;
    address: {
      city: string;
      state: string;
    };
  };
  organizer: {
    _id: string;
    profile: {
      firstName: string;
      lastName: string;
    };
  };
  status: 'draft' | 'upcoming' | 'registration-open' | 'registration-closed' | 'ongoing' | 'completed' | 'cancelled';
  type: 'tournament' | 'seminar' | 'grading' | 'camp' | 'workshop';
  registrationCount: number;
  stats: {
    totalRegistrations: number;
    totalRevenue: number;
    attendanceRate: number;
  };
}

// API Helper function
const apiCall = async (endpoint: string, options: RequestInit = {}) => {
  const token = localStorage.getItem('token');
  
  const defaultOptions: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...options.headers,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Network error' }));
    throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
  }

  return response.json();
};

// Custom hooks for admin dashboard
export const useAdminStats = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await apiCall('/admin/dashboard-stats');
      setStats(response.data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch stats');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return { stats, loading, error, refetch: fetchStats };
};

export const usePendingUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPendingUsers = async () => {
    try {
      setLoading(true);
      const response = await apiCall('/admin/pending-users');
      setUsers(response.data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch pending users');
    } finally {
      setLoading(false);
    }
  };

  const approveUser = async (userId: string, action: 'approve' | 'reject', reason?: string) => {
    try {
      await apiCall(`/admin/approve-user/${userId}`, {
        method: 'PUT',
        body: JSON.stringify({ action, reason }),
      });
      
      // Remove user from pending list
      setUsers(prev => prev.filter(user => user._id !== userId));
      return { success: true };
    } catch (err) {
      return { 
        success: false, 
        error: err instanceof Error ? err.message : 'Failed to update user status' 
      };
    }
  };

  useEffect(() => {
    fetchPendingUsers();
  }, []);

  return { users, loading, error, approveUser, refetch: fetchPendingUsers };
};

export const useAnnouncements = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const response = await apiCall('/announcements');
      setAnnouncements(response.data.announcements);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch announcements');
    } finally {
      setLoading(false);
    }
  };

  const createAnnouncement = async (announcementData: {
    title: string;
    content: string;
    priority?: 'low' | 'medium' | 'high';
    targetAudience?: 'all' | 'students' | 'instructors' | 'specific';
    specificUsers?: string[];
  }) => {
    try {
      const response = await apiCall('/announcements', {
        method: 'POST',
        body: JSON.stringify(announcementData),
      });
      
      setAnnouncements(prev => [response.data, ...prev]);
      return { success: true, data: response.data };
    } catch (err) {
      return { 
        success: false, 
        error: err instanceof Error ? err.message : 'Failed to create announcement' 
      };
    }
  };

  const updateAnnouncement = async (id: string, updateData: Partial<Announcement>) => {
    try {
      const response = await apiCall(`/announcements/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updateData),
      });
      
      setAnnouncements(prev => 
        prev.map(announcement => 
          announcement._id === id ? response.data : announcement
        )
      );
      return { success: true, data: response.data };
    } catch (err) {
      return { 
        success: false, 
        error: err instanceof Error ? err.message : 'Failed to update announcement' 
      };
    }
  };

  const deleteAnnouncement = async (id: string) => {
    try {
      await apiCall(`/announcements/${id}`, {
        method: 'DELETE',
      });
      
      setAnnouncements(prev => prev.filter(announcement => announcement._id !== id));
      return { success: true };
    } catch (err) {
      return { 
        success: false, 
        error: err instanceof Error ? err.message : 'Failed to delete announcement' 
      };
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  return { 
    announcements, 
    loading, 
    error, 
    createAnnouncement, 
    updateAnnouncement, 
    deleteAnnouncement, 
    refetch: fetchAnnouncements 
  };
};

export const useTournaments = () => {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTournaments = async () => {
    try {
      setLoading(true);
      const response = await apiCall('/tournaments');
      setTournaments(response.data.tournaments);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch tournaments');
    } finally {
      setLoading(false);
    }
  };

  const createTournament = async (tournamentData: {
    name: string;
    description?: string;
    date: string;
    location: {
      venue: string;
      address: {
        city: string;
        state: string;
      };
    };
    registration: {
      opens: string;
      closes: string;
      fee?: {
        amount: number;
        currency: string;
      };
    };
    type?: Tournament['type'];
  }) => {
    try {
      const response = await apiCall('/tournaments', {
        method: 'POST',
        body: JSON.stringify(tournamentData),
      });
      
      setTournaments(prev => [response.data, ...prev]);
      return { success: true, data: response.data };
    } catch (err) {
      return { 
        success: false, 
        error: err instanceof Error ? err.message : 'Failed to create tournament' 
      };
    }
  };

  const updateTournament = async (id: string, updateData: Partial<Tournament>) => {
    try {
      const response = await apiCall(`/tournaments/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updateData),
      });
      
      setTournaments(prev => 
        prev.map(tournament => 
          tournament._id === id ? response.data : tournament
        )
      );
      return { success: true, data: response.data };
    } catch (err) {
      return { 
        success: false, 
        error: err instanceof Error ? err.message : 'Failed to update tournament' 
      };
    }
  };

  const deleteTournament = async (id: string) => {
    try {
      await apiCall(`/tournaments/${id}`, {
        method: 'DELETE',
      });
      
      setTournaments(prev => prev.filter(tournament => tournament._id !== id));
      return { success: true };
    } catch (err) {
      return { 
        success: false, 
        error: err instanceof Error ? err.message : 'Failed to delete tournament' 
      };
    }
  };

  useEffect(() => {
    fetchTournaments();
  }, []);

  return { 
    tournaments, 
    loading, 
    error, 
    createTournament, 
    updateTournament, 
    deleteTournament, 
    refetch: fetchTournaments 
  };
};
