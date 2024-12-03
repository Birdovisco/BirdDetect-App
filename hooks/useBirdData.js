import { useState, useEffect } from 'react';
import { BIRDS } from '../config';

export const useBirdData = (label) => {
    const [birdData, setBirdData] = useState(null);

    useEffect(() => {
        if (label !== undefined) {
            const data = BIRDS[label];
            setBirdData(data);
        }
    }, [label]);

    return birdData;
};
