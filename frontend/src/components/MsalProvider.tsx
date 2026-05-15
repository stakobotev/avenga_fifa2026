import { MsalProvider as MsalReactProvider } from "@azure/msal-react";
import { msalInstance, initializeMsal } from "../config/authConfig";
import { ReactNode, useEffect, useState } from "react";

interface MsalProviderProps {
    children: ReactNode;
}

export function MsalProvider({ children }: MsalProviderProps) {
    const [isInitialized, setIsInitialized] = useState(false);

    useEffect(() => {
        initializeMsal().then(() => {
            setIsInitialized(true);
        });
    }, []);

    if (!isInitialized) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-purple-800 to-purple-950 flex items-center justify-center">
                <div className="text-white text-lg">Loading...</div>
            </div>
        );
    }

    return (
        <MsalReactProvider instance={msalInstance}>
            {children}
        </MsalReactProvider>
    );
}
