// Swap this for your existing axios instance / auth handling if you have one.
const API_BASE = process.env.NEXT_PUBLIC_API_URL || "";

const authHeaders = (token) => {

    return token ? { Authorization: `Bearer ${token}` } : {};
};

export async function fetchAttendanceDashboard(params, signal, token) {
    const query = new URLSearchParams();
    
    Object.entries(params).forEach(([k, v]) => {
        if (v !== "" && v !== null && v !== undefined && v !== "all") query.append(k, v);
    });

    const res = await fetch(`${API_BASE}/company/ILT/attendance/dashboard/data?${query.toString()}`, {
        headers: {
            "Content-Type": "application/json",
            ...authHeaders(token)
        },
        credentials: "include",
        signal,
    });

    const json = await res.json().catch(() => ({}));
    
    if (!res.ok) throw new Error(json?.message || "Failed to load attendance data");

    // supports { data: {...} } or a bare payload, depending on your successResponse
    return json?.data ?? json;
}
