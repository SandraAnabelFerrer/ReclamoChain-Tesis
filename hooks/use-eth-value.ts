"use client";

import { getEthToArsRate } from "@/lib/currency";
import { useEffect, useState } from "react";

export const useEthValue = () => {
    const [ethValue, setEthValue] = useState<number>(0);

    useEffect(() => {
        const fetchEthValue = async () => {
            const ethToArsRateResponse = await getEthToArsRate();
            setEthValue(Number(ethToArsRateResponse.toFixed(2)));
        };

        fetchEthValue();
    }, []);

    return { ethValue };
};
