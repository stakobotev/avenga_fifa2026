import { useMsal, useIsAuthenticated } from "@azure/msal-react";
import { InteractionStatus, AccountInfo } from "@azure/msal-browser";
import { loginRequest } from "../config/authConfig";
import { useCallback } from "react";

export interface MsalAuthState {
    isAuthenticated: boolean;
    isLoading: boolean;
    account: AccountInfo | null;
    login: () => Promise<void>;
    logout: () => void;
    getAccessToken: () => Promise<string | null>;
}

export function useMsalAuth(): MsalAuthState {
    const { instance, accounts, inProgress } = useMsal();
    const isAuthenticated = useIsAuthenticated();

    const account = accounts.length > 0 ? accounts[0] : null;
    const isLoading = inProgress !== InteractionStatus.None;

    const login = useCallback(async () => {
        try {
            await instance.loginRedirect(loginRequest);
        } catch (error) {
            console.error("Login failed:", error);
            throw error;
        }
    }, [instance]);

    const logout = useCallback(() => {
        instance.logoutRedirect({
            postLogoutRedirectUri: window.location.origin,
        });
    }, [instance]);

    const getAccessToken = useCallback(async (): Promise<string | null> => {
        if (!account) return null;

        try {
            const response = await instance.acquireTokenSilent({
                ...loginRequest,
                account,
            });
            return response.accessToken;
        } catch (error) {
            console.error("Silent token acquisition failed, trying redirect:", error);
            try {
                await instance.acquireTokenRedirect(loginRequest);
                return null;
            } catch (redirectError) {
                console.error("Token acquisition failed:", redirectError);
                return null;
            }
        }
    }, [instance, account]);

    return {
        isAuthenticated,
        isLoading,
        account,
        login,
        logout,
        getAccessToken,
    };
}
