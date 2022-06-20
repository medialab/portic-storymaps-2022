import { useSpring, animated } from 'react-spring';

export function AnimatedGroup({
    children,
    style,
    ...props
}) {
    const animatedProps = useSpring(props);

    return (
        <animated.g {...animatedProps} style={style}>
            {children}
        </animated.g>
    )
}

export function AnimatedPath({
    ...props
}) {
    const animatedProps = useSpring(props);

    return (
        <animated.path {...animatedProps} />
    )
}