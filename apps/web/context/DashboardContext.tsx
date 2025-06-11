import { createContext, useState, useContext } from 'react';

const DashboardContext = createContext(undefined);

const useDashboardContext = () => {
    const data = useContext(DashboardContext);
    if (!data) {
        throw new Error('useDashboardContext must be used within DashboardContextProvider')
    }

    return data;
}

const DashboardContextProvider = ({ children }) => {
    const [enabledSections, setEnabledSections] = useState(new Set([0]));
    const [enabledReview, setEnabledReview] = useState(false);

    return (
        <DashboardContext.Provider value={{ enabledSections, setEnabledSections, enabledReview, setEnabledReview }}>
            {children}
        </DashboardContext.Provider>
    );
};

export { useDashboardContext, DashboardContextProvider };
