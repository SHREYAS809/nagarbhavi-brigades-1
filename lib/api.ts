const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5000/api';

export const api = {
    // Auth
    login: async (email: string, password: string): Promise<any> => {
        const res = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        });
        if (!res.ok) {
            const errorText = await res.text();
            console.error("Login API Error:", res.status, errorText);
            throw new Error(`Login failed: ${res.status} ${errorText}`);
        }
        return res.json();
    },

    register: async (data: any): Promise<any> => {
        const res = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        if (!res.ok) throw new Error('Registration failed');
        return res.json();
    },

    changePassword: async (token: string, data: any): Promise<any> => {
        const res = await fetch(`${API_URL}/auth/change-password`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(data),
        });
        if (!res.ok) {
            const errorText = await res.text();
            throw new Error(errorText || 'Failed to change password');
        }
        return res.json();
    },

    // Referrals
    getReferrals: async (token: string): Promise<any> => {
        const res = await fetch(`${API_URL}/referrals/`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        return res.json();
    },

    createReferral: async (token: string, data: any): Promise<any> => {
        const res = await fetch(`${API_URL}/referrals/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(data),
        });
        if (!res.ok) throw new Error('Failed to create referral');
        return res.json();
    },

    updateReferralStatus: async (token: string, id: string, status: string): Promise<any> => {
        const res = await fetch(`${API_URL}/referrals/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ status }),
        });
        if (!res.ok) throw new Error('Failed to update referral');
        return res.json();
    },

    updateReferral: async (token: string, id: string, data: any): Promise<any> => {
        const res = await fetch(`${API_URL}/referrals/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(data),
        });
        if (!res.ok) throw new Error('Failed to update referral');
        return res.json();
    },

    deleteReferral: async (token: string, id: string): Promise<any> => {
        const res = await fetch(`${API_URL}/referrals/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('Failed to delete referral');
        return res.json();
    },

    getUsers: async (token: string): Promise<any> => {
        // Use the new /api/users endpoint for admin management, 
        // OR keep using /auth/users if it returns what we need. 
        // The new endpoint /api/users returns simpler data without password.
        const res = await fetch(`${API_URL}/users/`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('Failed to fetch users');
        return res.json();
    },

    updateUser: async (token: string, id: string, data: any): Promise<any> => {
        const res = await fetch(`${API_URL}/users/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(data),
        });
        if (!res.ok) throw new Error('Failed to update user');
        return res.json();
    },

    deleteUser: async (token: string, id: string): Promise<any> => {
        const res = await fetch(`${API_URL}/users/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('Failed to delete user');
        return res.json();
    },

    // Meetings
    getMeetings: async (token: string): Promise<any> => {
        const res = await fetch(`${API_URL}/meetings/`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('Failed to fetch meetings');
        return res.json();
    },

    createMeeting: async (token: string, data: any): Promise<any> => {
        const res = await fetch(`${API_URL}/meetings/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(data),
        });
        if (!res.ok) throw new Error('Failed to create meeting');
        return res.json();
    },

    registerMeeting: async (token: string, id: string): Promise<any> => {
        const res = await fetch(`${API_URL}/meetings/${id}/register`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        if (!res.ok) throw new Error('Failed to register for meeting');
        return res.json();
    },

    deleteMeeting: async (token: string, id: string): Promise<any> => {
        const res = await fetch(`${API_URL}/meetings/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('Failed to delete meeting');
        return res.json();
    },

    // Revenue
    getRevenue: async (token: string): Promise<any> => {
        const res = await fetch(`${API_URL}/revenue/`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('Failed to fetch revenue');
        return res.json();
    },

    addRevenue: async (token: string, data: any): Promise<any> => {
        const res = await fetch(`${API_URL}/revenue/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(data),
        });
        if (!res.ok) throw new Error('Failed to add revenue');
        return res.json();
    },

    // Notifications
    getNotifications: async (token: string): Promise<any> => {
        const res = await fetch(`${API_URL}/notifications/`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('Failed to fetch notifications');
        return res.json();
    },

    markNotificationRead: async (token: string, id: string): Promise<any> => {
        const res = await fetch(`${API_URL}/notifications/${id}/read`, {
            method: 'PUT',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('Failed to mark notification read');
        return res.json();
    },

    // Broadcast
    sendBroadcast: async (token: string, data: any): Promise<any> => {
        const res = await fetch(`${API_URL}/notifications/broadcast`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(data),
        });
        if (!res.ok) throw new Error('Failed to send broadcast');
        return res.json();
    },

    // Guests
    getGuests: async (token: string): Promise<any> => {
        const res = await fetch(`${API_URL}/guests/`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('Failed to fetch guests');
        return res.json();
    },

    inviteGuest: async (token: string, data: any): Promise<any> => {
        const res = await fetch(`${API_URL}/guests/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(data),
        });
        if (!res.ok) throw new Error('Failed to invite guest');
        return res.json();
    },

    updateGuest: async (token: string, id: number, data: any): Promise<any> => {
        const res = await fetch(`${API_URL}/guests/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(data),
        });
        if (!res.ok) throw new Error('Failed to update guest');
        return res.json();
    },

    // Learning Credits
    getLearningCredits: async (token: string): Promise<any> => {
        const res = await fetch(`${API_URL}/learning/`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('Failed to fetch learning credits');
        return res.json();
    },

    submitLearningCredit: async (token: string, data: any): Promise<any> => {
        const res = await fetch(`${API_URL}/learning/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(data),
        });
        if (!res.ok) throw new Error('Failed to submit learning credit');
        return res.json();
    },

    // Dashboard Data (Parallel fetching for efficiency)
    getDashboardData: async (token: string): Promise<any> => {
        const handleResponse = async (res: Response) => {
            if (!res.ok) {
                const text = await res.text();
                throw new Error(`API Error: ${res.status} ${text}`);
            }
            return res.json();
        };

        const [referrals, revenue, meetings, members] = await Promise.all([
            fetch(`${API_URL}/referrals/`, { headers: { 'Authorization': `Bearer ${token}` } }).then(handleResponse),
            fetch(`${API_URL}/revenue/`, { headers: { 'Authorization': `Bearer ${token}` } }).then(handleResponse),
            fetch(`${API_URL}/meetings/`, { headers: { 'Authorization': `Bearer ${token}` } }).then(handleResponse),
            fetch(`${API_URL}/auth/users`, { headers: { 'Authorization': `Bearer ${token}` } }).then(handleResponse),
        ]);
        return { referrals, revenue, meetings, members };
    }
};
