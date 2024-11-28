import { useCallback, useState } from "react";

export function useToggleState(initialState) {
    const [state, setState] = useState(initialState);

    const toggle = useCallback(() => {
        setState((prev) => !prev);
    }, [])

    const enable = useCallback(() => {
        setState(true);
    }, [])

    return [state, toggle, enable];
}