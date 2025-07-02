"use client";
import React, {
    createContext,
    useContext,
    useState,
    useRef,
    ReactNode,
    ReactElement,
} from "react";
import { useTransition, animated, config } from "@react-spring/web";

type ModalItem = {
    key: number;
    renderer: () => ReactElement;
};

const ModalContext = createContext<{
    popModal: () => void;
    pushModal: (renderer: () => ReactElement) => void;
}>({
    popModal: () => { },
    pushModal: () => { },
});

export const ModalProvider = ({ children }: { children: ReactNode }) => {
    const [modals, setModals] = useState<ModalItem[]>([]);
    const nextKey = useRef(0);

    const pushModal = (renderer: () => ReactElement) => {
        setModals((prev) => [
            ...prev,
            { key: nextKey.current++, renderer },
        ]);
    };

    const popModal = (key?: number) => {
        setModals((prev) => {
            if(prev.length === 0) return prev
            if(key !== undefined && prev[prev.length - 1].key !== key) prev
            return prev.slice(0, -1)
        });
    };

    const transitions = useTransition(modals, {
        keys: (item) => item.key,
        from: { opacity: 0, transform: "scale(0)" },
        enter: { opacity: 1, transform: "scale(1)" },
        leave: { opacity: 0, transform: "scale(0)" },
        config: {
            tension: 300,
            friction: 20,  
        },
    });

    return (
        <ModalContext.Provider value={{ pushModal, popModal }}>
            {children}

            {transitions((styles, item) => (
                <animated.div
                    key={item.key}
                    style={{
                        position: "fixed",
                        top: 0,
                        left: 0,
                        width: "100vw",
                        height: "100vh",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        pointerEvents: modals.length > 0 ? 'auto' : 'none',
                        zIndex: 10000
                    }}
                >
                    <animated.div
                        onClick={() => popModal(item.key)}
                        style={{
                            position: "absolute",
                            width: "100%",
                            height: "100%",
                            background: "#0000",
                            backdropFilter: "blur(1px)",
                            WebkitBackdropFilter: "blur(1px)",
                            opacity: styles.opacity,
                            pointerEvents: modals[modals.length - 1]?.key === item.key ? 'auto' : 'none'
                        }}
                    />

                    <animated.div
                        style={{
                            position: "relative",
                            background: "#fff",
                            borderRadius: 4,
                            padding: "1.5rem",
                            boxShadow: "0 0 10px rgba(0,0,0,0.2)",
                            transform: styles.transform,
                            opacity: styles.opacity,
                        }}
                    >
                        {item.renderer()}
                    </animated.div>
                </animated.div>
            ))}
        </ModalContext.Provider>
    );
};

export function useModal() {
    return useContext(ModalContext);
}
export default ModalProvider;
