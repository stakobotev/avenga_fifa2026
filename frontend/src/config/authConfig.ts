import { Configuration, LogLevel, PublicClientApplication } from "@azure/msal-browser";

const clientId = import.meta.env.VITE_AZURE_CLIENT_ID;
const tenantId = import.meta.env.VITE_AZURE_TENANT_ID;

if (!clientId || !tenantId) {
    console.warn("Azure AD configuration missing. Set VITE_AZURE_CLIENT_ID and VITE_AZURE_TENANT_ID in .env");
}

export const msalConfig: Configuration = {
    auth: {
        clientId: clientId || "",
        authority: `https://login.microsoftonline.com/${tenantId || "common"}`,
        redirectUri: window.location.origin,
        postLogoutRedirectUri: window.location.origin,
        navigateToLoginRequestUrl: true,
    },
    cache: {
        cacheLocation: "localStorage",
        storeAuthStateInCookie: false,
    },
    system: {
        loggerOptions: {
            logLevel: LogLevel.Warning,
            loggerCallback: (level, message, containsPii) => {
                if (containsPii) return;
                switch (level) {
                    case LogLevel.Error:
                        console.error(message);
                        break;
                    case LogLevel.Warning:
                        console.warn(message);
                        break;
                }
            },
        },
    },
};

// Basic scopes for authentication (no custom API scope required)
export const loginRequest = {
    scopes: [
        "openid",
        "profile",
        "email",
        "User.Read",
    ],
};

export const msalInstance = new PublicClientApplication(msalConfig);

let initPromise: Promise<void> | null = null;

// Initialize MSAL and handle redirect (singleton pattern)
export const initializeMsal = (): Promise<void> => {
    if (initPromise) {
        return initPromise;
    }

    initPromise = (async () => {
        try {
            await msalInstance.initialize();

            // Handle redirect response (must be called after initialize)
            const response = await msalInstance.handleRedirectPromise();
            if (response) {
                console.log("Login redirect completed successfully");
            }
        } catch (error) {
            console.error("MSAL initialization failed:", error);
            // Clear stuck interaction state
            sessionStorage.clear();
            localStorage.removeItem("msal.interaction.status");
        }
    })();

    return initPromise;
};
