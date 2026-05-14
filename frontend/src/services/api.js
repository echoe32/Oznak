const API_BASE_URL = 'http://localhost:8080/api';

function getCsrfToken() {
    const match = document.cookie.match(/(?:^|; )XSRF-TOKEN=([^;]*)/);
    if (!match) return '';
    try {
        return decodeURIComponent(match[1]);
    } catch {
        return match[1];
    }
}

async function ensureCsrfCookie() {
    if (getCsrfToken()) return;
    await fetch(`${API_BASE_URL}/auth/me`, {
        method: 'GET',
        credentials: 'include',
    });
}

async function parseErrorMessage(response) {
    const text = await response.text();
    if (!text) return `HTTP error! status: ${response.status}`;
    try {
        const json = JSON.parse(text);
        if (json && typeof json.message === 'string') return json.message;
        if (json && typeof json.error === 'string' && json.message) return json.message;
    } catch {
    }
    return text;
}

const fetchWithCookies = async (endpoint, options = {}) => {
    const method = (options.method || 'GET').toUpperCase();
    const hasBody = options.body !== undefined && options.body !== null;
    const isMutating = ['POST', 'PUT', 'DELETE', 'PATCH'].includes(method);
    const csrfExempt =
        method === 'POST' && (endpoint === '/auth/register' || endpoint === '/auth/login');

    if (isMutating && !csrfExempt) {
        await ensureCsrfCookie();
    }

    const csrfToken = getCsrfToken();
    const defaultOptions = {
        credentials: 'include',
        headers: {},
    };
    if (hasBody && method !== 'GET') {
        defaultOptions.headers['Content-Type'] = 'application/json';
    }
    if (isMutating && !csrfExempt && csrfToken) {
        defaultOptions.headers['X-XSRF-TOKEN'] = csrfToken;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...defaultOptions,
        ...options,
        headers: { ...defaultOptions.headers, ...(options.headers || {}) },
    });

    if (!response.ok) {
        throw new Error(await parseErrorMessage(response));
    }
    return response;
};

export const registerUser = async (email, password) => {
    return fetchWithCookies('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
    });
};

export const loginUser = async (email, password) => {
    return fetchWithCookies('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
    });
};

export const getCurrentUser = async () => {
    const response = await fetchWithCookies('/auth/me');
    return response.json();
};

export const logoutUser = async () => {
    return fetchWithCookies('/auth/logout', {
        method: 'POST',
    });
};

export const getTransactions = async () => {
    const response = await fetchWithCookies('/transactions');
    return response.json();
};

export const createTransaction = async (transaction) => {
    const response = await fetchWithCookies('/transactions', {
        method: 'POST',
        body: JSON.stringify(transaction),
    });
    return response.json();
};

export const updateTransaction = async (id, transaction) => {
    const response = await fetchWithCookies(`/transactions/${id}`, {
        method: 'PUT',
        body: JSON.stringify(transaction),
    });
    return response.json();
};

export const deleteTransaction = async (id) => {
    await fetchWithCookies(`/transactions/${id}`, {
        method: 'DELETE',
    });
};
