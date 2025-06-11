import { createContext, useContext, useState } from 'react';

export const RatingsReviewContext = createContext<any>(null);

export function useRRContext() {
    const data = useContext(RatingsReviewContext);

    if (data === null) {
        throw new Error('useRRContext must be used within a RatingsReviewContext.Provider');
    }
    return data;
};

export function RRContextProvider({ children }: { children: React.ReactNode }) {
    const [rating, setRating] = useState(0);
    const [isRatingProvided, setIsRatingProvided] = useState(false);
    const [commentIndex, setCommentIndex] = useState(-1);

    return (
        <RatingsReviewContext.Provider
            value={{
                rating,
                setRating,
                isRatingProvided,
                setIsRatingProvided,
                commentIndex,
                setCommentIndex,
            }}
        >
            {children}
        </RatingsReviewContext.Provider>
    );
}
