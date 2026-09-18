"use client";

import { useCallback } from "react";
import { useSession } from "next-auth/react";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

/**
 * Shared authenticated fetch helper for the trainer batch-session module.
 * Usage: const { apiGet, apiPost, apiPut, apiDelete } = useApi();
 */
export const useApi = () => {
    const { data: session } = useSession();
    const token = session?.user?.token;

    const request = useCallback(
        async (path, { method = "GET", body } = {}) => {
            const response = await fetch(`${API_URL}${path}`, {
                method,
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: body ? JSON.stringify(body) : undefined,
            });

            const payload = await response.json().catch(() => ({}));

            if (!response.ok) {
                throw new Error(payload?.message || "Request failed");
            }

            return payload?.data;
        },
        [token]
    );

    return {
        ready: Boolean(API_URL && token),
        apiGet: (path) => request(path),
        apiPost: (path, body) => request(path, { method: "POST", body }),
        apiPut: (path, body) => request(path, { method: "PUT", body }),
        apiDelete: (path) => request(path, { method: "DELETE" }),
    };
};
